// Importação e exportação de preços em CSV/XLSX.
// O ponto-de-verdade testável é `analisar_csv`: função pura que recebe texto
// e devolve a classificação linha-a-linha sem tocar arquivo, DOM ou storage.
// `analisar_arquivo` é o adaptador que lê File/ArrayBuffer e roteia para
// `analisar_csv` (XLSX → CSV in-memory antes de chamar).

import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Material } from "../../types";
import type { CategoriaPerda, PrecoMaterial } from "./types";
import { formatar_centavos_brl, reais_para_centavos } from "./dinheiro";
import { saveText, saveBinary, MIME_CSV, MIME_XLSX, FILTER_CSV, FILTER_XLSX } from "../exportTarget";

export const HEADER_CSV = [
  "material_id",
  "cod_sap",
  "descricao",
  "unidade_material",
  "valor_brl",
  "unidade_preco",
  "fator_conversao",
  "validade",
  "fornecedor",
  "categoria_perda_override",
] as const;

const COLUNAS_CONHECIDAS = new Set<string>(HEADER_CSV);
const COLUNAS_OBRIGATORIAS = ["material_id", "valor_brl", "unidade_preco"];
const UNIDADES_VALIDAS = new Set(["pç", "m", "kg", "und"]);
const CATEGORIAS_PERDA_VALIDAS = new Set<CategoriaPerda>([
  "cabo",
  "fio_parafuso_conector",
  "cinta_isolador_mao_francesa",
  "equipamento_grande",
  "outros",
]);

export type TipoOperacao =
  | "criar"
  | "atualizar"
  | "ignorar"
  | "remover"
  | "erro";

export interface DiffCampo {
  campo: string;
  antes: string;
  depois: string;
}

export interface OperacaoImport {
  tipo: TipoOperacao;
  material_id: number;                  // -1 para erros sem id válido
  descricao_catalogo: string;
  preco_proposto: PrecoMaterial | null; // null para "ignorar", "remover", "erro"
  diff?: DiffCampo[];                   // só em "atualizar"
  erro?: string;                        // só em "erro"
  linha_csv: number;                    // 2 = primeira linha de dados (1 = header)
}

export interface ResumoImport {
  criar: number;
  atualizar: number;
  ignorar: number;
  remover: number;
  erro: number;
}

export interface ResultadoAnalise {
  total_linhas: number;
  operacoes: OperacaoImport[];
  resumo: ResumoImport;
  avisos: string[];
}


// U+FEFF (BOM). Construído a partir de escape numérico para evitar
// caractere invisível no source (regra no-irregular-whitespace).
const BOM_RE = new RegExp("^\\uFEFF");
const BOM_STR = String.fromCharCode(0xfeff);

// ─── Parsing helpers ───────────────────────────────────────────────────────

function strip_bom(s: string): string {
  return s.replace(BOM_RE, "");
}

/**
 * Aceita "1.234,56" (pt-BR), "1234,56" (pt-BR), "1234.56" (US) ou "1234".
 * Se houver vírgula, considera decimal pt-BR (pontos = milhares).
 * Caso contrário, considera decimal US.
 */
export function parse_valor_brl(s: string): number | null {
  const limpo = s.trim();
  if (!limpo) return null;
  if (!/^-?[\d.,]+$/.test(limpo)) return null;

  let normalizado: string;
  if (limpo.includes(",")) {
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    normalizado = limpo;
  }
  const n = parseFloat(normalizado);
  return Number.isFinite(n) ? n : null;
}

/**
 * Aceita "YYYY-MM-DD" ou "DD/MM/YYYY" ou "DD/MM/YY" (assume 20YY).
 * Retorna sempre "YYYY-MM-DD" ou null se inválida (incluindo datas "ajustadas"
 * pelo JS como 31/02 → 03/03).
 */
