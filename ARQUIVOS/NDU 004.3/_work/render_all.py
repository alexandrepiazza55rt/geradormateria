# -*- coding: utf-8 -*-
import fitz, os

PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\NDU 004.3 - Instalações Básicas para Construção de Redes de Distribuição Multiplexadas de Baixa Tensão.pdf"
WORK = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3\_work\img"
os.makedirs(WORK, exist_ok=True)
doc = fitz.open(PDF)

# page -> (frac0, frac1) crop band (table region). Notas-above pages start lower.
jobs = {
    101:(0.30,0.98), 104:(0.30,0.98), 141:(0.40,0.95),
    109:(0.06,0.78), 115:(0.06,0.80), 126:(0.06,0.85),
    130:(0.06,0.85), 133:(0.06,0.92), 136:(0.06,0.92),
}
for pno,(f0,f1) in jobs.items():
    page = doc[pno-1]; r = page.rect
    clip = fitz.Rect(r.x0, r.y0+r.height*f0, r.x1, r.y0+r.height*f1)
    pix = page.get_pixmap(dpi=300, clip=clip)
    out = os.path.join(WORK, f"p{pno:03}_crop.png")
    pix.save(out); print("saved", out, pix.width,"x",pix.height)
