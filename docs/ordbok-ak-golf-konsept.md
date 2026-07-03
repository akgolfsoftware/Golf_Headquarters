# AK Golf — Ordbok / Glossary (konsept & system)

Autoritativ referanse for alle fagbegreper, koder og systemord i AK Golf-konseptet. Felles språk for utviklere, trenere og AI-agenter. **Del A** = hva begrepene betyr. **Del B** = hvordan ord staves i UI.

**Kilde-hierarki:** 1) MasterBrain CANON v3.5 (`~/Developer/Masterbrain/knowledge/concepts/canon-methodology.json`, 2026-06-16) + `l-faser.json` — fasit for konsept-verdier; harde regler er versjonert der og kan endres av Anders. 2) Intelligence-taksonomien (`ak-golf-intelligence/shared/training/ak-taxonomy.ts`) — enheter: putting i **fot**, innspill i yards. 3) Kodebasen (`src/lib/taxonomy.ts`, `prisma/schema.prisma` m.fl.) — fasit for kode-identifiere; avviker koden fra canon i VERDIER, vinner canon (flagget «Kode-status»).

> **Tre forvekslinger å passe på:**
> 1. **Læringsfase (`LFase`: L_KROPP…L_AUTO) ≠ periodiseringsfase (`LPhase`: GRUNN/SPESIAL/TURNERING).**
> 2. **Tre ferdighets-inndelinger:** `SGKategori` (trening) ≠ `SkillArea` (SG-statistikk) ≠ `SgCategory` (SG-beregning OTT/APP/ARG/PUTT). Se §4 og §10.
> 3. **Tre miljø-begreper:** `M_MILJO` (M0–M5) ≠ `SessionEnvironment` (stedtype) ≠ `TrackManEnvironment` (målested). Se §5.

Endringer: oppdater canon → denne fila → kode (prosess nederst). Tabellformat: Norsk term | Teknisk term | Definisjon & bruk.

**Del A:** 1 Pyramiden · 2 L-faser · 3 CS · 4 Treningsområder · 5 Miljø/Press · 6 P-systemet · 7 FYS · 8 Praksistyper · 9 Periodisering · 10 Strokes Gained · 11 TrackMan-parametere · 12 TrackMan-analyser · 13 Invarianter · 14 Planleggingshjernen · 15 Datamodell & enums · 16 Andre begreper
**Del B:** UI-tekst & rettskriving (B1–B24, inkl. forbudt-liste)

---

# Del A — Konsept & system

## 1. Pyramiden

5-trinns treningspyramide — grunnmuren. Hver drill/økt merkes med ETT område; perioder setter min/maks-fordeling.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Pyramide | `PYRAMIDE` / `PyramidArea` | De fem områdene FYS, TEK, SLAG, SPILL, TURN. Idealfordeling summerer til 1,0; styres av periode-min/max. |
| Fysisk | `FYS` | Styrke, kondisjon, bevegelighet. Eneste område med drillmodus FYS (reps/sett/kg/tid/sone). Tyngst i grunn-/ferieperioder (FERIE ≥ 40 % FYS). Farge `pyr-fys`. |
| Teknisk | `TEK` | Teknisk svingarbeid. Knyttes til L-faser og P-posisjoner. Maks 40 % i GRUNN/SPESIALISERING. Farge `pyr-tek`. |
| Slag | `SLAG` | Slagøvelser (putt, chip, bunker, fulle slag mot mål). Øker mot spesialisering/turnering. Farge `pyr-slag`. |
| Spill | `SPILL` | Spilltrening (simulert spill på bane). Øker mot turnering/evaluering. Farge `pyr-spill`. |
| Turnering | `TURN` | Toppen: kamp-/mental trening, reelt konkurransespill. Maks 45 % i TURNERING, 65 % i EVALUERING. Farge `pyr-turn`. |
| Drillmodus | `DrillModus` (`FYS`\|`GOLF`) | FYS gir reps/sett/kg/tid/sone; GOLF gir treningsområde/L-fase/P-posisjoner/miljø. Via `getDrillModus()` / `isFysDrill()`. |
| FYS-parametersett | `FysParameters` | Feltene en FYS-drill logger (fysType, muskelgrupper, sone, reps, sett, kg, tid). Valideres automatisk (Zod) i `parametersJson`. |
| GOLF-parametersett | `GolfParameters` | Feltene en golf-drill logger: treningsområde, L-fase, P-posisjoner, miljø. Lagres i `parametersJson`. |
| Pyramide-fordeling | `vurderPyramide()` / `PyramidFordeling` | Faktisk øktfordeling målt mot idealfordeling, med avvik og tekstlig anbefaling. Avvik < 5 pp = «på plan». |
| Drill-malkategori | `DRILL_MAL_KATEGORIER` | 11 malkategorier som hver mapper til ett pyramide-område (TEKNIKK→TEK, PUTT_DRILL→SLAG, MENTAL_DRILL→TURN …). |

## 2. L-faser (læringsfaser)

Hvor langt en bevegelse er innlært — fra kropp til automatisering. Fasit: canon v3.5 + l-faser.json. **Prioritetsregel: L-KROPP og L-ARM overstyrer ALL SG-prioritering — ingen SG-diagnostikk i disse fasene.** NB: `LFase` ≠ `LPhase` (periodisering, §9).

| Norsk term | Teknisk term | Definisjon & bruk (canon v3.5) |
|---|---|---|
| L-fase | `LFase` / `L_FASER` | Fem trinn: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO. Styrer CS-intervall, miljø og TEK-andel; begrenses per periode via `lFaserTillatt`. |
| L-Kropp | `L_KROPP` | Kun kropp — rotasjon, vektoverføring, ryggradsposisjon. CS20–40 · M0–M1 · TEK 60–80 % · ingen ball. Utstyr: speil, alignment-sticks. |
| L-Arm | `L_ARM` | Armer uten kølle — arm-/håndposisjon, grep. CS20–50 · M1–M2 · TEK 50–70 % · minimal ball. Utstyr: alignment-sticks, impact-bag. |
| L-Kølle | `L_KOLLE` | Med kølle, uten ball — kølle-følelse, path, face control. CS50–70 · M2–M3 · TEK 40–60 %. Kode-id uten ø. |
| L-Ball | `L_BALL` | Ball + økende hastighet — konsistens og kontakt. CS60–80 · M3–M4 · TEK 30–50 %. SG relevant, fortsatt teknikk-fokus. |
| L-Auto | `L_AUTO` | Automatikk + miljø + variasjon — overføring til bane/press/random. CS80–100 · M4–M5 · TEK 20–40 %. Eneste fase i TURNERING; 100 % i EVALUERING. |
| Anbefalt CS per L-fase | `LFASE_ANBEFALT_CS` | Kart L-fase → anbefalte CS-nivåer. Kode-status: koden har gamle CS50–100-mapper — skal oppdateres til canon-intervallene over. |

## 3. CS — Club Speed

Køllehodehastighet i % av spillerens maks — én av de fire AK-formel-aksene. Fasit: canon v3.5, **ni nivåer CS20–CS100**. CS betyr Club Speed — ikke «Capacity Stress», ikke «Confidence Score».

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| CS-nivå | `CSNivaa` / `CS_NIVAER` | Ni treningstempoer CS20–CS100. Begrenses av `csMax` per periode; klassifiserer rep-hastighet (LAV/FULL). Kode-status: Prisma-enum har kun CS50–CS100 — CS20/30/40 mangler. |
| CS20 / CS30 / CS40 | `CS20` `CS30` `CS40` | 20 % bevegelsesdrill uten ball · 30 % langsom teknisk drill · 40 % halvfart teknisk drill. L_KROPP/L_ARM. (Venter kode.) |
| CS50 | `CS50` | 50 % — minimum for balltrening. LAV-klassifisering (CS50–CS70). |
| CS60 | `CS60` | 60 % — moderat balltrening. |
| CS70 | `CS70` | 70 % — kontrollert full swing. Grense LAV/FULL rep-hastighet. |
| CS80 | `CS80` | 80 % — full swing med kontroll. FULL-klassifisering (CS80–CS100). |
| CS90 | `CS90` | 90 % — tour-speed trening. |
| CS100 | `CS100` | 100 % — maks hastighet. |
| CS-progresjon | `beregnCsProgresjon()` / `CsProgresjon` | CS-utvikling (mph) som 4-ukers rullende snitt over 8 uker, med endring, trend og skadevarsel. Fra TrackMan-økter. |
| CS-trend | `CsTrend` | OPP / FLAT / NED. FLAT ved \|endring\| ≤ 2 % (`TREND_TERSKEL_PCT`). |
| Skadevarsel | `MULIG_SKADE` / `CsVarsel` | Flagg når siste ukes CS-snitt faller > 3 mph under nest-siste uke (mulig skade/overbelastning). |

## 4. Treningsområder

16 golf-treningsområder etter avstand/situasjon, hvert med SG-kategori. **Enheter: putting i fot (ft), aldri meter; innspill i yards i intelligence-taksonomien — meter-labels i eldre kode fases ut.**

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Treningsområde | `TRENINGSOMRADER` / `Treningsomrade` | De 16 områdene under. Settes på GOLF-drills (`treningsomrade`); grupperes til fokus via `TEMPLATE_FOCUS`. |
| Tee-slag | `TEE` | Utslag fra tee. SG-kategori `TEE`. |
| Innspill 150–200 m / 100–150 m / 50–100 m | `INN200` `INN150` `INN100` | Innspill etter avstand (meter i dagens kode; yards i intelligence-taksonomien). SG-kategori `TILNAERMING`. |
| Innspill 0–50 m | `INN50` | Nærspill-innspill. SG-kategori `KORT_SPILL`. |
| Chip | `CHIP` | Lavt rullende nærspill. SG-kategori `KORT_SPILL`. |
| Pitch | `PITCH` | Høyere, mykere nærspill. SG-kategori `KORT_SPILL`. |
| Lob | `LOB` | Høyt slag med rask stopp. SG-kategori `KORT_SPILL`. |
| Bunker | `BUNKER` | Sandslag rundt green. SG-kategori `KORT_SPILL`. |
| Putt 0–3 ft | `PUTT0_3` | Korte putter. SG-kategori `PUTTING`. Kode-labels med «m» er feil og rettes. |
| Putt 3–6 ft | `PUTT3_6` | Mellomdistanse-putter. |
| Putt 6–10 ft | `PUTT6_10` | Lengre putter. |
| Putt 10–20 ft | `PUTT10_20` | Lange putter / lag-putt. |
| Putt 20–40 ft | `PUTT20_40` | Svært lange putter. |
| Putt 40 ft+ | `PUTT40P` | Ekstreme lag-putter. |
| Spill (simulert) | `SPILL` | Helhetlig simulert spill. SG-kategori `SPILL`. |
| SG-kategori (taksonomi) | `SGKategori` | Grov gruppe: TEE, TILNAERMING, KORT_SPILL, PUTTING, SPILL. Avledes fra `TRENINGSOMRADER`. Ikke identisk med SkillArea eller SgCategory. |
| SG-ferdighetsområde | `SkillArea` | Statistikk-enum: TEE_TOTAL, TILNAERMING, AROUND_GREEN, PUTTING, SPILL. TEE_TOTAL ≠ TEE; AROUND_GREEN ≠ KORT_SPILL. Norsk UI-tekst for AROUND_GREEN = «Nærspill». |
| Fokus-mal | `TEMPLATE_FOCUS` | Forhåndsdefinerte øktfokus (Full bag, Nærspill, Putting, Langt spill, Tilnærming, Bunker, Turneringsprep) → sett av treningsområder via `getOmraaderForFokus()`. Kode-enum heter `KORT_SPILL`; UI-tekst «Nærspill». |

