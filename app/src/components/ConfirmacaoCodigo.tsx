import { useMemo, useState } from "react";

type Props = {
  titulo: string;
  mensagem: React.ReactNode;
  /** Texto do botão de confirmação (default: "Confirmar"). */
  rotulo_confirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

function gerar_codigo(): string {
  // 6 dígitos, sempre com zeros à esquerda (100000–999999 → 000000–999999).
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

/**
 * Modal de confirmação para ações destrutivas. Mostra um código de 6 dígitos
 * que NÃO pode ser copiado (sem seleção, sem copiar, sem menu de contexto) e
 * exige que o usuário o digite manualmente — evita confirmações por reflexo
 * e cópia/colagem automática.
 */
export function ConfirmacaoCodigo({
  titulo,
  mensagem,
  rotulo_confirmar = "Confirmar",
  onConfirmar,
  onCancelar,
}: Props) {
  const codigo = useMemo(() => gerar_codigo(), []);
  const [digitado, set_digitado] = useState("");

  const confere = digitado === codigo;

  function bloquear(e: React.SyntheticEvent) {
    e.preventDefault();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
        <div className="mt-2 text-sm text-slate-600">{mensagem}</div>

        <p className="mt-4 text-xs font-medium text-slate-500">
          Para confirmar, digite o código abaixo:
        </p>

        {/* Código não copiável */}
        <div
          className="mt-1 select-none rounded-md border border-slate-300 bg-slate-50 py-2 text-center font-mono text-2xl font-bold tracking-[0.5em] text-slate-800"
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          onCopy={bloquear}
          onCut={bloquear}
          onContextMenu={bloquear}
          onDragStart={bloquear}
          aria-hidden="true"
        >
          {codigo}
        </div>

        <input
          type="text"
          inputMode="numeric"
          autoFocus
          maxLength={6}
          value={digitado}
          onChange={(e) => set_digitado(e.target.value.replace(/\D/g, ""))}
          onPaste={bloquear}
          placeholder="Digite o código"
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancelar}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => confere && onConfirmar()}
            disabled={!confere}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {rotulo_confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
