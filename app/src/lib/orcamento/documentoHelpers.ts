// Helpers para gerar o documento de orçamento (PDF e Excel).
// `preparar_linhas_documento` produz um formato neutro consumido pelos dois
// exports — pdfOrcamento.ts e excelOrcamento.ts não conhecem o tipo Orcamento.

import type { Material } from "../../types";
import type { ObraMeta } from "../../store";
import type {
  Cliente,
  ConfigEmpresa,
  Orcamento,
  StatusOrcamento,
} from "./types";
import type { StorageBackend } from "./storage";
import { getStorageBackend } from "../storageBackend";
import { centavos_para_reais } from "./dinheiro";
import { formatar_cnpj_cpf, tipo_documento } from "./clientesHelpers";

export interface DadosDocumento {
  numero: string;
  versao: number;
  condicoes_pagamento: string;
  prazo_execucao: string;
  status: StatusOrcamento;
}

const COUNTER_KEY_PREFIX = "orcamento_counter_";

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

function fmt_iso_date(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fmt_data_br(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/**
 * Gera "ORC-YYYY-MM-DD-NNN". NNN é counter por dia persistido no
 * LocalStorage (`orcamento_counter_YYYY-MM-DD`). Cada chamada incrementa.
 */
export function gerar_numero_orcamento(
  hoje: Date,
  storage?: StorageBackend,
): string {
  const data = fmt_iso_date(hoje);
  const key = `${COUNTER_KEY_PREFIX}${data}`;
  const s = storage ?? getStorageBackend();

  let n = 1;
  if (s) {
    try {
      const raw = s.getItem(key);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed >= 1) {
          n = parsed + 1;
        }
      }
    } catch {
      /* mantém n = 1 */
    }
    try {
      s.setItem(key, String(n));
    } catch {
      /* silenciar */
    }
  }
  return `ORC-${data}-${pad3(n)}`;
}

const STATUS_LABEL: Record<StatusOrcamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  expirado: "Expirado",
};

export interface LinhaItemDocumento {
  cod_sap: string;
  descricao: string;
  unidade: string;
  qty: number;
  preco_unit_reais: number;
  subtotal_reais: number;
  origem_label: string;
  validade_label: string;
  unidade_preco: string;
  fator_conversao: number | null;
}

export interface LinhaPendenteDocumento {
  descricao: string;
  qty: number;
  unidade: string;
  motivo: string;
}

export interface DecomposicaoDocumento {
  subtotal_material_reais: number;
  perda_reais: number;
  mao_obra_reais: number;
  frete_reais: number;
  base_reais: number;
  margem_reais: number;
  total_reais: number;
  margem_label: string;
  mao_obra_label: string;
}

export interface ProprietarioDocumento {
  nome: string;
  documento_label: string;            // ex.: "CNPJ 12.345.678/0001-90"
  contato_principal: string;          // "Nome · 📧 email · 📞 fone"
  endereco_principal: string;         // logradouro, número, bairro, cidade/UF
  observacoes: string;
}

export interface CabecalhoDocumento {
  titulo: string;
  numero: string;
  versao: number;
  status_label: string;
  gerado_em_br: string;
  validade_br: string;
  meta: ObraMeta;
  condicoes_pagamento: string;
  prazo_execucao: string;
  // Correção 7 — opcional para não quebrar snapshots antigos
  empresa: ConfigEmpresa | null;
  imposto_estimado_pct: number;          // 0 = não renderizar linha
  imposto_estimado_reais: number;        // calculado: pct * total / 100
  // Correção 2 — proprietário (dados ATUAIS do cadastro de clientes,
  // não snapshot). null = orçamento sem proprietário.
  proprietario: ProprietarioDocumento | null;
}

export interface LinhasDocumento {
  cabecalho: CabecalhoDocumento;
  itens: LinhaItemDocumento[];
  decomposicao: DecomposicaoDocumento;
  pendentes: LinhaPendenteDocumento[];
  total_parcial: boolean;
  avisos_globais: string[];
  status: StatusOrcamento;
}

const MOTIVO_LABEL = {
  sem_preco: "Sem preço cadastrado",
  conversao_indefinida: "Conversão de unidade indefinida",
  qty_invalida: "Quantidade inválida",
} as const;

