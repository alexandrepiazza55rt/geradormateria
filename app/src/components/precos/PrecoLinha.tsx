import { useState } from "react";
import type { MaterialComStatusPreco } from "../../lib/orcamento/precos";
import type { PrecoMaterial } from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";

const UNIDADES = ["pç", "m", "kg", "und"];

function fmt_reais(centavos: number): string {
  return centavos_para_reais(centavos)
    .toFixed(2)
    .replace(".", ",");
}

function parse_reais(str: string): number | null {
  const limpo = str.trim().replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const n = parseFloat(limpo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

interface Props {
  item: MaterialComStatusPreco;
  // `undefined` = sem rascunho local (mostra o preço salvo).
  // `null` = rascunho diz "limpar override".
  // `PrecoMaterial` = rascunho de novo valor.
  rascunho_preco: PrecoMaterial | null | undefined;
  rascunho_perda: number | null | undefined;
  onChangeRascunhoPreco: (material_id: number, novo: PrecoMaterial | null) => void;
  onChangeRascunhoPerda: (material_id: number, novo: number | null) => void;
  // Override salvo de perda (do configOrcamento) — para mostrar quando não há rascunho
  perda_override_salvo: number | undefined;
}

export function PrecoLinha({
  item,
  rascunho_preco,
  rascunho_perda,
  onChangeRascunhoPreco,
  onChangeRascunhoPerda,
  perda_override_salvo,
}: Props) {
  const { material, preco_resolvido } = item;
  const preco_salvo = preco_resolvido.preco;

  // Preço "efetivo" do que a linha exibe: rascunho ganha quando existe (incl. null).
  const preco_visivel =
    rascunho_preco === undefined ? preco_salvo : rascunho_preco;
  const perda_visivel =
    rascunho_perda === undefined ? (perda_override_salvo ?? null) : rascunho_perda;
  const tem_rascunho = rascunho_preco !== undefined || rascunho_perda !== undefined;

  // Estado controlado dos inputs (strings em digitação)
  const [valor_str, set_valor_str] = useState<string>(
    preco_visivel ? fmt_reais(preco_visivel.valor_centavos) : "",
  );
  const [unidade_preco, set_unidade_preco] = useState<string>(
    preco_visivel?.unidade_preco ?? material.unidade,
  );
  const [fator_str, set_fator_str] = useState<string>(
    preco_visivel?.fator_conversao != null
      ? String(preco_visivel.fator_conversao).replace(".", ",")
      : "",
  );
  const [perda_str, set_perda_str] = useState<string>(
    perda_visivel != null ? String(perda_visivel).replace(".", ",") : "",
  );

  // Resync com fonte externa: muda quando o pai troca de rascunho (descarte
  // ou save) ou quando o preço salvo muda (cross-tab).
  const sync_key = JSON.stringify({
    pr: rascunho_preco === undefined ? `s:${preco_salvo?.atualizado_em ?? ""}` : `r:${JSON.stringify(rascunho_preco)}`,
    pe: rascunho_perda === undefined ? `s:${perda_override_salvo ?? ""}` : `r:${rascunho_perda}`,
  });
  const [last_sync, set_last_sync] = useState(sync_key);
  if (last_sync !== sync_key) {
    set_last_sync(sync_key);
    set_valor_str(preco_visivel ? fmt_reais(preco_visivel.valor_centavos) : "");
    set_unidade_preco(preco_visivel?.unidade_preco ?? material.unidade);
    set_fator_str(
      preco_visivel?.fator_conversao != null
        ? String(preco_visivel.fator_conversao).replace(".", ",")
        : "",
    );
    set_perda_str(perda_visivel != null ? String(perda_visivel).replace(".", ",") : "");
  }

  const precisa_fator = unidade_preco !== material.unidade;
  const fator_invalido =
    precisa_fator && (fator_str.trim() === "" ||
      !Number.isFinite(parseFloat(fator_str.replace(",", "."))));

  // Monta o PrecoMaterial completo a partir do estado atual dos campos.
  function montar_preco_atual(valor_reais: number): PrecoMaterial {
    const fator_num = precisa_fator
      ? parseFloat(fator_str.replace(",", "."))
      : NaN;
    return {
      material_id: material.id,
      valor_centavos: reais_para_centavos(valor_reais),
      unidade_preco,
      fator_conversao: precisa_fator && Number.isFinite(fator_num) ? fator_num : null,
      validade: preco_salvo?.validade ?? null,
      fornecedor: preco_salvo?.fornecedor ?? null,
      origem: "meu",
      atualizado_em: new Date().toISOString(),
      categoria_perda_override: preco_salvo?.categoria_perda_override ?? null,
    };
  }

  function commit_preco() {
    const v = parse_reais(valor_str);
    if (v == null) {
      // Vazio = remover override (somente faz sentido sinalizar se já existia)
      if (preco_salvo) {
        onChangeRascunhoPreco(material.id, null);
      } else {
        // Não tinha nada salvo e ficou vazio → cancela qualquer rascunho desta linha
        if (rascunho_preco !== undefined) {
          onChangeRascunhoPreco(material.id, null);
        }
      }
      return;
    }
    onChangeRascunhoPreco(material.id, montar_preco_atual(v));
  }

  function commit_perda() {
    const v = parse_reais(perda_str);
    if (v == null) {
      if (perda_override_salvo != null) {
        onChangeRascunhoPerda(material.id, null);
      } else if (rascunho_perda !== undefined) {
        onChangeRascunhoPerda(material.id, null);
      }
      return;
    }
    if (v < 0 || v > 100) {
      // fora da faixa: ignorar
      return;
    }
    onChangeRascunhoPerda(material.id, v);
  }

  const origem_badge =
    preco_resolvido.origem_efetiva === "meu" ? (
      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800" title="Preço sobrescrito por você">
        🅼 meu
      </span>
    ) : preco_resolvido.origem_efetiva === "oficial" ? (
      <span className="inline-flex items-center gap-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800" title="Preço oficial. Edite para criar seu override.">
        🅞 oficial
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500" title="Sem preço cadastrado">
        — sem
      </span>
    );

  const rascunho_badge = tem_rascunho ? (
    <span className="inline-flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900" title="Alteração ainda não salva — clique em 'Salvar todos' no topo">
      ✱ pendente
    </span>
  ) : null;

  // Anel amarelo se tem rascunho.
  const linha_cls = [
    "grid grid-cols-1 gap-2 border-b border-slate-100 p-3 md:grid-cols-[1fr_70px_60px_120px_90px_60px_75px_auto] md:items-center md:gap-3",
    tem_rascunho ? "ring-1 ring-inset ring-amber-300 bg-amber-50/30" : "",
  ].join(" ");

  function on_unidade_change(e: React.ChangeEvent<HTMLSelectElement>) {
    set_unidade_preco(e.target.value);
    // Commit imediato com a nova unidade (mantém o resto)
    setTimeout(() => {
      const v = parse_reais(valor_str);
      if (v == null) return;
      onChangeRascunhoPreco(
        material.id,
        montar_preco_atual(v),
      );
    }, 0);
  }

  function on_remover() {
    // X = pedir pra limpar override (vira rascunho null se já estava salvo)
    if (preco_salvo) {
      onChangeRascunhoPreco(material.id, null);
    } else if (rascunho_preco !== undefined) {
      onChangeRascunhoPreco(material.id, null);
    }
  }

  return (
    <div className={linha_cls}>
      {/* Descrição */}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-800" title={material.descricao}>
          {material.descricao}
        </div>
        <div className="text-[11px] text-slate-400">
          {material.cod_sap ? `SAP ${material.cod_sap}` : "sem SAP"} ·{" "}
          {material.cod_lider7 ? `L7 ${material.cod_lider7}` : "sem L7"} ·{" "}
          {material.categoria ?? "—"}
        </div>
      </div>

      <div className="hidden text-xs text-slate-500 md:block">{material.cod_sap || "—"}</div>

      <div className="text-xs text-slate-500">
        <span className="md:hidden">BOM: </span>
        {material.unidade}
      </div>

      {/* R$ */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 md:hidden">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={valor_str}
          onChange={(e) => set_valor_str(e.target.value)}
          onBlur={commit_preco}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="0,00"
          className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
        />
      </div>

      <select
        value={unidade_preco}
        onChange={on_unidade_change}
        className="rounded border border-slate-300 bg-white px-1 py-1 text-xs"
        title="Unidade do preço cadastrado"
      >
        {UNIDADES.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        {precisa_fator ? (
          <input
            type="text"
            inputMode="decimal"
            value={fator_str}
            onChange={(e) => set_fator_str(e.target.value)}
            onBlur={commit_preco}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            placeholder="fator"
            title={`Multiplica ${material.unidade} para chegar a ${unidade_preco}`}
            className={`w-16 rounded border px-1 py-1 text-right text-xs tabular-nums focus:outline-none focus:ring-1 ${
              fator_invalido ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-sky-200"
            }`}
          />
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400 md:hidden">Perda:</span>
        <input
          type="text"
          inputMode="decimal"
          value={perda_str}
          onChange={(e) => set_perda_str(e.target.value)}
          onBlur={commit_perda}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="—"
          title="% de perda específica deste material (sobrescreve a categoria). Vazio = usa default da categoria."
          className={`w-14 rounded border px-1.5 py-1 text-right text-xs tabular-nums focus:outline-none focus:ring-1 ${
            perda_visivel != null
              ? "border-amber-300 bg-amber-50 focus:ring-amber-200"
              : "border-slate-300 focus:ring-sky-200"
          }`}
        />
        <span className="text-[10px] text-slate-400">%</span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {origem_badge}
        {rascunho_badge}
        {fator_invalido && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-800" title="Fator de conversão obrigatório">
            ⚠ fator
          </span>
        )}
        {(preco_resolvido.tem_override || rascunho_preco) && (
          <button
            onClick={on_remover}
            title="Limpar este preço (entra como mudança pendente)"
            className="rounded px-1.5 text-sm text-slate-400 hover:text-red-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
