import { create } from "zustand";
import type {
  Material, Estrutura, Insumo, ObraItem, ObraInsumo,
} from "./types";
import type { Cliente, ConfigOrcamento, DecomposicaoOrcamento, EntradaHistorico, EntradaHistoricoConfig, ItemOrcamentoSnapshot, OrcamentoSalvo, PrecoMaterial } from "./lib/orcamento/types";
import type { FiltrosPrecos } from "./lib/orcamento/precos";
import { indexar_precos } from "./lib/orcamento/precos";
import {
  carregar_overrides,
  limpar_overrides,
  salvar_overrides,
  STORAGE_KEY_OVERRIDES,
} from "./lib/orcamento/storage";
import {
  carregar_config,
  salvar_config,
  STORAGE_KEY_CONFIG,
} from "./lib/orcamento/configStorage";
import {
  carregar_config_historico,
  limpar_config_historico,
  salvar_config_historico,
  STORAGE_KEY_CONFIG_HIST,
} from "./lib/orcamento/configHistoricoStorage";
import {
  carregar_orcamentos_salvos,
  limpar_orcamentos_salvos,
  salvar_orcamentos_salvos,
  STORAGE_KEY_ORCAMENTOS,
} from "./lib/orcamento/orcamentosSalvosStorage";
import {
  carregar_clientes,
  salvar_clientes,
  STORAGE_KEY_CLIENTES,
} from "./lib/orcamento/clientesStorage";
import { limpar_cliente_pre_save } from "./lib/orcamento/clientesHelpers";
import { PERDA_DEFAULT } from "./lib/orcamento/defaults";
import type { OperacaoImport } from "./lib/orcamento/importacao";
import {
  criar_entrada_orcamento_duplicado,
  criar_entrada_orcamento_reprocessado,
  criar_entrada_orcamento_revertido,
  criar_entrada_status_alterado,
  criar_entrada_validade_renovada,
} from "./lib/orcamento/historicoFormatador";
import { reprocessar_orcamento_com_precos_atualizados } from "./lib/orcamento/reprocessamento";
import { merge_precos } from "./lib/orcamento/helpers";
import { loadBaseJson, loadStructures } from "./lib/dataSource";

export interface ObraMeta {
  obra: string;
  endereco: string;
  municipio: string;
  responsavel: string;
  // Vínculo opcional com o cadastro de clientes. Quando salvar o
  // orçamento, esse cliente_id passa direto para o OrcamentoSalvo.
  cliente_id?: string | null;
}

export type View =
  | { name: "home" }
  | { name: "categoria"; categoria: string }
  | { name: "resultado" }
  | { name: "precos"; filtros_iniciais?: Partial<FiltrosPrecos> }
  | { name: "relatorios" }
  | { name: "clientes" }
  | { name: "consulta" }
  | { name: "detalhe"; id: string }
  | { name: "cliente_detalhe"; id: string }
  | { name: "configuracoes" };

/** Igualdade rasa de views para decidir se vale empilhar no histórico. */
function mesma_view(a: View, b: View): boolean {
  if (a.name !== b.name) return false;
  if (a.name === "categoria" && b.name === "categoria")
    return a.categoria === b.categoria;
  if (
    (a.name === "detalhe" && b.name === "detalhe") ||
    (a.name === "cliente_detalhe" && b.name === "cliente_detalhe")
  )
    return a.id === b.id;
  return true;
}

interface State {
  loaded: boolean;
  loadError: string | null;
  materials: Map<number, Material>;
  estruturas: Map<string, Estrutura>;
  insumos: Map<string, Insumo>;
  categorias: string[];
  estruturasByCategoria: Map<string, Estrutura[]>;
  insumosByCategoria: Map<string, Insumo[]>;

  // ─── orçamento: cadastro de preços ───
  precosOficiais: Map<number, PrecoMaterial>;
  precosOverrides: Map<number, PrecoMaterial>;
  materiaisUsadosEmBom: Set<number>;

  // ─── orçamento: configuração (Etapa 5 expõe UI) ───
  configOrcamento: ConfigOrcamento;
  configHistorico: EntradaHistoricoConfig[];   // Correção 7: log de mudanças

  // ─── orçamento: snapshots salvos (Etapa 7) ───
  orcamentosSalvos: OrcamentoSalvo[];

  // ─── clientes (Etapa 2 da nova feature) ───
  clientes: Cliente[];

  view: View;
  viewHistory: View[];
  meta: ObraMeta;
  itens: ObraItem[];
  obraInsumos: ObraInsumo[];

  load: () => Promise<void>;
  setView: (v: View) => void;
  goBack: () => void;
  setMeta: (m: Partial<ObraMeta>) => void;

  addItem: (estruturaId: string, posteIdx: number, quantidade: number) => void;
  updateItemQty: (key: string, quantidade: number) => void;
  updateItemPoste: (key: string, posteIdx: number) => void;
  removeItem: (key: string) => void;

  addInsumo: (insumoId: string, quantidade: number) => void;
  updateInsumoQty: (key: string, quantidade: number) => void;
  removeInsumo: (key: string) => void;

  clearObra: () => void;

  // ─── orçamento: actions ───
  setPrecoOverride: (preco: PrecoMaterial) => void;
  clearPrecoOverride: (material_id: number) => void;
  clearAllPrecoOverrides: () => void;
  setConfigOrcamento: (c: ConfigOrcamento) => void;
  limparConfigHistorico: () => void;            // Correção 7: zerar log de config
  setPerdaOverride: (material_id: number, pct: number) => void;
  clearPerdaOverride: (material_id: number) => void;

