import { useState } from "react";
import type { Insumo } from "../types";
import { useStore } from "../store";

export function InsumoCard({ insumo }: { insumo: Insumo }) {
  const addInsumo = useStore((s) => s.addInsumo);
  const [qtd, setQtd] = useState(1);
  const [added, setAdded] = useState(false);
  const unidade = insumo.unidade || "un";
  const divisor = insumo.postes_por_haste;          // postes -> hastes
  const hastes = divisor ? Math.ceil(Math.max(0, qtd) / divisor) : 0;

  const onAdd = () => {
    const n = Number(qtd);
    if (!Number.isFinite(n) || n <= 0) return;
    // when entering postes, add the computed number of hastes (1 a cada N postes)
    addInsumo(insumo.id, divisor ? Math.ceil(n / divisor) : n);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{insumo.descricao}</h3>
      <div className="mt-3 flex items-end gap-2">
        <label className="text-xs font-medium text-slate-600">
          Quantidade ({unidade})
          <input
            type="number" min={0} step="any" value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={onAdd}
          className={`rounded-md px-3 py-2 text-sm font-medium text-white transition ${
            added ? "bg-emerald-600" : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {added ? "✓" : "Adicionar"}
        </button>
      </div>
      {divisor ? (
        <p className="mt-1.5 text-[11px] text-slate-500">→ {hastes} haste(s) (1 a cada {divisor} postes)</p>
      ) : null}
    </div>
  );
}
