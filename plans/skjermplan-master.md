# AK Golf HQ — Masterplan for den komplette appen

**Versjon 1.0 · 2026-07-04 · Styringsdokument.** Lagres som `plans/skjermplan-master.md` i repoet. Alle kommende økter refererer denne. Detaljplaner per bølge lages i Claude Code plan-mode mot faktisk repo-tilstand — dette dokumentet eier scope, rekkefølge og beslutninger.

## Produktet i én setning

Golferen betaler 300 kr/mnd — fra nybegynner til tour — for **dommen**: hva koster meg slag, hva skal jeg trene, og virker det. Coachen betaler for å følge opp spillere optimalt: 5 sekunder til tilstand, 30 sekunder til årsak, ett trykk til plan.

Loopen som ER produktet: **Analyse → Plan (workbench) → Live-økt → Gjennomføring → ny Analyse.** Hver bølge under bygger et ledd i loopen. Ingenting utenfor loopen prioriteres før den er lukket.

## Låste arkitekturprinsipper (gjelder alle bølger)

1. Skjermer KOMPONERES fra design-handover-eksporten (golfdata-familien + 87 basiskomponenter). Komponentgap meldes til Claude Design — aldri ad-hoc UI.
2. Workbench er ÉN implementasjon, rolle `spiller|coach`. Ingen duplisert planlegging, ingen dupliserte visninger mellom PlayerHQ og AgencyOS.
3. Anbefalinger, aldri sperrer. Avvik = klarspråk-chip; sterkt avvik = coach-varsel. Ingenting blokkerer.
4. Klarspråk-laget: fagkoder (M2, PR3, L_BALL) kun i coach-flater og økt-ID. Spiller/foreldre ser Situasjon / Læringstrinn / Press-verdinavn.
5. Analytikerkjeden for analyseflater: Resultat → Mønster → Årsak → Prioritet → Trening. Anbefaling alltid kvantifisert i slag, alltid med «Planlegg dette».
6. Progressiv dybde `nybegynner|øvet|elite` avledet av spillernivå (A–K / voksen-modell).
7. Domenefasit: meter med V/H, bias ≠ spredning, M/PR-badge, SG med fortegn + «slag» + navngitt baseline, datagrunnlag alltid synlig.
8. Mobile-first PlayerHQ/foreldre (390 px), desktop-first AgencyOS. Begge moduser, alle tilstander, verifisert mot tilstandsgalleriet.
9. Én skjerm per commit. Fem-punktsloopen per skjerm. Én bølge fullføres før neste starter.

## Flate-kartet (den komplette appen)

**PlayerHQ (spiller):** Min golf (SG-analyse + tester + progresjon som tabs — konsolidert) · Workbench spiller-rolle · Live-økt · Min trening (volumanalyse) · Booking · Profil/varsler/innstillinger
**AgencyOS (coach):** Spiller-cockpit · Full spilleranalyse (samme komponenter, coach-dybde) · Workbench coach-rolle · Kalender (lesevisning m/ drilldetaljer) · Treningsanalyse · Drillbank · Spilleradmin (roster, deling, samtykke-status) · Live-status
**Foreldreportal:** Samtykke (GDPR art. 8, finnes fra security-arbeidet) · Barnets progresjon (lesevisning, klarspråk)
**Marketing/booking/Stripe:** v1.0 live — forbedringer, ikke nybygg
**Auth/onboarding:** nivåplasserings-quiz (ett spørsmål per skjerm) → setter dybde-prop. Lanseringskritisk for selvbetjent 300 kr-salg.

## Bølgeplanen

> ⚠ **STATUS VERIFISERT MOT KODE 2026-07-24** (oppdatering fra ferdigstillingsplan — erstatter
> 6. juli-snapshot). Fasit:
> **Bølge 0 ✅ · Bølge 1 ✅ (Min golf + cockpit/spillere; `/admin/stall` = redirect) · Bølge 2 ✅
> (SessionDrill/TrainingDrillV2) · Bølge 2.5 ✅ · Bølge 3 ✅ (WorkbenchV2 + `@/components/v2`,
> ikke golfdata/`workbench-hybrid`) · Bølge 4 🟡 (UI: checklist/timer/reps levert; offline-synk
> for drills mangler) · Bølge 5 ⬜ IKKE startet · Bølge 6 🟡 (HCP-plassering + forelder/varsler;
> nivå-quiz mangler) · Bølge 7 urørt (riktig — etter lukket loop).**
> Detaljer per bølge i egne bokser under hver seksjon.

