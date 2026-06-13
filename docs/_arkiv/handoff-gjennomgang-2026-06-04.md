# Komplett gjennomgang — Claude Design handoff (4. juni 2026)

> Gjennomgang av `public/design-handover/AK Golf HQ Design System/` — den ferske handoffen lagt inn 4. juni 07:24.
> Lest skjerm-for-skjerm av seks parallelle lese-agenter. Dette er gjennomgangen FØR vi starter byggearbeidet.

## Hva handoffen inneholder

- **145 HTML-skjermer, 105 skjermbilder, 52 interaktive komponenter.**
- To ferdige app-prototyper i kildekode: `playerhq-app/` (spilleren, lyst) og `agencyos-app/` (coachen, mørkt).
- Tre HELT NYE coach-flyter som tidligere manglet: fellesmelding, fokus-spiller, spiller/gruppe-veksler.
- Seks frittstående spesialverktøy (putting, slag-spredning, drill-bibliotek, anlegg).
- Workbench i to varianter (spiller + coach), med kalender- og liste-modus.
- Komplett designsystem-dokumentasjon (README + tokens) — låst.

Rundt regnet **75–80 distinkte skjermer og flyt-steg**. Noen finnes i flere varianter (mobil/desktop, og enkelte er tegnet på nytt flere steder).

---

## PlayerHQ — spillerens app (lyst tema)

### Hjem og hovednavigasjon
- **Hjem** — foto-hero med hilsen, KPI-strip (HCP 4,2 · SG +0,68 · neste økt 14:30), dagens fokus-kort med «Start økt», dagens 3 økter, treningspyramide, snarveier. Knappene fører videre i appen.
- **Varsler / Innsikt** — AI-fortelling om formen din.

### Planlegge
- **Planlegge-hub** — «Plan din utvikling», SEKS kort: Årsplan, Treningsplan, Fysplan, Mål, Turneringer, Drills. (NB: dette er den skjermen du nettopp ba om å forenkle til ÉN vei til Workbench — se funn 3.)
- **Årsplan** — sesong-gantt med 5 faser (Grunntrening → Overgang), fremdrift per fase.
- **Treningsplan** — approach-blokk, P-posisjoner, ukens økter.
- **Fysplan** — 3-dagers styrkeplan med sett/reps, fremgang i hastighet.
- **Mål** — 3 SMART-mål med fremdrift + milepæl-tidslinje.
- **Turneringer** — liste med filter (Klubb/Srixon/NM/Titleist), påmeldingsstatus.
- **Drills** — øvelsesbibliotek med kategori-filter, 48 øvelser.
- **Ny plan (wizard, 3 steg)** — velg ambisjon → mål/dato → bekreft.

### Gjennomføre
- **Gjennomføre-hub** — «Gjør jobben», 5 kort: I dag, Kalender, Live-økt, Booking, TrackMan.
- **I dag** — dagens 3 økter, stor «Start 14:30-økten»-knapp.
- **Kalender** — uke/måned-veksler, økter plottet på tidslinjen.
- **Ny økt (wizard)** — velg type → dato/tid → bekreft.
- **Live-økt (fullskjerm, 4 steg)** — brief (mål + coach-notat) → aktiv (timer, treff/bom-knapper, rep-teller) → logg (resultat + notat) → oppsummering (treff, tid, SG-effekt).
- **Booking (wizard)** — credits-måler øverst, velg type → ledig tid → bekreft.

### Analysere
- **Analyse-hub** — «Les tallene», 6 kort: Statistikk, Strokes Gained, Runder, TrackMan, Tester, Innsikt.
- **Statistikk** — HCP-trend + KPI (drive 268 m, fairway 71 %, GIR 64 %, putt 29,4).
- **Strokes Gained (SG-hub)** — 4 faner: oversikt, per kølle, yardage, vs PGA Tour.
- **SG-detaljer** — 6 faner: per kølle, forhold, yardage, utstyr, strategi, benchmark.
- **Runder** — liste over spilte runder med score + SG.
- **Runde-detalj** — scorecard hull-for-hull (ut/inn) + SG-fordeling.
- **TrackMan** — kølle-tabell (carry, total, ballfart, spinn, launch).
- **Tester** — ferdighetstester med baseline vs siste.
- **Innsikt** — 3 AI-innsikter (styrke/svakhet) med tone-farge.
- **Ny runde** — loggfør 18 hull med +/- per hull, live totalsum.
- **Drill-detalj** — video, mål, 6 nummererte instruksjonstrinn, «Legg til i plan».
- **Turnering-detalj** — format, tee-tid, feltstørrelse, medspillere.

