// Reprocessa um orçamento salvo com os PREÇOS ATUAIS do cadastro.
// Função pura: dado o snapshot do orçamento + preços atuais + catálogo,
// para cada pendente que agora tem preço cadastrado (e fator OK quando
// preciso), gera um ItemOrcamentoSnapshot e move da lista de pendentes
// para a de itens. Recalcula decomposição.
//
// Não toca o store. O store decide se aplica in-place (rascunho) ou cria
// nova versão (status enviado/aprovado/etc).

import type { Material } from "../../types";
import type {
  ItemOrcamentoSnapshot,
  ItemPendente,
  Orcamento,
  PrecoMaterial,
} from "./types";
import { precificar_item } from "./precificacao";
import { recalcular_decomposicao_de_itens } from "./edicao";

export interface ReprocessamentoArgs {
  orcamento: Orcamento;
  precos_efetivos: Map<number, PrecoMaterial>;
  materiais: Map<number, Material>;
  hoje: Date;
  desconto_pct?: number;          // 0..100 — para preservar desconto do salvo
  mao_obra_override?: number | null;
}

export interface ReprocessamentoResultado {
  orcamento_novo: Orcamento;
  incorporados: number;           // quantos pendentes viraram itens
  ainda_pendentes: number;        // quantos continuam pendentes
  total_antes_centavos: number;
  total_depois_centavos: number;
}

export function reprocessar_orcamento_com_precos_atualizados(
  args: ReprocessamentoArgs,
): ReprocessamentoResultado {
  const { orcamento, precos_efetivos, materiais, hoje } = args;
  const desconto_pct = args.desconto_pct ?? 0;
  const mao_obra_override = args.mao_obra_override ?? null;

  const novos_itens: ItemOrcamentoSnapshot[] = [...orcamento.itens];
  const novos_pendentes: ItemPendente[] = [];
  let incorporados = 0;

  for (const pend of orcamento.pendentes) {
    // qty_invalida não dá pra resolver com preço novo
    if (pend.motivo === "qty_invalida") {
      novos_pendentes.push(pend);
      continue;
    }

    const preco = precos_efetivos.get(pend.material_id);
    const material = materiais.get(pend.material_id);
    if (!material || !preco) {
      novos_pendentes.push(pend);
      continue;
    }

    const r = precificar_item({ material, quantidade: pend.qty }, preco, hoje);
    if (r.tipo === "ok") {
      novos_itens.push(r.item);
      incorporados++;
    } else {
      novos_pendentes.push(r.pendente);
    }
  }

  const total_antes_centavos = orcamento.decomposicao.total_centavos;

  // Se nada mudou, devolve o orçamento original sem recálculo (idempotente)
  if (incorporados === 0) {
    return {
      orcamento_novo: orcamento,
      incorporados: 0,
      ainda_pendentes: novos_pendentes.length,
      total_antes_centavos,
      total_depois_centavos: total_antes_centavos,
    };
  }

  const decomposicao_nova = recalcular_decomposicao_de_itens({
    itens: novos_itens,
    config: orcamento.config_snapshot,
    desconto_pct,
    mao_obra_original_centavos: orcamento.decomposicao.mao_obra_centavos,
    mao_obra_override,
  });

  const orcamento_novo: Orcamento = {
    ...orcamento,
    itens: novos_itens,
    pendentes: novos_pendentes,
    decomposicao: decomposicao_nova,
    total_parcial: novos_pendentes.length > 0,
  };

  return {
    orcamento_novo,
    incorporados,
    ainda_pendentes: novos_pendentes.length,
    total_antes_centavos,
    total_depois_centavos: decomposicao_nova.total_centavos,
  };
}

/**
 * Atalho para a UI: conta quantos pendentes do orçamento podem ser
 * incorporados agora (têm preço cadastrado + fator OK quando preciso).
 * Não regenera o orçamento.
 */
export function contar_pendentes_incorporaveis(
  orcamento: Orcamento,
  precos_efetivos: Map<number, PrecoMaterial>,
  materiais: Map<number, Material>,
  hoje: Date,
): number {
  let n = 0;
  for (const pend of orcamento.pendentes) {
    if (pend.motivo === "qty_invalida") continue;
    const preco = precos_efetivos.get(pend.material_id);
    const material = materiais.get(pend.material_id);
    if (!material || !preco) continue;
    const r = precificar_item({ material, quantidade: pend.qty }, preco, hoje);
    if (r.tipo === "ok") n++;
  }
  return n;
}
