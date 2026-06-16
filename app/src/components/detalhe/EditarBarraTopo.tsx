import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

interface Props {
  mudancas_pendentes: number;
  total_atual_centavos: number;
  total_parcial: boolean;
  onSalvar: () => void;
  onDescartar: () => void;
}

export function EditarBarraTopo({
  mudancas_pendentes,
  total_atual_centavos,
  total_parcial,
  onSalvar,
  onDescartar,
}: Props) {
  const tem_mudancas = mudancas_pendentes > 0;
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 border-y-2 border-amber-300 bg-amber-50 px-4 py-2 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <div className="flex-1">
          {tem_mudancas ? (
            <div className="text-sm font-semibold text-amber-900">
              ✏ {mudancas_pendentes}{" "}
              {mudancas_pendentes === 1
                ? "mudança não salva"
                : "mudanças não salvas"}
            </div>
          ) : (
            <div className="text-sm font-medium text-amber-900">
              📝 Modo edição — nenhuma mudança ainda
            </div>
          )}
          <div className="text-[11px] text-amber-700">
            Total atual:{" "}
            <span className="font-semibold tabular-nums">
              {formatar_centavos_brl(total_atual_centavos)}
            </span>
            {total_parcial && " (parcial)"}
          </div>
        </div>
        <button
          onClick={onDescartar}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Descartar
        </button>
        <button
          onClick={onSalvar}
          disabled={!tem_mudancas}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          💾 Salvar mudanças
        </button>
      </div>
    </div>
  );
}
