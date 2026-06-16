// Helpers puros para clientes: formatação de CNPJ/CPF, busca, validação,
// limpeza pré-save. Sem dependência de DOM ou Store.

import type {
  Cliente,
  ClienteContato,
  ClienteEndereco,
} from "./types";

export function so_digitos(s: string): string {
  return (s ?? "").replace(/\D/g, "");
}

/** Formata 11 dígitos como CPF, 14 como CNPJ; resto devolve cru. */
export function formatar_cnpj_cpf(s: string | undefined | null): string {
  const d = so_digitos(s ?? "");
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  }
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  }
  return s ?? "";
}

export function tipo_documento(s: string | undefined | null): "CPF" | "CNPJ" | "—" {
  const d = so_digitos(s ?? "");
  if (d.length === 11) return "CPF";
  if (d.length === 14) return "CNPJ";
  return "—";
}

// Normalização para busca (case e acento insensitive)
function normalizar(s: string): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function buscar_clientes(
  clientes: Cliente[],
  termo: string,
  incluir_excluidos: boolean,
): Cliente[] {
  const termo_norm = normalizar(termo.trim());
  const termo_digitos = so_digitos(termo);

  return clientes.filter((c) => {
    if (!incluir_excluidos && c.excluido_em) return false;
    if (!termo_norm) return true;
    if (normalizar(c.nome).includes(termo_norm)) return true;
    if (termo_digitos && so_digitos(c.cnpj_cpf ?? "").includes(termo_digitos)) {
      return true;
    }
    return false;
  });
}

/**
 * Remove contatos e endereços "em branco" (todos os campos relevantes vazios)
 * antes de persistir. Decisão da Etapa 2: linha vazia some silenciosamente.
 */
export function limpar_cliente_pre_save(c: Cliente): Cliente {
  return {
    ...c,
    cnpj_cpf: c.cnpj_cpf ? so_digitos(c.cnpj_cpf) : undefined,
    contatos: c.contatos.filter(contato_tem_conteudo),
    enderecos: c.enderecos.filter(endereco_tem_conteudo),
  };
}

function contato_tem_conteudo(c: ClienteContato): boolean {
  return !!(
    (c.nome && c.nome.trim()) ||
    (c.funcao && c.funcao.trim()) ||
    (c.email && c.email.trim()) ||
    (c.telefone && c.telefone.trim())
  );
}

function endereco_tem_conteudo(e: ClienteEndereco): boolean {
  return !!(e.logradouro && e.logradouro.trim());
}

export function valido_para_salvar(c: Cliente): boolean {
  return !!(c.nome && c.nome.trim());
}
