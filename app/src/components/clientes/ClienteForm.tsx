import { useState } from "react";
import type { Cliente } from "../../lib/orcamento/types";
import {
  formatar_cnpj_cpf,
  so_digitos,
  tipo_documento,
  valido_para_salvar,
} from "../../lib/orcamento/clientesHelpers";
import { ClienteContatosForm } from "./ClienteContatosForm";
import { ClienteEnderecosForm } from "./ClienteEnderecosForm";

function uuid_local(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function novo_cliente(): Cliente {
  const agora = new Date().toISOString();
  return {
    id: uuid_local(),
    nome: "",
    contatos: [],
    enderecos: [],
    criado_em: agora,
    atualizado_em: agora,
  };
}

interface Props {
  cliente?: Cliente;            // se ausente, modo "criar"
  onSalvar: (c: Cliente) => void;
  onCancelar: () => void;
}

export function ClienteForm({ cliente, onSalvar, onCancelar }: Props) {
  const [draft, setDraft] = useState<Cliente>(cliente ?? novo_cliente());
  const editando = !!cliente;

  const set = <K extends keyof Cliente>(field: K, value: Cliente[K]) =>
    setDraft({ ...draft, [field]: value });

  const cnpj_cpf_digitos = so_digitos(draft.cnpj_cpf ?? "");
  const tipo = tipo_documento(cnpj_cpf_digitos);
  const valido = valido_para_salvar(draft);

  function handle_salvar() {
    if (!valido) return;
    onSalvar(draft);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">
            {editando ? "Editar cliente" : "Novo cliente"}
          </h2>
          <button
            onClick={onCancelar}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Dados básicos
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <label className="text-xs">
                <span className="text-slate-600">Nome / Razão social *</span>
                <input
                  type="text"
                  value={draft.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  required
                  className={`mt-1 w-full rounded border px-2 py-1.5 text-sm ${
                    draft.nome.trim() ? "border-slate-300" : "border-red-300 bg-red-50"
                  }`}
                />
              </label>
              <label className="text-xs">
                <span className="text-slate-600">
                  CPF / CNPJ <span className="text-slate-400">({tipo})</span>
                </span>
                <input
                  type="text"
                  value={formatar_cnpj_cpf(draft.cnpj_cpf)}
                  onChange={(e) => set("cnpj_cpf", so_digitos(e.target.value))}
                  placeholder="00.000.000/0000-00 ou 000.000.000-00"
                  maxLength={18}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs">
              <span className="text-slate-600">Observações</span>
              <textarea
                value={draft.observacoes ?? ""}
                onChange={(e) => set("observacoes", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Contatos ({draft.contatos.length})
            </h3>
            <ClienteContatosForm
              contatos={draft.contatos}
              onChange={(contatos) => set("contatos", contatos)}
            />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Endereços ({draft.enderecos.length})
            </h3>
            <ClienteEnderecosForm
              enderecos={draft.enderecos}
              onChange={(enderecos) => set("enderecos", enderecos)}
            />
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            onClick={onCancelar}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handle_salvar}
            disabled={!valido}
            title={
              valido
                ? "Salvar cliente"
                : "Informe pelo menos o nome / razão social"
            }
            className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
