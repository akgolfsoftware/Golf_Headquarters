# AK Golf Testbatteri — Komplett referanse

> **Formål:** Komplett kilde til sannhet for Claude Design, scorekort-design, leaderboards, coach-analyse og spillerflyt.
> Oppdatert: 2026-06-19. Kilde: `prisma/seed-data/ngf-test-battery.json` + `prisma/scripts/seed-ngf-test-protocols.ts` + `src/lib/portal-tester/test-scoring.ts`.

---

## Pyramiden — 5 søyler

Alle tester tilhører én søyle i 5-søyle-pyramiden:

| Søyle | Kode | Innhold |
|---|---|---|
| Fysisk | FYS | Styrke, eksplosivitet, klubbhodehastighet |
| Teknisk | TEK | Gate-tester, mekanikk, presisjonskontroll |
| Slagteknikk | SLAG | PEI-baserte slag mot mål på range/bane |
| Spillforståelse | SPILL | Putting, scoring, beslutninger |
| Turneringsmodus | TURN | PEI-test i reell runde på bane |

---

## Scoring-system

### Retning
Alle tester har én av to retninger:
- **Lavere er bedre** → avvik, spredning, sekunder, PEI (nærhet til mål)
- **Høyere er bedre** → antall treff, poeng, kg, cm, mph, sink-prosent

### Scoring-typer brukt i batteriet

| Type | Hva beregnes | Eksempel |
|---|---|---|
| `pei_average` | Snitt-PEI over alle slag | Inspill Basic, Wedge Variation |
| `pei_total` | Sum av PEI over alle slag | — |
| `spread_stddev` | Standardavvik på carry-verdier | Sprednings-tester |
| `carry_average` | Snitt carry (m) | Driver Basic (carry-del) |
| `distance_average` | Snitt avstand | Inspill 120m, 160m |
| `hit_rate` | (Treff / forsøk) × 100 % | Driver Gate, Putt 1-3m, Putt Gate |
| `points_total` / `sum` | Summen av poeng | 8-ball, Wedge Gate, Nærspill Gate, VISA Express |
| `count_ok` | Antall slag markert OK | — |
| `value_max` | Høyeste enkeltverdi | Trapbar, Benkpress, Standing Long Jump, Ball Throw, CHS |
| `time_seconds` / `value_single` | Enkelt tidsverdi | — |
| `average` | Snitt av alle verdier | Putt Speed Control |

### PEI-formelen (kjernen i testbatteriet)

**PEI = Nærhet til hull ÷ Slagavstand**

Nærhet beregnes slik per slag:
- **Nærspill:** spiller taster `resultatM` = avstand fra hull direkte (m)
- **Fullslag:** spiller taster `carry` (m) + `sideavvik` (m) → nærhet = √((slagavstand − carry)² + side²)

Ferdig formel, fullslag:

```
nærhet = √( (lengde − carry)² + side² )
PEI    = nærhet / lengde
```

Snitt-PEI = gjennomsnitt av PEI per slag (alle slag i testen).

**Enhet:** PEI er desimaltall (0,057 = 5,7 %). I benchmarks brukes alltid prosent.

**Retning:** Lavere er bedre. PGA topp 40 holder PEI ≈ 5 % på innspill.

---

## Benchmark-nivåer

7 nivåer, beste → svakeste. Samme stige brukes på tvers av alle tester:

| ID | Visningsnavn | Badge |
|---|---|---|
| `pga_top40` | PGA topp 40 | PGA |
| `pga_avg` | PGA-snitt | PGA |
| `dpw_kft` | DP World / Korn Ferry | DPW/KFT |
| `challenge` | Challenge Tour | CHA |
| `nordic` | Nordic League | NOR |
| `elite_junior` | Norsk elitejunior | JR |
| `scratch` | Scratch | SCR |

**Kilde:** DataGolf v1, 2026-06 (merket `measured` / `reference` / `estimated`).
Tester uten benchmarks bruker intern norm fra elevdata (settes i v2).

---

## ALLE 20 TESTER — detaljert

---

### 1. Driver Basic
**Søyle:** SLAG · **Kategori:** Utslag
**Varighet:** ~10 min · **Utstyr:** Driver, TrackMan eller siktepunkt, 5 baller

