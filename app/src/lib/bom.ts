// BOM computation: turn a "lista de obra" into per-item and consolidated material lists.
// Mirrors the spreadsheet exactly: for each structure the per-unit BOM at a chosen
// pole = base_bom + postes[poleIdx].delta; multiplied by the quantity; then all
// items are summed by material id (the consolidated "relação de materiais").

import type {
  Material, Estrutura, Insumo, ObraItem, ObraInsumo, BomMap, BomRow,
} from "../types";

export function unitBom(est: Estrutura, posteIdx: number): BomMap {
  const out: BomMap = { ...est.base_bom };
  const poste = est.postes[posteIdx];
  if (poste) {
    for (const [mid, d] of Object.entries(poste.delta)) {
      out[mid] = (out[mid] ?? 0) + d;
      if (Math.abs(out[mid]) < 1e-9) delete out[mid];
    }
  }
  return out;
}

// Add scaled BOM into an accumulator map.
function addInto(acc: BomMap, bom: BomMap, factor: number) {
  for (const [mid, q] of Object.entries(bom)) {
    acc[mid] = (acc[mid] ?? 0) + q * factor;
  }
}

export interface Consolidation {
  rows: BomRow[];                  // consolidated, sorted
  byItem: Map<string, BomRow[]>;   // per obra-item line key -> rows
  totalItens: number;              // distinct materials
  totalEstruturas: number;         // sum of structure quantities
}

export function consolidate(
  estruturas: Map<string, Estrutura>,
  insumos: Map<string, Insumo>,
  itens: ObraItem[],
  obraInsumos: ObraInsumo[],
  materials: Map<number, Material>,
): Consolidation {
  const acc: BomMap = {};
  const byItem = new Map<string, BomRow[]>();
  let totalEstruturas = 0;

  for (const it of itens) {
    const est = estruturas.get(it.estruturaId);
    if (!est || it.quantidade <= 0) continue;
    totalEstruturas += it.quantidade;
    const bom = unitBom(est, it.posteIdx);
    addInto(acc, bom, it.quantidade);
    byItem.set(it.key, toRows(bom, materials, it.quantidade));
  }

  for (const oi of obraInsumos) {
    const ins = insumos.get(oi.insumoId);
    if (!ins || oi.quantidade <= 0) continue;
    addInto(acc, ins.bom, oi.quantidade);
    byItem.set(oi.key, toRows(ins.bom, materials, oi.quantidade));
  }

  const rows = toRows(acc, materials, 1);
  return { rows, byItem, totalItens: rows.length, totalEstruturas };
}

function toRows(bom: BomMap, materials: Map<number, Material>, factor: number): BomRow[] {
  const rows: BomRow[] = [];
  for (const [mid, q] of Object.entries(bom)) {
    const qf = q * factor;
    if (Math.abs(qf) < 1e-9) continue;
    const material = materials.get(Number(mid));
    if (!material) continue;
    rows.push({ material, quantidade: Math.round(qf * 1e6) / 1e6 });
  }
  return rows;
}

export type SortKey = "codigo" | "descricao" | "categoria";

export function sortRows(rows: BomRow[], key: SortKey): BomRow[] {
  const r = [...rows];
  r.sort((a, b) => {
    if (key === "codigo") {
      return (a.material.cod_sap || "").localeCompare(b.material.cod_sap || "", "pt-BR", { numeric: true });
    }
    if (key === "categoria") {
      return (a.material.categoria || "").localeCompare(b.material.categoria || "", "pt-BR") ||
        a.material.descricao.localeCompare(b.material.descricao, "pt-BR");
    }
    return a.material.descricao.localeCompare(b.material.descricao, "pt-BR");
  });
  return r;
}