## 5. Miljø (M) og Press (PR)

M = miljøets struktur/kontroll (M0 mest kontrollert → M5 konkurranse), PR = press/konsekvens. Fasit: canon v3.5.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Miljø-kode | `M_MILJO` / `MMiljo` | 6-trinns skala M0–M5, settes på øktnivå (`miljo`). Auto-genererte økter får M2. AK-formel-akse. |
| M0 — Kontrollert, uten ball | `M0` | Kontrollert range/rom, ingen mål, ingen ball. Hjemmet til L_KROPP. |
| M1 — Kontrollert, enkelt mål | `M1` | Kontrollert range med ett enkelt mål. |
| M2 — Range med mål og distanser | `M2` | Driving range med definerte mål og distanser. Default for auto-genererte økter. |
| M3 — Baneøving uten konkurranse | `M3` | Greenside, treningsgreen, bane uten konkurranse. |
| M4 — Bane med scoringsfokus | `M4` | Simulert konkurranse på bane. |
| M5 — Turneringsforhold | `M5` | Faktiske turneringsforhold. |
| Press-nivå | `PR_PRESS` / `PressureLevel` / `PRPress` | 5-trinns skala PR1–PR5, settes på øktnivå sammen med M. Samme skala som `PressureLevel` (Spor A) og `PRPress` (V2). |
| PR1 — Minimalt press | `PR1` | Ren teknikk-drill, ingen konsekvens. |
| PR2 — Lett press | `PR2` | Mål definert, ingen konkurranse. |
| PR3 — Moderat press | `PR3` | Scoringssystem eller partner involvert. |
| PR4 — Høyt press | `PR4` | Simulert turneringsrunde eller poeng/økonomi på spill. |
| PR5 — Maksimalt press | `PR5` | Faktisk turneringssituasjon. |
| Øktmiljø (sted) | `SessionEnvironment` | Konkret STEDTYPE en økt logges på: RANGE, BANE, STUDIO, HJEM, SIMULATOR, GYM. Chip ved øktlogging. Sted ≠ konkurransenærhet (M). |
| TrackMan-miljø | `TrackManEnvironment` | Hvor en TrackMan-måling ble gjort: SIMULATOR_INDOOR, NET_INDOOR, RANGE_OUTDOOR_MAT, RANGE_OUTDOOR_GRASS, COURSE_PRACTICE, COURSE_COMPETITION. Påvirker tolkning. |

## 6. P-systemet (svingposisjoner)

Standardiserte svingposisjoner P1–P10 fra adresse til hold finish. Koden ([taxonomy.ts] `P_POSISJONER` og teknisk-plan `P_POSITIONS`) har **10 posisjoner uten halvtrinn**; MORAD-metodikken bruker i tillegg halvtrinn som konsept.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| P-system | `P_POSISJONER` / `P_POSITIONS` | Posisjonsnomenklatur P1.0–P10.0. Markerer hvilke posisjoner en teknisk drill jobber med (`pPosisjoner`, lagres som strenger). |
| P1 — Adresse | `P1.0` | Oppstilling før svingen starter. |
| P2 — Takeaway | `P2.0` | Tidlig tilbakesving, kølle parallell med bakken. |
| P3 — Halvveis tilbake | `P3.0` | Ledende arm parallell med bakken (backswing). MORAD-navn: «Arm parallell (BS)». |
| P4 — Topp | `P4.0` | Toppen av tilbakesvingen. |
| P5 — Transisjon | `P5.0` | Overgang tilbakesving→nedsving. MORAD-navn: «Arm parallell (DS)». |
| P6 — Halvveis ned | `P6.0` | Kølle parallell i nedsving. MORAD-navn: «Treff». |
| P7 — Impact | `P7.0` | Trefføyeblikket. MORAD-navn: «Arm parallell (FT)». |
| P8 — Tidlig oppfølging | `P8.0` | Rett etter treff. MORAD-navn: «Finish». |
| P9 — Kølle parallell etter impact | `P9.0` | Oppfølging, kølle parallell. MORAD-navn: «Rebalance». |
| P10 — Finish | `P10.0` | Holder finish-stillingen. MORAD-navn: «Hold finish». |
| MORAD-halvtrinn | `P4.5` `P5.5` `P6.5` `P7.5` | Halvposisjoner fra MORAD-metodikken (Transition, Shaft parallell DS, Shaft parallell FT, Arm over skulder). Konsept-termer — finnes IKKE i kodens posisjonssett i dag. |

## 7. FYS — fysiske underkategorier

Parametre for fysisk trening (drillmodus FYS). Hver treningstype aktiverer sitt loggfelt-sett.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| FYS-treningstype | `FYS_TRENINGSTYPER` | Fem typer, hver med eget parametersett (velges via `fysType`; styrer input-feltene i UI). |
| Styrke | `STYRKE` | Styrketrening med motstand. Felter: reps, sett, kg. |
| Bevegelighet | `BEVEGELIGHET` | Tøyetrening. Felter: sett, tid, bevegelighetstype. |
| Kondisjon | `KONDISJON` | Utholdenhet. Felter: tid, sone, aktivitet. |
| Mobilitet | `MOBILITET` | Leddbevegelighet under kontroll. Felter: reps, sett, tid. |
| Aktivering | `AKTIVERING` | Aktivering/oppvarming før belastning. Felter: reps, sett. |
| FYS-parametersett | `FysParameterSett` | Bool-sett per treningstype: hvilke felter (reps/sets/kg/tid/sone/type) som er relevante. Styrer live-økt og plan-bygger. |
| FYS-muskelgruppe | `FYS_MUSKELGRUPPER` | 9 muskelgrupper med golfrelevans (flervalg via `muskelgrupper`): Hoftefleksorer (`HOFTEFLEKSORER`, hofterotasjon i nedsving) · Gluteus (`GLUTEUS`, kraft/stabilitet) · Core (`CORE`, rotasjonsstabilitet/X-faktor) · Skuldre (`SKULDRE`, armplan) · Thorax (`THORAX`, brystrotasjon/holdning) · Hamstrings (`HAMSTRINGS`, benstabilitet) · Underarmer (`UNDERARMER`, grep/håndledd) · Rygg (`RYGG`, holdning/rotasjon) · Quadriceps (`QUADRICEPS`, benstyrke/balanse). |
| Kondisjonssone | `KONDISJON_SONER` | Fem HR-/RPE-soner: Sone 1 Restitusjon (`SONE_1`, HR 50–60 %, RPE 1–2) · Sone 2 Aerob base (`SONE_2`, 60–70 %, 3–4) · Sone 3 Terskel (`SONE_3`, 70–80 %, 5–6) · Sone 4 VO2max (`SONE_4`, 80–90 %, 7–8) · Sone 5 Anaerob (`SONE_5`, 90–100 %, 9–10). |
| Bevegelighetstype | `BEVEGELIGHET_TYPER` | Tøyemetode: STATISK, DYNAMISK, PNF, MYOFASCIAL. |
| Kondisjonsaktivitet | `KONDISJON_AKTIVITETER` | Treningsform: GANGE, LØPING, SYKKEL, ROING, SVØMMING, SKIERG, INTERVALL, ANNET. |

## 8. Praksistyper

Øvingsmetode — fra isolert repetisjon til presset spill. NB: øktnivå-enum `PracticeType` bruker **RANDOM**; drillnivå-enum `DrillPracticeType` bruker **VARIABEL** — motstykker.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Praksistype | `PracticeType` / `PRAKSISTYPER` | Øktnivå, kortkoder B/R/K/S. `praksisFordeling` per periode angir anbefalt miks. Auto-genererte økter = BLOKK. |
| Blokk (B) | `BLOKK` | Samme oppgave repeteres — isolert innlæring. Dominerer grunnperiode (70 %) og ferie (80 %). |
| Random (R) | `RANDOM` | Tilfeldig variasjon mellom oppgaver (interleaving). Øktnivå-motstykke til VARIABEL. |
| Komparativ/Konkurranse (K) | `KONKURRANSE` | Scorer mot krav under press. Øker mot turnering/evaluering. |
| Simulator/Test (S) | `SPILL_TEST` | Test eller simulert spill mot standard. Kobles til test-/benchmark-flyt. |
| Treningstype (drill) | `DrillPracticeType` | Drillnivå: BLOKK, VARIABEL, KONKURRANSE, SPILL_TEST. Settes på `ExerciseDefinition.treningstype`. |

## 9. Periodisering

Sesongen delt i faser med mål og constraints. **To enum-sett:** `PeriodeType` (5 verdier) vs `LPhase` (3 — mangler EVALUERING/FERIE, bruker SPESIAL for SPESIALISERING).

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Periodisering | — | Treningsåret i faser; hver periode har CS-tak, volum-tak, tillatte L-faser og pyramide-/praksis-fordeling. |
| Periode-type | `PeriodeType` | GRUNN, SPESIALISERING, TURNERING, EVALUERING, FERIE. Brukes i `PERIODE_CONSTRAINTS`. |
| Periodiseringsfase | `LPhase` | Parallelt 3-verdis enum: GRUNN, SPESIAL, TURNERING. På `PeriodBlock`/`PlanTemplate`. Ikke læringsfasen `LFase`! |
| Grunnperiode | `GRUNN` | Fysisk basis + tekniske grunnferdigheter. CS-tak 70 %. FYS 25–40 %, TEK 25–40 %. L_KROPP/L_ARM/L_KOLLE. 420–720 min/uke. Min. 2 hviledager. |
| Spesialiseringsperiode | `SPESIALISERING` | Teknikk integreres i slag og spill. CS-tak 90 %. SLAG 20–40 %, SPILL 15–35 %. L_BALL/L_AUTO. 480–840 min/uke. Maks 6 økter/uke. |
| Turneringsperiode | `TURNERING` | Automatisering + turneringsforberedelse. CS-tak 100 %. TURN 20–45 %. Kun L_AUTO; turneringslås på. 240–480 min/uke. Maks 5 økter/uke. |
| Evalueringsperiode | `EVALUERING` | Test og vurdering — mye simulert spill. TURN 30–65 %, SPILL 20–45 %. 100 % L_AUTO. 180–360 min/uke. (Kun i `PeriodeType`.) |
| Ferieperiode | `FERIE` | Vedlikehold, fysisk fokus, lavt volum. FYS ≥ 40 %. L_KROPP/L_ARM. 60–240 min/uke. (Kun i `PeriodeType`.) |
| Periode-constraints | `PERIODE_CONSTRAINTS` / `PERIODE_TYPER` | Reglene per periode (pyramide-min/max, L-fordeling, praksis, volum, csMax, hviledager). Håndheves av `validateSessionConstraints` / `validerPeriodBlock`. |
| Periodeblokk | `PeriodBlock` | Tidsspenn i sesongplanen (`SeasonPlan`) med én L-fase og ukentlige volum-grenser; `weeklyVolMin/Max` valideres mot fasens `maxVolumMin`. Kan ha `TechnicalPlan` og coach-fokus (`focus`). |
| Periode-farger | `PERIODE_FARGER` | UI-fargekart per periode (GRUNN mørk grønn, FERIE stripe …). Konsistent i lys/mørk. |

