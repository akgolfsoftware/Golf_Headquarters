# Komponentbibliotek + GAP-analyse

> Verifisert via `ls src/components/{athletic,ui,shared}/`. READ-ONLY.

## Eksisterende bibliotek

### `src/components/athletic/` (branded — AK-DNA, 40 entries)
**Primitiver/innhold:** `button` · `badge` · `avatar` · `card` · `featured-card` · `data-card` ·
`kpi` · `kpi-grid` · `kpi-ring` · `eyebrow` · `greeting` · `logo` · `status-pill` · `pulse-dot` ·
`presence-dot` · `pyramid-progress` · `action-list` · `queue-item` · `filter-pill-bar` · `tab-bar` ·
`pagination` · `ticker` · `sparkline` · `day-cal` · `agency-tags`
**Sub-mapper:** `calendars/` (måned/uke/dag/gantt/streak/heatmap) · `cards/` · `data/` · `editorial/` ·
`hero/` (+ `hero.tsx`) · `itinerary/` · `modals/` · `patterns/` · `shell/` · `hooks/`

### `src/components/ui/` (shadcn-primitiver, 22)
`button` · `input` · `textarea` · `select` · `checkbox` · `radio` · `switch` · `tabs` · `dialog` ·
`sheet` · `popover` · `dropdown-menu` · `tooltip` · `breadcrumb` · `progress-bar` · `progress-ring` ·
`skeleton` · `empty-state` · `kpi-card` · `icon` · `toast`

### `src/components/shared/` (utility, 38)
`modal` · `sheet` · `page-header` · `detail-shell` · `overview-shell` · `overview-card` ·
`cmd-palette` · `cookie-banner` · `notification-bell` · `user-menu` · `profile-menu` · `sidebar-brand` ·
`view-mode-toggle` · `loading-skeleton` · `empty-state` · `copy-button` · `print-button` ·
`number-spinner` · `mic-button` · `avatar-upload` · diverse modaler (`del-runde`, `eksport`,
`golfbox-import`, `trackman-import`, `profil-rediger`) · `tier-paywall-sheet` · `pro-kampanje-banner` ·
`fullscreen-template` · `calendar/`

## GAP — hva mangler for verdensklasse + de tre prioriterte områdene

### A. Data-visualisering (for stats-funnelen — størst gap)
| Komponent | Status | Trengs til |
|---|---|---|
| `sparkline` | ✅ finnes (`athletic/sparkline`) | mini-trender |
| Fordelings-/violin-radar | **MANGLER** | benchmark-fordeling per SG-kategori |
| **Benchmark-scrubber** (dra nivå → percentil) | **MANGLER** | stats-funnel-kroken |
| Approach-varmestige (avstandsbøtter) | **MANGLER** | innspill-benchmark |
| SG-elv / flow | **MANGLER** | hvor slag vinnes/tapes |
| Heatmap | finnes i `athletic/calendars/heatmap` + `stats/stats-heatmap` | gjenbrukes |
| Histogram/fordeling | `stats/stats-histogram` | gjenbrukes/utvides |
| Range-slider | `stats/stats-range-slider` | basis for scrubber |
| Stort spillerkort («trading card», delbart) | **MANGLER** (har `stats-leaderboard-card`) | sosialt/funnel |

> NB: `src/components/stats/` har et eget rikt sett (big-radar, histogram, range-slider, trend-graf,
> norgeskart, kohort-linjegraf, wrapped-slide) — basis for flere av de manglende.

### B. AgencyOS mobil (nest størst gap)
AgencyOS-komponentene er bygget for desktop/data-tett. **Mangler mobil-varianter:** mobil bunnbar for
coach, mobil-skuff (drawer-nav), kompakte kort-lister for Cockpit/Stall/Innboks på smal skjerm.
(PlayerHQ har `athletic/tab-bar` + `shared/sheet` — coach trenger tilsvarende mobil-IA.)

