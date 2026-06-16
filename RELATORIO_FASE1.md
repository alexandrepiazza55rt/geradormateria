# Relatório de Engenharia Reversa — Fase 1
## Arquivo: `GERAÇÃO DE MATERIAL.xlsm`

> Documento da **Fase 1** (análise da planilha) exigida antes de qualquer codificação.
> Objetivo: descrever fielmente como a planilha gera a relação de materiais (BOM), sem
> inventar nada, e listar as decisões/ambiguidades que precisam de confirmação.

---

## 1. Resumo executivo (o que foi descoberto)

1. **A planilha é muito maior do que o escopo do briefing.** O briefing fala em
   "fase × tensão → N1/N2/N3/N4 → materiais". A planilha real cobre **11+ módulos** de
   orçamento de rede (estruturas MT, rede compacta, baixa tensão, iluminação pública,
   transformadores, religadores, reguladores, subestação, medições e "extras"), com
   **24 abas** e **1.199 materiais** na lista mestre.

2. **O VBA NÃO contém regra de negócio.** Todas as macros são apenas navegação entre
   abas, formatação de bordas, autofiltros e "salvar". A lógica de cálculo está
   **inteiramente nas fórmulas das células** (as abas têm os tabs ocultos e são
   navegadas pelo menu de botões).

3. **O sistema é 100% linear.** Cada material final = soma de (quantidade digitada pelo
   usuário) × (coeficiente unitário fixo). Não há arredondamentos, condicionais
   complexas ou fatores escondidos — apenas `+`, `*`, `SUM` e `IF(flag=constante; …)`.

4. **Os coeficientes unitários (a "engenharia") estão guardados como colunas numéricas
   nas abas geradoras.** Isso permite extrair a base de dados **lendo diretamente essas
   colunas** — método offline, determinístico e rastreável célula→material (não depende
   de rodar o Excel).

5. **"Estrutura", na planilha, é multidimensional:** `tipo de estrutura` (U1, U3, N3,
   N4…) × `condutor` (2CAA, N8, 1/0CAA, 4/0CAA) × `tipo de poste` (DT-10/150 … DT-12/1000
   e variantes compactas "-C"). O usuário digita a quantidade no cruzamento dessas
   dimensões. Isso é mais rico do que o "N1/N2/N3/N4" do briefing.

---

## 2. Visão geral das 24 abas

Ordem real das abas (tabs ocultos; navegação pelo menu). "Geradora" = recebe digitação
do usuário e expande materiais.

| # | Aba | Papel |
|---|-----|-------|
| 1 | **Mono 13,8kv** | Geradora — estruturas **monofásicas**, tensão nominal 7,97 kV (classe 15 kV) |
| 2 | **Mono 34,5kv** | Geradora — estruturas **monofásicas**, 19,92 kV (classe 36,2 kV) |
| 3 | **Trifásico 13,8kv** | Geradora — estruturas **trifásicas** 13,8 kV |
| 4 | **Trifásico 34,5kv** | Geradora — estruturas **trifásicas** 34,5 kV |
| 5 | Estruturas 34,5kv | Detalhamento/impressão por estrutura (intermediária) |
| 6 | Materiais de Medições | Materiais de medição/padrões de entrada |
| 7 | **Materiais e Valores** | **SAÍDA CONSOLIDADA (BOM final)** — lista mestre de 1.199 materiais |
| 8 | Materiais de Medições compacta | Medição (rede compacta) |
| 9 | Transformadores | Seleção de transformadores |
| 10 | Compcta | Geradora — rede compacta (spacer cable) |
| 11 | BT-SI | Geradora — rede secundária / baixa tensão |
| 12 | EXTRAS (2) | Ajuste manual de materiais (adicionar/subtrair) |
| 13 | ILUMINAÇÃO PUBLICA | Geradora — iluminação pública |
| 14 | EXTRAS | Ajuste manual de materiais (adicionar/subtrair) |
| 15 | Estruturas 13,8kv | Detalhamento/impressão por estrutura (intermediária) |
| 16 | MEDIDÇÕES TRIFÁSICAS | **Oculta** — auxiliar de medição |
| 17 | Menu | Tela inicial (botões de navegação) |
| 18 | MEDIÇÃO AT 34.5KV | Medição em alta tensão 34,5 kV |
| 19 | RELIGADOR NOVA C.P.S | Geradora — religadores |
| 20 | RELIGADOR 13.8 e 34.5KV | Geradora — religadores |
| 21 | Plan1 | Rascunho/auxiliar |
| 22 | Subestação 34,5kv | Geradora — subestação |
| 23 | REGULADORES | Geradora — reguladores de tensão |
| 24 | Plan2 | Vazia/rascunho |

