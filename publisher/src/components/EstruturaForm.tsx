import { useState } from "react";
import { publicar, type RepoConfig } from "../lib/github";
import { carregarEstadoBase } from "../lib/repoBase";
import { validarFormato, validarContraBase } from "../lib/validar";
import { montarPublicacao } from "../lib/manifesto";
import type { Estrutura } from "../lib/types";
import { EditorMateriais, type MateriaisMap } from "./materialInputs";

const NOMINAL: Record<string, number> = { "13.8": 7.97, "24.2": 13.97, "34.5": 19.92 };

interface PosteForm {
  poste: string;
  abs: Record<string, number>; // quantidades ABSOLUTAS (base + delta); delta é calculado ao salvar
}

function aplicarDelta(base: Record<string, number>, delta: Record<string, number>): Record<string, number> {
  const abs = { ...base };
  for (const [k, d] of Object.entries(delta)) {
    abs[k] = (abs[k] ?? 0) + d;
    if (Math.abs(abs[k]) < 1e-9) delete abs[k];
  }
  return abs;
}

function calcularDelta(abs: Record<string, number>, base: Record<string, number>): Record<string, number> {
  const d: Record<string, number> = {};
  for (const id of new Set([...Object.keys(abs), ...Object.keys(base)])) {
    const diff = (abs[id] ?? 0) - (base[id] ?? 0);
    if (Math.abs(diff) > 1e-9) d[id] = diff;
  }
  return d;
}

function hojeVersao(atual: string | undefined): string {
  const dia = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  if (atual && atual.startsWith(dia)) {
    const m = atual.match(/-r(\d+)$/);
    return `${dia}-r${m ? Number(m[1]) + 1 : 2}`;
  }
  return `${dia}-r1`;
}

