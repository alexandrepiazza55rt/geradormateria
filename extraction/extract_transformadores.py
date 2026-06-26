# -*- coding: utf-8 -*-
"""
extract_transformadores.py — Extrai estruturas da aba 'Transformadores'.

Para cada configuração (tensao_kv × kVA × tensao_sec):
  - Seta a célula de entrada no xlmodel (ex: F8=1 para 13.8kV 220/127V 15kVA)
  - Lê a coluna de saída (F para 13.8kV, L para 34.5kV)
  - Mapeia descrições da col A para IDs em materiais.json
  - Produz T{n}.json em app/public/data/structures/

Também adiciona materiais faltantes ao materiais.json e ao registry.

Uso:
  python extraction/extract_transformadores.py [--dry-run]
"""
import sys, io, os, json, re, unicodedata, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from xlmodel import Model

PATH   = os.path.join(ROOT, "GERAÇÃO DE MATERIAL.xlsm")
DATA   = os.path.join(ROOT, "app", "public", "data")
STRUCT = os.path.join(DATA, "structures")
REG    = os.path.join(HERE, "material_registry.json")
TRAFO_SRC = os.path.join(ROOT, "ARQUIVOS", "extracao", "transformadores.json")

DRY = "--dry-run" in sys.argv
SHEET = "Transformadores"

# ── Linhas de materiais na aba Transformadores (col A = descrição) ──────────
MAT_ROWS = range(55, 130)

# ── Colunas de entrada × saída ───────────────────────────────────────────────
# Para 13.8kV: a coluna de saída é F (agrega F e H inputs)
# Para 34.5kV: a coluna de saída é L (agrega L e N inputs)
KVA_MAP = {8: 15, 9: 30, 10: 45, 11: 75, 12: 112.5, 13: 150, 14: 225, 15: 300}

CONFIGS = []
for row, kva in KVA_MAP.items():
    CONFIGS.append(dict(input=f"F{row}", tensao=13.8, kva=kva, sec="220/127", out="F"))
    CONFIGS.append(dict(input=f"H{row}", tensao=13.8, kva=kva, sec="380/220", out="F"))
    CONFIGS.append(dict(input=f"L{row}", tensao=34.5, kva=kva, sec="220/127", out="L"))
    CONFIGS.append(dict(input=f"N{row}", tensao=34.5, kva=kva, sec="380/220", out="L"))

# ── Helpers ──────────────────────────────────────────────────────────────────
def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()

# ── Carregar base viva ────────────────────────────────────────────────────────
mats     = json.load(open(os.path.join(DATA, "materiais.json"), encoding="utf-8"))
reg_data = json.load(open(REG, encoding="utf-8"))

by_id       = {m["id"]: m for m in mats}
by_sap      = {}
by_lid      = {}
by_desc_key = {}
sap_counts  = {}
lid_counts  = {}

for m in mats:
    sap = str(m.get("cod_sap") or "").strip()
    lid = str(m.get("cod_lider7") or "").strip()
    if sap: sap_counts[sap] = sap_counts.get(sap, 0) + 1
    if lid: lid_counts[lid] = lid_counts.get(lid, 0) + 1

for m in mats:
    sap = str(m.get("cod_sap") or "").strip()
    lid = str(m.get("cod_lider7") or "").strip()
    if sap and sap_counts.get(sap, 0) == 1:
        by_sap.setdefault(sap, m["id"])
    if lid and lid_counts.get(lid, 0) == 1:
        by_lid.setdefault(lid, m["id"])
    by_desc_key.setdefault((norm(m["descricao"]), norm(m.get("unidade", ""))), m["id"])

# Também enriquece com transformadores.json para descrições "254/127V"
# (mapeadas via cod_lider7 para os IDs canônicos "220/127V" na base)
trafo_lid_map = {}   # norm(desc) → cod_lider7
if os.path.exists(TRAFO_SRC):
    for t in json.load(open(TRAFO_SRC, encoding="utf-8")):
        lid = str(t.get("cod_lider7") or "").strip()
        if lid:
            trafo_lid_map[norm(t["descricao"])] = lid

