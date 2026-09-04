import React from 'react';
import { Star, Clock, MapPin, Search, ShoppingBag } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export const HeaderBanner = ({ searchQuery, setSearchQuery, onOpenCart }) => {
  const { cart } = useOrder();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 mb-8 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Restaurant Info */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Cardápio Digital & Delivery WhatsApp</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Faça seu Pedido Online
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Escolha os seus itens favoritos abaixo. Seu pedido é enviado em tempo real para o nosso balcão e cozinha com acompanhamento pelo WhatsApp!
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-2">
            <div className="flex items-center space-x-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">4.9</span>
              <span className="text-slate-400">(500+ avaliações)</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>30 - 45 min</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Entrega Grátis acima de R$ 70</span>
            </div>
          </div>
        </div>

        {/* Search & Cart Quick Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            onClick={onOpenCart}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Carrinho</span>
            {totalCartItems > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-slate-950 text-amber-400 rounded-full font-extrabold">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
