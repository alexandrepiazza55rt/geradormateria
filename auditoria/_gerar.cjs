// Script de geração de auditoria de materiais.
// Lê a planilha do dono + materiais.json atual, aplica match SEGURO
// (cod_sap atual == DE antigo, ignorando duplicatas), gera:
//   - auditoria/materiais.novo.json (JSON novo — NÃO sobrescreve o oficial)
//   - auditoria/relatorio-2026-06-13.md (relatório markdown completo)

const fs = require("fs");
const path = require("path");
const xlsx = require("../app/node_modules/xlsx");

const XLSX_PATH =
  "C:/Users/Lucas Matheus/.claude/uploads/ff0df642-11ed-4664-8df3-373b1b10ca74/cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx";
const JSON_ATUAL = path.join(__dirname, "..", "app", "public", "data", "materiais.json");
const SAIDA_JSON = path.join(__dirname, "materiais.novo.json");
const SAIDA_MD = path.join(__dirname, "relatorio-2026-06-13.md");

// ── 1. Carrega planilha (aba MATERIAL) ──────────────────────────
const wb = xlsx.readFile(XLSX_PATH);
const rows = xlsx.utils.sheet_to_json(wb.Sheets["MATERIAL"], { header: 1, defval: "" }).slice(1);
const planilha = rows
  .filter((r) => r[0] !== "" || r[1] !== "")
  .map((r) => ({
    cod_novo: String(r[0] ?? "").trim(),
    cod_antigo: String(r[1] ?? "").trim(),
    descricao: String(r[2] ?? "").trim(),
    unidade: String(r[3] ?? "").trim(),
  }));

// Indexa por antigo e por novo
const por_antigo = new Map();
const por_novo = new Map();
for (const p of planilha) {
  if (p.cod_antigo) {
    if (!por_antigo.has(p.cod_antigo)) por_antigo.set(p.cod_antigo, []);
    por_antigo.get(p.cod_antigo).push(p);
  }
  if (p.cod_novo) {
    if (!por_novo.has(p.cod_novo)) por_novo.set(p.cod_novo, []);
    por_novo.get(p.cod_novo).push(p);
  }
}

// Códigos antigos ambíguos (multiplos cod_novo realmente diferentes)
const antigos_ambiguos = new Set();
for (const [k, arr] of por_antigo) {
  const novos_distintos = new Set(arr.map((p) => p.cod_novo));
  if (novos_distintos.size > 1) antigos_ambiguos.add(k);
}

// ── 2. Carrega JSON atual ──────────────────────────────────────
const json = JSON.parse(fs.readFileSync(JSON_ATUAL, "utf8"));

// ── 3. Aplica match e gera JSON novo + tabelas para o relatório ─
const TABS = {
  atualizado: [],       // cod_sap antigo → novo
  ja_atualizado: [],    // cod_sap já é o novo (nada a fazer)
  sem_match: [],        // cod_sap não bate em nada da planilha
  sem_cod_sap: [],      // material sem cod_sap (nada para casar)
  ambiguo: [],          // cod_sap antigo bate em múltiplos novos — NÃO mexer
  inalterado_mesmo_codigo: [], // DE === COD (não há mudança real)
};

const json_novo = json.map((m) => {
  const cod = (m.cod_sap ?? "").toString().trim();
  if (!cod) {
    TABS.sem_cod_sap.push(m);
    return { ...m };
  }
  if (antigos_ambiguos.has(cod)) {
    // Não toca — registra para decisão manual
    const opcoes = por_antigo.get(cod).map((p) => `${p.cod_novo} (${p.descricao})`);
    TABS.ambiguo.push({ ...m, opcoes });
    return { ...m };
  }
  if (por_antigo.has(cod)) {
    const p = por_antigo.get(cod)[0];
    if (p.cod_novo === cod) {
      // Linha "DE === COD": planilha diz que não muda
      TABS.inalterado_mesmo_codigo.push({ ...m, plan_descricao: p.descricao });
      return { ...m };
    }
    // Atualiza cod_sap
    TABS.atualizado.push({
      ...m,
      cod_sap_antes: cod,
      cod_sap_depois: p.cod_novo,
      plan_descricao: p.descricao,
    });
    return { ...m, cod_sap: p.cod_novo };
  }
  if (por_novo.has(cod)) {
    const p = por_novo.get(cod)[0];
    TABS.ja_atualizado.push({ ...m, plan_descricao: p.descricao });
    return { ...m };
  }
  TABS.sem_match.push(m);
  return { ...m };
});

