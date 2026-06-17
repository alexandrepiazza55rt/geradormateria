// Primitivas criptográficas do servidor de licença.
// Ed25519 (assinatura), SHA-256 (hash de chave/fingerprint), base64url, nonce.

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

// Habilita assinatura/verificação SÍNCRONA do @noble/ed25519 (precisa de sha512).
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const enc = new TextEncoder();

export function sha256hex(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? enc.encode(data) : data;
  return bytesToHex(sha256(bytes));
}

export function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Assina uma mensagem com a chave privada (hex). Retorna assinatura (bytes). */
export function signEd25519(message: Uint8Array, privHex: string): Uint8Array {
  return ed.sign(message, hexToBytes(privHex));
}

/** Verifica assinatura com a chave pública (hex). */
export function verifyEd25519(sig: Uint8Array, message: Uint8Array, pubHex: string): boolean {
  try {
    return ed.verify(sig, message, hexToBytes(pubHex));
  } catch {
    return false;
  }
}

/** Par de chaves Ed25519 (hex) — usado pelo gerador de chaves de assinatura. */
export function gerarParEd25519(): { privHex: string; pubHex: string } {
  const priv = ed.utils.randomPrivateKey();
  const pub = ed.getPublicKey(priv);
  return { privHex: bytesToHex(priv), pubHex: bytesToHex(pub) };
}

export function randomNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return bytesToHex(b);
}

export { bytesToHex, hexToBytes };
