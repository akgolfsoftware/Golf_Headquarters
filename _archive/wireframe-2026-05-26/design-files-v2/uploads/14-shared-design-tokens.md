# AK Golf Platform — Shared — Design tokens (intern viewer)

## Identitet

- **Produkt:** Shared / cross-cutting (intern utvikler-flate)
- **URL:** `/admin/design/tokens`
- **Arketype:** F — Settings + profile (read-only viewer + copy)
- **Tier-gating:** Admin + utvikler
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/design-tokens.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `TokenDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Design tokens-viewer viser hele design-systemet i live-format. Når en designer eller dev lurer på "hva er accent-fargen i dark mode?", finner de svaret her. Skjermen er read-only fra UI (tokens endres via PR til `globals.css`), men har copy-knapper for hver token. Skjermen er også stedet hvor tema-bytting kan testes live.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Tab-bar med 6 seksjoner:

**Tabs:** Farger | Typografi | Spacing | Radius | Shadows | Motion

### Tema-bytter (sticky øverst)

3-knapps-toggle: `Lyst (default) / Mørkt / Følg system` — endrer hele skjermens preview live.

### Tab: Farger (default)

Grid 3-kolonne med fargekort. Hvert kort:
- Stort fargefelt (96px høyde)
- Token-navn (Geist Mono): `--background`
- Tailwind-utility: `bg-background`
- HSL-trippel: `60 11% 97%`
- HEX (auto-konvertert): `#FAFAF7`
- Copy-knapp (klikk → kopierer Tailwind-utility)
- Brukt i: "Layout, Card-bg, Sidebar" (kort liste)

Grupper (med H3-headers):
1. **Surface** — background, foreground, card, popover
2. **Brand** — primary, primary-foreground, accent, accent-foreground
3. **State** — secondary, muted, destructive
4. **Form** — border, input, ring
5. **Pyramide** — pyr-fys, pyr-tek, pyr-slag, pyr-spill, pyr-turn

### Tab: Typografi

3 store kort, ett per font:
- **Geist** (Sans, default UI) — 6 weights vist (400/500/600/700/800/900) med eksempel-tekst
- **Geist Mono** — eksempel: "1 600 kr · +2,4 HCP · 14:32"
- **Instrument Serif** — italic eksempel: "*Onsdag morgen. 38 spillere venter.*"

Type-skala-tabell:
| Klasse | Størrelse | Line-height | Bruk |
|---|---|---|---|
| `text-xs` | 12px | 16px | Captions, helper-text |
| `text-sm` | 14px | 20px | Body default |
| `text-base` | 16px | 24px | Body large |
| `text-lg` | 18px | 28px | Lead-tekst |
| `text-xl` | 20px | 28px | H4 |
| `text-2xl` | 24px | 32px | H3 |
| `text-3xl` | 30px | 36px | H2 |
| `text-4xl` | 36px | 40px | H1 |
| `text-5xl` | 48px | 1 | Hero (ofte italic display) |

### Tab: Spacing

8pt-grid visualisert:
- Horizontal stack med boxer i alle størrelser (8/16/24/32/40/48/64/96)
- Hvert box har label `p-2 = 8px`
- Don't-list: `p-1, p-3, p-5, p-7, p-9` (gjennomstreket med rød tekst)

### Tab: Radius

5 boxer med ulike radius:
- `rounded-sm` (8px) — badges
- `rounded-md` (12px) — inputs, knapper
- `rounded-lg` (16px) — cards, panels (default `--radius`)
- `rounded-xl` (12px hardkodet)
- `rounded-2xl` (16px hardkodet) — hero-cards
- `rounded-full` — pills, CTAs, avatarer

### Tab: Shadows

Ingen — vi bruker borders, ikke shadows. Eneste unntak: subtil `shadow-sm` på popover/dropdown.

### Tab: Motion

Tabell:
| Token | Varighet | Easing | Bruk |
|---|---|---|---|
| `--motion-fast` | 120ms | `ease-out` | Hover-states |
| `--motion-default` | 200ms | `ease-in-out` | Mest UI |
| `--motion-slow` | 320ms | `ease-in-out` | Modal open/close |

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Tema-toggle | default, hover, active per tema |
| Tab-bar | default, hover, active (underline accent) |
| Fargekort | default, hover (lift), klikk → `TokenDetailModal` (full info) |
| Copy-knapp | default, hover, klikk → toast "Kopiert: bg-primary" |
| Type-eksempel | klikk → modal med rendering-eksempler i ulike kontekster |

## Empty / loading / error

Felles arketype-F + UNIKT:
- Ingen empty (alltid full token-liste)
- **Lasting:** Skeleton-grid for fargekort
- **Tema-bytte-loading:** kort fade-out/in (200ms)

## Ønsket output fra Claude Design

1. Lyst tema, tab Farger (alle grupper synlig)
2. Mørkt tema, samme — viser at fargene endrer seg live
3. Tab Typografi med 3 fonter rendret
4. Tab Spacing med 8pt-grid og don't-list
5. Hover-state på fargekort (lift + copy-tooltip)
6. Mobil ≤640px — tabs blir scroll-bar, fargekort 2 kolonner

## Ikke-mål

- Ikke designe `TokenDetailModal` (egen batch)
- Ikke implementere live token-redigering (PR-flow forblir kodebase)
- Ikke designe Figma-sync (egen prosjekt)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