## 10. Strokes Gained (SG) og benchmarks

SG = verdien av et slag mot en referanse: forventet slag fra start − forventet slag fra slutt − 1. Formateres med komma og fortegn («+1,2»).

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Strokes Gained | SG / `beregnSg()` | Beregnes fra slag-data (kategori, distanse, utfall, distanse etter). Vises i SG-hub og statistikk. |
| SG off-the-tee | `OTT` | SG for driving/utslag. Norsk fokus-tekst: «Tee-slag». |
| SG approach | `APP` | SG for innspill mot green. Norsk: «Innspill». |
| SG around-the-green | `ARG` | SG for nærspill rundt green (chip/pitch/bunker). Norsk: «Nærspill». |
| SG putting | `PUTT` | SG for putting. Norsk: «Putting». |
| Slag-utfall | `SgOutcome` | Hvor slaget endte: FAIRWAY, ROUGH, GREEN, SAND, RECOVERY, HOLED. Avgjør benchmark for sluttposisjon. |
| Benchmark | `BenchmarkGroup` | Forventet antall slag fra gitt posisjon/distanse, per kategori (8–15 distansegrupper). |
| PGA Tour Top 40-baseline | `BENCHMARK_OTT/APP/ARG` | Referanser interpolert fra Mark Broadie, *Every Shot Counts* (2014). Fasit for tee/approach/nærspill. |
| Team Norway IUP Ref-ark | `BENCHMARK_PUTT` | Putting-benchmark (NGF/Team Norway 2025). Kalibrert 2026-06-10 (1 m → 1,13 forventet slag). |
| SG-baseline (tabell) | `SgBaseline` | Prisma-modell med `expectedStrokes` per `distanceBucket`/kategori — leses av strategi-/innsiktsmotoren. |
| HCP-forventet SG | `forventetSg()` | Forventet SG per kategori for gitt handicap (Broadie-avledet tabell; HCP 0→0, HCP 36→ca −16 APP). Grunnlag for krise-diagnose. |
| Krise / kriseområde | `erIKrise()` / `KriseSjekk` | Faktisk SG ≥ 1,0 slag svakere enn HCP-forventet i et område. |
| SG-diagnose | `diagnostiserSg()` / `SgDiagnose` | Diagnose av alle fire kategorier med krisestatus og prioritert rekkefølge (`prioritertRekkefølge`). Null hvis et SG-felt mangler. |
| DataGolf-benchmark-sync | `benchmark-sync` | Henter DataGolf-referanser. Cron mandag 08:00; coach godkjenner på `/admin/tester/benchmarks`. |
| WAGR-benchmark | `seed-wagr-benchmark` | World Amateur Golf Ranking-referanser; talent-/kohort-sammenligning (`/admin/talent/wagr-benchmark`). |

## 11. TrackMan-parametere

Rådata per slag (`TrackManShot`): ball- + klubb-data. Enheter som i koden.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Ball Speed | `ballSpeed` | Ballens utgangshastighet (mph). Inngår i smash; spredning aggregeres som `sigmaBall`. |
| Club Speed | `clubSpeed` | Køllehodets hastighet i treff (mph). Klassifiserer rep-hastighet; overvåkes i fatigue og CS-progresjon. |
| Smash Factor | `smashFactor` | Ball speed / club speed — treffeffektivitet. Snitt = `avgSmash`; spredning > 0,05 flagges som konsistens-lekkasje. |
| Launch Angle | `launchAngle` | Utgangsvinkel (grader). |
| Spin Rate | `spinRate` | Spinn (rpm). Sentral for utstyr/ballflukt. |
| Spin Axis | `spinAxis` | Spinn-aksens helning (grader) — sidespinn (draw/fade). |
| Carry | `carryDistance` | Flydistanse før landing (meter). |
| Total Distance | `totalDistance` | Total distanse inkl. rull (meter). Snitt = `avgTotal`; distansegap-analyse (1 m = 1,09361 yd). |
| Apex Height | `apexHeight` | Ballbanens høyeste punkt (meter). |
| Land Angle | `landAngle` | Nedslagsvinkel (grader) — stopp-evne på green. |
| Side / dispersion | `side` | Avstand fra mållinjen ved landing (meter, offline) — treffsikkerhet/spredning. |
| Attack Angle | `attackAngle` | Køllehodets vinkel opp/ned i treff (grader). |
| Club Path | `clubPath` | Køllebane gjennom treff, in-to-out/out-to-in (grader). Snitt = `avgClubPath`; med Face Angle gir D-plane. |
| Face Angle | `faceAngle` | Køllebladets vinkel mot mållinjen (grader). Snitt = `avgFaceAngle`; overvåkes i D-plane-drift. |
| Face to Path | `faceToPath` | Face − path (grader) — hovedforklaring på kurven. |
| Dynamic Loft | `dynamicLoft` | Faktisk loft i treff (grader). Med attack angle: launch/spinn. |
| Strike pattern | `strikePatternX` / `strikePatternY` | Treffpunkt på bladet: X toe–heel, Y low–high (−1..1). Avdekker miss-tendenser. |
| Rep-hastighet | `RepHastighet` | Slag klassifisert LAV eller FULL mot spillerens maks. LAV ≈ CS50–70, FULL ≈ CS80–100. |
| Outlier | `outlier` | Ekstremverdi ekskludert fra trender (bool på `TrackManShot`). |
| TrackMan-økt | `TrackManSession` | Importert måleøkt (CSV/API) med mange `TrackManShot`. Rådata i `rawJson`; `extractShots()`/`extractClubs()`. HTML-rapport mangler tempo (kun CSV). |

## 12. TrackMan-analyser og innsikt

Avledede analyser i SG-hub + innsiktsmotoren som genererer funn.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Tempo-ratio | `computeTempo()` / `avgRatio` | Tilbakesving:nedsving, optimal 3:1. `sigmaRatio` = spredning. Kun CSV-eksport. |
| Tempo-variasjon | `evaluateTempoVariance` / `TEMPO_VARIANCE` | Flagger ustabil rytme: σ > 0,15 (krever ≥ 8 slag/kølle med tempo). |
| Smash-kurve | `computeSmashCurve()` | Andregradskurve smash vs club speed → optimal hastighet. |
| D-plane | `computeDPlane()` / `D_PLANE_DRIFT` | Ballflukt fra face + path: PULL_HOOK, PULL_FADE, PUSH_DRAW, PUSH_FADE, STRAIGHT (toleranse 0,5°). Drift overvåkes. |
| Strekkvalitet | `evaluateStrikeQuality` / `STRIKE_QUALITY` | Treffkvalitet via smash + treffmønster. |
| Konsistens-lekkasje | `evaluateConsistencyLeak` / `CONSISTENCY_LEAK` | Høy spredning i smash (σ > 0,05) eller distanse per kølle. |
| Distansegap | `evaluateDistanceGapping` / `DISTANCE_GAPPING` | For små/store avstandshull mellom køller. |
| Utstyrstilpasning | `evaluateEquipmentFit` / `EQUIPMENT_FIT` | Køller med store målavvik (critical/warn). Krever ≥ 8 slag/kølle; flagg ved ≥ 2 critical eller 1 critical + 1 warn. |
| Fatigue-mønster | `evaluateFatiguePattern` / `FATIGUE_PATTERN` | Fall i Club Speed utover økten (tretthet). |
| Drift-deteksjon | `detectDrift()` / `evaluateDPlaneDrift` | Gradvis drift i path/face over uker (`slopePerWeek`); flagger verste kølle. |
| Samme-distanse-mulighet | `evaluateSameDistanceOpportunity` / `SAME_DISTANCE_OPPORTUNITY` | SG-gevinst ved bedre køllevalg på 100/125/150 yd; flagg når SG-delta > 0,05. |
| Kølle-trend-aggregator | `runClubTrends()` / `aggregateClubTrendsForUser()` | Ukentlig cron (man 03:00 UTC) → snitt per spiller/kølle/uke i `ClubMetricTrend`. Krever ≥ 3 slag/kølle/uke (`MIN_SHOTS_PER_WEEK`). |
| Kølle-metrikk-trend | `ClubMetricTrend` | Ukentlige snitt per kølle (avgClubPath, avgFaceAngle, avgSmash, avgTotal, sigmaBall, shotCount). Nøkkel (userId, club, weekStart). |
| Progresjons-trend | `evaluateProgressionTrend` / `PROGRESSION_TREND` | Positiv innsikt: kølle forbedres over 12 uker (lineær regresjon; ≥ 4 datapunkter; distanse-slope > 0,5, smash-slope > 0,005). |
| Økt-sammenligning (best vs. nå) | `session-diff` (`summarizeSession`/`diffSessions`) | 7 aggregat-metrikker mot «beste økt»; ny personlig beste ved ≥ 3 forbedret. `/portal/mal/sg-hub/best-vs-now`. |
| Metrikk-retning | `direction` (`higher`/`lower`/`lower-abs`) | Hva som er «bedre» per metrikk (clubPath = `lower-abs`). |
| Innsiktsmotor | `insight-engine` | Kjører alle evaluatorene og produserer rangerte innsikter med severity. Driver «hva sier dataene mine». |

## 13. Invarianter (systemets harde regler — versjonert, kan endres)

Regler som håndheves for at plan/økt skal være gyldig (`periode-constraints.ts`, `taxonomy.ts`, planlogikken). **Ikke evige: versjonert i MasterBrain CANON (v3.5, 13 invarianter) og kan endres av Anders — endre canon → ordbok → kode.** Coach kan overstyre harde brudd i Workbench med begrunnelse (`InvariantOverride`).

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Invariant | — | Regel som må holde for gyldig plan/økt; brudd gir advarsel, auto-generering unngår. Sjekkes av `validerPeriodBlock()` / `validateSessionConstraints()`. |
| CS-tak | `csMax` | Øktens CS kan aldri overstige periodens maks (GRUNN 70 %, SPESIALISERING 90 %, TURNERING 100 %). |
| Volum-tak | `maxVolumMin` / `volumPerUke` | Ukentlig volum (min) innenfor periodens min/maks; valideres per ISO-uke. |
| Tillatte L-faser | `lFaserTillatt` | Kun visse L-faser per periode (TURNERING: kun L_AUTO; GRUNN: L_KROPP/L_ARM/L_KOLLE). |
| Turneringslås | `turneringsLaas` | I turneringsperiode låses planen (kun L_AUTO, ingen ny innlæring). |
| Hviledager | `minHviledager` | Minste hviledager/uke (GRUNN/TURNERING 2; SPESIALISERING 1). |
| Pyramide-fordeling summerer til 1,0 | `idealFordeling` | Idealfordelingen over fem områder må summere til 1,0. |
| Periode pyramide-min/max | `minPyramide` / `maxPyramide` | Min-/maks-prosent per område per periode; brudd flagges per økt og uke. |

