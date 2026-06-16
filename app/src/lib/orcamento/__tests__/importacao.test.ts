import { describe, expect, it } from "vitest";
import type { Material } from "../../../types";
import type { PrecoMaterial } from "../types";
import {
  analisar_csv,
  gerar_csv_overrides,
  gerar_csv_template,
  gerar_xlsx_overrides,
  parse_data,
  parse_valor_brl,
  xlsx_para_csv,
} from "../importacao";

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

function preco(over: Partial<PrecoMaterial>): PrecoMaterial {
  return {
    material_id: 1,
    valor_centavos: 1000,
    unidade_preco: "pç",
    fator_conversao: null,
    validade: null,
    fornecedor: null,
    origem: "meu",
    atualizado_em: "2026-01-01T00:00:00Z",
    categoria_perda_override: null,
    ...over,
  };
}

const CATALOG = new Map<number, Material>([
  [1, mat(1, { descricao: "Parafuso 100mm" })],
  [2, mat(2, { descricao: "Cabo Al CAA 2", unidade: "kg" })],
  [3, mat(3, { descricao: "Trafo 5kVA" })],
]);

// Pequenos helpers de parse (não fazem parte dos 18 testes, mas dão sanidade)
describe("parse_valor_brl", () => {
  it("pt-BR com milhares 1.234,56 → 1234.56", () => {
    expect(parse_valor_brl("1.234,56")).toBeCloseTo(1234.56);
  });
  it("US 1234.56 → 1234.56", () => {
    expect(parse_valor_brl("1234.56")).toBeCloseTo(1234.56);
  });
  it("'abc' → null", () => {
    expect(parse_valor_brl("abc")).toBeNull();
  });
});

describe("parse_data", () => {
  it("31/02/2026 → null (data inválida)", () => {
    expect(parse_data("31/02/2026")).toBeNull();
  });
  it("DD/MM/YY assume 20YY", () => {
    expect(parse_data("31/12/26")).toBe("2026-12-31");
  });
});

