import type { ConfigMargem } from "../../lib/orcamento/types";

interface Props {
  value: ConfigMargem;
  onChange: (v: ConfigMargem) => void;
}

function explicar_formula(tipo: ConfigMargem["tipo"], pct: number): string {
  if (tipo === "markup") {
    const fator = (1 + pct / 100).toFixed(4).replace(/\.?0+$/, "");
    return `preço = custo × (1 + ${pct}/100) = custo × ${fator}`;
  }
  if (pct >= 100) return "margem ≥ 100% é inválida (divisão por zero)";
  const div = (1 - pct / 100).toFixed(4).replace(/\.?0+$/, "");
  const fator_aprox = (1 / (1 - pct / 100)).toFixed(4).replace(/\.?0+$/, "");
  return `preço = custo ÷ (1 − ${pct}/100) = custo ÷ ${div} ≈ custo × ${fator_aprox}`;
}

export function SecaoMargem({ value, onChange }: Props) {
  const erro_pct =
    value.pct < 0 || (value.tipo === "margem" && value.pct >= 100);

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="margem_tipo"
            checked={value.tipo === "markup"}
            onChange={() => onChange({ ...value, tipo: "markup" })}
          />
          Markup
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="margem_tipo"
            checked={value.tipo === "margem"}
            onChange={() => onChange({ ...value, tipo: "margem" })}
          />
          Margem
        </label>
      </div>

      <div className="rounded border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between text-sm">
          <span className="text-slate-700">Percentual</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={value.tipo === "margem" ? 99.99 : 999}
              step={0.1}
              value={value.pct}
              onChange={(e) => onChange({ ...value, pct: Number(e.target.value) })}
              className={`w-24 rounded border px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-1 ${
                erro_pct
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-300 focus:ring-sky-200"
              }`}
            />
            <span className="text-xs text-slate-500">%</span>
          </div>
        </label>
      </div>

      <div className="rounded border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
        <div className="font-medium">📐 Fórmula aplicada</div>
        <div className="mt-1 font-mono text-[11px]">
          {explicar_formula(value.tipo, value.pct)}
        </div>
        {erro_pct && (
          <div className="mt-1 font-medium text-red-700">
            ⚠ Percentual inválido — corrija antes de salvar.
          </div>
        )}
      </div>
    </div>
  );
}
