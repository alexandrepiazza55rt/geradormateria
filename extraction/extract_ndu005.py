# -*- coding: utf-8 -*-
"""
Fase 2 (NDU 005) — pass 1: extract every structure's MAIN material table
(the clean 5-col table) with page traceability, plus the structure caption and
the cruzeta (from the preceding drawing title). Parametric refs (Tabela A/B/C/01..)
are kept verbatim for resolution in pass 2.

Output: data/ndu005_raw.json  (intermediate, faithful, with origem/página)
"""
import fitz, sys, io, os, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
PDF = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\Docs\NDU 005 - Instalações básicas para construção de redes de distribuição rurais.pdf"
OUT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3\data"
doc = fitz.open(PDF)

cap_rx = re.compile(r"Lista de Materiais\s*[–\-]\s*(.+?)\.?\s*$", re.I | re.M)
cruz_rx = re.compile(r"Cruzeta[^\n]*", re.I)
estr_title_rx = re.compile(r"ESTRUTURA\s+([A-Z0-9\-\s]+?)(?:\s*[–\-]\s*Cruzeta\s*([^\n]+))?$", re.I | re.M)

def header_norm(cells):
    return [(c or "").replace("\n", " ").strip().lower() for c in cells]

def is_main_table(tbl):
    h = header_norm(tbl[0]) if tbl else []
    joined = " ".join(h)
    return ("sisup" in joined) and ("descri" in joined) and ("quantidade" in joined or "quant" in joined)

def main():
    results = []
    for i in range(150, 340):
        page = doc[i]
        text = page.get_text("text")
        if "Lista de Materiais" not in text:
            continue
        caps = cap_rx.findall(text)
        caption = caps[0].strip() if caps else None
        # title from the preceding drawing page: "ESTRUTURA N3 - CRUZETA T 1,90 M"
        prevtxt = doc[i-2].get_text("text") + "\n" + doc[i-1].get_text("text")
        tmatch = re.search(r"ESTRUTURA\s+([A-Z0-9\-]+)\s*[-–]\s*CRUZETA\s+([^\n]+)", prevtxt, re.I)
        titulo = tmatch.group(1).strip() if tmatch else None
        cruz = (tmatch.group(2).strip() if tmatch else None)
        if not cruz:
            m = cruz_rx.search(text) or cruz_rx.search(prevtxt)
            if m: cruz = m.group(0).strip()
        # find the main material table
        try:
            tabs = page.find_tables()
        except Exception:
            tabs = None
        main_tbl = None
        for t in (tabs.tables if tabs else []):
            rows = t.extract()
            if is_main_table(rows):
                main_tbl = rows
                break
        if not main_tbl:
            continue
        mats = []
        for row in main_tbl[1:]:
            cells = [("" if c is None else c.replace("\n", " ").strip()) for c in row]
            # columns: SISUP, Desenho, Quantidade, Descrição, ETU
            if len(cells) < 4:
                continue
            sisup, desenho, qtd, desc = cells[0], cells[1], cells[2], cells[3]
            etu = cells[4] if len(cells) > 4 else ""
            if not (sisup or desc):
                continue
            if sisup.lower().startswith("código"):
                continue
            mats.append({"sisup": sisup, "desenho": desenho, "qtd": qtd, "descricao": desc, "etu": etu})
        if mats:
            results.append({"page": i+1, "caption": caption, "titulo": titulo, "cruzeta": cruz, "materiais": mats})

    os.makedirs(OUT, exist_ok=True)
    json.dump(results, open(os.path.join(OUT, "ndu005_raw.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # inventory
    print(f"structure material-lists captured: {len(results)}")
    print("\ncaption | cruzeta | #materiais | page")
    for r in results:
        print(f"  {str(r['caption'])[:34]:34} | {str(r['cruzeta'])[:22]:22} | {len(r['materiais']):2} | p{r['page']}")
    # count parametric refs vs fixed codes
    fixed = parref = 0
    for r in results:
        for m in r["materiais"]:
            if re.match(r"^\d{4,6}$", m["sisup"]): fixed += 1
            else: parref += 1
    print(f"\nmaterial rows: fixed-code={fixed}  parametric-ref={parref}")

if __name__ == "__main__":
    main()
