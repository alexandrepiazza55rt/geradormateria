import { useMemo } from "react";
import type { FiltrosPrecos } from "../../lib/orcamento/precos";

interface Props {
  filtros: FiltrosPrecos;
  onChange: (f: FiltrosPrecos) => void;
  categorias: string[];
  tem_filtro_obra: boolean;
  qtd_obra: number;
}

export function PrecosFiltros({
  filtros, onChange, categorias, tem_filtro_obra, qtd_obra,
}: Props) {
  const set = (patch: Partial<FiltrosPrecos>) => onChange({ ...filtros, ...patch });

  const cats_ordenadas = useMemo(() => [...categorias].sort(), [categorias]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={filtros.busca}
          onChange={(e) => set({ busca: e.target.value })}
          placeholder="🔎 Buscar descrição..."
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        <select
          value={filtros.categoria ?? ""}
          onChange={(e) => set({ categoria: e.target.value || null })}
          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {cats_ordenadas.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filtros.origem}
          onChange={(e) => set({ origem: e.target.value as FiltrosPrecos["origem"] })}
          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="oficial">🅞 Com preço oficial</option>
          <option value="meu">🅼 Com preço meu</option>
          <option value="sem_preco">— Sem preço</option>
        </select>

        <select
          value={filtros.validade}
          onChange={(e) => set({ validade: e.target.value as FiltrosPrecos["validade"] })}
          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
        >
          <option value="todos">Toda validade</option>
          <option value="ok">✓ Válido</option>
          <option value="vencido">⚠ Vencido</option>
          <option value="sem_validade">○ Sem validade</option>
        </select>

        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={filtros.mostrar_todos_catalogo}
            onChange={(e) => set({ mostrar_todos_catalogo: e.target.checked })}
          />
          Mostrar todos do catálogo (não só usados)
        </label>
      </div>

      {tem_filtro_obra && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Apenas materiais desta obra ({qtd_obra})
            <button
              onClick={() => set({ apenas_obra: null })}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Remover filtro de obra"
            >
              ✕
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
