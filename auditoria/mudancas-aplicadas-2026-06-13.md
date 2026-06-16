# Auditoria final — Mudanças aplicadas ao materiais.novo.json

**Data:** 2026-06-13
**Decisão do dono:** aceitar todos os matches altos e médios por descrição, além dos matches exatos por código.
**Arquivo gerado:** `auditoria/materiais.novo.json` (NÃO substituiu o oficial).
**Para aplicar de verdade:** substituir `app/public/data/materiais.json` por este arquivo após sua revisão final.

## Resumo

| Origem | Quantidade |
| --- | ---: |
| 🔵 Código exato (DE → COD) | 15 |
| 🟢 Descrição — alta confiança (≥ 0,75) | 17 |
| 🟡 Descrição — média confiança (0,55–0,75) | 93 |
| **Total alterado** | **125** |
| Não mexidos (baixa/sem candidato/ambíguo) | 125 |

---

## 🔵 Código exato (15)

Match exato pelo `DE (CÓDIGO ANTIGO)` da aba MATERIAL.

| id | descrição sistema | unid | cod antes | cod depois | descrição planilha |
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

## 🟢 Descrição — alta confiança (17)

Score ≥ 0,75. Quase certeza de match correto.

| id | descrição sistema | unid | cod antes | cod depois | score | fonte | descrição planilha |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | Cabo de cobre coberto com XLPE - 15kv 16mm² | m | 590294 | 90294 | 0.84 | MATERIAL | CABO XLPE CU 16MM² 15KV |
| 42 | Chave faca - tipo C-  15kV 630A-NBI 95KV | pç | 3454 | 90554 | 0.76 | MATERIAL | CHAVE FACA 15KV 630A |
| 43 | Chave faca - tipo C-  36,2kV 400A-NBI 150KV | pç | 2808 | 90553 | 0.80 | MATERIAL | CHAVE FACA 36,2KV 400A |
| 74 | CONECTOR CUNHA ESTRIBO NORMAL AL 4~2AWG EST2AWG | pç | 3166 | 90345 | 0.77 | MATERIAL | ESTRIBO NORMAL AL 4-2AWG EST2AWG |
| 130 | Gancho Olhal | pç | 590448 | 90448 | 1.00 | MATERIAL | GANCHO OLHAL |
| 135 | Isolador ancoragem - bastão polimérico 15kv | pç | _(vazio)_ | 90277 | 0.76 | MATERIAL | ISOLADOR BASTAO SIL GO 15KV |
| 136 | Isolador ancoragem - bastão polimérico 36kv | pç | 590279 | 90279 | 0.76 | MATERIAL | ISOLADOR BASTAO SIL GO 36KV |
| 142 | Laço pré-formado de topo para cabo 1/0 AWG CAA | pç | _(vazio)_ | 90263 | 0.78 | MATERIAL | CABO AL NU CAA 1/0 AWG |
| 147 | Laço pré-formado simples lateral para cabo 1/0 AWG CAA | pç | _(vazio)_ | 90263 | 0.75 | MATERIAL | CABO AL NU CAA 1/0 AWG |
| 151 | Luva para haste para aterramento | pç | _(vazio)_ | 3887 | 0.85 | MATERIAL | LUVA EMENDA HASTE ATERRAMENTO PROLONGADA |
| 154 | Manilha sapatilha | pç | 590440 | 90440 | 1.00 | MATERIAL | MANILHA SAPATILHA |
| 161 | Olhal para parafuso | pç | 502955 | 1882 | 0.80 | Banco_Dados | GRAMPO DE ATER PARAFUSO OLHAL |
| 233 | Sapatilha | pç | _(vazio)_ | 2964 | 1.00 | MATERIAL | SAPATILHA |
| 235 | Sela para cruzeta | pç | 590410 | 90411 | 1.00 | MATERIAL | SELA PARA CRUZETA |
| 343 | Pino Isolador Topo 419 mm. | pç | 90248 | 1945 | 0.80 | Banco_Dados | ISOLADOR DE PINO ALTURA DE 419 |
| 349 | Conector Grampo de Linha-Viva com Estribo | pç | 92172 | 90460 | 0.85 | MATERIAL | GRAMPO LINHA VIVA |
| 350 | Suporte Tipo L. | pç | 90521 | 1881 | 0.88 | Banco_Dados | GRAMPO COM SUPORTE TIPO L |

