use sha2::{Digest, Sha256};

/// Fingerprint de máquina (HWID) para o vínculo de licença.
///
/// Base: o **MachineGuid** do Windows (identificador estável da instalação do SO,
/// sobrevive a troca de peças; muda ao reinstalar o Windows — aí exige reset de
/// vínculo legítimo). Combinado com o SO e um "sal" do produto, e reduzido a um
/// HASH SHA-256 — só o hash sai da máquina (privacidade). Em caso de falha ao ler
/// o id, cai para identificadores de ambiente (fingerprint mais fraco, mas estável).
pub fn machine_fingerprint() -> String {
    let id = machine_uid::get().unwrap_or_else(|_| fallback_id());
    let os = std::env::consts::OS;
    let mut h = Sha256::new();
    h.update(id.as_bytes());
    h.update(b"|");
    h.update(os.as_bytes());
    h.update(b"|gerador-materiais"); // sal do produto: isola o fingerprint deste app
    h.finalize().iter().map(|b| format!("{b:02x}")).collect()
}

fn fallback_id() -> String {
    let machine = std::env::var("COMPUTERNAME").unwrap_or_default();
    let user = std::env::var("USERNAME").unwrap_or_default();
    format!("{machine}|{user}")
}