export function parse_data(s: string): string | null {
  const limpo = s.trim();
  if (!limpo) return null;

  let ano: string;
  let mes: string;
  let dia: string;

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) {
    [ano, mes, dia] = limpo.split("-");
  } else {
    const m = limpo.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!m) return null;
    dia = m[1].padStart(2, "0");
    mes = m[2].padStart(2, "0");
    ano = m[3].length === 2 ? `20${m[3]}` : m[3];
  }

  const iso = `${ano}-${mes}-${dia}`;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const reconstr =
    `${d.getFullYear().toString().padStart(4, "0")}-` +
    `${(d.getMonth() + 1).toString().padStart(2, "0")}-` +
    `${d.getDate().toString().padStart(2, "0")}`;
  if (iso !== reconstr) return null;

  return iso;
}

function fmt_decimal_pt(n: number, casas = 2): string {
  return n.toFixed(casas).replace(".", ",");
}

function fmt_valor_csv(centavos: number): string {
  // CSV exportado usa formato pt-BR (vírgula). Importação aceita ambos.
  return fmt_decimal_pt(centavos / 100);
}

// ─── Comparação para detectar "ignorar" vs "atualizar" ─────────────────────

function diff_precos(a: PrecoMaterial, b: PrecoMaterial): DiffCampo[] {
  const d: DiffCampo[] = [];
  if (a.valor_centavos !== b.valor_centavos) {
    d.push({
      campo: "valor",
      antes: formatar_centavos_brl(a.valor_centavos),
      depois: formatar_centavos_brl(b.valor_centavos),
    });
  }
  if (a.unidade_preco !== b.unidade_preco) {
    d.push({ campo: "unidade_preco", antes: a.unidade_preco, depois: b.unidade_preco });
  }
  const fa = a.fator_conversao ?? null;
  const fb = b.fator_conversao ?? null;
  if (fa !== fb) {
    d.push({ campo: "fator_conversao", antes: fa == null ? "—" : String(fa), depois: fb == null ? "—" : String(fb) });
  }
  if ((a.validade ?? null) !== (b.validade ?? null)) {
    d.push({ campo: "validade", antes: a.validade ?? "—", depois: b.validade ?? "—" });
  }
  if ((a.fornecedor ?? null) !== (b.fornecedor ?? null)) {
    d.push({ campo: "fornecedor", antes: a.fornecedor ?? "—", depois: b.fornecedor ?? "—" });
  }
  if ((a.categoria_perda_override ?? null) !== (b.categoria_perda_override ?? null)) {
    d.push({
      campo: "categoria_perda_override",
      antes: a.categoria_perda_override ?? "—",
      depois: b.categoria_perda_override ?? "—",
    });
  }
  return d;
}

// ─── Classificação por linha ───────────────────────────────────────────────

function err_op(
  num: number,
  msg: string,
  material_id = -1,
  descricao = "",
): OperacaoImport {
  return {
    tipo: "erro",
    material_id,
    descricao_catalogo: descricao,
    preco_proposto: null,
    erro: msg,
    linha_csv: num,
  };
}

