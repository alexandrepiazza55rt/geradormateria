// Cliente da API do GitHub (REST + Git Data API). Só `fetch` + token (PAT
// fine-grained com Contents: read/write). Publica via COMMIT (não release-asset),
// o que é CORS-limpo no navegador e dá histórico de versões real.

import type { ArquivoParaCommit } from "./manifesto";

const API = "https://api.github.com";

export interface RepoRef {
  owner: string;
  name: string;
  branch: string;
}

export interface RepoConfig extends RepoRef {
  token: string;
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function gh<T>(cfg: RepoConfig, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers(cfg.token), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detalhe = "";
    try {
      const j = await res.json();
      detalhe = j.message ?? JSON.stringify(j);
    } catch {
      detalhe = await res.text();
    }
    throw new Error(`GitHub ${res.status}: ${detalhe}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Lê o texto de um arquivo do repo (Contents API, sempre fresco). null se 404. */
export async function lerArquivoTexto(cfg: RepoConfig, path: string): Promise<string | null> {
  try {
    const r = await gh<{ content: string; encoding: string }>(
      cfg,
      `/repos/${cfg.owner}/${cfg.name}/contents/${path}?ref=${cfg.branch}`,
    );
    return r.encoding === "base64" ? fromBase64(r.content) : r.content;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("GitHub 404")) return null;
    throw e;
  }
}

export interface RepoInfo {
  full_name: string;
  private: boolean;
  default_branch: string;
}

/** Testa o token + acesso ao repo (GET /repos/{owner}/{name}). */
export function testarConexao(cfg: RepoConfig): Promise<RepoInfo> {
  return gh<RepoInfo>(cfg, `/repos/${cfg.owner}/${cfg.name}`);
}

export interface ReleaseInfo {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  draft: boolean;
}

export function listarReleases(cfg: RepoConfig): Promise<ReleaseInfo[]> {
  return gh<ReleaseInfo[]>(cfg, `/repos/${cfg.owner}/${cfg.name}/releases?per_page=30`);
}

/**
 * Ativa/desativa uma release (rascunho). Reversível: `draft=true` some da lista pública,
 * `draft=false` reativa. NÃO altera o conteúdo da base que os clientes baixam.
 */
export function definirRascunhoRelease(
  cfg: RepoConfig,
  releaseId: number,
  draft: boolean,
): Promise<ReleaseInfo> {
  return gh<ReleaseInfo>(cfg, `/repos/${cfg.owner}/${cfg.name}/releases/${releaseId}`, {
    method: "PATCH",
    body: JSON.stringify({ draft }),
  });
}

/**
 * Exclui uma release de vez e também apaga a tag git correspondente (best-effort),
 * para a versão sumir do histórico. NÃO altera o conteúdo da base já publicado.
 */
export async function excluirRelease(
  cfg: RepoConfig,
  releaseId: number,
  tag?: string,
): Promise<void> {
  const base = `/repos/${cfg.owner}/${cfg.name}`;
  await gh<void>(cfg, `${base}/releases/${releaseId}`, { method: "DELETE" });
  if (tag) {
    try {
      await gh<void>(cfg, `${base}/git/refs/tags/${encodeURIComponent(tag)}`, { method: "DELETE" });
    } catch {
      /* tag pode não existir (release era rascunho) — ignora */
    }
  }
}

/**
 * Publica um conjunto de arquivos num único commit (blobs → tree → commit → ref) e,
 * em seguida, cria uma release leve (tag + notas) como marco de versão.
 * Retorna a URL do commit.
 */
export async function publicar(
  cfg: RepoConfig,
  arquivos: ArquivoParaCommit[],
  mensagem: string,
  tag: string,
  notas: string,
  exclusoes: string[] = [],
): Promise<{ commitUrl: string; releaseUrl: string }> {
  const base = `/repos/${cfg.owner}/${cfg.name}`;

  // 1) ref atual do branch → commit base → tree base
  const ref = await gh<{ object: { sha: string } }>(cfg, `${base}/git/ref/heads/${cfg.branch}`);
  const baseCommitSha = ref.object.sha;
  const baseCommit = await gh<{ tree: { sha: string } }>(cfg, `${base}/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  // 2) blobs de cada arquivo
  const treeEntries: { path: string; mode: string; type: string; sha: string | null }[] = [];
  for (const a of arquivos) {
    const blob = await gh<{ sha: string }>(cfg, `${base}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: toBase64(a.content), encoding: "base64" }),
    });
    treeEntries.push({ path: a.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  // exclusões: entrada com sha null remove o arquivo do tree (apaga do repo).
  for (const path of exclusoes) {
    treeEntries.push({ path, mode: "100644", type: "blob", sha: null });
  }

  // 3) tree (sobre a base) → 4) commit → 5) atualiza a ref
  const tree = await gh<{ sha: string }>(cfg, `${base}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  const commit = await gh<{ sha: string; html_url: string }>(cfg, `${base}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message: mensagem, tree: tree.sha, parents: [baseCommitSha] }),
  });
  await gh(cfg, `${base}/git/refs/heads/${cfg.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  // 6) release leve (marco de versão). A tag aponta para o commit recém-criado.
  let releaseUrl = "";
  try {
    const rel = await gh<{ html_url: string }>(cfg, `${base}/releases`, {
      method: "POST",
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: commit.sha,
        name: tag,
        body: notas,
      }),
    });
    releaseUrl = rel.html_url;
  } catch (e) {
    // Falha na release não invalida o commit (que é o que importa p/ o CDN).
    console.warn("release não criada:", e);
  }

  return { commitUrl: commit.html_url, releaseUrl };
}
