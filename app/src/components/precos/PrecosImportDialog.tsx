import { useState } from "react";
import type { ResultadoAnalise } from "../../lib/orcamento/importacao";
import { useStore } from "../../store";

interface Props {
  resultado: ResultadoAnalise;
  nome_arquivo: string;
  onFechar: () => void;
}

export function PrecosImportDialog({ resultado, nome_arquivo, onFechar }: Props) {
  const aplicar = useStore((s) => s.aplicarLoteImportacao);
  const [mostrar_erros, set_mostrar_erros] = useState(false);
  const [mostrar_avisos, set_mostrar_avisos] = useState(false);
  const [aplicando, set_aplicando] = useState(false);
  const [resultado_aplicacao, set_resultado_aplicacao] = useState<
    { criados: number; atualizados: number; removidos: number } | null
  >(null);

  const { resumo, avisos, operacoes, total_linhas } = resultado;
  const aplicaveis = resumo.criar + resumo.atualizar + resumo.remover;
  const erros = operacoes.filter((o) => o.tipo === "erro");
  const inicial_invalida = total_linhas === 0 && avisos.length > 0;

  function handleAplicar() {
    set_aplicando(true);
    const r = aplicar(operacoes);
    set_resultado_aplicacao(r);
    set_aplicando(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Importar preços</h2>
            <p className="mt-0.5 text-xs text-slate-500">{nome_arquivo}</p>
          </div>
          <button
            onClick={onFechar}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {inicial_invalida && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {avisos.map((a, i) => (
                <p key={i}>{a}</p>
              ))}
            </div>
          )}

          {!inicial_invalida && (
            <>
              {resultado_aplicacao ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="font-semibold">Importação concluída.</div>
                  <ul className="mt-2 space-y-0.5">
                    {resultado_aplicacao.criados > 0 && (
                      <li>✓ {resultado_aplicacao.criados} criado(s)</li>
                    )}
                    {resultado_aplicacao.atualizados > 0 && (
                      <li>✏ {resultado_aplicacao.atualizados} atualizado(s)</li>
                    )}
                    {resultado_aplicacao.removidos > 0 && (
                      <li>✕ {resultado_aplicacao.removidos} removido(s)</li>
                    )}
                  </ul>
                </div>
              ) : (
                <>
                  <div className="text-sm text-slate-600">
                    {total_linhas} linha(s) analisada(s).
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <Cartao label="Criar" valor={resumo.criar} cor="emerald" />
                    <Cartao label="Atualizar" valor={resumo.atualizar} cor="sky" />
                    <Cartao label="Sem mudança" valor={resumo.ignorar} cor="slate" />
                    <Cartao label="Remover" valor={resumo.remover} cor="amber" />
                    <Cartao label="Erro" valor={resumo.erro} cor="red" />
                  </div>

                  {erros.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => set_mostrar_erros((v) => !v)}
                        className="text-xs font-medium text-red-700 hover:underline"
                      >
                        {mostrar_erros ? "Ocultar" : "Mostrar"} {erros.length} erro(s) ▾
                      </button>
                      {mostrar_erros && (
                        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 text-[11px] text-red-900">
                          {erros.map((o, i) => (
                            <li key={i}>
                              <span className="font-medium">Linha {o.linha_csv}:</span>{" "}
                              {o.erro}
                              {o.descricao_catalogo && (
                                <span className="text-red-700"> ({o.descricao_catalogo})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {avisos.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => set_mostrar_avisos((v) => !v)}
                        className="text-xs font-medium text-amber-700 hover:underline"
                      >
                        {mostrar_avisos ? "Ocultar" : "Mostrar"} {avisos.length} aviso(s) ▾
                      </button>
                      {mostrar_avisos && (
                        <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                          {avisos.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          {resultado_aplicacao ? (
            <button
              onClick={onFechar}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Fechar
            </button>
          ) : (
            <>
              <button
                onClick={onFechar}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAplicar}
                disabled={aplicaveis === 0 || aplicando || inicial_invalida}
                className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {aplicando ? "Aplicando..." : `Aplicar (${aplicaveis})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Cartao({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: number;
  cor: "emerald" | "sky" | "slate" | "amber" | "red";
}) {
  const cores: Record<typeof cor, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-md border px-2 py-2 text-center ${cores[cor]}`}>
      <div className="text-lg font-bold tabular-nums">{valor}</div>
      <div className="text-[10px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
