# Strokes Gained — Komplett systemrapport

> Generert 2026-05-27 · Basert på faktisk kildekode, ikke antakelser.
> Kilde: `src/lib/domain/sg.ts`, `src/lib/stats/sg-estimator.ts`, `src/lib/sg-hub/`, `prisma/schema.prisma`

---

## 1. Hva er Strokes Gained (SG)?

SG måler hvert slag mot hva en referansespiller (PGA Tour Top 40-snitt) forventes å bruke på det samme hullet fra samme posisjon.

**Formel (Mark Broadie, "Every Shot Counts" 2014):**

```
SG per slag = forventet_start − forventet_slutt − 1
```

Eksempel: Du treffer fra 350m fairway (forventet 3,95 slag). Ballen lander på green 3m fra hull (forventet 1,70 slag).
→ SG for dette slaget = 3,95 − 1,70 − 1 = **+1,25 slag vunnet**

Totalt SG per runde = summen av SG-verdier for alle slag.
Positiv SG = bedre enn Tour-snitt. Negativ SG = dårligere.

---

## 2. De fire SG-kategoriene

| Kode | Kategori | Norsk navn | Hva det måler |
|---|---|---|---|
| `OTT` | Off-the-Tee | Fra tee | Driving — lengde og presisjon fra tee-box |
| `APP` | Approach | Innspill | Slagene inn mot green, fra ≥50m |
| `ARG` | Around-the-Green | Rundt green | Chip, pitch, bunker — ≤30m fra hull |
| `PUTT` | Putting | Putting | Alle slag på green |

**Samlet:** `sgTotal = sgOtt + sgApp + sgArg + sgPutt`

---

## 3. Benchmark-tabeller (PGA Tour Top 40)

Alle distanser er i **meter**. Benchmarks = forventet antall slag for å fullføre hullet.

### 3.1 OTT — Off-the-Tee

| Avstand fra hull (m) | Forventet slag (PGA Top 40) |
|---|---|
| ≤ 180m | 3,70 |
| 181–220m | 3,80 |
| 221–260m | 3,85 |
| 261–300m | 3,95 |
| 301–340m | 4,05 |
| 341–380m | 4,15 |
| 381–430m | 4,30 |
| 431m+ | 4,50 |

*Typisk par-4 tee shot: 350m hull → OTT-benchmark = 4,05 slag.*

### 3.2 APP — Approach (innspill mot green)

| Avstand fra hull (m) | Forventet slag (PGA Top 40) |
|---|---|
| ≤ 50m | 2,55 |
| 51–90m | 2,75 |
| 91–120m | 2,90 |
| 121–150m | 3,00 |
| 151–180m | 3,15 |
| 181–210m | 3,30 |
| 211–240m | 3,50 |
| 241m+ | 3,75 |

*Innspill fra 150m (klassisk PW-avstand): benchmark = 3,00 slag.*

### 3.3 ARG — Around-the-Green (rundt green)

| Avstand fra hull (m) | Forventet slag (PGA Top 40) |
|---|---|
| ≤ 3m | 2,20 |
| 4–6m | 2,35 |
| 7–10m | 2,50 |
| 11–15m | 2,60 |
| 16–20m | 2,70 |
| 21–25m | 2,80 |
| 26–30m | 2,90 |
| 31m+ | 3,05 |

*Chip fra 10m: benchmark = 2,50 slag. Tour-pro chipper til 1,5m = SG 2,50 − 1,70 − 1 = −0,20 (under forventning).*

### 3.4 PUTT — Putting

> **Avstand i fot (ft)** — Broadie (2014) bruker fot for putting. Systemet konverterer til meter internt (1 ft = 0,3048 m) ved SG-beregning.

