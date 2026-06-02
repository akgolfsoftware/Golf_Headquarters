# AK Golf Platform — Master

> Versjon 1.0 · generert 2026-06-01 · autoritativ kilde for plattform-arkitektur
>
> Sannhetshierarki brukt i dette dokumentet: (1) Skills er autoritative, (2) kode er nest-mest, (3) prototyper/demoer er ikke sannhet. Der skill og kode er i konflikt, er begge dokumentert og konflikten lagt i §14 Åpne spørsmål. Kilder siteres per påstand med skill-navn eller filsti.

---

## 1. Sammendrag

**Hva plattformen er.** AK Golf Platform er én Next.js-monorepo (`~/Developer/akgolf-hq`) som samler fire produktflater under samme tak: en offentlig markedsside (akgolf.no), et bookingsystem, en spillerportal (PlayerHQ, `/portal`) og et coach-/adminverktøy (CoachHQ, `/admin`). Alle flatene deler ett designsystem, ett Prisma-skjema mot felles Postgres (Supabase) og felles auth. Plattformen operasjonaliserer AK Golf sin coaching-metodikk (CANON v3.5) i programvare: treningsplaner, live treningsøkter, testing, Strokes Gained-analyse og AI-assisterte forslag.

**Hvem den er for.** Spillere (junior/senior/pro), coacher (head/assistant), foreldre til juniorspillere, administratorer, og offentlige besøkende. Roller i kode: ADMIN, COACH, PLAYER, PARENT, GUEST (`prisma/schema.prisma`, `UserRole`).

**Forretningsmodell (kort).** Inntekt fra 1:1-coaching (AK Golf Academy, hovedinntekt), PRO-abonnement på PlayerHQ (300 kr/mnd), og tilknyttede virksomheter (WANG Toppidrett, Mulligan Indoor, Skarpnord Golf Products). Overordnet mål oppgitt av Anders: 500K USD netto profitt per år fra apper og coachingsystemer (kilde: global CLAUDE.md). Detaljerte tallmål er ikke verifisert i kode/skills — se §12 og §14.

---

## 2. Brukere og roller

Roller i faktisk kode (Prisma `UserRole`, `src/lib/auth/cbac.ts`):

| Rolle | Primær flate | Hovedoppgaver | Capabilities (faktisk kode) |
|---|---|---|---|
| **PLAYER** | PlayerHQ (`/portal`) | Følge treningsplan, gjennomføre live-økter, logge runder/tester, kommunisere med coach, booke | view/edit_own_profile, view_own_bookings, create_booking |
| **COACH** | CoachHQ (`/admin`) | Bygge/publisere treningsplaner, følge opp spillere, booking-admin, teste | + view_all_players, edit_player_plan |
| **ADMIN** | CoachHQ (`/admin`) | Alt coach kan + økonomi, fasiliteter, brukeradmin, agent-styring | Alle (via `Object.values(Capability)`) |
| **PARENT** | Foreldreportal (`/forelder`) | Se barnas plan/booking/økonomi, gi samtykke | view_children, view/edit_own_profile, view/create booking |
| **GUEST** | Website/Booking | Offentlig booking, lese innhold | view_own_profile |

**Viktig konflikt:** `coachhq-arkitektur`-skill og `cbac-matrix.md` beskriver roller INSTRUCTOR / INVITED / STUDENT og 43 capabilities i 12 grupper. Dette finnes **ikke** i koden — koden har 5 roller og 10 capabilities. Skillen beskriver et planlagt/separat system. Se §6 og §14.

Programtilhørighet (ikke en rolle, men segmentering) ligger i `PlayerProgram`-enum: WANG_TOPPIDRETT, WANG_UNG, GFGK_MINI, GFGK_BREDDE, GFGK_JENTER, GFGK_ELITE, AK_ACADEMY, AK_ACADEMY_JUNIOR, PLATFORM_ONLY (`prisma/schema.prisma`).

---

## 3. Flater

### 3.1 PlayerHQ

- **Path/prefix:** `/portal`
- **Shell:** mørk sidebar (`#0A1F18`) + lys/hvit innholdsflate (`#F5F7F5`) — eksplisitt motsatt av CoachHQ (kilde: `playerhq-arkitektur`).
- **Densitet:** personlig, mobile-first, tett.
- **Navigasjon:** nøyaktig 5 hovedtabs (kilde: `playerhq-arkitektur`): I Hjem · II Tren (Plan/Kalender/Øvelser/Tester) · III Mål (Oversikt/Runder/TrackMan/Baner) · IV Coach · V Meg.
- **Hovedflyter (jobs-to-be-done):** planlegge trening · gjennomføre live-økt · analysere (SG) · kommunisere med coach · booke coaching · AI Coach-forslag.
- **Status:** Produksjon, men under aktiv portering/redesign. ~144 ruter med `page.tsx` (mange er detalj-/under-ruter). Flere ruter er redirigert til hub-tabs (se §7.1).

### 3.2 CoachHQ

