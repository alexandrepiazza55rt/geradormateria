import { useEffect, useState } from "react";
import { useStore } from "../store";
import { verificarAtualizacao } from "../lib/update/runBaseUpdate";

/**
 * Aviso discreto no canto da tela quando há atualização de base disponível.
 * Checa uma vez ao abrir o programa (desktop + canal configurado). Clicar leva
 * direto para a aba "Atualização" das Configurações.
 */
export function UpdateToast() {
  const setView = useStore((s) => s.setView);
  const [info, setInfo] = useState<{ version: string; novas: number; alteradas: number } | null>(null);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    let vivo = true;
    verificarAtualizacao()
      .then((r) => {
        if (vivo && r.status === "disponivel") {
          setInfo({ version: r.available, novas: r.novas.length, alteradas: r.alteradas.length });
        }
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  if (!info || fechado) return null;

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-sky-200 bg-white p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-sky-900">Atualização disponível</div>
        <button onClick={() => setFechado(true)} className="text-slate-400 hover:text-slate-700" aria-label="Fechar">
          ×
        </button>
      </div>
      <div className="mt-1 text-xs text-slate-600">
        Versão {info.version} — {info.novas} nova(s), {info.alteradas} alterada(s).
      </div>
      <button
        onClick={() => {
          try {
            sessionStorage.setItem("config_aba", "atualizacao");
          } catch {
            /* ignore */
          }
          setView({ name: "configuracoes" });
          setFechado(true);
        }}
        className="mt-2 w-full rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
      >
        Ver atualização
      </button>
    </div>
  );
}
