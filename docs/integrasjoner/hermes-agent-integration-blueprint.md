# Hermes Agent Integration Blueprint — AK Golf HQ

**Status:** Strategisk utkast · 2026-07-30
**Leser:** Teknisk gründer (Prisma/Next.js/Docker, ingen erfaring med persistente lærende agenter)

---

## 0. REALITY CHECK — LES DETTE FØRST

Før blueprinten: briefingen som lå til grunn beskriver en datamodell som **ikke matcher faktisk skjema**. Verifisert mot `prisma/schema.prisma` (5075 linjer):

| Beskrevet i brief | Faktisk i `schema.prisma` |
|---|---|
| `Shot.dataQuality` (TRACKMAN_VERIFIED / GPS_CALCULATED / SELF_REPORTED) | Finnes ikke. `Shot` (linje 1410) er runde-basert GPS/selvrapportert med `startX/Y–endX/Y`, `mentalScore 1–5`. TrackMan-data lever i egne modeller: `TrackManSession` + `TrackManShot` |
| `TrackManShotData` relasjon til `Shot` | Finnes ikke. TrackMan-pipelinen er `src/lib/trackman/parse-csv.ts` + `parse-html-report.ts` → `TrackManSession`/`TrackManShot` |
| `MentalScorecardEntry` | Finnes ikke. Mentalscore ligger som `Shot.mentalScore` (SmallInt 1–5) |
| `NorwegianExpectedStrokes` (A–K) | Nærmeste er `SgBaseline` (linje 3408): `category SgCategory`, `distanceBucket`, `lie`, `expectedStrokes`, `sampleSize`, `source`, `fetchedAt` |
| `CoachingForecast` med `trackManVerified` | Finnes ikke som tabell |
| `ClubDispersionData` med MOBILE_APP-kontekst | Dispersjon beregnes i `src/lib/gameplan/dispersion.ts` fra `Shot.targetX/Y` (intensjonslinje, UpGame-mønster) |

**Viktigst av alt:** AK Golf HQ har allerede en agent-flåte. `src/lib/agents/` inneholder **~60 spesialiserte agenter** (`trackman-agent.ts`, `sg-analyse-ekspert.ts`, `periodiserings-agent.ts`, `plan-revisjon-agent.ts`, `churn-radar.ts`, `daily-brief-agent.ts` …) med felles infrastruktur: `agent-runner.ts` (kjøringsramme), `provenance.ts` (data-opphav), `AgentRun`-tabellen (status/varighet/output per kjøring) og **15+ Vercel-crons** i `vercel.json` (`sg-insights` daglig 04:00, `plan-watcher` mandag 06:00, `datagolf-sync` ukentlig …).

Dette endrer blueprintens fundament: **Hermes skal ikke erstatte agent-flåten.** Den skal eie det flåten ikke kan: selvforbedrende ferdigheter, vedvarende brukermodell, og kanal-gatewayen (Telegram/WhatsApp/Slack) ut mot coach og spiller. Seksjon 5 er ærlig om dette.

Alt under refererer **faktiske** tabeller og filer.

---

## 1. AUTOMATION OPPORTUNITY MATRIX

Verktøytaksonomi: `shell`, `file_ops`, `browser`, `api`, `code_sandbox`, `image_gen`, `tts`, `memory` (skill/conv/user), `scheduler`, `sub_agent`.

### 1.1 TrackMan Data Ingestion

**Current Pain:** Coach laster opp CSV/HTML fra TrackMan, `parse-csv.ts`/`parse-html-report.ts` parser, `trackman-agent.ts` skriver `Signal` + `PlanAction`. Når parseren bommer på en ny rapport-layout, oppdages det ved at tallene ser rare ut — eller aldri.

- **Hermes Automation:** Etter hver `TrackManSession.create`: hent sesjonen via `api` (intern route), kjør uavhengig gjen-parsing i `code_sandbox` (Docker), diff mot lagrede `TrackManShot`-rader. Avvik >2% på `carryDistance`-median per kølle → skriv `SgInsight` (severity 3) + `Notification` til coach. Læring om nye TrackMan-layout-varianter lagres i **skill memory** (parser-heuristikker), per-spiller utstyrsnormaler i **user model** (`USER.md`-ekvivalent per spiller).
- **Value Score:** 8 — én korrupt import forurenser `SgBaseline`-sammenligninger og `TechnicalPlanClubTarget`-mål i ukesvis før noen merker det.
- **Complexity:** Low
- **Skill Name:** `trackman-session-qa-v1`

