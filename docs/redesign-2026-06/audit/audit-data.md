# Audit — datalag

> Kodeverifisert gjennomgang av datalaget i akgolf-hq (Next.js 16 + Prisma 7 + Supabase Postgres), 17. juni 2026.
> Formål: før det komplette redesignet — vite hva som faktisk er koblet til ekte data, hva som er mock, og hvilke modeller som er døde.
> Komplementær til `docs/flyt-inventar/` (døde knapper/ruter). Denne fila handler om **data**, ikke flyt.
>
> Tall: **126 modeller**, **61 enums**, **82 migrasjoner** i `prisma/schema.prisma` (4012 linjer).
> Verifikasjonsmetode: `grep` på `prisma.<modell>` + nested-write (`tx.`, `create:`) + `import type`-sjekk på fixtures.

---

## Prisma-domener (gruppe | modeller | status brukt/dødt)

| Domenegruppe | Modeller | Status |
|---|---|---|
| **Bruker/identitet/GDPR** | User, ParentInvitation, ParentRelation, Leave, PushSubscription, Notification | Brukt — kjernen, alt aktivt |
| **Plan / Workbench (kanon)** | TrainingPlan, TrainingPlanSession, TrainingPlanSessionLog, PlanTemplate, PlanTemplateSession, PlanEffectiveness, PlanAction, PlanAdjustment, PlanChangeRequest, Goal | Brukt |
| **Plan / Workbench (kalender-motor)** | SeasonPlan, PeriodBlock, LockedAnchor, RecurringPattern, PeriodVolumeRecipe, PeriodRecipeOkt, ConditionalRule, OktMal, OktMalDrill, PlanSession | Brukt — koblet via `genererOkter` (session-generator) |
| **Plan / Workbench (døde rester)** | **DrillMal** | **DØD** — modell finnes, men UI bruker mock-array (se under) |
| **Trening V2 / live-økt** | TrainingSessionV2, SessionParticipant, TrainingDrillV2, DrillLogV2, SessionDrillInstance, SessionSet, SessionDrillNote, CoachNote, TrainingLog | Brukt |
| **Øvelser / drills** | ExerciseDefinition, SessionDrill, DrillChallenge, ChallengeParticipant, ClubsPracticed, CoachDrillDirectiv | Brukt |
| **Teknisk plan** | TechnicalPlan, TechnicalPlanPosition, PositionTask, PositionTaskLog, PositionTaskTmGoal, TechnicalPlanClubTarget, TechnicalPlanAudit, PlanSuggestion, FacilityPrefs, TrainingCamp | Brukt |
| **Runder / scoring** | Round, Shot, HoleScore, CourseDefinition, ShotAnnotation | Brukt |
| **Tester** | TestDefinition, TestResult, TestSession, TestAssignment | Brukt |
| **TrackMan** | TrackManSession, TrackManShot, Signal, ClubMetricTrend | Brukt |
| **SG-analyse / benchmarks** | SgBaseline, SgInsight, BestSessionReference, BrukerSgInput, BrukerSammenligning, PgaPlayerSeason, PgaPuttDistance, PgaApproachDistance | Brukt |
| **Booking / tjenester** | Booking, ServiceType, Location, Facility, CoachAvailability, GoogleCalendarConnection, GoogleCalendarSubscription | Brukt |
| **Abonnement / betaling** | Subscription, Payment, PlayerEnrollment, CoachingSession | Brukt |
| **Turnering / stats** | Tournament, Bane, TournamentEntry, TournamentResult, TournamentPreparation, PublicPlayer, PublicPlayerEntry, LeaderboardSnapshot | Brukt |
| **Turnering (død rest)** | **PublicPlayerRound** | **DØD** — relasjon `roundDetails` finnes, men aldri skrevet/lest |
| **Talent / WAGR** | TalentTracking, TalentRessurs, WagrSnapshot | Brukt |
| **Grupper** | Group, GroupSchedule, GroupMember | Brukt |
| **Helse / utstyr** | HealthEntry, EquipmentBag | Brukt |
| **Kommunikasjon / sosialt** | SessionRequest, Document, Achievement, Friendship, SessionVideo, EmailTemplate | Brukt (Friendship/Achievement tynt — se konsekvenser) |
| **AI / Caddie / agenter** | CaddieMessage, AgentRun, Signal, AiPlanGeneration | Brukt |
| **Opptak / coaching-analyse** | SessionRecording | Brukt |
| **Notion-sync** | NotionConnection, NotionDatabaseLink, OppgaveCache, ProsjektCache | Brukt |
| **Fys-plan** | FysiskPlan, FysUke, FysOkt, FysOvelseRad | Brukt |
| **Design/approval (intern infra)** | PageApproval, DesignKobling | Brukt (intern porting-verktøy) |
| **Drift / infra** | ApiKey, AuditLog, ErrorLog, WebhookFailure, Lead | Brukt |

