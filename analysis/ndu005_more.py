# -*- coding: utf-8 -*-
import fitz, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
doc = fitz.open(PDF)
# rest of anexo (F-Q) and an N3 structure page set
for p in [375,376,377,378,379,380,381]:
    print(f"\n########## ANEXO PAGE {p} ##########")
    print(doc[p-1].get_text("text")[:1700])
