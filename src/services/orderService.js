import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/**
 * Maps a Postgres row from table 'orders' to the frontend order representation.
 */
export const mapRowToOrder = (row) => {
  if (!row) return null;

  let parsedItems = [];
  if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === 'string') {
    try {
      parsedItems = JSON.parse(row.items);
    } catch (e) {
      parsedItems = [];
    }
  }

  return {
    id: row.id,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    customerName: row.customer_name || 'Cliente',
    customerPhone: row.customer_phone || '',
    deliveryType: row.delivery_type || 'takeout',
    address: row.address || '',
    paymentMethod: row.payment_method || 'pix',
    status: row.status || 'aguardando_pagamento',
    total: Number(row.total) || 0,
    observation: row.observation || '',
    items: parsedItems,
    deliveryGps: row.delivery_gps || row.deliveryGps || null,
    customerGps: row.customer_gps || row.customerGps || null,
  };
};

/**
 * Maps a frontend order object to the Postgres row format for table 'orders'.
 */
export const mapOrderToRow = (order) => {
  return {
    id: order.id,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    delivery_type: order.deliveryType,
    address: order.address || '',
    payment_method: order.paymentMethod,
    status: order.status || 'aguardando_pagamento',
    total: order.total,
    observation: order.observation || '',
    items: order.items || [],
    delivery_gps: order.deliveryGps || null,
    customer_gps: order.customerGps || null,
  };
};

/**
 * Fetches all orders from Supabase ordered by created_at DESC.
 */
export const fetchOrdersFromDb = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error('Supabase não configurado') };

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return {
      data: (data || []).map(mapRowToOrder),
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar pedidos no Supabase:', error);
    return { data: null, error };
  }
};

/**
 * Inserts a new order into Supabase.
 */
export const insertOrderInDb = async (order) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error('Supabase não configurado') };

  try {
    const row = mapOrderToRow(order);
    let { data, error } = await supabase
      .from('orders')
      .insert([row])
      .select()
      .single();

    // Se houver conflito de chave primária no ID, gera um sufixo e tenta novamente
    if (error && error.code === '23505') {
      console.warn('ID de pedido já existente no Supabase, gerando novo identificador...');
      row.id = `${row.id}-${Math.floor(10 + Math.random() * 90)}`;
      const retryResult = await supabase
        .from('orders')
        .insert([row])
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) throw error;

    return {
      data: mapRowToOrder(data),
      error: null
    };
  } catch (error) {
    console.error('Erro ao salvar pedido no Supabase:', error);
    return { data: null, error };
  }
};

/**
 * Updates an order status in Supabase.
 */
export const updateOrderStatusInDb = async (orderId, newStatus) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error('Supabase não configurado') };

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return {
      data: mapRowToOrder(data),
      error: null
    };
  } catch (error) {
    console.error(`Erro ao atualizar status do pedido ${orderId} no Supabase:`, error);
    return { data: null, error };
  }
};

/**
 * Atualiza todas as informações do pedido no Supabase (itens, cliente, endereço, total, observações, etc.)
 */
export const updateOrderInDb = async (orderId, updatedOrder) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: new Error('Supabase não configurado') };

  try {
    const updatePayload = {
      customer_name: updatedOrder.customerName,
      customer_phone: updatedOrder.customerPhone,
      delivery_type: updatedOrder.deliveryType,
      address: updatedOrder.address || '',
      payment_method: updatedOrder.paymentMethod,
      status: updatedOrder.status,
      total: Number(updatedOrder.total) || 0,
      observation: updatedOrder.observation || '',
      items: updatedOrder.items || [],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return {
      data: mapRowToOrder(data),
      error: null
    };
  } catch (error) {
    console.error(`Erro ao atualizar pedido ${orderId} no Supabase:`, error);
    return { data: null, error };
  }
};

/**
 * Seeds demo initial orders into Supabase if desired.
 */