next_id  = reg_data["next_id"]
novos_mats = []   # materiais a adicionar ao materiais.json
novos_reg  = []   # entradas a adicionar ao registry

def registrar_faltante(descricao, unidade, cod_lider7="", cod_sap="", forcar_id=None):
    """Cria um novo material se não existir; devolve o id."""
    global next_id
    n = norm(descricao)
    u = norm(unidade)
    # tentativa direta
    if (n, u) in by_desc_key:
        return by_desc_key[(n, u)]
    if cod_lider7 and cod_lider7 in by_lid:
        return by_lid[cod_lider7]
    if cod_sap and cod_sap in by_sap:
        return by_sap[cod_sap]
    # novo
    mid = forcar_id if forcar_id is not None else next_id
    if forcar_id is None:
        next_id += 1
    else:
        next_id = max(next_id, mid + 1)
    novo = {"id": mid, "cod_sap": cod_sap, "cod_lider7": cod_lider7,
            "descricao": descricao, "unidade": unidade}
    novos_mats.append(novo)
    by_id[mid] = novo
    if cod_sap and sap_counts.get(cod_sap, 0) == 0:
        by_sap.setdefault(cod_sap, mid)
    if cod_lider7:
        by_lid.setdefault(cod_lider7, mid)
    by_desc_key.setdefault((n, u), mid)
    ident = f"lider7:{cod_lider7}" if cod_lider7 else f"desc:{n}|{u}"
    novos_reg.append({"id": mid, "identity_key": ident,
                      "cod_sap": cod_sap, "cod_lider7": cod_lider7,
                      "descricao": descricao, "unidade": unidade})
    return mid

def lookup_from_sheet(desc_col_a):
    """Devolve o material id a partir da descrição lida da col A da planilha."""
    d = str(desc_col_a).strip()
    n = norm(d)
    u = "pc"   # unidade padrão para materiais nesta planilha
    # 1. tentativa direta (norm+unid vazia ou "pc")
    for u_try in ("", "pc", "pç", "pcs"):
        if (n, norm(u_try)) in by_desc_key:
            return by_desc_key[(n, norm(u_try))]
    # 2. descrição normalizada (qualquer unidade) — primeiro hit
    for (dk, _), mid in by_desc_key.items():
        if dk == n:
            return mid
    # 3. fallback via lider7 usando mapa do transformadores.json
    if n in trafo_lid_map:
        lid = trafo_lid_map[n]
        if lid in by_lid:
            return by_lid[lid]
    return None

# ── Pré-cadastrar materiais faltantes conhecidos ──────────────────────────────
# Elo Fusível 15K: existe no Excel (row 134, ID 116 original), lider7=3595
# ID 116 está livre na base atual.
elo15k_id = registrar_faltante("Elo Fusível 15K", "pç", cod_lider7="3595", forcar_id=116)
# Elo Fusível 7K: não existe em "Materiais e Valores" — material exclusivo da planilha
elo7k_id = registrar_faltante("Elo Fusível 7K", "pç")

print(f"Elo Fusível 15K → id={elo15k_id}  (novo={elo15k_id in {m['id'] for m in novos_mats}})")
print(f"Elo Fusível 7K  → id={elo7k_id}  (novo={elo7k_id in {m['id'] for m in novos_mats}})")

# ── Carregar xlmodel ──────────────────────────────────────────────────────────
t0 = time.time()
print(f"\nCarregando xlmodel ({PATH})...", flush=True)
m = Model(PATH)
print(f"Pronto em {time.time()-t0:.1f}s", flush=True)

# ── Enumerar linhas de materiais na aba Transformadores ───────────────────────
# Para cada linha, read col A (descrição) e tenta resolver o ID.
mat_row_ids = {}   # row_number → material_id (or None if unknown)
for r in MAT_ROWS:
    desc_val = m.literal.get((SHEET, f"A{r}"))
    if desc_val and isinstance(desc_val, str) and desc_val.strip():
        mid = lookup_from_sheet(desc_val)
        mat_row_ids[r] = mid

