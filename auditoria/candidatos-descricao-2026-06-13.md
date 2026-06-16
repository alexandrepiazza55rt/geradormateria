# Auditoria — Match por descrição (fuzzy)

**Data:** 2026-06-13
**Materiais analisados:** 234 (105 sem match + 129 sem cod_sap)
**Fonte de candidatos:** aba `MATERIAL` (340) + aba `Banco_Dados` (3141) — total 3481 candidatos

> ⚠ Match por descrição é **aproximado**. Nada foi aplicado. Revise cada caso e me indique quais candidatos aceitar.

## Como ler o score

Combinação ponderada: 60% Dice de tokens (palavras significativas, sem stopwords) + 40% Dice de números encontrados na descrição (medidas, AWG, kV, mm²). Vai de 0 (nada em comum) a 1 (idêntico após normalização).

- 🟢 **Alta** (≥ 0,75) — quase certeza
- 🟡 **Média** (0,55–0,75) — provavelmente bate, conferir números
- 🔴 **Baixa** (0,40–0,55) — só confiar se descrição for clara
- Sem candidato com score ≥ 0,40 — não há nada parecido na planilha

## Resumo

| Confiança do melhor candidato | Quantidade |
| --- | ---: |
| 🟢 Alta (≥ 0,75) | 17 |
| 🟡 Média (0,55–0,75) | 93 |
| 🔴 Baixa (0,40–0,55) | 109 |
| ⚫ Sem candidato (< 0,40) | 15 |

## Como aprovar

Para cada material abaixo, me diga uma das opções:

- `#ID aceitar 1` (ou 2, 3, …) — usa o candidato N como cod_sap
- `#ID rejeitar` — não altera nada nesse material
- `aceitar todos altos` — aplica todos os 🟢 de uma vez

Para volumes grandes, pode mandar uma lista, ex.:
```
#1 aceitar 1
#3 aceitar 2
#5 rejeitar
```

---

## 🟢 Alta confiança (17)

Quase certeza. Top candidato com score ≥ 0,75.

### `#130` — Gancho Olhal (pç)
- cod_sap atual: `590448` · cod_lider7: `3603`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **1.00** | MATERIAL | `90448` | 2937 | GANCHO OLHAL | PC |
| 2 | **0.70** | Banco_Dados | `538` | — | CABECOTE OLHAL | UNIDADE |
| 3 | **0.70** | Banco_Dados | `1841` | — | GANCHO PARA CORDA | UNIDADE |
| 4 | **0.64** | Banco_Dados | `1838` | — | GANCHO P ISOLADOR EM ALUMINIO | UNIDADE |
| 5 | **0.64** | Banco_Dados | `1839` | — | GANCHO P/ LINHA DE VIDA | PECA |

### `#154` — Manilha sapatilha (pç)
- cod_sap atual: `590440` · cod_lider7: `3623`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **1.00** | MATERIAL | `90440` | 2954 | MANILHA SAPATILHA | PC |
| 2 | **0.80** | MATERIAL | `2964` | 2964 | SAPATILHA | PC |
| 3 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 4 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 5 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |

### `#235` — Sela para cruzeta (pç)
- cod_sap atual: `590410` · cod_lider7: `3669`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **1.00** | MATERIAL | `90411` | 3019 | SELA PARA CRUZETA | PC |
| 2 | **0.70** | Banco_Dados | `2846` | — | SELA PLATAFORMA | PECA |
| 3 | **0.64** | Banco_Dados | `1262` | — | COBERTURA P CRUZETA COM ISOL | UNIDADE |
| 4 | **0.64** | Banco_Dados | `1263` | — | COBERTURA P CRUZETA TIPO CURTA | UNIDADE |
| 5 | **0.64** | Banco_Dados | `1487` | — | CRUZETA AUXILIAR COMPLETA | CONJUNTO |

### `#233` — Sapatilha (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4055`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **1.00** | MATERIAL | `2964` | 2964 | SAPATILHA | PC |
| 2 | **0.80** | MATERIAL | `90440` | 2954 | MANILHA SAPATILHA | PC |
| 3 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 4 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 5 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |

### `#350` — Suporte Tipo L. (pç)
- cod_sap atual: `90521` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.88** | Banco_Dados | `1881` | — | GRAMPO COM SUPORTE TIPO L | PECA |
| 2 | **0.70** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 3 | **0.70** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 4 | **0.70** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |
| 5 | **0.64** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |

### `#349` — Conector Grampo de Linha-Viva com Estribo (pç)
- cod_sap atual: `92172` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.85** | MATERIAL | `90460` | 2940 | GRAMPO LINHA VIVA | PC |
| 2 | **0.67** | Banco_Dados | `2067` | — | KIT LINHA VIVA A DISTANCIA | PECA |
| 3 | **0.58** | Banco_Dados | `406` | — | BLOCO MOITAO LINHA VIVA TRI PLAST S/AMAR | PECA |
| 4 | **0.57** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |
| 5 | **0.57** | MATERIAL | `90471` | 200107 | CONECTOR TIPO I | PC |

### `#151` — Luva para haste para aterramento (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3622`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.85** | MATERIAL | `3887` | 3887 | LUVA EMENDA HASTE ATERRAMENTO PROLONGADA | PC |
| 2 | **0.64** | Banco_Dados | `1382` | — | CONJUNTO DE ATERRAMENTO | PECA |
| 3 | **0.64** | Banco_Dados | `1883` | — | GRAMPO DE ATERRAMENTO | UNIDADE |
| 4 | **0.64** | Banco_Dados | `2174` | — | LUVA DE SEGURANCA | PAR |
| 5 | **0.60** | Banco_Dados | `255` | — | ATERRAMENTO LINHA TRANSMISSAO | CONJUNTO |

### `#34` — Cabo de cobre coberto com XLPE - 15kv 16mm² (m)
- cod_sap atual: `590294` · cod_lider7: `3522`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.84** | MATERIAL | `90294` | — | CABO XLPE CU 16MM² 15KV | M |
| 2 | **0.51** | Banco_Dados | `1257` | — | COBERTURA ISOLANTE P CABO 15KV | METROS |
| 3 | **0.48** | Banco_Dados | `562` | — | CABO PROT. P/ JAMPER PROV.15KV | METROS |
| 4 | **0.42** | Banco_Dados | `563` | — | CABO PROTEGIDO 15KV REF: 3641 | METROS |
| 5 | **0.40** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |

### `#43` — Chave faca - tipo C-  36,2kV 400A-NBI 150KV (pç)
- cod_sap atual: `2808` · cod_lider7: `4016`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.80** | MATERIAL | `90553` | — | CHAVE FACA 36,2KV 400A | PC |
| 2 | **0.60** | MATERIAL | `90556` | — | CHAVE FACA 36,2KV 630A | PC |
| 3 | **0.57** | MATERIAL | `90548` | 78 | CHAVE FUSIVEL 36,2KV | PC |
| 4 | **0.54** | MATERIAL | `90299` | — | PORTA FUSIVEL C 36,2KV | PC |
| 5 | **0.49** | MATERIAL | `90550` | — | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV | PC |

### `#161` — Olhal para parafuso (pç)
- cod_sap atual: `502955` · cod_lider7: `3626`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.80** | Banco_Dados | `1882` | — | GRAMPO DE ATER PARAFUSO OLHAL | PECA |
| 2 | **0.70** | MATERIAL | `90448` | 2937 | GANCHO OLHAL | PC |
| 3 | **0.70** | Banco_Dados | `538` | — | CABECOTE OLHAL | UNIDADE |
| 4 | **0.70** | Banco_Dados | `2617` | — | PARAFUSO BORBOLETA | PECA |
| 5 | **0.64** | Banco_Dados | `1999` | — | JOGO DE EXTRATOR PARAFUSO | JOGO |

### `#343` — Pino Isolador Topo 419 mm. (pç)
- cod_sap atual: `90248` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.80** | Banco_Dados | `1945` | — | ISOLADOR DE PINO ALTURA DE 419 | UNIDADE |

### `#142` — Laço pré-formado de topo para cabo 1/0 AWG CAA (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3614`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.78** | MATERIAL | `90263` | — | CABO AL NU CAA 1/0 AWG | KG |
| 2 | **0.70** | MATERIAL | `90259` | — | CABO AL NU CA 1/0 AWG | KG |
| 3 | **0.66** | MATERIAL | `90430` | 2928 | EMENDA PARA CABO CAA 1/0AWG | PC |
| 4 | **0.66** | Banco_Dados | `3057` | — | TESOURAO P/ CORTE 1/0 AWG | PECA |
| 5 | **0.64** | Banco_Dados | `1956` | — | JAMPER RIGIDO BITOLA 1/0 AWG | UNIDADE |

### `#74` — CONECTOR CUNHA ESTRIBO NORMAL AL 4~2AWG EST2AWG (pç)
- cod_sap atual: `3166` · cod_lider7: `3556`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.77** | MATERIAL | `90345` | 3059 | ESTRIBO NORMAL AL 4-2AWG EST2AWG | PC |
| 2 | **0.59** | MATERIAL | `90347` | 361 | ESTRIBO NORMAL AL 3/0-4/0AWG EST2AWG | PC |
| 3 | **0.48** | MATERIAL | `3057` | 3057 | ESTRIBO NORMAL AL 1/0-2/0AWG EST2AWG | PC |
| 4 | **0.40** | MATERIAL | `159` | 159 | CONECTOR CN2 | PC |
| 5 | **0.40** | MATERIAL | `2917` | 2917 | CONECTOR CN4 | PC |

### `#136` — Isolador ancoragem - bastão polimérico 36kv (pç)
- cod_sap atual: `590279` · cod_lider7: `3607`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.76** | MATERIAL | `90279` | 2946 | ISOLADOR BASTAO SIL GO 36KV | PC |
| 2 | **0.55** | Banco_Dados | `1360` | — | CONJUNTO ATERRAMENTO 36KV | CONJUNTO |
| 3 | **0.53** | Banco_Dados | `1362` | — | CONJUNTO ATERRAMENTO MT 36KV | PECA |
| 4 | **0.51** | Banco_Dados | `1373` | — | CONJUNTO ATERRAMENTO TEMPORARIO LINHA DISTRIB ATE 36KV | CONJUNTO |
| 5 | **0.50** | Banco_Dados | `1375` | — | CONJUNTO ATERRAMENTO TEMPORARIO LINHA/REDE DISTRI ATE 36KV | PECA |

### `#135` — Isolador ancoragem - bastão polimérico 15kv (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3606`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.76** | MATERIAL | `90277` | 2945 | ISOLADOR BASTAO SIL GO 15KV | PC |
| 2 | **0.59** | MATERIAL | `90275` | 207 | ISOLADOR PINO POLIMERICO 15KV P60MM (COMPACTA) | PC |
| 3 | **0.55** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |
| 4 | **0.55** | Banco_Dados | `1314` | — | COBERTURA TIPO MANGUEIRA 15KV | PECA |
| 5 | **0.53** | MATERIAL | `90298` | — | PORTA FUSIVEL C 15KV | PC |

### `#42` — Chave faca - tipo C-  15kV 630A-NBI 95KV (pç)
- cod_sap atual: `3454` · cod_lider7: `3539`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.76** | MATERIAL | `90554` | — | CHAVE FACA 15KV 630A | PC |
| 2 | **0.49** | MATERIAL | `90551` | — | CHAVE FACA 15KV 400A | PC |
| 3 | **0.44** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |
| 4 | **0.43** | MATERIAL | `90556` | — | CHAVE FACA 36,2KV 630A | PC |
| 5 | **0.42** | MATERIAL | `90298` | — | PORTA FUSIVEL C 15KV | PC |

### `#147` — Laço pré-formado simples lateral para cabo 1/0 AWG CAA (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3618`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.75** | MATERIAL | `90263` | — | CABO AL NU CAA 1/0 AWG | KG |
| 2 | **0.68** | MATERIAL | `90259` | — | CABO AL NU CA 1/0 AWG | KG |
| 3 | **0.64** | MATERIAL | `90430` | 2928 | EMENDA PARA CABO CAA 1/0AWG | PC |
| 4 | **0.64** | Banco_Dados | `3057` | — | TESOURAO P/ CORTE 1/0 AWG | PECA |
| 5 | **0.63** | Banco_Dados | `1956` | — | JAMPER RIGIDO BITOLA 1/0 AWG | UNIDADE |

---

## 🟡 Média confiança (93)

Provavelmente bate. Confira números/medidas no top candidato.

### `#114` — Elo Fusível 10K (pç)
- cod_sap atual: `590504` · cod_lider7: `3594`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90504` | 3069 | ELO FUSIVEL K 10 | PC |
| 2 | **0.40** | MATERIAL | `90303` | 2879 | ALCA PREF SERV CA/CAA 10MM² | PC |
| 3 | **0.40** | MATERIAL | `90274` | — | CABO TRIPLEX CA 10+10MM²(BIFÁSICO) | M |
| 4 | **0.40** | MATERIAL | `90285` | — | CABO QUADRUPLEX CA 10+10MM² (TRIFÁSICO) | M |
| 5 | **0.40** | MATERIAL | `90791` | 2915 | CONECTOR CN10 | PC |

### `#339` — Sapatilha 3/8. (pç)
- cod_sap atual: `90409` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | Banco_Dados | `1437` | — | CORDA DE PROLIPROPILENO 3/8 | METROS |
| 2 | **0.70** | Banco_Dados | `967` | — | CHAVE DE FENDA 3/8 X 8 | UNIDADE |
| 3 | **0.70** | Banco_Dados | `1438` | — | CORDA EM FIBRA SINTETICA 3/8 | METROS |
| 4 | **0.70** | Banco_Dados | `1689` | — | ESTICADOR P/ CABO DE ACO 3/8 | PECA |
| 5 | **0.70** | Banco_Dados | `1848` | — | GARRA P/ CORDOALHA DE ACO 3/8 | PECA |

