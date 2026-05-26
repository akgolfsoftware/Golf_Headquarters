# Audit: CoachHQ — Analytics v2 (stallen samlet)

**HTML:** `screen-deck/coachhq/analytics-v2.html`
**URL:** `/admin/analytics/v2`
**Antall klikkbare elementer:** 28

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip (4 stk filter-summery) | Popover | StatusFilterPopover | NEI |
| "Eksporter rapport" | Popover | ExportMenu (PDF/CSV/JSON) | NEI |
| "Send ukesbrief" primary | Modal | SendWeeklyBriefModal | NEI - ny modal |
| Stat-rich-card (4 stk SG total/Treningsindeks/etc) | Drill-down | StatDetailDrawer | NEI |
| Pyramide-bars stallen | Drill-down | PyramidTierDetailDrawer | NEI |
| Talent-pipeline-kategori (A1-A5, 5 stk) | Ny skjerm | `/admin/talent` (filtered) | OK |
| Tabellrad spiller (topp/risiko-liste) | Ny skjerm | `/admin/elever/:id` | OK |
| Filter-chips (mest sannsynlig periode/gruppering) | State-change | Inline | OK |

## States som må designes (utenom default)
- Hover på alle stat-cards (lift)
- Loading skeleton for hele dashboardet
- Empty-state: <5 spillere
- Error-state: aggregat-feilet
- Tooltip på spark-line (hover viser uke-tall)
- Real-time pulse på "nye signaler i natt" (badge)
- Disabled-state for "Send ukesbrief" hvis ikke nok data
