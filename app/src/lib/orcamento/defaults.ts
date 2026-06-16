// Defaults de perda por categoria + heurística de classificação a partir da
// descrição/unidade do material. Quem quiser sair da heurística usa o campo
// PrecoMaterial.categoria_perda_override (preenchido no precos.json) ou o
// ConfigPerda.override_por_material (decisão local do engenheiro).

import type { Material } from "../../types";
import type { CategoriaPerda } from "./types";

export const PERDA_DEFAULT: Record<CategoriaPerda, number> = {
  cabo: 5,
  fio_parafuso_conector: 3,
  cinta_isolador_mao_francesa: 2,
  equipamento_grande: 0,
  outros: 2,
};

const RE_EQUIPAMENTO =
  /\bposte\b|\bcruzeta\b|transformador|\btrafo\b|chave\s+fus[ií]vel|chave\s+faca|religador|regulador|p[aá]ra[\s-]?raios|seccionador|placa\s+de\s+concreto/i;
const RE_CABO_DESC = /\bcabo\b|cordoalha|fio\s+aluministeel/i;
const RE_CABO_KG = /alum[ií]nio|\bcaa\b/i;
const RE_CINTA =
  /cinta|isolador|m[aã]o\s+francesa|al[cç]a|la[cç]o|sela|gancho|manilha|sapatilha|olhal|pino|espa[cç]ador/i;
const RE_FIO_PARAFUSO =
  /\bfio\b|parafuso|conector|arruela|porca|el[oó]\s+fus[ií]vel|arame/i;

export function categoria_de_material(m: Material): CategoriaPerda {
  const desc = (m.descricao || "").toLowerCase();
  const unidade = (m.unidade || "").toLowerCase();

  if (RE_EQUIPAMENTO.test(desc)) return "equipamento_grande";
  if (RE_CABO_DESC.test(desc) || (unidade === "kg" && RE_CABO_KG.test(desc))) {
    return "cabo";
  }
  if (RE_CINTA.test(desc)) return "cinta_isolador_mao_francesa";
  if (RE_FIO_PARAFUSO.test(desc)) return "fio_parafuso_conector";
  return "outros";
}
