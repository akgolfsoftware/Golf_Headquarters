# Design-kø — Stats-plattformen (eget spor, ~50 ruter)

> **Eget design-spor.** Stats er et offentlig, DataGolf-drevet statistikk-produkt med eget uttrykk
> — ikke coaching-appen. Ingen av rutene er designet i 17.juni-handoffen. Hele sporet er EGET-SPOR
> og designes som en separat pakke. Prioritet er lavere enn coaching-appen; unntaket er **hub + spillerdatabasen**
> som er live og synlig for brukere allerede.
>
> **Scope:** ~30 ekte ruter (STUB-sider utsettes per V2/V3). `stats/blogg` er LEGACY-DUP og inngår ikke.

---

## Sammendrag

| | |
|---|---|
| Batcher totalt | **6** |
| Skjermer i scope | **~28 unike skjermtyper** (fra ~50 ruter, etter gruppering av `[id]`/`[slug]`) |
| P1 (live, synlig nå — design trengs) | **2 batcher, ~10 skjermer** |
| V2 (kan lanserere uten — fremtidige/STUB-sider) | **4 batcher, ~18 skjermer** |

**P1-begrunnelse:** `/stats`-huben, spillerdatabasen og PGA-tabellene er allerede live. Verktøy og turneringer er
live men sekundære. Hub + spillere prioriteres høyest fordi de er inngangs-porten til produktet.

---

## Batch-liste

| # | Tittel | Prioritet | Skjermer + ruter | Komponenter |
|---|---|---|---|---|
| S1 | Hub + Årskalender | **P1** | `/stats`, `/stats/uka`, `/stats/2026` | PhotoHero, KpiStrip, GalleryView, TrendBand, EventTimeline |
| S2 | Spillerdatabase | **P1** | `/stats/spillere`, `/stats/spillere/[slug]`, `/stats/aargang`, `/stats/aargang/[aar]` | DataTable Pro, TrendBand, SgBar, PercentileGauge, PhotoHero |
| S3 | PGA-tabeller | **V2** | `/stats/pga`, `/stats/norske`, `/stats/leaderboards`, `/stats/pga/[metrikk]`, `/stats/pga/spillere`, `/stats/pga/spillere/[dg_id]` | DataTable Pro, TrendBand, SgBar, PercentileGauge, CompareH2H |
| S4 | Baner + Klubber + Regioner | **V2** | `/stats/baner`, `/stats/baner/[slug]`, `/stats/klubber`, `/stats/klubber/[slug]`, `/stats/regions`, `/stats/regions/[slug]` | GalleryView, DataTable Pro, RoundScorecard, PhotoHero |
| S5 | Turneringer + Tour | **V2** | `/stats/turneringer`, `/stats/turneringer/[slug]`, `/stats/turneringer/[slug]/statistikk`, `/stats/tour/[slug]` | TournamentCard, DataTable Pro, EventTimeline, TrendBand |
| S6 | Verktøy + Sammenligning + Oppdagelse | **V2** | `/stats/verktoy`, `/stats/verktoy/avstand`, `/stats/verktoy/score-til-hcp`, `/stats/verktoy/sg-estimator`, `/stats/verktoy/tour-ekvivalent`, `/stats/verktoy/whs-kalkulator`, `/stats/sammenlign-spillere`, `/stats/sg-sammenlign`, `/stats/sg-sammenlign/start`, `/stats/sg-sammenlign/resultat/[id]`, `/stats/min-progresjon`, `/stats/sok`, `/stats/quiz`, `/stats/wrapped/[slug]` | StatTile, GhostNumber, TrendBand, Input, CompareH2H, SkillRadarLive, SgBreakdown |

---

## Claude Design-prompter

### S1 — Hub + Årskalender