- **Hermes Automation:** Klassifiser `rawJson`-fallback-sesjoner (der `shots.length == 0`, se `trackman-agent.ts:46`): forsøk re-parse med oppdaterte heuristikker, oppfylle strukturerte rader. **Skill memory** akkumulerer layout-fingerprint → parse-regel-mapping.
- **Value Score:** 6 — historiske fallback-sesjoner er i dag død data for per-kølle-analyse.
- **Complexity:** Medium
- **Skill Name:** `trackman-rawjson-backfill-v1`

### 1.2 Planlegging & Periodisering (`TechnicalPlan`, `PeriodBlock`, `PlanSession`)

**Current Pain:** `plan-revisjon-agent.ts` og `periodiserings-agent.ts` kjører på cron med faste regler; coach justerer manuelt i Workbench. Ingen husker *hvilke* justeringer coach systematisk overkjører.

- **Hermes Automation:** Les `PlanAdjustment` + `TechnicalPlanAudit` (action TARGET_ADD/PRIO_CHANGE/STATUS_CHANGE med før/etter-payload) og bygg per-coach preferansemodell i **user model**: "Coach A overkjører 80% av volumøkninger >15% i SPESIALISERING-fasen". Forslag fra `weekly-plan-proposals.ts` filtreres gjennom modellen før de presenteres i `Notification`.
- **Value Score:** 9 — planforslag som alltid avvises er ren støy; aksept-rate er den direkte KPI-en for AI-plan-verdien.
- **Complexity:** Medium
- **Skill Name:** `plan-forslag-coach-tuning-v1`

- **Hermes Automation:** Overvåk `PlanEffectiveness` mot `SessionBallLog`-volum og `DrillLogV2`-utførelse; når effekt < forventet 3 uker rad, generer revisjonsutkast med begrunnelse (peker på `payload`-feltene som drev konklusjonen).
- **Value Score:** 7 — foreslår plan-bytte mens det fortsatt er tid igjen av `PeriodBlock`, ikke ved sesongevaluering.
- **Complexity:** Medium
- **Skill Name:** `plan-effekt-revisjon-v1`

### 1.3 Strokes Gained & Baseline-drift (`SgBaseline`, `SgInsight`)

**Current Pain:** `datagolf-sync` (cron mandag 05:00) oppdaterer `SgBaseline`; ingen alarmerer når `sampleSize` for en `distanceBucket` blir for lav til å være meningsfull, eller når en spillers SG-trend flipper fortegn.

- **Hermes Automation:** Ukentlig audit: flagg `SgBaseline`-rader med `sampleSize` under terskel eller `fetchedAt` > 14 dager; kryssjekk `SgInsight.severity` mot faktisk `HoleScore`-utvikling siste 30 dager (falske positive/negative-telling). Trefferskjell-loggen går i **skill memory** og skjerper insight-tersklene per kategori.
- **Value Score:** 7 — SG-baselines er fundamentet under all gap-analyse (`src/lib/workbench/sg-gap.ts`); råtne baselines gir systematisk feil treningsprioritering.
- **Complexity:** Low
- **Skill Name:** `sg-baseline-drift-audit-v1`

### 1.4 Trening & Økter (`SessionBallLog`, `DrillLogV2`, `FysUke`)

**Current Pain:** `training-gap`-cron (mandag 06:30) sjekker volum. Ingen kobler *hva* spilleren faktisk slo (`SessionBallLog.count` per kølle) mot *hva planen sa* (`PlanSession`), og fysisk belastning (`FysUke`/`FysOkt`) er en separat silo.

- **Hermes Automation:** Daglig etter økt-slutt: sammenlign `SessionBallLog` (debounced tapper-data) mot planlagt volum per `PlanSession`; korriger for `FysUke`-belastning; ved >40% avvik 2 økter rad → `Notification` til coach med konkret forslag. Per-spiller "realistisk volum"-profil i **user model**.
- **Value Score:** 8 — plan/utførelse-gapet er den vanligste årsaken til at juniortalenter (`TalentTracking`) faller av i februar–mars.
- **Complexity:** Medium
- **Skill Name:** `okt-volum-gap-v1`

