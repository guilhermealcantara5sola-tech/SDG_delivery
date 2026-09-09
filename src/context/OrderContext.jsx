import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_ORDERS, PRODUCTS, CATEGORIES } from '../data/mockData';
import {
  isSupabaseConfigured,
  getSupabaseConfig
} from '../services/supabase';
import {
  fetchOrdersFromDb,
  insertOrderInDb,
  updateOrderStatusInDb,
  updateOrderInDb,
  subscribeToOrdersRealtime,
  saveCustomerProfile,
  loginCustomerByPin,
  fetchCustomerOrdersFromDb,
  fetchProductsFromDb,
  saveProductInDb,
  deleteProductInDb,
  toggleProductActiveInDb,
  updateCustomerInDb,
  fetchStoreSettingsFromDb,
  saveStoreSettingsToDb
} from '../services/orderService';
import { applyThemeToDocument } from '../utils/theme';

const OrderContext = createContext();

const BROADCAST_CHANNEL_NAME = 'sdg_delivery_sync_channel';
const LOCAL_STORAGE_KEY = 'sdg_delivery_orders_v1';
const PRODUCTS_STORAGE_KEY = 'sdg_delivery_products_v1';
const SETTINGS_STORAGE_KEY = 'sdg_delivery_settings_v1';

export const DEFAULT_STORE_SETTINGS = {
  restaurantName: 'SDG Burger & Pizza',
  slogan: 'Artesanais, Pizzas & Delivery no WhatsApp',
  logoUrl: '',
  coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  themePreset: 'amber', // 'amber' | 'rose' | 'orange' | 'emerald' | 'purple' | 'blue' | 'pink' | 'dark' | 'custom'
  primaryColor: '#f59e0b',
  secondaryColor: '#ea580c',
  isOpen: true,
  closedMessage: 'No momento estamos fechados. Nosso horário de atendimento é de Terça a Domingo das 18h às 23h30.',
  deliveryTime: '30 - 45 min',
  deliveryFee: 7.00,
  freeDeliveryThreshold: 80.00,
  bannerNotice: '🔥 PROMOÇÃO: Frete Grátis em pedidos acima de R$ 80!',
  showBannerNotice: true,
  phoneSupport: '(11) 99999-8888',
  whatsapp: '(11) 99999-8888',
  whatsappMessage: 'Olá! Vim pelo cardápio digital e gostaria de tirar uma dúvida.',
  showFloatingWhatsApp: true,
  instagram: '@sdgdelivery',
  address: 'Rua Principal do Delivery, 500 - Centro',
  openingHours: 'Terça a Domingo: 18:00 às 23:30'
};

