/**
 * Orquestração do update de base (Fase 3) — em DUAS etapas:
 *   1. verificarAtualizacao() → diz se há atualização e O QUE muda (sem baixar).
 *   2. aplicarAtualizacao(manifest) → baixa e aplica (só quando o usuário confirma).
 *
 * Transporte: plugin oficial `@tauri-apps/plugin-http` (requisição pelo Rust, sem CORS).
 * Só roda no desktop; no navegador não há base persistente para atualizar.
 */
import { isTauri } from "../env";
import type { BaseManifest } from "./manifest";
import { LocalUpdateService, type ApplyResult } from "./UpdateService";
import { loadBaseJson } from "../dataSource";
import { UPDATE_BASE_URL, UPDATE_MANIFEST_URL, isUpdateConfigured } from "./updateConfig";

interface CatalogLite {
  structures: { id: string; sha256: string; categoria?: string }[];
}

export type VerificacaoResultado =
  | { status: "unconfigured" }
  | { status: "unsupported" }
  | { status: "up_to_date"; current: string | null }
  | {
      status: "disponivel";
      current: string | null;
      available: string;
      novas: string[];
      alteradas: string[];
      notes?: string;
      manifest: BaseManifest;
    }
  | { status: "error"; message: string };

export type AplicacaoResultado =
  | { status: "applied"; applied: number; dataVersion: string }
  | { status: "error"; message: string };

async function httpGetBytes(url: string): Promise<Uint8Array> {
  const { fetch } = await import("@tauri-apps/plugin-http");
  // cache-bust no manifest/catalog para refletir publicações recentes (CDN do GitHub).
  const sep = url.includes("?") ? "&" : "?";
  const res = await fetch(`${url}${sep}_=${Date.now()}`, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function httpGetJson<T>(url: string): Promise<T> {
  const bytes = await httpGetBytes(url);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/** Etapa 1: verifica e descreve o que mudaria, SEM baixar nada. */
export async function verificarAtualizacao(): Promise<VerificacaoResultado> {
  if (!isTauri()) return { status: "unsupported" };
  if (!isUpdateConfigured()) return { status: "unconfigured" };

  try {
    const svc = new LocalUpdateService();
    const manifest = await httpGetJson<BaseManifest>(UPDATE_MANIFEST_URL);
    const check = svc.checkForUpdate(manifest);
    if (!check.hasUpdate) return { status: "up_to_date", current: check.current };

    // Diff de estruturas: compara o catálogo remoto com o local (por id + sha).
    const novas: string[] = [];
    const alteradas: string[] = [];
    try {
      const remoto = await httpGetJson<CatalogLite>(`${UPDATE_BASE_URL}/catalog.json`);
      const local = await loadBaseJson<CatalogLite>("catalog.json").catch(() => ({ structures: [] }));
      const localMap = new Map(local.structures.map((s) => [s.id, s.sha256]));
      for (const s of remoto.structures) {
        if (!localMap.has(s.id)) novas.push(s.id);
        else if (localMap.get(s.id) !== s.sha256) alteradas.push(s.id);
      }
    } catch {
      /* sem catálogo p/ detalhar — segue só com a versão */
    }

    return {
      status: "disponivel",
      current: check.current,
      available: check.available ?? manifest.data_version,
      novas,
      alteradas,
      notes: manifest.notes,
      manifest,
    };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}

/** Etapa 2: baixa e aplica a atualização descrita pelo manifest. */
export async function aplicarAtualizacao(manifest: BaseManifest): Promise<AplicacaoResultado> {
  if (!isTauri()) return { status: "error", message: "Disponível apenas no desktop." };
  try {
    const svc = new LocalUpdateService();
    const result: ApplyResult = await svc.applyUpdate(manifest, (hostName) =>
      httpGetBytes(`${UPDATE_BASE_URL}/${hostName}`),
    );
    return { status: "applied", applied: result.applied, dataVersion: result.dataVersion };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}