### 1.5 Research Synthesis

**Current Pain:** Manuell research (40+ kilder per spørsmål) før metodikk-endringer; ingenting lagres strukturert — samme litteratur gjenleses.

- **Hermes Automation:** `browser` + `api` (Semantic Scholar/CrossRef) henter kilder, `code_sandbox` ekstraherer, og synthesis skrives til `src/lib/masterbrain/knowledge/concepts/` som ny JSON-fil (samme format som `upgame-dimensions.json`, `ltad-framework.json`) + PR-lignende diff for coach-godkjenning. Kildekvalitet og sitat-treff logges i **skill memory**; domenepreferanser (norsk junior-golf, LTAD) i **user model**.
- **Value Score:** 8 — konsept-JSON-ene driver innsiktsmotoren; fersk forskning forbedrer alle spillere samtidig.
- **Complexity:** High
- **Skill Name:** `research-synthesis-masterbrain-v1`

### 1.6 Frontend / UX Audit (PlayerHQ & CoachHQ)

**Current Pain:** `docs/MASTER-SKJERMPLAN.md` vedlikeholdes manuelt; lys-modus-regelen (utendørs lesbarhet) brytes av og til i nye komponenter; Playwright-specs (`e2e/`) kjøres i CI men UX-regler utenfor testdekning fanges aldri.

- **Hermes Automation:** Ukentlig: `browser` kjører mobil-viewport gjennom nøkkelflytene (login → portal → økt-tapper → runde-registrering), sjekker kontrast/light-mode, og oppdaterer hakene i `MASTER-SKJERMPLAN.md` via `file_ops` på en egen branch. Funn som gjentar seg → regel-forslag i **skill memory**.
- **Value Score:** 6 — skjermplan-hakene er per i dag selvrapporterte; en agent som faktisk verifiserer dem gjør planen sannferdig.
- **Complexity:** Medium
- **Skill Name:** `skjermplan-verifisering-v1`

### 1.7 Booking & Økonomi (`Booking`, `Payment`, `Lead`)

**Current Pain:** Eksisterer allerede som agenter: `booking-conflict-monitor.ts`, `betalings-purring.ts`, `lead-oppfolging.ts`, `churn-radar.ts` — men de varsler inn i appen (`Notification`) som coach må åpne.

- **Hermes Automation:** Ikke dupliser logikken — Hermes abonnerer på `AgentRun`-output fra disse agentene og ruter høy-prio-funn til Telegram/WhatsApp via gateway, med coach-svar ("utsett", "send purring") skrevet tilbake som `PlanAction`/status via `api`. Coach-responsmønstre i **user model**.
- **Value Score:** 7 — forsinket respons på betalings- og churn-varsler er direkte tapt inntekt; kanalen er flaskehalsen, ikke logikken.
- **Complexity:** Low
- **Skill Name:** `varsel-gateway-routing-v1`

---

## 2. SELF-IMPROVING WORKFLOWS

### W1 — TrackMan parse-QA (`trackman-session-qa-v1`)
- **Trigger:** `TrackManSession.create` (webhook/poll hver 15. min).
- **Initial execution:** Re-parse i sandbox, diff mot `TrackManShot`, rapporter avvik.
- **Reflection:** Coach markerer `SgInsight` som `acknowledgedAt`/`resolvedAt` innen 7 dager = true positive; ignorert >14 dager = støy. Treffrate logges per avvikstype.
- **Evolution (10–20 iter):** Iter 1–5: faste terskler (2% median-avvik). Iter 6–10: per-kølle terskler (wedge spriker mer enn driver). Iter 11–20: layout-fingerprints gjenkjennes, og skillen skriver selv parse-regel-patch som foreslås i `parse-html-report.ts`.
- **Acceleration:** ~1.8x færre falske alarmer ved iter 15; parse-dekning fra ~85% → ~97% av TrackMan-eksportvarianter.