# Diagnóstico de linhas com material não identificado
unknown = [(r, m.literal.get((SHEET, f"A{r}"))) for r, mid in mat_row_ids.items() if mid is None]
if unknown:
    print(f"\n[aviso] {len(unknown)} linha(s) de material não identificada(s):")
    for r, desc in unknown:
        print(f"  row {r}: {desc!r}")

# ── Probe de cada configuração ────────────────────────────────────────────────
structures = []
sid = 0
fails = {"n": 0}

for cfg in CONFIGS:
    input_coord = cfg["input"]
    out_col     = cfg["out"]
    tensao_kv   = cfg["tensao"]
    kva         = cfg["kva"]
    sec         = cfg["sec"]

    m.set_inputs({(SHEET, input_coord): 1})

    bom = {}
    for r, mid in mat_row_ids.items():
        if mid is None:
            continue
        coord = f"{out_col}{r}"
        try:
            v = m.cell(SHEET, coord)
        except Exception as e:
            fails["n"] += 1
            if fails["n"] <= 5:
                print(f"  [warn] eval fail {SHEET}!{coord}: {str(e)[:80]}")
            continue
        if isinstance(v, (int, float)) and abs(v) > 1e-9:
            bom[str(mid)] = round(v, 6)

    if not bom:
        # Configuração sem materiais — skip silencioso
        continue

    sid += 1
    t_id = f"T{sid}"
    tipo_label = f"Trifásico {tensao_kv:.1f} kV — {kva:g} kVA — {sec}V"
    categoria  = f"Transformadores Trifásicos {tensao_kv:.1f} kV"

    structures.append({
        "schema_version": 1,
        "rev": 1,
        "status": "ativo",
        "id": t_id,
        "sheet": SHEET,
        "tipo": tipo_label,
        "fases": 3,
        "tensao_kv": tensao_kv,
        "potencia_kva": kva,
        "tensao_sec": sec,
        "categoria": categoria,
        "base_bom": bom,
        "postes": [],
    })

m.clear()

# ── Relatório ────────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("RELATÓRIO  " + ("(DRY-RUN — nada gravado)" if DRY else "(APLICANDO)"))
print("=" * 70)
print(f"\nMateriais novos: {len(novos_mats)}")
for nm in novos_mats:
    print(f"  id={nm['id']}  lider={nm['cod_lider7']!r}  {nm['descricao']}")
print(f"\nEstruturas geradas: {len(structures)}")
for s in structures:
    bom_str = ", ".join(f"id{k}×{v}" for k, v in s["base_bom"].items())
    print(f"  {s['id']:5}  {s['tipo']:45}  bom=[{bom_str}]")

if DRY:
    print("\nDRY-RUN — nenhum arquivo foi gravado.")
    sys.exit(0)

# ── Gravar ────────────────────────────────────────────────────────────────────
# 1. materiais.json
if novos_mats:
    mats_final = mats + novos_mats
    with open(os.path.join(DATA, "materiais.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(mats_final, ensure_ascii=False, indent=2))
    print(f"\nmateriais.json atualizado (+{len(novos_mats)} materiais, total {len(mats_final)})")

# 2. material_registry.json
if novos_reg:
    reg_data["materials"] += novos_reg
    reg_data["next_id"] = next_id
    with open(REG, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(reg_data, ensure_ascii=False, indent=1))
    print(f"material_registry.json atualizado (+{len(novos_reg)} entradas)")

# 3. structures/T{n}.json
os.makedirs(STRUCT, exist_ok=True)
for s in structures:
    path = os.path.join(STRUCT, f"{s['id']}.json")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(s, ensure_ascii=False, indent=1))

print(f"\nEscreveu {len(structures)} arquivos em {STRUCT}/")
print("\nPRÓXIMO PASSO:")
print("  python extraction/build_catalog.py <versao>")
print("  python extraction/gen_seed_manifest.py")