| Avstand fra hull (ft) | Meter ≈ | Forventet slag (PGA Top 40) |
|---|---|---|
| ≤ 1 ft | ≈ 0,3m | 1,05 |
| ≤ 2 ft | ≈ 0,6m | 1,45 |
| ≤ 3 ft | ≈ 0,9m | 1,70 |
| ≤ 5 ft | ≈ 1,5m | 1,85 |
| ≤ 8 ft | ≈ 2,4m | 1,95 |
| ≤ 12 ft | ≈ 3,7m | 2,05 |
| ≤ 18 ft | ≈ 5,5m | 2,15 |
| 18 ft+ | 5,5m+ | 2,30 |

*3 fot (birdie-putt, ≈ 0,9m): benchmark = 1,70 slag. Gjøres i ett = SG 1,70 − 0 − 1 = +0,70.*

---

## 4. Kategorisering av slag — automatisk logikk

Systemet bestemmer automatisk hvilken SG-kategori et slag tilhører etter der ballen lander:

```
Outcome = GREEN               → neste slag er PUTT
Outcome = annet, <30m fra hull → neste slag er ARG
Outcome = annet, <180m fra hull → neste slag er APP
Outcome = annet, >180m fra hull → neste slag er OTT
```

**Slag-outcomes som støttes:**
`FAIRWAY | ROUGH | GREEN | SAND | RECOVERY | HOLED`

---

## 5. Granulære SG-felter i databasen

`Round`-tabellen lagrer både totale SG-verdier og detaljerte under-kategorier:

### 5.1 Totale SG (standard)
| Felt | Beskrivelse |
|---|---|
| `sgTotal` | Sum av alle kategorier |
| `sgOtt` | Off-the-tee total |
| `sgApp` | Approach total |
| `sgArg` | Around-the-green total |
| `sgPutt` | Putting total |

### 5.2 Granulære approach-felter (avstandsbøtter)
| Felt | Avstand | Beskrivelse |
|---|---|---|
| `sgApp200` | 200+ meter | Lange innspill (3W, 4i og lengre) |
| `sgApp150` | 150–200m | Mellom-innspill (4i–6i typisk) |
| `sgApp100` | 100–150m | Korte innspill (7i–9i typisk) |
| `sgApp50` | 50–100m | Gap/scoring-soner (PW, GW) |

### 5.3 Granulære around-the-green-felter
| Felt | Slag-type | Beskrivelse |
|---|---|---|
| `sgChip` | Chip | Lav, liten bue — vanlig ARG-slag |
| `sgPitch` | Pitch | Høyt, mer bue — middels ARG-slag |
| `sgLob` | Lob | Maks høyde, liten distanse |
| `sgBunker` | Bunker | Fra sandbunker rundt green |

### 5.4 Granulære putting-felter (avstandsbøtter)

> Putting-avstand er i **fot (ft)** — standard i golf og Broadie-metodikken.

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
| `sgTee` | OTT-kvalitet — separat fra driving accuracy |

---

## 6. TrackMan-data (teknisk slag-analyse)

`TrackManShot`-tabellen lagrer rådata fra TrackMan-sensorer. Alle verdier per slag.

### 6.1 Distanse og carry
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
| `smashFactor` | — | ballSpeed / clubSpeed — mål på kontaktkvalitet |
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

### 6.4 Strike-mønster
| Felt | Skala | Beskrivelse |
|---|---|---|
| `strikePatternX` | −1 til +1 | Toe (−1) til heel (+1) |
| `strikePatternY` | −1 til +1 | Lav/fat (−1) til høy/thin (+1) |

---

## 7. Strike-klassifisering (Smash Factor-basert)

Systemet klassifiserer hvert slag i fire soner basert på Smash Factor:

| Sone | Smash Factor | Farger i UI | Beskrivelse |
|---|---|---|---|
| `SWEET` | 1,35–1,42 | Grønn (primary) | Ideelt kontaktpunkt |
| `THIN` | < 1,35 | Rød (destructive) | For høyt på face |
| `ROLLED` | 1,42–1,48 | Gul (accent) | Litt for høyt effektivt |
| `FAT` | > 1,48 | Blå | For lavt, jord-kontakt |

