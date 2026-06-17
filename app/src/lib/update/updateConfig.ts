/**
 * Configuração do canal de atualização de BASE (Fase 3).
 *
 * Host escolhido: GitHub Releases. Os arquivos do pacote (gerado por
 * `extraction/publish.py`) são subidos como ASSETS de um release. O namespace de
 * assets do GitHub é PLANO (sem `/`), então `structures/S1.json` vira o asset
 * `structures__S1.json` — o `manifest.json` carrega esse mapeamento em `asset`.
 *
 * URLs de um release do GitHub:
 *   manifest:  https://github.com/<owner>/<repo>/releases/download/<tag>/manifest.json
 *   arquivos:  https://github.com/<owner>/<repo>/releases/download/<tag>/<asset>
 *
 * ⚠️ PREENCHER quando o repositório/release existir. Enquanto estiver vazio, o
 * botão "Verificar atualizações" avisa que o canal não está configurado (não quebra).
 * Use uma tag "móvel" (ex.: `base-latest`) que você re-publica, OU aponte para a
 * tag específica da versão atual.
 */

// Ex.: "https://github.com/SEU-USUARIO/SEU-REPO/releases/download/base-latest"
export const UPDATE_BASE_URL = "";

/** URL do manifest. Por padrão, UPDATE_BASE_URL + "/manifest.json". */
export const UPDATE_MANIFEST_URL =
  UPDATE_BASE_URL ? `${UPDATE_BASE_URL}/manifest.json` : "";

export function isUpdateConfigured(): boolean {
  return UPDATE_BASE_URL.length > 0;
}
