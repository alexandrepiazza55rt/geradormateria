// pt-BR formatting helpers.

const qtyFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function fmtQty(n: number): string {
  // avoid "-0"
  if (Object.is(n, -0)) n = 0;
  return qtyFmt.format(n);
}

export function fmtTensao(kv: number): string {
  return qtyFmt.format(kv) + " kV";
}

const fasesLabel: Record<number, string> = {
  1: "Monofásico",
  2: "Bifásico",
  3: "Trifásico",
};

export function fmtFases(f: number): string {
  return fasesLabel[f] ?? `${f} fases`;
}

export function todayBR(): string {
  return new Date().toLocaleDateString("pt-BR");
}

// Clean trailing spaces / collapse whitespace in labels coming from the sheet.
export function cleanLabel(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}
