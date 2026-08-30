/**
 * TL_SCOPE — Train-lock-omskygging for Workbench-uka (D3, 25.08.2026).
 *
 * Fasit: designsystem/train-lock/A-16 Mac Uke lys.dc.html
 * Fasit: designsystem/train-lock/A-17 Mac Okt lys.dc.html
 * Lys modus er samme flater med inverterte --tl-*-verdier (sort fill) —
 * tokene bor lys på `:root` og mørk på `html[data-v2-tema="dark"]`, så
 * A-16/A-17 dekkes av dette skopet uten egen skjermkode (D-LYS-beslutningen
 * 26.08.2026: mekanisk avledet lys fra tokensettet er godkjent metode).
 *
 * Workbench-uke gjenbruker delte v2-komponenter (Knapp, Inspektorpanel,
 * BunnArk, TimeGrid, Input, Select, Dialog — CLAUDE.md §Design: «Port HTML
 * 1:1: nei. Gjenbruk Button/Modal/TimeGrid/SessionCard»). De leser farge og
 * skrift fra CSS-egendefinerte variabler i tre lag (--v2-*, --p-*, og
 * shadcn-basen sine --color- og --font-variabler). I stedet for å skrive om hver delt fil
 * (som ville endret utseendet på HELE appen), skygger denne fila variablene
 * lokalt på Workbench-ukas rot-wrapper — kaskaden treffer alle etterkommere
 * (ingen portal i Dialog/BunnArk her, verifisert), men ingenting utenfor
 * denne skjermen.
 *
 * Kjent grense (dokumentert i docs/natt/D3-DONE.md): geometri som er
 * hardkodede TALL i `T` (src/lib/v2/tokens.ts), f.eks. `TL.radius.card = 12`, kan
 * IKKE skygges via CSS-variabler — de er bakt inn i JS ved rendring. Delte
 * komponenter beholder derfor Paper-radius (12/8) der Train-lock ber om
 * 20/999/16. Egen markup i WeekGrid/Topplinje bruker `TL.radius.*` direkte
 * og er derfor pikselriktig.
 *
 * Kilde for verdiene: src/styles/train-lock-tokens.css (--tl-*).
 */
import type { CSSProperties } from "react";

export const TL_SCOPE = {
  // ── v2-laget (Knapp, Inspektorpanel, BunnArk, TimeGrid, Icon-farger) ──
  "--v2-bg": "var(--tl-scene)",
  "--v2-panel": "var(--tl-elev)",
  "--v2-panel2": "var(--tl-dock)",
  "--v2-panel3": "transparent",
  "--v2-border": "var(--tl-hair)",
  "--v2-border-s": "var(--tl-hair)",
  "--v2-track": "var(--tl-dim)",
  "--v2-fg": "var(--tl-text)",
  "--v2-fg2": "var(--tl-mute)",
  "--v2-mut": "var(--tl-mute)",
  "--v2-lime": "var(--tl-fill)",
  "--v2-on-lime": "var(--tl-on-fill)",
  "--v2-cta": "var(--tl-fill)",
  "--v2-on-cta": "var(--tl-on-fill)",
  "--v2-handling": "var(--tl-fill)",
  "--v2-on-handling": "var(--tl-on-fill)",
  "--v2-handling-soft": "var(--tl-dock)",
  "--v2-up": "var(--tl-text)",
  "--v2-down": "var(--tl-danger)",
  "--v2-warn": "var(--tl-warn)",
  "--v2-info": "var(--tl-mute)",
  "--v2-font-mono": "var(--tl-font-mono)",
  // ── shadcn-basen (Input/Select/Dialog i ui/) ──
  "--color-background": "var(--tl-scene)",
  "--color-foreground": "var(--tl-text)",
  "--color-card": "var(--tl-elev)",
  "--color-card-foreground": "var(--tl-text)",
  "--color-secondary": "var(--tl-dock)",
  "--color-secondary-foreground": "var(--tl-text)",
  "--color-muted-foreground": "var(--tl-mute)",
  "--color-border": "var(--tl-hair)",
  "--color-input": "var(--tl-hair)",
  "--color-ring": "var(--tl-fill)",
  "--font-sans": "var(--tl-font-sans)",
  "--font-display": "var(--tl-font-sans)",
  "--font-mono": "var(--tl-font-mono)",
} as CSSProperties;
