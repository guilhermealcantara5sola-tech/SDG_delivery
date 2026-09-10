import React from 'react';
import { X, CheckCircle2, Clock, ChefHat, PackageCheck, QrCode, Sparkles } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency, STATUS_MAP, PAYMENT_METHODS } from '../../utils/formatters';
import { PixPaymentCard } from '../common/PixPaymentCard';

export const OrderStatusModal = ({ order, onClose }) => {
  const { orders, storeSettings } = useOrder();

  if (!order) return null;

  // Find live order state
  const liveOrder = orders.find(o => o.id === order.id) || order;
  const statusInfo = STATUS_MAP[liveOrder.status] || STATUS_MAP.aguardando_pagamento;

  const isDelivery = liveOrder.deliveryType === 'delivery';

  const handleSendReceiptWhatsapp = () => {
    const phoneDigits = String(storeSettings?.whatsapp || storeSettings?.phoneSupport || '').replace(/\D/g, '');
    const targetNumber = phoneDigits ? (phoneDigits.startsWith('55') && phoneDigits.length >= 12 ? phoneDigits : `55${phoneDigits}`) : '';
    const msg = `*COMPROVANTE DE PAGAMENTO PIX*\n\n` +
      `Olá! Fiz o pagamento via PIX do *Pedido #${liveOrder.id}* no valor de *${formatCurrency(liveOrder.total)}*.\n` +
      `Cliente: ${liveOrder.customerName}\n\n` +
      `Seguem os dados do pedido. Aguardo a confirmação da cozinha! 🍔🍕`;
    const waUrl = targetNumber
      ? `https://wa.me/${targetNumber}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const steps = [
    { key: 'aguardando_pagamento', label: '1. Pedido Recebido', desc: 'Aguardando confirmação do pagamento no caixa' },
    { key: 'pagamento_confirmado', label: '2. Confirmado', desc: 'Pedido enviado para a cozinha' },
    { key: 'em_preparo', label: '3. Em Preparo', desc: 'Chefs preparando seus pratos com carinho' },
    { key: 'pronto', label: isDelivery ? '4. Pronto p/ Saída' : '4. Pronto p/ Retirada', desc: isDelivery ? 'Embalado e aguardando o motoboy' : 'Pode retirar no balcão da loja!' },
    ...(isDelivery ? [
      { key: 'saiu_para_entrega', label: '5. Em Rota com Motoboy 🛵', desc: 'O entregador está a caminho do seu endereço!' }
    ] : []),
    { key: 'entregue', label: isDelivery ? 'Concluído' : 'Retirado', desc: 'Pedido entregue com sucesso. Bom apetite!' }
  ];

  const getStepStatus = (stepKey) => {
    const orderIndex = steps.findIndex(s => s.key === liveOrder.status);
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-extrabold text-lg">PEDIDO #{liveOrder.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo.shortLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Acompanhamento em tempo real</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIX Quick Helper if waiting payment com QR Code oficial e Copia e Cola */}
        {liveOrder.status === 'aguardando_pagamento' && liveOrder.paymentMethod === 'pix' && (
          <PixPaymentCard
            amount={liveOrder.total}
            orderId={liveOrder.id}
            storeSettings={storeSettings}
            onSendWhatsapp={handleSendReceiptWhatsapp}
            showActionButtons={true}
          />
        )}

        {/* Live Timeline Steps */}
        <div className="space-y-4 relative pl-4 border-l-2 border-slate-800 my-4">
          {steps.map((step, idx) => {
            const state = getStepStatus(step.key);
            return (
              <div key={idx} className="relative space-y-0.5">
                <div className={`absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : state === 'current'
                    ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-500/20'
                    : 'bg-slate-950 border-slate-700'
                }`}>
                  {state === 'completed' && <CheckCircle2 className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </div>

                <div className={`font-bold text-xs ${
                  state === 'current' ? 'text-amber-400' : state === 'completed' ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-400">{step.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Order Details Summary */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between font-bold text-slate-300">
            <span>Cliente:</span>
            <span>{liveOrder.customerName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Telefone:</span>
            <span>{liveOrder.customerPhone}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tipo:</span>
            <span>{liveOrder.deliveryType === 'delivery' ? 'Delivery (Entrega)' : 'Retirada no Balcão'}</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
            <span>Total a Pagar:</span>
            <span className="text-amber-400 font-extrabold text-sm">{formatCurrency(liveOrder.total)}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all"
        >
          Entendido / Fechar
        </button>

      </div>
    </div>
  );
};
