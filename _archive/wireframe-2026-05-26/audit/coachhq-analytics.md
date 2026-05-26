# Audit: CoachHQ — Analytics

**HTML:** `screen-deck/coachhq/analytics.html`
**URL:** `/admin/analytics`
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Tidsperiode-chips (Siste 30d / 90d / Sesong / Fra–til) | State-change | Inline | OK |
| "Fra–til" chip | Popover | DateRangePicker | NEI |
| "Alle spillere (38)" chip | Popover | PlayerSelectorPopover | NEI |
| "Sammenlign grupper" chip | Modal | GroupCompareModal | NEI |
| "Eksporter PDF" chip | Popover/direct | ExportMenu | NEI |
| "Drill ned →" (SG-fordeling) | Ny skjerm | `/admin/analytics/sg` | NEI - sub-skjerm mangler |
| "Se talent →" (Talent-pipeline) | Ny skjerm | `/admin/talent` | OK |
| Pyramide-tier (5 lag, klikkbare) | Drill-down | PyramidTierDetailDrawer | NEI |
| Topp 5-spillerrad (5 stk) | Ny skjerm | `/admin/elever/:id` | OK |

## States som må designes (utenom default)
- Hover på SG-bars (tooltip)
- Loading skeleton for grafikk
- Empty-state: ingen data i valgt periode
- Error-state: feilet analytics-fetch
- Active chip-state
- Periode-velger validering (max range)