// ── 4. Grava JSON novo ─────────────────────────────────────────
fs.writeFileSync(SAIDA_JSON, JSON.stringify(json_novo, null, 2), "utf8");

// ── 5. Linhas da planilha sem correspondência no JSON ──────────
const cods_no_json = new Set(
  json.map((m) => (m.cod_sap ?? "").toString().trim()).filter(Boolean),
);
const planilha_sem_uso = [];
for (const p of planilha) {
  if (!p.cod_antigo) continue;
  if (cods_no_json.has(p.cod_antigo)) continue;
  if (cods_no_json.has(p.cod_novo)) continue;
  planilha_sem_uso.push(p);
}

// ── 6. Helpers de render ──────────────────────────────────────
function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}
function tabela(headers, rows) {
  const sep = headers.map(() => "---").join(" | ");
  const lines = [`| ${headers.join(" | ")} |`, `| ${sep} |`];
  for (const r of rows) lines.push(`| ${r.map(esc).join(" | ")} |`);
  return lines.join("\n");
}

// ── 7. Monta o relatório markdown ─────────────────────────────
const data_iso = new Date().toISOString().slice(0, 10);
const md = [];
md.push(`# Auditoria — Atualização de códigos de materiais`);
md.push(``);
md.push(`**Data:** ${data_iso}`);
md.push(`**Planilha de origem:** \`cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx\` (aba **MATERIAL**, 340 linhas válidas)`);
md.push(`**JSON atual:** \`app/public/data/materiais.json\` (${json.length} materiais)`);
md.push(`**JSON novo gerado:** \`auditoria/materiais.novo.json\` (mesmo arquivo, com cod_sap atualizado nos matches seguros)`);
md.push(``);
md.push(`> ⚠ O \`materiais.json\` oficial **NÃO foi tocado**. Para aplicar, basta substituir o arquivo pelo \`materiais.novo.json\` após sua revisão.`);
md.push(``);
md.push(`## Resumo`);
md.push(``);
md.push(tabela(
  ["Categoria", "Quantidade", "O que aconteceu"],
  [
    ["✅ Atualizado (cod_sap trocado)", String(TABS.atualizado.length), "Match exato pelo código antigo. cod_sap substituído pelo novo."],
    ["⚪ Já atualizado", String(TABS.ja_atualizado.length), "cod_sap já é o código novo. Nada a fazer."],
    ["⚪ Inalterado (DE === COD)", String(TABS.inalterado_mesmo_codigo.length), "Planilha diz que esse código não muda."],
    ["⚠ Ambíguo (não mexido)", String(TABS.ambiguo.length), "Mesmo código antigo aponta para múltiplos novos. Precisa decisão manual."],
    ["❓ Sem match", String(TABS.sem_match.length), "cod_sap atual não aparece em nenhuma coluna da planilha. Nada inventado."],
    ["⬜ Sem cod_sap", String(TABS.sem_cod_sap.length), "Material sem código SAP — não dá pra casar via código."],
  ],
));
md.push(``);
md.push(`**Total auditado:** ${json.length} materiais.`);
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.1 Atualizados ────────────────────────────────────────────
md.push(`## ✅ Atualizados (${TABS.atualizado.length})`);
md.push(``);
md.push(`cod_sap **antes** → **depois**. Descrição da PLANILHA mostrada para você conferir se bate com o material do sistema.`);
md.push(``);
md.push(tabela(
  ["id", "Descrição (sistema)", "Unid.", "cod_sap antes", "cod_sap depois", "Descrição (planilha)"],
  TABS.atualizado.map((m) => [
    m.id, m.descricao, m.unidade, m.cod_sap_antes, m.cod_sap_depois, m.plan_descricao,
  ]),
));
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.2 Ambíguos ───────────────────────────────────────────────
md.push(`## ⚠ Ambíguos — precisam de decisão manual (${TABS.ambiguo.length})`);
md.push(``);
md.push(`O código antigo do sistema aparece em **mais de uma linha** da planilha apontando para códigos novos diferentes. Não fiz nada nesses — você decide.`);
md.push(``);
for (const m of TABS.ambiguo) {
  md.push(`### \`#${m.id}\` — ${esc(m.descricao)} (${esc(m.unidade)})`);
  md.push(`- **cod_sap atual:** \`${esc(m.cod_sap)}\``);
  md.push(`- **Opções na planilha:**`);
  for (const o of m.opcoes) md.push(`  - ${esc(o)}`);
  md.push(``);
}
md.push(`---`);
md.push(``);

