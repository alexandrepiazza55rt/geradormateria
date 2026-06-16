import type { Cliente } from "../../lib/orcamento/types";
import { useStore } from "../../store";
import {
  formatar_cnpj_cpf,
  tipo_documento,
} from "../../lib/orcamento/clientesHelpers";

interface Props {
  clientes: Cliente[];
  onVer: (c: Cliente) => void;
  onEditar: (c: Cliente) => void;
  onExcluir: (c: Cliente) => void;
  onRestaurar: (c: Cliente) => void;
}

export function ClientesLista({
  clientes,
  onVer,
  onEditar,
  onExcluir,
  onRestaurar,
}: Props) {
  const orcamentosSalvos = useStore((s) => s.orcamentosSalvos);

  function n_orcamentos(cliente_id: string): number {
    return orcamentosSalvos.filter((o) => o.cliente_id === cliente_id).length;
  }

  if (clientes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
        Nenhum cliente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left">Nome / Razão social</th>
            <th className="px-3 py-2 text-left">CPF / CNPJ</th>
            <th className="hidden px-3 py-2 text-left sm:table-cell">Contatos</th>
            <th className="hidden px-3 py-2 text-right sm:table-cell">Orçam.</th>
            <th className="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => {
            const n_orcs = n_orcamentos(c.id);
            const excluido = !!c.excluido_em;
            return (
              <tr
                key={c.id}
                className={`border-t border-slate-100 ${
                  excluido ? "bg-slate-50/60 text-slate-400" : "text-slate-800"
                }`}
              >
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {c.nome}
                    {excluido && (
                      <span className="ml-1.5 inline-block rounded bg-slate-200 px-1 text-[10px] text-slate-600">
                        excluído
                      </span>
                    )}
                  </div>
                  {c.enderecos[0]?.municipio && (
                    <div className="text-[10px] text-slate-400">
                      {c.enderecos[0].municipio}
                      {c.enderecos[0].uf ? ` / ${c.enderecos[0].uf}` : ""}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-xs tabular-nums">
                  {c.cnpj_cpf ? (
                    <>
                      {formatar_cnpj_cpf(c.cnpj_cpf)}
                      <span className="ml-1 text-[10px] text-slate-400">
                        ({tipo_documento(c.cnpj_cpf)})
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="hidden px-3 py-2 text-xs sm:table-cell">
                  {c.contatos.length === 0 ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <>
                      <div className="truncate">
                        {c.contatos[0].nome || c.contatos[0].email || c.contatos[0].telefone}
                      </div>
                      {c.contatos.length > 1 && (
                        <div className="text-[10px] text-slate-400">
                          + {c.contatos.length - 1}
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="hidden px-3 py-2 text-right text-xs tabular-nums sm:table-cell">
                  {n_orcs > 0 ? (
                    <span className="font-semibold text-slate-700">{n_orcs}</span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <button
                      onClick={() => onVer(c)}
                      className="rounded bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-700"
                    >
                      📂 Ver
                    </button>
                    {!excluido ? (
                      <>
                        <button
                          onClick={() => onEditar(c)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          ✏ Editar
                        </button>
                        <button
                          onClick={() => onExcluir(c)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
                        >
                          ✕ Excluir
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onRestaurar(c)}
                        className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                      >
                        ↺ Restaurar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
