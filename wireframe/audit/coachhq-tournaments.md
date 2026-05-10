# Audit: CoachHQ — Turneringer

**HTML:** `screen-deck/coachhq/tournaments.html`
**URL:** `/admin/tournaments`
**Antall klikkbare elementer:** 45

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (5 stk) | Popover | StatusFilterPopover | NEI |
| "+ Påmelding" primary | Modal | RegisterForTournamentModal | NEI - ny modal |
| Frist-rad "Påmeld stallen" / "Send påminnelse" (3 stk) | Modal | TournamentRegistrationModal / SendReminderModal | NEI - 2 nye |
| Cal-nav ‹ › knapper | State-change | Inline | OK |
| View-chips (Måned/Liste/Sesong) | State-change | Inline | OK |
| Cal-event blokk (~6 stk turneringer) | Drawer-toggle | TournamentDetailDrawer | OK |
| Spiller-lane chip (5 stk) | State-change | Inline | OK |
| Lane-event på spiller-track (~25 stk små markører) | Tooltip | TournamentMarkerPopover | NEI |
| Drawer-close × | State-change | Inline | OK |
| Tabellrad spiller i drawer (5 stk) | Ny skjerm | `/admin/elever/:id` | OK |
| Logistikk-card (4 stk) i drawer | Modal | LogisticsEditModal | NEI - ny modal |
| Tournament-agent "Trekk" / "Vent 3d" | Modal | (approvals modal) | OK (#16) |
| Drawer "Send foreldre-info" primary | Modal | SendParentInfoModal | NEI - ny modal |
| Drawer "Eksporter startlister" | Popover/direct | ExportMenu (PDF) | NEI |
| Drawer "Last opp innbydelse" | Modal | UploadInvitationModal | NEI - ny modal |
| Drawer "Se full plan →" | Ny skjerm | `/admin/plans/:id` | OK |

## States som må designes (utenom default)
- Hover på cal-event (highlight)
- Selected event (drawer åpen)
- Loading skeleton kalender + lanes
- Empty-state: ingen turneringer denne måneden
- Frist-countdown (Frist 3d → akutt rød)
- Lane-skip-state (skadet/trukket - rødt)
- Future-lane-event (lavere opacity)