// Web Audio API ding-dong notification sound generator (Anota AI style)
const playAlertSound = (type = 'new_order') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'new_order') {
      // Ding-dong chord (E5 then A5)
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

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRODUCTS;
  });

  const [cart, setCart] = useState([]);
  const [printTicket, setPrintTicket] = useState(null);

  // Configurações e Personalização da Loja / Cardápio
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Aplica cores do tema (CSS variables) dinamicamente no documento
  useEffect(() => {
    applyThemeToDocument(storeSettings?.primaryColor, storeSettings?.secondaryColor);
  }, [storeSettings?.primaryColor, storeSettings?.secondaryColor]);

  // Carrega configurações da loja do Supabase na inicialização
  useEffect(() => {
    fetchStoreSettingsFromDb().then(res => {
      if (res.data && typeof res.data === 'object') {
        setStoreSettings(prev => {
          const merged = { ...prev, ...res.data };
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }).catch(console.error);
  }, []);

  const updateStoreSettings = (newSettings) => {
    setStoreSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

      if (window.BroadcastChannel) {
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'SYNC_SETTINGS', data: updated });
          channel.close();
        } catch (e) {}
      }

      applyThemeToDocument(updated.primaryColor, updated.secondaryColor);
      saveStoreSettingsToDb(updated).catch(console.error);

      return updated;
    });
    playAlertSound('confirm');
  };

  // Sessão do Cliente (Login com 6 dígitos e Fidelidade)
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('sdg_customer_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const saveCustomerSession = (customerData) => {
    setCustomer(customerData);
    if (customerData) {
      localStorage.setItem('sdg_customer_session', JSON.stringify(customerData));
    } else {
      localStorage.removeItem('sdg_customer_session');
    }
  };

  const loginCustomer = async (phone, pin) => {
    const res = await loginCustomerByPin(phone, pin);
    if (res.customer) {
      saveCustomerSession(res.customer);
      return { success: true, customer: res.customer };
    }
    return { success: false, error: res.error?.message || 'Falha ao autenticar' };
  };

  const registerCustomer = async ({ name, phone, pin, address }) => {
    const res = await saveCustomerProfile({ name, phone, address, pin });
    const newCustomer = {
      id: res.data?.id || `cust-${Date.now()}`,
      name,
      phone,
      address,
      pin,
      total_orders: 1
    };
    saveCustomerSession(newCustomer);
    return { success: true, customer: newCustomer };
  };

  const logoutCustomer = () => {
    saveCustomerSession(null);
  };

  const updateCustomerAddress = async (newAddress) => {
    if (!customer) return;
    const updated = { ...customer, address: newAddress };
    saveCustomerSession(updated);
    saveCustomerProfile({
      name: updated.name,
      phone: updated.phone,
      address: newAddress,
      pin: updated.pin
    }).catch(console.error);
  };

  // Pedir Novamente: Reinsere os itens do pedido anterior no carrinho
  const reorder = (order) => {
    if (!order || !order.items || order.items.length === 0) return false;
    setCart(prev => {
      const clonedItems = order.items.map(item => ({
        ...item,
        subtotal: (item.unitPriceWithExtras || item.price) * item.quantity
      }));
      return [...prev, ...clonedItems];
    });
    playAlertSound('confirm');
    return true;
  };

  // Database Connection State ('local' | 'connecting' | 'connected' | 'error')
  const [dbStatus, setDbStatus] = useState(() => isSupabaseConfigured() ? 'connecting' : 'local');
  const [dbVersion, setDbVersion] = useState(0);

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

  // Save to localStorage & Broadcast to other tabs on same machine
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
          playAlertSound('new_order');
        } else if (event.data && event.data.type === 'SYNC_SETTINGS') {
          setStoreSettings(event.data.data);
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
      } else if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          setStoreSettings(JSON.parse(e.newValue));
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

  // Fetch orders from Supabase on start or when dbVersion triggers reconnect
  const loadOrdersFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDbStatus('local');
      return;
    }

    setDbStatus('connecting');
    const { data, error } = await fetchOrdersFromDb();

    if (!error && data) {
      setOrders(data);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setDbStatus('connected');
    } else {
      console.warn('Aviso: Não foi possível sincronizar com o Supabase. Utilizando armazenamento local.', error);
      setDbStatus('error');
    }
  }, []);

  // Fetch products from Supabase
  const loadProductsFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await fetchProductsFromDb();
      if (!error && data && data.length > 0) {
        setProducts(data);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Erro ao sincronizar produtos do Supabase:', err);
    }
  }, []);

  useEffect(() => {
    loadOrdersFromSupabase();
    loadProductsFromSupabase();
  }, [loadOrdersFromSupabase, loadProductsFromSupabase, dbVersion]);

  // Subscribe to Supabase Realtime changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const unsubscribe = subscribeToOrdersRealtime({
      onInsert: (newOrder) => {
        setOrders(prev => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
          const updated = [newOrder, ...prev];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        playAlertSound('new_order');
      },
      onUpdate: (updatedOrder) => {
        setOrders(prev => {
          const existing = prev.find(o => o.id === updatedOrder.id);
          if (existing && existing.status !== updatedOrder.status) {
            if (updatedOrder.status === 'pagamento_confirmado') {
              playAlertSound('new_order');
            } else if (updatedOrder.status === 'pronto') {
              playAlertSound('confirm');
            }
          }
          const updated = prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      },
      onDelete: (deletedId) => {
        setOrders(prev => {
          const updated = prev.filter(o => o.id !== deletedId);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [dbVersion]);

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

  // Create new order from client (saves to local state and Supabase DB)
  const createOrder = (customerDetails) => {
    const itemsSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const isFree = storeSettings.freeDeliveryThreshold > 0 && itemsSubtotal >= storeSettings.freeDeliveryThreshold;
    const deliveryFee = customerDetails.deliveryType === 'delivery'
      ? (isFree ? 0 : (Number(storeSettings.deliveryFee) || 7.00))
      : 0;
    const total = itemsSubtotal + deliveryFee;
    
    const newOrder = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    // 1. Immediate optimistic local state update
    const updatedOrders = [newOrder, ...orders.filter(o => o.id !== newOrder.id)];
    saveAndSyncOrders(updatedOrders);
    clearCart();
    playAlertSound('confirm');

    // Se o cliente estiver logado, atualiza o contador de pedidos dele localmente
    if (customer) {
      const updatedCust = {
        ...customer,
        total_orders: (Number(customer.total_orders) || 0) + 1,
        address: customerDetails.deliveryType === 'delivery' ? (customerDetails.address || customer.address) : customer.address
      };
      saveCustomerSession(updatedCust);
    }

    // 2. Persist to Supabase Database if configured
    if (isSupabaseConfigured()) {
      insertOrderInDb(newOrder).catch(err => {
        console.warn('Aviso: Erro ao persistir pedido no Supabase, salvo localmente:', err);
      });
    }

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

    // Persist status change to Supabase Database
    if (isSupabaseConfigured()) {
      updateOrderStatusInDb(orderId, newStatus).catch(err => {
        console.warn('Aviso: Erro ao atualizar status no Supabase:', err);
      });
    }
  };

  // Editar Pedido completo (Balcão ou Admin: itens, cliente, pagamento, observações, etc.)
  const editOrder = (updatedOrder) => {
    // Recalcular totais com base nos itens
    const itemsTotal = (updatedOrder.items || []).reduce((acc, item) => {
      const unitPrice = Number(item.unitPriceWithExtras || item.price) || 0;
      const qty = Number(item.quantity) || 1;
      const itemSubtotal = item.subtotal !== undefined ? Number(item.subtotal) : unitPrice * qty;
      return acc + itemSubtotal;
    }, 0);

    const deliveryFee = updatedOrder.deliveryType === 'delivery' ? 7.00 : 0;
    const recalculatedTotal = itemsTotal + deliveryFee;

    const orderToSave = {
      ...updatedOrder,
      total: recalculatedTotal,
      updatedAt: new Date().toISOString()
    };

    const updatedOrders = orders.map(o => o.id === orderToSave.id ? orderToSave : o);
    saveAndSyncOrders(updatedOrders);
    playAlertSound('confirm');

    if (isSupabaseConfigured()) {
      updateOrderInDb(orderToSave.id, orderToSave).catch(err => {
        console.warn('Aviso: Erro ao persistir edição do pedido no Supabase:', err);
      });
    }

    return orderToSave;
  };

  // Gerenciamento de Produtos do Cardápio (Admin)
  const saveProduct = async (productData) => {
    const newProduct = {
      ...productData,
      id: productData.id || `p_${Date.now()}`
    };

    setProducts(prev => {
      const exists = prev.some(p => p.id === newProduct.id);
      const updated = exists
        ? prev.map(p => p.id === newProduct.id ? newProduct : p)
        : [newProduct, ...prev];
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured()) {
      saveProductInDb(newProduct).catch(console.error);
    }
    playAlertSound('confirm');
    return newProduct;
  };

  const deleteProduct = async (productId) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured()) {
      deleteProductInDb(productId).catch(console.error);
    }
    return true;
  };

  const toggleProductActive = async (productId) => {
    let nextActive = true;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId) {
          nextActive = p.isActive === false ? true : false;
          return { ...p, isActive: nextActive };
        }
        return p;
      });
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured()) {
      toggleProductActiveInDb(productId, nextActive).catch(console.error);
    }
  };

  // Reconnect / force refresh helper
  const reconnectDb = () => {
    setDbVersion(v => v + 1);
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
      editOrder,
      printTicket,
      triggerPrintTicket,
      closePrintTicket,
      // Database state & triggers
      dbStatus,
      isDbConnected: dbStatus === 'connected',
      reconnectDb,
      refreshOrders: loadOrdersFromSupabase,
      // Products (Cardápio dinâmico)
      products,
      categories: CATEGORIES,
      saveProduct,
      deleteProduct,
      toggleProductActive,
      refreshProducts: loadProductsFromSupabase,
      // Customer & Loyalty features
      customer,
      loginCustomer,
      registerCustomer,
      logoutCustomer,
      updateCustomerAddress,
      reorder,
      // Store Settings & Personalização do Cardápio
      storeSettings,
      updateStoreSettings
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
