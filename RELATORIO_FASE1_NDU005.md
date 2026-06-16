# Relatório de Compreensão — NDU 005 (Fase 1)
## Norma: NDU 005 — Instalações Básicas para Construção de Redes de Distribuição de MT Rural — **Versão 6.0 (julho/2026)**, Energisa
Arquivo: `Docs/NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf` — **381 páginas, texto integralmente extraível** (não é digitalização/imagem).

> Documento da **Fase 1** exigido antes de gerar a base. Descreve a organização da norma, o catálogo de estruturas, o formato das listas de materiais e as ambiguidades/decisões pendentes.

---

## 1. Resumo executivo

1. As **estruturas de MT rural** estão catalogadas na **§7** e detalhadas (com lista de materiais) nos **desenhos da §23** (p.129–370). A **§22** contém apenas tabelas de referência (afastamentos, tração/flecha, postes) — **não** tem BOM. O **§24 (Anexo)** contém as tabelas-mestre (A–Q) que **resolvem os códigos paramétricos**.
2. **Descoberta-chave de integração:** o **"Código SISUP"** da NDU 005 é **o mesmo "Cód. SAP"** já usado no sistema (ex.: `90389 Arruela quadrada` existe nos dois). Ou seja, o catálogo de materiais é **compartilhado** — as estruturas rurais referenciam os mesmos códigos, e só os códigos novos precisam ser acrescentados à coleção `materiais`.
3. A lista de materiais de cada estrutura é **paramétrica**, exatamente como o sistema atual: depende de **condutor** (2/1·0/4·0 AWG, 336,4 MCM), **poste** (comprimento × resistência), **classe de tensão** e **cruzeta**. Os parâmetros são resolvidos por sub-tabelas (na página da estrutura) e pelas tabelas A–Q do Anexo.
4. A norma fornece **a "configuração básica"** de cada estrutura (nota explícita na p.161: *"a lista apresenta apenas a configuração básica, não contemplando várias ferragens… que devem ser acrescidas conforme projeto"*).

---

## 2. Organização do documento

| Seção | Páginas | Conteúdo |
|---|---|---|
| 1–6 | 7–24 | Aplicação, vigência, responsabilidades, referências, critérios gerais, **tensões de fornecimento** |
| **7. TIPOS DE ESTRUTURAS** | **25–30** | **Catálogo das estruturas** (MT e BT) — designações e aplicação |
| 8 | 30–36 | Instalação de equipamentos (trafo, capacitor, para-raios, chave fusível, seccionadora, regulador, religador) |
| 9–21 | 37–54 | Condutores, vãos, aterramento, estaiamento, afastamentos, postes, engastamento, derivação, amarrações, ancoragem… |
| **22. TABELAS** | **55–120** | Tabelas de referência (afastamentos 01–05; tração/flecha 06–53; postes 54–57). **Sem BOM.** |
| **23. DESENHOS** | **121–370** | Índice de desenhos (121–128) + **desenhos das estruturas com a "LISTA DE MATERIAL" embutida** |
| **24. ANEXO DAS TABELAS** | **371–381** | **Tabelas-mestre A–Q** que resolvem os códigos paramétricos |

---

## 3. Catálogo de estruturas de MT (§7 + §23)

**Estruturas convencionais** (cabo de alumínio nu CAA ou CAL 6201):

| Família | Estruturas | Aplicação |
|---|---|---|
| **Monofásica (U)** | U1, U1-Alt, U2, U3, U3-2, U3-U3, U4 | U1 tangência/ângulo; U2 ângulo; U3 derivação/fim de rede; U4 ângulo/mudança de seção |
| **Normal trifásica (N)** | N1, N2, N3, N4 (+ **N3-N3**) | N1 tangência; N2 ângulo; N3 derivação/fim; N4 ângulo/mudança de bitola |
| **Triangular trifásica (T)** | T1, T2, T3, T4 (+ **T3-T3**) | equivalentes às N, com isolador central no topo (regiões de descarga atmosférica, 36,2 kV) |
| **Especiais (H)** | TE, HTE, HTTE | ancoragem/ângulos especiais |
| **Neutro contínuo (S)** | S0, S0T, S1 | S0 ancorado (assoc. U4/N4/T4/TE/HTE/HTTE); S0T derivação/fim (assoc. U3/N3/T3); S1 passante (assoc. U1/U2/N1/N2/T1/T2) |

**Variações de cruzeta (N e T):** cada estrutura N1–N4 e T1–T4 possui **4 variações** com listas distintas: **Cruzeta T 1,90 m**, **Cruzeta 2,00 m**, **Cruzeta T 2,40 m**, **Cruzeta 2,40 m** (desenhos NDU005.04xx e 06xx).

Há ainda listas para estruturas com **equipamentos** (instalação de para-raios, chave fusível, chave faca, **transformadores** mono/trifásicos: N1-N-PR, N3-M-PR etc.) — §23 p.276–330.

**Mapa estrutura → página da lista** (já levantado): U1(160), U1-Alt(163), U2(166), U3(169), U3-2(172), U3-U3(174), U4(177); N1–N4 ×4 cruzetas (185–213), N3-N3(215); T1–T4 ×4 cruzetas (221–252), T3-T3(254); TE(259), HTE(262), HTTE(265); S0(270), S0T(272), S1(274); + equipamentos/trafos (276–330).

---

## 4. Formato da lista de materiais (paramétrico) — exemplo U1 (p.160)

