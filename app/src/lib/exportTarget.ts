import { isTauri } from "./env";

/**
 * Alvo de EXPORTAÇÃO (xlsx/pdf/csv).
 *
 * - Web/dev: dispara download do navegador (Blob + âncora) — comportamento atual.
 * - Tauri: abre o diálogo nativo "Salvar como" (plugin-dialog) e grava no disco
 *   via comando Rust (write_file_*), deixando o usuário escolher onde salvar.
 *
 * As funções retornam `false` quando o usuário cancela o diálogo (Tauri).
 */

export interface SaveFilter {
  name: string;
  extensions: string[];
}

async function saveViaDialog(
  defaultName: string,
  filters: SaveFilter[] | undefined,
  write: (path: string) => Promise<void>,
): Promise<boolean> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  const path = await save({ defaultPath: defaultName, filters });
  if (!path) return false;
  await write(path);
  return true;
}

function triggerBrowserDownload(blob: Blob, name: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function freshArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // Copia para um buffer "limpo" (evita avisos de SharedArrayBuffer).
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return ab;
}

export async function saveBinary(
  defaultName: string,
  bytes: Uint8Array,
  mime: string,
  filters?: SaveFilter[],
): Promise<boolean> {
  if (isTauri()) {
    return saveViaDialog(defaultName, filters, async (path) => {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("write_file_bytes", { path, contents: Array.from(bytes) });
    });
  }
  triggerBrowserDownload(new Blob([freshArrayBuffer(bytes)], { type: mime }), defaultName);
  return true;
}

export async function saveText(
  defaultName: string,
  text: string,
  mime: string,
  filters?: SaveFilter[],
): Promise<boolean> {
  if (isTauri()) {
    return saveViaDialog(defaultName, filters, async (path) => {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("write_file_text", { path, contents: text });
    });
  }
  triggerBrowserDownload(new Blob([text], { type: mime }), defaultName);
  return true;
}

export const MIME_XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const MIME_PDF = "application/pdf";
export const MIME_CSV = "text/csv;charset=utf-8";

export const FILTER_XLSX: SaveFilter[] = [{ name: "Planilha Excel", extensions: ["xlsx"] }];
export const FILTER_PDF: SaveFilter[] = [{ name: "PDF", extensions: ["pdf"] }];
export const FILTER_CSV: SaveFilter[] = [{ name: "CSV", extensions: ["csv"] }];
