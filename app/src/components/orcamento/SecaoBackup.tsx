import { useState } from "react";
import { useStore } from "../../store";
import { saveText } from "../../lib/exportTarget";
import {
  coletarBackup,
  restaurarBackup,
  resumirBackup,
  validarBackup,
  type BackupFile,
} from "../../lib/backup";

const FILTER_JSON = [{ name: "Backup (JSON)", extensions: ["json"] }];

export function SecaoBackup() {
  const reload = useStore((s) => s.load);
  const [msg, setMsg] = useState<{ tom: "ok" | "err"; texto: string } | null>(null);
  const [pendente, setPendente] = useState<BackupFile | null>(null);
  const [restaurando, setRestaurando] = useState(false);

  async function fazerBackup() {
    setMsg(null);
    try {
      const backup = coletarBackup();
      const data = new Date().toISOString().slice(0, 10);
      const ok = await saveText(
        `backup-gerador-${data}.json`,
        JSON.stringify(backup, null, 2),
        "application/json",
        FILTER_JSON,
      );
      if (ok) {
        const r = resumirBackup(backup);
        setMsg({
          tom: "ok",
          texto: `Backup salvo: ${r.clientes ?? 0} cliente(s), ${r.orcamentos ?? 0} orçamento(s), ${r.precos ?? 0} preço(s) ajustado(s).`,
        });
      }
    } catch (e) {
      setMsg({ tom: "err", texto: (e as Error).message });
    }
  }

  async function selecionarArquivo(file: File | undefined) {
    setMsg(null);
    setPendente(null);
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (!validarBackup(obj)) {
        setMsg({ tom: "err", texto: "Este arquivo não é um backup válido do sistema." });
        return;
      }
      setPendente(obj);
    } catch {
      setMsg({ tom: "err", texto: "Não consegui ler o arquivo (JSON inválido)." });
    }
  }

  async function confirmarRestauracao() {
    if (!pendente) return;
    setRestaurando(true);
    try {
      restaurarBackup(pendente);
      await reload(); // re-hidrata a interface com os dados restaurados
      const r = resumirBackup(pendente);
      setMsg({
        tom: "ok",
        texto: `Restaurado: ${r.clientes ?? 0} cliente(s), ${r.orcamentos ?? 0} orçamento(s), ${r.precos ?? 0} preço(s) ajustado(s).`,
      });
      setPendente(null);
    } catch (e) {
      setMsg({ tom: "err", texto: (e as Error).message });
    } finally {
      setRestaurando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Backup dos seus dados</h2>
        <p className="mt-1 text-xs text-slate-600">
          Salva ou restaura <strong>todos os seus dados</strong> (clientes, orçamentos, preços
          ajustados e configurações) num único arquivo <code>.json</code>. A base de engenharia
          (estruturas/materiais) não entra aqui — ela vem da atualização.
        </p>
      </div>

      {/* Fazer backup */}
      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="text-xs font-medium text-slate-700">Fazer backup</div>
        <p className="mt-0.5 text-xs text-slate-500">Gera um arquivo com tudo. Guarde em local seguro (pendrive, nuvem).</p>
        <button
          onClick={fazerBackup}
          className="mt-2 rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
        >
          Fazer backup (.json)
        </button>
      </div>

      {/* Restaurar backup */}
      <div className="rounded border border-amber-200 bg-amber-50 px-3 py-3">
        <div className="text-xs font-medium text-amber-900">Restaurar backup</div>
        <p className="mt-0.5 text-xs text-amber-700">
          Envia um arquivo de backup. <strong>Substitui os dados atuais</strong> pelos do arquivo.
        </p>
        <label className="mt-2 inline-block cursor-pointer rounded-md border border-amber-300 bg-white px-4 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100">
          Escolher arquivo…
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              selecionarArquivo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>

        {pendente && (
          <div className="mt-3 rounded border border-amber-300 bg-white p-3 text-xs">
            <p className="text-slate-700">
              Backup de <strong>{new Date(pendente.exportado_em).toLocaleString("pt-BR")}</strong>.
              Vai restaurar:
            </p>
            {(() => {
              const r = resumirBackup(pendente);
              return (
                <ul className="mt-1 list-disc pl-5 text-slate-600">
                  <li>{r.clientes ?? 0} cliente(s)</li>
                  <li>{r.orcamentos ?? 0} orçamento(s)</li>
                  <li>{r.precos ?? 0} preço(s) ajustado(s)</li>
                </ul>
              );
            })()}
            <p className="mt-2 font-medium text-amber-800">Seus dados atuais serão substituídos. Continuar?</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={confirmarRestauracao}
                disabled={restaurando}
                className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:bg-slate-300"
              >
                {restaurando ? "Restaurando…" : "Sim, restaurar"}
              </button>
              <button
                onClick={() => setPendente(null)}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`rounded border px-3 py-2 text-xs ${
            msg.tom === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {msg.texto}
        </div>
      )}
    </div>
  );
}
