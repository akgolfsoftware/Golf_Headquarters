# Skjerm → komponent-kart

> **Formål:** Gjør porting rask. For hver nøkkelskjerm: hvilke komponenter fra det nye designsystemet (`design-system/components/`) den bygges av. Komponentnavn er kort-navnene fra biblioteket (PhotoHero, KpiStrip, SgBreakdown, ViewSwitcher, MasteryRing, DataTable Pro, EmptyState osv.).
>
> **Kilder:** `docs/skjerm-inventar-konsolidering.md` (rent skjermsett) + `docs/redesign-2026-06/20-KOMPONENT-SPEC.md` + `design-system/components/`. **Korreksjon innarbeidet** (`audit/00-OPPSUMMERING.md`): hele `/portal/mal/*`-treet er LEVENDE og skal **portes**, ikke kuttes — det er med her.
>
> **Lesehjelp:** Alle skjermer arver shell-chrome (Sidebar/PortalShell-topbar/BottomNav) + tilstander (Skeleton/EmptyState) implisitt — ikke gjentatt per rad. Kolonnen «Mangler?» markerer komponenter som ennå ikke finnes i `design-system/components/` (NY).

---

## PlayerHQ (`/portal`) — lyst, mobil-først

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/portal` (dashboard) | PhotoHero, Greeting, KpiStrip, DayCal, InsightCard Pro, AthleticCard, ActionList, PulseDot | — |
| `/portal/analysere` (workbench-analyse) | DetailHero, ViewSwitcher, SgBreakdown, TrendBand, DataTable Pro, InsightCard Pro | — |
| `/portal/analysere/hull` | HoleStrip, RoundScorecard, SgBar, DispersionMap | — |
| `/portal/statistikk` (SG/snitt/trend) | KpiStrip, SgBreakdown, TrendBand, SgTrendLine, HcpTrend, DataTable Pro, Sparkline | — |
| `/portal/statistikk/[metric]` | DetailHero, TrendBand, SgBar, StatTile, PercentileGauge | — |
| `/portal/statistikk/sammenlign` | CompareH2H, SkillRadarLive, SgBar, PercentileGauge | — |
| `/portal/statistikk/runder/[runId]/del` | RoundScorecard, HoleStrip, ShareCard | ShareCard (NY) |
| `/portal/trackman/[sessionId]` | DetailHero, DispersionMap, GappingChart, ClubMetricGrid, DataTable Pro | — |
| `/portal/booking` | PageHero, AthleticCard, ItineraryRow, Badge | — |
| `/portal/booking/ny` (+ `/bekreft`) | SessionScheduler, AthleticCard, Button, EmptyState | — |
| `/portal/booking/[bookingId]` | DetailHero, ItineraryRow, KpiCard, Button | — |
| `/portal/booking/anlegg` · `/coach` · `/bekreftet` | GalleryView, AthleticCard, FeaturedCard | — |
| `/portal/gjennomfore` (+ `/[id]`) | PhotoHero, ActionList, ChallengeCard, GoalProgress, Button | — |
| `/portal/ny-okt` | PlanBuilderShell, KanbanBoard, DataTable Pro, Button | PlanBuilderShell (NY) |
| `/portal/onskeligokt` (+ `/bekreftet`) | PageHero, AthleticCard, Button, EmptyState | — |
| `/portal/planlegge` + `/workbench` | WorkbenchShell, ViewSwitcher, KanbanBoard, PeriodTimeline, YearPlanGantt | WorkbenchShell (NY) |
| `/portal/kalender` (årskalender) | YearPlanGantt, MonthGrid, EventTimeline, HeatmapCalendar | — |
| `/portal/drills` (+ `/[id]`) | GalleryView, ViewSwitcher, ChallengeCard, DetailHero (detalj), MasteryRing | — |
| `/portal/tren/[sessionId]` (+ `/planlagt`) | DetailHero, ActionList, GoalProgress, KpiStrip | — |
| `/portal/tren/aarsplan` (+ `/periode/[id]/rediger`) | YearPlanGantt, PeriodTimeline, GoalProgress | — |
| `/portal/tren/fys-plan` (+ `/[planId]`) | TestMatrix, GoalProgress, DataTable Pro, MasteryRing | — |
| `/portal/tren/teknisk-plan` (+ `/[planId]`) | KanbanBoard, GoalProgress, ChallengeCard, InsightCard Pro | — |
| `/portal/tren/kalender` (ukekalender) | WeekGrid, DayCal, HeatmapCalendar | — |
| `/portal/tren/tester` (+ `/katalog` `/[testId]` `/ny` `/ny/egen`) | TestMatrix, GalleryView (katalog), DataTable Pro, ChallengeCard, PercentileGauge | — |
| `/portal/tren/turneringer` (+ `/[id]` `/ny`) | TournamentCard, EventTimeline, DetailHero, RoundScorecard | — |
| `/portal/tren/feiring/[planId]` | PersonalBest, BadgeShelf, GoalProgress, GhostNumber | — |
| `/portal/trening/break-tabell` · `/logg` · `/putte-laboratoriet` | PuttLab, DataTable Pro, TrendBand, HeatmapCalendar | — |
| `/portal/coach` (coach-hub) | HubCard, ActionList, InsightCard Pro, Avatar | — |
| `/portal/coach/melding` (+ `/[id]` `/[id]/vedlegg` `/ny`) | InboxList, MessageThread, Avatar, Button | InboxList, MessageThread (NY) |
| `/portal/coach/notes` (+ `/[noteId]`) | AthleticCard, InsightCard Pro, DetailHero | — |
| `/portal/coach/sporsmal/[id]` | MessageThread, InsightCard Pro | MessageThread (NY) |
| `/portal/coach/plans` (+ `/[planId]` `/[planId]/ny-okt` `/perioder`) | KanbanBoard, PeriodTimeline, GoalProgress, DataTable Pro | — |
| `/portal/coach/ovelser` (+ `/ny` `/[id]/rediger`) | GalleryView, ChallengeCard, DataTable Pro | — |
| `/portal/coach/videoer` · `/ai` · `/[coachId]` | GalleryView, PhotoHero (profil), InsightCard Pro | — |
| `/portal/ai/foresla-drill` · `/foresla-turnering` · `/mal-bygger` | InsightCard Pro, ChallengeCard, GoalProgress, Button | — |
| `/portal/talent` (+ `/min-plan` `/mitt-niva` `/roadmap` `/sammenligning`) | JourneyMap, LevelLadder, SkillRadarLive, CompareH2H, GapToNext | — |
| `/portal/meg` (+ ~30 undersider: abonnement/bookinger/dokumenter/helse/innstillinger/profil/sikkerhet/utstyrsbag/hjelp) | PhotoHero, HubCard, SettingsList, WellnessCard, DataTable Pro, GappingChart (bag) | SettingsList (NY) |
| `/portal/utfordringer` (+ `/[id]` `/ny`) | ChallengeCard, GalleryView, GoalProgress, BadgeShelf | — |
| `/portal/varsler` | InboxList, ActionList, Badge | InboxList (NY) |
| `/portal/reach` | DispersionMap, GappingChart, ClubMetricGrid | — |
| `/portal/spiller/[spillerId]` (avklar: coach-funksjon) | StableMatrix, SkillRadarLive, PhotoHero, KpiStrip | — |
| `/portal/agent-pipeline` | EventTimeline, DataTable Pro, InsightCard Pro | — |
| `/portal/(fullscreen)/live/[sessionId]` (+ `/active` `/brief` `/logger` `/summary` `/tapper`) | LiveRepPulse, StreakTracker, GoalProgress, GhostNumber, PersonalBest (summary), ActionList | — |
| `/portal/(fullscreen)/tren` | WorkbenchShell, KanbanBoard, ViewSwitcher | WorkbenchShell (NY) |
| `/portal/(fullscreen-test)/.../gjennomfor` | LiveRepPulse, TestMatrix, GhostNumber, GoalProgress | — |

### PlayerHQ — `/portal/mal/*` (LEVENDE — skal portes, ikke kuttes)

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/portal/mal` | HubCard, GoalProgress, JourneyMap, KpiStrip | — |
| `/portal/mal/baner` (+ `/[id]`) | GalleryView, DetailHero, RoundScorecard | — |
| `/portal/mal/bygger` · `/goal/[id]` · `/leaderboard` · `/milepaeler` | GoalProgress, BadgeShelf, LevelLadder, DataTable Pro (leaderboard), PersonalBest | — |
| `/portal/mal/runder` (+ `/[id]` `/[id]/shot-by-shot` `/[id]/slag` `/ny`) | RoundScorecard, HoleStrip, ShotMap/DispersionMap, SgBreakdown, DataTable Pro | — |
| `/portal/mal/sg-hub` (+ `[club]` benchmark best-vs-now coach conditions equipment strategy yardage) | SgBreakdown, SgBar, TrendBand, GappingChart, CompareH2H, ClubMetricGrid, GapToNext | — |
| `/portal/mal/statistikk` | SgBreakdown, TrendBand, DataTable Pro, Sparkline | — |
| `/portal/mal/trackman` (+ `/[id]`) | DispersionMap, GappingChart, ClubMetricGrid, DataTable Pro | — |

---

## AgencyOS (`/admin`) — mørkt, desktop-først

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/admin/agencyos` (cockpit) | EventTimeline, InboxList, KpiStrip, InsightCard Pro, RiskHeatmap, PulseDot | InboxList (NY) |
| `/admin/agencyos/caddie` (+ `/aktivitet`) | EventTimeline, InsightCard Pro, DataTable Pro | — |
| `/admin/agencyos/uka` (7-dagers kanban) | KanbanBoard, WeekGrid, ViewSwitcher | — |
| `/admin/agencyos/live` (Mission Control — stub) | LiveRepPulse, EventTimeline, StableMatrix | — |
| `/admin/spillere` (+ `/[id]` profil/rediger/fremgang/tester/tildel-test/workbench/plan + `/ny`) | StableMatrix, DataTable Pro, ViewSwitcher, PhotoHero (detalj), SkillRadarLive, TestMatrix, GoalProgress, WorkbenchShell | WorkbenchShell (NY) |
| `/admin/stall` (hub) | HubCard, RiskHeatmap, StableMatrix | — |
| `/admin/grupper` (+ `/[id]`) | DataTable Pro, GalleryView, StableMatrix | — |
| `/admin/coach-workbench` | WorkbenchShell, ViewSwitcher, KanbanBoard, DataTable Pro | WorkbenchShell (NY) |
| `/admin/kalender` (+ `?view=maned/uke`) | MonthGrid, WeekGrid, EventTimeline, SessionScheduler | — |
| `/admin/bookinger` (+ `/ny`) | DataTable Pro, SessionScheduler, ViewSwitcher | — |
| `/admin/availability` · `/kapasitet` | HeatmapCalendar, WeekGrid, KpiStrip | — |
| `/admin/locations` · `/facilities` (+ `/[id]`) | GalleryView, DataTable Pro, DetailHero | — |
| `/admin/services` | DataTable Pro, AthleticCard | — |
| `/admin/gjennomfore` (+ `/okter/[id]`) | EventTimeline, ActionList, DetailHero, KpiStrip | — |
| `/admin/okter` (uke-oversikt) | WeekGrid, DataTable Pro, ViewSwitcher | — |
| `/admin/live/[sessionId]/brief` (+ `/active` `/summary`) | LiveRepPulse, GoalProgress, StableMatrix, PersonalBest (summary) | — |
| `/admin/recording` · `/trackman` · `/videoer` | GalleryView, DispersionMap, ClubMetricGrid, DataTable Pro | — |
| `/admin/innboks` (master-detalj) | InboxList, MessageThread, ActionList | InboxList, MessageThread (NY) |
| `/admin/kommunikasjon` (hub, faner) | ViewSwitcher, InboxList, EventTimeline, DataTable Pro | InboxList (NY) |
| `/admin/queue` · `/oppfolging` (kanban) | KanbanBoard, RiskHeatmap, ActionList | — |
| `/admin/foresporsler` | KanbanBoard, DataTable Pro, ActionList, Badge | — |
| `/admin/godkjenninger` (+ `/[id]`) | ActionList, DataTable Pro, DetailHero, Button | — |
| `/admin/godkjenn-portal` (+ koblinger/review) | DataTable Pro, GalleryView, ActionList | — |
| `/admin/plans` (+ `/[planId]` `/new`) | KanbanBoard, PeriodTimeline, ViewSwitcher, GoalProgress | — |
| `/admin/plan-templates` (+ `/[id]` rediger/effectiveness `/ny`) | GalleryView, DataTable Pro, TrendBand (effectiveness), KanbanBoard | — |
| `/admin/planlegge` (hub) | HubCard, WorkbenchShell, KanbanBoard | WorkbenchShell (NY) |
| `/admin/teknisk-plan` (+ `/[spillerId]`) | KanbanBoard, GoalProgress, InsightCard Pro | — |
| `/admin/drills` (+ `/[id]` rediger `/ny`) | GalleryView, ViewSwitcher, ChallengeCard, DataTable Pro | — |
| `/admin/tester` (+ `/[id]` `/benchmarks` `/foreslatte` `/tildel/[spillerId]`) | TestMatrix, DataTable Pro, TrendBand, PercentileGauge | — |
| `/admin/analyse` (stall-analyse) | PyramidProgress, PyramidRadar, KpiStrip, RiskHeatmap | — |
| `/admin/analysere` (+ `/compliance`) (innsikt-hub) | InsightCard Pro, SgBreakdown, DataTable Pro, TrendBand | — |
| `/admin/analytics` (bento-dashboard) | KpiStrip, KpiRing, Sparkline, TrendBand, StatTile, GhostNumber | — |
| `/admin/lag-snitt` · `/runder` · `/tilstander` · `/reports` | DataTable Pro, RoundScorecard, TrendBand, HeatmapCalendar | — |
| `/admin/talent` (+ `/[playerId]` radar/sammenligning/discovery/kohort/region/ressurser/wagr-*) | JourneyMap, LevelLadder, SkillRadarLive, CompareH2H, PercentileGauge, StableMatrix, DataTable Pro | — |
| `/admin/stats/overview` · `/moderering` | KpiStrip, DataTable Pro, ViewSwitcher | — |
| `/admin/caddie` (co-agent) | EventTimeline, InsightCard Pro, ActionList | — |
| `/admin/agents` (+ `/[agentId]`) | DataTable Pro, EventTimeline, InsightCard Pro, DetailHero | — |
| `/admin/workspace` (+ notion/oppgaver/prosjekter/tildelt-meg) | ViewSwitcher, KanbanBoard, DataTable Pro, GalleryView | — |
| `/admin/okonomi` (dashboard) | KpiStrip, TrendBand, DataTable Pro, StatTile | — |
| `/admin/organisasjon` (8 kort) | HubCard, SectionHeader | — |
| `/admin/settings` (+ api/calendar/security/tilgang) | SettingsList, DataTable Pro, ViewSwitcher | SettingsList (NY) |
| `/admin/klubb/innstillinger` | SettingsList, DataTable Pro | SettingsList (NY) |
| `/admin/team` (+ `/inviter`) | DataTable Pro, Avatar, GalleryView, Button | — |
| `/admin/integrasjoner` · `/email-templates` · `/audit-log` | DataTable Pro, EventTimeline (audit), AthleticCard | — |
| `/admin/profile` · `/mer` · `/hjelp` · `/brief` · `/reach` | PhotoHero, HubCard, EventTimeline (brief), DispersionMap (reach) | — |

---

## Forelderportal (`/forelder`) — lyst, lesemodus

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/forelder` (hjem) | PhotoHero, KpiStrip, GoalProgress, ItineraryRow, InsightCard Pro | — |
| `/forelder/barn` (+ `/[childId]`) | GalleryView, PhotoHero (profil), SkillRadarLive, GoalProgress | — |
| `/forelder/bookinger` · `/fakturaer` · `/okonomi` | DataTable Pro, ItineraryRow, KpiCard | — |
| `/forelder/ukerapport` · `/varsler` · `/innstillinger` | InsightCard Pro, EventTimeline, InboxList, SettingsList | InboxList, SettingsList (NY) |
| `/forelder/samtykke` | SettingsList, DataTable Pro, Button | SettingsList (NY) |
| `/forelder/coach` (kommer Q3 — stub) | MessageThread, EmptyState | MessageThread (NY) |

---

## Auth / Onboarding — lyst, sentrerte kort + wizards

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/auth/login` · `/signup` · `/forgot-password` · `/reset-password` · `/check-email` · `/logget-ut` | AuthCard, Button, Input, Eyebrow | AuthCard (NY) |
| `/auth/bankid` (stub) | AuthCard, EmptyState | AuthCard (NY) |
| `/auth/guardian-consent/[token]` · `/samtykke-venter` | AuthCard, SettingsList, Button | AuthCard, SettingsList (NY) |
| `/auth/onboarding` (+ `/forelder`) | WizardShell, GoalProgress (steg-indikator), Input, Button | WizardShell (NY) |
| `/onboard/coach` · `/onboard/klubb` | WizardShell, GoalProgress, Input | WizardShell (NY) |
| `/inviter/forelder/[token]` | AuthCard, Avatar, Button | AuthCard (NY) |

---

## Marketing (`/(marketing)`) — lyst, editorial

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/(marketing)` (hjemmeside) | PhotoHero, FeaturedCard, AthleticCard, TournamentCard, SectionHeader | — |
| `/(marketing)/anlegg` (+ `/[slug]`) | GalleryView, PhotoHero, DetailHero, FeaturedCard | — |
| `/(marketing)/blogg` (+ `/[slug]`) | GalleryView, PhotoHero, DetailHero, Eyebrow | — |
| `/(marketing)/booking` (+ `/[slug]` bekreft/kvittering) | SessionScheduler, AthleticCard, DetailHero, Button | — |
| `/(marketing)/cases` | GalleryView, FeaturedCard, PersonalBest, KpiStrip | — |
| `/(marketing)/coacher` (+ `/[slug]`) | GalleryView, PhotoHero, DetailHero, Avatar | — |
| `/(marketing)/coaching` (pakker) | FeaturedCard, AthleticCard, KpiCard, Button | — |
| `/(marketing)/turneringer` (+ `/[slug]`) | TournamentCard, EventTimeline, DataTable Pro | — |
| Sekundærsider (cookies/faq/jobb/junior/kontakt/om-oss/personvern/playerhq/priser/treningsfilosofi/vilkar) | PageHero, SectionHeader, AthleticCard, FeaturedCard, Button | — |

### Stats-plattform (`/(marketing)/stats`) — eget uttrykk (separat spor)

| Skjerm | Komponenter | Mangler? |
|---|---|---|
| `/stats` (hub) | PhotoHero, KpiStrip, GalleryView, TrendBand | — |
| `/stats/pga/*` · `/stats/spillere` (+ `/[slug]`) | DataTable Pro, TrendBand, SgBar, PercentileGauge, CompareH2H | — |
| `/stats/baner` (+ `/[slug]`) | GalleryView, DataTable Pro, RoundScorecard | — |
| `/stats/turneringer` (+ `/[slug]` statistikk) | TournamentCard, DataTable Pro, EventTimeline, TrendBand | — |
| `/stats/sammenlign-spillere` · `/sg-sammenlign` | CompareH2H, SkillRadarLive, SgBreakdown | — |
| `/stats/verktoy/*` (kalkulatorer) | StatTile, GhostNumber, TrendBand, Input | — |

---

## Komponenter som mangler (oppsummert)

Komponenter referert over som IKKE finnes i `design-system/components/` ennå:

| Komponent | Trengs til | Forslag |
|---|---|---|
| **InboxList** | PlayerHQ varsler/coach-melding · AgencyOS innboks/kommunikasjon/cockpit · Forelder varsler | Master-detalj liste-rad (lest/ulest, avsender, snippet). Compact data-rad i hybrid. Bør være øverst i bygge-rekkefølgen — brukes på 6+ flater. |
| **MessageThread** | PlayerHQ coach-melding/sporsmal · AgencyOS innboks · Forelder coach | Chat/tråd-visning med bobler + vedlegg. |
| **WorkbenchShell** | PlayerHQ planlegge/fullscreen-tren · AgencyOS coach-workbench/planlegge/spiller-workbench | Layout-skall (ikke ny visning) — komponerer ViewSwitcher + Kanban + PeriodTimeline. Den delte plan-kjernen. |
| **SettingsList** | `/portal/meg`-undersider · AgencyOS settings/klubb · Forelder innstillinger/samtykke · Auth consent | Innstillings-rad (label + verdi/toggle/lenke). Re-brukt på mange flater. |
| **AuthCard** | Alle auth-skjermer | Sentrert kort-skall for login/signup/invitasjon. |
| **WizardShell** | Onboarding (spiller/forelder/coach/klubb) · booking-ny | Fler-stegs skall med GoalProgress-indikator. |
| **PlanBuilderShell** | `/portal/ny-okt` (+ AgencyOS plan-bygging) | Bygge-flate for økt — kan være variant av WorkbenchShell. |
| **ShareCard** | `/portal/statistikk/runder/[runId]/del` | Delbart resultatkort (rund/PB). Lav prioritet. |

**Merknad:** `ShotMap` brukes i `/portal/mal/runder/.../shot-by-shot` — dekkes av **DispersionMap** (samme scatter-mønster), ikke egen ny komponent. Øvrige skjermer dekkes fullt av eksisterende bibliotek (~80 re-skinnede + 6 Notion-visninger + golf-data-viz + gamification + coach-komponenter).

**Prioritet for nybygg:** 1) InboxList + MessageThread (handlingssenter, mange flater). 2) WorkbenchShell + SettingsList (delt kjerne + alle innstillinger). 3) AuthCard + WizardShell (onboarding-flyt). 4) PlanBuilderShell + ShareCard (etter behov).