- **Path/prefix:** `/admin`
- **Shell:** CoachHQDarkShell — helhetlig mørk shell (`#0A1F18`), lys tekst, accent-highlights. Tre-panel sidebar: 56px ikon-rail + 200px navneliste + innhold (kilde: `coachhq-arkitektur`). Legacy MCLayout skal fases ut.
- **Densitet:** maksimal (Bloomberg/Linear-tetthet).
- **6 navigasjonsseksjoner (kilde: `coachhq-arkitektur`):**
  1. **I dag** — Hub, Denne uken, Fokus
  2. **Planlegg** — Treningsplaner, Maler, Kalender, Kapasitet
  3. **Følg opp** — Elever, Coaching Board, Godkjenninger
  4. **Analyse** — Talent, Analytics, Rapporter
  5. **Drift** — Bookinger, Tilgjengelighet, Tjenester, Økonomi, Fasiliteter
  6. **Verktøy** — Team, Meldinger, E-postmaler, Agenter, Library
- **Hovedflyter:** spilleroversikt → 360-profil · plan-bygger (coach skriver, spiller ser) · coaching board (kanban) · booking-admin · økonomi · AI-agenter.
- **Status:** ~133 ruter. CoachHQDarkShell er ny standard for kjerneruter; flere sider fortsatt på legacy-shell. Flere flater er delvis mock (godkjenninger, økonomi, meldinger, agenter, analytics) — se §7.2 og §14.

### 3.3 Foreldreportal

- **Path/prefix:** `/forelder` (egen `forelder/layout.tsx`)
- **Shell:** egen foreldre-shell. Densitet: enkel, lesefokusert.
- **Hovedflyter:** se barnas plan/fremgang (`/forelder/barn`), bookinger, ukerapport, kontakt coach, samtykke (GDPR art. 8), økonomi/fakturaer.
- **Status:** 11 ruter bygget. Datakvalitet (ekte vs. mock) ikke fullverifisert — se §14.

### 3.4 Website (marketing)

- **Path/prefix:** `/` + `(marketing)`-gruppe.
- **Shell:** `(marketing)/layout.tsx`. Densitet: editorial/photo-led, luftig.
- **Hovedflyter:** landingssider (forside, coaching, priser, junior, treningsfilosofi), coach-profiler, anlegg, blogg, og en stor offentlig golf-statistikk-/verktøyportal (`/stats/**`, DataGolf/PGA-data, ~40 ruter).
- **Status:** Produksjon (~72 marketing-ruter). Stats-portalen er en betydelig egen seksjon.

### 3.5 Booking

- **Path/prefix:** offentlig `/booking/**` (under marketing) + innlogget `/portal/booking/**` + admin `/admin/bookinger`.
- **Shell:** arver fra respektiv flate.
- **Hovedflyter:** velg tjeneste/coach/anlegg → velg tid → bekreft (gjest eller innlogget) → kvittering. Stripe-betaling eller credit-trekk fra abonnement. Dobbelt-booking-vern via unik constraint (`Booking`, `prisma/schema.prisma`).
- **Status:** Produksjon. Cron sjekker «stuck bookings» (`/api/cron/check-stuck-bookings`).

---

## 4. Kjerne-metodikk (CANON v3.5)

Definisjonene under er presise og siterer kilde. Hovedkilder: skill `coachhq-plan-builder`, kode `src/lib/taxonomy.ts` + `src/lib/portal/training/ak-taxonomy.ts`, og kunnskaps-wiki `~/Developer/ak-second-brain/wiki/concepts/`. Der wiki og kode er uenige, er det flagget i §14.

