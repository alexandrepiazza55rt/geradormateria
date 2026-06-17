// Acesso ao banco D1 (licenças, auditoria, anti-replay). Toda operação relevante
// grava trilha de auditoria. O fingerprint cru NUNCA é guardado — só o hash.

export interface Licenca {
  id: string;
  chave_hash: string;
  chave_prefixo: string;
  produto: string;
  estado: string;
  fingerprint_hash: string | null;
  cliente_nome: string | null;
  ativada_em: string | null;
  expira_em: string | null;
  criada_em: string;
  ultima_revalidacao_em: string | null;
  criada_por: string | null;
}

const agora = () => new Date().toISOString();

export async function auditar(
  db: D1Database,
  id_licenca: string | null,
  acao: string,
  quem: string,
  antes: unknown,
  depois: unknown,
): Promise<void> {
  await db
    .prepare("INSERT INTO auditoria (id_licenca, acao, quem, quando, antes, depois) VALUES (?,?,?,?,?,?)")
    .bind(id_licenca, acao, quem, agora(), antes ? JSON.stringify(antes) : null, depois ? JSON.stringify(depois) : null)
    .run();
}

export async function criarLicenca(
  db: D1Database,
  l: { id: string; chave_hash: string; chave_prefixo: string; produto: string; expira_em: string | null; cliente_nome: string | null; criada_por: string },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO licencas (id, chave_hash, chave_prefixo, produto, estado, expira_em, cliente_nome, criada_em, criada_por) VALUES (?,?,?,?,?,?,?,?,?)",
    )
    .bind(l.id, l.chave_hash, l.chave_prefixo, l.produto, "CRIADA", l.expira_em, l.cliente_nome, agora(), l.criada_por)
    .run();
  await auditar(db, l.id, "criar", l.criada_por, null, { prefixo: l.chave_prefixo, expira_em: l.expira_em });
}

export function buscarPorChaveHash(db: D1Database, chave_hash: string): Promise<Licenca | null> {
  return db.prepare("SELECT * FROM licencas WHERE chave_hash = ?").bind(chave_hash).first<Licenca>();
}

export function buscarPorId(db: D1Database, id: string): Promise<Licenca | null> {
  return db.prepare("SELECT * FROM licencas WHERE id = ?").bind(id).first<Licenca>();
}

export async function listarLicencas(db: D1Database): Promise<Licenca[]> {
  const r = await db.prepare("SELECT * FROM licencas ORDER BY criada_em DESC").all<Licenca>();
  return r.results ?? [];
}

/** Bind ATÔMICO: só vincula se ainda estiver livre (fingerprint NULL). Retorna se venceu. */
export async function vincularAtomico(db: D1Database, id: string, fp: string): Promise<boolean> {
  const r = await db
    .prepare("UPDATE licencas SET fingerprint_hash=?, estado='ATIVA', ativada_em=COALESCE(ativada_em, ?) WHERE id=? AND fingerprint_hash IS NULL")
    .bind(fp, agora(), id)
    .run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function marcarRevalidacao(db: D1Database, id: string): Promise<void> {
  await db.prepare("UPDATE licencas SET ultima_revalidacao_em=? WHERE id=?").bind(agora(), id).run();
}

export async function setEstado(db: D1Database, id: string, estado: string, quem: string): Promise<void> {
  const antes = await buscarPorId(db, id);
  await db.prepare("UPDATE licencas SET estado=? WHERE id=?").bind(estado, id).run();
  await auditar(db, id, estado === "REVOGADA" ? "revogar" : "estado", quem, { estado: antes?.estado }, { estado });
}

export async function renovar(db: D1Database, id: string, novaExpira: string, quem: string): Promise<void> {
  const antes = await buscarPorId(db, id);
  // Renovar reativa se estava expirada/revogada (mesma máquina mantém o vínculo).
  const novoEstado = antes?.fingerprint_hash ? "ATIVA" : "CRIADA";
  await db.prepare("UPDATE licencas SET expira_em=?, estado=? WHERE id=?").bind(novaExpira, novoEstado, id).run();
  await auditar(db, id, "renovar", quem, { expira_em: antes?.expira_em, estado: antes?.estado }, { expira_em: novaExpira, estado: novoEstado });
}

export async function resetBind(db: D1Database, id: string, quem: string): Promise<void> {
  const antes = await buscarPorId(db, id);
  await db.prepare("UPDATE licencas SET fingerprint_hash=NULL, estado='CRIADA', ultima_revalidacao_em=NULL WHERE id=?").bind(id).run();
  await auditar(db, id, "reset_bind", quem, { fingerprint_hash: antes?.fingerprint_hash }, { fingerprint_hash: null });
}

/** Anti-replay: retorna true se o nonce é NOVO (e o registra); false se já visto. */
export async function nonceNovo(db: D1Database, nonce: string): Promise<boolean> {
  try {
    await db.prepare("INSERT INTO nonces (nonce, visto_em) VALUES (?, ?)").bind(nonce, agora()).run();
    return true;
  } catch {
    return false; // PRIMARY KEY duplicada = replay
  }
}
