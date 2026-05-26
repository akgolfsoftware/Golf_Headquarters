# Audit: CoachHQ — Økonomi (Finance)

**HTML:** `screen-deck/coachhq/finance.html`
**URL:** `/admin/finance`
**Antall klikkbare elementer:** 19

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Periode-chips (Mai 2026 / YTD / Sammenlign år) | State-change | Inline | OK |
| "Eksporter til Tripletex" chip | Modal | TripletexExportModal | NEI - ny modal |
| "Send purring" chip | Modal | BulkRemindModal | NEI - ny modal |
| Bar-graph månedsinntekt (12 søyler) | Tooltip | MonthDetailPopover | NEI |
| "Send batch-purring →" link | Modal | BulkRemindModal | NEI |
| "Purr" per faktura-rad (2 stk) | Modal | SendReminderModal | NEI - ny modal |
| Tabellrad faktura | Modal | InvoiceDetailModal | NEI - ny modal |
| Card "Likviditet" / "MVA-skyldig" / "Forventet juni" | Drill-down | StatDetailDrawer | NEI |

## States som må designes (utenom default)
- Hover på bar-graph (tooltip per måned)
- Empty-state: ingen utestående
- Loading skeleton for KPI-strip
- Error-state: regnskaps-API feilet
- Pill-status: 14 dager / 21 dager (rød ramp)
- Toast: "Purring sendt til 2 kunder"