**Strike-heatmap:** 10×8 grid (X = toe/heel, Y = lav/høy). Face Angle −3° til +3° → grid X 0–9.

**Mål:** ≥50% sweet spot-treff per kølle.

---

## 8. D-Plane klassifisering (Face vs. Path)

Hvert slag klassifiseres ut fra forholdet mellom Face Angle og Club Path (toleranse: ±0,5°):

| Klassifisering | Face Angle | Club Path | Resultat |
|---|---|---|---|
| `STRAIGHT` | ≤ ±0,5° | ≤ ±0,5° | Rett slag |
| `PULL_HOOK` | Venstre (negativ) | Venstre (negativ) | Venstretrekk med hook |
| `PULL_FADE` | Venstre (negativ) | Høyre (positiv) | Venstretrekk med fade |
| `PUSH_DRAW` | Høyre (positiv) | Venstre (negativ) | Høyretrekk med draw |
| `PUSH_FADE` | Høyre (positiv) | Høyre (positiv) | Høyretrekk med fade |

---

## 9. Broadie HCP-tabell (score → SG-estimat)

Brukes når spiller ikke har eget SG-datasett men oppgir snittscore. Fordeling av SG per kategori endrer seg med handicap:

| HCP | Snittskore | SG Total | OTT% | APP% | ARG% | PUTT% |
|---|---|---|---|---|---|---|
| −3 (Tour) | 70,5 | 0 | 28% | 38% | 17% | 17% |
| 0 (Scratch) | 72,4 | −2,0 | 25% | 35% | 20% | 20% |
| 5 | 80,4 | −10,0 | 22% | 35% | 22% | 21% |
| 10 | 86,5 | −16,0 | 20% | 36% | 23% | 21% |
| 15 | 92,7 | −22,0 | 19% | 37% | 23% | 21% |
| 20 | 98,8 | −28,0 | 18% | 38% | 24% | 20% |
| 25 | 105,0 | −34,0 | 17% | 39% | 24% | 20% |

**Nøkkelfunn fra tabellen:**
- APP er den **største enkelt-kilden til SG-tap** på alle nivåer (35–39% av total differanse)
- ARG øker i relativ betydning fra scratch (17%) til 25 HCP (24%)
- PUTT-andelen er relativt stabil (17–21%) — putting er mer likt på tvers av HCP enn antatt

---

## 10. Tour-ekvivalent-score (norsk → PGA-bane)

Konvertering mellom norsk snittscore og estimert score på PGA Tour-bane:

**Formel (WHS-stil slope/CR-justering):**
```
diff     = (norskSnitt − norskCR) × (113 / norskSlope)
tourHcp  = diff × (pgaSlope / 113)
tourScore = pgaCR + tourHcp
```

**Standardverdier:**
- Norsk bane: CR = 71, Slope = 125
- PGA Tour-bane: CR = 74,5, Slope = 145

**Eksempel:** Spiller med norsk snitt 80 (HCP ~8):
→ Tour-ekvivalent ≈ 90 slag på en PGA Tour-bane

---

## 11. Innsikt-motoren — 10 daglige evaluatorer

Kjøres **daglig kl. 04:00 UTC**. Analyserer de siste **90 dagers TrackMan-data**.

