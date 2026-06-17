import type { BaseManifest } from "./manifest";
import { getDataVersion, loadBaseJson, setBaseInfo, type BaseInfo } from "../dataSource";

/**
 * Atualização de BASE pela rede (Fase 3). O DOWNLOAD é injetado (`fetchFile`) para
 * desacoplar do host (GitHub Releases hoje) e permitir simular/testar.
 *
 * Fluxo de `applyUpdate`:
 *   1. monta o mapa de checksums LOCAL (.checksums.json p/ topo + catalog.json p/
 *      estruturas) — sem reler/hashear 876 arquivos;
 *   2. baixa só os arquivos cujo sha256 difere do remoto;
 *   3. CONFERE o sha256 de cada download (integridade/antiadulteração);
 *   4. grava de forma atômica via comando Rust `apply_base_update` (não toca user.db).
 *
 * Só faz sentido no desktop (Tauri); no navegador não há base persistente.
 */

export interface UpdateCheckResult {
  current: string | null;
  available: string | null;
  hasUpdate: boolean;
}

export interface ApplyResult {
  applied: number;
  dataVersion: string;
}

export interface UpdateService {
  checkForUpdate(remote: BaseManifest): UpdateCheckResult;
  applyUpdate(
    remote: BaseManifest,
    fetchFile: (hostName: string) => Promise<Uint8Array>,
  ): Promise<ApplyResult>;
}

/**
 * Decide quais arquivos do manifest remoto precisam ser baixados, comparando o
 * sha256 remoto com o checksum LOCAL. Função pura (testável sem rede/Tauri).
 */
export function planDownloads(
  remote: BaseManifest,
  local: Record<string, string>,
): BaseManifest["files"] {
  return remote.files.filter((f) => local[f.name] !== f.sha256);
}

async function sha256hex(bytes: Uint8Array): Promise<string> {
  // cast: a lib DOM nova tipa Uint8Array<ArrayBufferLike>, mas digest aceita o buffer.
  const buf = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function localChecksums(): Promise<Record<string, string>> {
  const local: Record<string, string> = {};
  try {
    const top = await loadBaseJson<{ name: string; sha256: string }[]>(".checksums.json");
    for (const c of top) local[c.name] = c.sha256;
  } catch {
    /* sem checksums de topo → tudo será baixado */
  }
  try {
    const cat = await loadBaseJson<{ structures: { file: string; sha256: string }[] }>(
      "catalog.json",
    );
    for (const s of cat.structures) local[s.file] = s.sha256;
  } catch {
    /* sem catalog local → estruturas serão baixadas */
  }
  return local;
}

export class LocalUpdateService implements UpdateService {
  checkForUpdate(remote: BaseManifest): UpdateCheckResult {
    const current = getDataVersion();
    const available = remote?.data_version ?? null;
    return {
      current,
      available,
      hasUpdate: !!available && available !== current,
    };
  }

  async applyUpdate(
    remote: BaseManifest,
    fetchFile: (hostName: string) => Promise<Uint8Array>,
  ): Promise<ApplyResult> {
    const local = await localChecksums();
    const changed = planDownloads(remote, local);

    const payload: { name: string; contents: number[] }[] = [];
    for (const f of changed) {
      const hostName = f.asset ?? f.name;
      const bytes = await fetchFile(hostName);
      const got = await sha256hex(bytes);
      if (got !== f.sha256) {
        // Integridade falhou → NÃO aplica nada (base anterior preservada).
        throw new Error(
          `Checksum divergente em ${f.name}: esperado ${f.sha256}, veio ${got}. ` +
            `Atualização abortada; a base atual foi mantida.`,
        );
      }
      payload.push({ name: f.name, contents: Array.from(bytes) });
    }

    if (payload.length === 0) {
      return { applied: 0, dataVersion: remote.data_version };
    }

    const { invoke } = await import("@tauri-apps/api/core");
    const info = await invoke<BaseInfo>("apply_base_update", {
      files: payload,
      dataVersion: remote.data_version,
    });
    setBaseInfo(info);
    return { applied: payload.length, dataVersion: info.data_version };
  }
}
