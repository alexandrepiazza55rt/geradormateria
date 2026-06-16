// Match fuzzy por descrição para os materiais sem match exato de código.
// Não modifica nada — só gera auditoria/candidatos-descricao-2026-06-13.md
// com top 5 candidatos por material para o dono aprovar 1 a 1.

const fs = require("fs");
const path = require("path");
const xlsx = require("../app/node_modules/xlsx");

const XLSX_PATH =
  "C:/Users/Lucas Matheus/.claude/uploads/ff0df642-11ed-4664-8df3-373b1b10ca74/cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx";
const JSON_ATUAL = path.join(__dirname, "..", "app", "public", "data", "materiais.json");
const SAIDA_MD = path.join(__dirname, "candidatos-descricao-2026-06-13.md");

// Stop words em pt-br + termos genéricos demais para discriminar materiais
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
  const arr = normalizar(s).split(" ").filter((t) => t.length > 0);
  // Mantém números mesmo curtos; só descarta palavras textuais em STOP
  return arr.filter((t) => /\d/.test(t) || !STOP.has(t));
}

function numeros(s) {
  // Captura sequências numéricas, normaliza vírgula → ponto para casar
  // "2,4" com "2.4". Útil para descrições com medidas (16mm², 7,9mm, ...).
  const matches = normalizar(s).match(/\d+(?:[.,]\d+)?/g) ?? [];
  return new Set(matches.map((n) => n.replace(",", ".")));
}

function dice(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter++;
  return (2 * inter) / (setA.size + setB.size);
}

function score(desc_sistema, desc_planilha) {
  const ta = new Set(tokens(desc_sistema));
  const tb = new Set(tokens(desc_planilha));
  const na = numeros(desc_sistema);
  const nb = numeros(desc_planilha);
  const score_tokens = dice(ta, tb);
  // Se ambos têm números, casar números pesa muito. Se só um tem, neutro.
  let score_numeros = 1.0;
  if (na.size > 0 || nb.size > 0) {
    score_numeros = dice(na, nb);
  }
  // Peso: tokens 60%, números 40%. Se números desbatem completamente em
  // descrições "técnicas", o final cai bastante mesmo com tokens parecidos.
  return 0.6 * score_tokens + 0.4 * score_numeros;
}

function confianca(s) {
  if (s >= 0.75) return "alta";
  if (s >= 0.55) return "media";
  if (s >= 0.4) return "baixa";
  return "muito_baixa";
}

// ── 1. Carrega planilha ─────────────────────────────────────────
const wb = xlsx.readFile(XLSX_PATH);

const material_rows = xlsx.utils.sheet_to_json(wb.Sheets["MATERIAL"], { header: 1, defval: "" }).slice(1);
const planilha_material = material_rows
  .filter((r) => r[0] !== "" || r[1] !== "")
  .map((r) => ({
    fonte: "MATERIAL",
    cod_novo: String(r[0] ?? "").trim(),
    cod_antigo: String(r[1] ?? "").trim(),
    descricao: String(r[2] ?? "").trim(),
    unidade: String(r[3] ?? "").trim(),
  }));

const banco_rows = xlsx.utils.sheet_to_json(wb.Sheets["Banco_Dados"], { header: 1, defval: "" }).slice(1);
const planilha_banco = banco_rows
  .filter((r) => r[0] !== "" && r[1] !== "")
  .map((r) => ({
    fonte: "Banco_Dados",
    cod_novo: String(r[0] ?? "").trim(),
    cod_antigo: "",
    descricao: String(r[1] ?? "").trim(),
    unidade: String(r[2] ?? "").trim(),
  }));

// Universo de candidatos
const candidatos = [...planilha_material, ...planilha_banco];
console.log("Candidatos (MATERIAL):", planilha_material.length);
console.log("Candidatos (Banco_Dados):", planilha_banco.length);
console.log("Total candidatos:", candidatos.length);

// ── 2. Identifica materiais do JSON que precisam de match ──────
const json = JSON.parse(fs.readFileSync(JSON_ATUAL, "utf8"));

// Reproduz a classificação do script anterior para saber quais entram aqui
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

const para_matchar = [];
const sem_cod_sap_list = [];
const sem_match_list = [];
for (const m of json) {
  const cod = (m.cod_sap ?? "").toString().trim();
  if (!cod) { sem_cod_sap_list.push(m); continue; }
  if (por_antigo.has(cod) || por_novo.has(cod)) continue;
  sem_match_list.push(m);
}
para_matchar.push(...sem_match_list, ...sem_cod_sap_list);

console.log("\nMateriais para tentar match por descrição:", para_matchar.length);
console.log("- Sem match exato:", sem_match_list.length);
console.log("- Sem cod_sap:", sem_cod_sap_list.length);