```
[LIMER INN PREAMBELEN FØRST — se docs/redesign-2026-06/10-PROMPT-PAKKE.md]

Vi designer Stats-plattformen for AK Golf HQ — et eget, offentlig produkt med eget uttrykk.
Stats er IKKE coaching-appen. Det er en DataGolf-drevet golfstatistikk-database (tenk: Golf Digest
møter DataGolf) — åpen for alle, ingen innlogging. Eget visuelt uttrykk innenfor AK-DNA: lime er
fortsatt signaturen, men uttrykket kan være mer editorial/datajournalistikk enn coaching-plattformen.

BATCH S1 — Hub og Årskalender (3 skjermer):

1. `/stats` — Stats-huben
   - Hva: Inngangsportal til hele stats-produktet. Hero med «hva er dette»-intro, KPI-rad (antall
     spillere, runder, turneringer i databasen), bento-grid med snarveier til de 5 hoveddatabasene
     (Spillere · PGA · Baner · Turneringer · Verktøy), fersk aktivitet (siste oppdaterte runder/turneringer).
   - Primærflyt: Ankomst → velg database (1 trykk).
   - Komponenter: PhotoHero (eller editorial PageHero), KpiStrip, GalleryView (bento-grid), TrendBand
     (fersk aktivitet), EventTimeline (siste hendelser).

2. `/stats/uka` — Ukens høydepunkter
   - Hva: Redaksjonell STUB. Viser ukens beste runder, nye rekorder, turneringsresultater. Tenk
     «fredagsoppsummering» for norsk golf.
   - Primærflyt: Lese → klikk spiller/turnering (1 trykk).
   - Komponenter: PageHero, GalleryView (kort-rad), TrendBand, EventTimeline.

3. `/stats/2026` — Sesongoversikt 2026
   - Hva: Sesong-snapshot. KPI for sesongen (antall runder, snitt-HCP, beste score, turneringer).
     Timeline over turneringer i 2026, ledertabell for sesongen.
   - Primærflyt: Lese → klikk turnering eller spiller (1 trykk).
   - Komponenter: KpiStrip, EventTimeline, DataTable Pro, TournamentCard.

VIKTIG for dette sporet:
- Stats er et OFFENTLIG produkt — ingen innlogging, ingen «Øyvind Rohjan»-demo. Data er ekte norske
  spillere og runder. Bruk placeholder-navn der du trenger demo-data (f.eks. «Ola Nordmann, HCP 8,4»).
- Uttrykket kan være litt mer «datajournalistikk» enn coaching-appen — editorial typografi,
  tettere informasjonstetthet, Wikipedia/Athletic-referanse.
- Lime som signaturaksent gjelder fortsatt: aktive tilstander, CTA-er, tall som «skinner».
- Ingen coaching-kontekst, ingen «coach», ingen abonnement.
- Alle tilstander: innhold · tomt · laster (skeleton) · feil.
- Ingen døde knapper — alle 5 bento-snarvei-kortene på huben MÅ peke til ekte ruter.

Still meg spørsmålene dine, så starter vi på hub-skjermen.
```

---

### S2 — Spillerdatabase

```
[LIMER INN PREAMBELEN FØRST]

Stats-plattform — BATCH S2 — Spillerdatabase (4 skjermtyper):

1. `/stats/spillere` — Spillerliste (norsk database)
   - Hva: Søkbar, sorterbar tabell over norske golfspeillere i databasen. Kolonner: navn, HCP,
     snittscore, SG total, antall runder, siste aktivitet, A–K-kategori. Filter: kjønn, klubb, HCP-bånd,
     sesong. Fremhev spillere med fersk aktivitet.
   - Primærflyt: Liste → klikk spiller (1 trykk) → spillerprofil.
   - Komponenter: DataTable Pro (med filter + sort), TrendBand (HCP-utvikling øverst), PercentileGauge (HCP-fordelings-viz).

2. `/stats/spillere/[slug]` — Spillerprofil
   - Hva: En enkelt spillers offentlige statistikkprofil. Navn, HCP, snittscore, A–K-kategori.
     KPI-rad (SG total, fairway%, GIR%, putts). SG-breakdown per kategori. Runder-historikk
     (DataTable). HCP-trend (TrendBand). Turneringsresultater. Sammenligning-knapp («Sammenlign»).
   - Primærflyt: Profil → klikk runde for detalj (1 trykk), eller klikk «Sammenlign».
   - Komponenter: PhotoHero (initialer, ikke bilde — offentlig profil), KpiStrip, SgBreakdown, TrendBand,
     DataTable Pro, PercentileGauge.

3. `/stats/aargang` — Årsgang-oversikt (alle år tilgjengelig)
   - Hva: Velg sesong-år fra liste. Viser toppliste per sesong, beste runder, rekorder.
   - Primærflyt: Velg år → se sesong-tabell.
   - Komponenter: GalleryView (år-kort), DataTable Pro, TrendBand.

4. `/stats/aargang/[aar]` — Sesong-detalj (ett år)
   - Hva: Toppliste for valgt sesong. Filtrert på HCP, kjønn. Beste runder i sesongen. Turneringer.
   - Primærflyt: Se toppliste → klikk spiller (1 trykk).
   - Komponenter: DataTable Pro, TournamentCard, KpiStrip, TrendBand.

VIKTIG for dette sporet:
- Spillerprofiler er OFFENTLIGE — ingen privat data. Vis kun aggregert statistikk.
- Ingen «Øyvind Rohjan»-demo her — bruk generiske norske navn som placeholder.
- «Sammenlign»-knapp på spillerprofilen peker til `/stats/sammenlign-spillere` (Batch S6).
- Alle tilstander: innhold · tomt (spiller ikke funnet) · laster · feil.
- Ingen coaching-knapper, ingen abonnement-prompts på disse sidene.
- Lime: fremhev spillere med ny aktivitet (lime dot), aktive filtre (lime chip), CTA-er.

Still spørsmålene dine, så starter vi på spillerlisten.
```

