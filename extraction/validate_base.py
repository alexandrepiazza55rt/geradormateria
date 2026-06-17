# -*- coding: utf-8 -*-
"""
validate_base.py — Lint da base de engenharia ANTES de publicar.

Um JSON com defeito publicado vai para TODOS os clientes de uma vez. O SHA-256
garante que o arquivo chegou inteiro — não que está CORRETO. Este lint roda contra
a base do app (ou um diretório structures/) e FALHA (exit 1) se algo estiver errado:

  - schema mínimo de materiais/estruturas/insumos;
  - integridade referencial: todo id citado em base_bom/delta/bom existe no catálogo;
  - ids de estrutura únicos; ids de material únicos;
  - sanidade numérica (sem NaN/Inf; quantidades finitas);
  - consistência com o registro de identidade (nenhum id de material fora do registro).

Uso:
    python validate_base.py                 # valida app/public/data (monolito)
    python validate_base.py --structures    # valida também app/public/data/structures/*
"""
import json
import os
import sys
import io
import math

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "app", "public", "data")
REGISTRY = os.path.join(HERE, "material_registry.json")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


class Report:
    def __init__(self):
        self.errors = []
        self.warns = []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    def finish(self):
        for w in self.warns:
            print(f"  aviso: {w}")
        for e in self.errors:
            print(f"  ERRO:  {e}")
        if self.errors:
            print(f"\nFALHOU: {len(self.errors)} erro(s), {len(self.warns)} aviso(s).")
            return 1
        print(f"\nOK: base válida ({len(self.warns)} aviso(s)).")
        return 0


def is_finite_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)


def check_bom_map(bom, where, valid_ids, r):
    """Valida um mapa material_id(str) -> quantidade."""
    if not isinstance(bom, dict):
        r.err(f"{where}: bom não é objeto")
        return
    for k, v in bom.items():
        try:
            mid = int(k)
        except (ValueError, TypeError):
            r.err(f"{where}: chave de material não-inteira {k!r}")
            continue
        if mid not in valid_ids:
            r.err(f"{where}: material id {mid} não existe no catálogo")
        if not is_finite_number(v):
            r.err(f"{where}: quantidade inválida para material {mid}: {v!r}")


def validate_materiais(mats, registry_ids, r):
    seen = set()
    valid_ids = set()
    for m in mats:
        mid = m.get("id")
        if not isinstance(mid, int) or isinstance(mid, bool):
            r.err(f"material com id inválido: {m!r}")
            continue
        if mid in seen:
            r.err(f"material id duplicado: {mid}")
        seen.add(mid)
        valid_ids.add(mid)
        if not str(m.get("descricao", "")).strip():
            r.warn(f"material {mid} sem descrição")
        if registry_ids is not None and mid not in registry_ids:
            r.err(f"material id {mid} NÃO está no registro de identidade "
                  f"(rode build_registry.py para congelá-lo antes de publicar)")
    return valid_ids


def validate_estrutura(e, valid_ids, seen_ids, r):
    eid = e.get("id")
    if not eid:
        r.err(f"estrutura sem id: {e.get('tipo', '?')}")
        return
    if eid in seen_ids:
        r.err(f"id de estrutura duplicado: {eid}")
    seen_ids.add(eid)
    if not e.get("base_bom") and not any(p.get("delta") for p in e.get("postes", [])):
        r.warn(f"estrutura {eid} degenerada (sem base_bom nem deltas)")
    check_bom_map(e.get("base_bom", {}), f"estrutura {eid}.base_bom", valid_ids, r)
    for i, p in enumerate(e.get("postes", [])):
        if not p.get("poste"):
            r.warn(f"estrutura {eid}.postes[{i}] sem label de poste")
        check_bom_map(p.get("delta", {}), f"estrutura {eid}.postes[{i}].delta", valid_ids, r)
    status = e.get("status", "ativo")
    if status not in ("ativo", "descontinuado"):
        r.err(f"estrutura {eid}: status inválido {status!r}")


def main():
    use_structures = "--structures" in sys.argv
    r = Report()
    print(f"validando base em: {DATA}")

    registry_ids = None
    if os.path.exists(REGISTRY):
        registry_ids = {e["id"] for e in load(REGISTRY)["materials"]}
    else:
        r.warn("material_registry.json ausente — pulando checagem de congelamento")

    mats = load(os.path.join(DATA, "materiais.json"))
    valid_ids = validate_materiais(mats, registry_ids, r)
    print(f"  materiais: {len(valid_ids)}")

    # estruturas: monolito e/ou structures/*
    seen_ids = set()
    n_est = 0
    mono = os.path.join(DATA, "estruturas.json")
    if os.path.exists(mono) and not use_structures:
        for e in load(mono):
            validate_estrutura(e, valid_ids, seen_ids, r)
            n_est += 1
    sdir = os.path.join(DATA, "structures")
    if use_structures and os.path.isdir(sdir):
        for fn in sorted(os.listdir(sdir)):
            if not fn.endswith(".json"):
                continue
            e = load(os.path.join(sdir, fn))
            if e.get("id") and fn != f"{e['id']}.json":
                r.warn(f"{fn}: nome do arquivo difere do id {e.get('id')!r}")
            validate_estrutura(e, valid_ids, seen_ids, r)
            n_est += 1
    print(f"  estruturas: {n_est}")

    ins_path = os.path.join(DATA, "insumos.json")
    if os.path.exists(ins_path):
        insumos = load(ins_path)
        for i in insumos:
            check_bom_map(i.get("bom", {}), f"insumo {i.get('id', '?')}.bom", valid_ids, r)
        print(f"  insumos: {len(insumos)}")

    return r.finish()


if __name__ == "__main__":
    sys.exit(main())
