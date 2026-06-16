// Geração do XLSX do orçamento — workbook próprio com 3 abas
// (Resumo, Itens precificados, Pendentes — esta só se houver).

import * as XLSX from "xlsx";
import type { LinhasDocumento } from "../lib/orcamento/documentoHelpers";
import { saveBinary, MIME_XLSX, FILTER_XLSX } from "../lib/exportTarget";

export async function exportar_excel_orcamento(linhas: LinhasDocumento): Promise<void> {
  const wb = XLSX.utils.book_new();
  const c = linhas.cabecalho;
  const d = linhas.decomposicao;

  // ─── Aba "Resumo" ────────────────────────────────────────
  const resumo: (string | number)[][] = [];
  // EMPRESA (Correção 7) — só se houver
  const emp = c.empresa;
  if (emp && (emp.nome || emp.cnpj)) {
    resumo.push(["EMPRESA"]);
    if (emp.nome) resumo.push(["Nome", emp.nome]);
    if (emp.cnpj) resumo.push(["CNPJ", emp.cnpj]);
    if (emp.endereco) resumo.push(["Endereço", emp.endereco]);
    if (emp.telefone) resumo.push(["Telefone", emp.telefone]);
    if (emp.email) resumo.push(["E-mail", emp.email]);
    resumo.push([]);
  }
  resumo.push(
    [`ORÇAMENTO Nº ${c.numero || "—"}  ·  v${c.versao}  ·  ${c.status_label}`],
    [`Gerado em: ${c.gerado_em_br}`, "", `Validade: ${c.validade_br}`],
    [],
  );

  // PROPRIETÁRIO (Correção 2) — dados ATUAIS do cadastro de clientes
  const p = c.proprietario;
  if (p) {
    resumo.push(["PROPRIETÁRIO"]);
    resumo.push(["Nome", p.nome]);
    if (p.documento_label) resumo.push(["Documento", p.documento_label]);
    if (p.contato_principal) resumo.push(["Contato", p.contato_principal]);
    if (p.endereco_principal) resumo.push(["Endereço", p.endereco_principal]);
    if (p.observacoes) resumo.push(["Observações", p.observacoes]);
    resumo.push([]);
  }

  resumo.push(
    [p ? "OBRA" : "CLIENTE / OBRA"],
    ["Obra", c.meta.obra || "—"],
    ["Endereço", c.meta.endereco || "—"],
    ["Município", c.meta.municipio || "—"],
    ["Responsável", c.meta.responsavel || "—"],
    [],
    ["CONDIÇÕES"],
    ["Pagamento", c.condicoes_pagamento || "—"],
    ["Prazo de execução", c.prazo_execucao || "—"],
    [],
    ["DECOMPOSIÇÃO", "Valor (R$)"],
    ["Subtotal material", d.subtotal_material_reais],
    ["Perda", d.perda_reais],
    [`Mão de obra ${d.mao_obra_label}`, d.mao_obra_reais],
    ["Frete", d.frete_reais],
    ["Base para margem", d.base_reais],
    [`Margem (${d.margem_label})`, d.margem_reais],
    [linhas.total_parcial ? "TOTAL (PARCIAL)" : "TOTAL", d.total_reais],
  );
  // Imposto estimado (informativo)
  if (c.imposto_estimado_pct > 0) {
    resumo.push([
      `Imposto estimado (${c.imposto_estimado_pct}%) — informativo`,
      c.imposto_estimado_reais,
    ]);
  }

  if (linhas.avisos_globais.length > 0) {
    resumo.push([]);
    resumo.push(["AVISOS"]);
    for (const a of linhas.avisos_globais) resumo.push([a]);
  }

  resumo.push([]);
  resumo.push(["AVISO LEGAL"]);
  resumo.push([
    "Este orçamento foi gerado automaticamente. Confira todos os valores antes de enviar ao cliente. NÃO inclui tributos — consulte seu contador para o regime tributário aplicável.",
  ]);

  const ws_resumo = XLSX.utils.aoa_to_sheet(resumo);
  ws_resumo["!cols"] = [{ wch: 36 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws_resumo, "Resumo");

  // ─── Aba "Itens precificados" ───────────────────────────
  const itens_header = [
    "SAP",
    "Descrição",
    "Un",
    "Qty",
    "Preço un. (R$)",
    "Subtotal (R$)",
    "Un. preço",
    "Fator",
    "Origem",
    "Validade",
  ];
  const itens: (string | number)[][] = [
    itens_header,
    ...linhas.itens.map((it) => [
      it.cod_sap || "",
      it.descricao,
      it.unidade,
      it.qty,
      it.preco_unit_reais,
      it.subtotal_reais,
      it.unidade_preco,
      it.fator_conversao ?? "",
      it.origem_label,
      it.validade_label,
    ]),
  ];
  const ws_itens = XLSX.utils.aoa_to_sheet(itens);
  ws_itens["!cols"] = [
    { wch: 10 }, { wch: 55 }, { wch: 5 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 8 },
    { wch: 10 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws_itens, "Itens precificados");

  // ─── Aba "Pendentes" (só se houver) ─────────────────────
  if (linhas.pendentes.length > 0) {
    const pend: (string | number)[][] = [
      ["Descrição", "Qty", "Un", "Motivo"],
      ...linhas.pendentes.map((p) => [p.descricao, p.qty, p.unidade, p.motivo]),
    ];
    const ws_pend = XLSX.utils.aoa_to_sheet(pend);
    ws_pend["!cols"] = [
      { wch: 55 }, { wch: 10 }, { wch: 5 }, { wch: 38 },
    ];
    XLSX.utils.book_append_sheet(wb, ws_pend, "Pendentes");
  }

  const nome = `${c.numero || "orcamento"}_v${c.versao}.xlsx`;
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
  await saveBinary(nome, out, MIME_XLSX, FILTER_XLSX);
}
