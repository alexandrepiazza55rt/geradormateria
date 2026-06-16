// End-to-end check: rural NDU 005 structures consolidate with valid material refs.
import fs from "node:fs";
const D = "./public/data";
const materiais = JSON.parse(fs.readFileSync(`${D}/materiais.json`, "utf8"));
const estruturas = JSON.parse(fs.readFileSync(`${D}/estruturas.json`, "utf8"));
const matById = new Map(materiais.map((m) => [m.id, m]));
const rural = estruturas.filter((e) => e.norma_origem === "NDU 005");

// integrity: every base_bom / poste id resolves to a material
let missing = 0;
for (const e of rural) {
  for (const k of Object.keys(e.base_bom)) if (!matById.has(Number(k))) missing++;
  for (const p of e.postes) for (const k of Object.keys(p.delta)) if (!matById.has(Number(k))) missing++;
}
console.log(`rural structures: ${rural.length}; urban untouched: ${estruturas.length - rural.length}`);
console.log(`unresolved material refs: ${missing} (expect 0)`);

// sample consolidation: N3 / 2 AWG / cruzeta T 1,90 m / DT-11/600, qty 5
function unitBom(est, pi) {
  const out = { ...est.base_bom };
  const p = est.postes[pi];
  if (p) for (const [k, d] of Object.entries(p.delta)) { out[k] = (out[k] ?? 0) + d; if (Math.abs(out[k]) < 1e-9) delete out[k]; }
  return out;
}
const n3 = rural.find((e) => e.tipo_base === "N3" && e.condutor === "2 AWG" && e.cruzeta === "T 1,90 m" && Math.abs(e.tensao_kv - 13.8) < 0.1);
if (n3) {
  const pi = Math.max(0, n3.postes.findIndex((p) => p.poste === "DT-11/600"));
  const bom = unitBom(n3, pi);
  console.log(`\n${n3.tipo} ${n3.condutor} ${n3.tensao_kv}kV poste DT-11/600 (${n3.pagina_origem}):`);
  for (const [k, q] of Object.entries(bom)) {
    const m = matById.get(Number(k));
    console.log(`  ${q} x [${(m.unidade||"").trim()}] ${m.cod_sap} ${m.descricao}`);
  }
  console.log(`  condicionais (não somados): ${(n3.condicionais||[]).map(c=>c.descricao||c.condicao).join("; ") || "—"}`);
}
