import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import { Utensils, Sandwich, Pizza, CupSoda, IceCream, Zap } from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Ham: Sandwich,
  Pizza,
  CupSoda,
  IceCream,
  Zap
};

export const CategoryNav = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-800/80 mb-6 shadow-xl transition-all">
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Utensils;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border flex-shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white hover:border-slate-700'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
