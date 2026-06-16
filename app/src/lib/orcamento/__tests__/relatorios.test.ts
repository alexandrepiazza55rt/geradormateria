import { describe, expect, it } from "vitest";
import type {
  ItemOrcamentoSnapshot,
  ItemPendente,
  Orcamento,
  OrcamentoSalvo,
  StatusOrcamento,
} from "../types";
import {
  calcular_kpis,
  filtrar_orcamentos,
  pendencias_mais_frequentes,
  top_materiais_por_qty,
  top_materiais_por_valor,
  valor_por_mes,
} from "../relatorios";

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

function pend(over: Partial<ItemPendente>): ItemPendente {
  return {
    material_id: 999,
    descricao: "Pendente",
    unidade_material: "pç",
    qty: 1,
    motivo: "sem_preco",
    ...over,
  };
}

function orc(
  id: string,
  status: StatusOrcamento,
  salvo_em: string,
  total_centavos: number,
  itens: ItemOrcamentoSnapshot[] = [],
  pendentes: ItemPendente[] = [],
): OrcamentoSalvo {
  const orcamento: Orcamento = {
    id: `o-${id}`,
    gerado_em: salvo_em,
    validade_orcamento: salvo_em.slice(0, 10),
    status: "rascunho",
    versao: 1,
    itens,
    pendentes,
    decomposicao: {
      subtotal_material_centavos: total_centavos,
      perda_centavos: 0,
      mao_obra_centavos: 0,
      frete_centavos: 0,
      base_para_margem_centavos: total_centavos,
      margem_centavos: 0,
      total_centavos,
    },
    total_parcial: pendentes.length > 0,
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
  };
  return {
    id,
    salvo_em,
    orcamento,
    meta: { obra: "X", endereco: "", municipio: "", responsavel: "" },
    dados_documento: {
      numero: `N${id}`,
      versao: 1,
      condicoes_pagamento: "",
      prazo_execucao: "",
      status,
    },
  };
}

describe("filtrar_orcamentos", () => {
  const lista = [
    orc("a", "rascunho", "2026-01-10T10:00:00Z", 100),
    orc("b", "aprovado", "2026-06-15T10:00:00Z", 200),
    orc("c", "recusado", "2026-12-20T10:00:00Z", 300),
  ];

  it("R1 — filtro por período inclui apenas datas dentro do intervalo", () => {
    const r = filtrar_orcamentos(lista, {
      inicio: "2026-03-01",
      fim: "2026-09-30",
      status: null,
    });
    expect(r.map((o) => o.id)).toEqual(["b"]);
  });

  it("R2 — filtro por status filtra corretamente", () => {
    const r = filtrar_orcamentos(lista, {
      inicio: null,
      fim: null,
      status: ["aprovado", "recusado"],
    });
    expect(r.map((o) => o.id).sort()).toEqual(["b", "c"]);
  });
});

describe("calcular_kpis", () => {
  it("R3 — só rascunhos → ticket_medio e conversao nulos", () => {
    const lista = [
      orc("a", "rascunho", "2026-06-01T00:00:00Z", 1000),
      orc("b", "rascunho", "2026-06-02T00:00:00Z", 2000),
    ];
    const k = calcular_kpis(lista);
    expect(k.ticket_medio_centavos).toBeNull();
    expect(k.conversao_pct).toBeNull();
    expect(k.qtd_rascunhos).toBe(2);
    expect(k.total_centavos).toBe(3000);
  });

  it("R4 — 2 aprovados (100,50) + 1 recusado → ticket 75, conversão 66,66%", () => {
    const lista = [
      orc("a", "aprovado", "2026-06-01T00:00:00Z", 100),
      orc("b", "aprovado", "2026-06-02T00:00:00Z", 50),
      orc("c", "recusado", "2026-06-03T00:00:00Z", 200),
    ];
    const k = calcular_kpis(lista);
    expect(k.ticket_medio_centavos).toBe(75);
    expect(k.conversao_pct).toBeCloseTo((2 / 3) * 100, 5);
  });

  // Correção 4: "em aberto" = só ENVIADO (decisão do dono).
  // Rascunho NÃO entra em aberto. Recusados/expirados ficam fora dos dois.
  it("R9 — total_em_aberto_centavos soma só status=enviado", () => {
    const lista = [
      orc("a", "rascunho", "2026-06-01T00:00:00Z", 100),
      orc("b", "enviado", "2026-06-02T00:00:00Z", 200),
      orc("c", "enviado", "2026-06-03T00:00:00Z", 300),
      orc("d", "aprovado", "2026-06-04T00:00:00Z", 1000),
      orc("e", "recusado", "2026-06-05T00:00:00Z", 999),
    ];
    const k = calcular_kpis(lista);
    expect(k.total_em_aberto_centavos).toBe(500);  // 200 + 300
    expect(k.qtd_enviados).toBe(2);
  });

  it("R10 — total_aprovados_centavos soma só status=aprovado", () => {
    const lista = [
      orc("a", "aprovado", "2026-06-01T00:00:00Z", 700),
      orc("b", "aprovado", "2026-06-02T00:00:00Z", 300),
      orc("c", "enviado", "2026-06-03T00:00:00Z", 9999),
      orc("d", "rascunho", "2026-06-04T00:00:00Z", 100),
    ];
    const k = calcular_kpis(lista);
    expect(k.total_aprovados_centavos).toBe(1000);  // 700 + 300
    expect(k.total_em_aberto_centavos).toBe(9999);
  });
});

