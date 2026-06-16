mod fingerprint;
mod seed;

use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

// ─── Comandos de base de dados (camada read-only embutida → %APPDATA%/base) ───

#[tauri::command]
fn ensure_base_extracted(app: tauri::AppHandle) -> Result<seed::BaseInfo, String> {
    seed::ensure_extracted(&app)
}

#[tauri::command]
fn reextract_seed(app: tauri::AppHandle) -> Result<seed::BaseInfo, String> {
    seed::force_reextract(&app)
}

#[tauri::command]
fn read_base_file(app: tauri::AppHandle, name: String) -> Result<String, String> {
    seed::read_base_file(&app, &name)
}

#[tauri::command]
fn base_dir(app: tauri::AppHandle) -> Result<String, String> {
    seed::base_dir_string(&app)
}

// ─── Escrita de arquivos (exportações em local escolhido pelo usuário) ───
// O caminho vem do diálogo nativo "Salvar como"; escrevemos via std::fs (sem
// precisar configurar escopos de FS para caminhos arbitrários).

#[tauri::command]
fn write_file_text(path: String, contents: String) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file_bytes(path: String, contents: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

// ─── Costura de licenciamento (stub) ───

#[tauri::command]
fn machine_fingerprint() -> String {
    fingerprint::machine_fingerprint()
}

fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create kv and meta tables",
        sql: "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT);\nCREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);",
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // single-instance precisa ser o PRIMEIRO plugin registrado (recomendação Tauri).
    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.set_focus();
                }
            }))
            .plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:user.db", migrations())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            ensure_base_extracted,
            reextract_seed,
            read_base_file,
            base_dir,
            write_file_text,
            write_file_bytes,
            machine_fingerprint
        ])
        .setup(|app| {
            // Extração best-effort da seed no boot (idempotente). O frontend também
            // aguarda `ensure_base_extracted` antes de ler a base.
            let handle = app.handle().clone();
            if let Err(e) = seed::ensure_extracted(&handle) {
                log::error!("Falha ao extrair seed no setup: {e}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
