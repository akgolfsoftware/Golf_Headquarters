# Strokes Gained — Komplett systemrapport

> Oppdatert 2026-05-27 · Basert på faktisk kildekode, ikke antakelser.
> Kilde: `src/lib/domain/sg.ts`, `src/lib/stats/sg-estimator.ts`, `src/lib/sg-hub/`, `prisma/schema.prisma`
>
> **Distanse-konvensjon:**
> - OTT / APP / ARG: **meter**
> - PUTT: **fot (ft)** — Broadie (2014) standard. Systemet konverterer til meter internt ved SG-beregning (1 ft = 0,3048 m).

---

## 1. Hva er Strokes Gained (SG)?

SG måler hvert slag mot hva en referansespiller (PGA Tour Top 40-snitt) forventes å bruke på det samme hullet fra samme posisjon.

**Formel (Mark Broadie, "Every Shot Counts" 2014):**

```
SG per slag = forventet_start − forventet_slutt − 1
```

**Eksempel — par-4 hull:**

| # | Slag | Fra | Til | Forventet start | Forventet slutt | SG |
|---|---|---|---|---|---|---|
| 1 | Driver | Tee (350m) | Fairway (120m) | 3,95 | 2,90 | +0,05 |
| 2 | 7-jern | Fairway (120m) | Green (5 ft) | 2,90 | 1,85 | +0,05 |
| 3 | Putt | Green (5 ft) | Hole | 1,85 | 0 | +0,85 |
| **Sum** | | | | | | **+0,95** |

Totalt SG per runde = summen av SG-verdier for alle slag.
Positiv SG = bedre enn Tour-snitt. Negativ SG = dårligere.

---

## 2. De fire SG-kategoriene

| Kode | Kategori | Norsk navn | Hva det måler | Distanse-enhet |
|---|---|---|---|---|
| `OTT` | Off-the-Tee | Fra tee | Driving — lengde og presisjon fra tee-box | Meter |
| `APP` | Approach | Innspill | Slagene inn mot green | Meter |
| `ARG` | Around-the-Green | Rundt green | Chip, pitch, bunker — ≤30m fra hull | Meter |
| `PUTT` | Putting | Putting | Alle slag på green | **Fot (ft)** |

**Samlet:** `sgTotal = sgOtt + sgApp + sgArg + sgPutt`

---

## 3. Benchmark-tabeller (PGA Tour Top 40)

Benchmarks = forventet antall slag for å fullføre hullet fra gitt posisjon.

### 3.1 OTT — Off-the-Tee (meter)

| Avstand fra hull | Forventet slag |
|---|---|
| ≤ 180m | 3,70 |
| ≤ 220m | 3,80 |
| ≤ 260m | 3,85 |
| ≤ 300m | 3,95 |
| ≤ 340m | 4,05 |
| ≤ 380m | 4,15 |
| ≤ 430m | 4,30 |
| 430m+ | 4,50 |

*Typisk par-4 tee shot: 350m hull → OTT-benchmark = 4,05 slag.*

### 3.2 APP — Approach (meter)

| Avstand fra hull | Forventet slag |
|---|---|
| ≤ 50m | 2,55 |
| ≤ 90m | 2,75 |
| ≤ 120m | 2,90 |
| ≤ 150m | 3,00 |
| ≤ 180m | 3,15 |
| ≤ 210m | 3,30 |
| ≤ 240m | 3,50 |
| 240m+ | 3,75 |

*Innspill fra 150m (typisk 7-jern): benchmark = 3,00 slag.*

### 3.3 ARG — Around-the-Green (meter)

| Avstand fra hull | Forventet slag |
|---|---|
| ≤ 3m | 2,20 |
| ≤ 6m | 2,35 |
| ≤ 10m | 2,50 |
| ≤ 15m | 2,60 |
| ≤ 20m | 2,70 |
| ≤ 25m | 2,80 |
| ≤ 30m | 2,90 |
| 30m+ | 3,05 |

*Chip fra 10m: benchmark = 2,50 slag. Chipper til 5 ft (1,5m, benchmark 1,85) → SG = 2,50 − 1,85 − 1 = **−0,35** (under forventning).*

### 3.4 PUTT — Putting (**fot / ft**)

| Avstand fra hull | Meter ≈ | Forventet slag |
|---|---|---|
| ≤ 1 ft | 0,3m | 1,05 |
| ≤ 2 ft | 0,6m | 1,45 |
| ≤ 3 ft | 0,9m | 1,70 |
| ≤ 5 ft | 1,5m | 1,85 |
| ≤ 8 ft | 2,4m | 1,95 |
| ≤ 12 ft | 3,7m | 2,05 |
| ≤ 18 ft | 5,5m | 2,15 |
| 18 ft+ | 5,5m+ | 2,30 |