**Konklusjon:** ~124 av 126 modeller er i aktiv bruk. Datamodellen er moden — dette er IKKE et tomt skall som venter på å kobles. Kun 2 ekte døde modeller (DrillMal, PublicPlayerRound).

---

## Døde enums/modeller (inkl. ELITE — hvor)

### `ELITE` (Tier-enum) — dødt enum-medlem, skal ALDRI vises i UI
- **Definert:** `prisma/schema.prisma` linje 24–28 (`enum Tier { GRATIS PRO ELITE }`) → generert til `src/generated/prisma/enums.ts:26`.
- **Status:** Verdien finnes i DB-enumet, men brukes aldri som reell tier. Koden ekskluderer den eksplisitt:
  - `src/app/portal/meg/abonnement/oppgrader/flyt/page.tsx:11` — kommentar: «kun GRATIS + PRO (300 kr/mnd) — ELITE finnes ikke i UI».
  - `src/app/auth/onboarding/onboarding-wizard.tsx:169` — tier-state er typet `"GRATIS" | "PRO"` (ELITE utelatt).
  - Tier-gating overalt sjekker kun `=== "PRO"` / `=== "GRATIS"`.
- **Hvor den fortsatt LEKKER inn i typer (ryddejobb for redesign):**
  - `src/app/portal/meg/profil/rediger/profil-rediger-form.tsx:24` — `tier: "GRATIS" | "PRO" | "ELITE"` (ELITE i union-typen).
  - `src/app/admin/stall/stall-client.tsx:24` — `type Tier = "GRATIS" | "PRO" | "ELITE"`.
  - `src/app/profile/page.tsx` (`/admin/profile`) — `<StatRow l="Tier" v={user.tier} />` renderer rå tier-verdi; vil vise «ELITE» hvis en rad noensinne har den.
- **Anbefaling:** behold enum-verdien i schema (å fjerne krever migrasjon + risiko), men i redesign: aldri tegn ELITE som valg, og rens de to union-typene + `/admin/profile`-rendringen så «ELITE» ikke kan vises ved et uhell.

### `DrillMal` (modell) — DØD
- Definert i schema (~linje 2684), men **ingen** `prisma.drillMal`-kall noe sted.
- Eneste «drill-mal»-flate er `src/components/shared/calendar/DrillMalLibrary.tsx`, som bruker en **hardkodet `MOCK_DRILL_MALER`-array** — aldri DB-modellen.
- Den **levende** mal-modellen er `OktMal` (+ `OktMalDrill`), brukt i `src/app/admin/kalender/actions/maler.ts` og `src/app/portal/planlegge/actions.ts`.
- **Konsekvens:** hvis redesignet skal ha drill-maler med ekte lagring, må `DrillMalLibrary` kobles til en ekte modell (enten gjenoppliv DrillMal eller bruk OktMal). Slik det står nå er det ren mock.

### `PublicPlayerRound` (modell) — DØD
- Relasjon `roundDetails PublicPlayerRound[]` på `PublicPlayerEntry`, men **aldri skrevet eller lest** i koden.
- Turneringshistorikk hentes via `PublicPlayerEntry` + `rounds Json?`-feltet i stedet (JSON-blob, ikke den relasjonelle modellen).
- **Konsekvens:** rundenivå-turneringsdetaljer er bare semi-strukturert JSON i dag, ikke en spørrbar tabell. Ufarlig, men en mulig opprydding.

### Tynne/grenseland (ikke døde, men nesten tomme — verifiser før redesign lener seg på dem)
- `Friendship` (1 kall), `Achievement` (4 kall), `RecurringPattern` / `ConditionalRule` / `PeriodVolumeRecipe` (1 direkte kall hver, men **koblet** via session-generator). De siste tre er reelt i bruk gjennom auto-generering — ikke fjern.

---

## API-ruter (rute | rolle)

50 route-handlers under `src/app/api/`. 48 ekte/produksjonskoblet, **2 stubs**.

### Auth / OAuth (ekte)
| Rute | Rolle |
|---|---|
| `auth/oauth-callback` | Supabase OAuth → kobler auth-user til Prisma User, lager PLAYER ved ny |
| `notion/oauth/connect` + `callback` | Notion OAuth (HMAC-signert state), lagrer kryptert token |
| `google-calendar/connect` + `callback` | Google Calendar OAuth, lagrer refresh-token + synker kalenderliste |

### Betaling (ekte — Stripe + DB)
| Rute | Rolle |
|---|---|
| `stripe/checkout` | Lager checkout-session, upsert Subscription |
| `stripe/portal` | Åpner Stripe billing-portal |
| `stripe/webhook` | Synker abonnement/betaling/refusjon → Prisma + bekreftelses-epost + GCal-push |

