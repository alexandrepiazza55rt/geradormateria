// Cliente da API ADMIN de licença (Cloudflare Worker). Config (URL + token) no
// localStorage, como o GitHub. O token de admin só vai para o Worker (HTTPS).

const KEY = "publisher_license_v1";

export interface LicConfig {
  apiUrl: string;
  adminToken: string;
}

export function carregarLicConfig(): LicConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LicConfig;
  } catch {
    /* ignore */
  }
  return { apiUrl: "", adminToken: "" };
}

export function salvarLicConfig(c: LicConfig): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function licConfigCompleta(c: LicConfig): boolean {
  return c.apiUrl.trim() !== "" && c.adminToken.trim() !== "";
}

async function api<T>(cfg: LicConfig, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${cfg.apiUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${cfg.adminToken}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      msg = (await res.json()).erro ?? msg;
    } catch {
      /* */
    }
    throw new Error(msg);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export interface LicencaResumo {
  id: string;
  chave_prefixo: string;
  cliente_nome: string | null;
  estado: string;
  vinculada: boolean;
  ativada_em: string | null;
  expira_em: string | null;
  ultima_revalidacao_em: string | null;
  criada_em: string;
}

export const listarLicencas = (cfg: LicConfig) => api<LicencaResumo[]>(cfg, "/v1/admin/licencas");

export const criarLicenca = (cfg: LicConfig, body: { cliente_nome?: string; dias_validade?: number }) =>
  api<{ id: string; chave: string; expira_em: string | null }>(cfg, "/v1/admin/licencas", { method: "POST", body: JSON.stringify(body) });

export const revogarLicenca = (cfg: LicConfig, id: string) =>
  api<{ ok: boolean }>(cfg, `/v1/admin/licencas/${id}/revogar`, { method: "POST" });

export const renovarLicenca = (cfg: LicConfig, id: string, dias: number) =>
  api<{ ok: boolean; expira_em: string }>(cfg, `/v1/admin/licencas/${id}/renovar`, { method: "POST", body: JSON.stringify({ dias }) });

export const resetBindLicenca = (cfg: LicConfig, id: string) =>
  api<{ ok: boolean }>(cfg, `/v1/admin/licencas/${id}/reset-bind`, { method: "POST" });
