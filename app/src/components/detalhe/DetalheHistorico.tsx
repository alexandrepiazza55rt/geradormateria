import { useState } from "react";
import type { EntradaHistorico } from "../../lib/orcamento/types";
import {
  fmt_data_hora_curta,
} from "../../lib/orcamento/historicoFormatador";

interface Props {
  historico: EntradaHistorico[];
}

// Item de exibição: entrada solta OU um lote de "item_adicionado" com o mesmo
// carimbo de tempo (auditoria #6 — decomposição de estrutura adiciona N itens).
type ItemExibicao =
  | { tipo: "entrada"; entrada: EntradaHistorico }
  | { tipo: "lote"; quando: string; autor: string; entradas: EntradaHistorico[] };

function agrupar_lotes(ordenado: EntradaHistorico[]): ItemExibicao[] {
  const out: ItemExibicao[] = [];
  let i = 0;
  while (i < ordenado.length) {
    const e = ordenado[i];
    if (e.acao === "item_adicionado") {
      // Agrupa entradas adjacentes de item_adicionado com o mesmo `quando`.
      let j = i + 1;
      while (
        j < ordenado.length &&
        ordenado[j].acao === "item_adicionado" &&
        ordenado[j].quando === e.quando
      ) {
        j++;
      }
      if (j - i > 1) {
        out.push({
          tipo: "lote",
          quando: e.quando,
          autor: e.autor,
          entradas: ordenado.slice(i, j),
        });
        i = j;
        continue;
      }
    }
    out.push({ tipo: "entrada", entrada: e });
    i++;
  }
  return out;
}

export function DetalheHistorico({ historico }: Props) {
  // Ordem decrescente (mais recente no topo). Append-only.
  const ordenado = [...historico].sort(
    (a, b) => b.quando.localeCompare(a.quando),
  );
  const itens = agrupar_lotes(ordenado);
  const [abertos, set_abertos] = useState<Set<string>>(() => new Set());

  function toggle(chave: string) {
    set_abertos((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Histórico
          <span className="ml-1 text-xs font-normal text-slate-500">
            ({historico.length})
          </span>
        </h3>
      </div>

      {ordenado.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-slate-400">
          Nenhuma alteração registrada. Quando você editar este orçamento (Etapa 5),
          as mudanças aparecerão aqui.
        </div>
      ) : (
        <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
          {itens.map((it) => {
            if (it.tipo === "entrada") {
              const e = it.entrada;
              return (
                <li key={e.id} className="px-3 py-2 text-xs text-slate-700">
                  <div className="font-mono text-[10px] text-slate-400">
                    {fmt_data_hora_curta(e.quando)}
                  </div>
                  <div className="text-slate-800">
                    <span className="font-medium">{e.autor}</span> {e.descricao}
                  </div>
                </li>
              );
            }
            const chave = `lote_${it.quando}`;
            const aberto = abertos.has(chave);
            return (
              <li key={chave} className="px-3 py-2 text-xs text-slate-700">
                <div className="font-mono text-[10px] text-slate-400">
                  {fmt_data_hora_curta(it.quando)}
                </div>
                <button
                  onClick={() => toggle(chave)}
                  className="text-left text-slate-800 hover:underline"
                >
                  <span className="font-medium">{it.autor}</span> adicionou{" "}
                  <span className="font-semibold">{it.entradas.length} itens</span>{" "}
                  <span className="text-slate-400">{aberto ? "▾" : "▸"}</span>
                </button>
                {aberto && (
                  <ul className="mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                    {it.entradas.map((e) => (
                      <li key={e.id} className="text-[11px] text-slate-600">
                        {e.descricao}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
