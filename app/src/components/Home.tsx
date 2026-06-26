import { useStore } from "../store";
import { SECTIONS } from "../lib/secoes";

export function Home() {
  const categorias = useStore((s) => s.categorias);
  const byCat = useStore((s) => s.estruturasByCategoria);
  const setView = useStore((s) => s.setView);

  function cardTitle(cat: string) {
    return cat
      .replace(" — Rural (NDU 005)", "")
      .replace(" (NDU 005)", "")
      .replace(" (NDU 004.3)", "")
      .replace(" (NDU 004.1)", "")
      .replace("Transformadores ", "");
  }

  function Card({ cat }: { cat: string }) {
    const n = byCat.get(cat)?.length ?? 0;
    const neutro = cat.includes("Neutro");
    const trafo = cat.startsWith("Transformadores");
    const isBT = cat.includes("Baixa Tens");
    const isIP = cat.includes("Ilumina");
    const is345 = cat.includes("34,5") || cat.includes("34.5");
    const kv = neutro ? "Neutro"
      : trafo ? (is345 ? "34,5 kV" : "13,8 kV")
      : isBT ? "BT"
      : isIP ? "IP"
      : is345 ? "34,5 kV"
      : cat.includes("24,2") ? "24,2 kV"
      : "13,8 kV";
    const accent = neutro ? "from-emerald-500 to-teal-600"
      : trafo ? "from-violet-500 to-purple-600"
      : isBT ? "from-teal-500 to-cyan-600"
      : isIP ? "from-amber-400 to-yellow-500"
      : is345 ? "from-amber-500 to-orange-600"
      : "from-sky-500 to-blue-600";
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
      {/* Iniciar Rede — destaque principal */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-7 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Gerador de Relação de Materiais</h1>
            <p className="mt-1 max-w-md text-sm text-sky-100">
              Monte a relação completa de materiais para a obra —
              estruturas de rede, transformadores e medição.
            </p>
          </div>
          <button
            onClick={() => setView({ name: "wizard_tensao" })}
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-50"
          >
            + Iniciar Rede
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-700">Catálogo de estruturas</h2>
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
