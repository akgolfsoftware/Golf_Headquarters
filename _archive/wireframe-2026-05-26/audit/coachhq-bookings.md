# Audit: CoachHQ — Bookinger

**HTML:** `screen-deck/coachhq/bookings.html`
**URL:** `/admin/bookings`
**Antall klikkbare elementer:** 50

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny booking" primary | Modal | BookSessionModal | OK (#11) |
| Mini-week-strip (8 uker) | State-change | Naviger | OK |
| Cal-nav ‹ › knapper | State-change | Inline | OK |
| "I dag" chip | State-change | Naviger | OK |
| View-chips (Dag/Uke/Måned) | State-change | Inline | OK |
| Color-by-row (Coach/Type/Status/Spiller-tier, 4 stk) | State-change | Inline | OK |
| Coach-filter-chips (3) + Lokasjon-chips (3) | State-change | Inline | OK |
| Week-event blokk (~25 stk) | Drawer-toggle | BookingDetailDrawer | OK (drawer) |
| Empty/ledig slot click ("+ Ledig slot") | Modal | NewBookingModal | OK (#11) |
| Drag-drop event (flytte tid) | State-change | RescheduleBookingModal | OK (#12) |
| Drawer "Marker som ferdig" | Direct + toast | Save | OK |
| "Bare denne / Hele serien / Hopp over" (recurring) | Modal | EditRecurringBookingModal | NEI - ny modal |
| "Send påminnelse" / "Avlys" | Modal | SendReminderModal / ConfirmCancelModal | NEI |
| Player-rad i drawer | Ny skjerm | `/admin/elever/:id` | OK |
| "+ Legg til spiller" link | Modal | AddPlayerToBookingModal | NEI |
| Smart-forslag "Book" per rad (3 stk) | Direct + toast | Direct booking-action | OK |
| "Book alle tre →" link | Modal | BulkBookConfirmModal | NEI - ny modal |

## States som må designes (utenom default)
- Drag-state for event (lift, ghost)
- Conflict-state (rød ramp): dobbelbooking
- Selected event (3px accent)
- Loading skeleton kalender
- Empty-state: ingen bookinger denne uka
- Now-line live
- Recurring-marker
- Time-slot hover ("+" pluss)
- Smart-forslag pulse (AI-badge)