describe("top_materiais", () => {
  it("R5 — top_por_qty agrega quantidade entre orçamentos", () => {
    const lista = [
      orc("a", "aprovado", "2026-06-01T00:00:00Z", 0, [
        snap({ material_id: 1, qty: 10, subtotal_centavos: 1000 }),
        snap({ material_id: 2, qty: 5, subtotal_centavos: 500 }),
      ]),
      orc("b", "aprovado", "2026-06-02T00:00:00Z", 0, [
        snap({ material_id: 1, qty: 20, subtotal_centavos: 2000 }),
      ]),
    ];
    const r = top_materiais_por_qty(lista, 10);
    expect(r[0].material_id).toBe(1);
    expect(r[0].total_qty).toBe(30);
    expect(r[0].qtd_orcamentos).toBe(2);
    expect(r[1].material_id).toBe(2);
  });

  it("R6 — top_por_valor ordena por subtotal agregado", () => {
    const lista = [
      orc("a", "aprovado", "2026-06-01T00:00:00Z", 0, [
        snap({ material_id: 1, qty: 1, subtotal_centavos: 100 }),
        snap({ material_id: 2, qty: 100, subtotal_centavos: 50 }),
      ]),
    ];
    const r = top_materiais_por_valor(lista, 10);
    expect(r[0].material_id).toBe(1);
    expect(r[0].total_centavos).toBe(100);
    expect(r[1].material_id).toBe(2);
  });
});

describe("valor_por_mes", () => {
  it("R7 — agrupa por YYYY-MM e cobre últimos N meses (com zeros)", () => {
    const lista = [
      orc("a", "aprovado", "2026-04-10T00:00:00Z", 100),
      orc("b", "aprovado", "2026-04-20T00:00:00Z", 200),
      orc("c", "aprovado", "2026-06-05T00:00:00Z", 50),
    ];
    const hoje = new Date("2026-06-13T12:00:00Z");
    const r = valor_por_mes(lista, 3, hoje);
    expect(r.length).toBe(3);
    expect(r.map((m) => m.ano_mes)).toEqual(["2026-04", "2026-05", "2026-06"]);
    expect(r[0].total_centavos).toBe(300);
    expect(r[0].qtd_orcamentos).toBe(2);
    expect(r[1].total_centavos).toBe(0);
    expect(r[2].total_centavos).toBe(50);
  });
});

describe("pendencias_mais_frequentes", () => {
  it("R8 — conta apenas pendências com motivo sem_preco (não outras causas)", () => {
    const lista = [
      orc("a", "rascunho", "2026-06-01T00:00:00Z", 0, [], [
        pend({ material_id: 100, descricao: "Trafo", motivo: "sem_preco" }),
        pend({ material_id: 200, descricao: "Cabo", motivo: "conversao_indefinida" }),
      ]),
      orc("b", "rascunho", "2026-06-02T00:00:00Z", 0, [], [
        pend({ material_id: 100, descricao: "Trafo", motivo: "sem_preco" }),
      ]),
      orc("c", "rascunho", "2026-06-03T00:00:00Z", 0, [], [
        pend({ material_id: 200, descricao: "Cabo", motivo: "qty_invalida" }),
      ]),
    ];
    const r = pendencias_mais_frequentes(lista, 10);
    expect(r.length).toBe(1);
    expect(r[0].material_id).toBe(100);
    expect(r[0].qtd_aparicoes).toBe(2);
  });
});
