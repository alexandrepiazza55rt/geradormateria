// Precificação de uma linha consolidada da BOM.
// Função pura: dada uma BomRow + (PrecoMaterial | undefined) + data de referência,
// devolve OU um snapshot de item OU uma entrada pendente. Nunca silencia, nunca
// assume zero.

import type { BomRow } from "../../types";
import type {
  PrecoMaterial,
  ResultadoPrecificacao,
  StatusValidade,
} from "./types";
import { round_centavos_half_even } from "./dinheiro";

export function precificar_item(
  row: BomRow,
  preco: PrecoMaterial | undefined,
  hoje: Date,
): ResultadoPrecificacao {
  const { material, quantidade } = row;

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: material.id,
        descricao: material.descricao,
        unidade_material: material.unidade,
        qty: quantidade,
        motivo: "qty_invalida",
        detalhe: `quantidade ${quantidade} inválida`,
      },
    };
  }

  if (!preco) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: material.id,
        descricao: material.descricao,
        unidade_material: material.unidade,
        qty: quantidade,
        motivo: "sem_preco",
      },
    };
  }

  const precisa_converter = preco.unidade_preco !== material.unidade;
  if (precisa_converter && preco.fator_conversao == null) {
    return {
      tipo: "pendente",
      pendente: {
        material_id: material.id,
        descricao: material.descricao,
        unidade_material: material.unidade,
        qty: quantidade,
        motivo: "conversao_indefinida",
        detalhe: `preço em ${preco.unidade_preco}, BOM em ${material.unidade}, sem fator`,
      },
    };
  }

  const fator = precisa_converter ? (preco.fator_conversao as number) : null;
  const qty_convertida = fator != null ? quantidade * fator : quantidade;
  const subtotal_centavos = round_centavos_half_even(
    qty_convertida * preco.valor_centavos,
  );

  let validade_status: StatusValidade;
  if (preco.validade == null) {
    validade_status = "sem_validade";
  } else {
    const venc = new Date(`${preco.validade}T00:00:00`);
    validade_status = venc.getTime() >= hoje.getTime() ? "ok" : "vencido";
  }

  const aviso =
    fator != null
      ? `conversão ${material.unidade}→${preco.unidade_preco} aplicada (fator ${fator})`
      : undefined;

  return {
    tipo: "ok",
    item: {
      material_id: material.id,
      descricao_snapshot: material.descricao,
      unidade_snapshot: material.unidade,
      unidade_preco: preco.unidade_preco,
      qty: quantidade,
      qty_convertida,
      fator_conversao_aplicado: fator,
      preco_unit_centavos: preco.valor_centavos,
      subtotal_centavos,
      origem_preco: preco.origem,
      validade_status,
      aviso,
    },
  };
}
