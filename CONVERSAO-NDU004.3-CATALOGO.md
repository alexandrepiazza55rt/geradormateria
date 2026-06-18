# Conversão da pasta `ARQUIVOS/` para a base do sistema — NDU 004.3 + Catálogo

**Data:** 2026-06-18 · **Versão publicada:** `2026.06.18-r4` · **Branch:** `feat/base-ndu0043-catalogo`

Registro de **tudo que foi feito para adaptar os JSONs de `ARQUIVOS/` ao formato que o sistema
aceita** e publicá-los aos clientes. Complementa o [`REFERENCIA.md`](REFERENCIA.md) (que descreve
o formato) — aqui está o *o que foi convertido, como, e por quê*.

---

## 1. Resultado (TL;DR)

| | Antes | Depois (live) |
|---|---|---|
| Materiais (`materiais.json`) | 301 (max id 355) | **427** (max id 482; id 359 reservado) |
| Insumos (`insumos.json`) | 39 | **228** (+189 de catálogo) |
| Estruturas (`structures/`) | 876 | **888** (+12 NDU 004.3) |
| `data_version` | 2026.06.17-r1 | **2026.06.18-r4** |

Publicado em `alexandrepiazza55rt/gerador-base@26cf348` (canal `raw.githubusercontent.com`).
Verificado: todo sha256 servido bate com o `manifest.json` → clientes aplicam sem erro.

---

## 2. O que veio em `ARQUIVOS/` (entradas)

1. **NDU 004.3 — Baixa Tensão Multiplexada** (`ndu004_3_estruturas.json`, `ndu004_3_materiais_novos.json`)
   12 estruturas (`X-2026-001..012`) + 1 material novo (Abraçadeira autotravante, SISUP 90395).
   Já vinha quase no formato de publicação.
2. **Catálogo** (`extracao/transformadores.json`, `cabos.json`, `padrao_entrada.json`)
   Transformadores, cabos e itens de padrão de entrada. **"Materiais sem dependentes"** (cada um
   é um material só, sem BOM). Estavam congelados contra uma base **em quarentena** (`V3/data`,
   1233 itens, ids até 1231).
3. **NDU 004.1 — correções** (`NDU004_correcoes_publicar.json`) — 6 estruturas `K*`. **Descartado**
   (ver §6).

---

## 3. Decisões tomadas

- **Catálogo → insumos avulsos** (não estruturas). O app só mostra material referenciado por uma
  estrutura ou insumo (`calcular_usados` em `store.ts`); como transformador/cabo/padrão não têm
  BOM, viram **insumos** (`bom = {id: 1}`) para ficarem selecionáveis por projeto.
- **Escopo:** NDU 004.3 + Catálogo. NDU 004.1 fora (órfã).
- **Identidade de material:** reusar o `id` quando o item já existe na base viva; **nunca** usar
  os ids do arquivo de origem (eram da quarentena). Ids novos sequenciais a partir do próximo
  livre (357).

---

## 4. Regras de adaptação aplicadas

Tudo feito pelo script **`extraction/aplicar_arquivos.py`** (determinístico, re-executável).

### 4.1 Reconciliação de ids do catálogo (o passo crítico)
Os ids do catálogo vinham da base em quarentena e **colidiam** com a base viva (ex.: id 305 lá =
"Arame galvanizado"; id 305 vivo = "Isolador Pilar"). Para cada item do catálogo, casar contra a
base viva nesta ordem (mesma cautela do `build_registry.py`):

1. `cod_sap` **se único** na base viva → reusa o id vivo.
2. senão `cod_lider7` **se único** → reusa o id vivo.
3. senão descrição + unidade normalizadas → reusa o id vivo.
4. senão → **material novo**, com o próximo id livre (≥ 357).

Resultado: **100** itens já existiam (reusaram id) · **126** viraram materiais novos
(ids **357–482**) · catálogo deduplicado por id vivo → **189 insumos**.

> Código duplicado (SAP/Líder7 que aparece em mais de um material) **não** é usado como chave —
> cai para descrição+unidade. Isso evita reusar o id do material errado (risco que corromperia
> preços/orçamentos do cliente).

### 4.2 Material novo da NDU 004.3
- id **356** = "Abraçadeira autotravante" (SISUP 90395). É referenciado pelas estruturas X-2026,
  então foi fixado em 356 antes de numerar o catálogo (357+).

### 4.3 Insumos de catálogo
- Um insumo por material vivo, `bom = {id: 1}`, agrupados em categorias:
  `Catálogo — Transformadores` (42) · `Catálogo — Cabos` (73) · `Catálogo — Padrão de Entrada` (74).
- ids dos insumos: `CAT-TRAFO-<id>`, `CAT-CABO-<id>`, `CAT-PADRAO-<id>`.

### 4.4 Estruturas NDU 004.3
- `ndu004_3_estruturas.json` dividido em 12 arquivos `structures/X-2026-001..012.json`.
- `base_bom`/`delta` referenciam o material 356 + ids já existentes (14, 341, 342, 346, 347) —
  todos conferidos.
- Categoria: `Baixa Tensão Multiplexada (NDU 004.3)`.

