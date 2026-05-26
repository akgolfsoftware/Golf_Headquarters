# Audit: CoachHQ — Plan-detalj

**HTML:** `screen-deck/coachhq/plan-detalj.html`
**URL:** `/admin/plans/:id`
**Antall klikkbare elementer:** 38

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Endre plan-mål" knapp | Modal | EditPlanGoalModal | NEI - ny modal |
| "Marker fase ferdig" primary | Modal | ConfirmPhaseCompleteModal | NEI - confirm |
| Stat-rich card (4 stk: Plan-fremdrift/SG/Adherence/Peak-readiness) | Drill-down | StatDetailDrawer | NEI |
| Phase-card (5 stk klikkbar: Base/Forb/Spes/Taper/Peak) | Drawer-toggle | PhaseDetailDrawer | NEI |
| Donut-segment (5 stk pyramide-tier) | Drill-down | PyramidTierDetailDrawer | NEI |
| Heatmap-celle (60 stk) | Tooltip | HeatmapCellPopover | NEI |
| "Endre allokasjon" link | Ny skjerm | `/admin/plans/:id/edit` | OK |
| "Se agent-begrunnelse →" link | Modal | AgentReasoningModal | NEI - ny modal |
| "+ Legg til økt" knapp | Modal | NewSessionModal | NEI |
| Tabellrad økt (5 stk) | Modal/skjerm | SessionDetailModal | OK (drawer) |
| Drawer-close × | State-change | Inline | OK |
| Agent-historikk "Godkjenn" / "Endre" / "Avvis" | Modal | (approvals) | OK (#16) |
| "Endre fase-allokasjon" primary i drawer | Ny skjerm | `/admin/plans/:id/edit` | OK |
| "Marker fase ferdig" / "Eksporter til spiller" | Modal | ConfirmPhaseCompleteModal / ExportToPlayerModal | NEI - 2 nye |
| "Se neste fase: Taper →" link | State-change | Naviger fase | OK |
| "Versjonshistorikk" (impliseres via Endre) | Modal | PlanVersionHistoryModal | NEI |

## States som må designes (utenom default)
- Phase-card current/done/future styling
- Selected phase (drawer åpen)
- Loading skeleton
- Heatmap hover med tooltip
- Spark-line hover
- Empty: ny plan uten økter
- Tab "I dag"-økt highlight (table row)
- "PYRAMID_ADJUST"-history pulse for nye agent-forslag
- Print/PDF-versjon
