# ÅPNE SPØRSMÅL — AK Golf HQ

> **Hva dette er:** ett register over alt som IKKE er bestemt, det som er bevisst parkert, og det som er avklart — så ingen agent re-oppdager eller re-flagger det samme dyrt. **Regel for agenter:** der kode og skill/wiki er uenige, er **koden fasit** inntil en post her flyttes til LØST. Ikke bygg mot beskrivelser i `*-arkitektur`/`*-agents`-skills uten å sjekke koden.
>
> Status: **ÅPEN** (trenger beslutning) · **PARKERT** (bevisst, ikke rør uoppfordret) · **LØST** (avklart — ikke flagg på nytt).
>
> **Sist oppdatert:** 2026-07-15 (D1 løst og utført, tre nye punkter fra natt-økten lagt til: D2/D3/D4). Råmateriale: tidligere `PLATFORM.md` §14 (arkivert) + kodeverifisering 2026-06-14 / agent-pipeline 2026-07-10.

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
| A4 | **13 invarianter.** Nevnt som konsept, finnes ikke som navngitt liste i kode/wiki. | — | Skal de skrives ned, eller utledes fra valideringsregler + junior-vern? |
| A5 | **Forretningstall** (3 MNOK 2026 / 4 MNOK 2027 / AI Coach $10M ARR). | Kun i global CLAUDE.md — ikke i kode/regnskap | Bekreft eller korriger. |
| D2 | **`/portal/ny-okt` mangler ekte lagring.** Funnet av porting-agent natt til 15. juli — kun midlertidig nettleser-state (`sessionStorage`), ingen Prisma-persistering, til tross for at det er en mye brukt rute for å starte en ny økt. Anders har bekreftet (2026-07-15): bygg ekte lagring. | Klient-state only, ingen backend. | Eget kode-oppdrag: datamodell + server action for reell persistering. Ikke startet, ikke scopet i detalj ennå. |
| ~~D5~~ ✅ | **Moderering-/GDPR-kø.** | **BESLUTTET + BYGGET 2026-07-17:** `ModerationCase`-modell (String-status, zod-håndhevet), actions m/ audit, GDPR = to-stegs anonymisering (rører IKKE `deletedAt` — hard-delete-cron-fella). Migrasjonsscript `scripts/create-moderation-cases-2026-07-17.ts` MÅ kjøres mot DIRECT_URL før deploy. **Nye deltråder (ÅPNE):** rapporteringsflyt i appen (opprette saker fra spiller-/coach-flater), `publicPlayerId` ved anonymisering (beholdes i dag — offentlig turneringsidentitet), evt. kvittering til forespørrer via support. | — |
| D6 | **Data-blokkerte skjermer** (a: hull-for-hull · b: shot-map · c: live-tracking). | **(a) BYGGET 2026-07-17.** VIKTIG korreksjon: `HoleScore`-modellen FANTES allerede (ryggrad i runde-stacken siden 10. juli) — det som manglet var par-justering/putter/FW/GIR, 9-hull, «kun totalscore»-modus, scorecard-aggregater og rediger-flate (`/portal/mal/runder/[id]/hull`). Bevisste avgrensninger: hulldata mates IKKE inn i SG (senere arbeid); slag-kjeder slettes per hull ved slag-endring (UpGame-presedens). | **(b) shot-map og (c) live-tracking VENTER** som egne beslutninger. |
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
