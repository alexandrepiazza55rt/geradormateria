/**
 * Configuração do canal de atualização de BASE (Fase 3).
 *
 * A base é publicada pelo PAINEL WEB (publisher/) num repositório GitHub PÚBLICO de
 * dados (ex.: `gerador-base`), via commit. O app baixa direto do repositório por
 * `raw.githubusercontent.com` — como o download é feito pelo plugin-http (lado Rust),
 * não há problema de CORS, e o `raw` sempre reflete o estado mais recente do branch.
 *
 * ⚠️ PREENCHER `GH_OWNER` com o seu usuário/organização do GitHub. Enquanto estiver
 * vazio, o botão "Verificar atualizações" avisa que o canal não está configurado.
 */

// Preencha estes três (definidos no onboarding do GitHub):
const GH_OWNER = ""; // ex.: "seu-usuario"
const GH_REPO = "gerador-base";
const GH_BRANCH = "main";

export const UPDATE_BASE_URL = GH_OWNER
  ? `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}`
  : "";

/** URL do manifest. Por padrão, UPDATE_BASE_URL + "/manifest.json". */
export const UPDATE_MANIFEST_URL = UPDATE_BASE_URL ? `${UPDATE_BASE_URL}/manifest.json` : "";

export function isUpdateConfigured(): boolean {
  return UPDATE_BASE_URL.length > 0;
}
