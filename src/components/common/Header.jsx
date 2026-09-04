import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { UtensilsCrossed, Monitor, ChefHat, ShoppingBag, Share2, Sparkles } from 'lucide-react';

export const Header = () => {
  const { currentView, setCurrentView, orders, cart } = useOrder();

  const pendingBalcaoCount = orders.filter(o => o.status === 'aguardando_pagamento').length;
  const kitchenActiveCount = orders.filter(o => o.status === 'pagamento_confirmado' || o.status === 'em_preparo').length;
  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('client')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/30">
              <UtensilsCrossed className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                SDG Delivery
              </span>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Sistema Ativo & Sincronizado</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            
            {/* View 1: Cliente / Cardápio */}
            <button
              onClick={() => setCurrentView('client')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'client'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Cardápio (WhatsApp)</span>
              {totalCartQty > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-slate-950 text-amber-400 rounded-full">
                  {totalCartQty}
                </span>
              )}
            </button>

            {/* View 2: Balcão / Caixa */}
            <button
              onClick={() => setCurrentView('counter')}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'counter'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Balcão / Caixa</span>
              {pendingBalcaoCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full animate-bounce">
                  {pendingBalcaoCount}
                </span>
              )}
            </button>

            {/* View 3: Cozinha / KDS */}
            <button
              onClick={() => setCurrentView('kitchen')}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'kitchen'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cozinha (KDS)</span>
              {kitchenActiveCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">
                  {kitchenActiveCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Actions / Mobile Tabs Switcher */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('admin')}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-300 transition-colors"
              title="Compartilhar Link do WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Link WhatsApp</span>
            </button>

            {/* Mobile View Selector */}
            <div className="flex md:hidden items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setCurrentView('client')}
                className={`p-2 rounded-md ${currentView === 'client' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                title="Cardápio"
              >
                <UtensilsCrossed className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('counter')}
                className={`p-2 rounded-md relative ${currentView === 'counter' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                title="Balcão"
              >
                <Monitor className="w-4 h-4" />
                {pendingBalcaoCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setCurrentView('kitchen')}
                className={`p-2 rounded-md relative ${currentView === 'kitchen' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                title="Cozinha"
              >
                <ChefHat className="w-4 h-4" />
                {kitchenActiveCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
