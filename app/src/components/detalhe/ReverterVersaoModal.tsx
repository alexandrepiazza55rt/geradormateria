import type { OrcamentoSalvo } from "../../lib/orcamento/types";
import { formatar_centavos_brl } from "../../lib/orcamento/dinheiro";

interface Props {
  atual: OrcamentoSalvo;
  versoes_anteriores: OrcamentoSalvo[];   // mesmo numero, versao < atual
  onConfirmar: (id_origem: string) => void;
  onFechar: () => void;
}

function fmt_data(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

export function ReverterVersaoModal({
  atual,
  versoes_anteriores,
  onConfirmar,
  onFechar,
}: Props) {
  // Ordem decrescente: a mais recente (mais próxima da atual) primeiro
  const ordenadas = [...versoes_anteriores].sort(
    (a, b) => b.dados_documento.versao - a.dados_documento.versao,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-3"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-800">
          ↺ Reverter para versão antiga
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Cria uma <strong>nova versão</strong> (v{atual.dados_documento.versao + 1}) com
          o conteúdo da versão escolhida. Versões antigas continuam intactas.
        </p>

        {ordenadas.length === 0 ? (
          <div className="mt-4 rounded border border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
            Este orçamento não tem versões anteriores para reverter.
          </div>
        ) : (
          <ul className="mt-3 max-h-[50vh] divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200">
            {ordenadas.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800">
                    v{v.dados_documento.versao}
                  </div>
                  <div className="text-slate-500">
                    Salvo em {fmt_data(v.salvo_em)} ·{" "}
                    <span className="tabular-nums">
                      {formatar_centavos_brl(v.orcamento.decomposicao.total_centavos)}
                    </span>
                    {" · "}
                    {v.orcamento.itens.length} item(ns)
                  </div>
                </div>
                <button
                  onClick={() => onConfirmar(v.id)}
                  className="rounded border border-sky-300 bg-white px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50"
                >
                  ↺ Reverter para v{v.dados_documento.versao}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onFechar}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