## 14. Planleggingshjernen

Logikken som bygger, vurderer og foreslår planendringer — inkl. AI Caddie.

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Øktgenerator | `session-generator` | Auto-genererer økter innenfor invariantene; alltid M2 + BLOKK. |
| Plan-effektivitet | `plan-effectiveness` / `PlanEffectiveness` | Hvor godt en gjennomført plan traff målene (faktisk vs planlagt); knyttes til `TrainingPlan`. |
| AI Caddie | `Caddie` / `PlanSuggestion` | Analyserer TM-/SG-data periodisk og foreslår planendringer coach godkjenner (etter TM-import + søndag-batch; payload + evidence + reason). |
| Plan-forslag | `PlanSuggestion` | Ett endringsforslag med begrunnelse/evidens; PENDING → coach ACCEPT/REJECT/EDIT (logges med `decidedById`, `decisionNote`). |
| Forslagstype | `SuggestionType` | NEW_TASK, ARCHIVE_TASK, RE_PRIORITIZE, CHANGE_CUE, ADJUST_GOAL, ADD_CLUB_TARGET — styrer payload-tolkning. |
| Forslagsstatus | `SuggestionStatus` | PENDING, ACCEPTED, REJECTED, EDITED (EDITED = godkjent etter justering). |
| Teknisk plan | `TechnicalPlan` | Spillerens tekniske utviklingsplan med arbeidsoppgaver; kan knyttes til periodeblokk. |
| Arbeidsoppgave | `PositionTask` | Konkret teknisk oppgave med L-fase, CS, M, PR. Auto-oppdateres av matchede TrackMan-slag; `diagnosticOverride` lar coach lukke uten TM-evidens. |
| TrackMan-mål | `PositionTaskTmGoal` | Målbart TM-mål på oppgave: PRIMARY eller SECONDARY (smash mean, ball speed, carry). `currentValue` fra matchede slag. |
| Slag-matching | `matchSource` / `matchConfidence` | Slag → oppgave via `auto-drill`/`auto-club`/`manual` med high/medium/low; usikre koblinger kan overstyres. |
| Idealfordeling | `idealFordeling` / `disciplinFordeling` | Planlagt fordeling over fem områder (sum 1,0); måles i `vurderPyramide()`. |

## 15. Datamodell & status-enums

Sentrale modeller og ALLE status-enums fra `prisma/schema.prisma` (komplett per 2026-07-03 — koden skal ha full ordbok-dekning).

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| Treningsplan | `TrainingPlan` | Spillerens periodiserte plan (startdato, økter, godkjenningsstatus). Kan være AI-generert. |
| Plan-status | `PlanStatus` | DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE → ARCHIVED (REJECTED/PAUSED ved behov). REJECTED bærer `playerComment`. |
| Treningsøkt (Spor A) | `TrainingPlanSession` | Planlagt PlayerHQ-økt (tid, varighet, pyramide, drills). Live-fremdrift i `liveSnapshot`. |
| Treningsøkt V2 (Spor B) | `TrainingSessionV2` | Coach-/Workbench-økt med miljø, treningstype, deltakere (`/admin/live`). Sameksisterer bevisst med Spor A. |
| Treningsdrill V2 | `TrainingDrillV2` | Øvelse i V2-økt med AK-formel-parametere + FYS-felter (pyramide, L-fase, CS, M, PR, fysOvelse …). |
| Økt-status (PlayerHQ) | `SessionStatus` | PLANNED, ACTIVE, PAUSED, COMPLETED, ABANDONED, SKIPPED, CANCELLED (på `TrainingPlanSession`). |
| Økt-status V2 | `SessionStatusV2` | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED — IN_PROGRESS i stedet for ACTIVE/PAUSED; atskilt for å unngå migrasjonskonflikt. |
| Test-økt-status | `TestSessionStatus` | IN_PROGRESS, COMPLETED, ABORTED. Committes til `TestResult` ved COMPLETED. |
| Øvelseskilde | `ExerciseSource` | SYSTEM (seedet, låst), COACH, PLAYER. |
| Øvelses-synlighet | `ExerciseVisibility` | PRIVATE, COACH_PLAYERS m.fl. — hvem ser en coach-/spiller-øvelse. |
| Drill-fasilitet | `DrillFasilitet` | Utstyrs-/anleggskrav (14 verdier: RADAR, SIMULATOR, BUNKER, SHORT_GAME_AREA, DRIVING_RANGE, PUTTING_GREEN m.fl.). Matches mot `tilgjengeligeFasiliteter`. Tom = ingen krav. |
| Spillerprogram | `PlayerProgram` | Coaching-/akademiprogram (WANG_TOPPIDRETT, GFGK_ELITE, GFGK_BREDDE, GFGK_JENTER, GFGK_MINI, AK_ACADEMY, AK_ACADEMY_JUNIOR m.fl.). `PLATFORM_ONLY` = selvbetjent uten coach (GDPR-skille i AgencyOS). |
| Abonnementsnivå | `Tier` | GRATIS eller PRO (300 kr/mnd). **ELITE er dødt enum — aldri i UI** (låst juni 2026). |
| Målkategori | `GoalCategory` | OUTCOME (resultatmål) vs PROCESS (prosessmål) — vises hver for seg i Workbench. |
| Mål-CS per kategori | `csTargetByKategori` | JSON-kart NGF-kategori (A–L) → mål-CS i plan-maler. |
| Brukerrolle | `UserRole` | ADMIN, COACH, PLAYER, PARENT, GUEST. |
| Spiller-status | `UserStatus` | AKTIV, PERMISJON, SKADET, INAKTIV — permisjon/skade/retur til spill. |
| Permisjonsgrunn | `LeaveReason` | SKADE, SYKDOM, REISE, JOBB, STUDIER, ANNET (på `Leave`). |
| Booking-status | `BookingStatus` | PENDING, CONFIRMED, CANCELLED, COMPLETED. |
| Betalingsstatus | `PaymentStatus` | PENDING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED. |
| Betalingstype | `PaymentType` | BOOKING, SUBSCRIPTION, INVOICE, OTHER. |
| Turneringspåmelding | `TournamentEntryStatus` | PLANNED (meldt på), CONFIRMED, WITHDRAWN, COMPLETED, DNF. |
| Økt-forespørsel | `SessionRequestStatus` | PENDING, APPROVED, DECLINED, CANCELLED («ønsk økt»-flyten). |
| Plan-justering | `PlanAdjustmentStatus` | PENDING, APPROVED, DECLINED. |
| Øktnotat-type | `SessionNoteType` | SELF, COACH_QUESTION, VIDEO. |
| Foreldre-relasjon | `ParentLinkRelation` | FATHER, MOTHER, GUARDIAN (foreldre-invitasjon, V2 Spor 3). |
| Deltakelse (gruppeøkt) | `ParticipationStatus` | INVITED, ACCEPTED, DECLINED, MAYBE, ATTENDED, NO_SHOW. |
| Slag-underlag | `ShotLie` | TEE, FAIRWAY, SEMI_ROUGH, ROUGH, DEEP_ROUGH, BUNKER, GREEN, WATER, OOB, TREES (hvor ballen lå). |
| Slag-type | `ShotType` | DRIVE, APPROACH, CHIP, PITCH, PUTT, BUNKER, RECOVERY, DROP (ved slag-logging). |
| Vindretning | `WindDir` | STILLE, MEDVIND, MOTVIND, VENSTRE, HOYRE (kontekst på loggede slag). |
| Ukedag | `Ukedag` | MAN, TIR, ONS, TOR, FRE, LOR, SON. |
| Anleggstype | `FacilityType` | STUDIO, RANGE_1F, RANGE_2F, PUTTING_GREEN, SHORT_GAME (nærspillsområde), COURSE_9H, COURSE_18H, SPECIFIC_HOLES, GENERAL. |
| Test-synlighet | `TestVisibility` | PRIVATE (skaperen), COACH, GROUP, ACADEMY. |
| Test-tildeling | `TestAssignmentStatus` | OPEN, COMPLETED, CANCELLED — coach tildeler test, begge varsles. |
| Innsiktskategori | `InsightCategory` | DISTANCE_GAPPING, CONSISTENCY_LEAK, TRAINING_GAP, D_PLANE_DRIFT, STRIKE_QUALITY, FATIGUE_PATTERN, EQUIPMENT_FIT, TEMPO_VARIANCE, PROGRESSION_TREND, SAME_DISTANCE_OPPORTUNITY (jf. §12). |
| Teknisk plan-status | `TechPlanStatus` | DRAFT, ACTIVE, ARCHIVED. |
| Arbeidsoppgave-status | `PositionTaskStatus` | PENDING, ACTIVE (logger reps), DONE, ARCHIVED. |
| Spor-status (teknisk mål) | `TrackStatus` | PAA_VEI (begge spor positive), STAGNERER, FERDIG, INAKTIV (ingen reps > 14 d), AVSLAATT. |
| TM-mål-type | `TmGoalType` | PRIMARY, SECONDARY, CAUSAL, HIT_RATE (jf. §14 TrackMan-mål). |
| TM-mål-protokoll | `TmGoalProtocol` | ROLLING_WINDOW, BEST_OF_N, STREAK, SESSION_GATE — hvordan målet måles. |
| TM-mål-sammenligning | `TmGoalComparison` | LESS_THAN, GREATER_THAN, RANGE, EQUAL. |
| Kølle-mål-status | `ClubTargetStatus` | OPPNAADD, PAA_VEI_KT, IKKE_BEGYNT. |
| Coach-direktiv | `CoachDirektivType` | PIN, BLOCK, PRIORITER — coach styrer drill-anbefalinger. |
| Notion-kobling | `NotionLinkType` / `NotionSyncMode` | OPPGAVER/PROSJEKTER · AUTO/MANUELL/PAUSED (workspace-synk). |
| Design-kobling QA | `DesignKoblingStatus` / `ApprovalStatus` | UNMAPPED/MAPPED/APPROVED/MISSING/BROKEN · PENDING/APPROVED/MINOR_AVVIK/MAJOR_AVVIK/SKIP (design→kode-sporing). |

## 16. Andre sentrale begreper

