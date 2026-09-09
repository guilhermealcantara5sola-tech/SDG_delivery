import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, DollarSign, TrendingUp, Smartphone,
  Monitor, ChefHat, ExternalLink, Copy, Check, Search, Phone,
  MapPin, Utensils, Award, ShieldCheck, CheckCircle2, MessageCircle
} from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';
import { fetchCustomersFromDb } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const AdminView = () => {
  const { setCurrentView, orders } = useOrder();
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'menu' | 'links'
  const [customers, setCustomers] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-restaurante.vercel.app';
  const clientUrl = `${originUrl}/`;
  const counterUrl = `${originUrl}/balcao`;
  const kitchenUrl = `${originUrl}/cozinha`;

  // Fetch customers from database on mount
  useEffect(() => {
    const loadCustomers = async () => {
      const res = await fetchCustomersFromDb();
      if (res.data && res.data.length > 0) {
        setCustomers(res.data);
      } else {
        // Fallback to extracting customers from current orders
        const map = new Map();
        orders.forEach(o => {
          if (!map.has(o.customerPhone)) {
            map.set(o.customerPhone, {
              id: o.customerPhone,
              name: o.customerName,
              phone: o.customerPhone,
              address: o.address,
              total_orders: 1,
              created_at: o.createdAt
            });
          } else {
            const existing = map.get(o.customerPhone);
            existing.total_orders += 1;
          }
        });
        setCustomers(Array.from(map.values()));
      }
    };

    loadCustomers();
  }, [orders]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Business metrics calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const totalCustomersCount = customers.length;

  // Filter customers by search
  const filteredCustomers = customers.filter(c => {
    const query = searchCustomer.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query) ||
      (c.address || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Painel Header do Gestor */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel do Gestor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Gestão do Restaurante</h1>
            <p className="text-slate-400 text-sm mt-1">
              Acompanhe seus clientes, cardápio, faturamento e acesse as telas de operação da equipe.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sistema Online & Sincronizado</span>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* MÉTRICAS DO NEGÓCIO (KPIS) */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Faturamento</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500">Total acumulado de vendas</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-slate-500">Pedidos registrados</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Clientes</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400">
              {totalCustomersCount}
            </div>
            <p className="text-[11px] text-slate-500">Cadastrados no banco</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">
              {formatCurrency(averageTicket)}
            </div>
            <p className="text-[11px] text-slate-500">Média por pedido</p>
          </div>

        </div>

        {/* ============================================================================== */}
        {/* NAVEGAÇÃO DE ABAS DE GESTÃO */}
        {/* ============================================================================== */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'clients'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes & Cadastros ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Cardápio de Produtos</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'links'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Links de Atendimento</span>
          </button>
        </div>

        {/* ============================================================================== */}
        {/* ABA 1: CLIENTES & CADASTROS */}
        {/* ============================================================================== */}
        {activeTab === 'clients' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Base de Clientes Cadastrados</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Os clientes são salvos automaticamente no banco de dados assim que realizam um pedido pelo cardápio.
                </p>
              </div>

              {/* Busca por cliente */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente, tel ou rua..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Tabela de Clientes */}
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-bold text-slate-300">Nenhum cliente encontrado</p>
                <p className="text-xs text-slate-500">Conforme os clientes fizerem pedidos, os cadastros aparecerão aqui automaticamente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">WhatsApp / Telefone</th>
                      <th className="py-3 px-4">Endereço de Entrega</th>
                      <th className="py-3 px-4 text-center">Pedidos Feitos</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredCustomers.map((cust, idx) => {
                      const cleanPhone = (cust.phone || '').replace(/\D/g, '');
                      return (
                        <tr key={cust.id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xs">
                              {(cust.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span>{cust.name}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {cust.phone}
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={cust.address}>
                            {cust.address ? (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{cust.address}</span>
                              </div>
                            ) : (
                              <span className="text-slate-600">Retirada no Balcão</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {cust.total_orders > 1 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-extrabold text-[10px] border border-amber-500/20">
                                <Award className="w-3 h-3 text-amber-400" />
                                <span>{cust.total_orders} pedidos (Fiel)</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                                {cust.total_orders || 1} pedido
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/55${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold text-[11px] transition-all"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Conversar</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================================== */}
        {/* ABA 2: GESTÃO DO CARDÁPIO */}
        {/* ============================================================================== */}
        {activeTab === 'menu' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-amber-400" />
                <span>Cardápio do Restaurante</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualize os produtos e categorias disponíveis para os clientes no cardápio digital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map(product => {
                const category = CATEGORIES.find(c => c.id === product.categoryId);
                return (
                  <div key={product.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex space-x-3 hover:border-slate-700 transition-all">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black text-amber-400">
                            {category?.name || 'Geral'}
                          </span>
                          {product.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{product.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{product.description}</p>
                      </div>
                      <div className="text-sm font-black text-emerald-400 mt-2">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* ABA 3: LINKS DE ATENDIMENTO E OPERAÇÃO */}
        {/* ============================================================================== */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
              <h2 className="text-xl font-black text-white">Links de Acesso Rápido</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada área do restaurante possui seu próprio link. Você pode abrir o Balcão no computador do caixa, a Cozinha em um tablet ou Smart TV, e divulgar o link do cardápio para os clientes no WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: CLIENTE */}
              <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-emerald-400 transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Público • Clientes
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">1. Cardápio do Cliente</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Envie para clientes no WhatsApp ou coloque na Bio do Instagram. O cliente vê apenas o cardápio e monta o pedido.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 truncate select-all">
                    {clientUrl}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleCopy(clientUrl, 'client')}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20"
                  >
                    {copiedKey === 'client' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'client' ? 'Link Copiado!' : 'Copiar Link WhatsApp'}</span>
                  </button>
                  
                  <a
                    href={clientUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Cardápio</span>
                  </a>
                </div>
              </div>

              {/* CARD 2: BALCÃO / CAIXA */}
              <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-amber-400 transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      Operador • Caixa
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">2. Painel do Balcão</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Fica aberto no caixa. Recebe os pedidos com som, imprime cupons na impressora térmica e confirma pagamentos.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-amber-400 truncate select-all">
                    {counterUrl}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleCopy(counterUrl, 'counter')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20"
                  >
                    {copiedKey === 'counter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'counter' ? 'Link Copiado!' : 'Copiar Link Balcão'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('counter')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Monitor className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ir para o Balcão</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: COZINHA (KDS) */}
              <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-blue-400 transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      Produção • Cozinha
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">3. Monitor da Cozinha</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Fica na TV ou tablet da cozinha. Os pedidos caem aqui em colunas Kanban assim que o pagamento é confirmado.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-blue-400 truncate select-all">
                    {kitchenUrl}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleCopy(kitchenUrl, 'kitchen')}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-500 text-slate-950 font-black text-xs hover:bg-blue-400 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20"
                  >
                    {copiedKey === 'kitchen' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'kitchen' ? 'Link Copiado!' : 'Copiar Link Cozinha'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('kitchen')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ir para a Cozinha</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
