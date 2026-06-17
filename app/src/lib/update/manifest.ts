/**
 * Formato do manifest de atualização de BASE (costura — Fase 5).
 * Um servidor de distribuição futuro publicaria um arquivo neste formato; o app
 * compara `data_version` com o que está em %APPDATA%/base para decidir se atualiza.
 */

export interface ManifestFile {
  /** caminho do arquivo NA BASE (destino); ex.: "materiais.json" ou "structures/S1.json" */
  name: string;
  /** checksum SHA-256 (hex) do conteúdo esperado */
  sha256: string;
  /** tamanho em bytes (informativo) */
  bytes: number;
  /**
   * Nome do arquivo NO HOST, quando difere de `name`. Hosts como GitHub Releases
   * têm namespace plano (sem `/`), então `structures/S1.json` é publicado como o
   * asset achatado `structures__S1.json`. A URL de download = UPDATE_BASE_URL + asset.
   * Ausente ⇒ baixa de UPDATE_BASE_URL + name.
   */
  asset?: string;
}

export interface BaseManifest {
  /** versão da base remota; comparada com a local */
  data_version: string;
  /** arquivos que compõem a base */
  files: ManifestFile[];
  /** notas de versão (opcional) */
  notes?: string;
}
