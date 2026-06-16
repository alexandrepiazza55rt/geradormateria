import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { ConfigOrcamento } from "../../lib/orcamento/types";
import { PERDA_DEFAULT } from "../../lib/orcamento/defaults";
import { calcular_estruturas_da_obra } from "../../lib/orcamento/helpers";
import { SecaoPerda } from "./SecaoPerda";
import { SecaoMaoObra } from "./SecaoMaoObra";
import { SecaoFrete } from "./SecaoFrete";
import { SecaoMargem } from "./SecaoMargem";
import { SecaoValidades } from "./SecaoValidades";

type Aba = "perda" | "mao_obra" | "frete" | "margem" | "validades";

const DEFAULTS: ConfigOrcamento = {
  perda: {
    default_por_categoria: { ...PERDA_DEFAULT },
    override_por_material: {},
  },
  mao_obra: { tipo: "pct_material", pct: 0 },
  frete_centavos: 0,
  margem: { tipo: "markup", pct: 0 },
  validade_preco_dias: 60,
  validade_orcamento_dias: 30,
};

function deep_clone(c: ConfigOrcamento): ConfigOrcamento {
  return JSON.parse(JSON.stringify(c));
}

function eh_igual(a: ConfigOrcamento, b: ConfigOrcamento): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface Props {
  onFechar: () => void;
}

export function ConfigOrcamentoModal({ onFechar }: Props) {
  const config_atual = useStore((s) => s.configOrcamento);
  const setConfig = useStore((s) => s.setConfigOrcamento);
  const itens = useStore((s) => s.itens);
  const estruturas = useStore((s) => s.estruturas);

  const tipos_obra_atual = useMemo(
    () =>
      calcular_estruturas_da_obra(itens, estruturas)
        .map((e) => e.tipo)
        .sort(),
    [itens, estruturas],
  );

  const [draft, setDraft] = useState<ConfigOrcamento>(deep_clone(config_atual));
  const [aba, setAba] = useState<Aba>("perda");

  const erro_margem =
    draft.margem.pct < 0 ||
    (draft.margem.tipo === "margem" && draft.margem.pct >= 100);
  const erro_validade =
    draft.validade_preco_dias < 0 || draft.validade_orcamento_dias < 0;
  const tem_erros = erro_margem || erro_validade;
  const tem_mudanca = !eh_igual(config_atual, draft);

  function handle_salvar() {
    if (tem_erros) return;
    setConfig(draft);
    onFechar();
  }

  function handle_restaurar() {
    const n_overrides = Object.keys(config_atual.perda.override_por_material).length;
    const msg = n_overrides > 0
      ? `Restaurar todos os defaults? Isso vai zerar também ${n_overrides} override(s) de perda por material da aba Preços. Não pode ser desfeito.`
      : "Restaurar todos os defaults?";
    if (!window.confirm(msg)) return;
    setDraft(deep_clone(DEFAULTS));
  }

  const tabs: { key: Aba; label: string }[] = [
    { key: "perda", label: "Perda" },
    { key: "mao_obra", label: "Mão de obra" },
    { key: "frete", label: "Frete" },
    { key: "margem", label: "Margem" },
    { key: "validades", label: "Validades" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-900">
            Configurar orçamento
          </h2>
          <button
            onClick={onFechar}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setAba(t.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                aba === t.key
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {aba === "perda" && (
            <SecaoPerda
              value={draft.perda}
              onChange={(perda) => setDraft({ ...draft, perda })}
            />
          )}
          {aba === "mao_obra" && (
            <SecaoMaoObra
              value={draft.mao_obra}
              onChange={(mao_obra) => setDraft({ ...draft, mao_obra })}
              tipos_obra_atual={tipos_obra_atual}
            />
          )}
          {aba === "frete" && (
            <SecaoFrete
              value={draft.frete_centavos}
              onChange={(frete_centavos) =>
                setDraft({ ...draft, frete_centavos })
              }
            />
          )}
          {aba === "margem" && (
            <SecaoMargem
              value={draft.margem}
              onChange={(margem) => setDraft({ ...draft, margem })}
            />
          )}
          {aba === "validades" && (
            <SecaoValidades
              validade_preco_dias={draft.validade_preco_dias}
              validade_orcamento_dias={draft.validade_orcamento_dias}
              onChange={(p, o) =>
                setDraft({
                  ...draft,
                  validade_preco_dias: p,
                  validade_orcamento_dias: o,
                })
              }
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
          <button
            onClick={handle_restaurar}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            Restaurar padrões
          </button>
          <div className="flex gap-2">
            <button
              onClick={onFechar}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handle_salvar}
              disabled={tem_erros || !tem_mudanca}
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