### W2 — Plan-forslag coach-tuning (`plan-forslag-coach-tuning-v1`)
- **Trigger:** `weekly-plan-proposals`-cron (mandag).
- **Initial execution:** Videresend alle forslag ufiltrert.
- **Reflection:** Sammenlign forslag vs. faktiske `TechnicalPlanAudit`-endringer 7 dager etter. Aksept = forslaget (eller nær variant) innen 3 redigeringer.
- **Evolution:** Iter 1–5: tell aksept per forslagstype. Iter 6–12: undertrykk typer <20% aksept per coach. Iter 13–20: omskriv forslag til coachs foretrukne format (observert fra `payload`-diffene).
- **Acceleration:** Aksept-rate typisk 25% → 55–60% ved iter 15; ~2.4x mindre coach-tid per planuke.

### W3 — Research synthesis (`research-synthesis-masterbrain-v1`)
- **Trigger:** Coach stiller metodikk-spørsmål, eller månedlig per konsept-fil.
- **Initial execution:** 40 kilder → syntese → JSON-forslag.
- **Reflection:** Andel sitater som overlever coach-review uendret; gjenbruk av samme kilde i senere synteser (kvalitetssignal).
- **Evolution:** Iter 1–5: bred søk, alt inkluderes. Iter 6–12: kilde-rangering fra review-utfall; svake kilder (predatory journals, blogg) ekskluderes automatisk. Iter 13–20: domenespesifikke søkemaler per konsept (LTAD vs. SG vs. mental trening).
- **Acceleration:** ~2.0x raskere til godkjent syntese ved iter 15 (færre kilder å lese, høyere treff).

### W4 — Skjermplan-verifisering (`skjermplan-verifisering-v1`)
- **Trigger:** Ukentlig + på hver merge til `main` som rører `src/app/portal/**` eller `src/app/admin/**`.
- **Initial execution:** Fast sjekkliste (kontrast, viewport, 6 haker per skjerm).
- **Reflection:** Funn som dev markerer "ikke et problem" → juster regel; funn som blir fikset innen 48t → forsterk regel.
- **Evolution:** Iter 1–5: generisk sjekkliste. Iter 6–12: lærte selektorer per skjerm (fra `MASTER-SKJERMPLAN.md`-adressekolonnen). Iter 13–20: prediker hvilke PR-er som sannsynligvis bryter hvilke haker, kjør målrettet i stedet for full sweep.
- **Acceleration:** Full sweep 45 min → målrettet 12 min (~3.7x) ved iter 15, med høyere presisjon.

### W5 — Varsel-routing (`varsel-gateway-routing-v1`)
- **Trigger:** Ny rad i `AgentRun` med høy-prio output fra `churn-radar`/`betalings-purring`/`booking-conflict-monitor`.
- **Initial execution:** Alt til Telegram, ingen prioritering.
- **Reflection:** Coach-svar innen 1t = korrekt prioritet; "støy"-svar eller ignorering >24t = nedprioriter typen.
- **Evolution:** Iter 1–5: flat routing. Iter 6–12: per-type og per-time-prioritet (ikke booking-varsler kl. 22). Iter 13–20: digest-gruppering av lav-prio, eskalasjon til telefon-SMS kun ved gjentatt churn-signal.
- **Acceleration:** Responstid på kritisk varsel ~6t → ~40min; varselvolum til coach -60% ved iter 15.

---

## 3. AGENT ORCHESTRATION ARCHITECTURE

```
                    ┌─────────────────────────────┐
                    │   MASTER AGENT ("Kaprober") │
                    │  gateway: Telegram/Slack/CLI│
                    │  memory: USER.md (coach-    │
                    │  modell) + MEMORY.md (conv) │
                    └──────────┬──────────────────┘
            spawn / collect   │   approval-gate
   ┌───────────────┬──────────┼──────────┬────────────────┐
   ▼               ▼          ▼          ▼                ▼
┌────────┐  ┌────────────┐  ┌────────┐  ┌─────────────┐  ┌──────────────┐
│ Data    │  │ Research   │  │ UX     │  │ Plan-       │  │ (reservert:  │
│ Quality │  │ Synthesis  │  │ Audit  │  │ Optimization│  │ Compliance / │
│ Agent   │  │ Agent      │  │ Agent  │  │ Agent       │  │ GDPR-agent)  │
└────────┘  └────────────┘  └────────┘  └─────────────┘  └──────────────┘
```