### `#104` — Elo Fusível 1H (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3587`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90498` | 3063 | ELO FUSIVEL H 1 | PC |
| 2 | **0.57** | MATERIAL | `3064` | 3064 | ELO FUSIVEL H 1,25 | PC |
| 3 | **0.57** | MATERIAL | `3065` | 3065 | ELO FUSIVEL H 1,75 | PC |
| 4 | **0.40** | MATERIAL | `90113` | 160 | CONECTOR CN1 | PC |
| 5 | **0.40** | Banco_Dados | `209` | — | ARMARIO BAIXO COM 1 PRATELEIRA REGULAVEL | PECA |

### `#107` — Elo Fusível 2H (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3590`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90499` | 3066 | ELO FUSIVEL H 2 | PC |
| 2 | **0.44** | MATERIAL | `90548` | 78 | CHAVE FUSIVEL 36,2KV | PC |
| 3 | **0.42** | MATERIAL | `90299` | — | PORTA FUSIVEL C 36,2KV | PC |
| 4 | **0.40** | MATERIAL | `2815` | 2815 | ALCA PREF DIS CA/CAA 2AWG | PC |
| 5 | **0.40** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |

### `#109` — Elo Fusível 3H (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3591`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90500` | 3067 | ELO FUSIVEL H 3 | PC |
| 2 | **0.42** | MATERIAL | `90549` | — | CHAVE FUSIVEL 3 OPERAÇÃO - 15KV | PC |
| 3 | **0.40** | MATERIAL | `90799` | 2904 | CONECTOR CN3 | PC |
| 4 | **0.40** | Banco_Dados | `153` | — | APLICADOR FILME STRETCH MANOPLA PVC 3" | CONJUNTO |
| 5 | **0.40** | Banco_Dados | `291` | — | BASE P/ ASSENTO LONGARINA 3 LUGARES | UNIDADE |

### `#111` — Elo Fusível 5H (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3592`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90501` | 3068 | ELO FUSIVEL H 5 | PC |
| 2 | **0.57** | MATERIAL | `90497` | 3061 | ELO FUSIVEL H 0,5 | PC |
| 3 | **0.40** | MATERIAL | `3352` | 3352 | CONECTOR CN5 | PC |
| 4 | **0.40** | Banco_Dados | `97` | — | ALICATE DECAPADOR FIO 5 " | PECA |
| 5 | **0.40** | Banco_Dados | `146` | — | ANDAIME MODULAR ISOLADO 5 M | PECA |

### `#112` — Elo Fusível 6K (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3593`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | MATERIAL | `90502` | 369 | ELO FUSIVEL K 6 | PC |
| 2 | **0.40** | MATERIAL | `90952` | 2814 | ALCA PREF DIS CA/CAA 6AWG | PC |
| 3 | **0.40** | MATERIAL | `90790` | 2916 | CONECTOR CN6 | PC |
| 4 | **0.40** | MATERIAL | `199` | 199 | EMENDA PARA CABO CAA 6AWG | PC |
| 5 | **0.40** | MATERIAL | `90391` | — | FIO AMARRAC NU 6AWG | KG |

### `#229` — Protetor de bucha de AT de transformador (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3666`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.74** | Banco_Dados | `1888` | — | GRAMPO PARA BUCHA DE TRANSFORMADOR | PECA |
| 2 | **0.74** | Banco_Dados | `1889` | — | GRAMPO PARA BUCHA TRANSFORMADOR | PECA |
| 3 | **0.57** | Banco_Dados | `2720` | — | PROTETOR FACIAL P/ CAPACETE | PECA |
| 4 | **0.57** | Banco_Dados | `2723` | — | PROTETOR PARA CORDA TALABARTE | PECA |
| 5 | **0.55** | Banco_Dados | `2037` | — | JUMPER TEMP P/  BUCHA DE TRAFO | PECA |

### `#33` — Cabo de aluminio  nu 336,4 CAA - AWG (kg)
- cod_sap atual: `621841` · cod_lider7: `4513`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.73** | MATERIAL | `90560` | 129 | CABO AL NU CAA 4 AWG | KG |
| 2 | **0.68** | MATERIAL | `90261` | — | CABO AL NU CA 336,4MCM | KG |
| 3 | **0.64** | MATERIAL | `13` | 13 | CABO AL NU CA 4 AWG | KG |
| 4 | **0.60** | MATERIAL | `90433` | 191 | EMENDA PARA CABO CA 336,4MCM | PC |
| 5 | **0.57** | MATERIAL | `90309` | 3158 | ALCA PREF DIS CA/CAA 336,4MCM | PC |

### `#7` — Alça pré formada  de distribuição para cabo CA - CAA 2 AWG (pç)
- cod_sap atual: `502815` · cod_lider7: `3492`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.72** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 2 | **0.64** | MATERIAL | `2815` | 2815 | ALCA PREF DIS CA/CAA 2AWG | PC |
| 3 | **0.58** | MATERIAL | `90429` | 190 | EMENDA PARA CABO CA 2AWG | PC |
| 4 | **0.58** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |
| 5 | **0.57** | MATERIAL | `90262` | — | CABO AL NU CAA 2AWG | KG |

### `#314` — Laço pré-formado de Distribuição CAA 1/0 AWG (pç)
- cod_sap atual: `90742` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.72** | MATERIAL | `90263` | — | CABO AL NU CAA 1/0 AWG | KG |
| 2 | **0.68** | Banco_Dados | `3057` | — | TESOURAO P/ CORTE 1/0 AWG | PECA |
| 3 | **0.66** | Banco_Dados | `1956` | — | JAMPER RIGIDO BITOLA 1/0 AWG | UNIDADE |
| 4 | **0.66** | Banco_Dados | `1962` | — | JAMPER TEMPORARIO ISOL 1/0 AWG | UNIDADE |
| 5 | **0.64** | MATERIAL | `90259` | — | CABO AL NU CA 1/0 AWG | KG |

### `#324` — Alça pré-formada distribuição CAA 1/0 AWG (pç)
- cod_sap atual: `90708` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.72** | MATERIAL | `90263` | — | CABO AL NU CAA 1/0 AWG | KG |
| 2 | **0.68** | Banco_Dados | `3057` | — | TESOURAO P/ CORTE 1/0 AWG | PECA |
| 3 | **0.66** | Banco_Dados | `1956` | — | JAMPER RIGIDO BITOLA 1/0 AWG | UNIDADE |
| 4 | **0.66** | Banco_Dados | `1962` | — | JAMPER TEMPORARIO ISOL 1/0 AWG | UNIDADE |
| 5 | **0.64** | MATERIAL | `90307` | 2816 | ALCA PREF DIS CA/CAA 1/0AWG | PC |

### `#351` — Suporte “TL”. (pç)
- cod_sap atual: `90655` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.70** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 2 | **0.70** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 3 | **0.70** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |
| 4 | **0.64** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 5 | **0.64** | Banco_Dados | `343` | — | BASTAO SUPORTE PARA JAMPE | PECA |

### `#241` — Suporte de Transformador em poste DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3671`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.70** | Banco_Dados | `1634` | — | ESPORA PARA SUBIR EM POSTE DT | PAR |
| 2 | **0.67** | Banco_Dados | `1494` | — | DEGRAU PORTATIL PARA ESCALADA EM POSTE DT | PECA |
| 3 | **0.60** | Banco_Dados | `2632` | — | PEGA POSTE | PECA |
| 4 | **0.60** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 5 | **0.60** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |

### `#134` — HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2400,0MM C/ RABICHO (pç)
- cod_sap atual: `503034` · cod_lider7: `3982`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.69** | MATERIAL | `90462` | 3034 | HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2,4M C/ RABICHO | PC |
| 2 | **0.48** | Banco_Dados | `1705` | — | ESTROPO DE ACO C/OLHAL 5/8 | UNIDADE |
| 3 | **0.43** | Banco_Dados | `929` | — | CHAVE COMBINADA 5/8 | PECA |
| 4 | **0.42** | Banco_Dados | `2927` | — | SOQUETE CURTO ESTRIADO 5/8 | PECA |
| 5 | **0.42** | Banco_Dados | `2929` | — | SOQUETE CURTO SEXT 5/8 | PECA |

### `#94` — Conector terminal tipo espada (bastão) para chave faca 336,4mcm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3965`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.69** | MATERIAL | `3146` | 3146 | TERMINAL ESPADA 2F 336,4MCM | PC |
| 2 | **0.58** | MATERIAL | `90433` | 191 | EMENDA PARA CABO CA 336,4MCM | PC |
| 3 | **0.57** | MATERIAL | `90261` | — | CABO AL NU CA 336,4MCM | KG |
| 4 | **0.56** | MATERIAL | `90309` | 3158 | ALCA PREF DIS CA/CAA 336,4MCM | PC |
| 5 | **0.55** | MATERIAL | `4145` | — | CJ CONECTOR ESTRIBO CAPA CABO 336,4MCM (185mm) | PC |

### `#48` — CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F COM FERRAGEM (pç)
- cod_sap atual: `615062` · cod_lider7: `4158`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.69** | MATERIAL | `90550` | — | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV | PC |
| 2 | **0.67** | MATERIAL | `90548` | 78 | CHAVE FUSIVEL 36,2KV | PC |
| 3 | **0.54** | MATERIAL | `90299` | — | PORTA FUSIVEL C 36,2KV | PC |
| 4 | **0.51** | MATERIAL | `90512` | — | LÂMINA DESLIGADORA BASE C 24,2/36,2KV 300A | PC |
| 5 | **0.51** | MATERIAL | `90553` | — | CHAVE FACA 36,2KV 400A | PC |

### `#49` — CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F SEM FERRAGEM (pç)
- cod_sap atual: `615062` · cod_lider7: `3538`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.69** | MATERIAL | `90550` | — | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV | PC |
| 2 | **0.67** | MATERIAL | `90548` | 78 | CHAVE FUSIVEL 36,2KV | PC |
| 3 | **0.54** | MATERIAL | `90299` | — | PORTA FUSIVEL C 36,2KV | PC |
| 4 | **0.51** | MATERIAL | `90512` | — | LÂMINA DESLIGADORA BASE C 24,2/36,2KV 300A | PC |
| 5 | **0.51** | MATERIAL | `90553` | — | CHAVE FACA 36,2KV 400A | PC |

### `#9` — Alça pré formada  de distribuição para cabo CA - CAA 4/0 AWG (pç)
- cod_sap atual: `3374` · cod_lider7: `3494`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.68** | MATERIAL | `90308` | 122 | ALCA PREF DIS CA/CAA 4/0AWG | PC |
| 2 | **0.64** | MATERIAL | `90432` | 193 | EMENDA PARA CABO CA 4/0AWG | PC |
| 3 | **0.64** | MATERIAL | `90438` | 197 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 4 | **0.63** | MATERIAL | `90260` | 133 | CABO AL NU CA 4/0AWG | KG |
| 5 | **0.63** | MATERIAL | `90264` | — | CABO AL NU CAA 4/0AWG | KG |

### `#118` — Emenda Total Preformada CA - CAA 2 AWG (pç)
- cod_sap atual: `502929` · cod_lider7: `3577`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.68** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 2 | **0.62** | MATERIAL | `90429` | 190 | EMENDA PARA CABO CA 2AWG | PC |
| 3 | **0.62** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |
| 4 | **0.58** | MATERIAL | `2815` | 2815 | ALCA PREF DIS CA/CAA 2AWG | PC |
| 5 | **0.57** | MATERIAL | `90437` | 2927 | EMENDA PARA CABO CA 2/0AWG | PC |

### `#141` — Laço pré-formado de topo para cabo 2 AWG CAA (pç)
- cod_sap atual: `502948` · cod_lider7: `3615`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.66** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 2 | **0.60** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |
| 3 | **0.58** | MATERIAL | `90262` | — | CABO AL NU CAA 2AWG | KG |
| 4 | **0.54** | MATERIAL | `3802` | 3802 | EMENDA PARA CABO CAA 2/0AWG | PC |
| 5 | **0.52** | MATERIAL | `127` | 127 | CABO AL NU CAA 2/0AWG | KG |

### `#143` — Laço pré-formado de topo para cabo 4/0 AWG CAA (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3617`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.66** | MATERIAL | `90438` | 197 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 2 | **0.64** | MATERIAL | `90264` | — | CABO AL NU CAA 4/0AWG | KG |
| 3 | **0.63** | Banco_Dados | `3039` | — | TERMINAL PINO RETO COBRE  4/0 AWG | UNIDADE |
| 4 | **0.60** | MATERIAL | `90320` | 211 | LACO PREF TOPO CA/CAA 4/0AWG P60MM | PC |
| 5 | **0.59** | MATERIAL | `90560` | 129 | CABO AL NU CAA 4 AWG | KG |