  // Etapa 7: snapshots
  // Retorna true se gravou no LocalStorage. false significa que o caller
  // deve tratar o erro (ex.: NÃO limpar a lista de obra na Correção 6).
  salvarOrcamento: (novo: OrcamentoSalvo) => boolean;
  atualizarOrcamentoSalvo: (id: string, patch: Partial<OrcamentoSalvo>) => void;
  excluirOrcamentoSalvo: (id: string) => void;     // soft delete
  restaurarOrcamentoSalvo: (id: string) => void;   // desfaz soft delete (Etapa 3)
  limparOrcamentosSalvos: () => void;

  // Etapa 5 (nova feature): aplicar edição de itens em batch
  // Etapa 6: campos opcionais de cabeçalho
  aplicarEdicaoOrcamento: (id: string, patch: {
    itens: ItemOrcamentoSnapshot[];
    decomposicao: DecomposicaoOrcamento;
    desconto_pct: number;
    novas_entradas_historico: EntradaHistorico[];
    meta?: ObraMeta;
    dados_documento?: {
      numero: string;
      versao: number;
      condicoes_pagamento: string;
      prazo_execucao: string;
      status: OrcamentoSalvo["dados_documento"]["status"];
    };
    cliente_id?: string | null;
    observacoes?: string;
    observacoes_imposto?: string;
    validade_orcamento?: string;
  }) => void;

  // Excluir orçamento sem soft delete (usado p/ descartar v2 órfã)
  excluirOrcamentoSalvoHard: (id: string) => void;

  // Etapa 9 da feature: atalhos de gestão
  renovarValidade: (id: string, nova_validade_iso: string) => void;
  duplicarOrcamento: (id_origem: string) => string | null;             // retorna id novo
  reverterParaVersao: (id_atual: string, id_origem: string) => string | null;  // retorna id novo

  // Reprocessamento: incorpora pendentes que agora têm preço cadastrado.
  // Se rascunho, atualiza in-place. Senão, cria v2. Retorna o id resultante
  // e quantos itens foram incorporados (0 = nada a fazer).
  reprocessarOrcamentoComPrecosNovos: (id: string) => {
    aplicado: boolean;
    incorporados: number;
    novo_id: string | null;
  };

  // Correção 3 (nova lista): troca status direto na Consulta (sem abrir
  // o Detalhe). Cria entrada no histórico e atualiza salvo_em. Retorna
  // boolean (false se falhou ao persistir).
  mudarStatusOrcamentoSalvo: (
    id: string,
    novo_status: OrcamentoSalvo["dados_documento"]["status"],
  ) => boolean;

