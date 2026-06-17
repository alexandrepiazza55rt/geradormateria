import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { gerarParEd25519, randomNonce } from "../src/crypto";
import { verificarToken } from "../src/token";

// ─── D1 simulado em memória (suporta apenas as queries usadas pelo servidor) ───
interface Row { [k: string]: unknown }
class FakeDB {
  licencas: Row[] = [];
  nonces = new Set<string>();
  auditoria: Row[] = [];
  prepare(sql: string) {
    const self = this;
    let args: unknown[] = [];
    return {
      bind(...a: unknown[]) { args = a; return this; },
      async run() { return self._run(sql, args); },
      async first() { return self._first(sql, args); },
      async all() { return { results: self._all(sql, args) }; },
    };
  }
  _run(sql: string, a: unknown[]) {
    if (sql.includes("INSERT INTO auditoria")) { this.auditoria.push({}); return { meta: { changes: 1 } }; }
    if (sql.includes("INSERT INTO licencas")) {
      this.licencas.push({ id: a[0], chave_hash: a[1], chave_prefixo: a[2], produto: a[3], estado: a[4], expira_em: a[5], cliente_nome: a[6], criada_em: a[7], criada_por: a[8], fingerprint_hash: null, ativada_em: null, ultima_revalidacao_em: null });
      return { meta: { changes: 1 } };
    }
    if (sql.includes("INSERT INTO nonces")) {
      if (this.nonces.has(a[0] as string)) throw new Error("UNIQUE");
      this.nonces.add(a[0] as string); return { meta: { changes: 1 } };
    }
    if (sql.includes("SET fingerprint_hash=?, estado='ATIVA'")) { // bind atômico
      const row = this.licencas.find((r) => r.id === a[2] && r.fingerprint_hash == null);
      if (!row) return { meta: { changes: 0 } };
      row.fingerprint_hash = a[0]; row.estado = "ATIVA"; row.ativada_em ??= a[1];
      return { meta: { changes: 1 } };
    }
    if (sql.includes("SET ultima_revalidacao_em=? WHERE id=?")) {
      const row = this.licencas.find((r) => r.id === a[1]); if (row) row.ultima_revalidacao_em = a[0];
      return { meta: { changes: row ? 1 : 0 } };
    }
    if (sql.includes("SET estado=? WHERE id=?")) {
      const row = this.licencas.find((r) => r.id === a[1]); if (row) row.estado = a[0];
      return { meta: { changes: 1 } };
    }
    if (sql.includes("SET expira_em=?, estado=? WHERE id=?")) {
      const row = this.licencas.find((r) => r.id === a[2]); if (row) { row.expira_em = a[0]; row.estado = a[1]; }
      return { meta: { changes: 1 } };
    }
    if (sql.includes("SET fingerprint_hash=NULL")) {
      const row = this.licencas.find((r) => r.id === a[0]); if (row) { row.fingerprint_hash = null; row.estado = "CRIADA"; row.ultima_revalidacao_em = null; }
      return { meta: { changes: 1 } };
    }
    return { meta: { changes: 0 } };
  }
  _first(sql: string, a: unknown[]) {
    if (sql.includes("WHERE chave_hash = ?")) return this.licencas.find((r) => r.chave_hash === a[0]) ?? null;
    if (sql.includes("WHERE id = ?")) return this.licencas.find((r) => r.id === a[0]) ?? null;
    return null;
  }
  _all(sql: string, _a: unknown[]) {
    if (sql.includes("ORDER BY criada_em DESC")) return [...this.licencas];
    return [];
  }
}

const { privHex, pubHex } = gerarParEd25519();
let db: FakeDB;
const env = () => ({ DB: db as unknown as D1Database, LICENSE_SIGNING_KEY: privHex, ADMIN_TOKEN: "segredo-admin", PRODUTO: "gerador-materiais", DIAS_CARENCIA: "15" });
const adminHdr = { Authorization: "Bearer segredo-admin", "Content-Type": "application/json" };

