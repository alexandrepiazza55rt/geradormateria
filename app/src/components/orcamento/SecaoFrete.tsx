import type { Centavos } from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";

interface Props {
  value: Centavos;
  onChange: (v: Centavos) => void;
}

export function SecaoFrete({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded border border-slate-200 bg-white p-3">
        <label className="flex items-center justify-between text-sm">
          <span className="text-slate-700">Valor fixo por orçamento</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">R$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={centavos_para_reais(value)}
              onChange={(e) => onChange(reais_para_centavos(Number(e.target.value)))}
              className="w-32 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
            />
          </div>
        </label>
      </div>
      <p className="text-[11px] text-slate-500">
        ⓘ Não é % do material — material caro não significa frete caro. Para
        frete variável por obra, edite aqui antes de gerar o orçamento.
      </p>
    </div>
  );
}
