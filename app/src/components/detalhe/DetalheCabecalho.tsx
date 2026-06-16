import type {
  Cliente,
  OrcamentoSalvo,
} from "../../lib/orcamento/types";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";
import {
  formatar_cnpj_cpf,
  tipo_documento,
} from "../../lib/orcamento/clientesHelpers";
import { orcamento_vencido } from "../../lib/orcamento/consulta";
import { useStore } from "../../store";

function fmt_data_hora(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch {
    return iso;
  }
}

function fmt_data_br(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const STATUS_BADGE = {
  rascunho:  { label: "Rascunho",  cor: "bg-slate-100 text-slate-700" },
  enviado:   { label: "Enviado",   cor: "bg-sky-100 text-sky-800" },
  aprovado:  { label: "Aprovado",  cor: "bg-emerald-100 text-emerald-800" },
  recusado:  { label: "Recusado",  cor: "bg-red-100 text-red-800" },
  expirado:  { label: "Expirado",  cor: "bg-amber-100 text-amber-800" },
} as const;

interface Props {
  salvo: OrcamentoSalvo;
  cliente: Cliente | null;
  onRenovarValidade?: () => void;
}

export function DetalheCabecalho({ salvo, cliente, onRenovarValidade }: Props) {
  const setView = useStore((s) => s.setView);
  const status = STATUS_BADGE[salvo.dados_documento.status];
  const total = salvo.orcamento.decomposicao.total_centavos;
  const parcial = salvo.orcamento.total_parcial;
  const eh_vencido = orcamento_vencido(salvo.orcamento.validade_orcamento);

  const cliente_excluido = cliente?.excluido_em;
  const primeiro_contato = cliente?.contatos[0];
  const primeiro_endereco = cliente?.enderecos[0];

  function abrir_perfil_cliente() {
    if (cliente) setView({ name: "cliente_detalhe", id: cliente.id });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold text-slate-900">
          {salvo.dados_documento.numero}
        </span>
        <span className="text-sm text-slate-500">
          · v{salvo.dados_documento.versao}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${status.cor}`}
        >
          {status.label}
        </span>
        {eh_vencido && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800" title="Validade do orçamento no passado">
            ⚠ Vencido
          </span>
        )}
      </div>

      <dl className="space-y-1.5 text-xs">
        <Linha rotulo="Cliente">
          {cliente ? (
            <div>
              <button
                onClick={abrir_perfil_cliente}
                className="cursor-pointer text-left font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                title="Abrir perfil do cliente"
              >
                {cliente.nome}
              </button>
              {cliente_excluido && (
                <span className="ml-1.5 rounded bg-slate-200 px-1 text-[10px] font-normal text-slate-600">
                  excluído
                </span>
              )}
              {cliente.cnpj_cpf && (
                <div className="mt-0.5 text-slate-500">
                  {tipo_documento(cliente.cnpj_cpf)}{" "}
                  {formatar_cnpj_cpf(cliente.cnpj_cpf)}
                </div>
              )}
              {primeiro_contato && (
                <div className="text-slate-500">
                  {primeiro_contato.nome && (
                    <span>{primeiro_contato.nome}</span>
                  )}
                  {primeiro_contato.email && (
                    <span> · 📧 {primeiro_contato.email}</span>
                  )}
                  {primeiro_contato.telefone && (
                    <span> · 📞 {primeiro_contato.telefone}</span>
                  )}
                </div>
              )}
              {primeiro_endereco?.municipio && (
                <div className="text-slate-500">
                  {primeiro_endereco.municipio}
                  {primeiro_endereco.uf ? ` / ${primeiro_endereco.uf}` : ""}
                </div>
              )}
            </div>
          ) : salvo.cliente_id ? (
            <span className="italic text-slate-400">Cliente não encontrado (excluído ou removido)</span>
          ) : (
            <span className="text-slate-700">{salvo.meta.obra || "—"}</span>
          )}
        </Linha>

        {salvo.meta.obra && cliente && (
          <Linha rotulo="Obra">{salvo.meta.obra}</Linha>
        )}

        {salvo.meta.endereco && (
          <Linha rotulo="Endereço">
            {salvo.meta.endereco}
            {salvo.meta.municipio ? ` · ${salvo.meta.municipio}` : ""}
          </Linha>
        )}

        {salvo.meta.responsavel && (
          <Linha rotulo="Responsável">{salvo.meta.responsavel}</Linha>
        )}

        <Linha rotulo="Salvo em">
          <span className="tabular-nums">{fmt_data_hora(salvo.salvo_em)}</span>
        </Linha>

        <Linha rotulo="Validade">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`tabular-nums ${eh_vencido ? "text-amber-700" : ""}`}>
              {fmt_data_br(salvo.orcamento.validade_orcamento)}
            </span>
            {onRenovarValidade && (
              <button
                onClick={onRenovarValidade}
                className="rounded border border-sky-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-sky-700 hover:bg-sky-50"
                title="Estender a validade do orçamento"
              >
                ↻ Renovar
              </button>
            )}
          </div>
        </Linha>

        {salvo.dados_documento.condicoes_pagamento && (
          <Linha rotulo="Pagamento">
            {salvo.dados_documento.condicoes_pagamento}
          </Linha>
        )}

        {salvo.dados_documento.prazo_execucao && (
          <Linha rotulo="Prazo">
            {salvo.dados_documento.prazo_execucao}
          </Linha>
        )}

        {salvo.observacoes && (
          <Linha rotulo="Observações">{salvo.observacoes}</Linha>
        )}

        {salvo.observacoes_imposto && (
          <Linha rotulo="Imposto">{salvo.observacoes_imposto}</Linha>
        )}
      </dl>

      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Total{parcial ? " (parcial)" : ""}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${
            parcial ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {formatar_centavos_brl(total)}
        </span>
      </div>
    </div>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <dt className="w-24 shrink-0 text-slate-500">{rotulo}</dt>
      <dd className="min-w-0 flex-1 text-slate-800">{children}</dd>
    </div>
  );
}
