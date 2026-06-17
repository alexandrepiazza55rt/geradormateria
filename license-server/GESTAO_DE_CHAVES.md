# Gestão da chave de assinatura (Ed25519)

A licença é provada por um **token assinado** com uma chave **privada** que fica **só no
servidor**. O programa do cliente tem apenas a **chave pública** para conferir. Se a privada
vazar, qualquer um consegue forjar licenças — por isso o cuidado abaixo.

## 1. Gerar o par (uma vez)

```bash
cd license-server
node scripts/genkeys.mjs
```

Saem duas linhas hexadecimais: **PRIVADA** e **PÚBLICA**. Guarde a privada num lugar seguro
(gerenciador de senhas). **Nunca** a coloque no git, no programa do cliente, nem em mensagens.

## 2. Onde cada uma vai

| Chave | Destino | Como |
|---|---|---|
| **PRIVADA** | Secret do Worker | `wrangler secret put LICENSE_SIGNING_KEY` (cola a hex) |
| **PÚBLICA** | Programa do cliente | constante em `app/src/lib/license/publicKey.ts` |
| **PÚBLICA** | `wrangler.toml` → `LICENSE_PUBLIC_KEY` | informativa |

Também defina o token de admin: `wrangler secret put ADMIN_TOKEN` (uma senha forte que você usa
no painel para gerenciar licenças).

## 3. Desenvolvimento local

Crie `license-server/.dev.vars` (já no `.gitignore`):

```
LICENSE_SIGNING_KEY=<hex privada de TESTE>
ADMIN_TOKEN=<senha de teste>
```

Use um par **de teste** local — nunca o de produção.

## 4. Rotação (trocar a chave)

Se a privada vazar ou por política:
1. Gere um novo par.
2. O cliente passa a aceitar **as duas públicas** (antiga + nova) durante a transição (campo
   `kid` no token — previsto para a v2).
3. Emita novos tokens com a nova privada; quando todos os clientes tiverem revalidado, aposente a
   antiga.

> A v1 usa uma única chave. Para rotação sem dor, a v2 adiciona `kid`. Enquanto isso, trocar a
> chave exige reativação dos clientes.

## 5. Regras de ouro
- Privada **só** no secret do Worker. Nunca no git/cliente/log.
- Logs mascaram a chave de licença (só o prefixo).
- Backup da privada **offline** e cifrado.
