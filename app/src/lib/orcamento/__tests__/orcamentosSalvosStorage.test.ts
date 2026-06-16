import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrcamentoSalvo } from "../types";
import type { StorageBackend } from "../storage";
import {
  carregar_orcamentos_salvos,
  limpar_orcamentos_salvos,
  salvar_orcamentos_salvos,
  STORAGE_KEY_ORCAMENTOS,
} from "../orcamentosSalvosStorage";

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

function orcSalvo(id: string, over: Partial<OrcamentoSalvo> = {}): OrcamentoSalvo {
  return {
    id,
    salvo_em: "2026-06-13T14:00:00.000Z",
    orcamento: {
      id: `orc-${id}`,
      gerado_em: "2026-06-13T13:00:00.000Z",
      validade_orcamento: "2026-07-13",
      status: "rascunho",
      versao: 1,
      itens: [
        {
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
        },
      ],
      pendentes: [],
      decomposicao: {
        subtotal_material_centavos: 2500,
        perda_centavos: 0,
        mao_obra_centavos: 0,
        frete_centavos: 0,
        base_para_margem_centavos: 2500,
        margem_centavos: 0,
        total_centavos: 2500,
      },
      total_parcial: false,
      config_snapshot: {
        perda: {
          default_por_categoria: {
            cabo: 5, fio_parafuso_conector: 3, cinta_isolador_mao_francesa: 2,
            equipamento_grande: 0, outros: 2,
          },
          override_por_material: { 30: 8 },
        },
        mao_obra: { tipo: "pct_material", pct: 10 },
        frete_centavos: 0,
        margem: { tipo: "markup", pct: 25 },
        validade_preco_dias: 60,
        validade_orcamento_dias: 30,
      },
      avisos_globais: [],
    },
    meta: {
      obra: "Obra Teste",
      endereco: "Rua A, 100",
      municipio: "Cidade X",
      responsavel: "Eng. Y",
    },
    dados_documento: {
      numero: `ORC-2026-06-13-${id}`,
      versao: 1,
      condicoes_pagamento: "30/60/90",
      prazo_execucao: "30 dias",
      status: "rascunho",
    },
    ...over,
  };
}

describe("orcamentosSalvosStorage", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it("O1 — carregar com storage vazio → []", () => {
    expect(carregar_orcamentos_salvos(makeStorage())).toEqual([]);
  });

  it("O2 — salvar + carregar round-trip preserva o array", () => {
    const s = makeStorage();
    const arr = [orcSalvo("a"), orcSalvo("b")];
    salvar_orcamentos_salvos(arr, s);
    expect(carregar_orcamentos_salvos(s)).toEqual(arr);
  });

  it("O3 — JSON corrompido → [] + console.error", () => {
    const s = makeStorage();
    s.setItem(STORAGE_KEY_ORCAMENTOS, "{nao eh json}");
    expect(carregar_orcamentos_salvos(s)).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
  });

  it("O4 — salvar com storage que lança não levanta exceção", () => {
    const s: StorageBackend = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(() => salvar_orcamentos_salvos([orcSalvo("a")], s)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
  });

  it("O5 — limpar esvazia o storage", () => {
    const s = makeStorage();
    salvar_orcamentos_salvos([orcSalvo("a")], s);
    limpar_orcamentos_salvos(s);
    expect(carregar_orcamentos_salvos(s)).toEqual([]);
  });

  it("O6 — round-trip preserva campos aninhados (orcamento.itens, decomposicao, config_snapshot, meta, dados_documento)", () => {
    const s = makeStorage();
    const original = orcSalvo("x");
    salvar_orcamentos_salvos([original], s);
    const r = carregar_orcamentos_salvos(s)[0];
    expect(r.orcamento.itens.length).toBe(1);
    expect(r.orcamento.itens[0].subtotal_centavos).toBe(2500);
    expect(r.orcamento.decomposicao.total_centavos).toBe(2500);
    expect(r.orcamento.config_snapshot.perda.override_por_material[30]).toBe(8);
    expect(r.orcamento.config_snapshot.margem.tipo).toBe("markup");
    expect(r.meta.obra).toBe("Obra Teste");
    expect(r.dados_documento.numero).toBe("ORC-2026-06-13-x");
  });

  it("O7 — array com 50 orçamentos round-trip funciona", () => {
    const s = makeStorage();
    const arr = Array.from({ length: 50 }, (_, i) => orcSalvo(`id-${i}`));
    salvar_orcamentos_salvos(arr, s);
    const r = carregar_orcamentos_salvos(s);
    expect(r.length).toBe(50);
    expect(r[0].id).toBe("id-0");
    expect(r[49].id).toBe("id-49");
  });
});