| Norsk term | Teknisk term | Definisjon & bruk |
|---|---|---|
| HCP / handicap | `hcp` | Spillerens offisielle handicap. Grunnlag for HCP-forventet SG, krise-diagnose og nivå-differensiering. |
| Spillerkategori A–K (canon v3.5) | `categories` (canon-methodology.json) | **Gjeldende kanon:** 11 nivåer, **A = komplett nybegynner (HCP 54+) → K = tour-proff (+4 eller bedre)**. Per kategori: HCP-ekvivalent, LTAD-fase, pyramide-default, typisk L-fase. NB: motsatt retning av eldre skalaer under — kode-migrering utestår. |
| NGF-kategori (eldre kode) | `NgfKategori` | Eldre A–L-skala i datamodellen der A = verdenselite — motsatt av canon. `minKategori`/`maxKategori` på øvelser, nøkkel i `csTargetByKategori`. Skal migreres. |
| Spillerkategori (eldre taksonomi) | `SPILLERKATEGORIER` | Eldre A–K i taxonomy.ts (A = aspirerende Tour) — motsatt av canon. Skal migreres. |
| LIFE-koder | `LIFE_KODER` | Fem livsferdigheter: Resiliens, Fokus, Selvtillit, Kommunikasjon, Eget ansvar. Knyttes til drills (særlig TURN). |
| AK-formelen | (CS · L-fase · M · PR) | Firedelt koding av slag/drill: hvor hardt, hvor innlært, hvor virkelighetsnært, hvor mye press. Felles «adresse» for enhver øvelse. |
| Breaking Point | *(ikke i koden)* | Punktet der teknikken bryter sammen når hastigheten økes — tren like under, skyv gradvis opp. Håndteres i praksis via `csMax` + CS-progresjon. |
| Spor A / Spor B (live-økt) | `TrainingPlanSession` / `TrainingSessionV2` | To live-økt-systemer som sameksisterer BEVISST (PlayerHQ `/portal/live` vs Workbench `/admin/live`). Skal ikke merges uoppfordret. |

---

# Del B — UI-tekst & rettskriving

Stavings-fasit for alt norsk i grensesnittet (PlayerHQ + AgencyOS). Del A forklarer betydning; Del B styrer staving/formulering. Prinsipp: norsk bokmål med æ/ø/å, norsk tallformat (`+3,5` med komma). Konsept-termenes staving står i Del A («Norsk term»-kolonnen) — Del B dekker det Del A ikke har.

## B1. Roller

| Term | Bokmål | Notater |
|---|---|---|
| Spiller | spiller | aldri «elev» eller «atlet» |
| Coach | coach | aldri «trener» alene i UI (ok i «hovedcoach») |
| Hovedcoach | hovedcoach | ett ord |
| Forelder | forelder / foreldre | flertall: foreldre |
| Admin | admin | systembruker |
| Akademi-coach | akademi-coach | bindestrek |

## B2. Diskipliner (pyramide-balanse)

ALLTID uppercase og i rekkefølgen `FYS · TEK · SLAG · SPILL · TURN` (dot-separator). Betydning: se §1.

### B2A. FYS — fysiske underkategorier

| Term | Bokmål | Notater |
|---|---|---|
| Styrke | styrke | generell |
| Maks-styrke | maks-styrke | bindestrek |
| Eksplosiv styrke | eksplosiv styrke | uten bindestrek |
| Power | power | engelsk-norsk akseptert |
| Spenstighet | spenstighet | hopp + pliometrisk |
| Pliometrisk | pliometrisk | trening |
| Kondisjon | kondisjon | utholdenhet |
| Utholdenhet | utholdenhet | aerob + anaerob |
| Intervall | intervall | |
| Mobilitet | mobilitet | bevegelighet |
| Hofte-mobilitet | hofte-mobilitet | bindestrek |
| Skulder-mobilitet | skulder-mobilitet | bindestrek |
| Rygg-mobilitet | rygg-mobilitet | bindestrek |
| Stabilitet | stabilitet | core + leddstabilitet |
| Core-stabilitet | core-stabilitet | bindestrek |
| Anker | anker | «lower body anchor» |
| Koordinasjon | koordinasjon | |
| Balanse | balanse | |
| Beinstyrke | beinstyrke | ett ord |
| Core | core | engelsk-norsk |
| Overkroppstyrke | overkroppstyrke | ett ord |
| Rotasjonsstyrke | rotasjonsstyrke | ett ord |
| Hofterotasjon | hofterotasjon | ett ord |
| Spinal-mobilitet | spinal-mobilitet | bindestrek |
| Restitusjon | restitusjon | |
| Aktiv hvile | aktiv hvile | uten bindestrek |
| Statisk tøyning | statisk tøyning | |
| Dynamisk oppvarming | dynamisk oppvarming | |

### B2B. TEK — tekniske underkategorier

| Term | Bokmål | Notater |
|---|---|---|
| Teknikk | teknikk | |
| Sekvens | sekvens | hvordan kroppen jobber; «kinematisk sekvens» |
| Kinematisk kjede | kinematisk kjede | «kinetic chain» |
| Plan | plan | engelsk fagterm (swing plane) |
| Swing-direction | swing-direction | bindestrek |
| On plane | på plan | |
| Steep / Shallow | brattere / flatere | |
| Kontakt / Treff-punkt | balltreff | «Konsistent kontakt» |
| Lavpunkt | lowpoint | «bottom of arc» |
| Strike location | impact location | engelsk-norsk |
| Tempo | tempo | |
| Rytme | rytme | |
| Balanse (i swingen) | balanse | |
| Posisjon | posisjon | «Topp-posisjon» |
| Topp-posisjon | P4.0 | bindestrek |
| Slutt-posisjon | P10.0 | bindestrek |
| Setup | P1.0 | engelsk fagterm |
| Grep | grep | hånd på køllen |
| Stance | oppstilling | engelsk-norsk |
| Posture | positur | engelsk-norsk |
| Alignment / Sikt | sikte / sikt | «Sikt mot flagg»; også «sikting» |
| Rotasjon | rotasjon | |
| Hip rotation | hofterotasjon | norsk form |
| Shoulder rotation | skulderrotasjon | norsk form |
| Hip-shoulder separation | hofte-skulder-separasjon | bindestreker |
| X-factor | X-factor | engelsk fagterm |
| Hånd-banen | hand path | bindestrek |
| Klubbhastighet | køllehastighet | ett ord, mph eller m/s |
| Klubbflate | kølleblad | «face angle» |
| Face angle | face angle | engelsk |
| Club path | club path | engelsk |
| Angle of attack / Attack angle | attack angle | engelsk fagterm |
| Loft | loft | køllens loft |
| Dynamic loft | dynamisk loft | norsk form |
| Spin-akse | spin-akse | bindestrek |
| Spin rate | spinrate | ett ord |
| Compression | compression | engelsk fagterm |
| Lead arm | lead arm | engelsk |
| Lag | lag | «Bevare lag» |
| Release | release | engelsk |
| Hands ahead | shaft lean | engelsk-norsk |
| Follow-through | follow-through | bindestrek |
| Impact | impact | engelsk |
| Takeaway | takeaway | engelsk |

### B2C. SLAG — slag-spesifikke kategorier

| Term | Bokmål | Notater |
|---|---|---|
| Full swing | fulle slag | |
| Drive | drive | «tee-shot» |
| Iron-spill / Jern-spill | jern-slag | norsk form med bindestrek; «Iron-spill» er engelsk fagterm |
| Approach-spill / Innspill | innspill | «approach» på norsk |
| Wedge-spill | wedge-slag | bindestrek |
| Pitch | pitch | engelsk |
| Chip | chip | engelsk |
| Flop shot / Lob shot | lob | engelsk |
| Punch shot / Knockdown / Stinger | lavt slag | engelske fagtermer |
| Bunker-spill / Greenside bunker | bunker | |
| Fairway-bunker | fairway-bunker | bindestrek |
| Plugged lie / Buried lie | plugget lie | engelsk |
| Putting | putting | engelsk |
| Putt | putt | enkelt slag |
| Kort-putt | kort-putt | bindestrek, 0–3 ft |
| Mid-putt | mid-putt | 3–6 ft |
| Lang-putt | lang-putt | 6 ft+ |
| Lag-putt | lag-putt | «speed putting» |
| Distance-kontroll / Avstandskontroll | lengdekontroll | ett ord, norsk form |
| Linje-kontroll / Lese green / Green-lesing | greenlesning | «green reading» |
| Break | break | engelsk fagterm |
| Speed | speed | «puttingspeed» |
| Tempo (putting) | tempo | i putting-kontekst |
| Draw | draw | venstre-buet (høyrehendt) |
| Fade | fade | høyre-buet (høyrehendt) |
| Hook | hook | over-draw |
| Slice | slice | over-fade |
| Straight | rett | «Rett ball» |
| High ball | høyt slag | norsk form |
| Low ball | lavt slag | norsk form |
| Trajectory / Ballbane | ballbane | norsk ett ord; «lav trajectory» = low ball flight |
| Avstandsmål | avstandsmål | «50–100 m» |

### B2D. SPILL — spillsimuleringskategorier

| Term | Bokmål | Notater |
|---|---|---|
| Spillsimulering | spillsimulering | ett ord |
| 9-hulls spill / 18-hulls spill | 9-hulls spill | bindestrek |
| Course management / Banespill | banespill | norsk form |
| Strategi | strategi | «Strategi-trening» |
| Smart spill | smart spill | |
| Risk-reward / Risiko-belønning | risiko-belønning | norsk form |
| Layup | layup | engelsk |
| Plassering | plassering | «Ball-plassering» |
| Scrambling | scrambling | engelsk fagterm |
| Up-and-down | up-and-down | engelsk |
| Save par / Save bogey | save par / save bogey | redning |
| Best-ball / Worst-ball | best-ball / worst-ball | engelsk |
| Skins | skins | engelsk fagterm |
| Stableford | stableford | engelsk fagterm |
| Match-spill / Match play | match-spill | bindestrek |
| Stroke-spill | stroke-spill | bindestrek |
| Pressure-shot | press-slag | norsk form |
| Press | press | «under press» (rettet fra tastefeilen «pres») |
| Press handling | takle press | norsk form |
| Spill mot scorekort | spill mot scorekort | |
| Spill mot motstander | spill mot motstander | match play |
| Scoring | scoring | «Scoring-drill» |
| Konkurranse-simulering | konkurranse-simulering | bindestrek |

### B2E. TURN — turnerings-spesifikke kategorier

| Term | Bokmål | Notater |
|---|---|---|
| Turneringsforberedelse | turneringsforberedelse | ett ord |
| Mental forberedelse | mental forberedelse | |
| Visualisering | visualisering | «Se slaget før det skjer» |
| Pre-shot rutine / Post-shot rutine / Tee-off rutine | pre-shot rutine | bindestrek |
| Oppvarming | oppvarming | «Pre-round warmup» |
| Pre-round / Post-round | pre-round / post-round | engelsk fagterm |
| Banerecon / Bane-vandring | banerecon | «course recon» |
| Yardage-book / Avstandsbok | avstandsbok | norsk form |
| Vind-spill | vind-spill | bindestrek |
| Vær-tilpasning | vær-tilpasning | bindestrek |
| Pace of play | spilletempo | norsk form |
| Round management | runde-strategi | norsk form |
| Lead protection | beskytte ledelse | norsk form |
| Comeback | comeback | engelsk-norsk |
| Mental ro | mental ro | |
| Pust-rutine | pust-rutine | bindestrek |
| Konsentrasjon | konsentrasjon | |
| Fokus-trigger | fokus-trigger | bindestrek |
| Reset-rutine | reset-rutine | bindestrek, etter dårlig slag |
| Selvprat / Self-talk | selvprat / self-talk | ett ord / engelsk-norsk |
| Mentaltrening | mentaltrening | ett ord |
| Visualiseringsøvelse | visualiseringsøvelse | ett ord |

