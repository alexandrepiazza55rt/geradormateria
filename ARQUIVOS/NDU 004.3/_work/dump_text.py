# -*- coding: utf-8 -*-
import fitz, os

PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\NDU 004.3 - Instalações Básicas para Construção de Redes de Distribuição Multiplexadas de Baixa Tensão.pdf"
WORK = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\Docs\Inf extraida\NDU 004.3\_work"
os.makedirs(WORK, exist_ok=True)

doc = fitz.open(PDF)
print("PAGES:", doc.page_count)

combined = []
counts = []
for i, page in enumerate(doc):
    t = page.get_text("text")
    counts.append((i + 1, len(t)))
    combined.append(f"\n===== PAGE {i+1} (chars={len(t)}) =====\n{t}")

with open(os.path.join(WORK, "all_text.txt"), "w", encoding="utf-8") as f:
    f.write("".join(combined))

# per-page char counts (identify low-text / drawing / scanned pages)
print("PER-PAGE CHAR COUNTS:")
line = []
for n, c in counts:
    line.append(f"{n}:{c}")
print(" ".join(line))

low = [n for n, c in counts if c < 200]
print("LOW-TEXT PAGES (<200 chars):", low)
