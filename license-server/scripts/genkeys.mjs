// Gera um par de chaves Ed25519 para assinar os tokens de licença.
// Rode UMA vez:  node scripts/genkeys.mjs
//   - PRIVADA  → `wrangler secret put LICENSE_SIGNING_KEY` (NUNCA commitar/embutir no cliente)
//   - PUBLICA  → embutir no cliente (app) e em LICENSE_PUBLIC_KEY do wrangler.toml
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex } from "@noble/hashes/utils";
import { writeFileSync } from "node:fs";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const priv = bytesToHex(ed.utils.randomPrivateKey());
const pub = bytesToHex(ed.getPublicKey(priv));

// Grava em arquivos (sem quebra de linha) para evitar erro ao colar no terminal.
// priv.key é gitignored e deve ser APAGADO após subir o secret.
writeFileSync("priv.key", priv);
writeFileSync("pub.key", pub);

console.log("=== Par de chaves Ed25519 gerado ===\n");
console.log("Arquivos criados nesta pasta:");
console.log("  priv.key  → suba como secret e APAGUE (NUNCA no git/cliente)");
console.log("  pub.key   → me envie este (vai embutido no cliente)\n");
console.log("PUBLICA (também aqui p/ copiar):");
console.log("  " + pub + "\n");
console.log("Próximos passos:");
console.log("  Get-Content priv.key -Raw | npx wrangler secret put LICENSE_SIGNING_KEY");
console.log("  npx wrangler deploy");
console.log("  Remove-Item priv.key\n");
