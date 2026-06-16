import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../store";
import type {
  Cliente,
  DecomposicaoOrcamento,
  EntradaHistorico,
  ItemOrcamentoSnapshot,
  OrcamentoSalvo,
  StatusOrcamento,
} from "../../lib/orcamento/types";
import { preparar_linhas_documento } from "../../lib/orcamento/documentoHelpers";
import { exportar_pdf_orcamento } from "../../export/pdfOrcamento";
import { exportar_excel_orcamento } from "../../export/excelOrcamento";
import {
  criar_entrada_cabecalho_alterado,
  criar_entrada_desconto_total_alterado,
  criar_entrada_item_adicionado,
  criar_entrada_item_preco_alterado,
  criar_entrada_item_qty_alterada,
  criar_entrada_item_removido,
  criar_entrada_status_alterado,
  criar_entrada_versao_criada,
} from "../../lib/orcamento/historicoFormatador";
import {
  editar_preco_item,
  editar_qty_item,
  recalcular_decomposicao_de_itens,
} from "../../lib/orcamento/edicao";
import { OrcamentoTabela } from "../orcamento/OrcamentoTabela";
import { OrcamentoDecomposicao } from "../orcamento/OrcamentoDecomposicao";
import { OrcamentoPendentes } from "../orcamento/OrcamentoPendentes";
import { DetalheCabecalho } from "./DetalheCabecalho";
import { DetalheHistorico } from "./DetalheHistorico";
import { DetalheAcoes } from "./DetalheAcoes";
import { EditarBarraTopo } from "./EditarBarraTopo";
import { EditarItensSection } from "./EditarItensSection";
import { AdicionarItemModal } from "./AdicionarItemModal";
import {
  EditarCabecalhoSection,
  type CabecalhoEditavel,
} from "./EditarCabecalhoSection";
import { ClienteForm } from "../clientes/ClienteForm";
import { RenovarValidadeModal } from "./RenovarValidadeModal";
import { ReverterVersaoModal } from "./ReverterVersaoModal";
import { SeletorProprietarioModal } from "./SeletorProprietarioModal";

function gerar_uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function deep_clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function cabecalho_inicial(salvo: OrcamentoSalvo): CabecalhoEditavel {
  return {
    cliente_id: salvo.cliente_id ?? null,
    numero: salvo.dados_documento.numero,
    versao: salvo.dados_documento.versao,
    status: salvo.dados_documento.status,
    condicoes_pagamento: salvo.dados_documento.condicoes_pagamento ?? "",
    prazo_execucao: salvo.dados_documento.prazo_execucao ?? "",
    validade_orcamento: salvo.orcamento.validade_orcamento ?? "",
    observacoes: salvo.observacoes ?? "",
    observacoes_imposto: salvo.observacoes_imposto ?? "",
    meta_obra: salvo.meta.obra ?? "",
    meta_endereco: salvo.meta.endereco ?? "",
    meta_municipio: salvo.meta.municipio ?? "",
    meta_responsavel: salvo.meta.responsavel ?? "",
    mao_obra_override_centavos: null,
  };
}

interface Props {
  id: string;
}

