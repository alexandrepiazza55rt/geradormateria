import { useState } from "react";

interface Props {
  validade_atual: string;          // ISO YYYY-MM-DD
  onConfirmar: (nova_validade_iso: string) => void;
  onFechar: () => void;
}

// Sugere "hoje + N dias" como atalho para o caso comum: orçamento vencido e
// engenheiro quer reaproveitar dando mais 30 ou 60 dias de validade.
function sugestao_dias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function RenovarValidadeModal({ validade_atual, onConfirmar, onFechar }: Props) {
  const [valor, set_valor] = useState(validade_atual || sugestao_dias(30));

  function aplicar(iso: string) {
    set_valor(iso);
  }

  function confirmar() {
    if (!valor) return;
    onConfirmar(valor);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-3"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-800">↻ Renovar validade</h3>
        <p className="mt-1 text-xs text-slate-600">
          Atualiza só a data de validade do orçamento. <strong>Não cria nova
          versão</strong> — é só um ajuste de prazo. A mudança fica registrada
          no histórico.
        </p>

        <label className="mt-3 block text-xs text-slate-700">
          Nova validade
          <input
            type="date"
            value={valor}
            onChange={(e) => set_valor(e.target.value)}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </label>

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-[10px] text-slate-500">Atalhos:</span>
          {[15, 30, 60, 90].map((n) => (
            <button
              key={n}
              onClick={() => aplicar(sugestao_dias(n))}
              className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-sky-50 hover:text-sky-700"
            >
              hoje + {n}d
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onFechar}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!valor}
            className="rounded bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:bg-slate-300"
          >
            Renovar
          </button>
        </div>
      </div>
    </div>
  );
}
