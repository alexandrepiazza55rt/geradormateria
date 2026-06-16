import { Fragment, useState } from "react";
import type {
  Cliente,
  OrcamentoSalvo,
  StatusOrcamento,
} from "../../lib/orcamento/types";
import {
  orcamento_vencido,
  type CampoOrdenacao,
  type GrupoOrcamento,
  type Ordenacao,
} from "../../lib/orcamento/consulta";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

const STATUS_BADGE: Record<StatusOrcamento, { label: string; cor: string; corSelect: string }> = {
  rascunho:  { label: "Rascunho",  cor: "bg-slate-100 text-slate-700",   corSelect: "border-slate-300 bg-slate-50 text-slate-700" },
  enviado:   { label: "Enviado",   cor: "bg-sky-100 text-sky-800",       corSelect: "border-sky-300 bg-sky-50 text-sky-800" },
  aprovado:  { label: "Aprovado",  cor: "bg-emerald-100 text-emerald-800", corSelect: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  recusado:  { label: "Recusado",  cor: "bg-red-100 text-red-800",       corSelect: "border-red-300 bg-red-50 text-red-800" },
  expirado:  { label: "Expirado",  cor: "bg-amber-100 text-amber-800",   corSelect: "border-amber-300 bg-amber-50 text-amber-800" },
};

const STATUS_OPCOES: StatusOrcamento[] = ["rascunho", "enviado", "aprovado", "recusado", "expirado"];

function fmt_data_curta(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

interface Props {
  grupos: GrupoOrcamento[];
  clientesMap: Map<string, Cliente>;
  ordenacao: Ordenacao;
  onOrdenar: (o: Ordenacao) => void;
  onAbrir: (id: string) => void;
  onExportarPdf: (o: OrcamentoSalvo) => void;
  onExportarExcel: (o: OrcamentoSalvo) => void;
  onExcluir: (o: OrcamentoSalvo) => void;
  onRestaurar: (o: OrcamentoSalvo) => void;
  onMudarStatus: (o: OrcamentoSalvo, novo: StatusOrcamento) => void;
}

export function ConsultaLista({
  grupos,
  clientesMap,
  ordenacao,
  onOrdenar,
  onAbrir,
  onExportarPdf,
  onExportarExcel,
  onExcluir,
  onRestaurar,
  onMudarStatus,
}: Props) {
  const [expandidos, set_expandidos] = useState<Set<string>>(() => new Set());

  function toggle(numero: string) {
    set_expandidos((prev) => {
      const next = new Set(prev);
      if (next.has(numero)) next.delete(numero);
      else next.add(numero);
      return next;
    });
  }

  if (grupos.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
        Nenhum orçamento encontrado.
      </div>
    );
  }

  function ord(campo: CampoOrdenacao, label: string) {
    const ativo = ordenacao.campo === campo;
    const seta = ativo ? (ordenacao.direcao === "asc" ? " ▲" : " ▼") : "";
    return (
      <button
        onClick={() =>
          onOrdenar({
            campo,
            direcao:
              ativo && ordenacao.direcao === "desc" ? "asc" : "desc",
          })
        }
        className={`text-left ${ativo ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
      >
        {label}
        {seta}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-3 py-2 text-left">{ord("numero", "Número")}</th>
            <th className="hidden px-3 py-2 text-left sm:table-cell">Cliente / Obra</th>
            <th className="hidden px-3 py-2 text-left md:table-cell">{ord("salvo_em", "Salvo em")}</th>
            <th className="px-3 py-2 text-right">{ord("valor", "Valor")}</th>
            <th className="hidden px-3 py-2 text-center md:table-cell">{ord("status", "Status")}</th>
            <th className="hidden px-3 py-2 text-center sm:table-cell">{ord("versao", "v.")}</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((g) => {
            const aberto = expandidos.has(g.numero);
            const tem_outras = g.outras.length > 0;
            return (
              <Fragment key={g.numero}>
                <LinhaOrcamento
                  o={g.principal}
                  clientesMap={clientesMap}
                  expander={
                    tem_outras ? (
                      <button
                        onClick={() => toggle(g.numero)}
                        className="mt-0.5 inline-flex items-center gap-1 rounded text-[10px] font-medium text-sky-700 hover:underline"
                        title="Mostrar/ocultar versões anteriores"
                      >
                        {aberto ? "▾" : "▸"} {g.outras.length} versão(ões) anterior(es)
                      </button>
                    ) : null
                  }
                  onAbrir={onAbrir}
                  onExportarPdf={onExportarPdf}
                  onExportarExcel={onExportarExcel}
                  onExcluir={onExcluir}
                  onRestaurar={onRestaurar}
                  onMudarStatus={onMudarStatus}
                />
                {aberto &&
                  g.outras.map((o) => (
                    <LinhaOrcamento
                      key={o.id}
                      o={o}
                      clientesMap={clientesMap}
                      indent
                      onAbrir={onAbrir}
                      onExportarPdf={onExportarPdf}
                      onExportarExcel={onExportarExcel}
                      onExcluir={onExcluir}
                      onRestaurar={onRestaurar}
                      onMudarStatus={onMudarStatus}
                    />
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface LinhaProps {
  o: OrcamentoSalvo;
  clientesMap: Map<string, Cliente>;
  indent?: boolean;
  expander?: React.ReactNode;
  onAbrir: (id: string) => void;
  onExportarPdf: (o: OrcamentoSalvo) => void;
  onExportarExcel: (o: OrcamentoSalvo) => void;
  onExcluir: (o: OrcamentoSalvo) => void;
  onRestaurar: (o: OrcamentoSalvo) => void;
  onMudarStatus: (o: OrcamentoSalvo, novo: StatusOrcamento) => void;
}

function LinhaOrcamento({
  o,
  clientesMap,
  indent,
  expander,
  onAbrir,
  onExportarPdf,
  onExportarExcel,
  onExcluir,
  onRestaurar,
  onMudarStatus,
}: LinhaProps) {
  const cliente = o.cliente_id ? clientesMap.get(o.cliente_id) : null;
  const cliente_label = cliente?.nome || o.meta.obra || "—";
  const status = STATUS_BADGE[o.dados_documento.status];
  const excluido = !!o.excluido_em;
  return (
    <tr
      className={`border-t border-slate-100 ${
        excluido ? "bg-slate-50/60 text-slate-400" : "text-slate-800"
      } ${indent ? "bg-slate-50/40" : ""}`}
    >
      <td className={`px-3 py-2 ${indent ? "pl-8" : ""}`}>
        <div className="font-semibold">
          {indent && <span className="mr-1 text-slate-300">↳</span>}
          {o.dados_documento.numero}
          {orcamento_vencido(o.orcamento.validade_orcamento) && !excluido && (
            <span
              className="ml-1.5 inline-block rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-800"
              title="Validade do orçamento expirou"
            >
              ⚠ vencido
            </span>
          )}
          {excluido && (
            <span className="ml-1.5 inline-block rounded bg-slate-200 px-1 text-[10px] text-slate-600">
              excluído
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-400 sm:hidden">
          {cliente_label} · v{o.dados_documento.versao}
        </div>
        {expander}
      </td>
      <td className="hidden px-3 py-2 sm:table-cell">
        <div className="truncate text-sm" title={cliente_label}>
          {cliente?.nome ? (
            <>
              <span className="font-medium">{cliente.nome}</span>
              {o.meta.obra && (
                <span className="text-slate-400"> · {o.meta.obra}</span>
              )}
            </>
          ) : (
            <span className="text-slate-600">{o.meta.obra || "—"}</span>
          )}
        </div>
      </td>
      <td className="hidden px-3 py-2 text-xs text-slate-600 md:table-cell">
        {fmt_data_curta(o.salvo_em)}
      </td>
      <td className="px-3 py-2 text-right">
        <span
          className={`font-semibold tabular-nums ${
            o.orcamento.total_parcial ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {formatar_centavos_brl(o.orcamento.decomposicao.total_centavos)}
        </span>
        {o.orcamento.total_parcial && (
          <div className="text-[9px] text-amber-700">parcial</div>
        )}
      </td>
      <td className="hidden px-3 py-2 text-center md:table-cell">
        {excluido ? (
          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${status.cor}`}>
            {status.label}
          </span>
        ) : (
          <select
            value={o.dados_documento.status}
            onChange={(e) => onMudarStatus(o, e.target.value as StatusOrcamento)}
            title="Mudar status — registrado no histórico do orçamento"
            className={`cursor-pointer rounded border px-1.5 py-0.5 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-sky-200 ${status.corSelect}`}
          >
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>
                {STATUS_BADGE[s].label}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="hidden px-3 py-2 text-center text-xs tabular-nums sm:table-cell">
        v{o.dados_documento.versao}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex flex-wrap items-center justify-end gap-1">
          {!excluido ? (
            <>
              <button
                onClick={() => onAbrir(o.id)}
                className="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
              >
                📂 Abrir
              </button>
              <button
                onClick={() => onExportarPdf(o)}
                className="rounded border border-rose-300 bg-white px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                title="Exportar PDF"
              >
                PDF
              </button>
              <button
                onClick={() => onExportarExcel(o)}
                className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                title="Exportar Excel"
              >
                Excel
              </button>
              <button
                onClick={() => onExcluir(o)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
                title="Excluir (soft delete)"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => onRestaurar(o)}
              className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
            >
              ↺ Restaurar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