### Bølge 0 — Mottak og fundament · KLAR · ~1 time
Eksport inn i `public/design-handover/` (2 MB-sjekk), én designkilde verifisert med grep-bevis, ak-designekspert v5 i `.claude/skills/`, denne planen inn som `plans/skjermplan-master.md`.

### Bølge 1 — Golfdata-flatene · KLAR (ingen blokkere) · ~1 økt
PlayerHQ **Min golf**: konsolidert flate med tabs — SG-status (SgTotalKort, SgKategoriBar, SgTrend), Neste fokus (NesteFokusKort + SlagLekkasjeKart + DiagnoseKort), Runder (Scorekort, TigerFive), Baggen (GappingChart, LaunchWindow, StrikeSmash), Putting (PuttModellKort), Progresjon (KategoriKravKort). AgencyOS **cockpit**: SpillerTilstandKort-grid → klikk åpner full analyse i coach-dybde. Data: sg-hub, runde-/test-/TrackMan-modeller — kun visning, ingen ny beregning. Empty states = onboarding.
**Ferdig når:** SG-tall stemmer mot sg-hub for kjent spiller; coach leser tilstand på 5 sek med ekte data.

> **✅ FERDIG (verifisert 2026-07-24):** PlayerHQ Analyse/Gjennomføre/Hjem/Planlegge/Meg på v2.
> AgencyOS: `/admin/spillere` + spiller-dashboard + analyse er kanon; `/admin/stall` er redirect
> til spillere (beslutning C11/IA). Ingen gjenstående Bølge 1-bygg.

### Bølge 2 — Datamodell drill-nivå · KLAR (input besvart 2026-07-04) · ~1 økt
Økt blir container: `Okt` → `OktDrill[]`, hver drill med ALLE seks akser (PYR/Område/CS/Læringstrinn/Situasjon/Press) + én av fire repstyper (svinger uten ball / baller slått / tid / sett×reps) + volum. Bulk-apply-affordance i UI (ikke i modellen). Drillbank på plattformen = sannhetskilde (ingen Notion-synk). FysProgram/ProgramSplitt/ProgramOvelse (sett/reps/kg/tid/sone). **Additiv migrering** (nye tabeller, CREATE TABLE IF NOT EXISTS via db execute per gotchas — rører aldri eksisterende data). Gamle økter migreres IKKE (fryses lesbar; drill-modell fra dato). Offline-krav (svar 4) håndteres i bølge 4, men modellen må tåle klient-generert id + synk-status.
**Ferdig når:** schema validert + generert, additiv migrering kjørt mot dev-DB uten datatap, tsc/tester/build grønt.

> **✅ FERDIG (commit `ed41a1f8`, 2026-07-04) — annen løsning enn planlagt, bevisst Anders-beslutning:**
> ingen egne `Okt`/`OktDrill`-tabeller. I stedet utvidet de to eksisterende drill-modellene
> (`SessionDrill`, `TrainingDrillV2`) med alle seks akser + `RepType`-enum (de fire repstypene) — for
> å unngå å duplisere de to eksisterende økt-sporene (parkert beslutning B1). FYS-siden dekkes av
> allerede eksisterende `FysOkt`/`FysOvelseRad`-hierarki (bygget 25. mai, uavhengig av dette). Additiv
> migrering kjørt via `scripts/migrate-repdrill-2026-07-04.ts`, verifisert 7/7 + 5/5 kolonner i dev-DB.
> **Ikke bygg parallelle Okt/OktDrill-tabeller — de finnes allerede under andre navn.**

