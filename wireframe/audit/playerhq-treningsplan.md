# Audit: PlayerHQ — Treningsplan (full plan-view)

**HTML:** `screen-deck/playerhq/treningsplan.html`
**URL:** `/portal/tren/plan`
**Tier:** Pro
**Antall klikkbare elementer:** 19

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Tooltips | OK |
| "Se hele planen som PDF" knapp | Skjerm | PDF-download | OK |
| "Start dagens økt →" primær | Skjerm | /portal/live/:id | OK |
| KPI stat-rich (4) | Modal/skjerm | Drilldown | OK |
| Fase-cards (5: Base/Forberedelse/Spesifikk/Taper/Peak) | Modal | PhaseDetailModal | NEI - ny modal |
| "Hvorfor akkurat denne fordelingen? →" lenke | Modal | PyramidExplainerModal | NEI - ny modal |
| "+ Lag egen økt" lenke | Skjerm | /portal/sessions/new | OK |
| Ukens 5 økt-cards | Skjerm | /portal/sessions/:id | OK |
| "Start økt →" på dagens card | Skjerm | /portal/live/:id | OK |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: agent-godkjent-cards (2) | Modal | PlanActionDetailModal | OK (i tracker) |
| Drawer: test-rader (3) | Skjerm | /portal/tren/tester/:id | OK |
| Drawer: "Start dagens økt" primær | Skjerm | /portal/live/:id | OK |
| Drawer: "Send spørsmål til Anders" | Skjerm | /portal/coach/message | WIREFRAME_NEEDED |
| Drawer: "Se neste fase: Taper →" | Skjerm | /portal/coach/plans/:id?phase=4 | OK |

## States som må designes (utenom default)
- Empty-state (ingen plan)
- Loading skeleton
- Phase status: done / current / future / peak
- "I dag · neste" highlight på økt-card
- Mini-pyramide bar-chart per fase
- Resultat-state per økt (Ferdig + faktisk verdi)
- Tier-locked (Free ser ikke periodisering)
- PhaseDetailModal (alle økter + tester i fase)
- PyramidExplainerModal (hvorfor fordelingen — agent-rasjonale)
- PlanActionDetailModal (i tracker — sjekk dekker agent-godkjent-card)
