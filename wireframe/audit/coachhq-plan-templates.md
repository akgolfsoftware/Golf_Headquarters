# Audit: CoachHQ — Plan-maler

**HTML:** `screen-deck/coachhq/plan-templates.html`
**URL:** `/admin/plans/templates`
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (3 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny mal" primary | Modal | NewPlanTemplateModal | NEI - ny modal |
| Søk-input | Inline filter | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| Kategori-chips (7 stk: Alle/Junior/Senior/Elite/Off-season/Konkurranse-prep/Bjaavann-spesifikk) | State-change | Inline | OK |
| Mal-card (~8 stk) | Modal/skjerm | PlanTemplateDetailModal eller `/admin/plans/templates/:id` | NEI - ny modal |
| Card-pill "Brukt på X spillere" | Popover | TemplateUsagePopover | NEI |
| Card row-meny ("...") (impliseres) | Popover | RowActionsMenu (Dupliser/Eksporter/Arkiver) | NEI |

## States som må designes (utenom default)
- Hover på cards (lift)
- Loading skeleton
- Empty-state: ingen maler i kategori
- Apply-template-modal (velg spiller for bruk av mal)
- Confirm før sletting av brukt mal (med advarsel om aktive planer)
- Versjons-historikk for mal
