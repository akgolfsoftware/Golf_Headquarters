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
| D5 | **Beslutningsnotat B8b — moderering-/GDPR-kø** (`/admin/stats/moderering`): skjermen er v2-portet, men knappene (Godkjenn/Avvis/Bekreft sletting) er ikke koblet fordi ingen kø finnes i datamodellen. **Forslag:** én additiv tabell `ModerationCase` (id, type: RAPPORTERT_INNHOLD\|GDPR_SLETTING, targetType+targetId, reporterId?, userId, status: OPEN\|APPROVED\|REJECTED\|EXECUTED, begrunnelse, createdAt, resolvedAt, resolvedById) + server actions m/ audit. GDPR-sletting utføres som anonymisering (User beholdes med slettet-markør — bookinger/økter refererer den), aldri kaskade-slett. Migrering additivt via kirurgisk `db execute` (gotcha-regelen). | Ingen kø-modell finnes; UI-et står ærlig tomt. | Anders' ja/nei på modellforslaget — deretter én liten PR (tabell + actions + kobling). |
| D6 | **Beslutningsnotat B6 — data-blokkerte skjermer** (shot-map/spredning, hull-for-hull-scorecard, live turnerings-tracking): designene finnes (elite-pakken), men datagrunnlaget mangler. **Kost/nytte:** (a) *Hull-for-hull* er billigst — én additiv tabell `HoleScore` (roundId, hull, slag, putter?, par) + utvidelse av «Logg runde»-skjemaet; gir umiddelbart scorecard + bedre SG-grunnlag. (b) *Shot-map* krever slag-koordinater — realistisk kilde er TrackMan-import (har data) først, manuell plotting senere; middels jobb. (c) *Live-tracking* krever hel innsamlingsflyt (scoring under runde) — størst, anbefales sist. **Anbefalt rekkefølge: a → b → c**, hver som egen beslutning. | `Round` har kun totalscore; ingen koordinater; ingen live-flyt. | Anders velger ambisjonsnivå og rekkefølge — ingenting bygges før ja. |
| D7 | **Sikkerhet-duplikat:** `/portal/meg/sikkerhet` (passord/e-post-skjema) og `/portal/meg/innstillinger/sikkerhet` (score + lenker) er nær-duplikater etter D4b-porten. **Anbefaling:** behold innstillinger-varianten som kanonisk (den ligger i innstillinger-huben der brukere leter), flytt passord/e-post-skjemaet inn dit, og gjør `/portal/meg/sikkerhet` til redirect. | To sider med overlappende jobb. | Anders' ja på konsolideringsretningen — deretter liten PR. |

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
