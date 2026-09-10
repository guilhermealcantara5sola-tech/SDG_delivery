// ==============================================================================
// 🖨️ Elgin i8 / i9 ESC-POS Commands & Ticket Formatter (80mm Thermal Roll)
// ==============================================================================

export const ESC = '\x1b';
export const GS = '\x1d';

export const CMD = {
  INIT: ESC + '@',
  ALIGN_LEFT: ESC + 'a\x00',
  ALIGN_CENTER: ESC + 'a\x01',
  ALIGN_RIGHT: ESC + 'a\x02',
  BOLD_ON: ESC + 'E\x01',
  BOLD_OFF: ESC + 'E\x00',
  DOUBLE_SIZE: GS + '!\x11', // 2x height, 2x width
  DOUBLE_HEIGHT: GS + '!\x01',
  DOUBLE_WIDTH: GS + '!\x10',
  NORMAL_SIZE: GS + '!\x00',
  UNDERLINE_ON: ESC + '-\x01',
  UNDERLINE_OFF: ESC + '-\x00',
  FEED_3: ESC + 'd\x03',
  FEED_5: ESC + 'd\x05',
  CUT_PARTIAL: GS + 'V\x42\x00', // Elgin partial cut (guillotine leaves bridge)
  CUT_FULL: GS + 'V\x41\x00',    // Elgin full cut
  BEEP: ESC + 'b\x02\x02'        // Elgin buzzer beep
};

export const LINE_WIDTH_80MM = 48; // Elgin i8 standard 80mm width in font A

/**
 * Remove acentos e caracteres especiais para compatibilidade 100% com impressoras térmicas
 */
export function sanitizeText(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/º/g, 'o')
    .replace(/ª/g, 'a')
    .replace(/[^\x20-\x7E\n]/g, ' '); // Mantém apenas ASCII visível e quebra de linha
}

/**
 * Formata linha com texto à esquerda e texto à direita (ex: Nome do produto e Preço)
 */
export function formatRow(left, right, width = LINE_WIDTH_80MM) {
  const cleanLeft = sanitizeText(left);
  const cleanRight = sanitizeText(right);
  const spaces = Math.max(1, width - cleanLeft.length - cleanRight.length);
  return cleanLeft + ' '.repeat(spaces) + cleanRight;
}

/**
 * Centraliza um texto na largura da bobina térmica
 */
export function formatCenter(text, width = LINE_WIDTH_80MM) {
  const clean = sanitizeText(text);
  if (clean.length >= width) return clean.slice(0, width);
  const leftPad = Math.floor((width - clean.length) / 2);
  const rightPad = width - clean.length - leftPad;
  return ' '.repeat(leftPad) + clean + ' '.repeat(rightPad);
}

/**
 * Cria divisor de linha (ex: ------------------------------------------------)
 */
export function formatDivider(char = '-', width = LINE_WIDTH_80MM) {
  return char.repeat(width);
}

/**
 * Formata moeda BRL simples sem acentos
 */
export function formatCurrencyBRL(val) {
  const num = Number(val || 0);
  return 'R$ ' + num.toFixed(2).replace('.', ',');
}

/**
 * Formata data/hora amigável
 */
