# Relatório de Viabilidade — Camada de Orçamento Automático

> **Status:** estudo e proposta. **Nenhum código, dado ou schema foi alterado.**
> A implementação só começa após aprovação do dono, etapa por etapa.

---

## 0. Sumário executivo

A camada de orçamento automático **é viável** sobre o sistema atual, com risco controlado, desde que (a) os preços sejam vinculados a `Material.id` (nunca por nome/SAP), (b) cada orçamento grave um *snapshot* dos preços usados, e (c) a precificação seja **aditiva** — se falhar, a geração da BOM continua funcionando.

O gatilho de engate é único e bem definido: `App.tsx:24-27` chama `consolidate(...)` e devolve `Consolidation.rows` (lista final de materiais com quantidades). A função de orçamento entra **logo depois**, recebendo essas linhas e a tabela de preços.

Há duas tensões de design que precisam ser resolvidas antes de codar e estão marcadas como **PORTÕES** no fim deste documento.

---

## 1. FASE 1 — Entendimento do sistema atual

### 1.1 Stack
- **Frontend:** React 19 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`), Vite 8, Tailwind 4, Zustand 5.
- **Export:** `xlsx` (SheetJS) + `jspdf` + `jspdf-autotable`.
- **Backend:** **não existe.** App é 100% client-side, servido como SPA estático no Vercel (`vercel.json` reescreve tudo para `/index.html`).
- **Base de dados:** JSONs estáticos em `app/public/data/` (`materiais.json`, `estruturas.json`, `insumos.json`), gerados pelo pipeline Python em `extraction/` a partir da planilha `GERAÇÃO DE MATERIAL.xlsm`.

### 1.2 Modelo de dados (em `app/src/types.ts`)

| Tipo | Identidade | Campos relevantes para orçamento |
|---|---|---|
| `Material` | `id: number` (único, estável) | `cod_sap`, `cod_lider7`, `descricao`, `unidade`, `categoria?` |
| `Estrutura` | `id: string` | `tipo`, `condutor`, `tensao_kv`, `fases`, `base_bom`, `postes[].delta` |
| `Insumo` | `id: string` | `bom`, `unidade`, `postes_por_haste?` (conversão postes→hastes) |
| `BomMap` | `Record<materialId, quantidade>` | mapa material→qty (qty pode ser fracionário) |
| `ObraItem` | `key: string` | estrutura escolhida + poste + qty |
| `ObraInsumo` | `key: string` | insumo escolhido + qty |
| `BomRow` | — | `material` + `quantidade` consolidada |

**Achados objetivos sobre o catálogo (`materiais.json`):**
- 301 materiais cadastrados, **301 ids únicos** (sem duplicatas). `id` é seguro como chave de preço.
- 172 com `cod_sap` preenchido, **mas apenas 169 valores únicos** (há SAPs repetidos). 129 sem SAP. ⚠ **Precificar por SAP/Líder7 não funciona — tem que ser por `id`.**
- 12 entradas são "headers" da planilha (descrição vazia, `cod_sap` carrega o título tipo *"MATERIAIS PARA MEDIÇÃO COM MURETA..."*) — não são materiais reais.
- 291 ids efetivamente referenciados pelas 876 estruturas; 10 estão no catálogo mas nunca aparecem em nenhuma BOM. Cadastrar preço para os ~291 cobre 100% do que o motor vai precisar.

### 1.3 Fluxo de geração da BOM (gatilho do orçamento)

```
Usuário escolhe estrutura + poste + qtd  (EstruturaCard.tsx:44-50)
        └─> addItem → store.itens  (store.ts:122-136)

Usuário escolhe insumo + qtd  (InsumoCard.tsx:13-20)
        └─> addInsumo → store.obraInsumos  (store.ts:143-154)

App renderiza:
  cons = useMemo(consolidate(estruturas, insumos, itens, obraInsumos, materials))
                                                   ↑ App.tsx:24-27

