import { useMemo } from "react";
import { useStore } from "../store";
import type { Consolidation } from "../lib/bom";
import { fmtQty, cleanLabel } from "../lib/format";
import { PrecosBanner } from "./precos/PrecosBanner";
import { TotalEstimadoChip } from "./orcamento/TotalEstimadoChip";

export function PreviewPanel({ consolidation }: { consolidation: Consolidation }) {
  const { rows, totalItens, totalEstruturas } = consolidation;
  const itens = useStore((s) => s.itens);
  const obraInsumos = useStore((s) => s.obraInsumos);
  const estruturas = useStore((s) => s.estruturas);
  const insumos = useStore((s) => s.insumos);
  const removeItem = useStore((s) => s.removeItem);
  const removeInsumo = useStore((s) => s.removeInsumo);
  const setView = useStore((s) => s.setView);
  const clearObra = useStore((s) => s.clearObra);

  const empty = itens.length + obraInsumos.length === 0;
  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.material.descricao.localeCompare(b.material.descricao, "pt-BR")),
    [rows],
  );

  return (
    <aside className="no-print h-fit lg:sticky lg:top-[76px]">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Prévia da relação</div>
            <div className="text-xs text-slate-500">
              {fmtQty(totalEstruturas)} estruturas · {totalItens} itens
            </div>
          </div>
          {!empty && (
            <button onClick={clearObra} className="text-xs text-red-600 hover:underline">Limpar</button>
          )}
        </div>

        {empty ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            Selecione estruturas e clique em <span className="font-medium text-slate-500">Adicionar</span> para
            ver a relação de materiais surgir aqui.
          </div>
        ) : (
          <>
            <div className="max-h-44 overflow-y-auto border-b border-slate-100 px-2 py-2">
              {itens.map((it) => {
                const e = estruturas.get(it.estruturaId);
                if (!e) return null;
                return (
                  <MiniRow
                    key={it.key}
                    label={`${cleanLabel(e.tipo)}${e.condutor && e.condutor !== "QUANT" ? " · " + e.condutor : ""}`}
                    sub={e.postes[it.posteIdx]?.poste ?? undefined}
                    qty={it.quantidade}
                    onRemove={() => removeItem(it.key)}
                  />
                );
              })}
              {obraInsumos.map((oi) => {
                const i = insumos.get(oi.insumoId);
                if (!i) return null;
                return (
                  <MiniRow
                    key={oi.key}
                    label={cleanLabel(i.descricao)}
                    qty={oi.quantidade}
                    onRemove={() => removeInsumo(oi.key)}
                    accent
                  />
                );
              })}
            </div>

            <div className="max-h-[46vh] overflow-y-auto">
              <table className="w-full text-xs">
                <tbody>
                  {sorted.map((r) => (
                    <tr key={r.material.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-1 text-slate-700">{r.material.descricao}</td>
                      <td className="whitespace-nowrap px-2 py-1 text-right font-medium tabular-nums text-slate-900">
                        {fmtQty(r.quantidade)} <span className="text-slate-400">{(r.material.unidade || "").trim()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PrecosBanner consolidation={consolidation} />
            <TotalEstimadoChip consolidation={consolidation} />

            <div className="border-t border-slate-100 p-3">
              <button
                onClick={() => setView({ name: "resultado" })}
                className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Ver lista completa e exportar
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function MiniRow({
  label, sub, qty, onRemove, accent,
}: { label: string; sub?: string; qty: number; onRemove: () => void; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50 ${accent ? "bg-amber-50/40" : ""}`}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-slate-700">{label}</div>
        {sub && <div className="truncate text-[10px] text-slate-400">{sub}</div>}
      </div>
      <span className="shrink-0 rounded bg-slate-100 px-1.5 text-[11px] text-slate-600">×{qty}</span>
      <button onClick={onRemove} className="shrink-0 text-xs text-slate-300 hover:text-red-600">✕</button>
    </div>
  );
}