export function EstruturaForm({
  materiais,
  categoriasExistentes,
  inicial,
  revPublicado,
  repo,
  onPublicado,
  onCancelar,
}: {
  materiais: MateriaisMap;
  categoriasExistentes: string[];
  inicial: Estrutura | null;
  revPublicado: number | null;
  repo: RepoConfig;
  onPublicado: () => void;
  onCancelar: () => void;
}) {
  const novo = inicial == null;
  const [id, setId] = useState(inicial?.id ?? "X-2026-001");
  const [tipo, setTipo] = useState(inicial?.tipo ?? "");
  const [categoria, setCategoria] = useState(inicial?.categoria ?? "");
  const [condutor, setCondutor] = useState(inicial?.condutor ?? "");
  const [tensao, setTensao] = useState(String(inicial?.tensao_kv ?? "13.8"));
  const [nominal, setNominal] = useState(String(inicial?.nominal_kv ?? NOMINAL["13.8"]));
  const [fases, setFases] = useState(String(inicial?.fases ?? "1"));
  const [status, setStatus] = useState(inicial?.status ?? "ativo");
  const [posteRef, setPosteRef] = useState(inicial?.poste_ref ?? "");
  const [baseBom, setBaseBom] = useState<Record<string, number>>(inicial?.base_bom ?? {});

  const [postes, setPostes] = useState<PosteForm[]>(() => {
    if (!inicial) return [];
    const base = inicial.base_bom ?? {};
    return (inicial.postes ?? [])
      .filter((p) => p.poste !== (inicial.poste_ref ?? (inicial.postes?.[0]?.poste)))
      .map((p) => ({ poste: p.poste, abs: aplicarDelta(base, p.delta ?? {}) }));
  });
  const [expandido, setExpandido] = useState<Set<number>>(new Set());

  const [erros, setErros] = useState<string[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [msg, setMsg] = useState<{ tom: "ok" | "err"; texto: string } | null>(null);

  function montarEstrutura(): Estrutura {
    const postesOut = [{ poste: posteRef, delta: {} as Record<string, number> }];
    for (const p of postes) postesOut.push({ poste: p.poste, delta: calcularDelta(p.abs, baseBom) });
    return {
      schema_version: 1,
      rev: revPublicado != null ? revPublicado + 1 : (inicial?.rev ?? 1),
      status: status as "ativo" | "descontinuado",
      id: id.trim(),
      tipo: tipo.trim(),
      condutor: condutor.trim() || null,
      tensao_kv: Number(tensao),
      nominal_kv: Number(nominal),
      fases: Number(fases),
      categoria: categoria.trim(),
      poste_ref: posteRef.trim(),
      base_bom: baseBom,
      postes: postesOut,
    };
  }

  async function salvar() {
    setPublicando(true);
    setErros([]);
    setMsg(null);
    try {
      const est = montarEstrutura();
      const fmt = validarFormato(est);
      if (!fmt.ok) { setErros(fmt.erros); setPublicando(false); return; }
      const estado = await carregarEstadoBase(repo);
      const vb = validarContraBase(est, { idsMateriais: estado.idsMateriais, catalog: estado.catalog });
      if (!vb.ok) { setErros(vb.erros); setPublicando(false); return; }
      const versao = hojeVersao(estado.catalog?.data_version);
      const acao = novo ? "nova" : `rev ${est.rev}`;
      const pub = await montarPublicacao([est], estado.manifest, estado.catalog, versao, `${est.id} (${acao})`);
      await publicar(repo, pub.arquivos, `${novo ? "Adiciona" : "Corrige"} ${est.id} (${versao})`, versao, `${est.id} ${acao}`);
      setMsg({ tom: "ok", texto: `Publicado (${versao}). Os clientes recebem na próxima verificação.` });
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
        <h2 style={{ margin: 0 }}>{novo ? "Nova estrutura" : `Editar ${inicial?.id}`}</h2>
        <button className="btn secondary" style={{ padding: "3px 10px" }} onClick={onCancelar}>fechar</button>
      </div>

      <div className="row">
        <div>
          <label>Identificador (id)</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} disabled={!novo} />
          {novo && <span className="muted" style={{ fontSize: 11 }}>use o prefixo X- (ex.: X-2026-001)</span>}
        </div>
        <div>
          <label>Tipo</label>
          <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="ex.: U1, N3, RUMC-1" />
        </div>
      </div>

      <label>Categoria (grupo)</label>
      <input type="text" list="cats" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex.: Monofásico 13,8 kV — ou um nome novo" />
      <datalist id="cats">{categoriasExistentes.map((c) => <option key={c} value={c} />)}</datalist>

      <div className="row">
        <div>
          <label>Tensão (kV)</label>
          <select value={tensao} onChange={(e) => { setTensao(e.target.value); if (NOMINAL[e.target.value]) setNominal(String(NOMINAL[e.target.value])); }}>
            <option value="13.8">13,8</option>
            <option value="24.2">24,2</option>
            <option value="34.5">34,5</option>
          </select>
        </div>
        <div>
          <label>Nominal (kV)</label>
          <input type="number" step="any" value={nominal} onChange={(e) => setNominal(e.target.value)} />
        </div>
        <div>
          <label>Fases</label>
          <select value={fases} onChange={(e) => setFases(e.target.value)}>
            <option value="1">Monofásico (1)</option>
            <option value="2">Bifásico (2)</option>
            <option value="3">Trifásico (3)</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div>
          <label>Condutor (vazio = nenhum)</label>
          <input type="text" value={condutor ?? ""} onChange={(e) => setCondutor(e.target.value)} placeholder="ex.: 1/0CAA, N8" />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "ativo" | "descontinuado")}>
            <option value="ativo">ativo</option>
            <option value="descontinuado">descontinuado (some da criação)</option>
          </select>
        </div>
        <div>
          <label>Poste de referência</label>
          <input type="text" value={posteRef} onChange={(e) => setPosteRef(e.target.value)} placeholder="ex.: DT-10/150" />
        </div>
      </div>

      <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>Materiais no poste de referência</h3>
      <p className="muted" style={{ marginTop: 0 }}>Quantidade de cada material para o poste <strong>{posteRef || "(defina o poste de referência)"}</strong>.</p>
      <EditorMateriais value={baseBom} materiais={materiais} onChange={setBaseBom} />

      <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>Outros postes (opcional)</h3>
      <p className="muted" style={{ marginTop: 0 }}>Para cada poste, ajuste as quantidades. O sistema guarda só as <strong>diferenças</strong> em relação ao poste de referência.</p>
      {postes.map((p, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 4, padding: 10, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="text" value={p.poste} placeholder="rótulo do poste (ex.: DT-10/300)"
              onChange={(e) => setPostes(postes.map((x, k) => (k === i ? { ...x, poste: e.target.value } : x)))} />
            <button type="button" className="btn secondary" style={{ padding: "4px 10px" }}
              onClick={() => setExpandido((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}>
              {expandido.has(i) ? "ocultar" : "materiais"}
            </button>
            <button type="button" className="btn secondary" style={{ padding: "4px 10px" }}
              onClick={() => { setPostes(postes.filter((_, k) => k !== i)); }}>remover</button>
          </div>
          {expandido.has(i) && (
            <div style={{ marginTop: 8 }}>
              <EditorMateriais value={p.abs} materiais={materiais}
                onChange={(v) => setPostes(postes.map((x, k) => (k === i ? { ...x, abs: v } : x)))} />
            </div>
          )}
        </div>
      ))}
      <div className="actions">
        <button type="button" className="btn secondary" onClick={() => { setPostes([...postes, { poste: "", abs: { ...baseBom } }]); setExpandido((s) => new Set(s).add(postes.length)); }}>
          + adicionar poste
        </button>
      </div>

      {erros.length > 0 && <div className="msg err"><ul className="compact">{erros.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      <div className="actions" style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <button className="btn" onClick={salvar} disabled={publicando}>
          {publicando ? "Publicando…" : novo ? "Publicar nova estrutura" : `Publicar correção (rev ${revPublicado != null ? revPublicado + 1 : ""})`}
        </button>
        <button className="btn secondary" onClick={onCancelar}>Cancelar</button>
      </div>
      {msg && <div className={`msg ${msg.tom}`}>{msg.texto}</div>}
    </div>
  );
}
