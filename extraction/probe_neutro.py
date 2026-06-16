# -*- coding: utf-8 -*-
"""Probe the urban spreadsheet's scalar inputs that the company already uses for
'extensão de rede com cabo 2CAA (metros)' and 'aterramento com haste' — to reuse
the SAME materials/factors for the rural Neutro Contínuo module (faithful)."""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlmodel import Model
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
MV = "Materiais e Valores"
m = Model(PATH)

def probe(cell, label):
    m.set_inputs({("Mono 13,8kv", cell): 1})
    print(f"\n=== {label}  (Mono 13,8kv!{cell}=1) ===")
    n = 0
    for r in range(19, 1256):
        v = m.cell(MV, f"E{r}")
        if isinstance(v, (int, float)) and abs(v) > 1e-9:
            sap = m.cell(MV, f"B{r}"); desc = m.cell(MV, f"C{r}"); un = m.cell(MV, f"D{r}")
            print(f"   {v:>8} [{str(un).strip()}] SAP={sap} {desc}")
            n += 1
    if n == 0: print("   (sem saída)")

# B-column labels (left side of Mono 13,8kv)
for cell in ["C8", "C9", "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C18"]:
    lbl = m.cell("Mono 13,8kv", f"B{cell[1:]}")
    probe(cell, f"{cell}: {lbl}")
