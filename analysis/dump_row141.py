# -*- coding: utf-8 -*-
import openpyxl, sys, io
from openpyxl.utils import get_column_letter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
wbf = openpyxl.load_workbook(PATH, data_only=False)
ws = wbf['Mono 13,8kv']
# Dump row 141 and 142 across all columns: show formula
for r in (141, 142, 148):
    print(f"\n===== Mono 13,8kv ROW {r} (all non-empty cells, formulas) =====")
    for c in range(1, ws.max_column+1):
        v = ws.cell(row=r, column=c).value
        if v is not None and v != 0:
            print(f"  {get_column_letter(c)}{r} = {v}")
# Also dump the U1 block coefficient: column K header rows 3-4 and what K141 / L141 reference
print("\n===== U1 block columns K,L,M at rows 3,4,5,141 =====")
for col in ('K','L','M'):
    for r in (3,4,5,141,142):
        cell = ws[f"{col}{r}"]
        print(f"  {col}{r} = {cell.value!r}")
print("DONE")
