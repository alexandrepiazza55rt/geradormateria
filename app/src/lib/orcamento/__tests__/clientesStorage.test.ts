import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Cliente } from "../types";
import type { StorageBackend } from "../storage";
import {
  carregar_clientes,
  limpar_clientes,
  salvar_clientes,
  STORAGE_KEY_CLIENTES,
} from "../clientesStorage";

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

function mkCliente(id: string, over: Partial<Cliente> = {}): Cliente {
  return {
    id,
    nome: `Cliente ${id}`,
    cnpj_cpf: "12345678000190",
    observacoes: "obs",
    contatos: [
      { id: "c1", nome: "João", email: "joao@x.com", telefone: "11999990000" },
    ],
    enderecos: [
      {
        id: "e1",
        rotulo: "Sede",
        logradouro: "Rua A",
        numero: "100",
        bairro: "Centro",
        municipio: "São Paulo",
        uf: "SP",
        cep: "01000-000",
      },
    ],
    criado_em: "2026-06-13T10:00:00Z",
    atualizado_em: "2026-06-13T10:00:00Z",
    ...over,
  };
}

describe("clientesStorage", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it("CL01 — carregar com storage vazio → []", () => {
    expect(carregar_clientes(makeStorage())).toEqual([]);
  });

  it("CL02 — salvar + carregar round-trip", () => {
    const s = makeStorage();
    const arr = [mkCliente("a"), mkCliente("b")];
    salvar_clientes(arr, s);
    expect(carregar_clientes(s)).toEqual(arr);
  });

  it("CL03 — JSON corrompido → [] + console.error", () => {
    const s = makeStorage();
    s.setItem(STORAGE_KEY_CLIENTES, "{nao eh json}");
    expect(carregar_clientes(s)).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
  });

  it("CL04 — salvar com storage que lança não levanta exceção", () => {
    const s: StorageBackend = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {},
    };
    expect(() => salvar_clientes([mkCliente("a")], s)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
  });

  it("CL05 — limpar esvazia o storage", () => {
    const s = makeStorage();
    salvar_clientes([mkCliente("a")], s);
    limpar_clientes(s);
    expect(carregar_clientes(s)).toEqual([]);
  });

  it("CL06 — round-trip preserva campos aninhados (contatos, endereços, excluido_em)", () => {
    const s = makeStorage();
    const c = mkCliente("x", { excluido_em: "2026-07-01T12:00:00Z" });
    salvar_clientes([c], s);
    const r = carregar_clientes(s)[0];
    expect(r.contatos.length).toBe(1);
    expect(r.contatos[0].email).toBe("joao@x.com");
    expect(r.enderecos[0].rotulo).toBe("Sede");
    expect(r.enderecos[0].municipio).toBe("São Paulo");
    expect(r.excluido_em).toBe("2026-07-01T12:00:00Z");
  });
});