### `#37` — Cabo de cobre nú 50mm² (m)
- cod_sap atual: `626275` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90266` | — | CABO AL PROT CA 50MM² (COMPACTA) | M |
| 2 | **0.40** | Banco_Dados | `415` | — | BOIA SALVA-VIDAS CIRCULAR 50 CM | PECA |
| 3 | **0.40** | Banco_Dados | `477` | — | BOMBONA OVAL PEAD BR 50L | PECA |
| 4 | **0.40** | Banco_Dados | `573` | — | CADEADO HASTE CURTA 50MM | PECA |
| 5 | **0.40** | Banco_Dados | `1026` | — | CHAVE ESTRELA DE BATER 50MM | UNIDADE |

### `#124` — Espaçador de isoladores (pç)
- cod_sap atual: `4092` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | Banco_Dados | `541` | — | CABECOTE P APLICAR ESPACADOR | PECA |
| 2 | **0.55** | Banco_Dados | `552` | — | CABECOTE VARA MANOBRA ESPACADOR REDE SEC | PECA |
| 3 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 4 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 5 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |

### `#146` — Laço pré-formado simples lateral para cabo 2 AWG CAA (pç)
- cod_sap atual: `502952` · cod_lider7: `3619`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 2 | **0.58** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |
| 3 | **0.57** | MATERIAL | `90262` | — | CABO AL NU CAA 2AWG | KG |
| 4 | **0.52** | MATERIAL | `3802` | 3802 | EMENDA PARA CABO CAA 2/0AWG | PC |
| 5 | **0.51** | MATERIAL | `127` | 127 | CABO AL NU CAA 2/0AWG | KG |

### `#201` — Poste de concreto armada - 10/150 DT (pç)
- cod_sap atual: `3008` · cod_lider7: `4174`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90193` | — | POSTE DT 10M 150DAN | PC |
| 2 | **0.52** | Banco_Dados | `486` | — | BROCA CONCRETO MET DURO 10,000X 150,0MM | PECA |
| 3 | **0.52** | MATERIAL | `2989` | 2989 | POSTE CIRCULAR 10M 150DAN | PC |
| 4 | **0.44** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |

### `#203` — Poste de concreto armada - 10/600 DT (pç)
- cod_sap atual: `2998` · cod_lider7: `3712`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |
| 3 | **0.44** | MATERIAL | `90193` | — | POSTE DT 10M 150DAN | PC |
| 4 | **0.44** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `238` | 238 | POSTE DT 10M 1000DAN | PC |

### `#206` — Poste de concreto armada - 11/300 DT (pç)
- cod_sap atual: `2999` · cod_lider7: `3657`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90198` | — | POSTE DT 11M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `2991` | 2991 | POSTE CIRCULAR 11M 300DAN | PC |
| 3 | **0.50** | MATERIAL | `670114` | 670114 | POSTE MADEIRA LEI 11M 300DAN MEDIO | PC |
| 4 | **0.44** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `3009` | 3009 | POSTE DT 11M 200DAN | PC |

### `#207` — Poste de concreto armada - 11/600 DT (pç)
- cod_sap atual: `3000` · cod_lider7: `3658`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90199` | — | POSTE DT 11M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90186` | — | POSTE CIRCULAR 11M 600DAN | PC |
| 3 | **0.44** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |
| 4 | **0.44** | MATERIAL | `3009` | 3009 | POSTE DT 11M 200DAN | PC |
| 5 | **0.44** | MATERIAL | `90198` | — | POSTE DT 11M 300DAN | PC |

### `#308` — Suporte P/Isolador Pilar. (pç)
- cod_sap atual: `90524` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 2 | **0.64** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 3 | **0.64** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |
| 4 | **0.60** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 5 | **0.60** | Banco_Dados | `343` | — | BASTAO SUPORTE PARA JAMPE | PECA |

### `#315` — Laço pré-formado de Distribuição CAA 4/0 AWG (pç)
- cod_sap atual: `90745` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | Banco_Dados | `3039` | — | TERMINAL PINO RETO COBRE  4/0 AWG | UNIDADE |
| 2 | **0.60** | Banco_Dados | `1951` | — | JAMPE TEMPORARIO 4/0 | UNIDADE |
| 3 | **0.58** | MATERIAL | `90438` | 197 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 4 | **0.58** | Banco_Dados | `1961` | — | JAMPER TEMPORARIO 15KV 4/0 AWG | UNIDADE |
| 5 | **0.57** | MATERIAL | `90264` | — | CABO AL NU CAA 4/0AWG | KG |

### `#325` — Alça pré-formada distribuição CAA 4/0 AWG (pç)
- cod_sap atual: `90711` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90308` | 122 | ALCA PREF DIS CA/CAA 4/0AWG | PC |
| 2 | **0.64** | Banco_Dados | `3039` | — | TERMINAL PINO RETO COBRE  4/0 AWG | UNIDADE |
| 3 | **0.60** | Banco_Dados | `1951` | — | JAMPE TEMPORARIO 4/0 | UNIDADE |
| 4 | **0.58** | MATERIAL | `90438` | 197 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 5 | **0.58** | Banco_Dados | `1961` | — | JAMPER TEMPORARIO 15KV 4/0 AWG | UNIDADE |

### `#93` — Conector perfurante 25-120 mm² X 25-120 mm² (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3567`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90353` | 2922 | CONECTOR PERFURANTE 25X120MM² (BT) | PC |

### `#139` — Isolador pimentão (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4182`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | Banco_Dados | `1308` | — | COBERTURA PROTETORA P ISOLADOR | UNIDADE |
| 2 | **0.64** | Banco_Dados | `1310` | — | COBERTURA PROTETORA P/ISOLADOR | UNIDADE |
| 3 | **0.64** | Banco_Dados | `1838` | — | GANCHO P ISOLADOR EM ALUMINIO | UNIDADE |
| 4 | **0.64** | Banco_Dados | `2705` | — | PRESILIA DE SUSPENSAO SEM ISOLADOR | PECA |
| 5 | **0.60** | Banco_Dados | `1349` | — | CONJ. COBERTURA PROT ISOLADOR | UNIDADE |

### `#148` — Laço pré-formado simples lateral para cabo 4/0 AWG CAA (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3621`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90438` | 197 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 2 | **0.63** | MATERIAL | `90264` | — | CABO AL NU CAA 4/0AWG | KG |
| 3 | **0.61** | Banco_Dados | `3039` | — | TERMINAL PINO RETO COBRE  4/0 AWG | UNIDADE |
| 4 | **0.59** | MATERIAL | `90330` | 2951 | LACO PREF LATERAL CA/CAA 4/0AWG P60MM | PC |
| 5 | **0.57** | Banco_Dados | `1951` | — | JAMPE TEMPORARIO 4/0 | UNIDADE |

### `#192` — Parafuso de rosca dupla de 600 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | Banco_Dados | `2387` | — | MESA KALO 600 X 600 MM | UNIDADE |
| 2 | **0.63** | MATERIAL | `3017` | 3017 | PARAFUSO ROSCA DUPLA AC 16X600MM | PC |
| 3 | **0.62** | Banco_Dados | `2389` | — | MESA LATERAL 600 X 600 X 600 MM AMAZONIA | UNIDADE |
| 4 | **0.53** | Banco_Dados | `1753` | — | FERRAMENTA ABERT.DE JUMP 600 A | PECA |
| 5 | **0.47** | Banco_Dados | `593` | — | CADEIRA 1631E PRO FIT 600 X 600 MM | UNIDADE |

### `#195` — Pára-raios de distribuição - 30kV - polimérico - 10kA (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3646`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90212` | 3030 | PARA RAIO DISTR POLIM 30KV 10KA | PC |
| 2 | **0.40** | Banco_Dados | `841` | — | CHAVE AJUSTAVEL STD CRO-VA VDE 30MM 10" | PECA |
| 3 | **0.40** | Banco_Dados | `2758` | — | REGULADOR GAS CILINDRO 10-30MBAR 30L/MIN | PECA |

### `#202` — Poste de concreto armada - 10/300 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4190`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 3 | **0.51** | MATERIAL | `234` | 234 | POSTE POLIMERICO FBV 10M 300DAN | PC |
| 4 | **0.50** | MATERIAL | `670112` | 670112 | POSTE MADEIRA LEI 10M 300DAN MEDIO | PC |
| 5 | **0.44** | MATERIAL | `90193` | — | POSTE DT 10M 150DAN | PC |

### `#209` — Poste de concreto armada - 12/300 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3660`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90202` | — | POSTE DT 12M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `228` | 228 | POSTE CIRCULAR 12M 300DAN | PC |
| 3 | **0.48** | Banco_Dados | `1986` | — | JOGO DE BROCAS DE CONCRETO COM 12 PECAS | CAIXA |
| 4 | **0.44** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `90198` | — | POSTE DT 11M 300DAN | PC |

### `#210` — Poste de concreto armada - 12/600 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3661`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90203` | — | POSTE DT 12M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90189` | — | POSTE CIRCULAR 12M 600DAN | PC |
| 3 | **0.48** | Banco_Dados | `1986` | — | JOGO DE BROCAS DE CONCRETO COM 12 PECAS | CAIXA |
| 4 | **0.44** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |
| 5 | **0.44** | MATERIAL | `90199` | — | POSTE DT 11M 600DAN | PC |

### `#211` — Poste de concreto armada - 12/1000 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3659`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90200` | — | POSTE DT 12M 1000DAN | PC |
| 2 | **0.52** | MATERIAL | `90187` | — | POSTE CIRCULAR 12M 1000DAN | PC |
| 3 | **0.48** | Banco_Dados | `1986` | — | JOGO DE BROCAS DE CONCRETO COM 12 PECAS | CAIXA |
| 4 | **0.44** | MATERIAL | `238` | 238 | POSTE DT 10M 1000DAN | PC |
| 5 | **0.44** | MATERIAL | `90196` | — | POSTE DT 11M 1000DAN | PC |

### `#214` — Poste de concreto armada - 13/1000 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4298`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90204` | — | POSTE DT 13M 1000DAN | PC |
| 2 | **0.44** | MATERIAL | `238` | 238 | POSTE DT 10M 1000DAN | PC |
| 3 | **0.44** | MATERIAL | `90196` | — | POSTE DT 11M 1000DAN | PC |
| 4 | **0.44** | MATERIAL | `90200` | — | POSTE DT 12M 1000DAN | PC |
| 5 | **0.40** | Banco_Dados | `33` | — | ALCOOL 1000 ML | PECA |

### `#215` — Poste de concreto armada circular- 10/150 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4174`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `2989` | 2989 | POSTE CIRCULAR 10M 150DAN | PC |
| 2 | **0.52** | Banco_Dados | `486` | — | BROCA CONCRETO MET DURO 10,000X 150,0MM | PECA |
| 3 | **0.52** | MATERIAL | `90193` | — | POSTE DT 10M 150DAN | PC |
| 4 | **0.44** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |

### `#216` — Poste de concreto armada circular- 10/300 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4043`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 3 | **0.51** | MATERIAL | `234` | 234 | POSTE POLIMERICO FBV 10M 300DAN | PC |
| 4 | **0.50** | MATERIAL | `670112` | 670112 | POSTE MADEIRA LEI 10M 300DAN MEDIO | PC |
| 5 | **0.44** | MATERIAL | `2989` | 2989 | POSTE CIRCULAR 10M 150DAN | PC |

### `#217` — Poste de concreto armada circular- 10/600 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3663`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |
| 3 | **0.44** | MATERIAL | `2989` | 2989 | POSTE CIRCULAR 10M 150DAN | PC |
| 4 | **0.44** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `2995` | 2995 | POSTE CIRCULAR 10M 1000DAN | PC |

### `#218` — Poste de concreto armada circular- 10/1000 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3662`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `2995` | 2995 | POSTE CIRCULAR 10M 1000DAN | PC |
| 2 | **0.52** | MATERIAL | `238` | 238 | POSTE DT 10M 1000DAN | PC |
| 3 | **0.44** | MATERIAL | `2989` | 2989 | POSTE CIRCULAR 10M 150DAN | PC |
| 4 | **0.44** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |

### `#219` — Poste de concreto armada circular- 11/200 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3656`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `2990` | 2990 | POSTE CIRCULAR 11M 200DAN | PC |
| 2 | **0.52** | MATERIAL | `3009` | 3009 | POSTE DT 11M 200DAN | PC |
| 3 | **0.44** | MATERIAL | `2991` | 2991 | POSTE CIRCULAR 11M 300DAN | PC |
| 4 | **0.44** | MATERIAL | `90186` | — | POSTE CIRCULAR 11M 600DAN | PC |
| 5 | **0.44** | MATERIAL | `90184` | — | POSTE CIRCULAR 11M 1000DAN | PC |

### `#220` — Poste de concreto armada circular- 11/300 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4044`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `2991` | 2991 | POSTE CIRCULAR 11M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `90198` | — | POSTE DT 11M 300DAN | PC |
| 3 | **0.50** | MATERIAL | `670114` | 670114 | POSTE MADEIRA LEI 11M 300DAN MEDIO | PC |
| 4 | **0.44** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `2990` | 2990 | POSTE CIRCULAR 11M 200DAN | PC |

