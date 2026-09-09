import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, QrCode, CreditCard, Banknote, MapPin, Phone, User, ShoppingBag, ArrowRight, Award, Gift } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';
import { WhatsAppIcon } from '../common/BrandIcons';
import { isHexColorLight } from '../../utils/theme';
import confetti from 'canvas-confetti';

export const CartDrawer = ({ isOpen, onClose, onOrderPlaced, onOpenCustomerAuth }) => {
  const { cart, removeFromCart, updateCartQuantity, createOrder, customer, storeSettings } = useOrder();

  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' | 'takeout'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [changeFor, setChangeFor] = useState('');
  const [observation, setObservation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const primaryColor = storeSettings?.primaryColor || '#f59e0b';
  const secondaryColor = storeSettings?.secondaryColor || '#ea580c';
  const isLight = isHexColorLight(primaryColor);
  const contrastText = isLight ? '#0f172a' : '#ffffff';

  // Preenche automaticamente com os dados salvos do cliente
  React.useEffect(() => {
    if (customer) {
      if (customer.name) setName(customer.name);
      if (customer.phone) setPhone(customer.phone);
      if (customer.address) setAddress(customer.address);
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const isFreeDelivery = storeSettings?.freeDeliveryThreshold > 0 && subtotal >= storeSettings.freeDeliveryThreshold;
  const standardFee = Number(storeSettings?.deliveryFee) >= 0 ? Number(storeSettings.deliveryFee) : 7.00;
  const deliveryFee = deliveryType === 'delivery' ? (isFreeDelivery ? 0 : standardFee) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = (sendToWhatsapp = false) => {
    if (!name.trim()) {
      setErrorMsg('Por favor, informe o seu Nome.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor, informe o seu Telefone / WhatsApp.');
      return;
    }
    if (deliveryType === 'delivery' && !address.trim()) {
      setErrorMsg('Por favor, informe o Endereço de Entrega.');
      return;
    }

    setErrorMsg('');

    const fullObservation = [
      observation,
      paymentMethod === 'cash' && changeFor ? `Troco para: ${changeFor}` : ''
    ].filter(Boolean).join(' | ');

    // Create Order in state/Sync
    const newOrder = createOrder({
      name,
      phone,
      deliveryType,
      address: deliveryType === 'delivery' ? address : 'Retirada no Balcão',
      paymentMethod,
      observation: fullObservation
    });

    // Trigger visual celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Option to also send via WhatsApp
    if (sendToWhatsapp) {
      let msg = `*NOVO PEDIDO #${newOrder.id}*\n`;
      msg += `--------------------------\n`;
      msg += `*Cliente:* ${name}\n`;
      msg += `*Telefone:* ${phone}\n`;
      msg += `*Tipo:* ${deliveryType === 'delivery' ? 'Delivery (Entrega)' : 'Retirada no Balcão'}\n`;
      if (deliveryType === 'delivery') msg += `*Endereço:* ${address}\n`;
      msg += `*Forma de Pagamento:* ${paymentMethod.toUpperCase()}\n`;
      msg += `--------------------------\n`;
      msg += `*ITENS:* \n`;
      cart.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} (${formatCurrency(item.subtotal)})\n`;
        if (item.selectedOptions.length) {
          msg += `   _Opções: ${item.selectedOptions.join(', ')}_\n`;
        }
      });
      msg += `--------------------------\n`;
      msg += `*Total:* ${formatCurrency(total)}\n`;
      if (observation) msg += `*Obs:* ${observation}\n`;

      const encoded = encodeURIComponent(msg);
      const targetDigits = String(storeSettings?.whatsapp || storeSettings?.phoneSupport || '').replace(/\D/g, '');
      const fullTargetNumber = targetDigits ? (targetDigits.startsWith('55') && targetDigits.length >= 12 ? targetDigits : `55${targetDigits}`) : '';
      const waUrl = fullTargetNumber ? `https://wa.me/${fullTargetNumber}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(waUrl, '_blank');
    }

    onClose();
    onOrderPlaced(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
            <h2 className="text-lg font-extrabold text-white">Seu Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          
          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-400 font-medium text-sm">Seu carrinho está vazio.</p>
              <button
                onClick={onClose}
                className="text-amber-400 text-xs font-bold hover:underline"
              >
                Voltar ao cardápio
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Itens Selecionados</h3>
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-bold text-sm text-white">{item.name}</div>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {item.selectedOptions.join(', ')}
                      </p>
                    )}
                    <div className="text-amber-400 font-extrabold text-xs">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 space-x-2">
                      <button
                        onClick={() => updateCartQuantity(index, -1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(index, 1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              {/* Delivery vs Takeout Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Pedido</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    style={deliveryType === 'delivery' ? {
                      backgroundColor: primaryColor,
                      color: contrastText
                    } : {}}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      deliveryType === 'delivery'
                        ? 'shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛵 Entrega ({deliveryFee > 0 ? `+ ${formatCurrency(deliveryFee)}` : 'Grátis'})
                  </button>
                  <button
                    onClick={() => setDeliveryType('takeout')}
                    style={deliveryType === 'takeout' ? {
                      backgroundColor: primaryColor,
                      color: contrastText
                    } : {}}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      deliveryType === 'takeout'
                        ? 'shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛍️ Retirada no Balcão
                  </button>
                </div>
              </div>

              {/* Customer Loyalty / Login Banner in Cart */}
              {customer ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-amber-300">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Conectado: <strong>{customer.name}</strong></span>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    ⭐ {customer.total_orders || 1} Pedidos
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { onClose(); if (onOpenCustomerAuth) onOpenCustomerAuth(); }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 text-xs text-left transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Gift className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <div className="font-bold text-white">Já tem cadastro? Entrar com 6 dígitos</div>
                      <div className="text-[10px] text-slate-400">Puxa seu endereço salvo e pontua na fidelidade!</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </button>
              )}

              {/* Customer Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Seus Dados de Entrega</h3>
                  {customer && (
                    <span className="text-[10px] text-emerald-400 font-semibold">✓ Dados pré-preenchidos</span>
                  )}
                </div>
                
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Seu Nome Completo *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Telefone / WhatsApp (ex: 11999998888) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                  />
                </div>

                {deliveryType === 'delivery' && (
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Endereço Completo com Nº e Bairro *"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Payment Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all text-xs font-bold ${
                      paymentMethod === 'pix'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all text-xs font-bold ${
                      paymentMethod === 'credit_card'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all text-xs font-bold ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Dinheiro</span>
                  </button>
                </div>

                {/* Helper / Troco Info */}
                {paymentMethod === 'cash' && (
                  <div className="pt-1 animate-in fade-in space-y-1">
                    <input
                      type="text"
                      placeholder="Precisa de troco? Para quanto? (Ex: R$ 50,00)"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <p className="text-[11px] text-amber-400 font-semibold pt-1">
                    ⚡ Chave PIX e QR Code para pagamento instantâneo serão gerados.
                  </p>
                )}

                {paymentMethod === 'credit_card' && (
                  <p className="text-[11px] text-slate-400 pt-1">
                    💳 Levaremos a maquininha de cartão no momento da entrega / retirada.
                  </p>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold">
                  {errorMsg}
                </div>
              )}
            </>
          )}

        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
            
            {/* Totals Breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-slate-400">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total</span>
                <span style={{ color: primaryColor }} className="font-black">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleCheckout(false)}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: contrastText
                }}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm hover:brightness-105 transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Confirmar Pedido (Balcão / Caixa)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleCheckout(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <WhatsAppIcon className="w-4 h-4" colored={false} />
                <span>Enviar Pedido pelo WhatsApp da Loja</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
