# Walkthrough do Lead Scorer Backend

Este documento serve como um guia passo a passo do desenvolvimento da aplicação, conectando a arquitetura definida no `plan.md` com a implementação real.

## Fase 1: Setup Inicial e Carga de Dados (Concluída)
**Objetivo:** Criar a infraestrutura base do servidor e carregar os dados em memória.
- [x] Iniciar o projeto Node.js e configurar o `package.json`.
- [x] Instalar as dependências essenciais: `express`, `cors` e `csv-parser`.
- [x] Estruturar os diretórios e importar os arquivos oficiais na pasta `data/` (`accounts.csv`, `products.csv`, `sales_teams.csv`, `sales_pipeline.csv`).
- [x] Construir o servidor `index.js` inicializando o Express.
- [x] Implementar a rotina para ler os arquivos de forma assíncrona com Streams do Node, salvando os dados nas listas em memória do objeto `db`.
- [x] Criar o endpoint de teste `GET /api/health` garantindo que o servidor subiu e a contagem de registros atesta o parsing correto dos arquivos substituídos.

## Fase 2: Estruturação dos Dados e Indexação (Próxima)
**Objetivo:** Converter os arrays brutos em estruturas de dados fáceis e rápidas de consultar (relacionamentos).
- [ ] Criar dicionários/mapas (Hash Maps) com a chave sendo o identificador (ex: nome do produto, nome da conta) para as entidades `accounts`, `products` e `salesTeams`. Isso evitará buscar no array (O(N)) cada vez que precisarmos "joinar" algo.
- [ ] Implementar uma função que possa retornar uma linha do pipeline de vendas já contendo os dados aninhados da conta, do agente de vendas e do produto (hidratação dos dados).
- [ ] Adicionar um endpoint para visualizar o pipeline mapeado (ex: `GET /api/pipeline`).

## Fase 3: Regras de Negócio e Lead Scoring
**Objetivo:** Criar o mecanismo real que dá nota (score) aos leads.
- [ ] Definir a fórmula do "Lead Score": o que faz um lead ter mais valor? (ex: receita da conta, setor, cargo do agente, estágio da venda `deal_stage`).
- [ ] Implementar a lógica em código que percorre as oportunidades do pipeline aplicando o algoritmo.
- [ ] Expor endpoints como `GET /api/leads/score` onde poderemos passar filtros e ordenações (trazer os melhores leads primeiro).

## Fase 4: Refinamento, Arquitetura Avançada e Frontend
**Objetivo:** Escalar e fechar o projeto.
- [ ] Separar rotas de forma mais limpa usando o conceito de Controllers, Services e Repositories caso a lógica cresça muito dentro do `index.js`.
- [ ] Adicionar um tratamento unificado de erros nas respostas do Express.
- [ ] (Opcional) Construir uma interface frontend em React/Next.js/Vite para consumir esses dados em formato de painel.
