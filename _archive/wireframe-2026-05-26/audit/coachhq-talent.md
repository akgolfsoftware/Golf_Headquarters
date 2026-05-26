# Audit: CoachHQ — Talent-pipeline

**HTML:** `screen-deck/coachhq/talent.html`
**URL:** `/admin/talent`
**Antall klikkbare elementer:** 45

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Eksporter" | Popover | ExportMenu | NEI |
| "+ Manuell endring" primary | Modal | ManualPromoteModal | NEI - ny modal |
| Tab-rad (5 stk: Pipeline/Promosjoner/Risiko/Talent-tester/Historikk) | State-change | Inline | OK |
| Talent-kort (~14 stk synlige + "+X til") | Drawer-toggle | TalentDetailDrawer | OK (drawer) |
| "Detalj" knapp per kort | Ny skjerm | `/admin/elever/:id` | OK |
| "Endre" knapp per kort | Modal | ChangeCategoryModal | NEI - ny modal |
| "+X til" placeholder-card | State-change | Expand kolonne (load all) | OK |
| Drag-drop kort mellom A-kategorier | State-change | Inline (med agent-warning) | OK |
| Drawer-close × | State-change | Inline | OK |
| "Godkjenn promotion til A1" | Modal | ConfirmPromotionModal | NEI - ny confirm |
| "Utsett · vurder neste mnd" | Direct | State-change + toast | OK |
| "Se 360-profil →" | Ny skjerm | `/admin/elever/:id` | OK |

## States som må designes (utenom default)
- Drag-state for kort
- Drop-zone highlight per kolonne
- Promo-kandidat highlight (accent strip)
- Risiko-warning-state (warning ramp)
- Selected-state for kort (currently i drawer)
- Loading skeleton for kanban
- Empty-state per A-kategori
- Tooltip på pyramide-tier i drawer
