# Arquitetura do Sistema de Licenciamento

> Sistema de **licença de uso** legítimo do próprio software. Ao bloquear, ele apenas
> **impede o acesso** e mostra uma mensagem — **nunca apaga nem corrompe** dados do usuário.

## 1. Decisões (confirmadas com o dono do produto)

| Decisão | Escolha |
|---|---|
| Servidor de licença | **Cloudflare Worker** (serverless, tier gratuito) |
| Banco de licenças | **Cloudflare D1** (SQLite no edge) |
| Assinatura | **Ed25519** (privada no servidor, pública embutida no cliente) |
| Ativação | **Automática online** (1 clique no programa) |
| Carência offline | **15 dias** sem revalidar → trava |
| Ao travar | **Bloqueio total** (só tela de ativação/aviso; nunca apaga dados) |
| Abrangência | **Só este sistema** (Gerador de Materiais) — modelado com `produto` para crescer depois |

### Defaults propostos para as lacunas restantes (ajustáveis)
- **Fingerprint (HWID):** `SHA-256( MachineGuid + serial do volume do sistema )`. O `MachineGuid`
  (registro do Windows) é estável a quase toda troca de peça; o serial do volume reforça. Envia-se
  **só o hash**. Reinstalar o Windows muda o MachineGuid → exige reset de vínculo (legítimo).
- **Transferência de máquina:** o admin faz **reset de vínculo** manualmente (sem limite fixo, mas
  **auditado**). Não há auto-transferência pelo cliente.
- **Frequência de revalidação:** na **inicialização quando online** + **a cada 24h** em segundo
  plano. A carência conta a partir da última revalidação bem-sucedida.
- **Auth do admin:** um **token de admin** (secret do Worker) que o painel guarda localmente
  (como já faz com o token do GitHub). RBAC simples: só admin opera licenças.

## 2. Componentes

```
┌─────────────────────┐        HTTPS         ┌──────────────────────────┐
│  Programa (Tauri)   │  ── ativar ───────▶  │  Cloudflare Worker        │
│  - fingerprint (HWID)│  ── revalidar ────▶  │  (API de licença)         │
│  - verifica token   │  ◀── token assinado  │  - chave PRIVADA (secret) │
│    (chave PÚBLICA)   │                      │  - assina Ed25519         │
│  - tela de bloqueio │                      │  - bind atômico           │
└─────────────────────┘                      │        │                  │
                                              │        ▼                  │
┌─────────────────────┐   admin (token)      │   Cloudflare D1 (SQLite)  │
│  Painel (publisher) │  ── CRUD licenças ─▶  │   licencas + auditoria    │
└─────────────────────┘                      └──────────────────────────┘
```

- A **chave privada NUNCA** sai do Worker (secret via `wrangler secret`). A **pública** é embutida
  no cliente para verificar offline. O cliente nunca recebe segredo de servidor.

## 3. Estados da licença

`CRIADA` (gerada, sem máquina) → `ATIVA` (vinculada + válida) → `EXPIRADA` (passou da data) /
`REVOGADA` (excluída pelo admin) / `SUSPENSA` (bloqueio temporário, opcional).

## 4. Fluxo de ativação (automático)

```
1. Programa sem licença → tela de ativação (campo da chave).
2. Cliente gera fingerprint (HWID) e um nonce.
3. POST /v1/activate { chave, fingerprint_hash, nonce }   (HTTPS)
4. Worker valida: chave existe, não revogada, não expirada,
   e NÃO vinculada a outra máquina (bind ATÔMICO: UPDATE ... WHERE fingerprint IS NULL).
   - Se já vinculada à MESMA máquina → reemite token (sem novo bind).
   - Se vinculada a OUTRA → 409 (rejeita).
5. Worker grava o vínculo e devolve TOKEN assinado (Ed25519).
6. Cliente verifica a assinatura (chave pública) e guarda o token no SQLite (meta).
```

## 5. Formato do token de ativação

Token = `base64url(payload_json) + "." + base64url(assinatura_ed25519)`.

