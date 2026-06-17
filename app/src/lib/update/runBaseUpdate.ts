/**
 * Orquestração de alto nível do update de base (Fase 3) — o que o botão da UI chama.
 *
 * Transporte: plugin oficial `@tauri-apps/plugin-http` (requisição pelo Rust, sem
 * CORS) — funciona com GitHub Releases e com um servidor de simulação em localhost.
 * Só roda no desktop; no navegador não há base persistente para atualizar.
 */
import { isTauri } from "../env";
import type { BaseManifest } from "./manifest";
import { LocalUpdateService, type ApplyResult } from "./UpdateService";
import { UPDATE_BASE_URL, UPDATE_MANIFEST_URL, isUpdateConfigured } from "./updateConfig";

export type UpdateOutcome =
  | { status: "unconfigured" }
  | { status: "unsupported" }
  | { status: "up_to_date"; current: string | null }
  | { status: "applied"; applied: number; dataVersion: string; notes?: string }
  | { status: "error"; message: string };

async function httpGetBytes(url: string): Promise<Uint8Array> {
  const { fetch } = await import("@tauri-apps/plugin-http");
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function httpGetJson<T>(url: string): Promise<T> {
  const bytes = await httpGetBytes(url);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/**
 * Verifica e (se houver) aplica a atualização de base. Idempotente e seguro:
 * nunca toca no `user.db`; em erro de integridade, mantém a base atual.
 */
export async function runBaseUpdate(): Promise<UpdateOutcome> {
  if (!isTauri()) return { status: "unsupported" };
  if (!isUpdateConfigured()) return { status: "unconfigured" };

  try {
    const svc = new LocalUpdateService();
    const manifest = await httpGetJson<BaseManifest>(UPDATE_MANIFEST_URL);
    const check = svc.checkForUpdate(manifest);
    if (!check.hasUpdate) return { status: "up_to_date", current: check.current };

    const result: ApplyResult = await svc.applyUpdate(manifest, (hostName) =>
      httpGetBytes(`${UPDATE_BASE_URL}/${hostName}`),
    );
    return {
      status: "applied",
      applied: result.applied,
      dataVersion: result.dataVersion,
      notes: manifest.notes,
    };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}