| Begrep | Definisjon | Kilde |
|---|---|---|
| **CANON v3.5** | AK Golf sin proprietære coaching-metodikk; faglig fundament for hele plattformen. Sju byggesteiner: AK-formelen, pyramidestruktur, L-faser, CS-nivåer, M-miljø, PR-belastning, IUP-system. Bygger på MORAD, LTAD, Deliberate Practice, Self-Determination Theory. v3.0→v3.5 = tettere LTAD-kobling + eksplisitt LIFE-integrasjon. | `wiki/ak-golf-canon.md` |
| **A–K-kategorier** | IUP-klassifisering i 11 nivåer fra K (nybegynner junior) til A (world elite). To skalaer i bruk: Team Norway (snittscore/alder) og plattform (HCP-skala). **Kode implementerer kun 7 koder** (A–E, J, K) HCP-basert. | `wiki/iup-kategorisystem.md`; kode `SPILLERKATEGORIER` i `ak-taxonomy.ts` |
| **20 testprotokoller** | Standardiserte målinger som bestemmer A–K-kategori, over sju dimensjoner: Speed, Distance, Accuracy (inkl. PEI 25/50/75/100m), Physical, Putting, Scoring, Mental. | `wiki/ak-golf-testprotokoller.md` |
| **Pyramide-akser** | FYS (fundament) → TEK → SLAG → SPILL → TURN (topp). Rykker aldri opp uten solid underliggende lag. | `wiki/treningspyramide-fordeling.md`; enum `PyramidArea` (FYS/TEK/SLAG/SPILL/TURN) |
| **Periodetyper** | GRUNN / SPESIALISERING / TURNERING (wizard eksponerer disse 3). Kode-enum har i tillegg EVALUERING og FERIE. 52-ukers periodisering. | skill `coachhq-plan-builder`; kode `PeriodeType` |
| **L-faser** | Læringsprogresjon: L-KROPP (kun kropp) → L-ARM (kropp+arm, ingen kølle) → L-KØLLE (kølle uten ball) → L-BALL (ball, lav hastighet) → L-AUTO (full automatisering). | `wiki/ak-golf-treningsfilosofi.md`; enum `LFase` (L_KROPP/L_ARM/L_KOLLE/L_BALL/L_AUTO) |
| **CS-nivåer** | Club Speed = % av maks klubbhastighet. Kanonisk skala CS20/CS40/CS50–CS100 (+CS0 i GFGK-plan). **Kode-enum `CSNivaa` har kun CS50–CS100.** Navnekollisjon: wiki kaller CS både «Club Speed» og «Confidence Score». | `wiki/ak-formelen.md`; kode `CSNivaa` |
| **Miljø (M)** | M0 studio/simulator · M1 range tomt · M2 range normalt · M3 bane treningsrunde · M4 bane simulert match · M5 turnering. | kode `MMiljo` (M0–M5) |
| **Press (PR)** | PR1 ingen · PR2 lav · PR3 moderat · PR4 høy · PR5 maks (simulert turnering). | kode `PRPress`/`PressureLevel` (PR1–PR5) |
| **P-posisjoner** | MORAD-svingfase i 10 kontrollpunkter P1.0 (Address) … P7 … P10.0 (Finish) med kvantitative checkpoints + desimaler. Kode har 14 oppføringer; nummerering avviker fra wiki (kode P6=Treff, wiki P7=Impact). | `wiki/morad-posisjonssystem.md`; kode `P_POSISJONER` |
| **LIFE-koder** | Fem mentale akser. Wiki: LIFE-SELV/SOS/EMO/KAR/RES. **Kode bruker andre nøkler:** RESILIENS/FOKUS/SELVTILLIT/KOMMUNIKASJON/ANSVAR. | `wiki/life-rammeverket.md`; kode `LIFE_KODER` |
| **AK-formelen** | Økt-ID-syntaks `[PYRAMIDE]_[OMRÅDE]_[L-FASE]_[CS]_[M]_[PR]`, f.eks. `TEK_TEE_L-BALL_CS60_M2_PR2`. Gjør enhver økt søkbar, sammenlignbar, maskinlesbar. | `wiki/ak-formelen.md`; kode `golf/ak-formula.ts` |
| **13 invarianter** | **Ukjent — ikke funnet** i skill, wiki eller kode som en navngitt liste på 13. Nærmeste konkrete regler er valideringsreglene + junior-vernet (§9). Se §14. | — |
| **Voksen-modell** | «Veien til lavere score»: A (snitt 80–70) · B (90–80) · C (100–90) · D (120–110, største segment) · Nybegynnere. | `wiki/veien-til-lavere-score.md` |
| **Junior-modell** | AK-stigen, **4 trinn** (ikke 5): Mini (<10) → Basis (10–12) → Utvikling (13–15) → Elite (16–19). «Knøtt» er fjernet (korreksjon mai 2026). | `wiki/ak-stigen-juniorutvikling.md` |
| **MORAD** | Mac O'Gradys biomekaniske rammeverk (1990); 10 posisjoner med eksakte vinkel-/vekt-/rotasjons-checkpoints og toleranser. Direkte input til AI Golf Coach. | `wiki/morad-posisjonssystem.md` |

---

## 5. Datamodell

Kilde: `prisma/schema.prisma` (3816 linjer). Under er hovedentitetene gruppert. Fullstendig enum-liste i §5.3.

### 5.1 Hovedentiteter (utvalg)

**Bruker/auth:** `User` (kunde/coach/admin/forelder; profil, rolle, tier, hcp, GDPR-soft-delete), `ParentRelation`, `ParentInvitation`, `Leave` (permisjon/skade), `PushSubscription`, `ApiKey`, `AuditLog`, `ErrorLog`.

**Trening/plan:** `TrainingPlan` → `TrainingPlanSession` → `SessionDrill`; `TrainingPlanSessionLog` (fullføring); `ExerciseDefinition` (drill-bibliotek); `PlanTemplate` → `PlanTemplateSession` (coach-maler); `PlanEffectiveness` (pre/post-SG). Nyere parallelt spor: `TrainingSessionV2` → `TrainingDrillV2` → `DrillLogV2`, og live-logger `SessionDrillInstance` → `SessionSet` + `SessionDrillNote`. Fysisk plan: `FysiskPlan` → `FysUke` → `FysOkt` → `FysOvelseRad`. Workbench: `PlanSession`.

**Teknisk plan (P-system):** `TechnicalPlan` → `TechnicalPlanPosition` (P1.0–P10.0) → `PositionTask` → `PositionTaskLog`; `PositionTaskTmGoal`, `TechnicalPlanClubTarget`, `PlanSuggestion` (AI-forslag).

**Coaching/booking/betaling:** `ServiceType`, `Booking`, `Location`→`Facility`, `CoachAvailability`, `CoachingSession`, `CoachNote`, `Subscription` (tier + credits), `Payment`, `SessionRequest`, `SessionRecording`, `SessionVideo`, `EmailTemplate`, `WebhookFailure`, `GoogleCalendarConnection`.

**Test/handicap/SG:** `TestDefinition`, `TestResult`, `TestSession`, `CourseDefinition`, `Round` → `Shot`, `TrackManSession` → `TrackManShot`, `ShotAnnotation`, `ClubMetricTrend`, `SgBaseline`, `SgInsight`, `BestSessionReference`, `HealthEntry`.

**Agent/AI:** `Signal` (input), `PlanAction` (agent-output treningsplan), `AgentRun` (logg), `AiPlanGeneration`, `CaddieMessage`, `PlanSuggestion` (agent-output teknisk plan).

**Turnering:** `Tournament`, `TournamentResult`, `TournamentEntry`, `TournamentPreparation`, `PublicPlayer`(+Entry), `LeaderboardSnapshot`, `SeasonPlan` → `PeriodBlock`.