- **Master Agent:** Eneste kanal ut (Telegram/Slack/WhatsApp). Tillatelser: les alt, skriv kun `Notification`/`SgInsight`-utkast. Eier **user model** (coach-preferanser, aksept-historikk) og **conversational memory** (MEMORY.md, bounded — siste N interaksjoner + pinnede fakta). Aldri direkte DB-tilgang; går via sub-agenter.
- **Sub-Agent 1 — Data Quality:** Eier W1, W3-terskler, `sg-baseline-drift-audit-v1`. Sandbox: Docker, read-only DB-bruker (eget Postgres-role `hermes_ro`), ingen nettverk utover intern API. Skriver kun via intern API-route med service-token.
- **Sub-Agent 2 — Research Synthesis:** `browser` + eksterne APIer. Ingen DB-tilgang i det hele tatt. Output = filer under `src/lib/masterbrain/knowledge/concepts/` på branch.
- **Sub-Agent 3 — UX Audit:** `browser` mot staging, `file_ops` på docs-branch. Ingen DB.
- **Sub-Agent 4 — Plan Optimization:** Leser `PlanAdjustment`/`TechnicalPlanAudit`/`PlanEffectiveness` via read-only DB; skriver forslag som JSON til Master, aldri til app-DB direkte.

**Communication protocol:** Sub-agenter skriver episoder til SQLite episodic archive (`hermes.db`, tabell `episodes(agent, workflow, input_hash, output_json, reflection_score, created_at)`). Master leser episoder ved daglig briefing. Skill memory (per workflow) er den eneste delte mutable tilstanden — versjonert per skill (`trackman-session-qa-v1` → `-v2` ved breaking endring, aldri in-place-overskriving). MEMORY.md er Master-eksklusiv; sub-agenter kommuniserer kun gjennom strukturerte episoder, ikke fri tekst.

**Safety boundaries:**

| Handling | Krav |
|---|---|
| Les Prisma-data | Read-only role `hermes_ro`; aldri `DATABASE_URL` med skriverettigheter i sandbox |
| Skriv til app (`Notification`, `SgInsight`) | Kun via intern API-route `/api/hermes/write` med Zod-validering + rate limit |
| DB-migrasjoner, `prisma db push`, `seed` | **Alltid manuell godkjenning** — aldri i sandbox |
| Fil-skriving utenfor `docs/` og `knowledge/concepts/` | Approval-gate i gateway (coach svarer "ok") |
| `shell` i sandbox | Docker uten `--privileged`, read-only root-fs, 512MB RAM-cap, ingen Docker-socket |
| Sende melding til spiller (ikke coach) | Dobbelt-godkjenning; junior-spillere (`ParentRelation` finnes) = alltid via foresatt-kanal |

---

## 4. SCHEDULED INTELLIGENCE LAYER

Prinsipp: **ikke dupliser Vercel-crons.** `vercel.json` eier deterministiske kjøringer; Hermes-cron eier refleksjon, syntese og kanal-ruting.

| Frekvens | Tid (lokal) | Jobb | Verktøy | Output |
|---|---|---|---|---|
| Daglig | 06:45 | Les nattens `AgentRun`-rader (sg-insights 04:00, cleanup 03:00), lag morgen-brief med prioritet fra W5-modellen | `api`, `memory` | Telegram til coach |
| Daglig | 21:30 | `okt-volum-gap-v1`: dagens `SessionBallLog` vs. `PlanSession` | `api`, `code_sandbox` | `Notification` + Telegram ved avvik |
| Daglig | 22:00 | `trackman-session-qa-v1` på dagens importer (W1-refleksjon) | `code_sandbox`, `api` | `SgInsight` + episode i SQLite |
| Ukentlig | Man 07:15 | Etter `plan-watcher` (06:00) og `training-gap` (06:30): W2-filtrering av ukens planforslag før de vises | `api`, `memory` | Filtrerte forslag via `/api/hermes/write` |
| Ukentlig | Ons 05:30 | `sg-baseline-drift-audit-v1`: `sampleSize`/`fetchedAt`-audit + falsk-positiv-telling | `code_sandbox` | `SgInsight` + skill-metrics |
| Ukentlig | Søn 20:00 | `skjermplan-verifisering-v1` full sweep mot staging | `browser`, `file_ops` | Branch + PR mot `MASTER-SKJERMPLAN.md` |
| Månedlig | 1. 09:00 | Skill compression review: alle skills med >10 episoder — kutt døde grener, bump versjon der treffrate falt | `memory`, `code_sandbox` | Skill-changelog i Telegram |
| Månedlig | 1. 10:00 | Volum-/belastningsrapport: `SessionBallLog` + `FysUke` per `TalentTracking`-spiller mot nivåcap (junior 10–15t/uke) | `code_sandbox`, `api` | `MonthlyReport`-utkast til coach |
| Månedlig | 15. 09:00 | `research-synthesis-masterbrain-v1` på eldste konsept-fil (rotasjon) | `browser`, `api`, `file_ops` | Branch med JSON-diff |

