import type { KPIs } from "../../lib/orcamento/relatorios";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

const fmt_pct = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

interface Props {
  kpis: KPIs;
}

export function RelatoriosKPI({ kpis }: Props) {
  return (
    <div className="space-y-3">
      {/* Linha 1: Em aberto vs Aprovados — pedido específico da Correção 4 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CartaoDestaque
          titulo="Em aberto (enviado)"
          valor={formatar_centavos_brl(kpis.total_em_aberto_centavos)}
          sub={
            kpis.qtd_enviados > 0
              ? `${kpis.qtd_enviados} ${kpis.qtd_enviados === 1 ? "orçamento" : "orçamentos"} aguardando decisão`
              : "nenhum aguardando"
          }
          variante="sky"
        />
        <CartaoDestaque
          titulo="Aprovados"
          valor={formatar_centavos_brl(kpis.total_aprovados_centavos)}
          sub={
            kpis.qtd_aprovados > 0
              ? `${kpis.qtd_aprovados} ${kpis.qtd_aprovados === 1 ? "orçamento aprovado" : "orçamentos aprovados"}`
              : "nenhum aprovado"
          }
          variante="emerald"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Cartao
          titulo="Total geral"
          valor={formatar_centavos_brl(kpis.total_centavos)}
          sub={`${kpis.qtd_orcamentos} ${kpis.qtd_orcamentos === 1 ? "orçamento" : "orçamentos"}`}
        />
        <Cartao
          titulo="Ticket médio"
          valor={
            kpis.ticket_medio_centavos != null
              ? formatar_centavos_brl(kpis.ticket_medio_centavos)
              : "—"
          }
          sub={
            kpis.qtd_aprovados > 0
              ? `${kpis.qtd_aprovados} ${kpis.qtd_aprovados === 1 ? "aprovado" : "aprovados"}`
              : "sem aprovados"
          }
        />
        <Cartao
          titulo="Conversão"
          valor={
            kpis.conversao_pct != null ? `${fmt_pct.format(kpis.conversao_pct)}%` : "—"
          }
          sub={
            kpis.conversao_pct != null
              ? `${kpis.qtd_aprovados} de ${kpis.qtd_aprovados + kpis.qtd_recusados + kpis.qtd_expirados} decididos`
              : "sem decididos"
          }
        />
        <Cartao
          titulo="Pendentes (parciais)"
          valor={String(
            kpis.qtd_orcamentos -
              kpis.qtd_aprovados -
              kpis.qtd_recusados -
              kpis.qtd_expirados,
          )}
          sub={`${kpis.qtd_rascunhos} rascunho(s) · ${kpis.qtd_enviados} enviado(s)`}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        Por status:{" "}
        <Tag label="Rascunho" qtd={kpis.qtd_rascunhos} cor="bg-slate-100 text-slate-700" />
        <Tag label="Enviado" qtd={kpis.qtd_enviados} cor="bg-sky-100 text-sky-800" />
        <Tag label="Aprovado" qtd={kpis.qtd_aprovados} cor="bg-emerald-100 text-emerald-800" />
        <Tag label="Recusado" qtd={kpis.qtd_recusados} cor="bg-red-100 text-red-800" />
        <Tag label="Expirado" qtd={kpis.qtd_expirados} cor="bg-amber-100 text-amber-800" />
      </div>
    </div>
  );
}

function CartaoDestaque({
  titulo,
  valor,
  sub,
  variante,
}: {
  titulo: string;
  valor: string;
  sub: string;
  variante: "sky" | "emerald";
}) {
  const cls =
    variante === "sky"
      ? "border-sky-300 bg-sky-50"
      : "border-emerald-300 bg-emerald-50";
  const cor_titulo =
    variante === "sky" ? "text-sky-700" : "text-emerald-700";
  const cor_valor =
    variante === "sky" ? "text-sky-900" : "text-emerald-900";
  return (
    <div className={`rounded-lg border-2 p-4 ${cls}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${cor_titulo}`}>
        {titulo}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${cor_valor}`}>
        {valor}
      </div>
      <div className={`mt-1 text-xs ${cor_titulo}`}>{sub}</div>
    </div>
  );
}

function Cartao({
  titulo,
  valor,
  sub,
}: {
  titulo: string;
  valor: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{titulo}</div>
      <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">
        {valor}
      </div>
      <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function Tag({
  label,
  qtd,
  cor,
}: {
  label: string;
  qtd: number;
  cor: string;
}) {
  return (
    <span className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${cor}`}>
      {label}: {qtd}
    </span>
  );
}
