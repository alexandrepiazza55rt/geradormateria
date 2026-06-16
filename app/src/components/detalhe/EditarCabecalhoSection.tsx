import type {
  Cliente,
  StatusOrcamento,
} from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";

const STATUS_OPCOES: { value: StatusOrcamento; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "expirado", label: "Expirado" },
];

export interface CabecalhoEditavel {
  cliente_id: string | null;
  numero: string;
  versao: number;
  status: StatusOrcamento;
  condicoes_pagamento: string;
  prazo_execucao: string;
  validade_orcamento: string;        // ISO YYYY-MM-DD
  observacoes: string;
  observacoes_imposto: string;
  meta_obra: string;
  meta_endereco: string;
  meta_municipio: string;
  meta_responsavel: string;
  mao_obra_override_centavos: number | null;
}

interface Props {
  valor: CabecalhoEditavel;
  clientes_ativos: Cliente[];
  onChangeCampo: <K extends keyof CabecalhoEditavel>(
    campo: K,
    valor_novo: CabecalhoEditavel[K],
    rotulo_humano?: string,
  ) => void;
  onNovoCliente: () => void;
}

export function EditarCabecalhoSection({
  valor,
  clientes_ativos,
  onChangeCampo,
  onNovoCliente,
}: Props) {
  const mo_reais = valor.mao_obra_override_centavos != null
    ? centavos_para_reais(valor.mao_obra_override_centavos)
    : "";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Cabeçalho</h3>

      {/* Cliente */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <label className="text-xs">
          <span className="text-slate-600">Cliente</span>
          <select
            value={valor.cliente_id ?? ""}
            onChange={(e) => {
              const novo = e.target.value || null;
              const c_antes = clientes_ativos.find((c) => c.id === valor.cliente_id);
              const c_depois = novo
                ? clientes_ativos.find((c) => c.id === novo)
                : null;
              onChangeCampo(
                "cliente_id",
                novo,
                `Cliente: ${c_antes?.nome ?? "(nenhum)"} → ${c_depois?.nome ?? "(nenhum)"}`,
              );
            }}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">(nenhum)</option>
            {clientes_ativos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onNovoCliente}
          className="self-end rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          + Novo cliente
        </button>
      </div>

      {/* Número, Versão, Status */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_140px]">
        <label className="text-xs">
          <span className="text-slate-600">Número</span>
          <input
            type="text"
            value={valor.numero}
            onChange={(e) =>
              onChangeCampo("numero", e.target.value, "Número")
            }
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Versão</span>
          <div
            title="A versão é controlada pelo sistema (criada ao salvar um orçamento já enviado)."
            className="mt-1 w-full cursor-not-allowed rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm tabular-nums text-slate-500"
          >
            v{valor.versao}
          </div>
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Status</span>
          <select
            value={valor.status}
            onChange={(e) =>
              onChangeCampo("status", e.target.value as StatusOrcamento, "Status")
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            {STATUS_OPCOES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Validade, Condições, Prazo */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-xs">
          <span className="text-slate-600">Validade do orçamento</span>
          <input
            type="date"
            value={valor.validade_orcamento}
            onChange={(e) =>
              onChangeCampo("validade_orcamento", e.target.value, "Validade")
            }
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Condições de pagamento</span>
          <input
            type="text"
            value={valor.condicoes_pagamento}
            onChange={(e) =>
              onChangeCampo("condicoes_pagamento", e.target.value, "Condições de pagamento")
            }
            placeholder="ex.: 30/60/90 dd"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-600">Prazo de execução</span>
          <input
            type="text"
            value={valor.prazo_execucao}
            onChange={(e) =>
              onChangeCampo("prazo_execucao", e.target.value, "Prazo de execução")
            }
            placeholder="ex.: 30 dias após autorização"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      {/* MO manual */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs">
          <span className="text-slate-600">
            Mão de obra manual (R$){" "}
            <span className="text-slate-400">opcional — sobrescreve o valor calculado</span>
          </span>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-slate-400">R$</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={mo_reais}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  onChangeCampo(
                    "mao_obra_override_centavos",
                    null,
                    "Mão de obra manual (limpa)",
                  );
                } else {
                  onChangeCampo(
                    "mao_obra_override_centavos",
                    reais_para_centavos(Number(v)),
                    "Mão de obra manual",
                  );
                }
              }}
              className="w-full rounded border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums"
              placeholder="(usar config)"
            />
          </div>
        </label>
      </div>

      {/* Meta da obra (separado do cliente) */}
      <fieldset className="mb-3 rounded border border-slate-200 p-3">
        <legend className="text-xs font-semibold text-slate-600">
          Dados da obra (separados do cliente)
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-slate-600">Obra / Identificação</span>
            <input
              type="text"
              value={valor.meta_obra}
              onChange={(e) =>
                onChangeCampo("meta_obra", e.target.value, "Obra")
              }
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-slate-600">Responsável</span>
            <input
              type="text"
              value={valor.meta_responsavel}
              onChange={(e) =>
                onChangeCampo("meta_responsavel", e.target.value, "Responsável")
              }
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-slate-600">Endereço</span>
            <input
              type="text"
              value={valor.meta_endereco}
              onChange={(e) =>
                onChangeCampo("meta_endereco", e.target.value, "Endereço")
              }
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-slate-600">Município</span>
            <input
              type="text"
              value={valor.meta_municipio}
              onChange={(e) =>
                onChangeCampo("meta_municipio", e.target.value, "Município")
              }
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </fieldset>

      {/* Observações */}
      <label className="mb-3 block text-xs">
        <span className="text-slate-600">Observações</span>
        <textarea
          value={valor.observacoes}
          onChange={(e) =>
            onChangeCampo("observacoes", e.target.value, "Observações")
          }
          rows={2}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>

      <label className="block text-xs">
        <span className="text-slate-600">Observações de imposto</span>
        <input
          type="text"
          value={valor.observacoes_imposto}
          onChange={(e) =>
            onChangeCampo("observacoes_imposto", e.target.value, "Observações de imposto")
          }
          placeholder='ex.: "ICMS-ST 18% por conta do cliente"'
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
    </div>
  );
}
