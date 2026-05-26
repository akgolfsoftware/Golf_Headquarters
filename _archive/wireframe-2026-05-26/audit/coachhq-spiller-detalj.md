# Audit: CoachHQ — Spiller-detalj (light)

**HTML:** `screen-deck/coachhq/spiller-detalj.html`
**URL:** `/admin/elever/:id/light`
**Antall klikkbare elementer:** 27

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| "Se 360-profil" link | Ny skjerm | `/admin/elever/:id` | OK |
| "Book økt" primary | Modal | BookSessionModal | OK (#11) |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| Tab-rad (6 stk: Status/Plan/Sessions/Tester/Tournaments/Notater) | State-change | Inline | OK |
| Stat-rich-card (4 stk: HCP/SG/Økter/Plan-fremdrift) | Drill-down | StatDetailDrawer | NEI |
| Pyramide-tier (5 lag) | Drill-down | PyramidTierDetailDrawer | NEI |
| Heatmap-celle (20+ stk) | Tooltip | HeatmapCellPopover | NEI |
| "Åpne plan →" primary i card | Ny skjerm | `/admin/plans/:id` | OK |
| Agent-strip "Avvis" / "Godkjenn" | Modal | (approvals modal) | OK (#16) |
| Drawer-close × | State-change | Inline | OK |
| Quick-action "Send melding" | Modal | SendMessageModal | NEI - ny modal (compose) |
| Quick-action "Book økt" | Modal | BookSessionModal | OK (#11) |
| Quick-action "Endre plan" | Ny skjerm | `/admin/plans/:id/edit` | OK |
| Quick-action "Endre kategori" | Modal | ChangeCategoryModal | NEI |
| Quick-action "Marker skadet" | Modal | MarkInjuredModal | NEI - ny modal |
| Foreldre-rad (telefon klikkbar) | Direct (tel:) | Phone-link | OK |
| "Send foreldre-oppdatering" | Modal | SendParentUpdateModal | NEI - ny modal |

## States som må designes (utenom default)
- Hover på quick-actions
- Loading skeleton
- Empty-state: ny spiller uten data
- Pulse for "aktiv nå"
- Skadet-state warning ramp
- Notat-card hover