export const seedOrdersInDb = async (ordersList) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { count: 0, error: new Error('Supabase não configurado') };

  try {
    const rows = ordersList.map(mapOrderToRow);
    const { data, error } = await supabase
      .from('orders')
      .upsert(rows, { onConflict: 'id' })
      .select();

    if (error) throw error;

    return { count: data?.length || 0, error: null };
  } catch (error) {
    console.error('Erro ao popular pedidos no Supabase:', error);
    return { count: 0, error };
  }
};

/**
 * Subscribes to Supabase Realtime channel for postgres_changes on table 'orders'.
 */
export const subscribeToOrdersRealtime = ({ onInsert, onUpdate, onDelete }) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('sdg_orders_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = mapRowToOrder(payload.new);
          if (onInsert) onInsert(newOrder);
        } else if (payload.eventType === 'UPDATE') {
          const updatedOrder = mapRowToOrder(payload.new);
          if (onUpdate) onUpdate(updatedOrder);
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (onDelete && deletedId) onDelete(deletedId);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('📡 Conectado ao Supabase Realtime (tabela orders)');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Inscreve no canal Supabase Realtime para a tabela 'store_settings'.
 */
export const subscribeToStoreSettingsRealtime = ({ onUpdate }) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('sdg_settings_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'store_settings'
      },
      (payload) => {
        if (payload.new && payload.new.settings) {
          if (onUpdate) onUpdate(payload.new.settings);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Inscreve no canal Supabase Realtime para a tabela 'products'.
 */
export const subscribeToProductsRealtime = ({ onInsert, onUpdate, onDelete }) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('sdg_products_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newProduct = mapRowToProduct(payload.new);
          if (onInsert) onInsert(newProduct);
        } else if (payload.eventType === 'UPDATE') {
          const updatedProduct = mapRowToProduct(payload.new);
          if (onUpdate) onUpdate(updatedProduct);
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (onDelete && deletedId) onDelete(deletedId);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Fetches customers list from Supabase.
 */
export const fetchCustomersFromDb = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('total_orders', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar clientes no Supabase:', error);
    return { data: [], error };
  }
};

/**
 * Mapeia linha do banco de dados (tabela products) para formato do cardápio do frontend.
 */
export const mapRowToProduct = (row) => {
  if (!row) return null;
  let parsedOptions = [];
  if (Array.isArray(row.options)) {
    parsedOptions = row.options;
  } else if (typeof row.options === 'string') {
    try {
      parsedOptions = JSON.parse(row.options);
    } catch (e) {
      parsedOptions = [];
    }
  }

  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price) || 0,
    image: row.image || '',
    badge: row.badge || '',
    isActive: row.is_active !== false,
    options: parsedOptions
  };
};

/**
 * Mapeia objeto de produto do frontend para linha do Postgres (tabela products).
 */
export const mapProductToRow = (product) => {
  return {
    id: product.id,
    category_id: product.categoryId,
    name: product.name,
    description: product.description || '',
    price: Number(product.price) || 0,
    image: product.image || '',
    badge: product.badge || '',
    is_active: product.isActive !== false,
    options: product.options || []
  };
};

/**
 * Busca todos os produtos do cardápio no Supabase.
 */
export const fetchProductsFromDb = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: (data || []).map(mapRowToProduct), error: null };
  } catch (error) {
    console.error('Erro ao buscar produtos no Supabase:', error);
    return { data: [], error };
  }
};

/**
 * Cadastra ou atualiza um produto no Supabase (Admin).
 */
export const saveProductInDb = async (product) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: product, error: null };

  try {
    const row = mapProductToRow(product);
    const { data, error } = await supabase
      .from('products')
      .upsert([row], { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { data: mapRowToProduct(data), error: null };
  } catch (error) {
    console.error('Erro ao salvar produto no Supabase:', error);
    return { data: null, error };
  }
};

/**
 * Exclui um produto do cardápio no Supabase.
 */
export const deleteProductInDb = async (productId) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Erro ao excluir produto ${productId} no Supabase:`, error);
    return { success: false, error };
  }
};

/**
 * Alterna disponibilidade (ativo/pausado) do produto no Supabase.
 */
export const toggleProductActiveInDb = async (productId, isActive) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Erro ao alterar disponibilidade do produto ${productId}:`, error);
    return { success: false, error };
  }
};

