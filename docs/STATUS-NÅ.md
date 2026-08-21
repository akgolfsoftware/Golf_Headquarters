# STATUS NÅ — AK Golf HQ

> **Hva dette er:** ett snapshot av hvor plattformen står akkurat nå. Oppdater datoen + relevante linjer når noe vesentlig endrer seg.

**Sist oppdatert:** 2026-08-21, andre runde samme dag (PR #569 merget på Anders' instruks, og
marketing-redesignet reconciled mot PORTPLAN §B4 — se begge under). Første runde var resync mot
`main` @ `0b01f09`; `main` er nå på `c281c5d` etter #569. Forrige snapshot 17.08 var 4 dager
gammelt og beskrev flere PR-er som «åpne»/«venter» som i realiteten var merget samme dag.
Samlet gjenstående-plan: **`docs/MASTERPLAN-GJENSTAAENDE.md`**.

## Hovedbildet 21.08 (målt, ikke antatt)

- **Bygg:** `main` er grønn. Sist målte testtall: **1542/1542** (PR #558, 20.08 — sannsynligvis
  høyere nå etter påfølgende PR-er; ikke remålt i denne oppdateringen).
- **~25 commits / 12 PR-er merget 17.–20.08 siden forrige snapshot.** Tre spor:
  1. **Treningsregler LÅST OPP (18.08, #561+#562, ny CLAUDE.md-invariant 1):** all
     regel-håndheving i planlegging (9 invarianter, periode-constraints, plan-validering,
     junior-guard, «CANON anbefaler»-hint) er **slettet fra koden**, ikke bare fra dokumenter.
     Spilleren står helt fritt. Vokabularet (pyramide, perioder, formel) består som frie
     merkelapper. `docs/vokabular-planlegging-2026-08-18.md` er fasit for ordforrådet.
  2. **Ny treningsplanlegging fra spec til kode (19.–20.08), aktivt spor akkurat nå:**
     spec **KOMPLETT** (fase 0 lukket 20.08 — relevans-matrise, FYS-øvelsesbank 120–150
     øvelser godkjent) → **Fase 1 grunnmur BYGGET og migrert mot prod** (#563: V2-øktfamilien
     gjort kanonisk, 19 typede treningsområder, ny belastning-akse, gruppesynk/løsrivelse,
     kirurgisk migrering kjørt — 9 enums/35 kolonner/1 tabell, 37 nye tester) → **Fase 2 design
     pågår**: Paper-speilet resynket mot zip 20.08 (#564), gap-måling viser **6 av 8**
     Workbench-skjermer allerede har fasit — kun periodemal-flyten (skjerm 2) og
     Standard/Tour+onboarding (skjerm 8) må tegnes fra bunnen
     (`docs/gap-designfasit-workbench-2026-08-20.md`). **W8: de 8 komponentene fasiten manglet
     i Paper-bundelen er bygget** (`TallStepper`, `MaalMatrise`, `HurtigTapper`, `SettLogger`,
     `SoneSegmentLogger`, `StjerneRad`, `DagVelger`, `MaaleFelt`) — **merget 21.08 (#569, c281c5d),
     etter Anders' eksplisitte «merge»-instruks** (CI-en klarte ikke å verifisere PR-en pga.
     infrastrukturfeilen, se STATUS-linje under — merget likevel på direkte instruks). Fase 3
     (porting til skjermkode, Opus 5) er **ikke startet** — blokkert til Fase 2s to nye skjermer
     er tegnet. Full plan: `docs/plan-treningsplanlegging-til-kode-2026-08-20.md`.
  3. **Jarvis + AgenticOS «komplett» (#558, 20.08):** seks funksjonelle hull lukket — én
     `godkjennSak`-vei (var to, kunne miste Gmail-utkast), ekte kalendervakt-detektor
     (konflikt/reisetid fra Google-kalender), redirect-kjeden samlet på `/admin/agenticos`,
     agent-registry løftet 13→46 (alle nå loggført), Jarvis-masterplanen hentet inn i repoet.
     **H1 (hvor `/meg` lenkes fra), H4 (Gmail-send-scope) og H8 gjenstår som Anders-beslutninger.**
     Samme PR fullførte også **clay-sweepen** (MASTERPLAN 2.3): 32 CTA-er i 27 filer rettet fra
     oransje til ink — kun «Én ting nå»-kortet er clay nå, A3-normen er reell i koden.
- **Sign-off-fabrikken ulåst (#557, 20.08):** 48 skjermer fotografert og samlet i én
  signeringsside — **venter kun på at Anders krysser av**, ingen kodejobb gjenstår her. Samme
  PR fant og fikset tre reelle regresjoner ved måling mot forrige MASTERPLAN (talent-hub manglet
  feature-gate, periodebytte kunne overskrive spillerens egen pyramidefordeling,
  `protocol.ts` var siste utestede ledd i test-parseren) — **disse tre var IKKE ferdige 17.08
  slik forrige MASTERPLAN-versjon påsto**, korrigert i denne oppdateringen.
- **NY, foreløpig utenfor plandokumentene: marketing-redesign (18.–20.08, #565–#568),
  hentet fra `ak-golf-website`:** ett nytt lyst skall + ny forside + `/mulligan` (#565),
  booking i nytt skall med gammel chrome slettet (#566), oppdiktede spillerhistorier fjernet
  fra `/suksess` og `/cases` (#567), årsprisfeil rettet + `/playerhq` utvidet med årspris (#568).
  **Dette sporet er ikke koblet til PORTPLAN §B4/W5** («38 marketing/auth/forelder-ruter stryker
  fordi design mangler») — uklart om redesignet dekker samme flater. Se «Neste oppgaver» under.
- **Workbench kanon-rydding (#561)** ryddet gamle navn/raster/L-fase/CS/M/PR-referanser etter at
  reglene ble fjernet 18.08 — konsistens, ikke funksjon.
- **Mandagshullet i ukesdigesten + falsk talentnivå fikset (#559).**
- **DB (prod, målt 13.08 — IKKE remålt):** 42 brukere · 38 spillere · 16 med innlogging ·
  0 push-abonnement · 22 bookinger. Aktiveringsgapet er 13 spillere (verken auth eller invitasjon).

## ⚠ Åpne risikopunkter

1. **CI-infrastrukturfeil observert 21.08 (GitHub Actions):** `verify`-jobben på minst to
   uavhengige PR-er (#569, #570) døde ~2 sekunder etter start uten at noen runner ble tildelt
   og uten loggoutput — reproduserte identisk etter re-kjøring på begge. Ikke forårsaket av
   noen av diffene (én var docs-only, én var ren tilføyelse under `designsystem/paper/`).
   #569 ble merget likevel på Anders' eksplisitte instruks siden branch-beskyttelsen ikke
   blokkerte det — men PR-en fikk aldri en reell `tsc`/`eslint`/build-verifisering fra CI.
   Ukjent om dette er en forbigående GitHub-hendelse eller vedvarende; ingen tilgang herfra til
   å diagnostisere runner-infrastrukturen direkte.
   - **#552 — WANG fast treningstid** (mønster man/ons/fre 08–10 via `RecurringPattern`), draft.
     Koden er grønn og testet, men **seed-scriptet er ikke kjørt mot prod** (krever ekte
     DB-tilgang denne typen økt ikke har) — spillerne får ingen økter i Workbench før noen
     kjører `scripts/seed-wang-monster-treningstid-2026-08-17.ts --apply`.
2. **SCREENTEST_PASSWORD-rotasjonen:** `screentest-parent@akgolf.test` **står nå i
   rotasjonsskriptet** (verifisert i repo 21.08) — men uvisst om Anders har kjørt det på nytt
   siden forrige delvise kjøring (17.08, som manglet nettopp denne brukeren). Foreldreportalen
   (`B2-forelder`) kan fortsatt være logget ute til det er gjort.
3. **Talent-gate prod-verifisering** (forrige MASTERPLAN 0.4): ingen dokumentert kjøring av
   kontrakttestene mot prod funnet i denne gjennomgangen — fortsatt reelt åpent, ikke bare glemt
   i dokumentasjonen.
4. ~~Marketing-redesignet er ikke reconciled mot PORTPLAN §B4~~ **UNDERSØKT 21.08.2026.**
   Verifisert i kode: `ak-golf-website` bruker Paper sine faktiske tokens (ikke et
   konkurrerende designsystem — ikke et Invariant 2-brudd), men avviker bevisst fra selve
   mal-fasit-HTML-en. Kun 3 av S18s 14 ruter faktisk berørt (`/`, ny rute `/mulligan`,
   `/playerhq`); S19/S20/S21 (24 ruter) upåvirket. Gjenstående: Anders avgjør om
   `ak-golf-website`s skall formelt overstyrer mal-fasiten for de tre, eller rettes tilbake.
   Se `docs/port/PORTPLAN.md` §B4-tillegg 21.08.2026.

## Paper-porten (styrende: PORTPLAN.md + PAPER-ZIP-CHECKLIST.md)

- **Signeringskøen er klar:** 48 skjermer i sign-off-galleriet (#557) venter kun på Anders'
  avkryssing — se STATUS-linje over. Tallene fra 17.08 (40/88 signert, 0/72 varianter kvittert)
  er **ikke remålt** i denne oppdateringen; sannsynligvis uendret siden signering er en manuell
  handling og ingen ny PR har rørt tellingen.
- **PP-B systemfikser: B1 rail ✅ · B2 clay ✅ (FERDIG 20.08, se over) · B3 status uendret
  (`Composer` ekstrahert men fortsatt ikke montert i `V2Shell`) · B4 uverifisert · B5 ✅.**
- **PORTPLAN §A1: 10 beslutninger venter fortsatt på Anders** — uendret siden 17.08, se
  `docs/port/PORTPLAN.md` §A1.
- **Treningsplanleggingssporet (se Hovedbildet punkt 2) kjører delvis parallelt med, delvis
  gjennom PORTPLAN-regimet** («én sesjon per mal-fasit») — Fase 3 skal følge PORTPLAN §Kontrakten
  fullt ut når den starter.

## Åpne PR-er (21.08, oppdatert etter #569-merge)

| PR | Hva | Venter på |
|---|---|---|
| #552 | WANG fast treningstid (RecurringPattern), draft | Anders: kjøre seed-script mot prod |
| #570 | Denne dokument-resynken (STATUS-NÅ/MASTERPLAN/PORTPLAN), draft | CI-infrastrukturen (se risikopunkt 1) — innhold er ferdig |

#569 (W8-komponenter) er merget 21.08. Alle PR-er som sto i kø 17.08 (#549, #547, #542, #534,
#514, #490, #406) er nå merget eller lukket som overflødig.

## Blokkert — P0 før ekte/betalende brukere (uendret spor)

**Hos Anders (panel/DNS):** Resend DKIM for `send.akgolf.no` · `akgolf.no` → Vercel ·
live Stripe-nøkler + webhook-verifisering (13 event-typer, sjekkliste:
`docs/platform/stripe-cutover-sjekkliste.md`, testmodus komplett 16.08 #538) ·
Google Calendar re-kobling · aktiverings-e-post (ekte spiller-adresser må inn — dry-run 13.08
viste 14 «ok» mot syntetiske adresser) · kjøre SCREENTEST_PASSWORD-rotasjonen på nytt (se over).

**Kode/data:** aktiveringsflyt for de 13 spillerne uten auth/invitasjon · push-opt-in har motor
og banner, men 0 abonnementer · betaling starter **1. september 2026** (`BETALING_STARTER` i
`src/lib/feature-flags.ts` — `gratisForAlle()` slår av automatisk; verifiser cutover).

**Kjent, bevisst åpent:** CSP-blokkert Turbopack-chunk i prod (konsollstøy, rendrer riktig —
ikke fikset uten bevist effekt, jf. 03.08-målingen).

## Neste oppgaver (prioritert, oppdatert etter #569-merge + marketing-reconciliation 21.08)

1. **Anders: kryss av i sign-off-galleriet** (#557-leveransen) — 48 skjermer venter, null
   kodejobb, ren menneskelig gate. Låser opp W4-variantkvittering (38 ruter, 0 ekstern blokkering).
2. **Design: tegn de 2 gjenstående Workbench-skjermene** (periodemal-flyten, Standard/Tour +
   onboarding) i Claude Design-prosjektet, zip → resynk speilet — siste gate før Fase 3-porten
   kan starte (`docs/plan-treningsplanlegging-til-kode-2026-08-20.md` §Fase 2). W8-komponentene
   som blokkerte dette er merget (#569) — ingen ekstern blokkering igjen på selve porten.
3. **Anders: én linje om marketing-skallet** — skal `ak-golf-website`s (Paper-token-baserte,
   men bevisst avvikende) skall for `/`, `/mulligan`, `/playerhq` formelt overstyre
   `marketing-side.html` som ny mal-fasit, eller rettes de tre pixel-tilbake? Se
   `docs/port/PORTPLAN.md` §B4-tillegg 21.08.2026 for full utgreiing — S19/S20/S21 (24 ruter)
   trenger uansett design, upåvirket av svaret.
4. **Anders: kjør SCREENTEST_PASSWORD-rotasjonen på nytt** med `screentest-parent@akgolf.test`
   inkludert (skriptet er klart) — låser opp foreldreportal-galleriet.
5. **Anders: kjør `scripts/seed-wang-monster-treningstid-2026-08-17.ts --apply`** mot prod
   (eller avklar at PR #552 skal vente) — WANG-spillerne har ingen faste økter i Workbench uten
   dette.
6. **Kjør talent-gate-kontrakttestene mot prod** — ingen dokumentert bekreftelse funnet, reelt
   åpent siden 17.08.
7. **PORTPLAN §A1 — de 10 portbeslutningene** står fortsatt ubesvart og blokkerer B2/B3-sesjonene.
8. **Lansering P0 hos Anders** (DKIM, DNS, Stripe live, Google Calendar, ekte spiller-e-poster) —
   uendret, se «Blokkert» over.

## Levende kilder (én av hver rolle — start her)

| Rolle | Dokument |
|---|---|
| **Snapshot (denne)** | `docs/STATUS-NÅ.md` |
| **Samlet gjenstående-plan** | `docs/MASTERPLAN-GJENSTAAENDE.md` |
| **Porteringsplan (rekkefølge/blokkeringer)** | `docs/port/PORTPLAN.md` |
| **Treningsplanlegging spec→kode** | `docs/plan-treningsplanlegging-til-kode-2026-08-20.md` |
| **Status per fasit-fil** | `docs/port/PAPER-ZIP-CHECKLIST.md` |
| **Designdekning** | `docs/port/fasit-liste-paper.md` |
| **Uavklart / parkert / løst** | `docs/AAPNE-SPORSMAAL.md` + PORTPLAN §A1 |
| **Låste forretningsregler** (fasit) | `docs/platform/BUSINESS-RULES.md` |
| **Full plattformkontekst** (5 min) | `docs/platform/AGENT-BRIEF.md` |
| **Lansering** | `docs/port/masterplan-lansering-2026-08-12.md` + `docs/platform/stripe-cutover-sjekkliste.md` |
| **AgenticOS + Jarvis** | `docs/plan-agenticos-jarvis-2026-08-17.md` |

Historiske bygg-spor, nattrapporter, gallerier og erstattede planer er slettet 05.08 og
17.08.2026 — de lever i git-historikken, ikke bygg mot dem.

## Ferdig / solid (verifisert, komprimert)

- **Prod kjører** på `akgolf-hq.vercel.app`; push til `main` deployer via Vercel git-integrasjon
  (aldri `vercel deploy --prod` manuelt).
- **PlayerHQ-kjernen:** Hjem/chat, Plan, Analyse (m/ DataGolf-fane + SG-bro), Meg (+ profil,
  utstyr), Workbench V2, live-økt, runde-føring (live + etterregistrering, hull/slag, SG
  server-side), testbatteri med live `TestSession`-scoring (21 CANON-protokoller for spiller).
- **AgencyOS:** cockpit/konsoll (fase2-rail 7 punkter), innboks (m/ Jarvis-sakskø), stall,
  kalender, godkjenninger, økonomi, AgenticOS-hub (nå eneste inngang, redirect-kjeden samlet
  20.08) — ekte Prisma-data.
- **Jarvis `/meg`:** 12 av 12 skjermer bygget (#547) og funksjonelt komplett (#558) —
  gjenstår kun IA-plassering (H1) og Gmail-send-scope (H4) som Anders-beslutninger.
- **Treningsplanlegging v2:** ny datamodell/domene i produksjon (fase 1, #563) — ingen synlig
  skjerm ennå, venter Fase 2 design + Fase 3 port.
- **Domenemotorer m/ tester:** SG (Broadie + Team Norway IUP PUTT, AP0-grunnmur #534 — én
  SG-sannhet, ellipse-speilbugg fikset), fys-score v1 (stall-relativ, plassholder-merket i UI),
  ak-kategori, test-scoring (15 ScoringKind), talent-sync, plan-builder, uke-helpers
  (Oslo-korrekt).
- **Datapipelines:** GolfBox (timesvis) + GJGT (daglig) + DataGolf (schedule daglig, live hvert
  10. min, skills ukentlig) + sync-vaktbikkje mandager. Se `docs/turnering-datakilder.md` for
  dekningskartet.
- **Foreldreportal** 11/11 ruter ekte data · **GDPR/moderering** bygget · **ekstern lesetilgang**
  (Team Norway/WANG, samtykke-håndhevet) bygget 16.08 · **`/team-wang` PII-lekkasjen lukket**
  (#490, 17.08 — fellesside navnefri, coach-siden sperret i to lag).

## Verifisert vs. antatt

- **Verifisert 21.08 (git-historikk/PR-metadata):** alle PR-numre, merge-status, commit-datoer
  og kodesitater i dette dokumentet er lest direkte fra `main`-loggen og GitHub PR-objektene —
  ikke fra tidligere dokumentasjon.
- **Ikke remålt i denne oppdateringen** (arvet fra 17.08-snapshotet, kan ha endret seg):
  eksakt testtall (>1542), DB-tall (prod), signerings-prosent i sign-off-galleriet,
  PORTPLAN §A1-beslutningsstatus.
- **Antatt / panel (kun Anders kan verifisere):** Stripe live-nøkler, Resend DKIM,
  Google Calendar-tokens, DNS `akgolf.no`, om SCREENTEST_PASSWORD-rotasjonen er kjørt på nytt.
