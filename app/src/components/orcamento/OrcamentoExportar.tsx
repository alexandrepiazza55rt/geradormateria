interface Props {
  obra_vazia: boolean;
  onExportar: (formato: "pdf" | "excel") => void;
}

export function OrcamentoExportar({ obra_vazia, onExportar }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        onClick={() => onExportar("pdf")}
        disabled={obra_vazia}
        className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Exportar PDF
      </button>
      <button
        onClick={() => onExportar("excel")}
        disabled={obra_vazia}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Exportar Excel
      </button>
    </div>
  );
}
