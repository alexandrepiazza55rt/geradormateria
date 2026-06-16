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
    if f is None and v is None: return None
    coord = f"{get_column_letter(c)}{r}"
    if isinstance(f, str) and f.startswith("="):
        vs = "" if v is None else repr(v)
        return f"{coord}= {str(f)}  [={vs}]"
    else:
        return f"{coord}: {str(f)}"

def dump(fh, sheet, r1, r2, c1, c2, label=""):
    ws_f = wbf[sheet]; ws_v = wbv[sheet]
    fh.write(f"\n##### {sheet} [{label}] R{r1}-{r2} C{c1}-{c2} #####\n")
    for r in range(r1, r2+1):
        rowcells = [cellstr(ws_f, ws_v, r, c) for c in range(c1, c2+1)]
        rowcells = [x for x in rowcells if x]
        if rowcells:
            fh.write(f"R{r}: " + " | ".join(rowcells) + "\n")

with io.open(OUT+r"\f_mono_totals.txt","w",encoding="utf-8") as fh:
    # Find the material total area. DW=127. Look at cols DP(120)-EE(135), rows 135-175 and a deep slice
    dump(fh, 'Mono 13,8kv', 138, 175, 120, 135, "mat-totals-head")
    dump(fh, 'Mono 13,8kv', 138, 175, 122, 127, "DV-DW only")
    # the input total/index columns DS area rows 3-10
    dump(fh, 'Mono 13,8kv', 1, 12, 120, 138, "topright-headers")
print("wrote f_mono_totals.txt")

with io.open(OUT+r"\f_estruturas_row.txt","w",encoding="utf-8") as fh:
    # full width of structure rows to see material template: header row(s) + CFU row5 + ESTAI row29
    dump(fh, 'Estruturas 13,8kv', 1, 4, 1, 121, "top-headers")
    dump(fh, 'Estruturas 13,8kv', 5, 5, 1, 121, "CFU/DT-10/150 full")
    dump(fh, 'Estruturas 13,8kv', 29, 29, 1, 121, "ESTAI/DT-10/150 full")
    dump(fh, 'Estruturas 13,8kv', 4, 4, 1, 121, "CFU header row")
print("wrote f_estruturas_row.txt")

# Also: how does Mono 13,8kv DW reference Estruturas? Show DW141..DW160 fully
with io.open(OUT+r"\f_mono_DW.txt","w",encoding="utf-8") as fh:
    dump(fh, 'Mono 13,8kv', 139, 200, 127, 127, "DW col formulas")
    dump(fh, 'Mono 13,8kv', 139, 160, 123, 123, "DS col (filter)")
print("wrote f_mono_DW.txt")
print("DONE")
