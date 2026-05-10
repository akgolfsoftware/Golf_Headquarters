# AK Golf Platform — Modal — RoundInsightModal

## Identitet

- **Type:** Modal (sentrert, 640px bred)
- **Åpnes fra:** Runder-list "Insight"-knapp · Coach-detalj kommende runder
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/round-insight.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Hurtig agent-insight på en runde, uten å åpne hele RoundDetailModal. Brukes for å se "hva lærte vi av denne runden" i feed-format.

## Layout

### Header
- Lucide `Sparkles` 20px på lime accent
- Tittel: `Insights fra runden` (Geist 18px)
- Sub: `GFGK Bossum 18 hull · 8. mai 2026`
- `×`-lukk

### Body (3 insight-cards stable)

#### Card 1: Hovedinnsikt (lime accent)
*"Du tjente 1,2 SG på driver — beste driver-dag siste 6 uker. Continue å trene baseline-svinger."*
- Klikk → `Se SG-detaljer →` (åpner RoundDetailModal SG-tab)

#### Card 2: Forbedringsområde (warning amber)
*"Du mistet 0,4 SG på APP-shot fra 100-150m. 3 av 5 bom høyre."*
- Knapp: `Legg til som test-mål →` (åpner NewTestModal)

#### Card 3: Sammenligning (info muted)
*"Putt-snitt 1,55/hull er over peer-snittet (1,68). Best i WANG-laget denne uka."*
- Knapp: `Se peer-sammenligning →` (åpner ComparisonModal)

### Footer
- `Lukk` (ghost)
- `Se hele runden →` (lime CTA, åpner RoundDetailModal)

## States

| State | Beskrivelse |
|---|---|
| Default | 3 insight-cards |
| Loading insights | Skeleton 3 cards |
| Empty (TrackMan-not-connected) | Single card: "Trenger TrackMan-data for insight" + CTA |
| Free-tier | Lock-overlay over Card 2 og Card 3 |
| Auto-dismiss | Hvis åpnet fra notifikasjon: 30s timer + manual dismiss |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| Insight-card | default, hover (lift), klikk på link i card |
| `Se SG-detaljer →` | default, hover, klikk → switch modal |
| `Legg til som test-mål →` | default, hover, klikk → NewTestModal |
| `Se peer-sammenligning →` | default, hover, klikk → ComparisonModal |
| `Se hele runden →` | default, hover, loading |

## Eksempel-data

- **Runde:** GFGK Bossum 18 hull, 8. mai 2026
- **Spiller:** Markus Roinås Pedersen
- **Hovedinnsikt:** +1,2 SG på driver, beste på 6 uker
- **Forbedring:** -0,4 SG APP fra 100-150m
- **Peer:** Putt-snitt best i WANG denne uka

## Ønsket output fra Claude Design

1. Lyst tema, default 3 cards
2. Mørkt tema, samme
3. Empty (TrackMan-not-connected)
4. Free-tier lock på Card 2 og 3
5. Loading-state
6. Mobil ≤640px — modal blir bottom-sheet

## Ikke-mål

- Ikke designe RoundDetailModal (pakke 18)
- Ikke designe ComparisonModal (pakke 20)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
