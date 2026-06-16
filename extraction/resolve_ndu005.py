# -*- coding: utf-8 -*-
"""
Fase 2 (NDU 005) — pass 2: resolve parametric references into concrete material
codes and emit app-ready rural structures + a materials supplement.

Anexo lookups below are transcribed VERBATIM from NDU 005 v6.0 §24 (the source of
truth). Each structure becomes one entry per (tipo, cruzeta, condutor, tensão):
  - base_bom: fixed codes + tensão-resolved (A/E/H) + condutor-resolved (C/D)
  - postes[]: poste selector -> poste(B) + parafuso(01)
  - cruzeta: baked into the per-page list (each cruzeta = its own list)
Unresolvable refs (equipment L/M/N/O/P/Q, conector F, Tabela 04/R/V/VII/J) are
kept as 'condicional' with the norm description — NEVER invented.
"""
import json, io, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = r"C:\Users\alexa\OneDrive\Desktop\alexandre\Sistema\V3"
DATA = os.path.join(ROOT, "data")
APP = os.path.join(ROOT, "app", "public", "data")

# ---- Anexo lookups (NDU 005 v6.0 §24) ----
TAB_A = {"15": "90253", "24.2": "90254", "36.2": "90580"}   # isolador pilar porcelana
TAB_E = {"15": "90277", "24.2": "90278", "36.2": "90279"}   # isolador suspensão bastão
TAB_H = {"15": "90249", "24.2": "90250", "36.2": "90250"}   # pino p/ isolador cruzeta
TAB_C = {"2": "90741", "1/0": "90742", "4/0": "90745", "336.4": "90746"}  # laço (CAA)
TAB_D = {"2": "90707", "1/0": "90708", "4/0": "90711"}      # alça pré-formada (CAA)
# Tabela B (poste DT concreto, tipo B classe II) por comprimento (m):
TAB_B = {"9": "91413", "10": "90194", "11": "90198", "12": "90202",
         "13": "90206", "14": "692898", "15": "690841"}
# Tabela 01 / I (parafuso rosca total M16) por resistência do poste:
PARAFUSO = {"<=600": "90375", "1000": "90376"}              # 200mm / 250mm
# Tabela G (cruzeta concreto) por tipo (classe II):
TAB_G = {"T 1,90 m": "90400", "2,00 m": "90401", "2,40 m": "90662",
         "T 2,40 m": "91384", "MB 2,40 m": "91385"}
# Tabela M / L (equip por tensão) — resolvidos só p/ referência; entram condicionais
TAB_M = {"15": "90547", "24.2": "90561", "36.2": "90548"}   # chave fusível
TAB_L = {"15": "90551", "24.2": "90552", "36.2": "90553"}   # chave seccionadora

# descriptions for new anexo codes not necessarily in master
ANEXO_DESC = {
    "90253": "Isolador Tipo Pilar Porcelana Vertical 15 kV", "90254": "Isolador Tipo Pilar Porcelana Vertical 24,2 kV",
    "90580": "Isolador Tipo Pilar Porcelana Vertical 36,2 kV",
    "90277": "Isolador Suspensão tipo Bastão 15 kV", "90278": "Isolador Suspensão tipo Bastão 24,2 kV",
    "90279": "Isolador Suspensão tipo Bastão 36,2 kV",
    "90249": "Pino para Isolador Tipo Cruzeta 15 kV", "90250": "Pino para Isolador Tipo Cruzeta 24,2/36,2 kV",
    "90740": "Laço pré-formado de Distribuição CAA 4 AWG", "90741": "Laço pré-formado de Distribuição CAA 2 AWG",
    "90742": "Laço pré-formado de Distribuição CAA 1/0 AWG", "90745": "Laço pré-formado de Distribuição CAA 4/0 AWG",
    "90746": "Laço pré-formado de Distribuição CAA 336,4 MCM",
    "90707": "Alça pré-formada distribuição CAA 2 AWG", "90708": "Alça pré-formada distribuição CAA 1/0 AWG",
    "90711": "Alça pré-formada distribuição CAA 4/0 AWG",
    "90400": "Cruzeta de Distribuição de Concreto T 1.900 mm (CA II)",
    "90401": "Cruzeta de Distribuição de Concreto Quadrada 2.000 mm (CA II)",
    "90662": "Cruzeta de Distribuição de Concreto Retangular 2.400 mm (CA II)",
    "91384": "Cruzeta de Distribuição de Concreto T 2.400 mm (CA II)",
    "91385": "Cruzeta de Distribuição de Concreto MB 2.400 mm (CA II)",
    "90198": "Poste de Concreto Distribuição DT 11 m", "90202": "Poste de Concreto Distribuição DT 12 m",
    "90206": "Poste de Concreto Distribuição DT 13 m", "90194": "Poste de Concreto Distribuição DT 10 m",
    "91413": "Poste de Concreto Distribuição DT 9 m", "692898": "Poste de Concreto Distribuição DT 14 m",
    "690841": "Poste de Concreto Distribuição DT 15 m",
    "90375": "Parafuso Rosca Total M16 x 200 mm", "90376": "Parafuso Rosca Total M16 x 250 mm",
    "90547": "Chave Fusível de Distribuição 15 kV", "90561": "Chave Fusível de Distribuição 24,2 kV",
    "90548": "Chave Fusível de Distribuição 36,2 kV",
    "90551": "Chave Seccionadora Faca Unipolar 15 kV", "90552": "Chave Seccionadora Faca Unipolar 24,2 kV",
    "90553": "Chave Seccionadora Faca Unipolar 36,2 kV",
}

