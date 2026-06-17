// Servidor de licença (Cloudflare Worker). Fonte da verdade: valida e assina tokens
// Ed25519. HTTPS nativo (Workers). Anti-replay por nonce; admin protegido por token.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { sha256hex } from "./crypto";
import { gerarChave, normalizarChave, prefixoChave, validarFormatoChave } from "./keys";
import { assinarToken, type TokenPayload } from "./token";
import {
  auditar, buscarPorChaveHash, buscarPorId, criarLicenca, listarLicencas,
  marcarRevalidacao, nonceNovo, renovar, resetBind, setEstado, vincularAtomico,
} from "./db";

interface Env {
  DB: D1Database;
  LICENSE_SIGNING_KEY: string; // secret (hex privada)
  ADMIN_TOKEN: string; // secret
  PRODUTO: string;
  DIAS_CARENCIA: string;
}

const app = new Hono<{ Bindings: Env }>();
app.use("*", cors());

// Rate limit best-effort (por isolate). Produção robusta: regras de WAF/Rate Limiting
// no painel da Cloudflare (documentado em ARQUITETURA_LICENCA.md).
const hits = new Map<string, { n: number; t: number }>();
function rateLimit(ip: string, max = 20, janelaMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > janelaMs) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  h.n++;
  return h.n <= max;
}
const ipDe = (c: { req: { header: (k: string) => string | undefined } }) =>
  c.req.header("CF-Connecting-IP") ?? "local";

function venceu(expira_em: string | null): boolean {
  return !!expira_em && new Date(expira_em).getTime() < Date.now();
}

// ─────────────────────────── ATIVAÇÃO ───────────────────────────
app.post("/v1/activate", async (c) => {
  if (!rateLimit(ipDe(c))) return c.json({ erro: "muitas tentativas" }, 429);
  const { chave, fingerprint_hash, nonce } = await c.req.json().catch(() => ({}));
  if (!chave || !fingerprint_hash || !nonce) return c.json({ erro: "campos faltando" }, 400);
  if (!validarFormatoChave(chave)) return c.json({ erro: "chave inválida" }, 400);
  if (!(await nonceNovo(c.env.DB, nonce))) return c.json({ erro: "requisição repetida" }, 409);

  const chave_hash = sha256hex(normalizarChave(chave));
  const lic = await buscarPorChaveHash(c.env.DB, chave_hash);
  if (!lic) return c.json({ erro: "chave não encontrada" }, 404);
  if (lic.estado === "REVOGADA") return c.json({ erro: "licença desativada" }, 403);
  if (lic.estado === "SUSPENSA") return c.json({ erro: "licença suspensa" }, 403);
  if (venceu(lic.expira_em)) {
    await setEstado(c.env.DB, lic.id, "EXPIRADA", "cliente");
    return c.json({ erro: "licença expirada", expira_em: lic.expira_em }, 403);
  }

  // Bind: livre → vincula; mesma máquina → reativa; outra máquina → rejeita.
  if (lic.fingerprint_hash == null) {
    const ok = await vincularAtomico(c.env.DB, lic.id, fingerprint_hash);
    if (!ok) return c.json({ erro: "corrida de ativação, tente de novo" }, 409);
    await auditar(c.env.DB, lic.id, "ativar", "cliente", null, { fingerprint: prefixoChave(fingerprint_hash) });
  } else if (lic.fingerprint_hash !== fingerprint_hash) {
    return c.json({ erro: "licença vinculada a outra máquina" }, 409);
  }

  const payload: TokenPayload = {
    v: 1, id_licenca: lic.id, produto: c.env.PRODUTO,
    fingerprint_hash, emitido_em: new Date().toISOString(),
    expira_em: lic.expira_em ?? "2999-01-01T00:00:00Z",
    dias_carencia: Number(c.env.DIAS_CARENCIA) || 15, estado: "ATIVA",
  };
  await marcarRevalidacao(c.env.DB, lic.id);
  return c.json({ token: assinarToken(payload, c.env.LICENSE_SIGNING_KEY), expira_em: payload.expira_em });
});

