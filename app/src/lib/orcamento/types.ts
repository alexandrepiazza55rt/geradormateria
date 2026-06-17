// Domínio do orçamento automático.
// Camada aditiva ao gerador de BOM existente; nada aqui altera o que já existe.

export type Centavos = number; // SEMPRE inteiro

export type OrigemPreco = "oficial" | "meu";
export type StatusValidade = "ok" | "vencido" | "sem_validade";
export type StatusOrcamento =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "recusado"
  | "expirado";

export type CategoriaPerda =
  | "cabo"
  | "fio_parafuso_conector"
  | "cinta_isolador_mao_francesa"
  | "equipamento_grande"
  | "outros";

export interface PrecoMaterial {
  material_id: number;                          // FK → Material.id (única chave)
  valor_centavos: Centavos;
  unidade_preco: string;                        // "pç" | "m" | "kg" | "und"
  fator_conversao: number | null;               // multiplica qty_bom para casar com unidade_preco
  validade: string | null;                      // ISO date "YYYY-MM-DD"
  fornecedor: string | null;
  origem: OrigemPreco;
  atualizado_em: string;                        // ISO datetime
  categoria_perda_override: CategoriaPerda | null;
}

export interface ConfigMargem {
  tipo: "markup" | "margem";
  pct: number;                                  // 0..99 (margem 100% rejeitada)
}

export interface ConfigMaoDeObra {
  tipo: "tabela" | "pct_material";
  pct?: number;                                 // se tipo === "pct_material"
  tabela?: Record<string, Centavos>;            // chave = Estrutura.tipo
}

export interface ConfigPerda {
  default_por_categoria: Record<CategoriaPerda, number>;
  override_por_material: Record<number, number>;
}

export interface ConfigEmpresa {
  nome: string;
  cnpj: string;          // só dígitos; máscara é visual
  endereco: string;
  telefone: string;
  email: string;
  logo_data_url: string | null;   // data URL base64; null = sem logo
}

export interface ConfigOrcamento {
  perda: ConfigPerda;
  mao_obra: ConfigMaoDeObra;
  frete_centavos: Centavos;
  margem: ConfigMargem;
  validade_preco_dias: number;
  validade_orcamento_dias: number;
  // Correção 7 — campos opcionais para não quebrar configs antigas no LocalStorage
  imposto_estimado_pct?: number;   // 0..100; informativo (não altera total)
  empresa?: ConfigEmpresa;
}

// Log de mudanças da ConfigOrcamento (Correção 7).
// Mantido em chave separada para não inflar config_orcamento_v1 e para
// permitir purga independente.
export interface EntradaHistoricoConfig {
  id: string;
  quando: string;          // ISO datetime
  campo: string;           // ex.: "margem.pct", "imposto_estimado_pct", "empresa.nome"
  rotulo: string;          // texto legível: "Margem %", "Imposto estimado %", "Empresa - Nome"
  valor_antes: string;
  valor_depois: string;
}

export type MotivoPendencia =
  | "sem_preco"
  | "conversao_indefinida"
  | "qty_invalida";

export interface ItemPendente {
  material_id: number;
  descricao: string;
  unidade_material: string;
  qty: number;
  motivo: MotivoPendencia;
  detalhe?: string;
}

export interface ItemOrcamentoSnapshot {
  material_id: number;
  descricao_snapshot: string;
  unidade_snapshot: string;
  unidade_preco: string;
  qty: number;
  qty_convertida: number;
  fator_conversao_aplicado: number | null;
  preco_unit_centavos: Centavos;
  subtotal_centavos: Centavos;
  origem_preco: OrigemPreco;
  validade_status: StatusValidade;
  aviso?: string;
  /**
   * Item adicionado SEM preço cadastrado (placeholder a R$ 0,00). Fica marcado
   * na lista para o usuário preencher o preço na própria linha. Some quando um
   * preço > 0 é informado (ver `editar_preco_item`).
   */
  sem_preco?: boolean;
}

export interface DecomposicaoOrcamento {
  subtotal_material_centavos: Centavos;
  perda_centavos: Centavos;
  mao_obra_centavos: Centavos;
  frete_centavos: Centavos;
  base_para_margem_centavos: Centavos;
  margem_centavos: Centavos;
  total_centavos: Centavos;
  desconto_centavos?: Centavos;   // Etapa 5 da nova feature; opcional (snapshots antigos sem desconto)
}

