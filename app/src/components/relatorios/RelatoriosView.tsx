import { useMemo, useState } from "react";
import { useStore } from "../../store";
import {
  calcular_kpis,
  filtrar_orcamentos,
  pendencias_mais_frequentes,
  top_materiais_por_qty,
  top_materiais_por_valor,
  valor_por_mes,
  type FiltroRelatorio,
} from "../../lib/orcamento/relatorios";
import { RelatoriosFiltros } from "./RelatoriosFiltros";
import { RelatoriosKPI } from "./RelatoriosKPI";
import { RelatoriosTopMateriais } from "./RelatoriosTopMateriais";
import { RelatoriosTimelineMes } from "./RelatoriosTimelineMes";
import { RelatoriosPendencias } from "./RelatoriosPendencias";

function ultimo_ano_iso(hoje: Date): { inicio: string; fim: string } {
  const fim = hoje.toISOString().slice(0, 10);
  const d_inicio = new Date(hoje);
  d_inicio.setMonth(d_inicio.getMonth() - 11);
  d_inicio.setDate(1);
  const inicio = d_inicio.toISOString().slice(0, 10);
  return { inicio, fim };
}

const TOP_N = 10;
const ULTIMOS_MESES = 12;

export function RelatoriosView() {
  const orcamentos = useStore((s) => s.orcamentosSalvos);
  const setView = useStore((s) => s.setView);
  const hoje = useMemo(() => new Date(), []);

  const [filtro, setFiltro] = useState<FiltroRelatorio>(() => {
    const { inicio, fim } = ultimo_ano_iso(hoje);
    return { inicio, fim, status: null };
  });

  const periodo_invalido =
    !!filtro.inicio && !!filtro.fim && filtro.inicio > filtro.fim;

  const filtrados = useMemo(
    () => (periodo_invalido ? [] : filtrar_orcamentos(orcamentos, filtro)),
    [orcamentos, filtro, periodo_invalido],
  );

  const kpis = useMemo(() => calcular_kpis(filtrados), [filtrados]);
  const top_qty = useMemo(() => top_materiais_por_qty(filtrados, TOP_N), [filtrados]);
  const top_valor = useMemo(() => top_materiais_por_valor(filtrados, TOP_N), [filtrados]);
  const meses = useMemo(
    () => valor_por_mes(filtrados, ULTIMOS_MESES, hoje),
    [filtrados, hoje],
  );
  // Preços efetivos atuais (oficiais + overrides) para tirar do ranking
  // pendências que já têm preço cadastrado hoje — basta reprocessar os
  // orçamentos para somar no total.
  const precosOficiais = useStore((s) => s.precosOficiais);
  const precosOverrides = useStore((s) => s.precosOverrides);
  const materials = useStore((s) => s.materials);
  const precos_efetivos = useMemo(() => {
    const m = new Map(precosOficiais);
    for (const [k, v] of precosOverrides) m.set(k, v);
    return m;
  }, [precosOficiais, precosOverrides]);

  const pendencias = useMemo(
    () => pendencias_mais_frequentes(filtrados, TOP_N, precos_efetivos, materials),
    [filtrados, precos_efetivos, materials],
  );

  if (orcamentos.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">
          Nenhum orçamento salvo ainda. Crie e salve orçamentos em{" "}
          <span className="font-semibold">Lista de Obra → Orçamento</span>{" "}
          para ver métricas aqui.
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
      <div>
        <h1 className="text-xl font-bold text-slate-900">Relatórios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Visão consolidada dos orçamentos salvos no seu navegador.
        </p>
      </div>

      <RelatoriosFiltros filtro={filtro} onChange={setFiltro} />

      {periodo_invalido ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Corrija o período para visualizar as métricas.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nenhum orçamento no período/filtros selecionados.
        </div>
      ) : (
        <>
          <RelatoriosKPI kpis={kpis} />
          <RelatoriosTimelineMes meses={meses} />
          <RelatoriosTopMateriais por_qty={top_qty} por_valor={top_valor} />
          <RelatoriosPendencias pendencias={pendencias} />
        </>
      )}
    </div>
  );
}
