// Funções puras que calculam métricas sobre o array de OrcamentoSalvo.
// Todas operam sobre a lista já filtrada (composição transparente).

import type { Material } from "../../types";
import type { OrcamentoSalvo, PrecoMaterial, StatusOrcamento } from "./types";

export interface FiltroRelatorio {
  inicio: string | null;            // ISO "YYYY-MM-DD"; null = sem início
  fim: string | null;               // ISO "YYYY-MM-DD"; null = sem fim
  status: StatusOrcamento[] | null; // null = todos
}

export interface KPIs {
  total_centavos: number;
  qtd_orcamentos: number;
  ticket_medio_centavos: number | null;  // null se nenhum aprovado
  conversao_pct: number | null;           // null se denominador zero
  qtd_aprovados: number;
  qtd_recusados: number;
  qtd_expirados: number;
  qtd_enviados: number;
  qtd_rascunhos: number;
  // Correção 4 — soma de valor por situação. "Em aberto" = só ENVIADO
  // (decisão do dono: rascunho não conta como em aberto).
  total_em_aberto_centavos: number;       // soma dos com status "enviado"
  total_aprovados_centavos: number;       // soma dos com status "aprovado"
}

export interface ItemRanking {
  material_id: number;
  descricao: string;
  unidade: string;
  total_qty: number;
  total_centavos: number;
  qtd_orcamentos: number;
}

export interface MesValor {
  ano_mes: string;                  // "YYYY-MM"
  total_centavos: number;
  qtd_orcamentos: number;
}

export interface MaterialPendente {
  material_id: number;
  descricao: string;
  qtd_aparicoes: number;
}

export function filtrar_orcamentos(
  orcamentos: OrcamentoSalvo[],
  filtro: FiltroRelatorio,
): OrcamentoSalvo[] {
  return orcamentos.filter((o) => {
    const dt = o.salvo_em.slice(0, 10);
    if (filtro.inicio && dt < filtro.inicio) return false;
    if (filtro.fim && dt > filtro.fim) return false;
    if (filtro.status && !filtro.status.includes(o.dados_documento.status)) return false;
    return true;
  });
}

export function calcular_kpis(orcamentos: OrcamentoSalvo[]): KPIs {
  let total_centavos = 0;
  let qtd_aprovados = 0;
  let total_aprovados = 0;
  let qtd_recusados = 0;
  let qtd_expirados = 0;
  let qtd_enviados = 0;
  let total_enviados = 0;
  let qtd_rascunhos = 0;

  for (const o of orcamentos) {
    const t = o.orcamento.decomposicao.total_centavos;
    total_centavos += t;
    switch (o.dados_documento.status) {
      case "aprovado":
        qtd_aprovados++;
        total_aprovados += t;
        break;
      case "recusado":
        qtd_recusados++;
        break;
      case "expirado":
        qtd_expirados++;
        break;
      case "enviado":
        qtd_enviados++;
        total_enviados += t;
        break;
      case "rascunho":
        qtd_rascunhos++;
        break;
    }
  }

  const ticket_medio_centavos =
    qtd_aprovados > 0 ? Math.round(total_aprovados / qtd_aprovados) : null;

  const denominador_conv = qtd_aprovados + qtd_recusados + qtd_expirados;
  const conversao_pct =
    denominador_conv > 0 ? (qtd_aprovados / denominador_conv) * 100 : null;

  return {
    total_centavos,
    qtd_orcamentos: orcamentos.length,
    ticket_medio_centavos,
    conversao_pct,
    qtd_aprovados,
    qtd_recusados,
    qtd_expirados,
    qtd_enviados,
    qtd_rascunhos,
    total_em_aberto_centavos: total_enviados,
    total_aprovados_centavos: total_aprovados,
  };
}

