# Submissão — Gabriel Quezada — Challenge 003 (Lead Scorer)

## Sobre mim

- **Nome:** Gabriel Quezada
- **LinkedIn:** https://www.linkedin.com/in/gabrqueza/
- **Challenge escolhido:** Challenge 003 — Lead Scorer (RevOps / Vendas)

---

## Executive Summary

Para resolver o problema histórico de priorização "no feeling" do time comercial (35 vendedores gerenciando ~8.800 oportunidades), desenvolvi uma aplicação web fullstack corporativa (React + Vite + Chakra UI v2 no frontend e Express + TypeScript no backend). A ferramenta cruza em memória as quatro tabelas do CRM (`accounts`, `products`, `sales_teams`, `sales_pipeline`) e aplica um motor de scoring heurístico explicável. O resultado é um dashboard executivo com KPIs dinâmicos, filtros regionais e um modal de explicabilidade que traduz dados complexos em insights acionáveis para o vendedor priorizar sua segunda-feira de manhã.

---

## Solução

### Abordagem

1. **Análise de Dados Pragmática:** Antes de codar, mapeamos as limitações e características dos dados do CRM. Descobrimos que o campo `close_value` é vazio para oportunidades ativas (`Engaging` e `Prospecting`). Por isso, adotamos o `sales_price` do produto e o `revenue` da conta como proxies de valor potencial.
2. **Arquitetura Desacoplada e Performática:**
   - **Backend (Express + TypeScript):** Carrega os CSVs na inicialização e cria índices em memória (`Map`) para buscas $O(1)$, garantindo alta performance ao cruzar 8.800 registros.
   - **Frontend (React + Vite + Chakra UI v2):** Focado em experiência do usuário (UX), conta com paginação otimizada na tabela scrollável (mantendo os filtros fixos acessíveis) e cálculos reativos via `useMemo`.
     **PS:** Eu sei que deveria ter colocado dentro de solutions, mas vi um pouco tarde demais e daria mais problemas para fazer essa mudança agora.
3. **Decisão sobre o Idioma (Ingles):** Todo o código, API, mensagens de log e documentação foram mantidos em **inglês**. A justificativa é técnica e prática: os arquivos CSV originais do dataset do Kaggle utilizam colunas e termos em inglês (`deal_stage`, `close_value`, `Engaging`, etc.). Manter o código e interfaces padronizados em inglês evita atritos de tradução de schema e segue o padrão global de engenharia de software.

### Resultados / Findings

- **Dashboard Executivo Dinâmico:** Os cards do topo (Valor Total do Pipeline, Total de Deals, Win Rate e Hot Deals) recalculam instantaneamente conforme o usuário aplica filtros por estágio, gerente ou região.
- **Filtro Inteligente de Hot Deals:** O indicador de negócios quentes filtra estritamente oportunidades ativas (`Engaging` ou `Prospecting`) com pontuação superior a 75 pontos, ignorando deals já encerrados (`Won`), focando o esforço onde há retorno potencial.
- **Explicabilidade Acionável:** O modal de detalhes decompõe o score em pilares claros (Estágio, Potencial Financeiro e Recência) acompanhado de uma narrativa em texto que explica exatamente o porquê da prioridade.

### Recomendações

1. **Foco Matinal:** O time de vendas deve iniciar a semana filtrando o dashboard por `Engaging` e ordenando pelos maiores scores para atacar os 15% de deals mais quentes do pipeline.
2. **Acompanhamento Regional:** Gerentes de vendas devem utilizar os filtros de `regional_office` para gerenciar gargalos específicos nas regiões com menor conversão (como a região Central).

### Limitações

- Como o dataset é estático (baseado no período de 2016–2017), a métrica de recência foi ancorada em uma data de referência fixa (`2017-03-31`) para evitar que dados históricos parecessem 100% estagnados. Em um ambiente de produção real, a API se conectaria a um webhook em tempo real do CRM (Salesforce/HubSpot).

---

## Process Log — Como usei IA

> **Este bloco é obrigatório.** Sem ele, a submissão é desclassificada.

### Ferramentas usadas

| Ferramenta    | Para que usou                                                                                                                                                                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _Gemini_      | _Planejamento arquitetural, desenho do motor de scoring baseado em heurísticas, estruturação de prompts e refinamento de UX. Eu costumo usar o Gemini para fazer prompts corretos, objetivos e precisos com o que preciso para o Antigravity._                                                                 |
| _Antigravity_ | _Geração inicial de código, estruturação de componentes do frontend e migração para TypeScript. Eu uso o Antigravity de acordo com os prompts gerados pelo Gemini e debuggo com a IDE de acordo com a necessidade, fazendo atualizações e correções necessárias de acordo com os testes, pelo próprio agente._ |

### Workflow

1. **Decompetição do Problema:** Alinhamento inicial do escopo do desafio de RevOps e definição da stack tecnológica ideal (Express + Vite + Chakra UI v2) para o time budget de 4 a 6 horas.
2. **Modelagem de Dados e Backend:** Construção do parser de CSVs em TypeScript, índices em memória e regras de pontuação ponderada.
3. **Desenvolvimento e Refinamento do Frontend:** Implementação do dashboard, correção de estados com `useMemo` / `useCallback` e estilização limpa orientada a produtividade comercial com Chakra UI v2.
4. **Auditoria e Ajustes Finais:** Revisão dos critérios de qualidade exigidos pela Head de RevOps (explicabilidade, utilidade prática e performance).
5. **Documentação:** Criação de toda a documentação necessária para a submissão, incluindo screenshots, chat exports e README.

### Onde a IA errou e como corrigi

- **Erro inicial:** A primeira iteração da IA tentava somar o campo `close_value` para calcular o valor do pipeline, resultando em zero nos filtros ativos. Outro erros como ter feito as pastas dentro do diretório errado ou ter usado javascript em vez de typescript.
- **Correção:** Ajustamos a lógica para utilizar o `sales_price` do produto como proxy de valor potencial para oportunidades em aberto (`Engaging`/`Prospecting`). Como foi no começo, deletei as pastas e arquivos criados, iniciei de novo com o mesmo prompt e também pedi a refatoração do arquivo em .js para .ts adicionando tipagem e segurança.

### O que eu adicionei que a IA sozinha não faria

- Utilização do ChakraV2, por ser uma biblioteca de componentes muito boa e que eu tenho costume de usar, deixando o front bem mais bonito, responsivo (que também pedi para colocar com bons breakpoints de mobile, tablet e desktop) e acessível.
- Estilização de tabela scrollável, com header fixo que não polui a visão do usuário. Além disso, foquei em uma arquitetura desacoplada e performática, utilizando índices em memória para buscas $O(1)$ e cálculos reativos via `useMemo` para melhor performance, evitando o loading demorado que o INP e LCP indicavam.
- Definição da regra de negócio para excluir deals `Won` da contagem de `Hot Deals`, garantindo que o vendedor não perca tempo analisando negócios que já foram fechados.

---

## Evidências

- [x] Screenshots do dashboard e modal de explicabilidade salvos em `process-log/screenshots/`
- [x] Chat exports documentando o processo iterativo salvos em `process-log/chat-exports/`
- [x] Histórico de commits versionados no Git local e remoto (`git push origin submission/seu-nome`)

---

_Submissão enviada em: 01-10-2026_
