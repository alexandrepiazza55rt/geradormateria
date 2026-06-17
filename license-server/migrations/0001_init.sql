-- Migração 0001 — modelo de licença + auditoria + anti-replay.
-- Reversível: ver 0001_init.down.sql.

CREATE TABLE IF NOT EXISTS licencas (
  id TEXT PRIMARY KEY,                 -- uuid
  chave_hash TEXT NOT NULL UNIQUE,     -- SHA-256 da chave (nunca em texto)
  chave_prefixo TEXT NOT NULL,         -- 5 primeiros chars p/ exibir/log mascarado
  produto TEXT NOT NULL DEFAULT 'gerador-materiais',
  estado TEXT NOT NULL DEFAULT 'CRIADA', -- CRIADA|ATIVA|EXPIRADA|REVOGADA|SUSPENSA
  fingerprint_hash TEXT,               -- NULL = não vinculada (bind atômico usa isto)
  cliente_nome TEXT,                   -- rótulo opcional (a quem pertence)
  ativada_em TEXT,
  expira_em TEXT,
  criada_em TEXT NOT NULL,
  ultima_revalidacao_em TEXT,
  criada_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_licencas_estado ON licencas(estado);

CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_licenca TEXT,
  acao TEXT NOT NULL,                  -- criar|ativar|revogar|renovar|reset_bind|revalidar
  quem TEXT,                           -- 'admin' | 'cliente' | id
  quando TEXT NOT NULL,
  antes TEXT,
  depois TEXT
);

-- Anti-replay: nonces já vistos na ativação (expira por limpeza periódica).
CREATE TABLE IF NOT EXISTS nonces (
  nonce TEXT PRIMARY KEY,
  visto_em TEXT NOT NULL
);
