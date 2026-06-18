# -*- coding: utf-8 -*-
"""
aplicar_arquivos.py — Converte o conteúdo de ARQUIVOS/ para o formato da base
(app/public/data) e o deixa pronto para publicar.

Faz, de forma DETERMINÍSTICA e re-executável (idempotente por identidade):

  A) NDU 004.3 (Baixa Tensão Multiplexada):
     - adiciona o material novo (id 356, Abraçadeira autotravante) ao materiais.json;
     - grava as 12 estruturas X-2026-001..012.json em structures/.

  C) Catálogo (Transformadores + Cabos + Padrão de Entrada):
     - os JSONs foram congelados contra a base EM QUARENTENA (V3/data, ids até 1231),
       então cada item é RE-MAPEADO contra a base viva por cod_sap -> cod_lider7 ->
       descrição+unidade. Itens que já existem reusam o id vivo; os inéditos recebem
       id novo sequencial (>= 357). NENHUM id do arquivo de origem é usado direto.
     - cada item do catálogo vira um INSUMO avulso (bom = {id_vivo: 1}), agrupado em
       "Catálogo — Transformadores/Cabos/Padrão de Entrada".

Não decide versão nem mexe em catalog.json/manifest.json — isso é o publish.py.
Uso:  python aplicar_arquivos.py            (aplica)
      python aplicar_arquivos.py --dry-run  (só relatório, não grava)
"""
import json
import os
import re
import sys
import io
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "app", "public", "data")
STRUCT_DIR = os.path.join(DATA, "structures")
ARQ = os.path.join(ROOT, "ARQUIVOS")
EXTR = os.path.join(ARQ, "extracao")

DRY = "--dry-run" in sys.argv

DIVERGENTES = {257, 258, 996, 997, 998, 999}  # do montar_estrutura_catalogo.py


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def norm(s):
    if s is None:
        return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip().lower()


# ---------------------------------------------------------------- base viva
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

# Só usamos um código como CHAVE DE CASAMENTO quando ele é ÚNICO na base viva
# (igual ao build_registry): código duplicado não identifica um material só, então
# para esses caímos em descrição+unidade — evita reusar o id do material errado.
by_sap, by_lid, by_descu = {}, {}, {}
for m in mats:
    sap = str(m.get("cod_sap") or "").strip()
    lid = str(m.get("cod_lider7") or "").strip()
    if sap and sap_counts[sap] == 1:
        by_sap.setdefault(sap, m["id"])
    if lid and lid_counts[lid] == 1:
        by_lid.setdefault(lid, m["id"])
    by_descu.setdefault((norm(m["descricao"]), norm(m.get("unidade"))), m["id"])

next_id = max(by_id) + 1  # primeiro id livre na base viva
novos_materiais = []      # objetos a anexar ao materiais.json


def registrar_material(cod_sap, cod_lider7, descricao, unidade, forcar_id=None):
    """Devolve o id vivo de um material (reusa se já existe; senão cria id novo)."""
    global next_id
    sap = str(cod_sap or "").strip()
    lid = str(cod_lider7 or "").strip()
    key = (norm(descricao), norm(unidade))
    # 1) já existe na base viva (por sap único, lider7 ou descrição+unidade)?
    if sap and sap in by_sap:
        return by_sap[sap], "sap"
    if lid and lid in by_lid:
        return by_lid[lid], "lider7"
    if key in by_descu:
        return by_descu[key], "descricao"
    # 2) novo: cria id
    mid = forcar_id if forcar_id is not None else next_id
    if forcar_id is None:
        next_id += 1
    else:
        next_id = max(next_id, mid + 1)  # nunca reusar o id forçado
    novo = {
        "id": mid,
        "cod_sap": sap,
        "cod_lider7": lid,
        "descricao": descricao,
        "unidade": unidade or "pç",
    }
    novos_materiais.append(novo)
    by_id[mid] = novo
    if sap and sap_counts.get(sap, 0) == 0:
        by_sap.setdefault(sap, mid)
    if lid:
        by_lid.setdefault(lid, mid)
    by_descu.setdefault(key, mid)
    return mid, "novo"


# ---------------------------------------------------------------- A) NDU 004.3 material
mnovo = load(os.path.join(ARQ, "ndu004_3_materiais_novos.json"))["materials"]
assert len(mnovo) == 1 and mnovo[0]["id"] == 356, "esperava 1 material novo id 356"
ab = mnovo[0]
# 356 é referenciado pelas estruturas X-2026 -> tem de ficar com o id 356.
abra_id, _ = registrar_material(ab.get("cod_sap"), ab.get("cod_lider7"),
                                ab["descricao"], ab.get("unidade"), forcar_id=356)
assert abra_id == 356

# ---------------------------------------------------------------- C) Catálogo -> materiais + insumos
trafos = load(os.path.join(EXTR, "transformadores.json"))
cabos = load(os.path.join(EXTR, "cabos.json"))
padrao = load(os.path.join(EXTR, "padrao_entrada.json"))

catalogo = []  # (origem, item) na MESMA ordem/filtro do montar_estrutura_catalogo.py
for x in trafos:
    if x["tipo"] in ("monofasico", "trifasico") and not x.get("dup") and x["id"] not in DIVERGENTES:
        catalogo.append(("transformador", x))
for x in cabos:
    if not x.get("dup"):
        catalogo.append(("cabo", x))
for x in padrao:
    catalogo.append(("padrao", x))

