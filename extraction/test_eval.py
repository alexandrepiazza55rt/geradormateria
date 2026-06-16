# -*- coding: utf-8 -*-
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\extraction")
from xlmodel import Model
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
MV = "Materiais e Valores"

t0=time.time()
m = Model(PATH)
print(f"loaded model in {time.time()-t0:.1f}s; formulas={len(m.formula)} literals={len(m.literal)}")

def outputs():
    m.cache = {} if not m.overrides else m.cache  # keep cache within a pass
    res = {}
    for r in range(19, 310):
        v = m.cell(MV, f"E{r}")
        if isinstance(v,(int,float)) and abs(v) > 1e-9:
            sap = m.cell(MV, f"B{r}"); desc = m.cell(MV, f"C{r}"); un = m.cell(MV, f"D{r}")
            res[r] = (sap, desc, un, v)
    return res

# baseline
m.set_inputs({})
base = outputs()
print(f"baseline nonzero outputs = {len(base)} (expected 0)")

def probe(label, inputs):
    m.set_inputs(inputs)
    res = outputs()
    print(f"\n===== {label} =====  (changed materials: {len(res)})")
    for r in sorted(res):
        sap, desc, un, v = res[r]
        print(f"  +{v:<7g} [{str(un).strip()}] SAP={sap}  {desc}")

probe("Mono 13,8kv  CFU-AVULSO  poste DT-10/150  (F5=1)", {("Mono 13,8kv","F5"):1})
probe("Mono 13,8kv  U1 / 2CAA / DT-10/150  (L5=1)",       {("Mono 13,8kv","L5"):1})
probe("Mono 13,8kv  U1 / 2CAA / DT-11/600  (L11=1)",      {("Mono 13,8kv","L11"):1})
print(f"\nTOTAL time {time.time()-t0:.1f}s")
