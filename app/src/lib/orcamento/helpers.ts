// Helpers usados pelos componentes da aba "Orçamento" para alimentar
// montar_orcamento(). Funções puras, testáveis.

import type { Estrutura, ObraItem } from "../../types";
import type { PrecoMaterial } from "./types";

export function calcular_estruturas_da_obra(
  itens: ObraItem[],
  estruturas: Map<string, Estrutura>,
): { tipo: string; quantidade: number }[] {
  const acc = new Map<string, number>();
  for (const it of itens) {
    const est = estruturas.get(it.estruturaId);
    if (!est || it.quantidade <= 0) continue;
    acc.set(est.tipo, (acc.get(est.tipo) ?? 0) + it.quantidade);
  }
  return [...acc.entries()].map(([tipo, quantidade]) => ({ tipo, quantidade }));
}

// Mescla oficiais + overrides com a regra "override ganha". Resultado é o que
// o motor consome (montar_orcamento espera UM Map<id, PrecoMaterial>).
export function merge_precos(
  oficiais: Map<number, PrecoMaterial>,
  overrides: Map<number, PrecoMaterial>,
): Map<number, PrecoMaterial> {
  const out = new Map(oficiais);
  for (const [id, p] of overrides) out.set(id, p);
  return out;
}
