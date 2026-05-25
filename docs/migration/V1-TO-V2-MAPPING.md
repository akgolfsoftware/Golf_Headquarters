# V1 → V2 Screen Mapping

**Total skjermer:** 325 (alle produksjons-`page.tsx` under `src/app/`)
**Sist oppdatert:** 2026-05-25
**Kilde:** `find src/app -name page.tsx` minus `(internal)`, `*-demo`, `/design/*`, `/demo`, `/360-demo`, `/portal-preview`, `/coach-preview`, `/offline`

> **Merk om antall:** PROJECT-V2-MIGRATION-PLAN.md opererer med "148 skjermer". Den faktiske enumerasjonen gir 325 `page.tsx`-filer (medregnet dynamiske ruter, varianter og duplikater). Forskjellen forklares av (a) varianter/dynamiske ruter telt separat her, (b) ruter som peker til samme komponent, og (c) duplikater mellom `/admin/*` og nyere `/admin/*`-omdøpninger som bør konsolideres til redirects. Antall faktisk unike *skjerm-mønstre* etter redirect/konsolidering = ~155.

---

## Summary

| Kategori | Antall |
|---|---|
| Totalt mappet | 325 |
| `refactor` (UI-only) | 270 |
| `stub→full` | 9 |
| `rebuild` | 21 |
| `redirect` (duplikat / kanonisering) | 25 |
| `delete` | 0 |
| `Plan A — utenfor scope` (Q4, V2-styling-only) | 4 (telles inn under refactor) |
| Eksisterende V2-pattern-bruk | 7 patterns dekker ~270 skjermer |
| Nye V2-patterns foreslått | 9 hoved + 10 mindre varianter (se bunn) |

### Bølge-fordeling

| Bølge | Område | Skjermer (av 325) |
|---|---|---|
| 1 | PlayerHQ Hovedflyt (portal/tren, portal/booking, portal/mal-kjerne, portal/meg-kjerne, portal/coach-kjerne) | 70 |
| 2 | PlayerHQ Resten + Auth + Onboarding (analyse, talent, utfordringer, varsler, meg-resten, ai, sg-hub-resten, fullscreen) | 84 |
| 3 | CoachHQ Hovedflyt (spillere, stall, talent, plans, drills, planlegge, gjennomfore, teknisk-plan) | 52 |
| 4 | CoachHQ Resten + Stubs + Felles (kalender, bookinger, anlegg, tester, tournaments, settings, workspace, agencyos, agents, innboks/messages, godkjenninger, audit-log, m.m.) | 67 |
| 5 | Marketing + Forelder | 52 (41 marketing + 11 forelder) |

(Bølge-tallene avviker noe fra master-planen fordi planen brukte "skjermer" mens denne tabellen teller filer.)

---

## V2 Pattern-katalog (referanse)

Patterns brukt nedenfor — definert i `docs/migration/V2-PATTERNS.md` og `src/components/v2/*`:

| Pattern | Beskrivelse | Eks. route |
|---|---|---|
| `WorkbenchPage` | Hjem/hub med hero + multiple seksjoner + AI-insights | `/portal` |
| `KalenderPage` | Uke-agenda / itinerary-list | `/portal/kalender` |
| `StatsPage` | Hero KPI + bars + sammenlikning | `/portal/statistikk` |
| `CoachPage` | Thread/melding-liste + reply | `/portal/coach/melding` |
| `ProfilPage` | Settings/identity/integrations | `/portal/meg/innstillinger` |
| `BookingPage` | Multi-step picker / wizard | `/portal/booking/ny` |
| `DrillPage` | Detail med hero + sub-seksjoner | `/portal/drills/[id]` |
| `CustomPattern` | Trenger nytt pattern (se bunn) | varierer |

---

## PlayerHQ — Hovedflyt (Bølge 1)

### Portal-rot + kjerne

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal` | `WorkbenchPage` | refactor | Hjem, allerede delvis V2 (referanse-implementasjon) |
| `/portal/kalender` | `KalenderPage` | refactor | Uke-agenda, allerede delvis V2 |
| `/portal/workbench-v2` | `WorkbenchPage` | redirect | Duplikat av `/portal` — 301 til `/portal` |
| `/portal/varsler` | `CustomPattern: NotificationCenterPattern` | rebuild | Kronologisk feed, ikke i 7 kjerne-patterns |

### Portal/tren (treningsmodul — kjerne)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/tren/aarsplan` | `WorkbenchPage` | refactor | Plan A-ruten — får V2-styling, men Plan A-features utenfor scope (Q4) |
| `/portal/tren/aarsplan/periode/[id]/rediger` | `CustomPattern: PeriodEditorPattern` | refactor | Plan A — utenfor scope (Q4) — V2-styling-only |
| `/portal/tren/kalender` | `KalenderPage` | refactor | Trenings-kalender (uke-agenda) |
| `/portal/tren/[sessionId]` | `DrillPage` | refactor | Økt-detalj |
| `/portal/tren/[sessionId]/planlagt` | `DrillPage` | refactor | Planlagt økt-detalj |
| `/portal/tren/feiring/[planId]` | `CustomPattern: CelebrationPattern` | rebuild | Achievement/feiring — fullscreen-pattern |
| `/portal/tren/fys-plan` | `WorkbenchPage` | refactor | FYS-plan hub |
| `/portal/tren/fys-plan/[planId]` | `DrillPage` | refactor | FYS-plan detalj |
| `/portal/tren/teknisk-plan` | `WorkbenchPage` | refactor | Teknisk plan hub (Mekanisme 7) |
| `/portal/tren/teknisk-plan/[planId]` | `DrillPage` | refactor | Teknisk plan detalj |
| `/portal/tren/ovelser` | `WorkbenchPage` | refactor | Øvelses-katalog |
| `/portal/tren/ovelser/[id]` | `DrillPage` | refactor | Øvelse-detalj |
| `/portal/tren/tester` | `WorkbenchPage` | refactor | Tester hub |
| `/portal/tren/tester/katalog` | `WorkbenchPage` | refactor | Test-katalog (grid) |
| `/portal/tren/tester/[testId]` | `DrillPage` | refactor | Test-detalj |
| `/portal/tren/tester/ny` | `BookingPage` | refactor | Wizard — opprett test |
| `/portal/tren/tester/ny/egen` | `BookingPage` | refactor | Wizard-steg — egen test |
| `/portal/tren/turneringer` | `WorkbenchPage` | refactor | Turneringer hub |
| `/portal/tren/turneringer/[id]` | `DrillPage` | refactor | Turnering-detalj |
| `/portal/tren/turneringer/ny` | `BookingPage` | refactor | Wizard — ny turnering |

