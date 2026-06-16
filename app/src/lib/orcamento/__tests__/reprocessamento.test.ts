import { describe, expect, it } from "vitest";
import type { Material } from "../../../types";
import type {
  ConfigOrcamento,
  ItemOrcamentoSnapshot,
  ItemPendente,
  Orcamento,
  PrecoMaterial,
} from "../types";
import {
  contar_pendentes_incorporaveis,
  reprocessar_orcamento_com_precos_atualizados,
} from "../reprocessamento";

const HOJE = new Date("2026-06-13T12:00:00Z");

function mat(id: number, descricao = `M${id}`, unidade = "pç"): Material {
  return {
    id,
    cod_sap: String(id),
    cod_lider7: "",
    descricao,
    unidade,
    categoria: "C1",
  };
}

function preco(material_id: number, valor_centavos = 1000): PrecoMaterial {
  return {
    material_id,
    valor_centavos,
    unidade_preco: "pç",
    fator_conversao: null,
    validade: null,
    fornecedor: null,
    origem: "oficial",
    atualizado_em: "2026-06-13T00:00:00Z",
    categoria_perda_override: null,
  };
}

function pendente(material_id: number, qty = 1, motivo: ItemPendente["motivo"] = "sem_preco"): ItemPendente {
  return {
    material_id,
    descricao: `M${material_id}`,
    unidade_material: "pç",
    qty,
    motivo,
  };
}

function snap(id: number, qty: number, valor: number): ItemOrcamentoSnapshot {
  return {
    material_id: id,
    descricao_snapshot: `M${id}`,
    unidade_snapshot: "pç",
    unidade_preco: "pç",
    qty,
    qty_convertida: qty,
    fator_conversao_aplicado: null,
    preco_unit_centavos: valor,
    subtotal_centavos: qty * valor,
    origem_preco: "oficial",
    validade_status: "sem_validade",
  };
}

const CONFIG: ConfigOrcamento = {
  perda: {
    default_por_categoria: {
      cabo: 0,
      fio_parafuso_conector: 0,
      cinta_isolador_mao_francesa: 0,
      equipamento_grande: 0,
      outros: 0,
    },
    override_por_material: {},
  },
  mao_obra: { tipo: "pct_material", pct: 0 },
  frete_centavos: 0,
  margem: { tipo: "markup", pct: 0 },
  validade_preco_dias: 60,
  validade_orcamento_dias: 30,
};

function orc(itens: ItemOrcamentoSnapshot[], pendentes: ItemPendente[]): Orcamento {
  const subtotal = itens.reduce((s, i) => s + i.subtotal_centavos, 0);
  return {
    id: "o1",
    gerado_em: "2026-06-13T00:00:00Z",
    validade_orcamento: "2026-07-13",
    status: "rascunho",
    versao: 1,
    itens,
    pendentes,
    decomposicao: {
      subtotal_material_centavos: subtotal,
      perda_centavos: 0,
      mao_obra_centavos: 0,
      frete_centavos: 0,
      base_para_margem_centavos: subtotal,
      margem_centavos: 0,
      total_centavos: subtotal,
    },
    total_parcial: pendentes.length > 0,
    config_snapshot: CONFIG,
    avisos_globais: [],
  };
}

