// Monta o conjunto de arquivos a publicar (estruturas + catalog.json + manifest.json)
// a partir do estado atual + as estruturas novas/editadas. Porta de build_catalog.py/
// publish.py, no modo CDN (name = caminho real, sem achatar).

import type { BaseManifest, Catalog, CatalogItem, Estrutura, ManifestFile } from "./types";
import { sha256hex } from "./sha";

/** Serialização ESTÁVEL de um arquivo da base (o painel é o único escritor daqui pra frente). */
export function serializar(obj: unknown): string {
  return JSON.stringify(obj, null, 2) + "\n";
}

export interface ArquivoParaCommit {
  path: string;
  content: string;
}

export interface ResultadoPublicacao {
  arquivos: ArquivoParaCommit[];
  manifest: BaseManifest;
  catalog: Catalog;
  novas: string[];
  alteradas: string[];
}

export interface ResultadoExclusao {
  arquivos: ArquivoParaCommit[]; // catalog.json + manifest.json novos
  exclusoes: string[]; // structures/<id>.json a remover do repo
}

/** Monta o commit que REMOVE uma estrutura: tira do catalog + manifest e apaga o arquivo. */
export async function montarExclusao(
  id: string,
  manifestAtual: BaseManifest | null,
  catalogAtual: Catalog | null,
  dataVersion: string,
): Promise<ResultadoExclusao> {
  const file = `structures/${id}.json`;
  const catItems = (catalogAtual?.structures ?? []).filter((c) => c.id !== id);
  const files = (manifestAtual?.files ?? []).filter((f) => f.name !== file);

  const catalog: Catalog = {
    schema_version: 1,
    data_version: dataVersion,
    generated_at: new Date().toISOString().slice(0, 10),
    structures: catItems,
  };
  const catalogStr = serializar(catalog);
  const catalogBytes = new TextEncoder().encode(catalogStr);
  const catalogSha = await sha256hex(catalogBytes);
  const semCatalog = files.filter((f) => f.name !== "catalog.json");
  semCatalog.push({ name: "catalog.json", sha256: catalogSha, bytes: catalogBytes.length });

  const manifest: BaseManifest = {
    data_version: dataVersion,
    files: semCatalog,
    notes: `remove ${id}`,
    generated_at: new Date().toISOString().slice(0, 10),
  };

  return {
    arquivos: [
      { path: "catalog.json", content: catalogStr },
      { path: "manifest.json", content: serializar(manifest) },
    ],
    exclusoes: [file],
  };
}

/**
 * @param estruturas estruturas novas/editadas (já validadas)
 * @param manifestAtual manifest publicado (ou null na 1ª vez)
 * @param catalogAtual catalog publicado (ou null na 1ª vez)
 * @param dataVersion nova versão
 * @param notes notas da versão
 */
export async function montarPublicacao(
  estruturas: Estrutura[],
  manifestAtual: BaseManifest | null,
  catalogAtual: Catalog | null,
  dataVersion: string,
  notes: string,
): Promise<ResultadoPublicacao> {
  const arquivos: ArquivoParaCommit[] = [];
  const novas: string[] = [];
  const alteradas: string[] = [];

  // catálogo/manifest base (cópia do atual)
  const catItems: CatalogItem[] = catalogAtual ? [...catalogAtual.structures] : [];
  const files: ManifestFile[] = manifestAtual ? [...manifestAtual.files] : [];

  const catIndex = new Map(catItems.map((c, i) => [c.id, i]));
  const fileIndex = new Map(files.map((f, i) => [f.name, i]));

  for (const est of estruturas) {
    const path = `structures/${est.id}.json`;
    const content = serializar(est);
    const bytes = new TextEncoder().encode(content);
    const sha256 = await sha256hex(bytes);

    const item: CatalogItem = {
      id: est.id,
      rev: est.rev ?? 1,
      categoria: est.categoria,
      status: (est.status as CatalogItem["status"]) ?? "ativo",
      file: path,
      bytes: bytes.length,
      sha256,
    };
    if (catIndex.has(est.id)) {
      catItems[catIndex.get(est.id)!] = item;
      alteradas.push(est.id);
    } else {
      catIndex.set(est.id, catItems.length);
      catItems.push(item);
      novas.push(est.id);
    }

    const mf: ManifestFile = { name: path, sha256, bytes: bytes.length };
    if (fileIndex.has(path)) files[fileIndex.get(path)!] = mf;
    else {
      fileIndex.set(path, files.length);
      files.push(mf);
    }
    arquivos.push({ path, content });
  }

  // catalog.json novo
  const catalog: Catalog = {
    schema_version: 1,
    data_version: dataVersion,
    generated_at: new Date().toISOString().slice(0, 10),
    structures: catItems,
  };
  const catalogStr = serializar(catalog);
  const catalogBytes = new TextEncoder().encode(catalogStr);
  const catalogSha = await sha256hex(catalogBytes);
  arquivos.push({ path: "catalog.json", content: catalogStr });
  const cmf: ManifestFile = { name: "catalog.json", sha256: catalogSha, bytes: catalogBytes.length };
  if (fileIndex.has("catalog.json")) files[fileIndex.get("catalog.json")!] = cmf;
  else files.push(cmf);

  // manifest.json novo (não se inclui)
  const manifest: BaseManifest = {
    data_version: dataVersion,
    files,
    notes,
    generated_at: new Date().toISOString().slice(0, 10),
  };
  arquivos.push({ path: "manifest.json", content: serializar(manifest) });

  return { arquivos, manifest, catalog, novas, alteradas };
}
