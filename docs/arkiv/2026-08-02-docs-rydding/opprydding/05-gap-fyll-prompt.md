# Gap-fyll-prompt til Claude Design («AK Golf HQ Design System»)

Denne prompten samler alt oppryddingen (Fase 4) fant at DESIGNSYSTEMET manglet.
Lim hele «PROMPT»-blokken under inn i Claude Design-prosjektet. Den er skrevet mot
prosjektets egne konvensjoner: én komponent per fil, `.jsx` + `.d.ts` + `.prompt.md`,
tokens fra `tokens/*.css`, aldri rå hex.

**Omfang:** 2 nye komponenter + 3 utvidelser (+ 1 valgfri). Ikke rør noe annet.
De 3 gjenværende `PulseDot`-importene i appen (marketing) lukkes så snart `StatusDot`
er tegnet og portet.

**Utenfor denne prompten (kode-side, IKKE Claude Design):** `Card.title`-typefiks (#7),
`hjem-data.ts` død kode (#8), `SegmentedTabs` onChange-Omit (#10) — de fikses i repoet.

---

## PROMPT

Bygg følgende inn i AK Golf HQ Design System. Speil eksisterende komponenter og
tokens før du finner opp noe. Alle farger fra `tokens/*.css` (`--signal`, `--axis-*`,
`--warning`, `--destructive`, `--text-muted` osv.) — aldri rå hex. Alle animasjoner
respekterer `prefers-reduced-motion`. Én komponent per fil med `.jsx`, `.d.ts` og
`.prompt.md`, samme mal som `components/core/Tag.*`.

### 1 — NY: `StatusDot` (components/core/StatusDot.jsx)

En liten status-prikk. Erstatter tre eldre app-varianter (pulse-dot, presence-dot,
severity-dot) med ÉN primitiv.

- **Props:** `tone` (`signal` | `online` | `busy` | `warning` | `critical` | `idle`),
  `pulse` (boolean — pulserende glød, default av), `size` (`sm` 6px | `md` 8px | `lg` 10px),
  `overlay` (boolean — absolutt nederst-høyre, ment inni en `position:relative` avatar-boks,
  med 2px ramme mot flaten).
- **Farger via tokens (løser lime-invarianten automatisk):** `signal`→`--signal`
  (forest på lys, lime på mørk), `online`→`--up`, `busy`→`--destructive`,
  `warning`→`--warning`, `critical`→`--destructive`, `idle`→`--text-muted`.
- **Puls:** myk `box-shadow`-glød som ånder (samme uttrykk som `Tag variant="live"`
  sin dot). Av som default; på via `pulse`. Respekter reduced-motion.
- **A11y:** dekorativ (`aria-hidden`) når den ledsager tekst; når den står alene som
  status, ta `aria-label`.
- **Bruk heller …:** `Tag variant="live"` når prikken hører til en pill med tekst.

### 2 — NY: `AkseFordelingsBar` (components/data/AkseFordelingsBar.jsx)

Kompakt stablet 1-bar som viser prosentfordeling over de fem pyramide-aksene
FYS/TEK/SLAG/SPILL/TURN. IKKE en pyramide, IKKE per-akse-rader.

- **Props:** `dist` (`{fys,tek,slag,spill,turn}` — tall som summerer ~100),
  `showLegend` (boolean), `height` (default 8px), `className`, `style`.
- **Anatomi:** én avrundet horisontal bar (radius pill), fem segment i rekkefølge,
  hvert segment i sin `--axis-{fys,tek,slag,spill,turn}`-farge, bredde = prosent.
  Valgfri legend under: fem mono-caps-etiketter med fargeprikk + `%`.
- **Skille fra naboer:** `Pyramid` = per-akse rader med verdier; `SgKategoriBar` =
  SG per SG-kategori (OTT/APP/ARG/PUTT). Denne er den kompakte helhets-fordelingen.
- **A11y:** `role="img"` + `aria-label` som lister fordelingen i tekst.

### 3 — UTVID: `Periodeplan` — fritt navngitte perioder

Årsplanen (`/portal/tren/aarsplan`) bruker AK-periodenavn (GRUNN/SPES/TURN + egne),
ikke L-fase-enumen. Gantt-visualen er allerede riktig — bare navnemodellen låser.

- La `Phase.label` godta en fri streng I TILLEGG til kanon-enumen
  (Base·Forberedelse·Spesialisering·Nedtrapping·Peak). Behold enum-fargene som
  default; ukjent/fri label får en nøytral fase-tone (`--phase-base`).
- Ikke bryt eksisterende bruk: L-fase-labels ser uendret ut.
- Oppdater `.prompt.md`: nevn at frie periodenavn er tillatt for AK-periodisering,
  men behold advarselen «omtal aldri makro-fasene som L-faser».

### 4 — UTVID: `VisningsVelger` — «År»-visning

- Legg `aar` til `KalenderVisning`-enumen (`agenda | uke | maned | tidslinje | aar`),
  tab-label «År». Alt annet uendret. Triviell.

### 5 — UTVID: `Tag` — `warn`-variant

- Legg `warn` i `TagVariant`: gul/oransje status via `--warning`-tokenet (finnes i v14),
  samme tint-mønster som `up`/`down` (bakgrunn = `color-mix(... --warning 15%)`,
  tekst = `--warning`). Oppdater `.d.ts` + `.prompt.md` (én linje i variant-lista).
- Dette lukker de midlertidige `outline`+inline-warning-style-workaroundene i appen
  (plan-status «venter», okt-status «om 2 timer», team-billing-rolle).

### 6 — FIKS: `.d.ts`-kontrakter som kolliderer med native HTML-attributter

`Card.d.ts` (og `SegmentedTabs.d.ts`) gjør `interface Props extends React.HTMLAttributes<…>`
og redefinerer samtidig et native attributt med uforenlig type — `Card.title` som
`React.ReactNode` (native `title` er `string`), `SegmentedTabs.onChange` med egen signatur.
Det gir TS-feil så snart en konsument sender en ReactNode-tittel til `Card`. Fiks:
`interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title">` (og
tilsvarende `Omit<…, "onChange">` for SegmentedTabs). Gjelder ethvert DS-.d.ts med samme
mønster — gjør en rask sveip. (Var registrert som lokal port-bug #7; bekreftet i DS-kilden.)

### 7 — VALGFRI: `SegmentedTabs` — count-badge per fane

Gamle TabBar viste antall per fane («Drills · 12»). Nå løst med antall i tekst
(«Drills (12)»). Hvis du vil ha det renere: la `options`-objektet godta `count?: number`
som rendres som en liten mono-teller til høyre for label-en (gjenbruk `CountBadge`-uttrykket).
Ikke-blokkerende — appen funker uten.

---

## Etter at Claude Design har lagt disse inn

1. Hent på nytt via DesignSync (`get_file` per ny/endret komponent).
2. Port til `src/components/athletic/golfdata/` (samme mønster som Fase 4-portene:
   `.jsx`→`.tsx`, CSS→`golfdata.css`, eksport i `index.ts`). **Port også `ListRow`**
   (`components/feedback/ListRow.*` — finnes allerede i DS, ikke tegnet på nytt) — trengs
   til nav-gjelden under.
3. Lukk de 3 siste `PulseDot`-importene (marketing anlegg/junior/playerhq) → `StatusDot`.
4. Bytt `PyrDistBar` (team-kit) → `AkseFordelingsBar`, og fjern `outline`+warning-style-
   workaroundene (14 steder) → `Tag variant="warn"`.
5. **Rydd kanon-gjelden fra parallell-økten** (register #12/#13): `HybridHomePage`
   «Hovedverktøy»-flisene → `ListRow` (eller golfdata `Button` som lenke); `agency-cockpit`
   «Ett klikk»-pill-raden → golfdata `Button variant="secondary"`.
6. Verifiser (`npm run verify` + Playwright-diff), oppdater gap-registeret til LUKKET.
7. Da er appen 100 % på golfdata → **Fase 5** (slett `src/components/athletic/*.tsx`
   + rydd `globals.css`) kan kjøre.

> Vurder samtidig blindsonen (register-notatet): en lint-/review-sjekk som fanger
> håndrullet flis-/kort-UI (`rounded-* + border + bg-card` i skjermer) så token-ren
> håndrulling ikke vokser usett forbi golfdata-kanon igjen.
