# ÅPNE SPØRSMÅL — AK Golf HQ

> **Hva dette er:** ett register over alt som IKKE er bestemt, det som er bevisst parkert, og det som er avklart — så ingen agent re-oppdager eller re-flagger det samme dyrt. **Regel for agenter:** der kode og skill/wiki er uenige, er **koden fasit** inntil en post her flyttes til LØST. Ikke bygg mot beskrivelser i `*-arkitektur`/`*-agents`-skills uten å sjekke koden.
>
> Status: **ÅPEN** (trenger beslutning) · **PARKERT** (bevisst, ikke rør uoppfordret) · **LØST** (avklart — ikke flagg på nytt).
>
> **Sist oppdatert:** 2026-06-15. Råmateriale: tidligere `PLATFORM.md` §14 (arkivert) + kodeverifisering 2026-06-14.

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
| A3 | **Agent-systemets dybde.** `acceptPlanAction` (`src/lib/agents/actions.ts`) bytter kun status, gjør ingen faktisk planendring. Ingen coach-godkjenningsinnboks. | `src/lib/agents/` (6 deterministiske) + `src/lib/ai/agents/` (6 LLM) | Skal `acceptPlanAction` faktisk endre planen? Bygges coach-innboks/turnering-agent? |
| A4 | **13 invarianter.** Nevnt som konsept, finnes ikke som navngitt liste i kode/wiki. | — | Skal de skrives ned, eller utledes fra valideringsregler + junior-vern? |
| A5 | **Forretningstall** (3 MNOK 2026 / 4 MNOK 2027 / AI Coach $10M ARR). | Kun i global CLAUDE.md — ikke i kode/regnskap | Bekreft eller korriger. |

## B. Bevisst parkert (PARKERT — ikke rør uoppfordret)

| # | Tema | Status |
|---|---|---|
| B1 | **To live-økt-spor** (`TrainingPlanSession` Spor A vs `TrainingSessionV2` Spor B). | Bevisst sameksistens — se `BUSINESS-RULES.md`. Ikke merge uoppfordret. **Men:** `LiveActive` persisterer reps til `sessionStorage`, ikke DB (reps overlever ikke nettleser-sesjon). Konsolidering/persistering = senere beslutning. |
| B2 | **Dublett-enums** (`PRPress`/`PressureLevel`, `PracticeType`/`DrillPracticeType`, `SessionStatus`/`SessionStatusV2`). | Teknisk gjeld. Rydd kun ved bevisst beslutning — risiko for migrasjoner. |
| B3 | **Dødt `ELITE`-enum** i `Tier`. | Beholdes i Prisma, vises ALDRI i UI (se `BUSINESS-RULES.md`). Ikke fjern fra enum uoppfordret (migrasjon). |
| B4 | **Delvis mock-flater i AgencyOS** (godkjenninger, økonomi, innboks, analytics) + **foreldreportal-datakvalitet**. | Kjent. Datakobling kommer; ikke anta at tallene er ekte før verifisert. |

## C. Avklart (LØST — ikke flagg på nytt)

| # | Tidligere uklart | Avklaring |
|---|---|---|
| C1 | App-navn CoachHQ vs AgencyOS | **AgencyOS** (`/admin`). «CoachHQ» er dødt navn. |
| C2 | Tier-modell (3-tier $12/$29 i gammel skill) | **2-tier:** GRATIS + PRO (300 kr/mnd). ELITE dødt. Se `BUSINESS-RULES.md`. |
| C3 | Demo-navn (Markus Berg/Magnus) | Spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen**. Avatar-initialer avledes fra DB-navn. |
| C4 | Tema per produkt | PlayerHQ lyst, AgencyOS mørkt, ingen toggle. |
| C5 | Junior «Knøtt»-nivå | Fjernet (mai 2026). 4 trinn: Mini/Basis/Utvikling/Elite. |
| C6 | Radius-inkonsistens i skills | Avklart: 8/12/16/20/24/full — matcher `globals.css` + designsystem-README. |
| C7 | `UserGolfId`/`HandicapEntry`/`DegradationTracking` (modeller etterlyst) | Dekkes av `User.hcp` + `WagrSnapshot` (handicap) og `TrackStatus` + `Signal` (degradering). Ingen egen modell trengs. |
| C8 | SG-kalibrering | Ferdig kalibrert + godkjent 2026-06-10. Se `BUSINESS-RULES.md`. |
| C9 | A–K-kategorier: antall + grunnlag | **11 nivåer A–K** basert på **snittscore** (ikke HCP). L utgår (dødt enum, vises aldri). Beslutning Anders 2026-06-15. |
| C10 | P-posisjoner: nummerering | **P7 = Impact** (standard MORAD 10-trinns). `taxonomy.ts` rettet til å matche `teknisk-plan/constants.ts`. Beslutning Anders 2026-06-15. |
