# -*- coding: utf-8 -*-
"""
publish.py — Prepara um PACOTE de atualização da base para distribuição.

Fluxo de quem mantém a base (você):
  1. Cria/edita `app/public/data/structures/<id>.json` (a FONTE de cada estrutura).
     Ao CORRIGIR uma existente, suba o campo `rev`.
  2. Roda este script com a nova versão:  python publish.py 2026.07.01-r2 "notas"
  3. Ele:
       - regenera catalog.json + bundle (via build_catalog.py),
       - VALIDA a base (validate_base.py --structures); aborta se houver erro,
       - monta manifest.json (impressão digital de TODA a base: sha256 + bytes),
       - compara com o último publicado e avisa se uma estrutura mudou de conteúdo
         SEM bump de `rev` (disciplina que evita publicar correção sem versão),
       - copia para `extraction/dist/publish/` SOMENTE os arquivos alterados +
         o manifest.json — é isso que você sobe no host.
  4. Sobe `extraction/dist/publish/` no host (GitHub Releases / S3 / Azure / etc.).

Não depende de host nem de rede. O download no cliente é a Fase 3 (UpdateService).
"""
import json
import os
import sys
import io
import shutil
import hashlib
import subprocess
from datetime import date

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "app", "public", "data")
STRUCT_DIR = os.path.join(DATA, "structures")
CATALOG = os.path.join(DATA, "catalog.json")
DIST = os.path.join(HERE, "dist", "publish")
LAST_MANIFEST = os.path.join(HERE, "dist", "last_manifest.json")

# Arquivos de topo que o APP LÊ em runtime (o que vale distribuir por update).
# O bundle estruturas.json é só web/dev; os ndu005_* não são lidos em runtime —
# por isso ficam FORA do manifest de atualização.
TOP_FILES = ["materiais.json", "insumos.json", "precos.json", "catalog.json"]


def host_asset(name):
    """Nome do arquivo NO HOST. GitHub Releases tem namespace plano: achata `/`."""
    return name.replace("/", "__")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest(), os.path.getsize(path)


def base_files():
    """Lista (nome_relativo, caminho_absoluto) de todos os arquivos da base."""
    files = []
    for name in TOP_FILES:
        p = os.path.join(DATA, name)
        if os.path.exists(p):
            files.append((name, p))
    if os.path.isdir(STRUCT_DIR):
        for fn in sorted(os.listdir(STRUCT_DIR)):
            if fn.endswith(".json"):
                files.append((f"structures/{fn}", os.path.join(STRUCT_DIR, fn)))
    return files


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def run(script, *args):
    r = subprocess.run([sys.executable, os.path.join(HERE, script), *args])
    return r.returncode


def main():
    if len(sys.argv) < 2:
        print("uso: python publish.py <data_version> [notas]")
        print("ex.:  python publish.py 2026.07.01-r2 \"reajuste de preços\"")
        return 2
    data_version = sys.argv[1]
    notes = sys.argv[2] if len(sys.argv) > 2 else ""

    # 1) regenera catalog + bundle com a nova versão
    if run("build_catalog.py", data_version) != 0:
        print("ERRO: build_catalog.py falhou.")
        return 1

    # 2) valida (estruturas por arquivo); aborta se houver erro
    if run("validate_base.py", "--structures") != 0:
        print("ERRO: validação falhou — publicação ABORTADA.")
        return 1

    # 3) manifest atual (impressão digital de toda a base)
    files = base_files()
    manifest_files = []
    digest = {}
    for name, path in files:
        sha, size = sha256_file(path)
        entry = {"name": name, "sha256": sha, "bytes": size}
        asset = host_asset(name)
        if asset != name:
            entry["asset"] = asset
        manifest_files.append(entry)
        digest[name] = sha
    manifest = {
        "data_version": data_version,
        "files": manifest_files,
        "notes": notes,
        "generated_at": str(date.today()),
    }

    # 4) diff vs último publicado + checagem de rev
    prev = load_json(LAST_MANIFEST)
    prev_digest = {f["name"]: f["sha256"] for f in prev["files"]} if prev else {}
    changed = [n for n in digest if digest[n] != prev_digest.get(n)]
    removed = [n for n in prev_digest if n not in digest]

    # estrutura mudou de conteúdo mas manteve rev? (compara rev no catalog vs anterior)
    catalog = load_json(CATALOG)
    rev_now = {c["id"]: c.get("rev", 1) for c in catalog["structures"]}
    warns = []
    if prev:
        prev_rev = prev.get("_rev_by_id", {})
        for name in changed:
            if name.startswith("structures/"):
                sid = name[len("structures/"):-len(".json")]
                if sid in prev_rev and rev_now.get(sid) == prev_rev[sid]:
                    warns.append(f"estrutura {sid} mudou de conteúdo mas rev continua "
                                 f"{rev_now.get(sid)} — suba o rev antes de publicar")
    manifest["_rev_by_id"] = rev_now  # auxiliar p/ a próxima checagem de rev

    if warns and "--allow-same-rev" not in sys.argv:
        print("\nPUBLICAÇÃO ABORTADA (rev não atualizado):")
        for w in warns:
            print(f"  - {w}")
        print("Suba o(s) rev ou rode de novo com --allow-same-rev.")
        return 1

    # 5) empacota só os alterados + manifest em dist/publish/
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST, exist_ok=True)
    # Pacote PLANO (nomes achatados) — pronto p/ subir como assets no GitHub Releases.
    files_map = dict(files)
    for name in changed:
        src = files_map.get(name) or os.path.join(DATA, name)
        shutil.copy2(src, os.path.join(DIST, host_asset(name)))
    with open(os.path.join(DIST, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({k: v for k, v in manifest.items() if k != "_rev_by_id"},
                  f, ensure_ascii=False, indent=1)
    # guarda manifest completo (com _rev_by_id) p/ o próximo diff
    os.makedirs(os.path.dirname(LAST_MANIFEST), exist_ok=True)
    with open(LAST_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)

    print(f"\nversão: {data_version}  ({len(files)} arquivos na base)")
    print(f"alterados desde a última publicação: {len(changed)}")
    print(f"removidos: {len(removed)}" + (f" {removed[:5]}" if removed else ""))
    print(f"pacote em: {DIST}  (suba esta pasta no host)")
    if not prev:
        print("(primeira publicação — todos os arquivos foram empacotados)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
