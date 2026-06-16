// Formatação e criação de entradas do histórico de alterações de orçamento.
// Cada entrada é IMUTÁVEL — após criada nunca se edita. Os helpers `criar_*`
// já preenchem `descricao` em pt-BR pronto para o painel exibir sem
// formatação adicional.

import type {
  AcaoHistorico,
  EntradaHistorico,
  StatusOrcamento,
} from "./types";
import { formatar_centavos_brl } from "./dinheiro";

const AUTOR_DEFAULT = "Eu";

function gerar_id(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function fmt_data_hora_curta(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = (d.getMonth() + 1).toString().padStart(2, "0");
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${dia}/${mes} ${hh}:${mm}`;
}

const FMT_QTY = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

function q(n: number): string {
  return FMT_QTY.format(n);
}

function pct_pt(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

const STATUS_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export const ACAO_LABEL: Record<AcaoHistorico, string> = {
  item_adicionado: "Item adicionado",
  item_removido: "Item removido",
  item_qty_alterada: "Quantidade alterada",
  item_preco_alterado: "Preço alterado",
  desconto_total_alterado: "Desconto alterado",
  cabecalho_alterado: "Cabeçalho alterado",
  status_alterado: "Status alterado",
  versao_criada: "Nova versão criada",
  orcamento_revertido: "Orçamento revertido",
  validade_renovada: "Validade renovada",
  orcamento_duplicado: "Orçamento duplicado",
  orcamento_reprocessado: "Orçamento reprocessado",
};

export function descrever_acao(acao: AcaoHistorico): string {
  return ACAO_LABEL[acao];
}

/**
 * Linha completa para o painel de histórico:
 *   "13/06 14:30 — Eu adicionou Cabo CAA 2 (50 kg × R$ 18,00 = R$ 900,00)"
 */
export function formatar_entrada(e: EntradaHistorico): string {
  return `${fmt_data_hora_curta(e.quando)} — ${e.autor} ${e.descricao}`;
}

// ─── Helpers de criação ────────────────────────────────────────────────────

interface BaseInput {
  autor?: string;
  quando?: string;
}

function base(input: BaseInput): {
  id: string;
  autor: string;
  quando: string;
} {
  return {
    id: gerar_id(),
    autor: input.autor ?? AUTOR_DEFAULT,
    quando: input.quando ?? new Date().toISOString(),
  };
}

export function criar_entrada_item_adicionado(
  args: {
    item_id: number;
    descricao_material: string;
    unidade: string;
    qty: number;
    preco_centavos: number;
    subtotal_centavos: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `adicionou ${args.descricao_material} ` +
    `(${q(args.qty)} ${args.unidade} × ${formatar_centavos_brl(args.preco_centavos)} ` +
    `= ${formatar_centavos_brl(args.subtotal_centavos)})`;
  return {
    ...base(args),
    acao: "item_adicionado",
    descricao: desc,
    item_id: args.item_id,
    qty_depois: args.qty,
    preco_depois_centavos: args.preco_centavos,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}

export function criar_entrada_item_removido(
  args: {
    item_id: number;
    descricao_material: string;
    unidade: string;
    qty: number;
    preco_centavos: number;
    subtotal_centavos: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `removeu ${args.descricao_material} ` +
    `(${q(args.qty)} ${args.unidade} × ${formatar_centavos_brl(args.preco_centavos)} ` +
    `= ${formatar_centavos_brl(args.subtotal_centavos)})`;
  return {
    ...base(args),
    acao: "item_removido",
    descricao: desc,
    item_id: args.item_id,
    qty_antes: args.qty,
    preco_antes_centavos: args.preco_centavos,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}

export function criar_entrada_item_qty_alterada(
  args: {
    item_id: number;
    descricao_material: string;
    unidade: string;
    qty_antes: number;
    qty_depois: number;
    subtotal_antes_centavos: number;
    subtotal_depois_centavos: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `alterou quantidade de ${args.descricao_material} ` +
    `de ${q(args.qty_antes)} para ${q(args.qty_depois)} ${args.unidade} ` +
    `(${formatar_centavos_brl(args.subtotal_antes_centavos)} → ` +
    `${formatar_centavos_brl(args.subtotal_depois_centavos)})`;
  return {
    ...base(args),
    acao: "item_qty_alterada",
    descricao: desc,
    item_id: args.item_id,
    qty_antes: args.qty_antes,
    qty_depois: args.qty_depois,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}

export function criar_entrada_item_preco_alterado(
  args: {
    item_id: number;
    descricao_material: string;
    preco_antes_centavos: number;
    preco_depois_centavos: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `alterou preço unitário de ${args.descricao_material} ` +
    `de ${formatar_centavos_brl(args.preco_antes_centavos)} ` +
    `para ${formatar_centavos_brl(args.preco_depois_centavos)}`;
  return {
    ...base(args),
    acao: "item_preco_alterado",
    descricao: desc,
    item_id: args.item_id,
    preco_antes_centavos: args.preco_antes_centavos,
    preco_depois_centavos: args.preco_depois_centavos,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}

export function criar_entrada_desconto_total_alterado(
  args: {
    pct_antes: number;
    pct_depois: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `alterou desconto do total de ${pct_pt(args.pct_antes)}% ` +
    `para ${pct_pt(args.pct_depois)}% ` +
    `(${formatar_centavos_brl(args.total_antes_centavos)} → ` +
    `${formatar_centavos_brl(args.total_depois_centavos)})`;
  return {
    ...base(args),
    acao: "desconto_total_alterado",
    descricao: desc,
    valor_antes: `${pct_pt(args.pct_antes)}%`,
    valor_depois: `${pct_pt(args.pct_depois)}%`,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}

export function criar_entrada_cabecalho_alterado(
  args: {
    campo: string;        // chave técnica (ex.: "observacoes")
    rotulo: string;       // rótulo legível (ex.: "Observações")
    valor_antes: string;
    valor_depois: string;
  } & BaseInput,
): EntradaHistorico {
  const desc =
    `alterou ${args.rotulo} de "${args.valor_antes || "—"}" ` +
    `para "${args.valor_depois || "—"}"`;
  return {
    ...base(args),
    acao: "cabecalho_alterado",
    descricao: desc,
    campo: args.campo,
    valor_antes: args.valor_antes,
    valor_depois: args.valor_depois,
  };
}

export function criar_entrada_status_alterado(
  args: {
    status_antes: StatusOrcamento;
    status_depois: StatusOrcamento;
  } & BaseInput,
): EntradaHistorico {
  const a = STATUS_LABEL[args.status_antes];
  const b = STATUS_LABEL[args.status_depois];
  return {
    ...base(args),
    acao: "status_alterado",
    descricao: `alterou status: ${a} → ${b}`,
    valor_antes: a,
    valor_depois: b,
  };
}

export function criar_entrada_versao_criada(
  args: {
    versao_antes: number;
    versao_depois: number;
  } & BaseInput,
): EntradaHistorico {
  return {
    ...base(args),
    acao: "versao_criada",
    descricao: `criou versão v${args.versao_depois} a partir da v${args.versao_antes}`,
    valor_antes: `v${args.versao_antes}`,
    valor_depois: `v${args.versao_depois}`,
  };
}

export function criar_entrada_orcamento_revertido(
  args: {
    versao_revertida: number;
  } & BaseInput,
): EntradaHistorico {
  return {
    ...base(args),
    acao: "orcamento_revertido",
    descricao: `reverteu para v${args.versao_revertida}`,
    valor_depois: `v${args.versao_revertida}`,
  };
}

function fmt_data_br_local(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function criar_entrada_validade_renovada(
  args: {
    validade_antes: string;
    validade_depois: string;
  } & BaseInput,
): EntradaHistorico {
  return {
    ...base(args),
    acao: "validade_renovada",
    descricao:
      `renovou validade de ${fmt_data_br_local(args.validade_antes)} ` +
      `para ${fmt_data_br_local(args.validade_depois)}`,
    valor_antes: args.validade_antes,
    valor_depois: args.validade_depois,
  };
}

export function criar_entrada_orcamento_duplicado(
  args: {
    numero_origem: string;
    versao_origem: number;
  } & BaseInput,
): EntradaHistorico {
  return {
    ...base(args),
    acao: "orcamento_duplicado",
    descricao: `duplicado de ${args.numero_origem} v${args.versao_origem}`,
    valor_antes: `${args.numero_origem} v${args.versao_origem}`,
  };
}

export function criar_entrada_orcamento_reprocessado(
  args: {
    incorporados: number;
    ainda_pendentes: number;
    total_antes_centavos: number;
    total_depois_centavos: number;
    automatico?: boolean;       // true = reprocesso disparado pelo save de preços
  } & BaseInput,
): EntradaHistorico {
  const pluralI = args.incorporados === 1 ? "item incorporado" : "itens incorporados";
  const pluralP =
    args.ainda_pendentes === 1 ? "pendente restante" : "pendentes restantes";
  const prefixo = args.automatico ? "(auto) " : "";
  return {
    ...base(args),
    acao: "orcamento_reprocessado",
    descricao:
      `${prefixo}reprocessou com preços novos: ${args.incorporados} ${pluralI}, ` +
      `${args.ainda_pendentes} ${pluralP} ` +
      `(${formatar_centavos_brl(args.total_antes_centavos)} → ${formatar_centavos_brl(args.total_depois_centavos)})`,
    total_antes_centavos: args.total_antes_centavos,
    total_depois_centavos: args.total_depois_centavos,
  };
}
