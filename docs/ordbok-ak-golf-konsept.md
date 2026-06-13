# AK Golf — Ordbok / Glossary (konsept & system)

> **Hva dette er:** Den autoritative referansen for alle fagbegreper, koder og systemord i AK Golf-konseptet — pyramiden, L-fasene, CS, treningsområdene, miljø/press, Strokes Gained, TrackMan, periodisering, planleggingshjernen og invariantene. Felles språk for utviklere, trenere og AI-agenter.
>
> **Kilde:** Hentet og faktasjekket mot kodebasens taksonomi (`src/lib/taxonomy.ts`, `src/lib/portal/training/ak-taxonomy.ts`, `src/lib/domain/*`, `src/lib/sg-hub/*`, `prisma/schema.prisma`). Der koden er fasit, vinner koden.
>
> **Ikke å forveksle med** [`ordliste-ak-golf.md`](ordliste-ak-golf.md) — den er en *rettskrivings-/UI-tekstordliste* (hvordan ord staves i grensesnittet). Denne fila er en *konsept-ordbok* (hva begrepene betyr).
>
> **Slik leser du tabellene:**
> - **Norsk term** = navnet vi bruker i tale og UI.
> - **Engelsk / Teknisk term** = kode-identifier, enum-verdi eller engelsk fagterm.
> - **Definisjon** = hva det *er*.
> - **Bruk / Kontekst** = hvordan plattformen *bruker* det (inkl. konkrete verdier).
> - **Relaterte termer** = naboord verdt å slå opp.

---

## Innhold

