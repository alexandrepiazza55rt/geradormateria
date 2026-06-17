import Database from "@tauri-apps/plugin-sql";
import type { StorageBackend } from "../orcamento/storage";

/**
 * Backend de persistência do usuário sobre SQLite (Tauri), apresentando a
 * interface SÍNCRONA `StorageBackend` que o app já usa.
 *
 * Estratégia: um cache em memória `Map<string,string>` hidratado UMA vez no boot
 * a partir da tabela `kv`. `getItem` lê do cache (sync); `setItem`/`removeItem`
 * atualizam o cache (sync) E enfileiram a escrita assíncrona no SQLite (fila
 * serial por encadeamento de Promise, preservando ordem). Assim a migração
 * localStorage → SQLite não exige reescrever a lógica síncrona testada do store.
 */

let db: Database | null = null;
const cache = new Map<string, string>();
let writeChain: Promise<unknown> = Promise.resolve();

function enqueue(op: () => Promise<unknown>): void {
  writeChain = writeChain.then(op).catch((e) => {
    console.error("[sqliteBackend] falha ao persistir no SQLite:", e);
  });
}

const backend: StorageBackend = {
  getItem(key: string): string | null {
    return cache.has(key) ? (cache.get(key) as string) : null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    const now = new Date().toISOString();
    enqueue(() =>
      db!.execute(
        "INSERT INTO kv (key, value, updated_at) VALUES ($1, $2, $3) " +
          "ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = $3",
        [key, value, now],
      ),
    );
  },
  removeItem(key: string): void {
    cache.delete(key);
    enqueue(() => db!.execute("DELETE FROM kv WHERE key = $1", [key]));
  },
  entries(): [string, string][] {
    return [...cache.entries()];
  },
};

/** Carrega o DB (migrations já rodaram via plugin Rust) e hidrata o cache. */
export async function initSqliteBackend(): Promise<StorageBackend> {
  db = await Database.load("sqlite:user.db");
  const rows = await db.select<Array<{ key: string; value: string }>>(
    "SELECT key, value FROM kv",
  );
  cache.clear();
  for (const r of rows) cache.set(r.key, r.value);
  return backend;
}

/** Aguarda o esvaziamento da fila de escrita (durabilidade, ex.: ao fechar). */
export async function flushPendingWrites(): Promise<void> {
  await writeChain;
}
