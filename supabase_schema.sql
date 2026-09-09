-- ==============================================================================
-- 🚀 SDG DELIVERY & KDS - RESET TOTAL E CRIAÇÃO DO BANCO DE DADOS (SUPABASE)
-- ==============================================================================

-- 1. LIMPEZA TOTAL DE TABELAS ANTIGAS DO SCHEMA PÚBLICO
do $$
declare
  r record;
begin
  for r in (select tablename from pg_tables where schemaname = 'public') loop
    execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
  end loop;
end $$;

-- 2. TABELA DE CLIENTES (customers)
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  address text default '',
  neighborhood text default '',
  total_orders integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_phone on public.customers (phone);

-- 3. TABELA DE CATEGORIAS (categories)
create table public.categories (
  id text primary key,
  name text not null,
  icon text not null default 'Utensils',
  sort_order integer not null default 0
);

-- 4. TABELA DE PRODUTOS DO CARDÁPIO (products)
create table public.products (
  id text primary key,
  category_id text references public.categories(id) on delete set null,
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0.00,
  image text default '',
  badge text default '',
  is_active boolean not null default true,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_products_category on public.products (category_id);

-- 5. TABELA DE PEDIDOS (orders)
create table public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  delivery_type text not null default 'delivery' check (delivery_type in ('delivery', 'takeout')),
  address text not null default '',
  payment_method text not null default 'pix' check (payment_method in ('pix', 'credit_card', 'cash')),
  status text not null default 'aguardando_pagamento' check (status in ('aguardando_pagamento', 'pagamento_confirmado', 'em_preparo', 'pronto', 'entregue', 'cancelado')),
  total numeric(10, 2) not null default 0.00,
  observation text default '',
  items jsonb not null default '[]'::jsonb
);

create index idx_orders_created_at on public.orders (created_at desc);
create index idx_orders_status on public.orders (status);

-- 6. AUTOMAÇÃO: CADASTRO AUTOMÁTICO DO CLIENTE A CADA PEDIDO
create or replace function public.handle_order_customer_sync()
returns trigger as $$
begin
  insert into public.customers (phone, name, address, total_orders, updated_at)
  values (
    new.customer_phone,
    new.customer_name,
    case when new.address <> 'Retirada no Balcão' then new.address else '' end,
    1,
    now()
  )
  on conflict (phone) do update set
    name = excluded.name,
    address = case when excluded.address <> '' then excluded.address else public.customers.address end,
    total_orders = public.customers.total_orders + 1,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_order_created_sync_customer on public.orders;
create trigger on_order_created_sync_customer
  after insert on public.orders
  for each row
  execute function public.handle_order_customer_sync();

