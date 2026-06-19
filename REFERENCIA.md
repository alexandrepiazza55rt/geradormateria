# Referência da Base — o que o sistema precisa para montar a relação de materiais

Guia completo dos dados que o programa usa para **gerar a lista completa de materiais**
(cruzetas, ruelas, isoladores, parafusos…). Use este documento ao **extrair estruturas de
outras normas (PDFs)**: ele diz exatamente *o que* coletar de cada estrutura e *como*
organizar o JSON antes de subir pelo Painel de Publicação.

---

## 1. Como o sistema monta a "relação de materiais" (visão geral)

O programa não guarda a lista pronta de cada obra. Ele guarda **peças** e **monta** a lista
na hora:

1. **Materiais** (`materiais.json`) — o *dicionário* de todos os itens que existem
   (cruzeta, ruela, isolador, parafuso…). Cada material tem um **`id` numérico único**.
2. **Estruturas** (`structures/<id>.json`) — cada estrutura (poste armado) diz **quais
   materiais usa e quantos**, referenciando os materiais **pelo `id`**, não pelo nome.
3. Quando o usuário monta a obra, ele escolhe estruturas + quantidades; o programa soma
   tudo (`base_bom` + ajustes por poste × quantidade) e produz a **relação consolidada**.

> Regra de ouro: **a estrutura nunca escreve o nome do material**, só o `id`. O nome,
> código SAP e unidade vêm do `materiais.json`. Por isso, todo material citado por uma
> estrutura **precisa existir** no `materiais.json` (o painel recusa a publicação senão).

---

## 2. Mapa dos arquivos da base

Ficam em `app/public/data/` (a base "fonte de verdade") e são publicados no repositório
para os clientes baixarem.

| Arquivo | O que é | Você edita à mão? |
|---|---|---|
| `materiais.json` | Dicionário de materiais (id → descrição, SAP, unidade) | Sim, ao cadastrar material novo |
| `structures/<id>.json` | Uma estrutura por arquivo | Sim (ou pelo painel) |
| `catalog.json` | Índice oficial das estruturas (id, categoria, rev, sha) | **Não** — gerado na publicação |
| `manifest.json` | Lista de arquivos + checksums + `data_version` | **Não** — gerado na publicação |
| `insumos.json` | Itens avulsos (cabos por metro, aterramento) | Sim, se for mexer em insumos |

> `catalog.json` e `manifest.json` são **gerados automaticamente** pelo painel a cada
> publicação. Nunca edite na mão — o painel recalcula os checksums (sha256) e a versão.

---

## 3. `materiais.json` — o dicionário de materiais

É uma **lista** de objetos. Cada material:

```json
{
  "id": 14,
  "cod_sap": "1308",
  "cod_lider7": "3495",
  "descricao": "Cruzeta de concreto 1,90 m",
  "unidade": "pç"
}
```

| Campo | Obrigatório | Significado |
|---|---|---|
| `id` | **Sim** | Inteiro **único**. É a chave usada por todas as estruturas. Nunca repita nem reaproveite. |
| `descricao` | Sim | Nome que aparece na relação (ex.: "Ruela quadrada 18 mm"). |
| `unidade` | Sim | `pç`, `m`, `kg`, `cj`… |
| `cod_sap` | Recomendado | Código SAP (texto). Usado para ordenar/exportar. |
| `cod_lider7` | Opcional | Código alternativo. Pode ser `""`. |
| `categoria` | Opcional | Agrupamento do material (não confundir com a categoria da estrutura). |
| `row` | Opcional | Legado (linha da planilha de origem). Pode omitir. |

**Ao extrair de uma norma:** para cada material citado nas tabelas, verifique se ele já
existe no `materiais.json` (pela descrição/SAP). Se existir, **reuse o `id`**. Se for novo,
crie um material com **um `id` novo** (maior que o maior id atual) e só então use esse id
nas estruturas.

---

## 4. `structures/<id>.json` — a estrutura, campo a campo

Cada estrutura é **um arquivo**. O nome do arquivo é o `id` (ex.: `R588.json`).

### Exemplo urbano (planilha) — `S1.json`
```json
{
  "schema_version": 1,
  "rev": 1,
  "status": "ativo",
  "id": "S1",
  "tipo": "CFU - AVULSO",
  "condutor": "QUANT",
  "tensao_kv": 13.8,
  "nominal_kv": 7.97,
  "fases": 1,
  "poste_ref": "DT-10/150",
  "base_bom": { "14": 2.0, "34": 3.0, "40": 1.0, "180": 2.0 },
  "postes": [
    { "poste": "DT-10/150", "delta": {} },
    { "poste": "DT-10/1000", "delta": { "181": 2.0, "180": -2.0 } }
  ],
  "categoria": "Monofásico 13,8 kV"
}
```

