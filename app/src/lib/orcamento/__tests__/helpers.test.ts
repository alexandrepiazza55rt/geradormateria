import { describe, expect, it } from "vitest";
import type { Estrutura, ObraItem } from "../../../types";
import { calcular_estruturas_da_obra } from "../helpers";

function est(id: string, tipo: string): Estrutura {
  return {
    id,
    tipo,
    condutor: null,
    tensao_kv: 13.8,
    nominal_kv: 13.8,
    fases: 3,
    poste_ref: "DT-10/150",
    base_bom: {},
    postes: [],
    categoria: "Trifásico 13,8 kV",
  };
}

function item(estruturaId: string, quantidade: number): ObraItem {
  return { key: `L${estruturaId}`, estruturaId, posteIdx: 0, quantidade };
}

describe("calcular_estruturas_da_obra", () => {
  it("H1 — obra vazia → array vazio", () => {
    expect(calcular_estruturas_da_obra([], new Map())).toEqual([]);
  });

  it("H2 — 2 itens do mesmo tipo → agrega somando qty", () => {
    const estruturas = new Map<string, Estrutura>([
      ["e1", est("e1", "U1")],
      ["e2", est("e2", "U1")],
    ]);
    const result = calcular_estruturas_da_obra(
      [item("e1", 3), item("e2", 2)],
      estruturas,
    );
    expect(result).toEqual([{ tipo: "U1", quantidade: 5 }]);
  });

  it("H3 — itens com qty<=0 ou estrutura inexistente são ignorados", () => {
    const estruturas = new Map<string, Estrutura>([
      ["e1", est("e1", "U1")],
      ["e2", est("e2", "N3-CFu")],
    ]);
    const result = calcular_estruturas_da_obra(
      [
        item("e1", 4),       // ok
        item("e2", 0),       // qty zero → ignora
        item("e2", -3),      // qty negativa → ignora
        item("inexistente", 5), // estrutura ausente → ignora
      ],
      estruturas,
    );
    expect(result).toEqual([{ tipo: "U1", quantidade: 4 }]);
  });
});
