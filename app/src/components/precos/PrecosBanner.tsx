import { useMemo, useState } from "react";
import { useStore } from "../../store";
import { resolver_preco } from "../../lib/orcamento/precos";
import type { Consolidation } from "../../lib/bom";

export function PrecosBanner({ consolidation }: { consolidation: Consolidation }) {
  const oficiais = useStore((s) => s.precosOficiais);
  const overrides = useStore((s) => s.precosOverrides);
  const setView = useStore((s) => s.setView);
  const [aberto, setAberto] = useState(false);

  const pendentes = useMemo(() => {
    const arr: { id: number; descricao: string; qty: number }[] = [];
    for (const row of consolidation.rows) {
      const r = resolver_preco(row.material.id, oficiais, overrides);
      if (!r.preco) {
        arr.push({
          id: row.material.id,
          descricao: row.material.descricao,
          qty: row.quantidade,
        });
      }
    }
    arr.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
    return arr;
  }, [consolidation.rows, oficiais, overrides]);

  if (pendentes.length === 0) return null;

  return (
    <div className="border-t border-amber-200 bg-amber-50/60 p-3 text-xs">
      <div className="flex items-start gap-2">
        <span className="text-amber-700">⚠</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-amber-900">
            {pendentes.length}{" "}
            {pendentes.length === 1 ? "material sem preço" : "materiais sem preço"}{" "}
            cadastrado
          </div>
          <div className="mt-0.5 text-amber-800">
            O orçamento ficará parcial até cadastrar todos.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setAberto((v) => !v)}
              className="rounded border border-amber-300 bg-white px-2 py-1 text-amber-800 hover:bg-amber-100"
            >
              {aberto ? "Ocultar lista" : "Ver lista"}
            </button>
            <button
              onClick={() =>
                setView({
                  name: "precos",
                  filtros_iniciais: {
                    origem: "sem_preco",
                    apenas_obra: pendentes.map((p) => p.id),
                  },
                })
              }
              className="rounded bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700"
            >
              Cadastrar agora →
            </button>
          </div>
          {aberto && (
            <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto rounded border border-amber-200 bg-white p-2 text-[11px] text-slate-700">
              {pendentes.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">{p.descricao}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">×{p.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
