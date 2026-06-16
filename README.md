# Gerador de Relação de Materiais — Redes de Distribuição (MT)

Migração do sistema legado **`GERAÇÃO DE MATERIAL.xlsm`** (Excel/VBA) para uma aplicação
web moderna (React + TypeScript + Tailwind). Gera a relação de materiais (BOM) das
estruturas de uma rede aérea de distribuição de média tensão, com consolidação e
exportação para Excel/PDF.

> **Princípio inegociável:** a aplicação **não inventa dados de engenharia**. Toda a base
> (códigos, descrições, unidades e quantidades unitárias) é **extraída fielmente da
> planilha**, que é a fonte única de verdade.

## Estrutura do repositório

```
V3/
├─ GERAÇÃO DE MATERIAL.xlsm     # planilha original (fonte da verdade)
├─ RELATORIO_FASE1.md           # relatório de engenharia reversa (Fase 1)
├─ Docs/                        # normas NDU (referência técnica)
├─ analysis/                    # scripts e dumps usados na análise (Fase 1)
├─ extraction/                  # pipeline de extração (Fase 2)
│   ├─ xlmodel.py               # avaliador de fórmulas do Excel (SUM/IF/AND/OR/ROUND/…)
│   ├─ extract.py               # lista mestre de materiais + "output map"
│   ├─ extract_generators.py    # probing das 4 geradoras MT -> estruturas + BOMs
│   └─ compile.py               # gera os JSON finais para o app
├─ data/                        # JSON brutos da extração
└─ app/                         # aplicação web (Vite + React + TS + Tailwind)
    └─ public/data/             # JSON consumidos pelo app (gerados por compile.py)
```

## Como a extração funciona (resumo)

A planilha é um **sistema linear** cujas únicas funções são `SUM, IF, AND, OR, ROUNDUP,
ROUNDDOWN`. O `xlmodel.py` carrega as fórmulas e os valores em cache (via openpyxl) e
avalia qualquer célula com suporte a **overrides** (sobrescrever entradas).

Para extrair o BOM unitário de cada estrutura usamos **probing por vetor unitário**:
colocamos `1` em uma célula de entrada (estrutura × condutor × poste), recalculamos e lemos
a coluna-total da aba — o resultado é exatamente o BOM daquela combinação. Cada coluna
(estrutura × condutor) é fatorada em **base** (poste de referência) + **deltas por poste**.

## Rodar a aplicação

```bash
cd app
npm install
npm run dev          # abre em http://localhost:5173
```

Build de produção:

```bash
cd app
npm run build        # gera app/dist
npm run preview
```

## Atualizar a base de dados (quando a planilha mudar)

```bash
# 1) instalar dependências de extração (uma vez)
pip install openpyxl

# 2) reextrair a partir da planilha
cd extraction
python extract.py                  # materiais.json + output_map.json
python extract_generators.py       # estruturas_mt.json + insumos_mt.json (~10-15 min)
python compile.py                  # gera app/public/data/*.json

# 3) recarregar o app (npm run dev) — sem recompilar código
```

Os engenheiros podem editar diretamente os JSON em `app/public/data/` (cada coeficiente é
uma quantidade unitária por estrutura), sem mexer no código.

## Fases do projeto

1. **Engenharia reversa** da planilha → `RELATORIO_FASE1.md`.
2. **Extração** → base JSON validada (`extraction/`, `data/`, `app/public/data/`).
3. **Aplicação web** (React + TS + Tailwind) com exportação `.xlsx`/`.pdf`.
4. **Validação cruzada** — reprodução fiel das fórmulas (avaliador `xlmodel.py`).

## Status

- [x] Fase 1 — análise e relatório
- [x] Fase 2 — extração das 4 geradoras MT (Mono/Trifásico × 13,8/34,5 kV)
- [x] Fase 3 — aplicação web (núcleo)
- [ ] Fase 2/3 — demais módulos (compacta, BT, iluminação, transformadores,
      religadores, reguladores, subestação, medições, extras)
