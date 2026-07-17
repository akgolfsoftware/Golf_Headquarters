# ÅPNE SPØRSMÅL — AK Golf HQ

> **Hva dette er:** ett register over alt som IKKE er bestemt, det som er bevisst parkert, og det som er avklart — så ingen agent re-oppdager eller re-flagger det samme dyrt. **Regel for agenter:** der kode og skill/wiki er uenige, er **koden fasit** inntil en post her flyttes til LØST. Ikke bygg mot beskrivelser i `*-arkitektur`/`*-agents`-skills uten å sjekke koden.
>
> Status: **ÅPEN** (trenger beslutning) · **PARKERT** (bevisst, ikke rør uoppfordret) · **LØST** (avklart — ikke flagg på nytt).
>
> **Sist oppdatert:** 2026-07-17 (kveld). Alle Del 4-beslutninger tatt av Anders: A4 (invariant-liste skrives ned), A5 (forretningstall bekreftet), D5 (slette-veier konsolideres + slug anonymiseres), D8 (banekart = ekte geometri, blokkert på datakilde). D2/D6 bygget + migrasjoner kjørt mot prod. Råmateriale: tidligere `PLATFORM.md` §14 (arkivert) + kodeverifisering 2026-06-14 / agent-pipeline 2026-07-10.

---

## A. Krever Anders' beslutning (ÅPEN)

Disse kan en agent IKKE løse selv — de er produkt-/metodikkvalg.

