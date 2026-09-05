import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ORDERS } from '../data/mockData';

const OrderContext = createContext();

const BROADCAST_CHANNEL_NAME = 'sdg_delivery_sync_channel';
const LOCAL_STORAGE_KEY = 'sdg_delivery_orders_v1';

// Web Audio API ding-dong notification sound generator (Anota AI style)
const playAlertSound = (type = 'new_order') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'new_order') {
      // Ding-dong chord (E5 then B5)
      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(659.25, 0, 0.4);      // E5
      playTone(880.00, 0.25, 0.6);    // A5
    } else {
      // Quick confirmation blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

const getViewFromUrl = () => {
  if (typeof window === 'undefined') return 'client';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  const query = new URLSearchParams(window.location.search).get('view');
  
  const target = (query || hash || path).toLowerCase();
  if (target.includes('balcao') || target.includes('caixa') || target.includes('counter') || target.includes('gestor')) return 'counter';
  if (target.includes('cozinha') || target.includes('kds') || target.includes('kitchen')) return 'kitchen';
  if (target.includes('admin') || target.includes('painel') || target.includes('links')) return 'admin';
  return 'client';
};

export const OrderProvider = ({ children }) => {
  const [currentView, setCurrentViewState] = useState(getViewFromUrl);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState([]);
  const [printTicket, setPrintTicket] = useState(null);

  // Sync state with URL
  const setCurrentView = (view) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      let newPath = '/';
      if (view === 'counter') newPath = '/balcao';
      else if (view === 'kitchen') newPath = '/cozinha';
      else if (view === 'admin') newPath = '/admin';
      
      if (window.location.pathname !== newPath) {
        window.history.pushState({ view }, '', newPath);
      }
    }
  };

  // Listen to browser navigation (Back / Forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentViewState(getViewFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save to localStorage & Broadcast to other tabs
  const saveAndSyncOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newOrders));
    
    if (window.BroadcastChannel) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: 'SYNC_ORDERS', data: newOrders });
        channel.close();
      } catch (e) {
        console.error('BroadcastChannel error', e);
      }
    }
  };

  // Listen to cross-tab updates via BroadcastChannel or storage event
  useEffect(() => {
    let channel;
    if (window.BroadcastChannel) {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_ORDERS') {
          setOrders(event.data.data);
          playAlertSound('new_order'); // Play Anota AI ding-dong when synced order arrives
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Cart operations
  const addToCart = (product, quantity = 1, selectedOptions = [], observation = '') => {
    const optionExtraTotal = selectedOptions.reduce((acc, opt) => acc + (opt.price || 0), 0);
    const unitPriceWithExtras = product.price + optionExtraTotal;

    const newItem = {
      id: product.id,
      name: product.name,
      quantity,
      price: product.price,
      selectedOptions: selectedOptions.map(o => o.name || o),
      unitPriceWithExtras,
      subtotal: unitPriceWithExtras * quantity,
      observation
    };

    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      item.quantity = newQty;
      item.subtotal = item.unitPriceWithExtras * newQty;
      return updated;
    });
  };

  const clearCart = () => setCart([]);

  // Create new order from client
  const createOrder = (customerDetails) => {
    const total = cart.reduce((acc, item) => acc + item.subtotal, 0) + (customerDetails.deliveryType === 'delivery' ? 7.00 : 0);
    
    const newOrder = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      deliveryType: customerDetails.deliveryType, // 'delivery' | 'takeout'
      address: customerDetails.address || 'Retirada no Balcão',
      paymentMethod: customerDetails.paymentMethod,
      status: 'aguardando_pagamento',
      total,
      observation: customerDetails.observation || '',
      items: [...cart]
    };

    const updatedOrders = [newOrder, ...orders];
    saveAndSyncOrders(updatedOrders);
    clearCart();
    playAlertSound('confirm');

    return newOrder;
  };

  // Update order status (Balcão or Cozinha action)
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });

    saveAndSyncOrders(updatedOrders);

    // Audio cue
    if (newStatus === 'pagamento_confirmado') {
      playAlertSound('new_order'); // Notification for kitchen
    } else if (newStatus === 'pronto') {
      playAlertSound('confirm'); // High chime for ready order
    }
  };

  // Thermal printing trigger helper
  const triggerPrintTicket = (order, type = 'counter') => {
    setPrintTicket({ order, type });
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const closePrintTicket = () => setPrintTicket(null);

  return (
    <OrderContext.Provider value={{
      currentView,
      setCurrentView,
      orders,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      printTicket,
      triggerPrintTicket,
      closePrintTicket
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder deve ser usado dentro de um OrderProvider');
  }
  return context;
};
