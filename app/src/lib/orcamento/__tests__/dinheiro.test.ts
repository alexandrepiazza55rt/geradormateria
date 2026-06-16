import { describe, expect, it } from "vitest";
import {
  formatar_centavos_brl,
  multiplicar_centavos,
  reais_para_centavos,
  round_centavos_half_even,
  somar_centavos,
} from "../dinheiro";

describe("dinheiro", () => {
  it("T01 — reais_para_centavos(12.34) → 1234", () => {
    expect(reais_para_centavos(12.34)).toBe(1234);
  });

  it("T02 — reais_para_centavos(0.1 + 0.2) → 30 (sem ruído de float)", () => {
    expect(reais_para_centavos(0.1 + 0.2)).toBe(30);
  });

  it("T03 — round_centavos_half_even(1234.5) → 1234 (par para baixo)", () => {
    expect(round_centavos_half_even(1234.5)).toBe(1234);
  });

  it("T04 — round_centavos_half_even(1235.5) → 1236 (par para cima)", () => {
    expect(round_centavos_half_even(1235.5)).toBe(1236);
  });

  it("T05 — round_centavos_half_even(1234.4) → 1234 (arredondamento normal)", () => {
    expect(round_centavos_half_even(1234.4)).toBe(1234);
  });

  it("T06 — multiplicar_centavos(1000, 0.05) → 50", () => {
    expect(multiplicar_centavos(1000, 0.05)).toBe(50);
  });

  it("T07 — multiplicar_centavos(333, 3) → 999", () => {
    expect(multiplicar_centavos(333, 3)).toBe(999);
  });

  it("T08 — somar_centavos(100, 200, 300) → 600", () => {
    expect(somar_centavos(100, 200, 300)).toBe(600);
  });

  it("T08b — somar_centavos() → 0", () => {
    expect(somar_centavos()).toBe(0);
  });

  it("T09 — formatar_centavos_brl(1234567) → R$ 12.345,67", () => {
    expect(formatar_centavos_brl(1234567)).toBe("R$ 12.345,67");
  });

  it("T10 — formatar_centavos_brl(0) → R$ 0,00", () => {
    expect(formatar_centavos_brl(0)).toBe("R$ 0,00");
  });
});
