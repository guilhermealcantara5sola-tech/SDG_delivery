// ==============================================================================
// 🖨️ Printer Service - Elgin i8 / i9 Network Printing (192.168.1.150:9100)
// ==============================================================================

import {
  buildKitchenEscpos,
  buildCounterEscpos,
  buildBothEscpos,
  buildTestEscpos
} from '../utils/escposGenerator';

export const PRINTER_STORAGE_KEY = 'sdg_printer_settings';

export const DEFAULT_PRINTER_SETTINGS = {
  ip: '192.168.1.150',
  port: 9100,
  enabled: true,
  mode: 'network', // 'network' (direct ESC/POS to Elgin i8) | 'browser' (window.print fallback)
  autoPrintKitchenOnConfirm: true,
  autoPrintCounterOnConfirm: true,
  autoPrintIncomingKitchen: false,
  cutPaper: true,
  beepOnPrint: false,
  serviceUrl: '', // URL customizada do servidor local de impressão (opcional)
};

/**
 * Obtém as configurações da impressora salvas localmente
 */
export function getPrinterSettings() {
  try {
    const raw = localStorage.getItem(PRINTER_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PRINTER_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Erro ao ler configurações da impressora:', e);
  }
  return { ...DEFAULT_PRINTER_SETTINGS };
}

/**
 * Salva as configurações da impressora
 */
export function savePrinterSettings(settings) {
  try {
    const current = getPrinterSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Erro ao salvar configurações da impressora:', e);
    return settings;
  }
}

/**
 * Obtém a lista de URLs candidatas para envio de impressão (Vite middleware ou Servidor Local Node)
 */
function getPrintCandidateEndpoints(customServiceUrl = '') {
  const endpoints = [];

  // 1. URL configurada manualmente pelo usuário
  if (customServiceUrl && customServiceUrl.trim()) {
    endpoints.push(customServiceUrl.trim().replace(/\/+$/, ''));
  }

  // 2. Endpoint relativo (funciona automaticamente no Vite Dev Server / mesmo host)
  endpoints.push('');

  // 3. Fallback para servidor local dedicado na porta 3001
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    endpoints.push(`http://${hostname}:3001`);
    if (hostname !== 'localhost') {
      endpoints.push('http://localhost:3001');
    }
  }

  return endpoints;
}

/**
 * Testa o status de conexão com a impressora Elgin na rede
 */
export async function testPrinterStatus(settings = null) {
  const cfg = settings || getPrinterSettings();
  const ip = cfg.ip || '192.168.1.150';
  const port = cfg.port || 9100;

  const endpoints = getPrintCandidateEndpoints(cfg.serviceUrl);

  for (const base of endpoints) {
    try {
      const url = `${base}/api/printer/status?ip=${encodeURIComponent(ip)}&port=${encodeURIComponent(port)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          online: !!data.online,
          ip: data.ip || ip,
          port: data.port || port,
          endpoint: base,
          message: data.message || (data.online ? 'Impressora Elgin i8 online e respondendo na porta 9100' : 'Impressora offline')
        };
      }
    } catch (e) {
      // Tenta próximo endpoint
    }
  }

  return {
    online: false,
    ip,
    port,
    message: 'Serviço de impressão local não respondeu. Certifique-se de estar rodando npm run dev ou npm run printer.'
  };
}

/**
 * Envia um cupom / comanda formatada diretamente para a impressora de rede Elgin i8
 * @param {Object} params
 * @param {Object} params.order - Dados do pedido
 * @param {'kitchen' | 'counter' | 'both'} params.type - Tipo de impressão
 * @param {Object} [params.settings] - Configurações opcionais
 */
export async function printDirectToNetworkPrinter({ order, type = 'counter', settings = null }) {
  const cfg = settings || getPrinterSettings();
  const ip = cfg.ip || '192.168.1.150';
  const port = cfg.port || 9100;

  // Monta os comandos ESC/POS de acordo com o tipo solicitado
  let rawEscpos = '';
  if (type === 'kitchen') {
    rawEscpos = buildKitchenEscpos(order, { restaurantName: 'SDG RESTAURANTE' });
  } else if (type === 'counter') {
    rawEscpos = buildCounterEscpos(order, { restaurantName: 'SDG RESTAURANTE' });
  } else if (type === 'both') {
    rawEscpos = buildBothEscpos(order, { restaurantName: 'SDG RESTAURANTE' });
  } else {
    rawEscpos = buildCounterEscpos(order, { restaurantName: 'SDG RESTAURANTE' });
  }

  const endpoints = getPrintCandidateEndpoints(cfg.serviceUrl);
  let lastError = null;

  for (const base of endpoints) {
    try {
      const url = `${base}/api/printer/print`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerIp: ip,
          printerPort: port,
          type,
          orderId: order?.id,
          rawEscpos, // Envia comandos prontos
          order,     // Envia dados brutos como redundância
          cutPaper: cfg.cutPaper !== false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          endpoint: base,
          message: data.message || `Impresso com sucesso na Elgin i8 (${ip})`
        };
      } else {
        const errText = await res.text();
        lastError = new Error(`Servidor de impressão retornou status ${res.status}: ${errText}`);
      }
    } catch (e) {
      lastError = e;
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : 'Não foi possível conectar ao serviço de impressão.',
    fallbackToBrowser: true
  };
}

/**
 * Envia um ticket de teste para a impressora Elgin i8
 */
export async function printTestTicketDirect(settings = null) {
  const cfg = settings || getPrinterSettings();
  const ip = cfg.ip || '192.168.1.150';
  const port = cfg.port || 9100;

  const rawEscpos = buildTestEscpos(ip, port);
  const endpoints = getPrintCandidateEndpoints(cfg.serviceUrl);
  let lastError = null;

  for (const base of endpoints) {
    try {
      const url = `${base}/api/printer/test`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerIp: ip,
          printerPort: port,
          rawEscpos
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || `Teste impresso com sucesso na Elgin i8 (${ip}:${port})`
        };
      }
    } catch (e) {
      lastError = e;
    }
  }

  return {
    success: false,
    error: lastError ? lastError.message : 'Falha ao conectar no serviço de impressão local.'
  };
}