### Opptak / transkripsjon (ekte, unntatt 1 stub)
| Rute | Rolle |
|---|---|
| `recording/start` `upload-chunk` `complete` `abort` | Opptaks-livssyklus → Supabase Storage + Prisma |
| `recording/transcribe` | OpenAI Whisper → transkript |
| `recording/analyze` | Claude-analyse → Notion coaching-session |
| **`recording/dummy-transcript`** | **STUB** — hardkodet transkript for testing av pipeline |

### Caddie (AI-admin-agent) (ekte)
| Rute | Rolle |
|---|---|
| `caddie/chat` | Streamer Claude Sonnet 4.6 via Vercel AI Gateway m/ verktøy |
| `caddie/approve` | Kjører godkjent verktøyhandling |
| `caddie/conversations` + `[id]` | List / hent / slett samtaler |

### AI-planlegging / coaching (ekte, unntatt 1 stub)
| Rute | Rolle |
|---|---|
| `ai-plan/generate` | Genererer treningsplan via Claude (coach-only) |
| `coach/ai-chat` | Streamer coaching-svar, lager CoachingSession |
| `admin/coach-ai` | Claude-svar m/ spillerprofil-kontekst |
| **`admin/ai-plan`** | **STUB** — returnerer hardkodet 6-ukers skjelett (ekte generering ligger i `ai-plan/generate`) |

### Integrasjoner / webhooks (ekte)
| Rute | Rolle |
|---|---|
| `google-calendar/webhook` | Push fra GCal → synker slettede/flyttede til Booking |
| `notion/sync` | Manuell «sync nå» for ADMIN |
| `meg/health-ingest` | Apple/Garmin helse-metrikk inn (secret-beskyttet) |
| `meg/telegram` | Telegram-webhook → Meg-agent |
| `mcp/akgolf` | MCP-server (JSON-RPC), dispatcher Caddie-verktøy |

### Cron (ekte, CRON_SECRET-beskyttet)
| Rute | Rolle |
|---|---|
| `cron/[agent]` | Dispatcher (plan-watcher, booking-reminders, sg-insights, pga-sync, m.fl.) |
| `cron/check-stuck-bookings` | Finner PENDING > 30 min → Slack-varsel |
| `cron/cleanup-deleted-accounts` | Sletter soft-deletede etter 30 dager |
| `cron/notion-sync` | Auto-synker AUTO-mode Notion-koblinger hvert 5. min |

### Søk (ekte — Prisma)
| Rute | Rolle |
|---|---|
| `admin/search` | Global søk AgencyOS (Cmd+K) |
| `portal/search` | Global søk PlayerHQ (Cmd+K) |
| `stats/search` | Live søk spillere/PGA/turneringer |

### Data / rapport / øvrig (ekte)
| Rute | Rolle |
|---|---|
| `admin/reports/[type]` | CSV-eksport (players/rounds/sessions/subs) |
| `admin/cleanup-recordings/preview` | Forhåndsvisning av opptak forbi retention |
| `admin/plans/[planId]/pdf` | PDF-render av plan |
| `portal/trening/logg` | Spiller logger økt → TrainingLog |
| `portal/live/[sessionId]/snapshot` | Auto-lagring av live-økt (JSON upsert) |
| `lead` | Lead-skjema inn → Prisma + velkomst-epost (rate-limited) |
| `health` | Liveness-sjekk |
| `parse-date` | Naturlig-språk-dato → ISO |
| `upload` | Generisk filopplasting til Supabase Storage |
| `view-as-player` / `view-mode` | Rolle-bytte (cookie) for ADMIN/COACH |
| `push/subscribe` + `unsubscribe` | Web Push-abonnement |
| `notifications/mark-all-read` | Merk alle varsler lest |

---

## Datakobling per domene (KLAR / DELVIS-mock / MANGLER)

Gjelder de 11 hoveddomenene du listet, vurdert på tvers av PlayerHQ + AgencyOS.