// Correção 2: monta o bloco "PROPRIETÁRIO" para o PDF/Excel usando o
// PRIMEIRO contato e o PRIMEIRO endereço do cliente (mesma convenção da
// tela de Detalhe). Dados ATUAIS do cadastro (sem snapshot).
function construir_proprietario_documento(c: Cliente): ProprietarioDocumento {
  const tipo = c.cnpj_cpf ? tipo_documento(c.cnpj_cpf) : "—";
  const documento_label = c.cnpj_cpf
    ? `${tipo} ${formatar_cnpj_cpf(c.cnpj_cpf)}`
    : "";
  const contato = c.contatos[0];
  const partes_contato: string[] = [];
  if (contato) {
    if (contato.nome) partes_contato.push(contato.nome);
    if (contato.email) partes_contato.push(`📧 ${contato.email}`);
    if (contato.telefone) partes_contato.push(`📞 ${contato.telefone}`);
  }
  const endereco = c.enderecos[0];
  const partes_endereco: string[] = [];
  if (endereco) {
    const linha1 = [
      endereco.logradouro,
      endereco.numero ? `nº ${endereco.numero}` : "",
      endereco.bairro,
    ]
      .filter(Boolean)
      .join(", ");
    if (linha1) partes_endereco.push(linha1);
    const cidade = [
      endereco.municipio,
      endereco.uf,
    ]
      .filter(Boolean)
      .join("/");
    if (cidade) partes_endereco.push(cidade);
    if (endereco.cep) partes_endereco.push(`CEP ${endereco.cep}`);
  }
  return {
    nome: c.nome,
    documento_label,
    contato_principal: partes_contato.join(" · "),
    endereco_principal: partes_endereco.join(" · "),
    observacoes: c.observacoes ?? "",
  };
}

export function preparar_linhas_documento(
  orcamento: Orcamento,
  meta: ObraMeta,
  dados: DadosDocumento,
  catalogo: Map<number, Material>,
  cliente?: Cliente | null,
): LinhasDocumento {
  const config = orcamento.config_snapshot;

  const margem_label = `${config.margem.tipo === "markup" ? "markup" : "margem"} ${config.margem.pct}%`;
  const mao_obra_label =
    config.mao_obra.tipo === "pct_material"
      ? `(${config.mao_obra.pct ?? 0}% do material)`
      : "(por estrutura)";

  const itens: LinhaItemDocumento[] = orcamento.itens.map((it) => {
    const m = catalogo.get(it.material_id);
    return {
      cod_sap: m?.cod_sap ?? "",
      descricao: it.descricao_snapshot,
      unidade: it.unidade_snapshot,
      qty: it.qty,
      preco_unit_reais: centavos_para_reais(it.preco_unit_centavos),
      subtotal_reais: centavos_para_reais(it.subtotal_centavos),
      origem_label: it.origem_preco === "meu" ? "meu" : "oficial",
      validade_label:
        it.validade_status === "vencido"
          ? "VENCIDO"
          : it.validade_status === "ok"
            ? "ok"
            : "—",
      unidade_preco: it.unidade_preco,
      fator_conversao: it.fator_conversao_aplicado,
    };
  });

  const pendentes: LinhaPendenteDocumento[] = orcamento.pendentes.map((p) => ({
    descricao: p.descricao,
    qty: p.qty,
    unidade: p.unidade_material,
    motivo: MOTIVO_LABEL[p.motivo],
  }));

  const d = orcamento.decomposicao;
  const decomposicao: DecomposicaoDocumento = {
    subtotal_material_reais: centavos_para_reais(d.subtotal_material_centavos),
    perda_reais: centavos_para_reais(d.perda_centavos),
    mao_obra_reais: centavos_para_reais(d.mao_obra_centavos),
    frete_reais: centavos_para_reais(d.frete_centavos),
    base_reais: centavos_para_reais(d.base_para_margem_centavos),
    margem_reais: centavos_para_reais(d.margem_centavos),
    total_reais: centavos_para_reais(d.total_centavos),
    margem_label,
    mao_obra_label,
  };

  const status_label = STATUS_LABEL[dados.status];
  const gerado_em_br = fmt_data_br(orcamento.gerado_em.slice(0, 10));
  const validade_br = fmt_data_br(orcamento.validade_orcamento);

  // Correção 7: empresa e imposto vêm do snapshot da config (congelado no
  // momento que o orçamento foi gerado, conforme regra de vigência).
  const empresa = orcamento.config_snapshot.empresa ?? null;
  const imposto_pct = Number(orcamento.config_snapshot.imposto_estimado_pct ?? 0);
  // Calculado sobre o TOTAL final (decisão do dono: opção "Sobre o TOTAL").
  const imposto_reais =
    imposto_pct > 0
      ? Math.round(centavos_para_reais(d.total_centavos) * imposto_pct) / 100
      : 0;

  const proprietario: ProprietarioDocumento | null = cliente
    ? construir_proprietario_documento(cliente)
    : null;

  const cabecalho: CabecalhoDocumento = {
    titulo: `ORÇAMENTO Nº ${dados.numero || "—"} · v${dados.versao} · ${status_label}`,
    numero: dados.numero,
    versao: dados.versao,
    status_label,
    gerado_em_br,
    validade_br,
    meta,
    condicoes_pagamento: dados.condicoes_pagamento,
    prazo_execucao: dados.prazo_execucao,
    empresa,
    imposto_estimado_pct: imposto_pct,
    imposto_estimado_reais: imposto_reais,
    proprietario,
  };

  return {
    cabecalho,
    itens,
    decomposicao,
    pendentes,
    total_parcial: orcamento.total_parcial,
    avisos_globais: orcamento.avisos_globais,
    status: dados.status,
  };
}
