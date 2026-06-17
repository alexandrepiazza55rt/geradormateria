import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { ConfigOrcamento, EntradaHistoricoConfig } from "../../lib/orcamento/types";
import { PERDA_DEFAULT } from "../../lib/orcamento/defaults";
import { SecaoPerda } from "./SecaoPerda";
import { SecaoMaoObra } from "./SecaoMaoObra";
import { SecaoFrete } from "./SecaoFrete";
import { SecaoMargem } from "./SecaoMargem";
import { SecaoValidades } from "./SecaoValidades";
import { SecaoImposto } from "./SecaoImposto";
import { SecaoEmpresa } from "./SecaoEmpresa";
import { SecaoImportExport } from "./SecaoImportExport";
import { SecaoAtualizacao } from "./SecaoAtualizacao";
import { SecaoBackup } from "./SecaoBackup";
import { ConfirmacaoCodigo } from "../ConfirmacaoCodigo";

type Aba =
  | "precificacao"
  | "empresa"
  | "validades"
  | "precos_dados"
  | "atualizacao"
  | "backup"
  | "historico";

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
  imposto_estimado_pct: 0,
  empresa: {
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    logo_data_url: null,
  },
};

function deep_clone(c: ConfigOrcamento): ConfigOrcamento {
  return JSON.parse(JSON.stringify(c));
}

