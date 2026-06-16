# -*- coding: utf-8 -*-
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from pycel import ExcelCompiler
PATH = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\GERAÇÃO DE MATERIAL.xlsm"
MV = "Materiais e Valores"

t0=time.time()
print("Compiling (building graph from output range)...", flush=True)
xl = ExcelCompiler(filename=PATH)

def out_vector():
    vals = xl.evaluate(f"'{MV}'!E19:E309")
    # vals is list-of-lists
    flat=[]
    for row in vals:
        flat.append(row[0] if isinstance(row,(list,tuple)) else row)
    return flat

print(f"baseline eval... t={time.time()-t0:.1f}s", flush=True)
base = out_vector()
nz_base = sum(1 for v in base if isinstance(v,(int,float)) and v!=0)
print(f"  baseline nonzeros = {nz_base} (expected 0)  t={time.time()-t0:.1f}s")

# set CFU-AVULSO on DT-10/150 = 1
xl.set_value("'Mono 13,8kv'!F5", 1)
after = out_vector()
print(f"  after set Mono!F5=1: t={time.time()-t0:.1f}s")
desc = xl.evaluate(f"'{MV}'!C19:C309")
sap  = xl.evaluate(f"'{MV}'!B19:B309")
n=0
for i,(b,a) in enumerate(zip(base, after)):
    bb = b if isinstance(b,(int,float)) else 0
    aa = a if isinstance(a,(int,float)) else 0
    if aa-bb != 0:
        d = desc[i][0]; s = sap[i][0]
        print(f"    +{aa-bb:<6} SAP={s} {d}")
        n+=1
print(f"  changed materials = {n}")
print(f"DONE t={time.time()-t0:.1f}s")
