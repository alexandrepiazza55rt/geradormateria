// Gera um par de chaves Ed25519 para assinar os tokens de licença.
// Rode UMA vez:  node scripts/genkeys.mjs
//   - PRIVADA  → `wrangler secret put LICENSE_SIGNING_KEY` (NUNCA commitar/embutir no cliente)
//   - PUBLICA  → embutir no cliente (app) e em LICENSE_PUBLIC_KEY do wrangler.toml
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex } from "@noble/hashes/utils";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const priv = ed.utils.randomPrivateKey();
const pub = ed.getPublicKey(priv);

console.log("=== Par de chaves Ed25519 (guarde com cuidado) ===\n");
console.log("PRIVADA (secret do Worker, NUNCA no cliente/git):");
console.log("  " + bytesToHex(priv) + "\n");
console.log("PUBLICA (embutir no cliente):");
console.log("  " + bytesToHex(pub) + "\n");
