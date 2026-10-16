# Better-ui-polering — 27.09.2026

Poleringspass over hele AK Golf Precision Athletics. Ingen ny retning: palett, fonter, akseregler og produktregler er uendret. Metoden er better-ui: konsentrisk radius, flatedybde, optisk justering, ikonvekt, treffflater, trykkfeedback og eksakte overganger.

Bevart uendret: PH-A01–A08, AG-A01–A08, alle komponenter i `components/interaction` og `components/analysis` (bare polert), brutto score, «—», SG med fortegn og komma, kilde/dato/n, Caddie/Jarvis som utkast. Team Norway og WANG er ikke rørt.

## 1. Designsystem-endringer (registrert)

| Token / regel | Før | Nå | Hvorfor |
|---|---|---|---|
| `--press-scale` | `.98` | `.96` | better-ui trykk: tydelig, kort |
| `--dur-press` | `120ms` | `150ms` | samme varighet som farge — én rytme |
| `--press-scale-card` | (`.995` hardkodet) | `.99` token | kort er store; .96 blir for mye |
| `[data-theme="night"]` trykk | `.98` | `1` (statisk) | Live og utendørs: ingen skalering mens hånden beveger seg |
| `--dur-swap` / `--ease-swap` | — | `300ms` / `cubic-bezier(.2,0,0,1)` | kontekstuelt ikonbytte (ingen framer i prosjektet, derfor CSS) |
| `--radius-inner` | `6px` | `4px` | konsentrisk: segmentert kontroll har 3 px padding + 1 px kant → 8 − 4 = 4 |
| `--shadow-card` | `0 1px 0 rgba(20,20,19,.05)` | `none` | kort er struktur, ikke elevation. Hairline alene. |
| Readme «Press» | `.98` 120ms, `.995` kort | `.96` 150ms, `.99` kort, statisk i natt | |

Skygge brukes nå bare for faktisk elevation: `--shadow-pop` (popover, dropdown, toast, dra-forhåndsvisning), `--shadow-modal` (sheet, dialog), `--shadow-raised` (valgt segment — tommel over spor).

## 2. Endringer per prinsipp

**A. Konsentrisk radius**
- Segmentert kontroll: indre valg 4 px i ytre 8 px (`--radius-inner`).
- Søkefeltets tøm-knapp: 4 px inne i 8 px felt.
- SortableList løftet element og Øktbygger-rader inne i DropZone (8 px padding): `--radius-inner`.
- Datamerker til 0 (`--radius-mark`): AxisVolumeBars-spor, EmptyAnalysisState-fremdrift, DistributionPlot-bakgrunn.
- Regel: tett nesting (padding ≤ 8 px) → indre = ytre − padding. Padding 12–24 px → egne flater, begge 8 px. Over 24 px → alltid egne flater.

**B. Flatedybde**
- Kort uten skygge. Hairline for struktur.
- InsightCard: kilde og handlinger i et eget bånd med hairline over (i stedet for løse elementer), `margin-top:auto` så kortene i et rutenett får handlinger på samme linje.
- Bilder: `.pa-avatar img`, `img[data-photo]`, `.pa-photo` får 1 px kontur, ren svart 10 % i lyst og ren hvit 10 % i natt.

**C. Optisk justering**
- Knapper med ikon: ikonsiden 2 px mindre padding (`pa-btn--icon-l` / `--icon-r`, settes av `Button`). sm 10/12, md 14/16, lg/xl 18/20.
- `play` og `send` flyttes 1 px mot høyre, `skip-forward` 0,5 px (`data-icon` på `Icon`).
- Tall: `font-variant-numeric: tabular-nums` globalt (fra før). Tabellkolonner med `mono` høyrejusteres.

**D. Ikoner**
- Lucide via CSS-maske beholdes (én stil, `currentColor`). Maske kan ikke endre strek, så vekt styres med størrelse: synlig strek = størrelse / 12.
  - 16 px → 1,33 px (meta, sm-knapper) · **18 px → 1,5 px (vanlig tekst, md-knapper)** · 20 px → 1,67 px (standard) · 24 px → 2 px (semibold, overskrifter, Live).
- Tilstand via `currentColor` og opasitet, aldri egen SVG. Ikon alene har alltid `label`/`aria-label` (IconButton krever `label`).

**E. Motion**
- Ingen `transition: all` igjen: 6 steder i `ui_kits` (analyse-SGBar, PlanParts, fire toppidrett-utkast) byttet til eksakte egenskaper. 8 steder `background`/`border` presisert til `background-color`/`border-color`.
- Trykk `.96` 150ms ease-out på knapp, ikonknapp, valgpille, bookingtid. Kort `.99`. Statisk i natt og ved redusert bevegelse.
- `pa-swap`: opasitet 0 → 1, skala .25 → 1, blur 4 px → 0, 300ms. Brukt på ActionBar-status (Lagrer → Lagret). Kjøres ikke ved første render av lister.
- Temabytte: `.pa-theme-switching` på `<html>` i to bilder slår av alle overganger → ingen crossfade av hele siden. Katalogen i PlayerHQ bruker det.
- Dra: `cursor: grab/grabbing`, halv opasitet på kilden, 2 px grafitt slipplinje, DropZone-kant som statisk signal. DropZone har eksakte overganger på bakgrunn og kant.

