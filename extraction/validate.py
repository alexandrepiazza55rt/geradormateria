# -*- coding: utf-8 -*-
"""
Fase 4 cross-validation: prove that summing per-item BOMs (what the app does)
equals the spreadsheet's true consolidated output (linear superposition).

We pick several input cells across the 4 generator sheets, assign quantities,
then compare:
  (A) COMBINED: set all inputs at once in the real model, read 'Materiais e
      Valores'!E19:E1255  (the spreadsheet's actual consolidated BOM)
  (B) SUPERPOSED: for each input, probe qty=1, scale by its quantity, and sum.
If A == B for every material, the app's per-item-then-consolidate logic is exact.
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlmodel import Model
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
MV = "Materiais e Valores"

m = Model(PATH)

# A representative "obra": (sheet, cell, qty). Cells chosen from the input matrices.
obra = [
    ("Mono 13,8kv",       "L5",  3),   # U1 / 2CAA / DT-10/150
    ("Mono 13,8kv",       "I11", 2),   # ESTAI / DT-11/600
    ("Mono 34,5kv",       "L5",  5),   # U1 34,5 / 2CAA
    ("Trifásico 13,8kv ", "BG5", 4),   # N3 / 2CAA / DT-10/150
    ("Trifásico 13,8kv ", "AW7", 1),   # N1 / 2CAA / DT-10/600
    ("Trifásico 34,5kv",  "S5",  2),   # P1 / 2CAA
]

def read_output():
    res = {}
    for r in range(19, 1256):
        v = m.cell(MV, f"E{r}")
        if isinstance(v, (int, float)) and abs(v) > 1e-9:
            res[r] = round(v, 6)
    return res

# (A) combined
m.set_inputs({(s, c): q for (s, c, q) in obra})
combined = read_output()

# (B) superposed: per-input unit probe * qty, summed
superposed = {}
for (s, c, q) in obra:
    m.set_inputs({(s, c): 1})
    for r in range(19, 1256):
        v = m.cell(MV, f"E{r}")
        if isinstance(v, (int, float)) and abs(v) > 1e-9:
            superposed[r] = round(superposed.get(r, 0) + v * q, 6)
superposed = {k: round(v, 6) for k, v in superposed.items() if abs(v) > 1e-9}

# compare
keys = set(combined) | set(superposed)
diffs = [(k, combined.get(k, 0), superposed.get(k, 0)) for k in keys
         if abs(combined.get(k, 0) - superposed.get(k, 0)) > 1e-6]

print(f"obra: {len(obra)} input lines")
print(f"combined output materials:   {len(combined)}")
print(f"superposed output materials: {len(superposed)}")
print(f"MISMATCHES: {len(diffs)}")
for (k, a, b) in diffs[:30]:
    desc = m.cell(MV, f"C{k}")
    print(f"  row{k} combined={a} superposed={b}  {desc}")

if not diffs:
    print("\n✅ EXACT MATCH — superposition holds; app consolidation == spreadsheet.")
else:
    print("\n⚠️ differences found (see above).")
