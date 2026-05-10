# Audit: PlayerHQ — Runder

**HTML:** `screen-deck/playerhq/runder.html`
**URL:** `/portal/mal/runder`
**Tier:** Pro (SG-analyse Pro)
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (3) | Inline | Tooltips | OK |
| "+ Logg ny runde" primær | Modal | LogRoundModal | NEI - ny modal |
| Filter-chips (5: Sesong/All time/Bossum/GFGK/Per HCP) | State-change | Inline filter | OK |
| KPI-strip stat-rich (4) | Modal/skjerm | Drilldown | OK |
| Runde-cards (8 stk — klikkbare) | Modal | RoundDetailModal | OK (i tracker) |
| "Re-spill med TrackMan →" på cards (8) | Skjerm | /portal/mal/trackman?source=runde | OK |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: hole-by-hole celler (18) | Popover | HoleDetailPopover | NEI - ny popover |
| Drawer: "Re-spill med TrackMan" | Skjerm | /portal/mal/trackman | OK |
| Drawer: "Eksporter scorecard" | Skjerm | PDF-download | OK |
| Drawer: "Del med coach" | Modal | ShareWithCoachModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state (ingen runder)
- Loading skeleton
- Best-runde highlight (★ pill)
- Birdie/par/bogey/dobbeltbogey-cells (fargekodet)
- SG positiv vs negativ (grønn vs rød bar)
- Tier-locked (Free ser kun score, ikke SG)
- LogRoundModal (manuell logging — bane + dato + score + SG)
- RoundDetailModal (i tracker — sjekk dekker drawer)
- RoundInsightModal (i tracker — AI insight)
- HoleDetailPopover (per hull: par/score/strokes/putts)
- ShareWithCoachModal (re-bruk pattern)
