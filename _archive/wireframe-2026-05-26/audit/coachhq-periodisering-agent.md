# Audit: CoachHQ — Periodiserings-agent (diff-view)

**HTML:** `screen-deck/coachhq/periodisering-agent.html`
**URL:** `/admin/agents/periodisering`
**Antall klikkbare elementer:** 18

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (5 stk diff-summary) | Popover | DiffStatPopover | NEI |
| Fase-card v1 (5 stk i venstre kolonne) | Drill-down | PhaseDetailDrawer | NEI |
| Fase-card v1.1 (5 stk i høyre kolonne, 3 endret) | Drill-down | PhaseDetailDrawer (med diff) | NEI |
| Diff-detalj "Detalj" link (6 stk) | Modal | DiffLineDetailModal | NEI - ny modal |
| Sticky bottom-bar "Avvis · be om alternativ" | Modal | RequestAlternativeModal | NEI - ny modal |
| Sticky bottom-bar "Kopier som ny mal" | Modal | SaveAsTemplateModal | NEI - ny modal |
| Sticky bottom-bar "Endre per linje" | Modal | EditDiffLinesModal | NEI - ny modal |
| Sticky bottom-bar "Godkjenn alle endringer" primary | Modal | ConfirmApproveAllModal | NEI - confirm |
| Agent-info-card "Konfidens 87%" pill | Tooltip | ConfidenceTooltip | NEI |
| "Se modell →" link (på lignende skjermer) | Modal | AgentModelInfoModal | NEI |

## States som må designes (utenom default)
- Hover på fase-card (begge sider, synkronisert)
- Endret-fase highlight (currently accent border)
- Loading skeleton (mens agent genererer)
- Error: agent feilet
- Diff-line hover (highlight både sider)
- Sticky bar shadow ved scroll
- Konfidens-bar visuell (lav/medium/høy)
- Empty: ingen endringer foreslått (tom diff)
