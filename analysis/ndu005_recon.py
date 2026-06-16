# -*- coding: utf-8 -*-
import fitz, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
doc = fitz.open(PDF)
print(f"PAGES: {doc.page_count}")
# char count per page (first 40) to gauge text vs scanned
counts = []
for i in range(doc.page_count):
    t = doc[i].get_text("text")
    counts.append(len(t))
tot = sum(counts)
nonempty = sum(1 for c in counts if c > 50)
print(f"total text chars: {tot}; pages with >50 chars: {nonempty}/{doc.page_count}")
print("chars per page (first 30):", counts[:30])
# images per page (first 30) to detect scanned/drawings
print("\nimages per page (first 30):", [len(doc[i].get_images()) for i in range(min(30, doc.page_count))])
print("\n===== TEXT of pages 1-6 =====")
for i in range(min(6, doc.page_count)):
    print(f"\n----- PAGE {i+1} -----")
    print(doc[i].get_text("text")[:2500])
