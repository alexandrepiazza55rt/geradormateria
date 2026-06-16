import type { Consolidation } from "../../lib/bom";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";
import { useStore } from "../../store";
import { useOrcamentoAtual } from "./useOrcamentoAtual";

export function TotalEstimadoChip({ consolidation }: { consolidation: Consolidation }) {
  const orcamento = useOrcamentoAtual(consolidation);
  const setView = useStore((s) => s.setView);

  const { total_centavos } = orcamento.decomposicao;
  const parcial = orcamento.total_parcial;
  const n_pendentes = orcamento.pendentes.length;

  // Só esconde se a obra está totalmente vazia (sem rows na consolidação)
  if (consolidation.rows.length === 0) return null;

  return (
    <button
      onClick={() => setView({ name: "resultado" })}
      title="Abrir aba Orçamento na lista de obra"
      className={`block w-full border-t px-4 py-2 text-left transition hover:bg-slate-50 ${
        parcial ? "border-amber-200" : "border-slate-100"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">
          Total estimado
        </span>
        <span
          className={`text-base font-bold tabular-nums ${
            parcial ? "text-amber-700" : "text-slate-900"
          }`}
        >
          {formatar_centavos_brl(total_centavos)}
        </span>
      </div>
      {parcial && (
        <div className="text-[10px] text-amber-700">
          parcial — {n_pendentes}{" "}
          {n_pendentes === 1 ? "material pendente" : "materiais pendentes"}
        </div>
      )}
    </button>
  );
}
