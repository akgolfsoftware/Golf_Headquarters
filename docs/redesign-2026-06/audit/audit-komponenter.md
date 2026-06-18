# Audit — komponent-bibliotek (`src/components/`)

> Underlag for redesign 2026-06 (hybrid-system). Gjelder ALT under `src/components/` UNNTATT `design-system/` (det nye biblioteket — ikke vurdert her).
> Metode: filinventar + grep-basert importanalyse mot hele `src/` (inkl. `app/`). «Dead» = ingen ekte importreferanse utenfor egen mappe, barrel-`index.ts` eller demo-galleri (`intern/komponenter`, `design-system*`).
> Tall: ~700 `.tsx`-filer totalt. Sammenlignet mot `docs/redesign-2026-06/20-KOMPONENT-SPEC.md`.

---

## 1 · Inventar per mappe

### `athletic/` (core branded — 83 filer) — KILDEN til AK-DNA
**Primitiver/identitet:** avatar, badge, button, eyebrow, greeting, presence-dot, pulse-dot, status-pill, agency-tags, filter-pill-bar, pagination, tab-bar
**KPI/tall:** kpi, kpi-ring, sparkline, editorial/ghost-number
**Kort:** card, featured-card, cards/{coach-message, insight-card, partner-card, quick-action, tournament-card, wellness-card}
**Data-viz:** data-table, data/{club-metric-grid, club-metric-trend-chart, hcp-delta, hcp-trend, lphase-distribution, practice-type-distribution, pyr-dist-bar, pyramid-bar, pyramid-comparison, pyramid-distribution, pyramid-radar, round-scorecard, session-volume, sg-bar, sg-insight-card, sg-trend-line, shot-map, skill-area-bands, stat-tile, test-matrix}, pyramid-progress
**Kalender:** calendars/{compare-calendar, day-planner, heatmap-calendar, load-calendar, month-grid, period-timeline, session-scheduler, streak-calendar, week-grid, year-plan-gantt}, day-cal
**Hero:** hero, hero/{detail-hero, page-hero, photo-hero}
**Shell:** shell/{agency-sidebar, bottom-nav, live-bar, shell-wrapper, sidebar, topbar}
**Lister/handling:** action-list, queue-item, itinerary/{itinerary-list, itinerary-row, now-line}
**Editorial:** editorial/{photo-divider, section-header}
**Patterns (sammensatte):** patterns/{audit-log, consent, email-template-editor, goals-hub, import, legal, live-session, notification-center, timeline}, modals/stub-modal

### `ui/` (shadcn-primitiver — 20 filer)
breadcrumb, button, checkbox, dialog, dropdown-menu, empty-state, icon, input, kpi-card, popover, progress-bar, progress-ring, radio, select, sheet, skeleton, switch, tabs, textarea, tooltip

### `shared/` (utility/funksjonell — 64 filer)
**Layout/shell:** detail-shell, overview-shell, overview-card, page-header, fullscreen-template, sidebar-brand, ak-golf-logo
**Modaler/sheets:** modal, sheet, del-runde-modal, eksport-modal, profil-rediger-modal, golfbox-import-modal, trackman-import-modal, tier-paywall-sheet
**Toast/varsel:** toast, toast-provider, notification-bell, cookie-banner, pro-kampanje-banner
**Input/UX:** number-spinner, mic-button, copy-button, print-button, avatar-upload, smart-date (i calendar/)
**Tilstand:** empty-state, loading-skeleton
**Meny/nav:** profile-menu, user-menu, cmd-palette, mobile-bottom-nav
**View-mode:** ViewModeContext, ViewModeToggle, view-mode-toggle
**Triggere:** eksport-trigger, profil-rediger-trigger
**`shared/calendar/` (27 filer):** komplett planlegger-kalender — KalenderRoot, AarsplanView/MonthView/WeekView/DayView, SessionCard/Editor, Drill/Okt-MalLibrary, PeriodeModal, RecurringPatternEditor, GolfDrillEditor/FysDrillEditor, MyelinTracker, m.fl.

