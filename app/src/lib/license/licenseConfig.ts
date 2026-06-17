/**
 * Configuração do licenciamento (cliente).
 *
 * ⚠️ PREENCHER no deploy:
 *  - LICENSE_API_URL: URL do Worker (ex.: "https://gerador-licenca.SEU.workers.dev").
 *  - LICENSE_PUBLIC_KEY: chave PÚBLICA Ed25519 (hex) que verifica o token assinado.
 *
 * Enquanto estiverem VAZIOS, o gate de licença fica DESLIGADO (o programa abre normal) —
 * assim nada quebra antes do servidor existir. Ao preencher, a trava liga.
 */
export const LICENSE_API_URL = "";
export const LICENSE_PUBLIC_KEY = "";
export const DIAS_CARENCIA = 15;

export function licencaConfigurada(): boolean {
  return LICENSE_API_URL.length > 0 && LICENSE_PUBLIC_KEY.length > 0;
}
