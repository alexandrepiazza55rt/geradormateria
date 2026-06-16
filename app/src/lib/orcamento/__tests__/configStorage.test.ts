import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfigOrcamento } from "../types";
import type { StorageBackend } from "../storage";
import {
  carregar_config,
  limpar_config,
  salvar_config,
  STORAGE_KEY_CONFIG,
} from "../configStorage";

function makeStorage(): StorageBackend & { _store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    _store: store,
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

const CONFIG: ConfigOrcamento = {
  perda: {
    default_por_categoria: {
      cabo: 5,
      fio_parafuso_conector: 3,
      cinta_isolador_mao_francesa: 2,
      equipamento_grande: 0,
      outros: 2,
    },
    override_por_material: { 30: 8 },
  },
  mao_obra: {
    tipo: "tabela",
    tabela: { "U1": 5000, "N3-CFu": 8000 },
  },
  frete_centavos: 50000,
  margem: { tipo: "markup", pct: 25 },
  validade_preco_dias: 60,
  validade_orcamento_dias: 30,
};

describe("configStorage", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it("K1 — carregar_config com storage vazio → null", () => {
    expect(carregar_config(makeStorage())).toBeNull();
  });

  it("K2 — salvar + carregar round-trip", () => {
    const s = makeStorage();
    salvar_config(CONFIG, s);
    expect(carregar_config(s)).toEqual(CONFIG);
  });

  it("K3 — JSON corrompido → null + console.error", () => {
    const s = makeStorage();
    s.setItem(STORAGE_KEY_CONFIG, "{nao eh json}");
    expect(carregar_config(s)).toBeNull();
    expect(errSpy).toHaveBeenCalled();
  });

  it("K4 — salvar com storage que lança não levanta exceção", () => {
    const s: StorageBackend = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(() => salvar_config(CONFIG, s)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
  });

  it("K5 — limpar_config esvazia o storage", () => {
    const s = makeStorage();
    salvar_config(CONFIG, s);
    limpar_config(s);
    expect(carregar_config(s)).toBeNull();
  });

  it("K6 — round-trip preserva campos aninhados (perda.default_por_categoria, mao_obra.tabela, override)", () => {
    const s = makeStorage();
    salvar_config(CONFIG, s);
    const r = carregar_config(s)!;
    expect(r.perda.default_por_categoria.cabo).toBe(5);
    expect(r.perda.override_por_material[30]).toBe(8);
    expect(r.mao_obra.tabela?.["N3-CFu"]).toBe(8000);
    expect(r.margem.tipo).toBe("markup");
  });
});