### `#221` — Poste de concreto armada circular- 11/600 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3665`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90186` | — | POSTE CIRCULAR 11M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90199` | — | POSTE DT 11M 600DAN | PC |
| 3 | **0.44** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |
| 4 | **0.44** | MATERIAL | `2990` | 2990 | POSTE CIRCULAR 11M 200DAN | PC |
| 5 | **0.44** | MATERIAL | `2991` | 2991 | POSTE CIRCULAR 11M 300DAN | PC |

### `#223` — Poste de concreto armada circular- 12/300 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3660`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `228` | 228 | POSTE CIRCULAR 12M 300DAN | PC |
| 2 | **0.52** | MATERIAL | `90202` | — | POSTE DT 12M 300DAN | PC |
| 3 | **0.48** | Banco_Dados | `1986` | — | JOGO DE BROCAS DE CONCRETO COM 12 PECAS | CAIXA |
| 4 | **0.44** | MATERIAL | `227` | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 5 | **0.44** | MATERIAL | `2991` | 2991 | POSTE CIRCULAR 11M 300DAN | PC |

### `#224` — Poste de concreto armada circular- 12/600 (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3661`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.64** | MATERIAL | `90189` | — | POSTE CIRCULAR 12M 600DAN | PC |
| 2 | **0.52** | MATERIAL | `90203` | — | POSTE DT 12M 600DAN | PC |
| 3 | **0.48** | Banco_Dados | `1986` | — | JOGO DE BROCAS DE CONCRETO COM 12 PECAS | CAIXA |
| 4 | **0.44** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |
| 5 | **0.44** | MATERIAL | `90186` | — | POSTE CIRCULAR 11M 600DAN | PC |

### `#188` — Parafuso de rosca dupla de 400 mm (pç)
- cod_sap atual: `503014` · cod_lider7: `3639`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.63** | MATERIAL | `90379` | 3014 | PARAFUSO ROSCA DUPLA AC 16X400MM | PC |
| 2 | **0.53** | Banco_Dados | `2129` | — | LIXA DAGUA - GRAO 400 | PECA |
| 3 | **0.40** | Banco_Dados | `404` | — | BLOCO MOITAO DUPLO LEVE 400DAN | UNIDADE |
| 4 | **0.40** | Banco_Dados | `405` | — | BLOCO MOITAO DUPLO LEVE 400DAN | UNIDADE |
| 5 | **0.40** | Banco_Dados | `802` | — | CARRO TRANSP IND PLATAF ACO CARB 400KG | PECA |

### `#189` — Parafuso de rosca dupla de 450 mm (pç)
- cod_sap atual: `503013` · cod_lider7: `3640`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.63** | MATERIAL | `3013` | 3013 | PARAFUSO ROSCA DUPLA AC 16X450MM | PC |
| 2 | **0.40** | Banco_Dados | `218` | — | ARMARIO DE COZINHA 1820 X 300 X 450 MM | UNIDADE |
| 3 | **0.40** | Banco_Dados | `1480` | — | CORTA VERGALHAO ACF 450MM | PECA |

### `#190` — Parafuso de rosca dupla de 500 mm (pç)
- cod_sap atual: `503015` · cod_lider7: `3641`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.63** | MATERIAL | `3015` | 3015 | PARAFUSO ROSCA DUPLA AC 16X500MM | PC |
| 2 | **0.53** | Banco_Dados | `1383` | — | CONJUNTO DE ATERRAMENTO 500 KV | UNIDADE |
| 3 | **0.53** | Banco_Dados | `2627` | — | PASTA CRISTAL 500 G | PECA |
| 4 | **0.52** | Banco_Dados | `1517` | — | DETECTOR DE TENSAO CLASSE 500 KV | UNIDADE |
| 5 | **0.52** | Banco_Dados | `2362` | — | MESA CONTROLADORA ANALOGICA VT 500 | PECA |

### `#191` — Parafuso de rosca dupla de 550 mm (pç)
- cod_sap atual: `503016` · cod_lider7: `3642`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.63** | MATERIAL | `3016` | 3016 | PARAFUSO ROSCA DUPLA AC 16X550MM | PC |
| 2 | **0.47** | Banco_Dados | `1559` | — | DISTANCIADOR ISOL ESCADA 550 X 290 MM | UNIDADE |

### `#187` — Parafuso de rosca dupla de 350 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3638`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.63** | MATERIAL | `90378` | 3012 | PARAFUSO ROSCA DUPLA AC 16X350MM | PC |
| 2 | **0.53** | Banco_Dados | `2769` | — | ROCADEIRA FS 350 STIHL | PECA |
| 3 | **0.40** | MATERIAL | `90236` | 2985 | CINTA POSTE CIRC  350MM | PC |
| 4 | **0.40** | Banco_Dados | `1547` | — | DISCO LIMPADOR VERDE 350MM | PECA |
| 5 | **0.40** | Banco_Dados | `2733` | — | PUNCAO DE CENTRO 350-5 | UNIDADE |

### `#197` — Pino auto-travante AC 168,5mm para isolador pilar (pç)
- cod_sap atual: `590251` · cod_lider7: `3649`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | MATERIAL | `90251` | 2960 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 168,5MM | PC |
| 2 | **0.50** | MATERIAL | `90251` | 2960 | PINO ISOL AUTO TRAV. AC 16,0MM 28,5X 140X 168,5MM | PC |
| 3 | **0.42** | MATERIAL | `90621` | 2961 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 228,5MM | PC |
| 4 | **0.42** | MATERIAL | `90622` | 2962 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 278,5MM | PC |

### `#198` — Pino auto-travante AC 228,5mm para isolador pilar (pç)
- cod_sap atual: `502961` · cod_lider7: `4194`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | MATERIAL | `90621` | 2961 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 228,5MM | PC |
| 2 | **0.50** | MATERIAL | `90252` | 2961 | PINO ISOL AUTO TRAV. AC 16,0MM 28,5X 200X 228,5MM | PC |
| 3 | **0.42** | MATERIAL | `90251` | 2960 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 168,5MM | PC |
| 4 | **0.42** | MATERIAL | `90622` | 2962 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 278,5MM | PC |

### `#25` — Cabo Aluminio triplex Xlpe 25 mm² (m)
- cod_sap atual: `590283` · cod_lider7: `3514`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | MATERIAL | `90283` | 2895 | CABO TRIPLEX CA 25+25MM²(BIFÁSICO) | M |
| 2 | **0.52** | MATERIAL | `90508` | 3071 | ELO FUSIVEL K 25 | PC |
| 3 | **0.52** | Banco_Dados | `537` | — | CABECOTE MANOBRA COM ANGULO 25 | PECA |
| 4 | **0.52** | Banco_Dados | `1258` | — | COBERTURA ISOLANTE P CABO 25KV | METROS |
| 5 | **0.51** | MATERIAL | `90287` | — | CABO QUADRUPLEX CA 25+25MM²  (TRIFÁSICO) | M |

### `#186` — Parafuso de cabeça abaulada de 200 mm p/ poste circ (pç)
- cod_sap atual: `3984` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | MATERIAL | `90219` | 2973 | CINTA POSTE CIRC  200MM | PC |
| 2 | **0.52** | Banco_Dados | `3112` | — | UNIMATIC 200 HD | UNIDADE |
| 3 | **0.51** | Banco_Dados | `252` | — | ASSENTO OSCILANTE CATG-200 | UNIDADE |
| 4 | **0.51** | Banco_Dados | `1197` | — | CILINDRO HIDRAULICO 200 TN | PECA |
| 5 | **0.45** | MATERIAL | `630419` | 630419 | SUPORTE TRAFO POSTE CIRC SAE1020 200MM | PC |

### `#340` — Cordoalha de Aço Carbono 9,5 mm (pç)
- cod_sap atual: `91716` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | Banco_Dados | `2166` | — | LUVA DE BORRACHA ISOLANTE, 9,5 | PECA |
| 2 | **0.62** | Banco_Dados | `2170` | — | LUVA DE COBERTURA TAM: 9,5 | PAR |
| 3 | **0.62** | Banco_Dados | `2186` | — | LUVA DE VAQUETA TAM 9.5 | PAR |
| 4 | **0.60** | Banco_Dados | `2214` | — | LUVA ISOLANTE P/AT TAM 9,5 | PAR |
| 5 | **0.49** | Banco_Dados | `3045` | — | TESOURA CORTA CABO AC TMP 9,5MM² | PECA |

### `#246` — Suporte para isolador pilar em poste circular (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4105`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.62** | Banco_Dados | `288` | — | BASE CIRCULAR FIXACAO ISOLADOR LINE POST | PECA |
| 2 | **0.57** | Banco_Dados | `2632` | — | PEGA POSTE | PECA |
| 3 | **0.57** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 4 | **0.57** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 5 | **0.57** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |

### `#1` — Afastador para isolador pilar (pç)
- cod_sap atual: `3752` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | Banco_Dados | `1308` | — | COBERTURA PROTETORA P ISOLADOR | UNIDADE |
| 2 | **0.60** | Banco_Dados | `1310` | — | COBERTURA PROTETORA P/ISOLADOR | UNIDADE |
| 3 | **0.60** | Banco_Dados | `1838` | — | GANCHO P ISOLADOR EM ALUMINIO | UNIDADE |
| 4 | **0.60** | Banco_Dados | `2705` | — | PRESILIA DE SUSPENSAO SEM ISOLADOR | PECA |
| 5 | **0.57** | Banco_Dados | `1349` | — | CONJ. COBERTURA PROT ISOLADOR | UNIDADE |

### `#6` — Alça pré formada de serviço para cabo triplex 25mm² (pç)
- cod_sap atual: `2880` · cod_lider7: `3490`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | MATERIAL | `90283` | 2895 | CABO TRIPLEX CA 25+25MM²(BIFÁSICO) | M |
| 2 | **0.51** | Banco_Dados | `1258` | — | COBERTURA ISOLANTE P CABO 25KV | METROS |
| 3 | **0.50** | MATERIAL | `90287` | — | CABO QUADRUPLEX CA 25+25MM²  (TRIFÁSICO) | M |
| 4 | **0.40** | MATERIAL | `90508` | 3071 | ELO FUSIVEL K 25 | PC |
| 5 | **0.40** | Banco_Dados | `537` | — | CABECOTE MANOBRA COM ANGULO 25 | PECA |

### `#354` — Capa Protetora de Para-Raios (pç)
- cod_sap atual: `90969` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | Banco_Dados | `733` | — | CAPA P/ PROTECAO DO GLV | PECA |
| 2 | **0.60** | Banco_Dados | `1304` | — | COBERTURA PROTETORA P CARCACA | UNIDADE |
| 3 | **0.60** | Banco_Dados | `1306` | — | COBERTURA PROTETORA P CONDUTOR | PECA |
| 4 | **0.60** | Banco_Dados | `1307` | — | COBERTURA PROTETORA P CONDUTOR | PECA |
| 5 | **0.60** | Banco_Dados | `1308` | — | COBERTURA PROTETORA P ISOLADOR | UNIDADE |

### `#102` — Elo Fusível 0,50H (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3585`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | MATERIAL | `3060` | 3060 | ELO FUSIVEL H 0,25 | PC |
| 2 | **0.60** | MATERIAL | `90497` | 3061 | ELO FUSIVEL H 0,5 | PC |
| 3 | **0.60** | MATERIAL | `3062` | 3062 | ELO FUSIVEL H 0,75 | PC |
| 4 | **0.43** | Banco_Dados | `987` | — | CHAVE DE FENDA TOCO 8,0 X 50MM | PECA |

### `#140` — Isolador roldana 76x79mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3613`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | MATERIAL | `90295` | 3079 | ISOLADOR ROLDANA 80X76MM | PC |

### `#248` — Suporte TL para Chave Faca (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4019`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | Banco_Dados | `855` | — | CHAVE AZUL | PECA |
| 2 | **0.60** | Banco_Dados | `1737` | — | FACA DESENCAPADORA | PECA |
| 3 | **0.60** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 4 | **0.60** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 5 | **0.60** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |

### `#99` — Eletroduto de PVC rígido 12mm² x 300cm (1/2" x 3m) (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3580`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.60** | MATERIAL | `35797` | — | ELETRODUTO PVC 1/2" | PC |
| 2 | **0.46** | Banco_Dados | `564` | — | CABO T 12" ENCAIXE 1/2" | PECA |
| 3 | **0.42** | Banco_Dados | `20` | — | ADAPTADOR CHAVE SOQUETE 3/4" P/ 1/2" | PECA |
| 4 | **0.41** | Banco_Dados | `1157` | — | CHAVE PHIL COT PP 3/16X1.1/2" | PECA |
| 5 | **0.41** | Banco_Dados | `1458` | — | CORDA PP BRANCA 3 PERNAS 1/2" 2010KGF | METROS |

### `#29` — Cabo de aço galvanizado - 7,9 mm² (cordoalha) (m)
- cod_sap atual: `3357` · cod_lider7: `3517`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.58** | Banco_Dados | `996` | — | CHAVE DE SEGURANCA COM PERFIL LOBULAR 7,9 | UNIDADE |
| 2 | **0.58** | Banco_Dados | `999` | — | CHAVE DO PARAFUSO LOBULAR 7,9 (CORTE) | PECA |
| 3 | **0.53** | MATERIAL | `90256` | 222 | CORDOALHA ACO CARB CL A 7 FIOS MR 9,5MM 6160 DAN | M |

