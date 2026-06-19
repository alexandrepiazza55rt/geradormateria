# -*- coding: utf-8 -*-
"""
Gera comparacao_transformadores.json: matriz dos transformadores da planilha
(GERAÇÃO DE MATERIAL) versus o que as normas NDU padronizam (faixas/classes),
mais as anomalias detectadas na planilha (com os ids afetados).

Norma: valores lidos dos PDFs locais (NDU 005 v6.0 Jul/2026; NDU 004.1 v6.0 Dez/2024).
       A "Tabela O" (lista de trafos com SISUP) NAO esta no PDF local da NDU 005
       (anexo incompleto), entao a comparacao e por faixa/classe, nao por codigo.

Uso: python comparar_transformadores.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
t = json.load(open(os.path.join(HERE, 'transformadores.json'), encoding='utf-8'))
pot = [x for x in t if x['tipo'] in ('monofasico', 'trifasico')]

def vals(tipo, key):
    s = set()
    for x in pot:
        if x['tipo'] == tipo and x.get(key) is not None:
            s.add(x[key])
    return s

pl_mono_kva = sorted(vals('monofasico', 'potencia_kva'))
pl_tri_kva  = sorted(vals('trifasico', 'potencia_kva'))
pl_mono_sec = sorted({x['tensao_sec'] for x in pot if x['tipo']=='monofasico' and x['tensao_sec']})
pl_tri_sec  = sorted({x['tensao_sec'] for x in pot if x['tipo']=='trifasico' and x['tensao_sec']})
pl_classes  = sorted({x['tensao_kv'] for x in pot if x['tensao_kv']})

# --- valores da norma (lidos dos PDFs) ---
norma_tri_kva  = [15, 30, 45, 75, 112.5, 150, 225, 300]
norma_mono_kva = [5, 10, 15, 25]   # NDU 004.1 Tab08: "5 a 25 kVA"; 37,5 nao confirmado
norma_classes  = [13.8, 24.2, 34.5]
norma_tri_sec  = ["220/127", "380/220"]
norma_mono_sec = ["254/127"]

def diff(planilha, norma):
    sp, sn = set(planilha), set(norma)
    return {"so_na_planilha": sorted(sp - sn), "so_na_norma": sorted(sn - sp),
            "status": "OK" if sp == sn else "DIVERGENCIA"}

# --- anomalias (com ids) ---
tri_sec_invalido = sorted([x['id'] for x in pot
                           if x['tipo']=='trifasico' and x['tensao_sec'] == '254/127'])
mono_37_5 = sorted([x['id'] for x in pot
                    if x['tipo']=='monofasico' and x['potencia_kva'] == 37.5])
duplicatas = sorted([{"id": x['id'], "dup_de_id": x.get('dup_de_id'), "descricao": x['descricao']}
                     for x in t if x.get('dup')], key=lambda d: d['id'])
classes_sem_trafo = sorted(set(norma_classes) - {13.8, 34.5})  # classes da norma sem trafo na planilha

out = {
  "_meta": {
    "gerado_em": "2026-06-17",
    "fonte_planilha": "GERAÇÃO DE MATERIAL.xlsm -> extracao/transformadores.json (ids da base V3/data/materiais.json)",
    "fontes_norma": [
      {"doc": "NDU 005", "versao": "6.0 - Julho/2026",
       "usado": "Tabela 55 (PDF p115) faixas tri; estruturas p315-330",
       "ressalva": "Tabela O (lista de trafos c/ SISUP, ~p330) AUSENTE no PDF local — anexo incompleto (faltam tabelas I, J, O, P)"},
      {"doc": "NDU 004.1", "versao": "6.0 - Dezembro/2024",
       "usado": "Tabela 08 (PDF p57): Mono '5 a 25 kVA'; Tri <=112,5/150/225/300 kVA"}
    ],
    "limitacao": "Comparacao no nivel de FAIXA/CLASSE (potencia, classe de tensao, secundario). Cruzamento por codigo SISUP por trafo depende da Tabela O, que falta no PDF local."
  },
  "resumo": {
    "itens_transformador_planilha": len(t),
    "distribuicao_mono_tri": len(pot),
    "tp_tc": len(t) - len(pot),
    "combos_unicos": len({(x['tipo'], x['potencia_kva'], x['tensao_kv'], x['tensao_sec']) for x in pot})
  },
  "planilha": {
    "monofasico": {"potencias_kva": pl_mono_kva, "secundario_v": pl_mono_sec},
    "trifasico":  {"potencias_kva": pl_tri_kva,  "secundario_v": pl_tri_sec},
    "classes_kv": pl_classes,
    "obs_classes": "19.92 e 36.2 kV sao tensao de fase / classe de isolamento do sistema 34.5 kV (nao sao trafos extra)."
  },
  "norma": {
    "monofasico": {"potencias_kva": norma_mono_kva, "secundario_v": norma_mono_sec,
                   "obs": "NDU 004.1 Tab08: '5 a 25 kVA'. 37,5 kVA nao confirmado (Tabela O ausente)."},
    "trifasico":  {"potencias_kva": norma_tri_kva, "secundario_v": norma_tri_sec},
    "classes_kv": norma_classes
  },
  "comparacao": [
    {"atributo": "Trifasico - potencias (kVA)", "planilha": pl_tri_kva, "norma": norma_tri_kva, **diff(pl_tri_kva, norma_tri_kva), "nota": "Espinha dorsal bate 100%."},
    {"atributo": "Monofasico - potencias (kVA)", "planilha": pl_mono_kva, "norma": norma_mono_kva, **diff(pl_mono_kva, norma_mono_kva), "nota": "37,5 kVA so na planilha; rural pode permitir, mas nao confirmado nos PDFs lidos."},
    {"atributo": "Classe de tensao (kV)", "planilha": [13.8, 34.5], "norma": norma_classes, **diff([13.8, 34.5], norma_classes), "nota": "Norma preve classe 24,2 kV; planilha nao tem trafo 24,2 kV."},
    {"atributo": "Secundario trifasico (V)", "planilha": [s for s in pl_tri_sec if s != '254/127'], "norma": norma_tri_sec, **diff([s for s in pl_tri_sec if s != '254/127'], norma_tri_sec), "nota": "OK (ignorando rotulo invalido 254/127 — ver anomalias)."},
    {"atributo": "Secundario monofasico (V)", "planilha": pl_mono_sec, "norma": norma_mono_sec, **diff(pl_mono_sec, norma_mono_sec), "nota": "OK."}
  ],
  "anomalias_planilha": [
    {"tipo": "secundario_invalido", "gravidade": "media",
     "descricao": "Trafos TRIFASICOS rotulados '254/127V' (secundario de trifasico deve ser 220/127 ou 380/220).",
     "ids_afetados": tri_sec_invalido, "qtd": len(tri_sec_invalido)},
    {"tipo": "potencia_nao_confirmada", "gravidade": "baixa",
     "descricao": "Monofasico 37,5 kVA presente na planilha, nao confirmado nos PDFs lidos (depende da Tabela O).",
     "ids_afetados": mono_37_5, "qtd": len(mono_37_5)},
    {"tipo": "classe_ausente_na_planilha", "gravidade": "baixa",
     "descricao": "Norma preve classe 24,2 kV (13,97 kV nominal), mas nao ha transformador 24,2 kV na planilha.",
     "classes": classes_sem_trafo},
    {"tipo": "duplicata", "gravidade": "baixa",
     "descricao": "Transformadores duplicados na base (dois blocos de id com mesma descricao).",
     "itens": duplicatas, "qtd": len(duplicatas)}
  ]
}

p = os.path.join(HERE, 'comparacao_transformadores.json')
json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('escrito:', p)
print('  combos unicos:', out['resumo']['combos_unicos'])
print('  tri 254/127 invalidos:', len(tri_sec_invalido), '->', tri_sec_invalido)
print('  mono 37,5 kVA:', len(mono_37_5), '->', mono_37_5)
print('  duplicatas:', len(duplicatas))
for c in out['comparacao']:
    print(f"  [{c['status']:11}] {c['atributo']}")
