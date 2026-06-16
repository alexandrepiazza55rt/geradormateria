// Persistência local da ConfigOrcamento. Mesmo padrão de storage.ts dos
// preços (LocalStorage com chave versionada).

import type { ConfigOrcamento } from "./types";
import type { StorageBackend } from "./storage";
import { getStorageBackend } from "../storageBackend";

export const STORAGE_KEY_CONFIG = "config_orcamento_v1";

function default_storage(): StorageBackend | null {
  return getStorageBackend();
}

export function carregar_config(
  storage?: StorageBackend,
): ConfigOrcamento | null {
  const s = storage ?? default_storage();
  if (!s) return null;
  try {
    const raw = s.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ConfigOrcamento;
  } catch (err) {
    console.error(`${STORAGE_KEY_CONFIG} corrompido, ignorando:`, err);
    return null;
  }
}

export function salvar_config(
  c: ConfigOrcamento,
  storage?: StorageBackend,
): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY_CONFIG, JSON.stringify(c));
  } catch (err) {
    console.error(`não foi possível salvar ${STORAGE_KEY_CONFIG}:`, err);
  }
}

export function limpar_config(storage?: StorageBackend): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY_CONFIG);
  } catch {
    /* silenciar */
  }
}