### Portal/booking

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/booking` | `WorkbenchPage` | refactor | Booking-hub |
| `/portal/booking/ny` | `BookingPage` | refactor | Multi-step wizard |
| `/portal/booking/ny/bekreft` | `BookingPage` | refactor | Wizard-steg: bekreft |
| `/portal/booking/bekreftet` | `CustomPattern: ConfirmationPattern` | refactor | Suksess-side |
| `/portal/booking/[bookingId]` | `DrillPage` | refactor | Booking-detalj |
| `/portal/booking/anlegg/[anleggId]` | `DrillPage` | refactor | Anlegg-detalj (i booking-flyt) |
| `/portal/booking/coach/[coachId]` | `DrillPage` | refactor | Coach-detalj (i booking-flyt) |

### Portal/meg (kjerne — profil/innstillinger/abonnement)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/meg` | `WorkbenchPage` | refactor | Min profil hub (hero + profilbilde — sesjon-state) |
| `/portal/meg/profil/rediger` | `ProfilPage` | refactor | Bruker `components/meg/profil-rediger-modal.tsx` |
| `/portal/meg/innstillinger` | `ProfilPage` | refactor | Innstillings-hub |
| `/portal/meg/innstillinger/anlegg` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/eksport` | `ProfilPage` | refactor | GDPR-eksport |
| `/portal/meg/innstillinger/integrasjoner` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/okter` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/personvern` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/sikkerhet` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/sprak` | `ProfilPage` | refactor |  |
| `/portal/meg/innstillinger/varsler` | `ProfilPage` | refactor |  |
| `/portal/meg/abonnement` | `WorkbenchPage` | refactor | Abonnement-hub |
| `/portal/meg/abonnement/avbestill` | `CustomPattern: ConfirmationPattern` | refactor |  |
| `/portal/meg/abonnement/faktura/[id]` | `DrillPage` | refactor | Faktura-detalj |
| `/portal/meg/abonnement/kort/ny` | `BookingPage` | refactor | Kort-wizard (Stripe) |
| `/portal/meg/abonnement/oppgrader` | `BookingPage` | refactor | Oppgrader-flyt |
| `/portal/meg/abonnement/oppgrader/flyt` | `BookingPage` | refactor | Multi-step |
| `/portal/meg/bookinger` | `KalenderPage` | refactor | Mine bookinger |
| `/portal/meg/bookinger/reschedule/[bookingId]` | `BookingPage` | refactor | Reschedule-wizard |
| `/portal/meg/sikkerhet` | `ProfilPage` | refactor |  |
| `/portal/meg/sikkerhet/2fa` | `ProfilPage` | refactor | 2FA-oppsett |

### Portal/coach (PlayerHQ-side — meldinger med coach)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/coach` | `WorkbenchPage` | refactor | Min coach hub |
| `/portal/coach/[coachId]` | `DrillPage` | refactor | Coach-profil |
| `/portal/coach/melding` | `CoachPage` | refactor | Innboks |
| `/portal/coach/melding/[id]` | `CoachPage` | refactor | Tråd-detalj |
| `/portal/coach/melding/[id]/vedlegg` | `CustomPattern: AttachmentViewerPattern` | refactor | Vedlegg-visning |
| `/portal/coach/melding/ny` | `CoachPage` | refactor | Komponer ny melding |
| `/portal/coach/sporsmal/[id]` | `CoachPage` | refactor | Spørsmål-tråd |
| `/portal/coach/notes` | `WorkbenchPage` | refactor | Mine notater |
| `/portal/coach/notes/[noteId]` | `DrillPage` | refactor | Notat-detalj |
| `/portal/coach/videoer` | `WorkbenchPage` | refactor | Mine videoer |
| `/portal/coach/ovelser` | `WorkbenchPage` | redirect | Duplikat — 301 til `/portal/tren/ovelser` |
| `/portal/coach/ovelser/[id]/rediger` | `BookingPage` | redirect | 301 til `/portal/tren/ovelser/[id]` (rediger flyttes til coach-portal) |
| `/portal/coach/ovelser/ny` | `BookingPage` | redirect | 301 til admin-side (coach-only) |
| `/portal/coach/plans` | `WorkbenchPage` | redirect | Duplikat av `/admin/plans` — bør 301 |
| `/portal/coach/plans/[planId]` | `DrillPage` | redirect | Duplikat — 301 |
| `/portal/coach/plans/[planId]/ny-okt` | `BookingPage` | redirect | Duplikat — 301 |
| `/portal/coach/plans/perioder` | `WorkbenchPage` | redirect | Duplikat — 301 |
| `/portal/coach/ai` | `CoachPage` | refactor | AI-coach chat |