### Coach (spillerens kontakt)
- **Coach-hub** — Anders Berg-kort, seksjoner for meldinger, planer, videoer.
- **Meldinger** — innboks-liste.
- **Meldingstråd** — chat med coach, inkl. video-klipp, komposer nederst.
- **Planer** — planer fra coach.
- **Videoer** — coach-videoer med thumbnail.
- **AI-Caddie** — chat med AI, foreslåtte spørsmål.

### Meg (profil)
- **Profil** — avatar, HCP/klubb, KPI (runder/best/snitt), snarveier, logg ut.
- **Abonnement** — PRO 300 kr/mnd, credits igjen, betalingskort, «Sammenlign planer» (Gratis vs PRO).
- **Innstillinger** — varsler, integrasjoner (Google Calendar, TrackMan, Apple Health), sikkerhet, preferanser.
- **Helse** — hvilepuls/søvn/readiness, symptom-logg.
- **Diverse** — dokumenter, utstyrsbag, foreldre-kobling, feedback, hjelp.
- **Dokumenter** — avtaler/samtykker med status.
- **Utstyrsbag** — køllene dine med avstander.
- **Hjelp (FAQ)** — søk + sammenleggbare svar.

### Auth / oppstart
- **Logg inn**, **Glemt passord**, **Registrer**, **BankID**, **Onboarding (5 steg)**, **Foreldresamtykke (junior venter)**.

---

## AgencyOS — coachens kontrolltårn (mørkt tema)

### Oversikt / daglig drift
- **Cockpit (dashboard)** — dagens timeline (4 økter), innboks (3 uleste), «Trenger oppmerksomhet» (fokus-spillere), KPI (38 aktive · 4 økter i dag · 3 godkjenninger · 148k MRR). NB: finnes i tre litt ulike versjoner i koden.
- **Oppgaver (kanban)** — Å gjøre / Pågår / Ferdig.
- **Tildelt meg** — de 5 viktigste handlingene akkurat nå.
- **Forespørsler** — spiller-forespørsler med Godta/Avvis/Svar.
- **Godkjenninger** + **Godkjenning-detalj** — plan-/økt-endringer med før/etter og «påvirker ikke andre»-vurdering.

### Stall (spillere)
- **Spillere (alle)** — tabell med gruppefilter, HCP, SG-trend (sparkline), status-prikk, neste økt.
- **Spillerprofil** — hero, coach-flagg (rødt), SG-trend, treningspyramide, aktiv plan, hurtighandlinger.
- **Grupper** — 4 grupper (WANG/GFGK/Junior/Mosjon) med snitt-HCP.
- **Talent-radar** — WAGR-emner med radar-profil per spiller.
- **Sammenligning** — 3 spillere side om side, anonymiser-bryter.
- **WAGR-import (wizard)** — lim inn → forhåndsvis → bekreft kobling.

### Planlegge (lage planer FOR spillerne)
- **Treningsplaner (kanban)** — Utkast / Aktiv / Fullført.
- **Plan-maler** + **Mal-detalj** — 6 maler med effekt-statistikk, pyramide-fordeling, uke-struktur.
- **Drill-bibliotek** + **Drill-redigering** — endring gjelder alle spillere som har drillen.
- **Turneringer** — tabell + fellesmelding-panel (se nye flyter).

### Gjennomføre / drift
- **Kalender** — uke/måned, økter plottet, «pågår nå» markert.
- **Bookinger (+ wizard)** — tabell + ny-booking i 5 steg (spiller→tjeneste→lokasjon→tid→bekreft).
- **Anlegg** — fasiliteter med belegg-%.
- **Tilgjengelighet** — uke-rutenett med ledig/opptatt.
- **Tjenester** — prisliste (Pro-time, TrackMan, clinic, test-batteri).

### Innsikt / analyse
- **Stall-analyse** — aggregert SG-trend + pyramide-fordeling for hele stallen.
- **Lag-snitt** — pyramide per gruppe.
- **Tester** — testresultat på tvers, baseline vs siste.
- **Rapporter** — 6 rapporttyper med CSV/PDF-eksport.
- **Økonomi** — 148k MRR, innbetalt/utestående, abonnement-fordeling, faktura-tabell.

### Admin / organisasjon
- **Organisasjon** — klubber, team & roller, tilgangsstyring + inviter.
- **Innstillinger** — integrasjoner, sikkerhet, klubb.
- **Audit-logg** — hvem gjorde hva, når.
- **Foreldreportal** — koblede foreldre, samtykke-status, begrenset innsyn.

---

## De tre NYE coach-flytene (dekker hullene fra master-planen)

### 1. Fellesmelding til turneringsdeltakere (broadcast)
Komplett flyt, både desktop (4 steg) og mobil (5 steg):
**Velg turnering → velg deltakere (alle påmeldte forhåndshuket, foreldre varsles automatisk for juniorer) → skriv + live forhåndsvisning (med ferdige blokker: Baneinfo, Tips, Lykke til, Tee-tider, Vær + AI-knapp «Caddie: stram inn») → velg kanaler (push/e-post/SMS) → send → bekreftelse (8/8 levert).**
Dette er nøyaktig flyten du etterspurte. Designet er ferdig; selve send-knappene er ennå uten kobling (forventet i en prototype).

