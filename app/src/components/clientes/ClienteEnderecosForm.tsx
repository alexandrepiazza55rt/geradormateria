import type { ClienteEndereco } from "../../lib/orcamento/types";

function uuid_local(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `en_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  enderecos: ClienteEndereco[];
  onChange: (e: ClienteEndereco[]) => void;
}

export function ClienteEnderecosForm({ enderecos, onChange }: Props) {
  const set_field = (
    id: string,
    field: keyof ClienteEndereco,
    value: string,
  ) => {
    onChange(
      enderecos.map((e) =>
        e.id === id ? { ...e, [field]: value || undefined } : e,
      ),
    );
  };
  const set_logradouro = (id: string, value: string) => {
    // logradouro é obrigatório (string sempre) — sem undefined
    onChange(
      enderecos.map((e) => (e.id === id ? { ...e, logradouro: value } : e)),
    );
  };

  const adicionar = () => {
    onChange([...enderecos, { id: uuid_local(), logradouro: "" }]);
  };
  const remover = (id: string) => {
    onChange(enderecos.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">
        Adicione quantos endereços quiser (sede, obra, faturamento…).
        Endereço sem logradouro é descartado ao salvar.
      </p>
      {enderecos.length === 0 && (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-center text-xs text-slate-400">
          Nenhum endereço. Use o botão abaixo se quiser adicionar.
        </div>
      )}
      {enderecos.map((e) => (
        <div
          key={e.id}
          className="space-y-2 rounded border border-slate-200 bg-white p-3"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input
              type="text"
              placeholder='Rótulo (ex.: "Sede")'
              value={e.rotulo ?? ""}
              onChange={(ev) => set_field(e.id, "rotulo", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Logradouro (obrigatório)"
              value={e.logradouro}
              onChange={(ev) => set_logradouro(e.id, ev.target.value)}
              className={`rounded border px-2 py-1.5 text-sm ${
                e.logradouro.trim() ? "border-slate-300" : "border-amber-300 bg-amber-50"
              }`}
            />
            <button
              type="button"
              onClick={() => remover(e.id)}
              className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
              title="Remover endereço"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input
              type="text"
              placeholder="Número"
              value={e.numero ?? ""}
              onChange={(ev) => set_field(e.id, "numero", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="Complemento"
              value={e.complemento ?? ""}
              onChange={(ev) => set_field(e.id, "complemento", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Bairro"
              value={e.bairro ?? ""}
              onChange={(ev) => set_field(e.id, "bairro", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="CEP"
              value={e.cep ?? ""}
              onChange={(ev) => set_field(e.id, "cep", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr]">
            <input
              type="text"
              placeholder="Município"
              value={e.municipio ?? ""}
              onChange={(ev) => set_field(e.id, "municipio", ev.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={e.uf ?? ""}
              onChange={(ev) => set_field(e.id, "uf", ev.target.value.toUpperCase())}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm uppercase"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={adicionar}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        + Adicionar endereço
      </button>
    </div>
  );
}