| Hoveddomene | Datamodell | Kobling skjerm↔data | Status |
|---|---|---|---|
| **Plan / Workbench** | Komplett (TrainingPlan + V2 + kalender-motor) | PlayerHQ-Workbench + AgencyOS spiller-Workbench leser ekte Prisma; auto-generering via `genererOkter` | **KLAR** (DrillMal-mock er sidespor, ikke kjernen) |
| **SG / analyse** | Komplett (SgBaseline, BrukerSgInput, Pga*-baselines, SgInsight) | `portal/analysere`, SG-Hub, AgencyOS compare alle på Prisma; ingen hardkodede tall | **KLAR** |
| **TrackMan** | Komplett (TrackManSession, TrackManShot, Signal, ClubMetricTrend) | Leser opplastede økter; CSV/HTML-import; ingen blokkerende ekstern-API | **KLAR** |
| **Runder / tester** | Komplett (Round, Shot, HoleScore / Test*) | Lister + KPI-aggregering fra ekte data | **KLAR** |
| **Booking / abonnement** | Komplett (Booking, ServiceType, Subscription, Payment, Stripe-webhook) | Booking-hub + økonomi + Stripe alle ekte | **KLAR** (NB: GCal-tilgjengelighet er fail-closed — tomme tider = utløpt token, ikke bug) |
| **Turnering** | Komplett (Tournament, TournamentEntry/Result, PublicPlayer) | AgencyOS turneringsliste + PlayerHQ turneringsdetalj på Prisma | **KLAR** (rundenivå-detalj er JSON-blob; PublicPlayerRound-tabell ubrukt) |
| **Talent / WAGR** | Komplett (TalentTracking, WagrSnapshot, TalentRessurs) | Talent-side/radar leser ekte radar-felter | **KLAR** |
| **Kommunikasjon** | SessionRequest + CoachingSession (DIRECT-tråder) ekte; Friendship/Achievement tynne | Innboks/foresporsler/messages leser ekte tråder. Forespørsler viser KUN SessionRequest (meldinger/råd ikke union-et inn ennå — IA-beslutning utestår) | **DELVIS** (modell finnes, men meldings-/råd-union mangler i UI) |
| **Helse / utstyr** | Komplett (HealthEntry, EquipmentBag) | `portal/meg/helse` + utstyrsbag på Prisma; health-ingest-API live | **KLAR** |
| **Live-økt** | Komplett, BEVISST to spor: Spor A (TrainingPlanSession, `/portal/live`) + Spor B (TrainingSessionV2, `/admin/live` + workbench) | Begge spor leser/skriver ekte data + snapshot-auto-lagring | **KLAR** (men logging-knapper «Video/Foto/Notat» i live `active` har tom onClick — flyt-hull, se flyt-inventar) |

### Mock/fixture-status (viktig avklaring)
- **`src/lib/v2-fixtures.ts`** brukes KUN som `import type` (typekontrakt) i `athletic/`-komponenter + den interne `/(internal)/design-system-v2`-showcasen. **Ingen ekte produksjonsskjerm renderer fixture-data i runtime.**
- Ekte mock-data i en levende komponent: **`MOCK_DRILL_MALER`** i `DrillMalLibrary.tsx` (eneste funn).
- `portal/kalender/page.tsx` har demo-fallback, men kun betinget (vises bare ved null ekte data) — UX-fallback, ikke readiness-hull.

---

## Konsekvenser for redesign (hvor data må kobles før skjermen er ekte)

Rangert etter viktighet:

1. **Datalaget er allerede modent — redesignet er primært et FRONTEND-bytte, ikke en datakobling-jobb.** ~124 av 126 modeller er aktive; alle 11 hoveddomener er KLAR eller DELVIS. Ikke planlegg for å «koble alt på nytt».

2. **ELITE må ryddes ut av 3 typer/render-punkter** før redesign så verdien ikke kan lekke til skjerm: `profil-rediger-form.tsx:24`, `stall-client.tsx:24`, og rå-rendringen i `/admin/profile`. (Selve enum-verdien beholdes i schema — fjerning krever migrasjon.)

3. **Drill-maler er ekte mock** (`DrillMalLibrary` → `MOCK_DRILL_MALER`). Hvis redesignet beholder drill-mal-biblioteket må det kobles til en ekte modell (gjenbruk `OktMal`, eller gjenoppliv `DrillMal`). Tegnes en drill-mal-skjerm uten dette, blir den fortsatt fake.

4. **Kommunikasjon (DELVIS):** «Forespørsler»-flaten viser bare `SessionRequest`. Designet blander Booking/Melding/Råd. Før den skjermen er «ekte» må meldinger + råd union-es inn (IA-beslutning utestår — ikke et datamodell-hull, men en spørrings-/UI-jobb).

5. **Live-økt logging:** datamodellen finnes (SessionVideo, SessionDrillNote), men «Video/Foto/Notat»-knappene i live `active` har tom onClick. Skjermen er data-KLAR men flyt-død — kobles i redesign.

6. **PublicPlayerRound + JSON-blobs:** turnerings-rundedetalj lever som `rounds Json?` i stedet for den relasjonelle tabellen. Hvis redesignet vil vise hull-for-hull-turneringshistorikk som spørrbar flate, må enten JSON valideres med zod ved lesing (gotcha-regel) eller PublicPlayerRound tas i bruk.

7. **Friendship / Achievement er tynne** (1 / 4 kall). Hvis redesignet løfter sosiale features eller prestasjons-badges til en hovedflate, må disse modellene fylles med ekte skrive-logikk først — i dag er de nesten tomme skall.
