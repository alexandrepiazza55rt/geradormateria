# Auditoria — Atualização de códigos de materiais

**Data:** 2026-06-13
**Planilha de origem:** `cde14322-LISTA_MATERIAL_INSPEC_A_O.xlsx` (aba **MATERIAL**, 340 linhas válidas)
**JSON atual:** `app/public/data/materiais.json` (301 materiais)
**JSON novo gerado:** `auditoria/materiais.novo.json` (mesmo arquivo, com cod_sap atualizado nos matches seguros)

> ⚠ O `materiais.json` oficial **NÃO foi tocado**. Para aplicar, basta substituir o arquivo pelo `materiais.novo.json` após sua revisão.

## Resumo

| Categoria | Quantidade | O que aconteceu |
| --- | --- | --- |
| ✅ Atualizado (cod_sap trocado) | 15 | Match exato pelo código antigo. cod_sap substituído pelo novo. |
| ⚪ Já atualizado | 46 | cod_sap já é o código novo. Nada a fazer. |
| ⚪ Inalterado (DE === COD) | 5 | Planilha diz que esse código não muda. |
| ⚠ Ambíguo (não mexido) | 1 | Mesmo código antigo aponta para múltiplos novos. Precisa decisão manual. |
| ❓ Sem match | 105 | cod_sap atual não aparece em nenhuma coluna da planilha. Nada inventado. |
| ⬜ Sem cod_sap | 129 | Material sem código SAP — não dá pra casar via código. |

**Total auditado:** 301 materiais.

---

## ✅ Atualizados (15)

cod_sap **antes** → **depois**. Descrição da PLANILHA mostrada para você conferir se bate com o material do sistema.

| id | Descrição (sistema) | Unid. | cod_sap antes | cod_sap depois | Descrição (planilha) |
| --- | --- | --- | --- | --- | --- |
| 4 | Alça pré formada de serviço para cabo triplex 10mm² | pç | 2879 | 90303 | ALCA PREF SERV CA/CAA 10MM² |
| 8 | Alça pré formada  de distribuição para cabo CA - CAA 1/0 AWG | pç | 2816 | 90307 | ALCA PREF DIS CA/CAA 1/0AWG |
| 13 | Armação secundaria 1x1 estribo | pç | 2965 | 90393 | ARM SEC AC1020 1ESTR 110X150MM |
| 28 | Cabo de aço galvanizado - 6,4mm² (cordoalha) | m | 2987 | 90255 | CORDOALHA ACO CARB CL A 7 FIOS MR 6,4MM 1430 DAN |
| 39 | Cartucho tipo bala para conector cunha (azul) | pç | 2898 | 90487 | CARTUCHO AZUL |
| 40 | Cartucho tipo bala para conector cunha (vermelho) | pç | 2900 | 90488 | CARTUCHO VERMELHO |
| 50 | Cinta circular de Ø 140 mm | pç | 3102 | 90214 | CINTA POSTE CIRC  140MM |
| 51 | Cinta circular de Ø 150 mm | pç | 2968 | 90230 | CINTA POSTE CIRC  150MM |
| 75 | CONECTOR CUNHA ESTRIBO NORMAL AL 1/0~2/0AWG EST2AWG | pç | 3058 | 90348 | ESTRIBO NORMAL AL 336,MCM 1/0AWG |
| 76 | CONECTOR CUNHA ESTRIBO NORMAL AL 3/0~4/0AWG EST2AWG | pç | 361 | 90347 | ESTRIBO NORMAL AL 3/0-4/0AWG EST2AWG |
| 80 | Conector derivação tipo cunha - AMP - tipo II | pç | 2919 | 90472 | CONECTOR TIPO II |
| 91 | CON CUNHA DER CN15 AL 9,2-14,5X9,2-14mm | pç | 178 | 90798 | CONECTOR CN15 |
| 184 | Parafuso de cabeça abaulada de 50 mm p/ poste circ | pç | 3081 | 90372 | PARAFUSO CAB ABAULADA AC 16X50MM |
| 185 | Parafuso de cabeça abaulada de 150 mm p/ poste circ | pç | 3083 | 90374 | PARAFUSO CAB ABAULADA AC 16X150MM |
| 200 | Placa de concreto | pç | 3018 | 90585 | PLACA CONCRETO |

---

## ⚠ Ambíguos — precisam de decisão manual (1)

O código antigo do sistema aparece em **mais de uma linha** da planilha apontando para códigos novos diferentes. Não fiz nada nesses — você decide.

### `#199` — Pino auto-travante AC 278,5mm para isolador pilar (pç)
- **cod_sap atual:** `2962`
- **Opções na planilha:**
  - 90622 (PINO ISOL AUTO TRAVANTE AÇO M20/M16 278,5MM)
  - 2962 (PINO ISOL AUTO TRAV. AC 16,0MM 28,5X 250X 278,5MM)

---

## ⚪ Já atualizados — nada a fazer (46)

O cod_sap atual já é o **código novo** da planilha. Confiram só por amostragem se a descrição bate.

