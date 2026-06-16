import type { BaseManifest } from "./manifest";
import { getDataVersion } from "../dataSource";

/**
 * COSTURA de atualização de base (Fase 5). A comparação de versões e o ponto de
 * aplicação existem; o DOWNLOAD REMOTO está DESABILITADO (stub) de propósito.
 *
 * Quando o backend de distribuição existir, injeta-se um `fetchFile` real em
 * `applyUpdate` (que então gravaria os arquivos em %APPDATA%/base + novo
 * data_version + novos checksums, validando cada arquivo antes de trocar).
 *
 * Prova arquitetural já válida HOJE: como o app lê a base de %APPDATA% a cada
 * execução, substituir manualmente os arquivos em base/ e ajustar `data_version`
 * já é reconhecido — sem reinstalar o .exe.
 */

export interface UpdateCheckResult {
  current: string | null;
  available: string | null;
  hasUpdate: boolean;
}

export interface UpdateService {
  checkForUpdate(remote: BaseManifest): UpdateCheckResult;
  applyUpdate(
    remote: BaseManifest,
    fetchFile: (name: string) => Promise<Uint8Array>,
  ): Promise<void>;
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
    _remote: BaseManifest,
    _fetchFile: (name: string) => Promise<Uint8Array>,
  ): Promise<void> {
    throw new Error(
      "Atualização remota ainda não habilitada (costura). Para atualizar a base " +
        "manualmente: substitua os arquivos em %APPDATA%/<id>/base e ajuste data_version.",
    );
  }
}
