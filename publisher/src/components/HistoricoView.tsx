import { useEffect, useState } from "react";
import { listarReleases, type ReleaseInfo, type RepoConfig } from "../lib/github";

export function HistoricoView({ repo }: { repo: RepoConfig | null }) {
  const [releases, setReleases] = useState<ReleaseInfo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregar(r: RepoConfig) {
    setCarregando(true);
    setErro(null);
    try {
      setReleases(await listarReleases(r));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (repo) carregar(repo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo?.owner, repo?.name]);

  if (!repo) {
    return (
      <div className="card">
        <div className="msg warn">Configure o repositório na aba <strong>Configuração</strong>.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Histórico de versões</h2>
      <div className="actions">
        <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>
          {carregando ? "Carregando…" : "Atualizar"}
        </button>
      </div>
      {erro && <div className="msg err">{erro}</div>}
      {releases && releases.length === 0 && <p className="muted">Nenhuma versão publicada ainda.</p>}
      {releases && releases.map((r) => (
        <div className="fileitem" key={r.tag_name}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="nome">{r.tag_name}</span>
            <span className="muted">{r.published_at?.slice(0, 10)}</span>
          </div>
          {r.body && <div className="muted" style={{ marginTop: 4 }}>{r.body}</div>}
          <a href={r.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>ver no GitHub</a>
        </div>
      ))}
    </div>
  );
}