| id | Descrição (sistema) | Unid. | cod_sap | Descrição (planilha) |
| --- | --- | --- | --- | --- |
| 14 | Arruela quadrada | pç | 90389 | ARRUELA QUAD AC1020 18X38X3MM |
| 16 | Cabo Aluminio quadriplex XLPE 10 mm² | m | 90285 | CABO QUADRUPLEX CA 10+10MM² (TRIFÁSICO) |
| 18 | Cabo Aluminio quadriplex XLPE 25 mm² | m | 90287 | CABO QUADRUPLEX CA 25+25MM²  (TRIFÁSICO) |
| 19 | Cabo Aluminio quadriplex XLPE 35 mm² | m | 90288 | CABO MULTIPLEXADO 35MM² |
| 23 | Cabo Aluminio triplex Xlpe 10 mm² | m | 90274 | CABO TRIPLEX CA 10+10MM²(BIFÁSICO) |
| 30 | Cabo de aluminio  nu 2 CAA - AWG | kg | 90258 | CABO AL NU CA 2 AWG |
| 31 | Cabo de aluminio  nu 1/0 CAA - AWG | kg | 90263 | CABO AL NU CAA 1/0 AWG |
| 32 | Cabo de aluminio  nu 4/0 CAA - AWG | kg | 90264 | CABO AL NU CAA 4/0AWG |
| 44 | CHAVE FUSIVEL RELIG DISTRIBUIÇÃO TR 15KV 100A 1F M | pç | 90549 | CHAVE FUSIVEL 3 OPERAÇÃO - 15KV |
| 45 | CHAVE FUSIVEL RELIG 24,2/36,2KV 100A 1F MAN SECO SIM 4,5KA 3 INT | pç | 90550 | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV |
| 56 | Cinta circular de Ø 200 mm | pç | 90219 | CINTA POSTE CIRC  200MM |
| 57 | Cinta circular de Ø 210 mm | pç | 90231 | CINTA POSTE CIRC  210MM |
| 58 | Cinta circular de Ø 220 mm | pç | 90220 | CINTA POSTE CIRC  220MM |
| 59 | Cinta circular de Ø 230 mm | pç | 90221 | CINTA POSTE CIRC  230MM |
| 60 | Cinta circular de Ø 240 mm | pç | 90222 | CINTA POSTE CIRC  240MM |
| 61 | Cinta circular de Ø 250 mm | pç | 90223 | CINTA POSTE CIRC  250MM |
| 62 | Cinta circular de Ø 260 mm | pç | 90232 | CINTA POSTE CIRC  260MM |
| 63 | Cinta circular de Ø 270 mm | pç | 90224 | CINTA POSTE CIRC  270MM |
| 66 | Cinta circular de Ø 300 mm | pç | 90226 | CINTA POSTE CIRC  300MM |
| 67 | Cinta circular de Ø 310 mm | pç | 90227 | CINTA POSTE CIRC  310MM |
| 68 | Cinta circular de Ø 320 mm | pç | 90228 | CINTA POSTE CIRC  320MM |
| 79 | CONECTOR CUNHA C-C COBRE 3,17-8,12/ 3,17-7,42mm CZ TP I | pç | 90471 | CONECTOR TIPO I |
| 81 | CONECTOR CUNHA C-C COBRE 2,54-6,55/ 1,27-4,65mm VM TP III | pç | 90473 | CONECTOR TIPO III |
| 82 | CONECTOR CUNHA C-C COBRE 2,54-6,55/ 1,27-4,65mm AZ TP IV | pç | 90474 | CONECTOR TIPO IV |
| 126 | Fio de cobre rígido isolado 6mm² para amarração em isolador pilar | m | 90508 | ELO FUSIVEL K 25 |
| 208 | Poste de concreto armada - 11/1000 DT | pç | 90196 | POSTE DT 11M 1000DAN |
| 222 | Poste de concreto armada circular- 11/1000 | pç | 90196 | POSTE DT 11M 1000DAN |
| 225 | Poste de concreto armada circular- 12/1000 | pç | 90187 | POSTE CIRCULAR 12M 1000DAN |
| 305 | Isolador Tipo Pilar Porcelana Vertical 15 kV | pç | 90253 | ISOLADOR PILAR PORC VERT S/GRP 300,0MM 15KV 800DAN |
| 306 | Pino Isolador Aço Carbono 16,0 mm Autotravante. | pç | 90252 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 85,0MM |
| 309 | Poste de Concreto Distribuição DT 11 m | pç | 90198 | POSTE DT 11M 300DAN |
| 312 | Poste de Concreto Distribuição DT 12 m | pç | 90202 | POSTE DT 12M 300DAN |
| 318 | Isolador Tipo Pilar Porcelana Vertical 36,2 kV | pç | 90580 | ISOLADOR PILAR PORC VERT 720 MM 35 KV 8000 DAN |
| 320 | Gancho Olhal 5.000 daN. | pç | 90448 | GANCHO OLHAL |
| 321 | Isolador Suspensão tipo Bastão 15 kV | pç | 90277 | ISOLADOR BASTAO SIL GO 15KV |
| 322 | Manilha Sapatilha 16,0mm 5.000 daN. | pç | 90440 | MANILHA SAPATILHA |
| 326 | Isolador Suspensão tipo Bastão 24,2 kV | pç | 90278 | ISOLADOR SUSP BASTÃO POLIM GARF-OLHAL 440MM 625MM 24,2KV |
| 327 | Isolador Suspensão tipo Bastão 36,2 kV | pç | 90279 | ISOLADOR BASTAO SIL GO 36KV |
| 330 | Pino para Isolador Tipo Cruzeta 15 kV | pç | 90249 | PINO ISOLADOR 150X 140X 294MM (ISOLADOR PORCELANA) |
| 333 | Cruzeta de Distribuição de Concreto Quadrada 2.000 mm (CA II) | pç | 90401 | CRUZETA CONCRETO 2000MM |
| 334 | Mão Francesa Perfilada Aço Carbono. | pç | 90442 | MAO FRANCESA PERFIL SAE 1020 38X 5X 1971MM |
| 341 | Parafuso de Distribuição Cabeça Abaulada M16 x 45 mm | pç | 90372 | PARAFUSO CAB ABAULADA AC 16X50MM |
| 346 | Armação Secundária. | pç | 90393 | ARM SEC AC1020 1ESTR 110X150MM |
| 347 | Isolador Roldana Porcelana Marrom. | pç | 90295 | ISOLADOR ROLDANA 80X76MM |
| 348 | Suporte Tipo T. | pç | 90654 | SUPORTE T 13,8KV |
| 353 | Capa Protetora para Bucha Primária de Transformador | pç | 90586 | PROTETOR DE BUCHA DE 15 KV |

---

## ⚪ Inalterados — código é o mesmo antes e depois (5)

A planilha lista esses códigos mas no campo `DE (CÓDIGO ANTIGO)` está o mesmo valor do `COD` (novo). Não há troca a fazer.

| id | Descrição (sistema) | Unid. | cod_sap | Descrição (planilha) |
| --- | --- | --- | --- | --- |
| 83 | CON CUNHA DER CN2 AL 15,2-17,3X11-17mm | pç | 159 | CONECTOR CN2 |
| 92 | CON CUNHA DER CN16 AL 16,9-18,3X11-14mm | pç | 161 | CONECTOR CN16 |
| 193 | Parafuso de rosca dupla de 650 mm | pç | 250 | PARAFUSO ROSCA DUPLA AC 16X650MM |
| 204 | Poste de concreto armada - 10/1000 DT | pç | 238 | POSTE DT 10M 1000DAN |
| 205 | Poste de concreto armada - 11/200 DT | pç | 3009 | POSTE DT 11M 200DAN |

---

## ❓ Sem match — cod_sap não aparece na planilha (105)

Esses materiais têm cod_sap cadastrado mas o código **não aparece nem como antigo nem como novo** na planilha. Pode ser:

- código de outro sistema/fornecedor;
- código errado;
- material foi removido do catálogo SAP.

**Não inventei nada** — listado para você revisar.