1. [Pyramiden](#1-pyramiden)
2. [L-faser (læringsfaser)](#2-l-faser-læringsfaser)
3. [CS — Clubhead Speed](#3-cs--clubhead-speed)
4. [Treningsområder](#4-treningsområder)
5. [Miljø (M) og Press (PR)](#5-miljø-m-og-press-pr)
6. [P-systemet (svingposisjoner)](#6-p-systemet-svingposisjoner)
7. [FYS — fysiske underkategorier](#7-fys--fysiske-underkategorier)
8. [Praksistyper](#8-praksistyper)
9. [Periodisering](#9-periodisering)
10. [Strokes Gained (SG) og benchmarks](#10-strokes-gained-sg-og-benchmarks)
11. [TrackMan-parametere](#11-trackman-parametere)
12. [TrackMan-analyser og innsikt](#12-trackman-analyser-og-innsikt)
13. [Invarianter (systemets harde regler)](#13-invarianter-systemets-harde-regler)
14. [Planleggingshjernen](#14-planleggingshjernen)
15. [Datamodell & status-enums](#15-datamodell--status-enums)
16. [Andre sentrale begreper](#16-andre-sentrale-begreper)
17. [Alfabetisk indeks](#17-alfabetisk-indeks)

> **Tre forvekslinger å passe på (les disse først):**
> 1. **Læringsfase (`LFase`: L_KROPP…L_AUTO) ≠ periodiseringsfase (`LPhase`: GRUNN/SPESIAL/TURNERING).** To helt ulike enum med navnelikhet.
> 2. **Tre ulike ferdighets-inndelinger:** `SGKategori` (treningstaksonomi) ≠ `SkillArea` (SG-statistikk) ≠ `SgCategory` (SG-beregning OTT/APP/ARG/PUTT). Se [seksjon 4](#4-treningsområder) og [10](#10-strokes-gained-sg-og-benchmarks).
> 3. **Tre ulike miljø-begreper:** `M_MILJO` (M0–M5, hvor konkurransenær) ≠ `SessionEnvironment` (stedtype) ≠ `TrackManEnvironment` (målested). Se [seksjon 5](#5-miljø-m-og-press-pr).

---

## 1. Pyramiden

Den 5-trinns trenings-pyramiden er grunnmuren i hele plattformen. Hver drill, øvelse og økt merkes med **ett** pyramide-område, og perioder setter min/maks-fordeling som faktisk gjennomføring måles mot.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Pyramide | `PYRAMIDE` / `PyramidArea` | Pyramide | AK Golf Academys 5-trinns treningspyramide som deler all trening i fem områder: FYS, TEK, SLAG, SPILL, TURN. | Hver drill/økt tagges med ett område (Prisma-enum `PyramidArea`). Fordelingen styres av en idealfordeling som summerer til 1,0, og periode-min/max. | FYS, TEK, SLAG, SPILL, TURN, Pyramide-fordeling |
| Fysisk | `FYS` | Pyramide | Området for fysisk trening (styrke, kondisjon, bevegelighet). Eneste område med drillmodus FYS. | Drills bruker FYS-parametersett (reps/sett/kg/tid/sone). Tyngst i grunn- og ferieperioder (FERIE krever ≥ 40 % FYS). Farge-token `pyr-fys`. | Drillmodus, STYRKE, KONDISJON |
| Teknisk | `TEK` | Pyramide | Området for teknisk svingarbeid og bevegelse. Drillmodus GOLF. | Knyttes til L-faser og P-posisjoner. Maks 40 % i GRUNN/SPESIALISERING. Farge `pyr-tek`. | L-fase, P-system, TechnicalPlan |
| Slag | `SLAG` | Pyramide | Området for slagøvelser (putt, chip, bunker, fulle slag mot mål). Drillmodus GOLF. | Omsetter teknikk til reelle slag; øker mot spesialisering/turnering. Farge `pyr-slag`. | SLAG_DRILL, PUTT_DRILL, BUNKER_DRILL |
| Spill | `SPILL` | Pyramide | Området for spilltrening (simulert spill på bane). Drillmodus GOLF. | Integrerer ferdigheter under banelike forhold; øker mot turnering/evaluering. Farge `pyr-spill`. | SPILL_DRILL, SkillArea |
| Turnering | `TURN` | Pyramide | Toppen av pyramiden — kamp- og mental trening, reelt konkurransespill. Drillmodus GOLF. | Kamp-/mental-drill. Maks 45 % i TURNERING, 65 % i EVALUERING. Farge `pyr-turn`. | KAMP_DRILL, MENTAL_DRILL |
| Drillmodus | `DrillModus` (`FYS` \| `GOLF`) | Pyramide | To-delt klassifisering av en drill: FYS (fysisk) eller GOLF (alt golfspesifikt). Avledes av pyramide-området. | Avgjør parametersett: FYS gir reps/sett/kg/tid/sone, GOLF gir treningsområde/L-fase/P-posisjoner/miljø. Via `getDrillModus()` / `isFysDrill()`. | FysParameters, GolfParameters |
| FYS-parametersett | `FysParameters` | Pyramide | Zod-validert parametre for FYS-drills: fysType, muskelgrupper, kondisjonssone, bevegelighetstype, kondisjonsaktivitet, reps, sett, kg, tidSekunder. | Lagres i `parametersJson`. Diskriminert union med GolfParameters via `modus`. | Drillmodus, FYS-treningstype |
| GOLF-parametersett | `GolfParameters` | Pyramide | Zod-validert parametre for golf-drills: treningsområde, L-fase, P-posisjoner, miljø (environment). | Lagres i `parametersJson` for TEK/SLAG/SPILL/TURN-drills. | Treningsområde, L-fase, P-system |
| Pyramide-fordeling | `vurderPyramide()` / `PyramidFordeling` | Pyramide | Sammenligning av faktisk øktfordeling mot ideell fordeling (begge summerer til 1,0), med avvik per område og en tekstlig anbefaling. | Peker på største avvik og gir råd («X prosentpoeng for mye/lite …»). Avvik < 5 prosentpoeng regnes som «på plan». | Idealfordeling, Periode-constraints |
| Drill-malkategori | `DRILL_MAL_KATEGORIER` | Pyramide | 11 malkategorier som hver mapper til ett pyramide-område (f.eks. TEKNIKK→TEK, PUTT_DRILL→SLAG, MENTAL_DRILL→TURN). | Brukes som inngang til drillbiblioteket; sikrer at en mal havner i riktig pyramidedel. | Pyramide, TEMPLATE_FOCUS |

---

## 2. L-faser (læringsfaser)

L-fasene beskriver **hvor langt en bevegelse er innlært** — fra kroppen lærer bevegelsen til full automatisering under press. Hver fase har et anbefalt CS-intervall og utstyr.

> **NB:** `LFase` (læringsfase, denne seksjonen) er ikke det samme som `LPhase` (periodiseringsfase, se [seksjon 9](#9-periodisering)).

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| L-fase | `LFase` / `L_FASER` | L-fase | Læringsfase-systemet i fem trinn: L_KROPP → L_ARM → L_KOLLE → L_BALL → L_AUTO. | Settes på golf-drills/oppgaver. Styrer anbefalt CS og utstyr, og begrenses per periode via `lFaserTillatt`. | CS-nivå, LFASE_ANBEFALT_CS, Periode |
| L-Kropp | `L_KROPP` | L-fase | 1. fase: kroppen lærer bevegelsen (uten kølle/ball i fokus). | Anbefalt CS 50–60 % (kart: CS50/CS60). Utstyr: speil, alignment-sticks. Tillatt i GRUNN; dominerer FERIE. | CS50, CS60, Periode GRUNN |
| L-Arm | `L_ARM` | L-fase | 2. fase: armene integreres i bevegelsen. | Anbefalt CS 60–70 % (kart: CS60/CS70). Utstyr: alignment-sticks, impact-bag. | CS60, CS70 |
| L-Kølle | `L_KOLLE` | L-fase | 3. fase: kølla inkluderes med sakte tempo. | Anbefalt CS 60–75 % (kart: CS70/CS80). Utstyr: kølle, skumpute-baller. Kode-id skrives uten ø. | CS70, CS80 |
| L-Ball | `L_BALL` | L-fase | 4. fase: ball og mål, kontrollert repetisjon. | Anbefalt CS 70–85 % (kart: CS80/CS90). Utstyr: kølle, baller, mål. Tillatt i SPESIALISERING. | CS80, CS90 |
| L-Auto | `L_AUTO` | L-fase | 5. og siste fase: automatisering av bevegelsen under press. | Anbefalt CS 85–100 % (kart: CS90/CS100). Utstyr: full bag, bane. Eneste tillatte fase i TURNERING; 100 % av L-fordeling i EVALUERING. | CS100, Turneringslås |
| Anbefalt CS per L-fase | `LFASE_ANBEFALT_CS` | L-fase | Kart fra hver L-fase til de to anbefalte CS-nivåene (atskilt fra tekst-rangene i `L_FASER`). | Foreslår riktig CS-nivå når en drill merkes med L-fase. | CS-nivå, L-fase |

---

## 3. CS — Clubhead Speed

**CS = Clubhead Speed (køllehodehastighet)**, uttrykt som prosent av spillerens maks. CS styrer treningstempoet på et slag og er en av de fire AK-formel-aksene (sammen med L-fase, M-miljø og PR-press).

> **Merk:** CS betyr *Clubhead Speed* — ikke «Capacity Stress».

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| CS-nivå | `CSNivaa` / `CS_NIVAER` | CS | Seks treningstempoer (CS50–CS100) som angir hvor hardt det slås, i % av maks svinghastighet. | Settes på drills/oppgaver. Begrenses oppover av `csMax` per periode. Klassifiserer også rep-hastighet (LAV/FULL). | CS-tak, L-fase, RepHastighet |
| CS50 | `CS50` | CS | 50 % av maks — supersakte, kun form. | Laveste nivå; anbefalt for L_KROPP. Del av LAV-klassifisering (CS50–CS70). | L_KROPP |
| CS60 | `CS60` | CS | 60 % — sakte, bevisst tempo. | Anbefalt for L_KROPP/L_ARM. | L_ARM |
| CS70 | `CS70` | CS | 70 % — kontrollert, lett treff. | Anbefalt for L_ARM/L_KOLLE. Grense mellom LAV og FULL rep-hastighet. | L_KOLLE, RepHastighet |
| CS80 | `CS80` | CS | 80 % — normal treningshastighet. | Anbefalt for L_KOLLE/L_BALL. Del av FULL-klassifisering (CS80–CS100). | L_BALL |
| CS90 | `CS90` | CS | 90 % — nesten maks, kontrollert. | Anbefalt for L_BALL/L_AUTO. | L_AUTO |
| CS100 | `CS100` | CS | 100 % — full speed. | Høyeste nivå; anbefalt for L_AUTO. | L_AUTO |
| CS-progresjon | `beregnCsProgresjon()` / `CsProgresjon` | CS | Utviklingen i køllehodehastighet (mph) målt som 4-ukers rullende snitt over de siste 8 ukene, med endring, trend og skadevarsel. | Tar TrackMan-økter (dato + mph), sammenligner siste 4 uker mot uke −8 til −4. Vises på spillerens analyseflater. | CS-trend, Skadevarsel, TrackMan |
| CS-trend | `CsTrend` | CS | Retning på CS-utviklingen: OPP, FLAT eller NED. | FLAT ved \|endring\| ≤ 2 %, OPP > +2 %, NED < −2 % (`TREND_TERSKEL_PCT`). | CS-progresjon |
| Skadevarsel | `MULIG_SKADE` / `CsVarsel` | CS | Varselflagg når siste ukes CS-snitt faller mer enn 3 mph under nest-siste uke. | Settes som `varselFlagg = "MULIG_SKADE"` for å flagge mulig skade/overbelastning. | CS-progresjon |

---

## 4. Treningsområder

Treningsområdene er den fine inndelingen av golf-trening etter avstand/situasjon. Hvert område hører til én **SG-kategori (treningstaksonomi)**.

> **Tre ulike inndelinger med samme «SG»-slektskap — ikke bland dem:**
> - **`SGKategori`** (denne seksjonen) — treningstaksonomi: `TEE`, `TILNAERMING`, `KORT_SPILL`, `PUTTING`, `SPILL`.
> - **`SkillArea`** — SG-statistikk-enum: `TEE_TOTAL`, `TILNAERMING`, `AROUND_GREEN`, `PUTTING`, `SPILL`.
> - **`SgCategory`** — SG-*beregning*: `OTT`, `APP`, `ARG`, `PUTT` (se [seksjon 10](#10-strokes-gained-sg-og-benchmarks)).

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Treningsområde | `TRENINGSOMRADER` / `Treningsomrade` | Treningsområde | De 16 golf-treningsområdene etter avstand/situasjon, hver med label og SG-kategori. | Settes på GOLF-drills (`treningsomrade`). Grupperes til fokus via `TEMPLATE_FOCUS`. | SGKategori, TEMPLATE_FOCUS |
| Tee-slag | `TEE` | Treningsområde | Utslag fra tee. | SG-kategori `TEE`. | OTT, TEE_TOTAL |
| Innspill 150–200 m | `INN200` | Treningsområde | Langt innspill, 150–200 m. | SG-kategori `TILNAERMING`. | INN150, APP |
| Innspill 100–150 m | `INN150` | Treningsområde | Mellomlangt innspill, 100–150 m. | SG-kategori `TILNAERMING`. | INN100 |
| Innspill 50–100 m | `INN100` | Treningsområde | Kort innspill, 50–100 m. | SG-kategori `TILNAERMING`. | INN50 |
| Innspill 0–50 m | `INN50` | Treningsområde | Nærspill-innspill, 0–50 m. | SG-kategori `KORT_SPILL`. | CHIP, PITCH |
| Chip | `CHIP` | Treningsområde | Lavt rullende nærspill. | SG-kategori `KORT_SPILL`. | PITCH, LOB |
| Pitch | `PITCH` | Treningsområde | Høyere, mykere nærspill. | SG-kategori `KORT_SPILL`. | CHIP, LOB |
| Lob | `LOB` | Treningsområde | Høyt slag med rask stopp. | SG-kategori `KORT_SPILL`. | PITCH, BUNKER |
| Bunker | `BUNKER` | Treningsområde | Sandslag rundt green. | SG-kategori `KORT_SPILL`. | LOB |
| Putt 0–3 m | `PUTT0_3` | Treningsområde | Korte putter. | SG-kategori `PUTTING`. | PUTT3_6 |
| Putt 3–6 m | `PUTT3_6` | Treningsområde | Mellomdistanse-putter. | SG-kategori `PUTTING`. | PUTT0_3, PUTT6_10 |
| Putt 6–10 m | `PUTT6_10` | Treningsområde | Lengre putter. | SG-kategori `PUTTING`. | PUTT10_20 |
| Putt 10–20 m | `PUTT10_20` | Treningsområde | Lange putter / lag-putt. | SG-kategori `PUTTING`. | PUTT20_40 |
| Putt 20–40 m | `PUTT20_40` | Treningsområde | Svært lange putter. | SG-kategori `PUTTING`. | PUTT40P |
| Putt 40 m+ | `PUTT40P` | Treningsområde | Ekstreme lag-putter. | SG-kategori `PUTTING`. | PUTT20_40 |
| Spill (simulert) | `SPILL` | Treningsområde | Helhetlig simulert spill. | SG-kategori `SPILL`. | TURNERINGSPREP |
| SG-kategori (taksonomi) | `SGKategori` | Treningsområde | Den grove gruppen et treningsområde hører til: TEE, TILNAERMING, KORT_SPILL, PUTTING, SPILL. | Avleder fra `TRENINGSOMRADER`. NB: ikke identisk med SkillArea eller SgCategory. | SkillArea, SgCategory |
| SG-ferdighetsområde | `SkillArea` | Treningsområde | Statistikk-enum for hvor SG rapporteres: TEE_TOTAL, TILNAERMING, AROUND_GREEN, PUTTING, SPILL. | Brukes i SG-statistikk og chips. TEE_TOTAL ≠ TEE, AROUND_GREEN ≠ KORT_SPILL. | SGKategori, SgCategory |
| Fokus-mal | `TEMPLATE_FOCUS` | Treningsområde | Forhåndsdefinerte øktfokus (Full bag, Kort spill, Putting, Langt spill, Tilnærming, Bunker, Turneringsprep) som hver peker på et sett treningsområder. | `getOmraaderForFokus()` slår opp områdene for et fokus i øktmal-byggeren. | Treningsområde, OktMal |

---

## 5. Miljø (M) og Press (PR)

To akser som beskriver *konteksten* en økt foregår i: **M** = hvor virkelighetsnær/konkurransenær, **PR** = hvor mye konsekvens/press.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Miljø-kode | `M_MILJO` / `MMiljo` | Miljø | 6-trinns skala (M0–M5) for hvor virkelighetsnær treningssituasjonen er. | Settes på øktnivå (`miljo`). Auto-genererte økter får alltid M2. En av fire AK-formel-akser. | Press-nivå, SessionEnvironment |
| M0 — Innendørs | `M0` | Miljø | Studio, simulator eller innendørsanlegg (mest kontrollert). | Laveste miljønivå. | M1 |
| M1 — Range tomt | `M1` | Miljø | Range uten forstyrrelser. | | M0, M2 |
| M2 — Range normalt | `M2` | Miljø | Range med andre spillere til stede. | Default for auto-genererte økter. | M1, M3 |
| M3 — Bane treningsrunde | `M3` | Miljø | Treningsrunde på bane uten konkurransepress. | | M2, M4 |
| M4 — Bane simulert match | `M4` | Miljø | Bane med simulert turneringssituasjon. | | M3, M5 |
| M5 — Turnering | `M5` | Miljø | Reell turneringsrunde (mest virkelighetsnær). | Høyeste miljønivå. | M4, PR5 |
| Press-nivå | `PR_PRESS` / `PressureLevel` / `PRPress` | Press | 5-trinns skala (PR1–PR5) for hvor mye press/konsekvens en økt har. | Settes på øktnivå (sammen med M). Samme skala finnes som `PressureLevel` (Spor A) og `PRPress` (V2). | Miljø-kode, PositionTask |
| PR1 — Ingen press | `PR1` | Press | Fritt utforskende, ingen konsekvens. | Laveste pressnivå. | PR2 |
| PR2 — Lav press | `PR2` | Press | Enkle mål, liten konsekvens. | | PR1, PR3 |
| PR3 — Moderat press | `PR3` | Press | Tydelige mål, moderat konsekvens. | | PR2, PR4 |
| PR4 — Høy press | `PR4` | Press | Krevende mål, merkbar konsekvens. | | PR3, PR5 |
| PR5 — Maks press | `PR5` | Press | Simulert turneringssituasjon, full konsekvens. | Høyeste pressnivå. | PR4, M5 |
| Øktmiljø (sted) | `SessionEnvironment` | Miljø | Enum for konkret *stedtype* en økt logges på: RANGE, BANE, STUDIO, HJEM, SIMULATOR, GYM. | Vises som chip ved øktlogging. Atskilt fra M-skalaen (sted ≠ konkurransenærhet). | Miljø-kode, TrackManEnvironment |
| TrackMan-miljø | `TrackManEnvironment` | Miljø | Enum for hvor en TrackMan-måling ble gjort: SIMULATOR_INDOOR, NET_INDOOR, RANGE_OUTDOOR_MAT, RANGE_OUTDOOR_GRASS, COURSE_PRACTICE, COURSE_COMPETITION. | Velges ved TrackMan-data i SG-hub. Påvirker hvordan data tolkes (innendørs vs. ute). | SessionEnvironment, SG-hub |

---

## 6. P-systemet (svingposisjoner)

Standardisert system for å beskrive golfsvingen i diskrete posisjoner fra adresse (P1) til hold finish (P10).

> **NB — to varianter i koden:** `taxonomy.ts` har 14 posisjoner med halvtrinn (P4.5/P5.5/P6.5/P7.5); den forenklede `teknisk-plan/constants.ts` har 10 posisjoner uten halvtrinn, og navngir noen numre ulikt (f.eks. P5.0 = «Transisjon» der, «Arm parallell (DS)» i taksonomien).

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| P-system | `P_POSISJONER` / `P_POSITIONS` | P-system | Posisjonsnomenklatur P1–P10 (med halvtrinn i taksonomien) for golfsvingen. | Markerer hvilke svingposisjoner en teknisk drill jobber med (`pPosisjoner`, lagret som strenger). | TEK, GolfParameters |
| P1 — Adresse | `P1.0` | P-system | Oppstilling/adresse før svingen starter. | Startposisjon. | P2.0 |
| P2 — Takeaway | `P2.0` | P-system | Tidlig tilbakesving, kølle parallell med bakken. | | P1.0, P3.0 |
| P3 — Arm parallell (BS) | `P3.0` | P-system | Halvveis i tilbakesvingen, ledende arm parallell med bakken. | BS = backswing. | P4.0 |
| P4 — Topp | `P4.0` | P-system | Toppen av tilbakesvingen. | | P4.5 |
| P4.5 — Transition | `P4.5` | P-system | Overgang tilbakesving→nedsving. | Kun i taksonomi-settet (14 trinn). | P5.0 |
| P5 — Arm parallell (DS) | `P5.0` | P-system | Nedsving, ledende arm parallell med bakken. DS = downswing. | I teknisk-plan-settet heter P5.0 i stedet «Transisjon». | P5.5 |
| P5.5 — Shaft parallell (DS) | `P5.5` | P-system | Nedsving, skaftet parallelt med bakken. | Kun taksonomi-settet. | P6.0 |
| P6 — Treff | `P6.0` | P-system | Trefføyeblikket (taksonomi). I teknisk-plan-settet: «Halvveis ned». | | P6.5 |
| P6.5 — Shaft parallell (FT) | `P6.5` | P-system | Tidlig oppfølging, skaft parallelt. FT = follow-through. | Kun taksonomi-settet. | P7.0 |
| P7 — Arm parallell (FT) | `P7.0` | P-system | Oppfølging, arm parallell (taksonomi). I teknisk-plan-settet: «Impact». | | P7.5 |
| P7.5 — Arm over skulder | `P7.5` | P-system | Oppfølging, arm over skulderhøyde. | Kun taksonomi-settet. | P8.0 |
| P8 — Finish | `P8.0` | P-system | Finish (taksonomi). I teknisk-plan-settet: «Tidlig oppfølging». | | P9.0 |
| P9 — Rebalance | `P9.0` | P-system | Rebalansering (taksonomi). I teknisk-plan-settet: «Kølle parallell etter impact». | | P10.0 |
| P10 — Hold finish | `P10.0` | P-system | Holder finish-stillingen. I teknisk-plan-settet: «Finish». | Sluttposisjon. | P9.0 |

---

## 7. FYS — fysiske underkategorier

Parametre som gjelder fysisk trening (drillmodus FYS). Hver treningstype aktiverer sitt eget sett loggbare felter.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| FYS-treningstype | `FYS_TRENINGSTYPER` | FYS | De fem typene fysisk trening, hver med eget parametersett. | Velges på FYS-drill (`fysType`). Parametersettet styrer hvilke input-felter UI viser. | FysParameterSett |
| Styrke | `STYRKE` | FYS | Styrketrening med motstand. | Aktiverer reps, sett, kg. | AKTIVERING |
| Bevegelighet | `BEVEGELIGHET` | FYS | Bevegelighets-/tøyetrening. | Aktiverer sett, tid, type (bevegelighetstype). | Bevegelighetstype |
| Kondisjon | `KONDISJON` | FYS | Kondisjons-/utholdenhetstrening. | Aktiverer tid, sone (HR-sone), type (aktivitet). | Kondisjonssone, Kondisjonsaktivitet |
| Mobilitet | `MOBILITET` | FYS | Mobilitetstrening (leddbevegelighet under kontroll). | Aktiverer reps, sett, tid. | BEVEGELIGHET |
| Aktivering | `AKTIVERING` | FYS | Aktivering/oppvarming før belastning. | Aktiverer reps, sett. | STYRKE |
| FYS-parametersett | `FysParameterSett` | FYS | Bool-sett som per treningstype sier hvilke felter som er relevante: reps, sets, kg, tid, sone, type. | Bestemmer hvilke loggings-felter live-økt og plan-bygger viser. | FYS-treningstype |
| FYS-muskelgruppe | `FYS_MUSKELGRUPPER` | FYS | 9 muskelgrupper FYS-trening kan rettes mot, hver med golfrelevans-forklaring. | Flervalg på FYS-drill (`muskelgrupper`). | Core, Gluteus |
| Hoftefleksorer | `HOFTEFLEKSORER` | FYS | Muskelgruppe — hoftefleksorer. | Golfrelevans: hofterotasjon i nedsving. | Gluteus |
| Gluteus | `GLUTEUS` | FYS | Setemuskulatur. | Golfrelevans: kraft og stabilitet i nedsving. | Hoftefleksorer |
| Core | `CORE` | FYS | Kjernemuskulatur. | Golfrelevans: rotasjonsstabilitet, X-faktor. | Thorax |
| Skuldre | `SKULDRE` | FYS | Skuldermuskulatur. | Golfrelevans: armplan og skulderrotasjon. | Thorax |
| Thorax | `THORAX` | FYS | Brystrygg/thorax. | Golfrelevans: brystrotasjon og holdning. | Rygg, Skuldre |
| Hamstrings | `HAMSTRINGS` | FYS | Baklårsmuskulatur. | Golfrelevans: benstabilitet og kraft. | Quadriceps |
| Underarmer | `UNDERARMER` | FYS | Underarmsmuskulatur. | Golfrelevans: grep og håndleddskontroll. | — |
| Rygg | `RYGG` | FYS | Ryggmuskulatur. | Golfrelevans: holdning og rotasjon. | Thorax |
| Quadriceps | `QUADRICEPS` | FYS | Forlårsmuskulatur. | Golfrelevans: benstyrke og balanse. | Hamstrings |
| Kondisjonssone | `KONDISJON_SONER` | FYS | Fem HR-/RPE-soner for kondisjonstrening (SONE_1–SONE_5). | Velges på KONDISJON-drill. | Kondisjon, RPE |
| Sone 1 — Restitusjon | `SONE_1` | FYS | Restitusjon/aktiv hvile. | HR 50–60 %, RPE 1–2. | SONE_2 |
| Sone 2 — Aerob base | `SONE_2` | FYS | Aerob grunntrening. | HR 60–70 %, RPE 3–4. | SONE_3 |
| Sone 3 — Terskel | `SONE_3` | FYS | Aerob/anaerob terskel. | HR 70–80 %, RPE 5–6. | SONE_4 |
| Sone 4 — VO2max | `SONE_4` | FYS | Maksimalt oksygenopptak. | HR 80–90 %, RPE 7–8. | INTERVALL |
| Sone 5 — Anaerob | `SONE_5` | FYS | Anaerob, maksimal intensitet. | HR 90–100 %, RPE 9–10. | SONE_4 |
| Bevegelighetstype | `BEVEGELIGHET_TYPER` | FYS | Tøyemetode: STATISK, DYNAMISK, PNF, MYOFASCIAL. | Velges på BEVEGELIGHET-drill. | Bevegelighet |
| Kondisjonsaktivitet | `KONDISJON_AKTIVITETER` | FYS | Treningsform for kondisjon: GANGE, LØPING, SYKKEL, ROING, SVØMMING, SKIERG, INTERVALL, ANNET. | Velges på KONDISJON-drill. | Kondisjon |

---

## 8. Praksistyper

Øvingsmetoden for en økt/drill — fra isolert repetisjon til pressede spillsituasjoner. Bygger på motorisk læringsteori.

> **NB:** På øktnivå heter enumet `PracticeType` (BLOKK/**RANDOM**/KONKURRANSE/SPILL_TEST). På drillnivå heter det `DrillPracticeType` (BLOKK/**VARIABEL**/KONKURRANSE/SPILL_TEST). RANDOM og VARIABEL er motstykker.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Praksistype | `PracticeType` / `PRAKSISTYPER` | Praksistype | Øvingsmetode på øktnivå, med kortkode B/R/K/S. | `praksisFordeling` i periode-constraints angir anbefalt miks per periode. Auto-genererte økter settes til BLOKK. | Periode-constraints |
| Blokk (B) | `BLOKK` | Praksistype | Repetisjon av samme oppgave — isolert teknikk-innlæring. | Dominerer grunnperiode (70 %) og ferie (80 %). | DrillPracticeType |
| Random (R) | `RANDOM` | Praksistype | Tilfeldig variasjon mellom oppgaver (interleaving). | Øktnivå-motstykket til VARIABEL (drillnivå). | VARIABEL |
| Komparativ/Konkurranse (K) | `KONKURRANSE` | Praksistype | Sammenligning/konkurranse — scorer mot et krav under press. | Øker mot turnerings-/evalueringsperioder. | PR-press |
| Simulator/Test (S) | `SPILL_TEST` | Praksistype | Test eller simulert spill mot en standard. | Kobles til test- og benchmark-flytene. | TestDefinition |
| Treningstype (drill) | `DrillPracticeType` | Praksistype | Drillnivå-varianten: BLOKK, VARIABEL, KONKURRANSE, SPILL_TEST. | Settes på `ExerciseDefinition.treningstype`. Bruker VARIABEL der øktnivået bruker RANDOM. | PracticeType |

---

## 9. Periodisering

Hvordan sesongen deles i faser med ulike mål og constraints. **To enum-sett** lever side om side.

> **NB:** `PeriodeType` (5 verdier) vs. `LPhase` (3 verdier) — ulike vokabular for samme akse. `LPhase` mangler EVALUERING og FERIE, og bruker `SPESIAL` der `PeriodeType` bruker `SPESIALISERING`.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Periodisering | — | Periodisering | Inndelingen av treningsåret i faser med forskjellige mål og belastningsregler. | Hver periode definerer CS-tak, volum-tak, tillatte L-faser og pyramide-/praksis-fordeling. | Periode-type, Invariant |
| Periode-type | `PeriodeType` | Periodisering | Sesongfase: GRUNN, SPESIALISERING, TURNERING, EVALUERING, FERIE. | Brukes i `PERIODE_CONSTRAINTS` (periode-constraints.ts). Bestemmer hvilke regler som gjelder. | LPhase, Periode-constraints |
| Periodiseringsfase | `LPhase` | Periodisering | Eldre/parallelt 3-verdis enum: GRUNN, SPESIAL, TURNERING. | Brukes i `PERIODE_TYPER` (taxonomy.ts) og på `PeriodBlock`/`PlanTemplate`. Ikke det samme som læringsfasen `LFase`. | PeriodeType, PeriodBlock |
| Grunnperiode | `GRUNN` | Periodisering | Bygg fysisk basis + tekniske grunnferdigheter. | CS-tak 70 %. Pyramide: FYS 25–40 %, TEK 25–40 %. L-faser L_KROPP/L_ARM/L_KOLLE. Volum 420–720 min/uke. Min. 2 hviledager. | CS-tak, L_KROPP |
| Spesialiseringsperiode | `SPESIALISERING` | Periodisering | Integrer tekniske ferdigheter i slag og spill. | CS-tak 90 %. SLAG 20–40 %, SPILL 15–35 %. L-faser L_BALL/L_AUTO (kort-tabell). Volum 480–840 min/uke. Maks 6 økter/uke. | CS-tak, L_BALL |
| Turneringsperiode | `TURNERING` | Periodisering | Automatisering og turnerings-spesifikk forberedelse. | CS-tak 100 %. TURN 20–45 %. Kun L_AUTO. **Turneringslås på.** Volum 240–480 min/uke. Maks 5 økter/uke. | Turneringslås, L_AUTO |
| Evalueringsperiode | `EVALUERING` | Periodisering | Test og vurdering — mye simulert spill. | TURN 30–65 %, SPILL 20–45 %. 100 % L_AUTO. Volum 180–360 min/uke. (Finnes i `PeriodeType`, ikke `LPhase`.) | Test, SPILL_TEST |
| Ferieperiode | `FERIE` | Periodisering | Vedlikehold, fysisk fokus, lavt volum. | FYS ≥ 40 %. L_KROPP/L_ARM. Volum 60–240 min/uke. (Finnes i `PeriodeType`, ikke `LPhase`.) | FYS |
| Periode-constraints | `PERIODE_CONSTRAINTS` / `PERIODE_TYPER` | Periodisering | Reglene per periode: min/maks pyramide-%, L-fase-fordeling, praksis-fordeling, volum/uke, og (kort-tabell) csMax + tillatte L-faser + hviledager. | Brukes til å advare coach og til å holde auto-generering innenfor reglene (`validateSessionConstraints`, `validerPeriodBlock`). | Invariant, Volum-tak |
| Periodeblokk | `PeriodBlock` | Periodisering | Et tidsspenn i sesongplanen (`SeasonPlan`) med én L-fase og egne ukentlige volum-grenser. | `weeklyVolMin/Max` valideres mot L-fasens `maxVolumMin`. En `TechnicalPlan` kan knyttes til en blokk. | SeasonPlan, TechnicalPlan |
| Periode-farger | `PERIODE_FARGER` | Periodisering | UI-fargekart per periode-type (GRUNN mørk grønn, FERIE diagonalstripe osv.). | Brukes i kalender/gantt-visninger; konsistent på tvers av lyst/mørkt tema. | PERIODE_LABELS |

---

## 10. Strokes Gained (SG) og benchmarks

**Strokes Gained** måler hvor mange slag en spiller vinner eller taper mot en referanse (benchmark) for hvert slag.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Strokes Gained | SG / `beregnSg()` | SG | Mål på verdien av et slag: **forventet slag fra startposisjon − forventet slag fra sluttposisjon − 1**. Totalen er summen per kategori. | Beregnes fra slag-data (kategori, distanse, utfall, distanse etter). Vises i SG-hub og statistikk. Formateres med komma og fortegn («+1,2»). | SgCategory, Benchmark |
| SG off-the-tee | `OTT` | SG | SG for driving/utslag. | En av fire SG-beregningskategorier. | TEE, TEE_TOTAL |
| SG approach | `APP` | SG | SG for innspill mot green. | | TILNAERMING |
| SG around-the-green | `ARG` | SG | SG for nærspill rundt green (chip/pitch/bunker). | | AROUND_GREEN |
| SG putting | `PUTT` | SG | SG for putting. | | PUTTING |
| Slag-utfall | `SgOutcome` | SG | Hvor et slag endte: FAIRWAY, ROUGH, GREEN, SAND, RECOVERY, HOLED. | Avgjør hvilken benchmark sluttposisjonen måles mot i SG-beregningen. | Strokes Gained |
| Benchmark | `BenchmarkGroup` | SG | Forventet antall slag for å fullføre hullet fra en gitt posisjon/distanse, per kategori. | 8–15 distansegrupper per kategori. Grunnlaget for hver SG-verdi. | Strokes Gained, SgBaseline |
| PGA Tour Top 40-baseline | `BENCHMARK_OTT/APP/ARG` | SG | Referanseverdier for OTT/APP/ARG, interpolert fra Mark Broadie, *Every Shot Counts* (2014). | Standard-fasit for tee/approach/nærspill i SG-beregningen. | Benchmark |
| Team Norway IUP Ref-ark | `BENCHMARK_PUTT` | SG | Putting-benchmark fra Team Norway IUP-referansearket (2025, NGF/Team Norway). | Brukes for PUTT-kategorien. Kalibrert 2026-06-10 (1 m → 1,13 forventet slag). | Benchmark, NorwegianSkillBenchmark |
| SG-baseline (tabell) | `SgBaseline` | SG | Prisma-modell med `expectedStrokes` per `distanceBucket` og kategori — fasit som leses i strategi-/innsiktsmotoren. | Leses bl.a. i «samme-distanse»-innsikt (kategori APP). | Benchmark, Same-distanse |
| HCP-forventet SG | `forventetSg()` | SG | Forventet SG per kategori for et gitt handicap, interpolert mot en Broadie-avledet HCP-tabell (HCP 0→0; HCP 36→ ca −16 i APP). | Grunnlaget for krise-diagnose: faktisk SG sammenlignes mot HCP-forventning. | Krise, HCP |
| Krise / kriseområde | `erIKrise()` / `KriseSjekk` | SG | En spiller er «i krise» i et område når faktisk SG er ≥ 1,0 slag svakere enn HCP-forventet. | `diagnostiserSg()` sjekker alle fire kategorier og sorterer kriseområdene etter størst avvik (`prioritertRekkefølge`). | HCP-forventet SG |
| SG-diagnose | `diagnostiserSg()` / `SgDiagnose` | SG | Full diagnose av alle fire SG-kategorier med krisestatus og prioritert rekkefølge. | Returnerer null hvis ett SG-felt mangler. Driver «hvor skal jeg trene»-prioritering. | Krise |
| DataGolf-benchmark-sync | `benchmark-sync` | SG | Jobb som henter oppdaterte DataGolf-referanseverdier. | Auto-oppdateres mandager 08:00 (cron `benchmark-sync`); coach godkjenner på `/admin/tester/benchmarks`. | Benchmark, WAGR-benchmark |
| WAGR-benchmark | `seed-wagr-benchmark` | SG | Referanseverdier knyttet til World Amateur Golf Ranking. | Brukes i talent-/kohort-sammenligning (`/admin/talent/wagr-benchmark`). | NGF-kategori |

---

## 11. TrackMan-parametere

Rådata-feltene fra et TrackMan-slag (`TrackManShot`). Ball-data + klubb-data. Enheter som i koden.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Ball Speed | `ballSpeed` | TrackMan | Ballens utgangshastighet rett etter treff (mph). Høyere er bedre. | Inngår i smash factor; spredning aggregeres som `sigmaBall`. | Smash Factor, Club Speed |
| Club Speed | `clubSpeed` | TrackMan | Køllehodets hastighet i trefføyeblikket (mph). Høyere er bedre. | Klassifiserer rep-hastighet (LAV/FULL) mot spillerens maks. Overvåkes i fatigue-analyse og CS-progresjon. | RepHastighet, CS-progresjon |
| Smash Factor | `smashFactor` | TrackMan | Forholdet ball speed / club speed — treffeffektivitet. Høyere er bedre. | Snitt aggregeres som `avgSmash`; spredning > 0,05 flagges som konsistens-lekkasje. Vanlig SECONDARY-verdimål. | Smash-kurve, Strekkvalitet |
| Launch Angle | `launchAngle` | TrackMan | Ballens utgangsvinkel (grader). | Del av ball-data; brukes i utstyrs-/ballflukt-analyse. | Spin Rate |
| Spin Rate | `spinRate` | TrackMan | Ballens spinn (rpm). | Ball-data; sentral for utstyrstilpasning og ballflukt. | Spin Axis |
| Spin Axis | `spinAxis` | TrackMan | Spinn-aksens helning (grader) — sidespinn som gir draw/fade. | Forklarer kurve på ballen. | D-plane |
| Carry | `carryDistance` | TrackMan | Distansen ballen flyr i lufta før første landing (meter). | Vanlig SECONDARY-verdimål; brukes i distanse-/yardage-analyse. | Total Distance |
| Total Distance | `totalDistance` | TrackMan | Total tilbakelagt distanse inkl. rull (meter). | Snitt aggregeres som `avgTotal`; brukes i distansegap-analyse (1 m = 1,09361 yd). | Carry, Distansegap |
| Apex Height | `apexHeight` | TrackMan | Ballbanens høyeste punkt (meter). | Ball-data for ballflukt/høyde. | Launch Angle |
| Land Angle | `landAngle` | TrackMan | Ballens nedslagsvinkel (grader). | Indikerer stopp-evne på green. | Apex Height |
| Side / dispersion | `side` | TrackMan | Hvor langt fra mållinjen ballen lander (meter, offline). | Mål på treffsikkerhet/spredning. | Spredning |
| Attack Angle | `attackAngle` | TrackMan | Køllehodets vinkel opp/ned i treff (grader). | Klubb-data; påvirker launch og spinn. | Dynamic Loft |
| Club Path | `clubPath` | TrackMan | Køllehodets bevegelsesretning gjennom treff, in-to-out/out-to-in (grader). Nærmere null er bedre. | Snittes som `avgClubPath`; sammen med Face Angle gir det ballflukt (D-plane). | Face Angle, D-plane |
| Face Angle | `faceAngle` | TrackMan | Køllebladets vinkel mot mållinjen i treff (grader). Nærmere null er bedre. | Snittes som `avgFaceAngle`; overvåkes i D-plane-drift. | Club Path, D-plane |
| Face to Path | `faceToPath` | TrackMan | Differansen mellom køllebladvinkel og køllebane (face − path, grader). | Hovedforklaring på kurven (draw/fade). Del av slag-datamodellen. | Club Path, Face Angle |
| Dynamic Loft | `dynamicLoft` | TrackMan | Faktisk loft levert i treff (grader). | Klubb-data; sammen med attack angle styrer launch/spinn. | Attack Angle |
| Strike pattern | `strikePatternX` / `strikePatternY` | TrackMan | Treffpunkt på køllebladet: X = toe–heel, Y = low–high (−1..1). | Visualiseres som treffmønster; avdekker miss-tendenser. | Smash Factor |
| Rep-hastighet | `RepHastighet` | TrackMan | Klassifisering av et slag som LAV eller FULL, basert på Club Speed mot spillerens maks. | Settes på `TrackManShot`. LAV ≈ CS50–CS70, FULL ≈ CS80–CS100. Skiller teknikk-reps fra full-fart-reps. | CS-nivå, Club Speed |
| Outlier | `outlier` | TrackMan | Markering av at et slag er en ekstremverdi, ekskludert fra trender. | Bool-felt på `TrackManShot`. Holder støy ute av snitt/trender. | TrackManShot |
| TrackMan-økt | `TrackManSession` | TrackMan | En importert måleøkt (CSV/API) som inneholder mange `TrackManShot`. | Rådata ligger i `rawJson`; slag trekkes ut via `extractShots()`/`extractClubs()`. HTML-rapport mangler tempo-data (kun CSV har det). | TrackManShot, extractShots |

---

## 12. TrackMan-analyser og innsikt

Avledede analyser som SG-hub kjører på TrackMan-data, pluss innsiktsmotoren som genererer funn til spilleren.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Tempo-ratio | `computeTempo()` / `avgRatio` | Analyse | Forholdet tilbakesving:nedsving. Optimal er 3:1. | `avgRatio` = snitt, `sigmaRatio` = spredning. Kun tilgjengelig fra CSV-eksport. | Tempo-variasjon |
| Tempo-variasjon | `evaluateTempoVariance` / `TEMPO_VARIANCE` | Innsikt | Flagger ustabil svingrytme — høy spredning i tempo-ratio. | Flagger når σ > 0,15 (krever ≥ 8 slag/kølle med tempo-data). | Tempo-ratio |
| Smash-kurve | `computeSmashCurve()` | Analyse | Andregradskurve (minste kvadrater) av smash factor mot club speed, med optimal hastighet. | Viser ved hvilken club speed smash er høyest, og hvor mange slag som er over optimum. | Smash Factor |
| D-plane | `computeDPlane()` / `D_PLANE_DRIFT` | Analyse | Klassifiserer ballflukt fra face angle + club path: PULL_HOOK, PULL_FADE, PUSH_DRAW, PUSH_FADE, STRAIGHT (toleranse 0,5°). | Viser dominerende ballflukt og konsistens; drift overvåkes over tid. | Club Path, Face Angle |
| Strekkvalitet | `evaluateStrikeQuality` / `STRIKE_QUALITY` | Innsikt | Vurderer treffkvalitet via smash factor og treffmønster. | Positiv/negativ innsikt om hvor rent ballen treffes. | Smash Factor, Strike pattern |
| Konsistens-lekkasje | `evaluateConsistencyLeak` / `CONSISTENCY_LEAK` | Innsikt | Flagger høy spredning i smash factor (σ > 0,05) eller distanse. | Peker på køller der utfallet svinger mye. | Distanse σ |
| Distansegap | `evaluateDistanceGapping` / `DISTANCE_GAPPING` | Innsikt | Avdekker for små eller for store avstandshull mellom køller. | Konverterer meter→yards (1 m = 1,09361 yd). | Total Distance, Yardage |
| Utstyrstilpasning | `evaluateEquipmentFit` / `EQUIPMENT_FIT` | Innsikt | Flagger køller der måleverdier avviker mye fra mål (status «critical»/«warn»). | Krever ≥ 8 slag/kølle. Flagg ved ≥ 2 critical, eller ≥ 1 critical + ≥ 1 warn. | Smash Factor, Launch Angle |
| Fatigue-mønster | `evaluateFatiguePattern` / `FATIGUE_PATTERN` | Innsikt | Oppdager fall i Club Speed utover en økt (tretthet). | Ser etter synkende trend gjennom slagsekvensen. | Club Speed |
| Drift-deteksjon | `detectDrift()` / `evaluateDPlaneDrift` | Innsikt | Oppdager gradvis drift i club path / face angle over uker (`slopePerWeek`). | Leser ukentlige trend-data; flagger verste kølle. | ClubMetricTrend, D-plane |
| Samme-distanse-mulighet | `evaluateSameDistanceOpportunity` / `SAME_DISTANCE_OPPORTUNITY` | Innsikt | Vurderer om spilleren kan vinne SG ved bedre kølle-valg på vanlige approach-distanser (100/125/150 yd). | Flagger når SG-delta mellom beste og nest beste alternativ > 0,05. | SgBaseline, buildStrategy |
| Kølle-trend-aggregator | `runClubTrends()` / `aggregateClubTrendsForUser()` | Progresjon | Ukentlig jobb som samler TrackMan-slag per spiller/kølle/uke til snitt i `ClubMetricTrend`. | Cron mandag 03:00 UTC. Krever ≥ 3 slag/kølle/uke (`MIN_SHOTS_PER_WEEK`). Datagrunnlag for trend/progresjon/drift. | ClubMetricTrend |
| Kølle-metrikk-trend | `ClubMetricTrend` | Progresjon | Tabell med ukentlige snitt per kølle: avgClubPath, avgFaceAngle, avgSmash, avgTotal, sigmaBall, shotCount. | Nøklet på (userId, club, weekStart). Leses av progresjons- og drift-innsikt. | Kølle-trend-aggregator |
| Progresjons-trend | `evaluateProgressionTrend` / `PROGRESSION_TREND` | Progresjon | Positiv innsikt: en kølle forbedrer seg over tid (stigende avgTotal/avgSmash via lineær regresjon over 12 uker). | Krever ≥ 4 ukentlige datapunkter. Terskel: distanse-slope > 0,5, smash-slope > 0,005. | ClubMetricTrend, linearSlope |
| Økt-sammenligning (best vs. nå) | `session-diff` (`summarizeSession`/`diffSessions`) | Progresjon | Oppsummerer en økt til 7 aggregat-metrikker og sammenligner mot spillerens «beste økt». | Foreslår ny personlig beste når ≥ 3 metrikker er forbedret. Brukt på `/portal/mal/sg-hub/best-vs-now`. | Metrikk-retning |
| Metrikk-retning | `direction` (`higher`/`lower`/`lower-abs`) | Progresjon | Angir hva som er «bedre» for en metrikk: høyere, lavere, eller nærmere null. | Brukes til å avgjøre forbedring i best-vs-nå (f.eks. clubPath = `lower-abs`). | Økt-sammenligning |
| Innsiktsmotor | `insight-engine` | Innsikt | Motoren som kjører alle evaluatorene over TrackMan-data og produserer rangerte innsikter (med severity). | Driver «hva sier dataene mine»-flatene i SG-hub. | TEMPO_VARIANCE, EQUIPMENT_FIT m.fl. |

---

## 13. Invarianter (systemets harde regler)

«Invarianter» er regler systemet alltid håndhever for at en plan/økt skal være gyldig. De håndheves i `periode-constraints.ts`, `taxonomy.ts` og planleggings­logikken.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Invariant | — | Invariant | En regel som alltid må holde for at en plan/økt skal være gyldig. Brytes en, vises advarsel (og auto-generering unngår det). | Samlebegrep for reglene under. Sjekkes av `validerPeriodBlock()` og `validateSessionConstraints()`. | Periode-constraints |
| CS-tak | `csMax` | Invariant | CS-nivået på en økt kan aldri overstige periodens maks. | GRUNN 70 %, SPESIALISERING 90 %, TURNERING 100 %. Brudd gir advarsel. | CS-nivå, Periode-type |
| Volum-tak | `maxVolumMin` / `volumPerUke` | Invariant | Ukentlig treningsvolum (minutter) må ligge innenfor periodens min/maks. | Per-uke-validering summerer alle økter i ISO-uka mot taket. | Periode-constraints |
| Tillatte L-faser | `lFaserTillatt` | Invariant | Bare visse L-faser er lov i hver periode. | TURNERING tillater kun L_AUTO; GRUNN tillater L_KROPP/L_ARM/L_KOLLE. | L-fase, Periode-type |
| Turneringslås | `turneringsLaas` | Invariant | I turneringsperiode låses planen til turnerings-modus (kun L_AUTO, ingen ny innlæring). | Settes `true` for TURNERING i `PERIODE_TYPER`. | Turneringsperiode, L_AUTO |
| Hviledager | `minHviledager` | Invariant | Minste antall hviledager per uke i en periode. | GRUNN/TURNERING min. 2; SPESIALISERING min. 1. | Periode-constraints |
| Pyramide-fordeling summerer til 1,0 | `idealFordeling` | Invariant | En idealfordeling over de fem pyramide-områdene må summere til 1,0 (100 %). | Faktisk fordeling måles mot denne; avvik gir anbefaling. | Pyramide-fordeling |
| Periode pyramide-min/max | `minPyramide` / `maxPyramide` | Invariant | Hver periode setter min- og maks-prosent per pyramide-område som øktene må holde seg innenfor. | Brudd flagges per økt og per uke i `validateSessionConstraints`. | Periode-constraints |

---

## 14. Planleggingshjernen

Logikken som bygger, vurderer og foreslår endringer i treningsplaner — inkludert AI Caddie.

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Øktgenerator | `session-generator` | Planlegging | Auto-genererer treningsøkter som fordeler pyramide-områder og respekterer periodens constraints. | Genererte økter settes alltid til M2 + BLOKK. Holder seg innenfor invariantene. | Periode-constraints, Invariant |
| Plan-effektivitet | `plan-effectiveness` / `PlanEffectiveness` | Planlegging | Måler hvor godt en gjennomført plan traff målene (faktisk vs. planlagt). | Knyttes til `TrainingPlan`; gir tilbakemelding på planens treffsikkerhet. | TrainingPlan |
| AI Caddie | `Caddie` / `PlanSuggestion` | Planlegging | Motoren som periodisk analyserer TM-/SG-data og foreslår planendringer som coach godkjenner. | Genererer forslag etter TM-import + søndag-batch. Hvert forslag har payload + evidence + reason. | PlanSuggestion, TechnicalPlan |
| Plan-forslag | `PlanSuggestion` | Planlegging | Ett konkret endringsforslag fra AI Caddie, med begrunnelse og evidens, som venter på coach-beslutning. | Status PENDING → coach ACCEPT/REJECT/EDIT. Beslutning logges (`decidedById`, `decisionNote`). | SuggestionType, SuggestionStatus |
| Forslagstype | `SuggestionType` | Planlegging | Hva forslaget gjelder: NEW_TASK, ARCHIVE_TASK, RE_PRIORITIZE, CHANGE_CUE, ADJUST_GOAL, ADD_CLUB_TARGET. | Styrer hvordan payload tolkes når coach godkjenner. | PlanSuggestion, PositionTask |
| Forslagsstatus | `SuggestionStatus` | Planlegging | Coachens behandling: PENDING, ACCEPTED, REJECTED, EDITED. | Forslag tas ikke inn i planen før coach behandler det (EDITED = godkjent etter justering). | PlanSuggestion |
| Teknisk plan | `TechnicalPlan` | Planlegging | En spillers tekniske utviklingsplan med arbeidsoppgaver (posisjoner/bevegelser). | Kan knyttes til en periodeblokk. AI Caddie foreslår endringer her. | PositionTask, PeriodBlock |
| Arbeidsoppgave | `PositionTask` | Planlegging | En konkret teknisk oppgave (posisjon/bevegelse) spilleren jobber med, med L-fase, CS, M og PR. | Auto-oppdateres når TrackMan-slag matches mot oppgaven. `diagnosticOverride` lar coach lukke uten TM-evidens. | TmGoal, TrackManShot |
| TrackMan-mål | `PositionTaskTmGoal` | Planlegging | Et målbart TrackMan-mål på en arbeidsoppgave: PRIMARY (hovedmål) eller SECONDARY (verdimål som smash mean, ball speed, carry). | `currentValue` oppdateres av matchede slag. Driver fremdrift på oppgaven. | PositionTask, TrackManShot |
| Slag-matching | `matchSource` / `matchConfidence` | Planlegging | Hvordan et TrackMan-slag knyttes til en arbeidsoppgave: `auto-drill`, `auto-club`, `manual`, med sikkerhet high/medium/low. | Driver auto-oppdatering av reps og mål. Usikre koblinger kan coach overstyre. | PositionTask, TrackManShot |
| Idealfordeling | `idealFordeling` / `disciplinFordeling` | Planlegging | Den planlagte fordelingen over de fem pyramide-områdene (summerer til 1,0). | Faktisk gjennomføring måles mot denne i `vurderPyramide()`. | Pyramide-fordeling |

---

## 15. Datamodell & status-enums

Sentrale enums for plan-, økt- og bruker-tilstander. (Rene interne hjelpefunksjoner er utelatt; her er det som har konseptuell betydning.)

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| Treningsplan | `TrainingPlan` | Datamodell | En spillers periodiserte plan med startdato, økter og godkjennings-status. | Kjerne-PlayerHQ-modell; kan være AI-generert; går gjennom PlanStatus-flyten. | PlanStatus, Plan-effektivitet |
| Plan-status | `PlanStatus` | Datamodell | Tilstand i godkjenningsflyten: DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE → ARCHIVED (REJECTED/PAUSED ved behov). | Settes på `TrainingPlan`. REJECTED bærer spillerens `playerComment`. | TrainingPlan |
| Treningsøkt (Spor A) | `TrainingPlanSession` | Datamodell | En planlagt PlayerHQ-økt med tidspunkt, varighet, pyramide-område og drills. | «Spor A» i live-økt-arkitekturen. Holder live-fremdrift i `liveSnapshot`. | SessionStatus, Spor A/B |
| Treningsøkt V2 (Spor B) | `TrainingSessionV2` | Datamodell | Coach-/Workbench-øktmodell med miljø, treningstype og deltakere. | «Spor B» — brukes i AgencyOS/Workbench (`/admin/live`). Sameksisterer bevisst med Spor A. | SessionStatusV2, PracticeType |
| Treningsdrill V2 | `TrainingDrillV2` | Datamodell | En enkelt øvelse i en V2-økt, kodet med AK-formel-parametere + egne FYS-felter. | Bærer pyramide, L-fase, CS, M, PR og fys-felter (fysOvelse, fysSett osv.). | TrainingSessionV2 |
| Økt-status (PlayerHQ) | `SessionStatus` | Datamodell | Livssyklus for en PlayerHQ-økt: PLANNED, ACTIVE, PAUSED, COMPLETED, ABANDONED, SKIPPED, CANCELLED. | Settes på `TrainingPlanSession`. | TrainingPlanSession |
| Økt-status V2 | `SessionStatusV2` | Datamodell | Workbench-variant: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED, SKIPPED. | Bruker IN_PROGRESS i stedet for ACTIVE/PAUSED. Atskilt for å unngå migrasjonskonflikt. | TrainingSessionV2 |
| Test-økt-status | `TestSessionStatus` | Datamodell | Status for en test-økt med live scoring: IN_PROGRESS, COMPLETED, ABORTED. | Committes til `TestResult` ved COMPLETED. | TestSession |
| Øvelseskilde | `ExerciseSource` | Datamodell | Hvem som eier en øvelse: SYSTEM, COACH, PLAYER. | SYSTEM-øvelser er seedet av AK Golf og kan ikke endres av brukere. | ExerciseVisibility |
| Drill-fasilitet | `DrillFasilitet` | Datamodell | Utstyrs-/anleggskrav en øvelse trenger (RADAR, SIMULATOR, BUNKER, SHORT_GAME_AREA, m.fl. — 14 verdier). | Matches mot spillerens `tilgjengeligeFasiliteter` for å filtrere drillbiblioteket. Tom liste = ingen spesialkrav. | SessionEnvironment |
| Spillerprogram | `PlayerProgram` | Datamodell | Hvilket coaching-/akademiprogram spilleren tilhører (WANG_TOPPIDRETT, GFGK_ELITE, AK_ACADEMY m.fl.). | `PLATFORM_ONLY` = selvbetjent uten coachrelasjon (usynlig i AgencyOS — GDPR-skille). | Tier |
| Abonnementsnivå | `Tier` | Datamodell | PlayerHQ-tilgang: GRATIS eller PRO (300 kr/mnd). | **ELITE er et dødt enum** — finnes i Prisma, men skal aldri vises i UI (låst beslutning juni 2026). | SubscriptionStatus |
| Målkategori | `GoalCategory` | Datamodell | Skiller resultatmål (`OUTCOME`) fra prosessmål (`PROCESS`). | Vises hver for seg i Workbench. | — |
| Mål-CS per kategori | `csTargetByKategori` | Datamodell | JSON-kart fra NGF-kategori (A–L) til mål-CS, brukt i plan-maler. | Lar maler sette riktig CS-ambisjon per spillernivå. | NGF-kategori, CS-nivå |

---

## 16. Andre sentrale begreper

| Norsk term | Engelsk / Teknisk term | Kategori | Definisjon | Bruk / Kontekst | Relaterte termer |
|---|---|---|---|---|---|
| HCP / handicap | `hcp` | Begrep | Spillerens offisielle handicap. | Grunnlag for HCP-forventet SG og krise-diagnose; brukes til nivå-differensiering. | HCP-forventet SG, NGF-kategori |
| NGF-kategori | `NgfKategori` | Begrep | Nivåskala A–L som rangerer spillere fra verdenselite (A = OWGR topp 150) ned til junior/klubb (K–L). | Settes som `minKategori`/`maxKategori` på øvelser og `kategori` på plan-maler. Nøkkel i `csTargetByKategori`. | Spillerkategori, csTargetByKategori |
| Spillerkategori (taksonomi) | `SPILLERKATEGORIER` | Begrep | A–K-skala i taxonomy.ts med HCP-range og alder (A = aspirerende Tour … E = nybegynner; J/K = junior). | Brukes i taksonomien til å beskrive målgruppe. NB: `NgfKategori` (datamodellen) går A–L. | NGF-kategori |
| LIFE-koder | `LIFE_KODER` | Begrep | Fem livsferdigheter trening kan utvikle: Resiliens, Fokus, Selvtillit, Kommunikasjon, Eget ansvar. | Knytter mental/personlig utvikling til drills (særlig TURN). | TURN, MENTAL_DRILL |
| AK-formelen | (CS · L-fase · M · PR) | Begrep | Den firedelte kodingen av et slag/drill: hvor hardt (CS), hvor innlært (L-fase), hvor virkelighetsnært (M) og under hvor mye press (PR). | Felles «adresse» for enhver øvelse; gjør trening sammenlignbar og styrbar på tvers av spillere. | CS-nivå, L-fase, Miljø, Press |
| Breaking Point | *(ikke i koden)* | Begrep | Konseptuelt treningsbegrep: punktet der teknikken bryter sammen når svinghastigheten økes — man trener like under det og skyver det gradvis oppover. | **Ikke implementert som egen kode-konstant per nå.** I praksis håndteres dette via `csMax` (CS-taket per periode) og CS-progresjonen. Vurder å koble det formelt til CS-progresjon hvis det skal bli en målbar størrelse. | CS-tak, CS-progresjon |
| NorwegianSkillBenchmark | *(ikke én navngitt konstant)* | Begrep | Konseptuelt: norske ferdighets-referanseverdier å måle spillere mot. | Plattformens faktiske realisering er flere kilder: **Team Norway IUP Ref-ark** (putting-benchmark i `sg.ts`), test-benchmarks (`/admin/tester/benchmarks`), WAGR-benchmark og NGF-kategori A–L. Det finnes ingen enkelt `NorwegianSkillBenchmark`-konstant. | Team Norway IUP Ref-ark, WAGR-benchmark, NGF-kategori |
| Spor A / Spor B (live-økt) | `TrainingPlanSession` / `TrainingSessionV2` | Begrep | To live-økt-systemer som sameksisterer bevisst: Spor A (PlayerHQ, `/portal/live`) og Spor B (Workbench, `/admin/live`). | Ikke en feil/duplikat — de skal ikke ryddes/merges uoppfordret. | TrainingPlanSession, TrainingSessionV2 |

---

## 17. Alfabetisk indeks

**A:** AI Caddie ([14](#14-planleggingshjernen)) · AK-formelen ([16](#16-andre-sentrale-begreper)) · Aktivering (`AKTIVERING`) ([7](#7-fys--fysiske-underkategorier)) · Anbefalt CS per L-fase (`LFASE_ANBEFALT_CS`) ([2](#2-l-faser-læringsfaser)) · Apex Height (`apexHeight`) ([11](#11-trackman-parametere)) · APP (SG approach) ([10](#10-strokes-gained-sg-og-benchmarks)) · Arbeidsoppgave (`PositionTask`) ([14](#14-planleggingshjernen)) · ARG ([10](#10-strokes-gained-sg-og-benchmarks)) · Attack Angle (`attackAngle`) ([11](#11-trackman-parametere))

**B:** Ball Speed (`ballSpeed`) ([11](#11-trackman-parametere)) · Benchmark ([10](#10-strokes-gained-sg-og-benchmarks)) · Bevegelighet (`BEVEGELIGHET`) ([7](#7-fys--fysiske-underkategorier)) · Bevegelighetstype ([7](#7-fys--fysiske-underkategorier)) · Blokk (`BLOKK`) ([8](#8-praksistyper)) · Breaking Point ([16](#16-andre-sentrale-begreper)) · Bunker (`BUNKER`) ([4](#4-treningsområder))

**C:** Carry (`carryDistance`) ([11](#11-trackman-parametere)) · Chip (`CHIP`) ([4](#4-treningsområder)) · Club Path (`clubPath`) ([11](#11-trackman-parametere)) · Club Speed (`clubSpeed`) ([11](#11-trackman-parametere)) · Core (`CORE`) ([7](#7-fys--fysiske-underkategorier)) · CS-nivå (`CSNivaa`) ([3](#3-cs--clubhead-speed)) · CS-progresjon ([3](#3-cs--clubhead-speed)) · CS-tak (`csMax`) ([13](#13-invarianter-systemets-harde-regler)) · CS-trend ([3](#3-cs--clubhead-speed)) · CS50–CS100 ([3](#3-cs--clubhead-speed))

**D:** DataGolf-sync ([10](#10-strokes-gained-sg-og-benchmarks)) · Distansegap (`DISTANCE_GAPPING`) ([12](#12-trackman-analyser-og-innsikt)) · D-plane ([12](#12-trackman-analyser-og-innsikt)) · Drift-deteksjon ([12](#12-trackman-analyser-og-innsikt)) · Drill-fasilitet (`DrillFasilitet`) ([15](#15-datamodell--status-enums)) · Drill-malkategori ([1](#1-pyramiden)) · Drillmodus ([1](#1-pyramiden)) · Dynamic Loft (`dynamicLoft`) ([11](#11-trackman-parametere))

**E:** ELITE (dødt enum) ([15](#15-datamodell--status-enums)) · Evalueringsperiode (`EVALUERING`) ([9](#9-periodisering)) · Utstyrstilpasning (`EQUIPMENT_FIT`) ([12](#12-trackman-analyser-og-innsikt)) · Øvelseskilde (`ExerciseSource`) ([15](#15-datamodell--status-enums))

**F:** Face Angle (`faceAngle`) ([11](#11-trackman-parametere)) · Face to Path (`faceToPath`) ([11](#11-trackman-parametere)) · Fatigue-mønster ([12](#12-trackman-analyser-og-innsikt)) · Ferieperiode (`FERIE`) ([9](#9-periodisering)) · Fokus-mal (`TEMPLATE_FOCUS`) ([4](#4-treningsområder)) · Forslagsstatus (`SuggestionStatus`) ([14](#14-planleggingshjernen)) · Forslagstype (`SuggestionType`) ([14](#14-planleggingshjernen)) · FYS (Fysisk) ([1](#1-pyramiden)) · FYS-muskelgruppe ([7](#7-fys--fysiske-underkategorier)) · FYS-parametersett ([7](#7-fys--fysiske-underkategorier)) · FYS-treningstype ([7](#7-fys--fysiske-underkategorier))

**G:** Gluteus (`GLUTEUS`) ([7](#7-fys--fysiske-underkategorier)) · GOLF-parametersett ([1](#1-pyramiden)) · Grunnperiode (`GRUNN`) ([9](#9-periodisering)) · Målkategori (`GoalCategory`) ([15](#15-datamodell--status-enums))

**H:** Hamstrings (`HAMSTRINGS`) ([7](#7-fys--fysiske-underkategorier)) · HCP / handicap ([16](#16-andre-sentrale-begreper)) · HCP-forventet SG (`forventetSg`) ([10](#10-strokes-gained-sg-og-benchmarks)) · Hoftefleksorer (`HOFTEFLEKSORER`) ([7](#7-fys--fysiske-underkategorier)) · Hviledager (`minHviledager`) ([13](#13-invarianter-systemets-harde-regler))

**I:** Idealfordeling ([14](#14-planleggingshjernen)) · Innsiktsmotor (`insight-engine`) ([12](#12-trackman-analyser-og-innsikt)) · Innspill (`INN50`–`INN200`) ([4](#4-treningsområder)) · Invariant ([13](#13-invarianter-systemets-harde-regler))

**K:** Konsistens-lekkasje (`CONSISTENCY_LEAK`) ([12](#12-trackman-analyser-og-innsikt)) · Kondisjon (`KONDISJON`) ([7](#7-fys--fysiske-underkategorier)) · Kondisjonsaktivitet ([7](#7-fys--fysiske-underkategorier)) · Kondisjonssone ([7](#7-fys--fysiske-underkategorier)) · Konkurranse/Komparativ (`KONKURRANSE`) ([8](#8-praksistyper)) · Krise / kriseområde ([10](#10-strokes-gained-sg-og-benchmarks)) · Kølle-metrikk-trend (`ClubMetricTrend`) ([12](#12-trackman-analyser-og-innsikt)) · Kølle-trend-aggregator ([12](#12-trackman-analyser-og-innsikt))

**L:** Land Angle (`landAngle`) ([11](#11-trackman-parametere)) · Launch Angle (`launchAngle`) ([11](#11-trackman-parametere)) · L-fase (`LFase`) ([2](#2-l-faser-læringsfaser)) · LIFE-koder ([16](#16-andre-sentrale-begreper)) · L_KROPP / L_ARM / L_KOLLE / L_BALL / L_AUTO ([2](#2-l-faser-læringsfaser)) · LPhase (periodiseringsfase) ([9](#9-periodisering))

**M:** Miljø-kode (`M_MILJO`) ([5](#5-miljø-m-og-press-pr)) · M0–M5 ([5](#5-miljø-m-og-press-pr)) · Metrikk-retning ([12](#12-trackman-analyser-og-innsikt)) · Mobilitet (`MOBILITET`) ([7](#7-fys--fysiske-underkategorier)) · Mål-CS per kategori (`csTargetByKategori`) ([15](#15-datamodell--status-enums))

**N:** NGF-kategori (`NgfKategori`) ([16](#16-andre-sentrale-begreper)) · NorwegianSkillBenchmark ([16](#16-andre-sentrale-begreper))

**O:** OTT (SG off-the-tee) ([10](#10-strokes-gained-sg-og-benchmarks)) · Outlier (`outlier`) ([11](#11-trackman-parametere))

**P:** Periode-constraints ([9](#9-periodisering)) · Periode-farger ([9](#9-periodisering)) · Periode-type (`PeriodeType`) ([9](#9-periodisering)) · Periodeblokk (`PeriodBlock`) ([9](#9-periodisering)) · Periodisering ([9](#9-periodisering)) · Plan-effektivitet ([14](#14-planleggingshjernen)) · Plan-forslag (`PlanSuggestion`) ([14](#14-planleggingshjernen)) · Plan-status (`PlanStatus`) ([15](#15-datamodell--status-enums)) · Pitch (`PITCH`) ([4](#4-treningsområder)) · Praksistype (`PracticeType`) ([8](#8-praksistyper)) · Press-nivå (`PR_PRESS`) ([5](#5-miljø-m-og-press-pr)) · PR1–PR5 ([5](#5-miljø-m-og-press-pr)) · Progresjons-trend ([12](#12-trackman-analyser-og-innsikt)) · P-system (P1–P10) ([6](#6-p-systemet-svingposisjoner)) · Putt (`PUTT0_3`–`PUTT40P`) ([4](#4-treningsområder)) · PUTT (SG putting) ([10](#10-strokes-gained-sg-og-benchmarks)) · Pyramide ([1](#1-pyramiden)) · Pyramide-fordeling ([1](#1-pyramiden))

**Q:** Quadriceps (`QUADRICEPS`) ([7](#7-fys--fysiske-underkategorier))

**R:** Random (`RANDOM`) ([8](#8-praksistyper)) · Rep-hastighet (`RepHastighet`) ([11](#11-trackman-parametere)) · Rygg (`RYGG`) ([7](#7-fys--fysiske-underkategorier))

**S:** Samme-distanse-mulighet ([12](#12-trackman-analyser-og-innsikt)) · SG (Strokes Gained) ([10](#10-strokes-gained-sg-og-benchmarks)) · SG-baseline (`SgBaseline`) ([10](#10-strokes-gained-sg-og-benchmarks)) · SG-diagnose ([10](#10-strokes-gained-sg-og-benchmarks)) · SG-ferdighetsområde (`SkillArea`) ([4](#4-treningsområder)) · SG-kategori (`SGKategori`) ([4](#4-treningsområder)) · Skadevarsel (`MULIG_SKADE`) ([3](#3-cs--clubhead-speed)) · Skuldre (`SKULDRE`) ([7](#7-fys--fysiske-underkategorier)) · SLAG ([1](#1-pyramiden)) · Slag-matching ([14](#14-planleggingshjernen)) · Slag-utfall (`SgOutcome`) ([10](#10-strokes-gained-sg-og-benchmarks)) · Smash Factor (`smashFactor`) ([11](#11-trackman-parametere)) · Smash-kurve ([12](#12-trackman-analyser-og-innsikt)) · Spill (pyramide / område / SG) ([1](#1-pyramiden), [4](#4-treningsområder)) · Spillerkategori ([16](#16-andre-sentrale-begreper)) · Spillerprogram (`PlayerProgram`) ([15](#15-datamodell--status-enums)) · Spin Axis (`spinAxis`) ([11](#11-trackman-parametere)) · Spin Rate (`spinRate`) ([11](#11-trackman-parametere)) · Spor A / Spor B ([16](#16-andre-sentrale-begreper)) · Spesialiseringsperiode (`SPESIALISERING`) ([9](#9-periodisering)) · Strekkvalitet (`STRIKE_QUALITY`) ([12](#12-trackman-analyser-og-innsikt)) · Strike pattern ([11](#11-trackman-parametere)) · Styrke (`STYRKE`) ([7](#7-fys--fysiske-underkategorier))

**T:** Team Norway IUP Ref-ark ([10](#10-strokes-gained-sg-og-benchmarks)) · Teknisk (`TEK`) ([1](#1-pyramiden)) · Teknisk plan (`TechnicalPlan`) ([14](#14-planleggingshjernen)) · Tee-slag (`TEE`) ([4](#4-treningsområder)) · Tempo-ratio ([12](#12-trackman-analyser-og-innsikt)) · Tempo-variasjon (`TEMPO_VARIANCE`) ([12](#12-trackman-analyser-og-innsikt)) · Test-økt-status ([15](#15-datamodell--status-enums)) · Thorax (`THORAX`) ([7](#7-fys--fysiske-underkategorier)) · Tier (abonnement) ([15](#15-datamodell--status-enums)) · Total Distance (`totalDistance`) ([11](#11-trackman-parametere)) · TrackMan-mål (`PositionTaskTmGoal`) ([14](#14-planleggingshjernen)) · TrackMan-miljø (`TrackManEnvironment`) ([5](#5-miljø-m-og-press-pr)) · TrackMan-økt (`TrackManSession`) ([11](#11-trackman-parametere)) · Treningsdrill V2 ([15](#15-datamodell--status-enums)) · Treningsområde ([4](#4-treningsområder)) · Treningsplan (`TrainingPlan`) ([15](#15-datamodell--status-enums)) · Treningsøkt Spor A/B ([15](#15-datamodell--status-enums)) · TURN (Turnering) ([1](#1-pyramiden)) · Turneringslås (`turneringsLaas`) ([13](#13-invarianter-systemets-harde-regler)) · Turneringsperiode (`TURNERING`) ([9](#9-periodisering))

**U:** Underarmer (`UNDERARMER`) ([7](#7-fys--fysiske-underkategorier)) · Utstyrstilpasning (`EQUIPMENT_FIT`) ([12](#12-trackman-analyser-og-innsikt))

**V:** Variabel (`VARIABEL`) ([8](#8-praksistyper)) · Volum-tak (`maxVolumMin`) ([13](#13-invarianter-systemets-harde-regler))

**W:** WAGR-benchmark ([10](#10-strokes-gained-sg-og-benchmarks))

**Ø:** Økt-sammenligning (best vs. nå) ([12](#12-trackman-analyser-og-innsikt)) · Økt-status (`SessionStatus` / `SessionStatusV2`) ([15](#15-datamodell--status-enums)) · Øktgenerator ([14](#14-planleggingshjernen)) · Øktmiljø (`SessionEnvironment`) ([5](#5-miljø-m-og-press-pr))

---

*Generert fra kodebasens taksonomi, faktasjekket per domene. Når koden endres, oppdater denne fila — eller regenerer fra `src/lib/taxonomy.ts`, `src/lib/portal/training/ak-taxonomy.ts`, `src/lib/domain/*`, `src/lib/sg-hub/*` og `prisma/schema.prisma`.*
