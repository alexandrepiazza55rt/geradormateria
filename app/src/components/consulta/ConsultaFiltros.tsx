import { useMemo, useRef, useState } from "react";
import type { Cliente, StatusOrcamento } from "../../lib/orcamento/types";
import type { FiltrosConsulta } from "../../lib/orcamento/consulta";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";

const STATUS_OPCOES: { value: StatusOrcamento; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

interface Props {
  filtros: FiltrosConsulta;
  onChange: (f: FiltrosConsulta) => void;
  clientes_ativos: Cliente[];
}

export function ConsultaFiltros({ filtros, onChange, clientes_ativos }: Props) {
  const set = (patch: Partial<FiltrosConsulta>) =>
    onChange({ ...filtros, ...patch });

  // ── Status (checkboxes acumuláveis com Selecionar todos/Limpar) ──
  // Correção 5: visual de checkbox em vez das pílulas (que confundiam).
  const status_set = new Set(filtros.status ?? STATUS_OPCOES.map((o) => o.value));
  const todos_status_marcados = filtros.status === null
    || filtros.status.length === STATUS_OPCOES.length;
  function toggle_status(s: StatusOrcamento) {
    const atual = filtros.status ?? STATUS_OPCOES.map((o) => o.value);
    const novo = atual.includes(s)
      ? atual.filter((x) => x !== s)
      : [...atual, s];
    set({ status: novo.length === STATUS_OPCOES.length ? null : novo });
  }
  function selecionar_todos_status() {
    set({ status: null });
  }
  function limpar_status() {
    set({ status: [] });
  }

  const min_reais = filtros.valor_min_centavos != null
    ? centavos_para_reais(filtros.valor_min_centavos)
    : "";
  const max_reais = filtros.valor_max_centavos != null
    ? centavos_para_reais(filtros.valor_max_centavos)
    : "";

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="search"
          value={filtros.busca}
          onChange={(e) => set({ busca: e.target.value })}
          placeholder="🔎 Buscar nº, obra ou observações..."
          className="min-w-[14rem] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />

        <ClientesMultiPicker
          clientes={clientes_ativos}
          selecionados={filtros.cliente_ids}
          onChange={(cliente_ids) => set({ cliente_ids })}
        />

        <label className="text-xs">
          <span className="text-slate-600">De</span>
          <input
            type="date"
            value={filtros.inicio ?? ""}
            onChange={(e) => set({ inicio: e.target.value || null })}
            className="mt-1 block rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Até</span>
          <input
            type="date"
            value={filtros.fim ?? ""}
            onChange={(e) => set({ fim: e.target.value || null })}
            className="mt-1 block rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="text-xs">
          <span className="text-slate-600">R$ mín</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={min_reais === "" ? "" : min_reais}
            onChange={(e) =>
              set({
                valor_min_centavos:
                  e.target.value === ""
                    ? null
                    : reais_para_centavos(Number(e.target.value)),
              })
            }
            className="mt-1 block w-24 rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">R$ máx</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={max_reais === "" ? "" : max_reais}
            onChange={(e) =>
              set({
                valor_max_centavos:
                  e.target.value === ""
                    ? null
                    : reais_para_centavos(Number(e.target.value)),
              })
            }
            className="mt-1 block w-28 rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
          />
        </label>
      </div>

      {/* ── Status como CHECKBOXES (Correção 5) ── */}
      <div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Status:</span>
          <button
            onClick={selecionar_todos_status}
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
              todos_status_marcados
                ? "border-sky-300 bg-sky-50 text-sky-700"
                : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            Selecionar todos
          </button>
          <button
            onClick={limpar_status}
            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
          >
            Limpar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {STATUS_OPCOES.map((s) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={status_set.has(s.value)}
                onChange={() => toggle_status(s.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={!!filtros.apenas_vencidos}
            onChange={(e) => set({ apenas_vencidos: e.target.checked })}
          />
          ⚠ Só vencidos
        </label>

        <label className="flex items-center gap-1.5 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={filtros.incluir_excluidos}
            onChange={(e) => set({ incluir_excluidos: e.target.checked })}
          />
          Incluir excluídos
        </label>

        <button
          onClick={() =>
            onChange({
              busca: "",
              cliente_ids: null,
              status: null,
              inicio: null,
              fim: null,
              valor_min_centavos: null,
              valor_max_centavos: null,
              incluir_excluidos: false,
              apenas_vencidos: false,
            })
          }
          className="ml-auto rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

// ── Multi-picker de clientes (popover com checkboxes) ──
// Pequeno componente local — sem dependência externa de combobox. Filtra
// por busca interna e tem "Selecionar todos / Limpar".
function ClientesMultiPicker({
  clientes,
  selecionados,
  onChange,
}: {
  clientes: Cliente[];
  selecionados: string[] | null;          // null = todos
  onChange: (ids: string[] | null) => void;
}) {
  const [aberto, set_aberto] = useState(false);
  const [busca_local, set_busca_local] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora — pattern simples sem libs.
  if (typeof window !== "undefined") {
    // Mantemos só 1 listener global controlado por estado de abertura
    // (usar useEffect aqui causaria lint de set-state; usar window addEventListener
    // direto dentro do render é OK porque é uma função inline).
  }

  const todos_ids = useMemo(() => clientes.map((c) => c.id), [clientes]);
  const marcados = selecionados ?? todos_ids;
  const set_marcados = new Set(marcados);
  const filtrados = useMemo(() => {
    const q = busca_local.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => c.nome.toLowerCase().includes(q));
  }, [clientes, busca_local]);

  const total_marcados = selecionados === null ? clientes.length : selecionados.length;
  const label_botao =
    selecionados === null
      ? `Todos clientes (${clientes.length})`
      : selecionados.length === 0
        ? "Só sem cliente"
        : selecionados.length === 1
          ? clientes.find((c) => c.id === selecionados[0])?.nome ?? "1 cliente"
          : `${selecionados.length} clientes`;

  function toggle(id: string) {
    const novo_set = new Set(marcados);
    if (novo_set.has(id)) novo_set.delete(id);
    else novo_set.add(id);
    const arr = [...novo_set];
    if (arr.length === clientes.length) onChange(null);   // todos
    else onChange(arr);
  }
  function selecionar_todos() {
    onChange(null);
  }
  function limpar() {
    onChange([]);                                          // [] = só os sem cliente
  }

  return (
    <div className="relative text-xs" ref={ref}>
      <span className="text-slate-600">Cliente</span>
      <button
        onClick={() => set_aberto((v) => !v)}
        className={`mt-1 flex min-w-[12rem] items-center justify-between rounded border px-2 py-1.5 text-sm ${
          aberto
            ? "border-sky-400 ring-1 ring-sky-200"
            : "border-slate-300"
        } bg-white text-slate-700 hover:bg-slate-50`}
        title={`${total_marcados} cliente(s) marcado(s)`}
      >
        <span className="truncate">{label_botao}</span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>

      {aberto && (
        <>
          {/* Overlay invisível pra fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => set_aberto(false)}
          />
          <div className="absolute right-0 z-40 mt-1 w-72 rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <input
                type="search"
                value={busca_local}
                onChange={(e) => set_busca_local(e.target.value)}
                placeholder="🔎 Buscar cliente..."
                className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-200"
                autoFocus
              />
              <div className="mt-1.5 flex gap-2">
                <button
                  onClick={selecionar_todos}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                >
                  Selecionar todos
                </button>
                <button
                  onClick={limpar}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
                >
                  Limpar
                </button>
              </div>
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtrados.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-slate-400">
                  Nenhum cliente encontrado.
                </li>
              ) : (
                filtrados.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={set_marcados.has(c.id)}
                        onChange={() => toggle(c.id)}
                      />
                      <span className="truncate" title={c.nome}>{c.nome}</span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