| id | Descrição | Unid. | cod_sap atual | cod_lider7 |
| --- | --- | --- | --- | --- |
| 1 | Afastador para isolador pilar | pç | 3752 |  |
| 3 | Alça pré-formada de estai p/ cabo de aço -7,9 mm | pç | 4239 | 3495 |
| 5 | Alça pré formada de serviço para cabo triplex 16mm² | pç | 116 | 3489 |
| 6 | Alça pré formada de serviço para cabo triplex 25mm² | pç | 2880 | 3490 |
| 7 | Alça pré formada  de distribuição para cabo CA - CAA 2 AWG | pç | 502815 | 3492 |
| 9 | Alça pré formada  de distribuição para cabo CA - CAA 4/0 AWG | pç | 3374 | 3494 |
| 11 | Alça pré formada para Fio Aluministeel N8 awg | pç | 2817 | 4244 |
| 12 | Arame aço galvanizado 14BWG | kg | 3054 | 3498 |
| 24 | Cabo Aluminio triplex Xlpe 16 mm² | m | 90282 | 3513 |
| 25 | Cabo Aluminio triplex Xlpe 25 mm² | m | 590283 | 3514 |
| 29 | Cabo de aço galvanizado - 7,9 mm² (cordoalha) | m | 3357 | 3517 |
| 33 | Cabo de aluminio  nu 336,4 CAA - AWG | kg | 621841 | 4513 |
| 34 | Cabo de cobre coberto com XLPE - 15kv 16mm² | m | 590294 | 3522 |
| 36 | Cabo de cobre flexivel isolado - 10mm² | m | 623945 | 3523 |
| 37 | Cabo de cobre nú 50mm² | m | 626275 |  |
| 41 | Chapa, fixação de estai, aço carbono zincado a quente | pç | 90517 | 4018 |
| 42 | Chave faca - tipo C-  15kV 630A-NBI 95KV | pç | 3454 | 3539 |
| 43 | Chave faca - tipo C-  36,2kV 400A-NBI 150KV | pç | 2808 | 4016 |
| 46 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A COM FERRAGEM | pç | 4157 | 4157 |
| 47 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A SEM FERRAGEM | pç | 4157 | 3537 |
| 48 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F COM FERRAGEM | pç | 615062 | 4158 |
| 49 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F SEM FERRAGEM | pç | 615062 | 3538 |
| 52 | Cinta circular de Ø 160 mm | pç | 590215 | 3542 |
| 53 | Cinta circular de Ø 170 mm | pç | 590216 | 3543 |
| 54 | Cinta circular de Ø 180 mm | pç | 590217 | 3544 |
| 55 | Cinta circular de Ø 190 mm | pç | 502972 | 3545 |
| 74 | CONECTOR CUNHA ESTRIBO NORMAL AL 4~2AWG EST2AWG | pç | 3166 | 3556 |
| 78 | Conector derivação para linha viva - 6-250 (GLV) | pç | 502940 | 3557 |
| 89 | Conector, cunha, liga de Alumínio, CN 13, série vermelho | pç | 502914 | 3555 |
| 97 | CRUZETA POSTE CONCR QUADR 90X90MM 2000MM | pç | 590401 | 3571 |
| 114 | Elo Fusível 10K | pç | 590504 | 3594 |
| 118 | Emenda Total Preformada CA - CAA 2 AWG | pç | 502929 | 3577 |
| 124 | Espaçador de isoladores | pç | 4092 |  |
| 130 | Gancho Olhal | pç | 590448 | 3603 |
| 134 | HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2400,0MM C/ RABICHO | pç | 503034 | 3982 |
| 136 | Isolador ancoragem - bastão polimérico 36kv | pç | 590279 | 3607 |
| 138 | Isolador pilar 36kv - 170kv | pç | 502944 | 3610 |
| 141 | Laço pré-formado de topo para cabo 2 AWG CAA | pç | 502948 | 3615 |
| 146 | Laço pré-formado simples lateral para cabo 2 AWG CAA | pç | 502952 | 3619 |
| 153 | Mão francesa plana de 619 mm | pç | 590443 | 3625 |
| 154 | Manilha sapatilha | pç | 590440 | 3623 |
| 161 | Olhal para parafuso | pç | 502955 | 3626 |
| 176 | Parafuso de cabeça quadrada - 125mm | pç | 590360 | 3632 |
| 179 | Parafuso de cabeça quadrada - 200mm | pç | 590362 | 3634 |
| 180 | Parafuso de cabeça quadrada - 250mm | pç | 590363 | 3635 |
| 181 | Parafuso de cabeça quadrada - 300mm | pç | 590364 | 3636 |
| 186 | Parafuso de cabeça abaulada de 200 mm p/ poste circ | pç | 3984 |  |
| 188 | Parafuso de rosca dupla de 400 mm | pç | 503014 | 3639 |
| 189 | Parafuso de rosca dupla de 450 mm | pç | 503013 | 3640 |
| 190 | Parafuso de rosca dupla de 500 mm | pç | 503015 | 3641 |
| 191 | Parafuso de rosca dupla de 550 mm | pç | 503016 | 3642 |
| 196 | Pino auto-travante AC 56,5mm para isolador pilar | pç | 502963 | 3648 |
| 197 | Pino auto-travante AC 168,5mm para isolador pilar | pç | 590251 | 3649 |
| 198 | Pino auto-travante AC 228,5mm para isolador pilar | pç | 502961 | 4194 |
| 201 | Poste de concreto armada - 10/150 DT | pç | 3008 | 4174 |
| 203 | Poste de concreto armada - 10/600 DT | pç | 2998 | 3712 |
| 206 | Poste de concreto armada - 11/300 DT | pç | 2999 | 3657 |
| 207 | Poste de concreto armada - 11/600 DT | pç | 3000 | 3658 |
| 235 | Sela para cruzeta | pç | 590410 | 3669 |
| 247 | Suporte ( chapa "T" ) para isolador tipo pilar | pç | 503021 | 3672 |
| 293 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 45KVA - 220/127V |  |
| 294 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 75KVA - 220/127V |  |
| 295 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO DE 112,5KVA - 220/127V | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR DE 112,5KVA - 220/127V |
| 296 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 220/127V | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 220/127V |
| 297 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 220/127V | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 220/127V |
| 298 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 300KVA - 220/127V |  |
| 299 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 45KVA - 380/220V |  |
| 300 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 75KVA - 380/220V |  |
| 301 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 112,5KVA - 380/220V |  |
| 302 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 150KVA - 380/220V |  |
| 303 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 225KVA - 380/220V |  |
| 304 |  |  | MATERIAIS PARA MEDIÇÃO COM MURETA EM TRANSFORMADOR TRIFÁSICO - 300KVA - 380/220V |  |
| 307 | Laço pré-formado de Distribuição CAA 2 AWG | pç | 90741 |  |
| 308 | Suporte P/Isolador Pilar. | pç | 90524 |  |
| 310 | Parafuso Rosca Total M16 x 200 mm | pç | 90375 |  |
| 311 | Parafuso Rosca Total M16 x 250 mm | pç | 90376 |  |
| 313 | Poste de Concreto Distribuição DT 13 m | pç | 90206 |  |
| 314 | Laço pré-formado de Distribuição CAA 1/0 AWG | pç | 90742 |  |
| 315 | Laço pré-formado de Distribuição CAA 4/0 AWG | pç | 90745 |  |
| 316 | Laço pré-formado de Distribuição CAA 336,4 MCM | pç | 90746 |  |
| 317 | Isolador Tipo Pilar Porcelana Vertical 24,2 kV | pç | 90254 |  |
| 319 | Alça pré-formada distribuição CAA 2 AWG | pç | 90707 |  |
| 323 | Porca Olhal M16 78,0 mm. | pç | 90387 |  |
| 324 | Alça pré-formada distribuição CAA 1/0 AWG | pç | 90708 |  |
| 325 | Alça pré-formada distribuição CAA 4/0 AWG | pç | 90711 |  |
| 328 | Porca Quadra Pesada Aço Carbono M16. | pç | 90388 |  |
| 329 | Cruzeta de Distribuição de Concreto T 1.900 mm (CA II) | pç | 90400 |  |
| 331 | Pino para Isolador Tipo Cruzeta 24,2/36,2 kV | pç | 90250 |  |
| 332 | Cruzeta de Distribuição de Concreto Retangular 2.400 mm (CA II) | pç | 90662 |  |
| 335 | Cruzeta de Distribuição de Concreto T 2.400 mm (CA II) | pç | 91384 |  |
| 336 | Arruela Quadrada 14,0 mm x32,0 mm x 3 mm. | pç | 90535 |  |
| 337 | Alca Pré-formada Cabo Aço Contra Poste 9,50mm. | pç | 90302 |  |
| 338 | Cordoalha Aço SM 9,5mm. | pç | 91714 |  |
| 339 | Sapatilha 3/8. | pç | 90409 |  |
| 340 | Cordoalha de Aço Carbono 9,5 mm | pç | 91716 |  |
| 342 | Parafuso de Distribuição Cabeça Abaulada M16 x 70 mm. | pç | 90373 |  |
| 343 | Pino Isolador Topo 419 mm. | pç | 90248 |  |
| 344 | Cruzeta de Eucalipto 5 metros. | pç | 691622 |  |
| 345 | Poste de Eucalipto 12 metros. | pç | 690903 |  |
| 349 | Conector Grampo de Linha-Viva com Estribo | pç | 92172 |  |
| 350 | Suporte Tipo L. | pç | 90521 |  |
| 351 | Suporte “TL”. | pç | 90655 |  |
| 352 | Condutor de Aço Cobreado 25 mm². | pç | 92024 |  |
| 354 | Capa Protetora de Para-Raios | pç | 90969 |  |
| 355 | Capa Protetora para Chaves Fusíveis | pç | 693918 |  |