### Exemplo rural (norma NDU 005) — `R588.json`
```json
{
  "schema_version": 1,
  "rev": 1,
  "status": "ativo",
  "id": "R588",
  "norma_origem": "NDU 005",
  "tipo": "N3",
  "tipo_base": "N3",
  "cruzeta": null,
  "condutor": "336,4 MCM",
  "tensao_kv": 34.5,
  "classe_tensao_kv": 36.2,
  "nominal_kv": 34.5,
  "fases": 3,
  "categoria": "Trifásico 34,5 kV — Rural (NDU 005)",
  "poste_ref": "DT-11/300",
  "base_bom": { "14": 18.0, "349": 3.0, "310": 12.0 },
  "postes": [
    { "poste": "DT-11/300", "delta": {} },
    { "poste": "DT-11/1000", "delta": { "310": -12.0, "311": 12.0 } }
  ],
  "condicionais": [
    { "id": null, "descricao": "Transformador Aéreo (Trifásico).", "qtd": 1.0,
      "condicao": "Resolver Tabela O conforme projeto (NDU 005 p.330)" }
  ],
  "pagina_origem": "NDU 005 p.330"
}
```

### Tabela de campos

| Campo | Obrig.? | Tipo | Significado / como preencher |
|---|---|---|---|
| `id` | **Sim** | texto | Identificador único = nome do arquivo. Só `A–Z a–z 0–9 . _ -`. Convenção: `S###` urbano, `R###` rural. **Novas estruturas pelo painel:** use prefixo `X-` (ex.: `X-2026-001`). |
| `schema_version` | Sim | número | Sempre `1`. |
| `rev` | Sim | número | Revisão. **Nova = 1**. Em correção, **suba +1** (o painel exige rev maior que a publicada). |
| `status` | Sim | texto | `"ativo"` ou `"descontinuado"` (descontinuado some da criação, mas ainda é resolvível). |
| `tipo` | Sim | texto | Rótulo do **subgrupo** (ex.: `CFU - AVULSO`, `N3`, `ESTAI ÂNCORA`). Texto livre. |
| `tipo_base` | Não | texto | Chave de agrupamento (rural). Urbano normalmente usa só `tipo`. |
| `cruzeta` | Não | texto/null | Variação de cruzeta (rural), ex.: `"T 1,90 m"`, ou `null`. |
| `condutor` | Sim | texto/null | Bitola/condutor (ex.: `"1/0CAA"`, `"336,4 MCM"`) ou `null` se não se aplica. |
| `tensao_kv` | Sim | número | `13.8`, `24.2` ou `34.5`. |
| `nominal_kv` | Sim | número | Tensão nominal fase-neutro. Padrões: 13.8→`7.97`, 24.2→`13.97`, 34.5→`19.92`. |
| `classe_tensao_kv` | Não | número | Classe de isolamento (ex.: `36.2`). Comum em rural. |
| `fases` | Sim | número | `1`, `2` ou `3`. |
| `norma_origem` | Não | texto | `"NDU 005"` (rural). Ausente em urbano. |
| `pagina_origem` | Não | texto | Rastreabilidade, ex.: `"NDU 005 p.330"`. |
| `poste_ref` | Sim | texto | Rótulo do poste a que o `base_bom` se refere. **Deve ser igual ao `postes[0].poste`.** |
| `base_bom` | Sim | objeto | Materiais e quantidades **no poste de referência**. Ver §5. |
| `postes` | Sim | lista | Todos os postes possíveis e suas diferenças. Ver §5. |
| `condicionais` | Não | lista | Itens que a norma deixa para o projeto. Ver §6. **Não entram na soma.** |
| `categoria` | Sim | texto | Define o **grupo/seção** na tela. Ver §9 (convenção importa!). |
| `sheet`, `col` | Não | texto | Origem na planilha (legado). Pode **omitir** em extrações novas. |

---

## 5. O coração: `base_bom` + `postes` (o truque das diferenças)

A mesma estrutura pode ir em vários postes (10/150, 10/300, 11/1000…), e quase tudo é
igual entre eles — muda pouca coisa. Para não repetir a lista inteira N vezes, o sistema
guarda:

- **`base_bom`** = a lista **completa** de materiais no **poste de referência** (`poste_ref`).
  Formato: `{ "idMaterial": quantidade }`. Exemplo: `{ "14": 2.0, "180": 2.0 }` =
  2× material 14 (cruzeta) + 2× material 180.
