// Aplica todos os aceites (15 código exato + 110 descrição alta+média) ao
// materiais.novo.json. NÃO TOCA no materiais.json oficial.

const fs = require("fs");
const path = require("path");
const xlsx = require("../app/node_modules/xlsx");

const XLSX_PATH =
  "C:/Users/Lucas Matheus/.claude/uploads/ff0df642-11ed-4664-8df3-373b1b10ca74/cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx";
const JSON_ATUAL = path.join(__dirname, "..", "app", "public", "data", "materiais.json");
const SAIDA_JSON = path.join(__dirname, "materiais.novo.json");
const SAIDA_MD = path.join(__dirname, "mudancas-aplicadas-2026-06-13.md");

// ── 1. Algoritmo de match por descrição (mesmo do _gerar_fuzzy.cjs) ─
const STOP = new Set([
  "de", "do", "da", "dos", "das", "para", "em", "no", "na", "o", "a", "os",
  "as", "e", "ou", "com", "sem", "p", "tipo", "ate", "pol", "polegadas",
]);

function normalizar(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[()/,.\-_;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function tokens(s) {
  return normalizar(s).split(" ").filter((t) => t.length > 0)
    .filter((t) => /\d/.test(t) || !STOP.has(t));
}
function numeros(s) {
  const matches = normalizar(s).match(/\d+(?:[.,]\d+)?/g) ?? [];
  return new Set(matches.map((n) => n.replace(",", ".")));
}
function dice(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  return (2 * inter) / (setA.size + setB.size);
}
function score(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  const na = numeros(a);
  const nb = numeros(b);
  const score_tokens = dice(ta, tb);
  let score_numeros = 1.0;
  if (na.size > 0 || nb.size > 0) score_numeros = dice(na, nb);
  return 0.6 * score_tokens + 0.4 * score_numeros;
}

// ── 2. Carrega tudo ─────────────────────────────────────────────
const wb = xlsx.readFile(XLSX_PATH);
const planilha_material = xlsx.utils.sheet_to_json(wb.Sheets["MATERIAL"], { header: 1, defval: "" })
  .slice(1)
  .filter((r) => r[0] !== "" || r[1] !== "")
  .map((r) => ({
    fonte: "MATERIAL",
    cod_novo: String(r[0] ?? "").trim(),
    cod_antigo: String(r[1] ?? "").trim(),
    descricao: String(r[2] ?? "").trim(),
    unidade: String(r[3] ?? "").trim(),
  }));

const planilha_banco = xlsx.utils.sheet_to_json(wb.Sheets["Banco_Dados"], { header: 1, defval: "" })
  .slice(1)
  .filter((r) => r[0] !== "" && r[1] !== "")
  .map((r) => ({
    fonte: "Banco_Dados",
    cod_novo: String(r[0] ?? "").trim(),
    cod_antigo: "",
    descricao: String(r[1] ?? "").trim(),
    unidade: String(r[2] ?? "").trim(),
  }));

const candidatos_fuzzy = [...planilha_material, ...planilha_banco];

// Indexa MATERIAL por antigo (match exato — passo 1)
const por_antigo = new Map();
const por_novo = new Map();
for (const p of planilha_material) {
  if (p.cod_antigo) {
    if (!por_antigo.has(p.cod_antigo)) por_antigo.set(p.cod_antigo, []);
    por_antigo.get(p.cod_antigo).push(p);
  }
  if (p.cod_novo) {
    if (!por_novo.has(p.cod_novo)) por_novo.set(p.cod_novo, []);
    por_novo.get(p.cod_novo).push(p);
  }
}
const antigos_ambiguos = new Set();
for (const [k, arr] of por_antigo) {
  const novos_distintos = new Set(arr.map((p) => p.cod_novo));
  if (novos_distintos.size > 1) antigos_ambiguos.add(k);
}

const json = JSON.parse(fs.readFileSync(JSON_ATUAL, "utf8"));

// ── 3. Aplica match exato (idêntico ao _gerar.cjs) ──────────────
function classificar_exato(m) {
  const cod = (m.cod_sap ?? "").toString().trim();
  if (!cod) return { tipo: "sem_cod_sap" };
  if (antigos_ambiguos.has(cod)) {
    const opcoes = por_antigo.get(cod).map((p) => ({ cod_novo: p.cod_novo, descricao: p.descricao }));
    return { tipo: "ambiguo", opcoes };
  }
  if (por_antigo.has(cod)) {
    const p = por_antigo.get(cod)[0];
    if (p.cod_novo === cod) return { tipo: "inalterado_mesmo_codigo", plan_descricao: p.descricao };
    return { tipo: "atualizado_exato", cod_sap_antes: cod, cod_sap_depois: p.cod_novo, plan_descricao: p.descricao };
  }
  if (por_novo.has(cod)) {
    return { tipo: "ja_atualizado", plan_descricao: por_novo.get(cod)[0].descricao };
  }
  return { tipo: "sem_match" };
}

// ── 4. Para sem_match e sem_cod_sap: top candidato fuzzy ────────
function top_candidato(m) {
  let melhor = null;
  for (const c of candidatos_fuzzy) {
    const s = score(m.descricao, c.descricao);
    if (s >= 0.4 && (!melhor || s > melhor.score)) melhor = { ...c, score: s };
  }
  return melhor;
}

function confianca(s) {
  if (s >= 0.75) return "alta";
  if (s >= 0.55) return "media";
  if (s >= 0.4) return "baixa";
  return "muito_baixa";
}

// ── 5. Monta JSON novo + listas para o relatório ────────────────
const mudancas = [];   // {id, descricao, unidade, cod_antes, cod_depois, origem, fonte, score, plan_descricao}
const nao_mexidos = []; // {id, descricao, motivo}

const json_novo = json.map((m) => {
  const cls = classificar_exato(m);
  if (cls.tipo === "atualizado_exato") {
    mudancas.push({
      id: m.id,
      descricao: m.descricao,
      unidade: m.unidade,
      cod_antes: cls.cod_sap_antes,
      cod_depois: cls.cod_sap_depois,
      origem: "codigo_exato",
      fonte: "MATERIAL",
      score: null,
      plan_descricao: cls.plan_descricao,
    });
    return { ...m, cod_sap: cls.cod_sap_depois };
  }
  if (cls.tipo === "ja_atualizado" || cls.tipo === "inalterado_mesmo_codigo") {
    return { ...m };
  }
  if (cls.tipo === "ambiguo") {
    nao_mexidos.push({ id: m.id, descricao: m.descricao, motivo: `ambíguo: ${cls.opcoes.map((o) => o.cod_novo).join(", ")}` });
    return { ...m };
  }
  // sem_match ou sem_cod_sap → tenta fuzzy
  const cand = top_candidato(m);
  if (!cand) {
    nao_mexidos.push({ id: m.id, descricao: m.descricao, motivo: `sem candidato fuzzy (cls.tipo=${cls.tipo})` });
    return { ...m };
  }
  const conf = confianca(cand.score);
  if (conf === "alta" || conf === "media") {
    const cod_antes = (m.cod_sap ?? "").trim() || "_(vazio)_";
    mudancas.push({
      id: m.id,
      descricao: m.descricao,
      unidade: m.unidade,
      cod_antes,
      cod_depois: cand.cod_novo,
      origem: `descricao_${conf}`,
      fonte: cand.fonte,
      score: cand.score,
      plan_descricao: cand.descricao,
    });
    return { ...m, cod_sap: cand.cod_novo };
  }
  // Baixa ou muito baixa: não mexe (decisão do dono: só altos e médios)
  nao_mexidos.push({
    id: m.id,
    descricao: m.descricao,
    motivo: `fuzzy baixo (score=${cand.score.toFixed(2)}, cls.tipo=${cls.tipo})`,
  });
  return { ...m };
});

// ── 6. Grava JSON novo ──────────────────────────────────────────
fs.writeFileSync(SAIDA_JSON, JSON.stringify(json_novo, null, 2), "utf8");

// ── 7. Relatório markdown ───────────────────────────────────────
function esc(s) { return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " "); }

const por_origem = { codigo_exato: [], descricao_alta: [], descricao_media: [] };
for (const m of mudancas) {
  if (m.origem === "codigo_exato") por_origem.codigo_exato.push(m);
  else if (m.origem === "descricao_alta") por_origem.descricao_alta.push(m);
  else if (m.origem === "descricao_media") por_origem.descricao_media.push(m);
}

const md = [];
md.push(`# Auditoria final — Mudanças aplicadas ao materiais.novo.json`);
md.push(``);
md.push(`**Data:** 2026-06-13`);
md.push(`**Decisão do dono:** aceitar todos os matches altos e médios por descrição, além dos matches exatos por código.`);
md.push(`**Arquivo gerado:** \`auditoria/materiais.novo.json\` (NÃO substituiu o oficial).`);
md.push(`**Para aplicar de verdade:** substituir \`app/public/data/materiais.json\` por este arquivo após sua revisão final.`);
md.push(``);
md.push(`## Resumo`);
md.push(``);
md.push(`| Origem | Quantidade |`);
md.push(`| --- | ---: |`);
md.push(`| 🔵 Código exato (DE → COD) | ${por_origem.codigo_exato.length} |`);
md.push(`| 🟢 Descrição — alta confiança (≥ 0,75) | ${por_origem.descricao_alta.length} |`);
md.push(`| 🟡 Descrição — média confiança (0,55–0,75) | ${por_origem.descricao_media.length} |`);
md.push(`| **Total alterado** | **${mudancas.length}** |`);
md.push(`| Não mexidos (baixa/sem candidato/ambíguo) | ${nao_mexidos.length} |`);
md.push(``);

function tabela_mudancas(arr, com_score) {
  const headers = com_score
    ? ["id", "descrição sistema", "unid", "cod antes", "cod depois", "score", "fonte", "descrição planilha"]
    : ["id", "descrição sistema", "unid", "cod antes", "cod depois", "descrição planilha"];
  const sep = headers.map(() => "---").join(" | ");
  const lines = [`| ${headers.join(" | ")} |`, `| ${sep} |`];
  for (const m of arr) {
    const row = com_score
      ? [m.id, m.descricao, m.unidade, m.cod_antes, m.cod_depois, m.score?.toFixed(2) ?? "—", m.fonte, m.plan_descricao]
      : [m.id, m.descricao, m.unidade, m.cod_antes, m.cod_depois, m.plan_descricao];
    lines.push(`| ${row.map(esc).join(" | ")} |`);
  }
  return lines.join("\n");
}

md.push(`---`);
md.push(``);
md.push(`## 🔵 Código exato (${por_origem.codigo_exato.length})`);
md.push(``);
md.push(`Match exato pelo \`DE (CÓDIGO ANTIGO)\` da aba MATERIAL.`);
md.push(``);
md.push(tabela_mudancas(por_origem.codigo_exato, false));
md.push(``);
md.push(`---`);
md.push(``);
md.push(`## 🟢 Descrição — alta confiança (${por_origem.descricao_alta.length})`);
md.push(``);
md.push(`Score ≥ 0,75. Quase certeza de match correto.`);
md.push(``);
md.push(tabela_mudancas(por_origem.descricao_alta, true));
md.push(``);
md.push(`---`);
md.push(``);
md.push(`## 🟡 Descrição — média confiança (${por_origem.descricao_media.length})`);
md.push(``);
md.push(`Score 0,55–0,75. Provável match; reveja os de score mais baixo para confirmar.`);
md.push(``);
md.push(tabela_mudancas(por_origem.descricao_media, true));
md.push(``);
md.push(`---`);
md.push(``);
md.push(`## ⬜ Não mexidos (${nao_mexidos.length})`);
md.push(``);
md.push(`| id | descrição | motivo |`);
md.push(`| --- | --- | --- |`);
for (const n of nao_mexidos) md.push(`| ${n.id} | ${esc(n.descricao)} | ${esc(n.motivo)} |`);

fs.writeFileSync(SAIDA_MD, md.join("\n"), "utf8");

console.log("=== APLICAÇÃO FEITA (sem tocar no oficial) ===");
console.log("JSON novo:", SAIDA_JSON);
console.log("Relatório:", SAIDA_MD);
console.log("");
console.log("Mudanças por origem:");
console.log("- Código exato:               ", por_origem.codigo_exato.length);
console.log("- Descrição alta:             ", por_origem.descricao_alta.length);
console.log("- Descrição média:            ", por_origem.descricao_media.length);
console.log("- Total alteradas:            ", mudancas.length);
console.log("- Não mexidas (baixa/sem/amb):", nao_mexidos.length);
console.log("- Total auditados:            ", json.length);
