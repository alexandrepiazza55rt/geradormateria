// Persistência local de overrides de preço. LocalStorage com chave versionada.

import type { PrecoMaterial } from "./types";
import { getStorageBackend } from "../storageBackend";

export const STORAGE_KEY_OVERRIDES = "precos_overrides_v1";

export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function default_storage(): StorageBackend | null {
  return getStorageBackend();
}

export function carregar_overrides(storage?: StorageBackend): PrecoMaterial[] {
  const s = storage ?? default_storage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY_OVERRIDES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PrecoMaterial[];
  } catch (err) {
    console.error(`${STORAGE_KEY_OVERRIDES} corrompido, ignorando:`, err);
    return [];
  }
}

export function salvar_overrides(
  overrides: PrecoMaterial[],
  storage?: StorageBackend,
): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
  } catch (err) {
    console.error(`não foi possível salvar ${STORAGE_KEY_OVERRIDES}:`, err);
  }
}

export function limpar_overrides(storage?: StorageBackend): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY_OVERRIDES);
  } catch {
    /* silenciar — apagar nunca pode quebrar o app */
  }
}
