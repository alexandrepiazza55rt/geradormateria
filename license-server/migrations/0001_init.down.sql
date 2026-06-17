-- Rollback da migração 0001.
DROP TABLE IF EXISTS nonces;
DROP TABLE IF EXISTS auditoria;
DROP INDEX IF EXISTS idx_licencas_estado;
DROP TABLE IF EXISTS licencas;