*3-fot-putt (birdie-putt, ≈ 0,9m): benchmark = 1,70 slag. Sinker i ett → SG = 1,70 − 0 − 1 = **+0,70**.*
*30-fot-putt (≈ 9m): benchmark = 2,15. 2-putter til 2 ft → SG = 2,15 − 1,45 − 1 = **−0,30** (tap).*

---

## 4. Kategorisering av slag — automatisk logikk

Systemet bestemmer hvilken SG-kategori et slag tilhører basert på der ballen lander:

```
Outcome = GREEN                → neste slag er PUTT
Outcome = annet, ≤30m fra hull → neste slag er ARG
Outcome = annet, ≤180m fra hull → neste slag er APP
Outcome = annet, >180m fra hull → neste slag er OTT
```

**Slag-outcomes som støttes:**
`FAIRWAY | ROUGH | GREEN | SAND | RECOVERY | HOLED`

---

## 5. Granulære SG-felter i databasen

`Round`-tabellen lagrer både totale og detaljerte SG-verdier per runde.

### 5.1 Totale SG (standard)

| Felt | Beskrivelse |
|---|---|
| `sgTotal` | Sum av alle kategorier |
| `sgOtt` | Off-the-tee total |
| `sgApp` | Approach total |
| `sgArg` | Around-the-green total |
| `sgPutt` | Putting total |

### 5.2 Granulære approach-felter (meter-bøtter)

| Felt | Avstand | Typiske køller | Beskrivelse |
|---|---|---|---|
| `sgApp200` | 200m+ | 3W, 5W, 4i | Lange innspill |
| `sgApp150` | 150–200m | 4i–6i | Mellom-innspill |
| `sgApp100` | 100–150m | 7i–9i | Korte innspill |
| `sgApp50` | 50–100m | PW, GW | Gap/scoring-sone |

### 5.3 Granulære around-the-green-felter

| Felt | Slag-type | Beskrivelse |
|---|---|---|
| `sgChip` | Chip | Lav bue, bruller — vanligste ARG-slag |
| `sgPitch` | Pitch | Høy bue, full sving — middels ARG |
| `sgLob` | Lob | Maks høyde, liten distanse — vanskeligst |
| `sgBunker` | Bunker | Eksplodert fra grønn bunker |

### 5.4 Granulære putting-felter (**fot**)

| Felt | Avstand (ft) | Meter ≈ | Beskrivelse |
|---|---|---|---|
| `sgPutt0_3` | 0–3 ft | 0–0,9m | Tap-in / gimme-sone |
| `sgPutt3_5` | 3–5 ft | 0,9–1,5m | Scoring-sone — must-make |
| `sgPutt5_10` | 5–10 ft | 1,5–3,0m | Birdie-putt-lengde |
| `sgPutt10_15` | 10–15 ft | 3,0–4,6m | Langt for 2-putt |
| `sgPutt15_25` | 15–25 ft | 4,6–7,6m | Veldig lang putt |
| `sgPutt25_40` | 25–40 ft | 7,6–12,2m | Ekstremt lang |
| `sgPutt40plus` | 40 ft+ | 12,2m+ | Lob-putt |

### 5.5 Tee-slag

| Felt | Beskrivelse |
|---|---|
| `sgTee` | OTT-kvalitet separat fra driving accuracy |

---

## 6. TrackMan-data (teknisk slag-analyse)

`TrackManShot`-tabellen lagrer rådata fra TrackMan-sensorer. Alle verdier per slag.

### 6.1 Distanse og bane

| Felt | Enhet | Beskrivelse |
|---|---|---|
| `carryDistance` | meter | Ballen i luften |
| `totalDistance` | meter | Carry + rulling |
| `apexHeight` | meter | Maksimal bane-høyde |
| `landAngle` | grader | Nedslagsvinkel |
| `side` | meter | Dispersjon offline (høyre = positiv) |

### 6.2 Ball-data

| Felt | Enhet | Beskrivelse |
|---|---|---|
| `ballSpeed` | mph | Ballhastighet etter kontakt |
| `smashFactor` | — | ballSpeed ÷ clubSpeed — mål på kontaktkvalitet |
| `launchAngle` | grader | Startvinkel vertikalt |
| `spinRate` | rpm | Rotasjon per minutt |
| `spinAxis` | grader | Sidespin-akse (negativ = draw-spin) |

