import { useEffect, useState } from "react";
import {
  carregarLicConfig, salvarLicConfig, licConfigCompleta, listarLicencas, criarLicenca,
  revogarLicenca, renovarLicenca, resetBindLicenca, type LicConfig, type LicencaResumo,
} from "../lib/licenseAdmin";

export function LicencasView() {
  const [cfg, setCfg] = useState<LicConfig>(carregarLicConfig);
  const [lista, setLista] = useState<LicencaResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [novaChave, setNovaChave] = useState<{ chave: string; cliente: string } | null>(null);
  const [cliente, setCliente] = useState("");
  const [dias, setDias] = useState("365");
  const [busy, setBusy] = useState(false);

  async function carregar() {
    if (!licConfigCompleta(cfg)) return;
    setErro(null);
    try {
      setLista(await listarLicencas(cfg));
    } catch (e) {
      setErro((e as Error).message);
    }
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  function salvarConfig() {
    salvarLicConfig(cfg);
    carregar();
  }

  async function criar() {
    setBusy(true); setErro(null); setNovaChave(null);
    try {
      const r = await criarLicenca(cfg, { cliente_nome: cliente.trim() || undefined, dias_validade: Number(dias) || undefined });
      setNovaChave({ chave: r.chave, cliente: cliente.trim() });
      setCliente("");
      await carregar();
    } catch (e) { setErro((e as Error).message); } finally { setBusy(false); }
  }

  async function acao(fn: () => Promise<unknown>) {
    setBusy(true); setErro(null);
    try { await fn(); await carregar(); } catch (e) { setErro((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="card">
        <h2>Servidor de licença</h2>
        <p className="muted">URL do Worker e token de admin (ficam só neste navegador).</p>
        <div className="row">
          <div>
            <label>URL da API</label>
            <input type="text" value={cfg.apiUrl} placeholder="https://gerador-licenca.SEU.workers.dev"
              onChange={(e) => setCfg({ ...cfg, apiUrl: e.target.value.trim() })} />
          </div>
          <div>
            <label>Token de admin</label>
            <input type="password" value={cfg.adminToken} placeholder="sua senha de admin"
              onChange={(e) => setCfg({ ...cfg, adminToken: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={salvarConfig} disabled={!licConfigCompleta(cfg)}>Salvar e conectar</button>
        </div>
        {erro && <div className="msg err">{erro}</div>}
      </div>

      {licConfigCompleta(cfg) && (
        <>
          <div className="card">
            <h2>Criar licença</h2>
            <div className="row">
              <div>
                <label>Cliente (opcional)</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="ex.: João da Silva" />
              </div>
              <div>
                <label>Validade (dias; vazio = sem expiração)</label>
                <input type="text" value={dias} onChange={(e) => setDias(e.target.value)} placeholder="365" />
              </div>
            </div>
            <div className="actions">
              <button className="btn" onClick={criar} disabled={busy}>Gerar chave</button>
            </div>
            {novaChave && (
              <div className="msg ok">
                Chave criada{novaChave.cliente ? ` para ${novaChave.cliente}` : ""} (anote, só aparece agora):
                <div style={{ marginTop: 6, fontFamily: "ui-monospace, monospace", fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{novaChave.chave}</div>
                <button className="btn secondary" style={{ marginTop: 8, padding: "3px 10px" }} onClick={() => navigator.clipboard?.writeText(novaChave.chave)}>Copiar</button>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Licenças</h2>
            <div className="actions"><button className="btn secondary" onClick={carregar} disabled={busy}>Recarregar</button></div>
            {lista == null ? <p className="muted">Carregando…</p> : lista.length === 0 ? <p className="muted">Nenhuma licença ainda.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
                      <th style={{ padding: "4px 6px" }}>Chave</th><th>Cliente</th><th>Estado</th><th>Máquina</th><th>Expira</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((l) => (
                      <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "6px", fontFamily: "ui-monospace, monospace" }}>{l.chave_prefixo}-•••</td>
                        <td>{l.cliente_nome ?? "—"}</td>
                        <td><EstadoBadge estado={l.estado} /></td>
                        <td>{l.vinculada ? "vinculada" : "livre"}</td>
                        <td>{l.expira_em ? l.expira_em.slice(0, 10) : "sem"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {l.estado !== "REVOGADA" && (
                            <button className="btn secondary" style={{ padding: "2px 8px", marginRight: 4 }}
                              onClick={() => { if (confirm("Revogar esta licença? O programa do cliente vai travar na próxima verificação.")) acao(() => revogarLicenca(cfg, l.id)); }}>revogar</button>
                          )}
                          <button className="btn secondary" style={{ padding: "2px 8px", marginRight: 4 }}
                            onClick={() => acao(() => renovarLicenca(cfg, l.id, 365))}>+365d</button>
                          {l.vinculada && (
                            <button className="btn secondary" style={{ padding: "2px 8px" }}
                              onClick={() => { if (confirm("Desvincular a máquina? O cliente poderá ativar em outro PC.")) acao(() => resetBindLicenca(cfg, l.id)); }}>reset vínculo</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const cor: Record<string, string> = {
    ATIVA: "#dcfce7;#166534", CRIADA: "#e0f2fe;#075985", REVOGADA: "#fee2e2;#991b1b",
    EXPIRADA: "#fef3c7;#92400e", SUSPENSA: "#f1f5f9;#475569",
  };
  const [bg, fg] = (cor[estado] ?? "#f1f5f9;#475569").split(";");
  return <span style={{ background: bg, color: fg, padding: "1px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{estado}</span>;
}
