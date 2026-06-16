/**
 * Formato do manifest de atualização de BASE (costura — Fase 5).
 * Um servidor de distribuição futuro publicaria um arquivo neste formato; o app
 * compara `data_version` com o que está em %APPDATA%/base para decidir se atualiza.
 */

export interface ManifestFile {
  /** nome do arquivo na base (ex.: "estruturas.json") */
  name: string;
  /** checksum SHA-256 (hex) do conteúdo esperado */
  sha256: string;
  /** tamanho em bytes (informativo) */
  bytes: number;
}

export interface BaseManifest {
  /** versão da base remota; comparada com a local */
  data_version: string;
  /** arquivos que compõem a base */
  files: ManifestFile[];
  /** notas de versão (opcional) */
  notes?: string;
}
