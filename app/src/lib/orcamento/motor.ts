// Montagem do orçamento: orquestra precificação item-a-item, aplica perda
// (3 níveis), mão de obra (tabela ou %), frete (fixo) e margem (markup ou
// margem). Função pura; data injetada para ser testável.

import type {
  ConfigOrcamento,
  DecomposicaoOrcamento,
  ItemOrcamentoSnapshot,
  ItemPendente,
  MontarOrcamentoInput,
  Orcamento,
  PrecoMaterial,
} from "./types";
import { precificar_item } from "./precificacao";
import { categoria_de_material } from "./defaults";
import {
  multiplicar_centavos,
  round_centavos_half_even,
  somar_centavos,
} from "./dinheiro";

function gerar_id(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `orc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function adicionar_dias_iso(d: Date, dias: number): string {
  const r = new Date(d);
  r.setDate(r.getDate() + dias);
  return r.toISOString().slice(0, 10);
}

function resolver_perda_pct(
  item: ItemOrcamentoSnapshot,
  preco: PrecoMaterial | undefined,
  config: ConfigOrcamento,
): number {
  // 1. override global por material (decisão local do engenheiro)
  const override_local = config.perda.override_por_material[item.material_id];
  if (override_local !== undefined) return override_local;

  // 2. override no próprio preço cadastrado
  if (preco?.categoria_perda_override != null) {
    return config.perda.default_por_categoria[preco.categoria_perda_override];
  }

  // 3. heurística pela descrição/unidade do material (snapshot)
  const cat = categoria_de_material({
    id: item.material_id,
    cod_sap: "",
    cod_lider7: "",
    descricao: item.descricao_snapshot,
    unidade: item.unidade_snapshot,
  });
  return config.perda.default_por_categoria[cat];
}

export function montar_orcamento(input: MontarOrcamentoInput): Orcamento {
  const { rows, precos, config, estruturas_da_obra, hoje } = input;

  if (config.margem.tipo === "margem" && config.margem.pct >= 100) {
    throw new Error("margem ≥ 100% inválida (divisão por zero)");
  }
  if (config.margem.pct < 0) {
    throw new Error("margem/markup negativo inválido");
  }

  const itens: ItemOrcamentoSnapshot[] = [];
  const pendentes: ItemPendente[] = [];

  for (const row of rows) {
    const preco = precos.get(row.material.id);
    const resultado = precificar_item(row, preco, hoje);
    if (resultado.tipo === "ok") itens.push(resultado.item);
    else pendentes.push(resultado.pendente);
  }

  pendentes.sort((a, b) =>
    a.descricao.localeCompare(b.descricao, "pt-BR"),
  );

  const subtotal_material_centavos = somar_centavos(
    ...itens.map((i) => i.subtotal_centavos),
  );

  let perda_centavos = 0;
  for (const item of itens) {
    const preco = precos.get(item.material_id);
    const pct = resolver_perda_pct(item, preco, config);
    perda_centavos += round_centavos_half_even(
      (item.subtotal_centavos * pct) / 100,
    );
  }

  const avisos_globais: string[] = [];
  let mao_obra_centavos = 0;
  if (config.mao_obra.tipo === "pct_material") {
    const pct = config.mao_obra.pct ?? 0;
    mao_obra_centavos = round_centavos_half_even(
      (subtotal_material_centavos * pct) / 100,
    );
  } else {
    const tabela = config.mao_obra.tabela ?? {};
    const ausentes = new Set<string>();
    for (const est of estruturas_da_obra) {
      const valor_unit = tabela[est.tipo];
      if (valor_unit === undefined) {
        ausentes.add(est.tipo);
        continue;
      }
      mao_obra_centavos += multiplicar_centavos(valor_unit, est.quantidade);
    }
    if (ausentes.size > 0) {
      avisos_globais.push(
        `${ausentes.size} tipo(s) de estrutura sem MO cadastrada: ${[...ausentes].sort().join(", ")}`,
      );
    }
  }

  const frete_centavos = config.frete_centavos;
  const base_para_margem_centavos =
    subtotal_material_centavos +
    perda_centavos +
    mao_obra_centavos +
    frete_centavos;

  let margem_centavos: number;
  if (config.margem.tipo === "markup") {
    margem_centavos = round_centavos_half_even(
      (base_para_margem_centavos * config.margem.pct) / 100,
    );
  } else {
    // margem: preço = custo / (1 − margem) ; diferença é a margem
    const fator = 1 / (1 - config.margem.pct / 100);
    const total = round_centavos_half_even(base_para_margem_centavos * fator);
    margem_centavos = total - base_para_margem_centavos;
  }

  const total_centavos = base_para_margem_centavos + margem_centavos;

  const decomposicao: DecomposicaoOrcamento = {
    subtotal_material_centavos,
    perda_centavos,
    mao_obra_centavos,
    frete_centavos,
    base_para_margem_centavos,
    margem_centavos,
    total_centavos,
  };

  // Snapshot imutável da config (deep clone — só tipos serializáveis).
  const config_snapshot: ConfigOrcamento = JSON.parse(JSON.stringify(config));

  return {
    id: gerar_id(),
    gerado_em: hoje.toISOString(),
    validade_orcamento: adicionar_dias_iso(hoje, config.validade_orcamento_dias),
    status: "rascunho",
    versao: 1,
    itens,
    pendentes,
    decomposicao,
    total_parcial: pendentes.length > 0,
    config_snapshot,
    avisos_globais,
  };
}
