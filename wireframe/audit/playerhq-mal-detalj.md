# Audit: PlayerHQ — Mål-detalj (HCP-trend)

**HTML:** `screen-deck/playerhq/mal-detalj.html`
**URL:** `/portal/mal/:id`
**Tier:** Pro
**Antall klikkbare elementer:** 19

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Tooltips | OK |
| "Endre mål" knapp (toppen + drawer) | Modal | EditGoalModal | NEI - ny modal |
| "Del med foreldre" primær (toppen + drawer) | Modal | ShareWithParentModal | NEI - ny modal (samme som notater) |
| Delmål-cards (5 stk) | Skjerm | /portal/mal/:id (sub-mål) | OK |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: "Endre mål" primær | Modal | EditGoalModal | NEI - ny modal |
| Drawer: "Eksporter rapport (PDF)" | Skjerm | PDF-download | OK |
| Drawer: "Se alle delmål →" | Skjerm | /portal/mal | OK |
| SVG-graf data-punkter (6 historikk + 7 projeksjon) | Popover | DataPointPopover | NEI - ny popover |

## States som må designes (utenom default)
- Empty-state (mål ikke satt)
- Loading skeleton (sparkline-strip + graf)
- "Forventet truffet" vs "I fare" status
- Forsinket-state (rød)
- Tier-locked-state (Free ser kun current HCP, ikke trend/projeksjon)
- EditGoalModal (target value + dato)
- ShareWithParentModal (re-bruk fra notater)
- DataPointPopover (hover på graf)
- Hele "Sammenliknet med peer"-state med percentil-bar
