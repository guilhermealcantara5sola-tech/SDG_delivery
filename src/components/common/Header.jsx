import React from 'react';
import { useOrder } from '../../context/OrderContext';
import { Monitor, ChefHat, ExternalLink, Link2, BellRing, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { currentView, setCurrentView, orders } = useOrder();

  const pendingBalcaoCount = orders.filter(o => o.status === 'aguardando_pagamento').length;
  const kitchenActiveCount = orders.filter(o => o.status === 'pagamento_confirmado' || o.status === 'em_preparo').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-white">
                  SDG Gestor
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase">
                  Equipe
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Painel interno do restaurante</div>
            </div>
          </div>

          {/* Navigation Tabs for Staff */}
          <nav className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            
            {/* View: Balcão / Caixa */}
            <button
              onClick={() => setCurrentView('counter')}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'counter'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Balcão / Caixa</span>
              {pendingBalcaoCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                  {pendingBalcaoCount}
                </span>
              )}
            </button>

            {/* View: Cozinha / KDS */}
            <button
              onClick={() => setCurrentView('kitchen')}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'kitchen'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cozinha (KDS)</span>
              {kitchenActiveCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-blue-500 text-white rounded-full">
                  {kitchenActiveCount}
                </span>
              )}
            </button>

            {/* View: Links & Config */}
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Links de Acesso</span>
            </button>
          </nav>

          {/* Open Customer Menu in New Tab */}
          <div className="flex items-center space-x-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 transition-all shadow-sm"
              title="Abrir o cardápio que os clientes veem no WhatsApp em outra aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Cardápio do Cliente</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