---

## PlayerHQ — Rest + Auth + Onboarding (Bølge 2)

### Portal/analyse + statistikk

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/analyse` | `StatsPage` | refactor | Analyse-hub |
| `/portal/analysere` | `StatsPage` | redirect | Duplikat av `/portal/analyse` — 301 |
| `/portal/statistikk` | `StatsPage` | refactor | Statistikk hub |
| `/portal/statistikk/[metric]` | `StatsPage` | refactor | Metric-detalj |
| `/portal/statistikk/sammenlign` | `StatsPage` | refactor | Sammenlikning |
| `/portal/statistikk/runder/[runId]/del` | `CustomPattern: SharePattern` | refactor | Del-rund OG-side |

### Portal/mal (mål / goals / SG-hub)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/mal` | `CustomPattern: GoalsHubPattern` | rebuild | Grid av goal-cards med progress |
| `/portal/mal/bygger` | `BookingPage` | refactor | Wizard — opprett mål |
| `/portal/mal/goal/[id]` | `DrillPage` | refactor | Mål-detalj |
| `/portal/mal/milepaeler` | `CustomPattern: TimelinePattern` | rebuild | Milepæler-tidslinje |
| `/portal/mal/leaderboard` | `StatsPage` | refactor | Leaderboard |
| `/portal/mal/statistikk` | `StatsPage` | refactor |  |
| `/portal/mal/runder` | `WorkbenchPage` | refactor | Runder-historikk |
| `/portal/mal/runder/ny` | `BookingPage` | refactor | Wizard — registrer rund |
| `/portal/mal/runder/[id]` | `DrillPage` | refactor | Rund-detalj |
| `/portal/mal/runder/[id]/shot-by-shot` | `CustomPattern: ShotByShotPattern` | rebuild | Shot-by-shot visualization |
| `/portal/mal/baner` | `WorkbenchPage` | refactor | Baner-katalog |
| `/portal/mal/baner/[id]` | `DrillPage` | refactor | Bane-detalj |
| `/portal/mal/trackman` | `WorkbenchPage` | refactor | Trackman-økter |
| `/portal/mal/trackman/[id]` | `DrillPage` | refactor | Trackman-økt-detalj |
| `/portal/mal/sg-hub` | `StatsPage` | refactor | SG-hub rot |
| `/portal/mal/sg-hub/[club]` | `StatsPage` | refactor | SG per kølle |
| `/portal/mal/sg-hub/best-vs-now` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/conditions` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/equipment` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/strategy` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/yardage` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/coach/[spillerId]` | `StatsPage` | refactor | Coach-view |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | `StatsPage` | refactor |  |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | `StatsPage` | refactor |  |

### Portal/talent

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/talent` | `WorkbenchPage` | refactor | Talent-hub |
| `/portal/talent/min-plan` | `DrillPage` | refactor |  |
| `/portal/talent/mitt-niva` | `StatsPage` | refactor |  |
| `/portal/talent/roadmap` | `CustomPattern: TimelinePattern` | rebuild | Talent-roadmap |
| `/portal/talent/sammenligning` | `StatsPage` | refactor |  |

### Portal/utfordringer

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/utfordringer` | `WorkbenchPage` | refactor | Challenges hub |
| `/portal/utfordringer/[id]` | `DrillPage` | refactor | Utfordring-detalj |
| `/portal/utfordringer/ny` | `BookingPage` | refactor | Wizard — opprett |

### Portal/AI + diverse

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/ai/foresla-drill` | `CoachPage` | refactor | AI-chat-pattern |
| `/portal/ai/foresla-turnering` | `CoachPage` | refactor |  |
| `/portal/ai/mal-bygger` | `CoachPage` | refactor | AI mål-bygger |
| `/portal/agent-pipeline` | `CustomPattern: PipelinePattern` | rebuild | Agent-pipeline-visning |
| `/portal/drills` | `WorkbenchPage` | refactor | Drill-katalog |
| `/portal/drills/[id]` | `DrillPage` | refactor | Drill-detalj (kanonisk DrillPage) |
| `/portal/gjennomfore` | `WorkbenchPage` | refactor | Gjennomføre i dag |
| `/portal/ny-okt` | `BookingPage` | refactor | Wizard — opprett økt |
| `/portal/onskeligokt` | `BookingPage` | refactor | Ønskelig økt-wizard |
| `/portal/onskeligokt/bekreftet` | `CustomPattern: ConfirmationPattern` | refactor |  |
| `/portal/planlegge` | `WorkbenchPage` | refactor | Planlegge-hub (PlayerHQ-side) |
| `/portal/reach` | `WorkbenchPage` | refactor | Reach-feature |
| `/portal/spiller/[spillerId]` | `DrillPage` | refactor | Spiller-360 (coach-view fra player) |
| `/portal/trackman/[sessionId]` | `DrillPage` | refactor | Trackman-økt fullscreen-detalj |
| `/portal/meg/dokumenter` | `WorkbenchPage` | refactor | Dokument-arkiv |
| `/portal/meg/feedback` | `ProfilPage` | refactor | Feedback-form |
| `/portal/meg/foreldre` | `WorkbenchPage` | refactor | Foreldre-kobling |
| `/portal/meg/help` | `WorkbenchPage` | refactor | Hjelp-senter |
| `/portal/meg/help/kontakt` | `CoachPage` | refactor | Kontakt-form |
| `/portal/meg/help/artikkel/[slug]` | `DrillPage` | refactor | Help-artikkel |
| `/portal/meg/help/kategori/[slug]` | `WorkbenchPage` | refactor |  |
| `/portal/meg/helse` | `WorkbenchPage` | refactor | Helse-hub |
| `/portal/meg/helse/symptom/ny` | `BookingPage` | refactor | Wizard — registrer symptom |
| `/portal/meg/utstyrsbag` | `WorkbenchPage` | refactor | Utstyrsbag |

