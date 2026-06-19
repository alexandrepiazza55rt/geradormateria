# Extração NDU 004.3 — Redes Multiplexadas de Baixa Tensão

Fonte: `NDU 004.3` v6.0 (Julho/2024), 205 páginas, BT até 1,0 kV. Conferência texto × imagem em **todas** as listas.
Formatado conforme o **guia de publicação** (campos `schema_version`/`rev`/`status`/`id` `X-…`).

## Números
- **12 estruturas** num **único arquivo** `ndu004_3_estruturas.json` (cada item do array = 1 estrutura no formato de publicação). Ids `X-2026-001`…`X-2026-012`.
- **1 material novo**: id **379** — *Abraçadeira autotravante* (SISUP 90395) em `materiais_novos.json`.
- **89 condicionais** (itens paramétricos "Tabela A–O"/"Variável", não somados).
- Base lida: `materiais.json` = 324 itens, **maior id = 378** → novo começa em 379. Sem extração pendente em `Inf extraida`.

| id | tipo | pág. | base_bom | condic. |
|----|------|------|----------|---------|
| X-2026-001 | SI1 | 98 | 5 | 7 |
| X-2026-002 | SI1A | 101 | 5 | 7 |
| X-2026-003 | SI3 | 104 | 5 | 7 |
| X-2026-004 | SI4 | 109 | 5 | 7 |
| X-2026-005 | SI4A | 136 | 6 | 7 |
| X-2026-006 | SI1-SI3 | 119 | 6 | 10 |
| X-2026-007 | SI1-SI3A | 122 | 5 | 9 |
| X-2026-008 | SI3-SI3 | 130 | 5 | 8 |
| X-2026-009 | SI4-SI3 | 126 | 5 | 8 |
| X-2026-010 | S3-SI3 | 115 | 6 | 7 |
| X-2026-011 | S3-SI3A | 133 | 6 | 7 |
| X-2026-012 | Transformador de Distribuição | 141/144 | 2 | 5 |

Materiais reusados da base (por cod_sap/SISUP): 14 (Arruela quadrada/90389), 346 (Armação secundária/90393), 341 (Paraf. cab. abaulada M16x45/90372), 342 (M16x70/90373), 347 (Isolador roldana/90295), 323 (Porca-olhal/90387), 161 (Olhal para parafuso — ver REVISAR).

## ⚠️ Antes de publicar
- **Cadastrar o material novo (id 379, Abraçadeira autotravante, SISUP 90395) na base ANTES de subir** — ele é citado no `base_bom` de quase todas as estruturas; sem cadastro, o painel acusa "material não existe". Se a base atribuir um id diferente de 379, **trocar 379 → novo id** nos `base_bom`/`delta`.
- O guia publica **1 arquivo por estrutura** (`<id>.json`). Aqui está tudo em **um só** (a seu pedido); posso dividir nos 12 `X-2026-0NN.json` se o painel exigir.

## Decisões automáticas
1. **Formato = guia de publicação.** Incluídos `schema_version:1`, `rev:1`, `status:"ativo"`; `id` com prefixo **`X-`** (`X-2026-001`…`012`), que não colide com `S…`/`R…`. (Campos extras `condicionais`/`observacoes`/`norma_origem`/`pagina_origem` mantidos — o guia permite campos opcionais.)
2. **categoria = "Baixa Tensão Multiplexada (NDU 004.3)"** → grupo novo, aparece em **"Outras redes"** (exatamente como o guia descreve para nome de grupo inédito). Sem mudança de código.
3. **Eixo de poste SC/DT/PRFV → `postes[].delta`**, base = **SC** (`poste_ref="Seção Circular (SC)"`). Poste de madeira (P-3, alternativa ao DT nos desenhos) não tem coluna própria → coberto pela coluna DT.
4. **`condutor=null`, `tensao_kv=0.38`, `nominal_kv=0.22`, `fases=3`.** As estruturas SI são montagens mecânicas **agnósticas** a nº de fases e tensão BT; valores representativos do tronco quadruplex 380/220 V. O guia lista `tensao_kv` 13.8/24.2/34.5 como exemplos (rede MT), mas o campo é numérico e o painel valida só formato — mantido o valor BT real da norma (a norma proíbe usar tensão de MT aqui).
5. **Paramétricos = condicionais.** Linhas "Tabela A–O" e "Variável" entram em `condicionais` (id `null`, **não somados**), com `condicao` citando a tabela e a qtd por poste (SC/DT/PRFV). Só linhas com **SISUP fixo** entram em `base_bom`/`delta`.

## REVISAR (com página)
- **X-2026-002 / SI1A — p.101:** a norma imprime **23** isoladores tipo roldana na coluna PRFV (SC=DT=03). Improvável (provável digitação = 03). **Adotado 03**; confirmar.
- **X-2026-005 / SI4A — p.136:** *Olhal para parafuso* SISUP **90446** não existe na base; reusei **id 161** ("Olhal para parafuso", base cod_sap **502955**) por descrição idêntica. Confirmar/reconciliar o código.
- **X-2026-007 / SI1-SI3A — p.122:** *Parafuso de rosca total* (Tabela A) impresso na coluna **SC** (02/–/–) — anômalo; mantido como na norma (condicional, não soma). Confirmar.
- **"Tabela P"** (Conector de derivação cunha — p.119, 122, 126, 130) **não consta** no índice do §17 (A→O, sem K). Registrado como citado; confirmar.
- **Inconsistências de letra de tabela na própria norma** (sem impacto no BOM, pois são condicionais): cinta citada como **H** (maioria), **C** (p.101), **I** (p.104); poste DT citado como **G** (maioria) e **N** (p.126, 130).
- **X-2026-006 / SI1-SI3 — p.119:** *Conector de derivação perfurante* (O-9) aparece **2×** (uma 03/03/03 e outra "Variável"); ambas condicionais — possível redundância da norma.
- **Texto do PDF com linhas-fantasma:** a camada de texto trazia *Manilha-sapatilha*/*Olhal para parafuso* em **p.109 (SI4)** e **p.119 (SI1-SI3)** que **não** estão nas tabelas impressas (resíduo de versão anterior). Removidas após conferência por imagem — todas as 12 listas validadas visualmente.

## Autovalidação (build.py)
- Formato (obrigatórios presentes; `schema_version=1`, `rev≥1`, `status∈{ativo,descontinuado}`, `id` com prefixo `X-`, chaves `^\d+$`, qtds numéricas, `postes[0]==poste_ref`): **OK**.
- Integridade (todo id de `base_bom`/`delta` existe na base ∪ {379}; sem id de estrutura repetido; material novo sem colisão com a base): **OK** — **0 erros**.
