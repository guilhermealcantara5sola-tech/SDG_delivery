import React, { useState } from 'react';
import { PRODUCTS } from '../../data/mockData';
import { HeaderBanner } from './HeaderBanner';
import { CategoryNav } from './CategoryNav';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { CartDrawer } from './CartDrawer';
import { OrderStatusModal } from './OrderStatusModal';
import { useOrder } from '../../context/OrderContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ClientView = () => {
  const { cart } = useOrder();
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderTrack, setActiveOrderTrack] = useState(null);

  // Filter products by category and search term
  const filteredProducts = PRODUCTS.filter(prod => {
    const matchesCategory = activeCategory === 'todos' || prod.categoryId === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartQty = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartValue = cart.reduce((acc, i) => acc + i.subtotal, 0);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner */}
        <HeaderBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Category Navbar */}
        <CategoryNav
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
            <p className="text-slate-400 text-sm font-medium">Nenhum produto encontrado para sua busca.</p>
            <button
              onClick={() => { setActiveCategory('todos'); setSearchQuery(''); }}
              className="text-amber-400 text-xs font-bold hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </div>

      {/* Floating Bottom Cart Bar for Mobile */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold p-4 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center justify-between transition-transform active:scale-95 animate-bounce-subtle"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center text-xs font-extrabold">
                {totalCartQty}
              </div>
              <div className="text-left">
                <div className="text-xs uppercase font-bold text-slate-950/80">Ver Carrinho</div>
                <div className="text-sm font-black">{formatCurrency(totalCartValue)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs font-black">
              <span>Finalizar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Options Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={(order) => setActiveOrderTrack(order)}
      />

      {/* Live Order Status Tracker */}
      {activeOrderTrack && (
        <OrderStatusModal
          order={activeOrderTrack}
          onClose={() => setActiveOrderTrack(null)}
        />
      )}
    </div>
  );
};