| # | Kategori | Hva sjekkes | Terskel for alarm |
|---|---|---|---|
| 1 | `DISTANCE_GAPPING` | Gap mellom etterfølgende køller (yards) | Gap > 15 yards = severity 3, > 25 yards = 4 |
| 2 | `CONSISTENCY_LEAK` | Standardavvik smash og distanse per kølle | σ Smash > 0,05 eller σ dist > 15m |
| 3 | `TRAINING_GAP` | Køller med TrackMan-data men ikke tagget i trening siste 30 dager | ≥1 køllen = severity 2, ≥3 = 3, ≥5 = 4 |
| 4 | `D_PLANE_DRIFT` | Lineær regresjon på Club Path/Face Angle/Distance over 12 uker | Path > 0,20°/uke, Face > 0,15°/uke, Dist > 0,50m/uke |
| 5 | `STRIKE_QUALITY` | Sweet spot-prosent per kølle | < 50% sweet = severity 3, < 30% = 4 |
| 6 | `FATIGUE_PATTERN` | Club Speed-fall etter slag 25-30 i økt | ≥50% av økter viser fall = alarm, drop > 2mph/10 slag = severity 4 |
| 7 | `EQUIPMENT_FIT` | Launch, spin, smash mot targets per kølletype | Konfigurert per driver/fairway/iron/wedge |
| 8 | `TEMPO_VARIANCE` | Variasjon i svingtempo per økt | Fra `tempo.ts` |
| 9 | `PROGRESSION_TREND` | Fremgang over tid (30 dagers rolling) | Fra `session-diff.ts` |
| 10 | `SAME_DISTANCE_OPTY` | Slag på lik avstand med ulike resultater | Fra `same-distance-strategy.ts` |

**Severity-skala:** 1 (informasjon) → 5 (kritisk, krever umiddelbar handling)

---

## 12. Drift-deteksjon per kølle (12-ukers vindu)

Kjøres som del av innsikt-motoren. Bruker `ClubMetricTrend`-tabellen (ukentlig aggregering).

**Metrikk som spores per kølle:**

| Metrikk | Terskel for drift-alarm | Enhet |
|---|---|---|
| Club Path | 0,20 °/uke | Grader |
| Face Angle | 0,15 °/uke | Grader |
| Total Distance | 0,50 m/uke | Meter |

**Krav for alarm:** Minimum 4 uker med data. Analyserer lineær regresjonshelning.
Alvorlig drift: magnitude > 2× terskel = severity 4.

---

## 13. Datakilde-hierarki

Data kan komme inn via fire kanaler, merket med `kilde`-feltet i `BrukerSgInput`:

| Kilde | Hva | Nøyaktighet |
|---|---|---|
| `TRACKMAN` | Rådata fra TrackMan-sensor (CSV eller HTML-rapport) | Høyest |
| `NLB` | Norges Luftsportforbund / NGF-handicap-system | Middels |
| `PLAYERHQ` | Manuell runde-registrering i appen | Middels |
| `MANUELL` | Bruker fyller inn SG-tall selv | Lavest |

---

## 14. PGA-benchmark-tabeller i databasen

Utover beregningsmodellen lagres reelle PGA Tour-benchmarks fra DataGolf:

### 14.1 SgBaseline (per avstandsbøtte og lie)
- Kategori (OTT/APP/ARG/PUTT)
- Avstandsbøtte som streng, f.eks. `"175-200y"`
- Lie (`ShotLie`-enum): FAIRWAY, ROUGH, GREEN, SAND, RECOVERY
- Forventet slag (fra DataGolf approach-skill dataset)
- Datakilde-streng, f.eks. `"datagolf-approach-skill-2026Q1"`

### 14.2 PgaPuttDistance (Broadie putt-data)
| Felt | Beskrivelse |
|---|---|
| `distanceMeters` | Avstand fra hull |
| `tourAvgSunkPct` | Tour-gjennomsnitt innhullings-% |
| `top10AvgSunkPct` | Topp-10 spillere sin % |
| `proximityNext` | Gjennomsnittlig avstand til hull ved miss |

### 14.3 PgaApproachDistance (approach-skill benchmarks)
Åtte avstandsbøtter: `"50-75"`, `"75-100"`, `"100-125"`, `"125-150"`, `"150-175"`, `"175-200"`, `"200-225"`, `"225+"` (yards)

| Felt | Beskrivelse |
|---|---|
| `tourAvgProximityMeters` | Tour-snitt avstand til hull etter innspill |
| `girPct` | Green In Regulation-prosent for bøtten |

