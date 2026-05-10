# Audit: PlayerHQ — Coach Notes (liste)

**HTML:** `screen-deck/playerhq/coach-notes.html`
**URL:** `/portal/coach/notes`
**Tier:** Pro
**Antall klikkbare elementer:** 16

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Filter-chips (5: Alle/Etter økt/Etter test/Etter runde/Generelt) | State-change | Inline filter | OK |
| Søk-chip "Søk i notater…" | Popover | SearchNotesPopover | NEI - ny popover |
| KPI-kort (3: Totalt/Måneden/Uleste) | Inline / drilldown | Kanskje filter | OK |
| "Les hele" CTA (5 notat-cards) | Skjerm | /portal/coach/notes/:id | OK |
| Hele card (klikkbar?) | Skjerm | /portal/coach/notes/:id | OK |
| Ulest-pill | Inline | Status-indikator | OK |

## States som må designes (utenom default)
- Empty-state (ingen notater)
- Empty-state per filter (f.eks. "ingen etter test")
- Loading skeleton (cards)
- Ulest vs lest-state (visuell forskjell)
- Avatar-fargekoding per coach (AK grønn, MR oransje)
- SearchNotesPopover med autocomplete