function classificar(
  linha: Record<string, string>,
  num: number,
  catalogo: Map<number, Material>,
  overrides_atuais: Map<number, PrecoMaterial>,
): OperacaoImport {
  const id_str = (linha.material_id ?? "").trim();
  if (!id_str) return err_op(num, "material_id obrigatório");
  const id = parseInt(id_str, 10);
  if (!Number.isFinite(id) || String(id) !== id_str) {
    return err_op(num, `material_id inválido: "${id_str}"`);
  }

  const material = catalogo.get(id);
  if (!material) return err_op(num, `material_id ${id} não está no catálogo`, id);

  const valor_str = (linha.valor_brl ?? "").trim();
  if (!valor_str) {
    if (overrides_atuais.has(id)) {
      return {
        tipo: "remover",
        material_id: id,
        descricao_catalogo: material.descricao,
        preco_proposto: null,
        linha_csv: num,
      };
    }
    return {
      tipo: "ignorar",
      material_id: id,
      descricao_catalogo: material.descricao,
      preco_proposto: null,
      linha_csv: num,
    };
  }

  const valor = parse_valor_brl(valor_str);
  if (valor == null || valor < 0) {
    return err_op(num, `valor_brl inválido: "${valor_str}"`, id, material.descricao);
  }

  const unidade_preco = (linha.unidade_preco ?? "").trim();
  if (!UNIDADES_VALIDAS.has(unidade_preco)) {
    return err_op(
      num,
      `unidade_preco inválida: "${unidade_preco}" (use pç, m, kg ou und)`,
      id,
      material.descricao,
    );
  }

  const precisa_fator = unidade_preco !== material.unidade;
  let fator: number | null = null;
  if (precisa_fator) {
    const fator_str = (linha.fator_conversao ?? "").trim();
    if (!fator_str) {
      return err_op(
        num,
        `fator_conversao obrigatório (${material.unidade} → ${unidade_preco})`,
        id,
        material.descricao,
      );
    }
    const f = parse_valor_brl(fator_str);
    if (f == null || f <= 0) {
      return err_op(num, `fator_conversao inválido: "${fator_str}"`, id, material.descricao);
    }
    fator = f;
  }

  const validade_str = (linha.validade ?? "").trim();
  let validade: string | null = null;
  if (validade_str) {
    validade = parse_data(validade_str);
    if (validade == null) {
      return err_op(num, `validade inválida: "${validade_str}" (use YYYY-MM-DD ou DD/MM/YYYY)`, id, material.descricao);
    }
  }

  const cpo_str = (linha.categoria_perda_override ?? "").trim();
  let cpo: CategoriaPerda | null = null;
  if (cpo_str) {
    if (!CATEGORIAS_PERDA_VALIDAS.has(cpo_str as CategoriaPerda)) {
      return err_op(num, `categoria_perda_override inválida: "${cpo_str}"`, id, material.descricao);
    }
    cpo = cpo_str as CategoriaPerda;
  }

  const fornecedor = (linha.fornecedor ?? "").trim() || null;

  const preco_proposto: PrecoMaterial = {
    material_id: id,
    valor_centavos: reais_para_centavos(valor),
    unidade_preco,
    fator_conversao: fator,
    validade,
    fornecedor,
    origem: "meu",
    atualizado_em: new Date().toISOString(),
    categoria_perda_override: cpo,
  };

  const atual = overrides_atuais.get(id);
  if (!atual) {
    return {
      tipo: "criar",
      material_id: id,
      descricao_catalogo: material.descricao,
      preco_proposto,
      linha_csv: num,
    };
  }

  const diff = diff_precos(atual, preco_proposto);
  if (diff.length === 0) {
    return {
      tipo: "ignorar",
      material_id: id,
      descricao_catalogo: material.descricao,
      preco_proposto,
      linha_csv: num,
    };
  }
  return {
    tipo: "atualizar",
    material_id: id,
    descricao_catalogo: material.descricao,
    preco_proposto,
    diff,
    linha_csv: num,
  };
}

// ─── analisar_csv: função pura, testável ───────────────────────────────────

const RESUMO_ZERO: ResumoImport = {
  criar: 0,
  atualizar: 0,
  ignorar: 0,
  remover: 0,
  erro: 0,
};

