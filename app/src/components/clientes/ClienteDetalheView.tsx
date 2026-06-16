import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type {
  Cliente,
  StatusOrcamento,
} from "../../lib/orcamento/types";
import {
  formatar_cnpj_cpf,
  tipo_documento,
} from "../../lib/orcamento/clientesHelpers";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";
import { ClienteForm } from "./ClienteForm";

const STATUS_BADGE: Record<StatusOrcamento, { label: string; cor: string }> = {
  rascunho:  { label: "Rascunho",  cor: "bg-slate-100 text-slate-700" },
  enviado:   { label: "Enviado",   cor: "bg-sky-100 text-sky-800" },
  aprovado:  { label: "Aprovado",  cor: "bg-emerald-100 text-emerald-800" },
  recusado:  { label: "Recusado",  cor: "bg-red-100 text-red-800" },
  expirado:  { label: "Expirado",  cor: "bg-amber-100 text-amber-800" },
};

function fmt_data_hora(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

interface Props {
  id: string;
}

export function ClienteDetalheView({ id }: Props) {
  const clientes = useStore((s) => s.clientes);
  const orcamentos = useStore((s) => s.orcamentosSalvos);
  const setView = useStore((s) => s.setView);
  const atualizarCliente = useStore((s) => s.atualizarCliente);
  const excluirCliente = useStore((s) => s.excluirCliente);
  const restaurarCliente = useStore((s) => s.restaurarCliente);

  const [form_aberto, set_form_aberto] = useState(false);

  const cliente: Cliente | null = useMemo(
    () => clientes.find((c) => c.id === id) ?? null,
    [clientes, id],
  );

  const orcamentos_do_cliente = useMemo(
    () => orcamentos.filter((o) => o.cliente_id === id && !o.excluido_em),
    [orcamentos, id],
  );

  const total_centavos = useMemo(
    () =>
      orcamentos_do_cliente.reduce(
        (s, o) => s + o.orcamento.decomposicao.total_centavos,
        0,
      ),
    [orcamentos_do_cliente],
  );

  function voltar() {
    setView({ name: "clientes" });
  }

  function handle_excluir() {
    if (!cliente) return;
    const n = orcamentos_do_cliente.length;
    const aviso =
      n > 0
        ? `Cliente "${cliente.nome}" tem ${n} orçamento(s) vinculado(s). Esses orçamentos vão perder o vínculo. Continuar?`
        : `Excluir cliente "${cliente.nome}"?`;
    if (!window.confirm(aviso)) return;
    excluirCliente(cliente.id);
  }

  function handle_salvar_edicao(c: Cliente) {
    atualizarCliente(c.id, c);
    set_form_aberto(false);
  }

  if (!cliente) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">Cliente não encontrado.</p>
        <button
          onClick={voltar}
          className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          ← Voltar para Clientes
        </button>
      </div>
    );
  }

  const excluido = !!cliente.excluido_em;
  const primeiro_contato = cliente.contatos[0];
  const primeiro_endereco = cliente.enderecos[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={voltar}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Voltar para Clientes
        </button>
        <div className="ml-auto flex gap-2">
          {!excluido ? (
            <>
              <button
                onClick={() => set_form_aberto(true)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ✏ Editar cliente
              </button>
              <button
                onClick={handle_excluir}
                className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                ✕ Excluir
              </button>
            </>
          ) : (
            <button
              onClick={() => restaurarCliente(cliente.id)}
              className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              ↺ Restaurar cliente
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-bold text-slate-900">{cliente.nome}</h1>
          {excluido && (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
              excluído
            </span>
          )}
        </div>

        <dl className="space-y-1.5 text-xs">
          {cliente.cnpj_cpf && (
            <Linha rotulo={tipo_documento(cliente.cnpj_cpf)}>
              <span className="tabular-nums">{formatar_cnpj_cpf(cliente.cnpj_cpf)}</span>
            </Linha>
          )}
          {primeiro_contato && (
            <Linha rotulo="Contato">
              {primeiro_contato.nome && <span>{primeiro_contato.nome}</span>}
              {primeiro_contato.email && <span> · 📧 {primeiro_contato.email}</span>}
              {primeiro_contato.telefone && <span> · 📞 {primeiro_contato.telefone}</span>}
            </Linha>
          )}
          {primeiro_endereco && (
            <Linha rotulo="Endereço">
              {primeiro_endereco.logradouro}
              {primeiro_endereco.numero ? `, ${primeiro_endereco.numero}` : ""}
              {primeiro_endereco.municipio ? ` · ${primeiro_endereco.municipio}` : ""}
              {primeiro_endereco.uf ? `/${primeiro_endereco.uf}` : ""}
            </Linha>
          )}
          {cliente.observacoes && (
            <Linha rotulo="Observações">{cliente.observacoes}</Linha>
          )}
        </dl>
      </div>

      {/* KPIs (simples: total + qtde) */}
      <div className="grid grid-cols-2 gap-3">
        <Cartao
          titulo="Total faturado"
          valor={formatar_centavos_brl(total_centavos)}
          sub="soma dos orçamentos vinculados (inclui parciais)"
        />
        <Cartao
          titulo="Orçamentos vinculados"
          valor={String(orcamentos_do_cliente.length)}
          sub={orcamentos_do_cliente.length === 0 ? "nenhum ainda" : "ativos"}
        />
      </div>

      {/* Orçamentos */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Orçamentos vinculados ({orcamentos_do_cliente.length})
        </h3>
        {orcamentos_do_cliente.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
            Este cliente ainda não tem orçamentos. Crie um em{" "}
            <span className="font-semibold">Lista de Obra</span>.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Número</th>
                  <th className="hidden px-3 py-2 text-left md:table-cell">Obra</th>
                  <th className="px-3 py-2 text-left">Salvo em</th>
                  <th className="hidden px-3 py-2 text-center md:table-cell">Status</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2 text-right">—</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos_do_cliente
                  .slice()
                  .sort((a, b) => b.salvo_em.localeCompare(a.salvo_em))
                  .map((o) => {
                    const status = STATUS_BADGE[o.dados_documento.status];
                    return (
                      <tr key={o.id} className="border-t border-slate-100 text-slate-800">
                        <td className="px-3 py-2 font-semibold">
                          {o.dados_documento.numero}{" "}
                          <span className="text-slate-400">v{o.dados_documento.versao}</span>
                        </td>
                        <td className="hidden px-3 py-2 text-slate-600 md:table-cell">
                          {o.meta.obra || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {fmt_data_hora(o.salvo_em)}
                        </td>
                        <td className="hidden px-3 py-2 text-center md:table-cell">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${status.cor}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          <span className={o.orcamento.total_parcial ? "text-amber-700" : "text-slate-900"}>
                            {formatar_centavos_brl(o.orcamento.decomposicao.total_centavos)}
                          </span>
                          {o.orcamento.total_parcial && (
                            <div className="text-[9px] text-amber-700">parcial</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setView({ name: "detalhe", id: o.id })}
                            className="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-700"
                          >
                            📂 Abrir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Contatos e endereços completos */}
      {(cliente.contatos.length > 1 || cliente.enderecos.length > 1) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cliente.contatos.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Contatos ({cliente.contatos.length})
              </h3>
              <ul className="space-y-2 text-xs">
                {cliente.contatos.map((c) => (
                  <li key={c.id} className="border-b border-slate-100 pb-2 last:border-0">
                    <div className="font-medium text-slate-800">
                      {c.nome || "(sem nome)"}
                      {c.funcao && <span className="text-slate-400"> · {c.funcao}</span>}
                    </div>
                    {c.email && <div className="text-slate-500">📧 {c.email}</div>}
                    {c.telefone && <div className="text-slate-500">📞 {c.telefone}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cliente.enderecos.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Endereços ({cliente.enderecos.length})
              </h3>
              <ul className="space-y-2 text-xs">
                {cliente.enderecos.map((e) => (
                  <li key={e.id} className="border-b border-slate-100 pb-2 last:border-0">
                    {e.rotulo && (
                      <div className="font-medium text-slate-700">{e.rotulo}</div>
                    )}
                    <div className="text-slate-600">
                      {e.logradouro}
                      {e.numero ? `, ${e.numero}` : ""}
                      {e.complemento ? ` - ${e.complemento}` : ""}
                    </div>
                    {(e.bairro || e.municipio || e.uf || e.cep) && (
                      <div className="text-slate-500">
                        {e.bairro && `${e.bairro}`}
                        {e.municipio && ` · ${e.municipio}`}
                        {e.uf && `/${e.uf}`}
                        {e.cep && ` · CEP ${e.cep}`}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {form_aberto && (
        <ClienteForm
          cliente={cliente}
          onSalvar={handle_salvar_edicao}
          onCancelar={() => set_form_aberto(false)}
        />
      )}
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
      <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{valor}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}