### `#307` — Laço pré-formado de Distribuição CAA 2 AWG (pç)
- cod_sap atual: `90741` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.58** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 2 | **0.51** | MATERIAL | `90499` | 3066 | ELO FUSIVEL H 2 | PC |
| 3 | **0.51** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |
| 4 | **0.51** | Banco_Dados | `219` | — | ARMARIO DIRETOR 2 PORTAS | UNIDADE |
| 5 | **0.51** | Banco_Dados | `375` | — | BASTAO UNIVERSAL COM 2 CABECOT | UNIDADE |

### `#319` — Alça pré-formada distribuição CAA 2 AWG (pç)
- cod_sap atual: `90707` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.58** | MATERIAL | `2815` | 2815 | ALCA PREF DIS CA/CAA 2AWG | PC |
| 2 | **0.58** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |
| 3 | **0.52** | MATERIAL | `113` | 113 | ALCA PREF DIS CA/CAA 2/0AWG | PC |
| 4 | **0.51** | MATERIAL | `90499` | 3066 | ELO FUSIVEL H 2 | PC |
| 5 | **0.51** | MATERIAL | `90429` | 2929 | EMENDA PARA CABO CAA 2AWG | PC |

### `#180` — Parafuso de cabeça quadrada - 250mm (pç)
- cod_sap atual: `590363` · cod_lider7: `3635`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | Banco_Dados | `1600` | — | ESCOVA DE ACO 250MM | UNIDADE |
| 2 | **0.55** | MATERIAL | `90223` | 220 | CINTA POSTE CIRC  250MM | PC |
| 3 | **0.55** | Banco_Dados | `342` | — | BASTAO SUPORTE ISOLANTE 250MM | PECA |
| 4 | **0.53** | MATERIAL | `90363` | 3087 | PARAFUSO CAB QUADRADA AC 16X250MM | PC |
| 5 | **0.40** | Banco_Dados | `2585` | — | PAPEL HIG. ROLO 250  - SULLEG | ROLO |

### `#247` — Suporte ( chapa "T" ) para isolador tipo pilar (pç)
- cod_sap atual: `503021` · cod_lider7: `3672`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | Banco_Dados | `2956` | — | SUPORTE DE CONCHA | PECA |
| 2 | **0.57** | Banco_Dados | `2963` | — | SUPORTE ISOLADO | PECA |
| 3 | **0.57** | Banco_Dados | `2970` | — | SUPORTE PARA CPU | PECA |
| 4 | **0.55** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 5 | **0.55** | Banco_Dados | `343` | — | BASTAO SUPORTE PARA JAMPE | PECA |

### `#355` — Capa Protetora para Chaves Fusíveis (pç)
- cod_sap atual: `693918` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | Banco_Dados | `733` | — | CAPA P/ PROTECAO DO GLV | PECA |
| 2 | **0.57** | Banco_Dados | `1304` | — | COBERTURA PROTETORA P CARCACA | UNIDADE |
| 3 | **0.57** | Banco_Dados | `1306` | — | COBERTURA PROTETORA P CONDUTOR | PECA |
| 4 | **0.57** | Banco_Dados | `1307` | — | COBERTURA PROTETORA P CONDUTOR | PECA |
| 5 | **0.57** | Banco_Dados | `1308` | — | COBERTURA PROTETORA P ISOLADOR | UNIDADE |

### `#38` — Caixa tubo de concreto para aterramento de padrão (m)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4357`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | MATERIAL | `90585` | 3018 | PLACA CONCRETO | PC |
| 2 | **0.57** | Banco_Dados | `1382` | — | CONJUNTO DE ATERRAMENTO | PECA |
| 3 | **0.57** | Banco_Dados | `1883` | — | GRAMPO DE ATERRAMENTO | UNIDADE |
| 4 | **0.57** | Banco_Dados | `2649` | — | PLATAFORMA PADRAO | UNIDADE |
| 5 | **0.55** | Banco_Dados | `255` | — | ATERRAMENTO LINHA TRANSMISSAO | CONJUNTO |

### `#331` — Pino para Isolador Tipo Cruzeta 24,2/36,2 kV (pç)
- cod_sap atual: `90250` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | MATERIAL | `90512` | — | LÂMINA DESLIGADORA BASE C 24,2/36,2KV 300A | PC |
| 2 | **0.44** | Banco_Dados | `1188` | — | CHAVE TUBO AMERICANO FOFO 2.1/2 24 | PECA |
| 3 | **0.43** | MATERIAL | `90548` | 78 | CHAVE FUSIVEL 36,2KV | PC |
| 4 | **0.42** | MATERIAL | `90299` | — | PORTA FUSIVEL C 36,2KV | PC |
| 5 | **0.41** | Banco_Dados | `3109` | — | TROLE TRILHO 2AJ ASTM A - 36 ACO CARBONO | PECA |

### `#338` — Cordoalha Aço SM 9,5mm. (pç)
- cod_sap atual: `91714` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | MATERIAL | `90256` | 222 | CORDOALHA ACO CARB CL A 7 FIOS MR 9,5MM 6160 DAN | M |
| 2 | **0.52** | Banco_Dados | `2166` | — | LUVA DE BORRACHA ISOLANTE, 9,5 | PECA |
| 3 | **0.52** | Banco_Dados | `2170` | — | LUVA DE COBERTURA TAM: 9,5 | PAR |
| 4 | **0.52** | Banco_Dados | `2186` | — | LUVA DE VAQUETA TAM 9.5 | PAR |
| 5 | **0.52** | Banco_Dados | `2864` | — | SERRA COPO 3" HSSB 9,5MM CONS | PECA |

### `#95` — Conector de  Aterramento - 5/8" (reforçado) (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3569`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.57** | MATERIAL | `90638` | 3097 | HASTE ATERRAMENTO PROLONGADA 5/8" 2,4M | PC |
| 2 | **0.57** | MATERIAL | `90462` | 3035 | HASTE ATERRAMENTO NORMAL 5/8" 2,4M | PC |
| 3 | **0.53** | Banco_Dados | `929` | — | CHAVE COMBINADA 5/8 | PECA |
| 4 | **0.52** | MATERIAL | `3227` | 3227 | CONECTOR ATER CUN INOX HT 5/8"/CB4-2A | PC |
| 5 | **0.52** | Banco_Dados | `2927` | — | SOQUETE CURTO ESTRIADO 5/8 | PECA |

### `#3` — Alça pré-formada de estai p/ cabo de aço -7,9 mm (pç)
- cod_sap atual: `4239` · cod_lider7: `3495`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.56** | Banco_Dados | `996` | — | CHAVE DE SEGURANCA COM PERFIL LOBULAR 7,9 | UNIDADE |
| 2 | **0.56** | Banco_Dados | `999` | — | CHAVE DO PARAFUSO LOBULAR 7,9 (CORTE) | PECA |
| 3 | **0.45** | MATERIAL | `90256` | 222 | CORDOALHA ACO CARB CL A 7 FIOS MR 9,5MM 6160 DAN | M |
| 4 | **0.44** | Banco_Dados | `871` | — | CHAVE CANHAO ISOLADA 7 MM | UNIDADE |
| 5 | **0.40** | MATERIAL | `90012` | 2882 | ALCA PREFORMADA CABO ACO STD 7,94MM  890,0MM | PC |

### `#153` — Mão francesa plana de 619 mm (pç)
- cod_sap atual: `590443` · cod_lider7: `3625`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.56** | MATERIAL | `90443` | 3011 | MAO FRANCESA PLANA AC 619X32X5MM | PC |

### `#316` — Laço pré-formado de Distribuição CAA 336,4 MCM (pç)
- cod_sap atual: `90746` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.56** | MATERIAL | `90309` | 3158 | ALCA PREF DIS CA/CAA 336,4MCM | PC |
| 2 | **0.49** | MATERIAL | `90433` | 191 | EMENDA PARA CABO CA 336,4MCM | PC |
| 3 | **0.49** | MATERIAL | `90261` | — | CABO AL NU CA 336,4MCM | KG |
| 4 | **0.44** | MATERIAL | `90560` | 129 | CABO AL NU CAA 4 AWG | KG |
| 5 | **0.41** | MATERIAL | `3146` | 3146 | TERMINAL ESPADA 2F 336,4MCM | PC |

### `#54` — Cinta circular de Ø 180 mm (pç)
- cod_sap atual: `590217` · cod_lider7: `3544`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | Banco_Dados | `2146` | — | LIXA PARA FERRO 180 | UNIDADE |
| 2 | **0.53** | MATERIAL | `90217` | 2971 | CINTA POSTE CIRC  180MM | PC |
| 3 | **0.52** | Banco_Dados | `2127` | — | LIXA D AGUA GRAO 180 | UNIDADE |
| 4 | **0.40** | Banco_Dados | `798` | — | CARRO TRANSP IND ARMAZEM ACO CARB 180KG | UNIDADE |
| 5 | **0.40** | Banco_Dados | `2131` | — | LIXA DAGUA 180 300X300MM | UNIDADE |

### `#179` — Parafuso de cabeça quadrada - 200mm (pç)
- cod_sap atual: `590362` · cod_lider7: `3634`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `90219` | 2973 | CINTA POSTE CIRC  200MM | PC |
| 2 | **0.55** | Banco_Dados | `409` | — | BLOCO PADRAO INDIVIDUAL 200MM | PECA |
| 3 | **0.53** | MATERIAL | `90362` | 3086 | PARAFUSO CAB QUADRADA AC 16X200MM | PC |
| 4 | **0.40** | Banco_Dados | `252` | — | ASSENTO OSCILANTE CATG-200 | UNIDADE |
| 5 | **0.40** | Banco_Dados | `799` | — | CARRO TRANSP IND ARMAZEM ACO CARB 200KG | PECA |

### `#181` — Parafuso de cabeça quadrada - 300mm (pç)
- cod_sap atual: `590364` · cod_lider7: `3636`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `90226` | 2981 | CINTA POSTE CIRC  300MM | PC |
| 2 | **0.55** | Banco_Dados | `1266` | — | COBERTURA P/ POSTE-COMP. 300MM | PECA |
| 3 | **0.55** | Banco_Dados | `2294` | — | MARTELO MARCENEIRO 300G 300MM | PECA |
| 4 | **0.55** | Banco_Dados | `2296` | — | MARTELO PENA 300G 300MM | PECA |
| 5 | **0.53** | MATERIAL | `90364` | 3088 | PARAFUSO CAB QUADRADA AC 16X300MM | PC |

### `#344` — Cruzeta de Eucalipto 5 metros. (pç)
- cod_sap atual: `691622` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `90501` | 3068 | ELO FUSIVEL H 5 | PC |
| 2 | **0.55** | Banco_Dados | `853` | — | CHAVE ALLEN ISOL NO 5 | PECA |
| 3 | **0.55** | Banco_Dados | `1622` | — | ESMERILHADEIRA ANGULAR INDUSTRIAL 5 POL | UNIDADE |
| 4 | **0.55** | Banco_Dados | `2582` | — | PANO MULTIUSO COM 5 UNIDADES | UNIDADE |
| 5 | **0.53** | Banco_Dados | `97` | — | ALICATE DECAPADOR FIO 5 " | PECA |

### `#345` — Poste de Eucalipto 12 metros. (pç)
- cod_sap atual: `690903` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | Banco_Dados | `54` | — | ALICATE BOMBA DAGUA 12 | PECA |
| 2 | **0.55** | Banco_Dados | `134` | — | ALICATE TIPO BOMBA DAGUA 12 | PECA |
| 3 | **0.55** | Banco_Dados | `167` | — | ARCO DE SERRA PARA METAIS 12 | PECA |
| 4 | **0.55** | Banco_Dados | `1133` | — | CHAVE INGLESA ISOLADA DE 12 | UNIDADE |
| 5 | **0.55** | Banco_Dados | `2122` | — | LIMA REDONDA MURCA 12 POL | UNIDADE |

### `#115` — Elo Fusível (CALCULAR CAPACIDADE) (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | Banco_Dados | `1479` | — | CORRENTE ZINCADA ELO CURTO | PECA |
| 2 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 3 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 4 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 5 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |

### `#131` — Haste âncora para estai (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3980`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `3887` | 3887 | LUVA EMENDA HASTE ATERRAMENTO PROLONGADA | PC |
| 2 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 3 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 4 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 5 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |

### `#177` — Parafuso de cabeça quadrada - 150mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3633`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `90230` | 2968 | CINTA POSTE CIRC  150MM | PC |
| 2 | **0.53** | MATERIAL | `90361` | 3085 | PARAFUSO CAB QUADRADA AC 16X150MM | PC |
| 3 | **0.40** | MATERIAL | `2887` | 2887 | CABO AL PROT CA 150MM² (COMPACTA) | M |
| 4 | **0.40** | MATERIAL | `90374` | 3083 | PARAFUSO CAB ABAULADA AC 16X150MM | PC |
| 5 | **0.40** | Banco_Dados | `387` | — | BEBEDOURO INDUSTRIAL 150 LITRO | UNIDADE |

