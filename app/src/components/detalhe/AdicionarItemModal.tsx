import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { Estrutura, Material } from "../../../src/types";
import type { ItemOrcamentoSnapshot, ItemPendente, PrecoMaterial } from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";
import {
  criar_item_do_catalogo,
  criar_item_manual,
} from "../../lib/orcamento/edicao";
import { resolver_preco } from "../../lib/orcamento/precos";
import { unitBom } from "../../lib/bom";
import { cleanLabel } from "../../lib/format";
import { SECTIONS } from "../../lib/secoes";
import { EstruturaCard } from "../EstruturaCard";

type Aba = "estrutura" | "catalogo" | "manual";

interface Props {
  onAdicionar: (item: ItemOrcamentoSnapshot, pendente?: ItemPendente) => void;
  /** Adiciona vários itens de uma vez (decomposição de uma estrutura). */
  onAdicionarVarios?: (itens: ItemOrcamentoSnapshot[]) => void;
  onFechar: () => void;
}

function titulo_categoria(cat: string): string {
  return cat.replace(" — Rural (NDU 005)", "").replace(" (NDU 005)", "");
}

function parse_decimal(s: string): number | null {
  const limpo = s.trim().replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : null;
}

export function AdicionarItemModal({ onAdicionar, onAdicionarVarios, onFechar }: Props) {
  const materials = useStore((s) => s.materials);
  const precosOficiais = useStore((s) => s.precosOficiais);
  const precosOverrides = useStore((s) => s.precosOverrides);
  const estruturas = useStore((s) => s.estruturas);
  const categorias = useStore((s) => s.categorias);
  const byCat = useStore((s) => s.estruturasByCategoria);

  const [aba, setAba] = useState<Aba>("estrutura");

  // ─── Aba "Por estrutura" (navegação igual à aba Início) ───
  const [est_categoria, set_est_categoria] = useState<string | null>(null);
  const [busca_est, set_busca_est] = useState("");

  const grupos_estrutura = useMemo(() => {
    if (!est_categoria) return [] as [string, Estrutura[]][];
    const ests = byCat.get(est_categoria) ?? [];
    const map = new Map<string, Estrutura[]>();
    for (const e of ests) {
      const key = cleanLabel(e.tipo_base || e.tipo);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    let entries = [...map.entries()];
    const term = busca_est.trim().toLowerCase();
    if (term) entries = entries.filter(([t]) => t.toLowerCase().includes(term));
    return entries;
  }, [byCat, est_categoria, busca_est]);

  function adicionar_estrutura(
    estruturaId: string,
    posteIdx: number,
    qtd: number,
  ) {
    const est = estruturas.get(estruturaId);
    if (!est || !Number.isFinite(qtd) || qtd <= 0) return;
    const bom = unitBom(est, posteIdx);
    const itens_ok: ItemOrcamentoSnapshot[] = [];
    const sem_preco: string[] = [];
    for (const [mid, q_por_unidade] of Object.entries(bom)) {
      const qty = q_por_unidade * qtd;
      if (Math.abs(qty) < 1e-9) continue;
      const m = materials.get(Number(mid));
      if (!m) continue;
      const p = preco_do(m);
      const r = criar_item_do_catalogo({
        material: m,
        qty,
        preco: p
          ? {
              valor_centavos: p.valor_centavos,
              unidade_preco: p.unidade_preco,
              fator_conversao: p.fator_conversao,
              origem: p.origem,
            }
          : undefined,
      });
      if (r.tipo === "ok") itens_ok.push(r.item);
      else sem_preco.push(m.descricao);
    }

    if (itens_ok.length > 0) {
      onAdicionarVarios?.(itens_ok);
    }
    if (sem_preco.length > 0) {
      const lista = sem_preco.slice(0, 12).join("\n");
      const resto =
        sem_preco.length > 12 ? `\n… e mais ${sem_preco.length - 12}.` : "";
      window.alert(
        `${itens_ok.length} material(is) adicionado(s).\n\n` +
          `${sem_preco.length} sem preço cadastrado foram ignorados ` +
          `(cadastre em Preços):\n${lista}${resto}`,
      );
    }
  }

  // ─── Aba catálogo ───
  const [busca, setBusca] = useState("");
  const [material_sel, set_material_sel] = useState<Material | null>(null);
  const [qty_cat_str, set_qty_cat_str] = useState("1");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return [] as Material[];
    const list: Material[] = [];
    for (const m of materials.values()) {
      if (!m.descricao?.trim()) continue;
      if (m.descricao.toLowerCase().includes(termo) || m.cod_sap?.toLowerCase().includes(termo)) {
        list.push(m);
        if (list.length >= 30) break;
      }
    }
    return list;
  }, [materials, busca]);

  function preco_do(m: Material): PrecoMaterial | null {
    const r = resolver_preco(m.id, precosOficiais, precosOverrides);
    return r.preco;
  }

  function adicionar_do_catalogo() {
    if (!material_sel) return;
    const qty = parse_decimal(qty_cat_str);
    if (qty == null || qty <= 0) return;
    const p = preco_do(material_sel);
    const r = criar_item_do_catalogo({
      material: material_sel,
      qty,
      preco: p
        ? {
            valor_centavos: p.valor_centavos,
            unidade_preco: p.unidade_preco,
            fator_conversao: p.fator_conversao,
            origem: p.origem,
          }
        : undefined,
    });
    if (r.tipo === "ok") onAdicionar(r.item);
    else {
      // Item pendente. Por enquanto, adiciono mesmo assim com preço 0 e marcamos manual?
      // Decisão: avisar o usuário e bloquear (orçamento parcial é OK no motor, mas aqui o usuário
      // está adicionando explicitamente — vamos pedir um preço manual).
      window.alert(
        `Sem preço cadastrado para "${material_sel.descricao}". Cadastre o preço em Preços ou use a aba "Item manual".`,
      );
    }
  }

  // ─── Aba manual ───
  const [desc_str, set_desc_str] = useState("");
  const [unidade_str, set_unidade_str] = useState("un");
  const [qty_man_str, set_qty_man_str] = useState("1");
  const [preco_man_str, set_preco_man_str] = useState("0,00");

  const valido_manual =
    desc_str.trim().length > 0 &&
    parse_decimal(qty_man_str) != null && (parse_decimal(qty_man_str) ?? 0) > 0 &&
    parse_decimal(preco_man_str) != null && (parse_decimal(preco_man_str) ?? -1) >= 0;

  function adicionar_manual() {
    const qty = parse_decimal(qty_man_str)!;
    const preco_reais = parse_decimal(preco_man_str)!;
    const item = criar_item_manual({
      descricao: desc_str.trim(),
      unidade: unidade_str.trim() || "un",
      qty,
      preco_centavos: reais_para_centavos(preco_reais),
    });
    onAdicionar(item);
    // Limpa para próxima adição
    set_desc_str("");
    set_qty_man_str("1");
    set_preco_man_str("0,00");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">Adicionar item</h2>
          <button
            onClick={onFechar}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <button
            onClick={() => setAba("estrutura")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              aba === "estrutura" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            📐 Por estrutura
          </button>
          <button
            onClick={() => setAba("catalogo")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              aba === "catalogo" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            📦 Do catálogo
          </button>
          <button
            onClick={() => setAba("manual")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              aba === "manual" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            ✍ Item manual
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {aba === "estrutura" && (
            <div className="space-y-4">
              {!est_categoria ? (
                <>
                  <p className="text-[11px] text-slate-500">
                    Escolha a seção e a categoria, depois a estrutura. Ela é
                    decomposta nos materiais (com preço cadastrado) e adicionada
                    ao orçamento.
                  </p>
                  {SECTIONS.map((sec) => {
                    const cats = categorias.filter(sec.test);
                    if (cats.length === 0) return null;
                    return (
                      <section key={sec.titulo}>
                        <div className="mb-2 flex items-baseline gap-2 border-b border-slate-200 pb-1">
                          <h3 className="text-sm font-bold text-slate-800">{sec.titulo}</h3>
                          <span className="text-[10px] text-slate-400">{sec.subtitulo}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {cats.map((cat) => {
                            const n = byCat.get(cat)?.length ?? 0;
                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  set_est_categoria(cat);
                                  set_busca_est("");
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md"
                              >
                                <div className="text-sm font-semibold text-slate-900">
                                  {titulo_categoria(cat)}
                                </div>
                                <div className="mt-0.5 text-xs text-slate-500">
                                  {n} estruturas →
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                  {categorias.length === 0 && (
                    <p className="text-sm text-slate-500">Nenhuma categoria encontrada.</p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => set_est_categoria(null)}
                      className="text-sm font-medium text-sky-700 hover:underline"
                    >
                      ← Categorias
                    </button>
                    <input
                      value={busca_est}
                      onChange={(e) => set_busca_est(e.target.value)}
                      placeholder="Buscar estrutura (ex.: N3, U1)…"
                      className="w-56 max-w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {est_categoria}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {grupos_estrutura.map(([tipo, ests]) => (
                      <EstruturaCard
                        key={tipo}
                        tipo={tipo}
                        estruturas={ests}
                        onAdd={adicionar_estrutura}
                      />
                    ))}
                  </div>
                  {grupos_estrutura.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Nenhuma estrutura encontrada{busca_est ? ` para “${busca_est}”` : ""}.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {aba === "catalogo" && (
            <div className="space-y-3">
              <input
                type="search"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  set_material_sel(null);
                }}
                placeholder="🔎 Buscar material (descrição ou SAP)..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                autoFocus
              />
              {busca.trim() ? (
                <div className="max-h-72 overflow-y-auto rounded border border-slate-200">
                  {filtrados.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      Nenhum material encontrado.
                    </div>
                  ) : (
                    filtrados.map((m) => {
                      const p = preco_do(m);
                      const selecionado = material_sel?.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => set_material_sel(m)}
                          className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-left last:border-0 ${
                            selecionado ? "bg-sky-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-slate-800">{m.descricao}</div>
                            <div className="text-[10px] text-slate-400">
                              {m.cod_sap ? `SAP ${m.cod_sap}` : "sem SAP"} · {m.unidade}
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            {p ? (
                              <div className="font-medium text-slate-700">
                                R$ {centavos_para_reais(p.valor_centavos).toFixed(2).replace(".", ",")}
                                <span className="text-slate-400">/{p.unidade_preco}</span>
                              </div>
                            ) : (
                              <div className="text-amber-600">sem preço</div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                  Digite para buscar...
                </div>
              )}

              {material_sel && (
                <div className="rounded border border-sky-200 bg-sky-50/50 p-3">
                  <div className="mb-2 text-xs text-slate-600">
                    Selecionado: <span className="font-semibold text-slate-800">{material_sel.descricao}</span>
                  </div>
                  <label className="block text-xs">
                    <span className="text-slate-600">Quantidade ({material_sel.unidade})</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={qty_cat_str}
                      onChange={(e) => set_qty_cat_str(e.target.value)}
                      className="mt-1 w-32 rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
                    />
                  </label>
                  <button
                    onClick={adicionar_do_catalogo}
                    className="mt-3 rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>
          )}

          {aba === "manual" && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500">
                Use item manual para serviços, taxas e materiais fora do catálogo.
              </p>
              <label className="block text-xs">
                <span className="text-slate-600">Descrição *</span>
                <input
                  type="text"
                  value={desc_str}
                  onChange={(e) => set_desc_str(e.target.value)}
                  placeholder='ex.: "Taxa de instalação"'
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs">
                  <span className="text-slate-600">Unidade</span>
                  <input
                    type="text"
                    value={unidade_str}
                    onChange={(e) => set_unidade_str(e.target.value)}
                    placeholder="un, h, kg..."
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-slate-600">Quantidade *</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={qty_man_str}
                    onChange={(e) => set_qty_man_str(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
                  />
                </label>
                <label className="text-xs">
                  <span className="text-slate-600">Preço un. (R$) *</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={preco_man_str}
                    onChange={(e) => set_preco_man_str(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
                  />
                </label>
              </div>
              <button
                onClick={adicionar_manual}
                disabled={!valido_manual}
                className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 px-5 py-3">
          <button
            onClick={onFechar}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
