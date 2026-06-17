# -*- coding: utf-8 -*-
"""
gen_seed_manifest.py — Gera app/public/data/manifest.json (formato CDN, sem achatar).

É o manifest que o repositório de dados (gerador-base) usa como ponto de partida e que
o programa dos clientes baixa para decidir atualizações. Lista os arquivos de RUNTIME
(materiais/insumos/precos/catalog + structures/*) com sha256 e bytes REAIS dos arquivos
atuais — para que os checksums batam com a seed embutida no .exe.

Diferente do publish.py (que achata nomes p/ release-asset), aqui `name` = caminho real.
"""
import json
import os
import sys
import io
import hashlib
from datetime import date

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "app", "public", "data")
STRUCT_DIR = os.path.join(DATA, "structures")
TOP_FILES = ["materiais.json", "insumos.json", "precos.json", "catalog.json"]


def sha_bytes(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest(), os.path.getsize(path)


def main():
    data_version = "1970.01.01-seed"
    cat = os.path.join(DATA, "catalog.json")
    if os.path.exists(cat):
        data_version = json.load(open(cat, encoding="utf-8")).get("data_version", data_version)

    files = []
    for name in TOP_FILES:
        p = os.path.join(DATA, name)
        if os.path.exists(p):
            sha, size = sha_bytes(p)
            files.append({"name": name, "sha256": sha, "bytes": size})
    for fn in sorted(os.listdir(STRUCT_DIR)):
        if fn.endswith(".json"):
            sha, size = sha_bytes(os.path.join(STRUCT_DIR, fn))
            files.append({"name": f"structures/{fn}", "sha256": sha, "bytes": size})

    manifest = {
        "data_version": data_version,
        "files": files,
        "notes": "seed inicial",
        "generated_at": str(date.today()),
    }
    out = os.path.join(DATA, "manifest.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(f"manifest.json: {len(files)} arquivos (data_version={data_version}) -> {out}")


if __name__ == "__main__":
    main()