### `admin/` (AgencyOS — 83 filer, 22 undermapper)
Shell: admin-shell, agencyos-{sidebar, topbar}, agencyos-mobile-nav, admin-hero, tab-strip, split-inbox-shell.
Domene-mapper: agencyos/, bookinger/, bookings/, caddie/ (AI co-agent, 9 filer), cockpit/, coach-workbench/, compliance/, drift/, inbox/ + innboks/ (DUP), kalender/, multi-compare/, plan-templates/, player/, settings/, spiller-detalj/, spillere/, talent/, team/, tester/, turneringer/.

### `portal/` (PlayerHQ — 177 filer, 32 undermapper)
Root (41): portal-shell, nav, hero, kort (coaching/goals/tournament), modaler, pyramide, quick-actions, sg-spider, m.m.
Levende store: workbench/ (23), dashboard/ (14), analytics/ (8), coach/ (7), profile/ (7), live/ (7), home/, meg/, gjennomfore/, booking/, drills/, sg-hub/, tester/, runder/, runde-ny/, trackman/, aarsplan/, abonnement/, ai/, insight/, varsler/, innstillinger/, turnering-detalj/.

### `coachhq/` (28 filer) — EGEN coach-flate parallelt med admin/agencyos
Analytics (heatmap/trend/toggle), plan-views (card-mini, split-view, tidslinje, view-toggle), spiller-dna/fasilitet-panel, tournament-enroll-modal + `workbench/` (13: shell, tabs, paneler, caddie-chat, spiller-hero, key-metrics).

### `stats/` (28 filer) — marketing/offentlig stats-univers
Radar, heatmap, histogram, leaderboard, norgeskart, wrapped (year-in-review), quiz, trend-grafer, cmd-k. Brukes av `(marketing)/stats` + `admin/stats`.

### `sg-hub/` (15 filer) — TrackMan/SG-lab viz
DPlanePlot, SmashCurvePlot, StrikeHeatmap, GappingChart-aktige (StockYardage, ClubTrend), ConditionsSlider, ShotAnnotation, TempoRibbon, m.fl.

### Mindre familier
- `workbench/` (23) — Dir-B planlegger (kanban, tidslinje, inspector, slideover) + A-modus week/day-view.
- `workspace/` (1) — primitives.
- `auth/` (10) — login/signup/bankid/forgot/reauth + onboarding-wizard.
- `marketing/` (10) — forside, header/footer, lead-form, mockup, plausible.
- `hubs/` (5), `fys-plan/` (6), `teknisk-plan/` (7), `test-modul-v2/` (4), `turneringer/` (4), `planlegge-v2/` (5), `forelder/` (7), `onboarding/` (3), `blogg/` (3), `fremgang/` (2), `hole-analysis/` (1), `system/` (1, 404).
- `booking/` + `talent/` — KUN `.css`-fil hver, ingen `.tsx`.

---

## 2 · Duplikater & thin-wrappers

### Bekreftede thin-wrappers (bakoverkompat — slett etter migrering)
| Komponent | Status | Bruk |
|---|---|---|
| `shared/modal.tsx` | `@deprecated` thin wrapper rundt `ui/dialog` | 2 call-sites igjen |
| `shared/page-header.tsx` | wrapper | 1 call-site |
| `shared/sheet.tsx` | wrapper rundt sheet-primitiv | 3 call-sites |
| `shared/overview-shell.tsx` | thin-wrapper (nevnt i arkitektur.md) | **0 — dødt** |
| `shared/overview-card.tsx` | thin-wrapper | **0 — dødt** |

