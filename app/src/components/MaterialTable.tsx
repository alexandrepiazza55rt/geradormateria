import { useState, type ReactNode } from "react";
import type { BomRow } from "../types";
import { sortRows, type SortKey } from "../lib/bom";
import { fmtQty } from "../lib/format";

export function MaterialTable({ rows }: { rows: BomRow[] }) {
  const [sort, setSort] = useState<SortKey>("descricao");
  const sorted = sortRows(rows, sort);

  const Th = ({ k, children, className }: { k?: SortKey; children: ReactNode; className?: string }) => (
    <th
      onClick={k ? () => setSort(k) : undefined}
      className={`border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 ${
        k ? "cursor-pointer select-none hover:text-sky-700" : ""
      } ${className ?? ""}`}
    >
      {children}
      {k && sort === k ? " ▾" : ""}
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide">
          <tr>
            <Th k="codigo" className="w-24">Cód. SAP</Th>
            <Th className="w-24">Líder 7</Th>
            <Th k="descricao">Descrição</Th>
            <Th className="w-16">Unid.</Th>
            <Th className="w-24 text-right">Quant.</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.material.id} className="odd:bg-white even:bg-slate-50/50">
              <td className="px-3 py-1.5 text-slate-500">{r.material.cod_sap || "—"}</td>
              <td className="px-3 py-1.5 text-slate-400">{r.material.cod_lider7 || "—"}</td>
              <td className="px-3 py-1.5 text-slate-800">{r.material.descricao}</td>
              <td className="px-3 py-1.5 text-slate-500">{r.material.unidade}</td>
              <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-900">
                {fmtQty(r.quantidade)}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                Nenhum material — adicione estruturas à lista de obra.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
