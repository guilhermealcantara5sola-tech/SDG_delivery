import React from 'react';
import { Star, Clock, MapPin, Search, ShoppingBag, Utensils, CheckCircle2, Award, User } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export const HeaderBanner = ({ searchQuery, setSearchQuery, onOpenCart, onOpenCustomerAuth }) => {
  const { cart, customer } = useOrder();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 mb-6 shadow-2xl">
      {/* Cover Photo Banner (Anota Aí Cover) */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
          alt="Capa do Restaurante"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
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

        {/* Status Pill on Cover */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-black text-xs shadow-lg backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>ABERTO AGORA</span>
        </div>
      </div>

      {/* Profile & Info Section */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          {/* Avatar / Logo */}
          <div className="flex items-end space-x-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center p-2 group">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
                <Utensils className="w-10 h-10 text-slate-950 stroke-[2.5]" />
              </div>
            </div>

            <div className="pb-1">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  SDG Burger & Pizza
                </h1>
                <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400/20" title="Verificado" />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Artesanais, Pizzas & Delivery no WhatsApp
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

        {/* Badges / Metrics Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-white">4.9</span>
            <span className="text-slate-500 text-[11px]">(500+ pedidos)</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>30 - 45 min</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Entrega: R$ 7,00 • Retirada Grátis</span>
          </div>
        </div>

        {/* Search Bar */}
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
