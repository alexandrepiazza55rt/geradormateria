# -*- coding: utf-8 -*-
"""
Junta TRAFOS (mono+tri limpos) + CABOS + PADRAO DE ENTRADA num unico arquivo de
estrutura (formato de publicacao), base_bom = {id: 1.0} (catalogo).

Exclui: trafos divergentes (257,258,996-999), duplicatas (dup=true), TP/TC.
Une por id (sobreposicoes colapsam). Valida que todo id existe na base.

Uso: python montar_estrutura_catalogo.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MAT  = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'V3', 'data', 'materiais.json'))

trafos = json.load(open(os.path.join(HERE, 'transformadores.json'), encoding='utf-8'))
cabos  = json.load(open(os.path.join(HERE, 'cabos.json'), encoding='utf-8'))
padrao = json.load(open(os.path.join(HERE, 'padrao_entrada.json'), encoding='utf-8'))
base_ids = {m['id'] for m in json.load(open(MAT, encoding='utf-8'))}

DIVERGENTES = {257, 258, 996, 997, 998, 999}

keep = {}          # id -> categoria de origem (para relatorio)
def add(i, origem):
    keep.setdefault(i, origem)

# Transformadores: so mono/tri, sem duplicata, sem divergentes (TP/TC ficam de fora)
n_tr = 0
for x in trafos:
    if x['tipo'] in ('monofasico', 'trifasico') and not x.get('dup') and x['id'] not in DIVERGENTES:
        add(x['id'], 'transformador'); n_tr += 1
# Cabos: sem duplicata
n_ca = 0
for x in cabos:
    if not x.get('dup'):
        add(x['id'], 'cabo'); n_ca += 1
# Padrao de entrada: todos
n_pe = 0
for x in padrao:
    add(x['id'], 'padrao_entrada'); n_pe += 1

ids = sorted(keep)
faltando = [i for i in ids if i not in base_ids]
assert not faltando, f'ids fora da base: {faltando}'

base_bom = {str(i): 1.0 for i in ids}

estrutura = {
    "schema_version": 1,
    "rev": 1,
    "status": "ativo",
    "id": "X-CATALOGO-001",
    "tipo": "Catálogo — Transformadores, Cabos e Padrão de Entrada",
    "condutor": None,
    "tensao_kv": 13.8,
    "nominal_kv": 7.97,
    "fases": 3,
    "categoria": "Catálogo de Materiais (NDU)",
    "poste_ref": "N/A",
    "base_bom": base_bom,
    "postes": [{"poste": "N/A", "delta": {}}]
}

out = os.path.join(HERE, 'X-CATALOGO-001.json')
json.dump(estrutura, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

print('escrito:', out)
print(f'  itens no base_bom: {len(base_bom)}')
print(f'   - transformadores (mono+tri limpos): {n_tr}')
print(f'   - cabos (sem duplicata):             {n_ca}')
print(f'   - padrao de entrada:                 {n_pe}')
overl = len({i for i in keep if keep[i] != 'padrao_entrada'} & {x['id'] for x in padrao})
print(f'   - (ids 305-390 do padrao; sobreposicao cabos/padrao colapsada por id)')
print(f'  total unico (uniao): {len(ids)}  | todos existem na base: {not faltando}')
