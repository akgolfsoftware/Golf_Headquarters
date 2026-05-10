# Audit: CoachHQ — Fasiliteter

**HTML:** `screen-deck/coachhq/facilities.html`
**URL:** `/admin/facilities`
**Antall klikkbare elementer:** 35

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny fasilitet" primary | Modal | NewFacilityModal | NEI - ny modal |
| Lokasjon-chips (5 stk + 4 type-chips) | State-change | Inline | OK |
| Live "akkurat nå"-card (3 stk pågående økter) | Modal eller skjerm | SessionDetailModal / `/admin/sessions/:id` | OK |
| Fasilitet-card (~16 stk) | Modal | FacilityDetailModal (side-panel) | OK (#13) |
| Bar-segment i kapasitetsstrip (mange stk) | Tooltip | TimeSlotTooltip | NEI |
| "Ledig nå" / "I bruk" / "Vedlikehold" pill | Tooltip | StatusInfoPopover | NEI |
| Greenfee-pill | Modal | BookGreenfeeModal | NEI - ny modal |
| Lokasjon-section-header "Mulligan" / "Bossum" osv | Ny skjerm | `/admin/locations/:id` | NEI - sub mangler |

## States som må designes (utenom default)
- Hover på cards (lift)
- Loading skeleton
- Empty: ingen fasiliteter
- Live "ÅPEN" pulse
- Konflikt-state (overlappende booking)
- Filter-active per chip
- Real-time update av status-pill
- Klikk-bar bar-segment for direkte booking
