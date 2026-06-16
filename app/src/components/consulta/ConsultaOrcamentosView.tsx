import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type {
  Cliente,
  OrcamentoSalvo,
  StatusOrcamento,
} from "../../lib/orcamento/types";
import {
  agrupar_por_numero,
  filtrar_orcamentos_consulta,
  ordenar_orcamentos,
  type FiltrosConsulta,
  type Ordenacao,
} from "../../lib/orcamento/consulta";
import { preparar_linhas_documento } from "../../lib/orcamento/documentoHelpers";
import { exportar_pdf_orcamento } from "../../export/pdfOrcamento";
import { exportar_excel_orcamento } from "../../export/excelOrcamento";
import { ConsultaFiltros } from "./ConsultaFiltros";
import { ConsultaLista } from "./ConsultaLista";
import { SeletorProprietarioModal } from "../detalhe/SeletorProprietarioModal";

const FILTROS_DEFAULT: FiltrosConsulta = {
  busca: "",
  cliente_ids: null,
  status: null,
  inicio: null,
  fim: null,
  valor_min_centavos: null,
  valor_max_centavos: null,
  incluir_excluidos: false,
  apenas_vencidos: false,
};

const ORDENACAO_DEFAULT: Ordenacao = { campo: "salvo_em", direcao: "desc" };

export function ConsultaOrcamentosView() {
  const orcamentos = useStore((s) => s.orcamentosSalvos);
  const clientes = useStore((s) => s.clientes);
  const materials = useStore((s) => s.materials);
  const setView = useStore((s) => s.setView);
  const excluir = useStore((s) => s.excluirOrcamentoSalvo);
  const restaurar = useStore((s) => s.restaurarOrcamentoSalvo);
  const mudarStatusOrcamentoSalvo = useStore((s) => s.mudarStatusOrcamentoSalvo);

  const [filtros, setFiltros] = useState<FiltrosConsulta>(FILTROS_DEFAULT);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>(ORDENACAO_DEFAULT);

  // Correção 2: seletor de proprietário quando exporta um orçamento
  // sem cliente vinculado.
  const [pendente_export, set_pendente_export] = useState<{
    orc: OrcamentoSalvo;
    formato: "pdf" | "excel";
  } | null>(null);

  const clientes_ativos = useMemo(
    () => clientes.filter((c) => !c.excluido_em),
    [clientes],
  );
  const clientesMap = useMemo(
    () => new Map<string, Cliente>(clientes.map((c) => [c.id, c])),
    [clientes],
  );

  const filtrados = useMemo(
    () => filtrar_orcamentos_consulta(orcamentos, filtros),
    [orcamentos, filtros],
  );
  const ordenados = useMemo(
    () => ordenar_orcamentos(filtrados, ordenacao),
    [filtrados, ordenacao],
  );
  const grupos = useMemo(() => agrupar_por_numero(ordenados), [ordenados]);

  const total_ativos = orcamentos.filter((o) => !o.excluido_em).length;
  const total_excluidos = orcamentos.length - total_ativos;

  function handle_abrir(id: string) {
    setView({ name: "detalhe", id });
  }

  function exportar_com_cliente(
    o: OrcamentoSalvo,
    formato: "pdf" | "excel",
    cliente: Cliente | null,
  ) {
    const linhas = preparar_linhas_documento(
      o.orcamento,
      o.meta,
      o.dados_documento,
      materials,
      cliente,
    );
    if (formato === "pdf") exportar_pdf_orcamento(linhas);
    else exportar_excel_orcamento(linhas);
  }

  function handle_exportar(o: OrcamentoSalvo, formato: "pdf" | "excel") {
    // Se tem cliente vinculado, usa direto (dados atuais do cadastro)
    if (o.cliente_id) {
      const cliente = clientes.find((c) => c.id === o.cliente_id) ?? null;
      exportar_com_cliente(o, formato, cliente);
      return;
    }
    // Sem cliente vinculado → abre seletor (mesmo se não houver clientes
    // cadastrados, o modal explica a situação)
    set_pendente_export({ orc: o, formato });
  }

  function handle_mudar_status(o: OrcamentoSalvo, novo: StatusOrcamento) {
    // Transições sensíveis: aprovar e recusar pedem confirmação
    if (novo === "aprovado" && o.dados_documento.status !== "aprovado") {
      const ok = window.confirm(
        `Marcar o orçamento ${o.dados_documento.numero} (v${o.dados_documento.versao}) como APROVADO?\n` +
        `Vai entrar nos relatórios como aprovado.`,
      );
      if (!ok) return;
    }
    if (novo === "recusado" && o.dados_documento.status !== "recusado") {
      const ok = window.confirm(
        `Marcar o orçamento ${o.dados_documento.numero} (v${o.dados_documento.versao}) como RECUSADO?`,
      );
      if (!ok) return;
    }
    const ok = mudarStatusOrcamentoSalvo(o.id, novo);
    if (!ok) {
      window.alert("Não foi possível salvar a mudança de status (LocalStorage bloqueado).");
    }
  }

  function handle_excluir(o: OrcamentoSalvo) {
    const ok = window.confirm(
      `Excluir orçamento ${o.dados_documento.numero} (v${o.dados_documento.versao})?\nPode ser restaurado depois.`,
    );
    if (!ok) return;
    excluir(o.id);
  }

  if (orcamentos.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">
          Nenhum orçamento salvo ainda. Crie e salve orçamentos em{" "}
          <span className="font-semibold">Lista de Obra → Orçamento</span>{" "}
          para vê-los aqui.
        </p>
        <button
          onClick={() => setView({ name: "home" })}
          className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Ir para Início
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendente_export && (
        <SeletorProprietarioModal
          clientes_ativos={clientes_ativos}
          formato_label={pendente_export.formato === "pdf" ? "PDF" : "Excel"}
          onCancelar={() => set_pendente_export(null)}
          onConfirmar={(cliente) => {
            exportar_com_cliente(pendente_export.orc, pendente_export.formato, cliente);
            set_pendente_export(null);
          }}
        />
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-900">Consulta de orçamentos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Todos os orçamentos salvos no seu navegador. Use os filtros para
          encontrar e clique <strong>Abrir</strong> para visualizar.
        </p>
      </div>

      <ConsultaFiltros
        filtros={filtros}
        onChange={setFiltros}
        clientes_ativos={clientes_ativos}
      />

      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{grupos.length}</span>{" "}
        orçamento(s) · {ordenados.length} de {total_ativos} versões ativas
        {total_excluidos > 0 && ` · ${total_excluidos} excluído(s)`}
      </div>

      <ConsultaLista
        grupos={grupos}
        clientesMap={clientesMap}
        ordenacao={ordenacao}
        onOrdenar={setOrdenacao}
        onAbrir={handle_abrir}
        onExportarPdf={(o) => handle_exportar(o, "pdf")}
        onExportarExcel={(o) => handle_exportar(o, "excel")}
        onExcluir={handle_excluir}
        onRestaurar={(o) => restaurar(o.id)}
        onMudarStatus={handle_mudar_status}
      />
    </div>
  );
}
