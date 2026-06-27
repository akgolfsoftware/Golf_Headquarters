# DataGolf → verdens beste golf-verktøy: analyse, design og spørsmål

> **Dato:** 2026-06-27 · **Formål:** Gjøre DataGolf-dataene + PlayerHQ til verdens mest komplette
> trenings- og analyseverktøy for golfspillere på alle nivåer, med nytenkende visualisering, en
> gratis akgolf.no-funnel, og en live-/ukeresultat-hub. Skrevet som grunnlag før bygging — avsluttes
> med alle spørsmålene som må besvares for 10/10.

---

## Del 0 — Komplett datainventar (hva vi faktisk sitter på)

| Kategori | Felt | Tidsrom | Type | Verktøy-verdi |
|---|---|---|---|---|
| **Round-level** (`dg_rounds` + `dg_round_sg`) | score, to_par, tee_time, finish_pos, made_cut · SG total/ott/app/arg/putt/t2g · driving_dist, driving_acc%, gir%, scrambling%, prox_fw, prox_rgh | 1983–2026, 26 tours | Faktisk | **Kjernen.** Hele fordelingen for hver kategori, per nivå/tour. Gjør at vi kan plassere ENHVER spiller på en percentil-kurve for HVER kategori. |
| **Skill-ratings** (`dg_skill_ratings`) | SG-skill per kat. + driving + dg_rank + owgr_rank, `as_of`-snapshot | Daglige snapshots | Modell (tidsserie) | Trend/progresjon over tid; «verdens beste»-referanse. |
| **Approach-skill** (`dg_approach_skill`) | skill per avstandsbøtte 50–75 … 200+ | Per sesong/tour | Modell | Avstandsspesifikk innspill-benchmark + drill-forskrift. |
| **Decompositions** (`dg_player_decompositions`) | true_skill + SG-komponenter | Per sesong/tour | Modell | «Ekte ferdighet» renset for varians. |
| **Event-finishes** (`dg_event_finishes`) | finish, earnings, FedEx, DG-points | PGA 2025+ | Faktisk | Resultat/prestasjons-kontekst. |
| **Live** (ikke wiret enda) | in-play vinnersannsynlighet, live SG + tradisjonelt, hull-scoring-fordeling | Under aktive events | Faktisk/modell (live) | Live-scoring-hub + «puls». |
| **Betting/DFS** (valgfritt) | outright/matchup-odds, DFS salaries/ownership | 2017/2019+ | Marked | Ikke benchmark-data; lav coaching-verdi. |
| **WAGR** (`dashboard.wagr_*`) | amatør-ranking + events | Løpende | Faktisk | Amatør-/junior-bro til pro-benchmarks. |
| **Kohort/college** | norsk progresjon p10–p90, college-pipeline | Per kull/år | Faktisk | Nivå-stige for norske juniorer. |

**Den strategiske innsikten:** Vi har den fulle *fordelingen* av hver eneste stat-kategori, per tour og
over tid. Det er råstoffet som lar oss sette **benchmarks for hver kategori, på hvert nivå** — fra
klubbspiller til verdens nr. 1 — og oversette en hvilken som helst spillers tall til «hvor langt unna
neste nivå er du, i slag».

---

## Del 1 — Verdens beste treningsverktøy (analytiker-perspektiv)

Kjerneideen: **én universell benchmark-motor.** Hver kategori vi måler en spiller på får en
percentil-plassering mot den ekte DataGolf-fordelingen for valgt referansenivå, og et **gap i slag**
til neste nivå. Det gjør treningsplanen datadrevet hele veien.

