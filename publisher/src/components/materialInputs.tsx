import { useMemo, useState } from "react";

export type MateriaisMap = Map<number, { descricao: string; unidade: string }>;

export function nomeMaterial(materiais: MateriaisMap, id: number | string): string {
  const m = materiais.get(Number(id));
  return m?.descricao ? m.descricao : `material ${id}`;
}

/** Busca um material pela DESCRIÇÃO (mostra o código por trás). */
export function SeletorMaterial({
  materiais,
  onSelect,
  excluir,
  placeholder,
}: {
  materiais: MateriaisMap;
  onSelect: (id: number) => void;
  excluir?: Set<number>;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as [number, { descricao: string; unidade: string }][];
    const out: [number, { descricao: string; unidade: string }][] = [];
    for (const [id, m] of materiais) {
      if (excluir?.has(id)) continue;
      if (m.descricao.toLowerCase().includes(t) || String(id).includes(t)) {
        out.push([id, m]);
        if (out.length >= 25) break;
      }
    }
    return out;
  }, [q, materiais, excluir]);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? "buscar material pela descrição…"}
      />
      {matches.length > 0 && (
        <div style={{ position: "absolute", zIndex: 20, width: "100%", maxHeight: 220, overflow: "auto", background: "#fff", border: "1px solid var(--border)", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}>
          {matches.map(([id, m]) => (
            <button
              key={id}
              type="button"
              onClick={() => { onSelect(id); setQ(""); }}
              style={{ display: "block", width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--border)", background: "#fff", cursor: "pointer", padding: "6px 10px", fontSize: 13 }}
            >
              {m.descricao} <span className="muted">({m.unidade}) · cód {id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tabela editável de materiais: material (descrição) + quantidade + remover. */
export function EditorMateriais({
  value,
  materiais,
  onChange,
  vazioTexto,
}: {
  value: Record<string, number>;
  materiais: MateriaisMap;
  onChange: (v: Record<string, number>) => void;
  vazioTexto?: string;
}) {
  const entries = Object.entries(value);
  const usados = new Set(entries.map(([k]) => Number(k)));

  function setQty(id: string, qty: number) {
    onChange({ ...value, [id]: qty });
  }
  function remover(id: string) {
    const n = { ...value };
    delete n[id];
    onChange(n);
  }
  function adicionar(id: number) {
    if (!(String(id) in value)) onChange({ ...value, [String(id)]: 1 });
  }

  return (
    <div>
      {entries.length === 0 ? (
        <p className="muted" style={{ margin: "4px 0" }}>{vazioTexto ?? "Nenhum material ainda."}</p>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {entries.map(([id, qty]) => (
              <tr key={id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "4px 0" }}>{nomeMaterial(materiais, id)} <span className="muted">· {id}</span></td>
                <td style={{ width: 90, padding: "4px 0" }}>
                  <input
                    type="number"
                    step="any"
                    value={qty}
                    onChange={(e) => setQty(id, Number(e.target.value))}
                    style={{ textAlign: "right" }}
                  />
                </td>
                <td style={{ width: 70, textAlign: "right" }}>
                  <button type="button" className="btn secondary" style={{ padding: "2px 8px" }} onClick={() => remover(id)}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 6 }}>
        <SeletorMaterial materiais={materiais} excluir={usados} onSelect={adicionar} placeholder="+ adicionar material (busca pela descrição)…" />
      </div>
    </div>
  );
}