---

## 🟡 Descrição — média confiança (93)

Score 0,55–0,75. Provável match; reveja os de score mais baixo para confirmar.

| id | descrição sistema | unid | cod antes | cod depois | score | fonte | descrição planilha |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Afastador para isolador pilar | pç | 3752 | 1308 | 0.60 | Banco_Dados | COBERTURA PROTETORA P ISOLADOR |
| 3 | Alça pré-formada de estai p/ cabo de aço -7,9 mm | pç | 4239 | 996 | 0.56 | Banco_Dados | CHAVE DE SEGURANCA COM PERFIL LOBULAR 7,9 |
| 6 | Alça pré formada de serviço para cabo triplex 25mm² | pç | 2880 | 90283 | 0.60 | MATERIAL | CABO TRIPLEX CA 25+25MM²(BIFÁSICO) |
| 7 | Alça pré formada  de distribuição para cabo CA - CAA 2 AWG | pç | 502815 | 90258 | 0.72 | MATERIAL | CABO AL NU CA 2 AWG |
| 9 | Alça pré formada  de distribuição para cabo CA - CAA 4/0 AWG | pç | 3374 | 90308 | 0.68 | MATERIAL | ALCA PREF DIS CA/CAA 4/0AWG |
| 25 | Cabo Aluminio triplex Xlpe 25 mm² | m | 590283 | 90283 | 0.62 | MATERIAL | CABO TRIPLEX CA 25+25MM²(BIFÁSICO) |
| 29 | Cabo de aço galvanizado - 7,9 mm² (cordoalha) | m | 3357 | 996 | 0.58 | Banco_Dados | CHAVE DE SEGURANCA COM PERFIL LOBULAR 7,9 |
| 33 | Cabo de aluminio  nu 336,4 CAA - AWG | kg | 621841 | 90560 | 0.73 | MATERIAL | CABO AL NU CAA 4 AWG |
| 37 | Cabo de cobre nú 50mm² | m | 626275 | 90266 | 0.64 | MATERIAL | CABO AL PROT CA 50MM² (COMPACTA) |
| 38 | Caixa tubo de concreto para aterramento de padrão | m | _(vazio)_ | 90585 | 0.57 | MATERIAL | PLACA CONCRETO |
| 48 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F COM FERRAGEM | pç | 615062 | 90550 | 0.69 | MATERIAL | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV |
| 49 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 36,2KV 300A 3F SEM FERRAGEM | pç | 615062 | 90550 | 0.69 | MATERIAL | CHAVE FUSIVEL 3 OPERAÇÃO -  36,2KV |
| 54 | Cinta circular de Ø 180 mm | pç | 590217 | 2146 | 0.55 | Banco_Dados | LIXA PARA FERRO 180 |
| 93 | Conector perfurante 25-120 mm² X 25-120 mm² | pç | _(vazio)_ | 90353 | 0.64 | MATERIAL | CONECTOR PERFURANTE 25X120MM² (BT) |
| 94 | Conector terminal tipo espada (bastão) para chave faca 336,4mcm | pç | _(vazio)_ | 3146 | 0.69 | MATERIAL | TERMINAL ESPADA 2F 336,4MCM |
| 95 | Conector de  Aterramento - 5/8" (reforçado) | pç | _(vazio)_ | 90638 | 0.57 | MATERIAL | HASTE ATERRAMENTO PROLONGADA 5/8" 2,4M |
| 99 | Eletroduto de PVC rígido 12mm² x 300cm (1/2" x 3m) | pç | _(vazio)_ | 35797 | 0.60 | MATERIAL | ELETRODUTO PVC 1/2" |
| 102 | Elo Fusível 0,50H | pç | _(vazio)_ | 3060 | 0.60 | MATERIAL | ELO FUSIVEL H 0,25 |
| 104 | Elo Fusível 1H | pç | _(vazio)_ | 90498 | 0.74 | MATERIAL | ELO FUSIVEL H 1 |
| 107 | Elo Fusível 2H | pç | _(vazio)_ | 90499 | 0.74 | MATERIAL | ELO FUSIVEL H 2 |
| 109 | Elo Fusível 3H | pç | _(vazio)_ | 90500 | 0.74 | MATERIAL | ELO FUSIVEL H 3 |
| 111 | Elo Fusível 5H | pç | _(vazio)_ | 90501 | 0.74 | MATERIAL | ELO FUSIVEL H 5 |
| 112 | Elo Fusível 6K | pç | _(vazio)_ | 90502 | 0.74 | MATERIAL | ELO FUSIVEL K 6 |
| 114 | Elo Fusível 10K | pç | 590504 | 90504 | 0.74 | MATERIAL | ELO FUSIVEL K 10 |
| 115 | Elo Fusível (CALCULAR CAPACIDADE) | pç | _(vazio)_ | 1479 | 0.55 | Banco_Dados | CORRENTE ZINCADA ELO CURTO |
| 118 | Emenda Total Preformada CA - CAA 2 AWG | pç | 502929 | 90258 | 0.68 | MATERIAL | CABO AL NU CA 2 AWG |
| 124 | Espaçador de isoladores | pç | 4092 | 541 | 0.64 | Banco_Dados | CABECOTE P APLICAR ESPACADOR |
| 131 | Haste âncora para estai | pç | _(vazio)_ | 3887 | 0.55 | MATERIAL | LUVA EMENDA HASTE ATERRAMENTO PROLONGADA |
| 134 | HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2400,0MM C/ RABICHO | pç | 503034 | 90462 | 0.69 | MATERIAL | HASTE ATERRAMENTO CIRC S/ROSCA 5/8 POL 2,4M C/ RABICHO |
| 139 | Isolador pimentão | pç | _(vazio)_ | 1308 | 0.64 | Banco_Dados | COBERTURA PROTETORA P ISOLADOR |
| 140 | Isolador roldana 76x79mm | pç | _(vazio)_ | 90295 | 0.60 | MATERIAL | ISOLADOR ROLDANA 80X76MM |
| 141 | Laço pré-formado de topo para cabo 2 AWG CAA | pç | 502948 | 90258 | 0.66 | MATERIAL | CABO AL NU CA 2 AWG |
| 143 | Laço pré-formado de topo para cabo 4/0 AWG CAA | pç | _(vazio)_ | 90438 | 0.66 | MATERIAL | EMENDA PARA CABO CAA 4/0AWG |
| 146 | Laço pré-formado simples lateral para cabo 2 AWG CAA | pç | 502952 | 90258 | 0.64 | MATERIAL | CABO AL NU CA 2 AWG |
| 148 | Laço pré-formado simples lateral para cabo 4/0 AWG CAA | pç | _(vazio)_ | 90438 | 0.64 | MATERIAL | EMENDA PARA CABO CAA 4/0AWG |
| 153 | Mão francesa plana de 619 mm | pç | 590443 | 90443 | 0.56 | MATERIAL | MAO FRANCESA PLANA AC 619X32X5MM |
| 177 | Parafuso de cabeça quadrada - 150mm | pç | _(vazio)_ | 90230 | 0.55 | MATERIAL | CINTA POSTE CIRC  150MM |
| 179 | Parafuso de cabeça quadrada - 200mm | pç | 590362 | 90219 | 0.55 | MATERIAL | CINTA POSTE CIRC  200MM |
| 180 | Parafuso de cabeça quadrada - 250mm | pç | 590363 | 1600 | 0.57 | Banco_Dados | ESCOVA DE ACO 250MM |
| 181 | Parafuso de cabeça quadrada - 300mm | pç | 590364 | 90226 | 0.55 | MATERIAL | CINTA POSTE CIRC  300MM |
| 182 | Parafuso de cabeça quadrada - 350mm | pç | _(vazio)_ | 90236 | 0.55 | MATERIAL | CINTA POSTE CIRC  350MM |
| 183 | Parafuso de cabeça quadrada - 400mm | pç | _(vazio)_ | 902 | 0.55 | Banco_Dados | CHAVE CATRACA MUNHAO 400MM |
| 186 | Parafuso de cabeça abaulada de 200 mm p/ poste circ | pç | 3984 | 90219 | 0.62 | MATERIAL | CINTA POSTE CIRC  200MM |
| 187 | Parafuso de rosca dupla de 350 mm | pç | _(vazio)_ | 90378 | 0.63 | MATERIAL | PARAFUSO ROSCA DUPLA AC 16X350MM |
| 188 | Parafuso de rosca dupla de 400 mm | pç | 503014 | 90379 | 0.63 | MATERIAL | PARAFUSO ROSCA DUPLA AC 16X400MM |
| 189 | Parafuso de rosca dupla de 450 mm | pç | 503013 | 3013 | 0.63 | MATERIAL | PARAFUSO ROSCA DUPLA AC 16X450MM |
| 190 | Parafuso de rosca dupla de 500 mm | pç | 503015 | 3015 | 0.63 | MATERIAL | PARAFUSO ROSCA DUPLA AC 16X500MM |
| 191 | Parafuso de rosca dupla de 550 mm | pç | 503016 | 3016 | 0.63 | MATERIAL | PARAFUSO ROSCA DUPLA AC 16X550MM |
| 192 | Parafuso de rosca dupla de 600 mm | pç | _(vazio)_ | 2387 | 0.64 | Banco_Dados | MESA KALO 600 X 600 MM |
| 195 | Pára-raios de distribuição - 30kV - polimérico - 10kA | pç | _(vazio)_ | 90212 | 0.64 | MATERIAL | PARA RAIO DISTR POLIM 30KV 10KA |
| 197 | Pino auto-travante AC 168,5mm para isolador pilar | pç | 590251 | 90251 | 0.62 | MATERIAL | PINO ISOL AUTO TRAVANTE AÇO M20/M16 168,5MM |
| 198 | Pino auto-travante AC 228,5mm para isolador pilar | pç | 502961 | 90621 | 0.62 | MATERIAL | PINO ISOL AUTO TRAVANTE AÇO M20/M16 228,5MM |
| 201 | Poste de concreto armada - 10/150 DT | pç | 3008 | 90193 | 0.64 | MATERIAL | POSTE DT 10M 150DAN |
| 202 | Poste de concreto armada - 10/300 DT | pç | _(vazio)_ | 90194 | 0.64 | MATERIAL | POSTE DT 10M 300DAN |
| 203 | Poste de concreto armada - 10/600 DT | pç | 2998 | 90195 | 0.64 | MATERIAL | POSTE DT 10M 600DAN |
| 206 | Poste de concreto armada - 11/300 DT | pç | 2999 | 90198 | 0.64 | MATERIAL | POSTE DT 11M 300DAN |
| 207 | Poste de concreto armada - 11/600 DT | pç | 3000 | 90199 | 0.64 | MATERIAL | POSTE DT 11M 600DAN |
| 209 | Poste de concreto armada - 12/300 DT | pç | _(vazio)_ | 90202 | 0.64 | MATERIAL | POSTE DT 12M 300DAN |
| 210 | Poste de concreto armada - 12/600 DT | pç | _(vazio)_ | 90203 | 0.64 | MATERIAL | POSTE DT 12M 600DAN |
| 211 | Poste de concreto armada - 12/1000 DT | pç | _(vazio)_ | 90200 | 0.64 | MATERIAL | POSTE DT 12M 1000DAN |
| 214 | Poste de concreto armada - 13/1000 DT | pç | _(vazio)_ | 90204 | 0.64 | MATERIAL | POSTE DT 13M 1000DAN |
| 215 | Poste de concreto armada circular- 10/150 | pç | _(vazio)_ | 2989 | 0.64 | MATERIAL | POSTE CIRCULAR 10M 150DAN |
| 216 | Poste de concreto armada circular- 10/300 | pç | _(vazio)_ | 227 | 0.64 | MATERIAL | POSTE CIRCULAR 10M 300DAN |
| 217 | Poste de concreto armada circular- 10/600 | pç | _(vazio)_ | 90183 | 0.64 | MATERIAL | POSTE CIRCULAR 10M 600DAN |
| 218 | Poste de concreto armada circular- 10/1000 | pç | _(vazio)_ | 2995 | 0.64 | MATERIAL | POSTE CIRCULAR 10M 1000DAN |
| 219 | Poste de concreto armada circular- 11/200 | pç | _(vazio)_ | 2990 | 0.64 | MATERIAL | POSTE CIRCULAR 11M 200DAN |
| 220 | Poste de concreto armada circular- 11/300 | pç | _(vazio)_ | 2991 | 0.64 | MATERIAL | POSTE CIRCULAR 11M 300DAN |
| 221 | Poste de concreto armada circular- 11/600 | pç | _(vazio)_ | 90186 | 0.64 | MATERIAL | POSTE CIRCULAR 11M 600DAN |
| 223 | Poste de concreto armada circular- 12/300 | pç | _(vazio)_ | 228 | 0.64 | MATERIAL | POSTE CIRCULAR 12M 300DAN |
| 224 | Poste de concreto armada circular- 12/600 | pç | _(vazio)_ | 90189 | 0.64 | MATERIAL | POSTE CIRCULAR 12M 600DAN |
| 229 | Protetor de bucha de AT de transformador | pç | _(vazio)_ | 1888 | 0.74 | Banco_Dados | GRAMPO PARA BUCHA DE TRANSFORMADOR |
| 241 | Suporte de Transformador em poste DT | pç | _(vazio)_ | 1634 | 0.70 | Banco_Dados | ESPORA PARA SUBIR EM POSTE DT |
| 245 | Suporte T para chave fusível 800mm | pç | _(vazio)_ | 1707 | 0.55 | Banco_Dados | ESTROPO DE NYLON 800MM |
| 246 | Suporte para isolador pilar em poste circular | pç | _(vazio)_ | 288 | 0.62 | Banco_Dados | BASE CIRCULAR FIXACAO ISOLADOR LINE POST |
| 247 | Suporte ( chapa "T" ) para isolador tipo pilar | pç | 503021 | 2956 | 0.57 | Banco_Dados | SUPORTE DE CONCHA |
| 248 | Suporte TL para Chave Faca | pç | _(vazio)_ | 855 | 0.60 | Banco_Dados | CHAVE AZUL |
| 307 | Laço pré-formado de Distribuição CAA 2 AWG | pç | 90741 | 90258 | 0.58 | MATERIAL | CABO AL NU CA 2 AWG |
| 308 | Suporte P/Isolador Pilar. | pç | 90524 | 2956 | 0.64 | Banco_Dados | SUPORTE DE CONCHA |
| 314 | Laço pré-formado de Distribuição CAA 1/0 AWG | pç | 90742 | 90263 | 0.72 | MATERIAL | CABO AL NU CAA 1/0 AWG |
| 315 | Laço pré-formado de Distribuição CAA 4/0 AWG | pç | 90745 | 3039 | 0.64 | Banco_Dados | TERMINAL PINO RETO COBRE  4/0 AWG |
| 316 | Laço pré-formado de Distribuição CAA 336,4 MCM | pç | 90746 | 90309 | 0.56 | MATERIAL | ALCA PREF DIS CA/CAA 336,4MCM |
| 319 | Alça pré-formada distribuição CAA 2 AWG | pç | 90707 | 2815 | 0.58 | MATERIAL | ALCA PREF DIS CA/CAA 2AWG |
| 324 | Alça pré-formada distribuição CAA 1/0 AWG | pç | 90708 | 90263 | 0.72 | MATERIAL | CABO AL NU CAA 1/0 AWG |
| 325 | Alça pré-formada distribuição CAA 4/0 AWG | pç | 90711 | 90308 | 0.64 | MATERIAL | ALCA PREF DIS CA/CAA 4/0AWG |
| 331 | Pino para Isolador Tipo Cruzeta 24,2/36,2 kV | pç | 90250 | 90512 | 0.57 | MATERIAL | LÂMINA DESLIGADORA BASE C 24,2/36,2KV 300A |
| 338 | Cordoalha Aço SM 9,5mm. | pç | 91714 | 90256 | 0.57 | MATERIAL | CORDOALHA ACO CARB CL A 7 FIOS MR 9,5MM 6160 DAN |
| 339 | Sapatilha 3/8. | pç | 90409 | 1437 | 0.74 | Banco_Dados | CORDA DE PROLIPROPILENO 3/8 |
| 340 | Cordoalha de Aço Carbono 9,5 mm | pç | 91716 | 2166 | 0.62 | Banco_Dados | LUVA DE BORRACHA ISOLANTE, 9,5 |
| 344 | Cruzeta de Eucalipto 5 metros. | pç | 691622 | 90501 | 0.55 | MATERIAL | ELO FUSIVEL H 5 |
| 345 | Poste de Eucalipto 12 metros. | pç | 690903 | 54 | 0.55 | Banco_Dados | ALICATE BOMBA DAGUA 12 |
| 351 | Suporte “TL”. | pç | 90655 | 2956 | 0.70 | Banco_Dados | SUPORTE DE CONCHA |
| 354 | Capa Protetora de Para-Raios | pç | 90969 | 733 | 0.60 | Banco_Dados | CAPA P/ PROTECAO DO GLV |
| 355 | Capa Protetora para Chaves Fusíveis | pç | 693918 | 733 | 0.57 | Banco_Dados | CAPA P/ PROTECAO DO GLV |

---

## ⬜ Não mexidos (125)

| id | descrição | motivo |
| --- | --- | --- |
| 5 | Alça pré formada de serviço para cabo triplex 16mm² | fuzzy baixo (score=0.47, cls.tipo=sem_match) |
| 11 | Alça pré formada para Fio Aluministeel N8 awg | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 12 | Arame aço galvanizado 14BWG | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 24 | Cabo Aluminio triplex Xlpe 16 mm² | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 27 | Cabo Aluminio triplex Xlpe 50 mm² | fuzzy baixo (score=0.50, cls.tipo=sem_cod_sap) |
| 36 | Cabo de cobre flexivel isolado - 10mm² | fuzzy baixo (score=0.52, cls.tipo=sem_match) |
| 41 | Chapa, fixação de estai, aço carbono zincado a quente | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 46 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A COM FERRAGEM | fuzzy baixo (score=0.50, cls.tipo=sem_match) |
| 47 | CHAVE FUSIVEL DISTRIBUIÇÃOTRIB 15,0KV 300A SEM FERRAGEM | fuzzy baixo (score=0.50, cls.tipo=sem_match) |
| 52 | Cinta circular de Ø 160 mm | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 53 | Cinta circular de Ø 170 mm | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 55 | Cinta circular de Ø 190 mm | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 73 | Concreto para base em poste ≥ 600daN (Cimento, areia, brita e m.o) | fuzzy baixo (score=0.49, cls.tipo=sem_cod_sap) |
| 78 | Conector derivação para linha viva - 6-250 (GLV) | fuzzy baixo (score=0.48, cls.tipo=sem_match) |
| 84 | Conector, cunha, liga de Alumínio, CN 3, série azul | fuzzy baixo (score=0.52, cls.tipo=sem_cod_sap) |
| 85 | Conector, cunha, liga de Alumínio, CN 4, série azul | fuzzy baixo (score=0.52, cls.tipo=sem_cod_sap) |
| 86 | Conector, cunha, liga de Alumínio, CN 6, série azul | fuzzy baixo (score=0.52, cls.tipo=sem_cod_sap) |
| 87 | Conector, cunha, liga de Alumínio, CN 10, série azul | fuzzy baixo (score=0.52, cls.tipo=sem_cod_sap) |
| 89 | Conector, cunha, liga de Alumínio, CN 13, série vermelho | fuzzy baixo (score=0.52, cls.tipo=sem_match) |
| 97 | CRUZETA POSTE CONCR QUADR 90X90MM 2000MM | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 113 | Elo Fusível 12K | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 122 | Emenda Total Preformada Fio Aluministeel N8 awg Convencional | fuzzy baixo (score=0.50, cls.tipo=sem_cod_sap) |
| 125 | Fio Aluministeel N8 awg | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 129 | Fita Isolante Preta 10mts | fuzzy baixo (score=0.53, cls.tipo=sem_cod_sap) |
| 132 | Haste de aterramento circular lisa 2400mm | fuzzy baixo (score=0.44, cls.tipo=sem_cod_sap) |
| 133 | Haste de aterramento circular prolongavel 2400mm | fuzzy baixo (score=0.44, cls.tipo=sem_cod_sap) |
| 137 | Isolador pilar 15kv - 110kv | fuzzy baixo (score=0.53, cls.tipo=sem_cod_sap) |
| 138 | Isolador pilar 36kv - 170kv | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 145 | Laço pré-formado de topo para Fio  Aluministeel N8 Awg | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 150 | Laço pré-formado simples lateral para Fio  Aluministeel N8 Awg | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 155 | Padrão Trifásico 40A. 10mm²  - 15kva - 220/127V. | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 156 | Padrão Trifásico 70A. 16MM² -  30kva - 220/127V. | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 157 | Padrão Trifásico 30A. 6mm²  - 15kva - 380/220V. | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 158 | Padrão Trifásico 50A. 10mm² -  30kva - 380/220V. | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 159 | Padrão Trifásico 70A. - 25mm² - trafo 45kva - 380/220v. | fuzzy baixo (score=0.41, cls.tipo=sem_cod_sap) |
| 160 | Padrão Trifásico 120A. - 35mm² - Trafo 45kva - 220/127v. | fuzzy baixo (score=0.41, cls.tipo=sem_cod_sap) |
| 162 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de Aço galvanizado | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 163 | Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de Aço galvanizado | fuzzy baixo (score=0.42, cls.tipo=sem_cod_sap) |
| 164 | Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de Aço galvanizado | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 165 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de Aço galvanizado | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 166 | Padrão bifásico rural 30 Amp. - 10mm², 05 kva - Poste de concreto | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 167 | Padrão bifásico rural 50 Amp. - 10mm², 10 kva - Poste de concreto | fuzzy baixo (score=0.43, cls.tipo=sem_cod_sap) |
| 168 | Padrão bifásico rural 70 Amp. - 16mm², 15 kva - Poste de concreto | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 169 | Padrão bifásico rural 100 Amp. - 25mm², 25 kva - Poste de concreto | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 170 | Padrão bifásico rural 140 Amp., 50mm²,  37,5 kva, Poste de concreto | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 176 | Parafuso de cabeça quadrada - 125mm | fuzzy baixo (score=0.53, cls.tipo=sem_match) |
| 178 | Parafuso de cabeça quadrada - 175mm | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 194 | Pára-raios de distribuição - 12kV - polimérico - 10kA | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 196 | Pino auto-travante AC 56,5mm para isolador pilar | fuzzy baixo (score=0.42, cls.tipo=sem_match) |
| 199 | Pino auto-travante AC 278,5mm para isolador pilar | ambíguo: 90622, 2962 |
| 212 | Poste de concreto armada - 13/300 DT | fuzzy baixo (score=0.44, cls.tipo=sem_cod_sap) |
| 213 | Poste de concreto armada - 13/600 DT | fuzzy baixo (score=0.44, cls.tipo=sem_cod_sap) |
| 234 | Seccionador de cerca 900kg | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 236 | Suporte de transformador em poste circular –Ø-210 mm | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 237 | Suporte de transformador em poste circular –Ø-225 mm | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 238 | Suporte de transformador em poste circular –Ø-250 mm | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 240 | Suporte de transformador em poste circular –Ø-270 mm | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 244 | Suporte T para chave fusível 540mm | sem candidato fuzzy (cls.tipo=sem_cod_sap) |
| 249 | Transformador monofásico - 13.8KV - 05KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 250 | Transformador monofásico - 34.5KV - 05KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 251 | Transformador monofásico - 13.8KV - 10KVA - 254/127V | fuzzy baixo (score=0.48, cls.tipo=sem_cod_sap) |
| 252 | Transformador monofásico - 34.5KV - 10KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 253 | Transformador monofásico - 13.8KV - 15KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 254 | Transformador monofásico - 34.5KV - 15KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 255 | Transformador monofásico - 13.8KV - 25KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 256 | Transformador monofásico - 34.5KV - 25KVA - 254/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 257 | Transformador monofásico - 13.8KV - 37,5KVA - 254/127V | fuzzy baixo (score=0.40, cls.tipo=sem_cod_sap) |
| 258 | Transformador monofásico - 34.5KV - 37,5KVA - 254/127V | fuzzy baixo (score=0.43, cls.tipo=sem_cod_sap) |
| 259 | Transformador Trifásico - 13.8KV - 15KVA - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 260 | Transformador Trifásico - 34.5KV - 15KVA - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 261 | Transformador Trifásico - 13.8KV - 30KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 262 | Transformador Trifásico -  34.5KV - 30KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 263 | Transformador Trifásico - 13.8KV - 45KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 264 | Transformador Trifásico -  34.5KV - 45KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 265 | Transformador Trifásico - 13.8KV - 75KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 266 | Transformador Trifásico -  34.5KV - 75KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 267 | Transformador Trifásico - 13.8KV - 112,5KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 268 | Transformador Trifásico -  34.5KV - 112,5KVA  - 220/127V | fuzzy baixo (score=0.49, cls.tipo=sem_cod_sap) |
| 269 | Transformador Trifásico - 13.8KV - 150KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 270 | Transformador Trifásico -  34.5KV - 150KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 271 | Transformador Trifásico - 13.8KV - 225KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 272 | Transformador Trifásico -  34.5KV - 225KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 273 | Transformador Trifásico - 13.8KV - 300KVA  - 220/127V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 274 | Transformador Trifásico -  34.5KV - 300KVA  - 220/127V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 275 | Transformador Trifásico - 13.8KV - 15KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 276 | Transformador Trifásico -  34.5KV - 15KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 277 | Transformador Trifásico - 13.8KV - 30KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 278 | Transformador Trifásico -  34.5KV - 30KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 279 | Transformador Trifásico - 13.8KV - 45KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 280 | Transformador Trifásico -  34.5KV - 45KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 281 | Transformador Trifásico - 13.8KV - 75KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 282 | Transformador Trifásico -  34.5KV - 75KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 283 | Transformador Trifásico - 13.8KV - 112,5KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 284 | Transformador Trifásico -  34.5KV - 112,5KVA - 380/220V | fuzzy baixo (score=0.49, cls.tipo=sem_cod_sap) |
| 285 | Transformador Trifásico - 13.8KV - 150KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 286 | Transformador Trifásico -  34.5KV - 150KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 287 | Transformador Trifásico - 13.8KV - 225KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 288 | Transformador Trifásico -  34.5KV - 225KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 289 | Transformador Trifásico - 13.8KV - 300KVA - 380/220V | fuzzy baixo (score=0.45, cls.tipo=sem_cod_sap) |
| 290 | Transformador Trifásico -  34.5KV - 300KVA - 380/220V | fuzzy baixo (score=0.51, cls.tipo=sem_cod_sap) |
| 293 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 294 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 295 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 296 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 297 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 298 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 299 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 300 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 301 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 302 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 303 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 304 |  | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 310 | Parafuso Rosca Total M16 x 200 mm | fuzzy baixo (score=0.50, cls.tipo=sem_match) |
| 311 | Parafuso Rosca Total M16 x 250 mm | fuzzy baixo (score=0.50, cls.tipo=sem_match) |
| 313 | Poste de Concreto Distribuição DT 13 m | fuzzy baixo (score=0.51, cls.tipo=sem_match) |
| 317 | Isolador Tipo Pilar Porcelana Vertical 24,2 kV | fuzzy baixo (score=0.49, cls.tipo=sem_match) |
| 323 | Porca Olhal M16 78,0 mm. | fuzzy baixo (score=0.44, cls.tipo=sem_match) |
| 328 | Porca Quadra Pesada Aço Carbono M16. | fuzzy baixo (score=0.52, cls.tipo=sem_match) |
| 329 | Cruzeta de Distribuição de Concreto T 1.900 mm (CA II) | fuzzy baixo (score=0.43, cls.tipo=sem_match) |
| 332 | Cruzeta de Distribuição de Concreto Retangular 2.400 mm (CA II) | fuzzy baixo (score=0.47, cls.tipo=sem_match) |
| 335 | Cruzeta de Distribuição de Concreto T 2.400 mm (CA II) | fuzzy baixo (score=0.47, cls.tipo=sem_match) |
| 336 | Arruela Quadrada 14,0 mm x32,0 mm x 3 mm. | fuzzy baixo (score=0.54, cls.tipo=sem_match) |
| 337 | Alca Pré-formada Cabo Aço Contra Poste 9,50mm. | fuzzy baixo (score=0.40, cls.tipo=sem_match) |
| 342 | Parafuso de Distribuição Cabeça Abaulada M16 x 70 mm. | sem candidato fuzzy (cls.tipo=sem_match) |
| 352 | Condutor de Aço Cobreado 25 mm². | fuzzy baixo (score=0.53, cls.tipo=sem_match) |