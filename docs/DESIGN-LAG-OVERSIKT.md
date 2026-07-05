# Design-lag i AK Golf HQ — komplett oversikt

Skrevet 5. juli 2026 etter full kartlegging av faktisk prosjekt-tilstand (ikke fra hukommelse).
Formålet er å stoppe bortkastet design-/frontend-arbeid ved å gjøre det klart hva som finnes,
hva som er kanon, og hva som er dødt.

---

## TL;DR — den ene regelen

Du har **for mange design-lag som konkurrerer**. Konkret:
- **Tre** sett med grunnkomponenter (Button/Card/Eyebrow finnes tre steder).
- **To** display-fonter lastet samtidig (Familjen Grotesk = kanon, Inter Tight = dødt, men fortsatt lastet).
- **To** token-systemer (`globals.css` app-tokens + `golfdata-tokens.css` v13-tokens).
- **18** design-skills installert med til dels motstridende råd.

**Regelen framover:** v13 (`golfdata`) er den ene komponent-kilden for alt nytt/redesignet.
Familjen Grotesk er den ene display-fonten. Alt annet er vedlikehold-modus (ikke utvid det) eller dødt.

---

## 1. De faktiske lagene (hva som finnes i koden)

### A) v13 design-handover — KILDEN
`public/design-handover/`
- **113 komponenter** (jsx + .d.ts + prompt.md-kontrakt hver) i 14 kategorier: core, data, domain, forms, nav, overlays, structure, feedback, marketing, trackman, calendar, golfdata, kategori.
- **tokens/**: base.css, colors.css, typography.css, spacing.css, data-viz.css, fonts.css.
- **guidelines/**: tilstander.html (tilstandsgalleri), tema-bevis.html, premium-referanse.html, farge-/type-/spacing-spec.
- Dette er **den autoritative designen** — fasit for hvordan alt skal se ut. Men det er et *bibliotek*, ikke ferdige skjermer.

### B) golfdata — v13 PORTET TIL KODE (brukbart lag)
`src/components/athletic/golfdata/` — **25 komponenter i TSX**, koblet og i bruk:
- Fundament: Button, Card, Eyebrow, DataTable, KpiTile, Sparkline, DataPreview, Icon, Skeleton, HeroTall, DeltaIndikator.
- Golf-domene: SgTotalKort, SgKategoriBar, SgTrend, NesteFokusKort, SlagLekkasjeKart, DiagnoseKort, Scorekort, TigerFiveKort, GappingChart, LaunchWindowKort, StrikeSmashKort, PuttModellKort, KategoriKravKort, SpillerTilstandKort.
- **Dette er det du skal bygge nye skjermer av.** Resten av v13 (88 komponenter) er ikke portet ennå — portes ved behov.

### C) golfdata-tokens.css — v13-tokens (scoped)
`src/styles/golfdata-tokens.css` (178 l) — v13-fargene/spacing/type, scoped under `.golfdata-scope`.
Holdt adskilt fra app-tokenene med vilje (ulikt format), så golfdata-komponenter ikke kolliderer.

### D) App-designsystem — det GAMLE (før v13)
Dette er laget skjermene ble bygget på før v13-handoveren:
- `src/app/globals.css` (537 l, 275 CSS-variabler) — **app-tokenene** (shadcn HSL-format). Brukes av *alt* fortsatt.
- `src/components/athletic/*.tsx` — **28 brandede komponenter** (button, card, eyebrow, kpi, sparkline, data-table, badge, avatar, hero, tab-bar, pyramid-progress …). Dette er det gamle branded-biblioteket. Overlapper golfdata.
- `src/components/ui/` — **22 shadcn-primitiver** (Button, Dialog, Input, Tabs …). Det tredje Button-stedet.
- `src/lib/design-tokens.ts` (155 l) — TS-speil av app-tokenene for charts.

### E) Skjerm-/funksjonsspesifikke komponenter (bygget over tid)
Egne mapper per funksjon, bygget på lag D:
`portal/` (20), `admin/` (13), `sg-hub/` (13), `stats/` (26), `workbench-hybrid/` (**41**), `teknisk-plan/` (7), `fys-plan/` (6), `shared/` (31), `marketing/` (9), `forelder/` (6), `hubs/`, `kommando/`, m.fl.
Dette er der de fleste skjermene faktisk bor — bespoke UI, ikke gjenbrukbare komponenter.

### F) Fonter (4 lastet i `layout.tsx`)
- **Familjen Grotesk** — display (KANON).
- **Inter** — brødtekst/UI (kanon).
- **JetBrains Mono** — tall/eyebrows (kanon).
- **Inter Tight** — DØDT/legacy, men *fortsatt lastet*. Skal fases ut (er allerede migrert bort fra i CSS, men lastes og dukker opp i noen inline-styles).

### G) Design-skills (18 installert — sprawl)
`.claude/skills/`: ak-designekspert, ak-golf-hq-design, brandkit, design-taste-frontend, design-vendor, emil-design-eng, frontend-design, gpt-taste, high-end-visual-design, image-to-code, imagegen-frontend-*, impeccable, industrial-brutalist-ui, minimalist-ui, redesign-existing-projects, stitch-design-taste, m.fl.
**Motstridende råd.** Kun `ak-designekspert` er skrevet for dette prosjektet.

### H) Slettet/dødt (bra — ingen forvirring her)
`wireframe/`, `design-package/`, `design-files-v2/`, `docs/design-handoff-komplett/` — **alle slettet.**

---

## 2. Overlappene som koster deg tid

| Overlap | Hvor | Konsekvens |
|---|---|---|
| **Button finnes 3 steder** | `ui/`, `athletic/`, `athletic/golfdata/` | Uklart hvilken å bruke → inkonsistens |
| Card / Eyebrow / Sparkline / DataTable | samme 3 steder | samme |
| **2 display-fonter** | Familjen Grotesk + Inter Tight (begge lastet) | tekst faller til feil font i inline-styles |
| **2 token-systemer** | `globals.css` (HSL) + `golfdata-tokens.css` (v13) | ikke forsonet; golfdata må scopes |
| **v13 er re-skin oppå det gamle** | golfdata + athletic side om side | skjermer er hybrider, ikke ren v13 |
| **18 design-skills** | `.claude/skills/` | motstridende designråd |

---

## 3. Kanon vs dødt — beslutningstabell

| Behov | BRUK (kanon) | IKKE bruk / utvid ikke |
|---|---|---|
| Nye/redesignede skjermer | `athletic/golfdata/` (v13) | `athletic/*.tsx`, feature-bespoke |
| Grunnknapp/kort/eyebrow | golfdata Button/Card/Eyebrow | ui/ og athletic/ sine varianter |
| Design-fasit (utseende) | `public/design-handover/` + prompt.md | gammel juni-fasit (slettet) |
| Display-font | Familjen Grotesk | Inter Tight (dødt) |
| Tall/eyebrow-font | JetBrains Mono | — |
| Farger/tokens (v13-flater) | `golfdata-tokens.css` | hardkodet hex |
| Farger/tokens (app-basis) | `globals.css` | nye token-filer |
| Design-veiledning | `ak-designekspert` (+ v13 guidelines) | de 17 andre skills |
| shadcn-primitiver (dialog/input) | `ui/` | — (disse er OK, ikke overlappende med golf-UI) |

---

## 4. Anbefaling — slik slutter du å kaste bort tid

1. **Én komponent-kilde framover:** golfdata (v13). `athletic/*.tsx` og feature-bespoke settes i **vedlikehold-modus** — ikke bygg nytt der, ikke slett (skjermene bruker dem ennå), men alt nytt/redesignet komponeres fra golfdata.
2. **Én display-font:** Familjen Grotesk. Fjern Inter Tight fra `layout.tsx` + rydd de siste inline-referansene (jeg fant og fjernet flere i dag; noen gjenstår). Lav risiko, høy gevinst.
3. **Token-strategi:** behold golfdata-tokens scoped nå. Full forsoning `globals.css` → v13 er en **egen, større beslutning** — ikke gjør den halvveis.
4. **Design-skills:** bruk kun `ak-designekspert`. De 17 andre gir støy.
5. **To åpne beslutninger som blokkerer videre design:**
   - **Hjem-retning** (A «Dommen» / B «Cockpit» / C «Dagens økt» — se galleri-lenken).
   - **Signal-knapp-farge** på lys flate (forest m/ hvit tekst vs. forest m/ lime tekst).
   Landes disse to, kan resten bygges uten flere designspørsmål.

**Kjernebudskap:** designen er *ikke* halvferdig eller rotete i seg selv — v13-biblioteket er solid og komplett. Bortkastet arbeid kommer av at det ligger **oppå** det gamle laget i stedet for å ha erstattet det. Beslutningen som sparer mest tid: erklær golfdata (v13) som eneste kilde for alt nytt, og slutt å røre de gamle lagene.

---

## 5. Kilder for videre arbeid (så du slipper å lete)
- Fasit-utseende: `public/design-handover/guidelines/tilstander.html` + `premium-referanse.html`.
- Komponent-kontrakter: `public/design-handover/components/**/prompt.md`.
- Brukbare komponenter i kode: `src/components/athletic/golfdata/index.ts`.
- Terminologi/tekst-fasit: `public/design-handover/CLAUDE.md` + `skills/ak-terminologi/ordbok.md`.
- Skjermkomposisjons-kontrakt: `.claude/skills/ak-designekspert/references/skjermkomposisjon.md`.