**F. Treffflater**
- Usynlig utvidelse til minst 44 px uten å endre tegnet størrelse: sm-knapp (32 → 44), sm-ikonknapp, valgpille (40 → 44), filter (36 → 44), segment (32 → 44), søk-tøm. Checkbox og bryter: `min-height: 44px`.
- Live: Avslutt-dialogen og pause-knappen er nå `xl` (56 px). Slagteller var 56–72 px fra før.
- Sticky handlingsrad: `main { scroll-padding-bottom }` så fokusert felt ikke havner bak raden. Toast løftes over raden (`--toast-offset` via `:has(.pa-actionbar--sticky)`).
- Destruktiv handling står alltid venstre i ActionBar, primær høyre; på mobil bryter de på egne linjer.

**G. Analyse**
- InsightCard, SourceBadge, DataQualityBadge, EvidenceDrawer og EmptyAnalysisState deler rytme: pille-rad → tittel → årsak → evidens → anbefaling → bånd med kilde og handlinger.
- SG: symmetrisk skala og tykk nullinje (fra før), nå uten radius på datamerker.

## 3. Funn som gjenstår

| Nivå | Funn | Hvor | Forslag |
|---|---|---|---|
| MEDIUM | Kort i kort flere steder (f.eks. `pa-card` med `pa-card`-rader inne) | AG-01 Cockpit, PH-24 Meg, toppidrett-utkast | Bytt indre kort til rader med hairline eller sunken bånd ved neste skjermpass |
| MEDIUM | Ikonstrek er fast 2 px i Lucide-masken; 1,5 px nås bare med 18 px ikon | Alle | I appen: bruk `lucide-react` med `strokeWidth` 1,5 / 2 / 2,5 etter tekstvekt |
| LOW | Hardkodet `borderRadius: 8/6/3/2` i inline-stil i eldre skjermfiler | ~40 steder i `ui_kits` | Erstatt med `var(--radius)` / `--radius-inner` / `--radius-mark` ved port til kode |
| LOW | `pa-swap` brukt bare på ActionBar-status | Komponenter | Utvid til Live pause/play og kopier/kopiert når de bygges i appen |
| LOW | Toppidrett-utkastene (`ui_kits/toppidrett`) er kildemateriale og ikke fullt polert | TOS | Behandles hvis de blir skjermtyper |

Ingen HIGH-funn.

## 4. Hva Codex bygger først

1. Tokens: `--press-scale .96`, `--dur-press 150ms`, `--press-scale-card .99`, `--radius-inner 4px`, `--shadow-card none`, `--dur-swap`, `--ease-swap`, natt-overstyring.
2. Globale regler fra slutten av `components/components.css` («Better-ui-polering»): optisk padding, treffutvidelse, bildekontur, `pa-swap`, temabytte-sperre, `scroll-padding-bottom`, `--toast-offset`.
3. `Button`: sett `pa-btn--icon-l/-r`. `Icon`: bruk `lucide-react` med `strokeWidth` etter tekstvekt og `data-icon` for optisk forskyvning.
4. Tema: legg `pa-theme-switching` på `<html>` i to bilder rundt `data-theme`-bytte (`src/lib/v2/tema-default.ts`-flyten).
5. Søk etter `transition: all` og `transition-all` (Tailwind) i `src/` og bytt til eksakte egenskaper.

## 5. Audit

**Audit 27.09.2026 etter better-ui (samme dag, kjørt etter at alle endringer var på plass):** PlayerHQ 34 skjermtyper × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 1 360 tilfeller, 0 avvik. AgencyOS 32 skjermtyper (inkl. AG-A01–A08) × 4 tilstander + AgencyOS-kit (Øktbygger, Workbench, Kalender m.fl.) + systemtilstander (offline, 404/500, tomme) × 5 bredder = 700 tilfeller, 0 avvik. Til sammen 2 060 tilfeller, 0 avvik. Sjekket: horisontal rulling og klipping (doc + main), høyst én rust, hurtigknapp bare i AgencyOS.

**Ikke automatisk verifisert:** dra over / slipp / ugyldig mål, ConflictSheet, UndoToast over sticky ActionBar, trykk-skalering og `pa-swap` i bevegelse, temabytte uten crossfade, 44 px treffutvidelse (måles ikke av audit), forelder, booking, konto, statistikk og e-post (ikke kjørt i dette passet; siste kontroll 0 avvik før polering). Disse er kontrollert for hånd i katalogene eller står åpne — ikke regnet som godkjent.

## 6. Designkort oppdatert

- `guidelines/motion.html`: «150 press · 150 colour · 200 selection · 250 sheet», .96/.99, statisk natt, ikonbytte.
- `guidelines/elevation.html`: kort = hairline, skygge bare elevation, fotokontur.
- `guidelines/radius.html`: indre 4 px og nestingsregel.
- Komponentnotater: `Button.d.ts`, `IconButton.d.ts`, `Icon.d.ts`, `Card.d.ts`.
- `overlevering/tokens.css` og tokentabellen i `codex.md` §2 / `index.html` er regenerert.
