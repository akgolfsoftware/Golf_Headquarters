# BYGGELOGG — flaggede avgjørelser & blokkeringer (autonom skjermbygg)

> Samlet liste over ting den autonome skjermbygg-loopen har FLAGGET (ikke fabrikert/gjettet)
> — for Anders' gjennomgang. Loopen bygger det klart fasit-bestemte og flagger resten her.
> Oppdateres per iterasjon. Branch: `feat/terminal-lys-build`.

---

## BLOKKERT på parkerte/ubygde funksjoner (krever Anders' input + ny logikk)

### B-1 · Statistikk «diagnose-først» blokkert på A–K-nivåsystem
- **Skjerm:** `/portal/statistikk` (Fase 3.3). Fasit: «PlayerHQ Statistikk-SG (terminal-lys).dc.html».
- **Problem:** Ny fasit er «diagnose-først» — dominante elementer er **«SITT NIVÅ NÅ»** (nivå «Nordic», «82 % til neste · Challenge Tour», mot tour-baseline) + **«LUKK DISSE TIL NESTE NIVÅ»** (3 rangerte slag-gevinst-gap). Begge krever:
  1. **A–K snittscore-nivåstige** — PARKERT, 0 kode, venter på dine 11 grenser ([KONFLIKTER K-04]).
  2. **«Neste nivå»-motor** — finnes ikke (DATA-INVENTORY §4); `diagnostiserSg()` finnes men er frakoblet.
- **Handling:** Ikke fabrikert nivå/prosent. Skjerm står på dagens «Statistikk-hub» (fungerende, eldre layout). Markert ⚠ i SKJERM-STATUS.
- **Trenger fra deg:** (a) de 11 A–K-grensene, (b) grønt lys til å bygge nivå/neste-nivå-motoren (stort, egen oppgave). Til da kan ikke diagnose-først-skjermen fullføres.
- **Sannsynlig bredere:** flere PlayerHQ-skjermer (Statistikk, evt. Dashboard-nivåhint, talent) bruker samme nivå-stige → samme blokkering.

### B-2 · Onboarding steg 6 «Her er du nå» blokkert på A–K-nivåsystem
- **Skjerm:** `/onboard` (Fase 3/5). Fasit: «PlayerHQ Onboarding» — 6-stegs wizard.
- **Buildbart:** steg 1 (profil: alder/klubb/HCP/snittscore) + steg 2 (mål: Til neste nivå/Lavere HCP/Turneringsklar) er rene skjemaer.
- **Blokkert:** steg 6 «Klar · Her er du nå» viser nivå-diagnose («snittscore 73-78» + nivå/kohort) — samme A-K-nivåsystem som B-1. Ikke fabrikert.
- **Verifiseringsgrense:** testspilleren er allerede onboardet → `/onboard` redirecter, så app-shot kan ikke fange wizard-stegene uten en fersk ikke-onboardet bruker. Trenger egen test-bruker for å verifisere onboarding-flyten.

---

## DATA-GRENSER (bygd det mulige, utelatt fabrikert data)

### D-1 · Analyse 4-KPI-grid + tour-snitt + SG-trend-stil
- **Skjerm:** `/portal/analysere` (commit 15e2087b). SG-modulen portet ✅.
- **Utelatt (ikke fabrikert):** 4-KPI-grid (GIR%/PUTTS/UP&DOWN — finnes i statistikk-datalaget fra HoleScore, kan kobles senere), «VS TOUR-SNITT»-toggle (ingen tour-sammenligningsdata), SG-trend som søylediagram (app har TrendBand-linje).
- **Handling:** Markert 🔨. Kan kobles når/hvis ønsket — krever datalag-utvidelse, ikke ny beslutning.

---

## IA-NOTATER (bygd per låst beslutning, men verdt et blikk)

- **Analyse-faner:** app har 4 (SG/Runder/TrackMan/Tester), fasit viser 5 (Analyse/TrackMan/Runder/SG/Tester). Bygd som 4 per låst «Analyse = én flate med faner» — «ANALYSE» vs «SG» som separate faner virker redundant i fasiten. Ikke restrukturert unilateralt.

