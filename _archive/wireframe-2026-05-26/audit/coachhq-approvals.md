# Audit: CoachHQ — Godkjenninger (Approvals)

**HTML:** `screen-deck/coachhq/approvals.html`
**URL:** `/admin/approvals`
**Antall klikkbare elementer:** 50

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Godkjenn alle uten konflikt" | Modal | BulkApproveModal | OK (#15) |
| Agent-filter-chips (Alle/Plan-watcher/Round-agent/Test-agent/Tournament-agent/TrackMan-agent) | State-change | Inline | OK |
| Kanban-card (~12 stk i venter, 3+ i godkjent, 3 i avvist) | Modal/drawer | PlanActionDetailModal (drawer) | OK (#14) |
| "Godkjenn" per kort (6+ stk) | Direct/confirm | ConfirmApproveModal (light) | NEI |
| "Endre" per kort (6+ stk) | Modal | EditAgentSuggestionModal | NEI - ny modal |
| "Avvis" per kort (6+ stk) | Modal | RejectWithFeedbackModal (AgentFeedbackModal) | OK (#16) |
| Drag-drop kort mellom kolonner | State-change | Inline | OK (drag-drop) |
| "+ Vis 6 til" / "+ Vis 25 til" links | State-change | Inline (load-more) | OK |
| Drawer-close × | State-change | Inline | OK |
| "Se Joachims plan-detalj →" | Ny skjerm | `/admin/plans/:id` | OK |
| "Endre verdier" / "Avvis" i drawer | Modal | (samme som over) | OK |

## States som må designes (utenom default)
- Drag-state for kort (lift, ghost-version)
- Drop-zone highlight i kolonnen
- Selected-state (currently rendered med inset-shadow)
- Loading skeleton for kanban-board
- Empty-state per kolonne ("ingen venter")
- Error-state: agent-API nede
- Success toast: "Godkjent X agent-forslag"
- Real-time push av nye forslag (badge-count)
- Konflikt-deteksjon visning