**Hva testes:** Carry-presisjon og retningskontroll med driver. Både lengde og nøyaktighet måles.

**Gjennomføring:**
- 5 driver-slag mot midten av fairway uten korreksjon mellom slag
- Registrer per slag: carry (m), total (m), sideavvik (m). + høyre, − venstre

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Carry | tall | m | 100 | 350 |
| Total | tall | m | 100 | 350 |
| Sideavvik | tall | m | −100 | +100 |

**Scoring:** `pei_average` — lavere er bedre
```
nærhet = √( (lengde − carry)² + sideavvik² )
PEI    = nærhet / lengde
Score  = snitt PEI over 5 slag
```

**Benchmarks (carry-lengde, retning: høyere er bedre):**
| Nivå | Carry |
|---|---|
| PGA topp 40 | ≥ 273 m |
| PGA-snitt | ≥ 268 m |
| DP World / KFT | ≥ 266 m |
| Challenge Tour | ≥ 262 m |
| Nordic League | ≥ 258 m |
| Norsk elitejunior | ≥ 256 m |
| Scratch | ≥ 246 m |

---

### 2. Driver Gate
**Søyle:** TEK · **Kategori:** Utslag
**Varighet:** ~8 min · **Utstyr:** Driver, 6 baller, kjegler 2m fra hverandre plassert på din normale carry-lengde

**Hva testes:** Retningspresisjon under press. Krever kontrollert slag gjennom smal gate.

**Gjennomføring:**
- 6 driver-slag mot gate (2m bred, 200m bort)
- Marker om ballen passerte innenfor gate: ja/nei

**Inputfelter per slag:**
| Felt | Type |
|---|---|
| Innenfor gate | avkrysning |

**Scoring:** `hit_rate` — høyere er bedre
```
Score = (antall innenfor / 6) × 100 %
```
Mål: ≥ 4 av 6 innenfor gate.

**Benchmarks (prosent, retning: høyere er bedre):**
| Nivå | Gate-% |
|---|---|
| PGA topp 40 | ≥ 65 % |
| PGA-snitt | ≥ 61 % |
| DP World / KFT | ≥ 60 % |
| Challenge Tour | ≥ 57 % |
| Nordic League | ≥ 55 % |
| Norsk elitejunior | ≥ 53 % |
| Scratch | ≥ 52 % |

---

### 3. Inspill Basis
**Søyle:** SLAG · **Kategori:** Innspill
**Varighet:** ~20 min · **Utstyr:** Jern 5-9 + hybrid, 10 baller, avstandsmåler

**Hva testes:** Innspillpresisjon fra 100–200 m. PEI måles per slag.

**Gjennomføring:**
- 10 slag: 2 slag fra hver av 100, 120, 140, 160, 180 og 200 m
- Registrer slagavstand (kalt ut av coach) og avstand til hull etter slag

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Slagavstand | tall | m | 80 | 220 |
| Avstand til hull | tall | m | 0 | 80 |

**Scoring:** `pei_average` — lavere er bedre
```
PEI    = avstand til hull / slagavstand
Score  = snitt PEI over 10 slag
```

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 5,0 % |
| PGA-snitt | ≤ 5,7 % |
| DP World / KFT | ≤ 6,1 % |
| Challenge Tour | ≤ 6,8 % |
| Nordic League | ≤ 7,7 % |
| Norsk elitejunior | ≤ 8,2 % |
| Scratch | ≤ 9,0 % |

---

### 4. Inspill 120 m
**Søyle:** SLAG · **Kategori:** Innspill
**Varighet:** ~10 min · **Utstyr:** PW / 9-jern, 5 baller, mål-flagg

**Hva testes:** Nøyaktighet fra én fast avstand (120 m).

**Gjennomføring:**
- 5 slag fra eksakt 120 m
- Registrer avstand til hull etter hvert slag (carry + utløp)

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Avstand til hull | tall | m | 0 | 50 |

