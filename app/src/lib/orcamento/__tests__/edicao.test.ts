import { describe, expect, it } from "vitest";
import type { Material } from "../../../types";
import type {
  ConfigOrcamento,
  ItemOrcamentoSnapshot,
} from "../types";
import {
  criar_item_do_catalogo,
  criar_item_manual,
  editar_preco_item,
  editar_qty_item,
  eh_item_manual,
  recalcular_decomposicao_de_itens,
} from "../edicao";
import { PERDA_DEFAULT } from "../defaults";

function snap(over: Partial<ItemOrcamentoSnapshot>): ItemOrcamentoSnapshot {
  return {
    material_id: 1,
    descricao_snapshot: "Parafuso",
    unidade_snapshot: "pç",
    unidade_preco: "pç",
    qty: 10,
    qty_convertida: 10,
    fator_conversao_aplicado: null,
    preco_unit_centavos: 250,
    subtotal_centavos: 2500,
    origem_preco: "oficial",
    validade_status: "ok",
    ...over,
  };
}

function cfg(over: Partial<ConfigOrcamento> = {}): ConfigOrcamento {
  return {
    perda: {
      default_por_categoria: { ...PERDA_DEFAULT },
      override_por_material: {},
    },
    mao_obra: { tipo: "pct_material", pct: 0 },
    frete_centavos: 0,
    margem: { tipo: "markup", pct: 0 },
    validade_preco_dias: 60,
    validade_orcamento_dias: 30,
    ...over,
  };
}

function mat(id: number, over: Partial<Material> = {}): Material {
  return {
    id,
    cod_sap: `S${id}`,
    cod_lider7: "",
    descricao: `Material ${id}`,
    unidade: "pç",
    categoria: "C1",
    ...over,
  };
}

describe("editar item", () => {
  it("E01 — editar_qty atualiza qty e recalcula subtotal", () => {
    const item = snap({ qty: 10, preco_unit_centavos: 100, subtotal_centavos: 1000 });
    const r = editar_qty_item(item, 7);
    expect(r.qty).toBe(7);
    expect(r.qty_convertida).toBe(7);
    expect(r.subtotal_centavos).toBe(700);
  });

  it("E02 — editar_preco atualiza preço e recalcula subtotal", () => {
    const item = snap({
      qty: 5,
      qty_convertida: 5,
      preco_unit_centavos: 200,
      subtotal_centavos: 1000,
    });
    const r = editar_preco_item(item, 350);
    expect(r.preco_unit_centavos).toBe(350);
    expect(r.subtotal_centavos).toBe(1750);
  });
});

describe("criar item", () => {
  it("E03 — criar_item_manual gera snapshot com material_id negativo único", () => {
    const a = criar_item_manual({
      descricao: "Taxa de instalação",
      unidade: "und",
      qty: 1,
      preco_centavos: 50000,
    });
    expect(a.material_id).toBeLessThan(0);
    expect(eh_item_manual(a.material_id)).toBe(true);
    expect(a.subtotal_centavos).toBe(50000);
    expect(a.origem_preco).toBe("meu");

    const b = criar_item_manual({
      descricao: "Outro item",
      unidade: "pç",
      qty: 1,
      preco_centavos: 100,
    });
    expect(b.material_id).not.toBe(a.material_id);
  });

  it("E04 — criar_item_do_catalogo com preço e mesma unidade → ok", () => {
    const r = criar_item_do_catalogo({
      material: mat(10, { unidade: "pç", descricao: "X" }),
      qty: 5,
      preco: { valor_centavos: 200, unidade_preco: "pç", fator_conversao: null, origem: "oficial" },
    });
    expect(r.tipo).toBe("ok");
    if (r.tipo === "ok") {
      expect(r.item.subtotal_centavos).toBe(1000);
      expect(r.item.fator_conversao_aplicado).toBeNull();
    }
  });

  it("E05 — criar_item_do_catalogo sem preço → pendente sem_preco", () => {
    const r = criar_item_do_catalogo({
      material: mat(11),
      qty: 5,
      preco: undefined,
    });
    expect(r.tipo).toBe("pendente");
    if (r.tipo === "pendente") expect(r.pendente.motivo).toBe("sem_preco");
  });
});

describe("recalcular_decomposicao_de_itens", () => {
  it("E06 — soma subtotais + aplica perda 5% em material categorizado como cabo", () => {
    const itens = [
      snap({
        material_id: 30,
        descricao_snapshot: "Cabo Al CAA 2 AWG",
        unidade_snapshot: "kg",
        subtotal_centavos: 100000,
      }),
    ];
    const r = recalcular_decomposicao_de_itens({
      itens,
      config: cfg(),
      desconto_pct: 0,
      mao_obra_original_centavos: 0,
    });
    expect(r.subtotal_material_centavos).toBe(100000);
    expect(r.perda_centavos).toBe(5000);
  });

  it("E07 — aplica margem markup 25% sobre a base", () => {
    const itens = [
      snap({ material_id: 249, descricao_snapshot: "Trafo", subtotal_centavos: 100000 }),
    ];
    const r = recalcular_decomposicao_de_itens({
      itens,
      config: cfg({ margem: { tipo: "markup", pct: 25 } }),
      desconto_pct: 0,
      mao_obra_original_centavos: 0,
    });
    // Trafo = equipamento_grande, perda 0%
    expect(r.base_para_margem_centavos).toBe(100000);
    expect(r.margem_centavos).toBe(25000);
    expect(r.total_centavos).toBe(125000);
    expect(r.desconto_centavos).toBe(0);
  });

  it("E08 — aplica desconto global % depois da margem", () => {
    const itens = [
      snap({ material_id: 249, descricao_snapshot: "Trafo", subtotal_centavos: 100000 }),
    ];
    const r = recalcular_decomposicao_de_itens({
      itens,
      config: cfg({ margem: { tipo: "markup", pct: 25 } }),
      desconto_pct: 10,
      mao_obra_original_centavos: 0,
    });
    // base 100k + margem 25k = 125k; desconto 10% = 12.500 → total 112.500
    expect(r.desconto_centavos).toBe(12500);
    expect(r.total_centavos).toBe(112500);
  });

  it("E09 — MO tipo 'tabela' mantém o valor original (não recalcula)", () => {
    const itens = [snap({ subtotal_centavos: 50000 })];
    const r = recalcular_decomposicao_de_itens({
      itens,
      config: cfg({ mao_obra: { tipo: "tabela", tabela: {} } }),
      desconto_pct: 0,
      mao_obra_original_centavos: 30000,   // valor congelado
    });
    expect(r.mao_obra_centavos).toBe(30000);
  });

  it("E10 — MO tipo 'pct_material' recalcula sobre o subtotal atual (ignora original)", () => {
    const itens = [snap({ subtotal_centavos: 50000 })];
    const r = recalcular_decomposicao_de_itens({
      itens,
      config: cfg({ mao_obra: { tipo: "pct_material", pct: 20 } }),
      desconto_pct: 0,
      mao_obra_original_centavos: 999999,   // ignorado neste tipo
    });
    expect(r.mao_obra_centavos).toBe(10000);   // 20% de 50.000
  });
});