---

### S3 — PGA-tabeller

```
[LIMER INN PREAMBELEN FØRST]

Stats-plattform — BATCH S3 — PGA Tour-tabeller (6 skjermtyper). V2 — ikke lanseringskritisk,
men PGA-dataene er allerede i databasen og disse sidene er live.

1. `/stats/pga` — PGA Tour hub
   - Hva: Inngangsside til alle PGA Tour-tall. Bento-grid med snarvei til hver metrikk
     (drive-distance, fairway%, GIR%, putts, scoring, SG total). Ferske data, sist oppdatert.
   - Primærflyt: Hub → velg metrikk (1 trykk).
   - Komponenter: GalleryView (metrikk-kort), KpiStrip, EventTimeline (siste oppdatering).

2. `/stats/pga/[metrikk]` — PGA-metrikk-tabell (f.eks. drive-distance, sg-total)
   - Hva: Toppliste for én metrikk. Søk spiller. Filtrer sesong. Sammenlign mot Tour-snitt.
   - Primærflyt: Se tabell → klikk spiller for PGA-profil.
   - Komponenter: DataTable Pro, TrendBand (metrikk-trend sesong over sesong), PercentileGauge.

3. `/stats/pga/spillere` — PGA-spillerliste
   - Hva: Søkbar liste over PGA-spillere i databasen. Klikk for profil.
   - Primærflyt: Søk → klikk spiller.
   - Komponenter: DataTable Pro, SgBar.

4. `/stats/pga/spillere/[dg_id]` — PGA-spillerprofil
   - Hva: En PGA-spillers profil. Navn, verdensrangering, DataGolf-rating. KPI (SG per kategori).
     Metrikk-historikk. Siste turneringsresultater.
   - Primærflyt: Profil → klikk turnering (1 trykk).
   - Komponenter: PhotoHero (initialer), KpiStrip, SgBreakdown, TrendBand, DataTable Pro.

5. `/stats/norske` — Norske spillere på Tour
   - Hva: Norske spillere på European/DP World Tour + Challenge Tour + LPGA. Tabell med plassering,
     poeng, SG. Fremhev aktive spillere i uka.
   - Primærflyt: Se liste → klikk spiller.
   - Komponenter: DataTable Pro, TrendBand, PercentileGauge, PulseDot (aktiv denne uka).

6. `/stats/leaderboards` — Leaderboard-hub
   - Hva: Live og ferske leaderboards fra aktive turneringer (GolfBox-data). Uke-leaderboard,
     sesong-leaderboard, historiske.
   - Primærflyt: Se leaderboard → klikk spiller eller turnering.
   - Komponenter: DataTable Pro, EventTimeline, TournamentCard, Badge.

VIKTIG: PGA-data er fra DataGolf API — vis alltid «Kilde: DataGolf» i footeren på disse sidene.
Alle tilstander inkl. «Ingen data tilgjengelig for denne sesongen». Lime: ledende spiller,
aktive filter-chips, rangeringsendring (opp = lime, ned = rød).

Still spørsmålene dine, så starter vi på PGA-huben.
```

---

### S4 — Baner + Klubber + Regioner

