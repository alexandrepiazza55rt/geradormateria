import { useState } from "react";
import {
  carregarConfig,
  carregarToken,
  configCompleta,
  montarRepoConfig,
  type ConfigSemToken,
} from "./lib/config";
import { ConfigView } from "./components/ConfigView";
import { ModeloView } from "./components/ModeloView";
import { PublicarView } from "./components/PublicarView";
import { EstruturasView } from "./components/EstruturasView";
import { HistoricoView } from "./components/HistoricoView";

type Aba = "config" | "modelo" | "publicar" | "estruturas" | "historico";

export default function App() {
  const [config, setConfig] = useState<ConfigSemToken>(carregarConfig);
  const [token, setToken] = useState<string>(carregarToken);
  const [aba, setAba] = useState<Aba>(
    configCompleta(carregarConfig(), carregarToken()) ? "publicar" : "config",
  );

  const pronto = configCompleta(config, token);
  const repo = pronto ? montarRepoConfig(config, token) : null;

  return (
    <div className="app">
      <div className="header">
        <h1>Painel de Publicação da Base</h1>
        <span className="sub">Gerador de Relação de Materiais</span>
      </div>

      <div className="tabs">
        <button className={aba === "config" ? "active" : ""} onClick={() => setAba("config")}>
          Configuração
        </button>
        <button className={aba === "modelo" ? "active" : ""} onClick={() => setAba("modelo")}>
          Modelo
        </button>
        <button className={aba === "publicar" ? "active" : ""} onClick={() => setAba("publicar")}>
          Publicar
        </button>
        <button className={aba === "estruturas" ? "active" : ""} onClick={() => setAba("estruturas")}>
          Estruturas
        </button>
        <button className={aba === "historico" ? "active" : ""} onClick={() => setAba("historico")}>
          Histórico
        </button>
      </div>

      {aba === "config" && (
        <ConfigView
          config={config}
          token={token}
          onChange={(c, t) => {
            setConfig(c);
            setToken(t);
          }}
        />
      )}
      {aba === "modelo" && <ModeloView />}
      {aba === "publicar" && <PublicarView repo={repo} />}
      {aba === "estruturas" && <EstruturasView repo={repo} />}
      {aba === "historico" && <HistoricoView repo={repo} />}
    </div>
  );
}
