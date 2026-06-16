import { describe, expect, it } from "vitest";
import type { BomRow, Material } from "../../../types";
import type { PrecoMaterial } from "../types";
import { precificar_item } from "../precificacao";

const M_PCS: Material = {
  id: 1, cod_sap: "X1", cod_lider7: "", descricao: "Parafuso", unidade: "pç",
};
const M_KG: Material = {
  id: 30, cod_sap: "X30", cod_lider7: "",
  descricao: "Cabo de alumínio nu 2 CAA - AWG", unidade: "kg",
};

const HOJE = new Date("2026-06-13T12:00:00Z");

function preco(over: Partial<PrecoMaterial> = {}): PrecoMaterial {
  return {
    material_id: 1,
    valor_centavos: 1000,
    unidade_preco: "pç",
    fator_conversao: null,
    validade: null,
    fornecedor: null,
    origem: "oficial",
    atualizado_em: "2026-01-01T00:00:00Z",
    categoria_perda_override: null,
    ...over,
  };
}

describe("precificar_item", () => {
  it("T11 — sem preço cadastrado → pendente sem_preco", () => {
    const row: BomRow = { material: M_PCS, quantidade: 5 };
    const r = precificar_item(row, undefined, HOJE);
    expect(r.tipo).toBe("pendente");
    if (r.tipo === "pendente") expect(r.pendente.motivo).toBe("sem_preco");
  });

  it("T12 — mesma unidade (pç × pç) → ok, sem fator, subtotal = qty × preço", () => {
    const row: BomRow = { material: M_PCS, quantidade: 3 };
    const r = precificar_item(
      row,
      preco({ valor_centavos: 250, unidade_preco: "pç" }),
      HOJE,
    );
    expect(r.tipo).toBe("ok");
    if (r.tipo === "ok") {
      expect(r.item.fator_conversao_aplicado).toBeNull();
      expect(r.item.subtotal_centavos).toBe(750);
    }
  });

  it("T13 — unidade diferente sem fator → pendente conversao_indefinida", () => {
    const row: BomRow = { material: M_KG, quantidade: 10 };
    const r = precificar_item(
      row,
      preco({ material_id: 30, unidade_preco: "m", fator_conversao: null }),
      HOJE,
    );
    expect(r.tipo).toBe("pendente");
    if (r.tipo === "pendente") {
      expect(r.pendente.motivo).toBe("conversao_indefinida");
    }
  });

  it("T14 — preço R$/m, BOM em kg, fator 0,2125 → ok com conversão correta", () => {
    const row: BomRow = { material: M_KG, quantidade: 100 }; // 100 kg
    const r = precificar_item(
      row,
      preco({
        material_id: 30,
        valor_centavos: 500,
        unidade_preco: "m",
        fator_conversao: 0.2125,
      }),
      HOJE,
    );
    expect(r.tipo).toBe("ok");
    if (r.tipo === "ok") {
      // 100 kg × 0,2125 m/kg × R$ 5,00/m = R$ 106,25 = 10625 centavos
      expect(r.item.qty_convertida).toBeCloseTo(21.25, 5);
      expect(r.item.subtotal_centavos).toBe(10625);
      expect(r.item.fator_conversao_aplicado).toBe(0.2125);
    }
  });

  it("T15 — validade futura → ok", () => {
    const row: BomRow = { material: M_PCS, quantidade: 1 };
    const r = precificar_item(row, preco({ validade: "2026-12-31" }), HOJE);
    if (r.tipo === "ok") expect(r.item.validade_status).toBe("ok");
  });

  it("T16 — validade passada → vencido (mas item entra)", () => {
    const row: BomRow = { material: M_PCS, quantidade: 1 };
    const r = precificar_item(row, preco({ validade: "2025-12-31" }), HOJE);
    expect(r.tipo).toBe("ok");
    if (r.tipo === "ok") expect(r.item.validade_status).toBe("vencido");
  });

  it("T17 — validade null → sem_validade", () => {
    const row: BomRow = { material: M_PCS, quantidade: 1 };
    const r = precificar_item(row, preco({ validade: null }), HOJE);
    if (r.tipo === "ok") expect(r.item.validade_status).toBe("sem_validade");
  });

  it("T18 — origem 'meu' propaga", () => {
    const row: BomRow = { material: M_PCS, quantidade: 1 };
    const r = precificar_item(row, preco({ origem: "meu" }), HOJE);
    if (r.tipo === "ok") expect(r.item.origem_preco).toBe("meu");
  });

  it("T19 — quantidade zero → pendente qty_invalida", () => {
    const row: BomRow = { material: M_PCS, quantidade: 0 };
    const r = precificar_item(row, preco(), HOJE);
    expect(r.tipo).toBe("pendente");
    if (r.tipo === "pendente") expect(r.pendente.motivo).toBe("qty_invalida");
  });

  it("T19b — quantidade negativa → pendente qty_invalida", () => {
    const row: BomRow = { material: M_PCS, quantidade: -5 };
    const r = precificar_item(row, preco(), HOJE);
    expect(r.tipo).toBe("pendente");
    if (r.tipo === "pendente") expect(r.pendente.motivo).toBe("qty_invalida");
  });

  it("T20 — subtotal arredonda half-even (0,5 centavo)", () => {
    // 0,5 × 5 = 2,5 → arredonda para 2 (par mais próximo)
    const row: BomRow = { material: M_PCS, quantidade: 0.5 };
    const r = precificar_item(row, preco({ valor_centavos: 5 }), HOJE);
    if (r.tipo === "ok") expect(r.item.subtotal_centavos).toBe(2);
  });

  it("T21 — descrição e unidade são snapshot do momento do cálculo", () => {
    const row: BomRow = {
      material: { ...M_PCS, descricao: "Parafuso v1" },
      quantidade: 1,
    };
    const r = precificar_item(row, preco(), HOJE);
    if (r.tipo === "ok") {
      expect(r.item.descricao_snapshot).toBe("Parafuso v1");
      expect(r.item.unidade_snapshot).toBe("pç");
    }
  });
});
