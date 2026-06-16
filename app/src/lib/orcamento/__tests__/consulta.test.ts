import { describe, expect, it } from "vitest";
import type { OrcamentoSalvo, StatusOrcamento } from "../types";
import {
  agrupar_por_numero,
  filtrar_orcamentos_consulta,
  ordenar_orcamentos,
  type FiltrosConsulta,
} from "../consulta";

function mk(
  id: string,
  over: Partial<{
    numero: string;
    obra: string;
    cliente_id: string | null;
    status: StatusOrcamento;
    salvo_em: string;
    total: number;
    observacoes: string;
    excluido_em: string | null;
    versao: number;
  }> = {},
): OrcamentoSalvo {
  return {
    id,
    salvo_em: over.salvo_em ?? "2026-06-13T10:00:00Z",
    excluido_em: over.excluido_em ?? null,
    cliente_id: over.cliente_id ?? null,
    observacoes: over.observacoes,
    orcamento: {
      id: `o-${id}`,
      gerado_em: "2026-06-13T10:00:00Z",
      validade_orcamento: "2026-07-13",
      status: "rascunho",
      versao: 1,
      itens: [],
      pendentes: [],
      decomposicao: {
        subtotal_material_centavos: over.total ?? 0,
        perda_centavos: 0,
        mao_obra_centavos: 0,
        frete_centavos: 0,
        base_para_margem_centavos: over.total ?? 0,
        margem_centavos: 0,
        total_centavos: over.total ?? 0,
      },
      total_parcial: false,
      config_snapshot: {
        perda: {
          default_por_categoria: {
            cabo: 0, fio_parafuso_conector: 0, cinta_isolador_mao_francesa: 0,
            equipamento_grande: 0, outros: 0,
          },
          override_por_material: {},
        },
        mao_obra: { tipo: "pct_material", pct: 0 },
        frete_centavos: 0,
        margem: { tipo: "markup", pct: 0 },
        validade_preco_dias: 60,
        validade_orcamento_dias: 30,
      },
      avisos_globais: [],
    },
    meta: {
      obra: over.obra ?? `Obra ${id}`,
      endereco: "",
      municipio: "",
      responsavel: "",
    },
    dados_documento: {
      numero: over.numero ?? `ORC-${id}`,
      versao: over.versao ?? 1,
      condicoes_pagamento: "",
      prazo_execucao: "",
      status: over.status ?? "rascunho",
    },
  };
}

const filtros_padrao: FiltrosConsulta = {
  busca: "",
  cliente_ids: null,
  status: null,
  inicio: null,
  fim: null,
  valor_min_centavos: null,
  valor_max_centavos: null,
  incluir_excluidos: false,
};