// ─────────────────────────── REVALIDAÇÃO ───────────────────────────
app.post("/v1/revalidate", async (c) => {
  if (!rateLimit(ipDe(c), 60)) return c.json({ erro: "muitas tentativas" }, 429);
  const { id_licenca, fingerprint_hash } = await c.req.json().catch(() => ({}));
  if (!id_licenca || !fingerprint_hash) return c.json({ erro: "campos faltando" }, 400);

  const lic = await buscarPorId(c.env.DB, id_licenca);
  if (!lic) return c.json({ estado: "REVOGADA" }); // não existe mais → travar
  if (lic.fingerprint_hash && lic.fingerprint_hash !== fingerprint_hash) return c.json({ estado: "OUTRA_MAQUINA" });
  if (lic.estado === "REVOGADA" || lic.estado === "SUSPENSA") return c.json({ estado: lic.estado });
  if (venceu(lic.expira_em)) {
    if (lic.estado !== "EXPIRADA") await setEstado(c.env.DB, lic.id, "EXPIRADA", "cliente");
    return c.json({ estado: "EXPIRADA", expira_em: lic.expira_em });
  }
  await marcarRevalidacao(c.env.DB, lic.id);
  return c.json({ estado: "ATIVA", expira_em: lic.expira_em });
});

// ─────────────────────────── ADMIN ───────────────────────────
const admin = new Hono<{ Bindings: Env }>();
admin.use("*", async (c, next) => {
  const auth = c.req.header("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!c.env.ADMIN_TOKEN || token !== c.env.ADMIN_TOKEN) return c.json({ erro: "não autorizado" }, 401);
  await next();
});

admin.post("/licencas", async (c) => {
  const { cliente_nome, dias_validade } = await c.req.json().catch(() => ({}));
  const chave = gerarChave();
  const id = crypto.randomUUID();
  const expira_em = dias_validade
    ? new Date(Date.now() + Number(dias_validade) * 86400_000).toISOString()
    : null;
  await criarLicenca(c.env.DB, {
    id, chave_hash: sha256hex(normalizarChave(chave)), chave_prefixo: prefixoChave(chave),
    produto: c.env.PRODUTO, expira_em, cliente_nome: cliente_nome ?? null, criada_por: "admin",
  });
  // A chave em texto só é devolvida AGORA (nunca mais é recuperável).
  return c.json({ id, chave, expira_em, cliente_nome: cliente_nome ?? null }, 201);
});

admin.get("/licencas", async (c) => {
  const ls = await listarLicencas(c.env.DB);
  return c.json(ls.map((l) => ({
    id: l.id, chave_prefixo: l.chave_prefixo, cliente_nome: l.cliente_nome, estado: l.estado,
    vinculada: !!l.fingerprint_hash, ativada_em: l.ativada_em, expira_em: l.expira_em,
    ultima_revalidacao_em: l.ultima_revalidacao_em, criada_em: l.criada_em,
  })));
});

admin.post("/licencas/:id/revogar", async (c) => {
  const lic = await buscarPorId(c.env.DB, c.req.param("id"));
  if (!lic) return c.json({ erro: "não encontrada" }, 404);
  await setEstado(c.env.DB, lic.id, "REVOGADA", "admin");
  return c.json({ ok: true });
});

admin.post("/licencas/:id/renovar", async (c) => {
  const { dias } = await c.req.json().catch(() => ({}));
  const lic = await buscarPorId(c.env.DB, c.req.param("id"));
  if (!lic) return c.json({ erro: "não encontrada" }, 404);
  const base = lic.expira_em && !venceu(lic.expira_em) ? new Date(lic.expira_em).getTime() : Date.now();
  const nova = new Date(base + (Number(dias) || 365) * 86400_000).toISOString();
  await renovar(c.env.DB, lic.id, nova, "admin");
  return c.json({ ok: true, expira_em: nova });
});

admin.post("/licencas/:id/reset-bind", async (c) => {
  const lic = await buscarPorId(c.env.DB, c.req.param("id"));
  if (!lic) return c.json({ erro: "não encontrada" }, 404);
  await resetBind(c.env.DB, lic.id, "admin");
  return c.json({ ok: true });
});

app.route("/v1/admin", admin);
app.get("/", (c) => c.text("gerador-licenca OK"));

export default app;