**Scoring:** `distance_average` — lavere er bedre
```
Score = snitt avstand til hull over 5 slag (m)
```
Mål: snitt < 8 m fra hull.

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 5,0 % |
| PGA-snitt | ≤ 5,8 % |
| DP World / KFT | ≤ 6,2 % |
| Challenge Tour | ≤ 7,0 % |
| Nordic League | ≤ 7,9 % |
| Norsk elitejunior | ≤ 8,4 % |
| Scratch | ≤ 9,2 % |

---

### 5. Inspill 160 m
**Søyle:** SLAG · **Kategori:** Innspill
**Varighet:** ~10 min · **Utstyr:** 7–9 jern, 5 baller, mål-flagg

**Hva testes:** Nøyaktighet fra én fast lengre avstand (160 m).

**Gjennomføring:**
- 5 slag fra eksakt 160 m
- Registrer avstand til hull

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Avstand til hull | tall | m | 0 | 60 |

**Scoring:** `distance_average` — lavere er bedre
```
Score = snitt avstand til hull over 5 slag (m)
```
Mål: snitt < 10 m fra hull.

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 4,8 % |
| PGA-snitt | ≤ 5,5 % |
| DP World / KFT | ≤ 5,8 % |
| Challenge Tour | ≤ 6,4 % |
| Nordic League | ≤ 7,1 % |
| Norsk elitejunior | ≤ 7,4 % |
| Scratch | ≤ 8,0 % |

---

### 6. Inspill Variation
**Søyle:** SLAG · **Kategori:** Innspill
**Varighet:** ~15 min · **Utstyr:** Hele jern-settet, 9 baller

**Hva testes:** Tilpasningsevne. Coach kaller ut ny avstand 30 sek før hvert slag.

**Gjennomføring:**
- 9 slag, randomiserte avstander (100–130 m)
- Coach kaller avstand → 30 sek til klubbvalg + slag
- Registrer kalt avstand og avstand til hull

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Avstand kalt ut | tall | m | 100 | 130 |
| Avstand til hull | tall | m | 0 | 30 |

**Scoring:** `pei_average` — lavere er bedre
```
PEI = avstand til hull / kalt avstand
Score = snitt PEI over 9 slag
```
Mål: snitt PEI < 7 %.

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 5,0 % |
| PGA-snitt | ≤ 5,7 % |
| DP World / KFT | ≤ 6,1 % |
| Challenge Tour | ≤ 6,8 % |
| Nordic League | ≤ 7,7 % |
| Norsk elitejunior | ≤ 8,2 % |
| Scratch | ≤ 9,0 % |

---

### 7. Wedge Variation
**Søyle:** SLAG · **Kategori:** Wedge
**Varighet:** ~12 min · **Utstyr:** PW + SW + LW, 9 baller

**Hva testes:** PEI på wedge-slag fra tre faste avstander (30 / 50 / 70 m).

**Gjennomføring:**
- 9 slag: 3 stk fra 30 m, 3 stk fra 50 m, 3 stk fra 70 m
- Registrer carry og avstand til hull

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Carry | tall | m | 20 | 90 |
| Avstand til hull | tall | m | 0 | 30 |

**Scoring:** `pei_average` — lavere er bedre
```
nærhet = avstand til hull (m)
PEI    = avstand til hull / slagavstand
Score  = snitt PEI over 9 slag
```
Mål: PEI < 10 %.

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 6,0 % |
| PGA-snitt | ≤ 7,0 % |
| DP World / KFT | ≤ 7,5 % |
| Challenge Tour | ≤ 8,5 % |
| Nordic League | ≤ 9,7 % |
| Norsk elitejunior | ≤ 10,3 % |
| Scratch | ≤ 11,3 % |

---

### 8. TN Wedge Gate
**Søyle:** TEK · **Kategori:** Wedge
**Varighet:** ~15 min · **Utstyr:** SW + LW, 9 baller, TrackMan

**Hva testes:** Evne til å kontrollere launch-vinkel og carry-lengde simultant.

**Gjennomføring:**
- 9 slag i 3 steg: Lav (< 30°) / Medium (30–50°) / Høy (> 50°) launch
- Carry-mål for alle: 40 m, 50 m, 60 m (ett per sett)
- 1 poeng per slag innenfor launch-vindu + 2 m carry-toleranse

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Launch-vinkel | tall | ° | 10 | 70 |
| Carry | tall | m | 20 | 80 |
| Treff i sone | avkrysning | — | — | — |

