import type { CategoriaPerda, ConfigPerda } from "../../lib/orcamento/types";

const LINHAS: { cat: CategoriaPerda; label: string; sub?: string }[] = [
  { cat: "cabo", label: "Cabo" },
  { cat: "fio_parafuso_conector", label: "Fio / parafuso / conector" },
  { cat: "cinta_isolador_mao_francesa", label: "Cinta / isolador / mão-francesa" },
  {
    cat: "equipamento_grande",
    label: "Equipamento grande",
    sub: "poste, cruzeta, trafo, chave, religador, regulador, pára-raios",
  },
  { cat: "outros", label: "Outros" },
];

interface Props {
  value: ConfigPerda;
  onChange: (v: ConfigPerda) => void;
}

export function SecaoPerda({ value, onChange }: Props) {
  const set_pct = (cat: CategoriaPerda, pct: number) => {
    onChange({
      ...value,
      default_por_categoria: {
        ...value.default_por_categoria,
        [cat]: pct,
      },
    });
  };

  const n_overrides = Object.keys(value.override_por_material).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        % aplicado sobre o subtotal de cada item da BOM, segundo a categoria do
        material (inferida automaticamente).
      </p>

      <div className="space-y-1.5">
        {LINHAS.map((l) => (
          <div
            key={l.cat}
            className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800">{l.label}</div>
              {l.sub && <div className="text-[10px] text-slate-500">{l.sub}</div>}
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={value.default_por_categoria[l.cat]}
                onChange={(e) => set_pct(l.cat, Number(e.target.value))}
                className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
              />
              <span className="text-xs text-slate-500">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded border border-sky-200 bg-sky-50 p-2 text-[11px] text-sky-800">
        <span className="font-medium">{n_overrides}</span>{" "}
        {n_overrides === 1 ? "material" : "materiais"} com perda específica
        cadastrada na aba <strong>Preços</strong> (coluna "Perda %"). Esses
        sobrescrevem a categoria.
      </div>
    </div>
  );
}