### `#182` — Parafuso de cabeça quadrada - 350mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3637`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | MATERIAL | `90236` | 2985 | CINTA POSTE CIRC  350MM | PC |
| 2 | **0.55** | Banco_Dados | `1547` | — | DISCO LIMPADOR VERDE 350MM | PECA |
| 3 | **0.53** | MATERIAL | `90365` | 3089 | PARAFUSO CAB QUADRADA AC 16X350MM | PC |
| 4 | **0.40** | MATERIAL | `90378` | 3012 | PARAFUSO ROSCA DUPLA AC 16X350MM | PC |
| 5 | **0.40** | Banco_Dados | `2769` | — | ROCADEIRA FS 350 STIHL | PECA |

### `#183` — Parafuso de cabeça quadrada - 400mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | Banco_Dados | `902` | — | CHAVE CATRACA MUNHAO 400MM | UNIDADE |
| 2 | **0.53** | MATERIAL | `90366` | 3092 | PARAFUSO CAB QUADRADA AC 16X400MM | PC |
| 3 | **0.40** | MATERIAL | `90379` | 3014 | PARAFUSO ROSCA DUPLA AC 16X400MM | PC |
| 4 | **0.40** | Banco_Dados | `404` | — | BLOCO MOITAO DUPLO LEVE 400DAN | UNIDADE |
| 5 | **0.40** | Banco_Dados | `405` | — | BLOCO MOITAO DUPLO LEVE 400DAN | UNIDADE |

### `#245` — Suporte T para chave fusível 800mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3674`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.55** | Banco_Dados | `1707` | — | ESTROPO DE NYLON 800MM | UNIDADE |
| 2 | **0.40** | Banco_Dados | `1715` | — | ESTROPO POLIAMIDA 800MM 462KGF | PECA |
| 3 | **0.40** | Banco_Dados | `1716` | — | ESTROPO POLIAMIDA 800MM 670KGF | PECA |
| 4 | **0.40** | Banco_Dados | `1913` | — | GUINCHO WORK 800 PARA ICAMENTO | UNIDADE |
| 5 | **0.40** | Banco_Dados | `2480` | — | MODULO ANDAIME ISOL TUBO FBV 800KV | PECA |

---

## 🔴 Baixa confiança (109)

Pouca chance. Só aceitar se a descrição realmente bater.

### `#336` — Arruela Quadrada 14,0 mm x32,0 mm x 3 mm. (pç)
- cod_sap atual: `90535` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.54** | Banco_Dados | `2599` | — | PARAFUSA/FURADEI 14,4V -3.0 AH | PECA |
| 2 | **0.44** | Banco_Dados | `117` | — | ALICATE PARA ANEIS EXTERNOS PONTA CURVA 3,0 A 10,0 MM | PECA |
| 3 | **0.40** | Banco_Dados | `2915` | — | SOFA BIPARTIDO 3,50 X 0,90 M SOLARES CRU | UNIDADE |

### `#24` — Cabo Aluminio triplex Xlpe 16 mm² (m)
- cod_sap atual: `90282` · cod_lider7: `3513`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | Banco_Dados | `1738` | — | FACAO 16 COM BAINHA | PECA |
| 2 | **0.52** | Banco_Dados | `2790` | — | ROUPEIRO EM ACO 16 PORTAS | UNIDADE |
| 3 | **0.50** | Banco_Dados | `1123` | — | CHAVE FIXA UMA BOCA ISOL 16 | PECA |
| 4 | **0.48** | MATERIAL | `90294` | — | CABO XLPE CU 16MM² 15KV | M |
| 5 | **0.45** | MATERIAL | `90449` | 3942 | GRAMPO ANC CABO COBERTO 14-16 MM | PC |

### `#41` — Chapa, fixação de estai, aço carbono zincado a quente (pç)
- cod_sap atual: `90517` · cod_lider7: `4018`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | Banco_Dados | `212` | — | ARMARIO DE ACO | PECA |
| 2 | **0.52** | Banco_Dados | `217` | — | ARMARIO DE ACO, FECHADO | PECA |
| 3 | **0.52** | Banco_Dados | `1482` | — | CORTADOR DE CABO DE ACO | PECA |
| 4 | **0.52** | Banco_Dados | `1628` | — | ESPATULA DE ACO LAMINADO | UNIDADE |
| 5 | **0.52** | Banco_Dados | `1656` | — | ESTANTE DE ACO FECHADA | UNIDADE |

### `#52` — Cinta circular de Ø 160 mm (pç)
- cod_sap atual: `590215` · cod_lider7: `3542`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90215` | 2969 | CINTA POSTE CIRC  160MM | PC |
| 2 | **0.52** | Banco_Dados | `2306` | — | MATA CACHORRO MOT BROZ 160 | PECA |
| 3 | **0.42** | Banco_Dados | `72` | — | ALICATE CORTE ESP UNIV ACO CARB 1000V S/LIMIT 160 MM | PECA |

### `#53` — Cinta circular de Ø 170 mm (pç)
- cod_sap atual: `590216` · cod_lider7: `3543`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90216` | 2970 | CINTA POSTE CIRC  170MM | PC |
| 2 | **0.49** | Banco_Dados | `1284` | — | COBERTURA PROT ESP LOSANG RDC F TEC 170 | PECA |
| 3 | **0.49** | Banco_Dados | `1290` | — | COBERTURA PROT SUP C ISOL RDC F TEC 170 | PECA |

### `#55` — Cinta circular de Ø 190 mm (pç)
- cod_sap atual: `502972` · cod_lider7: `3545`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90218` | 2972 | CINTA POSTE CIRC  190MM | PC |

### `#97` — CRUZETA POSTE CONCR QUADR 90X90MM 2000MM (pç)
- cod_sap atual: `590401` · cod_lider7: `3571`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90401` | 3179 | CRUZETA CONCRETO 2000MM | PC |
| 2 | **0.40** | Banco_Dados | `2981` | — | TALABARTE DE POSICIONAMENTO 2000MM | UNIDADE |
| 3 | **0.40** | Banco_Dados | `2992` | — | TALABARTE POLIESTER 2000MM | PECA |

### `#138` — Isolador pilar 36kv - 170kv (pç)
- cod_sap atual: `502944` · cod_lider7: `3610`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90279` | 2946 | ISOLADOR BASTAO SIL GO 36KV | PC |
| 2 | **0.44** | Banco_Dados | `1360` | — | CONJUNTO ATERRAMENTO 36KV | CONJUNTO |
| 3 | **0.42** | Banco_Dados | `1362` | — | CONJUNTO ATERRAMENTO MT 36KV | PECA |

### `#176` — Parafuso de cabeça quadrada - 125mm (pç)
- cod_sap atual: `590360` · cod_lider7: `3632`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90360` | 3084 | PARAFUSO CAB QUADRADA AC 16X125MM | PC |

### `#352` — Condutor de Aço Cobreado 25 mm². (pç)
- cod_sap atual: `92024` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90508` | 3071 | ELO FUSIVEL K 25 | PC |
| 2 | **0.53** | Banco_Dados | `537` | — | CABECOTE MANOBRA COM ANGULO 25 | PECA |
| 3 | **0.53** | Banco_Dados | `1285` | — | COBERTURA PROT P CONDUTOR 25MM | UNIDADE |
| 4 | **0.50** | Banco_Dados | `1916` | — | IDENTIFICADOR VAZADO ALFABETO COMUM ACO CARBONO 25MM | CONJUNTO |
| 5 | **0.50** | Banco_Dados | `1917` | — | IDENTIFICADOR VAZADO ALGARISMO COMUM ACO CARBONO 25MM | CONJUNTO |

### `#129` — Fita Isolante Preta 10mts (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3601`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | Banco_Dados | `391` | — | BERCO ISOLANTE SIMPLE 10 ISOL. | PECA |
| 2 | **0.53** | Banco_Dados | `3103` | — | TRENA FITA MOLA 10M ACO | PECA |
| 3 | **0.40** | MATERIAL | `90303` | 2879 | ALCA PREF SERV CA/CAA 10MM² | PC |
| 4 | **0.40** | MATERIAL | `90274` | — | CABO TRIPLEX CA 10+10MM²(BIFÁSICO) | M |
| 5 | **0.40** | MATERIAL | `90285` | — | CABO QUADRUPLEX CA 10+10MM² (TRIFÁSICO) | M |

### `#137` — Isolador pilar 15kv - 110kv (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3609`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.53** | MATERIAL | `90277` | 2945 | ISOLADOR BASTAO SIL GO 15KV | PC |
| 2 | **0.47** | MATERIAL | `208` | 208 | ISOLADOR PINO POR 15KV P57MM | PC |
| 3 | **0.44** | MATERIAL | `90275` | 207 | ISOLADOR PINO POLIMERICO 15KV P60MM (COMPACTA) | PC |
| 4 | **0.44** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |
| 5 | **0.44** | Banco_Dados | `1314` | — | COBERTURA TIPO MANGUEIRA 15KV | PECA |

### `#36` — Cabo de cobre flexivel isolado - 10mm² (m)
- cod_sap atual: `623945` · cod_lider7: `3523`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `90274` | — | CABO TRIPLEX CA 10+10MM²(BIFÁSICO) | M |
| 2 | **0.52** | MATERIAL | `90285` | — | CABO QUADRUPLEX CA 10+10MM² (TRIFÁSICO) | M |
| 3 | **0.51** | MATERIAL | `90303` | 2879 | ALCA PREF SERV CA/CAA 10MM² | PC |
| 4 | **0.51** | Banco_Dados | `3095` | — | TRAVA QUEDAS RETRATIL 10M CABO DE ACO | PECA |
| 5 | **0.50** | Banco_Dados | `3096` | — | TRAVA QUEDAS RETRATIL COM 10 M CABO DE ACO | PECA |

### `#89` — Conector, cunha, liga de Alumínio, CN 13, série vermelho (pç)
- cod_sap atual: `502914` · cod_lider7: `3555`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `90797` | 2914 | CONECTOR CN13 | PC |
| 2 | **0.49** | Banco_Dados | `1004` | — | CHAVE ESTRELA 13 MM ISOLADA | PECA |
| 3 | **0.40** | Banco_Dados | `865` | — | CHAVE CANHAO ISOLADA 13MM | UNIDADE |
| 4 | **0.40** | Banco_Dados | `910` | — | CHAVE COMB ACR 13MM INCL | PECA |
| 5 | **0.40** | Banco_Dados | `923` | — | CHAVE COMBINADA 13MM | UNIDADE |

### `#328` — Porca Quadra Pesada Aço Carbono M16. (pç)
- cod_sap atual: `90388` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | Banco_Dados | `2790` | — | ROUPEIRO EM ACO 16 PORTAS | UNIDADE |
| 2 | **0.40** | MATERIAL | `161` | 161 | CONECTOR CN16 | PC |
| 3 | **0.40** | Banco_Dados | `261` | — | BAINHA FACAO COURO 16" | UNIDADE |
| 4 | **0.40** | Banco_Dados | `1123` | — | CHAVE FIXA UMA BOCA ISOL 16 | PECA |
| 5 | **0.40** | Banco_Dados | `1676` | — | ESTICADOR ARQUEAR 16MM | PECA |

### `#84` — Conector, cunha, liga de Alumínio, CN 3, série azul (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4294`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `90799` | 2904 | CONECTOR CN3 | PC |
| 2 | **0.50** | MATERIAL | `90500` | 3067 | ELO FUSIVEL H 3 | PC |
| 3 | **0.50** | Banco_Dados | `2157` | — | LONGARINA 3 LUGARES - BRANCA | PECA |
| 4 | **0.50** | Banco_Dados | `2158` | — | LONGARINA 3 LUGARES - LARANJA | UNIDADE |
| 5 | **0.50** | Banco_Dados | `2159` | — | LONGARINA 3 LUGARES LARANJA | PECA |

### `#85` — Conector, cunha, liga de Alumínio, CN 4, série azul (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4104`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `2917` | 2917 | CONECTOR CN4 | PC |
| 2 | **0.51** | Banco_Dados | `2647` | — | PLATAFORMA 4 PRANCHAS | CONJUNTO |
| 3 | **0.50** | Banco_Dados | `94` | — | ALICATE DE CRIMPAGEM P/ RJ-4 | UNIDADE |
| 4 | **0.50** | Banco_Dados | `241` | — | ARMARIO ROUPEIRO R-4 | UNIDADE |
| 5 | **0.50** | Banco_Dados | `836` | — | CHAVE AJUSTAVEL STANDARD 4 POL | PECA |

### `#86` — Conector, cunha, liga de Alumínio, CN 6, série azul (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4133`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `90790` | 2916 | CONECTOR CN6 | PC |
| 2 | **0.50** | MATERIAL | `90502` | 369 | ELO FUSIVEL K 6 | PC |
| 3 | **0.50** | Banco_Dados | `81` | — | ALICATE DE BICO CHATO 6 | PECA |
| 4 | **0.50** | Banco_Dados | `83` | — | ALICATE DE COMPRESSAO 6 TON | UNIDADE |
| 5 | **0.50** | Banco_Dados | `89` | — | ALICATE DE CORTE DIAGONAL 6 | UNIDADE |