**Scoring:** `points_total` — høyere er bedre
```
Score = sum av poeng over 9 slag (maks 9 poeng)
```
Mål: 6 / 9 slag innenfor.

**Benchmarks:** Intern norm (ingen tour-motstykke). Settes fra elevdata i v2.

---

### 9. 8-Ball Variation
**Søyle:** SLAG · **Kategori:** Nærspill
**Varighet:** ~25 min · **Utstyr:** SW + LW + PW, 24 baller

**Hva testes:** Nærspillmestring i 8 ulike situasjoner. Rotasjonstest som dekker bredden av nærspill.

**Gjennomføring:**
24 slag i fast rotasjon (gjentatt 3 ganger):
1. Chip 10 m
2. Chip 30 m
3. Wedge 20 m
4. Wedge 40 m
5. Lobb 15 m
6. Lobb 25 m
7. Bunker 10 m
8. Bunker 20 m

**Poengskala per slag:**
| Resultat | Poeng |
|---|---|
| Inn i hull | 4 |
| < 1 m fra hull | 3 |
| < 2 m fra hull | 2 |
| < 4 m fra hull | 1 |
| > 4 m fra hull | 0 |

**Maks:** 96 poeng (24 slag × 4)

**Inputfelter per slag:**
| Felt | Type | Verdier |
|---|---|---|
| Slagtype | nedtrekk | Chip 10m / Chip 30m / Wedge 20m / Wedge 40m / Lobb 15m / Lobb 25m / Bunker 10m / Bunker 20m |
| Poeng | tall | 0–4 |

**Scoring:** `points_total` — høyere er bedre
```
Score = sum poeng over 24 slag
```
Mål: ≥ 50 av 96.

**PGA-forventning per slagsituasjon (PEI %):**
| Situasjon | PGA-snitt PEI |
|---|---|
| Chip 10 m | 12,0 % |
| Chip 30 m | 5,1 % |
| Wedge 20 m | 7,1 % |
| Wedge 40 m | 6,5 % |
| Lobb 15 m | 8,8 % |
| Lobb 25 m | 5,9 % |
| Bunker 10 m | 14,4 % |
| Bunker 20 m | 7,8 % |

