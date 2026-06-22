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
- **Funn 1 — LØST (re-port ferdig):** `/forelder` er nå portet til terminal-lys-fasiten (0 avvik, adversarial diff). Ny `hentForelderUkerapport()` i `src/lib/forelder.ts` avleder ALT fra ekte data: samtykke-status (`guardianConsentGivenAt`), narrativ ukerapport (planlagt-vs-fullført TrainingSessionV2 denne uka + top-pyramide-fokus), 3 KPI (oppmøte/SG-trend-delta/streak), 8-ukers SG-søyler (ukentlig snitt sgTotal fra runder), coach-notat (siste melding-varsel). Ny view `src/components/forelder/hjem-terminal.tsx`. Empty-week håndtert. Gammel `ForelderOversiktView` + `hentForelderOversikt` er nå foreldreløse (pre-eksisterende, ikke slettet). GJENSTÅR: forelder-undersider (ukerapport-detalj, betaling, varsler, samtykke) — egne fasit-skjermer i «long-tail».
- **Funn 2 (rolle-redirect, lavt):** Innlogging som PARENT redirecter til `/portal` (ikke `/forelder`) — auth-guarden slipper likevel PARENT inn på `/forelder/*` ved direkte navigasjon. Verdt å rette post-login-redirect til rolle-riktig landing før go-live (ikke en blokker for skjermbygg).

### F-2 · Forelder-undersider — ukerapport LØST, varsler + betaling datablokkert
- **`/forelder/ukerapport` — LØST:** portet til fasitens `/foreldre/rapport/[id]` (Denne uka 3-stat + coachens kommentar + høydepunkt). Alt fra ekte data via `hentForelderUkerapport` (utvidet med trentTimer + ukeSg + beste TestResult). Persentil i fasitens høydepunkt («22/30 · PERSENTIL 78») er UTELATT — TestResult har ingen persentil-felt, ville vært fabrikert.
- **`/forelder/varsler` — DATABLOKKERT:** fasiten har 4 toggles (Ukerapport klar / Coach sendte melding / Bak treningsplanen / Nytt nivå-opprykk) + «Send rapport · Søndager». Det finnes INGEN `NotificationPreference`-modell i Prisma — togglene ville vært ikke-persisterende pynt (fabrikert UI-tilstand). Trenger fra deg: grønt lys til å legge til en `NotificationPreference`-modell (parent-varsler) + migrasjon. Til da står dagens varsler-skjerm.
- **`/forelder/fakturaer` + `/okonomi` (fasit «Betaling») — DELVIS DATABLOKKERT:** abonnement (PRO · 300 kr/mnd · AKTIV) er ekte (Subscription). MEN betalingsmetode («Visa •••• 4242») er Stripe-data som ikke ligger i DB, og kvitteringer (INV-xxxx) krever `Payment`-records som ikke er seedet → tom liste. Kortdetaljer kan ikke vises uten ekte Stripe-kobling (= live Stripe, som er bak det harde stoppet). Bygg abonnement-kortet + ekte/tom kvitterings-liste; flagg betalingsmetode til Stripe-integrasjon er live.

---

## AGENCYOS (mørkt, verifisert bygd fra tidligere faser)