**Syv byggeklosser:**
1. **Nivå-plassering (percentil):** «Din APP 150–175 y ligger på 62-percentilen av KFT, men 18 av PGA.»
2. **SG-gap → drill-forskrift:** største negative SG-kategori blir treningsfokus (vi har gap-to-drill alt) — nå drevet av *ekte* benchmarks, ikke estimater.
3. **Avstandsbasert innspill-benchmark:** `dg_approach_skill`-bøttene → benchmark per wedge/jern-avstand → avstandsspesifikke drills.
4. **Progresjons-/banekurve:** skill-rating-tidsserier → modellér spillerens forbedringskurve mot kurven til de som faktisk nådde neste nivå. «For å nå KFT vinner spillere på din alder typisk +0,4 SG/år i APP.» (kobler kohort/talent.)
5. **Tour-ekvivalent oversettelse:** oversett junior/amatørscore til tour-SG-ekvivalent — motiverende kontekst.
6. **Per-kategori benchmark-mål:** for HVER kategori akademiet måler, sett mål = neste nivås median. Dette ER «benchmarks for kategoriene vi kartlegger stats/trening på».
7. **Hva-hvis-modell:** «Hvis du løfter PUTT til KFT-median, faller scoring-snittet ditt X.»

**Nivå-adaptiv:** samme motor, ulik referanse-kohort — klubbspiller måles mot amatør/klubb-fordeling,
elite-junior mot college/KFT, proff mot tour. Bro for amatører (DataGolf er pro-only): WAGR +
norske turneringsdata + tour-ekvivalent-modell.

---

## Del 2 — Verdensledende design (designer-perspektiv)

Vekk fra tabeller. Signaturkomponenter (alle interaktive, AK editorial sport-analytics — skog/lime, mono-tall, dybde):

1. **Benchmark-scrubber (signatur-interaksjon):** én slider som re-kontekstualiserer ALLE tallene mot valgt nivå/kohort (klubb → PGA). Dra, og se percentilen din bevege seg live på hver kategori.
2. **Fordelings-radar:** ikke flat radar — hver akse er en fordelingskurve (violin) med din markør + nivå-bånd skyggelagt. Viser ikke bare «hvor god», men «hvor i fordelingen».
3. **SG-elv:** animert flyt av hvor slag vinnes/tapes mot benchmark, kategori for kategori.
4. **Approach-varmestige:** avstandsbøtter som vertikal stige, farget etter percentil; trykk → fordeling + drill.
5. **Ascent-kurve:** spillerens ferdighetskurve over tid lagt over median-«bestigningskurvene» til de som nådde hvert nivå — «fjellet du skal opp».
6. **Spillerkort («trading card»):** delbart, vakkert identitetskort med nøkkel-SG + percentiler (sosialt + funnel).
7. **Live-puls:** sanntids SG-flyt + pustende vinnersannsynlighet + hull-for-hull varmekart.

---

## Del 3 — akgolf.no gratis-funnel

Rask, gratis, ukentlig oppdatert offentlig flate som driver trafikk → PlayerHQ-salg:
- **«Denne uka i norsk golf»:** forrige ukes resultater for norske spillere på tvers av tours (fra mandagslasten).
- **Auto-genererte stats-historier:** «størst SG putting denne uka», største klatrere, WAGR-endringer.
- **Benchmark-teaser:** «Se hvor du ville rangert — prøv PlayerHQ.»
- **SEO-rikt:** spiller- og turneringssider indekseres → organisk trafikk → CTA til abonnement.
- Gratis krok (resultater) — dybden (dine egne benchmarks) bak abonnement.

---

## Del 4 — Live-/ukeresultat-hub

- **Mandagslast 07:00** → resultat-hub. Start: norske spillere på tvers av alle tours (DataGolf + WAGR + norske juniorturneringer) — «enkleste sted for norske resultater».
- **Sikt:** alle turneringer i verden (DataGolf 26 tours + norske junior-pipelines).
- **Ekte live** (in-play, live SG) er sanntid, ikke ukentlig — eget steg etter ukeresultat-hub.
- Sterk SEO + funnel-effekt.

---

## Del 5 — ALLE spørsmålene for 10/10 (må besvares)