---

## 3. O VBA (apenas navegação — nenhuma regra)

`vbaProject.bin` tem 30+ procedimentos. **Todos** são triviais, por exemplo:

```vba
Sub Macro3()  ' botão -> vai para a aba
    Sheets("Mono 13,8kv").Select
End Sub
Sub Macro7()  ' botão -> aplica autofiltro "diferente de zero"
    Sheets("Estruturas 13,8kv").Select
    ActiveSheet.Range("$F$1:$F$99999").AutoFilter Field:=1, Criteria1:="<>0"
End Sub
```

Não há `Workbook_Open`, nem cálculo, nem expansão de materiais em código.
**Conclusão:** reproduzir o VBA é desnecessário; basta reproduzir as fórmulas.

---

## 4. Modelo computacional (fluxo de dados)

```
   ┌─────────────────────────────────────────────────────────────────┐
   │ ENTRADA (usuário digita nas abas geradoras)                       │
   │  • Matriz: linha = tipo de poste; coluna = (estrutura × condutor)  │
   │    → quantidade de cada estrutura                                  │
   │  • Escalares: extensão de rede em metros (2CAA/1·0/4·0/336,4),      │
   │    aterramentos, seccionadores, emendas, serviços (mão de obra…)   │
   └───────────────┬───────────────────────────────────────────────────┘
                   │  (coluna-coeficiente por estrutura)  count × coef
                   ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ EXPANSÃO POR ESTRUTURA (mesma aba, linhas 141–431 ≈ 291 materiais)│
   │  ex.: DP148 = SUM(DP5:DP26,DQ5:DQ26) * DO148                       │
   │       (Σ contagens da estrutura)   ×  (coef. unitário DO148=4)     │
   └───────────────┬───────────────────────────────────────────────────┘
                   │  soma das estruturas
                   ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ TOTAL POR MATERIAL NA ABA (coluna DW/DX/EX)                        │
   │  DW141 = IF(DX141=34; 0; I141+L141+P141+…+DU141)                   │
   │  (DX=34 é um flag que zera materiais exclusivos de 34,5 kV)        │
   └───────────────┬───────────────────────────────────────────────────┘
                   │  + soma entre as 4 geradoras + módulos
                   ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │ CONSOLIDAÇÃO → "Materiais e Valores" coluna E (BOM FINAL)          │
   │  E19 = 'Mono 13,8kv'!DW141 + 'Mono 34,5kv'!DX141                   │
   │      + 'Trifásico 34,5kv'!EX141 + 'Trifásico 13,8kv '!EX141        │
   │      + REGULADORES!N141                                            │
   │  (bloco seguinte usa Compcta! + 'BT-SI'! + 'ILUMINAÇÃO PUBLICA'!)  │
   └─────────────────────────────────────────────────────────────────┘
```

Equação geral (vale para todo o arquivo):

```
quantidade_final[material] = Σ  entrada[i] × coef_unitário[i][material]
                           (sobre todas as entradas i de todos os módulos)
```

Onde `coef_unitário[i][material]` é **lido diretamente** das colunas-coeficiente da
planilha (a fonte única de verdade).

---

## 5. Dicionário de dados

### 5.1 Lista mestre de materiais — aba "Materiais e Valores"
Cabeçalho na linha 18; itens a partir da linha 19 (1.199 materiais, até a linha ~1255):

