import { useStore } from "../store";
import { SECTIONS } from "../lib/secoes";

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
    const is345 = cat.includes("34,5");
    const kv = neutro ? "Neutro" : cat.includes("34,5") ? "34,5 kV" : cat.includes("24,2") ? "24,2 kV" : "13,8 kV";
    const accent = neutro ? "from-emerald-500 to-teal-600" : is345 ? "from-amber-500 to-orange-600" : "from-sky-500 to-blue-600";
    return (
      <button
        onClick={() => setView({ name: "categoria", categoria: cat })}
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-900">{cardTitle(cat)}</div>
            <div className="mt-1 text-sm text-slate-500">{n} estruturas</div>
          </div>
          <span className={`shrink-0 rounded-md bg-gradient-to-r ${accent} px-2 py-1 text-xs font-semibold text-white`}>{kv}</span>
        </div>
        <div className="mt-4 text-sm font-medium text-sky-700 group-hover:underline">Ver estruturas →</div>
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
        {SECTIONS.map((sec) => {
          const cats = categorias.filter(sec.test);
          if (cats.length === 0) return null;
          return (
            <section key={sec.titulo}>
              <div className="mb-3 flex items-baseline gap-2 border-b border-slate-200 pb-1.5">
                <h2 className="text-lg font-bold text-slate-800">{sec.titulo}</h2>
                <span className="text-xs text-slate-400">{sec.subtitulo}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cats.map((cat) => <Card key={cat} cat={cat} />)}
              </div>
            </section>
          );
        })}
      </div>

      {categorias.length === 0 && <p className="text-slate-500">Nenhuma categoria encontrada.</p>}
    </div>
  );
}
