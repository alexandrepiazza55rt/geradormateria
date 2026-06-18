import { useEffect, useState } from "react";
import {
  listarReleases,
  excluirRelease,
  definirRascunhoRelease,
  type ReleaseInfo,
  type RepoConfig,
} from "../lib/github";

export function HistoricoView({ repo }: { repo: RepoConfig | null }) {
  const [releases, setReleases] = useState<ReleaseInfo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [ocupado, setOcupado] = useState<number | null>(null);

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

  async function alternarRascunho(r: ReleaseInfo) {
    if (!repo) return;
    setOcupado(r.id);
    setErro(null);
    try {
      await definirRascunhoRelease(repo, r.id, !r.draft);
      await carregar(repo);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  async function excluir(r: ReleaseInfo) {
    if (!repo) return;
    if (!confirm(
      `Excluir a atualização ${r.tag_name} de vez? Some do histórico.\n\n` +
        "Obs.: isso NÃO desfaz o conteúdo já publicado — os clientes continuam com a base atual.",
    )) return;
    setOcupado(r.id);
    setErro(null);
    try {
      await excluirRelease(repo, r.id, r.tag_name);
      await carregar(repo);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
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
    <div className="card">
      <h2>Histórico de versões</h2>
      <div className="actions">
        <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>
          {carregando ? "Carregando…" : "Atualizar"}
        </button>
      </div>
      {erro && <div className="msg err">{erro}</div>}
      {releases && releases.length === 0 && <p className="muted">Nenhuma versão publicada ainda.</p>}
      {releases && releases.map((r) => {
        const trabalhando = ocupado === r.id;
        return (
          <div className="fileitem" key={r.id} style={r.draft ? { opacity: 0.6 } : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="nome">
                {r.tag_name}
                {r.draft && <span className="badge alt" style={{ marginLeft: 6 }}>rascunho</span>}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="muted">{r.published_at?.slice(0, 10)}</span>
                <button
                  className="btn secondary"
                  style={{ padding: "3px 10px", fontSize: 12 }}
                  onClick={() => alternarRascunho(r)}
                  disabled={trabalhando}
                  title={r.draft ? "Tornar pública de novo" : "Esconder da lista pública (reversível)"}
                >
                  {trabalhando ? "…" : r.draft ? "reativar" : "desativar"}
                </button>
                <button
                  onClick={() => excluir(r)}
                  disabled={trabalhando}
                  title="Excluir esta atualização de vez"
                  aria-label={`Excluir ${r.tag_name}`}
                  style={{
                    width: 26, height: 26, lineHeight: "1", borderRadius: 4, cursor: "pointer",
                    background: "#fff", color: "var(--err)", border: "1px solid #fecaca",
                    fontSize: 15, fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            </div>
            {r.body && <div className="muted" style={{ marginTop: 4 }}>{r.body}</div>}
            <a href={r.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>ver no GitHub</a>
          </div>
        );
      })}
    </div>
  );
}
