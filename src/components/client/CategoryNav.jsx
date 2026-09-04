import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import { Utensils, Hamburger, Pizza, CupSoda, IceCream, Zap } from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Ham: Hamburger || Utensils,
  Pizza,
  CupSoda,
  IceCream,
  Zap
};

export const CategoryNav = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none mb-6">
      {CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Utensils;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border ${
              isActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