## B3. Strokes Gained (SG)

### B3A. SG-kjerneord

| Term | Bokmål | Notater |
|---|---|---|
| Strokes Gained | strokes gained | engelsk fagterm beholdt |
| SG Total | SG-Total | bindestrek; forkortelse SG-T |
| SG Tee-to-Green | SG-T2G | «Total uten putting» |
| SG Off-the-tee | SG-OTT | sjelden norsk; bruk OTT |
| SG Approach | SG-APP | norsk: innspill |
| SG Around-green | SG-ARG | norsk UI-tekst: «Nærspill» |
| SG Putting | SG-PUTT | putting |
| SG per runde / per slag / per hull | SG/runde · SG/slag · SG/hull | beregnede snitt |
| SG-snitt | snitt-SG | bruk «snitt» foran |
| SG-trend / SG-utvikling / SG-bevegelse | SG-trend / SG-utvikling / SG-bevegelse | utvikling over tid; bevegelse = endring siden baseline |
| SG-svakhet / SG-styrke | SG-svakhet / SG-styrke | bindestrek |
| SG-potensial | SG-potensial | «potensial», ikke «potential» |
| SG-gap | SG-gap | avstand til benchmark |
| SG-differanse | SG-differanse | mellom to spillere/perioder |

### B3B. SG-benchmark & sammenligning

| Term | Bokmål | Notater |
|---|---|---|
| Benchmark | benchmark | engelsk-norsk akseptert |
| Kategori-benchmark | kategori-benchmark | A1/A2/B1/B2 |
| Spiller-benchmark / Tour-benchmark | spiller-benchmark / tour-benchmark | bindestrek |
| Scratch-benchmark | scratch | mot HCP 0 |
| DataGolf | DataGolf | merkenavn, CamelCase; «DataGolf-snitt» med bindestrek |
| Expected strokes / Forventet slag | forventet slag | norsk form; også «forventet putts» |
| Strokes gained over benchmark | SG over benchmark | norsk |
| Persentil | persentil | «75. persentil»; «persentil-rang» med bindestrek |
| Top 10 % / Bunn 25 % | topp 10 % / bunn 25 % | mellomrom før % |

### B3C. SG per distanse / situasjon

| Term | Bokmål | Notater |
|---|---|---|
| Distance bucket / Distanse-zone | distanse-bucket / distanse-zone | bindestrek |
| Putting-buckets | 0–3 ft · 3–6 ft · 6–10 ft · 10 ft+ putting | tankestrek. Putting ALLTID i fot (ft), aldri meter |
| Innspill-buckets | 50–100 · 100–125 · 125–150 · 150–175 · 175–200 · 200+ m innspill | |
| SG fra fairway / rough / sand / recovery | SG fairway / SG rough / SG sand / SG recovery | sand = bunker; recovery = trøbbel |
| Proximity to hole / Avstand fra flagg | nærhet til flagg / avstand fra flagg | norsk form |
| Spredning / Dispersion | spredning / dispersion | begge akseptert |
| Konsistens-score | konsistens-score | bindestrek |

### B3D. Driving-statistikk (SG-OTT data)

| Term | Bokmål | Notater |
|---|---|---|
| Fairways hit | fairways truffet | norsk; FH-% med bindestrek |
| Treffprosent | treffprosent | ett ord |
| Driving distance / Carry distance | driving-distanse / carry-distanse | bindestrek; «carry» alene ok |
| Total distance | total distanse | uten bindestrek |
| Roll-out | roll-out | bindestrek |
| Smash factor | smash | «smash 1,48» |
| Ball speed | ballhastighet | norsk form |
| Køllehastighet | køllehastighet | «club speed», norsk form |
| Spin rate | spinrate | ett ord |
| Launch angle | launch-vinkel | bindestrek |
| Backspin / Sidespin | backspin / sidespin | engelsk |
| Apex | apex | toppunkt; «apex-høyde» med bindestrek |
| Driver-snitt / Tee-snitt | driver-snitt / tee-snitt | bindestrek |
| Driving accuracy | driving-treff | norsk form |

### B3E. Approach-statistikk (SG-APP data)

| Term | Bokmål | Notater |
|---|---|---|
| Greens in regulation | greens i regulering | norsk form; GIR / GIR-% |
| Green hits | green-treff | bindestrek |
| Centre of green | sentrum av green | norsk |
| Pin-seeking | flagg-jaging | norsk form |
| Approach quality | approach-kvalitet | bindestrek |
| Slag på green | slag på green | etter approach |
| Missed green left/right/short/long | bom venstre / bom høyre / bom kort / bom langt | norsk form |
| Approach-snitt / Innspill-snitt | approach-snitt / innspill-snitt | bindestrek |

### B3F. Around-green-statistikk (SG-ARG data)

| Term | Bokmål | Notater |
|---|---|---|
| Scrambling | scrambling | engelsk fagterm; scrambling-% |
| Up-and-down | up-and-down | engelsk; up-and-down-% |
| Sand save | sand-save | bindestrek; sand-save-% |
| Chip-snitt / Pitch-snitt | chip-snitt / pitch-snitt | bindestrek |
| Around-green-snitt | around-green-snitt | bindestrek |

### B3G. Putting-statistikk (SG-PUTT data)

| Term | Bokmål | Notater |
|---|---|---|
| Total putts | totalt antall putts | norsk |
| Putts per runde / per GIR | putts per runde / putts per GIR | snitt |
| 1-putt / 2-putt / 3-putt | 1-putt · 2-putt · 3-putt | bindestrek; prosentform «1-putt-%» osv. |
| 3-putt avoidance | 3-putt unngåelse | norsk form |
| Make rate | innslagsprosent | norsk form. Avstander i FOT: «innslagsprosent 3 ft» osv. (gamle meter-varianter 1/2/3/5/10 m fases ut per putting-i-ft-regelen) |
| 3-foot make rate | 3-fot innslagsprosent | bindestrek |
| Greenlesning | greenlesning | ett ord |
| Speed control | tempo-kontroll | norsk form |
| Lag-putt-snitt | lag-putt-snitt | bindestrek |

## B3X. Statistikk generelt

### B3X-A. Score-statistikk

| Term | Bokmål | Notater |
|---|---|---|
| Score | score | engelsk-norsk; snittscore ett ord |
| Sesong-snitt / Karriere-snitt | sesong-snitt / karriere-snitt | bindestrek |
| Siste 10 runder / Siste 30 dager / Siste sesong | siste 10 runder … | snitt-vinduer |
| Beste runde | beste runde | «personlig rekord» |
| Lavest / Høyest score | lavest score / høyest score | aldri «min»/«max» |
| Birdie / Eagle / Albatross | birdie / eagle / albatross | flertall: birdies, eagles |
| Hole-in-one | hole-in-one | bindestreker |
| Par / Bogey | par / bogey | flertall: pars, bogeys |
| Double / Triple bogey | double bogey / triple bogey | uten bindestrek |
| Other (4+ over) | other | engelsk-norsk |
| Birdie-% / Par-% / Bogey-% | birdie-% osv. | bindestrek + prosent; bogey-or-worse-% = «bogey-eller-værre-%» |
| Pluss-score | pluss-score | over par |
| Under-par / Over-par | under-par / over-par | bindestrek |
| Net / Gross score | netto-score / brutto-score | bindestrek. NB golf-data: alltid brutto (se CLAUDE.md) |
| Stableford-poeng | stableford-poeng | bindestrek |

### B3X-B. Statistikk-uttrykk

| Term | Bokmål | Notater |
|---|---|---|
| Snitt | snitt | aldri «gjennomsnitt» |
| Median / Modus | median / modus | |
| Standardavvik | standardavvik | «stdev» |
| Variasjon / Variansavstand | variasjon / variansavstand | spredningsmål |
| Min / Maks | minste / største | aldri «min»/«max» som forkortelse |
| Spenn | spenn | range |
| Distribusjon / Fordeling | fordeling | norsk form foretrukket |
| Heatmap / Varmekart | heatmap / varmekart | begge OK |
| Histogram / Boxplot | histogram / boksplot | boksplot norsk |
| Trendlinje | trendlinje | ett ord; «trend opp ↑ / trend ned ↓» |
| Stigning | stigning | «slope» |
| Stagnering | stagnering | flat trend/utvikling |
| Outlier / Avviker | outlier / avviker | begge OK |
| Korrelasjon / Regresjon | korrelasjon / regresjon | regresjon også «tilbakegang» |
| Tilbakegang / Forbedring | tilbakegang / forbedring | |
| Konsistens | konsistens | «konsistens-score» med bindestrek |

### B3X-C. Tidsperioder & sammenligning

| Term | Bokmål | Notater |
|---|---|---|
| Last 5 / 10 / 30 days / 90 days | siste 5 / siste 10 / siste 30 dager / siste 90 dager | norsk form |
| YTD | i år / hittil i år | norsk form |
| Year-over-year / YoY | år-over-år | bindestreker |
| Vs. forrige uke/måned/sesong | mot forrige uke / måned / sesong | norsk |
| Δ (delta) | endring | Δ-symbol kan brukes; «endring i prosent»; «prosent endring» uten bindestrek |
| Rolling average / Bevegelig snitt | rullerende snitt / bevegelig snitt | norsk form |
| Form (snitt × trend) | form | «Pro-form» |
| Friskhet / Skarphet | friskhet / skarphet | «freshness» / «sharpness» |

### B3X-D. Spesielle metrics

| Term | Bokmål | Notater |
|---|---|---|
| Bounce-back % | bounce-back-% | rett etter bogey |
| Round dispersion | runde-spredning | bindestrek |
| Penalty strokes / Lost balls | straffeslag / mistede baller | norsk form |
| Sand saves | sand-saves | bindestrek |
| Approach proximity | innspill-nærhet | bindestrek |
| Holed-from-X / Holed-out | hullet fra X / hullet ut | norsk form |
| Strokes lost / Strokes gained | tapte slag / gained-slag | mot benchmark |
| Round score | runde-score | bindestrek |
| Front 9 / Back 9 | ut 9 / front 9 · inn 9 / back 9 | begge OK |
| 9-hulls / 18-hulls snitt | 9-hulls snitt / 18-hulls snitt | bindestrek |

### B3X-E. Visualiserings-uttrykk