export interface Orcamento {
  id: string;
  gerado_em: string;
  validade_orcamento: string;                   // ISO date
  status: StatusOrcamento;
  versao: number;
  itens: ItemOrcamentoSnapshot[];
  pendentes: ItemPendente[];
  decomposicao: DecomposicaoOrcamento;
  total_parcial: boolean;
  config_snapshot: ConfigOrcamento;
  avisos_globais: string[];
}

export type ResultadoPrecificacao =
  | { tipo: "ok"; item: ItemOrcamentoSnapshot }
  | { tipo: "pendente"; pendente: ItemPendente };

import type { BomRow } from "../../types";

// Snapshot persistente de um orçamento gerado. Tudo serializável (sem Map/Set)
// para gravar/ler direto em JSON via LocalStorage.
export interface OrcamentoSalvo {
  id: string;                       // uuid local (independente de Orcamento.id)
  salvo_em: string;                 // ISO datetime
  rotulo?: string;                  // opcional — para futuro
  orcamento: Orcamento;
  meta: {
    obra: string;
    endereco: string;
    municipio: string;
    responsavel: string;
  };
  dados_documento: {
    numero: string;
    versao: number;
    condicoes_pagamento: string;
    prazo_execucao: string;
    status: StatusOrcamento;
  };

  // ─── Etapa 1 da feature "Consulta/Edição com Histórico" ───
  // Campos opcionais para não quebrar OrcamentoSalvo existentes no LocalStorage
  // de quem já usou as Etapas 1-8. Carregam como undefined em snapshots antigos.
  historico?: EntradaHistorico[];   // append-only; nunca remover
  bloqueado?: boolean;              // true se houver versão derivada (não edita; só clona p/ nova versão)
  excluido_em?: string | null;      // soft delete; filtro padrão esconde
  cliente_id?: string | null;       // FK p/ Cliente quando o cadastro existir (Etapa 2)
  observacoes?: string;             // texto livre do cabeçalho
  observacoes_imposto?: string;     // texto livre p/ regra fiscal (P10)
  desconto_pct?: number;            // 0..100 — desconto global no total final
}

// ─── Clientes (mini-CRM, Etapa 2 da feature) ───────────────────────────────

export interface ClienteContato {
  id: string;
  nome?: string;
  funcao?: string;
  email?: string;
  telefone?: string;
}

export interface ClienteEndereco {
  id: string;
  rotulo?: string;            // "Sede", "Obra A" etc.
  logradouro: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  complemento?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpj_cpf?: string;          // só dígitos; máscara é visual
  observacoes?: string;
  contatos: ClienteContato[];
  enderecos: ClienteEndereco[];
  criado_em: string;          // ISO
  atualizado_em: string;      // ISO
  excluido_em?: string | null; // soft delete
}

// ─── Histórico de alterações (append-only, imutável) ───────────────────────

export type AcaoHistorico =
  | "item_adicionado"
  | "item_removido"
  | "item_qty_alterada"
  | "item_preco_alterado"
  | "desconto_total_alterado"
  | "cabecalho_alterado"
  | "status_alterado"
  | "versao_criada"
  | "orcamento_revertido"
  | "validade_renovada"
  | "orcamento_duplicado"
  | "orcamento_reprocessado";

export interface EntradaHistorico {
  id: string;                       // uuid local
  quando: string;                   // ISO datetime
  autor: string;                    // "Eu" por enquanto (sem auth)
  acao: AcaoHistorico;
  descricao: string;                // texto já formatado em pt-BR (pronto para exibir)

  // Campos opcionais conforme a ação:
  item_id?: number;
  qty_antes?: number;
  qty_depois?: number;
  preco_antes_centavos?: number;
  preco_depois_centavos?: number;
  total_antes_centavos?: number;
  total_depois_centavos?: number;
  campo?: string;
  valor_antes?: string;
  valor_depois?: string;
}

export interface MontarOrcamentoInput {
  rows: BomRow[];
  precos: Map<number, PrecoMaterial>;
  config: ConfigOrcamento;
  estruturas_da_obra: { tipo: string; quantidade: number }[];
  hoje: Date;
}
