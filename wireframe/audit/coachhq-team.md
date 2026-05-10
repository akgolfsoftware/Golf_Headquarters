# Audit: CoachHQ — Team

**HTML:** `screen-deck/coachhq/team.html`
**URL:** `/admin/team`
**Antall klikkbare elementer:** 28

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "+ Inviter coach" primary | Modal | InviteCoachModal | NEI - ny modal |
| Filter-chips (Aktive/Inviterte + 4 roller) | State-change | Inline | OK |
| Coach-card (4 stk) | Drawer-toggle | TeamMemberDrawer | OK |
| "Send melding →" per card (3 stk) | Modal | SendMessageModal | NEI |
| "Send påminnelse" (invited) | Direct + toast | Send-action | OK |
| "Trekk invitasjon" (invited) | Modal | ConfirmRevokeInviteModal | NEI - ny confirm |
| Drawer-close × | State-change | Inline | OK |
| "Send melding" primary i drawer | Modal | SendMessageModal | NEI |
| "Tillatelser" / "Kalender" i drawer | Ny skjerm | `/admin/team/:id/permissions` / `/admin/team/:id/calendar` | NEI - sub mangler |
| "Se full coach-profil →" | Ny skjerm | `/admin/profile/:id` (for andre coach) | NEI - sub mangler |
| Status-pill (Online/Aktiv/Borte/Invitert) | Tooltip | StatusInfoPopover | NEI |

## States som må designes (utenom default)
- Hover på cards (lift)
- Loading skeleton
- Empty-state: bare deg selv
- Invited-card distinct styling
- Online/borte/aktiv pulse
- Disabled card for inviterte (grå avatar)
