import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProductCard = ({ product, onSelectProduct }) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>{product.badge}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold">A partir de</span>
            <div className="text-lg font-extrabold text-amber-400">
              {formatCurrency(product.price)}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Montar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