**Talent/sosialt:** `TalentTracking` (radar 5 akser 1–10), `TalentRessurs`, `Group`(+Member/Schedule), `Goal`, `Achievement`, `Friendship`, `EquipmentBag`, `PlayerEnrollment`, `WagrSnapshot`.

**Øvrig:** `Bane`, `PgaPlayerSeason`/`PgaPuttDistance`/`PgaApproachDistance`, `Document`, `Notification`, `Lead`, `NotionConnection`/`NotionDatabaseLink`, `PageApproval`/`DesignKobling`.

### 5.2 Sentral relasjon — treningsplan-kjeden

```
User (PLAYER) ──< TrainingPlan ──< TrainingPlanSession ──< SessionDrill ── ExerciseDefinition
   │              (PlanStatus)        (PyramidArea, SkillArea,    (drill-bibliotek)
   │                                   LPhase, PressureLevel)
   │                ├── TrainingPlanSessionLog (1:1 per økt — CS, mood, feedback)
   │                ├── PlanAction (agent-forslag: PENDING/ACCEPTED/REJECTED)
   │                ├── AiPlanGeneration (prompt/respons/kost)
   │                └── PlanEffectiveness (pre/post-SG-delta)
   │
PlanTemplate ──< PlanTemplateSession   (coach-mal → AI-baseline; disciplinFordeling Json)
```

Coach **skriver** `TrainingPlan` i CoachHQ; spiller **ser** kun `ACTIVE`-planer i PlayerHQ. Pyramide-fordeling lagres i `PlanTemplate.disciplinFordeling` (Json, f.eks. `{FYS:0.15, TEK:0.25, SLAG:0.25, SPILL:0.2, TURN:0.15}`). Volum uttrykkes i minutter (`varighetMin`, `weeklyVolMin/Max`) — det finnes ingen «targetHours»-kolonne.

### 5.3 Enum-typer (utvalg)

Roller: `UserRole` (ADMIN/COACH/PLAYER/PARENT/GUEST). Status: `UserStatus` (AKTIV/PERMISJON/SKADET/INAKTIV). Tier: `Tier` (GRATIS/PRO/ELITE). Plan: `PlanStatus` (DRAFT/PENDING_PLAYER/ACCEPTED/REJECTED/ACTIVE/PAUSED/ARCHIVED), `TechPlanStatus` (DRAFT/ACTIVE/ARCHIVED). Metode: `PyramidArea` (FYS/TEK/SLAG/SPILL/TURN), `LFase` (L_KROPP/L_ARM/L_KOLLE/L_BALL/L_AUTO), `CSNivaa` (CS50–CS100), `MMiljo` (M0–M5), `PRPress` (PR1–PR5), `PeriodeType` (GRUNN/SPESIALISERING/TURNERING/EVALUERING/FERIE). Kategori: `NgfKategori` (A–L). Program: `PlayerProgram` (se §2).

---

## 6. Auth og CBAC

**Faktisk implementasjon** (`src/lib/auth/cbac.ts`): 5 roller, 10 capabilities, ingen grupper.

| Capability | ADMIN | COACH | PLAYER | PARENT | GUEST |
|---|:--:|:--:|:--:|:--:|:--:|
| view_own_profile | Ja | Ja | Ja | Ja | Ja |
| edit_own_profile | Ja | Ja | Ja | Ja | – |
| view_own_bookings | Ja | Ja | Ja | Ja | – |
| create_booking | Ja | Ja | Ja | Ja | – |
| view_children | Ja | – | – | Ja | – |
| view_all_players | Ja | Ja | – | – | – |
| edit_player_plan | Ja | Ja | – | – | – |
| view_finance | Ja | – | – | – | – |
| manage_facilities | Ja | – | – | – | – |
| manage_users | Ja | – | – | – | – |

**Håndheving:** Reell tilgangskontroll skjer via **rolle-sjekk**, ikke capability. `requirePortalUser({ allow: [...] })` (`src/lib/auth/requirePortalUser.ts`) er hovedvakten (60+ sider) — redirecter til login/rolle-hjem/samtykke-venter. `canAccessMissionControl()` (`src/lib/auth/canAccessMissionControl.ts`) er ren ADMIN-sjekk. `can(role, capability)` brukes kun ÉN plass og kun til visning (`admin/settings/tilgang/page.tsx`). 9 av 10 capabilities er altså definert men aldri brukt til håndheving.

**Stor skill↔kode-konflikt:** `cbac-matrix.md` (skill) beskriver 43 capabilities i 12 grupper, roller INSTRUCTOR/INVITED/STUDENT, presets, `isStaff`, `getCapabilityDefinition()`, og funksjonen `getStudent360`. **Ingen av disse finnes i koden.** Skillen beskriver et planlagt eller separat system. For nåværende tilstand er koden sannhet. Se §14.

---

## 7. Skjermer-inventar

Status-koder: **live** = produksjon · **redirect** = permanent redirect i `next.config.ts` · **mock** = bygget UI uten full data-wiring · **demo** = prototype/utforskning.

### 7.1 PlayerHQ-ruter (utvalg; ~144 `page.tsx` totalt)

