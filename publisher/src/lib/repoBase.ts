// Carrega o estado ATUAL da base publicada no repo (manifest, catalog, materiais).
// Usado para diff/validação antes de publicar. Tolera repo vazio (1ª publicação).

import { lerArquivoTexto, type RepoConfig } from "./github";
import type { BaseManifest, Catalog, Material } from "./types";

export interface EstadoBase {
  manifest: BaseManifest | null;
  catalog: Catalog | null;
  idsMateriais: Set<number>;
}

async function lerJson<T>(cfg: RepoConfig, path: string): Promise<T | null> {
  const txt = await lerArquivoTexto(cfg, path);
  return txt == null ? null : (JSON.parse(txt) as T);
}

export async function carregarEstadoBase(cfg: RepoConfig): Promise<EstadoBase> {
  const [manifest, catalog, materiais] = await Promise.all([
    lerJson<BaseManifest>(cfg, "manifest.json"),
    lerJson<Catalog>(cfg, "catalog.json"),
    lerJson<Material[]>(cfg, "materiais.json"),
  ]);
  const idsMateriais = new Set<number>((materiais ?? []).map((m) => m.id));
  return { manifest, catalog, idsMateriais };
}
