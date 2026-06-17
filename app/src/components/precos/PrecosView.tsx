import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../store";
import {
  listar_materiais_com_status,
  type FiltrosPrecos,
} from "../../lib/orcamento/precos";
import type { PrecoMaterial } from "../../lib/orcamento/types";
import { PrecosFiltros } from "./PrecosFiltros";
import { PrecoLinha } from "./PrecoLinha";

const FILTROS_DEFAULT: FiltrosPrecos = {
  busca: "",
  categoria: null,
  origem: "todos",
  validade: "todos",
  apenas_obra: null,
  mostrar_todos_catalogo: false,
};

export function PrecosView() {
  const view = useStore((s) => s.view);
  const filtros_iniciais =
    view.name === "precos" ? view.filtros_iniciais : undefined;

  const [filtros, setFiltros] = useState<FiltrosPrecos>({
    ...FILTROS_DEFAULT,
    ...filtros_iniciais,
  });

  const materials = useStore((s) => s.materials);
  const oficiais = useStore((s) => s.precosOficiais);
  const overrides = useStore((s) => s.precosOverrides);
  const usados = useStore((s) => s.materiaisUsadosEmBom);
  const perda_overrides_salvos = useStore(
    (s) => s.configOrcamento.perda.override_por_material,
  );
  const aplicarRascunhosPrecos = useStore((s) => s.aplicarRascunhosPrecos);

  // ─── Rascunho local (Correção 1) ─────────────────────────────
  // `undefined` no Map quer dizer "sem rascunho para este material".
  // `null` = "remover override salvo". PrecoMaterial = "criar/atualizar".
  const [rascunhos_preco, set_rascunhos_preco] = useState<
    Map<number, PrecoMaterial | null>
  >(() => new Map());
  const [rascunhos_perda, set_rascunhos_perda] = useState<
    Map<number, number | null>
  >(() => new Map());

  const total_pendentes = rascunhos_preco.size + rascunhos_perda.size;
  const tem_pendentes = total_pendentes > 0;

  const handle_change_preco = useCallback(
    (material_id: number, novo: PrecoMaterial | null) => {
      set_rascunhos_preco((prev) => {
        // Se o "novo" rascunho equivale ao estado salvo, remove a entrada
        // do rascunho para limpar o indicador (UX honesta).
        const salvo = overrides.get(material_id) ?? null;
        const equivale =
          (novo === null && salvo === null) ||
          (novo !== null && salvo !== null && precos_equivalentes(novo, salvo));
        const next = new Map(prev);
        if (equivale) next.delete(material_id);
        else next.set(material_id, novo);
        return next;
      });
    },
    [overrides],
  );

  const handle_change_perda = useCallback(
    (material_id: number, novo: number | null) => {
      set_rascunhos_perda((prev) => {
        const salvo = perda_overrides_salvos[material_id] ?? null;
        const equivale =
          (novo === null && salvo === null) || novo === salvo;
        const next = new Map(prev);
        if (equivale) next.delete(material_id);
        else next.set(material_id, novo);
        return next;
      });
    },
    [perda_overrides_salvos],
  );

  function handle_descartar() {
    if (!tem_pendentes) return;
    const ok = window.confirm(
      `Descartar ${total_pendentes} alteração(ões) pendente(s)?`,
    );
    if (!ok) return;
    set_rascunhos_preco(new Map());
    set_rascunhos_perda(new Map());
  }

  function handle_salvar() {
    if (!tem_pendentes) return;
    // Validação: rascunhos de PrecoMaterial não podem ter valor negativo nem
    // exigir fator sem ter o fator. `null` (limpar) sempre passa.
    for (const [id, p] of rascunhos_preco) {
      if (p === null) continue;
      if (p.valor_centavos < 0) {
        const m = materials.get(id);
        window.alert(
          `Valor negativo não permitido em "${m?.descricao ?? id}". Corrija e tente de novo.`,
        );
        return;
      }
      if (
        p.unidade_preco &&
        m_unidade(id, materials) !== p.unidade_preco &&
        (p.fator_conversao == null || !Number.isFinite(p.fator_conversao))
      ) {
        const m = materials.get(id);
        window.alert(
          `Falta o fator de conversão em "${m?.descricao ?? id}" (unidade do preço diferente da unidade do BOM).`,
        );
        return;
      }
    }
    const res = aplicarRascunhosPrecos(rascunhos_preco, rascunhos_perda);
    set_rascunhos_preco(new Map());
    set_rascunhos_perda(new Map());
    const partes: string[] = [];
    if (res.aplicados) partes.push(`${res.aplicados} aplicado(s)`);
    if (res.removidos) partes.push(`${res.removidos} removido(s)`);
    window.alert(`Preços salvos: ${partes.join(" · ") || "0"}.`);
  }

  // beforeunload — segura a saída se há mudanças pendentes
  useEffect(() => {
    if (!tem_pendentes) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [tem_pendentes]);

  const hoje = useMemo(() => new Date(), []);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const m of materials.values()) {
      if (m.categoria && usados.has(m.id)) set.add(m.categoria);
    }
    return [...set];
  }, [materials, usados]);

  const lista = useMemo(
    () =>
      listar_materiais_com_status(
        [...materials.values()],
        usados,
        oficiais,
        overrides,
        hoje,
        filtros,
      ),
    [materials, usados, oficiais, overrides, hoje, filtros],
  );

  const universo = filtros.mostrar_todos_catalogo
    ? materials.size
    : usados.size;

  const com_preco = lista.filter((l) => l.preco_resolvido.preco !== null).length;
  const sem_preco = lista.length - com_preco;
  const vencidos = lista.filter((l) => l.status === "com_preco_vencido").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900">Preços de materiais</h1>
          <p className="mt-1 text-sm text-slate-600">
            Cadastre o preço por material. Digite à vontade — nada é gravado
            até você clicar em <span className="font-semibold">Salvar todos</span>.
            Os valores ficam no seu navegador como{" "}
            <span className="font-semibold text-amber-700">🅼 meu</span> e
            sobrepõem o preço{" "}
            <span className="font-semibold text-sky-700">🅞 oficial</span>{" "}
            (quando existir). Mudanças aqui não alteram orçamentos já salvos.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Importar, exportar, baixar template e limpar preços agora ficam em{" "}
            <span className="font-medium text-slate-700">Configurações → Preços (dados)</span>.
          </p>
        </div>
      </div>

      {tem_pendentes && (
        <div className="sticky top-[64px] z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2 shadow-sm">
          <div className="text-sm text-amber-900">
            <span className="font-semibold">
              {total_pendentes} alteração(ões) não salva(s)
            </span>
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
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              💾 Salvar todos ({total_pendentes})
            </button>
          </div>
        </div>
      )}

      <PrecosFiltros
        filtros={filtros}
        onChange={setFiltros}
        categorias={categorias}
        tem_filtro_obra={filtros.apenas_obra != null}
        qtd_obra={filtros.apenas_obra?.length ?? 0}
      />

      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{lista.length}</span>{" "}
        de {universo} materiais · {com_preco} com preço · {sem_preco} sem preço
        {vencidos > 0 && ` · ${vencidos} vencidos`}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1fr_70px_60px_120px_90px_60px_75px_auto] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <div>Descrição</div>
          <div>SAP</div>
          <div>Un BOM</div>
          <div className="text-right">R$</div>
          <div>Un preço</div>
          <div className="text-right">Fator</div>
          <div className="text-right" title="% de perda específica deste material — sobrescreve a categoria">Perda %</div>
          <div className="text-right">Origem</div>
        </div>

        {lista.length === 0 ? (
          <div className="px-3 py-12 text-center text-sm text-slate-400">
            {filtros.apenas_obra && filtros.apenas_obra.length > 0
              ? `Nenhum dos ${filtros.apenas_obra.length} materiais pendentes está no catálogo atual.`
              : "Nenhum material para os filtros atuais."}
          </div>
        ) : (
          lista.map((it) => (
            <PrecoLinha
              key={it.material.id}
              item={it}
              rascunho_preco={
                rascunhos_preco.has(it.material.id)
                  ? rascunhos_preco.get(it.material.id) ?? null
                  : undefined
              }
              rascunho_perda={
                rascunhos_perda.has(it.material.id)
                  ? rascunhos_perda.get(it.material.id) ?? null
                  : undefined
              }
              onChangeRascunhoPreco={handle_change_preco}
              onChangeRascunhoPerda={handle_change_perda}
              perda_override_salvo={perda_overrides_salvos[it.material.id]}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Helpers
function m_unidade(
  material_id: number,
  materials: Map<number, { unidade: string }>,
): string {
  return materials.get(material_id)?.unidade ?? "";
}

function precos_equivalentes(a: PrecoMaterial, b: PrecoMaterial): boolean {
  return (
    a.valor_centavos === b.valor_centavos &&
    a.unidade_preco === b.unidade_preco &&
    a.fator_conversao === b.fator_conversao &&
    a.validade === b.validade
  );
}
