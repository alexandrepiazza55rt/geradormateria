import { useState } from "react";
import templateRaw from "../../modelo/estrutura.template.json?raw";
import exemploRaw from "../../modelo/estrutura.exemplo.json?raw";
import modeloMd from "../../modelo/MODELO.md?raw";
import { validarFormato } from "../lib/validar";

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function ModeloView() {
  const [texto, setTexto] = useState("");
  const [res, setRes] = useState<{ erros: string[]; avisos: string[] } | null>(null);

  function validar() {
    try {
      const obj = JSON.parse(texto);
      const r = validarFormato(obj);
      setRes({ erros: r.erros, avisos: r.avisos });
    } catch (e) {
      setRes({ erros: [`JSON inválido: ${(e as Error).message}`], avisos: [] });
    }
  }

  return (
    <>
      <div className="card">
        <h2>Modelo padrão de estrutura</h2>
        <p className="muted">
          Cada estrutura é um arquivo JSON neste formato. Formate seus dados nele e publique na
          aba <strong>Publicar</strong>. Baixe o template para começar.
        </p>
        <div className="actions">
          <button className="btn" onClick={() => baixar("estrutura.template.json", templateRaw)}>
            Baixar template
          </button>
          <button className="btn secondary" onClick={() => baixar("estrutura.exemplo.json", exemploRaw)}>
            Baixar exemplo preenchido
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Validar um JSON (sem publicar)</h2>
        <p className="muted">Cole o conteúdo de uma estrutura para conferir o formato.</p>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="cole aqui o JSON da estrutura…" />
        <div className="actions">
          <button className="btn" onClick={validar} disabled={!texto.trim()}>Validar formato</button>
        </div>
        {res && res.erros.length === 0 && (
          <div className="msg ok">Formato válido.{res.avisos.length > 0 ? " (com avisos abaixo)" : ""}</div>
        )}
        {res && res.erros.length > 0 && (
          <div className="msg err">
            {res.erros.length} erro(s):
            <ul className="compact">{res.erros.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        )}
        {res && res.avisos.length > 0 && (
          <div className="msg warn">
            <ul className="compact">{res.avisos.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Guia dos campos</h2>
        <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5, maxHeight: 420, overflow: "auto" }}>
          {modeloMd}
        </div>
      </div>
    </>
  );
}