/**
 * Salva ou atualiza o perfil do cliente no Supabase.
 */
export const saveCustomerProfile = async ({ name, phone, address, pin, avatar_url, avatarUrl }) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: null };

  const avatar = (avatar_url || avatarUrl || '').trim();

  try {
    const payload = {
      name: name?.trim(),
      phone: phone?.trim(),
      address: address?.trim() || '',
      neighborhood: pin ? `PIN:${pin.trim()}` : '',
      updated_at: new Date().toISOString()
    };

    if (avatar) {
      payload.avatar_url = avatar;
    }

    const { data, error } = await supabase
      .from('customers')
      .upsert([payload], { onConflict: 'phone' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao salvar perfil do cliente no Supabase:', error);
    return { data: null, error };
  }
};

/**
 * Autentica o cliente pelo WhatsApp e PIN de 6 dígitos.
 */
export const loginCustomerByPin = async (phone, pin) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { customer: null, error: new Error('Banco de dados não disponível') };

  try {
    const cleanPhone = phone.trim();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .single();

    if (error || !data) {
      return { customer: null, error: new Error('Cliente não encontrado. Cadastre-se em 1 minuto!') };
    }

    // Se o cliente tem PIN registrado, confere
    if (data.neighborhood && data.neighborhood.startsWith('PIN:')) {
      const savedPin = data.neighborhood.replace('PIN:', '').trim();
      if (savedPin !== pin.trim()) {
        return { customer: null, error: new Error('Senha PIN incorreta. Tente novamente!') };
      }
    } else {
      // Se não tinha PIN gravado antes, vincula o PIN agora
      await supabase
        .from('customers')
        .update({ neighborhood: `PIN:${pin.trim()}` })
        .eq('phone', cleanPhone);
    }

    return {
      customer: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        avatar_url: data.avatar_url || '',
        total_orders: data.total_orders || 1,
        pin: pin.trim()
      },
      error: null
    };
  } catch (err) {
    return { customer: null, error: err };
  }
};

/**
 * Busca o histórico de pedidos de um cliente específico pelo telefone.
 */
export const fetchCustomerOrdersFromDb = async (phone) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone.trim())
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return {
      data: (data || []).map(mapRowToOrder),
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    return { data: [], error };
  }
};

/**
 * Atualiza cadastro de cliente no Supabase (Admin).
 */
export const updateCustomerInDb = async (customerId, { name, phone, address, total_orders, pin, avatar_url, avatarUrl }) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: null };

  const avatar = avatar_url !== undefined ? avatar_url : avatarUrl;

  try {
    const payload = {
      name: name?.trim(),
      phone: phone?.trim(),
      address: address?.trim() || '',
      updated_at: new Date().toISOString()
    };

    if (total_orders !== undefined) {
      payload.total_orders = Number(total_orders);
    }
    if (pin && pin.trim()) {
      payload.neighborhood = `PIN:${pin.trim()}`;
    }
    if (avatar !== undefined) {
      payload.avatar_url = avatar?.trim() || '';
    }

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${customerId} no Supabase:`, error);
    return { data: null, error };
  }
};

/**
 * Exclui cadastro de cliente do Supabase.
 */
export const deleteCustomerInDb = async (customerId) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Erro ao excluir cliente ${customerId}:`, error);
    return { success: false, error };
  }
};

/**
 * Busca as configurações da loja / personalização no Supabase.
 */
export const fetchStoreSettingsFromDb = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: null };

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      // Retorna null silenciosamente se a tabela ainda não existir
      return { data: null, error };
    }
    return { data: data?.settings || null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Salva as configurações da loja / personalização no Supabase.
 */
export const saveStoreSettingsToDb = async (settings) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: null };

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 'default',
        name: settings?.restaurantName || 'SDG Delivery',
        settings: settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.warn('Persistência store_settings via Supabase indisponível (mantendo local):', error?.message);
    return { success: false, error };
  }
};