- **`postes`** = lista de cada poste com um **`delta`** (só as **diferenças** em relação ao
  `base_bom`):
  - `delta` vazio `{}` → esse poste usa exatamente o `base_bom`.
  - `delta` com valores → **soma** ao base: positivo adiciona, **negativo remove**.

**Como o programa calcula a lista de um poste:**
```
lista_do_poste = base_bom + delta_do_poste   (some material por material)
```
Exemplo (`S1`): no poste `DT-10/1000` o delta é `{ "181": 2.0, "180": -2.0 }`. Resultado:
remove 2× do material 180 e adiciona 2× do material 181, mantendo todo o resto do `base_bom`.

**Regras:**
- O **primeiro item** de `postes` deve ser o `poste_ref`, com `delta: {}`.
- As **chaves** de `base_bom` e de cada `delta` são **id de material como texto** e devem
  ser **inteiros** (`"14"`, não `"14a"`).
- As **quantidades** são números (aceita decimais, ex.: `0.14008`; e negativos só em delta).

> Ao extrair de uma norma: escolha **um poste como referência** (normalmente o menor/mais
> comum), monte o `base_bom` completo dele, e para os outros postes registre **só o que
> muda** (delta). Se a norma já dá a lista cheia de cada poste, calcule o delta =
> (lista_do_poste − base_bom) item a item.

---

## 6. `condicionais` — itens que a norma deixa para o projeto

Itens que a norma **não fecha** (dependem do projeto): transformador, para-raios, chave
fusível, elo, cruzeta "a resolver" etc. Eles **não entram na soma automática** — são uma
nota para o usuário decidir.

```json
"condicionais": [
  { "id": null, "descricao": "Para-Raios de Distribuição.", "qtd": 3.0,
    "condicao": "Resolver Tabela P conforme projeto (NDU 005 p.330)" }
]
```

| Campo | Significado |
|---|---|
| `id` | id do material **se já for resolvível**; senão `null`. |
| `descricao` | Texto do item conforme a norma. |
| `qtd` | Quantidade indicada. |
| `condicao` | Quando/por que se aplica (cite a tabela/página da norma). |

> Diferente do `base_bom`/`delta`, os `condicionais` **podem** ter `id: null` (não precisam
> existir no `materiais.json`). Use isto para "Resolver Tabela X" da norma.

---

## 7. `insumos.json` — itens avulsos (cabos, aterramento)

Lista de itens cobrados **fora** das estruturas (por metro, por poste, etc.), ex.: extensão
de cabo nu, aterramento de neutro. Cada insumo também referencia materiais por `id` no campo
`bom`. Só mexa aqui se for adicionar/ajustar insumos avulsos.

```json
{ "id": "NEU_CABO2", "categoria": "Neutro Contínuo (NDU 005)",
  "descricao": "Extensão da rede – cabo nu 2 CAA (informe os metros)",
  "unidade": "m", "fases": 0, "tensao_kv": 0, "bom": { "30": 0.14008 } }
```
Campo extra útil: `postes_por_haste` (ex.: `2`) — o usuário informa nº de postes e o sistema
calcula hastes = arredonda(postes ÷ esse número).

---

## 8. `catalog.json` e `manifest.json` (gerados — não editar)

- **`catalog.json`** = índice oficial: para cada estrutura guarda `id`, `categoria`, `rev`,
  `status`, `file`, `bytes`, `sha256`. O programa usa para **ordenar e filtrar** o que
  aparece (estrutura sem entrada no catálogo não é mostrada).
- **`manifest.json`** = `data_version` (versão da base) + lista de todos os arquivos com
  `sha256`/`bytes`. O cliente compara a `data_version` e os `sha256` para baixar **só o que
  mudou**.

Ambos são **reescritos pelo painel** a cada publicação (ele recalcula sha256 e sobe a
versão `AAAA.MM.DD-rN`). **Editar à mão quebra os checksums** e a atualização falha.

---

## 9. Convenção de nomes de `categoria` (define a seção na tela)

A `categoria` é texto livre, **mas o nome decide em qual seção da tela Início a estrutura
aparece** (lógica em `app/src/lib/secoes.ts`):

| A seção é… | quando a `categoria`… |
|---|---|
| **Monofásico** | começa com `Mono` e **não** contém `Rural` nem `Neutro` |
| **Trifásico** | começa com `Tri` e **não** contém `Rural` nem `Neutro` |
| **Rural (NDU 005)** | contém `Rural` |
| **Neutro Contínuo** | contém `Neutro` |
| **Outras redes** | qualquer outra coisa (cai num grupo genérico) |