### Portal/(fullscreen) — live-økt + test-live

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/portal/(fullscreen)/live/[sessionId]` | `CustomPattern: LiveSessionPattern` | rebuild | Fullscreen-takeover, ikke regulær page |
| `/portal/(fullscreen)/live/[sessionId]/brief` | `CustomPattern: LiveSessionPattern` | rebuild | Brief-steg |
| `/portal/(fullscreen)/live/[sessionId]/active` | `CustomPattern: LiveSessionPattern` | rebuild | Aktiv økt |
| `/portal/(fullscreen)/live/[sessionId]/logger` | `CustomPattern: LiveSessionPattern` | rebuild | Logger |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | `CustomPattern: LiveSessionPattern` | rebuild | Tap-skjerm |
| `/portal/(fullscreen)/live/[sessionId]/summary` | `CustomPattern: LiveSessionPattern` | rebuild | Oppsummering |
| `/portal/(fullscreen)/test/[testId]/live` | `CustomPattern: LiveSessionPattern` | rebuild | Test-live |
| `/portal/(fullscreen)/test/[testId]/summary` | `CustomPattern: LiveSessionPattern` | rebuild | Test-summary |
| `/portal/(fullscreen)/tren` | `CustomPattern: LiveSessionPattern` | rebuild | Tren-fullscreen-rot |

### Auth

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/auth/login` | `CustomPattern: AuthPattern` | refactor | Hero + form |
| `/auth/signup` | `CustomPattern: AuthPattern` | refactor |  |
| `/auth/check-email` | `CustomPattern: AuthPattern` | refactor | Status-skjerm |
| `/auth/forgot-password` | `CustomPattern: AuthPattern` | refactor |  |
| `/auth/reset-password` | `CustomPattern: AuthPattern` | refactor |  |
| `/auth/onboarding` | `BookingPage` | refactor | Onboarding-wizard (8-stegs) |
| `/auth/onboarding/forelder` | `BookingPage` | refactor | Forelder-onboarding |
| `/auth/guardian-consent/[token]` | `CustomPattern: ConsentPattern` | stub→full | Foreldresamtykke-flyt |
| `/auth/samtykke-venter` | `CustomPattern: ConsentPattern` | refactor | Status-skjerm |

### Onboard + inviter

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/onboarding` | `BookingPage` | redirect | Duplikat av `/auth/onboarding` — 301 |
| `/onboard/coach` | `BookingPage` | refactor | Coach-onboarding-wizard |
| `/onboard/klubb` | `BookingPage` | refactor | Klubb-onboarding-wizard |
| `/inviter/forelder/[token]` | `CustomPattern: AuthPattern` | refactor | Invitasjonslanding |

---

## CoachHQ — Hovedflyt (Bølge 3)

### Admin-rot + AgencyOS + Agents

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin` | `WorkbenchPage` | refactor | AgencyOS-hub (allerede delvis V2) |
| `/admin/agencyos` | `WorkbenchPage` | redirect | Duplikat av `/admin` — 301 |
| `/admin/agencyos/uka` | `KalenderPage` | refactor | Ukes-view |
| `/admin/agencyos/spillere` | `WorkbenchPage` | redirect | Duplikat av `/admin/spillere` — 301 |
| `/admin/agencyos/okonomi` | `StatsPage` | refactor | Økonomi-overblikk |
| `/admin/agencyos/caddie` | `WorkbenchPage` | refactor | Caddie-modul |
| `/admin/agencyos/caddie/aktivitet` | `KalenderPage` | refactor | Aktivitets-feed |
| `/admin/agents` | `WorkbenchPage` | refactor | Agent-katalog |
| `/admin/agents/[agentId]` | `DrillPage` | refactor | Agent-detalj |

### Spillere (stall)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/stall` | `WorkbenchPage` | refactor | Stall-overblikk |
| `/admin/spillere` | `WorkbenchPage` | refactor | Spiller-liste |
| `/admin/spillere/ny` | `BookingPage` | refactor | Wizard — opprett spiller |
| `/admin/spillere/[id]` | `WorkbenchPage` | refactor | Spiller-360 |
| `/admin/spillere/[id]/profil` | `DrillPage` | refactor | Spiller-profil-detalj |
| `/admin/spillere/[id]/rediger` | `ProfilPage` | refactor | Rediger spiller |
| `/admin/spillere/[id]/tester` | `WorkbenchPage` | refactor | Spiller-tester |
| `/admin/spillere/[id]/tildel-test` | `BookingPage` | refactor | Tildel-test-wizard |
| `/admin/spillere/[id]/plan/[planId]` | `DrillPage` | refactor | Spiller-plan-detalj |