---

## 5. HERMES VS. CURRENT STACK — ÆRLIG REGNSKAP

| Område | Nåværende | Hermes | Dom |
|---|---|---|---|
| TrackMan-ingest | `parse-csv.ts`/`parse-html-report.ts` + `trackman-agent.ts` — deterministisk, testet (`stabilitet-fallback.test.ts`, `canonical.test.ts`), provenance-logget | QA-agent rundt pipelinen | **Behold nåværende.** Hermes erstatter ikke parseren; den fanger parserens blinde flekker. Overlap: ~20%. |
| Agent-kjøring | `agent-runner.ts` + `AgentRun` + 15 Vercel-crons — modent, i produksjon | Hermes scheduler | **Behold Vercel for deterministiske jobber.** Hermes eier kun jobber der *refleksjon endrer neste kjøring*. Duplisering ville vært ren regresjon. |
| Research synthesis | Manuell, 40+ kilder, ingenting lagres | W3 med skill memory + konsept-JSON-output | **Ekte oppgradering.** Dette er den klart sterkeste Hermes-usecasen: dagens prosess har null persistens mellom kjøringer. |
| Treningsplan-algoritmer | `plan-engine/` (`load-signals.ts`, `adapt-template.ts`) — regelbasert, deterministisk | W2-tuning av *hvilke* forslag coach ser | **Komplementær, ikke erstatning.** Statiske algoritmer er riktig for fysiologi (48–72t-intervall endrer seg ikke); Hermes lærer coachs preferanser, ikke fysiologi. |
| Frontend-audit | Playwright `e2e/` + manuell `MASTER-SKJERMPLAN.md` | W4 browser-agent | **Moderat oppgradering.** E2E fanger regresjoner; Hermes fanger det som aldri ble skrevet test for. Men den er tregere og dyrere enn Playwright — hold den på ukentlig, ikke per-PR. |
| Kanal ut til coach | `Notification` i appen | Telegram/WhatsApp gateway med toveis svar | **Ekte oppgradering.** Coach sjekker ikke appen kl. 22; Telegram når ham. Toveis svar (`PlanAction` fra chat) finnes ikke i dag. |
| Brukermodell | `AiMemory` (key/value per user) — skrives, sjelden leses strategisk | USER.md: deepening, reflektert over | **Ekte oppgradering** — med forbehold: `AiMemory` bør være skrivemålet (ikke parallell silo), ellers divergerer de to minnene. |

**Bunnlinje:** Hermes' verdi her er *læringsloopen og gatewayen*, ikke agent-kjøringen. Alt som er deterministic og testet skal forbli i `src/lib/agents/`.

---

## 6. IMPLEMENTATION ROADMAP

**Days 1–30 — Foundation**
- Uke 1: Hermes i Docker på samme VM som lokal Supabase-stack (AGENTS.md-portplan: pass på kollisjoner — Supabase 54321–54324, app 3000). Postgres-role `hermes_ro` + intern write-route `/api/hermes/write` (Zod + service-token).
- Uke 2: Telegram-gateway mot coach. Første skill: **`trackman-session-qa-v1`** (Quick Win, se under).
- Uke 3: `sg-baseline-drift-audit-v1` + `varsel-gateway-routing-v1` (les `AgentRun`, ruter høy-prio).
- Uke 4: SQLite episodic archive + refleksjonslogging for alle tre skills. Første "skill compression"-kjøring (manuell).