// ── 7.3 Já atualizados ─────────────────────────────────────────
md.push(`## ⚪ Já atualizados — nada a fazer (${TABS.ja_atualizado.length})`);
md.push(``);
md.push(`O cod_sap atual já é o **código novo** da planilha. Confiram só por amostragem se a descrição bate.`);
md.push(``);
md.push(tabela(
  ["id", "Descrição (sistema)", "Unid.", "cod_sap", "Descrição (planilha)"],
  TABS.ja_atualizado.map((m) => [m.id, m.descricao, m.unidade, m.cod_sap, m.plan_descricao]),
));
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.4 Inalterados (DE === COD) ──────────────────────────────
md.push(`## ⚪ Inalterados — código é o mesmo antes e depois (${TABS.inalterado_mesmo_codigo.length})`);
md.push(``);
md.push(`A planilha lista esses códigos mas no campo \`DE (CÓDIGO ANTIGO)\` está o mesmo valor do \`COD\` (novo). Não há troca a fazer.`);
md.push(``);
md.push(tabela(
  ["id", "Descrição (sistema)", "Unid.", "cod_sap", "Descrição (planilha)"],
  TABS.inalterado_mesmo_codigo.map((m) => [m.id, m.descricao, m.unidade, m.cod_sap, m.plan_descricao]),
));
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.5 Sem match ──────────────────────────────────────────────
md.push(`## ❓ Sem match — cod_sap não aparece na planilha (${TABS.sem_match.length})`);
md.push(``);
md.push(`Esses materiais têm cod_sap cadastrado mas o código **não aparece nem como antigo nem como novo** na planilha. Pode ser:`);
md.push(``);
md.push(`- código de outro sistema/fornecedor;`);
md.push(`- código errado;`);
md.push(`- material foi removido do catálogo SAP.`);
md.push(``);
md.push(`**Não inventei nada** — listado para você revisar.`);
md.push(``);
md.push(tabela(
  ["id", "Descrição", "Unid.", "cod_sap atual", "cod_lider7"],
  TABS.sem_match.map((m) => [m.id, m.descricao, m.unidade, m.cod_sap, m.cod_lider7 || ""]),
));
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.6 Sem cod_sap ────────────────────────────────────────────
md.push(`## ⬜ Sem cod_sap — não foi possível casar via código (${TABS.sem_cod_sap.length})`);
md.push(``);
md.push(`Esses materiais não têm cod_sap cadastrado no sistema. Para esses só haveria como casar **por descrição** (fuzzy) — não fiz porque é arriscado. Se quiser, posso tentar match por descrição em uma segunda passada.`);
md.push(``);
md.push(tabela(
  ["id", "Descrição", "Unid.", "cod_lider7"],
  TABS.sem_cod_sap.map((m) => [m.id, m.descricao, m.unidade, m.cod_lider7 || ""]),
));
md.push(``);
md.push(`---`);
md.push(``);

// ── 7.7 Linhas da planilha sem uso ─────────────────────────────
md.push(`## 📋 Linhas da planilha sem correspondência no sistema (${planilha_sem_uso.length})`);
md.push(``);
md.push(`Materiais que existem na planilha mas o sistema **não usa nenhuma das versões** (nem antigo nem novo). Só para referência — provavelmente é a maior parte do catálogo SAP que o gerador não consome.`);
md.push(``);
md.push(`<details><summary>Expandir lista (${planilha_sem_uso.length} itens)</summary>`);
md.push(``);
md.push(tabela(
  ["cod antigo", "cod novo", "Descrição (planilha)", "Unid."],
  planilha_sem_uso.map((p) => [p.cod_antigo, p.cod_novo, p.descricao, p.unidade]),
));
md.push(``);
md.push(`</details>`);
md.push(``);

fs.writeFileSync(SAIDA_MD, md.join("\n"), "utf8");

console.log("=== AUDITORIA GERADA ===");
console.log("JSON novo:", SAIDA_JSON);
console.log("Relatório:", SAIDA_MD);
console.log("\nResumo:");
console.log("- Atualizado:                ", TABS.atualizado.length);
console.log("- Já atualizado:             ", TABS.ja_atualizado.length);
console.log("- Inalterado (DE === COD):   ", TABS.inalterado_mesmo_codigo.length);
console.log("- Ambíguo (NÃO mexido):      ", TABS.ambiguo.length);
console.log("- Sem match:                 ", TABS.sem_match.length);
console.log("- Sem cod_sap:               ", TABS.sem_cod_sap.length);
console.log("- Total:                     ", json.length);
console.log("\nLinhas da planilha sem uso no sistema:", planilha_sem_uso.length);
