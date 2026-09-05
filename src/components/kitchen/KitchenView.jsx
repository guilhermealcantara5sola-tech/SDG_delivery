import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../../context/OrderContext';
import { formatTime, formatCurrency } from '../../utils/formatters';
import { ChefHat, Printer, Play, CheckCircle2, Clock, CheckCheck, AlertTriangle } from 'lucide-react';

export const KitchenView = () => {
  const { orders, updateOrderStatus, triggerPrintTicket } = useOrder();

  // Kitchen active orders
  const newOrders = orders.filter(o => o.status === 'pagamento_confirmado');
  const inPreparation = orders.filter(o => o.status === 'em_preparo');
  const readyOrders = orders.filter(o => o.status === 'pronto');

  // Auto-print setting on the kitchen screen
  const [autoPrintIncoming, setAutoPrintIncoming] = useState(() => {
    const saved = localStorage.getItem('sdg_autoprint_incoming_kitchen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const printedOrderIds = useRef(new Set());

  useEffect(() => {
    if (!autoPrintIncoming) return;
    newOrders.forEach(order => {
      if (!printedOrderIds.current.has(order.id)) {
        printedOrderIds.current.add(order.id);
        triggerPrintTicket(order, 'kitchen');
      }
    });
  }, [newOrders, autoPrintIncoming]);

  const toggleAutoPrintIncoming = () => {
    setAutoPrintIncoming(prev => {
      const next = !prev;
      localStorage.setItem('sdg_autoprint_incoming_kitchen', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Kitchen KDS Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>Monitor da Cozinha & KDS</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Linha de Produção da Cozinha</h1>
            <p className="text-slate-400 text-sm mt-1">
              Os pedidos aparecem aqui automaticamente assim que o Caixa/Balcão confirma o pagamento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-print toggle for kitchen */}
            <div
              onClick={toggleAutoPrintIncoming}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl border cursor-pointer select-none transition-all ${
                autoPrintIncoming
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Ao ativar, novos pedidos confirmados abrirão a impressão da ficha automaticamente nesta tela"
            >
              <input
                type="checkbox"
                checked={autoPrintIncoming}
                onChange={toggleAutoPrintIncoming}
                className="w-4 h-4 rounded text-blue-500 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer accent-blue-500"
              />
              <div className="text-xs font-bold">
                <div className="flex items-center space-x-1">
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Auto-imprimir na Cozinha</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {autoPrintIncoming ? '🟢 Ativado nesta tela' : '⚪ Desativado'}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Novos Pedidos</div>
              <div className="text-xl font-black text-blue-400">{newOrders.length}</div>
            </div>
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Em Preparo</div>
              <div className="text-xl font-black text-purple-400">{inPreparation.length}</div>
            </div>
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Prontos</div>
              <div className="text-xl font-black text-emerald-400">{readyOrders.length}</div>
            </div>
          </div>
        </div>

        {/* KANBAN PRODUCTION BOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: NOVOS PARA PREPARAR */}
          <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                  1. Para Preparar ({newOrders.length})
                </h2>
              </div>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">
                Pagto Confirmado
              </span>
            </div>

            {newOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                Nenhum novo pedido na fila.
              </div>
            ) : (
              newOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border-2 border-blue-500/60 rounded-2xl p-4 shadow-xl space-y-4 animate-in fade-in"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black text-blue-400">{order.id}</span>
                        <span className="text-xs text-slate-400 font-semibold">{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="font-extrabold text-white text-sm mt-0.5">{order.customerName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-slate-950 uppercase">
                      NOVO
                    </span>
                  </div>

                  {/* Order items */}
                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5 border-b border-slate-900 pb-1.5 last:border-none">
                        <div className="flex justify-between font-extrabold text-white">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-amber-400 font-semibold pl-2">
                            {item.selectedOptions.map((opt, oIdx) => (
                              <div key={oIdx}>+ {opt}</div>
                            ))}
                          </div>
                        )}
                        {item.observation && (
                          <div className="text-[11px] text-rose-400 font-bold underline pl-2">
                            Obs: {item.observation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.observation && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] font-bold text-amber-300">
                      OBS GERAL: {order.observation}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => triggerPrintTicket(order, 'kitchen')}
                      className="py-2 px-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all flex items-center justify-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ficha Cozinha</span>
                    </button>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'em_preparo')}
                      className="py-2 px-3 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-500 transition-all flex items-center justify-center space-x-1 shadow-md shadow-purple-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Iniciar Preparo</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* COLUMN 2: EM PREPARO */}
          <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                  2. Em Preparo ({inPreparation.length})
                </h2>
              </div>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">
                No Fogo / Montando
              </span>
            </div>

            {inPreparation.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                Nenhum prato sendo preparado no momento.
              </div>
            ) : (
              inPreparation.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border-2 border-purple-500/60 rounded-2xl p-4 shadow-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black text-purple-400">{order.id}</span>
                        <span className="text-xs text-slate-400 font-semibold">{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="font-extrabold text-white text-sm mt-0.5">{order.customerName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white uppercase animate-pulse">
                      PREPARANDO
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5 border-b border-slate-900 pb-1.5 last:border-none">
                        <div className="flex justify-between font-extrabold text-white">
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-amber-400 font-semibold pl-2">
                            {item.selectedOptions.map((opt, oIdx) => (
                              <div key={oIdx}>+ {opt}</div>
                            ))}
                          </div>
                        )}
                        {item.observation && (
                          <div className="text-[11px] text-rose-400 font-bold underline pl-2">
                            Obs: {item.observation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Complete Action */}
                  <button
                    onClick={() => updateOrderStatus(order.id, 'pronto')}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Marcar como PRONTO</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* COLUMN 3: PRONTOS PARA EXPEDIÇÃO */}
          <div className="space-y-4 bg-slate-900/60 border border-slate-800 p-4 rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                  3. Prontos ({readyOrders.length})
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Expedição / Entrega
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                Nenhum pedido aguardando expedição.
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xl space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black text-emerald-400">{order.id}</span>
                        <span className="text-xs text-slate-400 font-semibold">{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="font-extrabold text-white text-sm mt-0.5">{order.customerName}</div>
                      <div className="text-xs text-amber-400 font-bold">
                        {order.deliveryType === 'delivery' ? '🛵 Saiu p/ Entrega' : '🛍️ Retirar no Balcão'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 uppercase">
                      PRONTO
                    </span>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order.id, 'entregue')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Concluir / Entregue</span>
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