| Path (under `/portal`) | Formål | Status |
|---|---|---|
| `/portal` | Spiller-hjem/dashboard | live |
| `tren/aarsplan`, `tren/teknisk-plan`, `tren/fys-plan`, `tren/tester`, `tren/turneringer` | Treningsmodul (årsplan, teknisk/fys-plan, tester, turneringer) | live |
| `tren/ovelser` | → `planlegge?tab=drills` | redirect |
| `(fullscreen)/live/[sessionId]/{brief,active,logger,summary,tapper}` | Live-økt-flyt (helskjerm) | live (se §10) |
| `mal/**` (runder, baner, trackman, leaderboard, milepæler) | Mål/runde-logging, banedata | live |
| `mal/sg-hub/**` | Strokes Gained-analyse | live |
| `statistikk`, `statistikk/**` | → `analysere?tab=statistikk` | redirect |
| `analyse`, `innsikt`, `profil` | → `analysere` / `meg` | redirect |
| `coach/**` (melding, notes, plans, videoer, ai) | Dialog med coach + plan-visning | live |
| `meg/**` (abonnement, bookinger, helse, innstillinger, hjelp) | Profil, abonnement, innstillinger | live |
| `booking/**` | Booking i portalen | live |
| `talent/**` | Talent-/utviklingsspor | live |
| `reach`, `agent-pipeline` | Engasjement / agent-innboks | mock (Reach: «hardkodet eksempel-data» i kildekommentar) |
| `ai/{foresla-drill,foresla-turnering,mal-bygger}` | AI-forslag | live |

### 7.2 CoachHQ-ruter (utvalg; ~133 `page.tsx` totalt) — shell: CoachHQDarkShell der ny

| Path (under `/admin`) | Formål | Status |
|---|---|---|
| `/admin`, `stall`, `analysere`, `gjennomfore`, `planlegge` | Hubs/dashboards | live |
| `agencyos/**` (spillere, uka, okonomi, caddie) | Coachens kontrolltårn | live |
| `brief`, `queue`/`oppfolging`, `caddie`, `agents`, `coach-ai` | AI-drevne coach-verktøy | mock/delvis |
| `spillere`, `spillere/[id]/**` (profil, tester, workbench, plan) | Spilleradministrasjon + 360-profil | live |
| `plans/**` (new, [planId], templates) | Treningsplan-bygger og maler | live (se §9) |
| `plan-templates/**` | → `plans/templates` | redirect |
| `tester`, `drills`, `videoer`, `runder`, `okter` | Treningsbibliotek | live |
| `live/[sessionId]/**`, `recording`, `trackman` | Live-økt og opptak (coach-side) | live/delvis |
| `talent/**` (discovery, kohort, radar, wagr-import) | Talentspeiding | live |
| `bookinger`, `kalender`, `availability`, `kapasitet`, `foresporsler` | Booking + tilgjengelighet | live |
| `anlegg`, `facilities`, `locations` | → samlet i `anlegg` (flere redirects) | live/redirect |
| `godkjenninger`, `approvals`, `godkjenn-portal/**` | Godkjenningsflyt | mock/delvis |
| `tournaments/**` | Turneringsadmin | live |
| `innboks`, `messages`, `kommunikasjon`, `email-templates` | Meldinger/e-post | mock/delvis |
| `workspace/**` (notion, oppgaver, prosjekter) | Intern oppgave-/Notion-flate | live |
| `finance`, `analytics`, `reports`, `stats/**` | Rapportering/økonomi | mock/delvis |
| `bookings`, `groups`, `elever`, `calendar`, `analyse`, `audit`, `meg` | engelsk/legacy → norske ruter | redirect |

### 7.3 Foreldreportal-ruter (`/forelder`, 11 stk)

`/forelder` (hjem) · `barn` (+`[childId]`) · `bookinger` · `coach` · `fakturaer` · `okonomi` · `ukerapport` · `samtykke` · `varsler` · `innstillinger`. Status: bygget; datakvalitet ikke fullverifisert.

### 7.4 Website-ruter (utvalg; ~72 marketing)

Kjerne: `/`, `om-oss`, `coaching`, `priser`, `junior`, `treningsfilosofi`, `kontakt`, `faq`, `playerhq`. Coacher: `coacher/[slug]`. Anlegg: `anlegg/[slug]`. Blogg: `blogg/[slug]`. Offentlig booking: `booking/[slug]/**`. Turneringer: `turneringer/[slug]`. Juridisk: `personvern`, `cookies`, `vilkar`. **Stats-portal (~40 ruter):** `stats/**` inkl. `stats/pga/**`, `stats/verktoy/**` (whs-kalkulator, sg-estimator m.fl.), `stats/sg-sammenlign`. Auth: `auth/{login,signup,forgot-password,reset-password,bankid,samtykke-venter,guardian-consent/[token]}`.

### 7.5 Demo/utforskning — IKKE produksjon

`/demo` (index, «236 demo-pages»), `(internal)/demos/**`, `(internal)/design-system(-v2)`, `intern/komponenter/**`, `v2-preview/**`, `coach-preview/**`, `portal-preview/**`, `forhandsvisning/**`, `hull-demo`, `kalender-demo`, `lokasjoner-demo`, `sesjon-opptak-demo`, `talent-*-demo`. **Disse skal ikke regnes som produksjonsfeatures.**

### 7.6 API-grupper (`/api/**`, ~44 handlers)

`admin/*`, `ai-plan/generate`, `coach/ai-chat`, `caddie/*`, `recording/*` (start/complete/abort/analyze/transcribe), `stripe/*` (checkout/portal/webhook), `google-calendar/*`, `notion/*`, `cron/*`, `push/*`, `stats/*`, `mcp/akgolf`, `view-as-player`.