  // Etapa 2 nova feature: clientes
  criarCliente: (cliente: Cliente) => void;
  atualizarCliente: (id: string, patch: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;          // soft delete + desvincula orçamentos
  restaurarCliente: (id: string) => void;
  aplicarLoteImportacao: (operacoes: OperacaoImport[]) => {
    criados: number; atualizados: number; removidos: number;
  };
  // Correção 1: salvar em batch um conjunto de rascunhos da aba Preços.
  // `null` em qualquer mapa significa "remover override desse material".
  aplicarRascunhosPrecos: (
    rascunhos_preco: Map<number, PrecoMaterial | null>,
    rascunhos_perda: Map<number, number | null>,
  ) => { aplicados: number; removidos: number };

  resyncPrecosOverridesFromStorage: () => void;
  resyncOrcamentosSalvosFromStorage: () => void;
  resyncClientesFromStorage: () => void;
  resyncConfigOrcamentoFromStorage: () => void;
}

let counter = 0;
const newKey = () => `L${Date.now().toString(36)}${(counter++).toString(36)}`;

const CATEGORIA_ORDER = (c: string) => {
  if (c.includes("Neutro")) return 5000;
  const rural = c.includes("Rural") ? 1 : 0;
  const fase = c.startsWith("Mono") ? 0 : c.startsWith("Bi") ? 1 : 2;
  const tens = c.includes("13,8") ? 0 : c.includes("24,2") ? 1 : c.includes("34,5") ? 2 : 3;
  return rural * 1000 + fase * 10 + tens;
};

async function fetchJson<T>(file: string): Promise<T> {
  // Camada de serviço de dados: web = fetch público; Tauri = %APPDATA%/base.
  return loadBaseJson<T>(file);
}

// IDs de materiais efetivamente referenciados por qualquer BomMap do catálogo
// (base_bom, postes[].delta, insumo.bom). Define o universo "usado" para a tela
// de Preços e para a heurística "mostrar só os úteis" por padrão.
function calcular_usados(ests: Estrutura[], inss: Insumo[]): Set<number> {
  const used = new Set<number>();
  const colher = (bom: Record<string, number>) => {
    for (const k of Object.keys(bom)) used.add(Number(k));
  };
  for (const e of ests) {
    colher(e.base_bom);
    for (const p of e.postes) colher(p.delta);
  }
  for (const i of inss) colher(i.bom);
  return used;
}

export const useStore = create<State>((set, get) => ({
  loaded: false,
  loadError: null,
  materials: new Map(),
  estruturas: new Map(),
  insumos: new Map(),
  categorias: [],
  estruturasByCategoria: new Map(),
  insumosByCategoria: new Map(),
  precosOficiais: new Map(),
  precosOverrides: new Map(),
  materiaisUsadosEmBom: new Set(),
  configOrcamento: {
    // Defaults razoáveis (Etapa 5). Engenheiros novos abrem com perda já
    // aplicada por categoria; MO/frete/margem ficam zerados até serem
    // configurados. Quem já tinha config persistida (Etapa 4) mantém o seu.
    perda: {
      default_por_categoria: { ...PERDA_DEFAULT },
      override_por_material: {},
    },
    mao_obra: { tipo: "pct_material", pct: 0 },
    frete_centavos: 0,
    margem: { tipo: "markup", pct: 0 },
    validade_preco_dias: 60,
    validade_orcamento_dias: 30,
  },
  orcamentosSalvos: [],
  clientes: [],
  configHistorico: [],
  view: { name: "home" },
  viewHistory: [],
  meta: { obra: "", endereco: "", municipio: "", responsavel: "", cliente_id: null },
  itens: [],
  obraInsumos: [],

  load: async () => {
    try {
      const [mats, ests, inss, precos] = await Promise.all([
        fetchJson<Material[]>("materiais.json"),
        loadStructures(),
        fetchJson<Insumo[]>("insumos.json").catch(() => [] as Insumo[]),
        fetchJson<PrecoMaterial[]>("precos.json").catch(() => [] as PrecoMaterial[]),
      ]);
      const materials = new Map(mats.map((m) => [m.id, m]));
      // Map com TODAS as estruturas (inclusive descontinuadas) — orçamentos
      // salvos precisam continuar resolvendo a estrutura que usaram.
      const estruturas = new Map(ests.map((e) => [e.id, e]));
      const insumos = new Map(inss.map((i) => [i.id, i]));

      // UI de criação: oculta estruturas descontinuadas (mas seguem no Map acima).
      const estruturasByCategoria = new Map<string, Estrutura[]>();
      for (const e of ests) {
        if (e.status === "descontinuado") continue;
        const arr = estruturasByCategoria.get(e.categoria) ?? [];
        arr.push(e);
        estruturasByCategoria.set(e.categoria, arr);
      }
      const insumosByCategoria = new Map<string, Insumo[]>();
      for (const i of inss) {
        const arr = insumosByCategoria.get(i.categoria) ?? [];
        arr.push(i);
        insumosByCategoria.set(i.categoria, arr);
      }
      const categorias = [...estruturasByCategoria.keys()].sort(
        (a, b) => CATEGORIA_ORDER(a) - CATEGORIA_ORDER(b),
      );

      const precosOficiais = indexar_precos(precos);
      const precosOverrides = indexar_precos(carregar_overrides());
      const materiaisUsadosEmBom = calcular_usados(ests, inss);
      const configPersistida = carregar_config();
      const orcamentosSalvos = carregar_orcamentos_salvos();
      const clientes = carregar_clientes();
      const configHistorico = carregar_config_historico();

      set({
        loaded: true, materials, estruturas, insumos,
        categorias, estruturasByCategoria, insumosByCategoria,
        precosOficiais, precosOverrides, materiaisUsadosEmBom,
        orcamentosSalvos,
        clientes,
        configHistorico,
        ...(configPersistida ? { configOrcamento: configPersistida } : {}),
      });
    } catch (e) {
      set({ loadError: (e as Error).message });
    }
  },

  setView: (view) =>
    set((s) => {
      // Não empilha quando a destino é igual à view atual (evita ruído ao
      // clicar no mesmo item do menu).
      if (mesma_view(s.view, view)) return { view };
      const hist = [...s.viewHistory, s.view];
      // Limita o histórico para não crescer indefinidamente.
      if (hist.length > 50) hist.shift();
      return { view, viewHistory: hist };
    }),
  goBack: () =>
    set((s) => {
      if (s.viewHistory.length === 0) return {};
      const hist = [...s.viewHistory];
      const anterior = hist.pop() as View;
      return { view: anterior, viewHistory: hist };
    }),
  setMeta: (m) => set((s) => ({ meta: { ...s.meta, ...m } })),

  addItem: (estruturaId, posteIdx, quantidade) =>
    set((s) => {
      const existing = s.itens.find(
        (it) => it.estruturaId === estruturaId && it.posteIdx === posteIdx,
      );
      if (existing) {
        return {
          itens: s.itens.map((it) =>
            it === existing ? { ...it, quantidade: it.quantidade + quantidade } : it,
          ),
        };
      }
      return { itens: [...s.itens, { key: newKey(), estruturaId, posteIdx, quantidade }] };
    }),
  updateItemQty: (key, quantidade) =>
    set((s) => ({ itens: s.itens.map((it) => (it.key === key ? { ...it, quantidade } : it)) })),
  updateItemPoste: (key, posteIdx) =>
    set((s) => ({ itens: s.itens.map((it) => (it.key === key ? { ...it, posteIdx } : it)) })),
  removeItem: (key) => set((s) => ({ itens: s.itens.filter((it) => it.key !== key) })),

  addInsumo: (insumoId, quantidade) =>
    set((s) => {
      const existing = s.obraInsumos.find((i) => i.insumoId === insumoId);
      if (existing) {
        return {
          obraInsumos: s.obraInsumos.map((i) =>
            i === existing ? { ...i, quantidade: i.quantidade + quantidade } : i,
          ),
        };
      }
      return { obraInsumos: [...s.obraInsumos, { key: newKey(), insumoId, quantidade }] };
    }),
  updateInsumoQty: (key, quantidade) =>
    set((s) => ({ obraInsumos: s.obraInsumos.map((i) => (i.key === key ? { ...i, quantidade } : i)) })),
  removeInsumo: (key) => set((s) => ({ obraInsumos: s.obraInsumos.filter((i) => i.key !== key) })),

  clearObra: () => set({
    itens: [],
    obraInsumos: [],
    meta: { obra: "", endereco: "", municipio: "", responsavel: "", cliente_id: null },
  }),

  setPrecoOverride: (preco) =>
    set((s) => {
      const novo = new Map(s.precosOverrides);
      novo.set(preco.material_id, {
        ...preco,
        origem: "meu",
        atualizado_em: new Date().toISOString(),
      });
      salvar_overrides([...novo.values()]);
      return { precosOverrides: novo };
    }),

  clearPrecoOverride: (material_id) =>
    set((s) => {
      if (!s.precosOverrides.has(material_id)) return s;
      const novo = new Map(s.precosOverrides);
      novo.delete(material_id);
      salvar_overrides([...novo.values()]);
      return { precosOverrides: novo };
    }),

  clearAllPrecoOverrides: () =>
    set(() => {
      limpar_overrides();
      return { precosOverrides: new Map<number, PrecoMaterial>() };
    }),

  setConfigOrcamento: (c) => {
    const antes = get().configOrcamento;
    const entradas_novas = diff_config(antes, c);
    salvar_config(c);
    if (entradas_novas.length > 0) {
      const hist_novo = [...get().configHistorico, ...entradas_novas];
      salvar_config_historico(hist_novo);
      set({ configOrcamento: c, configHistorico: hist_novo });
    } else {
      set({ configOrcamento: c });
    }
  },

  limparConfigHistorico: () => {
    limpar_config_historico();
    set({ configHistorico: [] });
  },

  setPerdaOverride: (material_id, pct) =>
    set((s) => {
      const novo: ConfigOrcamento = {
        ...s.configOrcamento,
        perda: {
          ...s.configOrcamento.perda,
          override_por_material: {
            ...s.configOrcamento.perda.override_por_material,
            [material_id]: pct,
          },
        },
      };
      salvar_config(novo);
      return { configOrcamento: novo };
    }),

  clearPerdaOverride: (material_id) =>
    set((s) => {
      if (s.configOrcamento.perda.override_por_material[material_id] === undefined) return s;
      const resto = { ...s.configOrcamento.perda.override_por_material };
      delete resto[material_id];
      const novo: ConfigOrcamento = {
        ...s.configOrcamento,
        perda: { ...s.configOrcamento.perda, override_por_material: resto },
      };
      salvar_config(novo);
      return { configOrcamento: novo };
    }),

  // Correção 1: aplica em batch as edições da aba Preços que estavam em
  // rascunho local (lift state up no PrecosView). Uma única gravação no
  // LocalStorage para precos_overrides e outra para config (se houve
  // mudança de perda). Não dispara saves intermediários.
  // ── Auto-reprocessar rascunhos: depois de aplicar os preços, percorre
  //    os OrcamentoSalvo com status="rascunho" que têm pendentes agora
  //    incorporáveis e atualiza in-place. Status >= enviado continua
  //    intacto — engenheiro decide quando criar v2 via botão.
  aplicarRascunhosPrecos: (rascunhos_preco, rascunhos_perda) => {
    const s = get();
    let aplicados = 0;
    let removidos = 0;
    const agora = new Date().toISOString();

    // Preços
    if (rascunhos_preco.size > 0) {
      const novo = new Map(s.precosOverrides);
      for (const [id, valor] of rascunhos_preco) {
        if (valor === null) {
          if (novo.delete(id)) removidos++;
        } else {
          novo.set(id, { ...valor, origem: "meu", atualizado_em: agora });
          aplicados++;
        }
      }
      salvar_overrides([...novo.values()]);
      set({ precosOverrides: novo });
    }

    // Perda override por material (vive dentro de configOrcamento)
    if (rascunhos_perda.size > 0) {
      const overrides_atual = {
        ...get().configOrcamento.perda.override_por_material,
      };
      for (const [id, pct] of rascunhos_perda) {
        if (pct === null) {
          if (overrides_atual[id] !== undefined) {
            delete overrides_atual[id];
            removidos++;
          }
        } else {
          overrides_atual[id] = pct;
          aplicados++;
        }
      }
      const config_nova: ConfigOrcamento = {
        ...get().configOrcamento,
        perda: {
          ...get().configOrcamento.perda,
          override_por_material: overrides_atual,
        },
      };
      salvar_config(config_nova);
      set({ configOrcamento: config_nova });
    }

    // ── Auto-reprocessar todos os RASCUNHOS que têm pendentes agora
    //    incorporáveis. Status >= enviado fica intocado (engenheiro
    //    decide quando criar v2 pelo botão "♻ Reprocessar" no Detalhe).
    const estado_pos = get();
    const precos_efetivos = merge_precos(
      estado_pos.precosOficiais,
      estado_pos.precosOverrides,
    );
    const hoje_data = new Date();
    const lista_atualizada = estado_pos.orcamentosSalvos.map((o) => {
      if (o.excluido_em) return o;
      if (o.dados_documento.status !== "rascunho") return o;
      if (o.orcamento.pendentes.length === 0) return o;
      const r = reprocessar_orcamento_com_precos_atualizados({
        orcamento: o.orcamento,
        precos_efetivos,
        materiais: estado_pos.materials,
        hoje: hoje_data,
        desconto_pct: o.desconto_pct ?? 0,
      });
      if (r.incorporados === 0) return o;
      // Coalescência (auditoria #5): se a última entrada já é um reprocesso
      // automático, substitui em vez de empilhar — mantém o "antes" original
      // e atualiza o "depois". Evita várias linhas "(auto) reprocessou…".
      const hist = o.historico ?? [];
      const ultima = hist[hist.length - 1];
      const coalesce =
        ultima?.acao === "orcamento_reprocessado" &&
        ultima.descricao.startsWith("(auto)");
      const entrada = criar_entrada_orcamento_reprocessado({
        incorporados: r.incorporados,
        ainda_pendentes: r.ainda_pendentes,
        total_antes_centavos: coalesce
          ? ultima.total_antes_centavos ?? r.total_antes_centavos
          : r.total_antes_centavos,
        total_depois_centavos: r.total_depois_centavos,
        automatico: true,
      });
      return {
        ...o,
        orcamento: r.orcamento_novo,
        historico: coalesce
          ? [...hist.slice(0, -1), entrada]
          : [...hist, entrada],
        salvo_em: hoje_data.toISOString(),
      };
    });
    // Só persiste/atualiza state se algum orçamento mudou
    if (lista_atualizada.some((o, i) => o !== estado_pos.orcamentosSalvos[i])) {
      salvar_orcamentos_salvos(lista_atualizada);
      set({ orcamentosSalvos: lista_atualizada });
    }

    return { aplicados, removidos };
  },

  // Aplica criar/atualizar/remover em batch e grava no LocalStorage uma única
  // vez. Operações de tipo "erro" e "ignorar" são desconsideradas.
  aplicarLoteImportacao: (operacoes) => {
    const s = get();
    const novo = new Map(s.precosOverrides);
    let criados = 0, atualizados = 0, removidos = 0;
    const agora = new Date().toISOString();
    for (const op of operacoes) {
      if (op.tipo === "criar" && op.preco_proposto) {
        novo.set(op.material_id, {
          ...op.preco_proposto,
          origem: "meu",
          atualizado_em: agora,
        });
        criados++;
      } else if (op.tipo === "atualizar" && op.preco_proposto) {
        novo.set(op.material_id, {
          ...op.preco_proposto,
          origem: "meu",
          atualizado_em: agora,
        });
        atualizados++;
      } else if (op.tipo === "remover") {
        if (novo.delete(op.material_id)) removidos++;
      }
    }
    salvar_overrides([...novo.values()]);
    set({ precosOverrides: novo });
    return { criados, atualizados, removidos };
  },

  salvarOrcamento: (novo) => {
    const s = get();
    const lista = [novo, ...s.orcamentosSalvos];
    const ok = salvar_orcamentos_salvos(lista);
    if (ok) set({ orcamentosSalvos: lista });
    return ok;
  },

  atualizarOrcamentoSalvo: (id, patch) =>
    set((s) => {
      const lista = s.orcamentosSalvos.map((o) =>
        o.id === id ? { ...o, ...patch } : o,
      );
      salvar_orcamentos_salvos(lista);
      return { orcamentosSalvos: lista };
    }),

  // Soft delete (decisão da Etapa 3 da nova feature): marca excluido_em.
  // Mantemos o item na lista; o filtro `incluir_excluidos` controla o que aparece.
  excluirOrcamentoSalvo: (id) =>
    set((s) => {
      const lista = s.orcamentosSalvos.map((o) =>
        o.id === id ? { ...o, excluido_em: new Date().toISOString() } : o,
      );
      salvar_orcamentos_salvos(lista);
      // Se a view atual está no detalhe deste id, volta para Consulta.
      const ajuste =
        s.view.name === "detalhe" && s.view.id === id
          ? { view: { name: "consulta" as const } }
          : {};
      return { orcamentosSalvos: lista, ...ajuste };
    }),

  restaurarOrcamentoSalvo: (id) =>
    set((s) => {
      const lista = s.orcamentosSalvos.map((o) =>
        o.id === id ? { ...o, excluido_em: null } : o,
      );
      salvar_orcamentos_salvos(lista);
      return { orcamentosSalvos: lista };
    }),

  aplicarEdicaoOrcamento: (id, patch) =>
    set((s) => {
      const lista = s.orcamentosSalvos.map((o) => {
        if (o.id !== id) return o;
        const historico_atual = o.historico ?? [];
        const novo_orcamento = {
          ...o.orcamento,
          itens: patch.itens,
          decomposicao: patch.decomposicao,
          ...(patch.validade_orcamento !== undefined
            ? { validade_orcamento: patch.validade_orcamento }
            : {}),
        };
        return {
          ...o,
          orcamento: novo_orcamento,
          desconto_pct: patch.desconto_pct,
          historico: [...historico_atual, ...patch.novas_entradas_historico],
          salvo_em: new Date().toISOString(),
          ...(patch.meta !== undefined ? { meta: patch.meta } : {}),
          ...(patch.dados_documento !== undefined
            ? { dados_documento: patch.dados_documento }
            : {}),
          ...(patch.cliente_id !== undefined
            ? { cliente_id: patch.cliente_id }
            : {}),
          ...(patch.observacoes !== undefined
            ? { observacoes: patch.observacoes }
            : {}),
          ...(patch.observacoes_imposto !== undefined
            ? { observacoes_imposto: patch.observacoes_imposto }
            : {}),
        };
      });
      salvar_orcamentos_salvos(lista);
      return { orcamentosSalvos: lista };
    }),

  excluirOrcamentoSalvoHard: (id) =>
    set((s) => {
      const lista = s.orcamentosSalvos.filter((o) => o.id !== id);
      salvar_orcamentos_salvos(lista);
      const ajuste =
        s.view.name === "detalhe" && s.view.id === id
          ? { view: { name: "consulta" as const } }
          : {};
      return { orcamentosSalvos: lista, ...ajuste };
    }),

  // Etapa 9: atualiza apenas a data de validade. Não cria nova versão —
  // é só um ajuste de prazo (entrada no histórico para auditoria).
  renovarValidade: (id, nova_validade_iso) =>
    set((s) => {
      const alvo = s.orcamentosSalvos.find((o) => o.id === id);
      if (!alvo) return s;
      const antes = alvo.orcamento.validade_orcamento ?? "";
      if (antes === nova_validade_iso) return s;
      const entrada = criar_entrada_validade_renovada({
        validade_antes: antes,
        validade_depois: nova_validade_iso,
      });
      const lista = s.orcamentosSalvos.map((o) =>
        o.id !== id
          ? o
          : {
              ...o,
              orcamento: {
                ...o.orcamento,
                validade_orcamento: nova_validade_iso,
              },
              historico: [...(o.historico ?? []), entrada],
              salvo_em: new Date().toISOString(),
            },
      );
      salvar_orcamentos_salvos(lista);
      return { orcamentosSalvos: lista };
    }),

  // Etapa 9: cria cópia independente. Novo id, número sufixado com "(cópia)",
  // versão volta a 1, status volta a rascunho. Histórico começa com 1 entrada.
  duplicarOrcamento: (id_origem) => {
    const s = get();
    const origem = s.orcamentosSalvos.find((o) => o.id === id_origem);
    if (!origem) return null;
    const novo_id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const entrada_dup = criar_entrada_orcamento_duplicado({
      numero_origem: origem.dados_documento.numero,
      versao_origem: origem.dados_documento.versao,
    });
    const novo: OrcamentoSalvo = {
      id: novo_id,
      salvo_em: new Date().toISOString(),
      orcamento: JSON.parse(JSON.stringify(origem.orcamento)),
      meta: { ...origem.meta },
      dados_documento: {
        numero: `${origem.dados_documento.numero} (cópia)`,
        versao: 1,
        condicoes_pagamento: origem.dados_documento.condicoes_pagamento,
        prazo_execucao: origem.dados_documento.prazo_execucao,
        status: "rascunho",
      },
      cliente_id: origem.cliente_id ?? null,
      observacoes: origem.observacoes,
      observacoes_imposto: origem.observacoes_imposto,
      desconto_pct: origem.desconto_pct,
      historico: [entrada_dup],
      excluido_em: null,
    };
    const lista = [novo, ...s.orcamentosSalvos];
    salvar_orcamentos_salvos(lista);
    set({ orcamentosSalvos: lista });
    return novo_id;
  },

  // Correção 3: troca apenas o status do orçamento, cria entrada de
  // histórico e atualiza salvo_em. Não cria nova versão — é só um
  // ajuste de gestão (igual a renovarValidade). Para orçamentos com
  // status enviado/aprovado/etc, o usuário pode preferir versionar via
  // Editar (já existente) — aqui é a via rápida.
  mudarStatusOrcamentoSalvo: (id, novo_status) => {
    const s = get();
    const alvo = s.orcamentosSalvos.find((o) => o.id === id);
    if (!alvo) return false;
    if (alvo.dados_documento.status === novo_status) return true;
    const entrada = criar_entrada_status_alterado({
      status_antes: alvo.dados_documento.status,
      status_depois: novo_status,
    });
    const lista = s.orcamentosSalvos.map((o) =>
      o.id !== id
        ? o
        : {
            ...o,
            dados_documento: { ...o.dados_documento, status: novo_status },
            historico: [...(o.historico ?? []), entrada],
            salvo_em: new Date().toISOString(),
          },
    );
    const ok = salvar_orcamentos_salvos(lista);
    if (ok) set({ orcamentosSalvos: lista });
    return ok;
  },

  // Reprocessa um orçamento salvo com os preços atuais. Pendentes que
  // agora têm preço viram itens, total recalculado. Se rascunho, atualiza
  // in-place; senão, cria v2 nova (mesmo padrão do handle_editar). Entrada
  // de histórico em qualquer caso.
  reprocessarOrcamentoComPrecosNovos: (id) => {
    const s = get();
    const alvo = s.orcamentosSalvos.find((o) => o.id === id);
    if (!alvo) return { aplicado: false, incorporados: 0, novo_id: null };

    const precos_efetivos = merge_precos(s.precosOficiais, s.precosOverrides);
    const r = reprocessar_orcamento_com_precos_atualizados({
      orcamento: alvo.orcamento,
      precos_efetivos,
      materiais: s.materials,
      hoje: new Date(),
      desconto_pct: alvo.desconto_pct ?? 0,
    });

    if (r.incorporados === 0) {
      return { aplicado: false, incorporados: 0, novo_id: null };
    }

    const entrada = criar_entrada_orcamento_reprocessado({
      incorporados: r.incorporados,
      ainda_pendentes: r.ainda_pendentes,
      total_antes_centavos: r.total_antes_centavos,
      total_depois_centavos: r.total_depois_centavos,
    });

    // Rascunho → atualiza in-place
    if (alvo.dados_documento.status === "rascunho") {
      const lista = s.orcamentosSalvos.map((o) =>
        o.id !== id
          ? o
          : {
              ...o,
              orcamento: r.orcamento_novo,
              historico: [...(o.historico ?? []), entrada],
              salvo_em: new Date().toISOString(),
            },
      );
      const ok = salvar_orcamentos_salvos(lista);
      if (!ok) return { aplicado: false, incorporados: 0, novo_id: null };
      set({ orcamentosSalvos: lista });
      return { aplicado: true, incorporados: r.incorporados, novo_id: id };
    }

    // Status != rascunho → cria v2
    const max_versao = s.orcamentosSalvos
      .filter((o) => o.dados_documento.numero === alvo.dados_documento.numero)
      .reduce((m, o) => Math.max(m, o.dados_documento.versao), 0);
    const novo_id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const novo: OrcamentoSalvo = {
      id: novo_id,
      salvo_em: new Date().toISOString(),
      orcamento: r.orcamento_novo,
      meta: { ...alvo.meta },
      dados_documento: {
        ...alvo.dados_documento,
        versao: max_versao + 1,
        status: "rascunho",
      },
      cliente_id: alvo.cliente_id ?? null,
      observacoes: alvo.observacoes,
      observacoes_imposto: alvo.observacoes_imposto,
      desconto_pct: alvo.desconto_pct,
      historico: [...(alvo.historico ?? []), entrada],
      excluido_em: null,
    };
    const lista = [novo, ...s.orcamentosSalvos];
    const ok = salvar_orcamentos_salvos(lista);
    if (!ok) return { aplicado: false, incorporados: 0, novo_id: null };
    set({ orcamentosSalvos: lista });
    return { aplicado: true, incorporados: r.incorporados, novo_id };
  },

  // Etapa 9: cria uma nova versão a partir de um snapshot antigo. O conteúdo
  // (itens, decomposição, desconto, validade, meta, observações) é restaurado
  // da versão origem; o histórico combina o do orçamento atual + entrada
  // explícita de reversão. Versão fica max+1, status volta a rascunho.
  reverterParaVersao: (id_atual, id_origem) => {
    const s = get();
    const atual = s.orcamentosSalvos.find((o) => o.id === id_atual);
    const origem = s.orcamentosSalvos.find((o) => o.id === id_origem);
    if (!atual || !origem) return null;
    // Maior versão entre os salvos com o mesmo número
    const max_versao = s.orcamentosSalvos
      .filter((o) => o.dados_documento.numero === atual.dados_documento.numero)
      .reduce((m, o) => Math.max(m, o.dados_documento.versao), 0);
    const novo_id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const entrada_rev = criar_entrada_orcamento_revertido({
      versao_revertida: origem.dados_documento.versao,
    });
    const novo: OrcamentoSalvo = {
      id: novo_id,
      salvo_em: new Date().toISOString(),
      orcamento: JSON.parse(JSON.stringify(origem.orcamento)),
      meta: { ...origem.meta },
      dados_documento: {
        numero: atual.dados_documento.numero,        // preserva o "obra"
        versao: max_versao + 1,
        condicoes_pagamento: origem.dados_documento.condicoes_pagamento,
        prazo_execucao: origem.dados_documento.prazo_execucao,
        status: "rascunho",
      },
      cliente_id: origem.cliente_id ?? null,
      observacoes: origem.observacoes,
      observacoes_imposto: origem.observacoes_imposto,
      desconto_pct: origem.desconto_pct,
      historico: [...(atual.historico ?? []), entrada_rev],
      excluido_em: null,
    };
    const lista = [novo, ...s.orcamentosSalvos];
    salvar_orcamentos_salvos(lista);
    set({ orcamentosSalvos: lista });
    return novo_id;
  },

  limparOrcamentosSalvos: () =>
    set(() => {
      limpar_orcamentos_salvos();
      return { orcamentosSalvos: [] };
    }),

  criarCliente: (cliente) =>
    set((s) => {
      const novo = limpar_cliente_pre_save({
        ...cliente,
        criado_em: cliente.criado_em || new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      });
      const lista = [novo, ...s.clientes];
      salvar_clientes(lista);
      return { clientes: lista };
    }),

  atualizarCliente: (id, patch) =>
    set((s) => {
      const lista = s.clientes.map((c) => {
        if (c.id !== id) return c;
        const mesclado = limpar_cliente_pre_save({
          ...c,
          ...patch,
          id: c.id,                                       // id imutável
          criado_em: c.criado_em,                         // criado_em imutável
          atualizado_em: new Date().toISOString(),
        });
        return mesclado;
      });
      salvar_clientes(lista);
      return { clientes: lista };
    }),

  // Soft delete + desvincula orçamentos vinculados (decisão da Etapa 2).
  excluirCliente: (id) =>
    set((s) => {
      const lista = s.clientes.map((c) =>
        c.id === id ? { ...c, excluido_em: new Date().toISOString(), atualizado_em: new Date().toISOString() } : c,
      );
      const orcamentos = s.orcamentosSalvos.map((o) =>
        o.cliente_id === id ? { ...o, cliente_id: null as string | null } : o,
      );
      salvar_clientes(lista);
      salvar_orcamentos_salvos(orcamentos);
      return { clientes: lista, orcamentosSalvos: orcamentos };
    }),

  restaurarCliente: (id) =>
    set((s) => {
      const lista = s.clientes.map((c) =>
        c.id === id ? { ...c, excluido_em: null, atualizado_em: new Date().toISOString() } : c,
      );
      salvar_clientes(lista);
      return { clientes: lista };
    }),

  resyncOrcamentosSalvosFromStorage: () => {
    set({ orcamentosSalvos: carregar_orcamentos_salvos() });
  },

  resyncClientesFromStorage: () => {
    set({ clientes: carregar_clientes() });
  },

  resyncConfigOrcamentoFromStorage: () => {
    const c = carregar_config();
    if (c) set({ configOrcamento: c });
  },

  resyncPrecosOverridesFromStorage: () => {
    const atual = get().precosOverrides;
    const fromDisk = indexar_precos(carregar_overrides());
    // Trocar de referência só se mudou (evita re-render desnecessário)
    if (atual.size !== fromDisk.size) {
      set({ precosOverrides: fromDisk });
      return;
    }
    for (const [k, v] of fromDisk) {
      const cur = atual.get(k);
      if (!cur || cur.valor_centavos !== v.valor_centavos ||
          cur.unidade_preco !== v.unidade_preco ||
          cur.fator_conversao !== v.fator_conversao ||
          cur.validade !== v.validade) {
        set({ precosOverrides: fromDisk });
        return;
      }
    }
  },
}));

// Listener cross-tab: outra aba alterou storage → ressincronizar nesta.
// Roteia por ev.key. ev.key === null acontece em alguns navegadores quando o
// usuário limpa todo o LocalStorage; nesse caso, ressincronizamos tudo.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (ev) => {
    const k = ev.key;
    const all = k === null;
    if (all || k === STORAGE_KEY_OVERRIDES) {
      useStore.getState().resyncPrecosOverridesFromStorage();
    }
    if (all || k === STORAGE_KEY_ORCAMENTOS) {
      useStore.getState().resyncOrcamentosSalvosFromStorage();
    }
    if (all || k === STORAGE_KEY_CLIENTES) {
      useStore.getState().resyncClientesFromStorage();
    }
    if (all || k === STORAGE_KEY_CONFIG) {
      useStore.getState().resyncConfigOrcamentoFromStorage();
    }
    if (all || k === STORAGE_KEY_CONFIG_HIST) {
      useStore.setState({ configHistorico: carregar_config_historico() });
    }
  });
}

