# AK Golf Platform — PlayerHQ — Tester

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/tren/tester`
- **Arketype:** B — List + filter (tab-variant)
- **Tier-gating:** Alle ser NGF-standard. «Mine tester» (egendefinerte) og `+ Lag test` er Pro-låst.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/tester.html`
- **Audit:** `wireframe/audit/playerhq-tester.md`
- **Tilhørende modaler:** `NewTestModal`, `TestAttemptDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren.

## Spec — hva skjermen er for

Tester er Markus' standardiserte målestokk på ferdighet. NGF-standard gir ham 18 etablerte protokoller (Norges Golfforbund) som lar ham sammenligne seg over tid og mot referansegrupper. «Mine tester» er Pro-coachens tilpassede tester for spilleren. Skjermen brukes ukentlig for å sjekke status og starte ny test.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«Mål deg, Markus.»* Sub: «Sist test: 5. mai · 13 av 18 NGF-tester gjennomført»
- **Tabs øverst (segmentert kontroll, 220px bred):**
  - **NGF-standard** (18) — default
  - **Mine tester** (6) — Pro-låst, viser lucide `Lock`-ikon ved siden av tall
- **KPI-strip (3 kort)** — kun synlig på NGF-tabben:
  - Tester gjennomført: 13/18
  - Snitt-rangering (av norske 12,4-HCP): «Topp 28%»
  - Beste kategori: «Putte (P3)»
- **Tabell-rader:** 18 NGF-tester, hver rad 64px høy
  - Kol 1: Test-navn (Inter Tight 14px) + sub (kategori-pill, pyramide-farge, 10px)
  - Kol 2: Sist tatt (JetBrains Mono 12px, f.eks. «5. mai 2026»)
  - Kol 3: Beste resultat (JetBrains Mono 14px tabular, f.eks. «72%»)
  - Kol 4: Rangerings-pill: «Topp 28%»
  - Kol 5: Mini-sparkline 60×24px (siste 6 forsøk)
  - Kol 6: «Ta test →»-CTA (accent-pill, 28px høy)
- **Mine tester-tab:** 6 egne tester samme rad-spec + `+ Lag test`-CTA øverst-høyre (Pro-låst lock-overlay for Free)

## Filter-bar — UNIKT

- Søk: «Søk test …»
- Chip: **Kategori** (Putte · Chip · Iron · Driver · Wedge · Mental)
- Chip: **Status** (Aldri tatt · Tatt sist 30 dager · Trenger oppdatering >90 dager)
- Sort: Sist tatt · Beste resultat · Kategori · A–Å
- Primary CTA: `+ Lag test` (kun synlig på «Mine tester»-tab) → Pro-låst

## Klikkbare elementer

Se `wireframe/audit/playerhq-tester.md`. UNIKT:

| Element | States |
|---|---|
| Tab-toggle (NGF/Mine) | default, hover, active, Pro-låst på «Mine» (lock-ikon) |
| Test-rad | default, hover (subtil bg-shift), klikk → `TestAttemptDetailModal` |
| «Ta test →»-CTA per rad | default, hover, active, focus, disabled (hvis test allerede tatt i dag) |
| Sparkline-tooltip | hover viser «Forsøk 6: 72% (5. mai)» |
| Rangerings-pill | farger: topp 25% (accent), 25–50% (primary), 50–75% (muted), 75%+ (destructive subtil) |
| `+ Lag test`-CTA | Pro-låst tooltip «Pro-feature — oppgrader →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **NGF-tab empty (ny bruker):** «Ingen tester tatt ennå. Velg en NGF-test for å begynne →»
- **Mine tester empty (Pro):** «Ingen egne tester ennå. Lag den første →»
- **Mine tester (Free):** Full lock-overlay 40% opacity + lucide `Lock` + CTA-link til `UpgradeToProModal`
- **Loading:** 5 grå skeleton-rader
- **Error:** Per-tabell retry

## Ønsket output fra Claude Design

1. NGF-tab lyst tema (alle 18 tester, Pro-bruker)
2. NGF-tab lyst tema (Free-bruker — Mine-tab vises med lock)
3. Mine tester-tab lyst tema (Pro-bruker, 6 egne tester)
4. Mine tester-tab Free (full lock-overlay)
5. Mørkt tema (NGF-tab)
6. Hover-state på rad
7. Mobil ≤640px — tabell konverterer til kort

## Ikke-mål

- Ikke designe `NewTestModal` eller `TestAttemptDetailModal` (egne pakker)
- Ikke designe test-utførelse (`/portal/tren/tester/:id/run` — egen batch)
- Ikke endre 18-tall (NGF-katalog er fast)
