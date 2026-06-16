interface Props {
  value: number;                  // % (0..100)
  onChange: (v: number) => void;
}

export function SecaoImposto({ value, onChange }: Props) {
  const valor_limitado = Number.isFinite(value) ? value : 0;
  const invalido = valor_limitado < 0 || valor_limitado > 100;

  return (
    <div className="space-y-3">
      <div className="rounded border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between text-sm">
          <span className="text-slate-700">Imposto estimado</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={valor_limitado}
              onChange={(e) => onChange(Number(e.target.value))}
              className={`w-20 rounded border px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-1 ${
                invalido
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-300 focus:ring-sky-200"
              }`}
            />
            <span className="text-xs text-slate-500">%</span>
          </div>
        </label>
        {invalido && (
          <p className="mt-1 text-[11px] text-red-700">
            Valor inválido. Use entre 0 e 100.
          </p>
        )}
      </div>
      <p className="text-[11px] text-slate-500">
        ⓘ <strong>Informativo</strong> — esta porcentagem aparece como linha
        "Imposto estimado (X%)" no PDF e no Excel após o total, mas{" "}
        <strong>não altera o total final do orçamento</strong>. O total continua
        sendo Base + Margem − Desconto. Use 0 para esconder a linha.
      </p>
    </div>
  );
}
