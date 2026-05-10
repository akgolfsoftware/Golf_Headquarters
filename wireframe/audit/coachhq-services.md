# Audit: CoachHQ — Tjenester (Services)

**HTML:** `screen-deck/coachhq/services.html`
**URL:** `/admin/services`
**Antall klikkbare elementer:** 30

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Søk-input | Inline filter | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native select) |
| Filter-chips (Aktive/Inaktive + 4 kategorier) | State-change | Inline | OK |
| "+ Ny tjeneste" primary | Modal | NewServiceModal | NEI - ny modal |
| Action-strip-items (4 stk summary) | Popover/inline | StatusFilterPopover | NEI |
| Tjeneste-card (~9 stk) | Modal eller skjerm | ServiceDetailModal eller `/admin/services/:id` | NEI - ny modal |
| "Aktiv" toggle per card | State-change | Inline (toggle med toast) | OK |

## States som må designes (utenom default)
- Hover på cards (lift)
- Toggle-state aktiv/inaktiv (visuell)
- Loading skeleton for grid
- Empty-state: ingen tjenester
- Error-state: feilet ved toggle
- Toast: "Tjeneste deaktivert" / "aktivert"
- Confirm før deaktivering hvis aktive bookinger
