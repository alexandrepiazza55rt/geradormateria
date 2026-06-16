// Aritmética monetária em centavos inteiros.
// Regra única de arredondamento: half-even (banker's rounding).

import type { Centavos } from "./types";

const EPSILON = 1e-9;

export function round_centavos_half_even(n: number): Centavos {
  const sign = n < 0 ? -1 : 1;
  const abs = Math.abs(n);
  const truncated = Math.trunc(abs);
  const frac = abs - truncated;

  if (Math.abs(frac - 0.5) < EPSILON) {
    const ajustado = truncated % 2 === 0 ? truncated : truncated + 1;
    return sign * ajustado;
  }
  return Math.round(n);
}

export function reais_para_centavos(reais: number): Centavos {
  return round_centavos_half_even(reais * 100);
}

export function centavos_para_reais(c: Centavos): number {
  return c / 100;
}

export function multiplicar_centavos(c: Centavos, fator: number): Centavos {
  return round_centavos_half_even(c * fator);
}

export function somar_centavos(...valores: Centavos[]): Centavos {
  let total = 0;
  for (const v of valores) total += v;
  return total;
}

const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// NBSP (U+00A0) e narrow no-break space (U+202F) que o Intl pode inserir
// entre "R$" e o número, dependendo do runtime/ICU. Normaliza para espaço.
// RegExp construído a partir de string literal para evitar caracteres
// invisíveis no source (regra no-irregular-whitespace).
const RE_ESPACO_NAO_QUEBRAVEL = new RegExp("[\\u00A0\\u202F]", "g");

export function formatar_centavos_brl(c: Centavos): string {
  return fmtBRL.format(c / 100).replace(RE_ESPACO_NAO_QUEBRAVEL, " ");
}
