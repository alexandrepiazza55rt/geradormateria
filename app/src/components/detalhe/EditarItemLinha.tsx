import { useState } from "react";
import type { ItemOrcamentoSnapshot } from "../../lib/orcamento/types";
import {
  centavos_para_reais,
  formatar_centavos_brl,
  reais_para_centavos,
} from "../../lib/orcamento/dinheiro";
import { eh_item_manual } from "../../lib/orcamento/edicao";

interface Props {
  item: ItemOrcamentoSnapshot;
  onEditQty: (nova_qty: number) => void;
  onEditPreco: (novo_preco_centavos: number) => void;
  onRemover: () => void;
}

function fmt_qty_input(n: number): string {
  return Number.isInteger(n)
    ? String(n)
    : String(n).replace(".", ",");
}

function fmt_reais_input(centavos: number): string {
  return centavos_para_reais(centavos).toFixed(2).replace(".", ",");
}

function parse_decimal(s: string): number | null {
  const limpo = s.trim().replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : null;
}

export function EditarItemLinha({
  item,
  onEditQty,
  onEditPreco,
  onRemover,
}: Props) {
  const [qty_str, set_qty_str] = useState(fmt_qty_input(item.qty));
  const [preco_str, set_preco_str] = useState(fmt_reais_input(item.preco_unit_centavos));

  // Re-sync se o item mudou externamente (pattern oficial React 19)
  const [last_id, set_last_id] = useState(item.material_id);
  const [last_qty, set_last_qty] = useState(item.qty);
  const [last_preco, set_last_preco] = useState(item.preco_unit_centavos);
  if (
    last_id !== item.material_id ||
    last_qty !== item.qty ||
    last_preco !== item.preco_unit_centavos
  ) {
    set_last_id(item.material_id);
    set_last_qty(item.qty);
    set_last_preco(item.preco_unit_centavos);
    set_qty_str(fmt_qty_input(item.qty));
    set_preco_str(fmt_reais_input(item.preco_unit_centavos));
  }

  function commit_qty() {
    const v = parse_decimal(qty_str);
    if (v == null || v <= 0) {
      // valor inválido — reverte visual ao valor atual
      set_qty_str(fmt_qty_input(item.qty));
      return;
    }
    if (v !== item.qty) onEditQty(v);
  }

  function commit_preco() {
    const v = parse_decimal(preco_str);
    if (v == null || v < 0) {
      set_preco_str(fmt_reais_input(item.preco_unit_centavos));
      return;
    }
    const cent = reais_para_centavos(v);
    if (cent !== item.preco_unit_centavos) onEditPreco(cent);
  }

  const manual = eh_item_manual(item.material_id);

  return (
    <div className="grid grid-cols-[1fr_60px_90px_110px_110px_auto] gap-2 border-b border-slate-100 px-3 py-2 items-center">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-800" title={item.descricao_snapshot}>
          {item.descricao_snapshot}
        </div>
        <div className="text-[10px] text-slate-400">
          {manual && <span className="mr-1 rounded bg-purple-100 px-1 text-purple-700">manual</span>}
          {item.sem_preco && (
            <span className="mr-1 rounded bg-amber-100 px-1 font-semibold text-amber-700">sem preço</span>
          )}
          {item.fator_conversao_aplicado != null && (
            <span>{item.unidade_snapshot}→{item.unidade_preco} × {item.fator_conversao_aplicado}</span>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-500">{item.unidade_snapshot}</div>

      <input
        type="text"
        inputMode="decimal"
        value={qty_str}
        onChange={(e) => set_qty_str(e.target.value)}
        onBlur={commit_qty}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full rounded border border-slate-300 px-2 py-1 text-right text-sm tabular-nums focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
      />

      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={preco_str}
          onChange={(e) => set_preco_str(e.target.value)}
          onBlur={commit_preco}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={`w-full rounded border px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-1 ${
            item.sem_preco
              ? "border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-200"
              : "border-slate-300 focus:border-sky-500 focus:ring-sky-200"
          }`}
        />
      </div>

      <div className="text-right text-sm font-semibold tabular-nums text-slate-900">
        {formatar_centavos_brl(item.subtotal_centavos)}
      </div>

      <button
        onClick={onRemover}
        title="Remover item"
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700"
      >
        ✕
      </button>
    </div>
  );
}
