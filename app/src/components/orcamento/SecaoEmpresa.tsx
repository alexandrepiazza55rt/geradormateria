import { useRef } from "react";
import type { ConfigEmpresa } from "../../lib/orcamento/types";

// Limite generoso para LocalStorage (em bytes). 200KB = ~268KB depois do
// base64. Logos típicos cabem nisso (PNG 400x150).
const LIMITE_LOGO_BYTES = 200 * 1024;

const EMPRESA_VAZIA: ConfigEmpresa = {
  nome: "",
  cnpj: "",
  endereco: "",
  telefone: "",
  email: "",
  logo_data_url: null,
};

interface Props {
  value: ConfigEmpresa | undefined;
  onChange: (e: ConfigEmpresa) => void;
}

function formatar_cnpj_visual(s: string): string {
  const d = s.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function SecaoEmpresa({ value, onChange }: Props) {
  const empresa = value ?? EMPRESA_VAZIA;
  const file_ref = useRef<HTMLInputElement>(null);

  function set<K extends keyof ConfigEmpresa>(campo: K, novo: ConfigEmpresa[K]) {
    onChange({ ...empresa, [campo]: novo });
  }

  function handle_logo_change(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      window.alert("Selecione um arquivo de imagem (PNG, JPG, SVG).");
      return;
    }
    if (f.size > LIMITE_LOGO_BYTES) {
      window.alert(
        `Arquivo muito grande (${Math.round(f.size / 1024)}KB). ` +
        `O limite é ${Math.round(LIMITE_LOGO_BYTES / 1024)}KB — comprima o logo antes de subir.`,
      );
      // Limpa o input para permitir nova tentativa do mesmo arquivo
      if (file_ref.current) file_ref.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl) return;
      set("logo_data_url", dataUrl);
    };
    reader.readAsDataURL(f);
  }

  function handle_remover_logo() {
    set("logo_data_url", null);
    if (file_ref.current) file_ref.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Campo label="Nome / razão social">
          <input
            type="text"
            value={empresa.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="ex.: Construtora ACME Ltda."
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </Campo>

        <Campo label="CNPJ">
          <input
            type="text"
            value={formatar_cnpj_visual(empresa.cnpj)}
            onChange={(e) => set("cnpj", e.target.value.replace(/\D/g, "").slice(0, 14))}
            placeholder="00.000.000/0000-00"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </Campo>

        <Campo label="Endereço" wide>
          <input
            type="text"
            value={empresa.endereco}
            onChange={(e) => set("endereco", e.target.value)}
            placeholder="Rua, número, bairro, cidade/UF"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </Campo>

        <Campo label="Telefone">
          <input
            type="text"
            value={empresa.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            placeholder="(11) 90000-0000"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </Campo>

        <Campo label="E-mail">
          <input
            type="email"
            value={empresa.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contato@empresa.com.br"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </Campo>
      </div>

      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-start gap-3">
          {empresa.logo_data_url ? (
            <img
              src={empresa.logo_data_url}
              alt="Logo da empresa"
              className="max-h-20 max-w-[160px] rounded border border-slate-200 bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-20 w-40 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[11px] text-slate-400">
              sem logo
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs text-slate-600">
            <p>
              Logo da empresa (PNG, JPG ou SVG). Aparece no canto do PDF.
              Limite: <strong>{Math.round(LIMITE_LOGO_BYTES / 1024)}KB</strong>.
              Recomendado: imagem com fundo transparente, proporção 4:1 (ex.:
              400×100px).
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                ref={file_ref}
                type="file"
                accept="image/*"
                onChange={handle_logo_change}
                className="text-xs"
              />
              {empresa.logo_data_url && (
                <button
                  onClick={handle_remover_logo}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-700"
                >
                  ✕ Remover logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        ⓘ Esses dados aparecem no cabeçalho do PDF e do Excel exportados.
        Não alteram orçamentos já salvos (snapshot por orçamento).
      </p>
    </div>
  );
}

function Campo({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`text-xs ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
