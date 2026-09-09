# 🍔 SDG Delivery & KDS - Sistema Completo React & Supabase (WhatsApp, Balcão & Cozinha)

Sistema web completo de Delivery e Gestão de Restaurantes desenvolvido com **React 19**, **Vite**, **Tailwind CSS** e **Supabase** (PostgreSQL + Realtime WebSockets), pronto para versionamento em **Git** e hospedagem na **Vercel**.

---

## ⚡ Novidade: Banco de Dados Supabase Integrado

O sistema agora conta com integração completa ao **Supabase**:
- 🗄️ **Banco de Dados PostgreSQL em Nuvem**: Todos os pedidos ficam salvos de forma persistente e segura.
- 📡 **Sincronização em Tempo Real (Realtime WebSockets)**:
  - Quando um cliente faz o pedido no celular (via WhatsApp / Web), ele aparece **instantaneamente** no computador do Balcão e no monitor da Cozinha.
  - Quando o Balcão confirma o pagamento, a Cozinha recebe o alerta sonoro e a comanda se move ao vivo para a coluna "Para Preparar".
  - O cliente acompanha na tela do celular a evolução do preparo em tempo real!
- 🛡️ **Políticas de Segurança (Row Level Security - RLS)** configuradas.
- 🔄 **Modo Resiliente (Offline / Local Fallback)**: Se o Supabase ainda não estiver configurado, o app funciona perfeitamente em modo local (LocalStorage + BroadcastChannel) sem quebrar.

---

## 🚀 Funcionalidades Principais

### 📱 1. Módulo do Cliente (Cardápio WhatsApp)
- **Link Direto**: O cliente acessa pelo link recebido no WhatsApp.
- **Cardápio Interativo**: Categorias, buscas, itens personalizáveis (ponto da carne, adicionais, observações).
- **Carrinho Flexível**: Escolha entre **🛵 Delivery** (+ taxa) ou **🛍️ Retirada no Balcão**.
- **Checkout com Envio Duplo**:
  - Envio direto para o banco Supabase e telas da equipe.
  - Opção de enviar também mensagem formatada diretamente para o WhatsApp do restaurante.
- **Acompanhamento em Tempo Real**: Status do pedido atualizado ao vivo (Aguardando Pagamento -> Pagamento Confirmado -> Em Preparo -> Pronto).

### 🖥️ 2. Módulo Balcão / Caixa
- **Alerta de Novos Pedidos**: Recebe os pedidos dos clientes instantaneamente com alarme sonoro.
- **Impressão Térmica (80mm)**: Botão para imprimir comprovante do balcão/cliente pré-formatado para impressoras térmicas.
- **Confirmação de Pagamento**: Ao clicar em **"Confirmar Pagamento"**, o pedido é automaticamente roteado para a Cozinha em tempo real.

### 🍳 3. Módulo Cozinha (KDS - Kitchen Display System)
- **Linha de Produção Kanban**: Pedidos organizados em colunas:
  1. **Para Preparar** (Chegam assim que o pagamento é confirmado).
  2. **Em Preparo** (Em produção no fogo/montagem).
  3. **Prontos** (Liberados para entrega/retirada).
- **Impressão de Comanda da Cozinha**: Botão de 1 clique para imprimir a comanda com destaque em adicionais e observações.
- **Alertas Sonoros**: Emissão de alertas sonoros (Web Audio API) ao receber novos pedidos confirmados.

---

## 🗄️ Como Configurar o Banco de Dados Supabase (Em 2 Minutos)

### Passo 1: Criar o Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita (caso ainda não tenha).
2. Clique em **"New project"**, dê um nome (ex: `sdg-delivery`) e defina uma senha para o banco de dados.

### Passo 2: Executar o Script SQL
1. No painel do seu projeto Supabase, clique no menu lateral esquerdo em **SQL Editor** (ícone de código `>_`).
2. Clique em **"New query"**.
3. Abra o arquivo [`supabase_schema.sql`](file:///C:/Trabalho/SDG%20Delivery/supabase_schema.sql) localizado na raiz deste projeto (ou copie direto da tela de Admin do sistema).
4. Cole o código no SQL Editor e clique no botão verde **Run** (no canto inferior direito).
5. Pronto! As tabelas `orders`, `categories`, `products`, as permissões RLS e a publicação Realtime foram criadas com sucesso.

### Passo 3: Conectar no Sistema

Você tem **duas formas** super fáceis de conectar:

#### Opção A: Pelo próprio Navegador (Sem reiniciar nada)
1. Acesse o painel **Links & Banco** (`/admin`) no sistema.
2. Cole a **Project URL** e a chave **anon public** do Supabase.
3. Clique em **"Salvar e Conectar"**. O status mudará imediatamente para `🟢 Supabase Conectado`.

#### Opção B: Por Arquivo de Ambiente (`.env.local`)
1. Crie um arquivo chamado `.env.local` na raiz do projeto baseado no `.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
```
2. Reinicie o servidor de desenvolvimento (`npm run dev`).

---

## 💻 Como Rodar o Projeto Localmente

1. **Instalar as dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. Abra seu navegador no endereço: `http://localhost:5173`

---

## 📦 Como Subir no GitHub e Fazer Deploy na Vercel

### Passo 1: Versionar no Git
No terminal da pasta do projeto, execute:
```bash
git init
git add .
git commit -m "feat: Integracao completa com Supabase e Realtime"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sdg-delivery.git
git push -u origin main
```

### Passo 2: Deploy na Vercel
1. Acesse o painel da [Vercel](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique no botão **"Add New..."** -> **"Project"**.
3. Selecione o repositório `sdg-delivery` importado do GitHub.
4. Na seção **Environment Variables**, adicione suas variáveis do Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **"Deploy"**. Em aproximadamente 30 segundos, seu sistema estará online!

---

## 🛠️ Tecnologias Utilizadas
- **React 19 & Vite 6**
- **Supabase (@supabase/supabase-js)**: PostgreSQL, WebSockets Realtime & RLS
- **Tailwind CSS v4**
- **Lucide React Icons**
- **Canvas Confetti**
- **BroadcastChannel & LocalStorage Fallback**
