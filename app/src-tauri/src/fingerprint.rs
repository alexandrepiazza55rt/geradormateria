use sha2::{Digest, Sha256};

/// STUB de fingerprint de máquina — costura para o futuro licenciamento.
/// NÃO é um HWID robusto: combina identificadores de ambiente apenas para reservar
/// o ponto de integração com o backend de licença. Substituir por HWID real
/// (ex.: MachineGuid do registro + volume serial) na implementação definitiva.
pub fn machine_fingerprint() -> String {
    let machine = std::env::var("COMPUTERNAME").unwrap_or_default();
    let user = std::env::var("USERNAME").unwrap_or_default();
    let os = std::env::consts::OS;
    let mut h = Sha256::new();
    h.update(machine.as_bytes());
    h.update(b"|");
    h.update(user.as_bytes());
    h.update(b"|");
    h.update(os.as_bytes());
    let hex: String = h.finalize().iter().map(|b| format!("{b:02x}")).collect();
    hex[..16].to_string()
}
