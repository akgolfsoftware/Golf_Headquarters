# Audit: PlayerHQ — Mål-oversikt

**HTML:** `screen-deck/playerhq/mal-oversikt.html`
**URL:** `/portal/mal`
**Tier:** Pro (Free ser kun HCP-mål)
**Antall klikkbare elementer:** 19

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Filter-chips (5: Oversikt/Runder/TrackMan/Baner/Leaderboard) | Skjerm | /portal/mal/* | OK |
| "+ Nytt mål" chip | Modal | NewGoalModal | NEI - ny modal |
| KPI-kort (4: HCP-mål/Sørlandsåpent/Runder/Test-deltas) | Modal/Skjerm | Drilldown / GoalDetailModal | NEI - ny modal |
| "Hovedmål"-card (HCP 5,5) | Skjerm | /portal/mal/:id (mal-detalj) | OK |
| Turneringsmål tabell-rader (3) | Modal | TournamentDetailModal | NEI - ny modal |
| Delmål per pyramide-card (5 pluss "+ Legg til") | Modal | GoalDetailModal / NewGoalModal | NEI - nye modaler |
| "Legg til delmål" dashed card | Modal | NewGoalModal | NEI - ny modal |
| Personlige rekorder-cards (4) | Modal | RecordDetailModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state (ingen mål satt)
- Empty-state for delmål per kategori
- Loading skeleton
- Tier-locked-state (Free ser delmål med lock-overlay)
- "På spor" / "Bak" / "Ferdig" status-pills
- Progress-bar med start/nå/mål-merker
- NewGoalModal (velg type + tallverdi + dato)
- GoalDetailModal (historikk + edit)
- TournamentDetailModal (mål + register-knapp)
- RecordDetailModal (kontekst + dato)
