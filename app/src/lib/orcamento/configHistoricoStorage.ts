// Persistência do log de mudanças de ConfigOrcamento (Correção 7).
// Append-only. Mantém no máximo MAX_ENTRADAS para evitar inflar o LocalStorage.

import type { EntradaHistoricoConfig } from "./types";
import type { StorageBackend } from "./storage";
import { getStorageBackend } from "../storageBackend";

export const STORAGE_KEY_CONFIG_HIST = "config_orcamento_historico_v1";

// Limite generoso: 1000 mudanças cobre anos de uso normal sem encher o storage.
const MAX_ENTRADAS = 1000;

function default_storage(): StorageBackend | null {
  return getStorageBackend();
}

export function carregar_config_historico(
  storage?: StorageBackend,
): EntradaHistoricoConfig[] {
  const s = storage ?? default_storage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY_CONFIG_HIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as EntradaHistoricoConfig[];
  } catch (err) {
    console.error(`${STORAGE_KEY_CONFIG_HIST} corrompido, ignorando:`, err);
    return [];
  }
}

export function salvar_config_historico(
  arr: EntradaHistoricoConfig[],
  storage?: StorageBackend,
): boolean {
  const s = storage ?? default_storage();
  if (!s) return false;
  // Trunca pelos mais recentes se passar do limite
  const para_gravar =
    arr.length > MAX_ENTRADAS ? arr.slice(arr.length - MAX_ENTRADAS) : arr;
  try {
    s.setItem(STORAGE_KEY_CONFIG_HIST, JSON.stringify(para_gravar));
    return true;
  } catch (err) {
    console.error(`não foi possível salvar ${STORAGE_KEY_CONFIG_HIST}:`, err);
    return false;
  }
}

export function limpar_config_historico(storage?: StorageBackend): void {
  const s = storage ?? default_storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY_CONFIG_HIST);
  } catch {
    /* silenciar */
  }
}
