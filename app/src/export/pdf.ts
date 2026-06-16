import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { BomRow } from "../types";
import type { ObraMeta } from "../store";
import { fmtQty } from "../lib/format";
import { saveBinary, MIME_PDF, FILTER_PDF } from "../lib/exportTarget";

export async function exportPdf(meta: ObraMeta, consolidated: BomRow[], totalEstruturas: number) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFontSize(14);
  doc.text("Relação de Materiais — Rede de Distribuição", margin, y);
  y += 20;
  doc.setFontSize(10);
  const lines = [
    `Obra/Proprietário: ${meta.obra || "—"}`,
    `Endereço: ${meta.endereco || "—"}     Município: ${meta.municipio || "—"}`,
    `Responsável: ${meta.responsavel || "—"}     Data: ${new Date().toLocaleDateString("pt-BR")}`,
    `Total de estruturas: ${fmtQty(totalEstruturas)}     Itens distintos: ${consolidated.length}`,
  ];
  for (const l of lines) { doc.text(l, margin, y); y += 14; }
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Cód. SAP", "Descrição dos materiais", "Unid.", "Quant."]],
    body: consolidated.map((r) => [
      r.material.cod_sap || "—",
      r.material.descricao,
      r.material.unidade,
      fmtQty(r.quantidade),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 76, 129] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 40 },
      3: { cellWidth: 55, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const name = (meta.obra || "relacao-materiais").replace(/[^\w\-]+/g, "_");
  const bytes = new Uint8Array(doc.output("arraybuffer"));
  await saveBinary(`${name}.pdf`, bytes, MIME_PDF, FILTER_PDF);
}
