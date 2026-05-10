# Audit: CoachHQ — Plan-redigering

**HTML:** `screen-deck/coachhq/plan-edit.html`
**URL:** `/admin/plans/:id/edit`
**Antall klikkbare elementer:** 36

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Versjonshistorikk" knapp | Modal | PlanVersionHistoryModal | NEI - ny modal |
| "Lagre alle endringer" primary | Direct + toast | Save | OK |
| Tab-rad (Faser/Økter/Pyramide/Tester/Mål, 5 stk) | State-change | Inline tab-bytte | OK |
| Fase-card editable (5 stk) | Drawer-toggle | Inline drawer-edit (fase 3 i drawer) | OK |
| "+ Legg til ny fase" | Modal | NewPhaseModal | NEI - ny modal |
| Agent-forslag-strip "Avvis"/"Godkjenn" | Modal | (samme som approvals) | OK (#16) |
| Drawer-close × | State-change | Inline | OK |
| Form-input felter i drawer (datoer, %, tekstarea) | Inline edit | InlineEditField | OK |
| Slider-bars (5 stk pyramide) | State-change | Inline drag | OK (drag) |
| Toggle-pills (2 stk: Aktiver agent, Auto-godkjenn) | State-change | Inline | OK |
| "Lagre endringer" i drawer | Direct | Save | OK |
| "Slett fase" i drawer | Modal | ConfirmDelete | OK |

## States som må designes (utenom default)
- Selected-state for fase (outline accent)
- Drag-state for slider
- Validation-state: sum != 100% (rød border)
- Loading skeleton for plan
- Error: konflikt med booket økt
- Save-spinner i primary CTA
- Disabled "Lagre" når ingen endringer
- Versjons-diff visning ved historikk-modal
