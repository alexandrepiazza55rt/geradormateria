import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { Consolidation } from "../../lib/bom";
import { useOrcamentoAtual } from "./useOrcamentoAtual";
import type { Cliente, Orcamento, OrcamentoSalvo } from "../../lib/orcamento/types";
import { OrcamentoTabela } from "./OrcamentoTabela";
import { OrcamentoDecomposicao } from "./OrcamentoDecomposicao";
import { OrcamentoPendentes } from "./OrcamentoPendentes";
import { ConfigOrcamentoModal } from "./ConfigOrcamentoModal";
import { DadosDocumentoForm } from "./DadosDocumentoForm";
import { OrcamentoExportar } from "./OrcamentoExportar";
import {
  gerar_numero_orcamento,
  preparar_linhas_documento,
  type DadosDocumento,
} from "../../lib/orcamento/documentoHelpers";
import { exportar_pdf_orcamento } from "../../export/pdfOrcamento";
import { exportar_excel_orcamento } from "../../export/excelOrcamento";
import { SeletorProprietarioModal } from "../detalhe/SeletorProprietarioModal";

const SESSION_KEY_DADOS = "orcamento_dados_sessao";

function fmt_data_br(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function carregar_dados_iniciais(): DadosDocumento {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY_DADOS);
      if (raw) return JSON.parse(raw) as DadosDocumento;
    } catch {
      /* ignora */
    }
  }
  return {
    numero: gerar_numero_orcamento(new Date()),
    versao: 1,
    condicoes_pagamento: "",
    prazo_execucao: "",
    status: "rascunho",
  };
}

