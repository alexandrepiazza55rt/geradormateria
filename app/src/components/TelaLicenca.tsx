import { useState } from "react";
import { ativarLicenca, limparLicenca, type StatusLicenca } from "../lib/license/activation";

const MENSAGENS: Record<string, { titulo: string; texto: string }> = {
  outra_maquina: { titulo: "Licença de outro computador", texto: "Esta licença já está vinculada a outra máquina. Use outra chave ou peça um reset de vínculo no suporte." },
  expirada: { titulo: "Licença expirada", texto: "Sua licença expirou. Renove para continuar usando." },
  revogada: { titulo: "Licença desativada", texto: "Esta licença foi desativada. Fale com o suporte." },
  carencia: { titulo: "Conecte-se à internet", texto: "Faz mais de 15 dias sem validar a licença. Conecte-se à internet uma vez para continuar." },
  relogio: { titulo: "Relógio do sistema", texto: "O relógio do computador parece incorreto. Ajuste a data/hora e tente novamente." },
  invalido: { titulo: "Licença inválida", texto: "A licença armazenada não pôde ser verificada. Insira sua chave novamente." },
};

export function TelaLicenca({ status, onResolvido }: { status: StatusLicenca; onResolvido: () => void }) {
  const precisaChave = status.motivo === "nao_ativado" || status.motivo === "invalido";
  const [modoChave, setModoChave] = useState(precisaChave);
  const [chave, setChave] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ativando, setAtivando] = useState(false);

  async function ativar() {
    setAtivando(true);
    setErro(null);
    const r = await ativarLicenca(chave);
    setAtivando(false);
    if (r.ok) onResolvido();
    else setErro(r.erro ?? "Falha na ativação.");
  }

  const msg = status.motivo ? MENSAGENS[status.motivo] : undefined;

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-600 font-bold text-white">RM</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Relação de Materiais</div>
            <div className="text-xs text-slate-500">Ativação da licença</div>
          </div>
        </div>

        {!modoChave && msg ? (
          <>
            <h1 className="text-lg font-bold text-slate-900">{msg.titulo}</h1>
            <p className="mt-1 text-sm text-slate-600">{msg.texto}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={onResolvido} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                Tentar novamente
              </button>
              <button
                onClick={() => { limparLicenca(); setModoChave(true); }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Inserir outra chave
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-slate-900">Ative o programa</h1>
            <p className="mt-1 text-sm text-slate-600">Digite a chave de licença que você recebeu.</p>
            <input
              value={chave}
              onChange={(e) => setChave(e.target.value.toUpperCase())}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-center font-mono tracking-wider outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              onKeyDown={(e) => { if (e.key === "Enter" && chave.trim()) ativar(); }}
            />
            {erro && <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{erro}</div>}
            <button
              onClick={ativar}
              disabled={ativando || chave.trim().length < 4}
              className="mt-3 w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {ativando ? "Ativando…" : "Ativar"}
            </button>
            {msg && (
              <button onClick={() => setModoChave(false)} className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-700">
                ← voltar
              </button>
            )}
          </>
        )}

        <p className="mt-5 border-t border-slate-100 pt-3 text-center text-[11px] text-slate-400">
          Seus dados (clientes, orçamentos, preços) ficam salvos no computador e não são afetados pela licença.
        </p>
      </div>
    </div>
  );
}
