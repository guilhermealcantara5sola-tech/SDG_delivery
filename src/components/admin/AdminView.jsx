import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, GitBranch, Globe, Sparkles, Smartphone, Monitor, ChefHat, ShieldCheck } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export const AdminView = () => {
  const { setCurrentView } = useOrder();
  const [copiedKey, setCopiedKey] = useState(null);
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-restaurante.vercel.app';

  const clientUrl = `${originUrl}/`;
  const counterUrl = `${originUrl}/balcao`;
  const kitchenUrl = `${originUrl}/cozinha`;

  const handleCopy = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Painel de Acesso & Links Separados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Central de Links do Restaurante</h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Cada área possui seu link exclusivo. O cliente tem acesso apenas ao cardápio digital (estilo Anota Aí), enquanto o Balcão e a Cozinha operam em telas dedicadas.
          </p>
        </div>

        {/* 3 DEDICATED LINK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD 1: CLIENTE (CARDÁPIO) */}
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-emerald-400 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Público • Clientes
                </span>
                <h2 className="text-lg font-black text-white mt-1">1. Cardápio do Cliente</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Envie no WhatsApp e coloque na Bio do Instagram. O cliente vê apenas o cardápio e faz o pedido (sem abas internas).
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
                <span>Abrir em Nova Aba</span>
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
                  Privado • Operador Caixa
                </span>
                <h2 className="text-lg font-black text-white mt-1">2. Painel do Balcão</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fica aberto no computador do caixa. Recebe o pedido, permite imprimir na impressora térmica e confirmar o pagamento.
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
                <span>{copiedKey === 'counter' ? 'Link Copiado!' : 'Copiar Link do Balcão'}</span>
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
                  Privado • Produção
                </span>
                <h2 className="text-lg font-black text-white mt-1">3. Monitor da Cozinha</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fica aberto na TV ou tablet da cozinha. Os pedidos caem aqui assim que o caixa confirma o pagamento.
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
                <span>{copiedKey === 'kitchen' ? 'Link Copiado!' : 'Copiar Link da Cozinha'}</span>
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

        {/* SECTION 2: VERCEL & GIT DEPLOYMENT GUIDE */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <span>Como Subir no Git e Fazer Deploy na Vercel</span>
          </h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-amber-400 text-sm">Passo 1: Subir o Projeto para o GitHub</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono">
                <li>git init</li>
                <li>git add .</li>
                <li>git commit -m "Initial delivery app"</li>
                <li>git branch -M main</li>
                <li>git remote add origin https://github.com/seu-usuario/sdg-delivery.git</li>
                <li>git push -u origin main</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="font-extrabold text-emerald-400 text-sm">Passo 2: Fazer Deploy Grátis na Vercel</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">vercel.com</a> e faça login com sua conta do GitHub.</li>
                <li>Clique em <strong>"Add New..." -&gt; "Project"</strong>.</li>
                <li>Selecione o repositório <strong>sdg-delivery</strong>.</li>
                <li>A Vercel detectará automaticamente o framework Vite. Clique em <strong>"Deploy"</strong>.</li>
                <li>Pronto! Em 30 segundos seu link público estará online com SSL gratuito.</li>
              </ol>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
