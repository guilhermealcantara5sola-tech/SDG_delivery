import React from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import { Header } from './components/common/Header';
import { PrintTicket } from './components/common/PrintTicket';
import { ClientView } from './components/client/ClientView';
import { CounterView } from './components/counter/CounterView';
import { KitchenView } from './components/kitchen/KitchenView';
import { AdminView } from './components/admin/AdminView';
import { MotoboyView } from './components/motoboy/MotoboyView';

import { Printer, X } from 'lucide-react';

const AppContent = () => {
  const { currentView, printerToast, closePrinterToast } = useOrder();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* O menu de gestão/equipe só aparece para a equipe no computador (Balcão, Cozinha, Admin) */}
      {currentView !== 'client' && currentView !== 'motoboy' && <Header />}

      <main className="flex-1">
        {currentView === 'client' && <ClientView />}
        {currentView === 'counter' && <CounterView />}
        {currentView === 'kitchen' && <KitchenView />}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'motoboy' && <MotoboyView />}
      </main>

      <PrintTicket />

      {/* Notificação Toast Flutuante de Impressão Térmica Elgin i8 */}
      {printerToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl max-w-md ${
            printerToast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
              : printerToast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/95 border-amber-500/40 text-amber-200'
          }`}>
            <Printer className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold leading-snug">{printerToast.message}</p>
            <button
              onClick={closePrinterToast}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
}