### Talent

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/talent` | `WorkbenchPage` | refactor | Talent-hub |
| `/admin/talent/[playerId]` | `DrillPage` | refactor | Talent-detalj |
| `/admin/talent/discovery` | `WorkbenchPage` | refactor | Talent-funn |
| `/admin/talent/kohort` | `StatsPage` | refactor | Kohort-analyse |
| `/admin/talent/radar` | `StatsPage` | refactor | Radar-overblikk |
| `/admin/talent/radar/[playerId]` | `StatsPage` | refactor | Radar per spiller |
| `/admin/talent/region` | `StatsPage` | refactor |  |
| `/admin/talent/ressurser` | `WorkbenchPage` | refactor |  |
| `/admin/talent/sammenligning` | `StatsPage` | refactor |  |
| `/admin/talent/wagr-benchmark` | `StatsPage` | refactor | WAGR-benchmark |
| `/admin/talent/wagr-import` | `CustomPattern: ImportPattern` | stub→full | Table + status — ny pattern (per task) |

### Plans + plan-templates + drills

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/plans` | `WorkbenchPage` | refactor | Plans-liste |
| `/admin/plans/new` | `BookingPage` | refactor | Wizard — ny plan |
| `/admin/plans/[planId]` | `DrillPage` | refactor | Plan-detalj |
| `/admin/plans/templates` | `WorkbenchPage` | refactor | Template-liste |
| `/admin/plans/templates/ny` | `BookingPage` | refactor | Wizard — ny template |
| `/admin/plans/templates/[id]/rediger` | `BookingPage` | refactor | Rediger template |
| `/admin/plans/templates/[id]/effectiveness` | `StatsPage` | refactor | Effectiveness-analyse |
| `/admin/plan-templates` | `WorkbenchPage` | redirect | Duplikat av `/admin/plans/templates` — 301 |
| `/admin/plan-templates/[id]` | `DrillPage` | redirect | 301 |
| `/admin/plan-templates/[id]/rediger` | `BookingPage` | redirect | 301 |
| `/admin/plan-templates/ny` | `BookingPage` | redirect | 301 |
| `/admin/drills` | `WorkbenchPage` | refactor | Drill-katalog (coach) |
| `/admin/drills/[id]` | `DrillPage` | refactor | Drill-detalj (kanonisk DrillPage-bruk) |
| `/admin/drills/[id]/rediger` | `BookingPage` | refactor | Rediger drill |

### Planlegge + gjennomføre + teknisk-plan

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/planlegge` | `WorkbenchPage` | refactor | Coach planlegg-hub |
| `/admin/gjennomfore` | `WorkbenchPage` | refactor | Dagens økter |
| `/admin/gjennomfore/okter/[id]` | `DrillPage` | refactor | Økt-detalj |
| `/admin/teknisk-plan` | `WorkbenchPage` | refactor | Teknisk plan hub (coach) |
| `/admin/teknisk-plan/[spillerId]` | `DrillPage` | refactor | Per-spiller teknisk plan |
| `/admin/analyse` | `StatsPage` | refactor | Coach-analyse |
| `/admin/analysere` | `StatsPage` | redirect | Duplikat av `/admin/analyse` — 301 |
| `/admin/analytics` | `StatsPage` | redirect | Duplikat av `/admin/analyse` — 301 |
| `/admin/coach-workbench` | `WorkbenchPage` | redirect | Duplikat av `/admin` — 301 |

---

## CoachHQ — Rest + Stubs + Felles (Bølge 4)

### Kalender + okter + bookinger

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/kalender` | `KalenderPage` | refactor | Uke-default |
| `/admin/kalender/uke` | `KalenderPage` | refactor |  |
| `/admin/kalender/maned` | `CustomPattern: MonthCalendarPattern` | rebuild | Måneds-grid (ikke i 7 kjerne-patterns) |
| `/admin/calendar` | `KalenderPage` | redirect | Duplikat av `/admin/kalender` — 301 |
| `/admin/calendar/maned` | `CustomPattern: MonthCalendarPattern` | redirect | 301 |
| `/admin/okter` | `WorkbenchPage` | refactor | Økt-liste |
| `/admin/bookinger` | `WorkbenchPage` | stub→full | Stub i V1 (KONTROLL-bookinger) — bygges som ekte |
| `/admin/availability` | `KalenderPage` | refactor | Tilgjengelighet |
| `/admin/kapasitet` | `StatsPage` | refactor | Kapasitets-analyse |

### Anlegg + locations + facilities

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/anlegg` | `WorkbenchPage` | refactor | Anlegg-liste |
| `/admin/anlegg/[id]` | `DrillPage` | refactor | Anlegg-detalj |
| `/admin/locations` | `WorkbenchPage` | redirect | Duplikat av `/admin/anlegg` — 301 (lokasjon=parent) |
| `/admin/facilities` | `WorkbenchPage` | refactor | Fasilitet-liste (lokasjon=parent, fasilitet=child) |
| `/admin/facilities/[id]` | `DrillPage` | refactor | Fasilitet-detalj |

### Tester + tournaments + runder

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/tester` | `WorkbenchPage` | refactor | Test-bibliotek (coach) |
| `/admin/tester/[id]` | `DrillPage` | refactor | Test-detalj |
| `/admin/tester/foreslatte` | `WorkbenchPage` | refactor | Foreslåtte tester |
| `/admin/tester/tildel/[spillerId]` | `BookingPage` | refactor | Tildel-wizard |
| `/admin/tournaments` | `WorkbenchPage` | refactor | Turneringer-liste |
| `/admin/tournaments/[id]` | `DrillPage` | refactor | Turnering-detalj |
| `/admin/tournaments/ny` | `BookingPage` | refactor | Wizard |
| `/admin/tournaments/dubletter` | `CustomPattern: DuplicateResolverPattern` | rebuild | Dublett-finder |
| `/admin/runder` | `WorkbenchPage` | refactor | Runder-arkiv |
| `/admin/trackman` | `WorkbenchPage` | refactor | Trackman-arkiv |
| `/admin/videoer` | `WorkbenchPage` | refactor | Video-arkiv |