/**
 * Atualiza especificamente as coordenadas GPS da entrega em um pedido no Supabase.
 */
export const updateOrderDeliveryGpsInDb = async (orderId, deliveryGps) => {
  const supabase = getSupabaseClient();
  if (!supabase || !orderId) return { success: false, error: null };

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_gps: deliveryGps,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Salva ou atualiza a localização GPS de um motoboy no Supabase.
 */
export const updateMotoboyLocationInDb = async (locationData) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: null };

  try {
    const id = locationData.id || locationData.driverName || 'driver-1';
    const { data, error } = await supabase
      .from('motoboy_locations')
      .upsert({
        id,
        driver_name: locationData.driverName || 'Entregador',
        order_id: locationData.orderId || '',
        latitude: Number(locationData.latitude),
        longitude: Number(locationData.longitude),
        speed: Number(locationData.speed || 0),
        heading: Number(locationData.heading || 0),
        accuracy: Number(locationData.accuracy || 0),
        is_online: locationData.isOnline !== undefined ? locationData.isOnline : true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Busca todas as localizações de motoboys registradas no Supabase.
 */
export const fetchMotoboyLocationsFromDb = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from('motoboy_locations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return { data: [], error };
    return {
      data: (data || []).map(row => ({
        id: row.id,
        driverName: row.driver_name,
        orderId: row.order_id,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        speed: Number(row.speed || 0),
        heading: Number(row.heading || 0),
        accuracy: Number(row.accuracy || 0),
        isOnline: row.is_online,
        updatedAt: row.updated_at
      })),
      error: null
    };
  } catch (error) {
    return { data: [], error };
  }
};

/**
 * Assina mudanças em tempo real na tabela de localizações dos motoboys.
 */
export const subscribeToMotoboyLocationsRealtime = (callback) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('motoboy-locations-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'motoboy_locations' },
        (payload) => {
          if (callback && payload.new) {
            callback({
              id: payload.new.id,
              driverName: payload.new.driver_name,
              orderId: payload.new.order_id,
              latitude: Number(payload.new.latitude),
              longitude: Number(payload.new.longitude),
              speed: Number(payload.new.speed || 0),
              heading: Number(payload.new.heading || 0),
              accuracy: Number(payload.new.accuracy || 0),
              isOnline: payload.new.is_online,
              updatedAt: payload.new.updated_at
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    return null;
  }
};

/**
 * Transmissão instantânea via WebSocket do Supabase Realtime (Broadcast).
 * Funciona imediatamente em qualquer dispositivo (celular/computador/app nativo) SEM depender de tabelas no banco!
 */
const BROADCAST_CHANNEL_NAME = 'sdg-motoboy-broadcast';
let sharedBroadcastChannel = null;

const getSharedBroadcastChannel = (supabase) => {
  if (!sharedBroadcastChannel) {
    sharedBroadcastChannel = supabase.channel(BROADCAST_CHANNEL_NAME);
  }
  return sharedBroadcastChannel;
};

export const broadcastMotoboyLocation = (locationData) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const channel = getSharedBroadcastChannel(supabase);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'location_update',
          payload: locationData
        });
      }
    });

    // Se já estiver conectado/inscrito, envia imediatamente
    channel.send({
      type: 'broadcast',
      event: 'location_update',
      payload: locationData
    });
  } catch (err) {
    console.warn('Erro ao transmitir broadcast de localização:', err);
  }
};

/**
 * Assina o canal de broadcast instantâneo de localização dos motoboys.
 * Escuta no MESMO tópico 'sdg-motoboy-broadcast' transmitido pelo app e pelo web!
 */
export const subscribeToMotoboyBroadcast = (callback) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel = getSharedBroadcastChannel(supabase);
    channel
      .on('broadcast', { event: 'location_update' }, (response) => {
        if (callback && response.payload) {
          callback(response.payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Conectado ao canal Realtime Broadcast de Motoboys');
        }
      });

    return () => {
      // Mantém conexão estável
    };
  } catch (err) {
    console.warn('Erro ao assinar canal broadcast de motoboys:', err);
    return null;
  }
};