### I-2 · SG-import: fokusert wizard-steg vs full runde-logger
- **Fasit:** «PlayerHQ SG-import» = «LOGG RUNDE · STEG 2 AV 3» — fokusert SG-inntasting (DETALJNIVÅ RASK/PRESIS, snittscore + antall putt + 4 SG-kategorier som kort, SG TOTALT-sum → Lagre runde). Del av en 3-stegs runde-logge-wizard.
- **App:** `/portal/mal/runder/ny` (`runde-ny-form.tsx`) er ÉN full hull-for-hull-logger (18 hull +/- + bane/dato + SG-seksjon «valgfritt» nederst + notat). **Funksjonelt dekker den SG-inntasting** (OTT/APP/ARG/PUTT-felt finnes), men er ikke fasitens fokuserte wizard.
- **Flagget (ikke restrukturert):** Skal runde-logging bli en 3-stegs wizard (steg 1 score → steg 2 SG-import → steg 3 …) med en egen fokusert SG-import-flate, eller beholde dagens enkelt-skjema? Flyt-/IA-beslutning. App-en virker i mellomtiden. Anbefaling: avklar med Anders før flyt-restrukturering.

---

## FORELDER (verifisering opplåst — re-port pågår)

### F-1 · Test-forelder-konto opprettet → forelder-klyngen kan verifiseres
- **Problem:** Foreldreportalen (`/forelder/*`, PARENT-auth-guard) kunne ikke app-shottes — DB hadde 0 PARENT-brukere, og å seede falsk forelder-data ville brutt «aldri fabrikér».
- **Løsning (ikke fabrikering):** `scripts/seed-screentest-parent.ts` lager en test-FORELDER (`screentest-parent@akgolf.test` / `Screentest123!`, «Kari Rohjan») + `parent_relations`-kobling til den eksisterende test-spilleren (Øyvind Rohjan). Forelderen ser spillerens EKTE data via koblingen — kun selve test-kontoen opprettes, samme prinsipp som screentest-spilleren.
- **App-shot:** `SHOT_EMAIL=screentest-parent@akgolf.test SHOT_PASSWORD='Screentest123!' node scripts/app-shot.mjs mobil "forelder:/forelder" /tmp/akhq-forelder`.
- **Funn 1 (re-port nødvendig):** Dagens `/forelder` er det GAMLE hybrid-designet (spiller-stil hero «God morgen Øyvind» + «denne ukens fokus»-kort + KPI-strip). Den nye fasiten «Forelderportal (terminal-lys)» er omstrukturert read-only: (a) **samtykke-status-kort øverst** (prominent GDPR, ikke en note nederst), (b) **narrativ ukerapport** («trente 5 av 5 planlagte økter denne uka, jobbet mest med nærspill…») + 3 KPI (oppmøte/SG-trend/streak), (c) **8-ukers fremgang-søylediagram** (mangler i dag). Re-port krever datalag-utvidelse i `src/lib/forelder.ts`: ukentlig SG-aggregat (fra spillerens ekte runder) + planlagt-vs-fullført-økter for narrativen. Ingen fabrikering — alt avledes fra ekte data.
- **Funn 2 (rolle-redirect, lavt):** Innlogging som PARENT redirecter til `/portal` (ikke `/forelder`) — auth-guarden slipper likevel PARENT inn på `/forelder/*` ved direkte navigasjon. Verdt å rette post-login-redirect til rolle-riktig landing før go-live (ikke en blokker for skjermbygg).

---

## CONTENT-REVIEW (skjerm bygd & verifisert, men innhold må godkjennes før prod)

### C-1 · Marketing testimonial-/case-tall må bekreftes ekte før lansering
- **Skjermer:** `/(marketing)/suksess` (Lars H. HCP 28→16, Emma S. 18→6, Geir T. 22→14) + `/(marketing)/cases` (Marius B. −6,3 SG, Emma L. −4,5). Bygd & verifisert (lyst editorial, responsiv) — strukturen er fasit-riktig.
- **Flagg:** Dette er konkrete navn + tallforbedringer presentert som ekte spillerresultater. Eksisterende marketing-innhold (ikke generert av loopen denne økten), men før prod-deploy bør Anders bekrefte at testimonials er ekte/godkjente (samtykke) eller merke dem tydelig som illustrative eksempler. Ikke en build-blokker; et content/juridisk go-live-punkt.
- **Beslektet:** `/(marketing)/personvern` + `/vilkar` + `/cookies` er selv-flagget «Utkast — godkjennes med advokat før Q3 2026» i egen UI. Juridisk gjennomgang er allerede et kjent go-live-punkt.

---
*Loopen fortsetter med skjermer som IKKE er blokkert. Blokkerte/parkerte føres her til du tar stilling.*
