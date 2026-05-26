# AK Golf Platform — PlayerHQ — Treningsplan

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/tren/plan`
- **Arketype:** C — Detail + tabs (full plan-view, 5 faser)
- **Tier-gating:** **Pro** — Free ser låst overlay
- **HTML-referanse:** `wireframe/screen-deck/playerhq/treningsplan.html`
- **Audit:** `wireframe/audit/playerhq-treningsplan.md`
- **Tilhørende modaler:** `PhaseDetailModal`, `PyramidExplainerModal`, `PlanActionDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerens fulle plan-view. Forskjellig fra coach sin plan-detalj (pakke 03) — spilleren ser sin egen aktive plan med ukens 5 økter, fase-fremdrift, og hvorfor agenten har valgt denne fordelingen. Free-tier får lock-overlay; Pro/Elite ser hele.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `Mountain` (peak-metafor) på lime accent
- **H1:** `Sommer-toppform` (Instrument Serif italic)
- **Subtittel:** `Plan av Anders K · 9. mai – 30. juni · 64 % gjennomført`
- **Stat-pills (4):** `Fase 3 av 5` · `Adherence 91 %` · `Peak 12. juni` · `13/19 økter ferdig`
- **Primary CTA:** `Start dagens økt →` (lime accent, åpner `/portal/live/:id`)
- **Sekundær:** `Se hele planen som PDF` · `+ Lag egen økt`

## Tab-strip (3 tabs — enklere enn coach-versjonen)

| Tab | Innhold |
|---|---|
| **Aktiv** (default) | Faser horisontalt + ukens 5 økter |
| **Historisk** | Tidligere faser + gjennomførte økter |
| **Tester** | Tester planlagt for planen |

## Layout — Aktiv-tab (default)

### Stat-rich-bento (12-col)
4 cards: Plan-fremdrift / SG-utvikling / Plan-adherence / Peak-readiness — klikk → drawer

### Fase-stripe (12-col)
5 phase-cards horisontalt: **Base ✓** · **Forberedelse ✓** · **Spesifikk (current)** · Taper · Peak. Klikk → PhaseDetailModal.

Hver card:
- Fase-navn (italic Instrument Serif)
- Datoer (JetBrains Mono)
- Mini pyramide bar-chart (5 områder)
- Status-pill: Done / Current / Future / Peak
- Hover viser % gjennomført

### Pyramide-explainer-card (8-col)
Donut + "Hvorfor akkurat denne fordelingen? →" link (åpner PyramidExplainerModal — agent-rasjonale)

### Agent-godkjent-strip (4-col)
2 nylige plan-actions: "TEK-volum øket 28 → 34 %" + "Pauseuke uke 22" — klikk → PlanActionDetailModal

### Ukens 5 økter (12-col)
Horisontal grid med 5 økt-cards:

| Dag | Type | Status |
|---|---|---|
| **I dag · 14:00** | TEK 1:1 — Pitch 50-100m | Klar (lime CTA `Start økt →`) |
| I morgen 16:00 | SLAG | Planlagt |
| Ons 08:00 | SPILL | Planlagt |
| Tor 16:00 | FYS | Planlagt |
| Fre 14:00 | TEK 1:1 | Planlagt |

## Drawer (åpen på "Spesifikk (current)")

- Fase-navn + datoer + dager igjen
- Pyramide for fase
- Tester planlagt: 3 rader (Sand-test 12.05, TrackMan-baseline 18.05, Putt-test 25.05)
- Knapper: `Start dagens økt →` (lime) · `Send spørsmål til Anders` · `Se neste fase: Taper →`

## Free-tier lock-overlay

Hvis bruker er Free:
- 40 % opacity over hele tab-innhold
- Stort sentrert lock-card: Lucide `Lock` + "Treningsplan er Pro-feature" + `Oppgrader til Pro →` (åpner UpgradeToProModal)
- Header forblir synlig (uten primary CTA)

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Fase-card | default, hover (lift), current (accent border + lime accent), klikk → modal |
| Stat-rich-card | default, hover, klikk → drawer |
| `Start dagens økt →` | default, hover, loading, disabled (hvis ikke i dag) |
| `Hvorfor akkurat denne fordelingen? →` | default, hover (underline), klikk → modal |
| Økt-card | default, hover, "I dag" (accent ring), klikk → `/portal/sessions/:id` |
| Agent-godkjent-card | klikk → PlanActionDetailModal |

## Empty / loading / error

- **Empty (ingen plan):** "Anders har ikke laget plan ennå. Be om plan →" (åpner RequestPlanChangeModal)
- **Tier-locked (Free):** Hele content-area med 40 % opacity + lock-card
- **Loading:** Skeleton fase-stripe + ukens-økter
- **Phase status:** Done (checkmark + dempet) / Current (accent border) / Future (muted) / Peak (gold)

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen
- **Plan:** "Sommer-toppform" av Anders Kristiansen
- **Periode:** 9. mai – 30. juni 2026
- **Fase:** 3 av 5 (Spesifikk), 64 % gjennomført
- **I dag:** TEK 1:1 Pitch 50-100m, 14:00

## Ønsket output fra Claude Design

1. Lyst tema, Aktiv-tab default
2. Mørkt tema, samme
3. Drawer åpen på Spesifikk (current)
4. Free-tier lock-overlay
5. Empty: ingen plan
6. Tab-bytte til Historisk
7. Mobil ≤640px — fase-cards horisontal scroll, ukens-økter stables vertikalt

## Ikke-mål

- Ikke designe `PhaseDetailModal`, `PyramidExplainerModal` (egne fase-pakker)
- Ikke designe live-session (egen Fase 5-pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
