import { describe, expect, it } from "vitest";
import type { BomRow, Material } from "../../../types";
import type { ConfigOrcamento, PrecoMaterial } from "../types";
import { PERDA_DEFAULT, categoria_de_material } from "../defaults";
import { montar_orcamento } from "../motor";

const HOJE = new Date("2026-06-13T12:00:00Z");

const M_PARAFUSO: Material = {
  id: 1, cod_sap: "X", cod_lider7: "",
  descricao: "Parafuso de cabeça quadrada", unidade: "pç",
};
const M_CABO: Material = {
  id: 30, cod_sap: "X", cod_lider7: "",
  descricao: "Cabo de aluminio nu 2 CAA - AWG", unidade: "kg",
};
const M_TRAFO: Material = {
  id: 249, cod_sap: "X", cod_lider7: "",
  descricao: "Transformador monofásico - 13.8KV - 05KVA", unidade: "pç",
};
const M_ISOL: Material = {
  id: 135, cod_sap: "X", cod_lider7: "",
  descricao: "Isolador ancoragem bastão polimérico 15kv", unidade: "pç",
};
const M_HASTE: Material = {
  id: 134, cod_sap: "X", cod_lider7: "",
  descricao: "Haste de aterramento circular", unidade: "pç",
};

function precoBasico(material_id: number, valor: number): PrecoMaterial {
  return {
    material_id,
    valor_centavos: valor,
    unidade_preco: material_id === 30 ? "kg" : "pç",
    fator_conversao: null,
    validade: "2027-12-31",
    fornecedor: null,
    origem: "oficial",
    atualizado_em: "2026-01-01T00:00:00Z",
    categoria_perda_override: null,
  };
}

