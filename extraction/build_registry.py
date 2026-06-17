# -*- coding: utf-8 -*-
"""
build_registry.py — Constrói/atualiza o REGISTRO DE IDENTIDADE dos materiais.

Por quê: o `id` inteiro do material é, historicamente, a POSIÇÃO da linha na
planilha. Quando a planilha é reextraída, as linhas deslizam e o mesmo `id` passa
a apontar para outro material — corrompendo silenciosamente os preços/orçamentos
que o cliente já cadastrou (chaveados por esse id). O registro CONGELA o vínculo
`id -> material` para que a numeração nunca mais dependa de posição.

Fonte de verdade (decisão do projeto): a base que o APP usa hoje
(`app/public/data/materiais.json`), que é internamente consistente. A pasta
`data/` (extração crua) está dessincronizada e fica em QUARENTENA — NÃO é usada
aqui.

Comportamento append-only: se o registro já existe, ids existentes nunca mudam;
materiais novos recebem o próximo id livre (>= next_id). Rodar sem a planilha:
apenas relê a base do app e reconcilia.
"""
import json
import os
import sys
import io
import re
import unicodedata
from datetime import date

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
APP_MATERIAIS = os.path.join(ROOT, "app", "public", "data", "materiais.json")
REGISTRY = os.path.join(HERE, "material_registry.json")


def norm(s):
    """Normalização sem acento/caixa — espelha precos.ts:normalizar."""
    if s is None:
        return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def identity_key(mat, sap_counts):
    """Chave estável p/ casar futuras extrações ao id já congelado.

    Preferência: cod_sap quando não-vazio E único na base. Senão, descrição+unidade
    normalizadas. (O `id` continua sendo a autoridade; esta chave é só o matcher.)
    """
    sap = str(mat.get("cod_sap", "")).strip()
    if sap and sap_counts.get(sap, 0) == 1:
        return f"sap:{sap}"
    return f"desc:{norm(mat.get('descricao'))}|{norm(mat.get('unidade'))}"


def main():
    mats = load_json(APP_MATERIAIS)
    if not mats:
        print(f"ERRO: base do app não encontrada em {APP_MATERIAIS}")
        return 1

    sap_counts = {}
    for m in mats:
        sap = str(m.get("cod_sap", "")).strip()
        if sap:
            sap_counts[sap] = sap_counts.get(sap, 0) + 1

    reg = load_json(REGISTRY) or {
        "schema": 1,
        "frozen_from": "app/public/data/materiais.json",
        "generated_at": str(date.today()),
        "next_id": 1,
        "materials": [],
    }
    by_id = {e["id"]: e for e in reg["materials"]}
    by_key = {e["identity_key"]: e for e in reg["materials"]}

    added = 0
    used_keys = set()
    for m in mats:
        mid = m["id"]
        key = identity_key(m, sap_counts)
        # desambigua colisão de chave preservando unicidade no registro
        base_key, n = key, 1
        while key in used_keys and (by_key.get(key, {}).get("id") != mid):
            n += 1
            key = f"{base_key}#{n}"
        used_keys.add(key)

        entry = {
            "id": mid,
            "identity_key": key,
            "cod_sap": m.get("cod_sap", ""),
            "cod_lider7": m.get("cod_lider7", ""),
            "descricao": m.get("descricao", ""),
            "unidade": m.get("unidade", ""),
        }
        if m.get("origem_norma"):
            entry["origem_norma"] = m["origem_norma"]

        if mid in by_id:
            # id já congelado: NUNCA muda identidade; só completa metadados ausentes
            by_id[mid].setdefault("identity_key", key)
        else:
            by_id[mid] = entry
            added += 1

    materials = sorted(by_id.values(), key=lambda e: e["id"])
    next_id = max((e["id"] for e in materials), default=0) + 1
    reg.update(
        {
            "generated_at": str(date.today()),
            "next_id": next_id,
            "materials": materials,
        }
    )

    with open(REGISTRY, "w", encoding="utf-8") as f:
        json.dump(reg, f, ensure_ascii=False, indent=1)

    print(f"registro: {len(materials)} materiais (ids 1..{next_id - 1}), +{added} novos")
    print(f"next_id (próximo livre): {next_id}")
    print(f"gravado em: {REGISTRY}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
