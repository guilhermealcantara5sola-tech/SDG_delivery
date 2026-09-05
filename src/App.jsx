import React from 'react';
import { OrderProvider, useOrder } from './context/OrderContext';
import { Header } from './components/common/Header';
import { PrintTicket } from './components/common/PrintTicket';
import { ClientView } from './components/client/ClientView';
import { CounterView } from './components/counter/CounterView';
import { KitchenView } from './components/kitchen/KitchenView';
import { AdminView } from './components/admin/AdminView';

const AppContent = () => {
  const { currentView } = useOrder();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* O menu de gestão/equipe só aparece para a equipe (Balcão, Cozinha, Admin) */}
      {currentView !== 'client' && <Header />}

      <main className="flex-1">
        {currentView === 'client' && <ClientView />}
        {currentView === 'counter' && <CounterView />}
        {currentView === 'kitchen' && <KitchenView />}
        {currentView === 'admin' && <AdminView />}
      </main>

      <PrintTicket />
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
