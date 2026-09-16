/**
 * AK_SCOPE — AK Golf HQ-omskygging for Workbench (Bølge 1, 16.09.2026).
 *
 * Fasit: `AgencyOS Workbench v0.12.dc.html` i designpakken
 * «AK Golf HQ Design v0.4.17». Tokenverdiene bor i src/styles/ak-hq-tokens.css.
 *
 * HVA DENNE FILA GJØR, I KLARTEKST
 * Workbench er bygget av delte v2-komponenter (Knapp, Inspektorpanel, BunnArk,
 * TimeGrid, Input, Select, Dialog). De henter farge og skrift fra CSS-variabler
 * i to lag: `--v2-*` og shadcn-basens `--color-*`/`--font-*`. (TL_SCOPE nevner
 * et tredje lag, `--p-*` fra Paper — det er utgått og finnes ikke lenger i
 * kodebasen, kontrollert 16.09.2026.)
 * I stedet for å skrive om hver delt komponent — som ville endret utseendet på
 * HELE appen — setter denne fila nye verdier for de variablene på Workbenchs
 * rot-wrapper. Kaskaden treffer alt under den, og ingenting utenfor.
 *
 * Dette er nøyaktig samme grep som `TL_SCOPE` (wb-tl-scope.ts) gjør for
 * Train-lock. AK_SCOPE erstatter TL_SCOPE på Workbench når skjermene bygges
 * om; begge kan stå side om side i mellomtiden uten å påvirke hverandre,
 * siden en skjerm bruker én av dem.
 *
 * SAMME KJENTE GRENSE SOM TL_SCOPE
 * Geometri som er hardkodede TALL i `T` (src/lib/v2/tokens.ts), for eksempel
 * `TL.radius.card = 12`, kan IKKE skygges med CSS-variabler — de er bakt inn i
 * JS ved rendring. Delte komponenter beholder derfor sin egen radius der
 * fasiten ber om noe annet (AK: 5/9/14/999 px). Egen markup i Workbench kan
 * lese `--ak-grunn-radius-*` direkte og blir pikselriktig.
 *
 * TO STEDER DER AK OG APPEN ER UENIGE, OG HVA SOM VANT
 *
 * 1. Grønt. AUTORITET.md: «Ingen grønn statusfarge. Amber #8A6A12 og rust
 *    #D81E20 er statusfargene, blå #2B4C7E er informasjon.» Appen har grønt to
 *    steder som ville lekket inn i Workbench: `--v2-up` (= `--tl-ok`, #34C759)
 *    og aksefargene `--v2-ax-fys` (#1a7745) / `--v2-ax-spill` (#5a7200).
 *    Begge overstyres under. Prototypen definerer selv de fem aksefargene
 *    (`const PYR = { FYS: T.bla6, TEK: T.graf8, SLAG: T.rust6, SPILL: T.graf4,
 *    TURN: T.amber6 }`) — blå, grafitt, rust, grafitt, amber. Ingen grønn.
 *    TL_SCOPE gjør det samme for `--v2-up`; aksefargene er nye her.
 *
 * 2. Fokusfarge. Appen bruker CTA-fargen som `--color-ring`. AK har en egen
 *    `--ak-modus-fokus` (rust #9B2415). Den vinner — fokus skal være synlig
 *    som fokus, ikke som «dette er knappen».
 *
 * Farge bærer aldri betydning alene i denne flaten: status har alltid tekst
 * ved siden av fargen. Det er en regel for skjermkoden, ikke noe denne fila
 * kan håndheve.
 */
import type { CSSProperties } from "react";

