import React, { useState } from 'react';
import {
  Palette, Image, Sparkles, Check, Clock, DollarSign,
  Phone, MapPin, Store, AlertTriangle, Eye, Upload, CheckCircle2, Utensils
} from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';

const PRESET_COVERS = [
  {
    name: 'Burger & Chapa',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Pizzaria Forno à Lenha',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Gourmet Noturno',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'American Diner',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Bar & Grill Rústico',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
  }
];

const PRESET_LOGOS = [
  { name: 'Ícone Padrão', url: '' },
  { name: 'Burger Retrô', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { name: 'Pizza Artesanal', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Chama & Fogo', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=300&q=80' }
];

export const StoreCustomizationAdmin = () => {
  const { storeSettings, updateStoreSettings } = useOrder();

  const [formData, setFormData] = useState({
    restaurantName: storeSettings?.restaurantName || 'SDG Burger & Pizza',
    slogan: storeSettings?.slogan || 'Artesanais, Pizzas & Delivery no WhatsApp',
    logoUrl: storeSettings?.logoUrl || '',
    coverUrl: storeSettings?.coverUrl || PRESET_COVERS[0].url,
    themeColor: storeSettings?.themeColor || 'amber',
    isOpen: storeSettings?.isOpen !== false,
    closedMessage: storeSettings?.closedMessage || 'Estamos fechados no momento. Nosso horário de atendimento é de Terça a Domingo das 18h às 23h30.',
    deliveryTime: storeSettings?.deliveryTime || '30 - 45 min',
    deliveryFee: storeSettings?.deliveryFee !== undefined ? String(storeSettings.deliveryFee) : '7.00',
    freeDeliveryThreshold: storeSettings?.freeDeliveryThreshold !== undefined ? String(storeSettings.freeDeliveryThreshold) : '80.00',
    bannerNotice: storeSettings?.bannerNotice || '🔥 PROMOÇÃO: Frete Grátis em pedidos acima de R$ 80!',
    showBannerNotice: storeSettings?.showBannerNotice !== false,
    phoneSupport: storeSettings?.phoneSupport || '(11) 99999-8888',
    address: storeSettings?.address || 'Rua Principal do Delivery, 500 - Centro',
    openingHours: storeSettings?.openingHours || 'Terça a Domingo: 18:00 às 23:30'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const feeNum = parseFloat(String(formData.deliveryFee).replace(',', '.'));
    const freeNum = parseFloat(String(formData.freeDeliveryThreshold).replace(',', '.'));

    updateStoreSettings({
      ...formData,
      deliveryFee: isNaN(feeNum) ? 7.00 : feeNum,
      freeDeliveryThreshold: isNaN(freeNum) ? 0 : freeNum
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Identidade Visual & Experiência do Cliente</span>
          </div>
          <h2 className="text-2xl font-black text-white">Personalização do Cardápio Digital</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Personalize o nome da lanchonete, foto de capa, logo, avisos de promoção no topo e taxas de entrega.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0 self-start md:self-center active:scale-95"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Grid Principal: Formulário na Esquerda & Pré-Visualização na Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Configuração (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* GRUPO 1: IDENTIDADE DO ESTABELECIMENTO */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Store className="w-4 h-4 text-amber-400" />
              <span>1. Identidade do Restaurante</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Estabelecimento *</label>
              <input
                type="text"
                required
                value={formData.restaurantName}
                onChange={e => setFormData({ ...formData, restaurantName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 outline-none font-bold"
                placeholder="Ex: SDG Burger & Pizza"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Slogan ou Subtítulo</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                placeholder="Ex: Os melhores artesanais e pizzas da cidade no WhatsApp"
              />
            </div>

            {/* Imagem de Capa do Banner */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300">Foto de Capa do Cardápio (Banner)</label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
                placeholder="URL da foto de capa"
              />

              <span className="text-[10px] text-slate-500 font-bold block uppercase">Capas em Alta Resolução Prontas:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_COVERS.map((cov, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, coverUrl: cov.url })}
                    className={`relative h-14 rounded-xl overflow-hidden border text-left p-1.5 transition-all group ${
                      formData.coverUrl === cov.url
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={cov.url} alt={cov.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
                    <span className="relative z-10 text-[10px] font-black text-white line-clamp-1 self-end">
                      {cov.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logotipo */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300">Foto de Perfil / Logotipo (URL)</label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="URL do logotipo (ou deixe vazio para o ícone padrão)"
                />
              </div>
            </div>
          </div>

          {/* GRUPO 2: FAIXA DE AVISO / PROMOÇÃO NO TOPO */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>2. Faixa de Promoção no Topo do Cardápio</span>
            </h3>

            <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showBannerNotice}
                onChange={e => setFormData({ ...formData, showBannerNotice: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer accent-amber-500"
              />
              <div className="text-xs">
                <span className="font-extrabold text-white block">Exibir Faixa de Comunicado / Promoção</span>
                <span className="text-slate-400 text-[11px]">Aparece em destaque no topo da tela do cliente</span>
              </div>
            </label>

            {formData.showBannerNotice && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Texto do Comunicado / Promoção</label>
                <input
                  type="text"
                  value={formData.bannerNotice}
                  onChange={e => setFormData({ ...formData, bannerNotice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="Ex: 🔥 PROMOÇÃO: Frete Grátis em pedidos acima de R$ 80!"
                />
              </div>
            )}
          </div>

          {/* GRUPO 3: STATUS DA LOJA & REGRAS DE ENTREGA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>3. Status da Loja & Regras de Entrega</span>
            </h3>

            {/* Aberto ou Fechado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Status Atual do Delivery</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOpen: true })}
                  className={`py-3 px-4 rounded-2xl border font-black text-xs flex items-center justify-center space-x-2 transition-all ${
                    formData.isOpen
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>🟢 ABERTO AGORA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOpen: false })}
                  className={`py-3 px-4 rounded-2xl border font-black text-xs flex items-center justify-center space-x-2 transition-all ${
                    !formData.isOpen
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>🔴 FECHADO NO MOMENTO</span>
                </button>
              </div>
            </div>

            {!formData.isOpen && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mensagem de Loja Fechada para o Cliente</label>
                <textarea
                  rows={2}
                  value={formData.closedMessage}
                  onChange={e => setFormData({ ...formData, closedMessage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-rose-500 outline-none resize-none"
                />
              </div>
            )}

            {/* Prazos e Taxas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tempo Médio</label>
                <input
                  type="text"
                  value={formData.deliveryTime}
                  onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="Ex: 30 - 45 min"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Taxa Entrega (R$)</label>
                <input
                  type="text"
                  value={formData.deliveryFee}
                  onChange={e => setFormData({ ...formData, deliveryFee: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  placeholder="7,00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Frete Grátis Acima (R$)</label>
                <input
                  type="text"
                  value={formData.freeDeliveryThreshold}
                  onChange={e => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:border-emerald-500 outline-none font-bold"
                  placeholder="80,00"
                />
              </div>
            </div>

            {/* WhatsApp e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp de Suporte / Contato</label>
                <input
                  type="text"
                  value={formData.phoneSupport}
                  onChange={e => setFormData({ ...formData, phoneSupport: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="(11) 99999-8888"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Horário de Funcionamento</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                  placeholder="Terça a Domingo das 18h às 23h30"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Salvar Todas as Personalizações</span>
          </button>
        </form>

        {/* Mockup de Pré-visualização ao Vivo (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Pré-Visualização do Cliente</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">Atualização em tempo real</span>
            </div>

            {/* Cartão Mockup */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
              
              {/* Promoção Marquee */}
              {formData.showBannerNotice && formData.bannerNotice && (
                <div className="bg-amber-500 text-slate-950 font-black text-[10px] py-1.5 px-3 text-center tracking-wide flex items-center justify-center space-x-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">{formData.bannerNotice}</span>
                </div>
              )}

              {/* Foto de Capa */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                <img
                  src={formData.coverUrl || PRESET_COVERS[0].url}
                  alt="Capa"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                <div className="absolute top-2.5 right-2.5">
                  {formData.isOpen ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow">
                      ABERTO AGORA
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[9px] shadow">
                      FECHADO
                    </span>
                  )}
                </div>
              </div>

              {/* Perfil & Info */}
              <div className="p-4 pt-0 -mt-8 relative space-y-3">
                <div className="flex items-end space-x-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center shrink-0 p-1">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="pb-0.5">
                    <div className="flex items-center space-x-1">
                      <h4 className="text-base font-black text-white leading-tight">
                        {formData.restaurantName || 'Nome do Delivery'}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {formData.slogan || 'Slogan ou descrição da sua loja'}
                    </p>
                  </div>
                </div>

                {/* Métricas do Mockup */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    ⭐ 4.9
                  </div>
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    🕒 {formData.deliveryTime || '30 - 45 min'}
                  </div>
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    🛵 {formData.deliveryFee ? `R$ ${formData.deliveryFee}` : 'Grátis'}
                  </div>
                </div>

                {!formData.isOpen && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span className="line-clamp-2">{formData.closedMessage}</span>
                  </div>
                )}
              </div>

            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-amber-400 block">💡 Dica do Delivery:</span>
              <p className="text-[11px] leading-relaxed">
                Fotos atraentes de capa e banners promocionais de frete grátis podem aumentar as conversões de pedidos em até 35%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
