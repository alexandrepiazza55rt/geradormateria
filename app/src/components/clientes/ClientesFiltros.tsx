interface Props {
  busca: string;
  incluir_excluidos: boolean;
  onChangeBusca: (s: string) => void;
  onChangeIncluirExcluidos: (b: boolean) => void;
  onNovo: () => void;
}

export function ClientesFiltros({
  busca,
  incluir_excluidos,
  onChangeBusca,
  onChangeIncluirExcluidos,
  onNovo,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={busca}
        onChange={(e) => onChangeBusca(e.target.value)}
        placeholder="🔎 Buscar por nome ou CPF/CNPJ..."
        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
      <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={incluir_excluidos}
          onChange={(e) => onChangeIncluirExcluidos(e.target.checked)}
        />
        Incluir excluídos
      </label>
      <button
        onClick={onNovo}
        className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        + Novo cliente
      </button>
    </div>
  );
}
