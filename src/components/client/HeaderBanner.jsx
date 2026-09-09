import React from 'react';
import { Star, Clock, MapPin, Search, ShoppingBag, Utensils, CheckCircle2, Award, User, Sparkles, Phone, AlertTriangle } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';

export const HeaderBanner = ({ searchQuery, setSearchQuery, onOpenCart, onOpenCustomerAuth }) => {
  const { cart, customer, storeSettings } = useOrder();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const settings = storeSettings || {
    restaurantName: 'SDG Burger & Pizza',
    slogan: 'Artesanais, Pizzas & Delivery no WhatsApp',
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    logoUrl: '',
    isOpen: true,
    deliveryTime: '30 - 45 min',
    deliveryFee: 7.00,
    freeDeliveryThreshold: 80.00,
    bannerNotice: '🔥 PROMOÇÃO: Frete Grátis em pedidos acima de R$ 80!',
    showBannerNotice: true,
    phoneSupport: '(11) 99999-8888',
    openingHours: 'Terça a Domingo: 18:00 às 23:30'
  };

  const cleanPhone = (settings.phoneSupport || '').replace(/\D/g, '');

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 mb-6 shadow-2xl">
      
      {/* 1. Promotional Marquee Notice (se ativado na personalização) */}
      {settings.showBannerNotice && settings.bannerNotice && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs py-2 px-4 text-center tracking-wide flex items-center justify-center space-x-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span className="truncate">{settings.bannerNotice}</span>
        </div>
      )}

      {/* 2. Cover Photo Banner */}
      <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={settings.coverUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"}
          alt={settings.restaurantName}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Loyalty Club Top Banner Shortcut */}
        <button
          onClick={onOpenCustomerAuth}
          className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] sm:text-xs shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Ver meus prêmios de fidelidade e histórico"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          {customer ? (
            <span>👑 {customer.name.split(' ')[0]} ({customer.total_orders || 1} Pedidos)</span>
          ) : (
            <span>🎁 Ganhe Prêmios (Entrar / Cadastrar)</span>
          )}
        </button>

        {/* Status Pill (Aberto / Fechado) */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
          {settings.isOpen ? (
            <div className="flex items-center space-x-1.5 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>ABERTO AGORA</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
              <span className="w-2 h-2 rounded-full bg-rose-200"></span>
              <span>FECHADO NO MOMENTO</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Profile & Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          
          {/* Avatar / Logo Customizado */}
          <div className="flex items-end space-x-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center p-1 group shrink-0">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.restaurantName}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
                  <Utensils className="w-10 h-10 text-slate-950 stroke-[2.5]" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {settings.restaurantName}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" title="Verificado Oficial" />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {settings.slogan}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons (Login & Cart) */}
          <div className="flex items-center space-x-2 self-start sm:self-end w-full sm:w-auto">
            {/* Customer Auth / Loyalty Button */}
            <button
              onClick={onOpenCustomerAuth}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-400 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>
                {customer ? `Olá, ${customer.name.split(' ')[0]}` : 'Cadastrar / Entrar'}
              </span>
              {customer && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                  ⭐ {customer.total_orders || 1}
                </span>
              )}
            </button>

            {/* Quick Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Sacola</span>
              {totalCartItems > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-slate-950 text-amber-400 rounded-full font-black">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Badges / Metrics Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-white">4.9</span>
            <span className="text-slate-500 text-[11px]">(500+ pedidos)</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{settings.deliveryTime || '30 - 45 min'}</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {settings.deliveryFee > 0 ? `Taxa Entrega: ${formatCurrency(settings.deliveryFee)}` : 'Entrega Grátis'}
              {settings.freeDeliveryThreshold > 0 && (
                <span className="text-emerald-400 font-bold ml-1">
                  (Grátis acima de {formatCurrency(settings.freeDeliveryThreshold)})
                </span>
              )}
            </span>
          </div>

          {cleanPhone && (
            <a
              href={`https://wa.me/55${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 bg-slate-950 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all ml-auto"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp do Delivery</span>
            </a>
          )}
        </div>

        {/* Aviso de Loja Fechada se estiver pausada */}
        {!settings.isOpen && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              {settings.closedMessage || 'Estamos fechados no momento. Você ainda pode visualizar o cardápio!'}
            </span>
          </div>
        )}

        {/* 5. Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O que você gostaria de comer hoje? (Ex: smash, pepperoni, coca...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

      </div>
    </div>
  );
};