// ── Diff entre dois ConfigOrcamento para o log de mudanças (Correção 7).
// Gera 1 EntradaHistoricoConfig por campo que mudou (escalar). Para campos
// estruturais grandes (perda por categoria/override) gera 1 entrada
// "Perda alterada" só se houve qualquer mudança no objeto.
function diff_config(
  antes: ConfigOrcamento,
  depois: ConfigOrcamento,
): EntradaHistoricoConfig[] {
  const entradas: EntradaHistoricoConfig[] = [];
  const agora = new Date().toISOString();
  function entrada(
    campo: string,
    rotulo: string,
    a: unknown,
    b: unknown,
  ): void {
    const sa = a == null ? "" : String(a);
    const sb = b == null ? "" : String(b);
    if (sa === sb) return;
    entradas.push({
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
      quando: agora,
      campo,
      rotulo,
      valor_antes: sa,
      valor_depois: sb,
    });
  }

  // Escalares simples
  entrada("frete_centavos", "Frete (centavos)", antes.frete_centavos, depois.frete_centavos);
  entrada("margem.tipo", "Margem (tipo)", antes.margem.tipo, depois.margem.tipo);
  entrada("margem.pct", "Margem %", antes.margem.pct, depois.margem.pct);
  entrada("mao_obra.tipo", "Mão de obra (tipo)", antes.mao_obra.tipo, depois.mao_obra.tipo);
  entrada("mao_obra.pct", "Mão de obra %", antes.mao_obra.pct ?? 0, depois.mao_obra.pct ?? 0);
  entrada("validade_preco_dias", "Validade preço (dias)", antes.validade_preco_dias, depois.validade_preco_dias);
  entrada("validade_orcamento_dias", "Validade orçamento (dias)", antes.validade_orcamento_dias, depois.validade_orcamento_dias);
  entrada(
    "imposto_estimado_pct",
    "Imposto estimado %",
    antes.imposto_estimado_pct ?? 0,
    depois.imposto_estimado_pct ?? 0,
  );

  // Empresa — campo a campo (texto). Não loga o logo data-url inteiro
  // (string enorme); só registra "logo alterado / removido".
  const ea = antes.empresa ?? { nome: "", cnpj: "", endereco: "", telefone: "", email: "", logo_data_url: null };
  const eb = depois.empresa ?? { nome: "", cnpj: "", endereco: "", telefone: "", email: "", logo_data_url: null };
  entrada("empresa.nome", "Empresa — Nome", ea.nome, eb.nome);
  entrada("empresa.cnpj", "Empresa — CNPJ", ea.cnpj, eb.cnpj);
  entrada("empresa.endereco", "Empresa — Endereço", ea.endereco, eb.endereco);
  entrada("empresa.telefone", "Empresa — Telefone", ea.telefone, eb.telefone);
  entrada("empresa.email", "Empresa — E-mail", ea.email, eb.email);
  if ((ea.logo_data_url ?? "") !== (eb.logo_data_url ?? "")) {
    const evento = eb.logo_data_url
      ? (ea.logo_data_url ? "atualizado" : "adicionado")
      : "removido";
    entrada("empresa.logo", "Empresa — Logo", "—", evento);
  }

  // Perda — tudo-ou-nada (JSON inteiro)
  const perda_antes = JSON.stringify(antes.perda);
  const perda_depois = JSON.stringify(depois.perda);
  if (perda_antes !== perda_depois) {
    entrada("perda", "Perda (categoria/override)", "—", "alterada");
  }

  // Tabela de MO — também tudo-ou-nada
  const tab_antes = JSON.stringify(antes.mao_obra.tabela ?? {});
  const tab_depois = JSON.stringify(depois.mao_obra.tabela ?? {});
  if (tab_antes !== tab_depois) {
    entrada("mao_obra.tabela", "Mão de obra (tabela por estrutura)", "—", "alterada");
  }

  return entradas;
}