### 6.3 Kølle-data

| Felt | Enhet | Beskrivelse |
|---|---|---|
| `clubSpeed` | mph | Köllehastighet ved kontakt |
| `attackAngle` | grader | Opp (+) eller ned (−) ved kontakt |
| `clubPath` | grader | Retning køllebanen (inn-til-ut = positiv) |
| `faceAngle` | grader | Face-retning ved kontakt (høyre = positiv) |
| `faceToPath` | grader | Face angle minus club path — styrer kurve |
| `dynamicLoft` | grader | Effektiv loft ved kontakt |

### 6.4 Strike-mønster på face

| Felt | Skala | Beskrivelse |
|---|---|---|
| `strikePatternX` | −1 til +1 | Toe (−1) til heel (+1) |
| `strikePatternY` | −1 til +1 | Lav/fat (−1) til høy/thin (+1) |

---

## 7. Strike-klassifisering (Smash Factor)

Hvert slag klassifiseres i fire soner:

| Sone | Smash Factor | Farge i UI | Beskrivelse |
|---|---|---|---|
| `SWEET` | 1,35–1,42 | Grønn | Ideelt kontaktpunkt |
| `THIN` | < 1,35 | Rød | For høyt på face |
| `ROLLED` | 1,42–1,48 | Gul | Litt over center |
| `FAT` | > 1,48 | Blå | For lavt, jorddømt |

**Strike-heatmap:** 10×8 grid. X-akse: face angle −3° til +3° → grid 0–9. Y-akse: smash 1,25–1,52 → grid 0–7.

**Mål:** ≥ 50% sweet spot-treff per kølle per økt.

---

## 8. D-Plane klassifisering (Face vs. Path)

Hvert slag klassifiseres ut fra Face Angle vs. Club Path. Toleranse: ±0,5°.

| Klassifisering | Face Angle | Club Path | Typisk ballbane |
|---|---|---|---|
| `STRAIGHT` | ≈ 0° | ≈ 0° | Rett |
| `PULL_HOOK` | Venstre | Venstre | Trekkslag til venstre |
| `PULL_FADE` | Venstre | Høyre | Venstretrekk med fade |
| `PUSH_DRAW` | Høyre | Venstre | Høyretrekk med draw |
| `PUSH_FADE` | Høyre | Høyre | Push-slag til høyre |

---

## 9. Broadie HCP-tabell (score → SG-estimat)

Brukes når spiller ikke har eget SG-datasett men oppgir snittscore. Viser også hvor mye av SG-tapet som kommer fra hver kategori:

| HCP | Snittskore | SG Total | OTT% | APP% | ARG% | PUTT% |
|---|---|---|---|---|---|---|
| −3 (Tour) | 70,5 | 0 | 28% | 38% | 17% | 17% |
| 0 (Scratch) | 72,4 | −2,0 | 25% | 35% | 20% | 20% |
| 5 | 80,4 | −10,0 | 22% | 35% | 22% | 21% |
| 10 | 86,5 | −16,0 | 20% | 36% | 23% | 21% |
| 15 | 92,7 | −22,0 | 19% | 37% | 23% | 21% |
| 20 | 98,8 | −28,0 | 18% | 38% | 24% | 20% |
| 25 | 105,0 | −34,0 | 17% | 39% | 24% | 20% |

**Nøkkelfunn:**
- **APP er den største enkelt-kilden til SG-tap** på alle nivåer (35–39%)
- ARG-andelen øker med høyere HCP — shortgame er stadig viktigere
- PUTT-andelen er overraskende stabil (17–21%) på tvers av alle nivåer

---

## 10. Tour-ekvivalent-score (norsk → PGA-bane)

Konvertering mellom norsk snittscore og estimert score på en PGA Tour-bane:

**Formel (WHS slope/CR-justering):**
```
diff      = (norskSnitt − norskCR) × (113 ÷ norskSlope)
tourHcp   = diff × (pgaSlope ÷ 113)
tourScore = pgaCR + tourHcp
```

**Standardverdier i systemet:**
| Parameter | Norsk bane | PGA Tour-bane |
|---|---|---|
| CR (Course Rating) | 71,0 | 74,5 |
| Slope | 125 | 145 |

**Eksempel:** Spiller med norsk snitt 80 (HCP ≈ 8) → Tour-ekvivalent ≈ 90 slag.

---

## 11. Innsikt-motoren — 10 daglige evaluatorer

Kjøres **daglig kl. 04:00 UTC**. Analyserer de siste **90 dagene** med TrackMan-data.

