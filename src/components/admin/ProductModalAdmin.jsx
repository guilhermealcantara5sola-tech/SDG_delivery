import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sparkles, Image, DollarSign, Tag, Utensils } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PRESET_IMAGES = [
  { label: 'Smash Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Burger Gourmet', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pizza Pepperoni', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pizza Queijo', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
  { label: 'Batata Frita', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80' },
  { label: 'Refrigerante / Bebida', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sobremesa', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80' }
];

export const ProductModalAdmin = ({ isOpen, product, categories, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: 'burgers',
    price: '',
    description: '',
    image: '',
    badge: '',
    isActive: true,
    options: []
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        categoryId: product.categoryId || 'burgers',
        price: product.price ? String(product.price) : '',
        description: product.description || '',
        image: product.image || PRESET_IMAGES[0].url,
        badge: product.badge || '',
        isActive: product.isActive !== false,
        options: product.options || []
      });
    } else {
      setFormData({
        id: `p_${Date.now()}`,
        name: '',
        categoryId: categories && categories.length > 1 ? categories[1].id : 'burgers',
        price: '',
        description: '',
        image: PRESET_IMAGES[0].url,
        badge: '',
        isActive: true,
        options: []
      });
    }
    setConfirmDelete(false);
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Por favor, informe o nome do produto.');
    const priceNum = parseFloat(String(formData.price).replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) return alert('Por favor, informe um preço válido.');

    onSave({
      ...formData,
      name: formData.name.trim(),
      price: priceNum,
      description: formData.description.trim(),
      badge: formData.badge.trim()
    });
    onClose();
  };

  const isEditing = Boolean(product && product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isEditing ? 'Editar Item do Cardápio' : 'Novo Item no Cardápio'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? `Atualizando informações de ${formData.name || 'item'}` : 'Cadastre um novo lanche, pizza ou bebida'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Nome do Item *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cheddar Bacon Master"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Categoria *
              </label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 outline-none font-semibold"
              >
                {(categories || []).filter(c => c.id !== 'todos').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preço e Destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Preço (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                <input
                  type="text"
                  required
                  placeholder="29,90"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white font-black placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Selo de Destaque (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Mais Pedido, Gourmet, Promo"
                value={formData.badge}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Descrição dos Ingredientes
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pão brioche tostado, 2 carnes smash 90g, queijo cheddar cremoso..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase">
              Foto do Produto (URL)
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                <img
                  src={formData.image || PRESET_IMAGES[0].url}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PRESET_IMAGES[0].url; }}
                />
              </div>
              <input
                type="url"
                placeholder="Cole a URL da foto ou selecione uma abaixo"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none truncate"
              />
            </div>

            {/* Sugestões de Fotos Rápidas */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Fotos Prontas Rápidas:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: img.url })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      formData.image === img.url
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Disponibilidade (Ativo / Pausado) */}
          <div className="pt-2">
            <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
              />
              <div className="text-xs">
                <span className="font-extrabold text-white block">
                  {formData.isActive ? '🟢 Item Disponível no Cardápio' : '🔴 Item Esgotado / Pausado'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {formData.isActive ? 'Os clientes podem pedir normalmente' : 'Fica oculto do cardápio até ser reativado'}
                </span>
              </div>
            </label>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          {isEditing && (
            confirmDelete ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onDelete(formData.id)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md"
                >
                  Confirmar Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center space-x-1.5 transition-all"
                title="Excluir este produto do cardápio"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            )
          )}

          <div className="flex items-center space-x-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Item'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
