// Hook compartilhado: calcula o orçamento atual da obra a partir do estado
// do store. Reutilizado pela OrcamentoView e pelo TotalEstimadoChip do
// PreviewPanel. Garante uma única fonte de cálculo na UI.

import { useMemo } from "react";
import { useStore } from "../../store";
import type { Consolidation } from "../../lib/bom";
import { montar_orcamento } from "../../lib/orcamento/motor";
import type { Orcamento } from "../../lib/orcamento/types";
import {
  calcular_estruturas_da_obra,
  merge_precos,
} from "../../lib/orcamento/helpers";

export function useOrcamentoAtual(consolidation: Consolidation): Orcamento {
  const precosOficiais = useStore((s) => s.precosOficiais);
  const precosOverrides = useStore((s) => s.precosOverrides);
  const config = useStore((s) => s.configOrcamento);
  const itens = useStore((s) => s.itens);
  const estruturas = useStore((s) => s.estruturas);

  // `hoje` fixo por instância do hook (não recalcula a cada render).
  const hoje = useMemo(() => new Date(), []);

  return useMemo(() => {
    const precos = merge_precos(precosOficiais, precosOverrides);
    const estruturas_da_obra = calcular_estruturas_da_obra(itens, estruturas);
    return montar_orcamento({
      rows: consolidation.rows,
      precos,
      config,
      estruturas_da_obra,
      hoje,
    });
  }, [
    consolidation.rows,
    precosOficiais,
    precosOverrides,
    config,
    itens,
    estruturas,
    hoje,
  ]);
}
