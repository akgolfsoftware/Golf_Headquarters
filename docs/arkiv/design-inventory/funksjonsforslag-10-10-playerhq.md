# Funksjonsforslag — PlayerHQ mot 10/10

> Nye funksjoner som løfter spiller-appen til verdensklasse. Forankret i samme to analyser som AgencyOS
> (`scratchpad/intern-visjon-gap.md` + `ekstern-konkurranse-gap.md`), nå med **spiller-vinkel**.
> Mange er *speilet* av AgencyOS-funksjoner og deler motor/datamodell — bygg én gang, vis to steder.
> PlayerHQ er **alltid lyst**. Video-verktøy ligger i V2. Generert 2026-06-30. Forslag, ikke låst.

---

## Hvor PlayerHQ allerede er sterk
- **Komplett selvbetjent treningsapp:** Workbench, live-økt (5 steg), SG-Hub, runder, TrackMan, tester, mål.
- **Datainntak finnes delvis:** TrackMan/UpGame-import, manuell runde, helse-logg.
- **Motivasjons-byggeklosser finnes:** mål, milepæler, leaderboard, utfordringer, feiring (men spredt).

10/10 = gjøre tallene *forståelige og motiverende*, gjøre appen *proaktiv*, og samle motivasjons-laget.

---

## Spiller-spesifikt 10/10-perspektiv
Forskjellen fra coachen: spilleren trenger **klarhet** («er jeg god? hva gjør jeg nå?») og **motivasjon**
(framgang, mestring, deling) — ikke et kontrolltårn. De samme dataene, men oversatt til spillerens språk.

---

## Tier 1 — Høy ROI, deler motor med AgencyOS (3–6 mnd)

| # | Funksjon | Type | Lander i fane | Speiler AgencyOS |
|---|---|---|---|---|
| P1 | **«Jobb med dette i dag»** på Hjem — personlig: din største svakhet → 1–2 driller, rett inn i dagens fokus | Differensierende | Hjem | #1 (samme fokus-motor) |
| P2 | **Benchmark + nivå-visning** i Analysere — din percentil per SG-akse, «N slag unna neste nivå», lesbart nivå (5 trinn) | Table stakes + diff. | Analysere | #2 + #3 (samme benchmark-motor) |
| P3 | **Selvbetjent datainntak** — enkel runde-logg + GolfBox/UpGame-import → auto-SG | Table stakes (fundament) | Gjennomføre/Analysere | #6 (mater motoren) |
| P4 | **Se planen tilpasse seg** — når coach/system endrer planen pga et signal, ser spilleren hvorfor + godtar | Differensierende | Planlegge/Hjem | #4 (spiller-siden av loopen) |
| P5 | **Motivasjons-laget løftet til Hjem** — streak, milepæler, framgangsfeiring samlet, ikke gjemt i undersider | Differensierende | Hjem | (player-unikt) |

---

## Tier 2 — Differensierende (6–12 mnd)

| # | Funksjon | Type | Lander i fane | Notat |
|---|---|---|---|---|
| P6 | **Delbart spillerkort** — «trading card» med nivå/percentil/framgang, delbar til SoMe → akgolf.no-funnel | Differensierende (vekst) | Hjem/Meg | Driver salg; signatur-viz fra visjon Del 2 |
| P7 | **Proaktiv MORAD-Caddie** — Caddie forankret i P1–P10, foreslår fokus + svarer på spillerens språk | Differensierende | (global Caddie) | Deler #8 med AgencyOS |
| P8 | **Helse/wellness self-log + belastning** — daglig sjekk (søvn/sårhet) + enkel belastning, varsler ved risiko | Table stakes (toppidrett) | Meg/Hjem | Deler #9; spilleren er logge-kilden |
| P9 | **Live-/ukeresultat for spilleren** — følg deg selv og lagkamerater live + ukeresultat på tvers av tours | Differensierende | Hjem/Analysere | Deler #10 |
| P10 | **Strategi/dispersion på banen** — spredningskart + smartere mål per hull (DECADE-stil) | Differensierende | Analysere/Baneguide | Deler #11; baneguide finnes som stub |

---

## Tier 3 / V2 — Video & langt fram

| # | Funksjon | Hvor | Notat |
|---|---|---|---|
| **V2-1** | **Selv-opptak av sving + send til coach** — spilleren filmer, laster opp, får annotert svar | Gjennomføre/Coach | Speiler AgencyOS #7. Ingen ML |
| **V2-2** | **AI-svinganalyse (P1–P10) på egen video** — auto-feedback på MORAD-språket | Analysere/Caddie | Speiler #13. Egen ML-stack |
| — | Wearables/sensor-inntak | Meg | Lavest prioritet |

---

## Hva dette gjør med PlayerHQ-fanene

| Fane | Ny kapabilitet |
|---|---|
| **Hjem** | «Jobb med dette» (P1), motivasjon/streak (P5), delbart kort (P6), live (P9) |
| **Planlegge** | Plan tilpasser seg + spiller godtar (P4) |
| **Gjennomføre** | Selvbetjent runde-logg (P3), video-opptak (V2) |
| **Analysere** | Benchmark/nivå-visning (P2), dispersion (P10), AI-svinganalyse (V2) |
| **Meg** | Helse/wellness-logg (P8), delbart kort (P6) |
| **Caddie (global)** | Proaktiv + MORAD-forankret (P7) |

---

## Min anbefaling
- **Start P1–P3** — de gjør appen *merkbart smartere og mer motiverende* med data vi nesten har, og deler motor med AgencyOS Fase 1–2 (bygg én gang).
- **P5 (motivasjon på Hjem)** er billig og høyt engasjement — lavthengende.
- **P6 (delbart kort)** kobler PlayerHQ til vekst-funnelen på akgolf.no — strategisk.
- **Video (V2)** etter at fundamentet står.

## Neste
Se `implementeringsplan-playerhq.md` (faser) og `spesifikasjon-faser-playerhq.md` (design + bygg per fase).
