# Audit: CoachHQ — Treningsplaner (Plans)

**HTML:** `screen-deck/coachhq/plans.html`
**URL:** `/admin/plans`
**Antall klikkbare elementer:** 36

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny plan" primary | Modal | NewPlanModal (4-step wizard) | OK (#1) |
| Søk-input | Inline | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| Filter-chips (Alle/Mine spillere/Per coach + 3 A-kat) | State-change | Inline | OK |
| "Per coach" chip | Popover | CoachFilterPopover | NEI |
| Plan-card kanban (~10 stk synlige + "+18 til") | Drawer-toggle | Plan-detail (drawer) | OK |
| Drag-drop kort mellom kolonner (Aktiv/Utløper/Arkivert) | State-change | Inline | OK |
| "+ Vis 18 planer til" | State-change | Load-more | OK |
| "Se alle arkiverte (12) →" | Ny skjerm | `/admin/plans/archived` | NEI - sub-skjerm mangler |
| Drawer "Endre" / "Forleng" | Modal | EditPlanModal / ExtendPlanModal | OK (#2) / NEI |
| Drawer "Avslutt plan" | Modal | ConfirmEndPlanModal | NEI - confirm |
| Drawer "Se full plan-detalj →" | Ny skjerm | `/admin/plans/:id` | OK |
| AI-icon (impliseres ved Plan-mal-velger) | Modal | AIPlanGeneratorModal | OK (#5) |
| Mal-velger | Modal | TemplateSelectorModal | OK (#6) |

## States som må designes (utenom default)
- Drag-state for kort
- Drop-zone highlight
- Loading skeleton kanban
- Empty per kolonne
- "Utløper snart" warning ramp
- Selected-state for valgt plan
- Bulk-select mode (multi-velg)
- Konflikt: spiller har overlappende planer
