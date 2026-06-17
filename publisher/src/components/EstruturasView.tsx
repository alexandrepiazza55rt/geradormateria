import { useEffect, useMemo, useState } from "react";
import { lerArquivoTexto, type RepoConfig } from "../lib/github";
import type { Catalog, CatalogItem, Estrutura } from "../lib/types";
import { EstruturaForm } from "./EstruturaForm";
import { nomeMaterial, type MateriaisMap } from "./materialInputs";

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

type FormState = { inicial: Estrutura | null; rev: number | null } | null;

export function EstruturasView({ repo }: { repo: RepoConfig | null }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [materiais, setMateriais] = useState<MateriaisMap>(new Map());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [abertas, setAbertas] = useState<Record<string, Estrutura[] | "loading" | "erro" | undefined>>({});
  const [sel, setSel] = useState<Estrutura | null>(null);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<FormState>(null);

  async function carregar(r: RepoConfig) {
    setCarregando(true);
    setErro(null);
    setSel(null);
    setAbertas({});
    try {
      const [catTxt, matTxt] = await Promise.all([
        lerArquivoTexto(r, "catalog.json"),
        lerArquivoTexto(r, "materiais.json"),
      ]);
      setCatalog(catTxt ? (JSON.parse(catTxt) as Catalog) : { schema_version: 1, data_version: "", structures: [] });
      const mat: MateriaisMap = new Map();
      if (matTxt) for (const m of JSON.parse(matTxt) as { id: number; descricao?: string; unidade?: string }[]) {
        mat.set(m.id, { descricao: m.descricao ?? "", unidade: m.unidade ?? "" });
      }
      setMateriais(mat);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (repo) carregar(repo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo?.owner, repo?.name, repo?.branch]);

  const categorias = useMemo(() => {
    const m = new Map<string, CatalogItem[]>();
    for (const s of catalog?.structures ?? []) {
      const arr = m.get(s.categoria) ?? [];
      arr.push(s);
      m.set(s.categoria, arr);
    }
    let entries = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
    const t = busca.trim().toLowerCase();
    if (t) entries = entries.filter(([cat, items]) => cat.toLowerCase().includes(t) || items.some((s) => s.id.toLowerCase().includes(t)));
    return entries;
  }, [catalog, busca]);

  const categoriasExistentes = useMemo(
    () => [...new Set((catalog?.structures ?? []).map((s) => s.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [catalog],
  );

  async function alternarCategoria(cat: string, items: CatalogItem[]) {
    if (abertas[cat]) { setAbertas((p) => ({ ...p, [cat]: undefined })); return; }
    if (!repo) return;
    setAbertas((p) => ({ ...p, [cat]: "loading" }));
    try {
      const ests = await mapLimit(items, 8, async (it) => JSON.parse((await lerArquivoTexto(repo, it.file)) ?? "{}") as Estrutura);
      setAbertas((p) => ({ ...p, [cat]: ests }));
    } catch {
      setAbertas((p) => ({ ...p, [cat]: "erro" }));
    }
  }

  if (!repo) {
    return <div className="card"><div className="msg warn">Configure o repositório na aba <strong>Configuração</strong>.</div></div>;
  }

  if (form) {
    return (
      <EstruturaForm
        materiais={materiais}
        categoriasExistentes={categoriasExistentes}
        inicial={form.inicial}
        revPublicado={form.rev}
        repo={repo}
        onCancelar={() => setForm(null)}
        onPublicado={() => { setForm(null); carregar(repo); }}
      />
    );
  }

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Estruturas do sistema</h2>
          <button className="btn" onClick={() => { setSel(null); setForm({ inicial: null, rev: null }); }}>+ Nova estrutura</button>
        </div>
        <p className="muted">Organizadas por categoria e tipo, como no programa. Clique numa categoria para abrir, e numa estrutura para ver/editar.</p>
        <div className="actions">
          <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>{carregando ? "Carregando…" : "Recarregar"}</button>
        </div>
        {erro && <div className="msg err">{erro}</div>}
        {catalog && (
          <>
            <label>Buscar (categoria ou id)</label>
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="ex.: Monofásico, compacta, S5…" />
          </>
        )}
      </div>

      {categorias.map(([cat, items]) => (
        <div className="card" key={cat} style={{ padding: 0 }}>
          <button onClick={() => alternarCategoria(cat, items)}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{cat}</span>
            <span className="muted">{items.length} estruturas {abertas[cat] ? "▴" : "▾"}</span>
          </button>
          {abertas[cat] === "loading" && <p className="muted" style={{ padding: "0 16px 12px" }}>Carregando…</p>}
          {abertas[cat] === "erro" && <p className="msg err" style={{ margin: "0 16px 12px" }}>Falha ao carregar.</p>}
          {Array.isArray(abertas[cat]) && (
            <div style={{ padding: "0 16px 12px" }}>
              {agruparPorTipo(abertas[cat] as Estrutura[]).map(([tipo, ests]) => (
                <div key={tipo} style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>{tipo}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {ests.map((e) => (
                      <button key={e.id} onClick={() => setSel(e)}
                        style={{ border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", background: sel?.id === e.id ? "#f0f9ff" : "#fff", cursor: "pointer", fontSize: 13 }}>
                        {e.id}{e.status === "descontinuado" && <span className="badge alt" style={{ marginLeft: 6 }}>desc.</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {sel && (
        <DetalheEstrutura
          estrutura={sel}
          materiais={materiais}
          onEditar={() => setForm({ inicial: sel, rev: catalog?.structures.find((s) => s.id === sel.id)?.rev ?? 1 })}
          onFechar={() => setSel(null)}
        />
      )}
    </>
  );
}

function agruparPorTipo(ests: Estrutura[]): [string, Estrutura[]][] {
  const m = new Map<string, Estrutura[]>();
  for (const e of ests) {
    const key = (e.tipo_base as string) || e.tipo || "(sem tipo)";
    const arr = m.get(key) ?? [];
    arr.push(e);
    m.set(key, arr);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
}

function DetalheEstrutura({
  estrutura, materiais, onEditar, onFechar,
}: {
  estrutura: Estrutura;
  materiais: MateriaisMap;
  onEditar: () => void;
  onFechar: () => void;
}) {
  return (
    <div className="card" style={{ borderColor: "var(--accent)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{estrutura.id} · {estrutura.tipo}</h2>
        <button className="btn secondary" style={{ padding: "3px 10px" }} onClick={onFechar}>fechar</button>
      </div>
      <p className="muted">{estrutura.categoria} · {estrutura.tensao_kv} kV · {estrutura.fases}Ø · poste ref. {estrutura.poste_ref}</p>
      <h3 style={{ fontSize: 13, margin: "10px 0 4px" }}>Materiais (poste de referência)</h3>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          {Object.entries(estrutura.base_bom ?? {}).map(([id, q]) => (
            <tr key={id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "4px 0" }}>{nomeMaterial(materiais, id)} <span className="muted">· {id}</span></td>
              <td style={{ textAlign: "right", padding: "4px 0", fontVariantNumeric: "tabular-nums" }}>{q}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 6 }}>{(estrutura.postes ?? []).length} variações de poste.</p>
      <div className="actions"><button className="btn" onClick={onEditar}>Editar no formulário</button></div>
    </div>
  );
}