| # | Spørsmål | Kode i dag (fasit) | Hva som trengs |
|---|---|---|---|
| ~~A1~~ ✅ | **Metodikk-avvik kode ↔ wiki.** | LØST 2026-06-23 (D1.7) — per punkt under | — |
| ~~A1b~~ ✅ | CS-nivåer: skala | **Behold kode CS50–CS100** | CS20/CS40-metodikk bevart i wiki som kjent app-grense, ikke lagt i app. |
| ~~A1c~~ ✅ | CS-navn | **Club Speed** | «Confidence Score»-feil rettet i DATA-MODEL.md. |
| ~~A1e~~ ✅ | LIFE-koder: nøkler | **Wiki-nøkler: SELV/SOS/EMO/KAR/RES** | `taxonomy.ts` rettet fra kodens gamle 5 (RESILIENS/FOKUS/…). |
| ~~A2~~ ✅ | **CBAC-modell.** | LØST 2026-06-23 (D1.4) — **behold dagens 10 capabilities** (ikke bygg ut til 43). | Finanshull + anlegg + team/org nå gated på capability. |
| ~~A3~~ ✅ | **Agent-systemets dybde.** | LØST 2026-07-10 — `acceptAndApplyPlanAction` + `plan-action-executor` endrer plan ved godkjenning; `/admin/godkjenninger` med batch; coach-scoped `coachId`; varsling via `varsleVedPlanAction`. | — |
| A4 | **13 invarianter.** Nevnt som konsept, finnes ikke som navngitt liste i kode/wiki. | — | **BESLUTTET 2026-07-17 (Anders):** skrives ned som navngitt kanonisk liste i `BUSINESS-RULES.md`, eksplisitt merket som anbefalinger (aldri sperrer). **Å GJØRE:** utled de 13 fra valideringsregler + junior-vern, legg Anders' godkjenning på lista før den låses. |
| ~~A5~~ ✅ | **Forretningstall** (3 MNOK 2026 / 4 MNOK 2027 / AI Coach $10M ARR). | Kun i global CLAUDE.md — ikke i kode/regnskap | **BEKREFTET 2026-07-17 (Anders):** alle tre tallene stemmer og beholdes som referanse. |
| ~~D2~~ ✅ | **`/portal/ny-okt` ekte lagring.** Premisset var STALE: kodeverifisering 2026-07-17 viste at `createAdHocSession` (`ny-okt/actions.ts`) alt skriver en reell `TrainingPlanSession` til Prisma — det var IKKE bare `sessionStorage`. LØST 2026-07-17: bekreftet ekte persistering + lukket de to reelle smågapene i `wizard.tsx` — `pyramidArea` er nå brukervalgbar (var hardkodet «SLAG») og tid/sted-steget sender faktisk `scheduledAt` (datetime-local i Oslo-veggklokke). | Ekte `TrainingPlanSession`-persistering. | — |
| ~~D5~~ ✅ | **Moderering-/GDPR-kø.** | **BESLUTTET + BYGGET 2026-07-17:** `ModerationCase`-modell (String-status, zod-håndhevet), actions m/ audit, GDPR = to-stegs anonymisering (rører IKKE `deletedAt` — hard-delete-cron-fella). Migrasjonsscript `scripts/create-moderation-cases-2026-07-17.ts` MÅ kjøres mot DIRECT_URL før deploy. **Deltråder BYGGET 2026-07-17:** rapporteringsflyt — `opprettRapport`/`opprettGdprForesporsel` i `src/lib/moderering/actions.ts`; rapporter-inngang på venn-profilen (`RapporterVennKnapp`), GDPR-slettforespørsel-kort på `/portal/meg/innstillinger/personvern` (begge → OPEN i admin-køen). `publicPlayerId` AVKLART: PublicPlayer-raden + User-kobling beholdes (turneringsresultater cascader), men offentlig identitet anonymiseres i `utforGdprSletting` (name→«Anonymisert spiller», bio/photoUrl/instagramHandle→null, isActive→false; slug urørt — flagget). **Deltråd i BYGGET 2026-07-17:** kvittering til forespørrer via `notify()` når saken er godkjent/avvist (`varsleForesporrer` i moderering-`actions.ts`, best-effort — velter aldri behandlingen). **BESLUTTET 2026-07-17 (Anders) — Å GJØRE:** (1) **konsolider slette-veiene** → coach-godkjent anonymisering blir eneste vei; umiddelbar selvbetjent hard-delete rutes gjennom samme kø (ingen kaskade-sletting fra personvern-siden). (2) **Anonymiser også `slug`** i `utforGdprSletting` (navn-derivert slug → ikke-navn-token, redirect fra gammel) — lukker navnelekkasjen i URL. **Migrasjonsstatus:** `create-moderation-cases`-scriptet er KJØRT mot prod (Supabase MCP, 2026-07-17) — `moderation_cases`-tabellen finnes nå. | — |
| ~~D6~~ ✅ | **Data-blokkerte skjermer** (a: hull-for-hull · b: shot-map · c: live-tracking). | **(a) BYGGET 2026-07-17.** VIKTIG korreksjon: `HoleScore`-modellen FANTES allerede (ryggrad i runde-stacken siden 10. juli) — det som manglet var par-justering/putter/FW/GIR, 9-hull, «kun totalscore»-modus, scorecard-aggregater og rediger-flate (`/portal/mal/runder/[id]/hull`). Bevisste avgrensninger: hulldata mates IKKE inn i SG (senere arbeid); slag-kjeder slettes per hull ved slag-endring (UpGame-presedens). **(b) shot-map BYGGET 2026-07-17:** interaktivt `CourseMap` montert i `slag-wizard.tsx` — tapp på satellittkart setter landingspunkt (kjedes: forrige slags landing → neste slags start), persisteres via eksisterende `saveShot` til `Shot.startX/Y/endX/Y` (X=lng, Y=lat). Ærlig fallback «kart ikke tilgjengelig» når banen mangler geojson/senter. **(c) live-turneringsrunde BYGGET 2026-07-17** (Anders valgte «spiller selv, hull-for-hull»): additivt `Round.tournamentEntryId` (migrasjonsscript `scripts/add-round-tournament-entry-2026-07-17.ts` MÅ kjøres mot DIRECT_URL før deploy), «Start turneringsrunde»-CTA på turneringsdetaljen → oppretter `Round(roundType="turnering")` koblet til spillerens `TournamentEntry` → sender til den eksisterende hull-for-hull-flaten. IKKE sanntids-leaderboard (egen senere beslutning). **Migrasjonsstatus:** `add-round-tournament-entry`-scriptet er KJØRT mot prod (Supabase MCP, 2026-07-17) — kolonnen + indeksen finnes nå. Pin-tabellen (`coach_pinned_players`, D3) ble kjørt samtidig. | — |
| D8 | **Banekart i hull-analysen** er i dag et illustrativt statisk foto. | Statisk foto, ingen ekte geometri. | **BESLUTTET 2026-07-17 (Anders):** bygg **ekte per-hull-geometri**. **BLOKKERT PÅ DATAKILDE:** krever tee/green/fairway-koordinater per hull per bane. Å avklare før bygging: hvor kommer geometrien fra (manuell inntasting i AgencyOS · import fra GolfBox/ekstern · generering)? Egen prosjektbølge, ikke en enkelt-commit. Shot-map (D6b) bruker allerede `CourseMap` der `CourseDefinition.geojson` finnes — samme rør gjenbrukes når geometrien er på plass. |
| ~~D7~~ ✅ | **Sikkerhet-duplikat.** | **BESLUTTET + BYGGET 2026-07-17:** `/portal/meg/innstillinger/sikkerhet` er kanonisk (score-hero + passord-/e-post-skjema), `/portal/meg/sikkerhet` er redirect, `MegSikkerhetV2` slettet, `/2fa`-undersiden beholdt (tilbakelenke ompekt). | — |