// ── 3. Para cada material, top 5 candidatos ────────────────────
function top_candidatos(m, k = 5) {
  const arr = [];
  for (const c of candidatos) {
    const s = score(m.descricao, c.descricao);
    if (s >= 0.4) arr.push({ ...c, score: s });
  }
  arr.sort((a, b) => b.score - a.score);
  return arr.slice(0, k);
}

const resultado = para_matchar.map((m) => ({
  material: m,
  origem: (m.cod_sap ?? "").trim() ? "sem_match" : "sem_cod_sap",
  candidatos: top_candidatos(m, 5),
}));

// ── 4. Estatísticas ─────────────────────────────────────────────
const por_conf = { alta: 0, media: 0, baixa: 0, nenhum: 0 };
for (const r of resultado) {
  if (r.candidatos.length === 0) { por_conf.nenhum++; continue; }
  const c = confianca(r.candidatos[0].score);
  if (c === "alta") por_conf.alta++;
  else if (c === "media") por_conf.media++;
  else por_conf.baixa++;
}

console.log("\nConfiança do melhor candidato:");
console.log("- Alta (>= 0.75):  ", por_conf.alta);
console.log("- Média (0.55-0.75):", por_conf.media);
console.log("- Baixa (0.4-0.55):", por_conf.baixa);
console.log("- Sem candidato:   ", por_conf.nenhum);

