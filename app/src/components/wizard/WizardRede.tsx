import { useState, useMemo } from "react";
import { useStore } from "../../store";
import { cleanLabel } from "../../lib/format";
import { EstruturaCard } from "../EstruturaCard";
import { InsumoCard } from "../InsumoCard";

type Step = "estruturas" | "transformadores" | "medidor";

export function WizardRede() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const byCat = useStore((s) => s.estruturasByCategoria);
  const insumosByCat = useStore((s) => s.insumosByCategoria);
  const [step, setStep] = useState<Step>("estruturas");
  const [q, setQ] = useState("");

  if (view.name !== "wizard_rede") return null;
  const { catRede, kv } = view;

  const isTrifasico = catRede.startsWith("Trif");

  const STEPS: { id: Step; label: string }[] = [
    { id: "estruturas",      label: "1. Estruturas da Rede" },
    { id: "transformadores", label: "2. Transformadores" },
    { id: "medidor",         label: "3. Medi\u00e7\u00f5es c/ Mureta" },
  ];

  const insumos = (insumosByCat.get(catRede) ?? []).filter(
    (i) => Object.keys(i.bom).length > 0,
  );

  const redeGrupos = useMemo(() => {
    const ests = byCat.get(catRede) ?? [];
    const map = new Map<string, typeof ests>();
    for (const e of ests) {
      const key = cleanLabel(e.tipo_base || e.tipo);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    let entries = [...map.entries()];
    const term = q.trim().toLowerCase();
    if (term) entries = entries.filter(([t]) => t.toLowerCase().includes(term));
    return entries;
  }, [byCat, catRede, q]);

  const trafoGrupos = useMemo(() => {
    const cats = [
      `Transformadores Monofasicos ${kv} kV`,
      `Transformadores Trif\u00e1sicos ${kv} kV`,
    ];
    const ests = cats.flatMap((c) => byCat.get(c) ?? []);
    const map = new Map<string, typeof ests>();
    for (const e of ests) {
      const key = cleanLabel(e.tipo_base || e.tipo);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    let entries = [...map.entries()];
    const term = q.trim().toLowerCase();
    if (term) entries = entries.filter(([t]) => t.toLowerCase().includes(term));
    return entries;
  }, [byCat, kv, q]);

  const medidorGrupos = useMemo(() => {
    if (!isTrifasico) return [];
    const ests = byCat.get("Medi\u00e7\u00f5es Trif\u00e1sicas") ?? [];
    const map = new Map<string, typeof ests>();
    for (const e of ests) {
      const key = cleanLabel(e.tipo_base || e.tipo);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    let entries = [...map.entries()];
    const term = q.trim().toLowerCase();
    if (term) entries = entries.filter(([t]) => t.toLowerCase().includes(term));
    return entries;
  }, [byCat, isTrifasico, q]);

  const currentGrupos =
    step === "estruturas" ? redeGrupos :
    step === "transformadores" ? trafoGrupos :
    medidorGrupos;

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setView({ name: "wizard_tensao" })}
          className="font-medium text-sky-700 hover:underline"
        >
          &#8592; Tipo de rede
        </button>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-800">{catRede}</span>
      </div>

      {/* Abas de etapa */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {STEPS.map((s) => {
          const disabledMedidor = s.id === "medidor" && !isTrifasico;
          return (
            <button
              key={s.id}
              onClick={() => { if (!disabledMedidor) { setStep(s.id); setQ(""); } }}
              disabled={disabledMedidor}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                step === s.id
                  ? "bg-white text-sky-700 shadow-sm"
                  : disabledMedidor
                  ? "cursor-not-allowed text-slate-400"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Layout: sidebar + conteudo */}
      <div className="flex gap-5 items-start">
        {insumos.length > 0 && (
          <aside className="hidden w-64 shrink-0 xl:block">
            <div className="sticky top-20 rounded-xl border border-sky-200 bg-sky-50 p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-sky-800">
                Parâmetros da rede
              </h2>
              <div className="flex flex-col gap-3">
                {insumos.map((i) => (
                  <InsumoCard key={i.id} insumo={i} />
                ))}
              </div>
            </div>
          </aside>
        )}

        <div className="min-w-0 flex-1">
          {insumos.length > 0 && (
            <div className="mb-4 xl:hidden">
              <details className="rounded-xl border border-sky-200 bg-sky-50">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-sky-800">
                  Parâmetros da rede ({insumos.length} campos)
                </summary>
                <div className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2">
                  {insumos.map((i) => (
                    <InsumoCard key={i.id} insumo={i} />
                  ))}
                </div>
              </details>
            </div>
          )}

          <div className="mb-3 flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                step === "estruturas"
                  ? "Buscar estrutura (ex.: N3, U1, estai)..."
                  : step === "transformadores"
                  ? "Buscar transformador (ex.: 15 kVA, Sem CFu)..."
                  : "Buscar medi\u00e7\u00e3o (ex.: C/BARRAM, 45 kVA)..."
              }
              className="w-72 max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <span className="text-sm text-slate-400">{currentGrupos.length} tipo(s)</span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {currentGrupos.map(([tipo, ests]) => (
              <EstruturaCard key={tipo} tipo={tipo} estruturas={ests} />
            ))}
          </div>
          {currentGrupos.length === 0 && step === "medidor" && !isTrifasico && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Medi\u00e7\u00f5es com mureta dispon\u00edveis apenas para redes trif\u00e1sicas.
              </p>
            </div>
          )}
          {currentGrupos.length === 0 && (step !== "medidor" || isTrifasico) && (
            <p className="text-slate-500">Nenhuma estrutura encontrada.</p>
          )}

          {/* Navegacao */}
          <div className="mt-6 flex justify-between">
            <button
              disabled={stepIdx === 0}
              onClick={() => setStep(STEPS[stepIdx - 1].id)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
            >
              &#8592; Anterior
            </button>
            {stepIdx < STEPS.length - 1 && (
              <button
                onClick={() => { setStep(STEPS[stepIdx + 1].id); setQ(""); }}
                disabled={STEPS[stepIdx + 1].id === "medidor" && !isTrifasico}
                className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {STEPS[stepIdx + 1].label} &#8594;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