async function criarLicenca(): Promise<{ id: string; chave: string }> {
  const res = await app.request("/v1/admin/licencas", { method: "POST", headers: adminHdr, body: JSON.stringify({ cliente_nome: "Teste", dias_validade: 365 }) }, env());
  return res.json();
}
function ativar(chave: string, fp: string) {
  return app.request("/v1/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chave, fingerprint_hash: fp, nonce: randomNonce() }) }, env());
}

beforeEach(() => { db = new FakeDB(); });

describe("admin", () => {
  it("exige token de admin", async () => {
    const r = await app.request("/v1/admin/licencas", { method: "GET" }, env());
    expect(r.status).toBe(401);
  });
  it("cria licença e devolve a chave uma vez", async () => {
    const { id, chave } = await criarLicenca();
    expect(id).toBeTruthy();
    expect(chave).toMatch(/^[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$/);
  });
});

describe("ativação e bind", () => {
  it("ativa numa máquina e o token é válido", async () => {
    const { id, chave } = await criarLicenca();
    const res = await ativar(chave, "fp-maquina-1");
    expect(res.status).toBe(200);
    const { token } = (await res.json()) as { token: string };
    const v = verificarToken(token, pubHex);
    expect(v.valido).toBe(true);
    expect(v.payload?.id_licenca).toBe(id);
    expect(v.payload?.fingerprint_hash).toBe("fp-maquina-1");
  });

  it("reativa na MESMA máquina sem erro", async () => {
    const { chave } = await criarLicenca();
    await ativar(chave, "fp-1");
    const res = await ativar(chave, "fp-1");
    expect(res.status).toBe(200);
  });

  it("REJEITA a mesma chave em OUTRA máquina", async () => {
    const { chave } = await criarLicenca();
    await ativar(chave, "fp-1");
    const res = await ativar(chave, "fp-2-outra");
    expect(res.status).toBe(409);
  });

  it("rejeita chave com checksum inválido", async () => {
    // AAAAA…A tem checksum válido (=A); trocar o dígito verificador p/ B quebra o checksum.
    const res = await ativar("AAAAA-AAAAA-AAAAA-AAAAB", "fp-1");
    expect(res.status).toBe(400);
  });

  it("rejeita replay (nonce repetido)", async () => {
    const { chave } = await criarLicenca();
    const nonce = randomNonce();
    const body = JSON.stringify({ chave, fingerprint_hash: "fp-1", nonce });
    const h = { "Content-Type": "application/json" };
    const r1 = await app.request("/v1/activate", { method: "POST", headers: h, body }, env());
    const r2 = await app.request("/v1/activate", { method: "POST", headers: h, body }, env());
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(409);
  });
});

describe("revalidação", () => {
  it("ATIVA quando ok; REVOGADA após revogar no admin (trava)", async () => {
    const { id, chave } = await criarLicenca();
    await ativar(chave, "fp-1");
    const ok = await app.request("/v1/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_licenca: id, fingerprint_hash: "fp-1" }) }, env());
    expect(((await ok.json()) as { estado: string }).estado).toBe("ATIVA");

    await app.request(`/v1/admin/licencas/${id}/revogar`, { method: "POST", headers: adminHdr }, env());
    const dep = await app.request("/v1/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_licenca: id, fingerprint_hash: "fp-1" }) }, env());
    expect(((await dep.json()) as { estado: string }).estado).toBe("REVOGADA");
  });

  it("trava (OUTRA_MAQUINA) se o fingerprint não bate", async () => {
    const { id, chave } = await criarLicenca();
    await ativar(chave, "fp-1");
    const r = await app.request("/v1/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_licenca: id, fingerprint_hash: "fp-OUTRA" }) }, env());
    expect(((await r.json()) as { estado: string }).estado).toBe("OUTRA_MAQUINA");
  });
});
