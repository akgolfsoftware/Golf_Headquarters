# AK Golf Platform — CoachHQ — Plan-detalj

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/:id`
- **Arketype:** C — Detail + tabs (5 tabs, tunge data)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-detalj.html`
- **Audit:** `wireframe/audit/coachhq-plan-detalj.md`
- **Tilhørende modaler:** `EditPlanGoalModal`, `ConfirmPhaseCompleteModal`, `AgentReasoningModal`, `NewSessionModal`, `ExportToPlayerModal`, `PhaseDetailDrawer`, `PlanVersionHistoryModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach sitt operasjonelle view av én treningsplan. Viser hvilken fase spilleren er i, hvor langt det er igjen, hvilke økter er gjennomført, hvordan pyramide-fordelingen utvikler seg, hvilke tester står på plan, og hva agentene har foreslått av justeringer. Brukes ved ukentlig plan-review og når noe må omlegges.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `ClipboardList` på lime accent-bg
- **H1:** `Sommer-toppform — Markus Roinås Pedersen` (Instrument Serif italic for "Sommer-toppform")
- **Subtittel:** `Plan #047 · 9. mai – 30. jun 2026 · Coach: Anders K · Sist endret 8. mai 14:22`
- **Stat-pills (4):** `Fase 3 av 5` · `64 % gjennomført` · `Adherence 91 %` · `Peak 12. juni`
- **Primary CTA:** `Marker fase ferdig` (åpner ConfirmPhaseCompleteModal)
- **Sekundær:** `Endre plan-mål` · `...`-meny (Versjonshistorikk, Eksporter til spiller, Del med foresatte)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Faser** (default) | 5 phase-cards horisontalt + agent-historikk |
| **Økter** | Tabell over alle 19 planlagte økter, 13/19 ferdig |
| **Pyramide** | Donut + 12u heatmap + "Endre allokasjon"-link |
| **Tester** | Tester koblet til planen |
| **Mål** | Plan-mål + delmål + progress |

## Layout — Faser-tab (default)

- **Stat-rich-bento (12-col):** 4 cards: Plan-fremdrift / SG / Adherence / Peak-readiness
- **Phase-cards (12-col):** 5 stk horisontalt — Base ✓ · Forberedelse ✓ · **Spesifikk (current)** · Taper · Peak. Klikk → PhaseDetailDrawer.
- **Agent-historikk (12-col):** Tidslinje, siste 6 forslag med "Godkjent" / "Endret" / "Avvist"-stempel

## Phase-card states

| State | Styling |
|---|---|
| Done | accent-prikk + checkmark, dempet bg |
| Current | accent-border 2px + lime accent på header |
| Future | muted, alle datoer vises |
| Peak (siste) | gold accent-border + Lucide `Zap` |

## Layout — Økter-tab

Tabell, kolonner: `Dato | Type | Pyramide | Status | ...`. Eksempel-rader (5 første):

| Dato | Type | Pyramide-mix | Status |
|---|---|---|---|
| 9. mai 08:00 | TEK 1:1 | TEK 60 % SLAG 40 % | Ferdig ✓ |
| 11. mai 16:00 | SLAG | SLAG 80 % FYS 20 % | Ferdig ✓ |
| 13. mai 08:00 | SPILL | SPILL 100 % | I dag |
| 15. mai 14:00 | FYS | FYS 100 % | Planlagt |
| 18. mai 08:00 | TEK 1:1 | TEK 70 % SLAG 30 % | Planlagt |

## Layout — Pyramide-tab

Donut + heatmap + "Endre allokasjon →" + "Se agent-begrunnelse →" (åpner AgentReasoningModal).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip (5 stk) | default, hover, active |
| Phase-card | default, hover (lift), current (accent-border), klikk → drawer |
| Stat-rich-card | default, hover, klikk → drill |
| Donut-segment | default, hover (utvid), klikk → drawer |
| Heatmap-celle | default, hover (border + tooltip) |
| `Marker fase ferdig` CTA | default, hover, loading, success (toast + auto-advance til neste fase) |
| Agent-historikk-rad | klikk → AgentReasoningModal |
| Tabell-rad økt | klikk → SessionDetailModal eller `/admin/sessions/:id` |

## Empty / loading / error

- **Empty (ny plan, ingen økter):** "Ingen økter planlagt. Generer fra fase →"
- **PYRAMID_ADJUST-pulse:** Hvis ny agent-anbefaling kom etter siste page-load — pulse på Pyramide-tab
- **Loading:** Skeleton phase-cards + tabell-rader

## Eksempel-data

- **Plan:** "Sommer-toppform" for Markus Roinås Pedersen
- **Periode:** 9. mai – 30. juni 2026
- **Fase:** 3 av 5 (Spesifikk), 64 % gjennomført
- **Peak:** 12. juni (Sørlandsåpent)
- **Coach:** Anders Kristiansen

## Ønsket output fra Claude Design

1. Lyst tema, Faser-tab default
2. Mørkt tema, samme
3. Tab-bytte til Pyramide-tab
4. PhaseDetailDrawer åpen for "Spesifikk (current)"
5. PYRAMID_ADJUST-pulse på agent-historikk-rad
6. Empty: ny plan uten økter
7. Mobil ≤640px — phase-cards horisontal scroll

## Ikke-mål

- Ikke designe `EditPlanGoalModal`, `AgentReasoningModal` (egne pakker / fase-pakker)
- Ikke designe plan-edit-skjerm (egen pakke 04)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
