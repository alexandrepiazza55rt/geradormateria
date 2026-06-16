import { describe, expect, it } from "vitest";
import type { Cliente } from "../types";
import {
  buscar_clientes,
  formatar_cnpj_cpf,
  limpar_cliente_pre_save,
  tipo_documento,
  valido_para_salvar,
} from "../clientesHelpers";

function mk(id: string, over: Partial<Cliente> = {}): Cliente {
  return {
    id,
    nome: `Cliente ${id}`,
    contatos: [],
    enderecos: [],
    criado_em: "2026-06-13T10:00:00Z",
    atualizado_em: "2026-06-13T10:00:00Z",
    ...over,
  };
}

describe("formatar_cnpj_cpf", () => {
  it("CH01 — 11 dígitos formata CPF; 14 dígitos formata CNPJ; resto devolve cru", () => {
    expect(formatar_cnpj_cpf("12345678900")).toBe("123.456.789-00");
    expect(formatar_cnpj_cpf("12345678000190")).toBe("12.345.678/0001-90");
    expect(formatar_cnpj_cpf("123")).toBe("123");
    expect(formatar_cnpj_cpf("")).toBe("");
    expect(formatar_cnpj_cpf(null)).toBe("");
  });

  it("CH02 — tipo_documento por tamanho", () => {
    expect(tipo_documento("12345678900")).toBe("CPF");
    expect(tipo_documento("12345678000190")).toBe("CNPJ");
    expect(tipo_documento("123")).toBe("—");
  });
});

describe("buscar_clientes", () => {
  const lista = [
    mk("a", { nome: "João Silva", cnpj_cpf: "11122233344" }),
    mk("b", { nome: "Maria São Paulo", cnpj_cpf: "55566677700019" }),
    mk("c", { nome: "Trifásico Engenharia", cnpj_cpf: "99988877766" }),
    mk("d", { nome: "Excluído Cliente", excluido_em: "2026-06-01T12:00:00Z" }),
  ];

  it("CH03 — busca por nome insensível a acento (sem 'incluir_excluidos')", () => {
    const r = buscar_clientes(lista, "TRIFASICO", false);
    expect(r.length).toBe(1);
    expect(r[0].id).toBe("c");
  });

  it("CH04 — busca por dígitos do CNPJ/CPF ignora máscara; incluir_excluidos = false esconde", () => {
    const r1 = buscar_clientes(lista, "55566677700019", false);
    expect(r1.length).toBe(1);
    expect(r1[0].id).toBe("b");
    const r2 = buscar_clientes(lista, "555.666.777/00019", false);
    expect(r2.length).toBe(1);
    const semExcluidos = buscar_clientes(lista, "exclu", false);
    expect(semExcluidos.length).toBe(0);
    const comExcluidos = buscar_clientes(lista, "exclu", true);
    expect(comExcluidos.length).toBe(1);
  });
});

describe("limpar_cliente_pre_save + valido_para_salvar", () => {
  it("extra — remove contatos/endereços em branco e normaliza cnpj_cpf para só dígitos", () => {
    const c = mk("z", {
      nome: "Teste",
      cnpj_cpf: "12.345.678/0001-90",
      contatos: [
        { id: "c1", nome: "João" },
        { id: "c2" },                   // todos vazios — some
        { id: "c3", email: "x@y.com" },
      ],
      enderecos: [
        { id: "e1", logradouro: "Rua A", numero: "10" },
        { id: "e2", logradouro: "" },   // logradouro vazio — some
      ],
    });
    const r = limpar_cliente_pre_save(c);
    expect(r.cnpj_cpf).toBe("12345678000190");
    expect(r.contatos.length).toBe(2);
    expect(r.contatos.map((x) => x.id)).toEqual(["c1", "c3"]);
    expect(r.enderecos.length).toBe(1);
    expect(r.enderecos[0].logradouro).toBe("Rua A");
  });

  it("extra — valido_para_salvar: nome vazio ou só espaços falha", () => {
    expect(valido_para_salvar(mk("a", { nome: "" }))).toBe(false);
    expect(valido_para_salvar(mk("a", { nome: "   " }))).toBe(false);
    expect(valido_para_salvar(mk("a", { nome: "X" }))).toBe(true);
  });
});