### Bølge 2.5 — Periode & Dag · FERDIG 2026-07-06 · ~1 økt
Egen, smalere pakke (ikke å forveksle med Bølge 3s drill-composer over) som lukket det konkrete
periode/dag-hullet i planleggingshierarkiet, bestilt direkte av Anders: (1) periode-CRUD
konsolidert fra tre konkurrerende, delvis ødelagte versjoner til én skjerm
(`/portal/tren/aarsplan/periode/[id]/rediger` + ny `/ny`-rute), med IDOR-fiks (coach kunne ikke
redigere spillers periode) og blokkerende-validering-fiks (en bug nektet å lagre perioden ved
avvik — brøt «anbefaling, aldri sperre»); (2) Gantt→periode-navigasjon koblet (periode-id
bevares gjennom `mapSeasonPhases`, var tidligere no-op); (3) periode↔mal-anbefaling
(`src/lib/workbench/period-lookup.ts`, aktiv periode fremhever matchende maler i Maler-fanen,
skjuler aldri andre); (4) «Dag» løftet til 8. Workbench-fane med ekte data (var hardkodet
mock-onsdag, «Onsdag 11. juni» uansett faktisk dato); (5) CANON v3.5-periode-anbefaling
(`src/lib/workbench/canon-period-adjustment.ts`, speiler Masterbrain pr_6/pr_7/pr_8 — GRUNN
FYS/TEK opp, SPESIAL SLAG opp, TURNERING SPILL/TURN opp) som avviks-chip i periode-form og
uke-innsikt. Fant og fikset i samme slag: dedup-bug i `merge-week-sessions.ts` (V1-økter med et
V2-speil ble talt dobbelt i uke-visningen — timer/adherence for høyt; dag-fanen ville arvet
samme bug uten denne fiksen).
**Ferdig når:** ✓ demonstrert — 326/326 tester, tsc/build grønt. Live nettleser-verifikasjon med
innlogget testbruker gjenstår (ingen dev-innloggingsdata tilgjengelig denne økten).

### Bølge 3 — Workbench v2 · avhenger av bølge 2 · ~1–2 økter
Composer på drill-nivå (velg fra drillbank → reps per drill → økt). Øktmaler og ukemaler med fase-tag (GRUNN/SPES/TURN), deling coach→spiller. «Dupliser forrige uke». FYS-programkobling når PYR=FYS. Pyramide-budsjett regnes fra drill-minutter. Anbefalings-chips (aldri sperrer) + coach-varsel-event.
**Ferdig når:** spiller på mobil: velg ukemal → juster én økt → lagre, under 60 sek.

> **✅ FERDIG (verifisert 2026-07-24):** Visuell + funksjonell Workbench er `WorkbenchV2` under
> `src/components/portal/v2/` med `@/components/v2` + wb-composer. Delte roller spiller|coach.
> «Dupliser forrige uke», drill-composer, maler, publiser-diff, årsplan-canvas, coldstart levert
> (se VEIKART WB1–WB5 + 8c). `workbench-hybrid/` er stub/levning — ikke bygg videre der.

### Bølge 4 — Live-økt v2 · avhenger av bølge 2 · ~1 økt
Drill-sjekkliste med aktiv drill ekspandert, auto-timer (total + per drill), rep-logging +5/+10/+20 med 44 px-mål, sett-avhuking, faktisk-vs-planlagt lagres på økten. TrackMan-kobling per drill (strategi avklares i plan). Coach ser status i AgencyOS (planlagt/pågår/ferdig).
**Blokkert av intervjusvar 4 (offline).** Ferdig når: hel økt gjennomføres på 390 px uten å forlate flaten.

> **🟡 UI levert, offline mangler (2026-07-24):** `LiveActive` har drill-sjekkliste, auto-timer
> (total + per drill), `RepCounter` (+1/+5/+10/+25), planlagt-vs-faktisk i summary. Offline-kø
> finnes for score-tapper (`src/lib/offline-queue/`) men **ikke for drill-reps**; reps lever i
> `sessionStorage` til synk bygges. Snapshot-API finnes men kalles ikke fra LiveActive. TrackMan
> per drill og AgencyOS live-status: delvis / seed.

