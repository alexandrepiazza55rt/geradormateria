// Backup e restauração de TODOS os dados do usuário (preços, clientes, orçamentos,
// configurações…). Esses dados vivem na camada de persistência (SQLite `user.db` no
// desktop, localStorage na web) como pares chave→valor. O backup dumpa todas as
// entradas; a restauração as grava de volta. NÃO toca na base de engenharia.

import { getStorageBackend } from "./storageBackend";

const FORMATO = "gerador-materiais-backup";

export interface BackupFile {
  formato: typeof FORMATO;
  versao: number;
  exportado_em: string;
  dados: Record<string, string>;
}

/** Coleta tudo que está salvo (todas as chaves do armazenamento do usuário). */
export function coletarBackup(): BackupFile {
  const sb = getStorageBackend();
  const dados: Record<string, string> = {};
  if (sb && typeof sb.entries === "function") {
    for (const [k, v] of sb.entries()) dados[k] = v;
  } else if (typeof window !== "undefined" && window.localStorage) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k == null) continue;
      const v = window.localStorage.getItem(k);
      if (v != null) dados[k] = v;
    }
  }
  return { formato: FORMATO, versao: 1, exportado_em: new Date().toISOString(), dados };
}

export interface ResumoBackup {
  chaves: number;
  clientes?: number;
  orcamentos?: number;
  precos?: number;
}

function contarLista(dados: Record<string, string>, key: string): number | undefined {
  try {
    const a = JSON.parse(dados[key] ?? "");
    return Array.isArray(a) ? a.length : undefined;
  } catch {
    return undefined;
  }
}

/** Resumo legível de um backup (para mostrar antes de restaurar). */
export function resumirBackup(file: BackupFile): ResumoBackup {
  return {
    chaves: Object.keys(file.dados ?? {}).length,
    clientes: contarLista(file.dados, "clientes_v1"),
    orcamentos: contarLista(file.dados, "orcamentos_salvos_v1"),
    precos: contarLista(file.dados, "precos_overrides_v1"),
  };
}

export function validarBackup(obj: unknown): obj is BackupFile {
  const f = obj as BackupFile;
  return !!f && f.formato === FORMATO && typeof f.dados === "object" && f.dados !== null;
}

/** Grava de volta todas as chaves do backup (substitui os dados atuais por essas). */
export function restaurarBackup(file: BackupFile): void {
  if (!validarBackup(file)) {
    throw new Error("Arquivo de backup inválido ou de outro sistema.");
  }
  const sb = getStorageBackend();
  if (!sb) throw new Error("Armazenamento indisponível.");
  for (const [k, v] of Object.entries(file.dados)) sb.setItem(k, v);
}