### Innboks + messages + kommunikasjon + email-templates

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/innboks` | `CoachPage` | refactor | Innboks-thread-liste |
| `/admin/messages` | `CoachPage` | redirect | Duplikat — 301 til `/admin/innboks` |
| `/admin/kommunikasjon` | `WorkbenchPage` | refactor | Kommunikasjons-hub |
| `/admin/email-templates` | `WorkbenchPage` | refactor | Template-katalog |
| `/admin/email-templates/[id]/rediger` | `CustomPattern: EmailTemplateEditorPattern` | rebuild | Form + preview |
| `/admin/foresporsler` | `WorkbenchPage` | refactor | Forespørsler-liste |
| `/admin/oppfolging` | `WorkbenchPage` | refactor | Oppfølgings-kø |

### Godkjenninger + approvals + audit

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/godkjenninger` | `WorkbenchPage` | stub→full | Stub (KONTROLL-godkjenninger) |
| `/admin/approvals` | `WorkbenchPage` | redirect | Duplikat — 301 til `/admin/godkjenninger` |
| `/admin/approvals/[id]` | `DrillPage` | redirect | 301 |
| `/admin/audit-log` | `CustomPattern: AuditLogPattern` | stub→full | Kronologisk event-liste — ny pattern |
| `/admin/audit-log/[id]` | `DrillPage` | stub→full | Audit-event-detalj |

### Workspace + integrasjoner + agencyos-resten

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/workspace` | `WorkbenchPage` | refactor | Workspace-hub |
| `/admin/workspace/oppgaver` | `WorkbenchPage` | refactor | Oppgave-liste |
| `/admin/workspace/oppgaver/[id]` | `DrillPage` | refactor | Oppgave-detalj |
| `/admin/workspace/prosjekter` | `WorkbenchPage` | refactor | Prosjekt-liste |
| `/admin/workspace/notion` | `WorkbenchPage` | stub→full | Stub (notion-prosjekter) — bygges full |
| `/admin/workspace/tildelt-meg` | `WorkbenchPage` | stub→full | Stub (workspace-tildelt-meg) — bygges full |
| `/admin/integrasjoner` | `ProfilPage` | refactor | Integrasjons-oversikt |

### Settings + team + organisasjon + grupper

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/settings` | `ProfilPage` | stub→full | Stub (KONTROLL-settings) |
| `/admin/settings/api` | `ProfilPage` | refactor |  |
| `/admin/settings/calendar` | `ProfilPage` | refactor |  |
| `/admin/settings/security` | `ProfilPage` | refactor |  |
| `/admin/settings/tilgang` | `ProfilPage` | refactor | CBAC matrise |
| `/admin/klubb/innstillinger` | `ProfilPage` | refactor |  |
| `/admin/organisasjon` | `WorkbenchPage` | refactor | Org-struktur |
| `/admin/team` | `WorkbenchPage` | refactor | Team-liste |
| `/admin/team/inviter` | `BookingPage` | refactor | Inviter-wizard |
| `/admin/grupper` | `WorkbenchPage` | refactor | Grupper-liste |
| `/admin/grupper/[id]` | `DrillPage` | refactor | Gruppe-detalj |
| `/admin/profile` | `ProfilPage` | refactor | Admin-egen profil |

### Diverse coach-verktøy

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/admin/board` | `CustomPattern: KanbanPattern` | rebuild | Coach-board (kanban) |
| `/admin/brief` | `WorkbenchPage` | refactor | Daglig brief |
| `/admin/finance` | `StatsPage` | refactor | Økonomi-overblikk (coach) |
| `/admin/hjelp` | `WorkbenchPage` | refactor | Hjelp-senter |
| `/admin/lag-snitt` | `StatsPage` | refactor | Lag-gjennomsnitt |
| `/admin/queue` | `WorkbenchPage` | refactor | Generic kø |
| `/admin/reach` | `WorkbenchPage` | refactor | Reach-feature (coach) |
| `/admin/recording` | `WorkbenchPage` | refactor | Recording-katalog |
| `/admin/reports` | `WorkbenchPage` | refactor | Rapport-liste |
| `/admin/services` | `WorkbenchPage` | refactor | Tjenester |
| `/admin/tilstander` | `StatsPage` | refactor | Tilstander-overblikk |

---

## Forelder-portal (Bølge 5)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/forelder` | `WorkbenchPage` | refactor | Forelder-hjem |
| `/forelder/barn` | `WorkbenchPage` | refactor | Barn-oversikt |
| `/forelder/barn/[childId]` | `DrillPage` | refactor | Barn-360 |
| `/forelder/bookinger` | `KalenderPage` | refactor | Barnas bookinger |
| `/forelder/coach` | `CoachPage` | refactor | Kontakt coach |
| `/forelder/fakturaer` | `WorkbenchPage` | refactor | Faktura-liste |
| `/forelder/okonomi` | `StatsPage` | refactor | Økonomi-overblikk |
| `/forelder/innstillinger` | `ProfilPage` | refactor |  |
| `/forelder/samtykke` | `CustomPattern: ConsentPattern` | refactor | Samtykke-flyt |
| `/forelder/ukerapport` | `StatsPage` | refactor | Ukentlig rapport |
| `/forelder/varsler` | `CustomPattern: NotificationCenterPattern` | refactor |  |