Exemplos reais que funcionam:
- `"Monofásico 13,8 kV"`
- `"Trifásico 34,5 kV — Rural (NDU 005)"`
- `"Neutro Contínuo (NDU 005)"`

> Ao extrair de uma norma nova, **siga o padrão de nome** para a estrutura cair na seção
> certa. Se inventar um nome fora do padrão, ela vai para "Outras redes" (funciona, mas
> fica solta). Categorias podem ser renomeadas depois pelo painel (Estruturas → Renomear
> seção).

---

## 10. Regras de validação (o que o painel exige antes de publicar)

O painel roda duas checagens (`publisher/src/lib/validar.ts`):

**Formato (offline):**
- `id` presente e só com `A–Z a–z 0–9 . _ -`.
- `tipo` é texto; `categoria`, `poste_ref` não vazios.
- `tensao_kv` e `nominal_kv` numéricos; `fases` ∈ {1, 2, 3}.
- `condutor` é texto ou `null`; `status` ∈ {ativo, descontinuado}; `rev` ≥ 1.
- `base_bom` e cada `delta`: **chaves inteiras** (`^\d+$`) e **quantidades numéricas**.
- `postes` é lista; o 1º poste deve casar com `poste_ref` (senão, aviso).

**Contra a base (integridade):**
- **Todo material citado** em `base_bom`/`delta` **precisa existir** no `materiais.json`
  (senão: *"material X não existe na base"*). → cadastre o material **antes**.
- `id` não pode repetir no lote.
- Em correção, o `rev` tem de ser **maior** que o já publicado.

> `condicionais` **não** passam por essa integridade (podem ter `id: null`).

---

## 11. Passo a passo: da norma (PDF) ao JSON publicado

1. **Mapear os materiais da norma.** Liste todos os itens citados. Para cada um, ache o
   `id` no `materiais.json` (por descrição/SAP). Anote os que **não existem**.
2. **Cadastrar materiais novos.** Para cada item inexistente, adicione um objeto ao
   `materiais.json` com **id novo** (maior id atual + 1), `descricao`, `unidade`, `cod_sap`.
3. **Para cada estrutura da norma:**
   - Preencha os metadados (`id`, `tipo`, `categoria`, `tensao_kv`, `nominal_kv`, `fases`,
     `condutor`, `norma_origem`, `pagina_origem`).
   - Escolha o **poste de referência** e monte o `base_bom` completo dele (id → qtd).
   - Liste **todos os postes** em `postes`; para cada um, calcule o `delta` (só diferenças).
     O 1º poste = `poste_ref` com `delta: {}`.
   - Registre os `condicionais` (tabelas "a resolver").
   - `rev: 1`, `status: "ativo"`, `schema_version: 1`.
4. **Publicar pelo painel** (aba *Estruturas* → *+ Nova estrutura*, ou *Modelo* para colar
   JSON pronto). O painel valida, gera `catalog.json`/`manifest.json` e faz o commit.
   - Materiais novos: cadastre-os **antes** (senão a validação barra).
5. **Conferir no Histórico** que saiu uma versão nova; os clientes recebem na próxima
   verificação de atualização.

---

## 12. Checklist de extração (por estrutura)

- [ ] `id` único definido (e vira o nome do arquivo).
- [ ] `categoria` no padrão da seção certa (§9).
- [ ] `tipo` (subgrupo) preenchido.
- [ ] `tensao_kv`, `nominal_kv`, `fases`, `condutor` corretos.
- [ ] `poste_ref` escolhido **e** igual a `postes[0].poste`.
- [ ] `base_bom` completo no poste de referência, só com ids existentes.
- [ ] Todos os postes em `postes`, cada um com seu `delta` (diferenças).
- [ ] Materiais novos **já cadastrados** no `materiais.json`.
- [ ] `condicionais` registrados (tabelas a resolver), com `condicao` citando a página.
- [ ] `rev: 1`, `status: "ativo"`, `schema_version: 1`, `norma_origem`/`pagina_origem`.

---

## 13. Resumo mental

> **Material = peça (id + nome).** **Estrutura = receita (lista de ids + quantidades, com
> variações por poste em `delta`).** **Relação de materiais = soma das receitas escolhidas.**
> Para uma norma nova: cadastre as peças que faltam, escreva uma receita por estrutura, e
> publique pelo painel — o resto (catálogo, checksums, versão, distribuição) é automático.
</content>
</invoke>
