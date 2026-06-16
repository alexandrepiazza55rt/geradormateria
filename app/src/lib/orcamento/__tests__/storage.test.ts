import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrecoMaterial } from "../types";
import {
  carregar_overrides,
  limpar_overrides,
  salvar_overrides,
  STORAGE_KEY_OVERRIDES,
  type StorageBackend,
} from "../storage";

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

const P: PrecoMaterial = {
  material_id: 1,
  valor_centavos: 1234,
  unidade_preco: "pç",
  fator_conversao: null,
  validade: null,
  fornecedor: null,
  origem: "meu",
  atualizado_em: "2026-06-13T00:00:00Z",
  categoria_perda_override: null,
};

describe("storage", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it("S1 — carregar_overrides com storage vazio → []", () => {
    expect(carregar_overrides(makeStorage())).toEqual([]);
  });

  it("S2 — salvar + carregar round-trip", () => {
    const s = makeStorage();
    salvar_overrides([P], s);
    expect(carregar_overrides(s)).toEqual([P]);
  });

  it("S3 — JSON corrompido → [] + console.error", () => {
    const s = makeStorage();
    s.setItem(STORAGE_KEY_OVERRIDES, "{nao eh json}");
    expect(carregar_overrides(s)).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
  });

  it("S4 — salvar com storage que lança não levanta exceção", () => {
    const s: StorageBackend = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(() => salvar_overrides([P], s)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
  });

  it("S5 — limpar_overrides esvazia o storage", () => {
    const s = makeStorage();
    salvar_overrides([P], s);
    limpar_overrides(s);
    expect(carregar_overrides(s)).toEqual([]);
  });
});