---

## 8. Agent-system

**Forbehold:** Begge agent-skillene (`coachhq-agents`, `playerhq-agents`) plasserer kode under `src/lib/portal/...` — den mappen finnes ikke. Faktisk kode ligger i `src/lib/agents/` (deterministiske) og `src/lib/ai/agents/` (LLM-baserte). Skillene er i stor grad aspirasjonelle. Det finnes **to parallelle, ukoblede agent-systemer**.

### 8.1 Deterministiske agenter (`src/lib/agents/`, faktisk bygd)

| Agent | Trigger | Output |
|---|---|---|
| **plan-watcher** | Cron mandag 06:00 (`/api/cron/plan-watcher`) | Sammenligner forrige ukes pyramide-fordeling mot hardkodet mål (FYS15/TEK20/SLAG35/SPILL20/TURN10); avvik >8 % → `PlanAction` type `PYRAMID_ADJUST` |
| **round-agent** | Etter runde (`mal/runder/actions.ts`) | `Signal`: SG_TOTAL, SG_OTT, SG_APP, SG_ARG, SG_PUTT |
| **test-agent** | Etter test | `Signal` TEST_TREND |
| **trackman-agent** | Etter TrackMan-import | `Signal` CLUB_AVG |
| **periodiseringsagent** | Ny plan uten økter | `PlanAction` med standard-fordeling |
| **achievement-agent** | Inne i round-/test-trigger | `Achievement` (milepæler) |

Alle wrappes av `runAgent()` (`agent-runner.ts`) som logger til `AgentRun`.

### 8.2 LLM-agenter (`src/lib/ai/agents/`)

`caddie`, `caddie-with-spiller`, `daily-brief`, `plan-revision`, `sg-interpretation`, `performance-peaking`, `vinn-tilbake`. Bruker Claude + kunnskaps-skills i `src/lib/ai/skills/` (`pyramideSkill`, `bompaSkill`, `sgInterpretationSkill`). `plan-revision` produserer forslag men skriver **ikke** til `PlanAction`.

### 8.3 Pipeline-flyt (faktisk)

```
HENDELSE                AGENT                    OUTPUT          INNBOKS
completeRound ───────►  round-agent ──────────►  Signal          /portal/agent-pipeline (spiller)
  └► achievement-agent ──────────────────────►  Achievement
submitTest ──────────►  test-agent ───────────►  Signal
trackman-import ─────►  trackman-agent ───────►  Signal
ny plan ─────────────►  periodiseringsagent ──►  PlanAction
CRON man 06:00 ──────►  plan-watcher ─────────►  PlanAction ────  /admin/agents (kun aggregat)
```

Spiller godkjenner/avviser `PlanAction` via `acceptPlanAction`/`rejectPlanAction` (`src/lib/agents/actions.ts`) — men `acceptPlanAction` bytter **kun status**, utfører ingen faktisk planendring («forenklet» per kode-kommentar). Coach-siden (`/admin/agents`) er read-only aggregat + manuell plan-watcher-trigger; det finnes ingen coach-godkjenningsinnboks for PlanActions slik `coachhq-agents` beskriver. Se §14.

---

## 9. Plan-bygging (CoachHQ → PlayerHQ)

Kilde: skill `coachhq-plan-builder`.

**Status-flyt:** `DRAFT` → (publiser) → `ACTIVE` → (fullført) → `ARCHIVED`; `ACTIVE` ⇄ `PAUSED`; `DRAFT` → (forkast) → slettet. Spiller ser kun `ACTIVE`. (Merk: skillen nevner ikke PENDING_PLAYER/ACCEPTED, men disse finnes i `PlanStatus`-enum — se §14.)

**Wizard (4 steg):** (1) Spiller/gruppe + periodetype + lengde (4/8/12/16/24 uker, 12 default) + mål. (2) Pyramide + svakhet: AI foreslår fra A–K + SG; svakhet forskyver inntil ±15 %. (3) Mal eller AI: start fra mal / AI-generer / blank / dupliser. (4) Forhåndsvis + lagre («utkast» eller «publiser til spiller»).

**AI-pipeline (10 steg):** (1) pyramide-default fra A–K-tabell × periodetype, (2) svakhets-vekting ±15 %, (3) område-fordeling per uke, (4) dag-mapping (maks 1 høy-intensitet per 48t), (5) L-fase-progresjon (uke 1–3 KROPP/ARM, 4–7 KØLLE/BALL, 8+ AUTO), (6) CS-progresjon CS50→CS80, (7) M/PR-progresjon, (8) drill-valg (aldri samme drill 4 økter på rad), (9) hviledag (min 1/uke, 2 hvis >600 min), (10) output `aiGenerated=true`.

**Pyramide-defaults (A–K × periodetype, FYS/TEK/SLAG/SPILL/TURN):**

| Kategori | Grunn | Spesialisering | Turnering |
|---|---|---|---|
| A | 20/30/30/15/5 | 15/25/35/15/10 | 10/20/30/20/20 |
| B | 20/30/30/15/5 | 15/30/30/15/10 | 10/25/30/20/15 |
| C–D | 25/35/25/10/5 | 15/40/30/10/5 | 15/30/30/15/10 |
| E–F | 25/40/25/8/2 | 20/40/25/10/5 | 20/35/25/15/5 |
| G–H | 30/45/20/5/0 | 25/45/20/8/2 | 25/40/25/8/2 |
| I–K | 35/50/15/0/0 | 30/50/15/5/0 | (ingen turnering) |

