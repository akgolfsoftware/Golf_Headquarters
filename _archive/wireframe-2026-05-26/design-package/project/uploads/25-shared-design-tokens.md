# AK Golf Platform — Shared — Design-tokens (intern viewer)

## Identitet

- **Produkt:** Shared / cross-cutting (designer/dev-flate)
- **URL:** `/admin/design/tokens`
- **Arketype:** G — Other (katalog med tabs + live preview)
- **Tier-gating:** Admin + dev
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/design-tokens.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `TokenDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Design-tokens-viewer er live-katalogen over alle CSS-tokens i `globals.css`. Når en designer eller dev lurer på "hva er accent-fargen i dark mode?", finner de svaret her. Read-only fra UI (tokens endres via PR), men har copy-knapper. Tema-bytter kan testes live på selve skjermen.

## Layout — UNIKT for denne skjermen

### Header med tema-bytter
- Italic: *"Hele systemet på ett sted."*
- 3-knapps-toggle: `Lyst (default) / Mørkt / Følg system` — endrer hele preview live

### Tab-bar (6 tabs, sticky)

`Farger | Typografi | Spacing | Radius | Shadows | Motion`

### Tab: Farger (default)

Grid 3-kolonne med fargekort. Hvert kort:
- Stort fargefelt (96px høyde)
- Token-navn (Geist Mono): `--background`
- Tailwind-utility: `bg-background`
- HSL-trippel: `60 11% 97%`
- HEX (auto-konvertert): `#FAFAF7`
- Copy-knapp (kopier Tailwind-utility)
- "Brukt i" (kort liste): "Layout, Card, Sidebar"

5 grupper med H3-headers:
1. **Surface** — background, foreground, card, popover
2. **Brand** — primary, primary-foreground, accent, accent-foreground
3. **State** — secondary, muted, destructive
4. **Form** — border, input, ring
5. **Pyramide** — pyr-fys, pyr-tek, pyr-slag, pyr-spill, pyr-turn

### Tab: Typografi

3 store kort, ett per font:
- **Geist** (sans, default UI) — vist med 6 weights og eksempel
- **Geist Mono** — eksempel: "1 600 kr · +2,4 HCP · 14:32"
- **Instrument Serif** — italic-eksempel: "*Onsdag morgen. 38 spillere venter.*"

Type-skala-tabell under (text-xs til text-5xl).

### Tab: Spacing

Visuell horizontal stack med boxer i alle størrelser (8/16/24/32/40/48/64/96), hver labelet `p-2 = 8px`. Don't-list nedi: `p-1, p-3, p-5, p-7, p-9` (gjennomstreket).

### Tab: Radius

5 boxer med ulike radius (sm/md/lg/xl/2xl/full).

### Tab: Shadows

Tekst: "Vi bruker borders, ikke shadows. Eneste unntak: subtil `shadow-sm` på popover/dropdown."

### Tab: Motion

Tabell med varighet + easing per token.

## KPI-strip — IKKE for denne (rolig viewer)

## Klikkbare elementer

| Element | States |
|---|---|
| Tema-toggle | default, hover, active per tema |
| Tab-bar | default, hover, active (underline accent) |
| Fargekort | default, hover (lift), klikk → `TokenDetailModal` |
| Copy-knapp | default, hover, klikk → toast "Kopiert: bg-primary" |
| Type-eksempel | klikk → modal med rendering-eksempler |

## Empty / loading / error

- Ingen empty (alltid full token-liste)
- **Loading:** Skeleton-grid
- **Tema-bytte:** kort fade-out/in (200ms)

## Ønsket output fra Claude Design

1. Lyst tema, tab Farger
2. Mørkt tema, samme — viser at fargene endrer seg live
3. Tab Typografi
4. Tab Spacing med don't-list
5. Hover på fargekort med copy-tooltip
6. Mobil ≤640px — tabs blir scroll-bar, fargekort 2 kolonner

## Ikke-mål

- Ikke designe `TokenDetailModal` (egen batch)
- Ikke implementere live token-redigering
- Ikke designe Figma-sync

## Når du er ferdig

Lim design-link tilbake til Claude Code.
