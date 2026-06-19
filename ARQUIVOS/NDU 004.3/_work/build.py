# -*- coding: utf-8 -*-
"""Build NDU 004.3 structure JSONs + materiais_novos.json from image-verified BOMs."""
import json, os, re

OUT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3"
BASE_MAT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\app\public\data\materiais.json"

# ---- material ids (resolved against base by cod_sap/description) ----
ARRUELA=14; ARMACAO=346; PARAF45=341; PARAF70=342; ISOLADOR=347; PORCA_OLHAL=323
OLHAL_PARAF=161           # reuse by description (base cod_sap 502955 ~ norma SISUP 90446) -> REVISAR
ABRACADEIRA=356           # NEW (SISUP 90395) — usa o next_id do modelo congelado

NEW_NEXT_ID = 357
NEW_MATERIALS = [
    {"id":356,"identity_key":"sap:90395","cod_sap":"90395","cod_lider7":"","descricao":"Abraçadeira autotravante","unidade":"pç"},
]

TAB = {  # §17 anexo table titles
 "A":"Parafusos Rosca Total","B":"Suporte p/ Transformador em Poste Concreto Circular",
 "C":"Suporte p/ Transformador em Poste Concreto Duplo T","D":"Terminal de Compressão",
 "E":"Terminal de Estrangulamento","F":"Transformador de Distribuição Trifásico/Monofásico",
 "G":"Poste de Concreto Duplo T","H":"Cinta para Poste Circular","I":"Poste de Concreto Circular",
 "J":"Alça Pré-Formada de Distribuição","L":"Poste de Fibra de Vidro","M":"Braços com Grampos de Suspensão",
 "N":"Laço Pré-Formado de Roldana","O":"Conectores Perfurantes","P":"(não consta no índice do §17)"}

def q(v):  # format a qty cell
    return "Variável" if v=="V" else ("–" if v is None else f"{int(v):02d}")

def cond(desc, tab, sc, dt, prfv, etu):
    qtd = next((x for x in (sc,dt,prfv) if isinstance(x,(int,float))), 0)
    breakdown = f"qtd SC/DT/PRFV: {q(sc)}/{q(dt)}/{q(prfv)}"
    extra = " (Tabela P não consta no índice do §17)" if tab == "P" else ""
    return {"id":None,"descricao":desc,"qtd":float(qtd),
            "condicao":f"Resolver conforme Tabela {tab} citada na norma{extra} — NDU 004.3 §17 (Anexos, p.195+); {breakdown}; ETU {etu}."}

# Each structure: id, tipo, fixed[(mid,sc,dt,prfv)], cond[(desc,tab,sc,dt,prfv,etu)], page, obs
S = []
def add(bid,tipo,fixed,conds,page,obs=None):
    S.append(dict(bid=bid,tipo=tipo,fixed=fixed,conds=conds,page=page,obs=obs))

