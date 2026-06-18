# -*- coding: utf-8 -*-
"""
converter_cru_para_sistema.py
=============================================================================
REGISTRO EXECUTÁVEL da conversão: pega os JSONs CRUS de `ARQUIVOS/` e os MOLDA
no formato que o sistema aceita (`app/public/data`), gerando a base publicável.

É a versão "em linguagem de máquina" de tudo que foi feito para a leva
NDU 004.3 + Catálogo (publicada como `2026.06.18-r4`). Um arquivo, um comando.

ENTRADAS (cru):
  ARQUIVOS/ndu004_3_materiais_novos.json   -> material novo da NDU 004.3 (id 356)
  ARQUIVOS/ndu004_3_estruturas.json        -> 12 estruturas X-2026-001..012
  ARQUIVOS/extracao/transformadores.json   |
  ARQUIVOS/extracao/cabos.json             |- catálogo, CONGELADO contra a base de
  ARQUIVOS/extracao/padrao_entrada.json    |  QUARENTENA (V3/data, ids até 1231)

SAÍDAS (formato do sistema, em app/public/data):
  materiais.json   (+126 materiais; ids 357..482; id 359 RESERVADO)
  insumos.json     (+189 insumos avulsos de catálogo, bom={id:1})
  structures/X-2026-001..012.json
  catalog.json / manifest.json / estruturas.json   (regenerados pelo pipeline)
  extraction/material_registry.json                (ids congelados)

PRESSUPOSTO: roda contra a base VIVA pré-conversão (301 materiais, max id 355).
TODA a saída é gravada em LF (newline="\n") — CRLF quebra o checksum no cliente.

Uso:  python extraction/converter_cru_para_sistema.py [versao]
      (versao padrão: 2026.06.18-r4)
=============================================================================
"""
import json
import os
import re
import sys
import io
import subprocess
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "app", "public", "data")
STRUCT_DIR = os.path.join(DATA, "structures")
ARQ = os.path.join(ROOT, "ARQUIVOS")
EXTR = os.path.join(ARQ, "extracao")

VERSAO = sys.argv[1] if len(sys.argv) > 1 else "2026.06.18-r4"

# Transformadores divergentes/duplicados que o catálogo de origem já excluía.
DIVERGENTES = {257, 258, 996, 997, 998, 999}


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def gravar_lf(path, texto):
    """Grava SEMPRE em LF — modo texto no Windows poria CRLF e o sha não bateria."""
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


def norm(s):
    """Normaliza sem acento/caixa (espelha precos.ts e build_registry.py)."""
    if s is None:
        return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()


# ============================================================================
# 0) Base VIVA (fonte de verdade) + índices de casamento
# ============================================================================
mats = load(os.path.join(DATA, "materiais.json"))
insumos = load(os.path.join(DATA, "insumos.json"))

by_id = {m["id"]: m for m in mats}
sap_counts, lid_counts = {}, {}
for m in mats:
    sap = str(m.get("cod_sap") or "").strip()
    lid = str(m.get("cod_lider7") or "").strip()
    if sap:
        sap_counts[sap] = sap_counts.get(sap, 0) + 1
    if lid:
        lid_counts[lid] = lid_counts.get(lid, 0) + 1

# Um código só vira CHAVE DE CASAMENTO quando é ÚNICO na base viva. Código
# duplicado não identifica um material só -> cai para descrição+unidade. Isso
# evita reusar o id do material ERRADO (corromperia preços do cliente).
by_sap, by_lid, by_descu = {}, {}, {}
for m in mats:
    sap = str(m.get("cod_sap") or "").strip()
    lid = str(m.get("cod_lider7") or "").strip()
    if sap and sap_counts[sap] == 1:
        by_sap.setdefault(sap, m["id"])
    if lid and lid_counts[lid] == 1:
        by_lid.setdefault(lid, m["id"])
    by_descu.setdefault((norm(m["descricao"]), norm(m.get("unidade"))), m["id"])

next_id = max(by_id) + 1   # primeiro id livre (357 na base pré-conversão)
novos_materiais = []


def registrar_material(cod_sap, cod_lider7, descricao, unidade, forcar_id=None):
    """Devolve o id VIVO de um material: reusa se já existe; senão cria id novo.
    Esta é a reconciliação que conserta os ids da base de quarentena."""
    global next_id
    sap = str(cod_sap or "").strip()
    lid = str(cod_lider7 or "").strip()
    key = (norm(descricao), norm(unidade))
    if sap and sap in by_sap:
        return by_sap[sap], "sap"
    if lid and lid in by_lid:
        return by_lid[lid], "lider7"
    if key in by_descu:
        return by_descu[key], "descricao"
    mid = forcar_id if forcar_id is not None else next_id
    if forcar_id is None:
        next_id += 1
    else:
        next_id = max(next_id, mid + 1)
    novo = {"id": mid, "cod_sap": sap, "cod_lider7": lid,
            "descricao": descricao, "unidade": unidade or "pç"}
    novos_materiais.append(novo)
    by_id[mid] = novo
    if sap:
        by_sap.setdefault(sap, mid)
    if lid:
        by_lid.setdefault(lid, mid)
    by_descu.setdefault(key, mid)
    return mid, "novo"