export function formatTicketDateTime(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==============================================================================
// 🍳 1. COMANDA DA COZINHA (PRODUÇÃO & KDS)
// ==============================================================================
export function buildKitchenEscpos(order, options = {}) {
  const restaurantName = options.restaurantName || 'SDG RESTAURANTE';
  let out = '';

  out += CMD.INIT;
  out += CMD.ALIGN_CENTER;
  out += CMD.BOLD_ON;
  out += CMD.DOUBLE_SIZE;
  out += '*** COZINHA - PRODUCAO ***\n';
  out += CMD.NORMAL_SIZE;
  out += `${sanitizeText(restaurantName).toUpperCase()}\n`;
  out += CMD.BOLD_OFF;
  out += formatDivider('=') + '\n';

  // Destaque do número do pedido
  out += CMD.ALIGN_LEFT;
  out += CMD.BOLD_ON;
  out += CMD.DOUBLE_SIZE;
  out += `PEDIDO: #${order.id}\n`;
  out += CMD.NORMAL_SIZE;
  out += CMD.BOLD_OFF;

  out += `HORA: ${formatTicketDateTime(order.createdAt)}\n`;
  out += `CLIENTE: ${sanitizeText(order.customerName)}\n`;
  out += `TIPO: ${order.deliveryType === 'delivery' ? 'DELIVERY (ENTREGA)' : 'RETIRADA NO BALCAO'}\n`;
  if (order.deliveryType === 'delivery' && order.address) {
    out += `ENDERECO: ${sanitizeText(order.address)}\n`;
  }
  out += formatDivider('-') + '\n';

  // Itens do Pedido (Em destaque com quantidade ampliada)
  out += CMD.BOLD_ON;
  out += 'ITENS DA COMANDA:\n';
  out += CMD.BOLD_OFF;
  out += formatDivider('-') + '\n';

  (order.items || []).forEach((item) => {
    out += CMD.BOLD_ON;
    out += CMD.DOUBLE_HEIGHT;
    out += `[ ${item.quantity}x ] ${sanitizeText(item.name).toUpperCase()}\n`;
    out += CMD.NORMAL_SIZE;
    out += CMD.BOLD_OFF;

    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach(opt => {
        out += `   + ${sanitizeText(opt)}\n`;
      });
    }

    if (item.observation) {
      out += CMD.BOLD_ON;
      out += `   ** OBS: ${sanitizeText(item.observation).toUpperCase()} **\n`;
      out += CMD.BOLD_OFF;
    }
    out += '\n';
  });

  // Observação Geral
  if (order.observation) {
    out += formatDivider('=') + '\n';
    out += CMD.BOLD_ON;
    out += 'ATENCAO OBS GERAL DO PEDIDO:\n';
    out += CMD.DOUBLE_HEIGHT;
    out += `${sanitizeText(order.observation).toUpperCase()}\n`;
    out += CMD.NORMAL_SIZE;
    out += CMD.BOLD_OFF;
  }

  out += formatDivider('-') + '\n';
  out += CMD.ALIGN_CENTER;
  out += CMD.BOLD_ON;
  out += '--- FIM DA COMANDA DA COZINHA ---\n';
  out += CMD.BOLD_OFF;

  // Finalização e Corte do Papel
  out += '\n\n\n\n';
  out += CMD.CUT_PARTIAL;

  return out;
}

// ==============================================================================
// 🧾 2. CUPOM DO BALCÃO / CLIENTE / CAIXA
// ==============================================================================
export function buildCounterEscpos(order, options = {}) {
  const restaurantName = options.restaurantName || 'SDG RESTAURANTE';
  let out = '';

  out += CMD.INIT;
  out += CMD.ALIGN_CENTER;
  out += CMD.BOLD_ON;
  out += CMD.DOUBLE_SIZE;
  out += `${sanitizeText(restaurantName).toUpperCase()}\n`;
  out += CMD.NORMAL_SIZE;
  out += 'SISTEMA DE DELIVERY & BALCAO\n';
  out += CMD.BOLD_ON;
  out += '*** CUPOM BALCAO / CLIENTE ***\n';
  out += CMD.BOLD_OFF;
  out += formatDivider('=') + '\n';

  // Cabeçalho do Pedido
  out += CMD.ALIGN_LEFT;
  out += formatRow(`PEDIDO: #${order.id}`, `DATA: ${formatTicketDateTime(order.createdAt)}`) + '\n';
  out += `CLIENTE: ${sanitizeText(order.customerName)}\n`;
  if (order.customerPhone) {
    out += `TELEFONE: ${sanitizeText(order.customerPhone)}\n`;
  }
  out += `TIPO: ${order.deliveryType === 'delivery' ? 'DELIVERY (ENTREGA)' : 'RETIRADA NO BALCAO'}\n`;
  if (order.deliveryType === 'delivery' && order.address) {
    out += `ENDERECO: ${sanitizeText(order.address)}\n`;
  }
  out += formatDivider('-') + '\n';

  // Tabela de Itens com Preços
  out += CMD.BOLD_ON;
  out += formatRow('QTD  DESCRICAO', 'VALOR') + '\n';
  out += CMD.BOLD_OFF;
  out += formatDivider('-') + '\n';

  const subtotal = (order.items || []).reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const deliveryFee = order.deliveryType === 'delivery' ? 7.00 : 0;
  const grandTotal = order.total || (subtotal + deliveryFee);

  (order.items || []).forEach(item => {
    const leftText = `${item.quantity}x ${item.name}`.slice(0, 34);
    const rightText = formatCurrencyBRL(item.subtotal);
    out += CMD.BOLD_ON;
    out += formatRow(leftText, rightText) + '\n';
    out += CMD.BOLD_OFF;

    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach(opt => {
        out += `   + ${sanitizeText(opt)}\n`;
      });
    }

    if (item.observation) {
      out += `   * OBS: ${sanitizeText(item.observation)}\n`;
    }
  });

  out += formatDivider('-') + '\n';

  // Totais Financeiros
  out += formatRow('Subtotal:', formatCurrencyBRL(subtotal)) + '\n';
  if (order.deliveryType === 'delivery') {
    out += formatRow('Taxa de Entrega:', formatCurrencyBRL(deliveryFee)) + '\n';
  }

  out += formatDivider('=') + '\n';
  out += CMD.BOLD_ON;
  out += CMD.DOUBLE_HEIGHT;
  out += formatRow('TOTAL A PAGAR:', formatCurrencyBRL(grandTotal)) + '\n';
  out += CMD.NORMAL_SIZE;
  out += CMD.BOLD_OFF;
  out += formatDivider('=') + '\n';

  // Informações de Pagamento
  const paymentLabels = {
    pix: 'PIX (CONFIRMADO)',
    credit_card: 'CARTAO CREDITO / DEBITO',
    cash: 'DINHEIRO'
  };
  const payDesc = paymentLabels[order.paymentMethod] || (order.paymentMethod ? order.paymentMethod.toUpperCase() : 'A DEFINIR');
  out += `FORMA DE PAGAMENTO: ${payDesc}\n`;
  out += `STATUS: ${order.status === 'aguardando_pagamento' ? 'PENDENTE NO CAIXA' : 'PAGAMENTO CONFIRMADO'}\n`;

  if (order.observation) {
    out += formatDivider('-') + '\n';
    out += `OBS: ${sanitizeText(order.observation)}\n`;
  }

  // Rodapé
  out += formatDivider('-') + '\n';
  out += CMD.ALIGN_CENTER;
  out += 'Obrigado pela preferencia! Volte sempre.\n';
  out += 'SDG Delivery & KDS\n';

  // Finalização e Corte do Papel
  out += '\n\n\n\n';
  out += CMD.CUT_PARTIAL;

  return out;
}