export const AK_SCOPE = {
  // ── v2-laget (Knapp, Inspektorpanel, BunnArk, TimeGrid, Icon-farger) ──
  // Flatene: prototypen setter Workbench-rammen på `flate` med `flatehevet`
  // topplinje og `bakgrunn` som tilbaketrukket krom (rail, felt, dock).
  "--v2-bg": "var(--ak-modus-flate)",
  "--v2-panel": "var(--ak-modus-flatehevet)",
  "--v2-panel2": "var(--ak-modus-bakgrunn)",
  "--v2-panel3": "transparent",
  "--v2-border": "var(--ak-modus-kant)",
  "--v2-border-s": "var(--ak-modus-kantsvak)",
  "--v2-track": "var(--ak-modus-kantsvak)",

  // Tekst i tre nivåer. AK skiller sekundær (#46443F) fra dempet (#6B6862);
  // Train-lock hadde bare én `mute` og mappet begge dit.
  "--v2-fg": "var(--ak-modus-tekst)",
  "--v2-fg2": "var(--ak-modus-tekstsekundaer)",
  "--v2-mut": "var(--ak-modus-tekstdempet)",

  // Primærhandling. AK har én handlingsfarge (rust-600) med en lysere
  // hover (rust-500). `lime`, `cta`, `handling` og `forest` er fire navn på
  // samme rolle i v2-laget — de peker alle hit, slik TL_SCOPE også gjør.
  "--v2-lime": "var(--ak-modus-handling)",
  "--v2-on-lime": "var(--ak-grunn-farge-hvit)",
  "--v2-cta": "var(--ak-modus-handling)",
  "--v2-on-cta": "var(--ak-grunn-farge-hvit)",
  "--v2-handling": "var(--ak-modus-handling)",
  "--v2-on-handling": "var(--ak-grunn-farge-hvit)",
  "--v2-handling-soft": "var(--ak-grunn-farge-rust-100)",
  "--v2-forest": "var(--ak-modus-handling)",
  "--v2-forest-soft": "var(--ak-grunn-farge-rust-100)",

  // Retning og status. `--v2-up` er grønn i appen (`--tl-ok`) og settes til
  // vanlig tekstfarge — se punkt 1 i filhodet.
  "--v2-up": "var(--ak-modus-tekst)",
  "--v2-down": "var(--ak-modus-fare)",
  "--v2-warn": "var(--ak-modus-advarsel)",
  "--v2-info": "var(--ak-modus-informasjon)",

  // Øktbudsjettets fem akser (FYS · TEK · SLAG · SPILL · TURN).
  // Verdiene er hentet fra prototypens egen PYR-definisjon. Merk at
  // `--v2-ax-*` per i dag ikke leses av noen komponent i src/ — de er
  // definert i globals.css og ubrukt. De settes her likevel, slik at
  // budsjettraden får riktige farger den dagen den bygges, i stedet for å
  // arve grønt fra globals.
  "--v2-ax-fys": "var(--ak-akse-fys)",
  "--v2-ax-tek": "var(--ak-akse-tek)",
  "--v2-ax-slag": "var(--ak-akse-slag)",
  "--v2-ax-spill": "var(--ak-akse-spill)",
  "--v2-ax-turn": "var(--ak-akse-turn)",

  // Dekor. Appens `--v2-tint` og `--v2-vignett` er oransje anstrøk og
  // `--v2-niva-grad` en grønn gradient — ingen av dem finnes i AK-fasiten.
  // De nulles ut framfor å oversettes, så de ikke dukker opp som farge uten
  // betydning. `--v2-niva-grad` er i tillegg den siste grønnkilden i laget.
  "--v2-tint": "none",
  "--v2-vignett": "transparent",
  "--v2-niva-grad": "var(--ak-modus-kantsvak)",
  "--v2-shadow": "var(--ak-grunn-skygge-overlegg)",
  "--v2-seg-skygge": "var(--ak-grunn-skygge-loftet)",

  "--v2-font-mono": "var(--ak-grunn-typografi-familie-meta)",

  // ── shadcn-basen (Input/Select/Dialog i ui/) ──
  "--color-background": "var(--ak-modus-flate)",
  "--color-foreground": "var(--ak-modus-tekst)",
  "--color-card": "var(--ak-modus-flatehevet)",
  "--color-card-foreground": "var(--ak-modus-tekst)",
  "--color-secondary": "var(--ak-modus-bakgrunn)",
  "--color-secondary-foreground": "var(--ak-modus-tekst)",
  "--color-muted-foreground": "var(--ak-modus-tekstdempet)",
  "--color-border": "var(--ak-modus-kant)",
  "--color-input": "var(--ak-modus-kant)",
  "--color-ring": "var(--ak-modus-fokus)",

  // AK skiller display (Oswald) fra brødtekst (Archivo). Train-lock brukte
  // samme familie til begge, så `--font-display` pekte på sans der.
  "--font-sans": "var(--ak-grunn-typografi-familie-tekst)",
  "--font-display": "var(--ak-grunn-typografi-familie-display)",
  "--font-mono": "var(--ak-grunn-typografi-familie-meta)",
} as CSSProperties;
