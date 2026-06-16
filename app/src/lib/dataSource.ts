import { isTauri } from "./env";

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
