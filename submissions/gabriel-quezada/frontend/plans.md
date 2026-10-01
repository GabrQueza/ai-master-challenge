# Lead Scorer - Frontend UI & UX Architecture

## Visão Geral
O painel front-end do Lead Scorer foi projetado para **acelerar a rotina do time de vendas**. Ele consome as APIs do backend de scoring e traduz os dados complexos em uma interface limpa, escaneável e acionável. A UI foi construída com React e Chakra UI v2.

## Objetivos de UX
1. **Priorização Imediata (Scannability):** O vendedor não deve gastar tempo lendo cada coluna para decidir em qual cliente focar. Cores semânticas nos *Score Badges* (Verde = Hot, Amarelo = Warm, Cinza = Cold) indicam a prioridade visualmente.
2. **Contexto Explicável (Explainable AI):** Sistemas de score geram atrito se o vendedor não entende o porquê da nota. O "Deal Modal" resolve isso ao desmembrar o score (Stage, Financial, Time) em barras de progresso claras e prover uma explicação em texto gerada pela regra de negócios do Backend.
3. **Métricas de Relance (Header KPIs):** Cartões no topo mostram ao gestor/vendedor a saúde da sua carteira (valor total, taxa de conversão e leads quentes que exigem atenção hoje).

## Componentização (Pasta `src/components`)
- `Header.tsx`: Exibe estatísticas vitais buscando de `/api/stats`.
- `Filters.tsx`: Permite o drill-down dinâmico para buscar regiões, agentes ou estágios específicos, disparando novamente o endpoint `/api/pipeline`.
- `PipelineTable.tsx`: Tabela minimalista, com hover effects, garantindo legibilidade do grid de dados.
- `DealModal.tsx`: Um modal focado na **Explicabilidade**. Ele realiza uma busca isolada (`/api/deal/:id`) garantindo carregamento assíncrono leve e traz a barra de notas divididas pelos 3 pilares da pontuação.

## Fluxo de Uso
1. O Vendedor abre a página e bate o olho no `Header` para ver quantos Deals estão "Hot".
2. Ele utiliza o `Filters` para filtrar apenas seu território ou estágio (ex: "Engaging").
3. Na `PipelineTable`, a ordenação nativa do backend já traz os Deals com maior score para o topo, destacados em **Verde**.
4. Se o Vendedor tiver dúvida do porquê o deal A é melhor que o B, ele clica em **Analyze**, abrindo o `DealModal` que entrega a transparência necessária para ele confiar na IA.
