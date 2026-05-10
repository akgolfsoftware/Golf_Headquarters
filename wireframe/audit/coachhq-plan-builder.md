# Audit: CoachHQ — Plan-builder (Ny plan-wizard)

**HTML:** `screen-deck/coachhq/plan-builder.html`
**URL:** `/admin/plans/new`
**Antall klikkbare elementer:** 38

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Lagre utkast" | Direct + toast | Save | OK |
| "Forhåndsvis publisering" primary | Modal | PreviewPlanPublishModal | NEI - ny modal |
| Steg-card phase-timeline (6 stk klikkbar) | State-change | Naviger til steg | OK |
| Agent-forslag "Bruk forslag" / "Avvis" | Direct/modal | (approvals) | OK (#16) |
| Fase-chips i Steg 4 (5 stk: Base/Forb./Spes./Taper/Peak) | State-change | Inline | OK |
| Slider-bars (5 stk pyramide) drag | State-change | Inline drag | OK |
| Number-input per pyramide-rad (5 stk) | Inline edit | InlineEditField | OK |
| "Tilbakestill" / "Kopier fra forrige fase" / "Bruk agent-forslag" | Direct | Action | OK |
| "← Tilbake til faser" / "Gå til økt-skjelett →" | State-change | Naviger steg | OK |
| Drawer-close × | State-change | Inline | OK |
| "Se modell →" link i drawer | Modal | AgentModelInfoModal | NEI |
| "Publiser plan" primary i drawer | Modal | ConfirmPublishPlanModal | NEI - ny confirm |
| "Lagre utkast" / "Send til Anders for review" i drawer | Modal | SendForReviewModal | NEI - ny modal |
| "Forhåndsvis spiller-visning →" link | Modal | PreviewPlayerViewModal | NEI - ny modal |

## States som må designes (utenom default)
- Steg done/active/future i timeline
- Slider-drag-state
- Validation: sum != 100% (rød border + melding)
- Auto-save indicator (live)
- Loading: agent genererer forslag
- Disabled "Publiser" hvis steg ikke ferdig
- Error: spiller har overlappende plan
- Wizard-back warning hvis usaved
