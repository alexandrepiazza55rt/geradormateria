import type {
  ConfigOrcamento,
  DecomposicaoOrcamento,
} from "../../lib/orcamento/types";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

interface Props {
  decomposicao: DecomposicaoOrcamento;
  config: ConfigOrcamento;
  total_parcial: boolean;
  onEditarConfig?: () => void;
}

function Linha({
  label,
  valor,
  destacar,
}: {
  label: string;
  valor: string;
  destacar?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between border-b border-slate-100 py-1.5 ${
        destacar ? "font-semibold" : ""
      }`}
    >
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-sm tabular-nums text-slate-900">{valor}</span>
    </div>
  );
}

export function OrcamentoDecomposicao({
  decomposicao,
  config,
  total_parcial,
  onEditarConfig,
}: Props) {
  const d = decomposicao;
  const margem_label =
    config.margem.tipo === "markup"
      ? `Margem (markup ${config.margem.pct}%)`
      : `Margem (margem ${config.margem.pct}%)`;
  const mo_label =
    config.mao_obra.tipo === "pct_material"
      ? `Mão de obra (${config.mao_obra.pct ?? 0}% do material)`
      : "Mão de obra (por estrutura)";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Decomposição</h3>
        {onEditarConfig && (
          <button
            onClick={onEditarConfig}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            title="Editar configuração do orçamento (perda, MO, frete, margem, validades)"
          >
            ⚙ Editar configuração
          </button>
        )}
      </div>
      <Linha label="Subtotal material" valor={formatar_centavos_brl(d.subtotal_material_centavos)} />
      <Linha label="Perda" valor={formatar_centavos_brl(d.perda_centavos)} />
      <Linha label={mo_label} valor={formatar_centavos_brl(d.mao_obra_centavos)} />
      <Linha label="Frete" valor={formatar_centavos_brl(d.frete_centavos)} />
      <Linha label="Base para margem" valor={formatar_centavos_brl(d.base_para_margem_centavos)} destacar />
      <Linha label={margem_label} valor={formatar_centavos_brl(d.margem_centavos)} />
      <div
        className={`mt-2 flex items-baseline justify-between rounded px-2 py-2 ${
          total_parcial ? "bg-amber-50" : "bg-slate-50"
        }`}
      >
        <span
          className={`text-sm font-bold ${
            total_parcial ? "text-amber-800" : "text-slate-900"
          }`}
        >
          TOTAL{total_parcial ? " (parcial)" : ""}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${
            total_parcial ? "text-amber-800" : "text-slate-900"
          }`}
        >
          {formatar_centavos_brl(d.total_centavos)}
        </span>
      </div>
    </div>
  );
}
