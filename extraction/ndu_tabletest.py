# -*- coding: utf-8 -*-
import fitz, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
doc = fitz.open(PDF)
for p in [160, 372]:
    page = doc[p-1]
    print(f"\n################## PAGE {p} — find_tables() ##################")
    tabs = page.find_tables()
    print(f"tables found: {len(tabs.tables)}")
    for ti, t in enumerate(tabs.tables):
        print(f"\n--- table {ti} bbox={[round(x) for x in t.bbox]} rows={t.row_count} cols={t.col_count} ---")
        for row in t.extract():
            cells = [("" if c is None else c.replace(chr(10)," ").strip()) for c in row]
            print("  | ".join(cells))
