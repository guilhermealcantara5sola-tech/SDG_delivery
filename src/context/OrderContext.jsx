import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ORDERS } from '../data/mockData';

const OrderContext = createContext();

const BROADCAST_CHANNEL_NAME = 'sdg_delivery_sync_channel';
const LOCAL_STORAGE_KEY = 'sdg_delivery_orders_v1';

// Web Audio API beep sound generator
const playAlertSound = (frequency = 587.33, type = 'sine') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

export const OrderProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('client'); // 'client' | 'counter' | 'kitchen' | 'admin'
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState([]);
  const [printTicket, setPrintTicket] = useState(null);

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
          playAlertSound(783.99); // Play subtle chime when synced order arrives
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
    playAlertSound(880);

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
      playAlertSound(659.25); // Notification for kitchen
    } else if (newStatus === 'pronto') {
      playAlertSound(1046.50); // High chime for ready order
    }
  };

  // Thermal printing trigger helper
  const triggerPrintTicket = (order, type = 'counter') => {
    setPrintTicket({ order, type });
    setTimeout(() => {
      window.print();
    }, 100);
  };

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
      triggerPrintTicket
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