**Days 31–60 — Integration**
- Sub-agent-topologi (seksjon 3) med approval-gates. `okt-volum-gap-v1` og `plan-forslag-coach-tuning-v1` i skyggemodus (logger hva den *ville* foreslått, viser ingenting til coach) — 2 ukers skyggedrift før aktivering.
- Toveis gateway: coach-svar i Telegram skriver `PlanAction` via eksisterende `accept-plan-action.ts`-flyt.
- `USER.md`-ekvivalent synkes til `AiMemory` (én vei: Hermes → `AiMemory`, appen leser som i dag).

**Days 61–90 — Optimization**
- `research-synthesis-masterbrain-v1` mot `knowledge/concepts/` (branch-basert, coach-godkjenning).
- `skjermplan-verifisering-v1` ukentlig sweep.
- Skill-versjonering og månedlig compression review på schedule. Mål: W1/W2/W5 på iter 10+, dokumentert treffrate-forbedring i episodic archive.

---

## 7. RISK & MITIGATION

| Risiko | Konkret scenario | Mitigation |
|---|---|---|
| **Data privacy (GDPR)** | Junior-spillere (`ParentRelation`), helse (`HealthEntry`, `HelseSamtykke`), mentalscore (`Shot.mentalScore`) sendes til ekstern LLM | Hermes kjører **local-first** (zero telemetry — bruk det). `HelseSamtykke`-flagg sjekkes før enhver spiller-data forlater VM-en. `DataExportRequest`-flyten må dekke Hermes' SQLite-archive. Aldri `PlayerSwingVideo` i LLM-kontekst uten eksplisitt samtykke. |
| **Hallusinasjon i coaching-råd** | Agent foreslår volumøkning som bryter 48–72t-regelen eller junior-cap (10–15t/uke) | Alle plan-forslag valideres mot harde regler i `plan-engine/` *før* de når coach — reglene er kode, ikke prompt. `provenance.ts`-mønsteret utvides: hvert forslag bærer `payload` med datagrunnlag. Ingen forslag direkte til spiller, kun til coach. |
| **Sandbox escape / DB-skade** | Skill med `shell`-tilgang kjører `prisma db push` eller skriver til produksjons-DB | Ingen `DATABASE_URL` i sandbox overhodet — kun `hermes_ro` connection string og intern API. Docker uten socket/privilegier, read-only root. Migrasjoner er på den permanente aldri-listen (approval kan ikke gi det heller). |
| **Skill drift** | Skill lært mot `parse-html-report.ts` v1 slutter å virke etter refactor; refleksjonsloopen "lærer" feil ting | Skills pinnen til git-SHA; episodic archive logger kode-versjon per episode. Månedlig compression review sjekker treffrate per kode-versjon — fall >20% etter deploy = automatisk tilbakerulling av skill til forrige minor-versjon + Telegram-varsel. |
| **Minne-divergens** | `AiMemory` og Hermes' USER.md sier forskjellige ting om samme spiller | Én skrivemåte: Hermes → `AiMemory`. Hermes' USER.md er read-cache + coach-modell, aldri spillerdata-master. |
| **Kostnad/loop-runaway** | Sub-agent spawner sub-agenter i loop på cron | Maks dybde 1 (Master → Sub). Per-job token-budsjett; overskridelse = stopp + episode med `reflection_score=0`. |

---

## QUICK WIN — deploy denne uken

> **`trackman-session-qa-v1`** (W1, seksjon 1.1 / 2.W1)
> Verdi 8 · Complexity Low · Ingen nye integrasjoner.
>
> Hvorfor: Alt den trenger finnes — `TrackManSession`/`TrackManShot` er i skjema, parserne er isolerte i `src/lib/trackman/`, skriveveien (`SgInsight` + `Notification`) er etablert mønster. En Docker-sandbox som re-parser dagens importer og diff'er mot lagrede rader er ~150 linjer orkestrering. Den fanger den stilleste og dyreste feilklassen i systemet (korrupt TrackMan-import som forurenser SG-analyser), og trenger null endringer i appen — kun `hermes_ro`-tilgang og `/api/hermes/write`.
>
> Første iterasjon: daglig 22:00, rapport til Telegram. Refleksjon kan legges på i uke 3.
