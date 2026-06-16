// Funções puras para edição de itens de orçamento.
// Não tocam o store: produzem novos snapshots e nova decomposição a partir
// dos inputs. O store aplica em batch (action `editarOrcamento`).

import type { Material } from "../../types";
import type {
  ConfigOrcamento,
  DecomposicaoOrcamento,
  ItemOrcamentoSnapshot,
  ItemPendente,
  OrigemPreco,
} from "./types";
import {
  round_centavos_half_even,
  somar_centavos,
} from "./dinheiro";
import { categoria_de_material } from "./defaults";

// material_id negativo único para itens manuais.
// Combina timestamp (segundos) e contador local; persistível como Number.
let _contador_manual = 0;
export function gerar_material_id_manual(): number {
  _contador_manual = (_contador_manual + 1) % 1000;
  const ts_segundos = Math.floor(Date.now() / 1000);
  return -(ts_segundos * 1000 + _contador_manual);
}

export function eh_item_manual(material_id: number): boolean {
  return material_id < 0;
}

export function editar_qty_item(
  item: ItemOrcamentoSnapshot,
  nova_qty: number,
): ItemOrcamentoSnapshot {
  const fator = item.fator_conversao_aplicado;
  const qty_convertida = fator != null ? nova_qty * fator : nova_qty;
  const subtotal_centavos = round_centavos_half_even(
    qty_convertida * item.preco_unit_centavos,
  );
  return {
    ...item,
    qty: nova_qty,
    qty_convertida,
    subtotal_centavos,
  };
}

export function editar_preco_item(
  item: ItemOrcamentoSnapshot,
  novo_preco_centavos: number,
): ItemOrcamentoSnapshot {
  const subtotal_centavos = round_centavos_half_even(
    item.qty_convertida * novo_preco_centavos,
  );
  return {
    ...item,
    preco_unit_centavos: novo_preco_centavos,
    subtotal_centavos,
  };
}

export function criar_item_manual(args: {
  descricao: string;
  unidade: string;
  qty: number;
  preco_centavos: number;
}): ItemOrcamentoSnapshot {
  const subtotal_centavos = round_centavos_half_even(
    args.qty * args.preco_centavos,
  );
  return {
    material_id: gerar_material_id_manual(),
    descricao_snapshot: args.descricao,
    unidade_snapshot: args.unidade,
    unidade_preco: args.unidade,
    qty: args.qty,
    qty_convertida: args.qty,
    fator_conversao_aplicado: null,
    preco_unit_centavos: args.preco_centavos,
    subtotal_centavos,
    origem_preco: "meu",
    validade_status: "sem_validade",
  };
}

export interface PrecoArg {
  valor_centavos: number;
  unidade_preco: string;
  fator_conversao: number | null;
  origem: OrigemPreco;
}

export type ResultadoCriarItem =
  | { tipo: "ok"; item: ItemOrcamentoSnapshot }
  | { tipo: "pendente"; pendente: ItemPendente };

export function criar_item_do_catalogo(args: {
  material: Material;
  qty: number;
  preco: PrecoArg | undefined;
}): ResultadoCriarItem {
  const m = args.material;

  if (!Number.isFinite(args.qty) || args.qty <= 0) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: m.id,
        descricao: m.descricao,
        unidade_material: m.unidade,
        qty: args.qty,
        motivo: "qty_invalida",
        detalhe: `quantidade ${args.qty} inválida`,
      },
    };
  }
  if (!args.preco) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: m.id,
        descricao: m.descricao,
        unidade_material: m.unidade,
        qty: args.qty,
        motivo: "sem_preco",
      },
    };
  }
  const precisa_fator = args.preco.unidade_preco !== m.unidade;
  if (precisa_fator && args.preco.fator_conversao == null) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: m.id,
        descricao: m.descricao,
        unidade_material: m.unidade,
        qty: args.qty,
        motivo: "conversao_indefinida",
        detalhe: `preço em ${args.preco.unidade_preco}, BOM em ${m.unidade}, sem fator`,
      },
    };
  }
  const fator = precisa_fator ? args.preco.fator_conversao : null;
  const qty_convertida = fator != null ? args.qty * fator : args.qty;
  const subtotal_centavos = round_centavos_half_even(
    qty_convertida * args.preco.valor_centavos,
  );
  return {
    tipo: "ok",
    item: {
      material_id: m.id,
      descricao_snapshot: m.descricao,
      unidade_snapshot: m.unidade,
      unidade_preco: args.preco.unidade_preco,
      qty: args.qty,
      qty_convertida,
      fator_conversao_aplicado: fator,
      preco_unit_centavos: args.preco.valor_centavos,
      subtotal_centavos,
      origem_preco: args.preco.origem,
      validade_status: "sem_validade",
    },
  };
}

