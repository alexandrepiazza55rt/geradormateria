import { describe, it, expect } from "vitest";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex } from "@noble/hashes/utils";
import { verificarToken, type TokenPayload } from "../token";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Replica EXATAMENTE o formato do servidor (license-server/src/token.ts).
function assinar(payload: TokenPayload, priv: Uint8Array): string {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = ed.sign(new TextEncoder().encode(body), priv);
  return `${body}.${b64url(sig)}`;
}

const payload: TokenPayload = {
  v: 1, id_licenca: "uuid-1", produto: "gerador-materiais", fingerprint_hash: "fp-1",
  emitido_em: "2026-06-17T00:00:00Z", expira_em: "2027-06-17T00:00:00Z", dias_carencia: 15, estado: "ATIVA",
};

describe("verificarToken (cliente)", () => {
  it("aceita token assinado com a chave correspondente", () => {
    const priv = ed.utils.randomPrivateKey();
    const pub = bytesToHex(ed.getPublicKey(priv));
    const r = verificarToken(assinar(payload, priv), pub);
    expect(r.valido).toBe(true);
    expect(r.payload?.id_licenca).toBe("uuid-1");
    expect(r.payload?.fingerprint_hash).toBe("fp-1");
  });

  it("rejeita token adulterado", () => {
    const priv = ed.utils.randomPrivateKey();
    const pub = bytesToHex(ed.getPublicKey(priv));
    const t = assinar(payload, priv);
    const [body, sig] = t.split(".");
    const mexido = body.slice(0, -2) + (body.endsWith("AA") ? "BB" : "AA") + "." + sig;
    expect(verificarToken(mexido, pub).valido).toBe(false);
  });

  it("rejeita token de outra chave", () => {
    const a = ed.utils.randomPrivateKey();
    const b = ed.utils.randomPrivateKey();
    const t = assinar(payload, a);
    expect(verificarToken(t, bytesToHex(ed.getPublicKey(b))).valido).toBe(false);
  });

  it("retorna inválido com chave pública vazia (gate desligado)", () => {
    const priv = ed.utils.randomPrivateKey();
    expect(verificarToken(assinar(payload, priv), "").valido).toBe(false);
  });
});
