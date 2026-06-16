import type { ClienteContato } from "../../lib/orcamento/types";

function uuid_local(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  contatos: ClienteContato[];
  onChange: (c: ClienteContato[]) => void;
}

export function ClienteContatosForm({ contatos, onChange }: Props) {
  const set_field = (id: string, field: keyof ClienteContato, value: string) => {
    onChange(
      contatos.map((c) =>
        c.id === id ? { ...c, [field]: value || undefined } : c,
      ),
    );
  };

  const adicionar = () => {
    onChange([...contatos, { id: uuid_local() }]);
  };

  const remover = (id: string) => {
    onChange(contatos.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500">
        Adicione quantos contatos quiser (comercial, técnico, financeiro…).
        Contato em branco é descartado ao salvar.
      </p>
      {contatos.length === 0 && (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-center text-xs text-slate-400">
          Nenhum contato. Use o botão abaixo se quiser adicionar.
        </div>
      )}
      {contatos.map((c) => (
        <div
          key={c.id}
          className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <input
            type="text"
            placeholder="Nome"
            value={c.nome ?? ""}
            onChange={(e) => set_field(c.id, "nome", e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="Função (ex.: Comercial)"
            value={c.funcao ?? ""}
            onChange={(e) => set_field(c.id, "funcao", e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={c.email ?? ""}
            onChange={(e) => set_field(c.id, "email", e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={c.telefone ?? ""}
            onChange={(e) => set_field(c.id, "telefone", e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => remover(c.id)}
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
            title="Remover contato"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={adicionar}
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        + Adicionar contato
      </button>
    </div>
  );
}