**Validering:** pyramide-sum = 100 (±1); 1–7 økter/uke; maks 600 min/uke; ingen overlapp med booking (advarsel); `aiGenerated` må godkjennes; endring etter publisering versjoneres; konkurranse-uke låser pyramiden 7 dager før turnering.

**Junior-vern (under 16 år):** maks 4 økter/uke; ingen CS90+; minst 2 hviledager; skadestatus = pause (kun TEK uten ball).

---

## 10. Live Session Execution (PlayerHQ)

Kilde: skill `playerhq-live-session` + kode. **Forbehold:** skillen beskriver `LiveSessionLog`-modell og en `live-session.ts` med 7 navngitte actions — disse finnes ikke. Koden har to parallelle modell-spor.

**Skjermer (5 ruter, `(fullscreen)/live/[sessionId]/`):** `brief` (`LiveBrief`) → `active` (`LiveActive`) → `logger` (samme `LiveActive`) → inline «øvelse fullført» (transition) → `summary` (`LiveSummary`). Egen `tapper`-modus (`TapperShell`). Data via `loadLiveSession()` (`src/lib/portal-live/data.ts`) mot `TrainingPlanSession`.

**Server actions (to spor):**
- Spor A (`TrainingPlanSession`): `startSession` (status ACTIVE), `completeSession` (upsert `TrainingPlanSessionLog`, auto-arkiver plan, `computeEffectiveness`, redirect til feiring).
- Spor B (`TrainingSessionV2`, granulær): `logRep`, `completeSet`, `addSet`, `addDrill`, `saveDrillNote`, `finishSession`; `freezeSessionSummary` aggregerer til `completedSummary` Json.

**Kritisk gap:** `LiveActive` kaller **ingen** server actions — reps/tid holdes i React-state + `sessionStorage`, ikke i DB. Spor B-actionene ligger ubrukte. Live-reps overlever ikke nettleser-sesjonen. `pause`/`resume`/`abandon` finnes ikke som server actions (pause er ren UI-state).

**Edge cases:** Skillen lover beforeunload + 60s auto-save, «Fortsett pågående økt?», IndexedDB offline-sync — **ingen av disse er bygget**. «Trene sammen»/delt økt har datamodell (`isShared`, `SessionParticipant`) men UI-status er ukjent.

---

## 11. Designsystem (kort)

Full spec: skill `ak-golf-hq-design` (`colors_and_type.css`).

**Farger (primitiver):** forest-900 `#0A1F17` (tekst), forest-500/primary `#005840` (CTA), lime-500/accent `#D1F843` (highlights, primary CTA), cream-50 `#FAFAF7` (bg lys), cream-300 `#E5E3DD` (border). States: destructive `#A32D2D`, success `#1A7D56`, warning `#B8852A`, info `#2563EB`. Pyramide-fills: FYS `#005840`, TEK `#B8852A`, SLAG `#2563EB`, SPILL `#D1F843`, TURN `#A32D2D`.

**Typografi:** Inter (`font-sans`, UI/brødtekst), Inter Tight (`font-display`, hero + editorial italic-signatur), JetBrains Mono (`font-mono`, KPI-tall + eyebrows).

**Shell-mønstre:** CoachHQDarkShell (`/admin`, helhetlig mørk `#0A1F18`) vs. PlayerHQ-shell (`/portal`, mørk sidebar + lys innhold `#F5F7F5`). Aldri begge mørke.

**Regler:** kun Lucide-ikoner (24px, 1.5px stroke), ingen emoji, 8pt-grid strengt (`p-3/p-5/p-7/p-9` forbudt), ingen hardkodede hex, gjenbruk `src/components/athletic/`. (Radius-verdier er inkonsistente mellom skills — se §14.)

---

## 12. Forretningsmål

