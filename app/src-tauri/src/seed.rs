use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use include_dir::{include_dir, Dir, File};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager};

/// Base de engenharia EMBUTIDA no binário (NÃO fica como arquivo solto ao lado do
/// .exe). No primeiro start é extraída para %APPDATA%/<identifier>/base e, daí em
/// diante, o app SEMPRE lê da cópia em %APPDATA% — permitindo atualizar a base sem
/// reinstalar (basta substituir os arquivos em base/).
static SEED: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../public/data");

/// Versão de fallback caso o catalog.json embutido não tenha `data_version`.
pub const SEED_DATA_VERSION: &str = "2026.06.16-seed1";

/// Versão da base EMBUTIDA, lida do `catalog.json` da seed (fonte única — evita
/// divergência entre a versão da seed e a que o publish.py estampou na base).
fn seed_data_version() -> String {
    SEED.get_file("catalog.json")
        .and_then(|f| serde_json::from_slice::<serde_json::Value>(f.contents()).ok())
        .and_then(|v| v.get("data_version").and_then(|s| s.as_str()).map(String::from))
        .unwrap_or_else(|| SEED_DATA_VERSION.to_string())
}

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

/// Coleta todos os arquivos da seed recursivamente (inclui subpastas como
/// `structures/`). `include_dir::Dir::files()` só lista o nível atual; aqui
/// descemos nos subdiretórios.
fn collect_seed<'a>(dir: &'a Dir<'a>, out: &mut Vec<&'a File<'a>>) {
    for f in dir.files() {
        out.push(f);
    }
    for d in dir.dirs() {
        collect_seed(d, out);
    }
}

fn write_seed(base: &Path) -> Result<Vec<FileInfo>, String> {
    fs::create_dir_all(base).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    collect_seed(&SEED, &mut files);
    let mut infos = Vec::new();
    for file in files {
        // `path()` é relativo à raiz embutida (ex.: "materiais.json" ou
        // "structures/S1.json"); preservamos a subpasta ao extrair.
        let rel = file.path();
        let target = base.join(rel);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let bytes = file.contents();
        fs::write(&target, bytes).map_err(|e| e.to_string())?;
        // `.checksums.json`/BaseInfo cobrem só os arquivos do TOPO da base; as
        // estruturas em `structures/` têm seus checksums no próprio catalog.json.
        let top_level = rel.parent().map_or(true, |p| p.as_os_str().is_empty());
        if top_level {
            if let Some(name) = rel.file_name() {
                infos.push(FileInfo {
                    name: name.to_string_lossy().to_string(),
                    sha256: sha256_hex(bytes),
                });
            }
        }
    }
    Ok(infos)
}

fn write_markers(base: &Path, infos: &[FileInfo]) -> Result<(), String> {
    fs::write(base.join("data_version"), seed_data_version()).map_err(|e| e.to_string())?;
    let manifest = serde_json::to_string_pretty(infos).map_err(|e| e.to_string())?;
    fs::write(base.join(".checksums.json"), manifest).map_err(|e| e.to_string())?;
    Ok(())
}

fn missing_any_seed_file(base: &Path) -> bool {
    let mut files = Vec::new();
    collect_seed(&SEED, &mut files);
    files.iter().any(|f| !base.join(f.path()).exists())
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
        .unwrap_or_else(|_| seed_data_version())
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
        data_version: seed_data_version(),
        files: infos,
    })
}

/// Backup rotativo do banco do usuário (`user.db`), feito no boot ANTES do banco ser
/// aberto/migrado. Protege contra perda em migrações de upgrade e corrupção. Mantém os
/// 5 backups mais recentes em `%APPDATA%/<id>/backups/`. Best-effort: nunca bloqueia o boot.
pub fn backup_user_db(app: &AppHandle) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db = dir.join("user.db");
    if !db.exists() {
        return Ok(()); // 1ª execução: ainda não há banco a salvar
    }
    let backups = dir.join("backups");
    fs::create_dir_all(&backups).map_err(|e| e.to_string())?;
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    fs::copy(&db, backups.join(format!("user-{ts}.db"))).map_err(|e| e.to_string())?;
    // Inclui o WAL (mudanças recentes ainda não consolidadas), se existir.
    let wal = dir.join("user.db-wal");
    if wal.exists() {
        let _ = fs::copy(&wal, backups.join(format!("user-{ts}.db-wal")));
    }
    rotacionar_backups(&backups, 5);
    Ok(())
}

/// Mantém só os N backups `.db` mais recentes (apaga os antigos e seus -wal).
fn rotacionar_backups(backups: &Path, manter: usize) {
    let mut dbs: Vec<PathBuf> = match fs::read_dir(backups) {
        Ok(rd) => rd
            .filter_map(|e| e.ok().map(|e| e.path()))
            .filter(|p| {
                p.extension().and_then(|s| s.to_str()) == Some("db")
                    && p.file_name()
                        .and_then(|n| n.to_str())
                        .map_or(false, |n| n.starts_with("user-"))
            })
            .collect(),
        Err(_) => return,
    };
    dbs.sort(); // nome contém timestamp → ordem cronológica
    if dbs.len() > manter {
        for antigo in &dbs[..dbs.len() - manter] {
            let _ = fs::remove_file(antigo);
            let _ = fs::remove_file(antigo.with_extension("db-wal"));
        }
    }
}

