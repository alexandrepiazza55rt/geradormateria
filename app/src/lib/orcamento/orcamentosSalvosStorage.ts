// Persistência local da lista de orçamentos salvos.
// Mesmo padrão de storage.ts e configStorage.ts.

import type { OrcamentoSalvo } from "./types";
import type { StorageBackend } from "./storage";
import { getStorageBackend } from "../storageBackend";

export const STORAGE_KEY_ORCAMENTOS = "orcamentos_salvos_v1";

function default_storage(): StorageBackend | null {
  return getStorageBackend();
}

export function carregar_orcamentos_salvos(
  storage?: StorageBackend,
): OrcamentoSalvo[] {
  const s = storage ?? default_storage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY_ORCAMENTOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OrcamentoSalvo[];
  } catch (err) {
    console.error(`${STORAGE_KEY_ORCAMENTOS} corrompido, ignorando:`, err);
    return [];
  }
}

export function salvar_orcamentos_salvos(
  arr: OrcamentoSalvo[],
  storage?: StorageBackend,
): boolean {
  const s = storage ?? default_storage();
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY_ORCAMENTOS, JSON.stringify(arr));
    return true;
  } catch (err) {
    console.error(`não foi possível salvar ${STORAGE_KEY_ORCAMENTOS}:`, err);
    return false;
  }
}

export function limpar_orcamentos_salvos(storage?: StorageBackend): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY_ORCAMENTOS);
  } catch {
    /* silenciar */
  }
}