> Kilde: global CLAUDE.md (Anders' kontekst). Konkrete årstall-mål under er **oppgitt av Anders i oppdraget**, ikke verifisert mot kode/skills — se §14.

- **Inntektsstrømmer:** 1:1-coaching (AK Golf Academy, hovedinntekt) · PlayerHQ PRO-abonnement (300 kr/mnd, bekreftet i `priser`-side + `profil-data.ts`) · coaching for WANG Toppidrett · Mulligan Indoor (Trackman-fasiliteter) · Skarpnord Golf Products (treningsutstyr, tidlig fase).
- **Kundegrupper:** individuelle spillere (junior/senior/pro), golfklubber/akademier, idrettsskoler (WANG).
- **Overordnet mål (CLAUDE.md):** 500K USD netto profitt per år fra apper og coachingsystemer.
- **Oppgitt i oppdraget (uverifisert):** 3 MNOK 2026, 4 MNOK 2027, AI Coach $10M ARR. Markert som åpent spørsmål.
- **Abonnementsmodell i produksjon:** 2-tier — GRATIS + PRO (300 kr/mnd). ELITE er fjernet fra UI men beholdt som dødt `Tier`-enum (kilde: auto-memory + `priser`-side). Coaching-credits (Performance 2/mnd, Pro 4/mnd) ligger i `Subscription.monthlyCredits`.

---

## 13. Tilknyttede entiteter

| Entitet | Rolle i plattformen | Kilde |
|---|---|---|
| **WANG Toppidrett Fredrikstad** | Idrettsskole; coaching-kunde. Program-enum `WANG_TOPPIDRETT`, `WANG_UNG`. | CLAUDE.md; `PlayerProgram` |
| **Mulligan Indoor Golf Simulators** | Trackman innendørs-fasiliteter; knyttes til `Facility`/`TrackManSession`. | CLAUDE.md |
| **Gamle Fredrikstad Golfklubb (GFGK)** | Klubb-samarbeid; program-enum `GFGK_MINI/BREDDE/JENTER/ELITE`; sportsplan-referanser i wiki. | `PlayerProgram`; wiki |
| **NGF / Team Norway** | Norges Golfforbund; A–K-kategorisystemet og impact-nivåer refererer Team Norway. | wiki `iup-kategorisystem.md` |
| **Skarpnord Golf Products AS** | Treningsutstyr, tidlig fase. Skarpnord Invest AS er holding. | CLAUDE.md |

---

## 14. Åpne spørsmål

Eksplisitt liste over konflikter og uavklarte punkter (Anders' to-do):

1. **CBAC-modell (stor konflikt):** `cbac-matrix.md` (skill) = 43 capabilities/12 grupper/roller INSTRUCTOR/INVITED/STUDENT/presets/`isStaff`/`getStudent360`. Kode = 10 capabilities/5 roller/rolle-basert gating. **Hvilken er målbildet?** Skal koden bygges opp til skillen, eller skal skillen nedskaleres til koden?
2. **`getStudent360` finnes ikke** i kode, men er sentral i `coachhq-arkitektur` (360-profil med 9 grupper). Er 360-profilen wiret mot ekte data eller mock?
3. **Agent-system (stor konflikt):** skillene beskriver `lib/portal/...`-arkitektur, 14 signaltyper, 6 deterministiske skills, turnering-agent, coach-godkjenningsinnboks. Faktisk: `lib/agents/` + `lib/ai/agents/`, 7 signaltyper, ingen skills-moduler, ingen turnering-agent, ingen coach-innboks. `acceptPlanAction` endrer ikke planen. **Skal agent-systemet fullføres etter skill-spec?**
4. **Live session (stor konflikt):** `LiveActive` persisterer ikke til DB (kun sessionStorage); spor B-actions ubrukte; ingen offline/auto-save. To parallelle modell-spor (`TrainingPlanSession*` vs `TrainingSessionV2/SessionSet`). **Hvilket spor er kanonisk?** Gammel `live-shell.tsx` lever ved siden av nye ruter; `tren/[sessionId]` peker på rotruten.
5. **13 invarianter:** ikke funnet som navngitt liste i noen kilde. **Finnes de skriftlig, eller skal de utledes fra valideringsregler + junior-vern?**
6. **Metodikk skill↔kode-avvik:** (a) A–K = 11 nivåer (wiki) vs 7 koder (`ak-taxonomy.ts`); (b) CS = CS20–CS100 (wiki) vs CS50–CS100 (kode); (c) CS-navn «Club Speed» vs «Confidence Score»; (d) P-posisjon-nummerering (kode P6=Treff vs wiki P7=Impact); (e) LIFE-koder helt ulike nøkler wiki↔kode; (f) junior-modell «Knøtt» fjernet. **Hvilken er fasit?**
7. **PlanStatus PENDING_PLAYER/ACCEPTED:** finnes i enum men ikke i plan-builder-skillens state-maskin. Er spiller-aksept en planlagt flyt?
8. **Tier-modell:** `playerhq-arkitektur`-skill sier 3 tiers ($12/$29) — utdatert. Produksjon = 2-tier (GRATIS + PRO 300 kr). Skillen bør rettes.
9. **Radius-inkonsistens:** skills uenige (8/12/16/20px på knapper/kort/pills). Avklar én sannhet.
10. **Delvis mock-flater i CoachHQ:** godkjenninger, økonomi/finance, meldinger/innboks, agenter, analytics — hvor mye er ekte data vs. presentasjons-mock?
11. **Foreldreportal:** datakvalitet og hvilke flyter som er produksjonsklare — ikke verifisert.
12. **Forretningstall:** 3 MNOK 2026 / 4 MNOK 2027 / AI Coach $10M ARR er ikke funnet i kode/skills — kun oppgitt i oppdraget. Bekreft eller korriger.
13. **To parallelle treningsøkt-systemer** (`TrainingPlanSession`/`SessionDrill` vs `TrainingSessionV2`/`SessionDrillInstance`) lever side om side. Plan for konsolidering?
14. **Dublett-enums** (`PRPress`/`PressureLevel`, `PracticeType`/`DrillPracticeType`, `SessionStatus`/`SessionStatusV2`). Bevisst, men bør ryddes.
15. **`UserGolfId`, `HandicapEntry`, `DegradationTracking`** (nevnt i oppdraget) finnes ikke som modeller. Handicap = `User.hcp` (Float) + `WagrSnapshot`; «degradering» ≈ `TrackStatus` + `Signal`. Bekreft at dette dekker behovet.

---

## 15. Endringslogg

v1.0 — 2026-06-01 — initial generering. Research basert på 8 skills (`ak-golf-hq-design`, `playerhq-arkitektur`, `coachhq-arkitektur`, `coachhq-plan-builder`, `playerhq-live-session`, `coachhq-agents`, `playerhq-agents`, `akgolf-design-system`), `prisma/schema.prisma`, `src/`-kode, `next.config.ts`, og kunnskaps-wiki `ak-second-brain`.
