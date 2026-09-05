import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency, formatDateTime, PAYMENT_METHODS } from '../../utils/formatters';
import { Printer, X } from 'lucide-react';

export const PrintTicket = () => {
  const { printTicket, closePrintTicket } = useOrder();

  if (!printTicket || !printTicket.order) return null;

  const { order, type } = printTicket; // type: 'counter' | 'kitchen'
  const isKitchen = type === 'kitchen';

  return (
    <>
      {/* On-screen preview modal (hidden during physical print) */}
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">
                {isKitchen ? 'Comanda Cozinha (80/58mm)' : 'Cupom Balcão (80/58mm)'}
              </h3>
            </div>
            <button
              onClick={closePrintTicket}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            A janela de impressão foi acionada. Caso deseje imprimir novamente na sua impressora térmica não fiscal:
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir na Térmica</span>
            </button>
            <button
              onClick={closePrintTicket}
              className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      <div id="printable-ticket" className="printable-ticket text-black font-mono">
      {/* Header */}
      <div className="text-center pb-2 mb-2 border-b border-dashed border-black">
        <h1 className="text-base font-extrabold uppercase">SDG RESTAURANTE</h1>
        <p className="text-xs">Sistema de Delivery & Balcão</p>
        <div className="mt-1 inline-block px-2 py-0.5 border border-black font-bold uppercase text-xs">
          {isKitchen ? '*** COZINHA - PRODUÇÃO ***' : '*** BALCÃO / RECIBO ***'}
        </div>
      </div>

      {/* Info Pedido */}
      <div className="text-xs space-y-1 mb-2 border-b border-dashed border-black pb-2">
        <div className="flex justify-between font-bold text-sm">
          <span>PEDIDO: #{order.id}</span>
          <span>{isKitchen ? 'COZINHA' : 'CAIXA'}</span>
        </div>
        <div>DATA: {formatDateTime(order.createdAt)}</div>
        <div>CLIENTE: <span className="font-bold">{order.customerName}</span></div>
        <div>TEL: {order.customerPhone}</div>
        <div>TIPO: <span className="font-bold uppercase">{order.deliveryType === 'delivery' ? 'DELIVERY (ENTREGA)' : 'RETIRADA NO BALCÃO'}</span></div>
        {order.deliveryType === 'delivery' && (
          <div className="mt-1 font-bold">ENDEREÇO: {order.address}</div>
        )}
      </div>

      {/* Itens */}
      <div className="mb-2 border-b border-dashed border-black pb-2">
        <div className="text-xs font-bold uppercase mb-1 flex justify-between">
          <span>QTD ITEM</span>
          {!isKitchen && <span>VALOR</span>}
        </div>
        {order.items.map((item, idx) => (
          <div key={idx} className="mb-2 text-xs">
            <div className="flex justify-between font-bold">
              <span>{item.quantity}x {item.name}</span>
              {!isKitchen && <span>{formatCurrency(item.subtotal)}</span>}
            </div>

            {/* Opções selecionadas */}
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <div className="pl-3 text-[11px] text-gray-800">
                {item.selectedOptions.map((opt, oIdx) => (
                  <div key={oIdx}>+ {opt}</div>
                ))}
              </div>
            )}

            {/* Observação do item */}
            {item.observation && (
              <div className="pl-3 font-bold text-xs underline mt-0.5">
                OBS: {item.observation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Observação Geral do Pedido */}
      {order.observation && (
        <div className="mb-2 p-1.5 border border-black text-xs font-bold uppercase">
          ATENÇÃO OBS GERAL: {order.observation}
        </div>
      )}

      {/* Total & Pagamento (Apenas no Balcão) */}
      {!isKitchen ? (
        <div className="text-xs space-y-1 pt-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.items.reduce((a, b) => a + b.subtotal, 0))}</span>
          </div>
          {order.deliveryType === 'delivery' && (
            <div className="flex justify-between">
              <span>Taxa Entrega:</span>
              <span>{formatCurrency(7.00)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold border-t border-black pt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-dashed border-black">
            <div>PAGAMENTO: <span className="font-bold">{PAYMENT_METHODS[order.paymentMethod]?.label || order.paymentMethod}</span></div>
            <div>STATUS PAGTO: <span className="font-bold uppercase">{order.status === 'aguardando_pagamento' ? 'PENDENTE NO CAIXA' : 'CONFIRMADO'}</span></div>
          </div>
        </div>
      ) : (
        <div className="text-xs font-bold text-center pt-2">
          --- FIM DA COMANDA DA COZINHA ---
        </div>
      )}

      {/* Rodapé */}
      <div className="text-[10px] text-center mt-3 pt-1 border-t border-black">
        Obrigado pela preferência! | SDG Delivery
      </div>
    </div>
  </>
  );
};