```
[LIMER INN PREAMBELEN FØRST]

Stats-plattform — BATCH S4 — Baner, Klubber og Regioner (6 skjermtyper). V2.

1. `/stats/baner` — Banedatabase
   - Hva: Søkbar liste/galleri over norske golfbaner i databasen. Filtrer på region, vanskelighetsgrad,
     par. Vis antall registrerte runder per bane, snitt score-differential.
   - Primærflyt: Liste/galleri → klikk bane (1 trykk) → bane-profil.
   - Komponenter: GalleryView (bane-kort med bilde-placeholder), DataTable Pro, ViewSwitcher
     (galleri/tabell-toggle).

2. `/stats/baner/[slug]` — Bane-profil
   - Hva: En banes statistikkprofil. Par, rate, slope, par per hull. Snitt score-differential for
     spillere. Beste runder spilt her. Hull-for-hull statistikk (vanskeligste hull, birdie-frekvens).
   - Primærflyt: Bane-profil → klikk runde for detalj (1 trykk).
   - Komponenter: PhotoHero (bane-bilde placeholder), KpiStrip, HoleStrip, DataTable Pro, RoundScorecard.

3. `/stats/klubber` — Klubbliste
   - Hva: Norske golfklubber. Vis antall spillere, antall runder, snittscore. Søk og filtrer.
   - Primærflyt: Liste → klikk klubb (1 trykk).
   - Komponenter: DataTable Pro, GalleryView.

4. `/stats/klubber/[slug]` — Klubb-profil
   - Hva: En clubs profil. Baner tilknyttet. Topp-spillere. Aktivitetstrend.
   - Primærflyt: Profil → klikk spiller eller bane (1 trykk).
   - Komponenter: PhotoHero, KpiStrip, DataTable Pro, TrendBand.

5. `/stats/regions` — Regionsoversikt
   - Hva: Norges golfregioner (Østlandet, Vestlandet, osv.). Antall klubber, spillere, aktivitet.
   - Primærflyt: Se kart/liste → klikk region.
   - Komponenter: GalleryView, KpiStrip, DataTable Pro.

6. `/stats/regions/[slug]` — Region-profil
   - Hva: En regions spillere, klubber, baner, aktivitetstrend.
   - Primærflyt: Profil → klikk klubb eller spiller.
   - Komponenter: PhotoHero, KpiStrip, DataTable Pro, TrendBand.

VIKTIG: Banebilder er placeholders — bruk gradient/fargeflater, ikke ekte bilde-URL.
Alle tilstander inkl. «Ingen runder registrert på denne banen». Lime: baner med fersk aktivitet.

Still spørsmålene dine, så starter vi på banedatabasen.
```

---

### S5 — Turneringer + Tour

```
[LIMER INN PREAMBELEN FØRSTE]

Stats-plattform — BATCH S5 — Turneringer og Tour (4 skjermtyper). V2.

1. `/stats/turneringer` — Turneringsdatabase
   - Hva: Søkbar liste over norske golfturneringer. Filtrer sesong, tour (NGF/Olyo/Srixon/Garmin),
     kategori (dame/herre/senior). Vis status: live (pågår), fersk (siste 7 dager), planlagt.
   - Primærflyt: Liste → klikk turnering (1 trykk) → turneringsdetalj.
   - Komponenter: DataTable Pro, TournamentCard, EventTimeline, Badge (live/fersk/planlagt).

2. `/stats/turneringer/[slug]` — Turneringsdetalj
   - Hva: En turnerings profil. Navn, dato, bane, tour, par. Live leaderboard (via GolfBox) eller
     endelig resultatliste. Rundeoversikt per spiller.
   - Primærflyt: Turnering → klikk spiller for profil (1 trykk), eller klikk runde.
   - Komponenter: TournamentCard (header), DataTable Pro (leaderboard), EventTimeline (runder),
     Badge (live/ferdig).

3. `/stats/turneringer/[slug]/statistikk` — Turneringsstatistikk
   - Hva: Statistisk dybde fra turneringen: scoring avg, fairway%, GIR%, snitt putts, SG-breakdown
     for de best plassertes spillere. Sammenlign vinneren med feltet.
   - Primærflyt: Statistikk → klikk spiller.
   - Komponenter: SgBreakdown, KpiStrip, DataTable Pro, CompareH2H, TrendBand.

4. `/stats/tour/[slug]` — Tour-profil (f.eks. Olyo Tour, Srixon)
   - Hva: En tours sesong-oversikt. Turneringskalender, poengstilling, toppliste. KPI for touren.
   - Primærflyt: Tour → klikk turnering eller spiller.
   - Komponenter: EventTimeline, DataTable Pro, TournamentCard, KpiStrip.

VIKTIG: Live leaderboard-data fra GolfBox (åpent JSON-endepunkt). Vis tydelig «Live» med
PulseDot + lime ved aktiv turnering. Tom tilstand: «Ingen turneringer funnet» med filter-reset.
Lime: ledende spiller, live-indikator, aktive filter-chips.

Still spørsmålene dine, så starter vi på turneringslisten.
```