export function DetalheOrcamentoView({ id }: Props) {
  const orcamentos = useStore((s) => s.orcamentosSalvos);
  const clientes = useStore((s) => s.clientes);
  const materials = useStore((s) => s.materials);
  const setView = useStore((s) => s.setView);
  const salvarOrcamento = useStore((s) => s.salvarOrcamento);
  const aplicarEdicaoOrcamento = useStore((s) => s.aplicarEdicaoOrcamento);
  const criarCliente = useStore((s) => s.criarCliente);
  const renovarValidade = useStore((s) => s.renovarValidade);
  const duplicarOrcamento = useStore((s) => s.duplicarOrcamento);
  const reverterParaVersao = useStore((s) => s.reverterParaVersao);
  const reprocessarOrcamentoComPrecosNovos = useStore((s) => s.reprocessarOrcamentoComPrecosNovos);
  const precosOficiais = useStore((s) => s.precosOficiais);
  const precosOverrides = useStore((s) => s.precosOverrides);

  const salvo: OrcamentoSalvo | null = useMemo(
    () => orcamentos.find((o) => o.id === id) ?? null,
    [orcamentos, id],
  );

  const cliente: Cliente | null = useMemo(
    () =>
      salvo?.cliente_id
        ? clientes.find((c) => c.id === salvo.cliente_id) ?? null
        : null,
    [salvo, clientes],
  );

  const clientes_ativos = useMemo(
    () => clientes.filter((c) => !c.excluido_em),
    [clientes],
  );

  // ─── Estado de edição ──────────────────────────────────────────
  const [modo_edicao, set_modo_edicao] = useState(false);
  // Quando true, salvar materializa uma NOVA versão (origem não era rascunho).
  // A v2 só é criada/gravada no Salvar — nunca ao entrar em edição (evita
  // versões órfãs duplicadas se o usuário sair sem salvar). Ver auditoria #1.
  const [criar_v2_ao_salvar, set_criar_v2_ao_salvar] = useState(false);
  const [itens_editados, set_itens_editados] = useState<ItemOrcamentoSnapshot[]>([]);
  const [desconto_pct_editado, set_desconto_pct_editado] = useState(0);
  const [historico_pendente, set_historico_pendente] = useState<EntradaHistorico[]>([]);
  const [cabecalho_editado, set_cabecalho_editado] = useState<CabecalhoEditavel | null>(null);
  const [modal_adicionar, set_modal_adicionar] = useState(false);
  const [modal_novo_cliente, set_modal_novo_cliente] = useState(false);
  const [modal_renovar, set_modal_renovar] = useState(false);
  const [modal_reverter, set_modal_reverter] = useState(false);
  // Correção 2: seletor de proprietário quando exporta sem cliente
  const [pendente_export, set_pendente_export] = useState<"pdf" | "excel" | null>(null);

  // Toast "recém-salvo": flag plantada por OrcamentoView.handle_salvar
  // (Correção 6). Pattern oficial React 19: ler durante render com chave
  // externa (o `id`), em vez de setState dentro de useEffect.
  const [last_toast_id, set_last_toast_id] = useState<string | null>(null);
  const [toast_recem_salvo, set_toast_recem_salvo] = useState(false);
  if (last_toast_id !== id) {
    set_last_toast_id(id);
    if (typeof window !== "undefined") {
      try {
        const flag = sessionStorage.getItem("orcamento_recem_salvo");
        if (flag === id) {
          sessionStorage.removeItem("orcamento_recem_salvo");
          set_toast_recem_salvo(true);
        } else if (toast_recem_salvo) {
          set_toast_recem_salvo(false);
        }
      } catch {
        /* sessionStorage indisponível — ignora */
      }
    }
  }
  // Auto-hide após 5s — setTimeout num useEffect com chave do próprio toast
  useEffect(() => {
    if (!toast_recem_salvo) return;
    const t = setTimeout(() => set_toast_recem_salvo(false), 5000);
    return () => clearTimeout(t);
  }, [toast_recem_salvo]);

  // Conta pendentes que agora podem ser incorporados (têm preço novo)
  const pendentes_incorporaveis = useMemo(() => {
    if (!salvo) return 0;
    // Lazy import (evita ciclo) — função pura
    const precos = new Map(precosOficiais);
    for (const [k, v] of precosOverrides) precos.set(k, v);
    let n = 0;
    for (const pend of salvo.orcamento.pendentes) {
      if (pend.motivo === "qty_invalida") continue;
      const preco = precos.get(pend.material_id);
      const material = materials.get(pend.material_id);
      if (!material || !preco) continue;
      // Mesma lógica do helper, simples: se unidade bate ou tem fator → incorporável
      const precisa_fator = preco.unidade_preco !== material.unidade;
      if (precisa_fator && preco.fator_conversao == null) continue;
      n++;
    }
    return n;
  }, [salvo, precosOficiais, precosOverrides, materials]);

  // Versões anteriores do mesmo número (para o modal de reverter)
  const versoes_anteriores = useMemo(() => {
    if (!salvo) return [];
    return orcamentos.filter(
      (o) =>
        o.id !== salvo.id &&
        !o.excluido_em &&
        o.dados_documento.numero === salvo.dados_documento.numero &&
        o.dados_documento.versao < salvo.dados_documento.versao,
    );
  }, [orcamentos, salvo]);

  // Cross-tab: detecta conflito quando outra aba modifica o mesmo orçamento
  // durante a edição local. Banner pede "Recarregar" ou "Continuar".
  const [salvo_em_referencia, set_salvo_em_referencia] = useState<string | null>(null);
  const [conflito_dismissed, set_conflito_dismissed] = useState(false);
  const tem_conflito_cross_tab =
    modo_edicao &&
    !conflito_dismissed &&
    !!salvo &&
    !!salvo_em_referencia &&
    salvo.salvo_em !== salvo_em_referencia;

  // Decomposição recalculada em tempo real durante edição
  const decomposicao_editada: DecomposicaoOrcamento = useMemo(() => {
    if (!salvo)
      return {
        subtotal_material_centavos: 0,
        perda_centavos: 0,
        mao_obra_centavos: 0,
        frete_centavos: 0,
        base_para_margem_centavos: 0,
        margem_centavos: 0,
        total_centavos: 0,
        desconto_centavos: 0,
      };
    return recalcular_decomposicao_de_itens({
      itens: itens_editados,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: desconto_pct_editado,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
  }, [salvo, itens_editados, desconto_pct_editado, cabecalho_editado]);

  // beforeunload: avisa se há mudanças não salvas
  useEffect(() => {
    if (!modo_edicao) return;
    function handler(e: BeforeUnloadEvent) {
      if (historico_pendente.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [modo_edicao, historico_pendente.length]);

  function entrar_em_edicao(salvo_alvo: OrcamentoSalvo, criar_v2: boolean) {
    set_itens_editados(deep_clone(salvo_alvo.orcamento.itens));
    set_desconto_pct_editado(salvo_alvo.desconto_pct ?? 0);
    set_cabecalho_editado(cabecalho_inicial(salvo_alvo));
    set_historico_pendente([]);
    set_criar_v2_ao_salvar(criar_v2);
    set_salvo_em_referencia(salvo_alvo.salvo_em);
    set_conflito_dismissed(false);
    set_modo_edicao(true);
  }

  function sair_de_edicao() {
    set_modo_edicao(false);
    set_criar_v2_ao_salvar(false);
    set_itens_editados([]);
    set_historico_pendente([]);
    set_cabecalho_editado(null);
    set_salvo_em_referencia(null);
    set_conflito_dismissed(false);
  }

  function handle_recarregar_apos_conflito() {
    if (!salvo) return;
    if (historico_pendente.length > 0) {
      const ok = window.confirm(
        `Você tem ${historico_pendente.length} mudança(s) não salva(s). Descartar e recarregar com os dados atualizados?`,
      );
      if (!ok) return;
    }
    entrar_em_edicao(salvo, criar_v2_ao_salvar);
  }

  function handle_editar() {
    if (!salvo) return;
    const status = salvo.dados_documento.status;
    // Rascunho → edita no lugar. Enviado/aprovado/etc → edita localmente e a
    // nova versão só é criada no Salvar (não grava nada agora). Auditoria #1.
    entrar_em_edicao(salvo, status !== "rascunho");
  }

  function handle_salvar_edicao() {
    if (!salvo || !cabecalho_editado) return;
    if (historico_pendente.length === 0) {
      sair_de_edicao();
      return;
    }

    // Origem não era rascunho: materializa a NOVA versão agora (lazy).
    if (criar_v2_ao_salvar) {
      const entrada_v2 = criar_entrada_versao_criada({
        versao_antes: salvo.dados_documento.versao,
        versao_depois: salvo.dados_documento.versao + 1,
      });
      const v2: OrcamentoSalvo = {
        id: gerar_uuid(),
        salvo_em: new Date().toISOString(),
        orcamento: {
          ...deep_clone(salvo.orcamento),
          itens: itens_editados,
          decomposicao: decomposicao_editada,
          validade_orcamento: cabecalho_editado.validade_orcamento,
        },
        meta: {
          ...salvo.meta,
          obra: cabecalho_editado.meta_obra,
          endereco: cabecalho_editado.meta_endereco,
          municipio: cabecalho_editado.meta_municipio,
          responsavel: cabecalho_editado.meta_responsavel,
        },
        dados_documento: {
          numero: cabecalho_editado.numero,
          versao: salvo.dados_documento.versao + 1,
          condicoes_pagamento: cabecalho_editado.condicoes_pagamento,
          prazo_execucao: cabecalho_editado.prazo_execucao,
          status: "rascunho",
        },
        cliente_id: cabecalho_editado.cliente_id,
        observacoes: cabecalho_editado.observacoes,
        observacoes_imposto: cabecalho_editado.observacoes_imposto,
        desconto_pct: desconto_pct_editado,
        historico: [...(salvo.historico ?? []), entrada_v2, ...historico_pendente],
        excluido_em: null,
      };
      salvarOrcamento(v2);
      sair_de_edicao();
      setView({ name: "detalhe", id: v2.id });
      return;
    }

    aplicarEdicaoOrcamento(salvo.id, {
      itens: itens_editados,
      decomposicao: decomposicao_editada,
      desconto_pct: desconto_pct_editado,
      novas_entradas_historico: historico_pendente,
      meta: {
        obra: cabecalho_editado.meta_obra,
        endereco: cabecalho_editado.meta_endereco,
        municipio: cabecalho_editado.meta_municipio,
        responsavel: cabecalho_editado.meta_responsavel,
      },
      dados_documento: {
        numero: cabecalho_editado.numero,
        versao: cabecalho_editado.versao,
        condicoes_pagamento: cabecalho_editado.condicoes_pagamento,
        prazo_execucao: cabecalho_editado.prazo_execucao,
        status: cabecalho_editado.status,
      },
      cliente_id: cabecalho_editado.cliente_id,
      observacoes: cabecalho_editado.observacoes,
      observacoes_imposto: cabecalho_editado.observacoes_imposto,
      validade_orcamento: cabecalho_editado.validade_orcamento,
    });
    sair_de_edicao();
  }

  function handle_descartar_edicao() {
    // Nada foi gravado durante a edição (a v2, quando aplicável, só nasce no
    // Salvar), então descartar é apenas sair do modo edição. Auditoria #1.
    if (historico_pendente.length > 0) {
      const ok = window.confirm("Descartar mudanças não salvas?");
      if (!ok) return;
    }
    sair_de_edicao();
  }

  // ─── Handlers de edição de itens ──────────────────────────────
  function handle_adicionar(item: ItemOrcamentoSnapshot) {
    if (!salvo) return;
    const total_antes = decomposicao_editada.total_centavos;
    const novos = [...itens_editados, item];
    const dec_depois = recalcular_decomposicao_de_itens({
      itens: novos,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: desconto_pct_editado,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
    const entrada = criar_entrada_item_adicionado({
      item_id: item.material_id,
      descricao_material: item.descricao_snapshot,
      unidade: item.unidade_snapshot,
      qty: item.qty,
      preco_centavos: item.preco_unit_centavos,
      subtotal_centavos: item.subtotal_centavos,
      total_antes_centavos: total_antes,
      total_depois_centavos: dec_depois.total_centavos,
    });
    set_itens_editados(novos);
    set_historico_pendente([...historico_pendente, entrada]);
  }

  // Adição em lote (decomposição de uma estrutura). Mescla por material_id
  // (soma a qty) e registra uma entrada de histórico por material.
  function handle_adicionar_varios(itens_novos: ItemOrcamentoSnapshot[]) {
    if (!salvo || itens_novos.length === 0) return;
    let acc = [...itens_editados];
    let total_corrente = decomposicao_editada.total_centavos;
    const novas_entradas = [] as ReturnType<typeof criar_entrada_item_adicionado>[];
    // Carimbo único do lote → o histórico agrupa as N linhas numa só (auditoria #6).
    const quando_lote = new Date().toISOString();

    for (const novo of itens_novos) {
      const total_antes = total_corrente;
      const idx = acc.findIndex((i) => i.material_id === novo.material_id);
      if (idx >= 0) {
        const merged = editar_qty_item(acc[idx], acc[idx].qty + novo.qty);
        acc = acc.map((i, k) => (k === idx ? merged : i));
      } else {
        acc = [...acc, novo];
      }
      const dec = recalcular_decomposicao_de_itens({
        itens: acc,
        config: salvo.orcamento.config_snapshot,
        desconto_pct: desconto_pct_editado,
        mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
        mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
      });
      total_corrente = dec.total_centavos;
      novas_entradas.push(
        criar_entrada_item_adicionado({
          item_id: novo.material_id,
          descricao_material: novo.descricao_snapshot,
          unidade: novo.unidade_snapshot,
          qty: novo.qty,
          preco_centavos: novo.preco_unit_centavos,
          subtotal_centavos: novo.subtotal_centavos,
          total_antes_centavos: total_antes,
          total_depois_centavos: total_corrente,
          quando: quando_lote,
        }),
      );
    }

    set_itens_editados(acc);
    set_historico_pendente([...historico_pendente, ...novas_entradas]);
  }

  function handle_remover(material_id: number) {
    if (!salvo) return;
    const item = itens_editados.find((i) => i.material_id === material_id);
    if (!item) return;
    const total_antes = decomposicao_editada.total_centavos;
    const novos = itens_editados.filter((i) => i.material_id !== material_id);
    const dec_depois = recalcular_decomposicao_de_itens({
      itens: novos,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: desconto_pct_editado,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
    const entrada = criar_entrada_item_removido({
      item_id: item.material_id,
      descricao_material: item.descricao_snapshot,
      unidade: item.unidade_snapshot,
      qty: item.qty,
      preco_centavos: item.preco_unit_centavos,
      subtotal_centavos: item.subtotal_centavos,
      total_antes_centavos: total_antes,
      total_depois_centavos: dec_depois.total_centavos,
    });
    set_itens_editados(novos);
    set_historico_pendente([...historico_pendente, entrada]);
  }

  function handle_editar_qty(material_id: number, nova_qty: number) {
    if (!salvo) return;
    const item = itens_editados.find((i) => i.material_id === material_id);
    if (!item) return;
    const subtotal_antes = item.subtotal_centavos;
    const total_antes = decomposicao_editada.total_centavos;
    const item_novo = editar_qty_item(item, nova_qty);
    const novos = itens_editados.map((i) =>
      i.material_id === material_id ? item_novo : i,
    );
    const dec_depois = recalcular_decomposicao_de_itens({
      itens: novos,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: desconto_pct_editado,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
    const entrada = criar_entrada_item_qty_alterada({
      item_id: item.material_id,
      descricao_material: item.descricao_snapshot,
      unidade: item.unidade_snapshot,
      qty_antes: item.qty,
      qty_depois: nova_qty,
      subtotal_antes_centavos: subtotal_antes,
      subtotal_depois_centavos: item_novo.subtotal_centavos,
      total_antes_centavos: total_antes,
      total_depois_centavos: dec_depois.total_centavos,
    });
    set_itens_editados(novos);
    set_historico_pendente([...historico_pendente, entrada]);
  }

  function handle_editar_preco(material_id: number, novo_preco_centavos: number) {
    if (!salvo) return;
    const item = itens_editados.find((i) => i.material_id === material_id);
    if (!item) return;
    const total_antes = decomposicao_editada.total_centavos;
    const item_novo = editar_preco_item(item, novo_preco_centavos);
    const novos = itens_editados.map((i) =>
      i.material_id === material_id ? item_novo : i,
    );
    const dec_depois = recalcular_decomposicao_de_itens({
      itens: novos,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: desconto_pct_editado,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
    const entrada = criar_entrada_item_preco_alterado({
      item_id: item.material_id,
      descricao_material: item.descricao_snapshot,
      preco_antes_centavos: item.preco_unit_centavos,
      preco_depois_centavos: novo_preco_centavos,
      total_antes_centavos: total_antes,
      total_depois_centavos: dec_depois.total_centavos,
    });
    set_itens_editados(novos);
    set_historico_pendente([...historico_pendente, entrada]);
  }

  function handle_editar_desconto(novo_pct: number) {
    if (!salvo) return;
    const total_antes = decomposicao_editada.total_centavos;
    const pct_antes = desconto_pct_editado;
    const dec_depois = recalcular_decomposicao_de_itens({
      itens: itens_editados,
      config: salvo.orcamento.config_snapshot,
      desconto_pct: novo_pct,
      mao_obra_original_centavos: salvo.orcamento.decomposicao.mao_obra_centavos,
      mao_obra_override: cabecalho_editado?.mao_obra_override_centavos ?? null,
    });
    const entrada = criar_entrada_desconto_total_alterado({
      pct_antes,
      pct_depois: novo_pct,
      total_antes_centavos: total_antes,
      total_depois_centavos: dec_depois.total_centavos,
    });
    set_desconto_pct_editado(novo_pct);
    set_historico_pendente([...historico_pendente, entrada]);
  }

  // ─── Handler de mudança em campos do cabeçalho ────────────────
  function handle_cabecalho_change<K extends keyof CabecalhoEditavel>(
    campo: K,
    valor_novo: CabecalhoEditavel[K],
    rotulo_humano?: string,
  ) {
    if (!cabecalho_editado) return;
    const valor_antes = cabecalho_editado[campo];
    if (valor_antes === valor_novo) return;

    set_cabecalho_editado({ ...cabecalho_editado, [campo]: valor_novo });

    // Coalescência (auditoria #2): se a última entrada pendente é do MESMO
    // campo, substitui mantendo o valor_antes original e atualizando só o
    // valor_depois. Assim digitar "4000" vira UMA linha "— → 4000" em vez de
    // uma por tecla.
    set_historico_pendente((prev) => {
      const ultima = prev[prev.length - 1];
      if (campo === "status") {
        const coalesce =
          ultima && ultima.acao === "status_alterado";
        const antes = coalesce
          ? (ultima.valor_antes as StatusOrcamento)
          : (valor_antes as StatusOrcamento);
        const nova = criar_entrada_status_alterado({
          status_antes: antes,
          status_depois: valor_novo as StatusOrcamento,
        });
        return coalesce ? [...prev.slice(0, -1), nova] : [...prev, nova];
      }
      const coalesce =
        ultima &&
        ultima.acao === "cabecalho_alterado" &&
        ultima.campo === String(campo);
      const antes = coalesce
        ? ultima.valor_antes ?? ""
        : String(valor_antes ?? "");
      const nova = criar_entrada_cabecalho_alterado({
        campo: String(campo),
        rotulo: rotulo_humano ?? String(campo),
        valor_antes: antes,
        valor_depois: String(valor_novo ?? ""),
      });
      // Se a mudança volta ao valor original, remove a entrada coalescida.
      if (coalesce && antes === String(valor_novo ?? "")) {
        return prev.slice(0, -1);
      }
      return coalesce ? [...prev.slice(0, -1), nova] : [...prev, nova];
    });
  }

  // ─── Modal novo cliente (durante edição) ──────────────────────
  function handle_salvar_novo_cliente(c: Cliente) {
    criarCliente(c);
    // Auto-vincula o novo cliente ao orçamento
    handle_cabecalho_change("cliente_id", c.id, "Cliente");
    set_modal_novo_cliente(false);
  }

  function voltar() {
    if (modo_edicao && historico_pendente.length > 0) {
      const ok = window.confirm("Você tem mudanças não salvas. Sair sem salvar?");
      if (!ok) return;
    }
    setView({ name: "consulta" });
  }

  function exportar_com(formato: "pdf" | "excel", cliente_efetivo: Cliente | null) {
    if (!salvo) return;
    const linhas = preparar_linhas_documento(
      salvo.orcamento,
      salvo.meta,
      salvo.dados_documento,
      materials,
      cliente_efetivo,
    );
    if (formato === "pdf") exportar_pdf_orcamento(linhas);
    else exportar_excel_orcamento(linhas);
  }

  function exportar(formato: "pdf" | "excel") {
    if (!salvo) return;
    // Se já tem cliente vinculado, usa direto (dados atuais)
    if (cliente) {
      exportar_com(formato, cliente);
      return;
    }
    // Sem cliente: abre seletor antes
    set_pendente_export(formato);
  }

  // ─── Handlers de atalhos de gestão (Etapa 9) ────────────────
  function handle_renovar_validade(nova_validade_iso: string) {
    if (!salvo) return;
    renovarValidade(salvo.id, nova_validade_iso);
    set_modal_renovar(false);
  }

  function handle_duplicar() {
    if (!salvo) return;
    const ok = window.confirm(
      `Duplicar orçamento ${salvo.dados_documento.numero}?\n` +
      `Vai criar uma cópia "${salvo.dados_documento.numero} (cópia)" como rascunho v1, ` +
      `pronta para você ajustar.`,
    );
    if (!ok) return;
    const novo_id = duplicarOrcamento(salvo.id);
    if (novo_id) setView({ name: "detalhe", id: novo_id });
  }

  function handle_reprocessar() {
    if (!salvo || pendentes_incorporaveis === 0) return;
    const eh_rascunho = salvo.dados_documento.status === "rascunho";
    const msg = eh_rascunho
      ? `Reprocessar este orçamento com os preços atualizados?\n${pendentes_incorporaveis} pendente(s) viram itens e o total é recalculado. A mudança fica registrada no histórico.`
      : `Este orçamento está com status "${salvo.dados_documento.status}". Vou criar uma NOVA versão (v${salvo.dados_documento.versao + 1}) já reprocessada, em rascunho. A versão atual fica intacta.`;
    if (!window.confirm(msg)) return;
    const res = reprocessarOrcamentoComPrecosNovos(salvo.id);
    if (!res.aplicado) {
      window.alert("Não foi possível reprocessar.");
      return;
    }
    window.alert(`Reprocessado: ${res.incorporados} item(ns) incorporados.`);
    if (res.novo_id && res.novo_id !== salvo.id) {
      setView({ name: "detalhe", id: res.novo_id });
    }
  }

  function handle_reverter(id_origem: string) {
    if (!salvo) return;
    const origem = versoes_anteriores.find((v) => v.id === id_origem);
    if (!origem) return;
    const ok = window.confirm(
      `Reverter para a v${origem.dados_documento.versao}?\n` +
      `Vai criar uma nova versão (v${salvo.dados_documento.versao + 1}) com o conteúdo da v${origem.dados_documento.versao}.\n` +
      `As versões existentes ficam intactas.`,
    );
    if (!ok) return;
    const novo_id = reverterParaVersao(salvo.id, id_origem);
    set_modal_reverter(false);
    if (novo_id) setView({ name: "detalhe", id: novo_id });
  }

  function salvar_nova_versao() {
    if (!salvo) return;
    const novo: OrcamentoSalvo = {
      id: gerar_uuid(),
      salvo_em: new Date().toISOString(),
      orcamento: deep_clone(salvo.orcamento),
      meta: { ...salvo.meta },
      dados_documento: {
        ...salvo.dados_documento,
        versao: salvo.dados_documento.versao + 1,
      },
      cliente_id: salvo.cliente_id,
      observacoes: salvo.observacoes,
      observacoes_imposto: salvo.observacoes_imposto,
      desconto_pct: salvo.desconto_pct,
      historico: salvo.historico ? [...salvo.historico] : undefined,
    };
    salvarOrcamento(novo);
    setView({ name: "detalhe", id: novo.id });
  }

  if (!salvo) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">Orçamento não encontrado.</p>
        <button
          onClick={() => setView({ name: "consulta" })}
          className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          ← Voltar para Consulta
        </button>
      </div>
    );
  }

  const dec_atual = modo_edicao ? decomposicao_editada : salvo.orcamento.decomposicao;
  const itens_atual = modo_edicao ? itens_editados : salvo.orcamento.itens;
  const historico_combinado = [
    ...(salvo.historico ?? []),
    ...historico_pendente,
  ];

  return (
    <div className="space-y-4">
      {toast_recem_salvo && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span>
            ✅ <span className="font-semibold">Orçamento salvo.</span>{" "}
            A lista de obra foi esvaziada — pronto para começar uma nova.
          </span>
          <button
            onClick={() => set_toast_recem_salvo(false)}
            className="text-xs text-emerald-700 hover:text-emerald-900"
            aria-label="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {modo_edicao && (
        <EditarBarraTopo
          mudancas_pendentes={historico_pendente.length}
          total_atual_centavos={dec_atual.total_centavos}
          total_parcial={salvo.orcamento.total_parcial}
          onSalvar={handle_salvar_edicao}
          onDescartar={handle_descartar_edicao}
        />
      )}

      {modo_edicao && criar_v2_ao_salvar && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
          ℹ Este orçamento está como{" "}
          <strong>{salvo.dados_documento.status}</strong>. Ao{" "}
          <strong>salvar</strong>, será criada a versão{" "}
          <strong>v{salvo.dados_documento.versao + 1}</strong> (rascunho) — a
          versão atual fica intacta. Se sair sem salvar, nada é criado.
        </div>
      )}

      {tem_conflito_cross_tab && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2 text-xs text-amber-900">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                ⚠ Este orçamento foi alterado em outra aba ou janela
              </div>
              <div className="mt-0.5">
                Se você clicar <strong>Salvar mudanças</strong>, suas edições
                vão sobrescrever as do outro lugar. Use{" "}
                <strong>Recarregar</strong> para começar de novo com os dados
                atualizados — perde {historico_pendente.length} mudança(s)
                pendente(s).
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={handle_recarregar_apos_conflito}
                className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              >
                ↺ Recarregar
              </button>
              <button
                onClick={() => set_conflito_dismissed(true)}
                className="rounded border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50"
              >
                Continuar editando
              </button>
            </div>
          </div>
        </div>
      )}

      {!modo_edicao && (
        <DetalheAcoes
          onVoltar={voltar}
          onExportarPdf={() => exportar("pdf")}
          onExportarExcel={() => exportar("excel")}
          onSalvarNovaVersao={salvar_nova_versao}
          onEditar={handle_editar}
          onDuplicar={handle_duplicar}
          onReverter={() => set_modal_reverter(true)}
          pode_reverter={versoes_anteriores.length > 0}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 min-w-0">
          {modo_edicao && cabecalho_editado ? (
            <EditarCabecalhoSection
              valor={cabecalho_editado}
              clientes_ativos={clientes_ativos}
              onChangeCampo={handle_cabecalho_change}
              onNovoCliente={() => set_modal_novo_cliente(true)}
            />
          ) : (
            <DetalheCabecalho
              salvo={salvo}
              cliente={cliente}
              onRenovarValidade={() => set_modal_renovar(true)}
            />
          )}

          {salvo.orcamento.avisos_globais.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
              {salvo.orcamento.avisos_globais.map((a, i) => (
                <p key={i}>⚠ {a}</p>
              ))}
            </div>
          )}

          {modo_edicao ? (
            <>
              <EditarItensSection
                itens={itens_atual}
                onAdicionar={() => set_modal_adicionar(true)}
                onEditQty={handle_editar_qty}
                onEditPreco={handle_editar_preco}
                onRemover={handle_remover}
              />
              <DescontoEditavel
                pct={desconto_pct_editado}
                onChange={handle_editar_desconto}
              />
            </>
          ) : (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Itens precificados ({itens_atual.length})
              </h3>
              <OrcamentoTabela itens={itens_atual} />
            </section>
          )}

          <OrcamentoDecomposicao
            decomposicao={dec_atual}
            config={salvo.orcamento.config_snapshot}
            total_parcial={salvo.orcamento.total_parcial}
          />

          <OrcamentoPendentes
            pendentes={salvo.orcamento.pendentes}
            onCadastrar={() => {
              setView({
                name: "precos",
                filtros_iniciais: {
                  origem: "sem_preco",
                  apenas_obra: salvo.orcamento.pendentes
                    .filter((p) => p.motivo === "sem_preco")
                    .map((p) => p.material_id),
                },
              });
            }}
            incorporaveis={pendentes_incorporaveis}
            onReprocessar={modo_edicao ? undefined : handle_reprocessar}
          />
        </div>

        <div className="space-y-4">
          <DetalheHistorico historico={historico_combinado} />
        </div>
      </div>

      {modal_adicionar && (
        <AdicionarItemModal
          onAdicionar={(item) => {
            handle_adicionar(item);
            set_modal_adicionar(false);
          }}
          onAdicionarVarios={handle_adicionar_varios}
          onFechar={() => set_modal_adicionar(false)}
        />
      )}

      {modal_novo_cliente && (
        <ClienteForm
          onSalvar={handle_salvar_novo_cliente}
          onCancelar={() => set_modal_novo_cliente(false)}
        />
      )}

      {modal_renovar && (
        <RenovarValidadeModal
          validade_atual={salvo.orcamento.validade_orcamento}
          onConfirmar={handle_renovar_validade}
          onFechar={() => set_modal_renovar(false)}
        />
      )}

      {modal_reverter && (
        <ReverterVersaoModal
          atual={salvo}
          versoes_anteriores={versoes_anteriores}
          onConfirmar={handle_reverter}
          onFechar={() => set_modal_reverter(false)}
        />
      )}

      {pendente_export && (
        <SeletorProprietarioModal
          clientes_ativos={clientes_ativos}
          formato_label={pendente_export === "pdf" ? "PDF" : "Excel"}
          onCancelar={() => set_pendente_export(null)}
          onConfirmar={(cli) => {
            exportar_com(pendente_export, cli);
            set_pendente_export(null);
          }}
        />
      )}
    </div>
  );
}

function DescontoEditavel({
  pct,
  onChange,
}: {
  pct: number;
  onChange: (novo: number) => void;
}) {
  const [str, setStr] = useState(String(pct).replace(".", ","));
  const [last_pct, set_last_pct] = useState(pct);
  if (last_pct !== pct) {
    set_last_pct(pct);
    setStr(String(pct).replace(".", ","));
  }
  function commit() {
    const v = parseFloat(str.replace(",", "."));
    if (!Number.isFinite(v) || v < 0 || v >= 100) {
      setStr(String(pct).replace(".", ","));
      return;
    }
    if (v !== pct) onChange(v);
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <label className="flex items-center justify-between text-sm">
        <span className="text-slate-700">Desconto global no total</span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={str}
            onChange={(e) => setStr(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
          <span className="text-xs text-slate-500">%</span>
        </div>
      </label>
      <p className="mt-1 text-[10px] text-slate-500">
        Aplicado sobre (base + margem). 0 = sem desconto. Máximo 99,99%.
      </p>
    </div>
  );
}
