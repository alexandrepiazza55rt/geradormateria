use std::fs;
use std::path::{Path, PathBuf};

use include_dir::{include_dir, Dir};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager};

/// Base de engenharia EMBUTIDA no binário (NÃO fica como arquivo solto ao lado do
/// .exe). No primeiro start é extraída para %APPDATA%/<identifier>/base e, daí em
/// diante, o app SEMPRE lê da cópia em %APPDATA% — permitindo atualizar a base sem
/// reinstalar (basta substituir os arquivos em base/).
static SEED: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../public/data");

/// Versão da seed embutida. Bumpar ao reextrair a base da planilha e recompilar.
pub const SEED_DATA_VERSION: &str = "2026.06.16-seed1";

#[derive(Serialize, Deserialize, Clone)]
pub struct FileInfo {
    pub name: String,
    pub sha256: String,
}

#[derive(Serialize, Clone)]
pub struct BaseInfo {
    pub base_dir: String,
    pub data_version: String,
    pub files: Vec<FileInfo>,
}

fn base_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("base"))
}

pub fn base_dir_string(app: &AppHandle) -> Result<String, String> {
    Ok(base_path(app)?.to_string_lossy().to_string())
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    h.finalize().iter().map(|b| format!("{b:02x}")).collect()
}

fn write_seed(base: &Path) -> Result<Vec<FileInfo>, String> {
    fs::create_dir_all(base).map_err(|e| e.to_string())?;
    let mut infos = Vec::new();
    for file in SEED.files() {
        let name = file
            .path()
            .file_name()
            .ok_or("nome de arquivo inválido na seed")?
            .to_string_lossy()
            .to_string();
        let bytes = file.contents();
        fs::write(base.join(&name), bytes).map_err(|e| e.to_string())?;
        infos.push(FileInfo {
            name,
            sha256: sha256_hex(bytes),
        });
    }
    Ok(infos)
}

fn write_markers(base: &Path, infos: &[FileInfo]) -> Result<(), String> {
    fs::write(base.join("data_version"), SEED_DATA_VERSION).map_err(|e| e.to_string())?;
    let manifest = serde_json::to_string_pretty(infos).map_err(|e| e.to_string())?;
    fs::write(base.join(".checksums.json"), manifest).map_err(|e| e.to_string())?;
    Ok(())
}

fn missing_any_seed_file(base: &Path) -> bool {
    SEED.files().any(|f| match f.path().file_name() {
        Some(n) => !base.join(n).exists(),
        None => true,
    })
}

fn read_infos(base: &Path) -> Vec<FileInfo> {
    if let Ok(raw) = fs::read_to_string(base.join(".checksums.json")) {
        if let Ok(v) = serde_json::from_str::<Vec<FileInfo>>(&raw) {
            return v;
        }
    }
    let mut infos = Vec::new();
    for f in SEED.files() {
        if let Some(n) = f.path().file_name() {
            let name = n.to_string_lossy().to_string();
            if let Ok(bytes) = fs::read(base.join(&name)) {
                infos.push(FileInfo {
                    name,
                    sha256: sha256_hex(&bytes),
                });
            }
        }
    }
    infos
}

/// Extrai a seed apenas no primeiro start (ou se algum arquivo sumiu). NUNCA
/// sobrescreve uma base já existente — assim uma atualização manual/remota dos
/// arquivos em %APPDATA%/base é preservada. Recuperação de corrupção: `force_reextract`.
pub fn ensure_extracted(app: &AppHandle) -> Result<BaseInfo, String> {
    let base = base_path(app)?;
    let version_file = base.join("data_version");
    let needs = !version_file.exists() || missing_any_seed_file(&base);
    let files = if needs {
        let infos = write_seed(&base)?;
        write_markers(&base, &infos)?;
        infos
    } else {
        read_infos(&base)
    };
    let data_version = fs::read_to_string(&version_file)
        .unwrap_or_else(|_| SEED_DATA_VERSION.to_string())
        .trim()
        .to_string();
    Ok(BaseInfo {
        base_dir: base.to_string_lossy().to_string(),
        data_version,
        files,
    })
}

/// Força a regravação da seed embutida (recuperação de base corrompida).
pub fn force_reextract(app: &AppHandle) -> Result<BaseInfo, String> {
    let base = base_path(app)?;
    let infos = write_seed(&base)?;
    write_markers(&base, &infos)?;
    Ok(BaseInfo {
        base_dir: base.to_string_lossy().to_string(),
        data_version: SEED_DATA_VERSION.to_string(),
        files: infos,
    })
}

/// Lê um arquivo da base em %APPDATA%/base, restrito a esse diretório (sem traversal).
pub fn read_base_file(app: &AppHandle, name: &str) -> Result<String, String> {
    if name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err("nome de arquivo inválido".into());
    }
    let base = base_path(app)?;
    fs::read_to_string(base.join(name)).map_err(|e| e.to_string())
}
