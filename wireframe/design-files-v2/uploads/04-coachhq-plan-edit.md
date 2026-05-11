# AK Golf Platform — CoachHQ — Plan-redigering

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/:id/edit`
- **Arketype:** C — Detail + tabs (5 tabs, edit-mode)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-edit.html`
- **Audit:** `wireframe/audit/coachhq-plan-edit.md`
- **Tilhørende modaler:** `PlanVersionHistoryModal`, `NewPhaseModal`, `ConfirmDeletePhaseModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Edit-modus av plan-detalj. Coach kan justere fase-datoer, pyramide-allokering, koble nye økter/tester og se agent-forslag inline. "Lagre alle endringer" må trykkes — ikke auto-save (planer er for kritiske til å auto-save). Versjonshistorikk lar coach rulle tilbake.

## Header-blokk — UNIKT

- **H1:** `Rediger Sommer-toppform` (Geist, ikke italic — vi er i edit-mode)
- **Subtittel:** `Markus Roinås Pedersen · 3 endringer ulagret` (`3 endringer ulagret` i destructive-tekst hvis dirty)
- **Stat-pills (3):** `Versjon 12` · `Sist publisert 7. mai` · `Sum pyramide: 100 %` (rød hvis ≠100)
- **Primary CTA:** `Lagre alle endringer` (disabled hvis ingen endringer, success-toast etter lagre)
- **Sekundær:** `Versjonshistorikk` (åpner PlanVersionHistoryModal)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Faser** (default) | 5 phase-cards i edit-mode + "+ Legg til ny fase" |
| **Økter** | Liste over økter koblet til planen, med drag-reorder |
| **Pyramide** | 5 sliders (FYS/TEK/SLAG/SPILL/TURN), sum-validation |
| **Tester** | Tester koblet til hver fase, drag-drop |
| **Mål** | Plan-mål editable + delmål |

## Layout — Faser-tab (default)

- **Phase-cards (12-col):** 5 stk, hver klikkbar. Klikk åpner inline drawer (drawer-mode = edit). Drawer på fase 3 (Spesifikk) er åpen som default.
- **Drawer-innhold (fase 3):**
  - Form-input: Fase-navn (tekst)
  - Datoer: Start (date-picker) + Slutt (date-picker)
  - Pyramide for fase: 5 sliders med tabular-nums-prosent
  - Toggle-pills: `Aktiver agent` (default på), `Auto-godkjenn forslag` (default av)
  - Tekstarea: Fase-beskrivelse / mål
  - Knapper: `Lagre endringer` · `Slett fase` (destructive, åpner ConfirmDelete)
- **+ Legg til ny fase** under cards (åpner NewPhaseModal)
- **Agent-forslag-strip (12-col):** "Periodisering-agent: Forleng Spesifikk-fase 4 dager" + `Avvis` / `Godkjenn`

## Layout — Pyramide-tab

5 sliders horisontalt:

| Slider | Default | Validation |
|---|---|---|
| FYS | 18 % | min 0, max 50 |
| TEK | 32 % | min 0, max 60 |
| SLAG | 24 % | min 0, max 60 |
| SPILL | 14 % | min 0, max 50 |
| TURN | 12 % | min 0, max 30 |

Sum-rad nederst: `Sum: 100 %` (grønn) eller `Sum: 96 % — må være 100` (rød).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Phase-card (editable) | default, hover, selected (currently i drawer = accent-border 2px) |
| `+ Legg til ny fase` | default, hover, klikk → NewPhaseModal |
| Form-input drawer | default, focus (ring), error (destructive border), disabled |
| Slider | default, drag (lift + tooltip), invalid (rød) |
| Toggle-pill | off, on (lime accent), disabled |
| `Lagre alle endringer` | disabled (no changes), default, hover, loading (spinner), success |
| `Slett fase` | default, hover, klikk → ConfirmDelete |
| Agent-forslag `Godkjenn` / `Avvis` | default, hover, loading, success-fade-out |

## Empty / loading / error

- **Validation-feil:** "Sum pyramide må være 100 %, du har 96 %" + rød border på slider-rad
- **Konflikt-error:** Toast "Endring kolliderer med booket økt 13.05 — løs eller avbryt"
- **Disabled lagre:** Tooltip "Ingen endringer å lagre"
- **Loading:** Skeleton phase-cards
- **Save-spinner i CTA:** "Lagrer..." med Lucide `Loader2`-spinner

## Eksempel-data

- **Plan:** "Sommer-toppform" v12, Markus Roinås Pedersen
- **Aktiv fase:** Spesifikk (9. mai – 12. juni)
- **Sum pyramide:** 100 % (FYS 18 + TEK 32 + SLAG 24 + SPILL 14 + TURN 12)
- **Agent-forslag:** "Forleng Spesifikk-fase 4 dager"

## Ønsket output fra Claude Design

1. Lyst tema, Faser-tab med drawer åpen på Spesifikk
2. Mørkt tema, samme
3. Pyramide-tab med sliders, sum=100 %
4. Validation-feil-state: sum=96 %, rød
5. Loading lagre-spinner
6. Tab-bytte til Tester
7. Mobil ≤640px — drawer blir bottom-sheet, sliders stables

## Ikke-mål

- Ikke designe `PlanVersionHistoryModal`, `NewPhaseModal` (egne fase-pakker)
- Ikke designe versjons-diff-view (egen sub-skjerm)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
