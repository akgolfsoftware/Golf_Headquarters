# Audit: CoachHQ — Lokasjoner

**HTML:** `screen-deck/coachhq/locations.html`
**URL:** `/admin/locations`
**Antall klikkbare elementer:** 25

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Legg til lokasjon" primary | Modal | NewLocationModal | NEI - ny modal |
| Filter-chips (Alle / Aktive / Inaktive + 4 typer) | State-change | Inline | OK |
| Søk-input i kart | Inline | LocationSearch | OK |
| Zoom +/− knapper på kart | State-change | Inline (kart-control) | OK |
| Kart-pin (~7 stk) | Popover/Modal | LocationDetailModal eller hover-popover | NEI - ny modal |
| Lokasjons-card (~7 stk) | Ny skjerm | `/admin/locations/:id` | NEI - sub-skjerm mangler |
| Pill-status (Åpen/Vedlikehold/Kun coach/Ny) | Tooltip/popover | StatusInfoPopover | NEI |

## States som må designes (utenom default)
- Hover på kart-pin (highlight + tooltip)
- Hover på cards (lift)
- Loading skeleton (kart + cards)
- Empty-state: ingen lokasjoner
- Error-state: kart-tjeneste nede
- Selected-state for valgt lokasjon
- Mobile: kart kollaps + cards-only
