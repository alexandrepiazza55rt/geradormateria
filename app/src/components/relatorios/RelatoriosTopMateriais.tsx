import type { ItemRanking } from "../../lib/orcamento/relatorios";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";
import { fmtQty } from "../../lib/format";

interface Props {
  por_qty: ItemRanking[];
  por_valor: ItemRanking[];
}

export function RelatoriosTopMateriais({ por_qty, por_valor }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Tabela
        titulo="Top materiais por quantidade"
        itens={por_qty}
        valorPrincipal={(i) => `${fmtQty(i.total_qty)} ${i.unidade}`}
        valorSecundario={(i) => formatar_centavos_brl(i.total_centavos)}
      />
      <Tabela
        titulo="Top materiais por valor"
        itens={por_valor}
        valorPrincipal={(i) => formatar_centavos_brl(i.total_centavos)}
        valorSecundario={(i) => `${fmtQty(i.total_qty)} ${i.unidade}`}
      />
    </div>
  );
}

function Tabela({
  titulo,
  itens,
  valorPrincipal,
  valorSecundario,
}: {
  titulo: string;
  itens: ItemRanking[];
  valorPrincipal: (i: ItemRanking) => string;
  valorSecundario: (i: ItemRanking) => string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
        {titulo}
      </div>
      {itens.length === 0 ? (
        <div className="px-3 py-8 text-center text-xs text-slate-400">
          Sem dados no filtro.
        </div>
      ) : (
        <ol className="divide-y divide-slate-100">
          {itens.map((it, idx) => (
            <li key={it.material_id} className="flex items-baseline gap-3 px-3 py-2">
              <span className="w-5 shrink-0 text-right text-xs font-semibold text-slate-400 tabular-nums">
                {idx + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-800" title={it.descricao}>
                  {it.descricao}
                </div>
                <div className="text-[10px] text-slate-500">
                  em {it.qtd_orcamentos} {it.qtd_orcamentos === 1 ? "orçamento" : "orçamentos"}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular-nums text-slate-900">
                  {valorPrincipal(it)}
                </div>
                <div className="text-[10px] text-slate-500">{valorSecundario(it)}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