---

## Marketing (Bølge 5)

| V1 path | V2 pattern | Action | Notes |
|---|---|---|---|
| `/(marketing)` | `WorkbenchPage` | refactor | Forside (hero-photo + sections) |
| `/(marketing)/om-oss` | `WorkbenchPage` | refactor |  |
| `/(marketing)/kontakt` | `CoachPage` | refactor | Form + info |
| `/(marketing)/jobb` | `WorkbenchPage` | refactor |  |
| `/(marketing)/junior` | `WorkbenchPage` | refactor |  |
| `/(marketing)/coaching` | `WorkbenchPage` | refactor |  |
| `/(marketing)/coacher` | `WorkbenchPage` | refactor | Coach-liste |
| `/(marketing)/coacher/[slug]` | `DrillPage` | refactor | Coach-profil offentlig |
| `/(marketing)/cases` | `WorkbenchPage` | refactor | Suksess-cases |
| `/(marketing)/suksess` | `WorkbenchPage` | refactor |  |
| `/(marketing)/treningsfilosofi` | `WorkbenchPage` | refactor |  |
| `/(marketing)/priser` | `CustomPattern: PricingPattern` | rebuild | Pricing-tiers grid |
| `/(marketing)/playerhq` | `WorkbenchPage` | refactor | Produkt-lander |
| `/(marketing)/anlegg` | `WorkbenchPage` | refactor | Anlegg-liste |
| `/(marketing)/anlegg/[slug]` | `DrillPage` | refactor | Anlegg-detalj offentlig |
| `/(marketing)/turneringer` | `WorkbenchPage` | refactor | Turnering-liste |
| `/(marketing)/turneringer/[slug]` | `DrillPage` | refactor | Turnering-detalj |
| `/(marketing)/blogg` | `WorkbenchPage` | refactor | Blogg-feed |
| `/(marketing)/blogg/[slug]` | `DrillPage` | refactor | Blogg-post |
| `/(marketing)/faq` | `WorkbenchPage` | refactor |  |
| `/(marketing)/cookies` | `CustomPattern: LegalPattern` | refactor | Cookie-policy |
| `/(marketing)/personvern` | `CustomPattern: LegalPattern` | refactor |  |
| `/(marketing)/vilkar` | `CustomPattern: LegalPattern` | refactor |  |
| `/(marketing)/booking` | `BookingPage` | refactor | Offentlig booking-rot |
| `/(marketing)/booking/[slug]` | `BookingPage` | refactor | Booking-wizard steg |
| `/(marketing)/booking/[slug]/bekreft` | `BookingPage` | refactor | Bekreft-steg |
| `/(marketing)/booking/kvittering/[bookingId]` | `CustomPattern: ConfirmationPattern` | refactor | Kvittering |
| `/(marketing)/stats` | `StatsPage` | refactor | Stats-hub offentlig |
| `/(marketing)/stats/pga` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/drive-distance` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/fairway-pct` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/gir-pct` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/putt-explorer` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/putts-per-round` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/scoring-avg` | `StatsPage` | refactor |  |
| `/(marketing)/stats/pga/sg-total` | `StatsPage` | refactor |  |
| `/(marketing)/stats/sg-sammenlign` | `StatsPage` | refactor | SG-sammenlikning |
| `/(marketing)/stats/sg-sammenlign/start` | `BookingPage` | refactor | Wizard-start |
| `/(marketing)/stats/sg-sammenlign/resultat/[id]` | `StatsPage` | refactor | Resultat-side |
| `/(marketing)/stats/spillere` | `WorkbenchPage` | refactor | Spiller-katalog |
| `/(marketing)/stats/spillere/[slug]` | `DrillPage` | refactor | Spiller-detalj offentlig |

---

## Plan A — utenfor scope (Q4)

Per SCOPE-DECISIONS.md Q4 er Plan A (plan-bygger med 5 zoom-nivåer + pyramide-baner) utenfor scope. Disse rutene får V2-styling i denne migrasjonen, men får ikke nye features:

- `/portal/tren/aarsplan` — V2-styling only
- `/portal/tren/aarsplan/periode/[id]/rediger` — V2-styling only
- `/portal/mal/bygger` — V2-styling only (separat fra Plan A men nær)
- `/portal/ai/mal-bygger` — V2-styling only

---

## Nye V2-patterns som må bygges

Følgende V1-skjermer passer ikke inn i de 7 kjerne-patterns. Foreslåtte nye patterns:

### 1. `GoalsHubPattern`
**Bruk:** `/portal/mal`
**Struktur:** Grid 2×2 eller 3×N av "goal-cards" med progress-ring per kort, lime accent på aktive mål, mono ghost-number i hjørnet, photo-divider mellom kategorier (langsiktig / kortsiktig / pågående).

### 2. `NotificationCenterPattern`
**Bruk:** `/portal/varsler`, `/forelder/varsler`
**Struktur:** Kronologisk feed gruppert per dag (i dag / i går / denne uka / eldre). Hver varsel = `lift` card med ikon-kategori + tittel + tidsstempel + handling-CTA. Filtrerings-chips øverst.

