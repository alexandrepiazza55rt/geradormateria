import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { setStorageBackend } from "../storageBackend";
import { setBaseInfo, type BaseInfo } from "../dataSource";
import { initSqliteBackend, flushPendingWrites } from "./sqliteBackend";

/**
 * Sequência de FIRST-RUN / boot do desktop. Roda ANTES do React montar (main.tsx),
 * garantindo que a base e a persistência estejam prontas quando o store carregar.
 */
let initialized = false;

export async function initTauriRuntime(): Promise<void> {
  if (initialized) return;
  initialized = true;

  // 1) Garante a base de engenharia extraída em %APPDATA%/<id>/base (idempotente).
  const info = await invoke<BaseInfo>("ensure_base_extracted");
  setBaseInfo(info);

  // 2) SQLite do usuário (migrations já aplicadas pelo plugin). Hidrata o cache
  //    e passa a ser o destino de TODA a persistência de dados do usuário.
  //    (O gate de licença roda no React, DEPOIS daqui, pois usa este armazenamento.)
  const backend = await initSqliteBackend();
  setStorageBackend(backend);

  // 4) Durabilidade extra: esvazia a fila de escrita ao fechar a janela.
  try {
    const win = getCurrentWindow();
    await win.onCloseRequested(async () => {
      await flushPendingWrites();
    });
  } catch {
    /* sem janela (ex.: teste) — ignora */
  }
}