**Tabela principal:** `Código SISUP | Código Desenho | Quantidade | Descrição | ETU`
```
90389        A-2   02  Arruela Quadrada 18,0x38,0x3 mm        130.1
Tabela A     I-5   01  Isolador Tipo Pilar Porcelana Vertical 126.1   <- depende da TENSÃO
Tabela 01    F-32  02  Parafuso de Rosca Total M16 x Tamanho  130.1   <- depende do POSTE
90252        F-36  01  Pino Isolador Aço Carbono Autotravante 130.1
Tabela B     P-2   01  Poste de Concreto de Distribuição      114.1   <- depende do POSTE
Tabela 02    M-14  01  Laço pré-formado                       116.2   <- depende do CONDUTOR
90524        F-51  01  Suporte P/Isolador Pilar               130.1
```
Onde o `Código SISUP` é um **código fixo** (ex.: 90389) **ou** uma referência a uma tabela paramétrica:
- **Sub-tabelas na própria estrutura:** *Tabela 01* (parafuso por comprimento×resistência do poste), *Tabela 02* (laço por condutor), *Tabela 03* (cinta por poste circular).
- **Tabelas-mestre do Anexo (§24):** **A** Isolador pilar (por tensão: 90253/90254/90580 = 15/24,2/36,2 kV), **B** Poste (por comprimento/resistência), **C** Laço (por condutor: 90740–90746), **D** Alças (90707/08/11), **E** Isolador suspensão bastão (por tensão), **F** Conector cunha, **G** Cruzeta de concreto, **H** Pino cruzeta, **I** Parafuso rosca total, **J** Pino pilar, **L** Chave seccionadora, **M** Chave fusível, **N** Elo fusível, **O** Transformador, **P** Para-raios, **Q** Suporte de transformador.

➡️ Para materializar uma estrutura concreta é preciso fixar **(classe de tensão, condutor, poste, cruzeta)** e resolver as tabelas. **É o mesmo modelo do sistema atual** (estrutura × condutor × poste), acrescido de **tensão** e **cruzeta**.

---

## 5. Classes de tensão e configurações de fase

- **Classes de tensão na NDU 005:** **15 kV** (rede 13,8 kV), **24,2 kV** e **36,2 kV** (rede 34,5 kV). ⚠️ A classe **24,2 kV** **não existe** no sistema atual (que tem 13,8 e 34,5 kV).
- **Configurações de fase:** **monofásica (U)** e **trifásica (N/T/especiais)**. Há **neutro contínuo** (S0/S0T/S1) como estruturas próprias associadas.
- ⚠️ **MRT (monofásico com retorno por terra) NÃO foi encontrado** nesta norma. A NDU 005 v6.0 trata de **rede convencional rural** com monofásicas **U1–U4 (com neutro)**. Se MRT for necessário, provavelmente está em outra norma — **reportado, não assumido**.

---

## 6. Regras condicionais e notas relevantes

- "A lista de materiais apresenta apenas a **configuração básica**…" (p.161) — itens adicionais entram conforme projeto.
- **Cruzeta:** cada variação (1,90 T / 2,00 / 2,40 T / 2,40 m) tem **lista própria** na norma (não é um simples "adicional").
- **Poste:** parafusos/cintas mudam conforme comprimento (11/12 m) × resistência (300/600/1000 daN) e seção (DT vs circular — Tabela 03).
- **Tensão:** isolador (Tabela A/E) e outros itens mudam por 15/24,2/36,2 kV.
- **Neutro contínuo** e **para-raios/chave/trafo** são estruturas/itens adicionais somados à estrutura-base, conforme aplicação.

---

## 7. Mapeamento para o schema existente

O schema atual (`materiais` + `estruturas`, com `base_bom` + `postes[].delta`) **já é paramétrico** e acomoda bem a NDU 005. Extensões propostas (conforme seu briefing):
- `norma_origem: "NDU 005"`, `classe_tensao_kv`, `tipo_fase`, `aplicacao`, `estrutura_base`, `pagina_origem`, `observacoes`.
- `condicional`/`condicao` nos materiais.
- **Cruzeta:** representar cada variação como item próprio (lista completa) **ou** como `variacoes_cruzeta` (delta) — ver decisão abaixo.
- Materiais referenciados por **código SISUP/SAP**; novos códigos entram em `materiais` (a maioria já existe).

---

## 8. Ambiguidades / pendências (reportadas, não assumidas)

1. **Classe 24,2 kV** não existe no sistema atual — precisa de decisão (criar categoria, ignorar, ou mapear).
2. **MRT** não consta na NDU 005 v6.0 — confirmar que está fora de escopo.
3. **Extração das tabelas** do PDF: o texto vem em colunas "achatadas" (linhas intercaladas) — a montagem das tabelas exige parsing cuidadoso + validação amostral (risco de desalinhamento código↔quantidade).
4. **Duplicidade com o sistema atual:** N1–N4/U1–U4 já existem (origem planilha). As versões NDU 005 entrarão **separadas** (`norma_origem`), o que pode gerar itens "parecidos" — definir como diferenciá-los na Home.
5. **"Configuração básica"**: a norma é mínima; o sistema atual (planilha) costuma trazer listas mais completas. São fontes diferentes; manter rastreabilidade.
6. Pequenas inconsistências de digitação na norma (ex.: "Isolar" por "Isolador", numeração 7.14/7.15) — preservadas/observadas.

---

## 9. Decisões a confirmar antes da Fase 2 (extração)
Ver perguntas no chat. Em resumo: (a) abrangência da extração; (b) como tratar a classe 24,2 kV; (c) como modelar as variações de cruzeta; (d) como diferenciar, na Home, as estruturas rurais (NDU 005) das já existentes.

> **Status:** Fase 1 concluída. Aguardando confirmações para iniciar a Fase 2 (extração da base) — sem alterar as estruturas urbanas já existentes.