| Term | Bokmål | Notater |
|---|---|---|
| Linjegraf / Søylediagram / Stolpediagram | linjegraf / søylediagram / stolpediagram | ett ord |
| Sektor-diagram / Kake-diagram | sektor-diagram / kake-diagram | «pie chart» |
| Sparkline | sparkline | mini-graf |
| Ring-progress / Progresjon-bar | ring-progress / progresjon-bar | bindestrek |
| Heatmap-grid / Radar-chart / Edderkopp-chart / Område-chart | heatmap-grid / radar-chart … | bindestrek; område-chart = «area chart» |
| Stacked bar / Box plot | stablet søyle / boksplot | norsk form |
| Akse / Etikett / Legende | akse / etikett / legende | x-/y-akse; label; legend |
| Tooltip / Drill-down / Zoom | tooltip / drill-down / zoom | engelsk-norsk |
| Filter | filter | flertall: filtre |
| Eksport | eksport | «Eksporter til CSV/PDF» |

## B4. Treningsplanlegging — periodisering

| Term | Bokmål | Notater |
|---|---|---|
| Sesongplan / Årsplan | sesongplan / årsplan | ett ord |
| Periodisering / Periode | periodisering / periode | flertall: perioder; «periode-blokk», «periode-fase» med bindestrek |
| Mac O'Grady-fasene | Mac O'Grady-fasene | apostrof beholdes. Seks faser: grunntrening (base) · oppbygging (build) · spesialisering (specific) · konkurranse (peak) · overgang (transition) · hvile (recovery). Skjema-enum uppercase: GRUNNTRENING/OPPBYGGING/SPESIALISERING/KONKURRANSE/OVERGANG/HVILE. NB: eget vokabular — ikke det samme som `PeriodeType` i §9 |
| Blokk-praksis / Random-praksis / Differensiell-praksis | blokk-praksis / random-praksis / differensiell-praksis | bindestrek; «variabel praksis» uten |
| CS-maks | CS-maks | bindestrek |
| CS-nivåer i tekst | CS20 … CS100 | UPPERCASE + tall, ingen mellomrom. Ni nivåer (canon v3.5) — CS75 o.l. finnes ikke |
| Belastning / Volum / Intensitet | belastning / volum / intensitet | «Belastning: Lav/Medium/Høy» |

## B5. Trening — økter & drills

| Term | Bokmål | Notater |
|---|---|---|
| Treningsøkt / Økt | treningsøkt / økt | ett ord; økt = kort form |
| Live økt | live økt | mellomrom |
| Drill / Drill-bibliotek | drill / drill-bibliotek | flertall: drills; bindestrek |
| Ny økt | ny økt | aldri «ny session» |
| Sett / Reps / Repetisjoner / Serie | sett / reps / repetisjoner / serie | flertall: sett (uendret), serier |
| Hvile / Rest-timer | hvile / rest-timer | mellom sett; bindestrek |
| Område | område | hvor drillen utføres |
| Belastning | belastning | «low/medium/high» |
| Praksistype | praksistype | ett ord |
| Mål | mål | «70 %», «10 reps» |

### Områder (på driving range / golfbane)

| Term | Bokmål | Notater |
|---|---|---|
| Driving range / Range | driving range / range | mellomrom, anglisisme OK; «range matte 4», «gress-tee», «range target» |
| Putting green / Practice green / Chipping green | putting green / practice green / chipping green | mellomrom |
| Chipping-område / Pitching-område | chipping-område / pitching-område | bindestrek |
| Bunker / Greenside bunker / Fairway-bunker | bunker / greenside bunker / fairway-bunker | |
| Tee-område | tee-område | bindestrek; «tee 1» |
| Fairway / Rough / Semi-rough / Green | fairway / rough / semi-rough / green | |
| Hovedbane / Korthullsbane | hovedbane / korthullsbane | ett ord; korthullsbane = «pitch and putt» |
| Par-3 bane / 9-hulls bane / 18-hulls bane / Mini-bane | par-3 bane / 9-hulls bane … | bindestrek |
| Simulator / TrackMan-studio | simulator / TrackMan-studio | bindestrek; merkenavn GC Quad, Foresight, Mulligan Indoor |
| Innendørs / Utendørs | innendørs / utendørs | ett ord |
| Treningsrom / Gym / Restitusjonsrom | treningsrom / gym / restitusjonsrom | ett ord |
| Klubbhus / Locker-rom / Pro-shop | klubbhus / locker-rom / pro-shop | |

### Trenings-modus & metoder

| Term | Bokmål | Notater |
|---|---|---|
| Blokk-praksis / Random-praksis | blokk-praksis / random-praksis | bindestrek (samme drill gjentas / randomiseres) |
| Variabel / Differensiell praksis | variabel praksis / differensiell praksis | uten bindestrek |
| Constraint-based / Game-based | constraint-based / game-based | engelsk fagterm |
| Spillbasert læring | spillbasert læring | norsk form |
| Mental praksis / Dry swing / Slow motion | mental praksis / dry swing / slow motion | |
| Treningstempo / Game speed | treningstempo / game speed | ett ord / engelsk |
| Mirror practice | speil-praksis | norsk form |
| Video-analyse / Video-review / Bilde-analyse | video-analyse / video-review / bilde-analyse | bindestrek |
| Feedback-loop | feedback-loop | bindestrek |
| Internal / External cue | indre fokus / ytre fokus | norsk form; «cue-ord» = swing-tanke; «tanke-spor»; «mental cue» |
| Repetisjon / Sett / Reps | repetisjon / sett / reps | flertall: repetisjoner; sett uendret |
| 1-og-1 | 1-og-1 | bindestrek, en rep om gangen |
| Stasjon / Sirkel-trening / Superset | stasjon / sirkel-trening / superset | «Stasjon 1, 2, 3» |

### Belastning-skala

| Term | Bokmål | Notater |
|---|---|---|
| Belastning / Volum / Intensitet | belastning / volum / intensitet | volum = timer × intensitet |
| Nivåer | lav / moderat / medium / høy / maks | grønn-/gul-/rød-zone |
| RPE | RPE | «Rate of Perceived Exertion», 1–10; «anstrengelse» |
| Treningsbelastning | treningsbelastning | ett ord, «training load»; daglig/ukens belastning |
| Belastnings-zone / Optimal-zone | belastnings-zone / optimal-zone | bindestrek |
| Overload / Under-trent | overload / under-trent | advarsel-zone / bindestrek |
| TSS / CTL / ATL / TSB | TSS / CTL / ATL / TSB | Training Stress Score · Chronic (fitness) · Acute (fatigue) · Balance (form) |
| Form / Friskhet / Tretthet / Skarphet | form / friskhet / tretthet / skarphet | TSB-resultat; freshness/fatigue/sharpness |

### Tester & måling

| Term | Bokmål | Notater |
|---|---|---|
| Test / Test-batteri / Protokoll | test / test-batteri / protokoll | flertall: tester; bindestrek |
| Baseline / Retest | baseline / retest | engelsk-norsk / ett ord |
| Combine / TrackMan-combine | combine / TrackMan-combine | engelsk fagterm; bindestrek |
| Wedge matrix | wedge matrix | engelsk fagterm |
| Putting-test / Chipping-test | putting-test / chipping-test | bindestrek |
| SG-Total test | SG-Total test | mellomrom |
| Styrke-/spenst-tester | smith machine squat / knebøy / vertikalt hopp / standlengde-hopp / medisinball-kast / 60m sprint / Y-balance / overhead squat / en-bens-balanse (single leg balance) | norske former der de finnes |
| Score / Percentil / Persentil-rang | score / percentil / persentil-rang | tall fra test; sammenligning |
| Forbedring / Tilbakegang / Vedlikehold | forbedring / tilbakegang / vedlikehold | |
| Best ever / Personlig best / PR | beste resultat / personlig best / PR | «Personal Record» |

### Status på økter

| Term | Bokmål | Badge-stil |
|---|---|---|
| Planlagt | planlagt | grå/forest |
| Av Anders | av Anders | mono forest badge |
| Selvplanlagt | selvplanlagt | lime badge |
| Fullført | ✓ fullført | grønn checkmark |
| Hoppet over | hoppet over | grå |
| Avbrutt | avbrutt | rød |
| I gang | i gang | lime puls |
| Live | LIVE | rød puls |

## B6. Mål & måltyper

| Term | Bokmål | Notater |
|---|---|---|
| Mål | mål | aldri «goal» i UI; «aktivt mål», flertall: aktive mål |
| Resultatmål / Prosessmål | resultatmål / prosessmål | ett ord; «outcome/process goal» på engelsk |
| Streak-mål | streak-mål | bindestrek |
| Oppnådd / Avbrutt mål | oppnådd / avbrutt mål | aldri «abandoned» |
| Mål-fremdrift / Mål-progresjon | mål-fremdrift / mål-progresjon | bindestrek |
| Sannsynlighet | sannsynlighet | «38 % sannsynlig» |
| Milepæl | milepæl | flertall: milepæler |

## B7. Turneringer

| Term | Bokmål | Notater |
|---|---|---|
| Turnering / Konkurranse | turnering / konkurranse | flertall: turneringer |
| Mitt hovedmål | mitt hovedmål | lime stjerne |
| Prioritet | PRIO 1 · MAJOR · NORMAL · LOCAL | uppercase i pill |
| Påmeldt / Avregistrert / Trukket / Bekreftet | påmeldt / avregistrert / trukket / bekreftet | aldri «registrert» for påmeldt; trukket = «withdrew» |
| Plassering | plassering | «14. plass» |
| Score / Snittscore | score / snittscore | ett ord |
| Cut | cut | engelsk fagterm |
| Leder | leder | enkel form |
| Turnerings-eksempler (demo) | Sørlandsåpent (Mandal GK, 54 hull) · Bossum Open (36 hull) · NM Slag (72 hull) · Trondheim Open (54 hull) · GFGK Mesterskap | default-data |

## B8. HCP & score-termer

| Term | Bokmål | Notater |
|---|---|---|
| HCP | HCP | aldri «handicap» i UI-labels (ok i løpende tekst) |
| HCP-utvikling / HCP-mål | HCP-utvikling / HCP-mål | bindestrek |
| Course Rating / CR / Slope | course rating / CR / slope | engelsk fagterm |
| Par / Bogey / Birdie / Eagle | par / bogey / birdie / eagle | «par 72» |
| Stroke play / Match play | stroke play / match play | engelsk |
| Hull | hull | flertall: hull; «9 hull / 18 hull» med mellomrom |

## B9. Kalender & tid

| Term | Bokmål | Notater |
|---|---|---|
| Kalender / Dag / Uke / Måned / Sesong | kalender / dag / uke / måned / sesong | «uke 21» |
| I dag / I går / I morgen | i dag / i går / i morgen | mellomrom |
| Denne uka | denne uka | aldri «denne uken» |
| Forrige / Neste uke | forrige uke / neste uke | |
| Ukedager | mandag … søndag | lowercase; kort: Man, Tir, Ons, Tor, Fre, Lør, Søn |
| Måneder | januar … desember | lowercase; kort: Jan, Feb, Mar, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Des |
| Klokken | kl. | «kl. 09:00»; tid alltid 24h «09:00» |
| Varighet | varighet | «60 min» / «1 t 30 min»; forkortelser: min (minutter), t (timer), sek (sekund) |

