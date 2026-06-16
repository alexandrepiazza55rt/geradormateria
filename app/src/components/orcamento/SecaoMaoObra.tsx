import type { ConfigMaoDeObra } from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";

interface Props {
  value: ConfigMaoDeObra;
  onChange: (v: ConfigMaoDeObra) => void;
  tipos_obra_atual: string[];
}

export function SecaoMaoObra({ value, onChange, tipos_obra_atual }: Props) {
  const tabela = value.tabela ?? {};

  const set_pct = (pct: number) =>
    onChange({ ...value, tipo: "pct_material", pct });
  const set_tipo = (tipo: "tabela" | "pct_material") =>
    onChange({ ...value, tipo });
  const set_tabela_valor = (estrut: string, reais: number) => {
    const novo = { ...tabela, [estrut]: reais_para_centavos(reais) };
    if (reais <= 0) delete novo[estrut];
    onChange({ ...value, tabela: novo });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="mo_tipo"
            checked={value.tipo === "pct_material"}
            onChange={() => set_tipo("pct_material")}
          />
          % sobre material
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="mo_tipo"
            checked={value.tipo === "tabela"}
            onChange={() => set_tipo("tabela")}
          />
          Por estrutura (tabela)
        </label>
      </div>

      {value.tipo === "pct_material" ? (
        <div className="rounded border border-slate-200 bg-white p-3">
          <label className="flex items-center justify-between text-sm">
            <span className="text-slate-700">Percentual sobre subtotal material</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={500}
                step={0.1}
                value={value.pct ?? 0}
                onChange={(e) => set_pct(Number(e.target.value))}
                className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
              />
              <span className="text-xs text-slate-500">%</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="rounded border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs text-slate-600">
            Valores em R$ por unidade de estrutura. Tipos sem valor cadastrado
            entram como <strong>R$ 0,00</strong> e aparecem em aviso global.
          </p>
          {tipos_obra_atual.length === 0 ? (
            <p className="rounded bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
              Adicione estruturas na obra para preencher a tabela. Os tipos
              aparecem aqui automaticamente.
            </p>
          ) : (
            <div className="space-y-1.5">
              {tipos_obra_atual.map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between gap-3 rounded border border-slate-100 px-3 py-1.5"
                >
                  <span className="truncate text-sm text-slate-800" title={t}>
                    {t}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">R$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tabela[t] !== undefined ? centavos_para_reais(tabela[t]) : 0}
                      onChange={(e) => set_tabela_valor(t, Number(e.target.value))}
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
