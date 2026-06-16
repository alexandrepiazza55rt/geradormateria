# -*- coding: utf-8 -*-
import openpyxl, sys, io
from openpyxl.utils import get_column_letter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
OUT  = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\analysis"

print("Loading formulas...", flush=True)
wbf = openpyxl.load_workbook(PATH, data_only=False)
print("Loading values...", flush=True)
wbv = openpyxl.load_workbook(PATH, data_only=True)

def cellstr(ws_f, ws_v, r, c):
    f = ws_f.cell(row=r, column=c).value
    v = ws_v.cell(row=r, column=c).value
    if f is None and v is None:
        return None
    coord = f"{get_column_letter(c)}{r}"
    fs = "" if f is None else str(f).replace("\n"," ")
    if isinstance(f, str) and f.startswith("="):
        vs = "" if v is None else repr(v)
        return f"{coord}\tFORMULA: {fs}\tCACHED={vs}"
    else:
        return f"{coord}\tVALUE: {fs}"

def dump_region(fh, sheet, r1, r2, c1, c2, label=""):
    ws_f = wbf[sheet]; ws_v = wbv[sheet]
    fh.write(f"\n##### {sheet} [{label}] rows {r1}-{r2} cols {c1}-{c2} #####\n")
    for r in range(r1, r2+1):
        rowcells = []
        for c in range(c1, c2+1):
            s = cellstr(ws_f, ws_v, r, c)
            if s: rowcells.append(s)
        if rowcells:
            fh.write(f"-- R{r}\n")
            for s in rowcells:
                fh.write("   "+s+"\n")

# 1) Materiais e Valores: the master/output list. Dump headers + first 60 rows all cols, plus deep samples
with io.open(OUT+r"\f_materiais_valores.txt","w",encoding="utf-8") as fh:
    dump_region(fh, 'Materiais e Valores', 1, 70, 1, 13, "head")
    dump_region(fh, 'Materiais e Valores', 100, 110, 1, 13, "mid")
    dump_region(fh, 'Materiais e Valores', 700, 710, 1, 13, "deep")
    dump_region(fh, 'Materiais e Valores', 1280, 1290, 1, 13, "tail")
print("wrote f_materiais_valores.txt")

# 2) Estruturas 13,8kv: headers full width + a vertical slice
with io.open(OUT+r"\f_estruturas_138.txt","w",encoding="utf-8") as fh:
    dump_region(fh, 'Estruturas 13,8kv', 1, 14, 1, 121, "headers-full-width")
    dump_region(fh, 'Estruturas 13,8kv', 1, 40, 1, 12, "topleft-detail")
    dump_region(fh, 'Estruturas 13,8kv', 40, 80, 1, 12, "rows40-80")
print("wrote f_estruturas_138.txt")

# 3) Mono 13,8kv: input matrix headers + slice
with io.open(OUT+r"\f_mono_138.txt","w",encoding="utf-8") as fh:
    dump_region(fh, 'Mono 13,8kv', 1, 14, 1, 60, "headers")
    dump_region(fh, 'Mono 13,8kv', 1, 40, 1, 12, "topleft-detail")
print("wrote f_mono_138.txt")

# 4) Menu
with io.open(OUT+r"\f_menu.txt","w",encoding="utf-8") as fh:
    dump_region(fh, 'Menu', 1, 26, 1, 13, "menu")
print("wrote f_menu.txt")

print("DONE")
