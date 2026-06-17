// Configuração do repositório + token, persistida no navegador (localStorage).
// O token só vai para api.github.com; o painel é estático (sem backend).

import type { RepoConfig } from "./github";

const KEY = "publisher_config_v1";
const TOKEN_KEY = "publisher_token_v1";

export interface ConfigSemToken {
  owner: string;
  name: string;
  branch: string;
}

export function carregarConfig(): ConfigSemToken {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ConfigSemToken;
  } catch {
    /* ignore */
  }
  return { owner: "", name: "gerador-base", branch: "main" };
}

export function salvarConfig(c: ConfigSemToken): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

/** Token guardado à parte; pode-se optar por não persistir (só nesta sessão). */
export function carregarToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? "";
}

export function salvarToken(token: string, lembrar: boolean): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  if (lembrar) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function montarRepoConfig(c: ConfigSemToken, token: string): RepoConfig {
  return { ...c, token };
}

export function configCompleta(c: ConfigSemToken, token: string): boolean {
  return c.owner.trim() !== "" && c.name.trim() !== "" && token.trim() !== "";
}
