# -*- coding: utf-8 -*-
import fitz, os, sys

PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\NDU 004.3 - Instalações Básicas para Construção de Redes de Distribuição Multiplexadas de Baixa Tensão.pdf"
WORK = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3\_work\img"
os.makedirs(WORK, exist_ok=True)

doc = fitz.open(PDF)
pno = int(sys.argv[1])
page = doc[pno - 1]
r = page.rect
# crop to vertical band [frac0, frac1] of the page height, full width
frac0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0.10
frac1 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.75
clip = fitz.Rect(r.x0, r.y0 + r.height*frac0, r.x1, r.y0 + r.height*frac1)
pix = page.get_pixmap(dpi=300, clip=clip)
out = os.path.join(WORK, f"p{pno:03}_crop.png")
pix.save(out)
print("saved", out, pix.width, "x", pix.height)
