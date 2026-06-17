# Plano de Execução — Módulo de Licença (v1)

Branch: `feat/licenca-v1`. Arquitetura detalhada em [`ARQUITETURA_LICENCA.md`](./ARQUITETURA_LICENCA.md).

## Fase 0 — Entendimento (concluída)

**Stack atual:**
- **Cliente:** app desktop **Tauri v2** (Rust + WebView2) + React/TS. Persiste dados do usuário em
  **SQLite** (`user.db`, tabela `kv`/`meta`). Já tem **plugin-http** (HTTPS) e os pontos de costura:
  - `app/src/lib/license/activation.ts` → `ensureActivated()` (no-op) e `machineFingerprint()`.
  - `app/src-tauri/src/fingerprint.rs` → `machine_fingerprint()` (stub fraco a substituir).
- **"Painel admin":** é o **publisher** (`publisher/`) — SPA **estático** (Vite/React) que fala com o
  GitHub via token. **Não havia backend, banco, login nem RBAC.**

**Lacuna principal:** o desenho exige um **servidor fonte da verdade** (assina token, banco de
licenças, ativação/revalidação). **Decisão:** criar um **Cloudflare Worker + D1** (gratuito).

## Premissas
- O dono do produto criará uma conta **Cloudflare** (grátis) e fará `wrangler login` para deploy.
- O par de chaves Ed25519 é gerado uma vez; a **privada** vira secret do Worker; a **pública** é
  embutida no cliente. Nada de segredo no git/cliente.
- Volume de licenças baixo (vendedor único) → D1/Workers free tier sobra.

## Estrutura de pastas nova
```
license-server/            ← Cloudflare Worker (TypeScript)
  src/index.ts             ← rotas (activate, revalidate, admin/*)
  src/crypto.ts            ← assinatura Ed25519, nonce, hash
  src/db.ts                ← acesso D1 + auditoria
  migrations/0001_init.sql ← schema (reversível)
  wrangler.toml            ← config (binding D1, secrets)
  test/                    ← testes de fluxo/segurança (vitest + miniflare)
app/src/lib/license/       ← gate, verificação de token, heartbeat (cliente)
app/src-tauri/src/         ← fingerprint real + comando de relógio seguro
publisher/src/components/  ← aba "Licenças" (CRUD via API admin)
```

## Schema (D1) — migração 0001 (reversível)
```sql
CREATE TABLE licencas (
  id TEXT PRIMARY KEY,                 -- uuid
  chave_hash TEXT NOT NULL UNIQUE,     -- hash da chave (nunca em texto)
  chave_prefixo TEXT NOT NULL,         -- 5 primeiros chars p/ exibir/log mascarado
  produto TEXT NOT NULL DEFAULT 'gerador-materiais',
  estado TEXT NOT NULL DEFAULT 'CRIADA',
  fingerprint_hash TEXT,               -- NULL = não vinculada (bind atômico usa isso)
  ativada_em TEXT, expira_em TEXT, criada_em TEXT NOT NULL,
  ultima_revalidacao_em TEXT, criada_por TEXT
);
CREATE TABLE auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_licenca TEXT, acao TEXT NOT NULL, quem TEXT, quando TEXT NOT NULL,
  antes TEXT, depois TEXT
);
CREATE TABLE nonces ( nonce TEXT PRIMARY KEY, visto_em TEXT NOT NULL ); -- anti-replay
```
Rollback: `migrations/0001_init.down.sql` com `DROP TABLE`.

## Módulos (ordem de implementação)

1. **Modelo de dados + auditoria** (D1, migração 0001) — tarefa 1.
2. **Segurança de transporte/API** (HTTPS nativo do Worker, rate limit, nonce, CORS p/ app) — tarefa 10.
3. **Geração de chave** (aleatória `XXXXX-XXXXX-XXXXX-XXXXX` + checksum) — tarefa 3.
4. **Painel admin** (aba Licenças no publisher: criar/listar/revogar/renovar/reset-bind) — tarefa 2.
5. **Fingerprint real** (`fingerprint.rs`: MachineGuid + volume serial, hash) — tarefa 4.
6. **Ativação online** (`/v1/activate`: validar + bind atômico + assinar token) — tarefa 5.
7. **Validação local offline** (verifica token com chave pública no boot) — tarefa 6.
8. **Revalidação + carência** (`/v1/revalidate`, 24h, 15 dias) — tarefa 7.
9. **Anti-adulteração** (token no SQLite, retrocesso de relógio) — tarefa 8.
10. **Bloqueio e UX** (telas por motivo, PT-BR, sem apagar dados) — tarefa 9.

Cada módulo: testes (incl. segurança) + commit incremental + entrada no CHANGELOG.md.

## Como o cliente integra (sem reescrever o app)
- `ensureActivated()` deixa de ser no-op: lê o token do SQLite, verifica (assinatura+HWID+expiração+
  carência), revalida se online. Retorna o **motivo de bloqueio** quando falha.
- O `App.tsx` mostra a **tela de licença/bloqueio** quando `ensureActivated` não libera — antes de
  montar o resto. Os dados do usuário continuam intactos por baixo.

## Testes de segurança (mínimos para "pronto")
- Ativar em 1 máquina OK; mesma chave em outra → 409.
- Token adulterado → rejeitado. Fingerprint divergente → bloqueio.
- Expiração respeitada; relógio para trás → bloqueio.
- Revogar no admin → trava na próxima revalidação.
- Offline < 15 dias → abre; > 15 dias → trava.
- Replay de nonce → rejeitado; chamadas sem TLS → não aplicável (Worker é só HTTPS).

## Verificação ponta a ponta
1. `wrangler dev` (Worker local) + D1 local → testes automatizados.
2. Deploy no Cloudflare (conta do dono) → `app` aponta para a URL do Worker.
3. `npx tauri dev`: ativar com uma chave criada no painel; simular revogação/expiração/offline.

## Gestão de chave (doc dedicado)
`license-server/GESTAO_DE_CHAVES.md`: como gerar o par, subir a privada como secret, embutir a
pública, e plano de rotação (kid). A privada nunca em git.

## Fora de escopo (v1)
- Multi-produto completo (modelado, não exposto no painel).
- Rotação automática de chave (previsto `kid`, não implementado).
- Modo "somente leitura" ao travar (escolhido bloqueio total).
