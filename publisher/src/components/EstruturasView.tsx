import { useEffect, useMemo, useState } from "react";
import { lerArquivoTexto, type RepoConfig } from "../lib/github";
import type { Catalog, CatalogItem } from "../lib/types";

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function EstruturasView({ repo }: { repo: RepoConfig | null }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<CatalogItem | null>(null);
  const [json, setJson] = useState<string | null>(null);
  const [carregandoJson, setCarregandoJson] = useState(false);

  async function carregar(r: RepoConfig) {
    setCarregando(true);
    setErro(null);
    setSel(null);
    setJson(null);
    try {
      const txt = await lerArquivoTexto(r, "catalog.json");
      setCatalog(txt ? (JSON.parse(txt) as Catalog) : { schema_version: 1, data_version: "", structures: [] });
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

  async function abrir(item: CatalogItem) {
    if (!repo) return;
    setSel(item);
    setJson(null);
    setCarregandoJson(true);
    try {
      setJson((await lerArquivoTexto(repo, item.file)) ?? "(arquivo não encontrado)");
    } catch (e) {
      setJson(`erro: ${(e as Error).message}`);
    } finally {
      setCarregandoJson(false);
    }
  }

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const arr = catalog?.structures ?? [];
    if (!t) return arr;
    return arr.filter((s) => s.id.toLowerCase().includes(t) || (s.categoria ?? "").toLowerCase().includes(t));
  }, [catalog, busca]);

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
        <h2>Estruturas publicadas</h2>
        <p className="muted">
          Todas as estruturas que estão no sistema (novas e antigas). Clique numa para ver o JSON.
        </p>
        <div className="actions">
          <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>
            {carregando ? "Carregando…" : "Recarregar"}
          </button>
        </div>
        {erro && <div className="msg err">{erro}</div>}
        {catalog && (
          <>
            <label>Buscar (id ou categoria)</label>
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="ex.: S5, compacta…" />
            <p className="muted" style={{ marginTop: 8 }}>
              {filtradas.length} de {catalog.structures.length} estrutura(s)
            </p>
            <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid var(--border)", borderRadius: 4 }}>
              {filtradas.map((s) => (
                <button
                  key={s.id}
                  onClick={() => abrir(s)}
                  style={{
                    display: "flex", width: "100%", justifyContent: "space-between", gap: 8,
                    padding: "7px 10px", border: "none", borderBottom: "1px solid var(--border)",
                    background: sel?.id === s.id ? "#f0f9ff" : "#fff", cursor: "pointer", textAlign: "left", fontSize: 13,
                  }}
                >
                  <span>
                    <strong>{s.id}</strong>{" "}
                    <span className="muted">· {s.categoria}</span>
                    {s.status === "descontinuado" && <span className="badge alt" style={{ marginLeft: 6 }}>descontinuada</span>}
                  </span>
                  <span className="muted">rev {s.rev}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {sel && (
        <div className="card">
          <h2>{sel.id}.json</h2>
          <div className="actions">
            {json && <button className="btn secondary" onClick={() => baixar(`${sel.id}.json`, json)}>Baixar este JSON</button>}
          </div>
          {carregandoJson ? <p className="muted">Carregando…</p> : <div className="pre">{json}</div>}
        </div>
      )}
    </>
  );
}
