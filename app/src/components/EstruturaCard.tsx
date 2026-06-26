import { useMemo, useState } from "react";
import type { Estrutura } from "../types";
import { useStore } from "../store";

const UNSET = "—";

export function EstruturaCard({
  tipo,
  estruturas,
  onAdd,
}: {
  tipo: string;
  estruturas: Estrutura[];
  /** Override do destino: se ausente, adiciona na lista de obra (store). */
  onAdd?: (estruturaId: string, posteIdx: number, quantidade: number) => void;
}) {
  const addItemStore = useStore((s) => s.addItem);
  const addItem = onAdd ?? addItemStore;

  const condutores = useMemo(() => {
    const xs: string[] = [];
    for (const e of estruturas) {
      const k = e.condutor && e.condutor !== "QUANT" ? e.condutor : UNSET;
      if (!xs.includes(k)) xs.push(k);
    }
    return xs;
  }, [estruturas]);

  const cruzetas = useMemo(() => {
    const xs: string[] = [];
    for (const e of estruturas) {
      if (e.cruzeta && !xs.includes(e.cruzeta)) xs.push(e.cruzeta);
    }
    return xs;
  }, [estruturas]);

  const [condKey, setCondKey] = useState(condutores[0]);
  const [cruzKey, setCruzKey] = useState(cruzetas[0] ?? UNSET);

  const est = useMemo(() => {
    return (
      estruturas.find((e) => {
        const ck = e.condutor && e.condutor !== "QUANT" ? e.condutor : UNSET;
        const zk = e.cruzeta ?? UNSET;
        return ck === condKey && (cruzetas.length === 0 || zk === cruzKey);
      }) ?? estruturas[0]
    );
  }, [estruturas, condKey, cruzKey, cruzetas.length]);

  const [posteIdx, setPosteIdx] = useState(0);
  const [qtd, setQtd] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const n = Math.floor(qtd);
    if (!Number.isFinite(n) || n <= 0) return;
    addItem(est.id, Math.min(posteIdx, est.postes.length - 1), n);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const rural = est.norma_origem === "NDU 005";
  const neutro = est.fases === 0;
  const nCond = est.condicionais?.length ?? 0;
  const hasPostes = est.postes.some((p) => Object.keys(p.delta).length > 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{tipo}</h3>
        <div className="flex items-center gap-1">
          {rural && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">NDU 005</span>
          )}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
            {neutro
              ? "Neutro"
              : est.tensao_kv != null
              ? `${est.fases === 1 ? "1Ø" : "3Ø"} · ${est.tensao_kv.toString().replace(".", ",")} kV`
              : "IP"}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {condutores.length > 1 && (
          <label className="text-xs font-medium text-slate-600">
            Condutor
            <select
              value={condKey}
              onChange={(e) => setCondKey(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {condutores.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        )}

        {cruzetas.length > 1 && (
          <label className="text-xs font-medium text-slate-600">
            Cruzeta
            <select
              value={cruzKey}
              onChange={(e) => setCruzKey(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {cruzetas.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        )}

        {hasPostes && (
          <label className="col-span-2 text-xs font-medium text-slate-600">
            Poste
            <select
              value={posteIdx}
              onChange={(e) => setPosteIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {est.postes.map((p, i) => <option key={i} value={i}>{p.poste || `Opção ${i + 1}`}</option>)}
            </select>
          </label>
        )}

        <label className="text-xs font-medium text-slate-600">
          Quantidade
          <input
            type="number" min={1} step={1} value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>

        <div className="flex items-end">
          <button
            onClick={handleAdd}
            className={`w-full rounded-md px-3 py-2 text-sm font-medium text-white transition ${
              added ? "bg-emerald-600" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {added ? "✓ Adicionado" : "Adicionar"}
          </button>
        </div>
      </div>

      {nCond > 0 && (
        <p className="mt-2 text-[11px] text-amber-700">
          ⚠ {nCond} item(ns) condicional(is) por projeto (ex.: cruzeta/conector/equipamento) — não incluídos no total.
        </p>
      )}
    </div>
  );
}