# ============================================================================
# 1) NDU 004.3: material novo 356 (referenciado pelas estruturas X-2026)
# ============================================================================
ab = load(os.path.join(ARQ, "ndu004_3_materiais_novos.json"))["materials"][0]
registrar_material(ab.get("cod_sap"), ab.get("cod_lider7"),
                   ab["descricao"], ab.get("unidade"), forcar_id=356)

# ============================================================================
# 2+3) Catálogo (trafos/cabos/padrão) -> materiais novos + insumos avulsos
# ============================================================================
trafos = load(os.path.join(EXTR, "transformadores.json"))
cabos = load(os.path.join(EXTR, "cabos.json"))
padrao = load(os.path.join(EXTR, "padrao_entrada.json"))

catalogo = []  # mesma ordem/filtro do montar_estrutura_catalogo.py original
for x in trafos:
    if x["tipo"] in ("monofasico", "trifasico") and not x.get("dup") and x["id"] not in DIVERGENTES:
        catalogo.append(("transformador", x))
for x in cabos:
    if not x.get("dup"):
        catalogo.append(("cabo", x))
for x in padrao:
    catalogo.append(("padrao", x))

CAT = {"transformador": ("CAT-TRAFO", "Catálogo — Transformadores"),
       "cabo": ("CAT-CABO", "Catálogo — Cabos"),
       "padrao": ("CAT-PADRAO", "Catálogo — Padrão de Entrada")}

novos_insumos = []
insumo_por_liveid = {}
for origem, x in catalogo:
    live_id, _ = registrar_material(x.get("cod_sap"), x.get("cod_lider7"),
                                    x["descricao"], x.get("unidade"))
    if live_id in insumo_por_liveid:
        continue
    prefixo, categoria = CAT[origem]
    m = by_id[live_id]
    tkv = x.get("tensao_kv") if origem == "transformador" else None
    fas = x.get("fases") if origem == "transformador" else None
    novos_insumos.append({
        "id": f"{prefixo}-{live_id}",
        "descricao": m["descricao"],
        "unidade": m.get("unidade", "pç"),
        "tensao_kv": float(tkv) if tkv is not None else 0,
        "fases": int(fas) if fas is not None else 0,
        "bom": {str(live_id): 1.0},
        "categoria": categoria,
    })
    insumo_por_liveid[live_id] = f"{prefixo}-{live_id}"

# ============================================================================
# 4) Dedup do transformador 359 (= mono 5 kVA 19,92 kV, igual ao 358):
#    remove o material e o insumo, mas o id 359 fica RESERVADO (nunca reusado).
#    357 (7,97 kV) e 358 (19,92 kV) são fase-neutro e NÃO duplicam 249/250 (fase-fase).
# ============================================================================
DUP_REMOVER = {359}
novos_materiais = [m for m in novos_materiais if m["id"] not in DUP_REMOVER]
novos_insumos = [i for i in novos_insumos
                 if not any(int(k) in DUP_REMOVER for k in i["bom"])]

# ============================================================================
# 5) Grava materiais.json + insumos.json + estruturas X-2026 (tudo LF)
# ============================================================================
gravar_lf(os.path.join(DATA, "materiais.json"),
          json.dumps(mats + novos_materiais, ensure_ascii=False, indent=2))
gravar_lf(os.path.join(DATA, "insumos.json"),
          json.dumps(insumos + novos_insumos, ensure_ascii=False))

ests = load(os.path.join(ARQ, "ndu004_3_estruturas.json"))
os.makedirs(STRUCT_DIR, exist_ok=True)
faltando = set()
for e in ests:
    for k in e.get("base_bom", {}):
        if int(k) not in by_id:
            faltando.add(int(k))
    for p in e.get("postes", []):
        for k in p.get("delta", {}):
            if int(k) not in by_id:
                faltando.add(int(k))
    gravar_lf(os.path.join(STRUCT_DIR, f"{e['id']}.json"),
              json.dumps(e, ensure_ascii=False, indent=1))
assert not faltando, f"estruturas citam ids inexistentes: {sorted(faltando)}"

print(f"[molde] +{len(novos_materiais)} materiais, +{len(novos_insumos)} insumos, "
      f"{len(ests)} estruturas X-2026 (id 359 reservado)")

# ============================================================================
# 6) Pipeline canônico (cada script já grava em LF): congela ids -> catálogo ->
#    valida -> manifest. É o que transforma os arquivos-fonte na base publicável.
# ============================================================================
def run(script, *args):
    r = subprocess.run([sys.executable, os.path.join(HERE, script), *args])
    if r.returncode != 0:
        sys.exit(f"FALHOU: {script}")

run("build_registry.py")
run("build_catalog.py", VERSAO)
run("validate_base.py", "--structures")
run("gen_seed_manifest.py")

# Conferência final: todo sha do manifest bate com o arquivo em disco e nada tem CRLF.
import hashlib
m = load(os.path.join(DATA, "manifest.json"))
ruins = []
for f in m["files"]:
    raw = open(os.path.join(DATA, f["name"]), "rb").read()
    if b"\r\n" in raw or hashlib.sha256(raw).hexdigest() != f["sha256"]:
        ruins.append(f["name"])
print(f"[ok] data_version={m['data_version']} arquivos={len(m['files'])} "
      f"problemas(CRLF/sha)={ruins if ruins else 'nenhum'}")