## B. Bevisst parkert (PARKERT — ikke rør uoppfordret)

| # | Tema | Status |
|---|---|---|
| B1 | **To live-økt-spor** (`TrainingPlanSession` Spor A vs `TrainingSessionV2` Spor B). | Bevisst sameksistens — se `BUSINESS-RULES.md`. Ikke merge uoppfordret. **Men:** `LiveActive` persisterer reps til `sessionStorage`, ikke DB (reps overlever ikke nettleser-sesjon). Konsolidering/persistering = senere beslutning. |
| B2 | **Dublett-enums** (`PRPress`/`PressureLevel`, `PracticeType`/`DrillPracticeType`, `SessionStatus`/`SessionStatusV2`). | Teknisk gjeld. Rydd kun ved bevisst beslutning — risiko for migrasjoner. |
| B3 | **Dødt `ELITE`-enum** i `Tier`. | Beholdes i Prisma, vises ALDRI i UI (se `BUSINESS-RULES.md`). Ikke fjern fra enum uoppfordret (migrasjon). |
| B4 | ~~**Delvis mock-flater i AgencyOS**~~ + ~~**foreldreportal-datakvalitet**~~ | **LØST/oppdatert 2026-07-15.** Godkjenninger/økonomi/innboks/analytics var alt ekte data (verifisert 14. juli). Foreldreportal: 10 av 11 ruter ekte, siste mock (`/forelder/coach`) fikset 15. juli. Ingen gjenstående kjente mock-flater i disse to områdene. |

## C. Avklart (LØST — ikke flagg på nytt)

| # | Tidligere uklart | Avklaring |
|---|---|---|
| C1 | App-navn CoachHQ vs AgencyOS | **AgencyOS** (`/admin`). «CoachHQ» er dødt navn. |
| C2 | Tier-modell (3-tier $12/$29 i gammel skill) | **2-tier:** GRATIS + PRO (299 kr/mnd). ELITE dødt. Se `BUSINESS-RULES.md`. |
| C3 | Demo-navn (Markus Berg/Magnus) | Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Avatar-initialer avledes fra DB-navn. |
| C4 | Tema per produkt | PlayerHQ lyst, AgencyOS mørkt, ingen toggle. |
| C5 | Junior «Knøtt»-nivå | Fjernet (mai 2026). 4 trinn: Mini/Basis/Utvikling/Elite. |
| C6 | Radius-inkonsistens i skills | Avklart: 8/12/16/20/24/full — matcher `globals.css` + designsystem-README. |
| C7 | `UserGolfId`/`HandicapEntry`/`DegradationTracking` (modeller etterlyst) | Dekkes av `User.hcp` + `WagrSnapshot` (handicap) og `TrackStatus` + `Signal` (degradering). Ingen egen modell trengs. |
| C8 | SG-kalibrering | Ferdig kalibrert + godkjent 2026-06-10. Se `BUSINESS-RULES.md`. |
| C9 | A–K-kategorier: antall + grunnlag | **11 nivåer A–K** basert på **snittscore** (ikke HCP). L utgår (dødt enum, vises aldri). Beslutning Anders 2026-06-15. |
| C10 | P-posisjoner: nummerering | **P7 = Impact** (standard MORAD 10-trinns). `taxonomy.ts` rettet til å matche `teknisk-plan/constants.ts`. Beslutning Anders 2026-06-15. |
| C11 | D1: Live/skjult per skjerm | **LØST 2026-07-15.** 14. juli-listen (11+5 kandidater) var stort sett utdatert ved ny sjekk — Økonomi, Caddie-AI og «Ny spiller» var alt blitt ekte data. Kun 2 hadde fortsatt et ekte demo-varsel i appen: AgencyOS Live/Mission Control og PlayerHQ Talent. Begge fjernet fra menyen (PR #37). Beslutning Anders 2026-07-15. |
| C12 | Design vs. kode ved mismatch (porting) | Når et Claude Design-mockup og faktisk kodefunksjon spriker (feil rolle/handling/manglende steg), **er koden fasit** — designet skal rettes til å matche faktisk funksjon, ikke omvendt. Gjelder `coach/ovelser/ny`, `tren/turneringer/ny`, `utfordringer/ny` (funnet natt til 15. juli). Beslutning Anders 2026-07-15. |
| C13 | `/admin/godkjenn-portal/review` | Bekreftet internt QA-verktøy for utviklingsteamet (side-ved-side live vs. designfil), ikke produkt-UI for sluttbrukere. Merkes 🛠 out-of-scope for design, ingen videre jobb. Beslutning Anders 2026-07-15. |