### 3. `AuditLogPattern`
**Bruk:** `/admin/audit-log`
**Struktur:** Tidslinje med 26px-kolonne (kategori-ikon) + timestamp-mono + event-beskrivelse + aktør. Filter-rad med dato-range + bruker + event-type. Detalj-modal ved klikk.

### 4. `EmailTemplateEditorPattern`
**Bruk:** `/admin/email-templates/[id]/rediger`
**Struktur:** Split-pane — venstre: form (subject, body, variables), høyre: live preview iframe. Sticky save-bar nede. Variabel-chips som autokomplett.

### 5. `ImportPattern`
**Bruk:** `/admin/talent/wagr-import`
**Struktur:** 3-stegs flow: (1) upload/connect → (2) preview-tabell med valider/edit + status-pill per rad → (3) commit. Hero-status (X av Y rader gyldige) med count-up.

### 6. `LiveSessionPattern`
**Bruk:** Alle `/portal/(fullscreen)/live/*` + `/portal/(fullscreen)/test/*` + `/portal/(fullscreen)/tren`
**Struktur:** Fullscreen-takeover, ingen ShellWrapper. Topp: LiveBar (kompakt, mono). Senter: en stor display (timer / countdown / video). Bunn: actions-rad. Pulse-animasjoner på live-elementer.

### 7. `TimelinePattern`
**Bruk:** `/portal/mal/milepaeler`, `/portal/talent/roadmap`
**Struktur:** Vertikal tidslinje med årstall-headere som photo-dividers. Hver milepæl = lift-card med dato-mono + tittel + foto + status-pill.

### 8. `ConsentPattern`
**Bruk:** `/auth/guardian-consent/[token]`, `/auth/samtykke-venter`, `/forelder/samtykke`
**Struktur:** Hero med foto + tittel + kort beskrivelse, fulgt av samtykke-card med checkboxer og signering-knapp. Status-side: dark moment med stor "venter på X" + countdown.

### 9. `LegalPattern`
**Bruk:** `/(marketing)/personvern`, `/(marketing)/vilkar`, `/(marketing)/cookies`
**Struktur:** Editorial-layout — eyebrow + h1 + side-table-of-contents (sticky), brødtekst med `prose` styling, photo-divider mellom hovedkapittel.

### Andre custom patterns (mindre, kan bygges som varianter)
- `ConfirmationPattern` — suksess-side med stor ikon + tittel + kvittering-detaljer + CTA (variant av WorkbenchPage)
- `SharePattern` — OG-bilde + del-knapper (variant av DrillPage)
- `AttachmentViewerPattern` — vedlegg-viewer (variant av DrillPage)
- `ShotByShotPattern` — Trackman-visualisering (variant av StatsPage med custom chart)
- `PipelinePattern` — agent-pipeline visning (variant av WorkbenchPage)
- `KanbanPattern` — board med kolonner (`/admin/board`)
- `MonthCalendarPattern` — måneds-grid (alternativ til KalenderPage)
- `DuplicateResolverPattern` — dublett-merge UI (`/admin/tournaments/dubletter`)
- `AuthPattern` — auth-card med hero-foto bakgrunn
- `PricingPattern` — pricing-tier grid med 3 tiers

---

## Tellesjekk

```
Totalt mappet: 325
Bølge 1 (PlayerHQ hovedflyt): 70
Bølge 2 (PlayerHQ rest + Auth + Onboarding): 84
Bølge 3 (CoachHQ hovedflyt): 52
Bølge 4 (CoachHQ rest + stubs + felles): 67
Bølge 5 (Marketing + Forelder): 52 (41 + 11)
SUM: 325 ✓

Action-fordeling:
- refactor: 270
- stub→full: 9 (bookinger, godkjenninger, settings, audit-log, audit-log/[id], workspace/notion, workspace/tildelt-meg, wagr-import, guardian-consent)
- rebuild: 21 (LiveSession ×9, GoalsHub, TimelinePattern ×2, ShotByShot, Pipeline, EmailTemplateEditor, Kanban, MonthCalendar ×1 nonredir, DuplicateResolver, Pricing, Celebration, NotificationCenter)
- redirect: 25 (engelsk→norsk + plans-duplikater + agencyos-duplikater)
- delete: 0
```

---

## Åpne spørsmål / til avklaring

1. **`/portal/coach/plans/*`** — bør disse 4 rutene 301 til `/admin/plans/*`, eller skal coach kunne nå dem fra PlayerHQ-shell? Foreslår 301 siden plans-redigering er admin-flyt.
2. **`/admin/agencyos/*` vs `/admin/*`** — flere ruter dupliserer. Foreslår å beholde `/admin` som kanonisk og 301 fra `/admin/agencyos`.
3. **`/admin/calendar` vs `/admin/kalender`** — norsk er kanonisk per CLAUDE.md (norsk bokmål) — engelsk-rute 301.
4. **`/admin/messages` vs `/admin/innboks`** — samme argument — `/admin/innboks` kanonisk.
5. **`/admin/locations` vs `/admin/anlegg`** — anlegg=norsk = kanonisk.
6. **`/portal/(fullscreen)/*` rebuild-status** — disse er allerede V2-aktige men trenger LiveSessionPattern formelt definert. Avklar om "rebuild" er korrekt eller om "refactor" holder.
7. **Plan A-rute styling** — bekreft at vi gir V2-styling uten å rør Plan A-features.

---

*Dokumentet oppdateres under Pre-Fase 1 dag 4 når sample-test er kjørt på 5 referanse-skjermer.*
