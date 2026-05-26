# Audit: PlayerHQ — Hjem (dashboard)

**HTML:** `screen-deck/playerhq/hjem.html`
**URL:** `/portal/hjem`
**Tier:** Alle (men Pro-features synlige med tier-pill)
**Antall klikkbare elementer:** 14

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav: Hjem (active) | Skjerm | /portal/hjem | OK |
| Sidebar-nav: Tren | Skjerm | /portal/tren/plan | OK |
| Sidebar-nav: Mål | Skjerm | /portal/mal | OK |
| Sidebar-nav: Coach | Skjerm | /portal/coach | OK |
| Sidebar-nav: Meg | Skjerm | /portal/meg | OK |
| KPI-strip kort (4 stk: HCP, SG, Streak, Pyramide) | Skjerm | Drilldown — /portal/mal/* | OK |
| "Start økt →" CTA i Dagens fokus | Skjerm | /portal/live/:id | OK |
| "Flytt" knapp (Dagens fokus) | Modal | RescheduleSessionModal | NEI - ny modal |
| "Se planen" knapp | Skjerm | /portal/tren/plan | OK |
| Pyramide-card | Skjerm | /portal/mal | OK |
| Streak-card (klikkbar?) | Modal | StreakDetailModal | NEI - ny modal |
| SG-fordeling card | Skjerm | /portal/mal/trackman | OK |
| "Sist registrert" rad-elementer (3 stk) | Modal | SessionDetailQuickModal eller skjerm | NEI - ny modal |
| "Svar →" på coach-melding | Skjerm | /portal/coach (compose) | OK |

## States som må designes (utenom default)
- Empty-state for dashboard (ny bruker uten data)
- Empty-state per kort (ingen runder, ingen streak)
- Loading skeleton (KPI-strip + bento)
- "Aktiv nå"-status indikator (grønn dot)
- Tier-locked indikatorer for Pro/Elite-features (Free-bruker)
- RescheduleSessionModal (flytte planlagt økt)
- StreakDetailModal (heatmap 90 dager)
