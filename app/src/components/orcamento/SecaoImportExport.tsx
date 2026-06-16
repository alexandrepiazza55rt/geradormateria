import { useRef, useState } from "react";
import { useStore } from "../../store";
import {
  analisar_arquivo,
  baixar_csv,
  baixar_xlsx,
  gerar_csv_overrides,
  gerar_csv_template,
  gerar_xlsx_overrides,
  gerar_xlsx_template,
  type ResultadoAnalise,
} from "../../lib/orcamento/importacao";
import { PrecosImportDialog } from "../precos/PrecosImportDialog";
import { ConfirmacaoCodigo } from "../ConfirmacaoCodigo";

type Formato = "csv" | "xlsx";

function hoje_iso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Seção da aba Configurações para gestão de dados de preços:
 * baixar template, exportar os "meus preços", importar planilha e limpar
 * todos os preços meus (com confirmação por código).
 */
export function SecaoImportExport() {
  const materials = useStore((s) => s.materials);
  const oficiais = useStore((s) => s.precosOficiais);
  const overrides = useStore((s) => s.precosOverrides);
  const usados = useStore((s) => s.materiaisUsadosEmBom);
  const clearAll = useStore((s) => s.clearAllPrecoOverrides);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importando, set_importando] = useState(false);
  const [resultado_import, set_resultado_import] = useState<
    { resultado: ResultadoAnalise; nome: string } | null
  >(null);
  const [confirmando_limpar, set_confirmando_limpar] = useState(false);

  const [tpl_incluir_precos, set_tpl_incluir_precos] = useState(false);
  const [tpl_formato, set_tpl_formato] = useState<Formato>("csv");
  const [exp_formato, set_exp_formato] = useState<Formato>("csv");

  const tem_overrides = overrides.size > 0;

  function baixar_template() {
    const nome_base = `template_precos_${hoje_iso()}`;
    if (tpl_formato === "csv") {
      const csv = gerar_csv_template(materials, usados, oficiais, overrides, tpl_incluir_precos);
      baixar_csv(`${nome_base}.csv`, csv);
    } else {
      const xlsx = gerar_xlsx_template(materials, usados, oficiais, overrides, tpl_incluir_precos);
      baixar_xlsx(`${nome_base}.xlsx`, xlsx);
    }
  }

  function exportar_meus() {
    const nome_base = `meus_precos_${hoje_iso()}`;
    if (exp_formato === "csv") {
      const csv = gerar_csv_overrides(overrides, materials);
      baixar_csv(`${nome_base}.csv`, csv);
    } else {
      const xlsx = gerar_xlsx_overrides(overrides, materials);
      baixar_xlsx(`${nome_base}.xlsx`, xlsx);
    }
  }

  async function handleArquivo(arquivo: File) {
    if (arquivo.size > 5 * 1024 * 1024) {
      window.alert("Arquivo muito grande (limite 5 MB).");
      return;
    }
    set_importando(true);
    try {
      const resultado = await analisar_arquivo(arquivo, materials, overrides);
      set_resultado_import({ resultado, nome: arquivo.name });
    } catch (err) {
      window.alert(
        "Não foi possível ler o arquivo. Verifique o formato (CSV ou XLSX).\n\n" +
          String((err as Error).message ?? err),
      );
    } finally {
      set_importando(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-600">
        Gestão dos seus preços (<span className="font-semibold text-amber-700">🅼 meus</span>):
        baixe um modelo para preencher, exporte os preços que já cadastrou ou
        importe uma planilha. Estes dados ficam só no seu navegador.
      </p>

      {/* Baixar template */}
      <section className="rounded-md border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800">Baixar template</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Planilha modelo com os materiais para você preencher os preços.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={tpl_incluir_precos}
              onChange={(e) => set_tpl_incluir_precos(e.target.checked)}
            />
            Incluir preços atuais
          </label>
          <SeletorFormato nome="tpl_fmt" valor={tpl_formato} onChange={set_tpl_formato} />
          <button
            onClick={baixar_template}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Baixar template
          </button>
        </div>
      </section>

      {/* Exportar meus preços */}
      <section className="rounded-md border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800">Exportar meus preços</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {tem_overrides
            ? `${overrides.size} preço(s) meu(s) cadastrado(s).`
            : "Você ainda não cadastrou nenhum preço meu."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <SeletorFormato nome="exp_fmt" valor={exp_formato} onChange={set_exp_formato} />
          <button
            onClick={exportar_meus}
            disabled={!tem_overrides}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Exportar meus preços
          </button>
        </div>
      </section>

      {/* Importar */}
      <section className="rounded-md border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800">Importar planilha</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Carregue um arquivo CSV ou XLSX com preços para revisar e aplicar.
        </p>
        <div className="mt-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importando}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {importando ? "Lendo..." : "Importar planilha..."}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleArquivo(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      {/* Zona de perigo */}
      <section className="rounded-md border border-red-200 bg-red-50/40 p-4">
        <h3 className="text-sm font-semibold text-red-800">Limpar meus preços</h3>
        <p className="mt-0.5 text-xs text-red-700/80">
          Apaga todos os {overrides.size} preço(s) meu(s) deste navegador. Esta
          ação não pode ser desfeita.
        </p>
        <button
          onClick={() => set_confirmando_limpar(true)}
          disabled={!tem_overrides}
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpar meus preços
        </button>
      </section>

      {resultado_import && (
        <PrecosImportDialog
          resultado={resultado_import.resultado}
          nome_arquivo={resultado_import.nome}
          onFechar={() => set_resultado_import(null)}
        />
      )}

      {confirmando_limpar && (
        <ConfirmacaoCodigo
          titulo="Limpar meus preços"
          mensagem={
            <>
              Você vai apagar{" "}
              <span className="font-semibold">{overrides.size} preço(s)</span>{" "}
              meu(s) deste navegador. Esta ação é <strong>definitiva</strong>.
            </>
          }
          rotulo_confirmar="Limpar preços"
          onCancelar={() => set_confirmando_limpar(false)}
          onConfirmar={() => {
            clearAll();
            set_confirmando_limpar(false);
          }}
        />
      )}
    </div>
  );
}

function SeletorFormato({
  nome,
  valor,
  onChange,
}: {
  nome: string;
  valor: Formato;
  onChange: (f: Formato) => void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-xs font-medium text-slate-500">Formato:</span>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={nome}
          value="csv"
          checked={valor === "csv"}
          onChange={() => onChange("csv")}
        />
        CSV
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={nome}
          value="xlsx"
          checked={valor === "xlsx"}
          onChange={() => onChange("xlsx")}
        />
        XLSX
      </label>
    </div>
  );
}