### Bølge 5 — Leserne: kalender + treningsanalyse · avhenger av 2–4 · ~1–2 økter
AgencyOS-kalender: ukevisning med pyramidefarger og varighet, klikk/hover gir full drilliste med formler og reps — ren lesevisning, redigering skjer i workbench. Treningsanalyse (ny modul, begge roller): filter på alle seks akser + repstype + drill + periode; nøkkeltall (baller slått, svinger uten ball, CS-fordeling, M/PR-eksponering); planlagt vs. gjennomført. Spiller-dybde i klarspråk i Min trening; coach-dybde i AgencyOS.
**Ferdig når:** coach kan svare «hva har spilleren faktisk trent mot plan» med tre klikk.

> **⬜→🟡 STARTET 2026-07-24 (ferdigstillingsplan):** treningsanalyse-loader
> (`hentTreningsanalyse`) + planlagt-vs-gjennomført i Analysere Trening-fane;
> AgencyOS-kalender viser TrainingSessionV2-blokker med drill-lesevisning (BunnArk).
> Full 6-akse-filter + krysstabell kan utvides videre.

### Bølge 6 — Komplettering til full app · delvis klar · ~2 økter
Onboarding-quiz med nivåplassering (lanseringskritisk for selvbetjening). Foreldreportal: progresjons-lesevisning i klarspråk. Spilleradmin i AgencyOS. Booking-forbedringer (betalingstilstander fra komponentfamilien). Varslingssenter (avviks- og live-events fra bølge 3–4). Resterende ⬜ i DEKNINGSKART, prioritert etter brukersynlighet.

> **🟡 Delvis (2026-07-24):** HCP→dybde for spillere uten runder ✅. Foreldreportal (11 ruter) ✅.
> Spiller-dashboard / admin ✅. Booking-trygging + varsler-UI ✅. **Mangler:** nivåplasserings-quiz
> (ett spørsmål per skjerm) i `/auth/onboarding` — dagens wizard er profil/samtykke, ikke quiz.
> Marketing/stats = egen bølge (utenfor kjerneapp).

### Bølge 7 — AI Coach-laget · strategisk, etter lukket loop
Når loopen produserer data (plan + gjennomføring + resultat) er grunnlaget lagt for AI Coach-satsingen ($10M ARR-sporet): samtale over egne data, ukesoppsummeringer, proaktive dommer. Bygges IKKE før bølge 1–5 er i produksjon — AI uten gjennomføringsdata er en chatbot, med data er den en coach.

## INPUT KREVES — BESVART 2026-07-04 (Anders). Låst fasit for bølge 2–5:

1. **Formel-nivå:** ALLE seks aksene (PYR/Område/CS/Læringstrinn/Situasjon/Press) settes **per drill**. UI får en «sett samme for hele økten»-knapp (bulk-apply) — men lagringen er alltid per drill. (Endrer den opprinnelige antakelsen om at M+PR var felles per økt.)
2. **Repstyper:** de fire er komplette — `svinger uten ball` · `baller slått` · `tid` · `sett×reps`. Ingen flere.
3. **Drillbank:** plattformen er **fasit** (sannhetskilde for drill-data). Notion-godkjenning er en **manuell menneskelig sjekk** — **ingen Notion-integrasjon/synk i koden**. Notion Øvelsesbank fases ut som datakilde.
4. **Live-økt:** fungerer **offline** med synk etterpå.
5. **Historikk:** drill-modellen gjelder **fra dato** framover. Gamle økter migreres IKKE — de fryses som lesbar historikk.

## Kritisk sti og total

Bølge 0+1 kjøres NÅ (ingen blokkere). Intervjusvar → bølge 2 → 3 og 4 (kan gå parallelt i hver sin worktree etter at 2 er grønn) → 5 → 6. Estimat totalt: **8–10 Claude Code-økter** til komplett app, kalibrert til Claude Code-fart med plan-mode per bølge. Bølge 7 er egen beslutning etterpå.

## Verifikasjonsregime

Per skjerm: fem-punktsloopen (type-check/tester · begge moduser mot galleri · 390 px · tastatur · domenesjekk). Per bølge: success-kriteriet over må demonstreres med ekte data før neste bølge starter. Prove green before proceeding — en påbegynt bølge fullføres alltid.