-- 5.1. TABELA DE PERSONALIZAÇÃO DA LOJA (store_settings)
create table if not exists public.store_settings (
  id text primary key default 'default',
  name text not null default 'SDG Burger & Pizza',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 7. PERMISSÕES DE ACESSO (Row Level Security - RLS)
alter table public.customers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "allow_all_customers" on public.customers;
create policy "allow_all_customers" on public.customers for all using (true) with check (true);

drop policy if exists "allow_all_categories" on public.categories;
create policy "allow_all_categories" on public.categories for all using (true) with check (true);

drop policy if exists "allow_all_products" on public.products;
create policy "allow_all_products" on public.products for all using (true) with check (true);

drop policy if exists "allow_all_orders" on public.orders;
create policy "allow_all_orders" on public.orders for all using (true) with check (true);

drop policy if exists "allow_all_store_settings" on public.store_settings;
create policy "allow_all_store_settings" on public.store_settings for all using (true) with check (true);

-- 8. HABILITAR SINCRONIZAÇÃO EM TEMPO REAL (REALTIME - BLINDADO)
do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table public.customers;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table public.store_settings;
  exception when others then null;
  end;
end $$;

-- 9. DADOS INICIAIS DO CARDÁPIO (SEED)
insert into public.categories (id, name, icon, sort_order)
values
  ('todos', 'Todos os Itens', 'Utensils', 0),
  ('burgers', 'Hambúrgueres', 'Ham', 1),
  ('pizzas', 'Pizzas Artesanais', 'Pizza', 2),
  ('combos', 'Combos Especiais', 'Zap', 3),
  ('bebidas', 'Bebidas & Sucos', 'CupSoda', 4),
  ('sobremesas', 'Sobremesas', 'IceCream', 5)
on conflict (id) do update set name = excluded.name;

insert into public.products (id, category_id, name, description, price, image, badge, options)
values
  ('p1', 'burgers', 'Smash Bacon Double', 'Dois hambúrgueres smash 90g, queijo cheddar fatiado, bacon crocante em tiras e molho especial no pão brioche.', 34.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'Mais Pedido', '[]'::jsonb),
  ('p2', 'burgers', 'Master Trufado', 'Hambúrguer de fraldinha 180g, queijo gouda derretido, maionese trufada, cebola caramelizada e rúcula.', 39.90, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', 'Gourmet', '[]'::jsonb),
  ('p3', 'pizzas', 'Pizza Pepperoni Supreme', 'Massa de longa fermentação, molho de tomate italiano, muçarela especial, pepperoni fatiado e orégano.', 59.90, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 'Destaque', '[]'::jsonb),
  ('p5', 'combos', 'Combo Casal Smash + Batata + Refri', '2x Smash Bacon Double + 1x Batata Frita Grande Crocante + 2x Refrigerantes Lata 350ml.', 79.90, 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=800&q=80', 'Economia', '[]'::jsonb),
  ('p6', 'bebidas', 'Coca-Cola Zero 350ml', 'Lata trincando de gelada.', 7.50, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', '', '[]'::jsonb),
  ('p8', 'sobremesas', 'Grand Gateau com Picolé', 'Bolo quente de chocolate derretido com picolé Magnum, morangos frescos e castanhas.', 28.90, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 'Irresistível', '[]'::jsonb)
on conflict (id) do update set price = excluded.price, name = excluded.name;

insert into public.orders (id, created_at, updated_at, customer_name, customer_phone, delivery_type, address, payment_method, status, total, observation, items)
values
  (
    'PED-1001',
    now() - interval '15 minutes',
    now() - interval '15 minutes',
    'Carlos Eduardo',
    '(11) 98765-4321',
    'delivery',
    'Av. Paulista, 1000 - Apto 42 - Bela Vista, São Paulo',
    'pix',
    'aguardando_pagamento',
    79.80,
    'Por favor mandar sachês de maionese extra e sem cebola no lanche.',
    jsonb_build_array(
      jsonb_build_object(
        'id', 'p1',
        'name', 'Smash Bacon Double',
        'quantity', 2,
        'price', 34.90,
        'selectedOptions', jsonb_build_array('Extra Bacon (+R$ 4,50)', 'Ao Ponto (Recomendado)'),
        'unitPriceWithExtras', 39.40,
        'subtotal', 78.80
      )
    )
  ),
  (
    'PED-1002',
    now() - interval '8 minutes',
    now() - interval '8 minutes',
    'Fernanda Lima',
    '(11) 97777-8888',
    'takeout',
    'Retirada no Balcão',
    'credit_card',
    'pagamento_confirmado',
    67.40,
    'Caprichar no orégano na pizza.',
    jsonb_build_array(
      jsonb_build_object(
        'id', 'p3',
        'name', 'Pizza Pepperoni Supreme',
        'quantity', 1,
        'price', 59.90,
        'selectedOptions', jsonb_build_array('Sem borda recheada'),
        'unitPriceWithExtras', 59.90,
        'subtotal', 59.90
      ),
      jsonb_build_object(
        'id', 'p6',
        'name', 'Coca-Cola Zero 350ml',
        'quantity', 1,
        'price', 7.50,
        'selectedOptions', jsonb_build_array(),
        'unitPriceWithExtras', 7.50,
        'subtotal', 7.50
      )
    )
  )
on conflict (id) do nothing;
