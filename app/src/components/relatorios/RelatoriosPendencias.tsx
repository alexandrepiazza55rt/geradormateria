import type { MaterialPendente } from "../../lib/orcamento/relatorios";
import { useStore } from "../../store";

interface Props {
  pendencias: MaterialPendente[];
}

export function RelatoriosPendencias({ pendencias }: Props) {
  const setView = useStore((s) => s.setView);
  const ids = pendencias.map((p) => p.material_id);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-amber-900">
        Materiais que mais aparecem como pendência
      </h3>
      <p className="mb-2 text-[11px] text-amber-800">
        Cadastrar preço destes materiais reduz orçamentos parciais nas próximas
        obras.
      </p>

      {pendencias.length === 0 ? (
        <div className="rounded border border-amber-200 bg-white px-3 py-4 text-center text-xs text-amber-700">
          Nenhuma pendência por preço faltando nos orçamentos do filtro.
        </div>
      ) : (
        <ol className="divide-y divide-amber-100 rounded border border-amber-200 bg-white">
          {pendencias.map((p, idx) => (
            <li
              key={p.material_id}
              className="flex items-baseline gap-3 px-3 py-2"
            >
              <span className="w-5 shrink-0 text-right text-xs font-semibold text-amber-500 tabular-nums">
                {idx + 1}.
              </span>
              <div className="min-w-0 flex-1 truncate text-sm text-slate-800" title={p.descricao}>
                {p.descricao}
              </div>
              <div className="shrink-0 text-xs text-amber-700">
                em {p.qtd_aparicoes}{" "}
                {p.qtd_aparicoes === 1 ? "orçamento" : "orçamentos"}
              </div>
            </li>
          ))}
        </ol>
      )}

      {pendencias.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() =>
              setView({
                name: "precos",
                filtros_iniciais: {
                  origem: "sem_preco",
                  apenas_obra: ids,
                  mostrar_todos_catalogo: true,
                },
              })
            }
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Cadastrar preços ({pendencias.length}) →
          </button>
        </div>
      )}
    </div>
  );
}
