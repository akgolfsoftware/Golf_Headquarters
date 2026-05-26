# Audit: CoachHQ — Lag-snitt

**HTML:** `screen-deck/coachhq/lag-snitt.html`
**URL:** `/admin/lag-snitt`
**Antall klikkbare elementer:** 23

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Eksporter rapport" | Popover | ExportMenu | NEI |
| Tab-rad (5 stk: Pyramide/SG/Tester/Plan-adherence/Demografi) | State-change | Inline | OK |
| Matrise-rad gruppe (6 stk klikkbar) | Drawer-toggle | GroupCompareDrawer | OK |
| Avatar-stack i matrise-rad | Popover | MembersPopover | NEI |
| Drawer-close × | State-change | Inline | OK |
| Donut-segment (klikkbar) | Drill-down | PyramidTierDetailDrawer | NEI |
| Top-3-spillerrad i drawer (3 stk) | Ny skjerm | `/admin/elever/:id` | OK |
| Sammenlign-chips i drawer (4 stk + "+ legg til") | State-change | Inline | OK |
| "+ legg til" chip i drawer | Popover | AddCompareGroupPopover | NEI |
| "Åpne gruppe-detalj" primary | Ny skjerm | `/admin/groups/:id` | NEI - sub mangler |
| "Eksporter sammenligning" | Popover | ExportMenu | NEI |

## States som må designes (utenom default)
- Hover på matrise-rad
- Selected-state (currently 3px accent)
- Loading skeleton matrise
- Tooltip på hver matrise-celle (eksakt verdi + delta)
- Sort-toggle på kolonne-header (FYS/TEK osv.)
- Empty-state: <2 grupper for sammenligning
