# Auditoria da extração NDU 004.1 (Rede Compacta) — Relatório de divergências

**Escopo:** conferir, contra o PDF da norma (visão computacional), as **100 estruturas** e **23 materiais**
da extração NDU 004.1 já existente na base (`app/public/data/ndu004_*.json`, mesclada em
`estruturas.json`/`materiais.json`, **não comitada**). Nada na base ao vivo foi alterado — correções
ficam aqui em `Inf extraida/` para revisão e aplicação manual pelo painel.

**Método:** o PDF é **digital (camada de texto real, não escaneado)** → os dígitos de quantidade são
exatos onde a linha é segmentada corretamente. A auditoria cruzou: (a) o texto/tabelas extraídos, (b) as
tabelas-mestre do **§15 (p.267–279)**, e (c) **renderização em imagem (até 8×)** das páginas suspeitas e de
uma amostra de calibração. Duas varreduras automáticas cobriram **as 50 listas**: contagem de ETU×linhas e
detector de linhas sem código.

---

## 1. Resultado global

| Bloco | Resultado |
|---|---|
| §15 — 10 tabelas paramétricas resolvidas (A,L,H,N,O,P,Q,J,C,I) | ✅ **Todas corretas** |
| Completude (todas as listas capturadas) | ✅ **50 listas; nenhuma perdida** |
| Quantidades `base_bom`/`delta` (Circular/Duplo T/PRFV) | ✅ **Confiáveis** (1099/1100 linhas limpas) |
| Estruturas **duplicadas** | ⚠️ **2** (K77, K78) → remover |
| Estruturas com **linha de material perdida** | ⚠️ **2** (CEJ2A, CEM3) → 4 arquivos corrigidos |
| Decisões de auditoria (critério **excesso > falta**) | ✅ Grampo → **id 78 somado**; 90552 mantido "Suporte L" |

**Veredito:** a extração é **de alta fidelidade**. As tabelas do §15 (a parte de maior alavancagem — um
código errado contaminaria dezenas de estruturas) estão **100% corretas**. Os defeitos são pontuais e
estão corrigidos/sinalizados abaixo.

---

## 2. §15 — tabelas paramétricas (verificadas na imagem, p.270–279)

Todos os códigos usados pelo resolvedor batem com a norma:

| Tabela | Mapa na extração | §15 (norma) | OK |
|---|---|---|---|
| A — Braço L | 15→90544 · 36.2→90513 | 90544=15; 90513=24,2/36,2 | ✅ |
| L — Braço C | 15→90542 · 36.2→90543 | idem | ✅ |
| H — Espaçador Losangular Tri | 15→90567 · 36.2→90568 | idem | ✅ |
| N — Pino Curto | 15→90280 · 36.2→90281 | idem | ✅ |
| O — Isolador Bastão | 15→90277 · 36.2→90279 | 90277=15·90278=24,2·90279=36,2 | ✅ |
| P — Espaçador Reto Mono | 15→91066 · 36.2→92125 | idem | ✅ |
| Q — Suporte Horizontal | 15→90656 · 36.2→90657 | idem | ✅ |
| J — Isolador Pino (Anel) | 15→90275 · 36.2→90276 | Anel; Garra=90649/90650 | ✅ |
| C — Paraf. Cab. Abaulada | 45/70/150→90372/90373/90374 | idem | ✅ |
| I — Paraf. Rosca Dupla | 200..650→90375..90385 | idem | ✅ |

Decisão herdada (documentada, mantida): **Tabela J → tipo Anel** por padrão (alternativa Garra
90649/90650 registrada em `observacoes`). Postes (D/E/F), cinta (B), parafuso quadrado (M) e equipamentos
(R/S/U/V/W/X/Z/AA/AB) ficam como **condicionais** (resolver por projeto) — correto, não inventar.

---

## 3. Completude

- 289 páginas; **51** contêm "Lista de materiais" → **50 listas reais** + **p.152** (que é página de
  **NOTAS**, "porca-olhal/detalhe 1", não estrutura). Nenhuma lista perdida em p.84–127 nem p.240–266.
- Não há legenda alternativa ("relação de materiais": 0 ocorrências).
- 50 listas × 2 tensões (13,8 e 34,5 kV) = 100 estruturas. A duplicação por tensão é **válida**: o desenho
  é único e os itens dependentes de tensão são resolvidos pelo §15. (24,2 kV não é gerada — coerente com a
  norma, que trata 24,2/36,2 juntas.)

---

## 4. Divergências corrigidas

### 4.1 Estruturas duplicadas → **remover** (ver `_remocoes.json`)
A norma desenha **CE3-TR em duas páginas (p.202 e p.209) com listas idênticas** (23 linhas, byte a byte).
A extração gerou 4 estruturas; 2 são redundantes.

| Remover | = duplicata de | Motivo |
|---|---|---|
| **K77** (CE3-TR 13,8 kV, p.209) | K71 (p.202) | listas idênticas |
| **K78** (CE3-TR 34,5 kV, p.209) | K72 (p.202) | listas idênticas |

> Manter K71/K72. (CE2-TR p.200 "2°Nível", p.204 "AP" e p.207 são **distintas** — não duplicar.)

### 4.2 Linhas de material perdidas → **4 arquivos corrigidos** (`correcoes/<id>.json`)

