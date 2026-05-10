# Audit: PlayerHQ — Test-detalj

**HTML:** `screen-deck/playerhq/test-detalj.html`
**URL:** `/portal/tren/tester/:id`
**Tier:** Pro (historikk + projeksjon)
**Antall klikkbare elementer:** 17

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (5) | Inline | Tooltips | OK |
| "+ Start nytt forsøk" primær (toppen + drawer) | Skjerm | /portal/live/:id/tapper | OK |
| "Eksporter CSV" lenke | Skjerm | CSV-download | OK |
| Tabell-rader (4 forsøk) | Modal | TestAttemptDetailModal | NEI - ny modal |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: "Book sand-tid GFGK" | Modal | BookSessionModal | OK (i tracker) |
| Drawer: "Se video-protokoll →" | Modal | VideoPlayerModal | NEI - ny modal |
| Agent-insight kort (3) | Modal | AgentInsightDetailModal | NEI - ny modal |
| SVG-graf data-punkter | Popover | DataPointPopover | NEI - ny popover |

## States som må designes (utenom default)
- Empty-state (0 forsøk — baseline-status)
- Loading skeleton
- Personal-record highlight (★)
- Mål-progress vs nå
- Pågår-status (warning-pill)
- Tier-locked-state (Free ser kun siste forsøk)
- TestAttemptDetailModal (per-forsøk detaljer)
- VideoPlayerModal
- DataPointPopover (hover på graf-punkt)