/**
 * Recalcula a decomposição depois de uma edição de itens.
 * Regras:
 * - subtotal_material = soma dos subtotais dos itens
 * - perda = soma por item, via override_por_material > heurística
 * - MO:
 *   - se `mao_obra_override` é número, força esse valor (override do engenheiro)
 *   - senão `pct_material`: recalcula sobre subtotal
 *   - senão `tabela`: mantém o valor original do snapshot
 * - frete: do config
 * - margem: markup ou margem (margem ≥ 100 retorna 0 defensivamente)
 * - desconto: aplicado sobre (base + margem)
 */
export function recalcular_decomposicao_de_itens(args: {
  itens: ItemOrcamentoSnapshot[];
  config: ConfigOrcamento;
  desconto_pct: number;
  mao_obra_original_centavos: number;
  mao_obra_override?: number | null;  // Etapa 6: engenheiro pode forçar valor
}): DecomposicaoOrcamento {
  const { itens, config, desconto_pct, mao_obra_original_centavos, mao_obra_override } = args;

  const subtotal_material_centavos = somar_centavos(
    ...itens.map((i) => i.subtotal_centavos),
  );

  // Perda: usa override por material, senão heurística por categoria
  let perda_centavos = 0;
  for (const item of itens) {
    const override = config.perda.override_por_material[item.material_id];
    let pct: number;
    if (override !== undefined) {
      pct = override;
    } else {
      const cat = categoria_de_material({
        id: item.material_id,
        cod_sap: "",
        cod_lider7: "",
        descricao: item.descricao_snapshot,
        unidade: item.unidade_snapshot,
      });
      pct = config.perda.default_por_categoria[cat];
    }
    perda_centavos += round_centavos_half_even(
      (item.subtotal_centavos * pct) / 100,
    );
  }

  // MO: override do engenheiro > pct_material recalcula > tabela mantém original
  let mao_obra_centavos: number;
  if (mao_obra_override != null) {
    mao_obra_centavos = mao_obra_override;
  } else if (config.mao_obra.tipo === "pct_material") {
    mao_obra_centavos = round_centavos_half_even(
      (subtotal_material_centavos * (config.mao_obra.pct ?? 0)) / 100,
    );
  } else {
    mao_obra_centavos = mao_obra_original_centavos;
  }

  const frete_centavos = config.frete_centavos;
  const base_para_margem_centavos =
    subtotal_material_centavos +
    perda_centavos +
    mao_obra_centavos +
    frete_centavos;

  let margem_centavos = 0;
  if (config.margem.tipo === "markup") {
    margem_centavos = round_centavos_half_even(
      (base_para_margem_centavos * config.margem.pct) / 100,
    );
  } else if (config.margem.tipo === "margem" && config.margem.pct < 100 && config.margem.pct >= 0) {
    const fator = 1 / (1 - config.margem.pct / 100);
    const total_com_margem = round_centavos_half_even(
      base_para_margem_centavos * fator,
    );
    margem_centavos = total_com_margem - base_para_margem_centavos;
  }

  const subtotal_com_margem = base_para_margem_centavos + margem_centavos;
  const desconto_centavos =
    desconto_pct > 0 && desconto_pct < 100
      ? round_centavos_half_even((subtotal_com_margem * desconto_pct) / 100)
      : 0;
  const total_centavos = subtotal_com_margem - desconto_centavos;

  return {
    subtotal_material_centavos,
    perda_centavos,
    mao_obra_centavos,
    frete_centavos,
    base_para_margem_centavos,
    margem_centavos,
    desconto_centavos,
    total_centavos,
  };
}
