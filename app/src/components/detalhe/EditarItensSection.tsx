import type { ItemOrcamentoSnapshot } from "../../lib/orcamento/types";
import { EditarItemLinha } from "./EditarItemLinha";

interface Props {
  itens: ItemOrcamentoSnapshot[];
  onAdicionar: () => void;
  onEditQty: (material_id: number, nova_qty: number) => void;
  onEditPreco: (material_id: number, novo_preco_centavos: number) => void;
  onRemover: (material_id: number) => void;
}

export function EditarItensSection({
  itens,
  onAdicionar,
  onEditQty,
  onEditPreco,
  onRemover,
}: Props) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Itens precificados ({itens.length})
        </h3>
        <button
          onClick={onAdicionar}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
        >
          + Adicionar item
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_60px_90px_110px_110px_auto] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <div>Descrição</div>
          <div>Un</div>
          <div className="text-right">Qty</div>
          <div className="text-right">Preço un.</div>
          <div className="text-right">Subtotal</div>
          <div className="text-right">—</div>
        </div>

        {itens.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-slate-400">
            Nenhum item ainda. Use{" "}
            <button
              onClick={onAdicionar}
              className="underline text-sky-700 hover:text-sky-900"
            >
              + Adicionar item
            </button>{" "}
            para começar.
          </div>
        ) : (
          itens.map((it) => (
            <EditarItemLinha
              key={it.material_id}
              item={it}
              onEditQty={(q) => onEditQty(it.material_id, q)}
              onEditPreco={(p) => onEditPreco(it.material_id, p)}
              onRemover={() => onRemover(it.material_id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
