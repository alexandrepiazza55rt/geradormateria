# -*- coding: utf-8 -*-
import json, os, glob, re
OUT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3"
REQ = ["id","norma_origem","tipo","condutor","tensao_kv","nominal_kv","fases","poste_ref","base_bom","postes","categoria"]

def unit_bom(est, idx):
    out = dict(est["base_bom"])
    for k,v in est["postes"][idx]["delta"].items():
        out[k] = out.get(k,0)+v
        if abs(out[k])<1e-9: del out[k]
    return {k:v for k,v in out.items() if abs(v)>1e-9}

files = sorted(glob.glob(os.path.join(OUT,"B*.json")), key=lambda p:int(re.search(r'B(\d+)',p).group(1)))
total_c=0; total_b=0; ok=True
for f in files:
    e=json.load(open(f,encoding="utf-8"))
    for r in REQ:
        if r not in e: print("FALTA campo",r,"em",e["id"]); ok=False
    assert e["postes"][0]["poste"]==e["poste_ref"]
    total_c+=len(e["condicionais"]); total_b+=len(e["base_bom"])
    sc=unit_bom(e,0); dt=unit_bom(e,1); pf=unit_bom(e,2)
    print(f"{e['id']:4} {e['tipo']:28} | SC itens={len(sc)} DT itens={len(dt)} PRFV itens={len(pf)} | cond={len(e['condicionais'])}")
mn=json.load(open(os.path.join(OUT,"materiais_novos.json"),encoding="utf-8"))
cons=json.load(open(os.path.join(OUT,"ndu004_3_estruturas.json"),encoding="utf-8"))
print(f"\nArquivos B*.json: {len(files)} | consolidado: {len(cons)} estruturas | materiais_novos: {len(mn)}")
print(f"Total base_bom itens: {total_b} | total condicionais: {total_c}")
print("Todos os JSON parseiam e têm campos obrigatórios:", "OK" if ok else "FALHOU")
