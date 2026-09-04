import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, GitBranch, Globe, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

export const AdminView = () => {
  const { setCurrentView } = useOrder();
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-app.vercel.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configurações & Deploy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Compartilhar & Publicar na Vercel</h1>
          <p className="text-slate-400 text-sm">
            Envie este link no WhatsApp para seus clientes abrirem o cardápio digital e fazerem pedidos diretamente no balcão e na cozinha!
          </p>
        </div>

        {/* SECTION 1: WHATSAPP LINK SHARE */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <span>Link Direto do Cardápio para Clientes</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-sm font-mono text-amber-400 font-bold px-3 py-2 flex-1 outline-none select-all"
            />
            
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copiado!' : 'Copiar Link WhatsApp'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setCurrentView('client')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Testar como Cliente (Mobile)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Abre a visão do cardápio digital como se o cliente tivesse clicado no WhatsApp.
              </p>
            </button>

            <button
              onClick={() => setCurrentView('counter')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <ExternalLink className="w-4 h-4" />
                <span>Testar como Caixa / Balcão</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Abre a tela do operador do caixa para confirmar o pagamento e imprimir a comanda.
              </p>
            </button>
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
