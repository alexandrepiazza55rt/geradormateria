// Resolução de preço (override > oficial > null) e listagem filtrada para a UI.

import type { Material } from "../../types";
import type { OrigemPreco, PrecoMaterial, StatusValidade } from "./types";

export type FiltroOrigem = "todos" | "oficial" | "meu" | "sem_preco";
export type FiltroValidade = "todos" | "ok" | "vencido" | "sem_validade";

export interface FiltrosPrecos {
  busca: string;
  categoria: string | null;
  origem: FiltroOrigem;
  validade: FiltroValidade;
  apenas_obra: number[] | null;       // IDs específicos quando o banner abre a tela
  mostrar_todos_catalogo: boolean;    // false = só usados em BOMs
}

export interface PrecoResolvido {
  preco: PrecoMaterial | null;
  origem_efetiva: OrigemPreco | null;
  tem_override: boolean;
}

export type StatusPrecoMaterial =
  | "com_preco_ok"
  | "com_preco_vencido"
  | "com_preco_sem_validade"
  | "sem_preco";

export interface MaterialComStatusPreco {
  material: Material;
  preco_resolvido: PrecoResolvido;
  status: StatusPrecoMaterial;
}

export function indexar_precos(arr: PrecoMaterial[]): Map<number, PrecoMaterial> {
  const map = new Map<number, PrecoMaterial>();
  for (const p of arr) map.set(p.material_id, p);
  return map;
}

export function resolver_preco(
  material_id: number,
  oficiais: Map<number, PrecoMaterial>,
  overrides: Map<number, PrecoMaterial>,
): PrecoResolvido {
  const override = overrides.get(material_id);
  if (override) {
    return { preco: override, origem_efetiva: "meu", tem_override: true };
  }
  const oficial = oficiais.get(material_id);
  if (oficial) {
    return { preco: oficial, origem_efetiva: "oficial", tem_override: false };
  }
  return { preco: null, origem_efetiva: null, tem_override: false };
}

function status_validade(p: PrecoMaterial | null, hoje: Date): StatusValidade {
  if (!p || p.validade == null) return "sem_validade";
  const venc = new Date(`${p.validade}T00:00:00`);
  return venc.getTime() >= hoje.getTime() ? "ok" : "vencido";
}

function status_do_preco(r: PrecoResolvido, hoje: Date): StatusPrecoMaterial {
  if (!r.preco) return "sem_preco";
  const v = status_validade(r.preco, hoje);
  if (v === "vencido") return "com_preco_vencido";
  if (v === "sem_validade") return "com_preco_sem_validade";
  return "com_preco_ok";
}

// Busca insensível a acento e caixa
function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function listar_materiais_com_status(
  materiais: Material[],
  usados_em_bom: Set<number>,
  oficiais: Map<number, PrecoMaterial>,
  overrides: Map<number, PrecoMaterial>,
  hoje: Date,
  filtros: FiltrosPrecos,
): MaterialComStatusPreco[] {
  const busca_norm = normalizar(filtros.busca.trim());
  const apenas_obra_set = filtros.apenas_obra
    ? new Set(filtros.apenas_obra)
    : null;

  const out: MaterialComStatusPreco[] = [];
  for (const m of materiais) {
    if (!m.descricao || !m.descricao.trim()) continue;
    if (!m.unidade || !m.unidade.trim()) continue;

    // Universo: `apenas_obra` (quando definido) prevalece sobre o filtro
    // "usados em BOM". Ele vem do botão "Cadastrar preços pendentes" com
    // IDs específicos de um orçamento salvo — se algum não estiver mais
    // em `usados_em_bom` (porque o catálogo mudou ou o item era manual),
    // a tela ficava vazia em silêncio. Agora aparece igual.
    if (apenas_obra_set) {
      if (!apenas_obra_set.has(m.id)) continue;
    } else if (!filtros.mostrar_todos_catalogo && !usados_em_bom.has(m.id)) {
      continue;
    }
    if (filtros.categoria && m.categoria !== filtros.categoria) continue;
    if (busca_norm && !normalizar(m.descricao).includes(busca_norm)) continue;

    const resolvido = resolver_preco(m.id, oficiais, overrides);

    if (filtros.origem === "oficial" && resolvido.origem_efetiva !== "oficial") continue;
    if (filtros.origem === "meu" && resolvido.origem_efetiva !== "meu") continue;
    if (filtros.origem === "sem_preco" && resolvido.origem_efetiva !== null) continue;

    if (filtros.validade !== "todos") {
      if (!resolvido.preco) continue;
      const v = status_validade(resolvido.preco, hoje);
      if (filtros.validade !== v) continue;
    }

    out.push({
      material: m,
      preco_resolvido: resolvido,
      status: status_do_preco(resolvido, hoje),
    });
  }

  // Ordenação estável: categoria → descrição
  out.sort((a, b) => {
    const ca = a.material.categoria || "";
    const cb = b.material.categoria || "";
    const byCat = ca.localeCompare(cb, "pt-BR");
    if (byCat !== 0) return byCat;
    return a.material.descricao.localeCompare(b.material.descricao, "pt-BR");
  });

  return out;
}
