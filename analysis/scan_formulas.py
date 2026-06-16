# -*- coding: utf-8 -*-
import openpyxl, sys, io, re
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
wb = openpyxl.load_workbook(PATH, data_only=False)

func_re = re.compile(r"([A-Z][A-Z0-9\.]*)\(")
ext_re  = re.compile(r"\[\d+\]")
funcs = Counter()
ext_hits = 0
ext_examples = []
total_formulas = 0
per_sheet_ext = Counter()

for ws in wb.worksheets:
    for row in ws.iter_rows():
        for cell in row:
            v = cell.value
            if isinstance(v, str) and v.startswith("="):
                total_formulas += 1
                for m in func_re.findall(v):
                    funcs[m]+=1
                if ext_re.search(v):
                    ext_hits += 1
                    per_sheet_ext[ws.title]+=1
                    if len(ext_examples) < 15:
                        ext_examples.append(f"{ws.title}!{cell.coordinate}: {v[:120]}")

print(f"TOTAL formula cells: {total_formulas}")
print(f"\nFUNCTIONS used (count):")
for f,c in funcs.most_common():
    print(f"  {f:12} {c}")
print(f"\nEXTERNAL-LINK references in formulas: {ext_hits}")
for s,c in per_sheet_ext.most_common():
    print(f"  {s}: {c}")
print("\nExamples of external refs:")
for e in ext_examples:
    print("  "+e)
print("DONE")
