import { describe, expect, it } from "vitest";
import {
  ACAO_LABEL,
  criar_entrada_cabecalho_alterado,
  criar_entrada_desconto_total_alterado,
  criar_entrada_item_adicionado,
  criar_entrada_item_preco_alterado,
  criar_entrada_item_qty_alterada,
  criar_entrada_item_removido,
  criar_entrada_orcamento_revertido,
  criar_entrada_status_alterado,
  criar_entrada_versao_criada,
  descrever_acao,
  fmt_data_hora_curta,
  formatar_entrada,
} from "../historicoFormatador";

const QUANDO = "2026-06-13T14:30:00";
const AUTOR = "Eu";

describe("formatar_entrada", () => {
  it("H01 — item_adicionado: 'DD/MM HH:MM — Eu adicionou X (qty un × R$ A = R$ B)'", () => {
    const e = criar_entrada_item_adicionado({
      item_id: 1,
      descricao_material: "Cabo CAA 2",
      unidade: "kg",
      qty: 50,
      preco_centavos: 1800,
      subtotal_centavos: 90000,
      total_antes_centavos: 0,
      total_depois_centavos: 90000,
      autor: AUTOR,
      quando: QUANDO,
    });
    const linha = formatar_entrada(e);
    expect(linha).toContain("13/06 14:30");
    expect(linha).toContain("Eu adicionou Cabo CAA 2");
    expect(linha).toContain("50 kg");
    expect(linha).toContain("R$ 18,00");
    expect(linha).toContain("R$ 900,00");
  });

  it("H02 — item_removido inclui valores que tinha", () => {
    const e = criar_entrada_item_removido({
      item_id: 2,
      descricao_material: "Parafuso 200mm",
      unidade: "pç",
      qty: 12,
      preco_centavos: 500,
      subtotal_centavos: 6000,
      total_antes_centavos: 6000,
      total_depois_centavos: 0,
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(e.acao).toBe("item_removido");
    expect(e.qty_antes).toBe(12);
    expect(e.preco_antes_centavos).toBe(500);
    expect(formatar_entrada(e)).toContain("removeu Parafuso 200mm");
    expect(formatar_entrada(e)).toContain("R$ 60,00");
  });

  it("H03 — item_qty_alterada: 'alterou quantidade ... de 5 para 8 (R$ 40,00 → R$ 64,00)'", () => {
    const e = criar_entrada_item_qty_alterada({
      item_id: 3,
      descricao_material: "Isolador",
      unidade: "pç",
      qty_antes: 5,
      qty_depois: 8,
      subtotal_antes_centavos: 4000,
      subtotal_depois_centavos: 6400,
      total_antes_centavos: 4000,
      total_depois_centavos: 6400,
      autor: AUTOR,
      quando: QUANDO,
    });
    const linha = formatar_entrada(e);
    expect(linha).toContain("alterou quantidade de Isolador");
    expect(linha).toContain("de 5 para 8 pç");
    expect(linha).toContain("R$ 40,00 → R$ 64,00");
  });

  it("H04 — item_preco_alterado: 'alterou preço unitário ... R$ A → R$ B'", () => {
    const e = criar_entrada_item_preco_alterado({
      item_id: 4,
      descricao_material: "Cabo Al",
      preco_antes_centavos: 1500,
      preco_depois_centavos: 1850,
      total_antes_centavos: 75000,
      total_depois_centavos: 92500,
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(formatar_entrada(e)).toContain("alterou preço unitário de Cabo Al");
    expect(formatar_entrada(e)).toContain("R$ 15,00");
    expect(formatar_entrada(e)).toContain("R$ 18,50");
  });

  it("H05 — desconto_total_alterado: pct_antes → pct_depois com impacto no total", () => {
    const e = criar_entrada_desconto_total_alterado({
      pct_antes: 0,
      pct_depois: 10,
      total_antes_centavos: 100000,
      total_depois_centavos: 90000,
      autor: AUTOR,
      quando: QUANDO,
    });
    const linha = formatar_entrada(e);
    expect(linha).toContain("alterou desconto do total de 0,0% para 10,0%");
    expect(linha).toContain("R$ 1.000,00 → R$ 900,00");
    expect(e.valor_antes).toBe("0,0%");
    expect(e.valor_depois).toBe("10,0%");
  });

  it("H06 — cabecalho_alterado: 'alterou X de \"A\" para \"B\"'; vazio vira '—'", () => {
    const e = criar_entrada_cabecalho_alterado({
      campo: "observacoes",
      rotulo: "Observações",
      valor_antes: "",
      valor_depois: "Pagar à vista",
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(formatar_entrada(e)).toContain('alterou Observações de "—" para "Pagar à vista"');
  });

  it("H07 — status_alterado: 'Rascunho → Enviado'", () => {
    const e = criar_entrada_status_alterado({
      status_antes: "rascunho",
      status_depois: "enviado",
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(e.descricao).toBe("alterou status: Rascunho → Enviado");
    expect(formatar_entrada(e)).toBe("13/06 14:30 — Eu alterou status: Rascunho → Enviado");
  });

  it("H08 — versao_criada: 'criou versão v2 a partir da v1'", () => {
    const e = criar_entrada_versao_criada({
      versao_antes: 1,
      versao_depois: 2,
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(e.descricao).toBe("criou versão v2 a partir da v1");
  });

  it("H09 — orcamento_revertido: 'reverteu para v1'", () => {
    const e = criar_entrada_orcamento_revertido({
      versao_revertida: 1,
      autor: AUTOR,
      quando: QUANDO,
    });
    expect(e.descricao).toBe("reverteu para v1");
    expect(e.valor_depois).toBe("v1");
  });

  it("H10 — descrever_acao + ACAO_LABEL: rótulos curtos para filtro", () => {
    expect(descrever_acao("item_adicionado")).toBe("Item adicionado");
    expect(descrever_acao("status_alterado")).toBe("Status alterado");
    // Todas as ações têm label (sem undefined)
    for (const k of Object.keys(ACAO_LABEL)) {
      expect(typeof ACAO_LABEL[k as keyof typeof ACAO_LABEL]).toBe("string");
    }
    // fmt_data_hora_curta com string vazia retorna "—"
    expect(fmt_data_hora_curta("")).toBe("—");
  });
});
