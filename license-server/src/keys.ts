// Geração e validação de CHAVES DE LICENÇA (o que o cliente digita).
// Formato: XXXXX-XXXXX-XXXXX-XXXXX (20 chars, último é dígito verificador).
// Alfabeto Crockford base32 (sem I, L, O, U — evita confusão visual).

const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // 32 chars
const N_DADOS = 19; // chars aleatórios; +1 de checksum = 20

function indice(c: string): number {
  return ALFABETO.indexOf(c);
}

function checksum(chars: string): string {
  let soma = 0;
  for (let i = 0; i < chars.length; i++) {
    soma = (soma * 31 + indice(chars[i])) % 32;
  }
  return ALFABETO[soma];
}

function agrupar(s: string): string {
  return s.match(/.{1,5}/g)!.join("-");
}

/** Gera uma chave aleatória válida (com checksum). */
export function gerarChave(): string {
  const rnd = new Uint8Array(N_DADOS);
  crypto.getRandomValues(rnd);
  let dados = "";
  for (let i = 0; i < N_DADOS; i++) dados += ALFABETO[rnd[i] % 32];
  return agrupar(dados + checksum(dados));
}

/** Valida o FORMATO e o checksum (sem consultar o banco). */
export function validarFormatoChave(chave: string): boolean {
  const limpa = normalizarChave(chave);
  if (limpa.length !== N_DADOS + 1) return false;
  if (![...limpa].every((c) => ALFABETO.includes(c))) return false;
  const dados = limpa.slice(0, N_DADOS);
  const dv = limpa.slice(N_DADOS);
  return checksum(dados) === dv;
}

/** Normaliza para comparação/armazenamento: maiúsculas, sem hífens/espaços. */
export function normalizarChave(chave: string): string {
  return chave.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function prefixoChave(chave: string): string {
  return normalizarChave(chave).slice(0, 5);
}

export function mascararChave(chave: string): string {
  return prefixoChave(chave) + "-•••••-•••••-•••••";
}
