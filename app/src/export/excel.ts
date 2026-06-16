import * as XLSX from "xlsx";
import type { BomRow, Estrutura, Insumo, ObraItem, ObraInsumo, Material } from "../types";
import type { ObraMeta } from "../store";
import { unitBom } from "../lib/bom";
import { fmtFases, fmtTensao, cleanLabel } from "../lib/format";
import { saveBinary, MIME_XLSX, FILTER_XLSX } from "../lib/exportTarget";

function header(meta: ObraMeta): (string | number)[][] {
  return [
    ["RELAÇÃO DE MATERIAIS PARA REDE DE ENERGIA ELÉTRICA"],
    ["Obra / Proprietário", meta.obra],
    ["Endereço", meta.endereco],
    ["Município", meta.municipio],
    ["Responsável", meta.responsavel],
    ["Data", new Date().toLocaleDateString("pt-BR")],
    [],
  ];
}

export async function exportExcel(
  meta: ObraMeta,
  consolidated: BomRow[],
  itens: ObraItem[],
  obraInsumos: ObraInsumo[],
  estruturas: Map<string, Estrutura>,
  insumos: Map<string, Insumo>,
  materials: Map<number, Material>,
) {
  const wb = XLSX.utils.book_new();

  // --- Consolidated sheet ---
  const cons: (string | number)[][] = [
    ...header(meta),
    ["Cód. SAP", "Cód. Líder 7", "Descrição dos materiais", "Unid.", "Quant."],
    ...consolidated.map((r) => [
      r.material.cod_sap, r.material.cod_lider7, r.material.descricao, r.material.unidade, r.quantidade,
    ]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(cons);
  ws1["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 60 }, { wch: 8 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Consolidado");

  // --- Per-structure sheet ---
  const per: (string | number)[][] = [
    ...header(meta),
    ["Estrutura", "Cód. SAP", "Descrição", "Unid.", "Quant."],
  ];
  for (const it of itens) {
    const est = estruturas.get(it.estruturaId);
    if (!est || it.quantidade <= 0) continue;
    const label = `${cleanLabel(est.tipo)}${est.condutor ? " / " + est.condutor : ""} / ${est.postes[it.posteIdx]?.poste ?? ""} (${fmtFases(est.fases)} ${fmtTensao(est.tensao_kv)}) ×${it.quantidade}`;
    per.push([label, "", "", "", ""]);
    const bom = unitBom(est, it.posteIdx);
    for (const [mid, q] of Object.entries(bom)) {
      const m = materials.get(Number(mid));
      if (!m) continue;
      per.push(["", m.cod_sap, m.descricao, m.unidade, q * it.quantidade]);
    }
  }
  for (const oi of obraInsumos) {
    const ins = insumos.get(oi.insumoId);
    if (!ins || oi.quantidade <= 0) continue;
    per.push([`${cleanLabel(ins.descricao)} ×${oi.quantidade}`, "", "", "", ""]);
    for (const [mid, q] of Object.entries(ins.bom)) {
      const m = materials.get(Number(mid));
      if (!m) continue;
      per.push(["", m.cod_sap, m.descricao, m.unidade, q * oi.quantidade]);
    }
  }
  const ws2 = XLSX.utils.aoa_to_sheet(per);
  ws2["!cols"] = [{ wch: 50 }, { wch: 12 }, { wch: 55 }, { wch: 8 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Por estrutura");

  const name = (meta.obra || "relacao-materiais").replace(/[^\w\-]+/g, "_");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
  await saveBinary(`${name}.xlsx`, out, MIME_XLSX, FILTER_XLSX);
}