### Ekte duplikater (to implementasjoner, samme rolle)
| A | B | Vurdering |
|---|---|---|
| `shared/empty-state.tsx` | `ui/empty-state.tsx` | To ulike EmptyState. `ui/` = 0 eksterne refs (dødt), `shared/` = 56 refs (kanon). |
| `admin/inbox/` | `admin/innboks/` | To innboks-sett (no/en navn). `innboks/` er nyere 3-kolonne; `inbox/` = eldre kit. |
| `shared/ViewModeToggle` + `shared/view-mode-toggle` + `shared/ViewModeContext` | Tre view-mode-filer, overlappende | Begge toggles brukes 1 sted hver — konsolider til én. |
| `coachhq/` vs `admin/agencyos/` | To coach-flater | `coachhq/` er eldre («CoachHQ»-navn). Brukes fortsatt av `/admin/plans`, `/admin/coach-workbench`, `/admin/brief` — IKKE dødt, men kandidat for konsolidering inn i AgencyOS. |
| `coachhq/workbench/` vs `workbench/` vs `portal/workbench/` | Tre workbench-sett | Bevisst delt kjerne-idé (CLAUDE.md), men tre kodebaser. |
| `portal/sg-hub/` + top-level `sg-hub/` + root `portal/sg-spider` | SG-viz spredt | Begge sg-hub brukes; vurder samling. |
| `portal/stats/` (dødt) vs `stats/` (levende) | — | portal/stats er forlatt. |
| `portal/turneringer/` + `admin/turneringer/` + `turneringer/` | Tre turnering-sett | Ulike roller (detalj/admin/widget) — ikke ren dup, men fragmentert. |
| `athletic/data/pyramid-bar` / `pyr-dist-bar` / `pyramid-distribution` / `pyramid-comparison` / `shared/calendar/PyramideBar` | 5 pyramide-bar-varianter | Konsolider til ÉN i nytt system. |

---

## 3 · Døde komponenter (0 ekte importreferanser — grep-verifisert)

### Hele døde mapper (8 filer)
- `portal/analyse/` (2 filer) — erstattet av `portal/analysere/`-route som bruker `portal/analytics/`.
- `portal/analysere/` komponentmappe (1 fil) — route bruker `portal/analytics/`, ikke denne.
- `portal/live-okt/` (3 filer) — erstattet av `portal/live/`.
- `portal/stats/` (2 filer) — forlatt til fordel for `stats/`.

### Døde enkeltfiler
- `athletic/pagination.tsx` (kun demo-galleri)
- `athletic/queue-item.tsx`
- `athletic/modals/stub-modal.tsx`
- `athletic/data/lphase-distribution.tsx`
- `athletic/data/practice-type-distribution.tsx`
- `athletic/data/skill-area-bands.tsx`
- `athletic/calendars/compare-calendar.tsx`
- `athletic/calendars/load-calendar.tsx`
- `shared/overview-shell.tsx`
- `shared/overview-card.tsx`
- `shared/fullscreen-template.tsx`
- `ui/empty-state.tsx` (duplikat av `shared/empty-state`)

**Sum døde: ~20 filer** (8 i mapper + 12 enkeltfiler).
> NB: «kun referert fra demo-galleri/barrel» teller som dødt for produksjon, men noen eksporteres fortsatt via `athletic/index.ts` — slett eksporten samtidig som filen.

---

## 4 · Klassifisering for redesign (RE-SKIN / BYGG NY / SLETT)

