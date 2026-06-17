import { describe, it, expect } from "vitest";
import { gerarParEd25519, signEd25519, verifyEd25519, sha256hex, b64urlEncode, b64urlDecode } from "../src/crypto";
import { gerarChave, validarFormatoChave, normalizarChave, prefixoChave } from "../src/keys";
import { assinarToken, verificarToken, type TokenPayload } from "../src/token";

const enc = new TextEncoder();

describe("cripto Ed25519", () => {
  it("assina e verifica (round-trip)", () => {
    const { privHex, pubHex } = gerarParEd25519();
    const msg = enc.encode("ola mundo");
    const sig = signEd25519(msg, privHex);
    expect(verifyEd25519(sig, msg, pubHex)).toBe(true);
  });

  it("rejeita mensagem adulterada", () => {
    const { privHex, pubHex } = gerarParEd25519();
    const sig = signEd25519(enc.encode("original"), privHex);
    expect(verifyEd25519(sig, enc.encode("adulterado"), pubHex)).toBe(false);
  });

  it("rejeita chave pública errada", () => {
    const a = gerarParEd25519();
    const b = gerarParEd25519();
    const msg = enc.encode("x");
    const sig = signEd25519(msg, a.privHex);
    expect(verifyEd25519(sig, msg, b.pubHex)).toBe(false);
  });

  it("sha256hex é determinístico e base64url round-trip", () => {
    expect(sha256hex("abc")).toBe(sha256hex("abc"));
    const bytes = new Uint8Array([0, 1, 2, 250, 255]);
    expect([...b64urlDecode(b64urlEncode(bytes))]).toEqual([...bytes]);
  });
});

describe("chaves de licença", () => {
  it("gera chave com formato e checksum válidos", () => {
    for (let i = 0; i < 50; i++) {
      const c = gerarChave();
      expect(c).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
      expect(validarFormatoChave(c)).toBe(true);
    }
  });

  it("detecta erro de digitação (checksum)", () => {
    const c = gerarChave();
    const limpa = normalizarChave(c);
    // troca o primeiro char por outro diferente
    const trocado = (limpa[0] === "0" ? "1" : "0") + limpa.slice(1);
    expect(validarFormatoChave(trocado)).toBe(false);
  });

  it("aceita com/sem hífen e minúsculas", () => {
    const c = gerarChave();
    expect(validarFormatoChave(c.toLowerCase())).toBe(true);
    expect(validarFormatoChave(normalizarChave(c))).toBe(true);
    expect(prefixoChave(c)).toHaveLength(5);
  });
});

describe("token de ativação", () => {
  const payload: TokenPayload = {
    v: 1, id_licenca: "uuid-1", produto: "gerador-materiais",
    fingerprint_hash: "fp123", emitido_em: "2026-06-17T00:00:00Z",
    expira_em: "2027-06-17T00:00:00Z", dias_carencia: 15, estado: "ATIVA",
  };

  it("assina e verifica o token", () => {
    const { privHex, pubHex } = gerarParEd25519();
    const token = assinarToken(payload, privHex);
    const r = verificarToken(token, pubHex);
    expect(r.valido).toBe(true);
    expect(r.payload?.id_licenca).toBe("uuid-1");
  });

  it("rejeita token adulterado", () => {
    const { privHex, pubHex } = gerarParEd25519();
    const token = assinarToken(payload, privHex);
    const [body, sig] = token.split(".");
    const adulterado = body.slice(0, -2) + (body.endsWith("AA") ? "BB" : "AA") + "." + sig;
    expect(verificarToken(adulterado, pubHex).valido).toBe(false);
  });

  it("rejeita token de outra chave", () => {
    const a = gerarParEd25519();
    const b = gerarParEd25519();
    const token = assinarToken(payload, a.privHex);
    expect(verificarToken(token, b.pubHex).valido).toBe(false);
  });
});
