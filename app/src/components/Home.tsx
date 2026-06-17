import { useStore } from "../store";
import { categoriasPorSecao } from "../lib/secoes";

export function Home() {
  const categorias = useStore((s) => s.categorias);
  const byCat = useStore((s) => s.estruturasByCategoria);
  const setView = useStore((s) => s.setView);

  function cardTitle(cat: string) {
    return cat.replace(" — Rural (NDU 005)", "").replace(" (NDU 005)", "");
  }

  function Card({ cat }: { cat: string }) {
    const n = byCat.get(cat)?.length ?? 0;
    const neutro = cat.includes("Neutro");
    const kv = neutro ? "Neutro" : cat.includes("34,5") ? "34,5 kV" : cat.includes("24,2") ? "24,2 kV" : "13,8 kV";
    return (
      <button
        onClick={() => setView({ name: "categoria", categoria: cat })}
        className="flex items-start justify-between gap-2 border border-slate-300 bg-white p-4 text-left hover:border-sky-500 hover:bg-slate-50"
      >
        <div>
          <div className="font-semibold text-slate-900">{cardTitle(cat)}</div>
          <div className="mt-1 text-sm text-slate-500">{n} estruturas</div>
          <div className="mt-3 text-sm font-medium text-sky-700">Ver estruturas →</div>
        </div>
        <span className="shrink-0 border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{kv}</span>
      </button>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gerador de Relação de Materiais</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Escolha a seção e a categoria, selecione as estruturas e quantidades, e gere a relação
          consolidada de materiais da obra.
        </p>
      </div>

      <div className="space-y-8">
        {categoriasPorSecao(categorias).map((sec) => (
          <section key={sec.titulo}>
            <div className="mb-3 flex items-baseline gap-2 border-b border-slate-200 pb-1.5">
              <h2 className="text-lg font-bold text-slate-800">{sec.titulo}</h2>
              <span className="text-xs text-slate-400">{sec.subtitulo}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sec.cats.map((cat) => <Card key={cat} cat={cat} />)}
            </div>
          </section>
        ))}
      </div>

      {categorias.length === 0 && <p className="text-slate-500">Nenhuma categoria encontrada.</p>}
    </div>
  );
}