```jsonc
// payload
{
  "v": 1,
  "id_licenca": "uuid",
  "produto": "gerador-materiais",
  "fingerprint_hash": "sha256…",
  "emitido_em": "2026-06-17T...Z",
  "expira_em": "2027-06-17T...Z",
  "dias_carencia": 15,
  "estado": "ATIVA"
}
```

- O cliente valida **offline**: assinatura OK + `fingerprint_hash` == HWID atual + `expira_em` no
  futuro + última revalidação dentro da carência.

## 6. Revalidação (heartbeat) + carência

```
- Na inicialização (online) e a cada 24h:
    POST /v1/revalidate { id_licenca, fingerprint_hash }  → { estado, expira_em }
- estado REVOGADA/EXPIRADA → TRAVA imediatamente.
- sucesso → grava "ultima_revalidacao = agora" (assinada/segura).
- Sem internet: continua funcionando ATÉ 15 dias após a última revalidação. Depois → trava
  pedindo conexão.
```

> Por que "offline para sempre" não coexiste com "excluir trava": detectar exclusão exige
> contato periódico com a nuvem. A **carência de 15 dias** é o equilíbrio.

## 7. Anti-adulteração

- Token + `ultima_revalidacao` guardados no SQLite (`meta`), não em arquivo texto trivial.
- **Retrocesso de relógio:** se o relógio do sistema estiver **antes** da última revalidação
  registrada → trata como adulteração (com tolerância de algumas horas p/ fuso/ajuste legítimo).
- Assinatura verificada a cada uso. Token editado → assinatura quebra → não licenciado.
- Honestidade: trava que roda na máquina do cliente **eleva a barreira, não é inquebrável**.

## 8. Mensagens de bloqueio (PT-BR, sem apagar dados)

| Motivo | Mensagem | Ações |
|---|---|---|
| Não ativado | "Ative o programa com sua chave de licença." | inserir chave |
| Licença de outra máquina | "Esta licença está vinculada a outro computador." | suporte / nova chave |
| Expirada | "Sua licença expirou em DD/MM/AAAA." | renovar / suporte |
| Revogada | "Esta licença foi desativada." | suporte |
| Carência estourada | "Sem validação há mais de 15 dias — conecte-se à internet." | tentar novamente |

## 9. Endpoints

| Método | Rota | Auth | Função |
|---|---|---|---|
| POST | `/v1/activate` | — (chave) | ativa + bind + token assinado |
| POST | `/v1/revalidate` | — (id+fp) | estado atual (heartbeat) |
| POST | `/v1/admin/licencas` | admin | criar licença |
| GET | `/v1/admin/licencas` | admin | listar |
| POST | `/v1/admin/licencas/:id/revogar` | admin | revogar |
| POST | `/v1/admin/licencas/:id/renovar` | admin | estender expiração |
| POST | `/v1/admin/licencas/:id/reset-bind` | admin | desvincular máquina |

- Todos por **HTTPS**. Ativação/revalidação com **rate limit** e **nonce/timestamp** (anti-replay).
- Logs **mascaram** a chave (só prefixo). Auditoria registra quem/o quê/quando/antes-depois.

## 10. Gestão da chave de assinatura

- Gerar par Ed25519 uma vez (`openssl`/script). **Privada** → `wrangler secret put LICENSE_SIGNING_KEY`.
  **Pública** → embutida no cliente (`app/src-tauri` ou JS).
- **Rotação:** suportar `kid` (key id) no token no futuro; cliente aceita N chaves públicas durante a
  transição. (Fora do escopo da v1; previsto.)
- A privada **nunca** vai para git nem para o cliente.

## 11. Limites de segurança (honestidade técnica)

- Atacante com a própria máquina pode tentar burlar (patch do binário, VM, spoof de HWID). O desenho
  (token assinado + HWID + revalidação + anti-relógio) **dificulta**, não impede.
- Para recursos realmente críticos, o ideal futuro é *gate no servidor*. Hoje o gate é no cliente
  (padrão para software desktop).
