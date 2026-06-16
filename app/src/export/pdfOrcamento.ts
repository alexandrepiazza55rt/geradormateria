// Geração do PDF do orçamento (retrato A4). Consome LinhasDocumento —
// não conhece o tipo Orcamento. Aviso legal fixo no rodapé.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { LinhasDocumento } from "../lib/orcamento/documentoHelpers";
import { fmtQty } from "../lib/format";
import { saveBinary, MIME_PDF, FILTER_PDF } from "../lib/exportTarget";

const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// NBSP (U+00A0) e narrow no-break space (U+202F) que o Intl pode inserir
// entre "R$" e o numero. RegExp construido de string literal para nao cair
// na regra no-irregular-whitespace.
const RE_ESPACO_NAO_QUEBRAVEL = new RegExp("[\\u00A0\\u202F]", "g");

function fmt(reais: number): string {
  return fmtBRL.format(reais).replace(RE_ESPACO_NAO_QUEBRAVEL, " ");
}

interface AutoTableDoc extends jsPDF {
  lastAutoTable?: { finalY: number };
}

function formatar_cnpj(s: string): string {
  const d = s.replace(/\D/g, "").slice(0, 14);
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return d;
}

export async function exportar_pdf_orcamento(linhas: LinhasDocumento): Promise<void> {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
  }) as AutoTableDoc;
  const margin = 40;
  const width = doc.internal.pageSize.getWidth();
  const heightLim = 760;
  let y = margin;

  // EMPRESA (Correção 7) — bloco no topo: logo à esquerda + texto à direita.
  const emp = linhas.cabecalho.empresa;
  if (emp && (emp.nome || emp.logo_data_url)) {
    const altura_bloco = 60;
    if (emp.logo_data_url) {
      try {
        // jsPDF deduz o formato pelo prefixo da data URL
        doc.addImage(emp.logo_data_url, "PNG", margin, y, 80, altura_bloco, undefined, "FAST");
      } catch {
        /* logo inválido — segue sem ele */
      }
    }
    const x_texto = emp.logo_data_url ? margin + 90 : margin;
    let ty = y + 12;
    if (emp.nome) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(emp.nome, x_texto, ty);
      ty += 12;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80);
    if (emp.cnpj) {
      doc.text(`CNPJ: ${formatar_cnpj(emp.cnpj)}`, x_texto, ty);
      ty += 10;
    }
    if (emp.endereco) {
      doc.text(emp.endereco, x_texto, ty);
      ty += 10;
    }
    const linha_contato = [emp.telefone, emp.email].filter(Boolean).join(" · ");
    if (linha_contato) {
      doc.text(linha_contato, x_texto, ty);
    }
    doc.setTextColor(20);
    y += altura_bloco + 8;
    doc.setLineWidth(0.3);
    doc.line(margin, y - 4, width - margin, y - 4);
    y += 4;
  }

  // Título
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(linhas.cabecalho.titulo, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Gerado em ${linhas.cabecalho.gerado_em_br} · Validade até ${linhas.cabecalho.validade_br}`,
    margin,
    y,
  );
  y += 18;
  doc.setTextColor(20);

  // PROPRIETÁRIO (Correção 2) — antes de CLIENTE/OBRA quando há cliente
  const p = linhas.cabecalho.proprietario;
  if (p) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PROPRIETÁRIO", margin, y);
    doc.setFont("helvetica", "normal");
    y += 13;
    doc.setFontSize(9);
    doc.text(`Nome: ${p.nome}`, margin, y);
    y += 12;
    if (p.documento_label) {
      doc.text(p.documento_label, margin, y);
      y += 12;
    }
    if (p.contato_principal) {
      doc.text(p.contato_principal, margin, y);
      y += 12;
    }
    if (p.endereco_principal) {
      // Pode ser longo — quebra em várias linhas se preciso
      const linhas_end = doc.splitTextToSize(p.endereco_principal, width - 2 * margin);
      doc.text(linhas_end, margin, y);
      y += 12 * (Array.isArray(linhas_end) ? linhas_end.length : 1);
    }
    if (p.observacoes) {
      const linhas_obs = doc.splitTextToSize(`Obs: ${p.observacoes}`, width - 2 * margin);
      doc.text(linhas_obs, margin, y);
      y += 12 * (Array.isArray(linhas_obs) ? linhas_obs.length : 1);
    }
    y += 4;
  }

  // CLIENTE / OBRA
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(p ? "OBRA" : "CLIENTE / OBRA", margin, y);
  doc.setFont("helvetica", "normal");
  y += 13;
  doc.setFontSize(9);
  const m = linhas.cabecalho.meta;
  for (const [k, v] of [
    ["Obra", m.obra || "—"],
    ["Endereço", m.endereco || "—"],
    ["Município", m.municipio || "—"],
    ["Responsável", m.responsavel || "—"],
  ] as const) {
    doc.text(`${k}: ${v}`, margin, y);
    y += 12;
  }
  y += 4;

  // CONDIÇÕES (apenas se algum campo preenchido)
  if (
    linhas.cabecalho.condicoes_pagamento ||
    linhas.cabecalho.prazo_execucao
  ) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CONDIÇÕES", margin, y);
    doc.setFont("helvetica", "normal");
    y += 13;
    doc.setFontSize(9);
    if (linhas.cabecalho.condicoes_pagamento) {
      doc.text(`Pagamento: ${linhas.cabecalho.condicoes_pagamento}`, margin, y);
      y += 12;
    }
    if (linhas.cabecalho.prazo_execucao) {
      doc.text(`Prazo de execução: ${linhas.cabecalho.prazo_execucao}`, margin, y);
      y += 12;
    }
    y += 4;
  }

  // ITENS PRECIFICADOS
  if (linhas.itens.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`ITENS PRECIFICADOS (${linhas.itens.length})`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["SAP", "Descrição", "Un", "Qty", "Preço un.", "Subtotal", "Orig."]],
      body: linhas.itens.map((it) => {
        const desc =
          it.descricao +
          (it.fator_conversao != null
            ? `  [${it.unidade}→${it.unidade_preco} × ${it.fator_conversao}]`
            : "") +
          (it.validade_label === "VENCIDO" ? "  ⚠ VENCIDO" : "");
        return [
          it.cod_sap || "—",
          desc,
          it.unidade,
          fmtQty(it.qty),
          fmt(it.preco_unit_reais) +
            (it.unidade_preco !== it.unidade ? `/${it.unidade_preco}` : ""),
          fmt(it.subtotal_reais),
          it.origem_label,
        ];
      }),
      styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [15, 76, 129] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 38, halign: "right" },
        4: { cellWidth: 65, halign: "right" },
        5: { cellWidth: 70, halign: "right" },
        6: { cellWidth: 38 },
      },
      margin: { left: margin, right: margin },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 12;
  }

  // PENDENTES (em vermelho)
  if (linhas.pendentes.length > 0) {
    if (y > heightLim - 100) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(160, 0, 0);
    doc.text(
      `⚠ ORÇAMENTO PARCIAL — ${linhas.pendentes.length} item(ns) sem preço (não somam no total)`,
      margin,
      y,
    );
    doc.setTextColor(20);
    doc.setFont("helvetica", "normal");
    y += 8;
    const pend_limit = linhas.pendentes.slice(0, 100);
    autoTable(doc, {
      startY: y,
      head: [["Descrição", "Qty", "Un", "Motivo"]],
      body: pend_limit.map((p) => [
        p.descricao,
        fmtQty(p.qty),
        p.unidade,
        p.motivo,
      ]),
      styles: { fontSize: 7, cellPadding: 2, textColor: [120, 30, 30] },
      headStyles: { fillColor: [180, 30, 30], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 40, halign: "right" },
        2: { cellWidth: 30 },
        3: { cellWidth: 150 },
      },
      margin: { left: margin, right: margin },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;
    if (linhas.pendentes.length > 100) {
      doc.setFontSize(8);
      doc.setTextColor(160, 0, 0);
      doc.text(
        `+ ${linhas.pendentes.length - 100} pendentes não listados`,
        margin,
        y,
      );
      doc.setTextColor(20);
      y += 12;
    }
    y += 4;
  }

  // DECOMPOSIÇÃO
  if (y > heightLim - 180) {
    doc.addPage();
    y = margin;
  }
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DECOMPOSIÇÃO", margin, y);
  doc.setFont("helvetica", "normal");
  y += 12;

  const d = linhas.decomposicao;
  const linhas_decomp: [string, string][] = [
    ["Subtotal material", fmt(d.subtotal_material_reais)],
    ["Perda", fmt(d.perda_reais)],
    [`Mão de obra ${d.mao_obra_label}`, fmt(d.mao_obra_reais)],
    ["Frete", fmt(d.frete_reais)],
    ["Base", fmt(d.base_reais)],
    [`Margem (${d.margem_label})`, fmt(d.margem_reais)],
  ];
  doc.setFontSize(9);
  for (const [l, v] of linhas_decomp) {
    doc.text(l, margin, y);
    doc.text(v, width - margin, y, { align: "right" });
    y += 12;
  }
  doc.setLineWidth(0.5);
  doc.line(margin, y - 4, width - margin, y - 4);
  y += 4;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  if (linhas.total_parcial) {
    doc.setTextColor(160, 100, 0);
  }
  const total_label = linhas.total_parcial ? "TOTAL (PARCIAL)" : "TOTAL";
  doc.text(total_label, margin, y + 8);
  doc.text(fmt(d.total_reais), width - margin, y + 8, { align: "right" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  y += 22;

  // Correção 7: linha de imposto estimado (informativa, não muda o total)
  if (linhas.cabecalho.imposto_estimado_pct > 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Imposto estimado (${linhas.cabecalho.imposto_estimado_pct}%)`,
      margin,
      y + 8,
    );
    doc.text(
      fmt(linhas.cabecalho.imposto_estimado_reais),
      width - margin,
      y + 8,
      { align: "right" },
    );
    doc.setTextColor(0, 0, 0);
    y += 14;
  }
  y += 6;

  // AVISO LEGAL
  if (y > heightLim - 80) {
    doc.addPage();
    y = margin;
  }
  doc.setLineWidth(0.3);
  doc.line(margin, y, width - margin, y);
  y += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("AVISO LEGAL", margin, y);
  doc.setFont("helvetica", "normal");
  y += 12;
  doc.setFontSize(8);
  const aviso =
    `Este orçamento foi gerado automaticamente pelo sistema de geração de ` +
    `relação de materiais. Confira todos os valores antes de enviar ao ` +
    `cliente. Os valores NÃO incluem tributos (ICMS, IPI, PIS/COFINS) — ` +
    `consulte seu contador para o regime tributário aplicável. ` +
    `Valor válido até ${linhas.cabecalho.validade_br}.`;
  const lines = doc.splitTextToSize(aviso, width - 2 * margin);
  doc.text(lines, margin, y);

  // Paginação no rodapé
  const total_pags = doc.getNumberOfPages();
  for (let i = 1; i <= total_pags; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(
      `Pág. ${i} de ${total_pags}`,
      width - margin,
      doc.internal.pageSize.getHeight() - 15,
      { align: "right" },
    );
    doc.setTextColor(0);
  }

  const nome = `${linhas.cabecalho.numero || "orcamento"}_v${linhas.cabecalho.versao}.pdf`;
  const bytes = new Uint8Array(doc.output("arraybuffer"));
  await saveBinary(nome, bytes, MIME_PDF, FILTER_PDF);
}