| Estrutura | Pág. | Linha perdida | Causa | Correção |
|---|---|---|---|---|
| **CEJ2A** (K39, K40) | 170 | F-32 Parafuso Rosca Dupla (Tabela I) 0/2/2 | código veio como "Tabela" **sem a letra** (quebra de linha) → descartada | add condicional (Tabela I, 0/2/2) |
| **CEM3** (K49, K50) | 180 | F-32 Parafuso Rosca Dupla (Tabela I) 0/3/3 | **colisão de texto** (linha malformada) | add condicional (Tabela I, 0/3/3) |
| **CEM3** (K49, K50) | 180 | O-7 **Grampo de Linha Viva** 1/1/1 | **sem código SISUP** na norma → descartada | **resolvido: id 78 (GLV) somado no base_bom** (ver §5) |

As quantidades das demais linhas e os `delta` por poste foram conferidos e estão corretos (ex.: CE1 p.128,
CE3 p.137, CEJ2A p.170, CE3.N3 PR p.168 conferidos na imagem). Nenhum material espúrio foi somado pela
linha malformada (o código inválido "013" foi corretamente descartado).

---

## 5. Decisões de auditoria (critério: **antes excesso que falta**)

1. **Grampo de Linha Viva (CEM3, p.180) — RESOLVIDO e somado.** Linha O-7, qtd 1/1/1, sem código SISUP na
   norma. Adotado **id 78** (`cod_sap 502940`, "Conector derivação para linha viva - **GLV**" = Grampo de
   Linha Viva) e **somado no `base_bom`** de K49/K50 (deixou de ser condicional). Item barato; incluir evita
   falta na obra. *(evidência: `_audit/img/p180_o7b.png`)*

2. **Código 90552 — mantido "Suporte L" (qtd 3).** As listas (CE3.N3 PR p.168; N1-CE3 CFU p.239) trazem
   `90552 = "Suporte L"`; o §15 Tabela AB (p.279) usa o mesmo código para "Chave seccionadora 24,2 kV"
   (conflito da própria norma). Decisão: vale o **desenho** (Suporte L, 3 un. = 1/fase) — a estrutura não é
   de seccionadora e 3 chaves seriam item caro e errado. A **quantidade não muda** em nenhuma hipótese (sem
   risco de falta); apenas **conferir o SISUP 90552 na compra**. Afeta K37, K38, K99, K100.
   *(evidência: `_audit/img/p168.png`, `p279.png`)*

3. **Parafuso rosca dupla "tamanho adequado" (CEJ2A/CEM3) — mantido condicional.** Sem medida na norma;
   parafuso de comprimento errado é refugo, não margem de segurança → resolver por projeto (igual às demais
   estruturas com Tabela I sem medida).

---

## 6. Observações menores (cosméticas — sem impacto no BOM)

- **Descrições variantes do mesmo SISUP** (a base mostra a descrição do cadastro, não a da lista): 90302
  ("alça de aço/estai"), 90416 ("cantoneira abas retas" × "para braço C"), 90521 ("Suporte Tipo L"),
  90536 ("Braço J"×"tipo J"), 90515 ("Fixador para/de perfil U"). Mesmo código → BOM correto.
- **Condicionais com letra de tabela trocada** em CE2-TR AP (p.204) e CE2-TR (p.207): para-raios citado
  como "Tabela U" e transformador como "Tabela R" (deveriam ser R e V). São **condicionais (não somadas)** e
  a **descrição está certa** — só a citação da tabela diverge. Conferir se preferir precisão na rastreabilidade.
- **Rótulos `tipo` verbosos/encoding**: "CE3 com Perfil U - CE3U", "CE4 – Perfil U - CE4U",
  "CEJ4-M3- CFA", "CE2-TR (2°Nível)". Funcionam como rótulo; opcional padronizar.
- Sobre a categoria/seção: a norma **já tem seção própria** no app ("Compacta (NDU 004.1)" em `Home.tsx`) —
  o padrão `"<Fase> <kV> — Compacta (NDU 004.1)"` está correto e **não exige** ajuste de código.

---

## 7. Entregáveis (em `Inf extraida/`)

- `_RELATORIO.md` — este relatório.
- **`NDU004_correcoes_publicar.json`** — **arquivo único no formato de publicação** (array de 6 estruturas),
  pronto para subir no painel:
  - K39, K40 (CEJ2A) e K49, K50 (CEM3) — `status: ativo`, corrigidas (CEM3 com Grampo = **id 78** somado).
  - K77, K78 (CE3-TR p.209) — `status: descontinuado` (duplicatas; regra "nunca apagar, descontinuar").
- `_audit/img/` — imagens renderizadas usadas como evidência.

**Notas de formato (seguindo o modelo de publicação):**
- `base_bom`/`delta` usam o **`id` numérico** do material (não o cod_sap): ex. 90389→14, 90302→337,
  GLV 502940→78. Todos validados (existem na base).
- `nominal_kv` = **fase-neutro** conforme o modelo: **7,97** (13,8 kV) / **19,92** (34,5 kV). *Obs.: as outras
  94 estruturas compacta da base ainda usam tensão de linha (13,8/34,5); se quiser, normalizo todas.*
- `rev: 2` (corrige o que já está na base). Se essas K* nunca foram publicadas pelo painel, `rev: 1` basta.

**Como aplicar (painel):** subir `NDU004_correcoes_publicar.json` (o painel valida formato + códigos e
publica: K39/K40/K49/K50 atualizadas; K77/K78 saem da criação). Na compra, **conferir o SISUP 90552**
(§5.2). Catálogo compacta efetivo: **98 estruturas**. Não editar `catalog.json`/`manifest.json` à mão.
