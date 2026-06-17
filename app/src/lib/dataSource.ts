import { isTauri } from "./env";
import type { Estrutura } from "../types";

/**
 * Camada de SERVIÇO DE DADOS (base read-only de engenharia).
 *
 * - Web/dev: lê de `public/data/*.json` via fetch (preserva dev e deploy web).
 * - Tauri: lê da cópia extraída em `%APPDATA%/<id>/base` via comando Rust.
 *
 * Integridade: a leitura tenta `JSON.parse`; se a base estiver ausente/corrompida,
 * recupera a seed embutida (`reextract_seed`) e tenta de novo. NÃO usa checksum
 * como gatilho de recuperação — uma base atualizada (manual/remota) muda os bytes
 * de propósito; o checksum fica disponível em `BaseInfo` para o fluxo de update.
 */

export interface FileChecksum {
  name: string;
  sha256: string;
}

export interface BaseInfo {
  base_dir: string;
  data_version: string;
  files: FileChecksum[];
}

const BASE = import.meta.env.BASE_URL ?? "/";

let baseInfo: BaseInfo | null = null;

export function setBaseInfo(info: BaseInfo): void {
  baseInfo = info;
}

export function getBaseInfo(): BaseInfo | null {
  return baseInfo;
}

export function getDataVersion(): string | null {
  return baseInfo?.data_version ?? null;
}

async function readBaseFileTauri<T>(file: string): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  const text = await invoke<string>("read_base_file", { name: file });
  return JSON.parse(text) as T;
}

export async function loadBaseJson<T>(file: string): Promise<T> {
  if (!isTauri()) {
    const res = await fetch(`${BASE}data/${file}`);
    if (!res.ok) throw new Error(`Falha ao carregar ${file}: ${res.status}`);
    return res.json() as Promise<T>;
  }
  try {
    return await readBaseFileTauri<T>(file);
  } catch (e) {
    // Base ausente/corrompida → recupera a seed embutida e tenta uma vez mais.
    console.error(`[dataSource] erro lendo ${file}; recuperando seed embutida:`, e);
    const { invoke } = await import("@tauri-apps/api/core");
    const info = await invoke<BaseInfo>("reextract_seed");
    setBaseInfo(info);
    return await readBaseFileTauri<T>(file);
  }
}

interface CatalogItem {
  id: string;
}

/**
 * Carrega as estruturas da base QUEBRADA POR ARQUIVO.
 *
 * - Web/dev: faz `fetch` do bundle `estruturas.json` (mantido em sincronia pelo
 *   build_catalog.py) — uma requisição só, preserva o comportamento atual.
 * - Desktop: lê todos os `structures/*.json` numa única chamada Rust
 *   (`read_base_dir`), evitando centenas de IPCs. A ordem canônica vem do
 *   `catalog.json`; estruturas sem entrada no catálogo vão ao final.
 *
 * Devolve TODAS as estruturas (inclusive `descontinuado`) — a filtragem para a
 * UI de criação fica a cargo do store; históricos precisam continuar resolvíveis.
 */
export async function loadStructures(): Promise<Estrutura[]> {
  if (!isTauri()) {
    const res = await fetch(`${BASE}data/estruturas.json`);
    if (!res.ok) throw new Error(`Falha ao carregar estruturas: ${res.status}`);
    return res.json() as Promise<Estrutura[]>;
  }

  const { invoke } = await import("@tauri-apps/api/core");
  let map: Record<string, string>;
  try {
    map = await invoke<Record<string, string>>("read_base_dir", { subdir: "structures" });
  } catch (e) {
    console.error("[dataSource] erro lendo structures/; recuperando seed embutida:", e);
    const info = await invoke<BaseInfo>("reextract_seed");
    setBaseInfo(info);
    map = await invoke<Record<string, string>>("read_base_dir", { subdir: "structures" });
  }

  let ests = Object.values(map).map((t) => JSON.parse(t) as Estrutura);

  // O catalog.json é a lista OFICIAL: ordena por ele e FILTRA para só mostrar o que
  // está no catálogo. Assim, ao apagar uma estrutura (sai do catálogo), ela some do
  // programa mesmo que o arquivo local persista. Sem catálogo → mostra tudo (fallback).
  try {
    const cat = await loadBaseJson<{ structures: CatalogItem[] }>("catalog.json");
    if (cat.structures && cat.structures.length > 0) {
      const order = new Map(cat.structures.map((s, i) => [s.id, i]));
      ests = ests
        .filter((e) => order.has(e.id))
        .sort((a, b) => order.get(a.id)! - order.get(b.id)!);
    }
  } catch (e) {
    console.warn("[dataSource] catalog.json ausente; ordem do FS:", e);
  }

  return ests;
}
