import { useEffect, useState } from "react";
import type { RepoConfig } from "../lib/github";
import { publicar } from "../lib/github";
import { carregarEstadoBase, type EstadoBase } from "../lib/repoBase";
import { validarFormato, validarContraBase } from "../lib/validar";
import { montarPublicacao } from "../lib/manifesto";
import type { Estrutura } from "../lib/types";

interface ArquivoAvaliado {
  nome: string;
  est: Estrutura | null;
  erros: string[];
  avisos: string[];
  novo: boolean;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, ".");
}

function sugerirVersao(atual: string | undefined): string {
  const d = hoje();
  if (atual && atual.startsWith(d)) {
    const m = atual.match(/-r(\d+)$/);
    return `${d}-r${m ? Number(m[1]) + 1 : 2}`;
  }
  return `${d}-r1`;
}

export function PublicarView({ repo }: { repo: RepoConfig | null }) {
  const [estado, setEstado] = useState<EstadoBase | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erroBase, setErroBase] = useState<string | null>(null);
  const [arquivos, setArquivos] = useState<ArquivoAvaliado[]>([]);
  const [dataVersion, setDataVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [over, setOver] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "err"; texto: string; url?: string } | null>(null);

  async function carregar(r: RepoConfig) {
    setCarregando(true);
    setErroBase(null);
    try {
      const est = await carregarEstadoBase(r);
      setEstado(est);
      setDataVersion(sugerirVersao(est.catalog?.data_version));
    } catch (e) {
      setErroBase((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (repo) carregar(repo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo?.owner, repo?.name, repo?.branch]);

  function reavaliar(ests: ArquivoAvaliado[], base: EstadoBase | null): ArquivoAvaliado[] {
    const idsNoLote = new Set(ests.filter((a) => a.est).map((a) => a.est!.id));
    return ests.map((a) => {
      if (!a.est) return a;
      const fmt = validarFormato(a.est);
      const erros = [...fmt.erros];
      const avisos = [...fmt.avisos];
      let novo = true;
      if (base) {
        const vb = validarContraBase(a.est, {
          idsMateriais: base.idsMateriais,
          catalog: base.catalog,
          idsNoLote,
        });
        erros.push(...vb.erros);
        avisos.push(...vb.avisos);
        novo = !base.catalog?.structures.some((s) => s.id === a.est!.id);
      }
      return { ...a, erros, avisos, novo };
    });
  }

  async function adicionarArquivos(lista: FileList | File[]) {
    const novos: ArquivoAvaliado[] = [];
    for (const f of Array.from(lista)) {
      if (!f.name.endsWith(".json")) continue;
      let est: Estrutura | null = null;
      const erros: string[] = [];
      try {
        est = JSON.parse(await f.text()) as Estrutura;
      } catch (e) {
        erros.push(`JSON inválido: ${(e as Error).message}`);
      }
      novos.push({ nome: f.name, est, erros, avisos: [], novo: true });
    }
    setArquivos((prev) => reavaliar([...prev.filter((a) => !novos.some((n) => n.nome === a.nome)), ...novos], estado));
  }

  function remover(nome: string) {
    setArquivos((prev) => reavaliar(prev.filter((a) => a.nome !== nome), estado));
  }

  const validos = arquivos.filter((a) => a.est && a.erros.length === 0);
  const temErros = arquivos.some((a) => a.erros.length > 0);
  const podePublicar =
    !!repo && !!estado && validos.length > 0 && !temErros && dataVersion.trim() !== "" && !publicando;

  async function handlePublicar() {
    if (!repo || !estado) return;
    setPublicando(true);
    setResultado(null);
    try {
      const ests = validos.map((a) => a.est!);
      const pub = await montarPublicacao(ests, estado.manifest, estado.catalog, dataVersion.trim(), notes.trim());
      const mensagem = `Publicar ${dataVersion.trim()} (${pub.novas.length} nova(s), ${pub.alteradas.length} alterada(s))`;
      const r = await publicar(repo, pub.arquivos, mensagem, dataVersion.trim(), notes.trim());
      setResultado({
        tipo: "ok",
        texto: `Publicado! ${pub.novas.length} nova(s), ${pub.alteradas.length} alterada(s). Os clientes receberão na próxima verificação de atualização.`,
        url: r.commitUrl,
      });
      setArquivos([]);
      await carregar(repo);
    } catch (e) {
      setResultado({ tipo: "err", texto: (e as Error).message });
    } finally {
      setPublicando(false);
    }
  }

  if (!repo) {
    return (
      <div className="card">
        <div className="msg warn">Configure o repositório e o token na aba <strong>Configuração</strong> primeiro.</div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Base atual</h2>
        {carregando && <p className="muted">Carregando estado da base…</p>}
        {erroBase && <div className="msg err">{erroBase}</div>}
        {estado && (
          <p className="muted">
            Versão publicada: <strong>{estado.catalog?.data_version ?? "(repo ainda sem base)"}</strong> ·{" "}
            {estado.catalog?.structures.length ?? 0} estruturas · {estado.idsMateriais.size} materiais no catálogo.
          </p>
        )}
        <div className="actions">
          <button className="btn secondary" onClick={() => carregar(repo)} disabled={carregando}>
            Recarregar base
          </button>
        </div>
        {estado && estado.idsMateriais.size === 0 && (
          <div className="msg warn">
            Não encontrei <code>materiais.json</code> no repositório. Faça o <em>seed inicial</em> da
            base antes de publicar estruturas novas (sem ele não dá para validar os códigos).
          </div>
        )}
      </div>

      <div className="card">
        <h2>Estruturas a publicar</h2>
        <div
          className={`dropzone ${over ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); adicionarArquivos(e.dataTransfer.files); }}
          onClick={() => document.getElementById("fileinput")?.click()}
        >
          Arraste os arquivos <strong>.json</strong> aqui, ou clique para escolher.
        </div>
        <input id="fileinput" type="file" accept=".json" multiple style={{ display: "none" }}
          onChange={(e) => { if (e.target.files) adicionarArquivos(e.target.files); e.target.value = ""; }} />

        {arquivos.map((a) => (
          <div className="fileitem" key={a.nome}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="nome">
                {a.nome}{" "}
                {a.est && a.erros.length === 0 && (
                  <span className={`badge ${a.novo ? "nova" : "alt"}`}>{a.novo ? "nova" : "correção"}</span>
                )}
              </span>
              <button className="btn secondary" style={{ padding: "3px 10px" }} onClick={() => remover(a.nome)}>remover</button>
            </div>
            {a.erros.length > 0 && (
              <div className="msg err">
                <ul className="compact">{a.erros.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
            {a.erros.length === 0 && a.avisos.length > 0 && (
              <div className="msg warn">
                <ul className="compact">{a.avisos.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Versão e publicação</h2>
        <div className="row">
          <div>
            <label>Nova versão (data_version)</label>
            <input type="text" value={dataVersion} onChange={(e) => setDataVersion(e.target.value)} placeholder="2026.07.01-r1" />
          </div>
        </div>
        <label>Notas da versão (aparecem para você no histórico)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ex.: reajuste de preços e estrutura X nova" style={{ minHeight: 60 }} />

        <div className="actions">
          <button className="btn" onClick={handlePublicar} disabled={!podePublicar}>
            {publicando ? "Publicando…" : `Publicar ${validos.length} estrutura(s)`}
          </button>
        </div>
        {temErros && <div className="msg err">Corrija os erros acima antes de publicar.</div>}
        {resultado && (
          <div className={`msg ${resultado.tipo}`}>
            {resultado.texto}{" "}
            {resultado.url && <a href={resultado.url} target="_blank" rel="noreferrer">ver commit</a>}
          </div>
        )}
      </div>
    </>
  );
}