// Agregação compartilhada entre top_materiais_por_qty e top_materiais_por_valor.
function agregar_materiais(orcamentos: OrcamentoSalvo[]): Map<number, ItemRanking> {
  const map = new Map<number, ItemRanking>();
  for (const o of orcamentos) {
    const ids_no_orcamento = new Set<number>();
    for (const it of o.orcamento.itens) {
      ids_no_orcamento.add(it.material_id);
      const r = map.get(it.material_id);
      if (r) {
        r.total_qty += it.qty;
        r.total_centavos += it.subtotal_centavos;
      } else {
        map.set(it.material_id, {
          material_id: it.material_id,
          descricao: it.descricao_snapshot || `Material #${it.material_id}`,
          unidade: it.unidade_snapshot,
          total_qty: it.qty,
          total_centavos: it.subtotal_centavos,
          qtd_orcamentos: 0,
        });
      }
    }
    for (const id of ids_no_orcamento) {
      const r = map.get(id);
      if (r) r.qtd_orcamentos++;
    }
  }
  return map;
}

export function top_materiais_por_qty(
  orcamentos: OrcamentoSalvo[],
  n: number,
): ItemRanking[] {
  return [...agregar_materiais(orcamentos).values()]
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, n);
}

export function top_materiais_por_valor(
  orcamentos: OrcamentoSalvo[],
  n: number,
): ItemRanking[] {
  return [...agregar_materiais(orcamentos).values()]
    .sort((a, b) => b.total_centavos - a.total_centavos)
    .slice(0, n);
}

export function valor_por_mes(
  orcamentos: OrcamentoSalvo[],
  ultimos_meses: number,
  hoje: Date,
): MesValor[] {
  const meses: MesValor[] = [];
  const data_ref = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  for (let i = ultimos_meses - 1; i >= 0; i--) {
    const d = new Date(data_ref.getFullYear(), data_ref.getMonth() - i, 1);
    const ano_mes =
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    meses.push({ ano_mes, total_centavos: 0, qtd_orcamentos: 0 });
  }
  const indices = new Map(meses.map((m, i) => [m.ano_mes, i] as const));
  for (const o of orcamentos) {
    const ano_mes = o.salvo_em.slice(0, 7);
    const idx = indices.get(ano_mes);
    if (idx !== undefined) {
      meses[idx].total_centavos += o.orcamento.decomposicao.total_centavos;
      meses[idx].qtd_orcamentos++;
    }
  }
  return meses;
}

/**
 * Ranking de materiais que mais aparecem como pendência por falta de preço.
 *
 * Quando `precos_efetivos` e `materiais` são passados, MATERIAIS QUE JÁ TÊM
 * PREÇO CADASTRADO HOJE são EXCLUÍDOS do ranking — assim a lista mostra só
 * pendências que de fato continuam sem solução. Pendências antigas resolvidas
 * basta o engenheiro reprocessar os orçamentos para sumirem do snapshot.
 *
 * Critério de "tem preço hoje": existe `PrecoMaterial` E ele é incorporável
 * (unidade bate com a do material OU tem `fator_conversao` definido).
 */
export function pendencias_mais_frequentes(
  orcamentos: OrcamentoSalvo[],
  n: number,
  precos_efetivos?: Map<number, PrecoMaterial>,
  materiais?: Map<number, Material>,
): MaterialPendente[] {
  function ja_resolvido(material_id: number): boolean {
    if (!precos_efetivos) return false;
    const preco = precos_efetivos.get(material_id);
    if (!preco) return false;
    if (!materiais) return true;            // só preço existindo já é sinal
    const material = materiais.get(material_id);
    if (!material) return false;
    const precisa_fator = preco.unidade_preco !== material.unidade;
    if (precisa_fator && preco.fator_conversao == null) return false;
    return true;
  }

  const map = new Map<number, MaterialPendente>();
  for (const o of orcamentos) {
    // Considera apenas pendências por preço faltando (não as outras causas)
    const ids_pend = new Set<number>();
    for (const p of o.orcamento.pendentes) {
      if (p.motivo === "sem_preco") ids_pend.add(p.material_id);
    }
    for (const id of ids_pend) {
      if (ja_resolvido(id)) continue;       // já tem preço hoje — sai do ranking
      const desc =
        o.orcamento.pendentes.find((p) => p.material_id === id)?.descricao
        ?? `Material #${id}`;
      const r = map.get(id);
      if (r) r.qtd_aparicoes++;
      else map.set(id, { material_id: id, descricao: desc, qtd_aparicoes: 1 });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.qtd_aparicoes - a.qtd_aparicoes)
    .slice(0, n);
}