| Coluna | Conteúdo | Observação |
|--------|----------|------------|
| A | "Líder 7" | código interno/legado (nem todo material tem) |
| B | **Cód. SAP** | código SAP do material (nem todo material tem) |
| C | **Descrição** | texto técnico (preservar literal, inclui erros de digitação originais) |
| D | **Unidade** | pç, m, kg, etc. (com espaços originais, ex.: " pç ") |
| E | **Quantidade** | resultado consolidado (fórmula que soma os módulos) |

A lista mestre está dividida em **blocos por módulo** (ex.: linhas 19–309 ↔ estruturas
MT + reguladores; bloco ~700+ ↔ compacta + BT + iluminação). A enumeração exata dos
limites de cada bloco é tarefa da Fase 2.

### 5.2 Catálogo de estruturas (lido das abas geradoras e "Estruturas …")

**Monofásicas (Mono 13,8kv / Mono 34,5kv):** CFU-AVULSO, ESTAI ÂNCORA, U1, UT1,
U3 (e variações: U3 p/ U4, U3-Derivação, U3-Cfu, U3-U3, U3-U3Cfu), U4 (e variações:
U4-CFU, U4-CH, U4-CR), e postes de transformador 5/10/15/25/37,5 kVA (poste de aço ou
concreto).
Condutores: **2CAA, N8**.

**Trifásicas (Trifásico 13,8kv / Trifásico 34,5kv):** CHAVE FUSÍVEL 3Ø, ESTAI ÂNCORA,
HTE, P1, PT1, PTA1, P3 (e variações), P4, N1 (normal de coxo / rara de topo), N3 (e
variações: N3-Derivação, N3-CFu, N3-CR, N3-N3, N3-N3-CFu, N3 p/ N4), N4 (e variações:
N4-CFu, N4-CR, N4-CH), N1T/N3T/N4T (com/sem trafo e Cfu).
Condutores: **2CAA, 1/0CAA, 4/0CAA**.

**Tipos de poste (linhas da matriz):** DT-10/150, DT-10/300, DT-10/600, DT-10/1000,
DT-11/200, DT-11/300, DT-11/600, DT-11/1000, DT-12/300, DT-12/600, DT-12/1000 e as
variantes compactas "-C" (10/150-C … 12/1000-C). `DT-A/B` = poste duplo-T de A metros e
B daN de resistência nominal.

### 5.3 Dimensões de categorização
- **Tensão:** 13,8 kV (classe 15) e 34,5 kV (classe 36,2). Nas monofásicas a tensão
  nominal fase-neutro é 7,97 kV e 19,92 kV, respectivamente.
- **Fases:** monofásico e trifásico.
- **Flag `DX=34`:** zera, na aba de 13,8 kV, os materiais que só valem para 34,5 kV.

---

## 6. Regras de negócio identificadas

1. **Expansão linear:** material = Σ (contagem da estrutura) × (coeficiente unitário).
2. **Poste é somado à parte da ferragem.** O coeficiente da ferragem da estrutura
   independe do poste (a fórmula soma todas as linhas de poste e multiplica por um único
   coeficiente). O material do poste entra por outra via, conforme o tipo de poste.