function gerar_uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function deep_clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// Aba "Orçamento" da Lista de Obra — agora SÓ modo "ao vivo".
// Snapshots salvos são vistos/editados na rota "detalhe" (Etapa 4+).
export function OrcamentoView({
  consolidation,
}: {
  consolidation: Consolidation;
}) {
  const orcamento = useOrcamentoAtual(consolidation);
  const setView = useStore((s) => s.setView);
  const itens = useStore((s) => s.itens);
  const obraInsumos = useStore((s) => s.obraInsumos);
  const meta = useStore((s) => s.meta);
  const materials = useStore((s) => s.materials);
  const orcamentosSalvos = useStore((s) => s.orcamentosSalvos);
  const salvarOrcamento = useStore((s) => s.salvarOrcamento);
  const clearObra = useStore((s) => s.clearObra);
  const clientes = useStore((s) => s.clientes);

  const clientes_ativos = useMemo(
    () => clientes.filter((c) => !c.excluido_em),
    [clientes],
  );

  const [modal_config_aberto, set_modal_config_aberto] = useState(false);
  const [salvando, set_salvando] = useState(false);
  // Correção 2: orçamento ao vivo nunca tem cliente_id; abre o seletor
  // toda vez que vai exportar para o usuário escolher
  const [pendente_export, set_pendente_export] = useState<"pdf" | "excel" | null>(null);
  const [dados_documento, set_dados_documento] = useState<DadosDocumento>(
    carregar_dados_iniciais,
  );

  function atualizar_dados_documento(d: DadosDocumento) {
    set_dados_documento(d);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(SESSION_KEY_DADOS, JSON.stringify(d));
      } catch {
        /* ignora */
      }
    }
  }

  const abrir_config = () => set_modal_config_aberto(true);

  function exportar_com(formato: "pdf" | "excel", cliente: Cliente | null) {
    const linhas = preparar_linhas_documento(
      orcamento,
      meta,
      dados_documento,
      materials,
      cliente,
    );
    if (formato === "pdf") exportar_pdf_orcamento(linhas);
    else exportar_excel_orcamento(linhas);
  }

  function handle_exportar(formato: "pdf" | "excel") {
    // Se o engenheiro já vinculou um cliente nos Dados da Obra, exporta
    // direto (sem modal de proprietário). Senão, abre o seletor.
    if (meta.cliente_id) {
      const cli = clientes_ativos.find((c) => c.id === meta.cliente_id) ?? null;
      exportar_com(formato, cli);
      return;
    }
    set_pendente_export(formato);
  }

  // Salvar = cria snapshot + LIMPA a lista de obra + redireciona para
  // o Detalhe. Só limpa se o save deu certo (Correção 6).
  // O state `salvando` é guard contra clique duplo.
  function handle_salvar() {
    if (salvando) return;
    set_salvando(true);
    try {
      // O `meta` do snapshot é só obra/endereço/município/responsável;
      // o cliente_id vive no nível do OrcamentoSalvo (já vinculado).
      const novo: OrcamentoSalvo = {
        id: gerar_uuid(),
        salvo_em: new Date().toISOString(),
        orcamento: deep_clone(orcamento),
        meta: {
          obra: meta.obra,
          endereco: meta.endereco,
          municipio: meta.municipio,
          responsavel: meta.responsavel,
        },
        dados_documento: { ...dados_documento },
        cliente_id: meta.cliente_id ?? null,
      };
      const ok = salvarOrcamento(novo);
      if (!ok) {
        window.alert(
          "Não foi possível salvar o orçamento (LocalStorage cheio ou bloqueado).\n" +
          "A lista de obra foi mantida intacta.",
        );
        return;
      }
      // Sinalizador lido pelo DetalheOrcamentoView para mostrar o toast verde
      try {
        sessionStorage.setItem("orcamento_recem_salvo", novo.id);
      } catch {
        /* sessionStorage indisponível — toast simplesmente não aparece */
      }
      clearObra();
      // Após limpar, o número do próximo orçamento já valerá; remove o
      // sessionStorage do dados_documento para começar limpo da próxima.
      try {
        sessionStorage.removeItem(SESSION_KEY_DADOS);
      } catch {
        /* ignora */
      }
      setView({ name: "detalhe", id: novo.id });
    } finally {
      set_salvando(false);
    }
  }

  function handle_abrir_consulta() {
    setView({ name: "consulta" });
  }

  const obra_vazia = itens.length === 0 && obraInsumos.length === 0;

  const ids_pendentes_sem_preco = useMemo(
    () =>
      orcamento.pendentes
        .filter((p) => p.motivo === "sem_preco")
        .map((p) => p.material_id),
    [orcamento.pendentes],
  );

  function abrirPrecosComPendentes() {
    setView({
      name: "precos",
      filtros_iniciais: {
        origem: "sem_preco",
        apenas_obra: ids_pendentes_sem_preco,
      },
    });
  }

  if (obra_vazia) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">
            Adicione estruturas em <span className="font-semibold">Início</span>{" "}
            para gerar o orçamento.
          </p>
          <button
            onClick={() => setView({ name: "home" })}
            className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Voltar para Início
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <button
            onClick={handle_abrir_consulta}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            📂 Meus orçamentos ({orcamentosSalvos.filter((o) => !o.excluido_em).length})
          </button>
        </div>
      </div>
    );
  }

  const sem_nenhum_preco =
    orcamento.itens.length === 0 && orcamento.pendentes.length > 0;

  if (sem_nenhum_preco) {
    return (
      <div className="space-y-4">
        <CabecalhoOrcamento orcamento={orcamento} />
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-8 text-center">
          <p className="text-sm text-amber-900">
            Nenhum dos {orcamento.pendentes.length} materiais desta obra
            tem preço cadastrado.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Cadastre os preços para ver o orçamento.
          </p>
          <button
            onClick={abrirPrecosComPendentes}
            className="mt-4 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Cadastrar preços ({orcamento.pendentes.length}) →
          </button>
        </div>
        <OrcamentoPendentes
          pendentes={orcamento.pendentes}
          onCadastrar={abrirPrecosComPendentes}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CabecalhoOrcamento orcamento={orcamento} />

      {orcamento.avisos_globais.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
          {orcamento.avisos_globais.map((a, i) => (
            <p key={i}>⚠ {a}</p>
          ))}
        </div>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Itens precificados ({orcamento.itens.length})
        </h3>
        <OrcamentoTabela itens={orcamento.itens} />
      </section>

      <OrcamentoDecomposicao
        decomposicao={orcamento.decomposicao}
        config={orcamento.config_snapshot}
        total_parcial={orcamento.total_parcial}
        onEditarConfig={abrir_config}
      />

      <OrcamentoPendentes
        pendentes={orcamento.pendentes}
        onCadastrar={abrirPrecosComPendentes}
      />

      <DadosDocumentoForm
        dados={dados_documento}
        onChange={atualizar_dados_documento}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handle_salvar}
              disabled={salvando}
              className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              title="Salva o orçamento e esvazia a lista de obra para começar uma nova"
            >
              {salvando ? "Salvando…" : "Salvar orçamento"}
            </button>
            <button
              onClick={handle_abrir_consulta}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              📂 Meus orçamentos ({orcamentosSalvos.filter((o) => !o.excluido_em).length})
            </button>
          </div>
          <OrcamentoExportar
            obra_vazia={obra_vazia}
            onExportar={handle_exportar}
          />
        </div>
      </div>

      {modal_config_aberto && (
        <ConfigOrcamentoModal onFechar={() => set_modal_config_aberto(false)} />
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

function CabecalhoOrcamento({
  orcamento,
}: {
  orcamento: Orcamento;
}) {
  const data_gerado = new Date(orcamento.gerado_em).toLocaleDateString("pt-BR");
  return (
    <div className="text-xs text-slate-500">
      Orçamento gerado em{" "}
      <span className="font-medium text-slate-700">{data_gerado}</span> · válido
      até{" "}
      <span className="font-medium text-slate-700">
        {fmt_data_br(orcamento.validade_orcamento)}
      </span>
    </div>
  );
}
