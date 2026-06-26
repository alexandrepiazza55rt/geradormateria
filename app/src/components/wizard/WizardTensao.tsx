import { useStore } from "../../store";

const OPCOES = [
  { label: "Monofásico 13,8 kV", catRede: "Monofásico 13,8 kV",  kv: "13,8", accent: "from-sky-500 to-blue-600",     sub: "Rede urbana monofásica" },
  { label: "Trifásico 13,8 kV",  catRede: "Trifásico 13,8 kV",   kv: "13,8", accent: "from-sky-500 to-blue-600",     sub: "Rede urbana trifásica" },
  { label: "Monofásico 34,5 kV", catRede: "Monofásico 34,5 kV",  kv: "34,5", accent: "from-amber-500 to-orange-600", sub: "Rede urbana monofásica" },
  { label: "Trifásico 34,5 kV",  catRede: "Trifásico 34,5 kV",   kv: "34,5", accent: "from-amber-500 to-orange-600", sub: "Rede urbana trifásica" },
];

export function WizardTensao() {
  const setView = useStore((s) => s.setView);

  return (
    <div>
      <button
        onClick={() => setView({ name: "home" })}
        className="mb-3 text-sm font-medium text-sky-700 hover:underline"
      >
        &#8592; Início
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar Rede</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione o tipo de rede para começar a montar a relação de materiais
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {OPCOES.map((op) => (
          <button
            key={op.label}
            onClick={() => setView({ name: "wizard_rede", catRede: op.catRede, kv: op.kv })}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:shadow-lg"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${op.accent}`} />
            <span className={`inline-block rounded-lg bg-gradient-to-r ${op.accent} px-3 py-1 text-xs font-bold text-white`}>
              {op.kv} kV
            </span>
            <div className="mt-4 text-lg font-bold text-slate-900">{op.label}</div>
            <div className="mt-1 text-sm text-slate-500">{op.sub}</div>
            <div className="mt-5 text-sm font-semibold text-sky-700 group-hover:underline">
              Configurar materiais &#8594;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
