import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Estrutura } from "../types";
import { cleanLabel } from "../lib/format";
import { EstruturaCard } from "./EstruturaCard";
import { InsumoCard } from "./InsumoCard";

export function CategoriaView({ categoria }: { categoria: string }) {
  const byCat = useStore((s) => s.estruturasByCategoria);
  const insumosByCat = useStore((s) => s.insumosByCategoria);
  const setView = useStore((s) => s.setView);
  const [q, setQ] = useState("");

  const insumos = (insumosByCat.get(categoria) ?? []).filter(
    (i) => Object.keys(i.bom).length > 0,
  );

  const grupos = useMemo(() => {
    const ests = byCat.get(categoria) ?? [];
    const map = new Map<string, Estrutura[]>();
    for (const e of ests) {
      // rural: group by tipo_base (so cruzeta becomes a selector); urban: by tipo
      const key = cleanLabel(e.tipo_base || e.tipo);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    let entries = [...map.entries()];
    const term = q.trim().toLowerCase();
    if (term) {
      entries = entries.filter(([tipo]) => tipo.toLowerCase().includes(term));
    }
    return entries;
  }, [byCat, categoria, q]);

  return (
    <div>
      <button
        onClick={() => setView({ name: "home" })}
        className="mb-3 text-sm font-medium text-sky-700 hover:underline"
      >
        ← Categorias
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">{categoria}</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar estrutura (ex.: N3, U1, estai)…"
          className="w-72 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {grupos.map(([tipo, ests]) => (
          <EstruturaCard key={tipo} tipo={tipo} estruturas={ests} />
        ))}
      </div>

      {grupos.length === 0 && (
        <p className="text-slate-500">Nenhuma estrutura encontrada para “{q}”.</p>
      )}

      {insumos.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Quantitativos da rede</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {insumos.map((i) => <InsumoCard key={i.id} insumo={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
