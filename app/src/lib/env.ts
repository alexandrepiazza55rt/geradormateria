/**
 * Detecção de ambiente: Tauri (desktop) vs navegador (web/dev).
 * Usado pela camada de serviço de dados, persistência e exportação para escolher
 * a implementação certa sem espalhar checagens pelo código.
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
