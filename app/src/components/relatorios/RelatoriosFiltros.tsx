import type { FiltroRelatorio } from "../../lib/orcamento/relatorios";
import type { StatusOrcamento } from "../../lib/orcamento/types";

const STATUS_OPCOES: { value: StatusOrcamento; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

interface Props {
  filtro: FiltroRelatorio;
  onChange: (f: FiltroRelatorio) => void;
}

export function RelatoriosFiltros({ filtro, onChange }: Props) {
  const periodo_invalido =
    !!filtro.inicio && !!filtro.fim && filtro.inicio > filtro.fim;

  // Correção 5: troca pílulas por checkboxes explícitos + atalhos.
  const status_set = new Set(filtro.status ?? STATUS_OPCOES.map((o) => o.value));
  const todos_status_marcados =
    filtro.status === null || filtro.status.length === STATUS_OPCOES.length;
  function toggle_status(s: StatusOrcamento) {
    const atual = filtro.status ?? STATUS_OPCOES.map((o) => o.value);
    const novo = atual.includes(s)
      ? atual.filter((x) => x !== s)
      : [...atual, s];
    onChange({
      ...filtro,
      status: novo.length === STATUS_OPCOES.length ? null : novo,
    });
  }
  function selecionar_todos_status() {
    onChange({ ...filtro, status: null });
  }
  function limpar_status() {
    onChange({ ...filtro, status: [] });
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs">
          <span className="text-slate-600">Início</span>
          <input
            type="date"
            value={filtro.inicio ?? ""}
            onChange={(e) =>
              onChange({ ...filtro, inicio: e.target.value || null })
            }
            className="mt-1 block rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Fim</span>
          <input
            type="date"
            value={filtro.fim ?? ""}
            onChange={(e) =>
              onChange({ ...filtro, fim: e.target.value || null })
            }
            className="mt-1 block rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>

        <button
          onClick={() =>
            onChange({ inicio: null, fim: null, status: null })
          }
          className="ml-auto rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Limpar filtros
        </button>
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Status:</span>
          <button
            onClick={selecionar_todos_status}
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
              todos_status_marcados
                ? "border-sky-300 bg-sky-50 text-sky-700"
                : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Selecionar todos
          </button>
          <button
            onClick={limpar_status}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
          >
            Limpar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {STATUS_OPCOES.map((s) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={status_set.has(s.value)}
                onChange={() => toggle_status(s.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {periodo_invalido && (
        <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800">
          ⚠ Período inválido — data de início depois da data de fim.
        </div>
      )}
    </div>
  );
}