**Benchmarks (total PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 7,4 % |
| PGA-snitt | ≤ 8,0 % |
| DP World / KFT | ≤ 8,3 % |
| Challenge Tour | ≤ 9,0 % |
| Nordic League | ≤ 9,8 % |
| Norsk elitejunior | ≤ 10,4 % |
| Scratch | ≤ 11,2 % |

---

### 10. TN Nærspill Gate
**Søyle:** TEK · **Kategori:** Nærspill
**Varighet:** ~12 min · **Utstyr:** SW + LW, 9 baller, TrackMan eller flagg-markering

**Hva testes:** Evne til å kontrollere carry-sone og launch-høyde simultant (3×3 matrise).

**Gjennomføring:**
- 9 slag: 3 carry-soner (2 m / 3 m / 4 m) × 3 launch-høyder (Lav / Medium / Høy)
- 1 poeng: treff i carry-sone. 2 poeng: riktig launch + sone.

**Inputfelter per slag:**
| Felt | Type | Verdier |
|---|---|---|
| Launch | nedtrekk | Lav / Medium / Høy |
| Carry-sone | nedtrekk | 2 m / 3 m / 4 m |
| Poeng | tall | 0–2 |

**Scoring:** `points_total` — høyere er bedre
```
Score = sum poeng over 9 slag (maks 18)
```
Mål: ≥ 6 / 18 poeng.

**Benchmarks:** Intern norm (ingen tour-motstykke). Settes fra elevdata i v2.

---

### 11. Putt 1–3 m
**Søyle:** SPILL · **Kategori:** Putting
**Varighet:** ~15 min · **Utstyr:** Putter, 25 baller

**Hva testes:** Sinkprosent fra korte og middels lange putting-avstander.

**Gjennomføring:**
5 steg med 5 putter fra hver avstand:

| Steg | Avstand | Mål |
|---|---|---|
| 1 | 1,0 m | 5 / 5 |
| 2 | 1,5 m | ≥ 4 / 5 |
| 3 | 2,0 m | ≥ 3 / 5 |
| 4 | 2,5 m | ≥ 3 / 5 |
| 5 | 3,0 m | ≥ 2 / 5 |

**Inputfelt per putt:** `sunket` (avkrysning)

**Scoring:** `hit_rate` — høyere er bedre
```
Score = (totalt sunket / 25) × 100 %
```

**PGA-referanser per avstand:**
| Avstand | PGA hullprosent |
|---|---|
| 1 m | 87 % |
| 2 m | 55 % |
| 3 m | 39 % |
| 1–3 m snitt | ~60 % |

**Benchmarks (prosent, retning: høyere er bedre):**
| Nivå | Sink-% |
|---|---|
| PGA topp 40 | ≥ 62 % |
| PGA-snitt | ≥ 60 % |
| DP World / KFT | ≥ 59 % |
| Challenge Tour | ≥ 57 % |
| Nordic League | ≥ 55 % |
| Norsk elitejunior | ≥ 53 % |
| Scratch | ≥ 51 % |

---

### 12. TN Putt Gate
**Søyle:** TEK · **Kategori:** Putting
**Varighet:** ~8 min · **Utstyr:** Putter, 10 baller, gate-markering (40 cm bred, 50 cm foran ball)

**Hva testes:** Start-retning på puttestroke. Gate er plassert 50 cm foran ballen — krever rett linje.

**Gjennomføring:**
- 10 putter gjennom gate
- Marker hvert putt: inn / ut + v/h ved miss

**Inputfelter per putt:**
| Felt | Type | Verdier |
|---|---|---|
| Gjennom gate | avkrysning | ja / nei |
| Miss-retning | nedtrekk | — / Venstre / Høyre |

**Scoring:** `hit_rate` — høyere er bedre
```
Score = (gjennom gate / 10) × 100 %
```
Mål: ≥ 8 / 10 (80 %).

**Benchmarks:** Intern norm. PGA referanse: start line accuracy > 90 %.

---

### 13. Putt Speed Control
**Søyle:** SPILL · **Kategori:** Putting
**Varighet:** ~12 min · **Utstyr:** Putter, 9 baller (+ 5 til blokk-steg = 14 baller totalt)

**Hva testes:** Farts-kontroll på putter fra ulike avstander. Måler "leave-avstand" etter putt.

**Gjennomføring:**
4 steg:

| Steg | Antall | Avstand | Mål leave |
|---|---|---|---|
| 1. Blokk 3 m | 5 putter | 3 m | snitt < 0,5 m |
| 2. Serie 3 m | 3 putter | 3 m | snitt < 0,5 m |
| 3. Serie 5 m | 3 putter | 5 m | snitt < 0,8 m |
| 4. Serie 7 m | 3 putter | 7 m | snitt < 1,2 m |

**Inputfelter per putt:**
| Felt | Type | Enhet | Steg |
|---|---|---|---|
| Avstand fra hull | tall | m | alle |
| Lang/kort | nedtrekk | Lang/På/Kort | steg 1 |

**Scoring:** `average` — lavere er bedre
```
Score = snitt leave-avstand over alle 14 putter (m)
```

**Benchmarks:** Intern norm. PGA referanse: leave < 0,5 m fra hull.

---

### 14. TN VISA Express
**Søyle:** TEK · **Kategori:** Putting
**Varighet:** ~10 min · **Utstyr:** Putter, 9 baller, speed-sone-markering (30 cm forbi hull)

**Hva testes:** Speed-kontroll på putt. 2 poeng for å stoppe i "på"-sonen (innenfor 30 cm forbi hull).

**Gjennomføring:**
- 9 putter: 3 fra 2 m, 3 fra 3 m, 3 fra 4 m
- Score per putt: 2p = stopper i sonen (0–30 cm forbi hull), 1p = i videre sone, 0p = utenfor

**Inputfelter per putt:**
| Felt | Type | Verdier |
|---|---|---|
| Avstand | nedtrekk | 2 m / 3 m / 4 m |
| Speed-zone | nedtrekk | Kort / På / Lang |
| Poeng | tall | 0–2 |

**Scoring:** `points_total` — høyere er bedre
```
Score = sum poeng over 9 putter (maks 18)
```
Mål: ≥ 12 / 18 poeng.

**Benchmarks:** Intern norm. PGA referanse: speed control within 5 %.

---

### 15. Trapbar Deadlift
**Søyle:** FYS · **Kategori:** Styrke
**Varighet:** ~25 min · **Utstyr:** Trapbar, vektskiver, treningssko (flate)

**Hva testes:** Maks 1RM trapbar markløft. Direkte kobling til rotasjonskraft og CHS.

**Gjennomføring:**
1. Oppvarming: 10 min lett + 3 sett (50/60/70 % av antatt 1RM)
2. Maks-forsøk: 3–5 forsøk på 1RM. Registrer høyeste godkjente vekt (rett rygg, full hofteekstensjon)

**Inputfelter:**
| Steg | Felt | Type | Enhet |
|---|---|---|---|
| Oppvarming | Fullført | avkrysning | — |
| Maks-forsøk | Vekt | tall | kg |
| Maks-forsøk | Godkjent løft (form OK) | avkrysning | — |

**Scoring:** `value_max` — høyere er bedre
```
Score = høyeste godkjente løft (kg)
```

**Benchmarks:** Fysisk norm hentes fra NGF/Olympiatoppen i v2.
Referanse: Junior G19 = 1,5× kroppsvekt. Pro = 2,0× kroppsvekt.

---

### 16. Benkpress
**Søyle:** FYS · **Kategori:** Styrke
**Varighet:** ~20 min · **Utstyr:** Benk, stang, skiver, spotter

**Hva testes:** Maks 1RM benkpress. Overkroppsstyrke som stabiliserer svingen.

**Gjennomføring:**
1. Oppvarming: 5 min arm-rotasjoner + 3 sett (50/60/70 % av 1RM)
2. Maks-forsøk: 3–5 forsøk. Full ROM, skuldre mot benken.

**Inputfelter:**
| Steg | Felt | Type | Enhet |
|---|---|---|---|
| Oppvarming | Fullført | avkrysning | — |
| Maks-forsøk | Vekt | tall | kg |
| Maks-forsøk | Godkjent løft | avkrysning | — |

**Scoring:** `value_max` — høyere er bedre
```
Score = høyeste godkjente løft (kg)
```

**Benchmarks:** Fysisk norm hentes fra NGF/Olympiatoppen i v2.
Referanse: Junior G19 = 1,0× kroppsvekt. Pro = 1,3× kroppsvekt.

---

### 17. Standing Long Jump
**Søyle:** FYS · **Kategori:** Eksplosivitet
**Varighet:** ~10 min · **Utstyr:** Målebånd, sklisikker matte

**Hva testes:** Bilateral eksplosiv kraft i underkropp (power output). Korrelerer med CHS.

**Gjennomføring:**
1. Oppvarming: 5 min lett jogg + 3 testhopp på 70–80 %
2. Test: 3 maks-hopp med tærne mot strek og armsving. Mål fra strek til nærmeste hælpunkt.

**Inputfelter:**
| Steg | Felt | Type | Enhet |
|---|---|---|---|
| Oppvarming | Fullført | avkrysning | — |
| 3 hopp | Lengde | tall | cm |

**Scoring:** `value_max` — høyere er bedre
```
Score = lengste godkjente hopp (cm)
```

**Benchmarks:** Fysisk norm hentes fra NGF/Olympiatoppen i v2.
Referanse: Junior G19 ≥ 230 cm. Pro ≥ 280 cm.

---

### 18. Ball Throw (Knestående)
**Søyle:** FYS · **Kategori:** Eksplosivitet
**Varighet:** ~12 min · **Utstyr:** Medisinball (3 kg G/J19, 2 kg yngre), målebånd, knebeskytter

**Hva testes:** Rotasjonskraft i overkropp isolert fra underkropp. Direkte mål på sving-rotasjonspower.

**Gjennomføring:**
1. Oppvarming: 5 min rotasjons-oppvarming + 3 lettere kast (70 %)
2. Test: 3 kast per side (begge sider). Fra knestående posisjon, ball ved siden av hofta. Roter og kast fremover. Mål lengste.

**Inputfelter:**
| Steg | Felt | Type | Verdier |
|---|---|---|---|
| Oppvarming | Fullført | avkrysning | — |
| 3 kast | Side | nedtrekk | Venstre / Høyre |
| 3 kast | Lengde | tall | cm (100–2000) |

**Scoring:** `value_max` — høyere er bedre
```
Score = lengste godkjente kast per side (cm)
```

**Benchmarks:** Fysisk norm hentes fra NGF/Olympiatoppen i v2.
Referanse: Junior G19 ≥ 1000 cm (3 kg ball). Pro ≥ 1400 cm.

---

### 19. Clubhead Speed (CHS)
**Søyle:** FYS · **Kategori:** Golfspesifikk
**Varighet:** ~15 min · **Utstyr:** Driver, TrackMan (eller annen launch-monitor), 5 baller
**NB: KUN innendørs på TrackMan — utendørs-verdier er ikke sammenlignbare**

**Hva testes:** Maksimal klubbhodehastighet. 1 mph CHS ≈ 2,5 yards ekstra carry.

**Gjennomføring:**
1. Oppvarming: 10 min + 5 slag på 70–80 %
2. Test: 5 maks-slag med driver. Registrer CHS per slag + smash factor (valgfritt)

**Inputfelter per slag:**
| Felt | Type | Enhet | Min | Maks |
|---|---|---|---|---|
| Clubhead Speed | tall | mph | 60 | 140 |
| Smash factor | tall | — | 1,0 | 1,6 |

**Scoring:** `value_max` — høyere er bedre
```
Score = høyeste registrerte CHS (mph)
```

**Benchmarks (mph, retning: høyere er bedre):**
| Nivå | CHS |
|---|---|
| PGA topp 40 | ≥ 121 mph |
| PGA-snitt | ≥ 115 mph |
| DP World / KFT | ≥ 113 mph |
| Challenge Tour | ≥ 111 mph |
| Nordic League | ≥ 109 mph |
| Norsk elitejunior | ≥ 108 mph |
| Scratch | ≥ 102 mph |

---

### 20. PEI Test Bane
**Søyle:** TURN · **Kategori:** Bane
**Varighet:** ~240 min (hel runde) · **Utstyr:** Hele settet, avstandsmåler, scorekort med PEI-felter

**Hva testes:** Innspillpresisjon under reelle baneforhold på 18 hull. Ingen ekstra slag — logg data fra normal runde.

**Gjennomføring:**
- Spill normal runde (18 hull)
- For HVERT innspill (slag mot green): noter slag-type, slagavstand og avstand til hull etter slag
- PEI beregnes automatisk per slag

**Inputfelter per innspill:**
| Felt | Type | Verdier/enhet |
|---|---|---|
| Hull | tall | 1–18 |
| Slag-type | nedtrekk | Driver / Hybrid / Jern 3–5 / Jern 6–8 / Wedge / Bunker |
| Slagavstand | tall | m (20–250) |
| Til hull etter slag | tall | m (0–80) |

**Scoring:** `pei_average` — lavere er bedre
```
PEI per innspill = avstand til hull / slagavstand
Score            = snitt PEI over alle 18 innspill
```
Mål: snitt PEI < 7 %.

**Benchmarks (PEI %, retning: lavere er bedre):**
| Nivå | PEI |
|---|---|
| PGA topp 40 | ≤ 5,0 % |
| PGA-snitt | ≤ 5,7 % |
| DP World / KFT | ≤ 6,1 % |
| Challenge Tour | ≤ 6,8 % |
| Nordic League | ≤ 7,7 % |
| Norsk elitejunior | ≤ 8,2 % |
| Scratch | ≤ 9,0 % |

---

## Scorekort-design — hva hvert scorekort MÅ vise

### Per slag (live-input)
- Slagtype/situasjon (fra protokollen)
- Instruksjon (fra protokollen)
- Inputfelter (dynamisk per test)
- Live PEI/poeng-beregning etter hvert slag

### Oppsummering (etter fullføring)
- Total score med enhet
- Snitt per slag (der relevant)
- Benchmark-badge (PGA / DPW/KFT / CHA / NOR / JR / SCR)
- Sparkline / historikk mot forrige resultat
- Delta mot forrige test (positiv/negativ med fargeindikator)
- Søyle/pyramide-tilhørighet

### Leaderboard
Alle tester kan ha leaderboard. Nøkkelfelter:
- Spillernavn + avatar
- Score med enhet
- Benchmark-nivå (badge)
- Delta mot eget beste
- Dato for siste resultat
- Sortering: automatisk etter retning (lavere bedre = lav score øverst, høyere bedre = høy score øverst)

---

## Sammendrag: tester uten tour-benchmarks

Disse testene har per i dag ingen tour-motstykke og bruker intern norm (settes fra elevdata i v2):

| Test | Årsak |
|---|---|
| TN Putt Gate | Teknisk kontrolltest — ingen tour-statistikk |
| TN Nærspill Gate | Teknisk kontrolltest — ingen tour-statistikk |
| TN VISA Express | Teknisk kontrolltest — ingen tour-statistikk |
| TN Wedge Gate | Teknisk kontrolltest — ingen tour-statistikk |
| Putt Speed Control | Teknisk kontrolltest — ingen tour-statistikk |
| Trapbar Deadlift | Fysisk norm fra NGF/Olympiatoppen (v2) |
| Benkpress | Fysisk norm fra NGF/Olympiatoppen (v2) |
| Standing Long Jump | Fysisk norm fra NGF/Olympiatoppen (v2) |
| Ball Throw | Fysisk norm fra NGF/Olympiatoppen (v2) |

---

## Testbatteri-oversikt (alle 20 tester)

| # | Navn | Søyle | Scoring-type | Enhet | Retning | Benchmarks |
|---|---|---|---|---|---|---|
| 1 | Driver Basic | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 2 | Driver Gate | TEK | hit_rate | % | høyere | DataGolf v1 |
| 3 | Inspill Basis | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 4 | Inspill 120 m | SLAG | distance_average | m | lavere | DataGolf v1 |
| 5 | Inspill 160 m | SLAG | distance_average | m | lavere | DataGolf v1 |
| 6 | Inspill Variation | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 7 | Wedge Variation | SLAG | pei_average | PEI % | lavere | DataGolf v1 |
| 8 | TN Wedge Gate | TEK | points_total | poeng | høyere | intern v2 |
| 9 | 8-Ball Variation | SLAG | points_total | poeng | høyere | DataGolf v1 |
| 10 | TN Nærspill Gate | TEK | points_total | poeng | høyere | intern v2 |
| 11 | Putt 1–3 m | SPILL | hit_rate | % | høyere | DataGolf v1 |
| 12 | TN Putt Gate | TEK | hit_rate | % | høyere | intern v2 |
| 13 | Putt Speed Control | SPILL | average | m | lavere | intern v2 |
| 14 | TN VISA Express | TEK | points_total | poeng | høyere | intern v2 |
| 15 | Trapbar Deadlift | FYS | value_max | kg | høyere | Olympiatoppen v2 |
| 16 | Benkpress | FYS | value_max | kg | høyere | Olympiatoppen v2 |
| 17 | Standing Long Jump | FYS | value_max | cm | høyere | Olympiatoppen v2 |
| 18 | Ball Throw | FYS | value_max | cm | høyere | Olympiatoppen v2 |
| 19 | Clubhead Speed (CHS) | FYS | value_max | mph | høyere | DataGolf v1 |
| 20 | PEI Test Bane | TURN | pei_average | PEI % | lavere | DataGolf v1 |

---

## Viktig: FYS-resultatformel AVVENTER

FYS-testene (15–18) scores i dag som rå beste verdier (`value_max`). En samlet FYS-indeks-formel som veier dem mot hverandre **er ikke låst** — den venter på Anders' beslutning. Tegn FYS-scorekort med plassholder-verdier. Ikke hardkod referanseverdier for FYS-indeks.