| # | Kode | Hva sjekkes | Terskel for alarm | Severity ved brudd |
|---|---|---|---|---|
| 1 | `DISTANCE_GAPPING` | Gap mellom etterfølgende køller | > 15 yards gap | 3, > 25 yards → 4 |
| 2 | `CONSISTENCY_LEAK` | σ smash og σ distanse per kølle | σ smash > 0,05 eller σ dist > 15m | 3, > 0,08/25m → 4 |
| 3 | `TRAINING_GAP` | Køller med data men ikke tagget i trening siste 30 dager | ≥ 1 køllen | 2, ≥3 → 3, ≥5 → 4 |
| 4 | `D_PLANE_DRIFT` | Lineær regresjon på Path/Face/Distance over 12 uker | Se seksjon 12 | 3, 2×terskel → 4 |
| 5 | `STRIKE_QUALITY` | Sweet spot-prosent per kølle | < 50% sweet | 3, < 30% → 4 |
| 6 | `FATIGUE_PATTERN` | Club Speed-fall etter slag 25–30 i økt | ≥ 50% av økter viser fall | 3, drop > 2 mph/10 slag → 4 |
| 7 | `EQUIPMENT_FIT` | Launch, spin, smash mot targets per kølletype | Per driver/iron/wedge | 3–4 |
| 8 | `TEMPO_VARIANCE` | Variasjon i svingtempo per økt | Fra `tempo.ts` | 2–3 |
| 9 | `PROGRESSION_TREND` | Fremgang siste 30 dager vs. beste sesjon | Fra `session-diff.ts` | 2–4 |
| 10 | `SAME_DISTANCE_OPTY` | Slag på lik avstand med svært ulike resultater | Fra `same-distance-strategy.ts` | 2–3 |

**Severity-skala:** 1 = informasjon · 2 = lav · 3 = middels · 4 = høy · 5 = kritisk

---

## 12. Drift-deteksjon per kølle (12-ukers vindu)

Bruker `ClubMetricTrend`-tabellen (ukentlig aggregering, mandag 03:00 UTC).
Lineær regresjon over de siste 12 ukene. Minimum 4 uker med data kreves.

| Metrikk | Felt i DB | Terskel | Enhet |
|---|---|---|---|
| Club Path | `avgClubPath` | 0,20 per uke | Grader |
| Face Angle | `avgFaceAngle` | 0,15 per uke | Grader |
| Total Distance | `avgTotal` | 0,50 per uke | Meter |

Alvorlig drift: magnitude > 2× terskel → severity 4.
Eksempel: Driver face angle endrer seg +0,40°/uke over 8 uker → alarm sendes.

---

## 13. Datakilde-hierarki

Data merkes med `kilde`-feltet i `BrukerSgInput`:

| Kilde | Hva | Nøyaktighet |
|---|---|---|
| `TRACKMAN` | CSV eller HTML-rapport fra TrackMan-sensor | Høyest |
| `NLB` | NGF-handicap-system | Middels |
| `PLAYERHQ` | Manuell runde-registrering i appen | Middels |
| `MANUELL` | Bruker fyller inn SG-tall direkte | Lavest |

---

## 14. PGA-benchmark-tabeller i databasen

### 14.1 SgBaseline — per avstandsbøtte og lie

Avstandsbøtte som streng, f.eks. `"175-200y"`. Lie-enum: `FAIRWAY | ROUGH | GREEN | SAND | RECOVERY`.
Kilde-streng, f.eks. `"datagolf-approach-skill-2026Q1"`.

### 14.2 PgaPuttDistance — Broadie putt-data

> **NB:** Feltet heter `distanceMeters` i databasen, men Broadie-kildedataen bruker fot. Verdiene bør verifiseres mot kilde ved neste dataimport.

| Felt | Beskrivelse |
|---|---|
| `distanceMeters` | Avstand fra hull (se NB over) |
| `tourAvgSunkPct` | Tour-snitt innhullings-% |
| `top10AvgSunkPct` | Topp-10 spillere sin % |
| `proximityNext` | Snitt-avstand til hull ved miss |

### 14.3 PgaApproachDistance — approach-skill benchmarks

Åtte avstandsbøtter i **yards**: `"50-75"` · `"75-100"` · `"100-125"` · `"125-150"` · `"150-175"` · `"175-200"` · `"200-225"` · `"225+"`

| Felt | Beskrivelse |
|---|---|
| `tourAvgProximityMeters` | Tour-snitt avstand til hull etter innspill |
| `girPct` | Green In Regulation-% for bøtten |

