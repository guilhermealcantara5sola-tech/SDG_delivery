# 🍔 SDG Delivery & KDS - Sistema Completo React (WhatsApp, Balcão & Cozinha)

Sistema web completo de Delivery e Gestão de Restaurantes desenvolvido com **React 19**, **Vite** e **Tailwind CSS**, pronto para versionamento em **Git** e hospedagem na **Vercel**.

---

## 🚀 Funcionalidades Principais

### 📱 1. Módulo do Cliente (Cardápio WhatsApp)
- **Link Direto**: O cliente acessa pelo link recebido no WhatsApp.
- **Cardápio Interativo**: Categorias, buscas, itens personalizáveis (ponto da carne, adicionais, observações).
- **Carrinho Flexível**: Escolha entre **🛵 Delivery** (+ taxa) ou **🛍️ Retirada no Balcão**.
- **Checkout com Envio Duplo**:
  - Envio direto para o Balcão e Cozinha do sistema (sincronizado em tempo real).
  - Opção de enviar também mensagem formatada diretamente para o WhatsApp do restaurante.
- **Acompanhamento em Tempo Real**: Status do pedido atualizado ao vivo (Aguardando Pagamento -> Pagamento Confirmado -> Em Preparo -> Pronto).

### 🖥️ 2. Módulo Balcão / Caixa
- **Alerta de Novos Pedidos**: Recebe os pedidos dos clientes instantaneamente.
- **Impressão Térmica (80mm)**: Botão para imprimir comprovante do balcão/cliente pré-formatado para impressoras térmicas.
- **Confirmação de Pagamento**: Ao clicar em **"Confirmar Pagamento"**, o pedido é automaticamente roteado para a Cozinha.

### 🍳 3. Módulo Cozinha (KDS - Kitchen Display System)
- **Linha de Produção Kanban**: Pedidos organizados em colunas:
  1. **Para Preparar** (Chegam assim que o pagamento é confirmado).
  2. **Em Preparo** (Em produção no fogo/montagem).
  3. **Prontos** (Liberados para entrega/retirada).
- **Impressão de Comanda da Cozinha**: Botão de 1 clique para imprimir a comanda com destaque em adicionais e observações.
- **Alertas Sonoros**: Emissão de alertas sonoros (Web Audio API) ao receber novos pedidos confirmados.

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

3. Open seu navegador no endereço: `http://localhost:5173`

---

## 📦 Como Subir no GitHub e Fazer Deploy na Vercel

### Passo 1: Versionar no Git
No terminal da pasta do projeto, execute:
```bash
git init
git add .
git commit -m "feat: Sistema de Delivery com Balcão e Cozinha"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sdg-delivery.git
git push -u origin main
```

### Passo 2: Deploy na Vercel
1. Acesse o painel da [Vercel](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique no botão **"Add New..."** -> **"Project"**.
3. Selecione o repositório `sdg-delivery` importado do GitHub.
4. A Vercel detectará o framework **Vite** automaticamente.
5. Clique em **"Deploy"**. Em aproximadamente 30 segundos, seu sistema estará online!

---

## 🛠️ Tecnologias Utilizadas
- **React 19 & Vite 6**
- **Tailwind CSS v4**
- **Lucide React Icons**
- **Canvas Confetti**
- **BroadcastChannel & LocalStorage Sync** (Sincronização entre abas sem necessidade de backend pesado)