/// Lê um arquivo da base em %APPDATA%/base, restrito a esse diretório (sem traversal).
pub fn read_base_file(app: &AppHandle, name: &str) -> Result<String, String> {
    if name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err("nome de arquivo inválido".into());
    }
    let base = base_path(app)?;
    fs::read_to_string(base.join(name)).map_err(|e| e.to_string())
}

#[derive(Deserialize)]
pub struct UpdateFile {
    /// caminho relativo NA BASE (ex.: "materiais.json" ou "structures/S1.json")
    pub name: String,
    /// bytes já validados (o front confere o sha256 ANTES de chamar este comando)
    pub contents: Vec<u8>,
}

/// Valida um caminho relativo de destino: sem traversal; só topo ou `structures/<arquivo>`.
fn validate_rel(name: &str) -> Result<(), String> {
    if name.is_empty()
        || name.contains("..")
        || name.contains('\\')
        || name.starts_with('/')
    {
        return Err(format!("caminho inválido: {name}"));
    }
    let parts: Vec<&str> = name.split('/').collect();
    match parts.as_slice() {
        [file] if !file.is_empty() => Ok(()),
        ["structures", file] if !file.is_empty() => Ok(()),
        _ => Err(format!("caminho não permitido: {name}")),
    }
}

/// Recomputa `data_version` + `.checksums.json` (arquivos de topo) após uma troca.
fn recompute_markers(base: &Path, data_version: &str) -> Result<Vec<FileInfo>, String> {
    fs::write(base.join("data_version"), data_version).map_err(|e| e.to_string())?;
    let mut infos = Vec::new();
    for entry in fs::read_dir(base).map_err(|e| e.to_string())? {
        let p = entry.map_err(|e| e.to_string())?.path();
        if !p.is_file() {
            continue;
        }
        let name = p.file_name().unwrap().to_string_lossy().to_string();
        if name == ".checksums.json" || name == "data_version" {
            continue;
        }
        if p.extension().and_then(|s| s.to_str()) == Some("json") {
            let bytes = fs::read(&p).map_err(|e| e.to_string())?;
            infos.push(FileInfo {
                name,
                sha256: sha256_hex(&bytes),
            });
        }
    }
    let manifest = serde_json::to_string_pretty(&infos).map_err(|e| e.to_string())?;
    fs::write(base.join(".checksums.json"), manifest).map_err(|e| e.to_string())?;
    Ok(infos)
}

/// Aplica uma atualização de base (Fase 3). Grava de forma quase-atômica: escreve
/// cada arquivo num `.tmp-update` e só então renomeia para o destino (rename é
/// atômico no mesmo volume). Se QUALQUER escrita falhar, aborta ANTES de renomear
/// — a base fica intacta. NÃO toca em `user.db`. Atualiza data_version + checksums.
///
/// Pré-condição: o front já baixou e CONFERIU o sha256 de cada arquivo. Aqui só
/// validamos o caminho e persistimos.
pub fn apply_base_update(
    app: &AppHandle,
    files: Vec<UpdateFile>,
    data_version: &str,
) -> Result<BaseInfo, String> {
    let base = base_path(app)?;
    fs::create_dir_all(&base).map_err(|e| e.to_string())?;

    for f in &files {
        validate_rel(&f.name)?;
    }

    // 1) escreve tudo em arquivos temporários (nada visível ainda)
    let mut pending = Vec::new();
    for f in &files {
        let target = base.join(&f.name);
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let tmp = target.with_extension("tmp-update");
        if let Err(e) = fs::write(&tmp, &f.contents) {
            // limpa temporários já criados e aborta sem tocar na base
            for (t, _) in &pending {
                let _ = fs::remove_file(t);
            }
            let _ = fs::remove_file(&tmp);
            return Err(format!("falha gravando {}: {e}", f.name));
        }
        pending.push((tmp, target));
    }

    // 2) commit: renomeia cada temporário sobre o destino
    for (tmp, target) in &pending {
        fs::rename(tmp, target).map_err(|e| format!("falha trocando {target:?}: {e}"))?;
    }

    // 3) atualiza marcadores
    let files = recompute_markers(&base, data_version)?;
    Ok(BaseInfo {
        base_dir: base.to_string_lossy().to_string(),
        data_version: data_version.to_string(),
        files,
    })
}

/// Lê todos os `*.json` de um subdiretório whitelistado da base (ex.: `structures`)
/// numa única chamada — evita centenas de IPCs ao carregar a base. Retorna
/// `nome_do_arquivo -> conteúdo`. Sem traversal: só subdirs conhecidos.
pub fn read_base_dir(app: &AppHandle, subdir: &str) -> Result<HashMap<String, String>, String> {
    if subdir != "structures" {
        return Err(format!("subdiretório não permitido: {subdir}"));
    }
    let dir = base_path(app)?.join(subdir);
    let mut out = HashMap::new();
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let path = entry.map_err(|e| e.to_string())?.path();
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Some(name) = path.file_name() {
                let text = fs::read_to_string(&path).map_err(|e| e.to_string())?;
                out.insert(name.to_string_lossy().to_string(), text);
            }
        }
    }
    Ok(out)
}
