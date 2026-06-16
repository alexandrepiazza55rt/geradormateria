import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { isTauri } from "./lib/env";

// No desktop (Tauri), prepara o runtime ANTES de montar o React: extrai a base
// para %APPDATA%, roda migrations do SQLite e instala o backend de persistência.
// Na web, é no-op e o app monta imediatamente (a importação do bootstrap fica
// fora do bundle web por ser dinâmica).
async function bootstrap(): Promise<void> {
  if (isTauri()) {
    try {
      const { initTauriRuntime } = await import("./lib/tauri/bootstrap");
      await initTauriRuntime();
    } catch (e) {
      console.error("Falha no bootstrap do Tauri:", e);
    }
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
