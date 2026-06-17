import { isTauri } from "../env";
import { getStorageBackend } from "../storageBackend";
import { verificarToken } from "./token";
import { DIAS_CARENCIA, LICENSE_API_URL, LICENSE_PUBLIC_KEY, licencaConfigurada } from "./licenseConfig";

/**
 * Gate de licença (cliente). Verifica o token assinado offline, revalida na nuvem
 * (heartbeat) e aplica a carência. NUNCA apaga dados — só decide se libera o acesso.
 *
 * Desligado quando o canal não está configurado (URL/chave vazias) ou na web — assim
 * o programa abre normal antes do servidor existir.
 */

export type MotivoBloqueio =
  | "nao_ativado"
  | "invalido"
  | "outra_maquina"
  | "expirada"
  | "revogada"
  | "carencia"
  | "relogio";

export interface StatusLicenca {
  ok: boolean;
  motivo?: MotivoBloqueio;
  expira_em?: string;
}

const K_TOKEN = "license_token";
const K_LAST = "license_last_revalidation";
const TOLERANCIA_RELOGIO_MS = 6 * 3600_000; // 6h de folga p/ fuso/ajuste legítimo

export async function machineFingerprint(): Promise<string | null> {
  if (!isTauri()) return null;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("machine_fingerprint");
}

async function httpPost(url: string, body: unknown): Promise<{ ok: boolean; status: number; [k: string]: unknown }> {
  const { fetch } = await import("@tauri-apps/plugin-http");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* sem corpo */
  }
  return { ok: res.ok, status: res.status, ...json };
}

/** Ativa a licença: envia chave+fingerprint, valida o token e o guarda localmente. */
export async function ativarLicenca(chave: string): Promise<{ ok: boolean; erro?: string }> {
  if (!licencaConfigurada()) return { ok: false, erro: "Canal de licença não configurado." };
  const fp = await machineFingerprint();
  if (!fp) return { ok: false, erro: "Não foi possível identificar a máquina." };
  try {
    const r = await httpPost(`${LICENSE_API_URL}/v1/activate`, {
      chave: chave.trim(),
      fingerprint_hash: fp,
      nonce: crypto.randomUUID(),
    });
    if (!r.ok) return { ok: false, erro: (r.erro as string) ?? "Falha na ativação." };
    const token = r.token as string;
    if (!verificarToken(token, LICENSE_PUBLIC_KEY).valido) {
      return { ok: false, erro: "Token inválido recebido do servidor." };
    }
    const sb = getStorageBackend();
    sb?.setItem(K_TOKEN, token);
    sb?.setItem(K_LAST, new Date().toISOString());
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: `Sem conexão com o servidor de licença. ${(e as Error).message}` };
  }
}

/** Verifica o estado da licença no boot. Retorna se libera e, se não, o motivo. */
export async function ensureActivated(): Promise<StatusLicenca> {
  if (!isTauri() || !licencaConfigurada()) return { ok: true }; // gate desligado

  const sb = getStorageBackend();
  const token = sb?.getItem(K_TOKEN) ?? null;
  if (!token) return { ok: false, motivo: "nao_ativado" };

  const v = verificarToken(token, LICENSE_PUBLIC_KEY);
  if (!v.valido || !v.payload) return { ok: false, motivo: "invalido" };
  const p = v.payload;

  const fp = await machineFingerprint();
  if (fp && p.fingerprint_hash !== fp) return { ok: false, motivo: "outra_maquina" };

  const agora = Date.now();
  if (new Date(p.expira_em).getTime() < agora) return { ok: false, motivo: "expirada", expira_em: p.expira_em };

  // Anti-adulteração: relógio bem antes da última revalidação registrada.
  const lastStr = sb?.getItem(K_LAST);
  const last = lastStr ? new Date(lastStr).getTime() : agora;
  if (agora < last - TOLERANCIA_RELOGIO_MS) return { ok: false, motivo: "relogio" };

  // Heartbeat (se online). Falha de rede → cai na carência.
  try {
    const r = await httpPost(`${LICENSE_API_URL}/v1/revalidate`, {
      id_licenca: p.id_licenca,
      fingerprint_hash: fp,
    });
    const estado = r.estado as string | undefined;
    if (estado === "REVOGADA") return { ok: false, motivo: "revogada" };
    if (estado === "OUTRA_MAQUINA") return { ok: false, motivo: "outra_maquina" };
    if (estado === "EXPIRADA") return { ok: false, motivo: "expirada", expira_em: p.expira_em };
    if (estado === "ATIVA") {
      sb?.setItem(K_LAST, new Date().toISOString());
      return { ok: true, expira_em: p.expira_em };
    }
  } catch {
    /* offline → carência abaixo */
  }

  const diasSemRevalidar = (agora - last) / 86_400_000;
  if (diasSemRevalidar > DIAS_CARENCIA) return { ok: false, motivo: "carencia" };
  return { ok: true, expira_em: p.expira_em };
}

/** Remove a licença local (ex.: para inserir outra chave). Não toca em dados do usuário. */
export function limparLicenca(): void {
  const sb = getStorageBackend();
  sb?.removeItem(K_TOKEN);
  sb?.removeItem(K_LAST);
}
