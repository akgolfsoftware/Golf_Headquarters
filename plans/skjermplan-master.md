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

### Bølge 0 — Mottak og fundament · KLAR · ~1 time
Eksport inn i `public/design-handover/` (2 MB-sjekk), én designkilde verifisert med grep-bevis, ak-designekspert v5 i `.claude/skills/`, denne planen inn som `plans/skjermplan-master.md`.

### Bølge 1 — Golfdata-flatene · KLAR (ingen blokkere) · ~1 økt
PlayerHQ **Min golf**: konsolidert flate med tabs — SG-status (SgTotalKort, SgKategoriBar, SgTrend), Neste fokus (NesteFokusKort + SlagLekkasjeKart + DiagnoseKort), Runder (Scorekort, TigerFive), Baggen (GappingChart, LaunchWindow, StrikeSmash), Putting (PuttModellKort), Progresjon (KategoriKravKort). AgencyOS **cockpit**: SpillerTilstandKort-grid → klikk åpner full analyse i coach-dybde. Data: sg-hub, runde-/test-/TrackMan-modeller — kun visning, ingen ny beregning. Empty states = onboarding.
**Ferdig når:** SG-tall stemmer mot sg-hub for kjent spiller; coach leser tilstand på 5 sek med ekte data.

### Bølge 2 — Datamodell drill-nivå · INPUT KREVES · ~1 økt
Økt blir container: `Okt` → `OktDrill[]`, hver drill med egen formel (PYR/Område/CS/Læringstrinn), repstype og volum. Drillbank som sannhetskilde. FysProgram/ProgramSplitt/ProgramOvelse (sett/reps/kg/tid/sone). Migrasjonsstrategi for eksisterende økter.
**Blokkert av intervjusvar 1–3, 5** (se INPUT KREVES). Ingen bølge 3–5 før denne er besluttet, migrert og verifisert grønn.

### Bølge 3 — Workbench v2 · avhenger av bølge 2 · ~1–2 økter
Composer på drill-nivå (velg fra drillbank → reps per drill → økt). Øktmaler og ukemaler med fase-tag (GRUNN/SPES/TURN), deling coach→spiller. «Dupliser forrige uke». FYS-programkobling når PYR=FYS. Pyramide-budsjett regnes fra drill-minutter. Anbefalings-chips (aldri sperrer) + coach-varsel-event.
**Ferdig når:** spiller på mobil: velg ukemal → juster én økt → lagre, under 60 sek.

### Bølge 4 — Live-økt v2 · avhenger av bølge 2 · ~1 økt
Drill-sjekkliste med aktiv drill ekspandert, auto-timer (total + per drill), rep-logging +5/+10/+20 med 44 px-mål, sett-avhuking, faktisk-vs-planlagt lagres på økten. TrackMan-kobling per drill (strategi avklares i plan). Coach ser status i AgencyOS (planlagt/pågår/ferdig).
**Blokkert av intervjusvar 4 (offline).** Ferdig når: hel økt gjennomføres på 390 px uten å forlate flaten.

### Bølge 5 — Leserne: kalender + treningsanalyse · avhenger av 2–4 · ~1–2 økter
AgencyOS-kalender: ukevisning med pyramidefarger og varighet, klikk/hover gir full drilliste med formler og reps — ren lesevisning, redigering skjer i workbench. Treningsanalyse (ny modul, begge roller): filter på alle seks akser + repstype + drill + periode; nøkkeltall (baller slått, svinger uten ball, CS-fordeling, M/PR-eksponering); planlagt vs. gjennomført. Spiller-dybde i klarspråk i Min trening; coach-dybde i AgencyOS.
**Ferdig når:** coach kan svare «hva har spilleren faktisk trent mot plan» med tre klikk.

### Bølge 6 — Komplettering til full app · delvis klar · ~2 økter
Onboarding-quiz med nivåplassering (lanseringskritisk for selvbetjening). Foreldreportal: progresjons-lesevisning i klarspråk. Spilleradmin i AgencyOS. Booking-forbedringer (betalingstilstander fra komponentfamilien). Varslingssenter (avviks- og live-events fra bølge 3–4). Resterende ⬜ i DEKNINGSKART, prioritert etter brukersynlighet.

### Bølge 7 — AI Coach-laget · strategisk, etter lukket loop
Når loopen produserer data (plan + gjennomføring + resultat) er grunnlaget lagt for AI Coach-satsingen ($10M ARR-sporet): samtale over egne data, ukesoppsummeringer, proaktive dommer. Bygges IKKE før bølge 1–5 er i produksjon — AI uten gjennomføringsdata er en chatbot, med data er den en coach.

## INPUT KREVES (blokkerer bølge 2–5 — svar med Wispr)

1. Formel-nivå: M og PR felles per økt, PYR/Område/CS/Læringstrinn per drill — ja/nei?
2. Repstyper: svinger uten ball, baller slått, tid, sett×reps — komplett liste?
3. Drillbank: plattformen som sannhetskilde, Notion Øvelsesbank fases ut — ja/nei?
4. Live-økt offline med synk etterpå — ja/nei? (Anbefaling: ja)
5. Historikk: migrere gamle økter til én-drill-per-økt, eller drill-modell fra dato? (Anbefaling: fra dato — historikk fryses som lesbar)

## Kritisk sti og total

Bølge 0+1 kjøres NÅ (ingen blokkere). Intervjusvar → bølge 2 → 3 og 4 (kan gå parallelt i hver sin worktree etter at 2 er grønn) → 5 → 6. Estimat totalt: **8–10 Claude Code-økter** til komplett app, kalibrert til Claude Code-fart med plan-mode per bølge. Bølge 7 er egen beslutning etterpå.

## Verifikasjonsregime

Per skjerm: fem-punktsloopen (type-check/tester · begge moduser mot galleri · 390 px · tastatur · domenesjekk). Per bølge: success-kriteriet over må demonstreres med ekte data før neste bølge starter. Prove green before proceeding — en påbegynt bølge fullføres alltid.
