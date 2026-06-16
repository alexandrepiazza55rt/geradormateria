// Persistência local de Clientes (mini-CRM).
// Mesmo padrão de storage.ts / configStorage.ts / orcamentosSalvosStorage.ts.

import type { Cliente } from "./types";
import type { StorageBackend } from "./storage";
import { getStorageBackend } from "../storageBackend";

export const STORAGE_KEY_CLIENTES = "clientes_v1";

function default_storage(): StorageBackend | null {
  return getStorageBackend();
}

export function carregar_clientes(storage?: StorageBackend): Cliente[] {
  const s = storage ?? default_storage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY_CLIENTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Cliente[];
  } catch (err) {
    console.error(`${STORAGE_KEY_CLIENTES} corrompido, ignorando:`, err);
    return [];
  }
}

export function salvar_clientes(
  clientes: Cliente[],
  storage?: StorageBackend,
): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
  } catch (err) {
    console.error(`não foi possível salvar ${STORAGE_KEY_CLIENTES}:`, err);
  }
}

export function limpar_clientes(storage?: StorageBackend): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY_CLIENTES);
  } catch {
    /* silenciar */
  }
}