### `#87` — Conector, cunha, liga de Alumínio, CN 10, série azul (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3553`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.52** | MATERIAL | `90791` | 2915 | CONECTOR CN10 | PC |
| 2 | **0.50** | MATERIAL | `90504` | 3069 | ELO FUSIVEL K 10 | PC |
| 3 | **0.50** | Banco_Dados | `53` | — | ALICATE BOMBA DAGUA 10 | PECA |
| 4 | **0.50** | Banco_Dados | `851` | — | CHAVE ALLEN ISOL NO 10 | PECA |
| 5 | **0.50** | Banco_Dados | `2168` | — | LUVA DE COBERTURA TAM: 10 | PAR |

### `#313` — Poste de Concreto Distribuição DT 13 m (pç)
- cod_sap atual: `90206` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1004` | — | CHAVE ESTRELA 13 MM ISOLADA | PECA |
| 2 | **0.51** | MATERIAL | `90204` | — | POSTE DT 13M 1000DAN | PC |
| 3 | **0.40** | MATERIAL | `90797` | 2914 | CONECTOR CN13 | PC |
| 4 | **0.40** | Banco_Dados | `865` | — | CHAVE CANHAO ISOLADA 13MM | UNIDADE |
| 5 | **0.40** | Banco_Dados | `910` | — | CHAVE COMB ACR 13MM INCL | PECA |

### `#236` — Suporte de transformador em poste circular –Ø-210 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3670`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | MATERIAL | `90231` | 219 | CINTA POSTE CIRC  210MM | PC |
| 2 | **0.51** | Banco_Dados | `648` | — | CADEIRA PRESIDENTE 210 GB | PECA |
| 3 | **0.45** | MATERIAL | `90425` | 3036 | SUPORTE TRAFO POSTE CIRC SAE1020 210MM | PC |
| 4 | **0.40** | Banco_Dados | `2669` | — | POLTRONA PRESID.GIR.PRETO-210G | PECA |

### `#238` — Suporte de transformador em poste circular –Ø-250 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3670`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | MATERIAL | `90223` | 220 | CINTA POSTE CIRC  250MM | PC |
| 2 | **0.51** | Banco_Dados | `342` | — | BASTAO SUPORTE ISOLANTE 250MM | PECA |
| 3 | **0.51** | Banco_Dados | `2633` | — | PEGA POSTE T T  250L | PECA |
| 4 | **0.51** | Banco_Dados | `2791` | — | SABAO COCO 250 G | PECA |
| 5 | **0.50** | Banco_Dados | `2585` | — | PAPEL HIG. ROLO 250  - SULLEG | ROLO |

### `#240` — Suporte de transformador em poste circular –Ø-270 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3670`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | MATERIAL | `90224` | 2978 | CINTA POSTE CIRC  270MM | PC |
| 2 | **0.45** | MATERIAL | `90532` | 3040 | SUPORTE TRAFO POSTE CIRC SAE1020 270MM | PC |
| 3 | **0.44** | Banco_Dados | `1562` | — | DIVISORIA FRONTAL PARA ESTACAO 1200 X 270 MM | UNIDADE |
| 4 | **0.44** | Banco_Dados | `1563` | — | DIVISORIA LATERAL PARA ESTACAO 600 X 270 MM | UNIDADE |

### `#260` — Transformador Trifásico - 34.5KV - 15KVA - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3705`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#262` — Transformador Trifásico -  34.5KV - 30KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3708`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#264` — Transformador Trifásico -  34.5KV - 45KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3709`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#266` — Transformador Trifásico -  34.5KV - 75KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3710`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#270` — Transformador Trifásico -  34.5KV - 150KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3704`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#272` — Transformador Trifásico -  34.5KV - 225KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3706`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#274` — Transformador Trifásico -  34.5KV - 300KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3707`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#276` — Transformador Trifásico -  34.5KV - 15KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#278` — Transformador Trifásico -  34.5KV - 30KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#280` — Transformador Trifásico -  34.5KV - 45KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4282`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#282` — Transformador Trifásico -  34.5KV - 75KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4284`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#286` — Transformador Trifásico -  34.5KV - 150KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4164`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#288` — Transformador Trifásico -  34.5KV - 225KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4159`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#290` — Transformador Trifásico -  34.5KV - 300KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.51** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 3 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 4 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#46` — CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A COM FERRAGEM (pç)
- cod_sap atual: `4157` · cod_lider7: `4157`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `90542` | 2884 | BRACO SUPORTE TIPO C FOFO 15,0KV | PC |
| 2 | **0.45** | Banco_Dados | `937` | — | CHAVE COMBINADA INCLINADA 15,0X 214MM | PECA |
| 3 | **0.45** | Banco_Dados | `946` | — | CHAVE COMBINADA PLANA 15,0X 180MM | PECA |
| 4 | **0.44** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |
| 5 | **0.42** | MATERIAL | `90506` | 3070 | ELO FUSIVEL K 15 | PC |

### `#47` — CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A SEM FERRAGEM (pç)
- cod_sap atual: `4157` · cod_lider7: `3537`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `90542` | 2884 | BRACO SUPORTE TIPO C FOFO 15,0KV | PC |
| 2 | **0.45** | Banco_Dados | `937` | — | CHAVE COMBINADA INCLINADA 15,0X 214MM | PECA |
| 3 | **0.45** | Banco_Dados | `946` | — | CHAVE COMBINADA PLANA 15,0X 180MM | PECA |
| 4 | **0.44** | MATERIAL | `90547` | — | CHAVE FUSIVEL 15KV | PC |
| 5 | **0.42** | MATERIAL | `90506` | 3070 | ELO FUSIVEL K 15 | PC |

### `#310` — Parafuso Rosca Total M16 x 200 mm (pç)
- cod_sap atual: `90375` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `90362` | 3086 | PARAFUSO CAB QUADRADA AC 16X200MM | PC |
| 2 | **0.44** | Banco_Dados | `52` | — | ALICATE BICO RETO TELEFONE 200 MM X 8 POL | PECA |
| 3 | **0.40** | MATERIAL | `90377` | 4336 | PARAFUSO ROSCA DUPLA AC 16X300MM | PC |
| 4 | **0.40** | MATERIAL | `90378` | 3012 | PARAFUSO ROSCA DUPLA AC 16X350MM | PC |
| 5 | **0.40** | MATERIAL | `90379` | 3014 | PARAFUSO ROSCA DUPLA AC 16X400MM | PC |

### `#311` — Parafuso Rosca Total M16 x 250 mm (pç)
- cod_sap atual: `90376` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `90363` | 3087 | PARAFUSO CAB QUADRADA AC 16X250MM | PC |
| 2 | **0.48** | Banco_Dados | `491` | — | BROCA DIAMETRO DE 250 X 1200 MM | UNIDADE |
| 3 | **0.40** | MATERIAL | `90377` | 4336 | PARAFUSO ROSCA DUPLA AC 16X300MM | PC |
| 4 | **0.40** | MATERIAL | `90378` | 3012 | PARAFUSO ROSCA DUPLA AC 16X350MM | PC |
| 5 | **0.40** | MATERIAL | `90379` | 3014 | PARAFUSO ROSCA DUPLA AC 16X400MM | PC |

### `#27` — Cabo Aluminio triplex Xlpe 50 mm² (m)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `90266` | — | CABO AL PROT CA 50MM² (COMPACTA) | M |
| 2 | **0.50** | Banco_Dados | `415` | — | BOIA SALVA-VIDAS CIRCULAR 50 CM | PECA |
| 3 | **0.50** | Banco_Dados | `3100` | — | TRENA FITA MANIVELA ARCO 50 M | PECA |
| 4 | **0.49** | Banco_Dados | `1965` | — | JAPONA MASC TREVIRA BG/PT TAM 50 | PECA |
| 5 | **0.47** | Banco_Dados | `556` | — | CABO DE MADEIRA PARA  ENXADA 1,50 MT | UNIDADE |

### `#122` — Emenda Total Preformada Fio Aluministeel N8 awg Convencional (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.50** | MATERIAL | `2930` | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 2 | **0.40** | MATERIAL | `4009` | 4009 | CONECTOR CN8 | PC |
| 3 | **0.40** | Banco_Dados | `44` | — | ALICATE BELZER 8 | PECA |
| 4 | **0.40** | Banco_Dados | `55` | — | ALICATE BOMBA DAGUA 8 POL | PECA |
| 5 | **0.40** | Banco_Dados | `99` | — | ALICATE DESENCAPADOR AUTOMATICO 8 POL | PECA |

### `#73` — Concreto para base em poste ≥ 600daN (Cimento, areia, brita e m.o) (und)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4085`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.49** | Banco_Dados | `1267` | — | COBERTURA P/ POSTE-COMP.600MM | PECA |
| 2 | **0.45** | MATERIAL | `90183` | — | POSTE CIRCULAR 10M 600DAN | PC |
| 3 | **0.45** | MATERIAL | `90186` | — | POSTE CIRCULAR 11M 600DAN | PC |
| 4 | **0.45** | MATERIAL | `90189` | — | POSTE CIRCULAR 12M 600DAN | PC |
| 5 | **0.45** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |

### `#317` — Isolador Tipo Pilar Porcelana Vertical 24,2 kV (pç)
- cod_sap atual: `90254` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.49** | Banco_Dados | `1188` | — | CHAVE TUBO AMERICANO FOFO 2.1/2 24 | PECA |
| 2 | **0.42** | MATERIAL | `90512` | — | LÂMINA DESLIGADORA BASE C 24,2/36,2KV 300A | PC |
| 3 | **0.41** | MATERIAL | `90278` | — | ISOLADOR SUSP BASTÃO POLIM GARF-OLHAL 440MM 625MM 24,2KV | PÇ |

### `#268` — Transformador Trifásico -  34.5KV - 112,5KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3703`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.49** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.48** | MATERIAL | `90048` | 317 | TRAFO TRIFÁSICO 15KV 112,5KVA | UN. |
| 3 | **0.48** | MATERIAL | `90078` | 319 | TRAFO TRIFÁSICO 36KV 112,5KVA | UN. |
| 4 | **0.43** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |

### `#284` — Transformador Trifásico -  34.5KV - 112,5KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3711`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.49** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 2 | **0.48** | MATERIAL | `90048` | 317 | TRAFO TRIFÁSICO 15KV 112,5KVA | UN. |
| 3 | **0.48** | MATERIAL | `90078` | 319 | TRAFO TRIFÁSICO 36KV 112,5KVA | UN. |
| 4 | **0.43** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 5 | **0.41** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |

### `#251` — Transformador monofásico - 13.8KV - 10KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3686`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.48** | MATERIAL | `90210` | 2956 | PARA RAIO DISTR POLIM 13,8KV 10KA | PC |
| 2 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 3 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#78` — Conector derivação para linha viva - 6-250 (GLV) (pç)
- cod_sap atual: `502940` · cod_lider7: `3557`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.48** | Banco_Dados | `901` | — | CHAVE CATRACA LINHA VIVA RM4455-6 | PECA |
| 2 | **0.40** | MATERIAL | `90790` | 2916 | CONECTOR CN6 | PC |

### `#5` — Alça pré formada de serviço para cabo triplex 16mm² (pç)
- cod_sap atual: `116` · cod_lider7: `3489`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.47** | MATERIAL | `90294` | — | CABO XLPE CU 16MM² 15KV | M |
| 2 | **0.40** | MATERIAL | `161` | 161 | CONECTOR CN16 | PC |
| 3 | **0.40** | Banco_Dados | `261` | — | BAINHA FACAO COURO 16" | UNIDADE |
| 4 | **0.40** | Banco_Dados | `1123` | — | CHAVE FIXA UMA BOCA ISOL 16 | PECA |
| 5 | **0.40** | Banco_Dados | `1676` | — | ESTICADOR ARQUEAR 16MM | PECA |

### `#332` — Cruzeta de Distribuição de Concreto Retangular 2.400 mm (CA II) (pç)
- cod_sap atual: `90662` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.47** | Banco_Dados | `1866` | — | GAVETEIRO SUSPENSO 2 GAVETAS 400 X 460 X 280 MM | UNIDADE |
| 2 | **0.43** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |

### `#335` — Cruzeta de Distribuição de Concreto T 2.400 mm (CA II) (pç)
- cod_sap atual: `91384` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.47** | Banco_Dados | `1866` | — | GAVETEIRO SUSPENSO 2 GAVETAS 400 X 460 X 280 MM | UNIDADE |
| 2 | **0.43** | MATERIAL | `90258` | — | CABO AL NU CA 2 AWG | KG |

### `#267` — Transformador Trifásico - 13.8KV - 112,5KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3695`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90048` | 317 | TRAFO TRIFÁSICO 15KV 112,5KVA | UN. |
| 2 | **0.45** | MATERIAL | `90078` | 319 | TRAFO TRIFÁSICO 36KV 112,5KVA | UN. |
| 3 | **0.40** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |

### `#283` — Transformador Trifásico - 13.8KV - 112,5KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4126`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90048` | 317 | TRAFO TRIFÁSICO 15KV 112,5KVA | UN. |
| 2 | **0.45** | MATERIAL | `90078` | 319 | TRAFO TRIFÁSICO 36KV 112,5KVA | UN. |
| 3 | **0.40** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |

### `#237` — Suporte de transformador em poste circular –Ø-225 mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3670`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `5363` | 3037 | SUPORTE TRAFO POSTE CIRC SAE1020 225MM | PC |

