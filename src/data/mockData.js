export const CATEGORIES = [
  { id: 'todos', name: 'Todos os Itens', icon: 'Utensils' },
  { id: 'burgers', name: 'Hambúrgueres', icon: 'Ham' },
  { id: 'pizzas', name: 'Pizzas Artesanais', icon: 'Pizza' },
  { id: 'bebidas', name: 'Bebidas & Sucos', icon: 'CupSoda' },
  { id: 'sobremesas', name: 'Sobremesas', icon: 'IceCream' },
  { id: 'combos', name: 'Combos Especiais', icon: 'Zap' },
];

export const PRODUCTS = [
  {
    id: 'p1',
    categoryId: 'burgers',
    name: 'Smash Bacon Double',
    description: 'Dois hambúrgueres smash 90g, queijo cheddar fatiado, bacon crocante em tiras e molho especial da casa no pão brioche.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Pedido',
    options: [
      {
        name: 'Adicionais',
        type: 'checkbox',
        items: [
          { name: 'Extra Bacon (+R$ 4,50)', price: 4.50 },
          { name: 'Extra Queijo Cheddar (+R$ 3.50)', price: 3.50 },
          { name: 'Ovo frito (+R$ 2.50)', price: 2.50 }
        ]
      },
      {
        name: 'Ponto da Carne',
        type: 'radio',
        items: [
          { name: 'Ao Ponto (Recomendado)', price: 0 },
          { name: 'Bem Passado', price: 0 },
          { name: 'Mal Passado', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'p2',
    categoryId: 'burgers',
    name: 'Master Trufado',
    description: 'Hambúrguer de fraldinha 180g, queijo gouda derretido, maionese trufada, cebola caramelizada e rúcula fresca.',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    badge: 'Gourmet',
    options: [
      {
        name: 'Molho Extra',
        type: 'radio',
        items: [
          { name: 'Maionese Trufada (+R$ 4.00)', price: 4.00 },
          { name: 'Barbecue de Bacon (+R$ 3.00)', price: 3.00 },
          { name: 'Sem molho extra', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'p3',
    categoryId: 'pizzas',
    name: 'Pizza Pepperoni Supreme',
    description: 'Massa de longa fermentação, molho de tomate italiano, muçarela especial, pepperoni fatiado e orégano fresco.',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    badge: 'Destaque',
    options: [
      {
        name: 'Borda Recheada',
        type: 'radio',
        items: [
          { name: 'Sem borda recheada', price: 0 },
          { name: 'Borda de Catupiry Original (+R$ 9.90)', price: 9.90 },
          { name: 'Borda de Cheddar (+R$ 8.90)', price: 8.90 }
        ]
      }
    ]
  },
  {
    id: 'p4',
    categoryId: 'pizzas',
    name: 'Pizza Quattro Formaggi',
    description: 'Combinação perfeita de Muçarela, Gorgonzola especial, Parmesão maturado e Catupiry cremoso.',
    price: 64.90,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    options: [
      {
        name: 'Borda Recheada',
        type: 'radio',
        items: [
          { name: 'Sem borda recheada', price: 0 },
          { name: 'Borda de Catupiry (+R$ 9.90)', price: 9.90 }
        ]
      }
    ]
  },
  {
    id: 'p5',
    categoryId: 'combos',
    name: 'Combo Casal Smash + Batata + Refri',
    description: '2x Smash Bacon Double + 1x Batata Frita Grande Crocante + 2x Refrigerantes Lata 350ml.',
    price: 79.90,
    image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=800&q=80',
    badge: 'Economia',
    options: []
  },
  {
    id: 'p6',
    categoryId: 'bebidas',
    name: 'Coca-Cola Zero 350ml',
    description: 'Lata trincando de gelada.',
    price: 7.50,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    options: []
  },
  {
    id: 'p7',
    categoryId: 'bebidas',
    name: 'Suco Natural de Laranja 500ml',
    description: 'Suco 100% fruta espremido na hora.',
    price: 11.00,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    options: []
  },
  {
    id: 'p8',
    categoryId: 'sobremesas',
    name: 'Grand Gateau com Picolé',
    description: 'Bolo quente de chocolate derretido com picolé Magnum, morangos frescos e farofa de castanhas.',
    price: 28.90,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    badge: 'Irresistível',
    options: []
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'PED-1001',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
    customerName: 'Carlos Eduardo',
    customerPhone: '(11) 98765-4321',
    deliveryType: 'delivery',
    address: 'Av. Paulista, 1000 - Apto 42 - Bela Vista, São Paulo',
    paymentMethod: 'pix',
    status: 'aguardando_pagamento',
    total: 79.80,
    observation: 'Por favor mandar sachês de maionese extra e sem cebola no lanche.',
    items: [
      {
        id: 'p1',
        name: 'Smash Bacon Double',
        quantity: 2,
        price: 34.90,
        selectedOptions: ['Extra Bacon (+R$ 4,50)', 'Ao Ponto (Recomendado)'],
        unitPriceWithExtras: 39.40,
        subtotal: 78.80
      }
    ]
  },
  {
    id: 'PED-1002',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 mins ago
    customerName: 'Fernanda Lima',
    customerPhone: '(11) 97777-8888',
    deliveryType: 'takeout',
    address: 'Retirada no Balcão',
    paymentMethod: 'credit_card',
    status: 'pagamento_confirmado', // Balcão já confirmou! Pronta para Cozinha
    total: 67.40,
    observation: 'Caprichar no orégano na pizza.',
    items: [
      {
        id: 'p3',
        name: 'Pizza Pepperoni Supreme',
        quantity: 1,
        price: 59.90,
        selectedOptions: ['Sem borda recheada'],
        unitPriceWithExtras: 59.90,
        subtotal: 59.90
      },
      {
        id: 'p6',
        name: 'Coca-Cola Zero 350ml',
        quantity: 1,
        price: 7.50,
        selectedOptions: [],
        unitPriceWithExtras: 7.50,
        subtotal: 7.50
      }
    ]
  }
];
