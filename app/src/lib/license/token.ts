// Verificação OFFLINE do token de licença (Ed25519) com a chave pública embutida.
// Espelha o formato gerado pelo servidor (license-server/src/token.ts).

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export interface TokenPayload {
  v: number;
  id_licenca: string;
  produto: string;
  fingerprint_hash: string;
  emitido_em: string;
  expira_em: string;
  dias_carencia: number;
  estado: string;
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export interface VerificacaoToken {
  valido: boolean;
  payload?: TokenPayload;
}

export function verificarToken(token: string, pubHex: string): VerificacaoToken {
  const partes = token.split(".");
  if (partes.length !== 2 || !pubHex) return { valido: false };
  const [body, sigB64] = partes;
  try {
    const ok = ed.verify(b64urlDecode(sigB64), new TextEncoder().encode(body), hexToBytes(pubHex));
    if (!ok) return { valido: false };
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as TokenPayload;
    return { valido: true, payload };
  } catch {
    return { valido: false };
  }
}