add("B1","SI1",
 [(ARRUELA,None,2,2),(ABRACADEIRA,2,2,2),(ARMACAO,2,2,2),(PARAF45,4,None,None),(PARAF70,6,None,None),(ISOLADOR,2,2,2)],
 [("Cinta para poste circular","H",3,None,None,"130.1"),("Parafuso de rosca total","A",None,3,3,"130.1"),
  ("Poste de concreto circular","I",1,None,None,"114.1"),("Poste de concreto duplo T","G",None,1,None,"114.1"),
  ("Poste de fibra de vidro","L",None,None,1,"114.3"),("Braços com grampos de suspensão","M",1,1,1,"206"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],98)

add("B2","SI1A",
 [(ARRUELA,None,1,1),(ABRACADEIRA,2,2,2),(ARMACAO,3,3,3),(PARAF45,3,None,None),(PARAF70,4,None,None),(ISOLADOR,3,3,3)],
 [("Cinta para poste circular","C",2,None,None,"130.1"),("Parafuso de rosca total","A",None,2,2,"130.1"),
  ("Laço pré-formado de roldana","N",2,2,2,"116.2"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],101,
 obs="Estrutura SI1 (alternativa). A norma imprime 23 isoladores tipo roldana na coluna PRFV (p.101); valor improvável (SC/DT=03) — adotado 03; CONFIRMAR (REVISAR).")

add("B3","SI3",
 [(ABRACADEIRA,3,3,3),(ARMACAO,2,2,2),(PARAF45,1,None,None),(PARAF70,2,None,None),(ISOLADOR,2,2,2)],
 [("Cinta para poste circular","I",1,None,None,"130.1"),("Parafuso de rosca total","A",None,1,1,"130.1"),
  ("Alça pré-formada de distribuição","J",1,1,1,"116.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"116.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],104)

add("B4","SI4",
 [(ABRACADEIRA,6,6,6),(ARMACAO,4,4,4),(PARAF45,4,None,None),(PARAF70,4,None,None),(ISOLADOR,4,4,4)],
 [("Cinta para poste circular","H",2,None,None,"130.1"),("Parafuso de rosca total","A",None,2,2,"130.1"),
  ("Alça pré-formada de distribuição","J",4,4,4,"116.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],109)

add("B5","SI4A",
 [(ABRACADEIRA,6,6,6),(OLHAL_PARAF,2,2,2),(ARMACAO,3,3,3),(PARAF45,3,None,None),(PARAF70,3,None,None),(ISOLADOR,3,3,3)],
 [("Cinta para poste circular","H",2,None,None,"130.1"),("Parafuso de rosca total","A",None,2,2,"130.1"),
  ("Alça pré-formada de distribuição","J",2,2,2,"116.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],136,
 obs="Estrutura SI4 (alternativa). Usa Olhal para parafuso (SISUP 90446) -> mapeado ao id 161 'Olhal para parafuso' (base cod_sap 502955) por descrição idêntica; CONFIRMAR código (REVISAR).")

add("B6","SI1-SI3",
 [(ARRUELA,None,2,2),(ABRACADEIRA,5,5,5),(ARMACAO,2,2,2),(PARAF45,4,None,None),(PARAF70,6,None,None),(PORCA_OLHAL,1,1,1),(ISOLADOR,2,2,2)],
 [("Cinta para poste circular","H",3,None,None,"130.1"),("Parafuso de rosca total","A",None,3,3,"130.1"),
  ("Alça pré-formada de distribuição","J",1,1,1,"116.1"),("Conector de derivação cunha","P",1,1,1,"153.1"),
  ("Conector de derivação perfurante","O",3,3,3,"163.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Braços com grampos de suspensão","M",1,1,1,"206"),("Conectores de derivação perfurantes","O","V","V","V","153.1")],119)

add("B7","SI1-SI3A",
 [(ARRUELA,None,2,2),(ABRACADEIRA,5,5,5),(ARMACAO,3,3,3),(PARAF45,3,None,None),(PARAF70,6,None,None),(ISOLADOR,3,3,3)],
 [("Cinta para poste circular","H",2,None,None,"130.1"),("Parafuso de rosca total","A",2,None,None,"130.1"),
  ("Alça pré-formada de distribuição","J",1,1,1,"116.1"),("Laço pré-formado de roldana","N",1,1,1,"116.2"),
  ("Conector de derivação cunha","P",1,1,1,"153.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],122,
 obs="Estrutura SI1-SI3 (alternativa). 'Parafuso de rosca total' (Tabela A) impresso na coluna SC (02/–/–) — anômalo (rosca total normalmente DT/PRFV); mantido como na norma; REVISAR.")

add("B8","SI3-SI3",
 [(ABRACADEIRA,9,9,9),(ARMACAO,4,4,4),(PARAF45,4,None,None),(PARAF70,4,None,None),(ISOLADOR,4,4,4)],
 [("Cinta para poste circular","H",2,None,None,"130.1"),("Parafuso de rosca total","A",None,2,2,"130.1"),
  ("Alça pré-formada de distribuição","J",3,3,3,"116.1"),("Conector de derivação cunha","P",1,1,1,"153.1"),
  ("Conector de derivação perfurante","O","V","V","V","153.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","N",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3")],130)

add("B9","SI4-SI3",
 [(ABRACADEIRA,9,9,9),(ARMACAO,4,4,4),(PARAF45,4,None,None),(PARAF70,4,None,None),(ISOLADOR,4,4,4)],
 [("Cinta para poste circular","H",2,None,None,"130.1"),("Parafuso de rosca total","A",None,2,2,"130.1"),
  ("Alça pré-formada de distribuição","J",3,3,3,"116.1"),("Conector de derivação cunha","P",1,1,1,"153.1"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","N",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3")],126)

add("B10","S3-SI3",
 [(ARRUELA,3,None,None),(ABRACADEIRA,3,3,3),(ARMACAO,5,5,5),(PARAF45,5,None,None),(PARAF70,8,None,None),(ISOLADOR,5,5,5)],
 [("Cinta para poste circular","H",4,None,None,"130.1"),("Parafuso de rosca total","A",None,4,4,"130.1"),
  ("Alça pré-formada de distribuição","J",5,None,None,"116.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],115,
 obs="Estrutura de transição rede nua -> rede isolada multiplexada (S3-SI3).")

add("B11","S3-SI3A",
 [(ARRUELA,3,None,None),(ABRACADEIRA,3,3,3),(ARMACAO,5,5,5),(PARAF45,5,None,None),(PARAF70,8,None,None),(ISOLADOR,5,5,5)],
 [("Cinta para poste circular","H",4,None,None,"130.1"),("Parafuso de rosca total","A",None,4,4,"130.1"),
  ("Alça pré-formada de distribuição","J",5,None,None,"116.1"),("Poste de concreto circular","I",1,None,None,"114.1"),
  ("Poste de concreto duplo T","G",None,1,None,"114.1"),("Poste de fibra de vidro","L",None,None,1,"114.3"),
  ("Conectores de derivação perfurantes","O","V","V","V","153.1")],133,
 obs="Estrutura de transição (alternativa) S3-SI3. BOM idêntico ao da B10 (S3-SI3).")

add("B12","Transformador de Distribuição",
 [(PARAF45,4,4,4),(PARAF70,4,None,None)],
 [("Suporte p/ transformador em poste de concreto circular","B",2,None,None,"130.1"),
  ("Suporte p/ transformador em poste de concreto duplo T","C",None,2,2,"130.1"),
  ("Transformador de distribuição trifásico/monofásico","F",1,1,1,"109.1"),
  ("Terminal de compressão","D",8,8,8,"159.1"),("Terminal de estrangulamento","E",6,6,6,"159.3")],141,
 obs="Lista idêntica nas p.141 e p.144 da norma (trafo trifásico e monofásico). Quase toda paramétrica: somente parafusos (90372/90373) têm código fixo; demais itens são condicionais (suporte, trafo e terminais resolvidos por tabela/kVA/condutor).")

POSTES = ["Seção Circular (SC)","Duplo T (DT)","Fibra de vidro (PRFV)"]

def build(st, idx):
    fixed = st["fixed"]
    base = {}
    for (mid,sc,dt,prfv) in fixed:
        if sc not in (None,0): base[str(mid)] = float(sc)
    def delta(col):  # col 0=SC,1=DT,2=PRFV
        d={}
        for (mid,sc,dt,prfv) in fixed:
            v = (sc,dt,prfv)[col] or 0
            diff = float(v)-float(sc or 0)
            if abs(diff)>1e-9: d[str(mid)]=diff
        return d
    postes=[{"poste":POSTES[0],"delta":{}},
            {"poste":POSTES[1],"delta":delta(1)},
            {"poste":POSTES[2],"delta":delta(2)}]
    conds=[cond(*c) for c in st["conds"]]
    xid = f"X-2026-{idx:03d}"
    obj={
        # --- campos obrigatórios do guia de publicação ---
        "schema_version":1, "rev":1, "status":"ativo",
        "id":xid, "tipo":st["tipo"], "condutor":None,
        "tensao_kv":0.38, "nominal_kv":0.22, "fases":3,
        "categoria":"Baixa Tensão Multiplexada (NDU 004.3)",
        "poste_ref":POSTES[0], "base_bom":base, "postes":postes,
        # --- campos extras (permitidos pelo guia): rastreabilidade + itens "por projeto" ---
        "condicionais":conds, "observacoes":st["obs"],
        "norma_origem":"NDU 004.3", "pagina_origem":f"NDU 004.3 p.{st['page']}",
    }
    return obj

objs=[build(st, i+1) for i,st in enumerate(S)]

# ---------- VALIDATION ----------
base_mat = json.load(open(BASE_MAT,encoding="utf-8"))
base_ids = {int(m["id"]) for m in base_mat if re.match(r'^\d+$',str(m["id"]))}
new_ids = {m["id"] for m in NEW_MATERIALS}
valid_ids = base_ids | new_ids
errors=[]
seen=set()
for o in objs:
    for r in ("schema_version","rev","status","id","tipo","tensao_kv","nominal_kv","fases","categoria","poste_ref","base_bom","postes"):
        if r not in o: errors.append(f"{o.get('id','?')}: falta campo obrigatório '{r}'")
    if not str(o["id"]).startswith("X-"): errors.append(f"{o['id']}: id sem prefixo X-")
    if o["status"] not in ("ativo","descontinuado"): errors.append(f"{o['id']}: status inválido")
    if o["rev"]<1 or o["schema_version"]!=1: errors.append(f"{o['id']}: rev/schema_version inválidos")
    if o["id"] in seen: errors.append(f"id duplicado {o['id']}")
    seen.add(o["id"])
    if o["poste_ref"]!=o["postes"][0]["poste"]: errors.append(f"{o['id']}: poste_ref != postes[0]")
    keys=set(o["base_bom"])
    for p in o["postes"]: keys|=set(p["delta"])
    for k in keys:
        if not re.match(r'^\d+$',k): errors.append(f"{o['id']}: chave não-inteira {k}")
        elif int(k) not in valid_ids: errors.append(f"{o['id']}: material id {k} inexistente")
    for p in o["postes"]:
        for k,v in p["delta"].items():
            if not isinstance(v,(int,float)): errors.append(f"{o['id']}: delta não-numérico {k}")
    # base_bom quantities must be > 0
    for k,v in o["base_bom"].items():
        if v<=0: errors.append(f"{o['id']}: base_bom {k} <= 0")

# novo material segue o next_id do modelo congelado (356); identity_key é a chave de casamento
for m in NEW_MATERIALS:
    if m["id"] < 356: errors.append(f"novo material id {m['id']} abaixo do next_id do modelo (356)")

# ---------- WRITE ----------
import glob
# remove obsolete per-structure files from earlier runs (old B#.json and any X- split)
for old in glob.glob(os.path.join(OUT,"B[0-9]*.json")) + glob.glob(os.path.join(OUT,"X-2026-*.json")):
    os.remove(old)
# "um só": todas as estruturas num único arquivo (cada item = uma estrutura no formato de publicação)
json.dump(objs, open(os.path.join(OUT,"ndu004_3_estruturas.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=2)
# materiais_novos no formato do modelo congelado (wrapper + identity_key)
mat_doc = {"schema":1,"frozen_from":"app/public/data/materiais.json","generated_at":"2026-06-17","next_id":NEW_NEXT_ID,"materials":NEW_MATERIALS}
json.dump(mat_doc, open(os.path.join(OUT,"materiais_novos.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=1)

print("Estruturas geradas:", len(objs), "->", ", ".join(o["id"] for o in objs))
print("Materiais novos:", [m["id"] for m in NEW_MATERIALS])
print("Base max id:", max(base_ids), "| novo id:", new_ids)
print("ERROS DE VALIDAÇÃO:", errors if errors else "NENHUM (OK)")
# quick per-structure sanity: count base_bom items + cond items
for o in objs:
    print(f"  {o['id']:4} {o['tipo']:28} base={len(o['base_bom'])} condic={len(o['condicionais'])} deltaDT={len(o['postes'][1]['delta'])} deltaPRFV={len(o['postes'][2]['delta'])}")
