# -*- coding: utf-8 -*-
import fitz, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
doc = fitz.open(PDF)

# keywords that indicate a material list / BOM table
kw = {
    "RELACAO_MAT": re.compile(r"rela[çc][ãa]o\s+de\s+materia", re.I),
    "LISTA_MAT":   re.compile(r"lista\s+de\s+materia", re.I),
    "CODIGO":      re.compile(r"c[óo]digo", re.I),
    "DESCRICAO":   re.compile(r"descri[çc][ãa]o", re.I),
    "QUANT":       re.compile(r"\bquant", re.I),
    "UNID":        re.compile(r"\bunid", re.I),
    "ITEM":        re.compile(r"\bitem\b", re.I),
}
hits = {k: [] for k in kw}
for i in range(doc.page_count):
    t = doc[i].get_text("text")
    for k, rx in kw.items():
        if rx.search(t):
            hits[k].append(i+1)

for k in kw:
    pgs = hits[k]
    print(f"{k:12}: {len(pgs)} pages -> {pgs[:40]}{' ...' if len(pgs)>40 else ''}")

# pages that have BOTH a material-list marker AND quantity/code structure
print("\nPages with RELACAO/LISTA de materiais:", sorted(set(hits['RELACAO_MAT']) | set(hits['LISTA_MAT'])))
# Likely structure-drawing material tables: pages with CODIGO+DESCRICAO+QUANT together
strong = [i+1 for i in range(doc.page_count)
          if kw['CODIGO'].search(doc[i].get_text()) and kw['QUANT'].search(doc[i].get_text())]
print("\nPages with CODIGO + QUANT together:", strong[:60])
