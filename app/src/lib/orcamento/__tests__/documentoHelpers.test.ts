import { describe, expect, it } from "vitest";
import type { Material } from "../../../types";
import type { ObraMeta } from "../../../store";
import type {
  ItemOrcamentoSnapshot,
  ItemPendente,
  Orcamento,
} from "../types";
import {
  gerar_numero_orcamento,
  preparar_linhas_documento,
  type DadosDocumento,
} from "../documentoHelpers";
import type { StorageBackend } from "../storage";

function makeStorage(): StorageBackend & { _store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    _store: store,
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

const META: ObraMeta = {
  obra: "Obra Teste",
  endereco: "Rua A, 100",
  municipio: "Cidade X",
  responsavel: "Eng. Y",
};

const DADOS: DadosDocumento = {
  numero: "ORC-2026-06-13-001",
  versao: 1,
  condicoes_pagamento: "30/60/90 dd",
  prazo_execucao: "30 dias",
  status: "rascunho",
};

function mat(id: number, over: Partial<Material> = {}): Material {
  return {
    id, cod_sap: `S${id}`, cod_lider7: "", descricao: `Material ${id}`,
    unidade: "pç", categoria: "C1", ...over,
  };
}

function snapshot(over: Partial<ItemOrcamentoSnapshot>): ItemOrcamentoSnapshot {
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

function pendente(over: Partial<ItemPendente>): ItemPendente {
  return {
    material_id: 999,
    descricao: "Item pendente",
    unidade_material: "pç",
    qty: 3,
    motivo: "sem_preco",
    ...over,
  };
}

function orc(over: Partial<Orcamento> = {}): Orcamento {
  return {
    id: "test",
    gerado_em: "2026-06-13T12:00:00.000Z",
    validade_orcamento: "2026-07-13",
    status: "rascunho",
    versao: 1,
    itens: [],
    pendentes: [],
    decomposicao: {
      subtotal_material_centavos: 0,
      perda_centavos: 0,
      mao_obra_centavos: 0,
      frete_centavos: 0,
      base_para_margem_centavos: 0,
      margem_centavos: 0,
      total_centavos: 0,
    },
    total_parcial: false,
    config_snapshot: {
      perda: {
        default_por_categoria: {
          cabo: 5, fio_parafuso_conector: 3, cinta_isolador_mao_francesa: 2,
          equipamento_grande: 0, outros: 2,
        },
        override_por_material: {},
      },
      mao_obra: { tipo: "pct_material", pct: 10 },
      frete_centavos: 0,
      margem: { tipo: "markup", pct: 25 },
      validade_preco_dias: 60,
      validade_orcamento_dias: 30,
    },
    avisos_globais: [],
    ...over,
  };
}

const HOJE = new Date("2026-06-13T12:00:00Z");

describe("gerar_numero_orcamento", () => {
  it("D1 — counter zero → ORC-2026-06-13-001", () => {
    expect(gerar_numero_orcamento(HOJE, makeStorage())).toBe("ORC-2026-06-13-001");
  });

  it("D2 — chamado 2× no mesmo dia → 001 e 002", () => {
    const s = makeStorage();
    expect(gerar_numero_orcamento(HOJE, s)).toBe("ORC-2026-06-13-001");
    expect(gerar_numero_orcamento(HOJE, s)).toBe("ORC-2026-06-13-002");
  });
});

describe("preparar_linhas_documento", () => {
  it("D3 — orçamento vazio → estrutura válida com listas vazias", () => {
    const r = preparar_linhas_documento(orc(), META, DADOS, new Map());
    expect(r.itens).toEqual([]);
    expect(r.pendentes).toEqual([]);
    expect(r.decomposicao.total_reais).toBe(0);
    expect(r.cabecalho.numero).toBe("ORC-2026-06-13-001");
    expect(r.cabecalho.status_label).toBe("Rascunho");
    expect(r.cabecalho.gerado_em_br).toBe("13/06/2026");
    expect(r.cabecalho.validade_br).toBe("13/07/2026");
  });

  it("D4 — orçamento com 2 itens + 1 pendente → tabela e lista + total_parcial", () => {
    const orcamento = orc({
      itens: [
        snapshot({ material_id: 1, subtotal_centavos: 2500 }),
        snapshot({ material_id: 2, subtotal_centavos: 1000, descricao_snapshot: "Cabo" }),
      ],
      pendentes: [pendente({ material_id: 3, descricao: "Trafo" })],
      total_parcial: true,
      decomposicao: {
        subtotal_material_centavos: 3500,
        perda_centavos: 0,
        mao_obra_centavos: 0,
        frete_centavos: 0,
        base_para_margem_centavos: 3500,
        margem_centavos: 875,
        total_centavos: 4375,
      },
    });
    const catalogo = new Map([
      [1, mat(1)],
      [2, mat(2, { cod_sap: "S2X" })],
    ]);
    const r = preparar_linhas_documento(orcamento, META, DADOS, catalogo);
    expect(r.itens.length).toBe(2);
    expect(r.itens[0].cod_sap).toBe("S1");
    expect(r.itens[1].cod_sap).toBe("S2X");
    expect(r.pendentes.length).toBe(1);
    expect(r.pendentes[0].motivo).toBe("Sem preço cadastrado");
    expect(r.total_parcial).toBe(true);
    expect(r.decomposicao.total_reais).toBe(43.75);
  });

  it("D5 — centavos → reais (1234 centavos = 12.34 reais)", () => {
    const orcamento = orc({
      itens: [snapshot({ preco_unit_centavos: 1234, subtotal_centavos: 12340 })],
      decomposicao: {
        subtotal_material_centavos: 12340,
        perda_centavos: 0,
        mao_obra_centavos: 0,
        frete_centavos: 0,
        base_para_margem_centavos: 12340,
        margem_centavos: 0,
        total_centavos: 12340,
      },
    });
    const r = preparar_linhas_documento(orcamento, META, DADOS, new Map([[1, mat(1)]]));
    expect(r.itens[0].preco_unit_reais).toBeCloseTo(12.34);
    expect(r.itens[0].subtotal_reais).toBeCloseTo(123.4);
    expect(r.decomposicao.subtotal_material_reais).toBeCloseTo(123.4);
  });
});
