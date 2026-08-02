# Oppdrag: fullfør AK Golf HQ Design System til en komplett v14-handover-ZIP

Du redigerer det levende prosjektet «AK Golf HQ Design System»
(`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`). Målet er ÉN ting:
gjør prosjektet komplett og internt konsistent på v14, og eksporter det som én ZIP
som en Next.js 16 / Tailwind v4-kodebase porter 1:1. Akseptansestandarden er
**diff-til-null**: pikselfidelitet mot kilden, ingen «tolkning».

Dette er en AUDIT + FULLFØRING av et eksisterende prosjekt — ikke en ny start.
Behold API-er, komponentnavn og mappestruktur. Ikke gjenoppfinn, ikke gi nytt navn.

## 0. Behold strukturen (ikke restrukturér)

Eksportstrukturen skal være identisk med dagens handover, slik at repoets
`public/design-handover/` kan erstattes 1:1:

```
styles.css                      (entry — importerer tokens/*.css)
tokens/            base.css · colors.css · typography.css · spacing.css · data-viz.css · fonts.css
components/<gruppe>/<Navn>.{jsx, d.ts, prompt.md}
guidelines/        tilstander.html · tema-bevis.html · colors-* · type-* · elevation · motion · radius · spacing · premium-referanse
DEKNINGSKART.md · MANIFEST.json · PORTING.md · CLAUDE.md · readme.md
assets/            logos/ · imagery/
```

De 14 komponentgruppene beholdes: core, forms, overlays, structure, data,
domain, feedback, golfdata, kategori, trackman, calendar, nav, marketing,
intelligence-laan.

## 1. Tokens — ÉN kilde, fire matriser, v14

- Ett semantisk aksesystem: `:root` (= dark) · `.dark` · `.light`. Fire tema-matriser
  (PlayerHQ lys/mørk + AgencyOS mørk/lys) på SAMME akse — ikke fire separate paletter.
  AgencyOS default mørk, PlayerHQ default lys.
