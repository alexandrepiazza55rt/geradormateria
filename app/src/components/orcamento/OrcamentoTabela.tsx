import type { ItemOrcamentoSnapshot } from "../../lib/orcamento/types";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";
import { fmtQty } from "../../lib/format";

export function OrcamentoTabela({ itens }: { itens: ItemOrcamentoSnapshot[] }) {
  if (itens.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
        Nenhum item precificado nesta obra.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left">Descrição</th>
            <th className="w-12 px-3 py-2 text-left">Un</th>
            <th className="w-24 px-3 py-2 text-right">Qty</th>
            <th className="w-28 px-3 py-2 text-right">Preço un.</th>
            <th className="w-28 px-3 py-2 text-right">Subtotal</th>
            <th className="w-20 px-3 py-2 text-left">Orig.</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((it) => {
            const origem_badge =
              it.origem_preco === "meu" ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800" title="Preço sobrescrito por você">
                  🅼
                </span>
              ) : (
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800" title="Preço oficial">
                  🅞
                </span>
              );
            const venc_badge =
              it.validade_status === "vencido" ? (
                <span className="ml-1 rounded bg-yellow-100 px-1 py-0.5 text-[10px] font-semibold text-yellow-800" title="Preço vencido">
                  ⚠
                </span>
              ) : null;
            const conv_badge =
              it.fator_conversao_aplicado != null ? (
                <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600" title={`Conversão ${it.unidade_snapshot} → ${it.unidade_preco} (fator ${it.fator_conversao_aplicado})`}>
                  {it.unidade_snapshot}→{it.unidade_preco}
                </span>
              ) : null;

            return (
              <tr key={it.material_id} className="odd:bg-white even:bg-slate-50/50">
                <td className="px-3 py-1.5 text-slate-800">
                  {it.descricao_snapshot}
                  {conv_badge}
                </td>
                <td className="px-3 py-1.5 text-slate-500">{it.unidade_snapshot}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">
                  {fmtQty(it.qty)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">
                  {formatar_centavos_brl(it.preco_unit_centavos)}
                  {it.unidade_preco !== it.unidade_snapshot && (
                    <span className="ml-1 text-[10px] text-slate-400">/{it.unidade_preco}</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-slate-900">
                  {formatar_centavos_brl(it.subtotal_centavos)}
                </td>
                <td className="px-3 py-1.5 text-left">
                  {origem_badge}
                  {venc_badge}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
