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

## Anbefaling
1. Bygg **3 nye data-viz-komponenter** først (benchmark-scrubber, fordelings-radar, approach-varmestige)
   — de driver stats-funnelen og gjenbrukes i PlayerHQ SG-Hub.
2. Lag **AgencyOS mobil-IA** (bunnbar + skuff) som egne komponenter.
3. Resten er komposisjon av eksisterende bibliotek.