export function analisar_csv(
  texto: string,
  catalogo: Map<number, Material>,
  overrides_atuais: Map<number, PrecoMaterial>,
): ResultadoAnalise {
  const avisos: string[] = [];
  const texto_limpo = strip_bom(texto);
  if (!texto_limpo.trim()) {
    return {
      total_linhas: 0,
      operacoes: [],
      resumo: { ...RESUMO_ZERO },
      avisos: ["Arquivo vazio"],
    };
  }

  const parsed = Papa.parse<Record<string, string>>(texto_limpo, {
    header: true,
    skipEmptyLines: true,
    delimitersToGuess: [",", ";", "\t"],
    transformHeader: (h: string) => strip_bom(h).trim(),
  });

  const fields = parsed.meta.fields ?? [];
  for (const obrig of COLUNAS_OBRIGATORIAS) {
    if (!fields.includes(obrig)) {
      return {
        total_linhas: 0,
        operacoes: [],
        resumo: { ...RESUMO_ZERO },
        avisos: [
          `Cabeçalho inválido — falta a coluna obrigatória "${obrig}". ` +
            `Esperadas: ${HEADER_CSV.join(", ")}.`,
        ],
      };
    }
  }
  for (const f of fields) {
    if (!COLUNAS_CONHECIDAS.has(f)) {
      avisos.push(`coluna desconhecida "${f}" — ignorada`);
    }
  }

  const ops_com_erro: OperacaoImport[] = [];
  const ops_validas = new Map<number, OperacaoImport>();

  let num = 1; // linha 1 = header
  for (const linha of parsed.data) {
    num++;
    if (!linha || Object.values(linha).every((v) => !v || !v.trim())) {
      continue; // linha em branco
    }
    const op = classificar(linha, num, catalogo, overrides_atuais);
    if (op.tipo === "erro") {
      ops_com_erro.push(op);
    } else {
      const anterior = ops_validas.get(op.material_id);
      if (anterior) {
        avisos.push(
          `material_id ${op.material_id} duplicado nas linhas ${anterior.linha_csv} e ${op.linha_csv} — última vence`,
        );
      }
      ops_validas.set(op.material_id, op);
    }
  }

  const operacoes = [...ops_validas.values(), ...ops_com_erro];
  const resumo: ResumoImport = { ...RESUMO_ZERO };
  for (const op of operacoes) resumo[op.tipo]++;

  return {
    total_linhas: parsed.data.length,
    operacoes,
    resumo,
    avisos,
  };
}

// ─── XLSX → CSV in-memory ──────────────────────────────────────────────────

export function xlsx_para_csv(
  buffer: ArrayBuffer | Uint8Array,
): { csv: string; avisos: string[] } {
  const avisos: string[] = [];
  const wb = XLSX.read(buffer, { type: "array" });
  if (wb.SheetNames.length === 0) {
    return { csv: "", avisos: ["XLSX sem planilhas"] };
  }
  if (wb.SheetNames.length > 1) {
    avisos.push(
      `XLSX tem ${wb.SheetNames.length} planilhas — usando a primeira ("${wb.SheetNames[0]}")`,
    );
  }
  const ws = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(ws);
  return { csv, avisos };
}

// ─── Análise de arquivo (CSV ou XLSX) — usada pelo componente ──────────────

export async function analisar_arquivo(
  file: File,
  catalogo: Map<number, Material>,
  overrides_atuais: Map<number, PrecoMaterial>,
): Promise<ResultadoAnalise> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Sniff: ZIP (XLSX) começa com "PK\x03\x04"
  const eh_xlsx =
    bytes.length >= 4 &&
    bytes[0] === 0x50 && bytes[1] === 0x4b &&
    bytes[2] === 0x03 && bytes[3] === 0x04;

  let texto: string;
  let avisos_extras: string[] = [];
  if (eh_xlsx || file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
    const { csv, avisos } = xlsx_para_csv(buffer);
    texto = csv;
    avisos_extras = avisos;
  } else {
    texto = new TextDecoder("utf-8").decode(buffer);
  }

  const r = analisar_csv(texto, catalogo, overrides_atuais);
  return { ...r, avisos: [...avisos_extras, ...r.avisos] };
}

// ─── Geração de CSV ────────────────────────────────────────────────────────

