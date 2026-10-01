# 📊 Análise Exploratória dos Dados — Sales Pipeline

## Dataset Overview

| Arquivo | Linhas | Colunas |
|---|---|---|
| `sales_pipeline.csv` | **8.800** deals | opportunity_id, sales_agent, product, account, deal_stage, engage_date, close_date, close_value |
| `accounts.csv` | **85** contas | account, sector, year_established, revenue, employees, office_location, subsidiary_of |
| `products.csv` | **7** produtos | product, series, sales_price |
| `sales_teams.csv` | **35** agentes | sales_agent, manager, regional_office |

---

## 1. sales_pipeline.csv

### Distribuição por Stage
| Stage | Count | % |
|---|---|---|
| Won | 4.238 | 48.2% |
| Lost | 2.473 | 28.1% |
| **Engaging** | **1.589** | **18.1%** |
| **Prospecting** | **500** | **5.7%** |

**→ 2.089 deals ativos (Engaging + Prospecting)**

### close_value (Won deals only — ativos têm campo vazio)
| Métrica | Valor |
|---|---|
| Min | $38 |
| P50 | $1.117 |
| P75 | $4.430 |
| P90 | $5.285 |
| Max | $30.288 |

> [!WARNING]
> `close_value` está **vazio** para todos os deals Engaging/Prospecting. Usar `sales_price` do produto como proxy de valor potencial.

### Datas no dataset
- `engage_date`: 2016-10-20 → 2017-12-27
- `close_date` (Won): 2017-03-01 → 2017-12-31
- **Ciclo médio de fechamento: ~51–64 dias** dependendo do produto

---

## 2. accounts.csv

### Revenue distribution (em $K — unidade original do CSV)
| P25 | P50 | P75 | P90 | Max |
|---|---|---|---|---|
| $497 | $1.224 | $2.818 | $4.969 | $11.698 |

### Employees
| P50 | P75 | Max |
|---|---|---|
| 2.769 | 6.290 | 34.288 |

### Subsidiárias
- 15 contas são subsidiárias de outras → **feature de relacionamento** potencialmente útil

### Win Rate por Setor
| Sector | Win Rate |
|---|---|
| **marketing** | **59.9%** ⬆ |
| **software** | **59.4%** ⬆ |
| technology | 57.6% |
| retail | 57.2% |
| finance | 55.3% |
| **unknown** | **0%** ⬇ (contas não mapeadas) |

> [!TIP]
> Software e marketing convertem ~4pp acima da média. Feature útil no score.

---

## 3. products.csv

| Produto | Preço | Win Rate | Avg Won Value | Ciclo médio |
|---|---|---|---|---|
| MG Special | $55 | 48% | $55 | 51 dias |
| GTX Basic | $550 | 49% | $546 | 55 dias |
| GTX Plus Basic | $1.096 | 47.2% | $1.080 | 52 dias |
| MG Advanced | $3.393 | 46.3% | $3.389 | 52 dias |
| GTX Pro | $4.821 | N/A | — | — |
| GTX Plus Pro | $5.482 | 49.5% | $5.490 | 52 dias |
| **GTK 500** | **$26.768** | **37.5%** ⬇ | $26.707 | **64 dias** |

> [!TIP]
> O `GTK 500` tem o maior valor ($26k) mas menor win rate (37.5%) e ciclo mais longo (64 dias). Deve pesar alto no score de valor mas ganhar desconto no score de probabilidade.

---

## 4. sales_teams.csv

### Win Rate por Região
| Região | Win Rate |
|---|---|
| **East** | **51.1%** ⬆ |
| West | 48.0% |
| Central | 46.4% ⬇ |

### Managers (6 no total, ~5-6 agentes cada)
- Rocco Neubert, Celia Rouche, Summer Sewald, Cara Losch, Melvin Marxen, Dustin Brinkmann

---

## Scoring Redesign — Features Justificadas pelos Dados

### Por que as features atuais não são suficientes:
1. **Stage** — correto, mas peso insuficiente
2. **close_value** — inútil para ativos (sempre vazio)
3. **revenue da conta** — bom proxy, mas thresholds errados (usávamos > 1M, sendo que max é $11.7k)
4. **Tempo vs. now()** — dataset é de 2016, comparar com 2026 = 100% stale

### Features que os dados suportam para scoring:

| Feature | Dado | Justificativa |
|---|---|---|
| Deal Stage | `deal_stage` | Engaging vs Prospecting — diferença de maturidade |
| Valor potencial | `products.sales_price` | Proxy confiável: avg won value ≈ sales_price |
| Porte da conta | `accounts.revenue` + `employees` | Accounts maiores → deals maiores |
| Setor da conta | `accounts.sector` | Software/Marketing convertem ~4pp acima da média |
| Região | `sales_teams.regional_office` | East converte 4.7pp acima de Central |
| Recência | `engage_date` vs dataset max | Deals mais recentes no dataset são mais "quentes" |
| Subsidiária | `accounts.subsidiary_of` | Conta já conhecida → reduz fricção |

### Distribuição esperada com scoring revisado:
- ~12-15% dos deals ativos como Hot (>75 pts)
- Score médio para Engaging: ~55-70
- Score médio para Prospecting: ~30-50
