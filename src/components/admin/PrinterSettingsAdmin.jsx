import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import {
  Printer, CheckCircle2, AlertCircle, RefreshCw,
  ChefHat, Store, Settings, Wifi, HelpCircle, FileText, Check
} from 'lucide-react';

export const PrinterSettingsAdmin = () => {
  const {
    printerSettings,
    updatePrinterConfig,
    printerStatus,
    checkPrinterConnection,
    printTestTicket
  } = useOrder();

  const [formData, setFormData] = useState({
    ip: printerSettings?.ip || '192.168.1.150',
    port: printerSettings?.port || 9100,
    enabled: printerSettings?.enabled !== false,
    mode: printerSettings?.mode || 'network',
    autoPrintKitchenOnConfirm: printerSettings?.autoPrintKitchenOnConfirm !== false,
    autoPrintCounterOnConfirm: printerSettings?.autoPrintCounterOnConfirm !== false,
    autoPrintIncomingKitchen: !!printerSettings?.autoPrintIncomingKitchen,
    cutPaper: printerSettings?.cutPaper !== false,
    beepOnPrint: !!printerSettings?.beepOnPrint,
    serviceUrl: printerSettings?.serviceUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    updatePrinterConfig(formData);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    await printTestTicket();
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header com Status em Tempo Real */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Impressora Térmica Não-Fiscal</span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center space-x-2.5">
              <Printer className="w-7 h-7 text-amber-400" />
              <span>Integração Elgin i8 / Rede Ethernet</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Imprima comandas de <b>Cozinha</b> e comprovantes de <b>Balcão</b> diretamente na sua impressora Elgin através da rede local.
            </p>
          </div>

          {/* Status Badge & Test Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className={`w-3.5 h-3.5 rounded-full ${
                printerStatus?.online
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse'
                  : printerStatus?.checking
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500 shadow-lg shadow-rose-500/50'
              }`}></span>
              <div>
                <div className="text-xs font-black text-white">
                  {printerStatus?.online
                    ? '🟢 Elgin i8 Conectada'
                    : printerStatus?.checking
                    ? '🟡 Testando Conexão...'
                    : '🔴 Elgin Desconectada'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {formData.ip}:{formData.port} (Porta RAW ESC/POS)
                </div>
              </div>
            </div>

            <button
              onClick={() => checkPrinterConnection()}
              disabled={printerStatus?.checking}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2 disabled:opacity-50"
              title="Testar comunicação com o IP da impressora"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${printerStatus?.checking ? 'animate-spin' : ''}`} />
              <span>Verificar Conexão</span>
            </button>

            <button
              onClick={handleTestPrint}
              disabled={isTesting}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isTesting ? 'Imprimindo...' : 'Imprimir Teste'}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Coluna 1: Dados de Rede */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>Parâmetros de Rede da Elgin</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Endereço IP da Impressora na Rede Local:
              </label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => handleChange('ip', e.target.value.trim())}
                placeholder="192.168.1.150"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                IP fixo definido na impressora Elgin i8 (ex: <code className="text-amber-400 font-mono">192.168.1.150</code>).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Porta RAW (ESC/POS):
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => handleChange('port', Number(e.target.value))}
                  placeholder="9100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Padrão Elgin: <b>9100</b>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Modo de Envio:
                </label>
                <select
                  value={formData.mode}
                  onChange={(e) => handleChange('mode', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="network">Direto na Rede (ESC/POS)</option>
                  <option value="browser">Diálogo do Navegador</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {formData.mode === 'network' ? 'Sem telas nem cliques adicionais' : 'Abre janela de impressão'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                URL do Servidor de Impressão (Opcional):
              </label>
              <input
                type="text"
                value={formData.serviceUrl}
                onChange={(e) => handleChange('serviceUrl', e.target.value.trim())}
                placeholder="http://localhost:3001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Deixe em branco para usar a integração nativa do sistema.
              </p>
            </div>
          </div>

          {/* Coluna 2: Automações e Papel */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Automações de Cozinha & Balcão</span>
            </h3>

            <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              {/* Toggle Cozinha no Balcão */}
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.autoPrintKitchenOnConfirm}
                  onChange={(e) => handleChange('autoPrintKitchenOnConfirm', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-blue-400" />
                    <span>Imprimir Cozinha ao Confirmar Pagamento no Caixa</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quando o caixa confirma o pagamento do cliente, a comanda da cozinha é impressa e cortada na Elgin i8.
                  </p>
                </div>
              </label>

              {/* Toggle Balcão */}
              <label className="flex items-start space-x-3 cursor-pointer select-none pt-2 border-t border-slate-800/80">
                <input
                  type="checkbox"
                  checked={formData.autoPrintCounterOnConfirm}
                  onChange={(e) => handleChange('autoPrintCounterOnConfirm', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span>Imprimir Cupom do Balcão/Cliente ao Confirmar Pagamento</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Emite o recibo do cliente com valor total, itens e forma de pagamento.
                  </p>
                </div>
              </label>

              {/* Toggle Corte de Papel */}
              <label className="flex items-start space-x-3 cursor-pointer select-none pt-2 border-t border-slate-800/80">
                <input
                  type="checkbox"
                  checked={formData.cutPaper}
                  onChange={(e) => handleChange('cutPaper', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Acionar Guilhotina de Corte Automático</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Envia o comando ESC/POS <code className="text-amber-400 font-mono">GS V 66 0</code> para corte parcial do papel após cada comanda.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Botão Salvar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Configurações salvas e aplicadas com sucesso!</span>
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2 active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>

      </div>

      {/* Manual de Operação & Dicas Rápidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-black text-white flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Como Funciona a Impressão Térmica Elgin i8 na Rede</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-extrabold text-amber-400 flex items-center space-x-1.5">
              <ChefHat className="w-4 h-4" />
              <span>1. Comanda da Cozinha</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Formatada especialmente para a equipe de produção: itens e quantidades ampliadas, sem valores monetários, com destaque especial para adicionais e observações.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-extrabold text-emerald-400 flex items-center space-x-1.5">
              <Store className="w-4 h-4" />
              <span>2. Cupom do Balcão</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Contém todos os dados fiscais simples/não-fiscal: dados do cliente, endereço de entrega, detalhamento de preços, taxa de entrega, subtotal, total e forma de pagamento.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-extrabold text-blue-400 flex items-center space-x-1.5">
              <Wifi className="w-4 h-4" />
              <span>3. Comunicação RAW 9100</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Os comandos são transmitidos diretamente pela porta 9100 da sua Elgin i8 via socket TCP de alta velocidade, cortando o papel automaticamente na guilhotina.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