describe("analisar_csv", () => {
  it("C01 — cabeçalho padrão + 1 linha válida → criar", () => {
    const csv = `material_id,valor_brl,unidade_preco
1,10.00,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(1);
    expect(r.operacoes[0].tipo).toBe("criar");
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(1000);
  });

  it("C02 — separador ';' auto-detectado", () => {
    const csv = `material_id;valor_brl;unidade_preco\n1;15.00;pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(1);
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(1500);
  });

  it("C03 — valor pt-BR '1.234,56' → 123456 centavos", () => {
    // separador ';' para vírgula ficar disponível como decimal
    const csv = `material_id;valor_brl;unidade_preco\n1;1.234,56;pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(123456);
  });

  it("C04 — valor '1234.56' (US) → 123456 centavos", () => {
    const csv = `material_id,valor_brl,unidade_preco\n1,1234.56,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(123456);
  });

  it("C05 — data ISO 2026-12-31 → preserva", () => {
    const csv = `material_id,valor_brl,unidade_preco,validade\n1,1.00,pç,2026-12-31`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.operacoes[0].preco_proposto?.validade).toBe("2026-12-31");
  });

  it("C06 — data DD/MM/YYYY '31/12/2026' → normaliza para ISO", () => {
    // separador ';' para vírgula em ISO não ser problema (não tem nesse caso)
    const csv = `material_id;valor_brl;unidade_preco;validade\n1;1,00;pç;31/12/2026`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.operacoes[0].preco_proposto?.validade).toBe("2026-12-31");
  });

  it("C07 — material_id ausente → erro", () => {
    const csv = `material_id,valor_brl,unidade_preco\n,5.00,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("material_id");
  });

  it("C08 — material_id fora do catálogo → erro", () => {
    const csv = `material_id,valor_brl,unidade_preco\n9999,5.00,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("9999");
  });

  it("C09 — valor 'abc' inválido → erro", () => {
    const csv = `material_id,valor_brl,unidade_preco\n1,abc,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("valor_brl");
  });

  it("C10 — unidade_preco 'xx' → erro", () => {
    const csv = `material_id,valor_brl,unidade_preco\n1,1.00,xx`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("unidade_preco");
  });

  it("C11 — unidade diferente sem fator → erro conversao_indefinida", () => {
    // material 2 está em kg; cadastrar com unidade_preco m sem fator
    const csv = `material_id,valor_brl,unidade_preco\n2,10.00,m`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("fator_conversao obrigatório");
  });

  it("C12 — categoria_perda_override 'lixo' → erro", () => {
    const csv = `material_id,valor_brl,unidade_preco,categoria_perda_override\n1,1.00,pç,lixo`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.erro).toBe(1);
    expect(r.operacoes[0].erro).toContain("categoria_perda_override");
  });

  it("C13 — valor vazio + tem override → remover", () => {
    const overrides = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1 })],
    ]);
    const csv = `material_id,valor_brl,unidade_preco\n1,,`;
    const r = analisar_csv(csv, CATALOG, overrides);
    expect(r.resumo.remover).toBe(1);
    expect(r.operacoes[0].tipo).toBe("remover");
  });

  it("C14 — linha idêntica ao override existente → ignorar", () => {
    const overrides = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 1000, unidade_preco: "pç" })],
    ]);
    const csv = `material_id,valor_brl,unidade_preco\n1,10.00,pç`;
    const r = analisar_csv(csv, CATALOG, overrides);
    expect(r.resumo.ignorar).toBe(1);
    expect(r.operacoes[0].tipo).toBe("ignorar");
  });

  it("C15 — linha com 1 campo diff → atualizar com diff listado", () => {
    const overrides = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 1000, unidade_preco: "pç" })],
    ]);
    // muda só o valor
    const csv = `material_id,valor_brl,unidade_preco\n1,15.00,pç`;
    const r = analisar_csv(csv, CATALOG, overrides);
    expect(r.resumo.atualizar).toBe(1);
    expect(r.operacoes[0].tipo).toBe("atualizar");
    expect(r.operacoes[0].diff?.length).toBe(1);
    expect(r.operacoes[0].diff?.[0].campo).toBe("valor");
  });

  it("C16 — round-trip: parse(unparse(overrides)) preserva os campos relevantes", () => {
    const original = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 2500, unidade_preco: "pç", validade: "2027-06-30", fornecedor: "ACME" })],
      [2, preco({ material_id: 2, valor_centavos: 8000, unidade_preco: "m", fator_conversao: 0.2125, categoria_perda_override: "cabo" })],
    ]);
    const csv = gerar_csv_overrides(original, CATALOG);
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(2);
    const por_id = new Map(r.operacoes.map((o) => [o.material_id, o]));
    expect(por_id.get(1)?.preco_proposto?.valor_centavos).toBe(2500);
    expect(por_id.get(1)?.preco_proposto?.validade).toBe("2027-06-30");
    expect(por_id.get(1)?.preco_proposto?.fornecedor).toBe("ACME");
    expect(por_id.get(2)?.preco_proposto?.valor_centavos).toBe(8000);
    expect(por_id.get(2)?.preco_proposto?.unidade_preco).toBe("m");
    expect(por_id.get(2)?.preco_proposto?.fator_conversao).toBeCloseTo(0.2125);
    expect(por_id.get(2)?.preco_proposto?.categoria_perda_override).toBe("cabo");
  });

  it("C17 — XLSX simples → mesmo resultado que CSV equivalente", () => {
    const xlsx = gerar_xlsx_overrides(
      new Map([[1, preco({ material_id: 1, valor_centavos: 750, unidade_preco: "pç" })]]),
      CATALOG,
    );
    const { csv, avisos } = xlsx_para_csv(xlsx);
    expect(avisos).toEqual([]); // 1 planilha só
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(1);
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(750);
  });

  it("C18 — round-trip XLSX: gerar → ler → analisar preserva os campos", () => {
    const original = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 4200, unidade_preco: "pç" })],
      [3, preco({ material_id: 3, valor_centavos: 950000, unidade_preco: "pç", validade: "2028-01-15" })],
    ]);
    const xlsx = gerar_xlsx_overrides(original, CATALOG);
    const { csv } = xlsx_para_csv(xlsx);
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(2);
    const por_id = new Map(r.operacoes.map((o) => [o.material_id, o]));
    expect(por_id.get(1)?.preco_proposto?.valor_centavos).toBe(4200);
    expect(por_id.get(3)?.preco_proposto?.valor_centavos).toBe(950000);
    expect(por_id.get(3)?.preco_proposto?.validade).toBe("2028-01-15");
  });

  it("extra — header inválido (faltando coluna obrigatória) → erro global, sem operações", () => {
    const csv = `material_id,unidade_preco\n1,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.operacoes).toEqual([]);
    expect(r.avisos[0]).toContain("valor_brl");
  });

  it("extra — duplicidade de material_id no CSV → última vence + aviso", () => {
    const csv = `material_id,valor_brl,unidade_preco\n1,5.00,pç\n1,8.00,pç`;
    const r = analisar_csv(csv, CATALOG, new Map());
    expect(r.resumo.criar).toBe(1);
    expect(r.operacoes[0].preco_proposto?.valor_centavos).toBe(800);
    expect(r.avisos.some((a) => a.includes("duplicado"))).toBe(true);
  });

  it("extra — template com pré-preenchimento usa override > oficial", () => {
    const oficiais = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 1000, origem: "oficial" })],
    ]);
    const overrides = new Map<number, PrecoMaterial>([
      [1, preco({ material_id: 1, valor_centavos: 1500, origem: "meu" })],
    ]);
    const csv = gerar_csv_template(CATALOG, new Set([1, 2, 3]), oficiais, overrides, true);
    const r = analisar_csv(csv, CATALOG, new Map());
    const op1 = r.operacoes.find((o) => o.material_id === 1);
    expect(op1?.preco_proposto?.valor_centavos).toBe(1500);
  });

  it("extra — template sem pré-preenchimento deixa valor vazio (ignorar/sem ação)", () => {
    const csv = gerar_csv_template(
      CATALOG,
      new Set([1, 2, 3]),
      new Map(),
      new Map(),
      false,
    );
    const r = analisar_csv(csv, CATALOG, new Map());
    // material 2 está em kg, sem preço cadastrado → ignorar
    expect(r.resumo.ignorar).toBe(3);
    expect(r.resumo.criar).toBe(0);
  });
});