### 4.5 Deduplicação dos transformadores 357/358/359
Análise por **tensão primária** (não pela classe):
- **357** = mono 5 kVA **fase-neutro** 7,97 kV (classe 15 kV) — *novo, mantido*.
- **358** = mono 5 kVA **fase-neutro** 19,92 kV (classe 36,2 kV, SAP 90067) — *novo, mantido*.
- **359** = mono 5 kVA 19,92 kV (sem SAP/secundário) = **duplicata do 358** → **removido**
  (commit `f6bbebc`). id 359 fica **reservado** no registro (nunca reusado).
- 357/358 **não** são duplicatas de 249/250 (estes são **fase-fase** 13,8/34,5 kV; aqueles são
  fase-neutro). A base não tinha os fase-neutro — foi um complemento real.

### 4.6 Fim-de-linha (LF) — bug que quebrou a 1ª publicação
Os scripts gravavam JSON em **modo texto no Windows (CRLF)**, mas o git serve **LF**. O
`manifest.json` guardava o sha do CRLF → o cliente baixava o LF e acusava **"Checksum divergente
em materiais.json"** (update abortado, base do cliente mantida). **Correção:**
- `open(..., newline="\n")` em `build_catalog.py`, `gen_seed_manifest.py`, `aplicar_arquivos.py`;
- normalizar `materiais.json`/`insumos.json`/`catalog.json` para LF antes de gerar o manifest;
- ao publicar: clonar com `core.autocrlf=false` e **conferir o sha do blob staged vs manifest
  ANTES do push**.

---

## 5. Ferramentas e ordem de execução (reproduzível)

Tudo opera sobre `app/public/data` (fonte de verdade). Da raiz do repo:

```bash
python extraction/aplicar_arquivos.py        # converte ARQUIVOS/ -> materiais/insumos/structures
python extraction/build_registry.py          # congela os ids novos no material_registry.json
python extraction/build_catalog.py <versao>  # regenera catalog.json + bundle (estruturas.json)
python extraction/validate_base.py --structures   # lint: integridade, ids únicos, registro
python extraction/gen_seed_manifest.py        # regenera manifest.json (sha256 reais, formato CDN)
```

`aplicar_arquivos.py --dry-run` só mostra o relatório, sem gravar.

---

## 6. NDU 004.1 — por que ficou de fora

As 6 "correções" pressupõem 100 estruturas `K*` "mescladas mas não commitadas". Procurei em git,
na quarentena e no repo inteiro: **não existem em lugar nenhum**. Sem a base das 100, não há o que
corrigir. Só dá para tratar se a base `K*` for fornecida.

---

## 7. Como os clientes recebem (dois canais distintos)

| Mudança | Canal | Chega ao cliente |
|---|---|---|
| Base: materiais, estruturas, insumos | repo de dados `gerador-base` (raw) | **Automático** — "Verificar atualizações" |
| Código do app (ex.: seção "Baixa Tensão") | binário `.exe` | **Só com instalador novo** |

**Publicar a base** = commit/push dos arquivos distribuídos (`materiais.json`, `insumos.json`,
`precos.json`, `catalog.json`, `manifest.json`, `structures/*`) na **`main` do
`alexandrepiazza55rt/gerador-base`**. O cliente decide atualizar comparando **só a string
`data_version`** (`hasUpdate = available !== current`), então **toda republicação precisa de
versão nova**. O painel publisher **só publica estruturas** — material/insumo novo tem que ir por
este caminho (o painel não escreve `materiais.json`/`insumos.json`).

> ⚠️ Histórico desta leva: `r1`/`r2` foram estados intermediários (inclusive remoções de X-2026
> feitas pelo painel em paralelo); `r3` (`8d779ee`) foi publicada mas **falhou no cliente** pelo
> bug de CRLF (§4.6); **`r4` (`26cf348`) é a versão correta e verificada**.

---

## 8. Pendência: seção "Baixa Tensão"

As estruturas X-2026 caíam em "Outras redes". Adicionei a seção própria **"Baixa Tensão"** em
`app/src/lib/secoes.ts` (commit `36f27e2`). É **código do app** — a categoria publicada já casa
(sem mudança de dado), mas **só aparece para o cliente com um `.exe` novo** (o app não tem
auto-updater de binário; `tauri.conf` v1.0.0). Para entregar: bump de versão + `tauri build` +
distribuir o instalador.

---

## 9. Commits da branch `feat/base-ndu0043-catalogo`

```
36f27e2 feat(app): seção "Baixa Tensão" para as estruturas NDU 004.3
f01550c fix(base): força LF nos arquivos da base (corrige checksum divergente) + r4
b16413e chore(base): bump para 2026.06.18-r3 (publicado em gerador-base)
ede821e chore(base): bump data_version para 2026.06.18-r2 (publicação)
f6bbebc fix(base): remove material 359 (duplicata do 358); id reservado
d3b9648 feat(base): NDU 004.3 (12 estruturas) + catálogo trafos/cabos/padrão
```

Publicado em `gerador-base`: `8d779ee` (r3, com bug) → `26cf348` (**r4, correto**).

---

## 10. Verificações feitas

- `validate_base.py` OK (avisos de materiais 293–304 sem descrição são **pré-existentes**).
- 892 arquivos no manifest, **0 com CRLF**, **todos os sha256 batem** com os arquivos.
- No servidor (`gerador-base`): `materiais.json` servido = `f9c54efc…` = manifest → cliente aplica.
- `tsc` do app sem erros após a seção "Baixa Tensão".
- 0 estruturas antigas (876) alteradas; nenhuma estrutura/material existia "só no live" (sem perda).