// ==============================================================================
// 🔄 3. AMBOS OS TICKETS (COZINHA + BALCÃO EM SEQUÊNCIA COM CORTE EM CADA)
// ==============================================================================
export function buildBothEscpos(order, options = {}) {
  const kitchen = buildKitchenEscpos(order, options);
  const counter = buildCounterEscpos(order, options);
  return kitchen + counter;
}

// ==============================================================================
// 🧪 4. TICKET DE TESTE DE COMUNICAÇÃO ELGIN i8
// ==============================================================================
export function buildTestEscpos(printerIp = '192.168.1.150', printerPort = 9100) {
  let out = '';
  out += CMD.INIT;
  out += CMD.ALIGN_CENTER;
  out += CMD.BOLD_ON;
  out += CMD.DOUBLE_SIZE;
  out += 'SDG RESTAURANTE\n';
  out += CMD.NORMAL_SIZE;
  out += 'TESTE DE CONEXAO ELGIN i8\n';
  out += formatDivider('=') + '\n';

  out += CMD.ALIGN_LEFT;
  out += CMD.BOLD_ON;
  out += 'STATUS DA COMUNICACAO: OK (SUCESSO)\n';
  out += CMD.BOLD_OFF;
  out += `IP DA IMPRESSORA: ${printerIp}\n`;
  out += `PORTA RAW ESC/POS: ${printerPort}\n`;
  out += `DATA/HORA: ${formatTicketDateTime(new Date().toISOString())}\n`;
  out += formatDivider('-') + '\n';
  out += 'Modulos Integrados no Sistema:\n';
  out += '  [X] Comanda de Cozinha (Producao / KDS)\n';
  out += '  [X] Cupom de Balcao (Caixa / Cliente)\n';
  out += '  [X] Corte automatico de guilhotina\n';
  out += '  [X] Impressao automatica ao confirmar\n';
  out += formatDivider('=') + '\n';

  out += CMD.ALIGN_CENTER;
  out += CMD.BOLD_ON;
  out += '*** IMPRESSORA PRONTA PARA OPERACAO ***\n';
  out += CMD.BOLD_OFF;

  out += '\n\n\n\n';
  out += CMD.CUT_PARTIAL;

  return out;
}
