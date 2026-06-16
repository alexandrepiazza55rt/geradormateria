interface Props {
  onVoltar: () => void;
  onExportarPdf: () => void;
  onExportarExcel: () => void;
  onSalvarNovaVersao: () => void;
  onEditar: () => void;
  onDuplicar: () => void;
  onReverter: () => void;
  pode_reverter: boolean;             // false se for v1 (sem anteriores)
}

export function DetalheAcoes({
  onVoltar,
  onExportarPdf,
  onExportarExcel,
  onSalvarNovaVersao,
  onEditar,
  onDuplicar,
  onReverter,
  pode_reverter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onVoltar}
        className="mr-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        ← Voltar para Consulta
      </button>

      <button
        onClick={onDuplicar}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        title="Cria uma cópia independente (novo número, volta a v1 rascunho)"
      >
        📋 Duplicar
      </button>

      {pode_reverter && (
        <button
          onClick={onReverter}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          title="Cria nova versão a partir de uma versão antiga deste orçamento"
        >
          ↺ Reverter
        </button>
      )}

      <button
        onClick={onSalvarNovaVersao}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        title="Cria nova versão com o mesmo conteúdo (clone)"
      >
        Salvar como nova versão
      </button>

      <button
        onClick={onEditar}
        className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        title="Editar itens, quantidades e preços (gera histórico)"
      >
        ✏ Editar
      </button>

      <button
        onClick={onExportarPdf}
        className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        📄 PDF
      </button>
      <button
        onClick={onExportarExcel}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        📊 Excel
      </button>
    </div>
  );
}
