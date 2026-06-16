# -*- coding: utf-8 -*-
import fitz, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
doc = fitz.open(PDF)
# find which structure each LISTA page belongs to: scan for 'Lista de Materiais – Estrutura X'
import re
rx = re.compile(r"Lista de Materiais.*?Estrutura\s+([^\.\n]+)", re.I)
print("=== structure -> page map (from 'Lista de Materiais – Estrutura X') ===")
for i in range(130, doc.page_count):
    t = doc[i].get_text("text")
    m = rx.search(t)
    if m:
        print(f"  page {i+1}: {m.group(1).strip()}")
