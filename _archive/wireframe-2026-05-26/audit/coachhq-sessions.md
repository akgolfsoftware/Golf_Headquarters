# Audit: CoachHQ — Økter (Sessions)

**HTML:** `screen-deck/coachhq/sessions.html`
**URL:** `/admin/sessions`
**Antall klikkbare elementer:** 50

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (5 stk) | Popover | StatusFilterPopover | NEI |
| "+ Ny økt" primary | Modal | NewSessionModal | NEI - ny modal |
| Mini-week-strip (8 uker, klikkbar) | State-change | Naviger til uke | OK |
| Cal-nav ‹ › knapper | State-change | Inline | OK |
| "I dag" chip | State-change | Naviger | OK |
| View-chips (Dag/Uke/Måned) | State-change | Inline | OK |
| Coach-filter-chips (Anders/Andre/Julie) | State-change | Inline | OK |
| Type-chips (Privat/Gruppe/Camp) | State-change | Inline | OK |
| Pyramide-chips (FYS/TEK/SLAG/SPILL/TURN, 5 stk) | State-change | Inline | OK |
| Week-event blokk (~25 stk) | Drawer-toggle | SessionDetailDrawer | OK (drawer) |
| Empty time-slot click | Modal | NewSessionModal (pre-fylt tid) | NEI |
| Drag-drop event for å flytte | State-change | Inline + ConfirmReschedule | OK (drag) |
| Drawer-close × | State-change | Inline | OK |
| Drawer "Marker ferdig" primary | Direct | Save + toast | OK |
| "Bare denne / Hele serien / Hopp over" (3 stk recurring-actions) | Modal | EditRecurringSessionModal | NEI - ny modal |
| "Send påminnelse" / "Avlys" | Modal | SendReminderModal / ConfirmCancelModal | NEI - 2 nye |
| Player-rad i drawer (4 stk) | Ny skjerm | `/admin/elever/:id` | OK |

## States som må designes (utenom default)
- Drag-state for event-blokk
- Selected event (3px accent border)
- Conflict-state (rød ramp): dobbelbooking
- Loading skeleton for kalender
- Empty-state: ingen økter denne uka
- Error: kalendar-API feilet
- Now-line live-update
- Recurring-marker visualisering
- Time-slot hover (pluss-ikon "+ ny økt")