CAT_CFG = {
    "transformador": ("CAT-TRAFO", "Catálogo — Transformadores"),
    "cabo": ("CAT-CABO", "Catálogo — Cabos"),
    "padrao": ("CAT-PADRAO", "Catálogo — Padrão de Entrada"),
}

novos_insumos = []
insumo_por_liveid = {}  # dedupe: um insumo por material vivo
stats = {"sap": 0, "lider7": 0, "descricao": 0, "novo": 0}
por_origem_novos = {"transformador": 0, "cabo": 0, "padrao": 0}

for origem, x in catalogo:
    live_id, how = registrar_material(
        x.get("cod_sap"), x.get("cod_lider7"), x["descricao"], x.get("unidade"))
    stats[how] += 1
    if how == "novo":
        por_origem_novos[origem] += 1
    if live_id in insumo_por_liveid:
        continue  # já catalogado (sobreposição cabo/padrão etc.)
    prefixo, categoria = CAT_CFG[origem]
    m = by_id[live_id]
    tkv = x.get("tensao_kv") if origem == "transformador" else None
    fas = x.get("fases") if origem == "transformador" else None
    ins = {
        "id": f"{prefixo}-{live_id}",
        "descricao": m["descricao"],
        "unidade": m.get("unidade", "pç"),
        "tensao_kv": float(tkv) if tkv is not None else 0,
        "fases": int(fas) if fas is not None else 0,
        "bom": {str(live_id): 1.0},
        "categoria": categoria,
    }
    novos_insumos.append(ins)
    insumo_por_liveid[live_id] = ins["id"]

# ---------------------------------------------------------------- A) NDU 004.3 estruturas (12 arquivos)
ests = load(os.path.join(ARQ, "ndu004_3_estruturas.json"))
# checagem de integridade: todo id citado tem de existir na base resultante
ids_resultantes = set(by_id)
faltando = set()
for e in ests:
    for k in e.get("base_bom", {}):
        if int(k) not in ids_resultantes:
            faltando.add(int(k))
    for p in e.get("postes", []):
        for k in p.get("delta", {}):
            if int(k) not in ids_resultantes:
                faltando.add(int(k))
assert not faltando, f"estruturas X-2026 citam ids inexistentes: {sorted(faltando)}"

# ---------------------------------------------------------------- RELATÓRIO
print("=" * 70)
print("RELATÓRIO DE CONVERSÃO  " + ("(DRY-RUN — nada gravado)" if DRY else "(APLICANDO)"))
print("=" * 70)
print("\nBase viva ANTES: %d materiais (max id %d), %d insumos" %
      (len(mats), max(m["id"] for m in mats), len(insumos)))
print("\n[A] NDU 004.3")
print("  material novo: id 356  '%s' (SISUP %s)" % (ab["descricao"], ab.get("cod_sap")))
print("  estruturas:    %d arquivos X-2026-001..%03d.json" % (len(ests), len(ests)))
print("\n[C] Catálogo (transformadores + cabos + padrão de entrada)")
print("  itens processados: %d" % len(catalogo))
print("  já existiam na base viva: %d  (sap=%d, lider7=%d, descrição=%d)" %
      (stats["sap"] + stats["lider7"] + stats["descricao"],
       stats["sap"], stats["lider7"], stats["descricao"]))
print("  materiais NOVOS criados: %d  (trafo=%d, cabo=%d, padrão=%d)" %
      (stats["novo"], por_origem_novos["transformador"],
       por_origem_novos["cabo"], por_origem_novos["padrao"]))
print("  insumos de catálogo criados (deduplicados por material): %d" % len(novos_insumos))
total_novos_mat = len(novos_materiais)
print("\nTOTAL materiais novos (356 + catálogo): %d  ->  ids 356..%d" %
      (total_novos_mat, max(m["id"] for m in novos_materiais)))
print("Base viva DEPOIS: %d materiais, %d insumos" %
      (len(mats) + total_novos_mat, len(insumos) + len(novos_insumos)))

print("\n--- amostra dos materiais NOVOS ---")
for m in novos_materiais[:8]:
    print("  id %3d  sap=%-7r lid=%-6r %s" %
          (m["id"], m["cod_sap"], m["cod_lider7"], m["descricao"][:52]))
print("  ... (%d no total)" % total_novos_mat)

if DRY:
    print("\nDRY-RUN: nenhum arquivo foi gravado.")
    sys.exit(0)

# ---------------------------------------------------------------- GRAVA
mats_final = mats + novos_materiais
with open(os.path.join(DATA, "materiais.json"), "w", encoding="utf-8", newline="\n") as f:
    f.write(json.dumps(mats_final, ensure_ascii=False, indent=2))

insumos_final = insumos + novos_insumos
with open(os.path.join(DATA, "insumos.json"), "w", encoding="utf-8", newline="\n") as f:
    f.write(json.dumps(insumos_final, ensure_ascii=False))

os.makedirs(STRUCT_DIR, exist_ok=True)
for e in ests:
    with open(os.path.join(STRUCT_DIR, f"{e['id']}.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(e, ensure_ascii=False, indent=1))

print("\nGRAVADO:")
print("  app/public/data/materiais.json  (+%d materiais)" % total_novos_mat)
print("  app/public/data/insumos.json    (+%d insumos)" % len(novos_insumos))
print("  app/public/data/structures/X-2026-*.json  (%d arquivos)" % len(ests))
print("\nPRÓXIMO PASSO: rode  python extraction/build_registry.py  e depois")
print("              python extraction/publish.py <versao> \"notas\"")