describe("filtrar_orcamentos_consulta", () => {
  const lista = [
    mk("a", { numero: "ORC-001", obra: "Loja A", status: "aprovado", total: 100000, salvo_em: "2026-01-10T10:00:00Z" }),
    mk("b", { numero: "ORC-002", obra: "Loja B", status: "rascunho", total: 5000, salvo_em: "2026-06-15T10:00:00Z", cliente_id: "cli-1" }),
    mk("c", { numero: "ORC-003", obra: "Loja C", status: "recusado", total: 300000, salvo_em: "2026-12-20T10:00:00Z", cliente_id: "cli-2" }),
    mk("d", { numero: "ORC-004", obra: "Loja D", status: "rascunho", total: 1000, excluido_em: "2026-06-01T10:00:00Z" }),
  ];

  it("CO01 — busca livre casa em número e obra (insensível a acento)", () => {
    const r1 = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, busca: "ORC-002" });
    expect(r1.map((o) => o.id)).toEqual(["b"]);
    const r2 = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, busca: "loja c" });
    expect(r2.map((o) => o.id)).toEqual(["c"]);
  });

  it("CO02 — filtro cliente_ids (multi)", () => {
    const r = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, cliente_ids: ["cli-1"] });
    expect(r.map((o) => o.id)).toEqual(["b"]);
    const r2 = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, cliente_ids: ["cli-1", "cli-2"] });
    expect(r2.map((o) => o.id).sort()).toEqual(["b", "c"]);
    // cliente_ids = [] = "só os sem cliente"
    const r3 = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, cliente_ids: [] });
    expect(r3.map((o) => o.id)).toEqual(["a"]);  // único sem cliente_id na lista (não excluído)
  });

  it("CO03 — filtro status (multi)", () => {
    const r = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, status: ["aprovado", "recusado"] });
    expect(r.map((o) => o.id).sort()).toEqual(["a", "c"]);
  });

  it("CO04 — filtro de período: só dentro do intervalo", () => {
    const r = filtrar_orcamentos_consulta(lista, {
      ...filtros_padrao,
      inicio: "2026-03-01",
      fim: "2026-09-30",
    });
    expect(r.map((o) => o.id)).toEqual(["b"]);
  });

  it("CO05 — faixa de valor (R$ 100 a R$ 2.000)", () => {
    const r = filtrar_orcamentos_consulta(lista, {
      ...filtros_padrao,
      valor_min_centavos: 10000,
      valor_max_centavos: 200000,
    });
    expect(r.map((o) => o.id)).toEqual(["a"]);
  });

  it("CO06 — excluídos escondidos por padrão; aparecem com flag", () => {
    const r1 = filtrar_orcamentos_consulta(lista, filtros_padrao);
    expect(r1.map((o) => o.id)).not.toContain("d");
    const r2 = filtrar_orcamentos_consulta(lista, { ...filtros_padrao, incluir_excluidos: true });
    expect(r2.map((o) => o.id)).toContain("d");
  });

  it("CO07 — busca em observações", () => {
    const lista2 = [mk("x", { observacoes: "Pagar à vista" }), mk("y", { observacoes: "Faturado" })];
    const r = filtrar_orcamentos_consulta(lista2, { ...filtros_padrao, busca: "pagar" });
    expect(r.map((o) => o.id)).toEqual(["x"]);
  });
});

describe("ordenar_orcamentos", () => {
  const lista = [
    mk("a", { numero: "ORC-001", total: 100000, status: "aprovado", versao: 2, salvo_em: "2026-01-10T10:00:00Z" }),
    mk("b", { numero: "ORC-010", total: 5000, status: "rascunho", versao: 1, salvo_em: "2026-06-15T10:00:00Z" }),
    mk("c", { numero: "ORC-002", total: 300000, status: "enviado", versao: 3, salvo_em: "2026-12-20T10:00:00Z" }),
  ];

  it("CO08 — ordena por valor desc/asc corretamente", () => {
    const desc = ordenar_orcamentos(lista, { campo: "valor", direcao: "desc" });
    expect(desc.map((o) => o.id)).toEqual(["c", "a", "b"]);
    const asc = ordenar_orcamentos(lista, { campo: "valor", direcao: "asc" });
    expect(asc.map((o) => o.id)).toEqual(["b", "a", "c"]);
  });

  it("CO09 — ordena por número numérico ('ORC-010' > 'ORC-002') e por salvo_em", () => {
    const por_numero = ordenar_orcamentos(lista, { campo: "numero", direcao: "asc" });
    expect(por_numero.map((o) => o.id)).toEqual(["a", "c", "b"]);
    const por_data = ordenar_orcamentos(lista, { campo: "salvo_em", direcao: "desc" });
    expect(por_data.map((o) => o.id)).toEqual(["c", "b", "a"]);
  });
});

describe("agrupar_por_numero", () => {
  it("AG01 — agrupa versões do mesmo número; principal = maior versão", () => {
    const lista = [
      mk("v1", { numero: "ORC-100", versao: 1 }),
      mk("v3", { numero: "ORC-100", versao: 3 }),
      mk("v2", { numero: "ORC-100", versao: 2 }),
      mk("x", { numero: "ORC-200", versao: 1 }),
    ];
    const grupos = agrupar_por_numero(lista);
    expect(grupos.map((g) => g.numero)).toEqual(["ORC-100", "ORC-200"]);
    expect(grupos[0].principal.id).toBe("v3");
    expect(grupos[0].outras.map((o) => o.id)).toEqual(["v2", "v1"]);
    expect(grupos[1].outras).toHaveLength(0);
  });

  it("AG02 — principal prefere versão não-excluída", () => {
    const grupos = agrupar_por_numero([
      mk("nova_excluida", { numero: "ORC-1", versao: 2, excluido_em: "2026-06-01T10:00:00Z" }),
      mk("ativa", { numero: "ORC-1", versao: 1 }),
    ]);
    expect(grupos[0].principal.id).toBe("ativa");
  });
});
