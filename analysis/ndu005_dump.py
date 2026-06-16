# -*- coding: utf-8 -*-
import fitz, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
OUT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\analysis"
doc = fitz.open(PDF)

def dump(p1, p2, fname):
    with io.open(os.path.join(OUT, fname), "w", encoding="utf-8") as fh:
        for i in range(p1-1, min(p2, doc.page_count)):
            fh.write(f"\n=================== PAGE {i+1} ===================\n")
            fh.write(doc[i].get_text("text"))
    print(f"wrote {fname} (pages {p1}-{p2})")

# Section 7: structure types catalog
dump(24, 36, "ndu005_sec7.txt")
# Section 22: tables start
dump(55, 64, "ndu005_sec22.txt")
# Section 23: drawings start (structures + material lists)
dump(121, 134, "ndu005_sec23.txt")
print("DONE")
