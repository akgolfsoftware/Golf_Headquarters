# Audit: CoachHQ — Rapporter

**HTML:** `screen-deck/coachhq/reports.html`
**URL:** `/admin/reports`
**Antall klikkbare elementer:** 23

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (3 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny rapport" primary | Modal | NewReportModal | NEI - ny modal (wizard) |
| Søk-input | Inline filter | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| Type-chips (Alle / Spiller / Periode / Tournament / Økonomi) | State-change | Inline | OK |
| Rapport-card (~8 stk) | Modal | ReportPreviewModal | NEI - ny modal |
| "Last ned" per card | Direct download | PDF/CSV download | OK |
| Format-pill (PDF/CSV) | Tooltip | FormatInfoPopover | NEI |

## States som må designes (utenom default)
- Hover på cards (lift)
- Loading skeleton for grid
- Empty-state: ingen rapporter generert
- Error-state: PDF-generering feilet
- Spinner i "Last ned" mens fil pakkes
- Sjablong-rapport-status (auto-generert)
- Schedule-rapport-modal (sett opp gjentakelse)
