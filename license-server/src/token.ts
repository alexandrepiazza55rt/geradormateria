// Token de ativação assinado (Ed25519). Formato:
//   base64url(payload_json) "." base64url(assinatura)
// O cliente verifica offline com a chave PÚBLICA embutida.

import { b64urlDecode, b64urlEncode, signEd25519, verifyEd25519 } from "./crypto";

export interface TokenPayload {
  v: number;
  id_licenca: string;
  produto: string;
  fingerprint_hash: string;
  emitido_em: string; // ISO
  expira_em: string; // ISO
  dias_carencia: number;
  estado: string;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

export function assinarToken(payload: TokenPayload, privHex: string): string {
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = signEd25519(enc.encode(body), privHex);
  return `${body}.${b64urlEncode(sig)}`;
}

export interface VerificacaoToken {
  valido: boolean;
  payload?: TokenPayload;
  motivo?: string;
}

export function verificarToken(token: string, pubHex: string): VerificacaoToken {
  const partes = token.split(".");
  if (partes.length !== 2) return { valido: false, motivo: "formato" };
  const [body, sigB64] = partes;
  let ok = false;
  try {
    ok = verifyEd25519(b64urlDecode(sigB64), enc.encode(body), pubHex);
  } catch {
    return { valido: false, motivo: "assinatura" };
  }
  if (!ok) return { valido: false, motivo: "assinatura" };
  try {
    const payload = JSON.parse(dec.decode(b64urlDecode(body))) as TokenPayload;
    return { valido: true, payload };
  } catch {
    return { valido: false, motivo: "payload" };
  }
}