---

## ⬜ Sem cod_sap — não foi possível casar via código (129)

Esses materiais não têm cod_sap cadastrado no sistema. Para esses só haveria como casar **por descrição** (fuzzy) — não fiz porque é arriscado. Se quiser, posso tentar match por descrição em uma segunda passada.

| id | Descrição | Unid. | cod_lider7 |
| --- | --- | --- | --- |
| 27 | Cabo Aluminio triplex Xlpe 50 mm² | m |  |
| 38 | Caixa tubo de concreto para aterramento de padrão | m | 4357 |
| 73 | Concreto para base em poste ≥ 600daN (Cimento, areia, brita e m.o) | und | 4085 |
| 84 | Conector, cunha, liga de Alumínio, CN 3, série azul | pç | 4294 |
| 85 | Conector, cunha, liga de Alumínio, CN 4, série azul | pç | 4104 |
| 86 | Conector, cunha, liga de Alumínio, CN 6, série azul | pç | 4133 |
| 87 | Conector, cunha, liga de Alumínio, CN 10, série azul | pç | 3553 |
| 93 | Conector perfurante 25-120 mm² X 25-120 mm² | pç | 3567 |
| 94 | Conector terminal tipo espada (bastão) para chave faca 336,4mcm | pç | 3965 |
| 95 | Conector de  Aterramento - 5/8" (reforçado) | pç | 3569 |
| 99 | Eletroduto de PVC rígido 12mm² x 300cm (1/2" x 3m) | pç | 3580 |
| 102 | Elo Fusível 0,50H | pç | 3585 |
| 104 | Elo Fusível 1H | pç | 3587 |
| 107 | Elo Fusível 2H | pç | 3590 |
| 109 | Elo Fusível 3H | pç | 3591 |
| 111 | Elo Fusível 5H | pç | 3592 |
| 112 | Elo Fusível 6K | pç | 3593 |
| 113 | Elo Fusível 12K | pç |  |
| 115 | Elo Fusível (CALCULAR CAPACIDADE) | pç |  |
| 122 | Emenda Total Preformada Fio Aluministeel N8 awg Convencional | pç |  |
| 125 | Fio Aluministeel N8 awg | kg | 4015 |
| 129 | Fita Isolante Preta 10mts | pç | 3601 |
| 131 | Haste âncora para estai | pç | 3980 |
| 132 | Haste de aterramento circular lisa 2400mm | pç | 3981 |
| 133 | Haste de aterramento circular prolongavel 2400mm | pç | 3605 |
| 135 | Isolador ancoragem - bastão polimérico 15kv | pç | 3606 |
| 137 | Isolador pilar 15kv - 110kv | pç | 3609 |
| 139 | Isolador pimentão | pç | 4182 |
| 140 | Isolador roldana 76x79mm | pç | 3613 |
| 142 | Laço pré-formado de topo para cabo 1/0 AWG CAA | pç | 3614 |
| 143 | Laço pré-formado de topo para cabo 4/0 AWG CAA | pç | 3617 |
| 145 | Laço pré-formado de topo para Fio  Aluministeel N8 Awg | pç |  |
| 147 | Laço pré-formado simples lateral para cabo 1/0 AWG CAA | pç | 3618 |
| 148 | Laço pré-formado simples lateral para cabo 4/0 AWG CAA | pç | 3621 |
| 150 | Laço pré-formado simples lateral para Fio  Aluministeel N8 Awg | pç | 4041 |
| 151 | Luva para haste para aterramento | pç | 3622 |
| 155 | Padrão Trifásico 40A. 10mm²  - 15kva - 220/127V. | pç | 4068 |
| 156 | Padrão Trifásico 70A. 16MM² -  30kva - 220/127V. | pç | 4069 |
| 157 | Padrão Trifásico 30A. 6mm²  - 15kva - 380/220V. | pç |  |
| 158 | Padrão Trifásico 50A. 10mm² -  30kva - 380/220V. | pç |  |
| 159 | Padrão Trifásico 70A. - 25mm² - trafo 45kva - 380/220v. | pç |  |
| 160 | Padrão Trifásico 120A. - 35mm² - Trafo 45kva - 220/127v. | pç |  |
| 162 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de Aço galvanizado | pç | 3627 |
| 163 | Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de Aço galvanizado | pç | 3628 |
| 164 | Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de Aço galvanizado | pç | 3629 |
| 165 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de Aço galvanizado | pç | 3630 |
| 166 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de concreto | pç | 4369 |
| 167 | Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de concreto | pç | 4370 |
| 168 | Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de concreto | pç |  |
| 169 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de concreto | pç | 4368 |
| 170 | Padrão bifásico rural 140 Amp., 50mm²,  37,5 kva, Poste de concreto | pç | 4494 |
| 177 | Parafuso de cabeça quadrada - 150mm | pç | 3633 |
| 178 | Parafuso de cabeça quadrada - 175mm | pç |  |
| 182 | Parafuso de cabeça quadrada - 350mm | pç | 3637 |
| 183 | Parafuso de cabeça quadrada - 400mm | pç |  |
| 187 | Parafuso de rosca dupla de 350 mm | pç | 3638 |
| 192 | Parafuso de rosca dupla de 600 mm | pç |  |
| 194 | Pára-raios de distribuição - 12kV - polimérico - 10kA | pç | 3645 |
| 195 | Pára-raios de distribuição - 30kV - polimérico - 10kA | pç | 3646 |
| 202 | Poste de concreto armada - 10/300 DT | pç | 4190 |
| 209 | Poste de concreto armada - 12/300 DT | pç | 3660 |
| 210 | Poste de concreto armada - 12/600 DT | pç | 3661 |
| 211 | Poste de concreto armada - 12/1000 DT | pç | 3659 |
| 212 | Poste de concreto armada - 13/300 DT | pç | 3958 |
| 213 | Poste de concreto armada - 13/600 DT | pç | 3958 |
| 214 | Poste de concreto armada - 13/1000 DT | pç | 4298 |
| 215 | Poste de concreto armada circular- 10/150 | pç | 4174 |
| 216 | Poste de concreto armada circular- 10/300 | pç | 4043 |
| 217 | Poste de concreto armada circular- 10/600 | pç | 3663 |
| 218 | Poste de concreto armada circular- 10/1000 | pç | 3662 |
| 219 | Poste de concreto armada circular- 11/200 | pç | 3656 |
| 220 | Poste de concreto armada circular- 11/300 | pç | 4044 |
| 221 | Poste de concreto armada circular- 11/600 | pç | 3665 |
| 223 | Poste de concreto armada circular- 12/300 | pç | 3660 |
| 224 | Poste de concreto armada circular- 12/600 | pç | 3661 |
| 229 | Protetor de bucha de AT de transformador | pç | 3666 |
| 233 | Sapatilha | pç | 4055 |
| 234 | Seccionador de cerca 900kg | pç | 3668 |
| 236 | Suporte de transformador em poste circular –Ø-210 mm | pç | 3670 |
| 237 | Suporte de transformador em poste circular –Ø-225 mm | pç | 3670 |
| 238 | Suporte de transformador em poste circular –Ø-250 mm | pç | 3670 |
| 240 | Suporte de transformador em poste circular –Ø-270 mm | pç | 3670 |
| 241 | Suporte de Transformador em poste DT | pç | 3671 |
| 244 | Suporte T para chave fusível 540mm | pç | 3673 |
| 245 | Suporte T para chave fusível 800mm | pç | 3674 |
| 246 | Suporte para isolador pilar em poste circular | pç | 4105 |
| 248 | Suporte TL para Chave Faca | pç | 4019 |
| 249 | Transformador monofásico - 13.8KV - 05KVA - 254/127V | pç | 3685 |
| 250 | Transformador monofásico - 34.5KV - 05KVA - 254/127V | pç | 4180 |
| 251 | Transformador monofásico - 13.8KV - 10KVA - 254/127V | pç | 3686 |
| 252 | Transformador monofásico - 34.5KV - 10KVA - 254/127V | pç | 3691 |
| 253 | Transformador monofásico - 13.8KV - 15KVA - 254/127V | pç | 3687 |
| 254 | Transformador monofásico - 34.5KV - 15KVA - 254/127V | pç | 4191 |
| 255 | Transformador monofásico - 13.8KV - 25KVA - 254/127V | pç | 3688 |
| 256 | Transformador monofásico - 34.5KV - 25KVA - 254/127V | pç | 3693 |
| 257 | Transformador monofásico - 13.8KV - 37,5KVA - 254/127V | pç | 3689 |
| 258 | Transformador monofásico - 34.5KV - 37,5KVA - 254/127V | pç | 3694 |
| 259 | Transformador Trifásico - 13.8KV - 15KVA - 220/127V | pç | 3697 |
| 260 | Transformador Trifásico - 34.5KV - 15KVA - 220/127V | pç | 3705 |
| 261 | Transformador Trifásico - 13.8KV - 30KVA  - 220/127V | pç | 3700 |
| 262 | Transformador Trifásico -  34.5KV - 30KVA  - 220/127V | pç | 3708 |
| 263 | Transformador Trifásico - 13.8KV - 45KVA  - 220/127V | pç | 3701 |
| 264 | Transformador Trifásico -  34.5KV - 45KVA  - 220/127V | pç | 3709 |
| 265 | Transformador Trifásico - 13.8KV - 75KVA  - 220/127V | pç | 3702 |
| 266 | Transformador Trifásico -  34.5KV - 75KVA  - 220/127V | pç | 3710 |
| 267 | Transformador Trifásico - 13.8KV - 112,5KVA  - 220/127V | pç | 3695 |
| 268 | Transformador Trifásico -  34.5KV - 112,5KVA  - 220/127V | pç | 3703 |
| 269 | Transformador Trifásico - 13.8KV - 150KVA  - 220/127V | pç | 3696 |
| 270 | Transformador Trifásico -  34.5KV - 150KVA  - 220/127V | pç | 3704 |
| 271 | Transformador Trifásico - 13.8KV - 225KVA  - 220/127V | pç | 3698 |
| 272 | Transformador Trifásico -  34.5KV - 225KVA  - 220/127V | pç | 3706 |
| 273 | Transformador Trifásico - 13.8KV - 300KVA  - 220/127V | pç | 3699 |
| 274 | Transformador Trifásico -  34.5KV - 300KVA  - 220/127V | pç | 3707 |
| 275 | Transformador Trifásico - 13.8KV - 15KVA - 380/220V | pç |  |
| 276 | Transformador Trifásico -  34.5KV - 15KVA - 380/220V | pç |  |
| 277 | Transformador Trifásico - 13.8KV - 30KVA - 380/220V | pç |  |
| 278 | Transformador Trifásico -  34.5KV - 30KVA - 380/220V | pç |  |
| 279 | Transformador Trifásico - 13.8KV - 45KVA - 380/220V | pç |  |
| 280 | Transformador Trifásico -  34.5KV - 45KVA - 380/220V | pç | 4282 |
| 281 | Transformador Trifásico - 13.8KV - 75KVA - 380/220V | pç |  |
| 282 | Transformador Trifásico -  34.5KV - 75KVA - 380/220V | pç | 4284 |
| 283 | Transformador Trifásico - 13.8KV - 112,5KVA - 380/220V | pç | 4126 |
| 284 | Transformador Trifásico -  34.5KV - 112,5KVA - 380/220V | pç | 3711 |
| 285 | Transformador Trifásico - 13.8KV - 150KVA - 380/220V | pç | 4160 |
| 286 | Transformador Trifásico -  34.5KV - 150KVA - 380/220V | pç | 4164 |
| 287 | Transformador Trifásico - 13.8KV - 225KVA - 380/220V | pç | 4242 |
| 288 | Transformador Trifásico -  34.5KV - 225KVA - 380/220V | pç | 4159 |
| 289 | Transformador Trifásico - 13.8KV - 300KVA - 380/220V | pç |  |
| 290 | Transformador Trifásico -  34.5KV - 300KVA - 380/220V | pç |  |

---

## 📋 Linhas da planilha sem correspondência no sistema (226)

Materiais que existem na planilha mas o sistema **não usa nenhuma das versões** (nem antigo nem novo). Só para referência — provavelmente é a maior parte do catálogo SAP que o gerador não consome.

<details><summary>Expandir lista (226 itens)</summary>

| cod antigo | cod novo | Descrição (planilha) | Unid. |
| --- | --- | --- | --- |
| 2883 | 90301 | ALCA PREF CONTRA POSTE 6,4MM HS/SM | PC |
| 2882 | 90012 | ALCA PREFORMADA CABO ACO STD 7,94MM  890,0MM | PC |
| 120 | 90013 | ALCA PREFORMADA CABO ACO STD 9,53MM 965,0MM | PC |
| 113 | 113 | ALCA PREF DIS CA/CAA 2/0AWG | PC |
| 2815 | 2815 | ALCA PREF DIS CA/CAA 2AWG | PC |
| 3158 | 90309 | ALCA PREF DIS CA/CAA 336,4MCM | PC |
| 122 | 90308 | ALCA PREF DIS CA/CAA 4/0AWG | PC |
| 115 | 90305 | ALCA PREF DIS CA/CAA 4AWG | PC |
| 2814 | 90952 | ALCA PREF DIS CA/CAA 6AWG | PC |
| 121 | 121 | ALCA PREF ESTAI 6,4MM | PC |
| 123 | 90537 | ANEL AMAR SIL ESP LOS/VERT 45X90X140MM | PC |
| 124 | 90538 | ANEL AMAR SIL ISOL PINO 50X110X160MM | PC |
| 2966 | 2966 | ARM SEC AC1020 2ESTR 310X325MM | PC |
| 3615 | 90540 | BRACO ANTIBAL PA 15,0KV 180DAN 320MM | PC |
| 125 | 90540 | BRACO ANTIBAL PEAD 15,0KV 100DAN 305MM | PC |
| 2884 | 90542 | BRACO SUPORTE TIPO C FOFO 15,0KV | PC |
| 3886 | 90536 | BRACO SUPORTE TIPO J | PC |
| 2885 | 90544 | BRACO SUPORTE TIPO L FOFO 15 KV | PC |
| 2895 | 90283 | CABO TRIPLEX CA 25+25MM²(BIFÁSICO) | M |
| 130 | 130 | CABO AL NU CA 2/0AWG | KG |
| 13 | 13 | CABO AL NU CA 4 AWG | KG |
| 133 | 90260 | CABO AL NU CA 4/0AWG | KG |
| 127 | 127 | CABO AL NU CAA 2/0AWG | KG |
| 129 | 90560 | CABO AL NU CAA 4 AWG | KG |
| 2887 | 2887 | CABO AL PROT CA 150MM² (COMPACTA) | M |
| 2886 | 2886 | CABO AL PROT CA 35MM² (COMPACTA) | M |
| 126 | 126 | CABO AL PROT CA 95MM² (COMPACTA) | M |
| 3099 | 91462 | CABO CU MOLE 120MM² (BARRAMENTO TRAFO) | M |
| 447 | 447 | CABO CU MOLE 70MM²  (BARRAMENTO TRAFO) | M |
| 628230 | 628230 | CAPA CONECTOR CUNHA 15KV SERIE AZ | PC |
| 628231 | 628231 | CAPA CONECTOR CUNHA 15KV SERIE AZ C/EST | PC |
| 4475 | 4475 | CAPA CONECTOR CUNHA 15KV SERIE VM | PC |
| 626351 | 690229 | CAPACITOR POT MON 15KV 100KVAR | PC |
| 629492 | 629492 | CAPACITOR POT MON 15KV 50KVAR | PC |
| 605063 | 690225 | CAPACITOR POT MON 36.2KV 100KVAR | PC |
| 154 | 90486 | CARTUCHO AMARELO | PC |
| 2967 | 90518 | CHAPA ESTAI ACO 8X60X70X76MM 45º | PC |
| 78 | 90548 | CHAVE FUSIVEL 36,2KV | PC |
| 2969 | 90215 | CINTA POSTE CIRC  160MM | PC |
| 2970 | 90216 | CINTA POSTE CIRC  170MM | PC |
| 2971 | 90217 | CINTA POSTE CIRC  180MM | PC |
| 2972 | 90218 | CINTA POSTE CIRC  190MM | PC |
| 2979 | 90225 | CINTA POSTE CIRC  280MM | PC |
| 2980 | 90233 | CINTA POSTE CIRC  290MM | PC |
| 221 | 90234 | CINTA POSTE CIRC  330MM | PC |
| 2984 | 90235 | CINTA POSTE CIRC  340MM | PC |
| 2985 | 90236 | CINTA POSTE CIRC  350MM | PC |
| 2986 | 90237 | CINTA POSTE CIRC  360MM | PC |
| 160 | 90113 | CONECTOR CN1 | PC |
| 2904 | 90799 | CONECTOR CN3 | PC |
| 2917 | 2917 | CONECTOR CN4 | PC |
| 3352 | 3352 | CONECTOR CN5 | PC |
| 2916 | 90790 | CONECTOR CN6 | PC |
| 4274 | 2909 | CONECTOR CN7 | PC |
| 4009 | 4009 | CONECTOR CN8 | PC |
| 4147 | 90114 | CONECTOR CN9 | PC |
| 2915 | 90791 | CONECTOR CN10 | PC |
| 3838 | 3838 | CONECTOR CN11 | PC |
| 174 | 174 | CONECTOR CN12 | PC |
| 2914 | 90797 | CONECTOR CN13 | PC |
| 177 | 90788 | CONECTOR CN14 | PC |
| 162 | 162 | CONECTOR CN17 | PC |
| 2905 | 2905 | CONECTOR CN18 | PC |
| 184 | 184 | CONECTOR TIPO D | PC |
| 32864 | 90475 | CONECTOR TIPO V | PC |
| 32915 | 90476 | CONECTOR TIPO VI | PC |
| 32865 | 90477 | CONECTOR TIPO VII | PC |
| 185 | 185 | CONECTOR PERFURANTE 1,5-10-10X70MM² (IP) | PC |
| 2923 | 2923 | CONECTOR PERFURANTE 16-95-1,5X10MM² (RAMAL) | PC |
| 2922 | 90353 | CONECTOR PERFURANTE 25X120MM² (BT) | PC |
| 2924 | 2924 | CONECTOR PERFURANTE 4-35-16X120MM² (BT) | PC |
| 629189 | 629189 | CONECTOR PERFURANTE 50-150MM² (BT) | PC |
| 2925 | 90357 | CONECTOR PERFURANTE 70X240MM2 (BARRAMENTO) | PC |
| 3173 | 3173 | CONECTOR ATER CUN CU 5/8"X1/4" | PC |
| 2902 | 90490 | CONECTOR ATER CUN CU HT14.3MM/CB 6-25MM2 | PC |
| 3032 | 3032 | CONECTOR ATER CUN CU HT14.3MM/CB25-35MM2 | PC |
| 3227 | 3227 | CONECTOR ATER CUN INOX HT 5/8"/CB4-2A | PC |
| 222 | 90256 | CORDOALHA ACO CARB CL A 7 FIOS MR 9,5MM 6160 DAN | M |
| 630253 | 630253 | CORDOALHA ACO ZINCADO FORMACAO 3X2,25MM | M |
| 2988 | 2988 | CRUZETA MADEIRA 90X110X2400MM | PC |
| 464 | 90404 | CRUZETA POSTE PRFV RETANG 90X112,5MM 2400MM 400 DAN | PC |
| 465 | 90573 | CRUZETA POLIMÉRICA OCA 3500MM | PC |
| 501 | 90574 | CRUZETA POLIMÉRICA OCA 5000MM | PC |
| 3060 | 3060 | ELO FUSIVEL H 0,25 | PC |
| 3061 | 90497 | ELO FUSIVEL H 0,5 | PC |
| 3062 | 3062 | ELO FUSIVEL H 0,75 | PC |
| 3064 | 3064 | ELO FUSIVEL H 1,25 | PC |
| 3065 | 3065 | ELO FUSIVEL H 1,75 | PC |
| 3063 | 90498 | ELO FUSIVEL H 1 | PC |
| 3066 | 90499 | ELO FUSIVEL H 2 | PC |
| 3067 | 90500 | ELO FUSIVEL H 3 | PC |
| 3068 | 90501 | ELO FUSIVEL H 5 | PC |
| 369 | 90502 | ELO FUSIVEL K 6 | PC |
| 3069 | 90504 | ELO FUSIVEL K 10 | PC |
| 3070 | 90506 | ELO FUSIVEL K 15 | PC |
| 368 | 90510 | ELO FUSIVEL K 40 | PC |
| 4166 | 4166 | EMENDA PREF CON CABO ACO 3X2,25MM | PC |
| 192 | 90428 | EMENDA PARA CABO CA 4AWG | PC |
| 190 | 90429 | EMENDA PARA CABO CA 2AWG | PC |
| 189 | 90430 | EMENDA PARA CABO CA 1/0AWG | PC |
| 2927 | 90437 | EMENDA PARA CABO CA 2/0AWG | PC |
| 193 | 90432 | EMENDA PARA CABO CA 4/0AWG | PC |
| 191 | 90433 | EMENDA PARA CABO CA 336,4MCM | PC |
| 2930 | 2930 | EMENDA PARA CABO CAZ 8AWG | PC |
| 196 | 90434 | EMENDA PARA CABO CAA 4AWG | PC |
| 199 | 199 | EMENDA PARA CABO CAA 6AWG | PC |
| 2929 | 90429 | EMENDA PARA CABO CAA 2AWG | PC |
| 2928 | 90430 | EMENDA PARA CABO CAA 1/0AWG | PC |
| 3802 | 3802 | EMENDA PARA CABO CAA 2/0AWG | PC |
| 197 | 90438 | EMENDA PARA CABO CAA 4/0AWG | PC |
| 1036 | 90567 | ESPACADOR LOSANGULAR 3 COND AUTOTRAV 15KV 340X460MM | PC |
| 756 | 90406 | ESPACADOR LOSANGULAR 3 COND ANEL 15KV (CABO 50 A 185MM) | PC |
| 757 | 757 | ESPAC VERTICAL 15KV 12-32MM C/ AMARRACAO | PC |
| 3057 | 3057 | ESTRIBO NORMAL AL 1/0-2/0AWG EST2AWG | PC |
| 3059 | 90345 | ESTRIBO NORMAL AL 4-2AWG EST2AWG | PC |
| 374 | 90660 | FECHO FITA MET AISI304 1,2X18X24MM | PC |
| 2935 | 2935 | FIO AMARRAC NU 4AWG | KG |
| 376 | 90661 | FITA AMARR LISA AISI430 0,5X19MM 30M | UN. |
| 2940 | 90460 | GRAMPO LINHA VIVA | PC |
| 201 | 201 | GRAMPO ANCORAGEM DIELETRICO ALUMINIO 20-22MM 1000DAN | PC |
| 202 | 202 | GRAMPO ANC CABO COBERTO 12-14 MM | PC |
| 3942 | 90449 | GRAMPO ANC CABO COBERTO 14-16 MM | PC |
| 2941 | 90514 | HASTE ANCORA ACO 16X2400MM 5000 | PC |
| 3034 | 90462 | HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2,4M C/ RABICHO | PC |
| 3097 | 90638 | HASTE ATERRAMENTO PROLONGADA 5/8" 2,4M | PC |
| 3035 | 90462 | HASTE ATERRAMENTO NORMAL 5/8" 2,4M | PC |
| 2947 | 2947 | ISOLADOR DISCO POR G-OLHAL 152MM | PC |
| 207 | 90275 | ISOLADOR PINO POLIMERICO 15KV P60MM (COMPACTA) | PC |
| 208 | 208 | ISOLADOR PINO POR 15KV P57MM | PC |
| 3999 | 3999 | ISOLADOR PINO POR 34,5KV P102MM | PC |
| 4285 | 4285 | LACO PREF LATERAL CAA 4AWG P60MM | PC |
| 2952 | 90328 | LACO PREF LATERAL CA/CAA 2AWG P60MM | PC |
| 2953 | 2953 | LACO PREF LATERAL CA/CAA 1/0AWG P60MM | PC |
| 2951 | 90330 | LACO PREF LATERAL CA/CAA 4/0AWG P60MM | PC |
| 212 | 212 | LACO PREF TOPO CAA 4AWG P60MM | PC |
| 2948 | 90318 | LACO PREF TOPO CA/CAA 2AWG P60MM | PC |
| 660776 | 37628 | LACO PREF TOPO CA/CAA 2/0AWG P60MM | PC |
| 211 | 90320 | LACO PREF TOPO CA/CAA 4/0AWG P60MM | PC |
| 3887 | 3887 | LUVA EMENDA HASTE ATERRAMENTO PROLONGADA | PC |
| 3010 | 90441 | MAO FRANCESA PERFILADA AC 1534X38X5MM | PC |
| 248 | 90445 | MAO FRANCESA PLANA AC 1053X32X5MM | PC |
| 3011 | 90443 | MAO FRANCESA PLANA AC 619X32X5MM | PC |
| 249 | 249 | MAO FRANC PLANA AC 723X32X5MM | PC |
| 2955 | 90446 | OLHAL PARAF AÇO FORJ M16 16,0MM 5000DAN | PC |
| 2956 | 90210 | PARA RAIO DISTR POLIM 13,8KV 10KA | PC |
| 3030 | 90212 | PARA RAIO DISTR POLIM 30KV 10KA | PC |
| 3084 | 90360 | PARAFUSO CAB QUADRADA AC 16X125MM | PC |
| 3085 | 90361 | PARAFUSO CAB QUADRADA AC 16X150MM | PC |
| 3086 | 90362 | PARAFUSO CAB QUADRADA AC 16X200MM | PC |
| 3087 | 90363 | PARAFUSO CAB QUADRADA AC 16X250MM | PC |
| 3088 | 90364 | PARAFUSO CAB QUADRADA AC 16X300MM | PC |
| 3089 | 90365 | PARAFUSO CAB QUADRADA AC 16X350MM | PC |
| 3092 | 90366 | PARAFUSO CAB QUADRADA AC 16X400MM | PC |
| 3090 | 90367 | PARAFUSO CAB QUADRADA AC 16X450MM | PC |
| 3091 | 90368 | PARAFUSO CAB QUADRADA AC 16X500MM | PC |
| 398 | 90369 | PARAFUSO CAB QUADRADA AC 16X550MM | PC |
| 399 | 90381 | PARAFUSO CAB QUADRADA AC 16X600MM | PC |
| 3362 | 90370 | PARAFUSO CAB QUADRADA AC 16X650MM | PC |
| 624975 | 90371 | PARAFUSO CAB QUADRADA AC 16X700MM | PC |
| 4336 | 90377 | PARAFUSO ROSCA DUPLA AC 16X300MM | PC |
| 3012 | 90378 | PARAFUSO ROSCA DUPLA AC 16X350MM | PC |
| 3014 | 90379 | PARAFUSO ROSCA DUPLA AC 16X400MM | PC |
| 3013 | 3013 | PARAFUSO ROSCA DUPLA AC 16X450MM | PC |
| 3015 | 3015 | PARAFUSO ROSCA DUPLA AC 16X500MM | PC |
| 3016 | 3016 | PARAFUSO ROSCA DUPLA AC 16X550MM | PC |
| 3017 | 3017 | PARAFUSO ROSCA DUPLA AC 16X600MM | PC |
| 3643 | 3643 | PARAFUSO ROSCA DUPLA AC 16X700MM | PC |
| 670222 | 3017 | PARAFUSO ROSCA DUPLA AC 16X750MM | PC |
| 2960 | 90251 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 168,5MM | PC |
| 2961 | 90621 | PINO ISOL AUTO TRAVANTE AÇO M20/M16 228,5MM | PC |
| 2960 | 90251 | PINO ISOL AUTO TRAV. AC 16,0MM 28,5X 140X 168,5MM | PC |
| 2963 | 2963 | PINO ISOL AUTO TRAV. AC 16,0MM 28,5X 38X 66,5MM | PC |
| 2958 | 2958 | PINO ISOLADOR 150X 38X 192MM (ISOLADOR POLIMERICO) | PC |
| 2989 | 2989 | POSTE CIRCULAR 10M 150DAN | PC |
| 227 | 227 | POSTE CIRCULAR 10M 300DAN | PC |
| 2995 | 2995 | POSTE CIRCULAR 10M 1000DAN | PC |
| 2990 | 2990 | POSTE CIRCULAR 11M 200DAN | PC |
| 2991 | 2991 | POSTE CIRCULAR 11M 300DAN | PC |
| 228 | 228 | POSTE CIRCULAR 12M 300DAN | PC |
| 670112 | 670112 | POSTE MADEIRA LEI 10M 300DAN MEDIO | PC |
| 670114 | 670114 | POSTE MADEIRA LEI 11M 300DAN MEDIO | PC |
| 234 | 234 | POSTE POLIMERICO FBV 10M 300DAN | PC |
| 690001 | 690001 | RELIGADOR 15KV 630A 12,5KA 127VCA REDE | PC |
| 690005 | 690005 | RELIGADOR 36,2KV 630A 12,5KA 127VCA REDE | PC |
| 2964 | 2964 | SAPATILHA | PC |
| 4296 | 4296 | SECCION PREF CERCA 2,5-3MM AR FARP | PC |
| 3824 | 4296 | SECCION PREF CERCA 2,5-3MM AR LISO | PC |
| 3094 | 3029 | SECCION PREF CERCA 2,60-3MM AR LISO | PC |
| 3019 | 90411 | SELA PARA CRUZETA | PC |
| 461 | 461 | SEPARADOR CABO POLIETILENO 150KV 6AWG-336,4MCM 750MM | PÇ |
| 630056 | 630056 | SUPORTE TRAFO POSTE CIRC SAE1020 180MM | PC |
| 630419 | 630419 | SUPORTE TRAFO POSTE CIRC SAE1020 200MM | PC |
| 3036 | 90425 | SUPORTE TRAFO POSTE CIRC SAE1020 210MM | PC |
| 3037 | 5363 | SUPORTE TRAFO POSTE CIRC SAE1020 225MM | PC |
| 3038 | 90427 | SUPORTE TRAFO POSTE CIRC SAE1020 230MM | PC |
| 312 | 312 | SUPORTE TRAFO POSTE CIRC SAE1020 240MM | PC |
| 313 | 90530 | SUPORTE TRAFO POSTE CIRC SAE1020 250MM | PC |
| 3039 | 3039 | SUPORTE TRAFO POSTE CIRC SAE1020 255MM | PC |
| 3040 | 90532 | SUPORTE TRAFO POSTE CIRC SAE1020 270MM | PC |
| 314 | 90533 | SUPORTE TRAFO POSTE CIRC SAE1020 285MM | PC |
| 3041 | 90423 | SUPORTE PARA TRAFO POSTE DT 360X76MM | PC |
| 3021 | 90525 | SUPORTE L ISOLADOR PILAR 34,5KV | PC |
| 252 | 252 | SUPORTE L ISOLADOR PILAR 13,8KV | PC |
| 3146 | 3146 | TERMINAL ESPADA 2F 336,4MCM | PC |
| 95 | 95 | TERMINAL ESPADA 2F 4/0AWG | PC |
| 3042 | 90094 | TRAFO MONOFÁSICO15KV 10KVA | UN. |
| 3044 | 90095 | TRAFO MONOFÁSICO15KV 15KVA | UN. |
| 3046 | 90096 | TRAFO MONOFÁSICO15KV 25KVA | UN. |
| 3048 | 90097 | TRAFO MONOFÁSICO15KV 5KVA | UN. |
| 3043 | 90064 | TRAFO MONOFÁSICO36KV 10KVA | UN. |
| 3045 | 90065 | TRAFO MONOFÁSICO36KV 15KVA | UN. |
| 3047 | 90066 | TRAFO MONOFÁSICO36KV 25KVA | UN. |
| 3049 | 3049 | TRAFO MONOFÁSICO36KV 5KVA | UN. |
| 317 | 90048 | TRAFO TRIFÁSICO 15KV 112,5KVA | UN. |
| 324 | 90049 | TRAFO TRIFÁSICO 15KV 150KVA | UN. |
| 324 | 90049 | TRAFO TRIFÁSICO 15KV 150KVA | UN. |
| 322 | 90050 | TRAFO TRIFÁSICO 15KV 15KVA | UN. |
| 328 | 90051 | TRAFO TRIFÁSICO 15KV 225KVA | UN. |
| 3050 | 90053 | TRAFO TRIFÁSICO 15KV 30KVA | UN. |
| 336 | 90054 | TRAFO TRIFÁSICO 15KV 45KVA | UN. |
| 3052 | 90055 | TRAFO TRIFÁSICO 15KV 75KVA | UN. |
| 319 | 90078 | TRAFO TRIFÁSICO 36KV 112,5KVA | UN. |
| 323 | 90080 | TRAFO TRIFÁSICO 36KV 15KVA | UN. |
| 331 | 90081 | TRAFO TRIFÁSICO 36KV 30KVA | UN. |
| 3051 | 90082 | TRAFO TRIFÁSICO 36KV 45KVA | UN. |
| 341 | 90083 | TRAFO TRIFÁSICO 36KV 75KVA | UN. |

</details>
