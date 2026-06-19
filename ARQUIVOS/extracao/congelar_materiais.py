# -*- coding: utf-8 -*-
"""
Gera materiais_catalogo_frozen.json: os 214 materiais do X-CATALOGO-001 no formato
"congelado" (schema/frozen_from/generated_at/next_id/materials[]) com identity_key.

Regra do identity_key (deduzida e validada 14/14 contra exemplos reais):
  - "sap:<cod_sap>"  se cod_sap nao-vazio E unico na base inteira
  - senao "desc:<descricao>|<unidade>" com descricao/unidade normalizadas:
      NFD -> remove acentos (categoria Mn) -> minuscula -> colapsa espacos.
      (mantem '²' porque NFD nao o decompoe)

Uso: python congelar_materiais.py
"""
import json, os, re, unicodedata
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
MAT  = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'V3', 'data', 'materiais.json'))

base = json.load(open(MAT, encoding='utf-8'))
by_id = {m['id']: m for m in base}
sapcount = Counter(str(m.get('cod_sap', '')).strip() for m in base if str(m.get('cod_sap', '')).strip())
next_id = max(by_id) + 1

def deacc(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')
def norm(s):
    return re.sub(r'\s+', ' ', deacc(s).lower()).strip()

def identity_key(m):
    sap = str(m.get('cod_sap', '')).strip()
    if sap and sapcount.get(sap, 0) == 1:
        return f'sap:{sap}'
    return f"desc:{norm(m['descricao'])}|{norm(m.get('unidade', ''))}"

# 214 ids do catalogo
cat = json.load(open(os.path.join(HERE, 'X-CATALOGO-001.json'), encoding='utf-8'))
ids = sorted(int(k) for k in cat['base_bom'])

materials = []
for i in ids:
    m = by_id[i]
    materials.append({
        "id": i,
        "identity_key": identity_key(m),
        "cod_sap": str(m.get('cod_sap', '') or ''),
        "cod_lider7": str(m.get('cod_lider7', '') or ''),
        "descricao": m['descricao'],
        "unidade": (m.get('unidade', '') or '').strip(),
    })

frozen = {
    "schema": 1,
    "frozen_from": "V3/data/materiais.json",
    "generated_at": "2026-06-17",
    "next_id": next_id,
    "materials": materials,
}

out = os.path.join(HERE, 'materiais_catalogo_frozen.json')
json.dump(frozen, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

n_sap = sum(1 for m in materials if m['identity_key'].startswith('sap:'))
print('escrito:', out)
print(f'  materials: {len(materials)} | next_id: {next_id}')
print(f'  identity_key: sap:={n_sap}  desc:={len(materials)-n_sap}')
print('  amostras:')
for m in materials[:3] + materials[-2:]:
    print('   ', json.dumps(m, ensure_ascii=False))
