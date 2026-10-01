# Instruções de Setup — Lead Scorer (Challenge 003)

Este documento descreve detalhadamente como configurar, instalar e executar a aplicação **Lead Scorer** desenvolvida para o Challenge 003 de RevOps / Vendas.

---

## 🚀 Tecnologias Utilizadas (Tech Stack)

- **Backend:** Node.js, Express, TypeScript, `csv-parser`.
- **Frontend:** React, Vite, TypeScript, Chakra UI v2 (`@chakra-ui/react@2`, `@emotion/react`, `@emotion/styled`, `framer-motion`).
- **Dados:** Arquivos CSV do CRM (`accounts.csv`, `products.csv`, `sales_teams.csv`, `sales_pipeline.csv`).

---

## 📋 Pré-requisitos

Certifique-se de ter os seguintes softwares instalados na sua máquina:

- **Node.js** (versão 18 ou superior recomendada).
- Gerenciador de pacotes **npm**.

---

## ⚙️ Como Rodar a Aplicação Localmente

A solução é desacoplada, consistindo em um servidor **Backend** e uma aplicação **Frontend**. Para testar o funcionamento completo, você precisará executar ambos em terminais separados.

### 1. Configurando e Rodando o Backend

1. Abra um terminal e navegue até a pasta do backend:

   `submissions/gabriel-quezada/backend/`

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Certifique-se de que os quatro arquivos CSV do CRM (`accounts.csv`, `products.csv`, `sales_teams.csv` e `sales_pipeline.csv`) estão devidamente posicionados dentro da pasta `data/` do backend.

4. Inicie o servidor em modo de desenvolvimento, com recarregamento automático via `tsx`:

   ```bash
   npm run dev
   ```

5. O servidor Express será inicializado na porta `3000`. Você pode validar a leitura dos dados e a saúde da API acessando no navegador ou via Postman:

   `http://localhost:3000/api/health`

### 2. Configurando e Rodando o Frontend

1. Abra um **segundo terminal** e navegue até a pasta do frontend:

   `submissions/gabriel-quezada/frontend/`

2. Instale as dependências do projeto e do Chakra UI v2:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Vite:

   ```bash
   npm run dev
   ```

4. O terminal exibirá uma URL local (geralmente `http://localhost:5173`). Abra essa URL no seu navegador para interagir com o Dashboard corporativo do Lead Scorer.

---

## 🔌 Endpoints Principais da API

- `GET /api/health` — Retorna o status do servidor e a contagem de registros carregados em memória de cada CSV.

- `GET /api/stats` — Retorna os KPIs executivos (Valor Total do Pipeline, Total de Deals, Taxa de Conversão e Hot Deals) calculados de forma dinâmica.

- `GET /api/pipeline` — Retorna a listagem de oportunidades enriquecidas (com contas, produtos e vendedores unidos) ordenadas por score decrescente. Suporta filtros por `deal_stage`, `sales_agent`, `manager` e `regional_office`.

- `GET /api/deal/:id` — Retorna os detalhes completos de uma oportunidade específica junto com o objeto explicativo detalhado (`score_breakdown`).
