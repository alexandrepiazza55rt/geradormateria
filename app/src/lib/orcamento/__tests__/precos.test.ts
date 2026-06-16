import { describe, expect, it } from "vitest";
import type { Material } from "../../../types";
import type { PrecoMaterial } from "../types";
import {
  type FiltrosPrecos,
  indexar_precos,
  listar_materiais_com_status,
  resolver_preco,
} from "../precos";

const HOJE = new Date("2026-06-13T12:00:00Z");

function preco(over: Partial<PrecoMaterial>): PrecoMaterial {
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

const filtros_padrao: FiltrosPrecos = {
  busca: "",
  categoria: null,
  origem: "todos",
  validade: "todos",
  apenas_obra: null,
  mostrar_todos_catalogo: true,
};

describe("resolver_preco", () => {
  it("P1 — sem oficial nem override → null", () => {
    const r = resolver_preco(1, new Map(), new Map());
    expect(r).toEqual({
      preco: null,
      origem_efetiva: null,
      tem_override: false,
    });
  });

  it("P2 — só oficial → origem 'oficial', sem override", () => {
    const oficiais = indexar_precos([
      preco({ material_id: 1, origem: "oficial" }),
    ]);
    const r = resolver_preco(1, oficiais, new Map());
    expect(r.origem_efetiva).toBe("oficial");
    expect(r.tem_override).toBe(false);
  });

  it("P3 — só override → origem 'meu' + tem_override", () => {
    const overrides = indexar_precos([
      preco({ material_id: 1, origem: "meu", valor_centavos: 5000 }),
    ]);
    const r = resolver_preco(1, new Map(), overrides);
    expect(r.origem_efetiva).toBe("meu");
    expect(r.tem_override).toBe(true);
    expect(r.preco?.valor_centavos).toBe(5000);
  });

  it("P4 — com ambos: override ganha", () => {
    const oficiais = indexar_precos([
      preco({ material_id: 1, valor_centavos: 1000, origem: "oficial" }),
    ]);
    const overrides = indexar_precos([
      preco({ material_id: 1, valor_centavos: 5000, origem: "meu" }),
    ]);
    const r = resolver_preco(1, oficiais, overrides);
    expect(r.preco?.valor_centavos).toBe(5000);
    expect(r.origem_efetiva).toBe("meu");
    expect(r.tem_override).toBe(true);
  });
});

describe("listar_materiais_com_status", () => {
  const materiais = [
    mat(1, { descricao: "Parafuso de 100mm" }),
    mat(2, { descricao: "Cabo Triplex 10mm²" }),
    mat(3, { descricao: "Trafo monofásico 5kVA" }),
    mat(4, { descricao: "Isolador Pilar" }),
    mat(99, { descricao: "", unidade: "" }),
    mat(100, { descricao: "", unidade: "" }),
  ];
  const usados = new Set([1, 2, 3, 4]);

  it("P5 — filtro 'sem_preco' retorna só sem preço", () => {
    const oficiais = indexar_precos([preco({ material_id: 1 })]);
    const result = listar_materiais_com_status(
      materiais,
      usados,
      oficiais,
      new Map(),
      HOJE,
      { ...filtros_padrao, origem: "sem_preco" },
    );
    expect(result.length).toBe(3);
    expect(result.every((r) => r.preco_resolvido.preco === null)).toBe(true);
  });

  it("P6 — busca insensível a acento ('monofasico' casa 'monofásico')", () => {
    const result = listar_materiais_com_status(
      materiais,
      usados,
      new Map(),
      new Map(),
      HOJE,
      { ...filtros_padrao, busca: "monofasico" },
    );
    expect(result.length).toBe(1);
    expect(result[0].material.id).toBe(3);
  });

  it("P7 — filtro validade 'vencido' filtra em relação a hoje", () => {
    const oficiais = indexar_precos([
      preco({ material_id: 1, validade: "2025-01-01" }),  // vencido
      preco({ material_id: 2, validade: "2027-12-31" }),  // ok
      preco({ material_id: 3, validade: null }),          // sem_validade
    ]);
    const result = listar_materiais_com_status(
      materiais,
      usados,
      oficiais,
      new Map(),
      HOJE,
      { ...filtros_padrao, validade: "vencido" },
    );
    expect(result.length).toBe(1);
    expect(result[0].material.id).toBe(1);
  });

  it("P8 — oculta headers (descrição/unidade vazia)", () => {
    const result = listar_materiais_com_status(
      materiais,
      usados,
      new Map(),
      new Map(),
      HOJE,
      filtros_padrao,
    );
    expect(result.length).toBe(4);
    const ids = result.map((r) => r.material.id);
    expect(ids).not.toContain(99);
    expect(ids).not.toContain(100);
  });

  it("P9 — apenas_obra com IDs específicos retorna só esses", () => {
    const materiais_extra = [
      ...materiais,
      mat(30, { descricao: "Cabo Al 2 AWG" }),
      mat(249, { descricao: "Trafo 5kVA mono" }),
    ];
    const result = listar_materiais_com_status(
      materiais_extra,
      new Set([1, 30, 249]),
      new Map(),
      new Map(),
      HOJE,
      { ...filtros_padrao, apenas_obra: [1, 30, 249] },
    );
    expect(result.map((r) => r.material.id).sort((a, b) => a - b)).toEqual([1, 30, 249]);
  });

  it("P10 — apenas_obra combina com filtro de status + busca", () => {
    const materiais_extra = [
      ...materiais,
      mat(30, { descricao: "Cabo Al 2 AWG" }),
      mat(249, { descricao: "Trafo 5kVA mono" }),
    ];
    const oficiais = indexar_precos([preco({ material_id: 30 })]);
    const result = listar_materiais_com_status(
      materiais_extra,
      new Set([1, 30, 249]),
      oficiais,
      new Map(),
      HOJE,
      {
        ...filtros_padrao,
        apenas_obra: [1, 30, 249],
        origem: "sem_preco",
        busca: "trafo",
      },
    );
    expect(result.length).toBe(1);
    expect(result[0].material.id).toBe(249);
  });

  // Regressão: o filtro `apenas_obra` (vindo do botão "Cadastrar preços
  // pendentes") deve ignorar o "usados em BOM". Cobertura do bug reportado
  // pelo dono: orçamento salvo tem 6 pendentes; ao clicar em cadastrar, a
  // aba Preços abria vazia porque os IDs não estavam mais em
  // `usados_em_bom` (catálogo mudou desde o save).
  it("P11 — apenas_obra mostra IDs mesmo fora de usados_em_bom", () => {
    const materiais_extra = [
      ...materiais,
      mat(500, { descricao: "Material 500 (não está em nenhuma BOM)" }),
      mat(501, { descricao: "Material 501 (não está em nenhuma BOM)" }),
    ];
    const usados_vazio_dos_500 = new Set([1, 2, 3]); // 500 e 501 NÃO estão
    const result = listar_materiais_com_status(
      materiais_extra,
      usados_vazio_dos_500,
      new Map(),
      new Map(),
      HOJE,
      {
        ...filtros_padrao,
        apenas_obra: [500, 501],
        mostrar_todos_catalogo: false,   // padrão "só usados em BOM" deve ser ignorado
      },
    );
    expect(result.map((r) => r.material.id).sort((a, b) => a - b)).toEqual([500, 501]);
  });
});