### RE-SKIN (behold struktur, bytt til hybrid-tokens — spec §1)
- **athletic/** primitiver: avatar, badge, button, eyebrow, kpi, kpi-ring, sparkline, ghost-number, status-pill, presence-dot, pulse-dot, tab-bar, filter-pill-bar
- **athletic/** kort: card, featured-card, cards/* (insight, tournament, wellness, partner, coach-message, quick-action)
- **athletic/** hero/*, editorial/*, itinerary/*, action-list
- **athletic/data/** levende viz: data-table, pyramid-radar, pyramid-progress, sg-bar, sg-trend-line, hcp-trend, hcp-delta, round-scorecard, shot-map, club-metric-grid, club-metric-trend-chart, test-matrix, stat-tile, sg-insight-card, session-volume, pyramid-bar (én variant)
- **athletic/calendars/** levende: month-grid, week-grid, day-planner, session-scheduler, streak-calendar, heatmap-calendar, period-timeline, year-plan-gantt
- **athletic/shell/** + **admin/** shell + **portal/portal-shell** — re-skin chrome
- **ui/** alle primitiver (shadcn) — token-reskin, ingen strukturendring
- **stats/**, **sg-hub/** viz — re-skin (mye av spec §3-«moaten» finnes allerede her)
- **shared/calendar/** planlegger — re-skin (stor, levende investering)

### BYGG NY (mangler — se §5)
Spec §2–§6 har ~30 nye komponenter. Se manglende-liste under.

### SLETT (alle døde i §3 + utdaterte parallelle sett etter migrering)
- Alle ~20 døde filer i §3.
- Etter migrering av call-sites: thin-wrappers `shared/{modal, page-header, sheet, overview-shell, overview-card}`.
- Vurder å avvikle `coachhq/` (eldre coach-flate) når AgencyOS dekker funksjonene — migrer `/admin/plans`, `/admin/coach-workbench`, `/admin/brief` først.
- `admin/inbox/` (eldre) etter at `admin/innboks/` er kanon.
- Pyramide-bar-duplikater: behold 1, slett 4.

---

## 5 · Manglende nye komponenter (mot 20-KOMPONENT-SPEC.md)

Spec krever disse — **finnes ikke** som egne komponenter i dag (delvis dekket markert):

**§2 Data-visninger (Notion-stil):**
- `ViewSwitcher` — MANGLER (workbench/admin har ad-hoc view-toggles, ingen gjenbrukbar).
- `KanbanBoard` — DELVIS (`workbench/dir-b-kanban`, `workbench/kanban-view` finnes, men ikke generisk).
- `GalleryView` — MANGLER.
- `DataTable Pro` (gruppering/inline-sort/ekspander) — DELVIS (`athletic/data-table` er enkel).
- `EventTimeline` — DELVIS (`athletic/patterns/timeline`, `period-timeline`).
- `HeatmapCalendar` — FINNES (`athletic/calendars/heatmap-calendar`) → re-skin, ikke ny.

**§3 Golf-data-viz («moaten»):**
- `SgBreakdown` (drill-down) — DELVIS (`sg-bar` er flat).
- `DispersionMap` — DELVIS (`shot-map`, sg-hub har scatter — ikke ellipse/treffrate).
- `SkillRadarLive` (overlay/dra mål) — DELVIS (`pyramid-radar` statisk).
- `TrendBand` (benchmark-bånd) — DELVIS (`sg-trend-line`, `hcp-trend`).
- `HoleStrip` — DELVIS (`hole-analysis/`, `round-scorecard`).
- `GappingChart` — DELVIS (sg-hub `StockYardageTable`/`ClubTrendChart`).
- `PuttLab` — MANGLER (interaktiv break-lesing).

**§4 Gamification (størst gap — nesten alt MANGLER):**
- `MasteryRing`, `StreakTracker`, `BadgeShelf`, `LevelLadder` (A–K), `GoalProgress`, `JourneyMap`, `ChallengeCard`, `PersonalBest`, `PercentileGauge`, `LiveRepPulse` — **alle MANGLER**.
  (`streak-calendar` finnes, men ikke flamme/streak-tracker. `goals-hub` finnes, men ikke animert GoalProgress.)

**§5 Kunnskap & innsikt:**
- `InsightCard Pro` — DELVIS (`cards/insight-card`, `sg-insight-card` finnes — utvid).
- `CoachingTip`, `CompareH2H`, `GapToNext` — MANGLER (`admin/multi-compare` er nærmeste for H2H).

**§6 Coach-side:**
- `PlayerPipeline` — DELVIS (`admin/spillere`, men ikke board/dra).
- `RiskHeatmap` — DELVIS (`coachhq/analytics-heatmap`).
- `StableMatrix` — DELVIS (`admin/spillere/stallen-table`, `admin/tester/tester-matrix`).

**Konklusjon manglende:** Hele **gamification-laget (§4, 10 komp.)** er den største nybygg-jobben. Data-viz §3/§5/§6 er mest «oppgrader eksisterende til interaktiv» heller enn fra null.
