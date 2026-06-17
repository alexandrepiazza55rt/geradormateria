// Validação de estruturas (porta de extraction/validate_base.py para TS).
// Separa o que é OFFLINE (formato) do que precisa da base (integridade/id/rev).

import type { Catalog, Estrutura } from "./types";

export interface ResultadoValidacao {
  ok: boolean;
  erros: string[];
  avisos: string[];
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Valida só o FORMATO/schema de uma estrutura (não precisa da base). */
export function validarFormato(obj: unknown): ResultadoValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const push = (c: boolean, msg: string) => {
    if (!c) erros.push(msg);
  };

  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return { ok: false, erros: ["o conteúdo não é um objeto JSON de estrutura"], avisos };
  }
  const e = obj as Record<string, unknown>;

  push(typeof e.id === "string" && e.id.trim().length > 0, "campo 'id' ausente ou vazio");
  if (typeof e.id === "string" && !/^[A-Za-z0-9._-]+$/.test(e.id)) {
    erros.push(`'id' inválido para nome de arquivo: ${e.id}`);
  }
  push(typeof e.tipo === "string", "campo 'tipo' ausente (texto)");
  push(typeof e.categoria === "string" && e.categoria.trim().length > 0, "campo 'categoria' ausente");
  push(typeof e.poste_ref === "string" && e.poste_ref.trim().length > 0, "campo 'poste_ref' ausente");
  push(isFiniteNumber(e.tensao_kv), "campo 'tensao_kv' ausente ou não-numérico");
  push(isFiniteNumber(e.nominal_kv), "campo 'nominal_kv' ausente ou não-numérico");
  push([1, 2, 3].includes(e.fases as number), "campo 'fases' deve ser 1, 2 ou 3");
  push(e.condutor === null || typeof e.condutor === "string", "campo 'condutor' deve ser texto ou null");

  const status = (e.status as string) ?? "ativo";
  push(status === "ativo" || status === "descontinuado", `'status' inválido: ${String(e.status)}`);
  if (e.rev !== undefined) push(isFiniteNumber(e.rev) && (e.rev as number) >= 1, "'rev' deve ser número >= 1");

  // base_bom
  if (typeof e.base_bom !== "object" || e.base_bom === null || Array.isArray(e.base_bom)) {
    erros.push("'base_bom' ausente ou não é um objeto");
  } else {
    validarBomMap(e.base_bom as Record<string, unknown>, "base_bom", erros);
  }

  // postes
  if (!Array.isArray(e.postes)) {
    erros.push("'postes' ausente ou não é uma lista");
  } else {
    (e.postes as unknown[]).forEach((p, i) => {
      if (typeof p !== "object" || p === null) {
        erros.push(`postes[${i}] inválido`);
        return;
      }
      const po = p as Record<string, unknown>;
      if (typeof po.poste !== "string" || !po.poste.trim()) avisos.push(`postes[${i}] sem rótulo 'poste'`);
      if (typeof po.delta !== "object" || po.delta === null || Array.isArray(po.delta)) {
        erros.push(`postes[${i}].delta ausente ou não é objeto`);
      } else {
        validarBomMap(po.delta as Record<string, unknown>, `postes[${i}].delta`, erros);
      }
    });
    // o primeiro poste deve corresponder ao poste_ref
    const p0 = (e.postes as Record<string, unknown>[])[0];
    if (p0 && typeof p0.poste === "string" && typeof e.poste_ref === "string" && p0.poste !== e.poste_ref) {
      avisos.push(`o 1º poste ('${p0.poste}') difere de 'poste_ref' ('${e.poste_ref}')`);
    }
  }

  return { ok: erros.length === 0, erros, avisos };
}

function validarBomMap(map: Record<string, unknown>, onde: string, erros: string[]) {
  for (const [k, v] of Object.entries(map)) {
    if (!/^\d+$/.test(k)) erros.push(`${onde}: código de material '${k}' não é um número inteiro`);
    if (!isFiniteNumber(v)) erros.push(`${onde}: quantidade inválida para material ${k}: ${String(v)}`);
  }
}

/** Códigos de material citados por uma estrutura (base_bom + todos os deltas). */
export function materiaisCitados(e: Estrutura): Set<number> {
  const ids = new Set<number>();
  for (const k of Object.keys(e.base_bom ?? {})) ids.add(Number(k));
  for (const p of e.postes ?? []) for (const k of Object.keys(p.delta ?? {})) ids.add(Number(k));
  return ids;
}

export interface ContextoBase {
  idsMateriais: Set<number>; // ids válidos (de materiais.json)
  catalog: Catalog | null; // catálogo atual publicado (p/ id único + rev)
  /** ids dos OUTROS arquivos sendo publicados no mesmo lote (p/ detectar id repetido) */
  idsNoLote?: Set<string>;
}

/** Validação que depende da base atual: integridade, id único e disciplina de rev. */
export function validarContraBase(e: Estrutura, ctx: ContextoBase): ResultadoValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];

  // integridade referencial
  for (const mid of materiaisCitados(e)) {
    if (!ctx.idsMateriais.has(mid)) {
      erros.push(`material ${mid} não existe na base (cadastre-o antes ou corrija o código)`);
    }
  }

  // id único no lote
  if (ctx.idsNoLote) {
    const repetidos = [...ctx.idsNoLote].filter((x) => x === e.id).length;
    if (repetidos > 1) erros.push(`id '${e.id}' aparece mais de uma vez nos arquivos enviados`);
  }

  // disciplina de rev: se já existe publicada, o rev precisa ser MAIOR
  const atual = ctx.catalog?.structures.find((s) => s.id === e.id);
  if (atual) {
    const revNovo = e.rev ?? 1;
    if (revNovo <= atual.rev) {
      erros.push(
        `'${e.id}' já está publicada com rev ${atual.rev}; para corrigir, suba o rev para ${atual.rev + 1} ou mais`,
      );
    } else {
      avisos.push(`'${e.id}' é uma CORREÇÃO (rev ${atual.rev} → ${revNovo}).`);
    }
  } else {
    avisos.push(`'${e.id}' é uma estrutura NOVA.`);
  }

  return { ok: erros.length === 0, erros, avisos };
}
