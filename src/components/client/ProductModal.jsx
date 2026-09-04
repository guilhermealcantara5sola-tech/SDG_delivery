import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useOrder } from '../../context/OrderContext';

export const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [observation, setObservation] = useState('');

  if (!product) return null;

  const handleOptionToggle = (optionGroup, item) => {
    if (optionGroup.type === 'radio') {
      // Remove previous selection from same group
      const otherGroupItemsNames = optionGroup.items.map(i => i.name);
      setSelectedOptions(prev => [...prev.filter(i => !otherGroupItemsNames.includes(i.name)), item]);
    } else {
      // Checkbox multi-select toggle
      const exists = selectedOptions.some(i => i.name === item.name);
      if (exists) {
        setSelectedOptions(prev => prev.filter(i => i.name !== item.name));
      } else {
        setSelectedOptions(prev => [...prev, item]);
      }
    }
  };

  const optionExtraTotal = selectedOptions.reduce((acc, opt) => acc + (opt.price || 0), 0);
  const unitPrice = product.price + optionExtraTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions, observation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-slate-950/80 text-slate-300 rounded-full flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative h-56 w-full bg-slate-950">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h2 className="text-2xl font-extrabold text-white">{product.name}</h2>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{product.description}</p>
            <div className="text-amber-400 font-extrabold text-xl mt-3">
              {formatCurrency(product.price)}
            </div>
          </div>

          {/* Options Groups */}
          {product.options && product.options.map((group, idx) => (
            <div key={idx} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-200">{group.name}</h4>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {group.type === 'radio' ? 'Escolha 1 opção' : 'Opcional'}
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((item, itemIdx) => {
                  const isSelected = selectedOptions.some(i => i.name === item.name);
                  return (
                    <div
                      key={itemIdx}
                      onClick={() => handleOptionToggle(group, item)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all text-xs font-semibold ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{item.name}</span>
                      </div>

                      {item.price > 0 && (
                        <span className="text-amber-400 font-bold">+ {formatCurrency(item.price)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Observation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Observações do Pedido
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Tirar cebola, maionese à parte, caprichar no molho..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-slate-400 hover:text-white p-1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-white text-sm w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-slate-400 hover:text-white p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar ao Pedido</span>
            </div>
            <span>{formatCurrency(totalPrice)}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