- **Behold v13-verdiene eksakt**, med disse LÅSTE v14-endringene innarbeidet overalt
  (tokens + alle guidelines + alle previews):
  - `--graphite-0: #141513` (variant B «løftet» — erstatter #0A0B0A/#060706. Låst etter fysisk sollys-test.)
  - `--axis-spill-text` (dark): `#F0E6A8` (avmettet varm gull ~55°, erstatter #DFF982 — umulig å forveksle med lime-fyll ved siden av. Verifisert 14,07:1 mot `--surface`.)
- Komplett semantisk sett, begge moduser, for hvert navn:
  `--bg`, `--surface`, `--surface-2`, `--surface-hover`, `--border`, `--border-strong`,
  `--text`, `--text-2`, `--text-muted`, `--text-faint`, `--signal`, `--signal-press`,
  `--on-signal`, `--primary-fill`, `--primary-text`, `--primary-press`, `--signal-fill`,
  `--on-signal-fill`, `--destructive`, `--on-destructive`, `--success`, `--warning`,
  `--up`, `--down`, `--track`, `--glow-signal`, `--sheen-top`,
  `--axis-{fys,tek,slag,spill,turn}` + `-text` + `-soft`,
  `--phase-{base,forberedelse,spesialisering,taper,peak}`,
  `--compliance-{on,off,none}`,
  `--radius-{tag,card,pill,input}`, `--dur-{fast,base,slow}`, `--ease-standard`,
  `--font-{display,ui,mono}`, `--text-11 … --text-60`.
- **Lime-invarianten (ufravikelig):** lime `#D1F843` finnes ALDRI som tekst/linje/flate på
  lys bakgrunn. `--signal` re-mapper til forest (`#005840`) i `.light`. Unntak: lime-FYLL med
  mørk blekk som datamarkør (nå-markør, ett hero-chip) er lov, aldri lime-tekst/-ikon/-outline.
  Semantiske opp/ned på lys flate = mørke AA-toner (`--up #00753A`, `--down #C0392F`).
- Pyramide-/akse-fargene er den KANONISKE 5-fargeskalaen og skal bestå: FYS=forest,
  TEK=oker, SLAG=blå, SPILL=lime, TURN=rød. Disse er kategorifarger — ikke status­farger.
  Statusfarger holdes til lime/coral/grå (signal/compliance). Behold dagens `--success`/
  `--warning`/`--destructive` semantiske tokens.
- WCAG AA: behold kontrast-kommentarene med verifiserte ratioer per token (som i dag).
- Token-laget skal være selvstendig (ingen wrapper-avhengighet) slik at kodebasen kan
  adoptere det direkte som sitt eneste `:root`/`.dark`/`.light`.

## 2. Komponenter — audit → fullfør → kontrakt

Hver komponent i alle 14 grupper skal ha alle tre filene, komplette:

- **`.jsx`** — kun tokens, INGEN rå hex (unntak: dokumentert mørk-innfelling som
  re-asserterer `.dark`-scope). Finner du rå hex → tokeniser.
- **`.d.ts`** — props, varianter, tilstander.
- **`.prompt.md`** — kontrakt i EKSAKT dette formatet (som `DiagnoseKort.prompt.md`/`RingGauge.prompt.md`):
  tittel · én linje hva-det-er + nøkkelatferd · `## Bruk` (jsx-eksempel med ekte props) ·
  `## Domenefasit` (enheter, tokens, baseline-regler) · `## Progressiv dybde` der relevant
  (nybegynner/øvet/elite-gating) · `## Tilstander` · `## Komponerer` (hvilke komponenter den åpner/bygger med).

**Alle tilstander, begge moduser, verifisert i `guidelines/tilstander.html`:**
default · hover · `:focus-visible` · active/pressed · valgt (selected) · loading (skeleton) ·
tomt/onboarding · error · disabled · drag-over (der drag-and-drop finnes).

**Tallregel (ufravikelig i all dataviz):** JetBrains Mono, tabulære sifre. Norske desimaler
med komma, tusen med mellomrom. Tall vises ALLTID med enhet og retning — «12 m H», «148 m ±5»,
«−0,8 slag» — aldri et bart tall. Bias og spredning adskilt.

**Bekreft at disse finnes og er komplette** (skjermene reinventerer dem i dag fordi de mangler
i bruk): `RingGauge` (verdi-/percentil-ring), `PercentileBar`, `Heatmap` (streak/aktivitet),
`Progress`, `NivaStige` (nivåstige), `Laeringstrapp`, `KategoriStige`, `KategoriFjell`,
`Sparkline`, `DeltaIndikator`, `SgTrend`, `DispersionPlot`, `TrajectoryPlot`.

## 3. Fyll designhullene («Mangler helt» — trenger nytt design)

Legg til komponenter + kontrakt + alle tilstander, begge moduser, for:

1. **Fellesmelding til turneringsdeltakere** — trestegs flyt: velg deltakere → skriv → send.
2. **Spiller↔gruppe-veksler** — fast player/group-picker øverst i AgencyOS-toppbaren.
3. **Fokus-spiller-blokk** — manuell pin + AI-forslagsfelt (utvider cockpit-mønsteret).
4. **Mobil-variant av Workbench + AgencyOS** — enten responsiv (desktop-first, men 390px
   definert) ELLER eksplisitt merket desktop-only. FLAGG valget i DEKNINGSKART så Anders bekrefter.

Data-blokkerte flater (shot-map/spredningsplott, scorecard hull-for-hull, live turnerings-
tracking) skal merkes «design klar / data-blokkert» — ikke bygg dataflyt, bare hold designet klart.

## 4. Guidelines — selvbeskrivende fasit

Oppdater alle til v14-verdier: `tilstander.html` (fullt tilstandsgalleri, alle familier ×
alle tilstander × lys/mørk), `tema-bevis.html` (fire-matrise-bevis), `colors-*`, `type-*`,
`elevation`, `motion`, `radius`, `spacing`, `premium-referanse`. Elevation-regelen består:
dark = lysere surface (aldri borders), light = myk skygge.

## 5. DEKNINGSKART.md — rute → komponenter

Oppdater så HVER rute i PlayerHQ (`/portal/*`), AgencyOS (`/admin/*`), Booking, Marketing,
Auth og Forelder mappes til komponentene som komponerer den, med status
(dekket via system / out-of-scope / gjenstår). Dette er det som gjør skjerm-porting
deterministisk. Merk «Elite Fase 2» som bevisst utsatt.

## 6. AK-kanon som må bestå overalt

- **Fonter:** kun Inter (UI), Familjen Grotesk (display), JetBrains Mono (tall).
- **Ikoner:** Lucide, 1,5px strøk. Ingen emoji noe sted.
- **Språk:** all UI-tekst norsk bokmål (æ/ø/å); golf-termer på engelsk (Strokes Gained, Tour, TrackMan).
- **Terminologi:** FYS/TEK/SLAG/SPILL/TURN · Læringstrinn (Kropp/Arm/Kølle/Ball/Auto — aldri «L-fase» i UI) ·
  Situasjon M0–M5 · Press PR1–PR5 · Område (Tee/Innspill/Putting) · fagkoder (M2, PR3, L_BALL)
  KUN i coach-flater og økt-ID · «AgencyOS» (aldri «CoachHQ») · «trening» (aldri «øving»).
- **Anbefalinger, aldri sperrer:** intern skala `ren`/`myk`/`hard` (endres aldri); UI viser klarspråk.
  Ordene «brudd»/«krever begrunnelse»/«overstyr» finnes ikke. Sterkt avvik → coach-varsel-event, aldri blokkering.
- **To-talls-regelen:** Plan-kvalitet (0–100) og Gjennomføring (%) er separate hero-tall.
- **Anbefalingskontrakten:** Hvorfor / Hva / Forventet effekt / Hvorfor nå + primær «Bruk forslag».
- **Priser:** GRATIS · PRO 299 kr/mnd · PRO årlig 2690 kr. «ELITE» finnes ikke som nivå.
- **ThemeToggle** skriver `.light`/`.dark` + `data-theme` + `color-scheme` på nærmeste scope.

## 7. Eksport

Eksporter hele prosjektet som ÉN ZIP med strukturen i §0 intakt. Oppdater `PORTING.md` til v14
og legg ved en kort CHANGELOG v13→v14 (hva endret seg: token-deltaene, nye komponenter, fylte hull).

## Akseptansekriterier (må alle være sanne)

- Ingen rå hex i noen `.jsx`/template (kun tokens).
- Hver komponent har `.jsx` + `.d.ts` + `.prompt.md`, og vises i `tilstander.html` i alle
  tilstander × begge moduser.
- Tokenene er identiske på tvers av de fire matrisene på én akse; v14-deltaene er gjennomført overalt.
- Lime-invarianten holder i alle fire matriser.
- `DEKNINGSKART.md` dekker hver live rute i alle fire produktene.
