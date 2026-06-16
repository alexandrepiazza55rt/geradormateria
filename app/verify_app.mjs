// End-to-end check: load the REAL app data and run the SAME consolidation logic
// the UI uses (base + poste delta, x qty, summed by material). Prints a BOM.
import fs from "node:fs";
const D = "./public/data";
const materiais = JSON.parse(fs.readFileSync(`${D}/materiais.json`, "utf8"));
const estruturas = JSON.parse(fs.readFileSync(`${D}/estruturas.json`, "utf8"));
const matById = new Map(materiais.map((m) => [m.id, m]));
const estById = new Map(estruturas.map((e) => [e.id, e]));

function unitBom(est, posteIdx) {
  const out = { ...est.base_bom };
  const p = est.postes[posteIdx];
  if (p) for (const [k, d] of Object.entries(p.delta)) {
    out[k] = (out[k] ?? 0) + d;
    if (Math.abs(out[k]) < 1e-9) delete out[k];
  }
  return out;
}
function find(cat, tipo, cond) {
  return estruturas.find(
    (e) => e.categoria === cat && e.tipo.replace(/\s+/g, " ").trim() === tipo &&
      (cond == null || e.condutor === cond),
  );
}
function poleIdx(est, label) {
  const i = est.postes.findIndex((p) => p.poste === label);
  return i < 0 ? 0 : i;
}

const u1 = find("Monofásico 13,8 kV", "U1", "2CAA");
const estai = find("Monofásico 13,8 kV", "ESTAI ÂNCORA", null);
const n3 = find("Trifásico 13,8 kV", "N3", "2CAA");
console.log("found:", { u1: u1?.id, estai: estai?.id, n3: n3?.id });

const obra = [
  { est: u1, poste: "DT-10/150", qty: 3 },
  { est: estai, poste: "DT-11/600", qty: 2 },
  { est: n3, poste: "DT-10/150", qty: 4 },
];

const acc = {};
for (const { est, poste, qty } of obra) {
  if (!est) { console.log("MISSING structure!"); continue; }
  const bom = unitBom(est, poleIdx(est, poste));
  for (const [k, q] of Object.entries(bom)) acc[k] = (acc[k] ?? 0) + q * qty;
}
const rows = Object.entries(acc)
  .filter(([, q]) => Math.abs(q) > 1e-9)
  .map(([k, q]) => ({ m: matById.get(Number(k)), q }))
  .filter((r) => r.m)
  .sort((a, b) => a.m.descricao.localeCompare(b.m.descricao, "pt-BR"));

console.log(`\nConsolidated BOM: ${rows.length} distinct materials\n`);
for (const r of rows) {
  console.log(`  ${String(r.q).padStart(6)}  [${(r.m.unidade || "").trim()}]  SAP ${r.m.cod_sap || "-"}  ${r.m.descricao}`);
}
