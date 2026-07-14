# Komplett opprydding — token- og komponentkaos i akgolf-hq

Kontrakt til Claude Code (terminal). Målet: ÉN token-kilde, ETT komponentbibliotek
(golfdata + ui-primitiver), null håndrullet UI, ingen gammel athletic-import, ryddig
`globals.css`. Appen er LIVE (PlayerHQ v1.0) — alt skjer på branch, bak
verifikasjonsloopen, aldri direkte på main.

## Rotårsak (hvorfor det ble kaos)

To token-vokabularer tvunget fra hverandre. `globals.css` bærer shadcn-HSL-tripler
(`--card`, `--foreground`, `--primary`) + fire lag bespoke-navn (brand/cockpit/terminal
`--t-*`/`--cream`/`--pyr-*`). golfdata-tokenene er isolert under `.golfdata-scope` fordi
selv delte navn som `--border` har uforenlige formater (HSL-trippel vs rgba). Derfor kan en
golfdata-komponent aldri arve riktige verdier i en skjerm — og skjermer griper det 95 % av
koden bruker: shadcn-tokens + gammelt athletic + håndrulling.

**Nøkkelinnsikt:** i LYS modus er verdiene nesten identiske allerede (#005840 forest,
#D1F843 lime, #B8852A oker, #2563EB blå, #A32D2D rød). Konvergensen flytter mest på MØRK
modus (bakgrunn → v14 graphite-rampe). Lav risiko i lys, moderat i mørk.

---

## Fase 0 — Branch + baseline (før noe endres)

1. `git checkout -b opprydding/token-konvergens`
2. Playwright: ta baseline-skjermbilder (lys + mørk) av 10 nøkkelskjermer —
   `/portal` (hjem, talent, statistikk, sg-hub, tren/kalender), `/admin` (oversikt,
   stall, workbench, analysere), `/(marketing)` forside. Lagre i `test-results/baseline/`.
   Dette er diff-referansen for hele oppryddingen.
3. Bekreft grønn utgangstilstand: `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`.

## Fase 1 — Token-konvergens (FUNDAMENTET — ~1 fil, høyest gevinst)

Dette alene flytter hele appen visuelt over på DS-verdiene UTEN å røre de 820 filene som
bruker `bg-card`/`text-foreground`/`border-border`. Grepet: la shadcn-@theme-aliasene PEKE
på DS-tokenene.

1. **Løft DS-tokenene ut av `.golfdata-scope`** og inn i `:root` / `.dark` / `.light` i
   `globals.css` (behold appens konvensjon: `:root` = lys, `.dark` = mørk). Verdiene hentes
   1:1 fra `src/styles/golfdata-tokens.css` (v14) — ALDRI gjenskap råverdier:
   appens `:root` får DS-ens `.light`-verdier, appens `.dark` får DS-ens `.dark`-verdier.
2. **Re-pek @theme-aliasene** i `globals.css` fra HSL-wrapper til DS-token:

   | shadcn-alias (uendret navn) | → DS-token (kilde) |
   |---|---|
   | `--color-background` | `var(--bg)` |
   | `--color-card` / `--color-popover` | `var(--surface)` |
   | `--color-secondary` / `--color-muted` | `var(--surface-2)` |
   | `--color-foreground` / `--color-card-foreground` | `var(--text)` |
   | `--color-muted-foreground` | `var(--text-muted)` |
   | `--color-border` / `--color-input` | `var(--border)` |
   | `--color-primary` | `var(--signal)` |
   | `--color-primary-foreground` | `var(--on-signal)` |
   | `--color-accent` | lime (respekter lime-invariant: kun `--signal-fill`) |
   | `--color-destructive` | `var(--destructive)` |
   | `--color-success` | `var(--success)` |
   | `--color-warning` | `var(--warning)` |
   | `--color-ring` | `var(--signal)` |
   | `--color-chart-1..5` / `--pyr-*` / `--color-pyr-*` | `var(--axis-{fys,tek,slag,spill,turn})` |
   | `--radius` / `--radius-card` | `var(--radius-card)` (16px) |

3. **`.golfdata-scope` blir en no-op** (tokenene er nå globale). Behold klassen som tom
   alias midlertidig så eksisterende `golfdata-scope`-wrappere ikke brekker; fjernes i Fase 5.
4. **Verifiser (obligatorisk):** `tsc --noEmit && npm run build` + Playwright-diff mot
   Fase 0-baseline (lys + mørk) + sammenlign mot tilstandsgalleriet (`/admin/tilstander`
   eller `public/design-handover/guidelines/tilstander.html`). Forventet: lys modus ~uendret,
   mørk modus adopterer v14 graphite (#141513-bakgrunn). Ingen layout-brudd.

> Etter Fase 1: hele appen står på ÉN token-kilde. shadcn-tokens = DS-tokens. `ui/`-primitivene
> funker uendret. golfdata-komponenter ser endelig riktige ut i enhver skjerm.

## Fase 2 — Håndhevelse (stopp blødningen)

Legg til i `eslint.config.mjs` (error-nivå, CI-blokkerende — samme som `ui/` allerede har):

1. **Blokker gammel athletic:** `no-restricted-imports` mot `@/components/athletic` og
   `@/components/athletic/*` — UNNTAK: `@/components/athletic/golfdata` + `/golfdata/*`.
   Melding: «Bruk golfdata-komponent eller ui-primitiv. Gammelt athletic er avviklet.»
2. **Blokker rå hex:** CI-gate-script (`scripts/check-no-hex.mjs`) som feiler på nye
   `#[0-9a-fA-F]{6}` i `src/app` + `src/components` (ekskl. `golfdata.css`, `globals.css`,
   `styles/`). Kjøres i `npm run verify` + GitHub Actions.
3. **Legacy-håndtering:** de ennå-ikke-migrerte filene får `// eslint-disable-next-line`
   med `TODO(opprydding)` — fjernes når filen migreres i Fase 4. Ingen NYE brudd slipper gjennom.
4. Legg `check-no-hex` + eslint inn i den eksisterende verifikasjons-kommandoen.

## Fase 3 — Codemod atomene (~80 filer mekanisk)

De seks mest-importerte gamle atomene har rene golfdata-ekvivalenter. Skriv en jscodeshift/
sed-codemod som bytter import + JSX-navn på tvers av `src`:

| Gammel (athletic) | → Ny (golfdata) | Antall importører |
|---|---|---|
| `AthleticEyebrow` | `Eyebrow` | 25 |
| `AthleticBadge` | `Tag` / `CountBadge` | 25 |
| `AthleticButton` | `Button` | 8 |
| `AthleticAvatar` | `Avatar` / `AvatarGroup` | 5 |
| `Sparkline` (gammel) | `Sparkline` (golfdata) | 3 |
| `AthleticCard` / `DataCard` | `Card` | 2 |

Kjør per område, verifiser (`tsc + build + Playwright-diff`) etter hvert. Prop-forskjeller
løses per komponents `public/design-handover/components/**/<Navn>.prompt.md`-kontrakt.

## Fase 4 — Migrer resten i bølger (per MASTER-SKJERMPLAN)

Rekkefølge = minst risiko, delte komponenter først (de kaskaderer):

1. **`src/components/*` (70 filer)** — delte feature-komponenter. Migrer disse først; skjermer
   som bruker dem blir riktige automatisk.
2. **`/portal` (37)** → **`/admin` (31)** → **`/(marketing)` (7)** + **`/forelder` (6)**.

Per skjerm: erstatt håndrullet UI med golfdata-komponent (finnes den ikke → meld gap, ikke
improviser), fjern gammel-athletic-import + eslint-disable, verifiser mot de 6 hakene i
MASTER-SKJERMPLAN + tilstandsgalleriet. Gjenværende større moduler og deres mål:

| Gammel | → Ny |
|---|---|
| `KpiCard/KpiStrip/KpiGrid` | `KpiTile` |
| `KpiRing` | `RingGauge` |
| `PyramidProgress` | `Pyramid` / `PyramideFasett` (port fra handover) |
| `status-pill` / `agency-tags` | `Tag` |
| `filter-pill-bar` | `FilterPills` |
| `tab-bar` | `SegmentedTabs` / `VisningsVelger` |
| `pagination` (gammel) | `Pagination` (handover) |
| `data-table` (gammel) | `DataTable` (golfdata) |
| `data-state` / `ErrorState` | `ui/EmptyState` + golfdata `Skeleton` |
| `hero` / `greeting` | komponer `Eyebrow` + display-h1 (+ `FeaturedCard`/`HeroTall`) |
| `calendars/*` | golfdata kalender-familie (`UkeKalender/TidsGrid/Tidslinje/Periodeplan/DayStrip`) |
| `hooks` (11) | IKKE visuelt — flytt til `src/lib/hooks`, behold logikk |

Håndrullet SVG i skjermer (f.eks. `talent`: MasteryRing→`RingGauge`, PercentileGauge→
`PercentileBar`, StreakTracker→`Heatmap`, LevelLadder→`NivaStige`, JourneyMap→`KategoriStige`)
erstattes med golfdata-komponentene som allerede finnes i handover.

## Fase 5 — Slett og dedupe (når null importører gjenstår)

1. Slett `src/components/athletic/*.tsx` (gammelt bibliotek) + tomme undermapper. Behold KUN
   `athletic/golfdata/`.
2. Rydd `globals.css`: fjern nå-ubrukte token-blokker — terminal `--t-*`, cockpit/design-package,
   `--pyr-*`-duplikatene (nå aliaset), `--cream/--sand/--paper`-aliasene, `gradient-avatar-*`
   (verifiser ubrukt først). Fjern `.golfdata-scope`-no-op når ingen wrapper gjenstår.
3. Audit `src/styles/v2/patterns.css` (kun globals.css importerer den): finn pattern-klasse-bruk
   → inline det som brukes, slett resten + importen.
4. Sluttilstand `globals.css`: DS-token-sett (`:root`/`.dark`/`.light`) + @theme-aliaser +
   noen få base-utilities. Ingenting annet.

## Verifikasjon (hver fase, uten unntak — appen er live)

```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
node scripts/check-no-hex.mjs            # Fase 2+
# Playwright: diff nøkkelskjermer (lys+mørk) mot Fase 0-baseline
```

Merge til main kun når alt er grønt OG skjermbilde-diffen er bevisst godkjent. Én PR per fase
(Fase 4: én PR per bølge). Rull tilbake på branch-nivå ved avvik — aldri `reset --hard` på main.

## Definisjon av ferdig (hele oppryddingen)

- 0 importer av `@/components/athletic/*` (utenom golfdata) — håndhevet av ESLint.
- 0 nye rå hex i skjermer/komponenter — håndhevet av CI-gate.
- 1 token-kilde: shadcn-aliasene peker på DS-tokenene; `.golfdata-scope` borte.
- `globals.css` inneholder kun DS-tokens + @theme + base — ingen bespoke-lag.
- Hver skjerm komponert fra golfdata/ui, verifisert mot tilstandsgalleriet, 6 haker grønne.