function linha_to_csv_row(
  m: Material,
  p: PrecoMaterial | null,
): Record<string, string> {
  return {
    material_id: String(m.id),
    cod_sap: m.cod_sap ?? "",
    descricao: m.descricao ?? "",
    unidade_material: m.unidade ?? "",
    valor_brl: p ? fmt_valor_csv(p.valor_centavos) : "",
    unidade_preco: p?.unidade_preco ?? "",
    fator_conversao:
      p?.fator_conversao != null ? String(p.fator_conversao).replace(".", ",") : "",
    validade: p?.validade ?? "",
    fornecedor: p?.fornecedor ?? "",
    categoria_perda_override: p?.categoria_perda_override ?? "",
  };
}

export function gerar_csv_overrides(
  overrides: Map<number, PrecoMaterial>,
  catalogo: Map<number, Material>,
): string {
  const linhas: Record<string, string>[] = [];
  for (const p of overrides.values()) {
    const m = catalogo.get(p.material_id);
    if (!m) continue;
    linhas.push(linha_to_csv_row(m, p));
  }
  linhas.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
  const csv = Papa.unparse(
    { fields: [...HEADER_CSV], data: linhas },
    { newline: "\r\n" },
  );
  return BOM_STR + csv;
}

export function gerar_csv_template(
  catalogo: Map<number, Material>,
  usados: Set<number>,
  oficiais: Map<number, PrecoMaterial>,
  overrides: Map<number, PrecoMaterial>,
  incluir_precos_atuais: boolean,
): string {
  const linhas: Record<string, string>[] = [];
  for (const id of usados) {
    const m = catalogo.get(id);
    if (!m) continue;
    if (!m.descricao?.trim() || !m.unidade?.trim()) continue;
    const preco_atual = incluir_precos_atuais
      ? overrides.get(id) ?? oficiais.get(id) ?? null
      : null;
    linhas.push(linha_to_csv_row(m, preco_atual));
  }
  linhas.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
  const csv = Papa.unparse(
    { fields: [...HEADER_CSV], data: linhas },
    { newline: "\r\n" },
  );
  return BOM_STR + csv;
}

// ─── Geração de XLSX ───────────────────────────────────────────────────────

function gerar_xlsx_de_linhas(
  linhas: Record<string, string>[],
  nome_planilha: string,
): Uint8Array {
  const ws = XLSX.utils.json_to_sheet(linhas, { header: [...HEADER_CSV] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nome_planilha);
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(out as ArrayBuffer);
}

export function gerar_xlsx_overrides(
  overrides: Map<number, PrecoMaterial>,
  catalogo: Map<number, Material>,
): Uint8Array {
  const linhas: Record<string, string>[] = [];
  for (const p of overrides.values()) {
    const m = catalogo.get(p.material_id);
    if (!m) continue;
    linhas.push(linha_to_csv_row(m, p));
  }
  linhas.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
  return gerar_xlsx_de_linhas(linhas, "Meus preços");
}

export function gerar_xlsx_template(
  catalogo: Map<number, Material>,
  usados: Set<number>,
  oficiais: Map<number, PrecoMaterial>,
  overrides: Map<number, PrecoMaterial>,
  incluir_precos_atuais: boolean,
): Uint8Array {
  const linhas: Record<string, string>[] = [];
  for (const id of usados) {
    const m = catalogo.get(id);
    if (!m) continue;
    if (!m.descricao?.trim() || !m.unidade?.trim()) continue;
    const preco_atual = incluir_precos_atuais
      ? overrides.get(id) ?? oficiais.get(id) ?? null
      : null;
    linhas.push(linha_to_csv_row(m, preco_atual));
  }
  linhas.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
  return gerar_xlsx_de_linhas(linhas, "Template preços");
}

// ─── Exportação (web = download do navegador; Tauri = diálogo "Salvar como") ──

export async function baixar_csv(nome: string, conteudo: string): Promise<void> {
  await saveText(nome, conteudo, MIME_CSV, FILTER_CSV);
}

export async function baixar_xlsx(nome: string, conteudo: Uint8Array): Promise<void> {
  await saveBinary(nome, conteudo, MIME_XLSX, FILTER_XLSX);
}
