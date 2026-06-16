# -*- coding: utf-8 -*-
"""Enumerate the true INPUT cells of a generator sheet = the union of cells that
appear inside SUM()/refs of the expansion formulas and live in the input band
(top rows) and are not themselves formulas. Also derive labels from headers."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\extraction")
from xlmodel import Model, tokenize, Parser
from openpyxl.utils import column_index_from_string, get_column_letter, coordinate_to_tuple
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"

m = Model(PATH)

def walk(node, out):
    t=node[0]
    if t=="range": out.append(node)
    elif t=="cell": out.append(node)
    elif t in ("bin","cmp","concat"):
        walk(node[2],out); walk(node[3],out)
    elif t in ("unary","percent"):
        walk(node[-1],out)
    elif t=="func":
        for a in node[2]: walk(a,out)

def input_cells_of(sheet, band_max=120):
    """Return set of (col,row) input cells referenced by formulas of this sheet,
    where referenced cell is in the input band (row<=band_max) and is NOT a formula."""
    cells=set()
    for (s,coord),f in m.formula.items():
        if s!=sheet: continue
        if "[" in f: continue
        try: ast=Parser(tokenize(f),s).parse()
        except Exception: continue
        refs=[]; walk(ast,refs)
        for r in refs:
            if r[0]=="cell":
                rs, rc = r[1], r[2]
                if rs!=sheet: continue
                col,row = coordinate_to_tuple(rc)[1], coordinate_to_tuple(rc)[0]
                if row<=band_max and (sheet,rc) not in m.formula:
                    cells.add((column_index_from_string(rc[:len(rc)-len(str(coordinate_to_tuple(rc)[0]))]) if False else None, rc))
            elif r[0]=="range":
                rs=r[1]
                if rs!=sheet: continue
                (rr1,cc1)=coordinate_to_tuple(r[2]); (rr2,cc2)=coordinate_to_tuple(r[3])
                if min(rr1,rr2)>band_max: continue
                for cc in range(min(cc1,cc2),max(cc1,cc2)+1):
                    for rr in range(min(rr1,rr2),max(rr1,rr2)+1):
                        if rr>band_max: continue
                        coord2=f"{get_column_letter(cc)}{rr}"
                        if (sheet,coord2) not in m.formula:
                            cells.add((cc,coord2))
    # keep only those with a real coordinate
    return set((c[1]) for c in cells if c[1])

for sheet in ['Mono 13,8kv','Trifásico 13,8kv ']:
    cells = input_cells_of(sheet)
    # group by column
    bycol={}
    for coord in cells:
        row,col = coordinate_to_tuple(coord)
        bycol.setdefault(col,[]).append(row)
    print(f"\n##### {sheet}: {len(cells)} input cells across {len(bycol)} columns #####")
    cols_sorted=sorted(bycol)
    # show header labels for each input column
    for col in cols_sorted:
        rows=sorted(bycol[col])
        L=get_column_letter(col)
        h3=m.literal.get((sheet,f"{L}3")); h4=m.literal.get((sheet,f"{L}4"))
        # block header: search left for row3 label
        lbl3=None
        for cc in range(col,0,-1):
            v=m.literal.get((sheet,f"{get_column_letter(cc)}3"))
            if v: lbl3=v; break
        print(f"  col {L}: rows {rows[0]}-{rows[-1]} ({len(rows)})  h4={h4!r}  block3={lbl3!r}")
