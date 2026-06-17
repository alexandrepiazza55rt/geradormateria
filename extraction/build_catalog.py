# -*- coding: utf-8 -*-
"""
build_catalog.py — Quebra a base em UMA estrutura por arquivo + índice publicável.

Objetivo (pedido do projeto): poder lançar/corrigir UMA estrutura subindo só o
JSON dela, e o cliente recebe automaticamente. Para isso a base deixa de ser um
monolito e passa a:

    app/public/data/structures/<id>.json   ← FONTE de cada estrutura (você edita aqui)
    app/public/data/catalog.json           ← índice: id, rev, status, sha256, bytes
    app/public/data/estruturas.json         ← BUNDLE regenerado (fallback web/dev)

Fluxo:
  - Bootstrap (1ª vez): se structures/ está vazio, semeia a partir de estruturas.json,
    adicionando metadados de publicação (schema_version, rev=1, status="ativo").
  - Depois: structures/*.json é a FONTE. Este script (re)gera catalog.json e o bundle
    estruturas.json a partir dela — então web e desktop nunca divergem.
  - A ORDEM original é preservada via catalog.json (novos ids entram ao final).

Não altera nenhum valor de engenharia (base_bom/postes/delta passam intactos).
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
MONO = os.path.join(DATA, "estruturas.json")
CATALOG = os.path.join(DATA, "catalog.json")

SCHEMA_VERSION = 1
DATA_VERSION = sys.argv[1] if len(sys.argv) > 1 else f"{date.today():%Y.%m.%d}-split1"

# Campos de metadados de publicação (não são dados de engenharia).
META_DEFAULTS = {"schema_version": SCHEMA_VERSION, "rev": 1, "status": "ativo"}


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def dump_struct(path, obj):
    """Escreve um arquivo de estrutura (indentado p/ diff legível) e retorna bytes."""
    text = json.dumps(obj, ensure_ascii=False, indent=1)
    data = text.encode("utf-8")
    with open(path, "wb") as f:
        f.write(data)
    return data


def sha256_hex(data):
    return hashlib.sha256(data).hexdigest()


def with_meta(est):
    """Reordena para que metadados de publicação apareçam no topo do arquivo."""
    out = {}
    for k, v in META_DEFAULTS.items():
        out[k] = est.get(k, v)
    for k, v in est.items():
        if k not in out:
            out[k] = v
    return out


def main():
    os.makedirs(STRUCT_DIR, exist_ok=True)
    existing = {fn[:-5] for fn in os.listdir(STRUCT_DIR) if fn.endswith(".json")}

    # Ordem canônica: catalog anterior (se houver) → preserva; senão estruturas.json.
    order = []
    if os.path.exists(CATALOG):
        order = [s["id"] for s in load(CATALOG).get("structures", [])]

    # Bootstrap: semeia structures/ a partir do monolito se necessário.
    if not existing and os.path.exists(MONO):
        mono = load(MONO)
        order = [e["id"] for e in mono]
        for e in mono:
            dump_struct(os.path.join(STRUCT_DIR, f"{e['id']}.json"), with_meta(e))
        existing = {e["id"] for e in mono}
        print(f"bootstrap: {len(existing)} estruturas semeadas em structures/")

    # Acrescenta ao fim quaisquer arquivos novos não presentes na ordem.
    for sid in sorted(existing):
        if sid not in order:
            order.append(sid)
    order = [sid for sid in order if sid in existing]

    # Lê structures/ como FONTE, monta catalog + bundle na ordem canônica.
    catalog_items = []
    bundle = []
    for sid in order:
        path = os.path.join(STRUCT_DIR, f"{sid}.json")
        est = load(path)
        est = with_meta(est)  # garante metadados presentes/no topo
        data = dump_struct(path, est)  # reescreve normalizado (idempotente)
        bundle.append(est)
        catalog_items.append({
            "id": sid,
            "rev": est.get("rev", 1),
            "categoria": est.get("categoria", ""),
            "status": est.get("status", "ativo"),
            "file": f"structures/{sid}.json",
            "bytes": len(data),
            "sha256": sha256_hex(data),
        })

    catalog = {
        "schema_version": SCHEMA_VERSION,
        "data_version": DATA_VERSION,
        "generated_at": str(date.today()),
        "structures": catalog_items,
    }
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=1)

    # Bundle estruturas.json (fallback web/dev): compacto, como antes.
    with open(MONO, "w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False)

    print(f"catalog.json: {len(catalog_items)} estruturas (data_version={DATA_VERSION})")
    print(f"bundle estruturas.json regenerado ({len(bundle)} estruturas)")
    print(f"ativos: {sum(1 for c in catalog_items if c['status'] == 'ativo')}  "
          f"descontinuados: {sum(1 for c in catalog_items if c['status'] != 'ativo')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