### A-1 · AgencyOS-hovedskjermer verifisert — to cockpit-KPI mangler aggregat
- **Verifisert mørk 1280px som ADMIN (coachtest@akgolf.test):** cockpit `/admin/agencyos`, stall `/admin/stall`, forespørsler `/admin/foresporsler`, gjennomføre `/admin/gjennomfore`, kalender `/admin/kalender`, handlingssenter `/admin/handlingssenter`. Alle bygd, mørke, kalibrert i tidligere faser — matcher fasit + dokumenterte design-porting-gate-unntak (sidebar/fane-rad/innboks-tillegg, Booking-kun-forespørsler, full oppgave-arbeidsverktøy). Markert ✅ i SKJERM-STATUS.
- **Datagap — PARKERT MED KOMMENTAR (venter på Anders' grønt lys):** cockpit-KPIene **STALL-SG** og **PLAN-ADHERENCE** viser «—». Disse er BEVISST parkert i `src/components/admin/cockpit/agency-cockpit.tsx` (linje 174-188) med eksplisitt kommentar «placeholder til Stall-SG-beregning er låst» / «placeholder til formelen er låst». Jeg overstyrer IKKE en bevisst park-markør uten din bekreftelse (regel: usikker → spør, ikke gjett).
  - **Forslag til definisjon (klar til å bygge når du sier ja):** STALL-SG = snitt `sgTotal` over alle stall-spilleres runder siste 30 d — SAMME beregning som allerede vises på `/admin/runder` («ingen falske tall»), så det er gjenbruk, ikke ny formel. PLAN-ADHERENCE = fullførte / planlagte `TrainingPlanSession` på tvers av stallen siste 30 d (per-plan «% fullført» finnes allerede på spiller-detalj). Begge fra ekte data.
  - **Spørsmål til deg:** (a) Greit å bruke 30-dagers vindu + alle PLAYER-brukere? (b) Skal junior/mosjonist telle med, eller kun elite? Si fra, så kobler jeg på neste runde (liten endring: utvid loadDailyBrief + erstatt de to placeholderne).
- **Long-tail VERIFISERT (runde 2):** spiller-detalj `/admin/spillere/[id]`, `/admin/coach-workbench` (kun visuell skin), `/admin/tester`, `/admin/runder`, `/admin/okonomi`, `/admin/caddie`, `/admin/agents` — alle bygd, mørke, kalibrert med ekte data. Markert ✅. (coach-workbench manglet i SKJERM-STATUS-tabellen — lagt til.)
- **Long-tail VERIFISERT (runde 3):** spiller-detalj-faner (/fremgang,/profil,/tester), `/admin/agencyos/live`,`/uka`,`/caddie`,`/okonomi`,`/spillere` (cockpit-faner), `/admin/grupper`, `/admin/godkjenninger`, `/admin/messages`, `/admin/kalender/maned`, `/admin/tester/benchmarks`. Alle bygd, mørke, ekte data. Markert ✅. **AgencyOS samlet: ~26 skjermer verifisert.**
- **Gjenstår å verifisere (lav rest):** spiller-detalj /plan/[planId],/rediger,/tildel-test; tester /[id],/foreslatte; `/admin/grupper/[id]`; innstillinger/«Drift» (rute = topbar-meny → finn href); `/admin/gjennomfore/okter/[id]`; diverse admin long-tail (/audit-log,/reach,/compliance,/risiko,/lag-snitt,/team,/integrasjoner,/email-templates). Tas i påfølgende iterasjoner — alle ser ut til å være bygd fra tidligere faser.

---

## PLAYERHQ MEG-UNDERSIDER (verifisert ferdig — låst-decision-unntak dokumentert)

### M-1 · Alle 5 Meg-undersider bygd, lyse, korrekte (bygd tidligere fase)
- **Verifisert mobil 430px som spiller:** `/portal/meg/abonnement`, `/helse`, `/utstyrsbag`, `/dokumenter`, `/innstillinger`. Alle lyse, ekte data, markert ✅.
- **Abonnement — BEVISST AVVIK FRA FASIT (låst beslutning overstyrer, diff-agenter skal IKKE flagge):** fasit «PlayerHQ Meg-abonnement» viser «PRO 299 kr» + «Stripe ···· 4242» + «PRO årlig 2690». Appen viser i stedet det LÅSTE: «300 kr/mnd» (ikke 299), «ingen nivåer», ærlig Stripe («kortdata lagres aldri hos oss» — intet fabrikert kortnr.), og INGEN «PRO årlig» (finnes ikke i den låste gratis/300-modellen). Samme prinsipp som Marketing/Priser. Appen er MER korrekt enn fasiten.
- **Helse — FYS-formel-parkering korrekt realisert:** KPIene (readiness/hvilepuls/søvn) viser «—» + «Formel ikke låst» + «plassholdere fram til readiness-formelen fra fysteamet er låst». Riktig honest håndtering av parkert FYS-formel — ikke et avvik.

---

## CONTENT-REVIEW (skjerm bygd & verifisert, men innhold må godkjennes før prod)

### C-1 · Marketing testimonial-/case-tall må bekreftes ekte før lansering
- **Skjermer:** `/(marketing)/suksess` (Lars H. HCP 28→16, Emma S. 18→6, Geir T. 22→14) + `/(marketing)/cases` (Marius B. −6,3 SG, Emma L. −4,5). Bygd & verifisert (lyst editorial, responsiv) — strukturen er fasit-riktig.
- **Flagg:** Dette er konkrete navn + tallforbedringer presentert som ekte spillerresultater. Eksisterende marketing-innhold (ikke generert av loopen denne økten), men før prod-deploy bør Anders bekrefte at testimonials er ekte/godkjente (samtykke) eller merke dem tydelig som illustrative eksempler. Ikke en build-blokker; et content/juridisk go-live-punkt.
- **Beslektet:** `/(marketing)/personvern` + `/vilkar` + `/cookies` er selv-flagget «Utkast — godkjennes med advokat før Q3 2026» i egen UI. Juridisk gjennomgang er allerede et kjent go-live-punkt.

---
*Loopen fortsetter med skjermer som IKKE er blokkert. Blokkerte/parkerte føres her til du tar stilling.*
