# Audit: CoachHQ — Grupper

**HTML:** `screen-deck/coachhq/groups.html`
**URL:** `/admin/groups`
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny gruppe" primary | Modal | NewGroupModal | NEI - ny modal |
| Søk-input | Inline filter | Live-search | OK |
| Sort-select dropdown | Dropdown | SortDropdown | NEI (native) |
| Filter-chips (Aktive / Arkiverte + 4 nivåer) | State-change | Inline | OK |
| Gruppe-card (6 stk) | Modal eller skjerm | GroupDetailModal eller `/admin/groups/:id` | NEI - ny modal |
| Avatar-stack (klikkbar) | Popover | MembersPopover | NEI |
| Pill "Venter X spillere" | Modal | PendingPlayersModal | NEI - ny modal |

## States som må designes (utenom default)
- Hover på cards (lift)
- Loading skeleton for grid
- Empty-state: ingen grupper
- Avatar-stack hover (utvid til full liste)
- Drag-drop spillere mellom grupper (mobile-spesifikk)
- Confirm før arkivering av gruppe