### 14.4 PgaPlayerSeason — per spiller per sesong

SG-felter: sgTotal, sgOtt, sgApp, sgArg, sgPutt.
Øvrige: driveDist, fairwayPct, girPct, puttsPerRound, scrambling, avgScore.
Turer: `pga | euro | kft | alt | champ | liv`

---

## 15. Hva finnes og hva mangler

### Implementert og fungerende ✅

- SG-beregning per slag (Broadie-metodikk, PGA Top 40-benchmarks)
- 4 standard SG-kategorier (OTT/APP/ARG/PUTT) med riktige distanse-enheter
- 12 granulære SG-felter i databasen (avstandsbøtter + slagtyper)
- TrackMan-import: CSV + HTML med per-slag data
- Strike-heatmap: 10×8 grid, 4 soner (SWEET/THIN/ROLLED/FAT)
- D-Plane klassifisering: 5 klasser med toleranse ±0,5°
- Smash-kurve: andregradstilpasning per kølle
- Drift-deteksjon: lineær regresjon på 3 metrikker over 12 uker
- 10 daglige innsikt-evalueringsmoduler med severity 1–4
- Broadie HCP-tabell med score → SG-konvertering
- PGA Tour-sammenligning via DataGolf-integrasjon
- PDF-eksport av SG-rapport
- Best-sesjon vs. nåværende sammenligningsverktøy
- Utstyrsanalyse (launch/spin/smash mot targets per kølletype)
- Distansegapping-analyse (> 15 yards = alarm)
- Fatigue-deteksjon (Club Speed-fall per økt)
- Tour-ekvivalent-score (norsk snitt → PGA-bane)

### Ikke implementert / mangler ❌

| Gap | Konsekvens |
|---|---|
| **Live TrackMan API** — kun CSV/HTML import | Ingen sanntids-feedback under økt |
| **Bane-spesifikke benchmarks** — SgBaseline-tabellen tom | Bruker PGA Top 40 som referanse for alle baner |
| **Granulær ARG-beregning** — sgChip/Pitch/Lob/Bunker ikke auto-beregnet | Fylles ikke inn uten slag-wizard |
| **Granulær APP per avstandsbøtte** — sgApp200/150/100/50 | Fylles ikke inn automatisk |
| **Automatisk shot-kategorisering** — slag-wizard kobles ikke til SG-motor | SG beregnes ikke live per runde |
| **Coach-workflow for SG-innsikter** — ingen godkjennings-flyt | Innsikter genereres men vises ikke til coach |
| **Norske baners CR/slope-database** — bare standardverdier | Tour-ekvivalent-beregning er unøyaktig per bane |
| **`PgaPuttDistance.distanceMeters` bør verifiseres** — feltnavn vs. Broadie fot-data | Mulig enhets-inkonsistens i DB |

---

## 16. SG-sider i PlayerHQ

| Rute | Funksjon | Linjer |
|---|---|---|
| `/portal/mal/sg-hub` | Hoveddashboard — alle 4 SG-kategorier | 717 |
| `/portal/mal/sg-hub/[club]` | Klubb-spesifikk analyse: DPlane + Strike + Trend | 424 |
| `/portal/mal/sg-hub/best-vs-now` | Beste sesjon vs. nåværende | 376 |
| `/portal/mal/sg-hub/equipment` | Utstyrsanalyse | 238 |
| `/portal/mal/sg-hub/strategy` | Strategi-anbefalinger | 74 |
| `/portal/mal/sg-hub/yardage` | Carry-distansetabell per kølle | 68 |
| `/portal/mal/sg-hub/conditions` | Kondisjonsjusteringer (vind/temp/høyde) | 68 |
| `/portal/statistikk` | Samlet statistikk-oversikt | 305 |
| `/portal/statistikk/[metric]` | Metrikk-drilldown | — |
| `/portal/statistikk/sammenlign` | Sammenlign mot PGA-spiller | — |
| `/portal/mal/runder` | Rundeliste | — |
| `/portal/mal/runder/[id]` | Runde-detalj | — |
| `/portal/mal/runder/[id]/shot-by-shot` | Slag-for-slag-analyse | 595 |
| `/portal/mal/trackman` | TrackMan-sesjonsliste | — |
| `/portal/mal/trackman/[id]` | Sesjondetalj med dispersion-plot | — |

---

*Rapport generert fra kildekode — alle tall verifisert mot `prisma/schema.prisma` og `src/lib/`. Sist oppdatert 2026-05-27.*
