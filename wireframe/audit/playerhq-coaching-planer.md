# Audit: PlayerHQ — Coaching-planer (Kanban-oversikt)

**HTML:** `screen-deck/playerhq/coaching-planer.html`
**URL:** `/portal/coach/plans`
**Tier:** Pro
**Antall klikkbare elementer:** 21

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline / drilldown | Tooltips | OK |
| "Se aktiv plan" CTA | Skjerm | /portal/coach/plans/:id | OK |
| Filter-chips (4: Alle/Aktiv/Tidligere/Foreslått) | State-change | Inline filter | OK |
| Plan-cards (5 totalt: 1 aktiv, 3 tidligere, 1 foreslått) | Skjerm | /portal/coach/plans/:id | OK |
| Card "Se detaljer →" lenker (4) | Skjerm | /portal/coach/plans/:id | OK |
| "Godta" agent-forslag knapp | Modal | PlanApprovalModal | OK (i tracker) |
| "Detaljer" agent-forslag | Modal | PlanProposalDetailModal | NEI - ny modal |
| Drawer: "×" lukk | State-change | Inline | OK |
| Drawer: fase-rader (5) | State-change | Tab/scroll | OK |
| Drawer: "Åpne aktiv plan" primær | Skjerm | /portal/coach/plans/:id | OK |
| Drawer: "Be om endring fra coach" | Modal | RequestPlanChangeModal | NEI - ny modal (re-bruk) |
| Drawer: "Se hele plan-historikken →" | Skjerm | /portal/coach/plans?filter=alle | OK |

## States som må designes (utenom default)
- Empty-state (ingen plan)
- Empty-state per kolonne (Tidligere/Foreslått tom)
- Drag-state (cards har cursor:grab — drag-feedback)
- Loading skeleton
- Agent-forslag spesial-styling (gradient + AGENT-FORSLAG-pill)
- PlanApprovalModal (i tracker — sjekk dekker dette case)
- PlanProposalDetailModal (full forhåndsvisning av forslått plan)
- RequestPlanChangeModal (skriv begrunnelse)
