// Filtros + ordenação para a tela de Consulta de Orçamentos.
// Funções puras — sem dependência de store, DOM ou storage.

import type { OrcamentoSalvo, StatusOrcamento } from "./types";

export interface FiltrosConsulta {
  busca: string;                       // casa em numero, meta.obra, observacoes
  cliente_ids: string[] | null;        // null = todos; [] = só os sem cliente
  status: StatusOrcamento[] | null;    // null = todos
  inicio: string | null;               // ISO date salvo_em >= inicio
  fim: string | null;                  // ISO date salvo_em <= fim
  valor_min_centavos: number | null;
  valor_max_centavos: number | null;
  incluir_excluidos: boolean;
  apenas_vencidos?: boolean;           // se true, mostra só com validade < hoje
}

/**
 * Indica se a validade do orçamento já passou. Vencidos são orçamentos
 * cuja `validade_orcamento` (YYYY-MM-DD) é estritamente anterior a `hoje`.
 * Orçamento sem validade nunca está vencido.
 */
export function orcamento_vencido(
  validade_iso: string | null | undefined,
  hoje: Date = new Date(),
): boolean {
  if (!validade_iso) return false;
  // Comparação só pela data (zera horas locais)
  const v = new Date(`${validade_iso}T00:00:00`);
  if (Number.isNaN(v.getTime())) return false;
  const hoje0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return v.getTime() < hoje0.getTime();
}

export type CampoOrdenacao =
  | "numero"
  | "salvo_em"
  | "valor"
  | "status"
  | "versao";

export interface Ordenacao {
  campo: CampoOrdenacao;
  direcao: "asc" | "desc";
}

function normalizar(s: string): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filtrar_orcamentos_consulta(
  orcamentos: OrcamentoSalvo[],
  filtros: FiltrosConsulta,
): OrcamentoSalvo[] {
  const busca_norm = normalizar(filtros.busca.trim());

  return orcamentos.filter((o) => {
    if (!filtros.incluir_excluidos && o.excluido_em) return false;

    if (filtros.cliente_ids !== null) {
      // [] = "só os sem cliente" / contendo ids = "qualquer um dos marcados"
      const ids = filtros.cliente_ids;
      const ocid = o.cliente_id ?? null;
      if (ids.length === 0) {
        if (ocid !== null) return false;
      } else if (ocid === null || !ids.includes(ocid)) {
        return false;
      }
    }

    if (filtros.status && !filtros.status.includes(o.dados_documento.status)) {
      return false;
    }

    const dt = o.salvo_em.slice(0, 10);
    if (filtros.inicio && dt < filtros.inicio) return false;
    if (filtros.fim && dt > filtros.fim) return false;

    const total = o.orcamento.decomposicao.total_centavos;
    if (filtros.valor_min_centavos != null && total < filtros.valor_min_centavos) {
      return false;
    }
    if (filtros.valor_max_centavos != null && total > filtros.valor_max_centavos) {
      return false;
    }

    if (busca_norm) {
      const alvo = [
        o.dados_documento.numero ?? "",
        o.meta.obra ?? "",
        o.observacoes ?? "",
      ]
        .map(normalizar)
        .join(" ");
      if (!alvo.includes(busca_norm)) return false;
    }

    if (filtros.apenas_vencidos) {
      if (!orcamento_vencido(o.orcamento.validade_orcamento)) return false;
    }

    return true;
  });
}

export interface GrupoOrcamento {
  numero: string;
  principal: OrcamentoSalvo;   // versão exibida (maior versão; prefere não-excluída)
  outras: OrcamentoSalvo[];    // demais versões, desc por versão
}

/**
 * Agrupa orçamentos por `numero` para a Consulta não repetir o mesmo número
 * uma vez por versão (auditoria #3). A ordem dos grupos segue a primeira
 * aparição na lista recebida (já filtrada/ordenada).
 */
export function agrupar_por_numero(
  orcamentos: OrcamentoSalvo[],
): GrupoOrcamento[] {
  const map = new Map<string, OrcamentoSalvo[]>();
  const ordem: string[] = [];
  for (const o of orcamentos) {
    const k = o.dados_documento.numero ?? "";
    const arr = map.get(k);
    if (arr) {
      arr.push(o);
    } else {
      map.set(k, [o]);
      ordem.push(k);
    }
  }
  return ordem.map((k) => {
    const itens = map.get(k) as OrcamentoSalvo[];
    const ativos = itens.filter((o) => !o.excluido_em);
    const pool = ativos.length > 0 ? ativos : itens;
    const principal = pool.reduce((a, b) =>
      b.dados_documento.versao > a.dados_documento.versao ? b : a,
    );
    const outras = itens
      .filter((o) => o.id !== principal.id)
      .sort((a, b) => b.dados_documento.versao - a.dados_documento.versao);
    return { numero: k, principal, outras };
  });
}

export function ordenar_orcamentos(
  orcamentos: OrcamentoSalvo[],
  ordenacao: Ordenacao,
): OrcamentoSalvo[] {
  const arr = [...orcamentos];
  const dir = ordenacao.direcao === "asc" ? 1 : -1;

  arr.sort((a, b) => {
    let cmp = 0;
    switch (ordenacao.campo) {
      case "numero":
        cmp = (a.dados_documento.numero ?? "").localeCompare(
          b.dados_documento.numero ?? "",
          "pt-BR",
          { numeric: true },
        );
        break;
      case "salvo_em":
        cmp = a.salvo_em.localeCompare(b.salvo_em);
        break;
      case "valor":
        cmp =
          a.orcamento.decomposicao.total_centavos -
          b.orcamento.decomposicao.total_centavos;
        break;
      case "status":
        cmp = a.dados_documento.status.localeCompare(b.dados_documento.status);
        break;
      case "versao":
        cmp = a.dados_documento.versao - b.dados_documento.versao;
        break;
    }
    return cmp * dir;
  });

  return arr;
}