## B10. Statistikk-termer

| Term | Bokmål | Notater |
|---|---|---|
| Statistikk | statistikk | aldri «stats» i UI |
| Snitt / Trend / Trendlinje | snitt / trend / trendlinje | aldri «gjennomsnitt»; trendlinje ett ord |
| Pyramide-balanse / Pyramide-fordeling | pyramide-balanse / pyramide-fordeling | bindestrek |
| Streak / Lengste streak | streak / lengste streak | engelsk-norsk |
| Rekord / Beste runde | rekord / beste runde | «personlig rekord» |
| Konsistens / Variasjon / Median / Persentil | konsistens / variasjon / median / persentil | |
| Daglig / Ukentlig / Månedlig | daglig / ukentlig / månedlig | |

## B11. TrackMan-termer

| Term | Bokmål | Notater |
|---|---|---|
| TrackMan | TrackMan | CamelCase merkenavn |
| TM-parametere i UI | club speed · ball speed · smash factor · carry · total distance · launch angle · spin rate · attack angle · club path · face angle · apex · deviation | engelske fagtermer beholdes (betydning: §11) |
| Sesjon / TrackMan-økt | sesjon / TrackMan-økt | bindestrek |

## B12. Kølle-typer

| Term | Bokmål | Notater |
|---|---|---|
| Driver / Putter / Hybrid | driver / putter / hybrid | |
| Iron 7 / Jern 7 | jern 7 | eller «I7» |
| Woods | wood 3 | |
| Lang jern / Mellomjern / Kort jern | lang-jern / midtjern / kort-jern | bindestrek (midtjern ett ord) |
| Wedge / Sand-wedge | wedge / sand-wedge | engelsk akseptert; bindestrek |

## B13. Knapp-tekst & CTA-er (standardisert)

| Funksjon | Bokmål | Stil |
|---|---|---|
| Lagre / Ferdig | Lagre / Ferdig | primary lime |
| Avbryt / Lukk / Tilbake / Pause / Endre / Rediger / Vis / Skjul / Last ned / Eksporter / Be om hjelp / Marker som lest | outline-knapper | outline (Lukk kan være X-ikon) |
| Slett | Slett | danger |
| Bekreft / Fortsett / Send / Gjenoppta / Importer / Marker oppnådd | primary-knapper | primary |
| Neste / Forrige | Neste → / ← Forrige | primary / outline |
| Be om | Be om økt | aldri «request» |
| Logg | Logg ny økt | aldri «log new» |
| Start økt | Start økt | lime primary med play-ikon |
| Avslutt | Avslutt | outline (i live-modus: lime) |
| Se mer / Se alle / Åpne | Se mer → / Se alle → / Åpne → | text-button forest |
| Send melding | Send melding | primary lime |
| Oppgrader | Oppgrader til Pro | primary lime |

## B14. Notifikasjoner & feedback

| Term | Bokmål | Notater |
|---|---|---|
| Varsel / Notifikasjon | varsel / notifikasjon | flertall: varsler; notifikasjon mer formell |
| Melding / Tråd | melding / tråd | flertall: meldinger; meldingstråd |
| Uleste | uleste | «5 uleste» |
| Vedlegg / Spørsmål / Svar | vedlegg / spørsmål / svar | flertall uendret |
| Tilbakemelding | tilbakemelding | |
| Toast | toast | UI-feedback |
| Suksess | Sendt! / Lagret! / Bekreftet! | korte beskjeder |
| Feil | Noe gikk galt | aldri «Error» |

## B15. Tier & abonnement

| Term | Bokmål | Notater |
|---|---|---|
| Tier | tier | eller «nivå» |
| Gratis / Pro | Gratis / Pro | aldri «Premium»/«Plus» |
| Elite | — | **DØDT enum — vises ALDRI i UI** (låst beslutning juni 2026; jf. §15 Tier) |
| Abonnement | abonnement | aldri «subscription» |
| Pris / Faktura / Betaling | pris / faktura / betaling | «300 kr/mnd» |
| Forfalt / Betalt | forfalt / betalt | «800 kr forfalt» |
| Avbestill / Pause-abonnement | Avbestill Pro / pause-abonnement | bindestrek |
| Oppgrader / Nedgrader | oppgrader / nedgrader | «Oppgrader til Pro» |
| MVA | MVA | 25 % |

## B16. AI & coach-hjelpere

| Term | Bokmål | Notater |
|---|---|---|
| AI | AI | «AI-foreslå», «AI-coach», «AI-generert» med bindestrek |
| Forslag / Anbefaling | forslag / anbefaling | |
| Anbefalt for deg | Anbefalt for deg | lime stripe |
| Hvorfor? / Begrunnelse | «Hvorfor?» / begrunnelse | italic begrunnelse |
| Genererer... | Genererer... | progress-indicator |
| Caddie | Caddie | AI-assistent-navn |
| Forbered meg | Forbered meg | AI-knapp |

## B17. Helse & skader

| Term | Bokmål | Notater |
|---|---|---|
| Helse / Skade / Symptom / Smerte | helse / skade / symptom / smerte | flertall: symptomer; smerteskala 1–10 |
| Treningshelse / Energinivå | treningshelse / energinivå | ett ord |
| Restitusjon | restitusjon | aldri «recovery» |
| Søvn / Stress / Belastning | søvn / stress / belastning | |

## B18. Tilstander & feedback-ord

| Term | Bokmål | Notater |
|---|---|---|
| Optimal / God | optimal / god | grønn |
| Moderat / Lav / Høy | moderat / lav / høy | gul / gul-rød |
| Trenger oppmerksomhet / justering | trenger oppmerksomhet / trenger justering | gul-oransje |
| Klar / Ikke klar | klar / ikke klar | «Klar til start» |
| Aktiv / Inaktiv | aktiv / inaktiv | flertall: aktive/inaktive |
| Pausert / Avsluttet | pausert / avsluttet | aldri «paused» |

## B19. Hyppige uttrykk (eyebrows)

Mono small uppercase, letter-spacing 0.08em: `MIN PLATFORM` · `MIN WORKBENCH` · `MINE VARSLER` · `MIN STALL` · `TURNERING` · `PERIODE` · `UKE 21` · `DAG · 19. MAI` · `LIVE · 09:42` · `RACE 19` (sesong-uke-teller) · `COACH BRIEFING · MANDAG`

## B20. Hyppige hero-titler (mal)

| Mønster | Eksempel |
|---|---|
| «God morgen, [navn]» | God morgen, Øyvind |
| «[Tall] [substantiv] [verb]» | 38 spillere venter |
| «Min [italic]workbench[/italic]» | Min *workbench* |
| «Lag *ny plan*» / «Mine *mål*» / «Din *innboks*» | italic på nøkkelordet |

## B21. Personas (eksempel-data)

| Navn | Detaljer |
|---|---|
| **Øyvind Rohjan** | Spiller, HCP +3,5, A1 — **demo-kanon** |
| **Anders Kristiansen** | Head coach AK Golf, 38 aktive spillere |
| Markus Røinås Pedersen | **Ekte coach på markedssidene — skal IKKE brukes som demo-spiller** (CLAUDE.md navne-kanon) |
| Joachim Tangen | Spiller, HCP +1,2, A1 |
| Emma Sundsdal | Spiller, HCP 4,8, A2 |
| Sigrid Berg | Spiller, HCP 8,2, B1 |
| Nora Lillevold | Spiller, HCP 12,4, B2 |
| Henrik Vorli | Spiller, HCP +0,4, A1 |
| Ida Mathisen | Spiller, HCP 3,1, A2 |

## B22. Klubber & lokasjoner (eksempel-data)

| Klubb | Forkortelse | Lokasjon |
|---|---|---|
| Gamle Fredrikstad Golfklubb | GFGK | Fredrikstad |
| Bossum Golfklubb | Bossum GK | Bærum |
| Mandal Golfklubb | Mandal GK | Mandal |
| Trondheim Golfklubb | Trondheim GK | Trondheim |
| Mulligan Indoor | — | Innendørs simulator-fasilitet (AK Golf) |

## B23. Tall, dato, tid — formatering

| Kontekst | Bokmål | Eksempel |
|---|---|---|
| Desimaltall | komma som desimalskille | `+3,5`, `72,4`, `0,42 SG` |
| Tusenseparator | mellomrom | `47 250 kr`, `1 247 reps` |
| Prosent | `%` med mellomrom | `73 %` (formelt) eller `73%` (kompakt) — VELG ÉN |
| Dato kort / lang | `19/5` eller `19. mai` / `19. mai 2026` | månedsnavn lowercase |
| Tid | `09:00` | 24h ALLTID |
| Periode / Range | `19—25 mai` / `100—150 m` | tankestrek (—), ikke bindestrek |
| Tall + enhet | `60 min`, `21 dager`, `5 sett` | mellomrom |
| Putting-avstander | `3–6 ft` | ALLTID fot (ft), aldri meter |
| HCP-fortegn (pluss-/minus-prefix) | `+3,5` / `−3,5` | pluss alltid med; minus-tegn (−), ikke bindestrek |

## B24. Forbudt-liste

❌ **Aldri bruk disse i UI:**

| Forbudt | Bruk i stedet |
|---|---|
| Elev | spiller |
| Trener (alene) | coach |
| Goal | mål |
| Session | økt |
| Workout | økt |
| Stats | statistikk |
| Schedule | plan / kalender |
| Subscription | abonnement |
| Cancel | avbryt / avbestill |
| Save | lagre |
| Submit | send |
| Loading... | Laster... |
| Error | Noe gikk galt |
| Click | klikk (norsk, ikke "click here") |
| Sign in | logg inn |
| Sign out | logg ut |
| Username | brukernavn |
| Password | passord |
| All / Show all | Alle / Vis alle |
| Kort spill / kortspill | nærspill (kode-enum `KORT_SPILL` beholdes) |
| Rundt green (som ARG-label) | nærspill (engelsk fagvisning «SG Around-green» beholdes) |
| 🏌️ ⛳ 🎯 ⭐ | Lucide SVG-ikoner |

---

## Endrings-prosess

1. **Endre i canon først** (MasterBrain) hvis det gjelder konsept-verdier — deretter denne fila, deretter kode.
2. Ren UI-tekst: endre i denne fila først, så søk-erstatt i kode:
   ```bash
   grep -rln "gammelt ord" src/ | xargs sed -i '' 's/gammelt ord/nytt ord/g'
   ```
3. Verifiser: `npx tsc --noEmit && npm run build`
4. Commit: `chore(ordliste): "X" → "Y"`

**Sist oppdatert:** 2026-07-03 — renskrevet fra 1629 til denne versjonen uten terminologitap (SLETTET/DEDUPE-lister i `docs/ordbok-evaluering-2026-07.md`). Synket mot MasterBrain CANON v3.5. Del B var opprinnelig egen fil (`ordliste-ak-golf.md`). Demo-kanon: Øyvind Rohjan.
