import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency, formatTime, formatDateTime, STATUS_MAP, PAYMENT_METHODS } from '../../utils/formatters';
import { Printer, CheckCircle2, AlertCircle, Clock, Search, Filter, Phone, MapPin, DollarSign, ChefHat, RefreshCw, Edit3, Bike, ShoppingBag, ArrowRightLeft, QrCode, X } from 'lucide-react';
import { OrderEditModal } from '../common/OrderEditModal';
import { PixPaymentCard } from '../common/PixPaymentCard';

export const CounterView = () => {
  const {
    orders,
    updateOrderStatus,
    triggerPrintTicket,
    editOrder,
    setCurrentView,
    dispatchOrder,
    printerSettings,
    printerStatus,
    checkPrinterConnection,
    printTestTicket,
    storeSettings
  } = useOrder();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [pixOrderModal, setPixOrderModal] = useState(null);

  // Pending payments (waiting counter confirmation)
  const pendingOrders = orders.filter(o => o.status === 'aguardando_pagamento');

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Auto-print kitchen ticket setting (persisted in localStorage)
  const [autoPrintKitchen, setAutoPrintKitchen] = useState(() => {
    const saved = localStorage.getItem('sdg_autoprint_kitchen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Auto-print counter/client ticket setting (persisted in localStorage)
  const [autoPrintCounter, setAutoPrintCounter] = useState(() => {
    const saved = localStorage.getItem('sdg_autoprint_counter');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleAutoPrintKitchen = () => {
    setAutoPrintKitchen(prev => {
      const next = !prev;
      localStorage.setItem('sdg_autoprint_kitchen', JSON.stringify(next));
      return next;
    });
  };

  const toggleAutoPrintCounter = () => {
    setAutoPrintCounter(prev => {
      const next = !prev;
      localStorage.setItem('sdg_autoprint_counter', JSON.stringify(next));
      return next;
    });
  };

  const handleConfirmPayment = (order) => {
    // 1. Confirm payment -> update status to 'pagamento_confirmado' (sends to kitchen)
    updateOrderStatus(order.id, 'pagamento_confirmado');

    // 2. Trigger print according to toggles:
    if (autoPrintKitchen && autoPrintCounter) {
      triggerPrintTicket(order, 'both');
    } else if (autoPrintKitchen) {
      triggerPrintTicket(order, 'kitchen');
    } else if (autoPrintCounter) {
      triggerPrintTicket(order, 'counter');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Balcão Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Painel do Caixa & Balcão</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Gestão de Pedidos & Pagamentos</h1>
            <p className="text-slate-400 text-sm mt-1">
              Confirme o pagamento dos clientes para liberar a comanda automaticamente para a cozinha.
            </p>
          </div>

          {/* Quick Metrics & Auto-Print Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Elgin i8 Network Status Badge */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs shadow-inner">
              <span className={`w-2.5 h-2.5 rounded-full ${printerStatus?.online ? 'bg-emerald-400 animate-pulse' : printerStatus?.checking ? 'bg-amber-400 animate-ping' : 'bg-rose-500'}`}></span>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1 font-bold text-white text-[11px]">
                  <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Elgin i8 ({printerSettings?.ip || '192.168.1.150'})</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {printerStatus?.online ? '🟢 Conectada na rede' : printerStatus?.checking ? 'Verificando...' : '🔴 Desconectada'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => printTestTicket()}
                className="ml-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[10px] font-bold transition-all"
                title="Imprimir cupom de teste na impressora Elgin"
              >
                Testar
              </button>
            </div>

            {/* Auto-Print Kitchen Toggle */}
            <div
              onClick={toggleAutoPrintKitchen}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl border cursor-pointer select-none transition-all ${
                autoPrintKitchen
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Ao marcar, o pagamento confirmado enviará a comanda da cozinha para a Elgin i8"
            >
              <input
                type="checkbox"
                checked={autoPrintKitchen}
                onChange={toggleAutoPrintKitchen}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer accent-amber-500"
              />
              <div className="text-xs font-bold">
                <div className="flex items-center space-x-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto Cozinha</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {autoPrintKitchen ? '🟢 Ativado' : '⚪ Desativado'}
                </div>
              </div>
            </div>

            {/* Auto-Print Counter Toggle */}
            <div
              onClick={toggleAutoPrintCounter}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl border cursor-pointer select-none transition-all ${
                autoPrintCounter
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Ao marcar, o pagamento confirmado emitirá o cupom do balcão/cliente na Elgin i8"
            >
              <input
                type="checkbox"
                checked={autoPrintCounter}
                onChange={toggleAutoPrintCounter}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer accent-amber-500"
              />
              <div className="text-xs font-bold">
                <div className="flex items-center space-x-1">
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto Balcão</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {autoPrintCounter ? '🟢 Ativado' : '⚪ Desativado'}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Aguardando Pagto</div>
              <div className="text-2xl font-black text-amber-400">{pendingOrders.length}</div>
            </div>

            <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold">Total Hoje</div>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(orders.reduce((acc, o) => acc + o.total, 0))}
              </div>
            </div>

            <button
              onClick={() => setCurrentView('motoboy')}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all shadow-md"
              title="Abrir a tela de entregas dos motoboys"
            >
              <Bike className="w-4 h-4" />
              <span>Painel Motoboy</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: URGENT PENDING PAYMENTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Solicitações Aguardando Caixa ({pendingOrders.length})</span>
            </h2>
            {pendingOrders.length > 0 && (
              <span className="text-xs font-bold text-amber-400 animate-pulse">
                • Novos pedidos aguardando ação no balcão
              </span>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Nenhum pedido aguardando confirmação no balcão no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all relative overflow-hidden"
                >
                  {/* Top Badge */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-black text-amber-400">{order.id}</span>
                        <span className="text-xs text-slate-400 font-semibold">{formatTime(order.createdAt)}</span>
                      </div>
                      <h3 className="font-extrabold text-white text-base mt-0.5">{order.customerName}</h3>
                      <p className="text-xs text-slate-400">{order.customerPhone}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-md uppercase">
                      Aguardando Pagamento
                    </span>
                  </div>

                  {/* Delivery Info */}
                  <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-bold text-slate-300">
                      TIPO: {order.deliveryType === 'delivery' ? '🛵 DELIVERY' : '🛍️ RETIRADA'}
                    </div>
                    {order.deliveryType === 'delivery' && (
                      <div className="text-slate-400 truncate">End: {order.address}</div>
                    )}
                    <div className="text-amber-400 font-bold">
                      FORMA PAGTO: {PAYMENT_METHODS[order.paymentMethod]?.label || order.paymentMethod}
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-1.5 border-t border-b border-slate-800/80 py-3 text-xs">
                    <div className="font-bold text-slate-400 uppercase text-[10px]">Itens Solicitados:</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-200">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                    {order.observation && (
                      <p className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 p-2 rounded-lg mt-2">
                        Obs: {order.observation}
                      </p>
                    )}
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-base font-black">
                      <span className="text-slate-300">Valor Total:</span>
                      <span className="text-amber-400 text-xl">{formatCurrency(order.total)}</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {/* Confirm Payment & Send to Kitchen */}
                      <button
                        onClick={() => handleConfirmPayment(order)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        <span>
                          Confirmar Pagto
                          {autoPrintKitchen && autoPrintCounter
                            ? ' + Imprimir Cozinha & Balcão'
                            : autoPrintKitchen
                            ? ' + Imprimir Cozinha'
                            : autoPrintCounter
                            ? ' + Imprimir Balcão'
                            : ''}
                        </span>
                      </button>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Print Ticket Balcão */}
                        <button
                          onClick={() => triggerPrintTicket(order, 'counter')}
                          className="py-2 px-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1"
                          title="Imprimir Cupom do Caixa / Cliente na Elgin i8"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Balcão</span>
                        </button>

                        {/* Print Ticket Kitchen */}
                        <button
                          onClick={() => triggerPrintTicket(order, 'kitchen')}
                          className="py-2 px-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1"
                          title="Imprimir Comanda de Produção da Cozinha na Elgin i8"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Cozinha</span>
                        </button>

                        {/* Print Both */}
                        <button
                          onClick={() => triggerPrintTicket(order, 'both')}
                          className="py-2 px-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center space-x-1"
                          title="Imprimir Ambos (Cozinha + Balcão) na Elgin i8"
                        >
                          <span>Ambos</span>
                        </button>
                      </div>

                      {/* PIX QR Code & Copia e Cola Button */}
                      {order.paymentMethod === 'pix' && (
                        <button
                          type="button"
                          onClick={() => setPixOrderModal(order)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                          title="Exibir QR Code e Código Pix deste pedido para o cliente no balcão"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Ver QR Code PIX ({formatCurrency(order.total)})</span>
                        </button>
                      )}

                      {/* Edit Order button */}
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-amber-300 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                        title="Adicionar ou editar itens, endereço e dados deste pedido"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Editar Itens / Pedido</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: ALL ORDERS & HISTORY */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Todos os Pedidos do Dia</h2>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar nº ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none w-48"
                />
              </div>

              {/* Status Select */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:border-amber-500 outline-none font-semibold"
              >
                <option value="all">Todos os Status</option>
                <option value="aguardando_pagamento">Aguardando Pagamento</option>
                <option value="pagamento_confirmado">Pagamento Confirmado (Cozinha)</option>
                <option value="em_preparo">Em Preparo</option>
                <option value="pronto">Pronto</option>
                <option value="saiu_para_entrega">Em Rota (Com Motoboy)</option>
                <option value="entregue">Concluído</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Pedido / Hora</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Tipo & Endereço</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4">Status Atual</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Nenhum pedido encontrado no histórico.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const st = STATUS_MAP[order.status] || STATUS_MAP.aguardando_pagamento;
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <div className="font-extrabold text-amber-400 text-sm">{order.id}</div>
                            <div className="text-slate-500 text-[11px]">{formatDateTime(order.createdAt)}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-white">{order.customerName}</div>
                            <div className="text-slate-400 text-[11px]">{order.customerPhone}</div>
                          </td>

                          <td className="p-4 text-slate-300">
                            <div className="font-bold uppercase text-[11px]">
                              {order.deliveryType === 'delivery' ? '🛵 Delivery' : '🛍️ Retirada'}
                            </div>
                            <div className="text-slate-400 text-[11px] truncate max-w-xs">{order.address}</div>
                          </td>

                          <td className="p-4 text-slate-300">
                            <span className="font-semibold">{PAYMENT_METHODS[order.paymentMethod]?.label || order.paymentMethod}</span>
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${st.color}`}>
                              {st.label}
                            </span>
                          </td>

                          <td className="p-4 text-right font-extrabold text-white text-sm">
                            {formatCurrency(order.total)}
                          </td>

                          <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                            {/* Edit Order */}
                            <button
                              onClick={() => setEditingOrder(order)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-all inline-flex items-center"
                              title="Editar Itens ou Dados do Pedido"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Ticket Balcão */}
                            <button
                              onClick={() => triggerPrintTicket(order, 'counter')}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all inline-flex items-center"
                              title="Imprimir Comprovante Balcão (Elgin i8)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Kitchen Ticket */}
                            <button
                              onClick={() => triggerPrintTicket(order, 'kitchen')}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-all inline-flex items-center"
                              title="Imprimir Ficha Cozinha (Elgin i8)"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Both Tickets */}
                            <button
                              onClick={() => triggerPrintTicket(order, 'both')}
                              className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[10px] font-black transition-all inline-flex items-center"
                              title="Imprimir Ambos na Elgin i8 (Cozinha + Balcão)"
                            >
                              Ambos
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Edição de Pedido */}
      {editingOrder && (
        <OrderEditModal
          isOpen={Boolean(editingOrder)}
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={editOrder}
          onPrint={triggerPrintTicket}
        />
      )}

      {/* Modal de Exibição do QR Code PIX no Balcão */}
      {pixOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">QR Code PIX - Pedido #{pixOrderModal.id}</h3>
              </div>
              <button
                onClick={() => setPixOrderModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <PixPaymentCard
              amount={pixOrderModal.total}
              orderId={pixOrderModal.id}
              storeSettings={storeSettings}
              onPaymentConfirmed={() => {
                handleConfirmPayment(pixOrderModal);
                setPixOrderModal(null);
              }}
              showActionButtons={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
