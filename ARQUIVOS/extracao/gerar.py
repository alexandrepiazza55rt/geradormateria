# -*- coding: utf-8 -*-
"""
Extrai de "GERAÇÃO DE MATERIAL.xlsm" tres categorias, reaproveitando os `id`
da base V3/data/materiais.json (que e a propria lista mestra do Excel importada):
  - transformadores.json   (trafos mono/tri/TP/TC reais)
  - cabos.json             (cabos/condutores reais)
  - padrao_entrada.json    (materiais de medicao, ids 305-390, com qtd-base)

Uso:  python gerar.py
Requer: openpyxl  (pip install openpyxl)
"""
import os, json, re, unicodedata, tempfile, shutil
import openpyxl

HERE  = os.path.dirname(os.path.abspath(__file__))
EXTRA = os.path.dirname(HERE)
XLSM  = os.path.join(EXTRA, 'GERAÇÃO DE MATERIAL.xlsm')
MAT   = os.path.normpath(os.path.join(EXTRA, '..', '..', 'V3', 'data', 'materiais.json'))
OUT   = HERE

def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'\s+', ' ', s).strip()

def base_fields(m):
    return {'id': m['id'], 'cod_sap': m.get('cod_sap', ''), 'cod_lider7': m.get('cod_lider7', ''),
            'descricao': m['descricao'], 'unidade': (m.get('unidade', '') or '').strip(),
            'row': m.get('row')}

def mark_dups(lst):
    seen = {}
    for e in lst:
        k = norm(e['descricao']); e['dup'] = k in seen
        if e['dup']: e['dup_de_id'] = seen[k]
        else: seen[k] = e['id']
    return lst

def parse_trafo(d):
    n = norm(d)
    fases = 1 if 'monofasico' in n else (3 if 'trifasico' in n else None)
    tipo = ('monofasico' if fases == 1 else 'trifasico' if fases == 3 else
            'potencial' if 'potencial' in n else 'corrente' if 'corrente' in n else 'outro')
    kv = next((v for p, v in [('13.8',13.8),('13,8',13.8),('34.5',34.5),('34,5',34.5),
               ('19,92',19.92),('19.92',19.92),('36,2',36.2),('36.2',36.2)] if p in n), None)
    mk = re.search(r'(\d+(?:[.,]\d+)?)\s*kva', n)
    ms = re.search(r'(254/127|220/127|380/220)', d.replace(' ', ''))
    return {'tipo': tipo, 'fases': fases, 'tensao_kv': kv,
            'potencia_kva': float(mk.group(1).replace(',', '.')) if mk else None,
            'tensao_sec': ms.group(1) if ms else None}

def parse_cabo(d):
    n = norm(d)
    material = ('aluminio' if 'alumin' in n else 'cobre' if 'cobre' in n or n.startswith('cabo cu')
                else 'aco' if 'aco' in n else None)
    forma = []
    for kw, lab in [('multiplex','multiplexado'),('quadriplex','quadriplex'),('triplex','triplex'),
                    ('biplex','biplex'),('coberto','coberto'),('protegido','protegido'),
                    ('isolado','isolado'),('isol','isolado'),(' nu','nu'),('flexivel','flexivel'),
                    ('flex','flexivel'),('cordoalha','cordoalha')]:
        if kw in n and lab not in forma: forma.append(lab)
    mb = re.findall(r'(\d+(?:[.,]\d+)?)\s*mm', n)
    ma = re.search(r'(\d+(?:/\d+)?)\s*(?:awg|caa|ca|mcm)', n)
    return {'material': material, 'forma': forma or None,
            'bitola_mm2': mb[0].replace(',', '.') + 'mm2' if mb else None,
            'bitola_awg': ma.group(0).upper() if ma else None}

def main():
    mats = json.load(open(MAT, encoding='utf-8'))
    tmp = os.path.join(tempfile.gettempdir(), 'gm_copy.xlsm')
    shutil.copy2(XLSM, tmp)  # copia fresca (evita lock do OneDrive/Excel)
    wb = openpyxl.load_workbook(tmp, read_only=True, data_only=True)
    qtd = {}
    for row in wb['Materiais de Medições'].iter_rows(values_only=True):
        if row[0] and str(row[0]).strip():
            qtd[norm(row[0])] = row[3] if len(row) > 3 else None
    wb.close()

    trafos = mark_dups(sorted(
        [{**base_fields(m), **parse_trafo(m['descricao'])}
         for m in mats if norm(m['descricao']).startswith('transformador')], key=lambda e: e['id']))
    cabos = mark_dups(sorted(
        [{**base_fields(m), **parse_cabo(m['descricao'])}
         for m in mats if norm(m['descricao']).startswith('cabo')], key=lambda e: e['id']))
    padrao = sorted(
        [{**base_fields(m), 'qtd_padrao': qtd.get(norm(m['descricao']))}
         for m in mats if 305 <= m['id'] <= 390], key=lambda e: e['id'])

    for name, data in [('transformadores.json', trafos), ('cabos.json', cabos),
                       ('padrao_entrada.json', padrao)]:
        json.dump(data, open(os.path.join(OUT, name), 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=2)
        print(f'{name}: {len(data)} itens')

if __name__ == '__main__':
    main()
