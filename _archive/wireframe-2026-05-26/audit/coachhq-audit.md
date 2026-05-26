# Audit: CoachHQ — Revisjonslogg (Audit)

**HTML:** `screen-deck/coachhq/audit.html`
**URL:** `/admin/audit`
**Antall klikkbare elementer:** 21

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Chip "Alle / Login / Endring / Sletting / Eksport / Siste 24t / Siste 7d / Egen periode" (8 stk) | State-change | Inline filter | OK |
| "Egen periode" chip | Popover | DateRangePicker | NEI |
| "Eksporter CSV" knapp | Modal eller direct-action | ExportMenu / direkte CSV | NEI - ny popover |
| Tabellrad (klikkbar audit-event) | Modal | AuditEventDetailModal | NEI - ny modal |

## States som må designes (utenom default)
- Hover på rader (highlight)
- Empty-state: ingen events i valgt periode
- Loading skeleton for tabell
- Error-state: feilet logg-fetch
- Active filter-state for chip
- Pagination/load-more bunn av tabell
- Klikk-bar IP-adresse (kopier-popover)
