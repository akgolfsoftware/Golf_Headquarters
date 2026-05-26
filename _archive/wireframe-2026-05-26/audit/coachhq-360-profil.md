# Audit: CoachHQ — 360-profil (spiller deep-dive)

**HTML:** `screen-deck/coachhq/360-profil.html`
**URL:** `/admin/elever/:id`
**Antall klikkbare elementer:** 40

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Action-strip-items (4 stk) | Popover | StatusFilterPopover | NEI |
| "Send melding" knapp | Modal | SendMessageModal | NEI |
| "Book ny økt" primary | Modal | BookSessionModal | OK (#11) |
| Tab-chips (7 stk: Pyramide/SG/TrackMan/Tester/Plan/Tournaments/Notater) | State-change | Inline | OK |
| Donut-segment (klikkbar) | Drill-down | PyramidTierDetailDrawer | NEI |
| Pyramide-tier (5 lag, klikkbar) | Drill-down | TierDetailDrawer | NEI |
| Heatmap-celle (60 stk: 12u × 5 områder) | Tooltip | HeatmapCellPopover | NEI |
| Hvor-henger-card (5 stk pyramide) | Drill-down | StatDetailDrawer | NEI |
| Drawer-close × | State-change | Inline | OK |
| Drawer "Akkurat nå" rader (3 stk: neste/sist/agent) | Modal | (bookingsdrawer / runde-modal / approval modal) | OK / NEI / OK |
| Stat-rich card spark-line (4 stk) | Tooltip | SparkTooltip | NEI |
| Drawer "Send melding" primary | Modal | SendMessageModal | NEI |
| Drawer "Book økt" / "Endre plan" / "Eksporter rapport" | Modal/skjerm | BookSessionModal / `/admin/plans/:id/edit` / ExportMenu | OK / OK / NEI |
| Coach-AI chat-knapp (impliseres) | Modal | AIChatModal | NEI - ny modal (matches `/admin/elever/:id/ai`) |

## States som må designes (utenom default)
- Hover på heatmap-celle (border + tooltip)
- Loading skeleton hele profilen
- Empty-state: ny spiller uten data
- Tab-active state
- Spark-line hover med dato/verdi
- Donut-segment hover (utvid)
- Print-friendly view (rapport-versjon)
