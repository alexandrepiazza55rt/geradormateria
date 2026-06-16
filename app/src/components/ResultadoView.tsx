import { useMemo, useState, type ReactNode } from "react";
import { useStore } from "../store";
import type { Consolidation } from "../lib/bom";
import type { Cliente } from "../lib/orcamento/types";
import { MaterialTable } from "./MaterialTable";
import { fmtFases, fmtQty, cleanLabel } from "../lib/format";
import { exportExcel } from "../export/excel";
import { exportPdf } from "../export/pdf";
import { OrcamentoView } from "./orcamento/OrcamentoView";
import { ClienteForm } from "./clientes/ClienteForm";
import {
  formatar_cnpj_cpf,
  tipo_documento,
} from "../lib/orcamento/clientesHelpers";

export function ResultadoView({ consolidation }: { consolidation: Consolidation }) {
  const { rows, totalItens, totalEstruturas } = consolidation;
  const meta = useStore((s) => s.meta);
  const setMeta = useStore((s) => s.setMeta);
  const itens = useStore((s) => s.itens);
  const obraInsumos = useStore((s) => s.obraInsumos);
  const estruturas = useStore((s) => s.estruturas);
  const insumos = useStore((s) => s.insumos);
  const materials = useStore((s) => s.materials);
  const updateItemQty = useStore((s) => s.updateItemQty);
  const updateItemPoste = useStore((s) => s.updateItemPoste);
  const removeItem = useStore((s) => s.removeItem);
  const updateInsumoQty = useStore((s) => s.updateInsumoQty);
  const removeInsumo = useStore((s) => s.removeInsumo);
  const clearObra = useStore((s) => s.clearObra);
  const setView = useStore((s) => s.setView);
  const clientes = useStore((s) => s.clientes);
  const criarCliente = useStore((s) => s.criarCliente);

  const clientes_ativos = useMemo(
    () => clientes.filter((c) => !c.excluido_em),
    [clientes],
  );
  const cliente_atual = useMemo(
    () => clientes_ativos.find((c) => c.id === meta.cliente_id) ?? null,
    [clientes_ativos, meta.cliente_id],
  );

  const [tab, setTab] = useState<"consolidado" | "estrutura" | "orcamento">("consolidado");
  const [modal_novo_cliente, set_modal_novo_cliente] = useState(false);

  const empty = itens.length === 0 && obraInsumos.length === 0;

  // Ao escolher um cliente: auto-preenche endereço/município SÓ se estiverem
  // vazios (decisão do dono: sugere, não sobrescreve).
  function handle_trocar_cliente(novo_id: string | null) {
    const patch: Partial<typeof meta> = { cliente_id: novo_id };
    if (novo_id) {
      const c = clientes_ativos.find((x) => x.id === novo_id);
      const end = c?.enderecos[0];
      if (end) {
        if (!meta.endereco?.trim() && end.logradouro) {
          patch.endereco = [
            end.logradouro,
            end.numero ? `nº ${end.numero}` : "",
            end.bairro,
          ].filter(Boolean).join(", ");
        }
        if (!meta.municipio?.trim() && end.municipio) {
          patch.municipio = end.municipio + (end.uf ? `/${end.uf}` : "");
        }
      }
    }
    setMeta(patch);
  }

  function handle_salvar_novo_cliente(c: Cliente) {
    criarCliente(c);
    handle_trocar_cliente(c.id);
    set_modal_novo_cliente(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* left: obra items + meta */}
      <aside className="no-print space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Dados da obra</h2>

          {/* Seletor de Cliente (puxa do cadastro) */}
          <div className="mb-3 space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Cliente
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={meta.cliente_id ?? ""}
                onChange={(e) => handle_trocar_cliente(e.target.value || null)}
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                title="Vincula o orçamento a um cliente do cadastro"
              >
                <option value="">— Sem cliente vinculado —</option>
                {clientes_ativos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <button
                onClick={() => set_modal_novo_cliente(true)}
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
                title="Cadastrar um novo cliente sem sair desta tela"
              >
                + Novo
              </button>
            </div>
            {cliente_atual && (
              <div className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-900">
                <div className="font-semibold">{cliente_atual.nome}</div>
                {cliente_atual.cnpj_cpf && (
                  <div className="text-sky-700">
                    {tipo_documento(cliente_atual.cnpj_cpf)}{" "}
                    {formatar_cnpj_cpf(cliente_atual.cnpj_cpf)}
                  </div>
                )}
                {cliente_atual.contatos[0]?.telefone && (
                  <div className="text-sky-700">📞 {cliente_atual.contatos[0].telefone}</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {([
              ["obra", "Obra"],
              ["endereco", "Endereço"],
              ["municipio", "Município"],
              ["responsavel", "Responsável"],
            ] as const).map(([k, label]) => (
              <input
                key={k}
                value={meta[k] ?? ""}
                onChange={(e) => setMeta({ [k]: e.target.value })}
                placeholder={label}
                className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Itens da obra ({itens.length + obraInsumos.length})
            </h2>
            {!empty && (
              <button onClick={clearObra} className="text-xs text-red-600 hover:underline">
                Limpar tudo
              </button>
            )}
          </div>

          {empty && (
            <div className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
              Nenhuma estrutura.{" "}
              <button onClick={() => setView({ name: "home" })} className="text-sky-700 hover:underline">
                Adicionar
              </button>
            </div>
          )}

          <ul className="space-y-2">
            {itens.map((it) => {
              const est = estruturas.get(it.estruturaId);
              if (!est) return null;
              return (
                <li key={it.key} className="rounded-md border border-slate-200 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-slate-800">
                      {cleanLabel(est.tipo)}
                      {est.condutor && est.condutor !== "QUANT" ? ` · ${est.condutor}` : ""}
                    </div>
                    <button onClick={() => removeItem(it.key)} className="text-slate-400 hover:text-red-600">✕</button>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {fmtFases(est.fases)} · {est.tensao_kv.toString().replace(".", ",")} kV
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {est.postes.length > 1 && (
                      <select
                        value={it.posteIdx}
                        onChange={(e) => updateItemPoste(it.key, Number(e.target.value))}
                        className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs"
                      >
                        {est.postes.map((p, i) => (
                          <option key={i} value={i}>{p.poste || `Opção ${i + 1}`}</option>
                        ))}
                      </select>
                    )}
                    <input
                      type="number" min={1} step={1} value={it.quantidade}
                      onChange={(e) => updateItemQty(it.key, Math.max(0, Math.floor(Number(e.target.value))))}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                </li>
              );
            })}

            {obraInsumos.map((oi) => {
              const ins = insumos.get(oi.insumoId);
              if (!ins) return null;
              return (
                <li key={oi.key} className="rounded-md border border-slate-200 bg-amber-50/40 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-slate-800">{cleanLabel(ins.descricao)}</div>
                    <button onClick={() => removeInsumo(oi.key)} className="text-slate-400 hover:text-red-600">✕</button>
                  </div>
                  <input
                    type="number" min={0} step={1} value={oi.quantidade}
                    onChange={(e) => updateInsumoQty(oi.key, Math.max(0, Number(e.target.value)))}
                    className="mt-2 w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </aside>

      {/* right: result */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-4">
            <Stat label="Estruturas" value={fmtQty(totalEstruturas)} />
            <Stat label="Itens distintos" value={String(totalItens)} />
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={() => exportExcel(meta, rows, itens, obraInsumos, estruturas, insumos, materials)}
              disabled={empty}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-emerald-700"
            >
              Exportar Excel
            </button>
            <button
              onClick={() => exportPdf(meta, rows, totalEstruturas)}
              disabled={empty}
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-rose-700"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="no-print mb-3 flex gap-2">
          <Tab active={tab === "consolidado"} onClick={() => setTab("consolidado")}>Relação consolidada</Tab>
          <Tab active={tab === "estrutura"} onClick={() => setTab("estrutura")}>Por estrutura</Tab>
          <Tab active={tab === "orcamento"} onClick={() => setTab("orcamento")}>Orçamento</Tab>
        </div>

        {tab === "consolidado" ? (
          <MaterialTable rows={rows} />
        ) : tab === "estrutura" ? (
          <PerStructure consolidation={consolidation} />
        ) : (
          <OrcamentoView consolidation={consolidation} />
        )}
      </section>

      {modal_novo_cliente && (
        <ClienteForm
          onSalvar={handle_salvar_novo_cliente}
          onCancelar={() => set_modal_novo_cliente(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
      <div className="text-lg font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active ? "bg-sky-600 text-white" : "bg-white text-slate-600 border border-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function PerStructure({ consolidation }: { consolidation: Consolidation }) {
  const itens = useStore((s) => s.itens);
  const obraInsumos = useStore((s) => s.obraInsumos);
  const estruturas = useStore((s) => s.estruturas);
  const insumos = useStore((s) => s.insumos);

  const lines = [
    ...itens.map((it) => {
      const est = estruturas.get(it.estruturaId);
      const label = est
        ? `${cleanLabel(est.tipo)}${est.condutor && est.condutor !== "QUANT" ? " · " + est.condutor : ""} · ${est.postes[it.posteIdx]?.poste ?? ""} ×${it.quantidade}`
        : it.estruturaId;
      return { key: it.key, label };
    }),
    ...obraInsumos.map((oi) => {
      const ins = insumos.get(oi.insumoId);
      return { key: oi.key, label: `${ins ? cleanLabel(ins.descricao) : oi.insumoId} ×${oi.quantidade}` };
    }),
  ];

  if (lines.length === 0) return <div className="rounded-lg border border-slate-200 p-6 text-center text-slate-400">Sem itens.</div>;

  return (
    <div className="space-y-4">
      {lines.map((ln) => {
        const rows = consolidation.byItem.get(ln.key) ?? [];
        return (
          <div key={ln.key} className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">{ln.label}</div>
            <MaterialTable rows={rows} />
          </div>
        );
      })}
    </div>
  );
}