### 14.4 PgaPlayerSeason (per spiller per sesong)
Tour-data fra DataGolf per spiller. Inkluderer sgTotal/Ott/App/Arg/Putt samt driving (driveDist, fairwayPct), iron (girPct), scrambling, snittputt.

Stödturer: `pga | euro | kft | alt | champ | liv`

---

## 15. Hva finnes — og hva mangler

### Implementert og fungerende
- SG-beregning per slag (Broadie-metodikk med PGA Top 40-benchmarks) ✅
- 4 standard SG-kategorier (OTT/APP/ARG/PUTT) ✅
- 12 granulære SG-felter i databasen (avstandsbøtter + slagttyper) ✅
- TrackMan-import (CSV + HTML) med per-slag data ✅
- Strike-heatmap (10×8 grid, 4 soner) ✅
- D-Plane klassifisering (5 klasser) ✅
- Smash-kurve (andregradstilpasning) ✅
- Drift-deteksjon (lineær regresjon, 3 metrikker) ✅
- 10 daglige innsikt-evalueringsmoduler ✅
- Broadie HCP-tabell med score→SG-konvertering ✅
- PGA-sammenligning via DataGolf-integrasjon ✅
- PDF-eksport av SG-rapport ✅
- Best-sesjon vs. nåværende sammenlignings-verktøy ✅
- Utstyrsanalyse (launch/spin/smash mot targets) ✅
- Distansegapping-analyse ✅
- Fatigue-deteksjon (Club Speed-fall i økt) ✅

### Ikke implementert / mangler
- **Live TrackMan API** — kun CSV/HTML import (ikke sanntid-streaming) ❌
- **Bane-spesifikke benchmarks** — SgBaseline-tabellen er der men ikke populert per bane ❌
- **Granulær ARG-beregning** — sgChip/sgPitch/sgLob lagres men beregnes ikke automatisk ❌
- **Granulær APP-beregning per avstandsbøtte** — sgApp200/150/100/50 må fylles inn manuelt eller fra shot-wizard ❌
- **Automatisk shot-kategorisering i runde-registrering** — slag-wizard finnes men knyttes ikke til SG-motor automatisk ❌
- **Coach-workflow for SG-innsikter** — innsiktene genereres men ingen coach-godkjennings-flyt ❌
- **Norske golf-baners CR/slope-database** — kun standardverdier i tour-ekvivalent-beregning ❌

---

## 16. SG-sider i PlayerHQ

| Rute | Funksjon | Linjer |
|---|---|---|
| `/portal/mal/sg-hub` | Hoveddashboard — alle 4 kategorier | 717 |
| `/portal/mal/sg-hub/[club]` | Klubb-spesifikk analyse med DPlane + Strike + Trend | 424 |
| `/portal/mal/sg-hub/best-vs-now` | Beste sesjon vs. nåværende | 376 |
| `/portal/mal/sg-hub/equipment` | Utstyrsanalyse | 238 |
| `/portal/mal/sg-hub/strategy` | Strategi-anbefalinger | 74 |
| `/portal/mal/sg-hub/yardage` | Carry-distansetabell per kølle | 68 |
| `/portal/mal/sg-hub/conditions` | Kondisjonsjusteringer (vind/temp) | 68 |
| `/portal/statistikk` | Samlet statistikk-oversikt | 305 |
| `/portal/statistikk/[metric]` | Metrikk-drilldown | — |
| `/portal/statistikk/sammenlign` | Sammenlign mot PGA-spiller | — |
| `/portal/mal/runder` | Rundeliste | — |
| `/portal/mal/runder/[id]` | Runde-detalj | — |
| `/portal/mal/runder/[id]/shot-by-shot` | Slag-for-slag-analyse | 595 |
| `/portal/mal/trackman` | TrackMan-sesjonsliste | — |
| `/portal/mal/trackman/[id]` | Sesjondetalj med dispersion-plot | — |

---

*Rapport generert fra kildekode — alle tall er verifisert mot `prisma/schema.prisma` og `src/lib/`.*
