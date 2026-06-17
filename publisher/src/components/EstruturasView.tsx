import { useEffect, useMemo, useState } from "react";
import { lerArquivoTexto, publicar, type RepoConfig } from "../lib/github";
import { carregarEstadoBase, type EstadoBase } from "../lib/repoBase";
import { validarFormato, validarContraBase } from "../lib/validar";
import { montarPublicacao } from "../lib/manifesto";
import type { Catalog, CatalogItem, Estrutura } from "../lib/types";

// Executa fn em paralelo com limite de concorrência (evita estourar rate limit).
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

function hojeVersao(atual: string | undefined): string {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  if (atual && atual.startsWith(d)) {
    const m = atual.match(/-r(\d+)$/);
    return `${d}-r${m ? Number(m[1]) + 1 : 2}`;
  }
  return `${d}-r1`;
}

export function EstruturasView({ repo }: { repo: RepoConfig | null }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [materiais, setMateriais] = useState<Map<number, { descricao: string; unidade: string }>>(new Map());
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [abertas, setAbertas] = useState<Record<string, Estrutura[] | "loading" | "erro" | undefined>>({});
  const [sel, setSel] = useState<Estrutura | null>(null);
  const [busca, setBusca] = useState("");

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
      const mat = new Map<number, { descricao: string; unidade: string }>();
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

  // categorias e contagem, a partir do catálogo (instantâneo)
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

  async function alternarCategoria(cat: string, items: CatalogItem[]) {
    if (abertas[cat]) {
      setAbertas((p) => ({ ...p, [cat]: undefined }));
      return;
    }
    if (!repo) return;
    setAbertas((p) => ({ ...p, [cat]: "loading" }));
    try {
      const ests = await mapLimit(items, 8, async (it) => {
        const txt = await lerArquivoTexto(repo, it.file);
        return JSON.parse(txt ?? "{}") as Estrutura;
      });
      setAbertas((p) => ({ ...p, [cat]: ests }));
    } catch {
      setAbertas((p) => ({ ...p, [cat]: "erro" }));
    }
  }

  if (!repo) {
    return (
      <div className="card">
        <div className="msg warn">Configure o repositório na aba <strong>Configuração</strong>.</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Estruturas do sistema</h2>
        <p className="muted">Organizadas por categoria e tipo, como no programa. Clique numa categoria para abrir, e numa estrutura para ver/editar.</p>
        <div className="actions">
          <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>
            {carregando ? "Carregando…" : "Recarregar"}
          </button>
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
          <button
            onClick={() => alternarCategoria(cat, items)}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
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
                        {e.id}
                        {e.status === "descontinuado" && <span className="badge alt" style={{ marginLeft: 6 }}>desc.</span>}
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
          repo={repo}
          estrutura={sel}
          materiais={materiais}
          revPublicado={catalog?.structures.find((s) => s.id === sel.id)?.rev ?? 1}
          onFechar={() => setSel(null)}
          onPublicado={() => { setSel(null); carregar(repo); }}
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
  repo, estrutura, materiais, revPublicado, onFechar, onPublicado,
}: {
  repo: RepoConfig;
  estrutura: Estrutura;
  materiais: Map<number, { descricao: string; unidade: string }>;
  revPublicado: number;
  onFechar: () => void;
  onPublicado: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(() => JSON.stringify(estrutura, null, 2));
  const [erros, setErros] = useState<string[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [msg, setMsg] = useState<{ tom: "ok" | "err"; texto: string } | null>(null);

  function nomeMat(id: string): string {
    const m = materiais.get(Number(id));
    return m?.descricao ? `${m.descricao} (${m.unidade})` : `material ${id}`;
  }

  async function publicarCorrecao() {
    setPublicando(true);
    setMsg(null);
    setErros([]);
    try {
      const est = JSON.parse(texto) as Estrutura;
      const fmt = validarFormato(est);
      if (!fmt.ok) { setErros(fmt.erros); setPublicando(false); return; }

      const estado: EstadoBase = await carregarEstadoBase(repo);
      // bump automático de rev (correção): garante que o cliente recebe a nova versão
      est.rev = Math.max((est.rev ?? 1), revPublicado + 1);
      const vb = validarContraBase(est, { idsMateriais: estado.idsMateriais, catalog: estado.catalog });
      if (!vb.ok) { setErros(vb.erros); setPublicando(false); return; }

      const versao = hojeVersao(estado.catalog?.data_version);
      const pub = await montarPublicacao([est], estado.manifest, estado.catalog, versao, `correção ${est.id} (rev ${est.rev})`);
      await publicar(repo, pub.arquivos, `Corrige ${est.id} → rev ${est.rev} (${versao})`, versao, `correção ${est.id}`);
      setMsg({ tom: "ok", texto: `Publicado como rev ${est.rev} (versão ${versao}). Os clientes recebem na próxima verificação.` });
      setTimeout(onPublicado, 1500);
    } catch (e) {
      setMsg({ tom: "err", texto: (e as Error).message });
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className="card" style={{ borderColor: "var(--accent)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{estrutura.id} · {estrutura.tipo}</h2>
        <button className="btn secondary" style={{ padding: "3px 10px" }} onClick={onFechar}>fechar</button>
      </div>
      <p className="muted">{estrutura.categoria} · {estrutura.tensao_kv} kV · {estrutura.fases}Ø · rev publicado {revPublicado}</p>

      {!editando ? (
        <>
          <h3 style={{ fontSize: 13, margin: "10px 0 4px" }}>Materiais (poste de referência: {estrutura.poste_ref})</h3>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(estrutura.base_bom ?? {}).map(([id, q]) => (
                <tr key={id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "4px 0" }}>{nomeMat(id)}</td>
                  <td style={{ textAlign: "right", padding: "4px 0", fontVariantNumeric: "tabular-nums" }}>{q}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 6 }}>{(estrutura.postes ?? []).length} variações de poste.</p>
          <div className="actions">
            <button className="btn" onClick={() => setEditando(true)}>Editar</button>
          </div>
        </>
      ) : (
        <>
          <p className="muted" style={{ marginTop: 8 }}>
            Edite o JSON abaixo. Ao publicar, o <code>rev</code> sobe automaticamente para <strong>{Math.max((estrutura.rev ?? 1), revPublicado + 1)}</strong> e a correção vai para os clientes.
          </p>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} style={{ minHeight: 280 }} />
          {erros.length > 0 && (
            <div className="msg err"><ul className="compact">{erros.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          )}
          <div className="actions">
            <button className="btn" onClick={publicarCorrecao} disabled={publicando}>
              {publicando ? "Publicando…" : "Publicar correção"}
            </button>
            <button className="btn secondary" onClick={() => { setEditando(false); setTexto(JSON.stringify(estrutura, null, 2)); setErros([]); }}>
              Cancelar edição
            </button>
          </div>
        </>
      )}
      {msg && <div className={`msg ${msg.tom}`}>{msg.texto}</div>}
    </div>
  );
}
