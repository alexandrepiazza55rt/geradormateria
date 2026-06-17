import { useState } from "react";
import {
  configCompleta,
  montarRepoConfig,
  salvarConfig,
  salvarToken,
  type ConfigSemToken,
} from "../lib/config";
import { testarConexao } from "../lib/github";

interface Props {
  config: ConfigSemToken;
  token: string;
  onChange: (c: ConfigSemToken, t: string) => void;
}

export function ConfigView({ config, token, onChange }: Props) {
  const [lembrar, setLembrar] = useState(true);
  const [status, setStatus] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [testando, setTestando] = useState(false);

  function set<K extends keyof ConfigSemToken>(k: K, v: ConfigSemToken[K]) {
    onChange({ ...config, [k]: v }, token);
  }

  function salvar() {
    salvarConfig(config);
    salvarToken(token, lembrar);
    setStatus({ tipo: "ok", texto: "Configuração salva neste navegador." });
  }

  async function testar() {
    setTestando(true);
    setStatus(null);
    try {
      salvarConfig(config);
      salvarToken(token, lembrar);
      const info = await testarConexao(montarRepoConfig(config, token));
      setStatus({
        tipo: "ok",
        texto: `Conectado a ${info.full_name} (${info.private ? "privado" : "público"}, branch padrão: ${info.default_branch}).`,
      });
    } catch (e) {
      setStatus({ tipo: "err", texto: (e as Error).message });
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="card">
      <h2>Conexão com o GitHub</h2>
      <p className="muted">
        Aponte para o repositório <strong>público</strong> da base (ex.: <code>gerador-base</code>)
        e cole um token de acesso. O token fica só neste navegador — vai apenas para o GitHub.
      </p>

      <div className="row">
        <div>
          <label>Usuário/organização (owner)</label>
          <input type="text" value={config.owner} placeholder="seu-usuario"
            onChange={(e) => set("owner", e.target.value.trim())} />
        </div>
        <div>
          <label>Repositório</label>
          <input type="text" value={config.name} placeholder="gerador-base"
            onChange={(e) => set("name", e.target.value.trim())} />
        </div>
        <div>
          <label>Branch</label>
          <input type="text" value={config.branch} placeholder="main"
            onChange={(e) => set("branch", e.target.value.trim() || "main")} />
        </div>
      </div>

      <label>Token de acesso (PAT fine-grained, Contents: read/write)</label>
      <input type="password" value={token} placeholder="github_pat_…"
        onChange={(e) => onChange(config, e.target.value.trim())} />

      <div className="checkrow">
        <input id="lembrar" type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
        <label htmlFor="lembrar" style={{ margin: 0 }}>
          Lembrar o token neste navegador (desmarque em computador compartilhado)
        </label>
      </div>

      <div className="actions">
        <button className="btn" onClick={testar} disabled={!configCompleta(config, token) || testando}>
          {testando ? "Testando…" : "Testar conexão"}
        </button>
        <button className="btn secondary" onClick={salvar}>Salvar</button>
      </div>

      {status && <div className={`msg ${status.tipo}`}>{status.texto}</div>}
    </div>
  );
}
