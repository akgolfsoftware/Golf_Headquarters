# Audit: PlayerHQ — Coaching Detail (plan-detalj)

**HTML:** `screen-deck/playerhq/coaching-detail.html`
**URL:** `/portal/coach/plans/:id`
**Tier:** Pro
**Antall klikkbare elementer:** 18

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip: "13/19 ferdig" | State-change | Tab → Økter | OK |
| Action-strip: "I dag pitch 50-100m" | Skjerm | /portal/sessions/:id | OK |
| Action-strip: "3d til neste test" | Skjerm | /portal/tren/tester | OK |
| Action-strip: "21d til peak" | Modal | PeakReadinessModal | NEI - ny modal |
| "Be om endring" knapp | Modal | RequestPlanChangeModal | NEI - ny modal |
| "Start dagens økt" primær | Skjerm | /portal/live/:id | OK |
| Tabs (5: Plan/Faser/Økter/Tester/Mål) | State-change | Inline | OK |
| Fase-cards (5: Base/Forberedelse/Spesifikk/Taper/Peak) | Modal | PhaseDetailModal | NEI - ny modal |
| "Hva du skal gjøre denne uka" tabell-rader (5) | Skjerm | /portal/sessions/:id eller /portal/tren/tester/:id | OK |
| Drawer: "Start økt →" | Skjerm | /portal/live/:id | OK |
| Drawer: tester (2) | Skjerm | /portal/tren/tester/:id | OK |
| Drawer: "Send melding til Anders" | Skjerm | /portal/coach/message | WIREFRAME_NEEDED |
| Drawer: "Se hele planen →" | Skjerm | /portal/tren/plan (treningsplan.html) | OK |

## States som må designes (utenom default)
- Empty-state (ingen plan tildelt)
- Empty-state per tab
- Loading skeleton
- Plan-godkjenning-state (PlanApprovalModal — i tracker)
- Phase-status (done/current/future/peak)
- "Foran skjema" / "Bak skjema" insight-state
- PeakReadinessModal (forecast + komponenter)
- RequestPlanChangeModal (skriv begrunnelse + send)
- PhaseDetailModal (alle økter i fase)