function eh_igual(a: ConfigOrcamento, b: ConfigOrcamento): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function fmt_quando(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function ConfiguracoesView() {
  const config_atual = useStore((s) => s.configOrcamento);
  const setConfig = useStore((s) => s.setConfigOrcamento);
  const configHistorico = useStore((s) => s.configHistorico);
  const limparConfigHistorico = useStore((s) => s.limparConfigHistorico);
  const estruturas = useStore((s) => s.estruturas);

  // Tipos disponíveis para a tabela de MO: união das chaves já cadastradas
  // com todos os tipos do catálogo de estruturas. Assim o engenheiro pode
  // editar a tabela GLOBAL sem precisar abrir uma obra primeiro.
  const tipos_para_tabela_mo = useMemo(() => {
    const set = new Set<string>();
    for (const e of estruturas.values()) set.add(e.tipo);
    if (config_atual.mao_obra.tabela) {
      for (const k of Object.keys(config_atual.mao_obra.tabela)) set.add(k);
    }
    return [...set].sort();
  }, [estruturas, config_atual.mao_obra.tabela]);

  const [draft, setDraft] = useState<ConfigOrcamento>(deep_clone(config_atual));
  const [aba, setAba] = useState<Aba>(() => {
    // Atalho: o popup de atualização pede para abrir direto nesta aba.
    try {
      const hint = sessionStorage.getItem("config_aba");
      if (hint) {
        sessionStorage.removeItem("config_aba");
        return hint as Aba;
      }
    } catch {
      /* ignore */
    }
    return "precificacao";
  });
  const [confirmando_restaurar, set_confirmando_restaurar] = useState(false);
  const [confirmando_limpar_log, set_confirmando_limpar_log] = useState(false);

  // Resync com config externa (cross-tab) — pattern compare-with-key
  const config_key = JSON.stringify(config_atual);
  const [last_key, set_last_key] = useState(config_key);
  if (last_key !== config_key) {
    set_last_key(config_key);
    setDraft(deep_clone(config_atual));
  }

  const erro_margem =
    draft.margem.pct < 0 ||
    (draft.margem.tipo === "margem" && draft.margem.pct >= 100);
  const erro_validade =
    draft.validade_preco_dias < 0 || draft.validade_orcamento_dias < 0;
  const erro_imposto =
    draft.imposto_estimado_pct != null &&
    (draft.imposto_estimado_pct < 0 || draft.imposto_estimado_pct > 100);
  const tem_erros = erro_margem || erro_validade || erro_imposto;
  const tem_mudanca = !eh_igual(config_atual, draft);

  function handle_salvar() {
    if (tem_erros) return;
    setConfig(draft);
    window.alert("Configurações salvas. Mudanças só valem para os próximos orçamentos — os antigos mantêm os valores com que foram gerados.");
  }

  function handle_descartar() {
    if (!tem_mudanca) return;
    if (!window.confirm("Descartar mudanças não salvas?")) return;
    setDraft(deep_clone(config_atual));
  }

  const n_overrides_perda = Object.keys(
    config_atual.perda.override_por_material,
  ).length;

  const tabs: { key: Aba; label: string }[] = [
    { key: "precificacao", label: "Precificação" },
    { key: "empresa", label: "Empresa" },
    { key: "validades", label: "Validades" },
    { key: "precos_dados", label: "Preços (dados)" },
    { key: "atualizacao", label: "Atualização" },
    { key: "backup", label: "Backup" },
    { key: "historico", label: `Histórico (${configHistorico.length})` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-1 text-sm text-slate-600">
          Parâmetros globais usados pelo gerador de orçamentos. As mudanças
          aqui <strong>valem apenas para os próximos orçamentos</strong> — os
          antigos mantêm os valores com que foram gerados (snapshot por
          orçamento).
        </p>
      </div>

      {tem_mudanca && (
        <div className="sticky top-[64px] z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2 shadow-sm">
          <div className="text-sm text-amber-900">
            <span className="font-semibold">Mudanças não salvas</span>
            <span className="ml-2 text-xs text-amber-700">
              · nada foi gravado ainda
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handle_descartar}
              className="rounded border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
            >
              ✕ Descartar
            </button>
            <button
              onClick={handle_salvar}
              disabled={tem_erros}
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              💾 Salvar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setAba(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                aba === t.key
                  ? "bg-sky-600 text-white"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {aba === "precificacao" && (
            <div className="divide-y divide-slate-200">
              <section className="pb-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">Margem</h2>
                <SecaoMargem
                  value={draft.margem}
                  onChange={(margem) => setDraft({ ...draft, margem })}
                />
              </section>
              <section className="py-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">Perda</h2>
                <SecaoPerda
                  value={draft.perda}
                  onChange={(perda) => setDraft({ ...draft, perda })}
                />
              </section>
              <section className="py-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">Mão de obra</h2>
                <SecaoMaoObra
                  value={draft.mao_obra}
                  onChange={(mao_obra) => setDraft({ ...draft, mao_obra })}
                  tipos_obra_atual={tipos_para_tabela_mo}
                />
              </section>
              <section className="py-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">Frete</h2>
                <SecaoFrete
                  value={draft.frete_centavos}
                  onChange={(frete_centavos) =>
                    setDraft({ ...draft, frete_centavos })
                  }
                />
              </section>
              <section className="pt-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">Imposto</h2>
                <SecaoImposto
                  value={draft.imposto_estimado_pct ?? 0}
                  onChange={(imposto_estimado_pct) =>
                    setDraft({ ...draft, imposto_estimado_pct })
                  }
                />
              </section>
            </div>
          )}
          {aba === "empresa" && (
            <SecaoEmpresa
              value={draft.empresa}
              onChange={(empresa) => setDraft({ ...draft, empresa })}
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
          {aba === "precos_dados" && <SecaoImportExport />}
          {aba === "atualizacao" && <SecaoAtualizacao />}
          {aba === "backup" && <SecaoBackup />}
          {aba === "historico" && (
            <HistoricoConfig
              entradas={configHistorico}
              onLimpar={() => set_confirmando_limpar_log(true)}
            />
          )}
        </div>

        {aba !== "precos_dados" && aba !== "historico" && aba !== "atualizacao" && aba !== "backup" && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            onClick={() => set_confirmando_restaurar(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            Restaurar padrões
          </button>
          <div className="flex gap-2">
            <button
              onClick={handle_descartar}
              disabled={!tem_mudanca}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              onClick={handle_salvar}
              disabled={tem_erros || !tem_mudanca}
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Salvar configurações
            </button>
          </div>
        </div>
        )}
      </div>

      {confirmando_restaurar && (
        <ConfirmacaoCodigo
          titulo="Restaurar padrões"
          mensagem={
            n_overrides_perda > 0 ? (
              <>
                Isso vai restaurar todos os defaults e zerar também{" "}
                <span className="font-semibold">
                  {n_overrides_perda} override(s)
                </span>{" "}
                de perda por material da aba Preços. Esta ação é{" "}
                <strong>definitiva</strong>.
              </>
            ) : (
              <>
                Restaurar todos os defaults? Esta ação é{" "}
                <strong>definitiva</strong>.
              </>
            )
          }
          rotulo_confirmar="Restaurar padrões"
          onCancelar={() => set_confirmando_restaurar(false)}
          onConfirmar={() => {
            setDraft(deep_clone(DEFAULTS));
            set_confirmando_restaurar(false);
          }}
        />
      )}

      {confirmando_limpar_log && (
        <ConfirmacaoCodigo
          titulo="Limpar log de configurações"
          mensagem={
            <>
              Você vai apagar <strong>TODO</strong> o log de mudanças de
              configuração ({configHistorico.length} entrada(s)). Esta ação é{" "}
              <strong>definitiva</strong>.
            </>
          }
          rotulo_confirmar="Limpar log"
          onCancelar={() => set_confirmando_limpar_log(false)}
          onConfirmar={() => {
            limparConfigHistorico();
            set_confirmando_limpar_log(false);
          }}
        />
      )}
    </div>
  );
}

function HistoricoConfig({
  entradas,
  onLimpar,
}: {
  entradas: EntradaHistoricoConfig[];
  onLimpar: () => void;
}) {
  const ordenado = [...entradas].sort((a, b) => b.quando.localeCompare(a.quando));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600">
          Registro de todas as mudanças feitas nas configurações
          ({entradas.length} entrada(s)). Append-only.
        </p>
        {entradas.length > 0 && (
          <button
            onClick={onLimpar}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
          >
            🗑 Limpar log
          </button>
        )}
      </div>
      {ordenado.length === 0 ? (
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
          Nenhuma alteração registrada. Quando você salvar mudanças nas abas
          acima, elas aparecerão aqui.
        </div>
      ) : (
        <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 bg-white">
          {ordenado.map((e) => (
            <li key={e.id} className="px-3 py-2 text-xs">
              <div className="font-mono text-[10px] text-slate-400">
                {fmt_quando(e.quando)}
              </div>
              <div className="text-slate-800">
                <span className="font-semibold">{e.rotulo}</span>:{" "}
                <span className="text-slate-500">{e.valor_antes || "—"}</span>{" "}
                → <span className="font-medium text-slate-900">{e.valor_depois || "—"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
