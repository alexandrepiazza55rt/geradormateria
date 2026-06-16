import type { DadosDocumento } from "../../lib/orcamento/documentoHelpers";
import type { StatusOrcamento } from "../../lib/orcamento/types";

const STATUS_OPCOES: { value: StatusOrcamento; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

interface Props {
  dados: DadosDocumento;
  onChange: (d: DadosDocumento) => void;
}

export function DadosDocumentoForm({ dados, onChange }: Props) {
  const set = (patch: Partial<DadosDocumento>) =>
    onChange({ ...dados, ...patch });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Dados do documento
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px_140px]">
        <label className="text-xs">
          <span className="text-slate-600">Número</span>
          <input
            value={dados.numero}
            onChange={(e) => set({ numero: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums"
          />
        </label>

        <label className="text-xs">
          <span className="text-slate-600">Versão</span>
          <input
            type="number"
            min={1}
            step={1}
            value={dados.versao}
            onChange={(e) =>
              set({
                versao: Math.max(1, Math.floor(Number(e.target.value) || 1)),
              })
            }
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums"
          />
        </label>

        <label className="text-xs">
          <span className="text-slate-600">Status</span>
          <select
            value={dados.status}
            onChange={(e) =>
              set({ status: e.target.value as StatusOrcamento })
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            {STATUS_OPCOES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block text-xs">
        <span className="text-slate-600">Condições de pagamento</span>
        <input
          value={dados.condicoes_pagamento}
          onChange={(e) => set({ condicoes_pagamento: e.target.value })}
          placeholder="ex.: 30/60/90 dd"
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>

      <label className="mt-3 block text-xs">
        <span className="text-slate-600">Prazo de execução</span>
        <input
          value={dados.prazo_execucao}
          onChange={(e) => set({ prazo_execucao: e.target.value })}
          placeholder="ex.: 30 dias após autorização"
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
    </div>
  );
}
