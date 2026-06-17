interface Props {
  validade_preco_dias: number;
  validade_orcamento_dias: number;
  onChange: (preco_dias: number, orcamento_dias: number) => void;
}

export function SecaoValidades({
  validade_preco_dias,
  validade_orcamento_dias,
  onChange,
}: Props) {
  const erro_orc = validade_orcamento_dias < 0;

  return (
    <div className="space-y-3">
      <div className="rounded border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between text-sm">
          <div>
            <div className="text-slate-700">Orçamento gerado</div>
            <div className="text-[11px] text-slate-500">
              data de expiração mostrada no cabeçalho do documento
            </div>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={1}
              value={validade_orcamento_dias}
              onChange={(e) =>
                onChange(validade_preco_dias, Number(e.target.value))
              }
              className={`w-20 rounded border px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-1 ${
                erro_orc
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-300 focus:ring-sky-200"
              }`}
            />
            <span className="text-xs text-slate-500">dias</span>
          </div>
        </label>
      </div>
    </div>
  );
}
