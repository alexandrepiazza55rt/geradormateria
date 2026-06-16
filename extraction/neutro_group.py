# -*- coding: utf-8 -*-
"""
Build the dedicated "Neutro Contínuo (NDU 005)" group:
 - recategorize S0/S0T/S1, dedup tensão variants (neutro é independente da tensão),
   keep condutor variation;
 - add insumos: 'Extensão da rede – cabo 2 CAA (m)' (0,14008 kg/m, SAP 90258, da
   própria planilha) and 'Aterramento – haste (1 a cada 2 postes)' (haste 2400mm +
   conector de aterramento, materiais da planilha).
Idempotent. Faithful: cable factor and grounding materials reused from the company's
own spreadsheet (probe_neutro.py).
"""
import json, io, os, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3"
APP = os.path.join(ROOT, "app", "public", "data")
DATA = os.path.join(ROOT, "data")
CAT = "Neutro Contínuo (NDU 005)"

full = json.load(open(os.path.join(DATA, "materiais.json"), encoding="utf-8"))
mat = json.load(open(os.path.join(APP, "materiais.json"), encoding="utf-8"))
est = json.load(open(os.path.join(APP, "estruturas.json"), encoding="utf-8"))
ins = json.load(open(os.path.join(APP, "insumos.json"), encoding="utf-8"))

by_id = {m["id"]: m for m in mat}
def ensure(rec):
    if rec["id"] not in by_id:
        mat.append(rec); by_id[rec["id"]] = rec
    return rec["id"]

def find_full(pred):
    for m in full:
        if pred(m): return m
    return None

cabo = find_full(lambda m: m.get("cod_sap") == "90258")
haste = find_full(lambda m: "haste de aterramento circular lisa 2400" in (m.get("descricao") or "").lower())
conec = find_full(lambda m: "conector de" in (m.get("descricao") or "").lower() and "aterramento" in (m.get("descricao") or "").lower() and "5/8" in (m.get("descricao") or ""))
print("cabo  :", cabo and (cabo["id"], cabo["cod_sap"], cabo["descricao"], cabo["unidade"]))
print("haste :", haste and (haste["id"], haste["descricao"], haste["unidade"]))
print("conec :", conec and (conec["id"], conec["descricao"], conec["unidade"]))
for r in (cabo, haste, conec):
    if r: ensure(r)

# --- 1) recategorize + dedup S0/S0T/S1 ---
neutro_tipos = ("S0", "S0T", "S1")
seen = set()
new_est = []
moved = 0
for e in est:
    if e.get("tipo_base") in neutro_tipos:
        key = (e["tipo_base"], e["condutor"])           # tensão-independent -> dedup
        if key in seen:
            continue
        seen.add(key)
        e = dict(e)
        e["categoria"] = CAT
        e["tipo"] = e["tipo_base"]
        e["tensao_kv"] = 0           # marker: independente de tensão
        e["fases"] = 0               # marker: independente de fase
        e["neutro"] = True
        moved += 1
        new_est.append(e)
    else:
        new_est.append(e)
est = new_est
print(f"\nestruturas neutro (após dedup): {moved}")

# --- 2) neutro insumos ---
ins = [i for i in ins if not str(i.get("id", "")).startswith("NEU_")]   # idempotent
if cabo:
    ins.append({
        "id": "NEU_CABO2", "categoria": CAT,
        "descricao": "Extensão da rede – cabo nu 2 CAA (informe os metros)",
        "unidade": "m", "fases": 0, "tensao_kv": 0,
        "bom": {str(cabo["id"]): 0.14008},     # kg por metro (fator da planilha)
    })
if haste:
    bom = {str(haste["id"]): 1.0}
    if conec: bom[str(conec["id"])] = 1.0
    ins.append({
        "id": "NEU_HASTE", "categoria": CAT,
        "descricao": "Aterramento do neutro – informe o nº de postes (1 haste a cada 2)",
        "unidade": "poste", "postes_por_haste": 2, "fases": 0, "tensao_kv": 0,
        "bom": bom,    # bom é POR HASTE; a UI converte postes -> hastes (arredonda p/ cima)
    })

json.dump(mat, open(os.path.join(APP, "materiais.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(est, open(os.path.join(APP, "estruturas.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(ins, open(os.path.join(APP, "insumos.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"materiais: {len(mat)}  estruturas: {len(est)}  insumos: {len(ins)} (neutro insumos: {sum(1 for i in ins if str(i['id']).startswith('NEU_'))})")