### 2. Fokus-spiller med pin + AI-forslag (focus)
Panel «Trenger oppmerksomhet» med to deler:
- **Pinnet** — spilleren du manuelt har festet øverst, med begrunnelse («2 økter bak før turneringen») + Legg til økt / Melding / Profil + «Løsne fra topp».
- **AI-forslag (Caddie)** — 3 kort med begrunnelse og prioritet: Hastespørsmål (rød), Ubesvart melding (blå), Manglende oppfølging (gul) — hver med kontekst-knapper (Book 30 min / Se video / Ring).
Manuell pin + AI-forslag side om side — akkurat hybriden du beskrev.

### 3. Spiller ↔ gruppe-veksler (switcher)
Fast topp-kontroll: bytt mellom **Spiller-modus** (1 avatar) og **Gruppe-modus** (avatar-stack). Picker med søk + «nylig sett» + hurtigtaster (G1, G2).
- Spiller-visning: hero + KPI + pyramide med mål-indikator.
- Gruppe-visning: summary (8 spillere, +0,03 snitt-SG, 2 bak plan) + spiller-kort med mini-pyramide.
Dette er player-pickeren øverst i AgencyOS du etterspurte.

---

## Spesialverktøy (frittstående)

- **Drill-bibliotek (standalone)** — komplett: filterbar, kort, hover. Produksjonsnær.
- **Anlegg** — sidebar + kart/kalender-faner + kapasitetsbar. Produksjonsnær.
- **Putte-verktøy** — 6-ledds putte-modell + tre «retninger» (greenen / kjeden / kontroll). Pedagogisk, elite.
- **Break-tabell** — putting green-reading-tabell. Pakket som komprimert React-app (krever utpakking i nettleser).
- **DispersionTool / Utslag-spredning** — slag-spredning per hull/område, klikkbare hotspots på hull-kart. Elite. Avansert, posisjonsfølsom.

> Putting + dispersjon = elite-pakken. Bevisst utsatt (Elite Fase 2), men nå ferdig tegnet.

---

## Funn og risiko (ærlig)

1. **De tre flytene som manglet er nå designet.** Fellesmelding, fokus-spiller og spiller/gruppe-veksler dekker de tre hullene master-planen flagget. Dette er det største løftet i handoffen.

2. **Workbench-prinsippet ditt er innebygd.** Én flate, spiller- og coach-variant, kalender- og liste-modus, og veksleren lar coachen hoppe spiller↔gruppe.

3. **Planlegge-skjermen er IKKE oppdatert til din siste beslutning.** Den har fortsatt de seks likestilte kortene (Årsplan/Treningsplan/Fysplan/Mål/Turneringer/Drills), ikke «ett trykkpunkt → Workbench». Handoffen er laget før den beslutningen. Krever en oppfølging til Claude Design.

4. **AgencyOS-cockpit finnes i tre litt ulike versjoner i koden.** Vi må velge ÉN når vi bygger, ellers risikerer vi at tall spriker.

5. **Filtre/knapper som ennå ikke gjør noe.** Flere steder ser et filter eller en knapp ut til å virke, men gjør ingenting ennå (audit-logg-filter, sammenlign-periode, drill-redigering). Normalt for en design-prototype — men verdt å vite før vi bygger så vi faktisk kobler dem.

6. **To åpne beslutninger designeren venter på:**
   - **Spillernavn-kanon:** samme spiller heter «Markus R.P.» på coach-flatene og «Markus Berg» på spiller-flatene. Må velge én skrivemåte — påvirker 30+ skjermer.
   - **FYS-formel / referanseverdier:** testene (CMJ, sprint osv.) mangler fasit-tall. Skjermene kan bygges visuelt nå, men tallene låses først når formelen er bestemt.

---

## Beslutninger til Anders + neste steg

1. **Spillernavn:** «Markus Berg» (fullt navn) eller «Markus R.P.» (forkortet)? Velg én.
2. **FYS-formel:** skal jeg hente fram referanseverdiene fra FYS-programmet (25 tester finnes allerede i prosjektet), eller venter vi?
3. **Planlegge → Workbench:** skal jeg lage oppfølgingen til Claude Design som forenkler Planlegge-skjermen til ett trykkpunkt (din siste beslutning), så neste handoff-versjon er riktig?
4. **Når den klikkbare prototypen lander:** vi kjører samme gjennomgang på den, og sammenligner mot master-skjermplanen for å se hva som faktisk er nytt vs. allerede bygget.
