import { useMemo, useState } from "react";
import { useStore } from "../store";
import type { Estrutura } from "../types";
import { cleanLabel } from "../lib/format";
import { EstruturaCard } from "./EstruturaCard";
import { InsumoCard } from "./InsumoCard";

const CATEGORIA_NOTAS: Record<string, { titulo: string; texto: string }[]> = {
  "Baixa Tensão Isolada (NDU 004.3)": [
    {
      titulo: "As estruturas BT incluem postes?",
      texto:
        "Não. A descrição dos postes serve apenas para definir tamanhos de parafusos e cintas. Para obter os postes necessários, adicione-os separadamente após a SI-1T-3 — incluindo postes de trechos onde só há BT sem AT.",
    },
    {
      titulo: "Aterramento automático",
      texto:
        "As estruturas de fim de rede BT e BT c/ TRAFO (SI-3, SI-1T, SI-1-3T) e seccionamentos (SI-1S) orçam automaticamente seus aterramentos.",
    },
  ],
};

export function CategoriaView({ categoria }: { categoria: string }) {
  const byCat = useStore((s) => s.estruturasByCategoria);
  const insumosByCat = useStore((s) => s.insumosByCategoria);
  const setView = useStore((s) => s.setView);
  const [q, setQ] = useState("");
  const notas = CATEGORIA_NOTAS[categoria] ?? [];

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
        &#8592; Categorias
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">{categoria}</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar estrutura (ex.: N3, U1, estai)..."
          className="w-72 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      {notas.length > 0 && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          {notas.map((n) => (
            <div key={n.titulo}>
              <p className="text-sm font-semibold text-amber-800">{n.titulo}</p>
              <p className="mt-0.5 text-sm text-amber-700">{n.texto}</p>
            </div>
          ))}
        </div>
      )}

      {insumos.length > 0 && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-sky-800">Parâmetros da rede</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {insumos.map((i) => <InsumoCard key={i.id} insumo={i} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {grupos.map(([tipo, ests]) => (
          <EstruturaCard key={tipo} tipo={tipo} estruturas={ests} />
        ))}
      </div>

      {grupos.length === 0 && (
        <p className="text-slate-500">Nenhuma estrutura encontrada para &ldquo;{q}&rdquo;.</p>
      )}
    </div>
  );
}