---

### S6 — Verktøy + Sammenligning + Oppdagelse

```
[LIMER INN PREAMBELEN FØRSTE]

Stats-plattform — BATCH S6 — Verktøy, Sammenligning og Oppdagelsessider (14 ruter, 8 skjermtyper).
V2 — lavest prioritet i Stats-sporet, men verktøyene er «sticky» (brukere kommer tilbake for disse).

VERKTØY (5 kalkulatorer + hub):

1. `/stats/verktoy` — Verktøy-hub
   - Hva: Oversikt over alle kalkulatorer. Bento-grid med 5 kort, kort beskrivelse av hva hvert
     verktøy beregner.
   - Komponenter: GalleryView (kalkulator-kort), SectionHeader.

2. `/stats/verktoy/avstand` — Avstandskalkulator
   - Hva: Beregn forventet carry-avstand basert på køllenummer, slagtype, temperatur, høyde over
     havet. Resultat: forventet avstand ± margin.
   - Komponenter: StatTile (resultat), GhostNumber (avstand), Input, TrendBand (avstand per kølle).

3. `/stats/verktoy/score-til-hcp` — Score → HCP-konvertering
   - Hva: Skriv inn score og bane-rating/slope → beregn score differential og estimert ny HCP.
   - Komponenter: StatTile, GhostNumber, Input.

4. `/stats/verktoy/sg-estimator` — SG-estimator
   - Hva: Skriv inn fairway%, GIR%, putts/runde → estimert SG total og per kategori.
   - Komponenter: SgBreakdown (resultat-viz), StatTile, Input, PercentileGauge.

5. `/stats/verktoy/tour-ekvivalent` — Tour-ekvivalent
   - Hva: Hva tilsvarer din HCP/snittscore på PGA Tour-skala? Contextualizer.
   - Komponenter: PercentileGauge, CompareH2H, GhostNumber, StatTile.

6. `/stats/verktoy/whs-kalkulator` — WHS-kalkulator
   - Hva: Beregn World Handicap System-tall: differensial, HCP-justering, playing handicap.
   - Komponenter: StatTile, GhostNumber, Input, TrendBand.

SAMMENLIGNING:

7. `/stats/sammenlign-spillere` — Spiller-til-spiller sammenligning
   - Hva: Søk 2 spillere → sammenlign HCP, SG per kategori, snitt score, runder spilt. Radar-overlay.
   - Primærflyt: Søk spiller A → søk spiller B → se sammenligning (2 trykk).
   - Komponenter: CompareH2H, SkillRadarLive, SgBreakdown, DataTable Pro.

8. `/stats/sg-sammenlign` + `/start` + `/resultat/[id]` — SG-sammenligningsverktøy (wizard)
   - Hva: Guided wizard: velg 2+ spillere → velg metrikk → se SG-sammenligning. Resultatsiden
     kan deles (URL med id).
   - Primærflyt: Start → velg spillere (1 trykk per) → se resultat.
   - Komponenter: WizardShell (steg-indikator), CompareH2H, SgBreakdown, SkillRadarLive, ShareCard.

OPPDAGELSE (fremtidige sider, design som STUB-tilstander med «kommer snart»):

9. `/stats/min-progresjon` (krever innlogging), `/stats/sok`, `/stats/quiz`, `/stats/wrapped/[slug]`
   - Hva: min-progresjon = personlig historikk (krever kobling til PlayerHQ-konto), sok = global søk,
     quiz = golf-quiz, wrapped = ÅR-i-golf (a la Spotify Wrapped).
   - Design disse med «kommer snart»-tilstand + e-post-påmelding CTA, ikke som tomme sider.
   - Komponenter: PageHero, EmptyState (med CTA), Button.

VIKTIG for hele batch S6:
- Verktøyene er interaktive — hvert skjermfelt som krever input MÅ ha validering (tomt felt = feil-tilstand).
- Kalkulatorer er «sticky» — resultater bør være delbare (enkel URL eller kopier-knapp).
- `min-progresjon` krever innlogging til PlayerHQ — vis tydelig «Logg inn for å se din progresjon»-CTA
  (lenker til `/auth/login`), ikke tomt innhold.
- Lime: beregnet resultat (tall som «skinner»), CTA-er, aktive inputs.
- Ingen coaching-kontekst på verktøy-sidene.

Still spørsmålene dine, så starter vi på verktøy-huben og én kalkulator som mal for resten.
```
