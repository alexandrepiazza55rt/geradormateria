# -*- coding: utf-8 -*-
import fitz, os, sys

PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\NDU 004.3 - Instalações Básicas para Construção de Redes de Distribuição Multiplexadas de Baixa Tensão.pdf"
WORK = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3\_work\img"
os.makedirs(WORK, exist_ok=True)

doc = fitz.open(PDF)
pages = [int(x) for x in sys.argv[1:]]  # 1-based page numbers
for pno in pages:
    page = doc[pno - 1]
    pix = page.get_pixmap(dpi=200)
    out = os.path.join(WORK, f"p{pno:03}.png")
    pix.save(out)
    print("saved", out, pix.width, "x", pix.height)
