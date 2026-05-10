# Audit: PlayerHQ — TrackMan-analyse (trender)

**HTML:** `screen-deck/playerhq/trackman-analyse.html`
**URL:** `/portal/mal/trackman/analyse`
**Tier:** Pro (Elite for "Be om coach-vurdering"?)
**Antall klikkbare elementer:** 16

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Tooltips | OK |
| "Last opp ny økt" knapp | Modal | TrackManImportModal | OK (i tracker) |
| "Eksporter til SG" primær | Skjerm | CSV-download | OK |
| Per-kølle chips (6: Driver/3W/5i/7-jern/Wedge/Putter) | State-change | Inline tab | OK |
| KPI stat-rich (5) | Inline | Tooltip / drilldown | OK |
| Trajectory SVG-baner (apex-markører) | Popover | TrajectoryDetailPopover | NEI - ny popover |
| Heatmap dots (16+) | Popover | ShotDetailPopover | NEI - ny popover |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: "Eksporter til Strokes Gained" | Skjerm | CSV-download | OK |
| Drawer: "Last opp ny TrackMan-økt" | Modal | TrackManImportModal | OK (i tracker) |
| Drawer: "Be om coach-vurdering" | Modal | RequestCoachReviewModal | NEI - ny modal |
| Drawer: "Se alle økter →" | Skjerm | /portal/mal/trackman | OK |

## States som må designes (utenom default)
- Empty-state (ingen TrackMan-data å vise trender på)
- Loading skeleton (komplekse SVG)
- Tier-locked-state — Pro-tier-pill prominent · Elite-features med lock
- Trajectory-fade fra eldste (lys) til nyeste (mørk)
- Heatmap-target-zone (grønn) vs akseptabel (gul) vs bom (rød)
- ComparisonModal (i tracker — vs peer/pro)
- TrajectoryDetailPopover (per slag: launch/spin/carry)
- ShotDetailPopover (per heatmap-dot)
- RequestCoachReviewModal (Elite-feature?)
