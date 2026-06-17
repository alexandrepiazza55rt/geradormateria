import { useState } from "react";
import { useStore } from "../../store";
import { isTauri } from "../../lib/env";
import { getDataVersion } from "../../lib/dataSource";
import { runBaseUpdate, type UpdateOutcome } from "../../lib/update/runBaseUpdate";

/**
 * Aba "Atualização" — verifica/baixa uma nova BASE de engenharia do host
 * (GitHub Releases). Os dados do usuário (clientes, orçamentos, preços ajustados)
 * NÃO são tocados: vivem em camada separada (user.db).
 */
export function SecaoAtualizacao() {
  const reload = useStore((s) => s.load);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<UpdateOutcome | null>(null);
  const versaoAtual = getDataVersion();

  async function verificar() {
    setBusy(true);
    setOutcome(null);
    const res = await runBaseUpdate();
    if (res.status === "applied") {
      // recarrega a base recém-gravada (sem mexer nos dados do usuário)
      await reload();
    }
    setOutcome(res);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Atualização da base</h2>
        <p className="mt-1 text-xs text-slate-600">
          Baixa a versão mais recente da base de engenharia (estruturas, materiais e
          preços de referência). Seus <strong>clientes, orçamentos e preços ajustados
          não são afetados</strong> — ficam em uma camada separada.
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
          disabled={busy}
          className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {busy ? "Verificando…" : "Verificar atualizações"}
        </button>
      )}

      {outcome && <ResultadoUpdate outcome={outcome} />}
    </div>
  );
}

function ResultadoUpdate({ outcome }: { outcome: UpdateOutcome }) {
  let tom = "border-slate-200 bg-slate-50 text-slate-700";
  let texto = "";
  switch (outcome.status) {
    case "unconfigured":
      tom = "border-amber-200 bg-amber-50 text-amber-800";
      texto =
        "O canal de atualização ainda não foi configurado (defina a URL do host em updateConfig.ts).";
      break;
    case "unsupported":
      texto = "Atualização disponível apenas no desktop.";
      break;
    case "up_to_date":
      tom = "border-emerald-200 bg-emerald-50 text-emerald-800";
      texto = `A base já está na versão mais recente (${outcome.current ?? "—"}).`;
      break;
    case "applied":
      tom = "border-emerald-200 bg-emerald-50 text-emerald-800";
      texto =
        `Base atualizada para ${outcome.dataVersion} ` +
        `(${outcome.applied} arquivo(s)).` +
        (outcome.notes ? ` ${outcome.notes}` : "");
      break;
    case "error":
      tom = "border-red-200 bg-red-50 text-red-800";
      texto = `Falha na atualização: ${outcome.message}`;
      break;
  }
  return (
    <div className={`rounded border px-3 py-2 text-xs ${tom}`} role="status">
      {texto}
    </div>
  );
}
