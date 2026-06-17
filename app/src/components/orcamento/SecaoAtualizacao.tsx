import { useState } from "react";
import { useStore } from "../../store";
import { isTauri } from "../../lib/env";
import { getDataVersion } from "../../lib/dataSource";
import {
  verificarAtualizacao,
  aplicarAtualizacao,
  type VerificacaoResultado,
} from "../../lib/update/runBaseUpdate";

/**
 * Aba "Atualização" — verifica e (se o usuário quiser) baixa uma nova BASE de
 * engenharia. Mostra ANTES o que há de novo. Os dados do usuário (clientes,
 * orçamentos, preços ajustados) NÃO são tocados (camada separada / user.db).
 */
export function SecaoAtualizacao() {
  const reload = useStore((s) => s.load);
  const [verificando, setVerificando] = useState(false);
  const [verif, setVerif] = useState<VerificacaoResultado | null>(null);
  const [aplicando, setAplicando] = useState(false);
  const [aplicado, setAplicado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const versaoAtual = getDataVersion();

  async function verificar() {
    setVerificando(true);
    setVerif(null);
    setAplicado(null);
    setErro(null);
    setVerif(await verificarAtualizacao());
    setVerificando(false);
  }

  async function aplicar() {
    if (verif?.status !== "disponivel") return;
    setAplicando(true);
    setErro(null);
    const r = await aplicarAtualizacao(verif.manifest);
    if (r.status === "applied") {
      await reload(); // recarrega a base nova (sem mexer nos dados do usuário)
      setAplicado(`Base atualizada para ${r.dataVersion} (${r.applied} arquivo(s)).`);
      setVerif(null);
    } else {
      setErro(r.message);
    }
    setAplicando(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Atualização da base</h2>
        <p className="mt-1 text-xs text-slate-600">
          Baixa a versão mais recente da base de engenharia (estruturas, materiais e preços de
          referência). Seus <strong>clientes, orçamentos e preços ajustados não são afetados</strong>.
        </p>
      </div>

      <dl className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-slate-500">Versão da base instalada</dt>
          <dd className="font-mono text-slate-800">{versaoAtual ?? "—"}</dd>
        </div>
      </dl>

      {!isTauri() ? (
        <p className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          A atualização automática está disponível apenas no aplicativo de desktop.
        </p>
      ) : (
        <button
          onClick={verificar}
          disabled={verificando || aplicando}
          className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {verificando ? "Verificando…" : "Verificar atualizações"}
        </button>
      )}

      {verif && <ResultadoVerificacao verif={verif} aplicando={aplicando} onAplicar={aplicar} />}
      {aplicado && <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{aplicado}</div>}
      {erro && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">Falha: {erro}</div>}
    </div>
  );
}

function ResultadoVerificacao({
  verif,
  aplicando,
  onAplicar,
}: {
  verif: VerificacaoResultado;
  aplicando: boolean;
  onAplicar: () => void;
}) {
  if (verif.status === "unconfigured")
    return <Msg tom="warn">O canal de atualização ainda não foi configurado.</Msg>;
  if (verif.status === "unsupported") return <Msg tom="muted">Disponível apenas no desktop.</Msg>;
  if (verif.status === "error") return <Msg tom="err">Falha ao verificar: {verif.message}</Msg>;
  if (verif.status === "up_to_date")
    return <Msg tom="ok">A base já está na versão mais recente ({verif.current ?? "—"}).</Msg>;

  // disponivel
  return (
    <div className="rounded border border-sky-200 bg-sky-50 px-3 py-3 text-xs text-slate-800">
      <div className="font-semibold text-sky-900">
        Atualização disponível: {verif.available}
      </div>
      {verif.notes && <div className="mt-0.5 text-slate-600">{verif.notes}</div>}
      <div className="mt-2 flex gap-4">
        <span><strong>{verif.novas.length}</strong> nova(s)</span>
        <span><strong>{verif.alteradas.length}</strong> alterada(s)</span>
      </div>
      {(verif.novas.length > 0 || verif.alteradas.length > 0) && (
        <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto rounded border border-sky-200 bg-white p-2 text-[11px]">
          {verif.novas.map((id) => (
            <li key={`n-${id}`}><span className="mr-1 rounded bg-blue-100 px-1 text-blue-700">nova</span>{id}</li>
          ))}
          {verif.alteradas.map((id) => (
            <li key={`a-${id}`}><span className="mr-1 rounded bg-amber-100 px-1 text-amber-700">alterada</span>{id}</li>
          ))}
        </ul>
      )}
      <button
        onClick={onAplicar}
        disabled={aplicando}
        className="mt-3 rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {aplicando ? "Baixando…" : "Baixar e aplicar"}
      </button>
    </div>
  );
}

function Msg({ tom, children }: { tom: "ok" | "warn" | "err" | "muted"; children: React.ReactNode }) {
  const cls = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    err: "border-red-200 bg-red-50 text-red-800",
    muted: "border-slate-200 bg-white text-slate-500",
  }[tom];
  return <div className={`rounded border px-3 py-2 text-xs ${cls}`}>{children}</div>;
}