consolidate() (lib/bom.ts:36-65):
  para cada ObraItem:
    bom_unitário = base_bom + postes[posteIdx].delta   (unitBom)
    acumula bom_unitário × quantidade no mapa global
  para cada ObraInsumo:
    acumula insumo.bom × quantidade
  retorna { rows: BomRow[], byItem, totalItens, totalEstruturas }
```

**O orçamento se engata aqui:** consumindo `cons.rows` (consolidado) ou `cons.byItem` (por linha) e cruzando com a tabela de preços por `material.id`.

### 1.4 Unidades em uso

Levantamento real sobre os **291 materiais utilizados** pelas 876 estruturas:

| Unidade | Qtde | Observação |
|---|---|---|
| `pç` | 264 | Caso simples — preço × qty, 1-para-1. |
| `m` | 13 | Cabos isolados, fios — preço pode ser cadastrado por m (direto) ou por rolo (precisa de fator). |
| `kg` | 1 | **Cuidado:** Arame (id 12). Cabos nus de Al/CAA (ids 30, 31, 32, 33) também aparecem em **kg** na BOM, vindos de coeficientes `kg/m de extensão` nos insumos (ex.: `"30": 0.14008` = 0,14008 kg de cabo por metro de rede). |
| `und` | 1 | Equivalente a peça. |
| `""` | 12 | "Headers" da planilha — descartar do cadastro. |

→ Resposta confirmada pelo dono: **preço de cabo pode ser cadastrado por kg ou por metro, com sistema convertendo** (ver §3.5).

### 1.5 Identidade visual e padrões de código

- Tailwind 4 com paleta **slate** (texto/bordas), **sky** (ação principal), **emerald** (sucesso/exportar), **rose** (PDF), **amber** (insumos/quantitativos). Cards com `rounded-lg border border-slate-200 bg-white shadow-sm`.
- Estado global em **Zustand** (`store.ts`). Tudo derivado: nenhuma cópia de estado, `useMemo` com seletores.
- Componentes pequenos, funcionais, sem libs de UI. Botões com classes `rounded-md px-3 py-2 text-sm font-medium`.
- Print mode: classe `.no-print` esconde controles ao imprimir/exportar PDF.

A nova camada deve seguir exatamente esse padrão para não destoar.

---

## 2. FASE 2 — Estudo de viabilidade

### 2.1 Viável? Sim, com 3 pré-condições inegociáveis

1. **Vínculo por `Material.id`** (nunca por nome, nunca por SAP). O catálogo já garante essa estabilidade.
2. **Snapshot do preço** dentro de cada orçamento gerado. Mudar preço *depois* não pode alterar orçamento *antes*.
3. **Camada aditiva**: se a precificação falhar (preço faltando, conversão de unidade impossível), a BOM continua sendo gerada e exportada normalmente. Orçamento é complemento, não bloqueio.

### 2.2 Riscos priorizados

#### G1 — Risco crítico (pode invalidar o produto)

| # | Risco | Mitigação proposta |
|---|---|---|
| G1.1 | **Múltiplos engenheiros externos × JSON empacotado**: o dono escolheu "preços viajam no JSON" *e* "vários engenheiros externos". Isso colide — se o JSON é único, ou todos veem os preços do dono (não dá pra cada um ter o seu), ou cada engenheiro tem que dar fork do projeto. | Modelo híbrido (§3.2): JSON do dono é "preço sugerido/base"; LocalStorage do engenheiro guarda *overrides* por material. UI mostra de onde veio cada preço. |
| G1.2 | **Float em dinheiro**: JavaScript faz `0.1 + 0.2 = 0.30000000000000004`. Somar centenas de subtotais em float é receita para erro. | Internalmente trabalhar com **centavos em inteiro** (`bigint` ou `number` inteiro). Conversão para R$ só na exibição. Arredondamento bancário consistente. |
| G1.3 | **Item sem preço cadastrado**: a BOM gera, mas o motor não acha o preço. Se o sistema assumir zero, sai orçamento mentindo. | Item entra como **"PENDENTE"**, valor não soma, total exibido como *"R$ X (parcial — N itens pendentes)"*, banner amarelo no topo. Nunca silenciar. |
| G1.4 | **Preço enviado vira contrato**: orçamento errado é prejuízo ou disputa jurídica. | Documento exportado com aviso explícito: *"Orçamento gerado automaticamente — conferência humana obrigatória antes do envio"*. Status `rascunho/enviado/aprovado/recusado/expirado`. |

#### G2 — Risco alto (pode degradar muito)

| # | Risco | Mitigação proposta |
|---|---|---|
| G2.1 | **Conversão kg/m do cabo**: ids 30/31/32/33 chegam à BOM em **kg** (já convertidos pelo coeficiente kg/m do insumo). Se o usuário cadastrar preço em R$/m mas o sistema multiplicar pelo kg, sai 4-7× errado para mais. | Cadastro de preço exige `unidade_preco`. Conversão `preço × qty` só executa se `unidade_preco == material.unidade`; se diferente, exige `fator_conversao` explícito (ex.: 1 m de cabo CAA 4/0 ≈ 0,2125 kg). Sem fator → item entra como "pendente — conversão indefinida". |
| G2.2 | **Carga inicial de 291 preços**: cadastrar 291 itens à mão trava a adoção. | **Importação CSV obrigatória já na v1**, com template baixável: `id,cod_sap,descricao,unidade_material,valor,unidade_preco,fator_conversao,validade,fornecedor`. Editar planilha → importar → sistema sobrescreve por `id`. |
| G2.3 | **732 "condicionais" com `id: null`** (itens que a norma deixa para o projetista — pára-raios variado, conector específico, cruzeta alternativa). Hoje não somam na BOM, então também não somam no orçamento — mas o usuário precisa saber que tem coisa "fora do orçamento". | Banner: *"Esta obra tem N itens condicionais que dependem de decisão de projeto e não estão precificados"*, com lista. |
| G2.4 | **Mudança de preço retroativa**: trocar preço do parafuso hoje não pode alterar o orçamento de 30 dias atrás. | Cada `Orcamento` grava `snapshot: { material_id, descricao_snapshot, unidade_snapshot, qty, preco_unit_snapshot, total_snapshot }`. Render do orçamento usa o snapshot, não o catálogo atual. |
| G2.5 | **Preço vencido**: cadastrei o preço do trafo em jan/2025, gero orçamento em jul/2026 sem perceber. | Cada preço tem `validade` (data). Motor gera, mas marca cada item como `validade_ok / vencido` e emite aviso global. |

#### G3 — Risco médio (controlável)

| # | Risco | Mitigação proposta |
|---|---|---|
| G3.1 | **Múltiplos fornecedores para o mesmo material**: qual usar? | v1: 1 preço "ativo" por material, e histórico opcional. Definição de qual fornecedor "ganha" fica fora do escopo v1. |
| G3.2 | **Performance**: 291 lookups por render. | Trivial — `Map<id, preco>` em memória, O(n) em algo da ordem de 100-500 linhas. Sem problema. |
| G3.3 | **Mobile (375px)**: telas de cadastro de preço em massa não cabem. | CRUD de preço com card em mobile, tabela em desktop. Cadastro em massa só via CSV. |
| G3.4 | **Refatorar de brinde** a lógica de BOM existente. | Regra estrita: não tocar em `lib/bom.ts`, `extraction/*`, JSONs base. Toda lógica nova fica em `lib/orcamento.ts` e componentes próprios. |

### 2.3 Perguntas abertas — **PORTÕES DE APROVAÇÃO**

> Cada uma destas precisa de resposta antes de qualquer linha de código. Estão numeradas para referência.

**P1.** **Preços oficiais × preços do engenheiro.** As respostas iniciais ("JSON empacotado" + "vários engenheiros externos") colidem. Qual modelo segue?
- **(a)** Você é a fonte única; engenheiros usam os preços oficiais que você atualiza. Sem personalização.
- **(b)** Híbrido recomendado: JSON oficial = base; LocalStorage local = overrides por engenheiro; UI marca preço como **"oficial"** ou **"meu"**. Exportável (engenheiro pode salvar seu CSV).
- **(c)** Cada engenheiro 100% local, JSON oficial não existe.
- **(d)** Vai para backend mesmo (ver P2).

**P2.** **Backend a curto/médio prazo?** Se a meta é vender para vários engenheiros externos, sem backend o produto trava em: login, isolamento, recuperação de senha, painel admin de preços, telemetria de uso. Para v1 dá para ir sem. Em que horizonte (3 / 6 / 12 meses) o backend é aceitável?

**P3.** **Margem × markup.** São coisas distintas:
- *Margem* 25% → preço final = custo / (1 − 0,25) = custo × 1,333.
- *Markup* 25% → preço final = custo × 1,25.
Qual você usa? (Confundir os dois é prejuízo silencioso.)

**P4.** **Mão de obra.** Por estrutura (R$/U1, R$/N3-CFu...) ou por hora/dia da equipe? Ou um % global sobre material?

**P5.** **Perda/sobra.** Aplicar % de perda em **todos** os materiais, só em **alguns** (cabos, parafusos), ou item a item? Quem decide o %?

**P6.** **Frete.** Valor fixo por orçamento, % do material, ou fora do orçamento automático?

**P7.** **Imposto estimado.** Quer estimar (% sobre o total) ou deixar de fora explicitamente?

**P8.** **Validade padrão do preço.** 30 / 60 / 90 dias? E do orçamento gerado?

**P9.** **Documento de orçamento exportado** — formato esperado: PDF (paisagem? retrato?), Excel, link compartilhável (precisaria de backend)? Quais campos no cabeçalho além de obra/endereço/responsável/data?

**P10.** **Múltiplos fornecedores** entram na v1 ou ficam para fase 2?

---

## 3. FASE 3 — Proposta de design

> Esta seção pressupõe que P1=(b) híbrido e P2 = "backend só depois". Se outras respostas, parte do desenho muda.

### 3.1 Princípios

1. **Material.id é a única chave de preço.** Nada de nome, nada de SAP.
2. **Snapshot por orçamento.** Cada orçamento gerado é imutável quanto ao preço que usou.
3. **Centavos em inteiro** dentro do motor; R$ só na exibição.
4. **Camada aditiva.** A geração da BOM nunca depende da precificação.
5. **Transparência.** Toda linha do orçamento mostra: `descrição × qty × preço_unit = subtotal`, com origem do preço (oficial/meu/pendente) e validade.

### 3.2 Onde os preços moram (modelo híbrido)

```
app/public/data/precos.json    ← base "oficial" (versionada em git pelo dono)
[{ "material_id": 12, "valor_centavos": 3450, "unidade_preco": "kg",
   "fator_conversao": null, "validade": "2026-12-31", "fornecedor": "X", "atualizado_em": "..." }, ...]

LocalStorage["precos_overrides_v1"]   ← ajustes do engenheiro (sobreescreve por material_id)
{ "12": { "valor_centavos": 3700, "origem": "meu", "atualizado_em": "..." }, ... }
```

Resolução de preço: `override > oficial > pendente`. UI mostra origem.

> **Quando o backend vier (P2)**, troca-se essas duas fontes por API; o motor de cálculo não muda.

### 3.3 Modelo de dados novo (TS — só os shapes, não a UI)

```typescript
// lib/orcamento/types.ts
export type Centavos = number;  // sempre inteiro

export interface PrecoMaterial {
  material_id: number;            // FK para Material.id
  valor_centavos: Centavos;       // ex.: 1234 = R$ 12,34
  unidade_preco: string;          // "pç" | "m" | "kg" | "und"...
  fator_conversao: number | null; // multiplicador para casar qty_bom com unidade_preco
  validade: string | null;        // ISO date; null = sem validade
  fornecedor?: string;
  origem: "oficial" | "meu";
  atualizado_em: string;          // ISO datetime
}

export interface ConfigOrcamento {
  perda_pct: number;                          // 0..100
  mao_obra: { tipo: "pct" | "por_estrutura" | "valor_fixo"; valor: number; mapa?: Record<string, Centavos> };
  frete: { tipo: "valor" | "pct"; valor: number };
  margem: { tipo: "margem" | "markup"; valor_pct: number };
  imposto_estimado_pct: number;
}

export interface ItemOrcamentoSnapshot {
  material_id: number;
  descricao_snapshot: string;
  unidade_snapshot: string;
  qty: number;                    // da BOM
  preco_unit_centavos: Centavos;  // já convertido p/ unidade da BOM
  subtotal_centavos: Centavos;
  origem_preco: "oficial" | "meu" | "pendente";
  validade_status: "ok" | "vencido" | "sem_validade";
  aviso?: string;                 // ex.: "conversão kg/m aplicada com fator 0,2125"
}

export interface Orcamento {
  id: string;                     // gerado local (uuid v7)
  meta: ObraMeta;                 // já existe no store
  gerado_em: string;
  status: "rascunho" | "enviado" | "aprovado" | "recusado" | "expirado";
  versao: number;                 // v1, v2, v3...
  itens: ItemOrcamentoSnapshot[];
  pendentes: { material_id: number; descricao: string; qty: number; motivo: string }[];
  subtotal_material_centavos: Centavos;
  perda_centavos: Centavos;
  mao_obra_centavos: Centavos;
  frete_centavos: Centavos;
  margem_centavos: Centavos;
  imposto_centavos: Centavos;
  total_centavos: Centavos;
  total_parcial: boolean;         // true se houver pendentes
  config_snapshot: ConfigOrcamento;
}
```

### 3.4 Cadastro de preços (CRUD + CSV)

UI nova: rota `/precos` (ou aba "Preços" no header).

- **Lista** (desktop: tabela; mobile: cards): material, unidade BOM, preço, unidade preço, fator (se aplica), validade, origem (oficial/meu).
- **Filtros:** por categoria, por status (com preço / sem preço / vencido).
- **Edição inline** do valor — UI clara que está criando *override* sobre o oficial.
- **Importação CSV** (botão "Importar"): aceita CSV/XLSX; valida; mostra prévia (N criados / N atualizados / N erros) antes de aplicar.
- **Exportação CSV**: baixa "meus preços" para backup ou compartilhar.
- **Reset de override**: voltar para o preço oficial.

Sem autenticação ou roles (P3 da §2.3 confirmará). LocalStorage é por navegador.

### 3.5 Motor de montagem do orçamento (`lib/orcamento/motor.ts`)

Função pura, sem dependência de UI:

```
montarOrcamento(
  rows: BomRow[],                          // saída de consolidate()
  precos: Map<material_id, PrecoMaterial>,
  config: ConfigOrcamento,
  meta: ObraMeta,
): Orcamento
```

Passos (em ordem):
1. Para cada `BomRow`:
   - Buscar preço por `material.id`.
   - Se não houver → entra em `pendentes`, **não soma**.
   - Se `unidade_preco != material.unidade`: aplicar `fator_conversao`. Se faltar fator → pendente com motivo "conversão indefinida".
   - Calcular `subtotal_centavos = round(qty * preco_unit_centavos)`.
   - Anotar `validade_status` e `origem_preco`.
2. Somar `subtotal_material_centavos`.
3. Aplicar `perda_pct` sobre subtotal.
4. Calcular `mao_obra_centavos` conforme tipo.
5. Calcular `frete_centavos`.
6. Aplicar margem (markup OU margem — fórmulas distintas, configuração explícita).
7. Aplicar imposto estimado.
8. Devolver `Orcamento` imutável, com `total_parcial = pendentes.length > 0`.

> **Arredondamento:** uma única função `round_centavos(n: number): number` usa half-even (bancário). Mesma função em motor, render e export. Documentada num teste.

### 3.6 Pontos de integração no código existente

| Onde | O que muda | Estilo |
|---|---|---|
| `app/src/types.ts` | Nada. Novos tipos em `lib/orcamento/types.ts`. | Aditivo. |
| `app/src/store.ts` | Acrescentar `precos: Map<id, PrecoMaterial>`, `config: ConfigOrcamento`, `orcamentos: Orcamento[]`, actions `setPreco / importPrecos / saveOrcamento / loadOrcamento`. Persistência em LocalStorage via `zustand/middleware/persist` para `overrides` e `orcamentos`. | Aditivo. Nenhuma action existente alterada. |
| `app/src/lib/bom.ts` | **Não tocar.** | — |
| `app/src/App.tsx:24-27` | Após `consolidate(...)`, calcular `orcamento = useMemo(() => montarOrcamento(cons.rows, precos, config, meta))`. | 3 linhas adicionais. |
| `app/src/components/ResultadoView.tsx` | Nova aba "Orçamento" ao lado de "Consolidado" / "Por estrutura". Renderiza `OrcamentoView`. | Aditivo: nova aba, sem alterar as existentes. |
| `app/src/export/excel.ts` | Aba nova "Orçamento" (não substitui as existentes). | Aditivo. |
| `app/src/export/pdf.ts` | Função nova `exportPdfOrcamento` (separada do PDF de BOM). | Aditivo. |
| `app/src/components/PreviewPanel.tsx` | Exibir "Total estimado: R$ X,XX (parcial se houver pendente)" no rodapé. | 1 bloco aditivo. |
| **Novos arquivos** | `lib/orcamento/{types,motor,formato,csv,validacao}.ts`, `components/PrecoCRUD.tsx`, `components/PrecoImport.tsx`, `components/OrcamentoView.tsx`, `app/public/data/precos.json` (vazio inicial). | — |

### 3.7 Documento de orçamento (saída)

PDF retrato A4 com:
- Cabeçalho: obra, endereço, município, responsável, data, **validade do orçamento**, número/versão.
- Tabela: material × unidade × qty × preço unit × subtotal × origem (símbolo: oficial/meu) × validade (símbolo: ✓/⚠).
- Quadro de pendentes (vermelho).
- Decomposição final: subtotal material, perda, mão de obra, frete, margem, imposto, **total**.
- Rodapé fixo: *"Documento gerado automaticamente. Confira antes de enviar. Valores sujeitos a verificação."*

Versionamento: ao "salvar como" novo orçamento, gera nova versão.

---

## 4. FASE 4 — Plano de implementação em etapas

> Cada etapa entra em `CHANGELOG.md` com frase em linguagem do dono. **Nenhuma etapa começa sem aprovação da anterior.**

| Etapa | Entrega | Como testar | Aprovação |
|---|---|---|---|
| **0. PORTÃO** | Validar §1 (entendimento) e §2.3 (P1..P10). | Dono lê este documento, responde as 10 perguntas. | ⛔ Trava todas as outras. |
| **1. Tipos e motor puro** | `lib/orcamento/types.ts` + `motor.ts` + `formato.ts` + 30+ testes unitários cobrindo: preço ausente → pendente, kg/m com fator, sem fator → pendente, margem vs markup, half-even, validade vencida, parcial × completo. **Sem UI.** | `npm test` (vai precisar de Vitest — proposta junto). 100% dos testes verdes. | Dono lê os testes (são a especificação). |
| **2. Cadastro de preço — CRUD** | Aba "Preços" com tabela/cards, edição inline de valor, override sobre oficial, persistência em LocalStorage. Sem CSV ainda. | Adicionar 5 preços manualmente, fechar/abrir aba, ver se persiste. Editar e ver indicação "meu". | Dono usa por 10 min. |
| **3. Importação/exportação CSV** | Template baixável, importação com prévia (criados/atualizados/erros), exportação dos overrides. | Importar planilha com 50 preços. Conferir erros são apontados sem aplicar. | Dono importa lote real. |
| **4. Engate na ResultadoView** | Nova aba "Orçamento". Render do `Orcamento` com tabela, decomposição, pendentes destacados. Total no PreviewPanel. | Gerar BOM real, ver orçamento parcial quando faltam preços. Adicionar preço faltante → recalcula automático. | Dono valida 3 obras reais. |
| **5. Camadas extras configuráveis** | Tela "Configuração do orçamento" para perda, MO, frete, margem (markup OU margem, explícito), imposto. Cada mudança recalcula. | Cobrir cada combinação. Comparar manualmente com calculadora. | Dono valida. |
| **6. Documento exportado** | PDF de orçamento + aba Excel "Orçamento". Aviso legal. Versão. | Exportar e abrir nos dois formatos. Conferir números batem com a tela. | Dono envia para 1 cliente teste. |
| **7. Salvar / versionar orçamentos** | "Salvar como" gera versão. Lista de orçamentos salvos (LocalStorage). Reabrir mostra snapshot original (mesmo se preço mudou). | Salvar v1, mudar preço, salvar v2, reabrir v1 — total tem que ser o de antes. | Dono valida. |
| **8. (Opcional, fase 2)** | Múltiplos fornecedores, histórico de preço, relatórios (ticket médio, materiais mais usados). | — | A decidir. |

**Vitest** entra na etapa 1 como dependência — proposta separada caso o dono já queira aprovar. Sem testes, o motor financeiro fica indefensável.

---

## 5. Estratégia de retenção (honesta)

A trava sustentável **não** vem de aprisionar dados. Vem de:

1. **Gravidade de dados.** Quanto mais preços, orçamentos versionados e histórico o engenheiro acumula no sistema, mais custoso fica migrar. Por isso a **exportação CSV** dos preços e dos orçamentos deve ser fácil — paradoxalmente, isso aumenta a adoção (entra sem medo), e a gravidade segura naturalmente.
2. **Integração na rotina diária.** Se o orçamento da semana passa por aqui, o sistema vira infraestrutura. A combinação BOM + orçamento num clique é o diferencial real frente à planilha manual.
3. **Ganho mensurável.** Exibir "este orçamento foi gerado em 12 segundos a partir de 47 itens" cria a percepção do tempo economizado.

**O que NÃO funciona** e foi descartado: dificultar exportação, esconder fórmulas, exigir senha para sair com seus dados. Num mercado pequeno, má reputação custa mais que reter à força.

**Cuidado adicional:** a meta de "vários engenheiros externos" sem backend é frágil. A primeira versão (LocalStorage) serve para validar o produto e cobrar o que vale; quando o uso justificar, a transição para backend já estará desenhada (§3.2 final).

---

## 6. Anti-objetivos confirmados

- ❌ Não implementar nada nesta etapa — entrega = leitura + estudo + proposta.
- ❌ Não alterar nem "melhorar de brinde" `lib/bom.ts`, `extraction/*`, JSONs base.
- ❌ Não virar e-commerce, não cobrar, não emitir NF.
- ❌ Não casar preço por nome/SAP/aproximação. Só por `Material.id`.
- ❌ Não usar `float` para dinheiro. Centavos em inteiro.
- ❌ Não calcular total apenas no frontend de forma não-determinística (a função `montarOrcamento` é pura, testável; em backend futuro a mesma assinatura sobe para servidor).
- ❌ Não assumir regra de negócio (margem × markup, perda %, MO) — confirmar em P1..P10.

---

## 7. Regras financeiras inegociáveis (lembrete)

1. Valores monetários SEMPRE em `Centavos` (inteiro).
2. Arredondamento half-even com função única `round_centavos`.
3. SNAPSHOT obrigatório por orçamento.
4. Frontend exibe; motor calcula; quando houver backend, motor sobe sem mudança.
5. Auditoria mínima: cada `PrecoMaterial` guarda `atualizado_em`. Em backend, log de quem mudou.
6. Item sem preço → "pendente", nunca zero silencioso.
7. Conversão de unidade explícita e testada — divergência tratada como erro.

---

## 8. Próximo passo

Aprovar §1 (entendimento) e responder **P1..P10** (§2.3). Sem isso, qualquer linha de código nasce em cima de premissa não-validada.
