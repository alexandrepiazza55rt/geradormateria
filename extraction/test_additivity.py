# -*- coding: utf-8 -*-
import sys, io, os, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlmodel import Model
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
SHEET = "Mono 13,8kv"
TOTALCOL = "DW"
ROWS = range(141, 432)  # material rows in the sheet's total column

m = Model(PATH)

def probe(col, row):
    """set SHEET!{col}{row}=1, read TOTALCOL totals -> dict{sheet_row: qty}"""
    m.set_inputs({(SHEET, f"{col}{row}"): 1})
    res = {}
    for r in ROWS:
        v = m.cell(SHEET, f"{TOTALCOL}{r}")
        if isinstance(v, (int, float)) and abs(v) > 1e-9:
            res[r] = round(v, 6)
    return res

def diff(a, b):
    keys = set(a) | set(b)
    return {k: round(a.get(k, 0) - b.get(k, 0), 6) for k in keys if abs(a.get(k,0)-b.get(k,0))>1e-9}

# columns: U1/2CAA=L, U3/2CAA=T, ESTAI=I ; poles rows: 5 (DT-10/150), 11 (DT-11/600), 20 (11/200-C)
cols = {"L (U1/2CAA)":"L", "T (U3eU3T/2CAA)":"T", "I (ESTAI/QUANT)":"I"}
poles = {"p5 DT-10/150":5, "p11 DT-11/600":11, "p9 DT-11/200":9}

B = {}
for cn, c in cols.items():
    for pn, p in poles.items():
        B[(cn,pn)] = probe(c, p)

print("Pole delta (p11 - p5) for each column -- should be IDENTICAL if additive:")
for cn in cols:
    d = diff(B[(cn,"p11 DT-11/600")], B[(cn,"p5 DT-10/150")])
    print(f"  {cn:18}: {d}")

print("\nPole delta (p9 - p5) for each column:")
for cn in cols:
    d = diff(B[(cn,"p9 DT-11/200")], B[(cn,"p5 DT-10/150")])
    print(f"  {cn:18}: {d}")

print("\nFull BOM of U1/2CAA at p5 (hardware+pole):")
for r,q in sorted(B[("L (U1/2CAA)","p5 DT-10/150")].items()):
    print(f"   row{r}: {q}")