describe("reprocessar_orcamento_com_precos_atualizados", () => {
  it("RP1 — 3 pendentes, 2 ganham preço → vira 2 itens + 1 pendente", () => {
    const orcamento = orc([snap(10, 5, 100)], [
      pendente(20, 2),
      pendente(21, 3),
      pendente(22, 1), // continua sem preço
    ]);
    const materiais = new Map([[20, mat(20)], [21, mat(21)], [22, mat(22)]]);
    const precos = new Map<number, PrecoMaterial>([
      [20, preco(20, 50)],
      [21, preco(21, 70)],
      // 22 NÃO tem preço
    ]);

    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento, precos_efetivos: precos, materiais, hoje: HOJE,
    });

    expect(r.incorporados).toBe(2);
    expect(r.ainda_pendentes).toBe(1);
    expect(r.orcamento_novo.itens.length).toBe(3);          // 1 antigo + 2 novos
    expect(r.orcamento_novo.pendentes.length).toBe(1);
    expect(r.orcamento_novo.pendentes[0].material_id).toBe(22);
    expect(r.orcamento_novo.total_parcial).toBe(true);     // ainda tem pendente
    // total: 500 (antigo) + 100 (20: 2x50) + 210 (21: 3x70) = 810
    expect(r.orcamento_novo.decomposicao.total_centavos).toBe(810);
  });

  it("RP2 — todos os pendentes ganham preço → total_parcial fica false", () => {
    const orcamento = orc([], [pendente(1, 2), pendente(2, 1)]);
    const materiais = new Map([[1, mat(1)], [2, mat(2)]]);
    const precos = new Map<number, PrecoMaterial>([
      [1, preco(1, 100)],
      [2, preco(2, 200)],
    ]);

    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento, precos_efetivos: precos, materiais, hoje: HOJE,
    });

    expect(r.incorporados).toBe(2);
    expect(r.ainda_pendentes).toBe(0);
    expect(r.orcamento_novo.total_parcial).toBe(false);
    expect(r.orcamento_novo.decomposicao.total_centavos).toBe(400);
  });

  it("RP3 — nenhum preço novo → idempotente, devolve original sem alterar", () => {
    const orcamento = orc([snap(1, 1, 100)], [pendente(2, 5)]);
    const materiais = new Map([[2, mat(2)]]);
    const precos = new Map<number, PrecoMaterial>();

    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento, precos_efetivos: precos, materiais, hoje: HOJE,
    });

    expect(r.incorporados).toBe(0);
    expect(r.ainda_pendentes).toBe(1);
    expect(r.orcamento_novo).toBe(orcamento);     // mesma referência (idempotente)
    expect(r.total_antes_centavos).toBe(r.total_depois_centavos);
  });

  it("RP4 — qty_invalida nunca vira item, mesmo com preço cadastrado", () => {
    const orcamento = orc([], [pendente(1, 0, "qty_invalida")]);
    const materiais = new Map([[1, mat(1)]]);
    const precos = new Map<number, PrecoMaterial>([[1, preco(1, 100)]]);

    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento, precos_efetivos: precos, materiais, hoje: HOJE,
    });

    expect(r.incorporados).toBe(0);
    expect(r.ainda_pendentes).toBe(1);
    expect(r.orcamento_novo.pendentes[0].motivo).toBe("qty_invalida");
  });

  it("RP5 — preço cadastrado em unidade diferente SEM fator → não incorpora (segue pendente)", () => {
    const orcamento = orc([], [pendente(1, 1)]);
    const m = mat(1, "Cabo CAA 2 AWG", "m");
    const materiais = new Map([[1, m]]);
    const p: PrecoMaterial = {
      material_id: 1,
      valor_centavos: 1000,
      unidade_preco: "kg",
      fator_conversao: null,
      validade: null,
      fornecedor: null,
      origem: "oficial",
      atualizado_em: "2026-06-13T00:00:00Z",
      categoria_perda_override: null,
    };
    const precos = new Map<number, PrecoMaterial>([[1, p]]);

    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento, precos_efetivos: precos, materiais, hoje: HOJE,
    });

    // O que importa pra UI: NÃO incorporou e segue pendente. O motivo
    // exato (sem_preco vs conversao_indefinida) depende da fonte da
    // pendência — não é o que queremos amarrar neste teste.
    expect(r.incorporados).toBe(0);
    expect(r.ainda_pendentes).toBe(1);
    expect(r.orcamento_novo.itens.length).toBe(0);
  });
});

describe("contar_pendentes_incorporaveis", () => {
  it("RP6 — conta sem alterar o orçamento", () => {
    const orcamento = orc([], [pendente(1), pendente(2), pendente(3)]);
    const materiais = new Map([[1, mat(1)], [2, mat(2)], [3, mat(3)]]);
    const precos = new Map<number, PrecoMaterial>([
      [1, preco(1, 100)],
      [2, preco(2, 200)],
      // 3 sem preço
    ]);
    expect(contar_pendentes_incorporaveis(orcamento, precos, materiais, HOJE)).toBe(2);
    // Orçamento NÃO foi alterado
    expect(orcamento.pendentes.length).toBe(3);
  });
});
