import { useState } from "react";
import type { Cliente } from "../../lib/orcamento/types";
import {
  formatar_cnpj_cpf,
  tipo_documento,
} from "../../lib/orcamento/clientesHelpers";

interface Props {
  clientes_ativos: Cliente[];
  // Quando confirmar: cliente escolhido (ou null para "exportar sem
  // proprietário"). Quem chama decide se persiste o vínculo ou só usa
  // pra esta exportação.
  onConfirmar: (cliente: Cliente | null) => void;
  onCancelar: () => void;
  formato_label: "PDF" | "Excel";
}

export function SeletorProprietarioModal({
  clientes_ativos,
  onConfirmar,
  onCancelar,
  formato_label,
}: Props) {
  const [busca, set_busca] = useState("");
  const [id_selecionado, set_id_selecionado] = useState<string | null>(null);

  const filtrados = busca.trim()
    ? clientes_ativos.filter((c) =>
        c.nome.toLowerCase().includes(busca.trim().toLowerCase()),
      )
    : clientes_ativos;

  const selecionado = id_selecionado
    ? clientes_ativos.find((c) => c.id === id_selecionado) ?? null
    : null;

  function confirmar_com_cliente() {
    if (selecionado) onConfirmar(selecionado);
  }
  function exportar_sem() {
    onConfirmar(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-3"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-800">
          Proprietário deste orçamento
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Esse orçamento não tem proprietário vinculado. Escolha um cliente
          do cadastro para aparecer no <strong>{formato_label}</strong>, ou
          exporte sem proprietário (igual a antes).
        </p>

        {clientes_ativos.length === 0 ? (
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
            Você ainda não tem clientes cadastrados. Cadastre na aba{" "}
            <strong>Clientes</strong> ou use a opção <strong>Exportar sem
            proprietário</strong> abaixo.
          </div>
        ) : (
          <>
            <input
              type="search"
              value={busca}
              onChange={(e) => set_busca(e.target.value)}
              placeholder="🔎 Buscar cliente..."
              className="mt-3 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
              autoFocus
            />
            <ul className="mt-2 max-h-[40vh] divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200">
              {filtrados.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-slate-400">
                  Nenhum cliente encontrado.
                </li>
              ) : (
                filtrados.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                      <input
                        type="radio"
                        name="cliente_seletor"
                        checked={id_selecionado === c.id}
                        onChange={() => set_id_selecionado(c.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-800" title={c.nome}>
                          {c.nome}
                        </div>
                        {c.cnpj_cpf && (
                          <div className="text-[10px] text-slate-500">
                            {tipo_documento(c.cnpj_cpf)} {formatar_cnpj_cpf(c.cnpj_cpf)}
                          </div>
                        )}
                      </div>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            onClick={onCancelar}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={exportar_sem}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar sem proprietário
          </button>
          <button
            onClick={confirmar_com_cliente}
            disabled={!selecionado}
            className="rounded bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Exportar com este cliente
          </button>
        </div>
      </div>
    </div>
  );
}