### A. Benchmark-motoren (kjernen i treningsverktøyet)
A1. Hva er den **kanoniske listen** over kategorier akademiet måler stats/trening på? (AK-taksonomien — vi må mappe hver til et DataGolf-felt. Dette er det aller viktigste.)
A2. For hver kategori: hvilke **referansenivåer** skal en spiller måles mot? (klubb · regional · nasjonal junior · college · KFT · Euro · PGA · topp-50 · nr. 1)
A3. Hvordan benchmarker vi **amatør/junior/klubb** når DataGolf er pro-only? Godkjenner du broen WAGR + norske turneringsdata + tour-ekvivalent?
A4. Skal benchmarks være **alders- og kjønnsjustert** (gutt/jente junior, senior)?
A5. **FYS-formelen** — er den fortsatt låst/plassholder, eller har vi referanseverdier nå? (påvirker fysiske kategorier)
A6. Hvordan **legger spilleren inn egne tall** for sammenligning? (TrackMan, manuelt, runder — hva er kanonisk kilde per kategori?)
A7. Skal benchmarks vises som percentil, slag-gap, nivå-etikett — eller alle tre?

### B. Data-omfang
B1. Skal vi hente **betting/DFS-data** også (literal «all data»), eller droppe (ikke coaching-relevant)?
B2. Vil du ha **ekte sanntids-live** (DataGolf live-endepunkter pollet under events), eller holder ukeresultat nå?
B3. Hvor langt **tilbake** i historikk betyr noe for benchmarks (alt fra 1983, eller siste N år)?
B4. Hvilke **tours** er referanse for norske spillere på hvert nivå?

### C. Design / visuell
C1. Holder vi oss i **AK-designsystemet** (skog/lime, Inter/JetBrains Mono), eller eget visuelt språk for data-produktet?
C2. **Lyst eller mørkt** for den offentlige stats-flaten? (PlayerHQ lyst, AgencyOS mørkt — hva for akgolf.no?)
C3. Hvilke **2–3 signaturvisualiseringer** bygger vi først (MVP) av de syv i Del 2?
C4. **Mobil- eller desktop-først** for data-visualiseringen?
C5. Finnes det **referanse-produkter/estetikk** du beundrer (golf eller andre felt) for å kalibrere «verdensklasse»?

### D. akgolf.no funnel
D1. Hvor bor landingssiden — **akgolf.no-rot** eller `/stats`-subpath (vi har `/stats/*` i HQ alt)?
D2. Eksakt **konverteringsmål/CTA** — gratis prøveperiode eller 300 kr/mnd direkte?
D3. Hva er **gratis vs. bak betalingsmur** (ukeresultater gratis; personlige benchmarks bak mur?)?
D4. **Norsk-først** publikum, eller internasjonalt fra start?

### E. Live-/resultat-hub
E1. **«Live» = sanntid eller ukesnapshot** i v1?
E2. Hvordan identifiserer vi **«norsk spiller»** på tvers av DataGolf (country=NOR), WAGR og juniorturneringer?
E3. Hvilke turneringer i v1 — pro-tours + norske juniorturneringer (olyo/srixon/…)? Amatør?
E4. **Varsler** (f.eks. når en norsk spiller slår ut / er ferdig)?
E5. Mandagslast 07:00 — GitHub Actions er deaktivert (billing). Skal vi **fikse Actions**, bruke **Vercel cron**, eller lokal scheduler for den ukentlige lasten?

### F. Produkt/forretning/prioritet
F1. Primærbruker per flate (coach / spiller / besøkende)?
F2. Bekreft abonnementsmodell (300 kr/mnd) + hva som er bak mur.
F3. **Rekkefølge** — hvilket av de fire områdene bygger vi først?
F4. Arkitektur-bekreftelse: precompute **benchmark-tabeller** (percentiler per kategori/nivå/tour) fra DataGolf → servert via `/api/v1` → konsumert av HQ. OK?
