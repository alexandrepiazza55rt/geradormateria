import type { StorageBackend } from "./orcamento/storage";

/**
 * Registry do backend de persistência ativo (camada de DADOS DO USUÁRIO).
 *
 * - Web/dev: fica indefinido → cai para `window.localStorage` (comportamento atual).
 * - Tauri: o bootstrap chama `setStorageBackend()` com o backend SQLite (cache em
 *   memória + write-behind), preservando a interface SÍNCRONA que os módulos de
 *   storage (`storage.ts`, `clientesStorage.ts`, …) já esperam.
 *
 * Os módulos de storage delegam seu `default_storage()` para `getStorageBackend()`,
 * então trocar o backend aqui troca o destino de TODA a persistência do usuário.
 */
let active: StorageBackend | null | undefined;

export function setStorageBackend(backend: StorageBackend | null): void {
  active = backend;
}

export function getStorageBackend(): StorageBackend | null {
  if (active !== undefined) return active;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