function configBase(over: Partial<ConfigOrcamento> = {}): ConfigOrcamento {
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

describe("montar_orcamento", () => {
  it("T22 — orçamento vazio (sem rows)", () => {
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.total_centavos).toBe(0);
    expect(orc.pendentes).toEqual([]);
    expect(orc.status).toBe("rascunho");
    expect(orc.versao).toBe(1);
    expect(orc.total_parcial).toBe(false);
  });

  it("T23 — só pendentes → total_parcial true, total 0", () => {
    const orc = montar_orcamento({
      rows: [{ material: M_PARAFUSO, quantidade: 5 }],
      precos: new Map(),
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.total_parcial).toBe(true);
    expect(orc.decomposicao.total_centavos).toBe(0);
    expect(orc.pendentes.length).toBe(1);
  });

  it("T24 — misto: ok + pendentes", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(1, precoBasico(1, 100));
    const orc = montar_orcamento({
      rows: [
        { material: M_PARAFUSO, quantidade: 3 }, // ok: R$ 3
        { material: M_TRAFO, quantidade: 1 },    // pendente
      ],
      precos,
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.itens.length).toBe(1);
    expect(orc.pendentes.length).toBe(1);
    expect(orc.total_parcial).toBe(true);
    expect(orc.decomposicao.subtotal_material_centavos).toBe(300);
  });

  it("T25 — perda categoria cabo (default 5%)", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, precoBasico(30, 1000)); // R$ 10/kg
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }], // 100 × 1000 = 100000 centavos
      precos,
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.subtotal_material_centavos).toBe(100000);
    expect(orc.decomposicao.perda_centavos).toBe(5000); // 5%
  });

  it("T26 — override de perda por material sobrescreve categoria", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, precoBasico(30, 1000));
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }],
      precos,
      config: configBase({
        perda: {
          default_por_categoria: { ...PERDA_DEFAULT },
          override_por_material: { 30: 8 }, // 8% sobrescreve cabo 5%
        },
      }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.perda_centavos).toBe(8000);
  });

  it("T27 — MO por tabela: U1 R$50×3 + N3-CFu R$80×2 = R$310", () => {
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config: configBase({
        mao_obra: {
          tipo: "tabela",
          tabela: { "U1": 5000, "N3-CFu": 8000 },
        },
      }),
      estruturas_da_obra: [
        { tipo: "U1", quantidade: 3 },
        { tipo: "N3-CFu", quantidade: 2 },
      ],
      hoje: HOJE,
    });
    expect(orc.decomposicao.mao_obra_centavos).toBe(31000);
  });

  it("T28 — MO como % material (10%)", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(1, precoBasico(1, 1000));
    const orc = montar_orcamento({
      rows: [{ material: M_PARAFUSO, quantidade: 10 }], // R$ 100
      precos,
      config: configBase({ mao_obra: { tipo: "pct_material", pct: 10 } }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.subtotal_material_centavos).toBe(10000);
    expect(orc.decomposicao.mao_obra_centavos).toBe(1000);
  });

  it("T29 — estrutura ausente da tabela MO → 0 daquele tipo + aviso global", () => {
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config: configBase({
        mao_obra: { tipo: "tabela", tabela: { "U1": 5000 } },
      }),
      estruturas_da_obra: [
        { tipo: "U1", quantidade: 1 },
        { tipo: "X-RARA", quantidade: 2 },
      ],
      hoje: HOJE,
    });
    expect(orc.decomposicao.mao_obra_centavos).toBe(5000);
    expect(orc.avisos_globais.length).toBe(1);
    expect(orc.avisos_globais[0]).toContain("X-RARA");
  });

  it("T30 — frete fixo entra integral", () => {
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config: configBase({ frete_centavos: 50000 }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.frete_centavos).toBe(50000);
    expect(orc.decomposicao.total_centavos).toBe(50000);
  });

  it("T31 — markup 25% sobre R$ 1000 → R$ 1250", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(249, precoBasico(249, 100000)); // R$ 1000
    const orc = montar_orcamento({
      rows: [{ material: M_TRAFO, quantidade: 1 }],
      precos,
      config: configBase({ margem: { tipo: "markup", pct: 25 } }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    // Trafo é equipamento_grande → perda 0%
    expect(orc.decomposicao.subtotal_material_centavos).toBe(100000);
    expect(orc.decomposicao.perda_centavos).toBe(0);
    expect(orc.decomposicao.base_para_margem_centavos).toBe(100000);
    expect(orc.decomposicao.margem_centavos).toBe(25000);
    expect(orc.decomposicao.total_centavos).toBe(125000);
  });

  it("T32 — margem 25% sobre R$ 1000 → R$ 1333,33", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(249, precoBasico(249, 100000));
    const orc = montar_orcamento({
      rows: [{ material: M_TRAFO, quantidade: 1 }],
      precos,
      config: configBase({ margem: { tipo: "margem", pct: 25 } }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    // 1000 / 0,75 = 1333,333... ≈ R$ 1333,33 → 133333 centavos
    expect(orc.decomposicao.total_centavos).toBe(133333);
    expect(orc.decomposicao.margem_centavos).toBe(33333);
  });

  it("T33 — margem 100% rejeitada (motor lança erro)", () => {
    expect(() =>
      montar_orcamento({
        rows: [],
        precos: new Map(),
        config: configBase({ margem: { tipo: "margem", pct: 100 } }),
        estruturas_da_obra: [],
        hoje: HOJE,
      }),
    ).toThrow();
  });

  it("T34 — ordem: subtotal+perda+MO+frete=base, margem sobre base", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, precoBasico(30, 1000)); // cabo R$10/kg → perda 5%
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }], // R$ 1000
      precos,
      config: configBase({
        mao_obra: { tipo: "pct_material", pct: 10 },
        frete_centavos: 5000,
        margem: { tipo: "markup", pct: 20 },
      }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.subtotal_material_centavos).toBe(100000);
    expect(orc.decomposicao.perda_centavos).toBe(5000);
    expect(orc.decomposicao.mao_obra_centavos).toBe(10000);
    expect(orc.decomposicao.frete_centavos).toBe(5000);
    expect(orc.decomposicao.base_para_margem_centavos).toBe(120000);
    expect(orc.decomposicao.margem_centavos).toBe(24000);
    expect(orc.decomposicao.total_centavos).toBe(144000);
  });

  it("T35 — config_snapshot é cópia imutável", () => {
    const config = configBase({ margem: { tipo: "markup", pct: 25 } });
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config,
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    config.margem.pct = 50;
    expect(orc.config_snapshot.margem.pct).toBe(25);
  });

  it("T36 — validade_orcamento = hoje + 30 dias", () => {
    const orc = montar_orcamento({
      rows: [],
      precos: new Map(),
      config: configBase({ validade_orcamento_dias: 30 }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.validade_orcamento).toBe("2026-07-13");
  });

  it("T37 — decomposição soma sem perder centavo", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, precoBasico(30, 1000));
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }],
      precos,
      config: configBase({
        mao_obra: { tipo: "pct_material", pct: 10 },
        frete_centavos: 5000,
        margem: { tipo: "markup", pct: 20 },
      }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    const d = orc.decomposicao;
    expect(
      d.subtotal_material_centavos +
        d.perda_centavos +
        d.mao_obra_centavos +
        d.frete_centavos,
    ).toBe(d.base_para_margem_centavos);
    expect(d.base_para_margem_centavos + d.margem_centavos).toBe(
      d.total_centavos,
    );
  });

  it("T38 — heurística de categoria de material", () => {
    expect(categoria_de_material(M_CABO)).toBe("cabo");
    expect(categoria_de_material(M_PARAFUSO)).toBe("fio_parafuso_conector");
    expect(categoria_de_material(M_TRAFO)).toBe("equipamento_grande");
    expect(categoria_de_material(M_ISOL)).toBe("cinta_isolador_mao_francesa");
    expect(categoria_de_material(M_HASTE)).toBe("outros");
  });

  it("T39 — determinismo: mesma input 2× = mesma output (exceto id e gerado_em)", () => {
    const make = () => ({
      rows: [{ material: M_PARAFUSO, quantidade: 5 }] as BomRow[],
      precos: new Map<number, PrecoMaterial>([[1, precoBasico(1, 250)]]),
      config: configBase({ margem: { tipo: "markup" as const, pct: 15 } }),
      estruturas_da_obra: [{ tipo: "U1", quantidade: 2 }],
      hoje: HOJE,
    });
    const a = montar_orcamento(make());
    const b = montar_orcamento(make());
    expect(a.itens).toEqual(b.itens);
    expect(a.decomposicao).toEqual(b.decomposicao);
    expect(a.pendentes).toEqual(b.pendentes);
    expect(a.config_snapshot).toEqual(b.config_snapshot);
    expect(a.id).not.toBe(b.id);
  });

  it("T40 — pendentes ordenados por descrição (pt-BR)", () => {
    const orc = montar_orcamento({
      rows: [
        { material: { ...M_TRAFO, descricao: "Z-último" }, quantidade: 1 },
        { material: { ...M_PARAFUSO, descricao: "A-primeiro" }, quantidade: 1 },
        { material: { ...M_CABO, descricao: "M-meio" }, quantidade: 1 },
      ],
      precos: new Map(),
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.pendentes.map((p) => p.descricao)).toEqual([
      "A-primeiro",
      "M-meio",
      "Z-último",
    ]);
  });

  it("T41 — categoria_perda_override no preço sobrepõe a heurística", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, {
      ...precoBasico(30, 1000),
      categoria_perda_override: "outros", // outros = 2%, não cabo (5%)
    });
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }],
      precos,
      config: configBase(),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.perda_centavos).toBe(2000);
  });

  it("T42 — precedência: override_por_material > preço.categoria_perda_override > heurística", () => {
    const precos = new Map<number, PrecoMaterial>();
    precos.set(30, {
      ...precoBasico(30, 1000),
      categoria_perda_override: "outros", // 2%
    });
    const orc = montar_orcamento({
      rows: [{ material: M_CABO, quantidade: 100 }],
      precos,
      config: configBase({
        perda: {
          default_por_categoria: { ...PERDA_DEFAULT },
          override_por_material: { 30: 10 }, // 10% — ganha
        },
      }),
      estruturas_da_obra: [],
      hoje: HOJE,
    });
    expect(orc.decomposicao.perda_centavos).toBe(10000);
  });
});
