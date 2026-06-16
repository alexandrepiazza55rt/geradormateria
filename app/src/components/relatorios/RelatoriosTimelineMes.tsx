import type { MesValor } from "../../lib/orcamento/relatorios";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

const MES_LABEL_PT: Record<string, string> = {
  "01": "jan", "02": "fev", "03": "mar", "04": "abr",
  "05": "mai", "06": "jun", "07": "jul", "08": "ago",
  "09": "set", "10": "out", "11": "nov", "12": "dez",
};

function rotulo_mes(ano_mes: string): string {
  const [ano, mes] = ano_mes.split("-");
  return `${MES_LABEL_PT[mes] ?? mes}/${ano.slice(2)}`;
}

interface Props {
  meses: MesValor[];
}

export function RelatoriosTimelineMes({ meses }: Props) {
  const max = meses.reduce((m, x) => Math.max(m, x.total_centavos), 0);
  const tem_dados = max > 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Evolução mensal (últimos {meses.length})
      </h3>

      {!tem_dados ? (
        <div className="rounded bg-slate-50 px-3 py-8 text-center text-xs text-slate-400">
          Sem orçamentos no período.
        </div>
      ) : (
        <div className="flex items-end justify-around gap-1 overflow-x-auto pb-1">
          {meses.map((m) => {
            const altura = max > 0 ? (m.total_centavos / max) * 100 : 0;
            return (
              <div
                key={m.ano_mes}
                className="flex min-w-[28px] flex-col items-center"
                title={`${formatar_centavos_brl(m.total_centavos)} · ${m.qtd_orcamentos} orçamento(s)`}
              >
                <div className="relative flex h-32 w-7 items-end">
                  <div
                    className={`w-full rounded-t ${
                      m.total_centavos > 0 ? "bg-sky-500" : "bg-slate-100"
                    }`}
                    style={{ height: `${Math.max(altura, m.total_centavos > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  {rotulo_mes(m.ano_mes)}
                </div>
                <div className="text-[9px] text-slate-400 tabular-nums">
                  {m.qtd_orcamentos > 0 ? m.qtd_orcamentos : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