### `#249` — Transformador monofásico - 13.8KV - 05KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3685`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#250` — Transformador monofásico - 34.5KV - 05KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4180`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 2 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 3 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 4 | **0.41** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#252` — Transformador monofásico - 34.5KV - 10KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3691`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 2 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 3 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 4 | **0.41** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#253` — Transformador monofásico - 13.8KV - 15KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3687`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#254` — Transformador monofásico - 34.5KV - 15KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4191`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 2 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 3 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 4 | **0.41** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#255` — Transformador monofásico - 13.8KV - 25KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3688`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#256` — Transformador monofásico - 34.5KV - 25KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3693`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 2 | **0.43** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |
| 3 | **0.41** | MATERIAL | `90525` | 3021 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 4 | **0.41** | Banco_Dados | `1385` | — | CONJUNTO DE ATERRAMENTO TEMPORARIO TRIFASICO ATE 34.5KV | PECA |
| 5 | **0.41** | Banco_Dados | `1749` | — | FERRAMENTA ABERT CIRCUITO LOADBUSTER 34,5KV | PECA |

### `#259` — Transformador Trifásico - 13.8KV - 15KVA - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3697`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#261` — Transformador Trifásico - 13.8KV - 30KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3700`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#263` — Transformador Trifásico - 13.8KV - 45KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3701`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#265` — Transformador Trifásico - 13.8KV - 75KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3702`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#269` — Transformador Trifásico - 13.8KV - 150KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3696`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#271` — Transformador Trifásico - 13.8KV - 225KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3698`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#273` — Transformador Trifásico - 13.8KV - 300KVA  - 220/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3699`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#275` — Transformador Trifásico - 13.8KV - 15KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#277` — Transformador Trifásico - 13.8KV - 30KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#279` — Transformador Trifásico - 13.8KV - 45KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#281` — Transformador Trifásico - 13.8KV - 75KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#285` — Transformador Trifásico - 13.8KV - 150KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4160`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#287` — Transformador Trifásico - 13.8KV - 225KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4242`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#289` — Transformador Trifásico - 13.8KV - 300KVA - 380/220V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.45** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |
| 2 | **0.41** | MATERIAL | `252` | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |

### `#132` — Haste de aterramento circular lisa 2400mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3981`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.44** | MATERIAL | `90463` | — | HASTE ATERRAMENTO PERF L 2400X25X25X5MM | PC |

### `#133` — Haste de aterramento circular prolongavel 2400mm (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3605`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.44** | MATERIAL | `90463` | — | HASTE ATERRAMENTO PERF L 2400X25X25X5MM | PC |

### `#212` — Poste de concreto armada - 13/300 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3958`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.44** | MATERIAL | `90194` | — | POSTE DT 10M 300DAN | PC |
| 2 | **0.44** | MATERIAL | `90198` | — | POSTE DT 11M 300DAN | PC |
| 3 | **0.44** | MATERIAL | `90202` | — | POSTE DT 12M 300DAN | PC |
| 4 | **0.44** | MATERIAL | `90204` | — | POSTE DT 13M 1000DAN | PC |

### `#213` — Poste de concreto armada - 13/600 DT (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3958`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.44** | MATERIAL | `90195` | — | POSTE DT 10M 600DAN | PC |
| 2 | **0.44** | MATERIAL | `90199` | — | POSTE DT 11M 600DAN | PC |
| 3 | **0.44** | MATERIAL | `90203` | — | POSTE DT 12M 600DAN | PC |
| 4 | **0.44** | MATERIAL | `90204` | — | POSTE DT 13M 1000DAN | PC |

### `#323` — Porca Olhal M16 78,0 mm. (pç)
- cod_sap atual: `90387` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.44** | MATERIAL | `90446` | 2955 | OLHAL PARAF AÇO FORJ M16 16,0MM 5000DAN | PC |

### `#258` — Transformador monofásico - 34.5KV - 37,5KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3694`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.43** | MATERIAL | `90654` | 3096 | SUPORTE T 34,5KV | PC |
| 2 | **0.41** | Banco_Dados | `540` | — | CABECOTE OLHAL ISOLADOR 34,5KV | PECA |

### `#329` — Cruzeta de Distribuição de Concreto T 1.900 mm (CA II) (pç)
- cod_sap atual: `90400` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.43** | Banco_Dados | `1337` | — | CONECTOR EM T CURVO C/1 SUPORT | PECA |

### `#167` — Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de concreto (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4370`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.43** | Banco_Dados | `3067` | — | TOMADA TRIPOLAR PADRAO BR 10 A | PECA |

### `#163` — Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de Aço galvanizado (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3628`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.42** | Banco_Dados | `3067` | — | TOMADA TRIPOLAR PADRAO BR 10 A | PECA |
| 2 | **0.40** | Banco_Dados | `68` | — | ALICATE CORTE DIAG ACO CR-V 10 | PECA |
| 3 | **0.40** | Banco_Dados | `3096` | — | TRAVA QUEDAS RETRATIL COM 10 M CABO DE ACO | PECA |

### `#196` — Pino auto-travante AC 56,5mm para isolador pilar (pç)
- cod_sap atual: `502963` · cod_lider7: `3648`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.42** | MATERIAL | `90251` | 2960 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 168,5MM | PC |
| 2 | **0.42** | MATERIAL | `90621` | 2961 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 228,5MM | PC |
| 3 | **0.42** | MATERIAL | `90622` | 2962 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 278,5MM | PC |

### `#159` — Padrão Trifásico 70A. - 25mm² - trafo 45kva - 380/220v. (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.41** | MATERIAL | `90054` | 336 | TRAFO TRIFÁSICO 15KV 45KVA | UN. |
| 2 | **0.41** | MATERIAL | `90082` | 3051 | TRAFO TRIFÁSICO 36KV 45KVA | UN. |

### `#160` — Padrão Trifásico 120A. - 35mm² - Trafo 45kva - 220/127v. (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.41** | MATERIAL | `90054` | 336 | TRAFO TRIFÁSICO 15KV 45KVA | UN. |
| 2 | **0.41** | MATERIAL | `90082` | 3051 | TRAFO TRIFÁSICO 36KV 45KVA | UN. |

### `#168` — Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de concreto (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90294` | — | CABO XLPE CU 16MM² 15KV | M |

### `#11` — Alça pré formada para Fio Aluministeel N8 awg (pç)
- cod_sap atual: `2817` · cod_lider7: `4244`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `4009` | 4009 | CONECTOR CN8 | PC |
| 2 | **0.40** | MATERIAL | `2930` | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 3 | **0.40** | Banco_Dados | `44` | — | ALICATE BELZER 8 | PECA |
| 4 | **0.40** | Banco_Dados | `55` | — | ALICATE BOMBA DAGUA 8 POL | PECA |
| 5 | **0.40** | Banco_Dados | `99` | — | ALICATE DESENCAPADOR AUTOMATICO 8 POL | PECA |

### `#12` — Arame aço galvanizado 14BWG (kg)
- cod_sap atual: `3054` · cod_lider7: `3498`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90788` | 177 | CONECTOR CN14 | PC |
| 2 | **0.40** | Banco_Dados | `866` | — | CHAVE CANHAO ISOLADA 14MM | UNIDADE |
| 3 | **0.40** | Banco_Dados | `924` | — | CHAVE COMBINADA 14MM | UNIDADE |
| 4 | **0.40** | Banco_Dados | `988` | — | CHAVE DE GRIFFO 14 | UNIDADE |
| 5 | **0.40** | Banco_Dados | `1121` | — | CHAVE FIXA UMA BOCA ISOL 14 | PECA |

### `#293` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 45KVA - 220/127V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#294` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 75KVA - 220/127V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#295` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 112,5KVA - 220/127V` · cod_lider7: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR DE 112,5KVA - 220/127V`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#296` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 220/127V` · cod_lider7: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 220/127V`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#297` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 220/127V` · cod_lider7: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 220/127V`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#298` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 300KVA - 220/127V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#299` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 45KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#300` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 75KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#301` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 112,5KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#302` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#303` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#304` —  ()
- cod_sap atual: `MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 300KVA - 380/220V` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90536` | 3886 | BRACO SUPORTE TIPO J | PC |
| 2 | **0.40** | MATERIAL | `90486` | 154 | CARTUCHO AMARELO | PC |
| 3 | **0.40** | MATERIAL | `90487` | 2898 | CARTUCHO AZUL | PC |
| 4 | **0.40** | MATERIAL | `90488` | 2900 | CARTUCHO VERMELHO | PC |
| 5 | **0.40** | MATERIAL | `184` | 184 | CONECTOR TIPO D | PC |

### `#337` — Alca Pré-formada Cabo Aço Contra Poste 9,50mm. (pç)
- cod_sap atual: `90302` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90013` | 120 | ALCA PREFORMADA CABO ACO STD 9,53MM 965,0MM | PC |

### `#113` — Elo Fusível 12K (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `174` | 174 | CONECTOR CN12 | PC |
| 2 | **0.40** | Banco_Dados | `54` | — | ALICATE BOMBA DAGUA 12 | PECA |
| 3 | **0.40** | Banco_Dados | `75` | — | ALICATE CRIMPADOR HIDRAU 12TON | UNIDADE |
| 4 | **0.40** | Banco_Dados | `104` | — | ALICATE ELETRICO 12T COM SENSOR DE COMPRESSAO | PECA |
| 5 | **0.40** | Banco_Dados | `109` | — | ALICATE HIDRAULIC CORTE 12 TON | UNIDADE |

### `#125` — Fio Aluministeel N8 awg (kg)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4015`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `4009` | 4009 | CONECTOR CN8 | PC |
| 2 | **0.40** | MATERIAL | `2930` | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 3 | **0.40** | Banco_Dados | `44` | — | ALICATE BELZER 8 | PECA |
| 4 | **0.40** | Banco_Dados | `55` | — | ALICATE BOMBA DAGUA 8 POL | PECA |
| 5 | **0.40** | Banco_Dados | `99` | — | ALICATE DESENCAPADOR AUTOMATICO 8 POL | PECA |

### `#145` — Laço pré-formado de topo para Fio  Aluministeel N8 Awg (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `—`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `4009` | 4009 | CONECTOR CN8 | PC |
| 2 | **0.40** | MATERIAL | `2930` | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 3 | **0.40** | Banco_Dados | `44` | — | ALICATE BELZER 8 | PECA |
| 4 | **0.40** | Banco_Dados | `55` | — | ALICATE BOMBA DAGUA 8 POL | PECA |
| 5 | **0.40** | Banco_Dados | `99` | — | ALICATE DESENCAPADOR AUTOMATICO 8 POL | PECA |

### `#150` — Laço pré-formado simples lateral para Fio  Aluministeel N8 Awg (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `4041`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `4009` | 4009 | CONECTOR CN8 | PC |
| 2 | **0.40** | MATERIAL | `2930` | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 3 | **0.40** | Banco_Dados | `44` | — | ALICATE BELZER 8 | PECA |
| 4 | **0.40** | Banco_Dados | `55` | — | ALICATE BOMBA DAGUA 8 POL | PECA |
| 5 | **0.40** | Banco_Dados | `99` | — | ALICATE DESENCAPADOR AUTOMATICO 8 POL | PECA |

### `#257` — Transformador monofásico - 13.8KV - 37,5KVA - 254/127V (pç)
- cod_sap atual: `_(sem cod_sap)_` · cod_lider7: `3689`

| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |
| --- | ---: | --- | --- | --- | --- | --- |
| 1 | **0.40** | MATERIAL | `90654` | 3095 | SUPORTE T 13,8KV | PC |

---

## ⚫ Sem candidato (15)

Nada na planilha com similaridade ≥ 0,40. Provavelmente são materiais que de fato não estão no catálogo SAP que você mandou, ou descrições muito diferentes.

| id | descrição | unid | cod_sap atual | cod_lider7 |
| --- | --- | --- | --- | --- |
| 342 | Parafuso de Distribuição Cabeça Abaulada M16 x 70 mm. | pç | 90373 | — |
| 155 | Padrão Trifásico 40A. 10mm²  - 15kva - 220/127V. | pç | — | 4068 |
| 156 | Padrão Trifásico 70A. 16MM² -  30kva - 220/127V. | pç | — | 4069 |
| 157 | Padrão Trifásico 30A. 6mm²  - 15kva - 380/220V. | pç | — | — |
| 158 | Padrão Trifásico 50A. 10mm² -  30kva - 380/220V. | pç | — | — |
| 162 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de Aço galvanizado | pç | — | 3627 |
| 164 | Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de Aço galvanizado | pç | — | 3629 |
| 165 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de Aço galvanizado | pç | — | 3630 |
| 166 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de concreto | pç | — | 4369 |
| 169 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de concreto | pç | — | 4368 |
| 170 | Padrão bifásico rural 140 Amp., 50mm²,  37,5 kva, Poste de concreto | pç | — | 4494 |
| 178 | Parafuso de cabeça quadrada - 175mm | pç | — | — |
| 194 | Pára-raios de distribuição - 12kV - polimérico - 10kA | pç | — | 3645 |
| 234 | Seccionador de cerca 900kg | pç | — | 3668 |
| 244 | Suporte T para chave fusível 540mm | pç | — | 3673 |