### C. PlayerHQ-undersider
Primitivene finnes; det som mangler er **sammensatte mønstre** for de udesignede undersidene
(mål-hub/bygger, teknisk plan, SG-Hub-subs, coach-seksjon, talent) — bygges av eksisterende kort/kpi/faner.

## Kalender- og tidslinje-komponenter (eksplisitt enumerert)

Kalender/tidslinje brukes i **57 filer** — et eget delsystem, ikke et hull. Verifisert via
`ls src/components/athletic/calendars/` + `src/components/shared/calendar/`.

### Eksisterende — `athletic/calendars/` (11, branded primitiver)
`month-grid` · `week-grid` · `day-planner` · `year-plan-gantt` (Gantt/årsplan) ·
`period-timeline` (periodisering-tidslinje) · `session-scheduler` · `streak-calendar` ·
`heatmap-calendar` · `compare-calendar` · `load-calendar` · `index`

### Eksisterende — `shared/calendar/` (28, sammensatt kalender-app)
`KalenderRoot` · `CalendarShell` · `MonthView` · `WeekView` · `DayView` · `AarsplanView` ·
`MiniCalendar` · `SessionCard` · `SessionEditor` · `PeriodeModal` · `RecurringPatternEditor` ·
`QuickAddPopover` · `SmartDateInput` · `TurneringMarker` · `CapacityLoadBar` · `PyramideBar` ·
`PlanSidebar` · drill/mal-editorer (`GolfDrillEditor`, `FysDrillEditor`, `DrillMalLibrary`, `OktMalLibrary`) ·
`LockedAnchorEditor` · `ConditionalRulesPanel` · `PeriodVolumeRecipeEditor` · `MyelinTracker` · `PortalKalenderWrapper`

### Tidslinje-/kalender-BERØRINGSPUNKTER (hvor de må fungere — design-behov)
| Flate · skjerm | Behov | Komponent i dag |
|---|---|---|
| PlayerHQ Workbench (zoom: årsplan→år→måned→uke→dag) | 5 zoom-nivåer + Gantt | `year-plan-gantt`, `month-grid`, `week-grid` (time-grid `UkeView`), `day-planner` |
| PlayerHQ Workbench uke (time-grid 07–22, dra-drop, overlapp-lanes) | vertikal time-akse | `UkeView` (workbench-hybrid) |
| AgencyOS Kalender (uke/måned) | coach-kalender | `KalenderRoot`, `WeekView`, `MonthView` |
| PlayerHQ Kalender / Gjennomføre | spiller-kalender | `PortalKalenderWrapper`, `MiniCalendar` |
| Periodisering / sesongplan | makro-tidslinje (faser) | `period-timeline`, `AarsplanView`, `year-plan-gantt` |
| Live-økt / Dag | tidslinje for dagens økter | `day-planner`, `DayView` |
| Streak / aktivitet | streak + heatmap | `streak-calendar`, `heatmap-calendar` |
| Turneringskalender | turneringer på tidsakse | `TurneringMarker`, gantt |

### Gap (kalender/tidslinje)
- **AgencyOS mobil-kalender:** kalenderne er desktop-tette → trenger mobil-variant (kompakt uke/dag-liste).
- **Konsistens:** to kalender-sett (`athletic/calendars` vs `shared/calendar`) — designsystemet bør avklare ÉN kanonisk visuell stil for alle kalender/tidslinje-flater.
- Resten (Gantt, time-grid, period-timeline, streak/heatmap) finnes — gjenbruk, ikke nybygg.

## Anbefaling
1. Bygg **3 nye data-viz-komponenter** først (benchmark-scrubber, fordelings-radar, approach-varmestige)
   — de driver stats-funnelen og gjenbrukes i PlayerHQ SG-Hub.
2. Lag **AgencyOS mobil-IA** (bunnbar + skuff) som egne komponenter.
3. Resten er komposisjon av eksisterende bibliotek.