TENSOES = [("13.8", "15", 13.8, 15.0), ("24.2", "24.2", 24.2, 24.2), ("34.5", "36.2", 34.5, 36.2)]
CONDUTORES = ["2", "1/0", "4/0", "336.4"]
COND_LABEL = {"2": "2 AWG", "1/0": "1/0 AWG", "4/0": "4/0 AWG", "336.4": "336,4 MCM"}
# poste options offered (comprimento m, resistência daN) -> standard rural
POSTES = [("11", "300"), ("11", "600"), ("11", "1000"), ("12", "600"), ("12", "1000"), ("13", "1000")]

def qty(s):
    s = (s or "").strip().replace(",", ".")
    m = re.match(r"^\d+(\.\d+)?$", s)
    return float(s) if m else 1.0

def parse_int_qty(s):
    s = (s or "").strip()
    m = re.match(r"^0*(\d+)", s)
    return float(m.group(1)) if m else 1.0

def main():
    raw = json.load(open(os.path.join(DATA, "ndu005_raw.json"), encoding="utf-8"))
    master = json.load(open(os.path.join(DATA, "materiais.json"), encoding="utf-8"))
    desc_by_code = {m["cod_sap"]: m["descricao"] for m in master if m.get("cod_sap")}
    unit_by_code = {m["cod_sap"]: m["unidade"] for m in master if m.get("cod_sap")}
    # descriptions straight from the NDU 005 tables (for codes not in master)
    norm_desc = {}
    for r in raw:
        for m in r["materiais"]:
            s = m["sisup"].strip()
            d = m["descricao"].strip()
            if re.match(r"^\d{4,7}$", s) and d and s not in norm_desc:
                norm_desc[s] = d

    def fase_of(caption):
        c = (caption or "").lower()
        if "trifásica" in c or "trifasico" in c: return 3, "trifasico"
        if "u1" in c or "u2" in c or "u3" in c or "u4" in c or "monof" in c: return 1, "monofasico"
        return 3, "trifasico"

    def tipo_of(r):
        for src in (r.get("titulo"), r.get("caption")):
            if not src: continue
            m = re.search(r"\b(U1|U2|U3-U3|U3-2|U3|U4|N1|N2|N3-N3|N3|N4|T1|T2|T3-T3|T3|T4|TE|HTTE|HTE|S0T|S0|S1)\b", src)
            if m: return m.group(1)
        cap = r.get("caption")
        return cap.replace("Estrutura", "").strip()[:18] if cap else None

    def cruzeta_size(raw_cruz):
        s = (raw_cruz or "")
        has_t = bool(re.search(r"\bT\b", s))
        if re.search(r"1\.?900|1,90", s): return "T 1,90 m"            # 1900 -> 90400 (tipo T)
        if re.search(r"2\.?000|2,00", s): return "2,00 m"             # 90401
        if re.search(r"2\.?400|2,40", s): return "T 2,40 m" if has_t else "2,40 m"
        if re.search(r"MB", s): return "MB 2,40 m"
        return None

    out_estr = []
    used_codes = set()
    conditional_log = []
    sid = 0

    for r in raw:
        cap = r["caption"]
        tipo = tipo_of(r)
        if not tipo:
            continue
        fases, tipo_fase = fase_of(cap)
        cz = cruzeta_size(r["cruzeta"]) if fases == 3 and tipo[0] in ("N", "T") else None

        # classify rows
        rows = r["materiais"]
        def resolve_rows(tcls, cond):
            base = []  # list of {codigo, qtd, [condicional, condicao]}
            for m in rows:
                s = m["sisup"].strip()
                q = parse_int_qty(m["qtd"])
                desc = m["descricao"].strip()
                if re.match(r"^\d{4,7}$", s):
                    base.append({"codigo": s, "qtd": q}); used_codes.add(s)
                elif s in ("Tabela A",):
                    c = TAB_A[tcls]; base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela E",):
                    c = TAB_E[tcls]; base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela H",):
                    c = TAB_H[tcls]; base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela C", "Tabela 02"):
                    c = TAB_C[cond]; base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela D",):
                    c = TAB_D.get(cond) or TAB_D["2"]; base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela G",) and cz:
                    c = TAB_G.get(cz, "90400"); base.append({"codigo": c, "qtd": q}); used_codes.add(c)
                elif s in ("Tabela B", "Tabela 01", "Tabela I", "Tabela 03"):
                    pass  # handled in poste selector
                else:
                    # equipment / conector / unknown -> conditional (não inventar)
                    base.append({"codigo": "", "qtd": q, "condicional": True,
                                 "condicao": f"Resolver {s} conforme projeto (NDU 005 p.{r['page']})",
                                 "descricao_norma": desc})
                    conditional_log.append((tipo, s, desc, r["page"]))
            return base

        # poste deltas (poste material B + parafuso 01) keyed per poste option
        has_poste = any(m["sisup"].strip() in ("Tabela B",) for m in rows)
        has_paraf = any(m["sisup"].strip() in ("Tabela 01", "Tabela I") for m in rows)

        for (tkv, tcls, tensao_kv, classe_kv) in TENSOES:
            for cond in CONDUTORES:
                base = resolve_rows(tcls, cond)
                # build poste options
                postes = []
                ref_label = None
                for (comp, resist) in POSTES:
                    label = f"DT-{comp}/{resist}"
                    if ref_label is None: ref_label = label
                    delta = {}
                    if has_poste:
                        pc = TAB_B.get(comp)
                        if pc:
                            delta[pc] = delta.get(pc, 0) + 1; used_codes.add(pc)
                    if has_paraf:
                        pf = PARAFUSO["1000"] if resist == "1000" else PARAFUSO["<=600"]
                        # parafuso qty from row
                        pq = 0
                        for m in rows:
                            if m["sisup"].strip() in ("Tabela 01", "Tabela I"):
                                pq += parse_int_qty(m["qtd"])
                        delta[pf] = delta.get(pf, 0) + (pq or 2); used_codes.add(pf)
                    postes.append({"poste": label, "delta": delta})
                # base_bom as code->qty
                bmap, conds = {}, []
                for it in base:
                    if it.get("condicional"):
                        conds.append(it)
                    elif it["codigo"]:
                        bmap[it["codigo"]] = bmap.get(it["codigo"], 0) + it["qtd"]
                # subtract poste-ref contribution into base (so base already at ref poste)
                ref_delta = postes[0]["delta"] if postes else {}
                for c, q in ref_delta.items():
                    bmap[c] = bmap.get(c, 0) + q
                postes_rel = []
                for p in postes:
                    d = {}
                    keys = set(p["delta"]) | set(ref_delta)
                    for k in keys:
                        diff = p["delta"].get(k, 0) - ref_delta.get(k, 0)
                        if abs(diff) > 1e-9: d[k] = diff
                    postes_rel.append({"poste": p["poste"], "delta": d})

                sid += 1
                fase_lbl = "Monofásico" if fases == 1 else "Trifásico"
                tkv_lbl = tkv.replace(".", ",")
                out_estr.append({
                    "id": f"R{sid}",
                    "norma_origem": "NDU 005",
                    "tipo": tipo + (f" — Cruzeta {cz}" if cz else ""),
                    "tipo_base": tipo,
                    "cruzeta": cz,
                    "condutor": COND_LABEL[cond],
                    "tensao_kv": tensao_kv,
                    "classe_tensao_kv": classe_kv,
                    "nominal_kv": tensao_kv,
                    "fases": fases,
                    "tipo_fase": tipo_fase,
                    "categoria": f"{fase_lbl} {tkv_lbl} kV — Rural (NDU 005)",
                    "poste_ref": ref_label,
                    "base_bom": {k: round(v, 3) for k, v in bmap.items() if v},
                    "postes": postes_rel,
                    "condicionais": conds,
                    "pagina_origem": f"NDU 005 p.{r['page']}",
                })

    # materials supplement: ensure every used code exists with a description
    mats = []
    for code in sorted(used_codes):
        desc = desc_by_code.get(code) or ANEXO_DESC.get(code) or norm_desc.get(code) or f"[NDU 005] material código {code}"
        unit = unit_by_code.get(code) or "pç"
        mats.append({"cod_sap": code, "descricao": desc, "unidade": unit, "origem": "NDU 005" if code not in desc_by_code else "SAP"})

    os.makedirs(APP, exist_ok=True)
    json.dump(out_estr, open(os.path.join(APP, "ndu005_estruturas.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(mats, open(os.path.join(APP, "ndu005_materiais.json"), "w", encoding="utf-8"), ensure_ascii=False)

    from collections import Counter
    print(f"rural estruturas geradas: {len(out_estr)}")
    print(f"códigos usados: {len(used_codes)} (novos s/ descrição no master: {sum(1 for c in used_codes if c not in desc_by_code)})")
    cats = Counter(e["categoria"] for e in out_estr)
    for c, n in sorted(cats.items()): print(f"   {c}: {n}")
    cl = Counter(x[1] for x in conditional_log)
    print("\nrefs mantidas como CONDICIONAIS (não inventadas):", dict(cl))

if __name__ == "__main__":
    main()
