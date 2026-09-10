// ==============================================================================
// 🖨️ Network Printer Bridge for Elgin i8 / i9 (Raw TCP 9100 Socket)
// ==============================================================================

import net from 'net';

/**
 * Verifica se a impressora no IP e Porta especificados está online
 */
export function checkPrinterOnline(ip = '192.168.1.150', port = 9100, timeout = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeout);

    socket.connect(Number(port), ip, () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({
          online: true,
          ip,
          port: Number(port),
          message: `Impressora Elgin online em ${ip}:${port}`
        });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({
          online: false,
          ip,
          port: Number(port),
          message: `Impressora inacessível em ${ip}:${port} (${err.message})`
        });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({
          online: false,
          ip,
          port: Number(port),
          message: `Tempo limite esgotado para ${ip}:${port}`
        });
      }
    });
  });
}

/**
 * Envia comandos ESC/POS brutos (string ou buffer) diretamente para a impressora
 */
export function sendRawToPrinter(rawEscpos, ip = '192.168.1.150', port = 9100, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (!rawEscpos) {
      return reject(new Error('Nenhum comando ESC/POS fornecido para impressão.'));
    }

    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(timeout);

    // Converte para buffer Latin1 / ISO-8859-1 para preservar comandos binários
    const buffer = Buffer.isBuffer(rawEscpos)
      ? rawEscpos
      : Buffer.from(rawEscpos, 'latin1');

    socket.connect(Number(port), ip, () => {
      socket.write(buffer, () => {
        // Pequena pausa para garantir que o buffer seja transmitido pelo hardware
        setTimeout(() => {
          if (!settled) {
            settled = true;
            socket.destroy();
            resolve({
              success: true,
              bytesWritten: buffer.length,
              ip,
              port: Number(port),
              message: `Impresso com sucesso na Elgin i8 (${ip}:${port})`
            });
          }
        }, 300);
      });
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(new Error(`Falha ao conectar na impressora Elgin (${ip}:${port}): ${err.message}`));
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(new Error(`Timeout na conexão com a impressora (${ip}:${port}). Verifique o cabo de rede ou IP.`));
      }
    });
  });
}

/**
 * Lê o corpo da requisição HTTP como JSON
 */
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('JSON inválido no corpo da requisição: ' + e.message));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Middleware para tratar requisições /api/printer no Vite ou Servidor HTTP
 */
export async function handlePrinterRoute(req, res) {
  // CORS Headers para permitir requisições de qualquer origem local ou externa
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname.replace(/^\/api\/printer/, '');

  try {
    // 1. Status da impressora
    if (pathname === '/status' || pathname === '' && req.method === 'GET') {
      const ip = parsedUrl.searchParams.get('ip') || '192.168.1.150';
      const port = parsedUrl.searchParams.get('port') || 9100;
      const result = await checkPrinterOnline(ip, port);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    // 2. Imprimir ticket
    if (pathname === '/print' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const ip = body.printerIp || '192.168.1.150';
      const port = body.printerPort || 9100;
      const rawEscpos = body.rawEscpos;

      if (!rawEscpos) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'rawEscpos é obrigatório.' }));
        return true;
      }

      const printRes = await sendRawToPrinter(rawEscpos, ip, port);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(printRes));
      return true;
    }

    // 3. Teste de impressão
    if (pathname === '/test' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const ip = body.printerIp || '192.168.1.150';
      const port = body.printerPort || 9100;
      const rawEscpos = body.rawEscpos;

      const printRes = await sendRawToPrinter(rawEscpos, ip, port);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(printRes));
      return true;
    }

    return false;
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
    return true;
  }
}
