# -*- coding: utf-8 -*-
"""
Merge NDU 005 rural structures into the app data (id-keyed), WITHOUT altering
existing urban structures. Maps SISUP/SAP codes -> existing material ids; adds
new codes as new materials. Appends rural estruturas with new fields
(tipo_base, cruzeta, norma_origem, condicionais).
"""
import json, io, os, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
APP = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\app\public\data"

materiais = json.load(open(os.path.join(APP, "materiais.json"), encoding="utf-8"))
estruturas = json.load(open(os.path.join(APP, "estruturas.json"), encoding="utf-8"))
# strip any previous rural run (idempotent)
estruturas = [e for e in estruturas if e.get("norma_origem") != "NDU 005"]
materiais = [m for m in materiais if m.get("origem_norma") != "NDU 005"]

rural = json.load(open(os.path.join(APP, "ndu005_estruturas.json"), encoding="utf-8"))
rmats = json.load(open(os.path.join(APP, "ndu005_materiais.json"), encoding="utf-8"))
rdesc = {m["cod_sap"]: m for m in rmats}

by_code = {}
maxid = 0
for m in materiais:
    maxid = max(maxid, m["id"])
    if m.get("cod_sap"):
        by_code.setdefault(m["cod_sap"], m["id"])

def code_to_id(code):
    if not code:
        return None
    if code in by_code:
        return by_code[code]
    global maxid
    maxid += 1
    info = rdesc.get(code, {})
    materiais.append({
        "id": maxid,
        "cod_sap": code,
        "cod_lider7": "",
        "descricao": info.get("descricao", f"[NDU 005] {code}"),
        "unidade": info.get("unidade", "pç"),
        "origem_norma": "NDU 005",
    })
    by_code[code] = maxid
    return maxid

def conv(bom):
    out = {}
    for code, q in bom.items():
        mid = code_to_id(code)
        if mid is not None:
            out[str(mid)] = out.get(str(mid), 0) + q
    return out

added = 0
for e in rural:
    base = conv(e["base_bom"])
    postes = []
    for p in e["postes"]:
        postes.append({"poste": p["poste"], "delta": conv(p["delta"])})
    cond = []
    for c in e.get("condicionais", []):
        cond.append({
            "id": (code_to_id(c["codigo"]) if c.get("codigo") else None),
            "descricao": c.get("descricao_norma") or "",
            "qtd": c.get("qtd", 1),
            "condicao": c.get("condicao", ""),
        })
    estruturas.append({
        "id": e["id"],
        "norma_origem": "NDU 005",
        "tipo": e["tipo"],
        "tipo_base": e["tipo_base"],
        "cruzeta": e.get("cruzeta"),
        "condutor": e["condutor"],
        "tensao_kv": e["tensao_kv"],
        "classe_tensao_kv": e.get("classe_tensao_kv"),
        "nominal_kv": e["nominal_kv"],
        "fases": e["fases"],
        "tipo_fase": e.get("tipo_fase"),
        "categoria": e["categoria"],
        "poste_ref": e["poste_ref"],
        "base_bom": base,
        "postes": postes,
        "condicionais": cond,
        "pagina_origem": e.get("pagina_origem"),
    })
    added += 1

json.dump(materiais, open(os.path.join(APP, "materiais.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(estruturas, open(os.path.join(APP, "estruturas.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"materiais total: {len(materiais)} (novos NDU005: {sum(1 for m in materiais if m.get('origem_norma')=='NDU 005')})")
print(f"estruturas total: {len(estruturas)} (rurais NDU005: {added})")

# validation sample: U1 13,8 / 2 AWG
for e in estruturas:
    if e.get("norma_origem")=="NDU 005" and e["tipo_base"]=="U1" and abs(e["tensao_kv"]-13.8)<0.1 and e["condutor"]=="2 AWG":
        idmap = {m["id"]: m for m in materiais}
        print(f"\n=== {e['tipo']} {e['condutor']} {e['tensao_kv']}kV ({e['pagina_origem']}) ===")
        print("BASE BOM:")
        for k,q in e["base_bom"].items():
            m=idmap[int(k)]; print(f"  {q} x [{m['unidade']}] {m['cod_sap']} {m['descricao'][:46]}")
        print("POSTE deltas:", [(p["poste"], p["delta"]) for p in e["postes"][:3]])
        if e["condicionais"]:
            print("CONDICIONAIS:", [(c["descricao"][:30] or c["condicao"][:30]) for c in e["condicionais"]])
        break