3. **Estruturas de 2º nível não orçam poste** (nota da própria planilha: "U3 PARA U4 e as
   estruturas de 2º Nível não orçam postes").
4. **Comprimento de condutor é auto-calculado** a partir dos vãos das estruturas
   (fórmulas do tipo `Σ(...)*5 + Σ(...)*10 + Σ(...)*15 + Σ(...)*25 + Σ(...)*37,5`) e
   também por **entradas diretas de extensão em metros** (campos B8:C11 das geradoras).
5. **Serviços** (mão de obra, projeto elétrico, transporte, travessia de rodovia/rio) são
   entradas separadas — não são materiais físicos.
6. **Módulos adicionais** (compacta, BT, iluminação, transformadores, religadores,
   reguladores, subestação, medições) seguem o mesmo princípio linear e somam na lista
   mestre.
7. **EXTRAS / EXTRAS (2):** permitem **adicionar (+) ou subtrair (−)** qualquer material
   manualmente ao final — ajuste fino do orçamento.
8. **Reguladores** entram direto na consolidação (`REGULADORES!B6/C6/D6` e coluna N).

---

## 7. Estratégia de extração proposta (Fase 2)

**Método principal — leitura direta das colunas-coeficiente (offline, sem Excel):**
1. Ler a lista mestre (códigos, descrições, unidades) da aba "Materiais e Valores".
2. Em cada aba geradora, percorrer as linhas de material (141–431…) e **parsear a fórmula
   uniforme de cada coluna-estrutura** (ex.: `=SUM(CV5:CV26,CW5:CW26)*CU148`) para
   descobrir, para cada estrutura: o intervalo de entrada e a **coluna-coeficiente**.
3. Ler a coluna-coeficiente para todas as linhas de material → **BOM unitário exato** de
   cada estrutura (rastreável célula→material).
4. Mapear cada estrutura ao seu rótulo (linhas 3–4 de cabeçalho) e às dimensões
   (tensão/fase/condutor/poste).
5. Gerar o JSON (materiais + estruturas + coeficientes) com origem (aba/célula) registrada.

**Validação cruzada (Fase 4):** comparar a saída do app com a planilha. *Observação:* a
automação do Excel via COM mostrou-se instável neste arquivo (diálogos ocultos no
`Open`, mesmo com alertas desativados) e os **links externos estão quebrados** — por isso
a extração não dependerá de rodar o Excel. A validação poderá ser feita com casos de teste
preenchidos manualmente, se você puder fornecê-los.

---

## 8. Riscos e pontos de atenção

- **Links externos quebrados:** o arquivo referencia `D:\Fórmulas\rodebras.xlsm` e
  `M:\…\Orçamento de Redes 13.8Kv, 34.5Kv, Compacta e BT.xlsm`. Os valores ficam em cache;
  é preciso confirmar que nenhuma célula-coeficiente dependa desses arquivos.
- **Dois códigos por material** (Líder 7 e Cód. SAP), nem sempre presentes — definir qual
  é o canônico para exibir/exportar.
- **Descrições com erros de digitação** (ex.: "DISTRIBUIÇÃOTRIB") — serão preservadas
  literalmente, como manda o briefing.
- **Inconsistência de nomes** no VBA (ex.: `"Mono 34.5kv"` com ponto, que nem existe) —
  resíduo inofensivo, mas indica edição manual histórica.
- **Abas de rascunho** (Plan1, Plan2, MEDIDÇÕES TRIFÁSICAS oculta) — ignorar.
- **Preços** (`V.VENDA`) existem em algumas abas, mas o briefing pede BOM (quantidades);
  preços ficam fora de escopo salvo orientação contrária.

---

## 9. Diferença entre o briefing e a planilha real (escopo)

O briefing modela "fase × tensão → N1/N2/N3/N4". A planilha real é um **orçador completo
de redes de distribuição**: além das 4 geradoras MT, há compacta, BT, iluminação,
transformadores, religadores, reguladores, subestação, medições e extras. Reproduzir
**tudo** é viável (mesmo modelo linear), mas multiplica o esforço. Por isso as decisões
da seção 10.

---

## 10. Decisões/dúvidas a confirmar antes de codar

1. **Abrangência da 1ª versão:** apenas as 4 geradoras MT (Mono/Tri × 13,8/34,5 kV, o
   "coração" do briefing) ou já incluir os módulos extras?
2. **Como apresentar "a estrutura" na interface** (a planilha usa estrutura × condutor ×
   poste): espelhar fielmente os três níveis, ou simplificar?
3. **Código canônico do material:** Cód. SAP (col. B) como principal, com Líder 7 (col. A)
   como secundário?
4. **Validação (Fase 4):** você consegue fornecer 1–2 orçamentos já preenchidos no Excel
   (entradas + relação resultante) para conferência item a item?

> **Status:** Fase 1 concluída. Aguardando suas respostas (seção 10) para iniciar a
> Fase 2 (extração da base JSON) e a Fase 3 (aplicação web).