// ── 5. Helpers de render ────────────────────────────────────────
function esc(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function fmt_score(s) {
  return s.toFixed(2);
}

function tabela_candidatos(candidatos) {
  if (candidatos.length === 0) return "_Nenhum candidato com score ≥ 0,40._";
  const lines = [
    "| # | score | fonte | cod novo | cod antigo | descrição planilha | unid |",
    "| --- | ---: | --- | --- | --- | --- | --- |",
  ];
  candidatos.forEach((c, i) => {
    lines.push(
      `| ${i + 1} | **${fmt_score(c.score)}** | ${c.fonte} | \`${esc(c.cod_novo)}\` | ${esc(c.cod_antigo || "—")} | ${esc(c.descricao)} | ${esc(c.unidade)} |`,
    );
  });
  return lines.join("\n");
}

// ── 6. Markdown ─────────────────────────────────────────────────
const md = [];
md.push(`# Auditoria — Match por descrição (fuzzy)`);
md.push(``);
md.push(`**Data:** 2026-06-13`);
md.push(`**Materiais analisados:** ${para_matchar.length} (105 sem match + 129 sem cod_sap)`);
md.push(`**Fonte de candidatos:** aba \`MATERIAL\` (340) + aba \`Banco_Dados\` (${planilha_banco.length}) — total ${candidatos.length} candidatos`);
md.push(``);
md.push(`> ⚠ Match por descrição é **aproximado**. Nada foi aplicado. Revise cada caso e me indique quais candidatos aceitar.`);
md.push(``);
md.push(`## Como ler o score`);
md.push(``);
md.push(`Combinação ponderada: 60% Dice de tokens (palavras significativas, sem stopwords) + 40% Dice de números encontrados na descrição (medidas, AWG, kV, mm²). Vai de 0 (nada em comum) a 1 (idêntico após normalização).`);
md.push(``);
md.push(`- 🟢 **Alta** (≥ 0,75) — quase certeza`);
md.push(`- 🟡 **Média** (0,55–0,75) — provavelmente bate, conferir números`);
md.push(`- 🔴 **Baixa** (0,40–0,55) — só confiar se descrição for clara`);
md.push(`- Sem candidato com score ≥ 0,40 — não há nada parecido na planilha`);
md.push(``);
md.push(`## Resumo`);
md.push(``);
md.push(`| Confiança do melhor candidato | Quantidade |`);
md.push(`| --- | ---: |`);
md.push(`| 🟢 Alta (≥ 0,75) | ${por_conf.alta} |`);
md.push(`| 🟡 Média (0,55–0,75) | ${por_conf.media} |`);
md.push(`| 🔴 Baixa (0,40–0,55) | ${por_conf.baixa} |`);
md.push(`| ⚫ Sem candidato (< 0,40) | ${por_conf.nenhum} |`);
md.push(``);
md.push(`## Como aprovar`);
md.push(``);
md.push(`Para cada material abaixo, me diga uma das opções:`);
md.push(``);
md.push(`- \`#ID aceitar 1\` (ou 2, 3, …) — usa o candidato N como cod_sap`);
md.push(`- \`#ID rejeitar\` — não altera nada nesse material`);
md.push(`- \`aceitar todos altos\` — aplica todos os 🟢 de uma vez`);
md.push(``);
md.push(`Para volumes grandes, pode mandar uma lista, ex.:`);
md.push(`\`\`\``);
md.push(`#1 aceitar 1`);
md.push(`#3 aceitar 2`);
md.push(`#5 rejeitar`);
md.push(`\`\`\``);
md.push(``);
md.push(`---`);
md.push(``);

// Ordena: primeiro alta confiança, depois média, depois baixa, depois sem candidato
function grupo(r) {
  if (r.candidatos.length === 0) return 4;
  const c = confianca(r.candidatos[0].score);
  if (c === "alta") return 1;
  if (c === "media") return 2;
  if (c === "baixa") return 3;
  return 4;
}

const ordenado = [...resultado].sort((a, b) => {
  const g = grupo(a) - grupo(b);
  if (g !== 0) return g;
  const sa = a.candidatos[0]?.score ?? 0;
  const sb = b.candidatos[0]?.score ?? 0;
  return sb - sa;
});

// ── 7. Seção: Alta confiança ────────────────────────────────────
md.push(`## 🟢 Alta confiança (${por_conf.alta})`);
md.push(``);
md.push(`Quase certeza. Top candidato com score ≥ 0,75.`);
md.push(``);
for (const r of ordenado.filter((r) => r.candidatos[0] && confianca(r.candidatos[0].score) === "alta")) {
  const cod_atual = (r.material.cod_sap ?? "").trim() || "_(sem cod_sap)_";
  md.push(`### \`#${r.material.id}\` — ${esc(r.material.descricao)} (${esc(r.material.unidade)})`);
  md.push(`- cod_sap atual: \`${esc(cod_atual)}\` · cod_lider7: \`${esc(r.material.cod_lider7 || "—")}\``);
  md.push(``);
  md.push(tabela_candidatos(r.candidatos));
  md.push(``);
}
md.push(`---`);
md.push(``);

// ── 8. Seção: Média confiança ───────────────────────────────────
md.push(`## 🟡 Média confiança (${por_conf.media})`);
md.push(``);
md.push(`Provavelmente bate. Confira números/medidas no top candidato.`);
md.push(``);
for (const r of ordenado.filter((r) => r.candidatos[0] && confianca(r.candidatos[0].score) === "media")) {
  const cod_atual = (r.material.cod_sap ?? "").trim() || "_(sem cod_sap)_";
  md.push(`### \`#${r.material.id}\` — ${esc(r.material.descricao)} (${esc(r.material.unidade)})`);
  md.push(`- cod_sap atual: \`${esc(cod_atual)}\` · cod_lider7: \`${esc(r.material.cod_lider7 || "—")}\``);
  md.push(``);
  md.push(tabela_candidatos(r.candidatos));
  md.push(``);
}
md.push(`---`);
md.push(``);

// ── 9. Seção: Baixa confiança ───────────────────────────────────
md.push(`## 🔴 Baixa confiança (${por_conf.baixa})`);
md.push(``);
md.push(`Pouca chance. Só aceitar se a descrição realmente bater.`);
md.push(``);
for (const r of ordenado.filter((r) => r.candidatos[0] && confianca(r.candidatos[0].score) === "baixa")) {
  const cod_atual = (r.material.cod_sap ?? "").trim() || "_(sem cod_sap)_";
  md.push(`### \`#${r.material.id}\` — ${esc(r.material.descricao)} (${esc(r.material.unidade)})`);
  md.push(`- cod_sap atual: \`${esc(cod_atual)}\` · cod_lider7: \`${esc(r.material.cod_lider7 || "—")}\``);
  md.push(``);
  md.push(tabela_candidatos(r.candidatos));
  md.push(``);
}
md.push(`---`);
md.push(``);

// ── 10. Seção: Sem candidato ────────────────────────────────────
md.push(`## ⚫ Sem candidato (${por_conf.nenhum})`);
md.push(``);
md.push(`Nada na planilha com similaridade ≥ 0,40. Provavelmente são materiais que de fato não estão no catálogo SAP que você mandou, ou descrições muito diferentes.`);
md.push(``);
const sem_cand = ordenado.filter((r) => r.candidatos.length === 0);
md.push(`| id | descrição | unid | cod_sap atual | cod_lider7 |`);
md.push(`| --- | --- | --- | --- | --- |`);
for (const r of sem_cand) {
  const cod_atual = (r.material.cod_sap ?? "").trim() || "—";
  md.push(`| ${r.material.id} | ${esc(r.material.descricao)} | ${esc(r.material.unidade)} | ${esc(cod_atual)} | ${esc(r.material.cod_lider7 || "—")} |`);
}

fs.writeFileSync(SAIDA_MD, md.join("\n"), "utf8");

console.log("\n=== AUDITORIA FUZZY GERADA ===");
console.log("Arquivo:", SAIDA_MD);
