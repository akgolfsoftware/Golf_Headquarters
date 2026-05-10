# AK Golf Platform — Modal — ComparisonModal

## Identitet

- **Type:** Modal (full-screen drawer, 920px bred på desktop)
- **Åpnes fra:** TrackMan-analyse `Sammenligning` · Lag-snitt drawer · 360-profil sammenligning · Mål-detalj peer-bar
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/comparison.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Side-ved-side sammenligning av spilleren mot peer / pro / benchmark. Velg dimensjon (Carry / SG / Pyramide / Tester) og hvem du sammenligner mot.

## Layout

### Header
- Lucide `BarChart3` 20px
- Tittel: `Sammenligning` (Geist 20px)
- Subtittel: `Markus R Pedersen vs WANG-laget snitt · siste 4 uker`
- `×`-lukk

### Velger-rad (under header)
- Dimensjon-chips: **Carry** (active) · SG · Pyramide · Tester
- Sammenlign mot-dropdown: "WANG-laget snitt" / "Pro-baseline (PGA Tour)" / "Peer 17-19 år" / "Tilpasset gruppe..."

### Body (sammenligningsmatrise)

For dimensjon = Carry:

| Klubb | Markus | Sammenligning | Δ | Status |
|---|---|---|---|---|
| Driver | 268m | 244m | +24m | Bedre ✓ |
| 3W | 240m | 218m | +22m | Bedre ✓ |
| 5i | 188m | 175m | +13m | Bedre ✓ |
| 7-jern | 154m | 148m | +6m | Bedre ✓ |
| Wedge | 98m | 102m | -4m | Lavere |
| Putter | 1,55/h | 1,68/h | -0,13 (lower-better) | Bedre ✓ |

Hver rad: progress-bar med to verdier (Markus mørk, sammenligning lys).

### Insight-blokk (under matrise)

Agent-card: *"Markus distanserer seg på langslag (+24m driver), men ligger 4m bak peer på wedge — fokus-område neste fase."*

### Footer
- `Eksporter sammenligning` (ghost)
- `Endre sammenligning` (secondary)
- `Lukk` (lime CTA)

## States

| State | Beskrivelse |
|---|---|
| Default | Carry-dimensjon, WANG-snitt |
| Loading | Skeleton matrise |
| Dimension-bytte | Crossfade matrise-rader |
| Tilpasset gruppe-velger | Sub-modal med søk + multi-select |
| Empty (ingen data å sammenligne) | "Trenger min 5 økter for sammenligning" |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| Dimension-chip | default, hover, active (lime) |
| Sammenlign-dropdown | default, open, item-hover, item-selected |
| Matrise-rad | default, hover (subtle bg-shift) |
| `Eksporter sammenligning` | default, hover, loading |
| `Endre sammenligning` | default, hover, klikk → bytter til velger-modus |

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen
- **Sammenligning:** WANG-laget snitt
- **Periode:** siste 4 uker
- **Insight:** +24m driver vs peer, -4m wedge

## Ønsket output fra Claude Design

1. Lyst tema, Carry-dimensjon default
2. Mørkt tema, samme
3. Dimension-bytte til Pyramide
4. Tilpasset gruppe-velger åpen (sub-modal)
5. Empty (for lite data)
6. Loading-state
7. Mobil ≤640px — matrise stables vertikalt per klubb

## Ikke-mål

- Ikke designe TrackMan-analyse (pakke 11)
- Ikke designe lag-snitt (pakke 06)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
