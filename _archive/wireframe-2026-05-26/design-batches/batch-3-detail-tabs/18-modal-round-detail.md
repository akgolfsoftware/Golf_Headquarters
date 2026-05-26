# AK Golf Platform — Modal — RoundDetailModal

## Identitet

- **Type:** Modal (full-screen drawer på mobil, 880px bred på desktop)
- **Åpnes fra:** Runder-list klikk-rad · 360-profil "Sist runde" · Tournament-detalj
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/round-detail.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Detaljert hull-for-hull-visning av én runde med score, SG-breakdown, og insight. Spilleren ser hvor de scoret bra og hvor de mistet slag.

## Layout

### Header (modal-top)
- Lucide `Flag` 24px + tittel `GFGK Bossum 18 hull` (Geist 20px italic for course-name)
- Sub: `8. mai 2026 · 73 (-1) · Stableford 38 · Anders K coachet`
- Stat-pills (4): `SG-Total +1,2` · `SG-OTT +0,4` · `SG-APP -0,2` · `Putts 28`
- `×`-lukk høyre

### Body (3-tabs i modal)

| Tab | Innhold |
|---|---|
| **Hull-for-hull** (default) | Tabell med 18 rader |
| **SG-breakdown** | 5 kategorier som horisontal bar |
| **Insight** | Agent-insight + relaterte runder |

### Hull-for-hull-tabell (kolonner)

| Hull | Par | Score | +/- | SG-OTT | SG-APP | SG-ARG | Putts |
|---|---|---|---|---|---|---|---|
| 1 | 4 | 4 | E | +0,2 | -0,1 | – | 2 |
| 2 | 5 | 4 | -1 | +0,4 | +0,3 | – | 2 |
| 3 | 3 | 3 | E | – | +0,1 | – | 2 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 18 | 4 | 5 | +1 | +0,1 | -0,4 | -0,2 | 2 |

Klikk-rad → HoleDetailPopover (per-hull mini-detalj med shot-data hvis TrackMan-koblet).

### SG-breakdown-tab

5 horizontale stat-rich-bars med tabular-nums + delta vs gruppe-snitt.

### Insight-tab

Agent-insight-cards:
- "Du tjente flest slag på OTT (+0,4) — bra driver-dag"
- "Mistet 0,4 SG på APP-shot mot grønne fra 100-150m"
- "Putt-snitt 1,55/hull er over peer-snittet (1,68)"

## Footer

- `Eksporter PDF` (ghost, venstre)
- `Logg refleksjon` (secondary, midt)
- `Se i fullskjerm →` (lime, høyre — tar til `/portal/runder/:id`)

## States

| State | Beskrivelse |
|---|---|
| Default | Pre-fylt med runde-data |
| Loading | Skeleton tabell + bars |
| TrackMan-not-connected | Hull-for-hull viser kun score, ingen SG-data, banner "Koble TrackMan for SG-detaljer" |
| Free-tier | SG-tab og Insight-tab låst med lock-overlay |
| Hover hull-rad | Subtil bg-shift |

## Klikkbare elementer

| Element | States |
|---|---|
| Modal tab-strip (3 tabs) | default, hover, active |
| Hull-rad | default, hover, klikk → popover |
| Stat-rich-bar | hover → tooltip med detalj |
| `Eksporter PDF` | default, hover, loading |
| `Logg refleksjon` | default, hover, modal-trigger |
| `Se i fullskjerm →` | default, hover, klikk → naviger |
| `×`-lukk | default, hover |

## Eksempel-data

- **Runde:** GFGK Bossum 18 hull, 8. mai 2026
- **Spiller:** Markus Roinås Pedersen
- **Score:** 73 (-1) Stableford 38
- **Coach:** Anders Kristiansen
- **SG-Total:** +1,2 (best driver-dag på 6 uker)

## Ønsket output fra Claude Design

1. Lyst tema, Hull-for-hull default
2. Mørkt tema, samme
3. Tab-bytte til SG-breakdown
4. HoleDetailPopover åpen på hull 18 (+1)
5. Free-tier lock på SG/Insight
6. TrackMan-not-connected-state
7. Mobil ≤640px — modal full-screen, tabell scroll horisontalt

## Ikke-mål

- Ikke designe full runde-detalj-skjerm (annen batch)
- Ikke designe RoundInsightModal (pakke 19 — relatert men separat)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
