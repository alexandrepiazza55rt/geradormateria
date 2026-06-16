# -*- coding: utf-8 -*-
"""
Compile raw extraction (data/*.json) into app-ready data (app/public/data/*.json).
Adds derived 'categoria', cleans labels. No engineering values are altered.
"""
import json, os, io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3"
DATA = os.path.join(ROOT, "data")
APPDATA = os.path.join(ROOT, "app", "public", "data")
os.makedirs(APPDATA, exist_ok=True)

FASES = {1: "Monofásico", 2: "Bifásico", 3: "Trifásico"}

def categoria(fases, tensao_kv):
    t = ("%g" % tensao_kv).replace(".", ",")
    return f"{FASES.get(int(fases), str(fases)+'Ø')} {t} kV"

def clean(s):
    if s is None: return None
    return re.sub(r"\s+", " ", str(s)).strip()

def load(name):
    p = os.path.join(DATA, name)
    if not os.path.exists(p): return None
    return json.load(open(p, encoding="utf-8"))

def main():
    materiais = load("materiais.json")
    estruturas = load("estruturas_mt.json") or []
    insumos = load("insumos_mt.json") or []

    # estruturas: add categoria, clean tipo, drop degenerate (no base+no postes)
    out_est = []
    for e in estruturas:
        if not e.get("base_bom") and not any(p.get("delta") for p in e.get("postes", [])):
            continue
        e = dict(e)
        e["tipo"] = clean(e["tipo"]) or "(sem nome)"
        e["condutor"] = clean(e.get("condutor"))
        e["categoria"] = categoria(e["fases"], e["tensao_kv"])
        out_est.append(e)

    out_ins = []
    for i in insumos:
        if not i.get("bom"): continue
        i = dict(i)
        i["descricao"] = clean(i["descricao"])
        i["categoria"] = categoria(i["fases"], i["tensao_kv"])
        # id for insumo
        i["id"] = f"I_{i['sheet']}_{i['cell']}".replace(" ", "").replace(",", "")
        out_ins.append(i)

    # materiais: keep only those actually referenced (smaller) OR keep all? keep all referenced + used
    used = set()
    for e in out_est:
        used.update(int(k) for k in e["base_bom"].keys())
        for p in e["postes"]:
            used.update(int(k) for k in p["delta"].keys())
    for i in out_ins:
        used.update(int(k) for k in i["bom"].keys())
    mats_out = [m for m in materiais if m["id"] in used]

    json.dump(mats_out, open(os.path.join(APPDATA, "materiais.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(out_est, open(os.path.join(APPDATA, "estruturas.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(out_ins, open(os.path.join(APPDATA, "insumos.json"), "w", encoding="utf-8"), ensure_ascii=False)

    # report
    from collections import Counter
    cats = Counter(e["categoria"] for e in out_est)
    print(f"materiais usados: {len(mats_out)} / {len(materiais)}")
    print(f"estruturas: {len(out_est)}  insumos: {len(out_ins)}")
    print("categorias:")
    for c, n in sorted(cats.items()):
        print(f"   {c}: {n} estruturas")
    # size
    for f in ("materiais.json", "estruturas.json", "insumos.json"):
        kb = os.path.getsize(os.path.join(APPDATA, f)) / 1024
        print(f"   {f}: {kb:.0f} KB")

if __name__ == "__main__":
    main()
