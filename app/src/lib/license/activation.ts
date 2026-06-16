import { isTauri } from "../env";

/**
 * COSTURA de licenciamento (Fase 6). Hoje é NO-OP (sempre ativado). Este é o
 * ÚNICO ponto onde o futuro gate de ativação será plugado (validação de licença
 * + machine fingerprint), chamado no first-run pelo bootstrap.
 *
 * Reservar: uma linha `license` na tabela `meta` do SQLite guardará o estado de
 * ativação quando o fluxo real existir.
 */
export async function ensureActivated(): Promise<boolean> {
  // Futuro: ler licença de meta; se ausente/expirada, abrir gate de ativação e
  // validar contra o backend usando machineFingerprint().
  return true;
}

/** Fingerprint de máquina (stub no Rust). Reservado para o licenciamento. */
export async function machineFingerprint(): Promise<string | null> {
  if (!isTauri()) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("machine_fingerprint");
}
