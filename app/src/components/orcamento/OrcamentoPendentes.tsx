import type { ItemPendente } from "../../lib/orcamento/types";
import { fmtQty } from "../../lib/format";

const MOTIVO_LABEL: Record<ItemPendente["motivo"], string> = {
  sem_preco: "Sem preço cadastrado",
  conversao_indefinida: "Conversão de unidade indefinida",
  qty_invalida: "Quantidade inválida",
};

interface Props {
  pendentes: ItemPendente[];
  onCadastrar: () => void;
  // Quando o painel é renderizado num orçamento SALVO, esses props habilitam
  // o botão "♻ Reprocessar" para incorporar pendentes que já têm preço.
  // No fluxo ao vivo (Lista de Obra → Orçamento) eles não são passados.
  incorporaveis?: number;
  onReprocessar?: () => void;
}

export function OrcamentoPendentes({
  pendentes,
  onCadastrar,
  incorporaveis = 0,
  onReprocessar,
}: Props) {
  if (pendentes.length === 0) return null;

  const ids_sem_preco = pendentes
    .filter((p) => p.motivo === "sem_preco")
    .map((p) => p.material_id);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-amber-900">
        Pendentes ({pendentes.length}) — não entraram no total
      </h3>

      {onReprocessar && incorporaveis > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border-2 border-emerald-400 bg-emerald-50 px-3 py-2">
          <div className="text-xs text-emerald-900">
            <span className="font-semibold">
              {incorporaveis} {incorporaveis === 1 ? "pendente" : "pendentes"} já {incorporaveis === 1 ? "tem" : "têm"} preço cadastrado.
            </span>{" "}
            Pode reprocessar para somar no total.
          </div>
          <button
            onClick={onReprocessar}
            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            ♻ Reprocessar com preços novos
          </button>
        </div>
      )}

      <ul className="max-h-60 space-y-1 overflow-y-auto rounded border border-amber-200 bg-white p-2 text-xs">
        {pendentes.map((p) => (
          <li
            key={`${p.material_id}-${p.motivo}`}
            className="flex items-start justify-between gap-2 border-b border-slate-100 py-1 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-slate-800">{p.descricao}</div>
              <div className="text-[10px] text-amber-700">
                {MOTIVO_LABEL[p.motivo]}
                {p.detalhe ? ` — ${p.detalhe}` : ""}
              </div>
            </div>
            <span className="shrink-0 tabular-nums text-slate-500">
              ×{fmtQty(p.qty)} {p.unidade_material}
            </span>
          </li>
        ))}
      </ul>

      {ids_sem_preco.length > 0 && (
        <div className="mt-3">
          <button
            onClick={onCadastrar}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Cadastrar preços pendentes ({ids_sem_preco.length}) →
          </button>
        </div>
      )}
    </div>
  );
}
