# Project V2 Migration Plan

**Versjon:** 1.0 (2026-05-25)
**Eier:** Anders Kristiansen, AK Golf Group AS
**Status:** Aktiv plan — godkjent for utførelse

---

## Oppdrag

Implementere V2-designet (LIVING athletic editorial) på **alle 148 V1-skjermer** med 100% konsekvens og pixel-perfekt resultat.

**Tidshorisont:** 3 uker (16-18 arbeidsdager)
**Launch:** Når alle 148 skjermer er flekkfri (kan vente om nødvendig)

---

## Beslutningsgrunnlag (fra SCOPE-DECISIONS.md)

| Q | Beslutning | Konsekvens |
|---|---|---|
| Q1 | B — utvid biblioteket | Nye mønstre legges til V2-lib når nødvendig |
| Q2 | A — UI-only refactor | Bevarer all Prisma + auth + lib-logikk |
| Q3 | A — stub→full | Stubs får ekte implementering |
| Q4 | B — Plan A utenfor scope | Egen sprint senere |
| Q5 | A — foto per skjerm | 1-2 AK-foto per skjerm |

---

## Inkonsistens-blokkerende infrastruktur

Før vi rører en eneste V1-skjerm, må disse 7 sikkerhets-mekanismene være på plass:

| # | Mekanisme | Hva den blokkerer |
|---|---|---|
| 1 | `src/components/v2/*` — låst komponent-bibliotek | Agenter kan ikke duplisere komponenter |
| 2 | `/design-system-v2` showcase-route | Visuell fasit å sammenligne mot |
| 3 | ESLint-regler (`no-hardcoded-colors`, `8pt-grid`) | Hardkodet styling avvises ved commit |
| 4 | Stylelint blokkerer inline `<style>` med farger | Inkonsekvent styling kan ikke commites |
| 5 | `src/lib/v2-fixtures.ts` — canonical demo-data | Ingen agent inventer demo-data |
| 6 | `V2-PATTERNS.md` — eksakt CSS per pattern | Ingen tolkningsrom for agenter |
| 7 | Per-screen-checkliste (20 punkter) | Drift fanges før merge |

**Når alle 7 er på plass = "100% sikker"-status.**

---

## Faser

### Pre-Fase 0 — Forberedelse (eks. dette dokumentet) ✓ Ferdig
- Beslutninger låst (Q1-Q5)
- Master-plan skrevet
- Migration-folder opprettet i docs/

### Pre-Fase 1 — Bygg infrastruktur (4 dager)

Mål: 7 sikkerhetsmekanismene på plass før noen V1-skjerm røres.

#### Dag 1: Komponent-bibliotek
**Output:** `src/components/v2/` med 25 komponenter

```
src/components/v2/
├── index.ts                   # Eneste tillatte import-punkt
├── tokens.css                 # Hentet fra V2/tokens.css
├── shell/
│   ├── live-bar.tsx
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── bottom-nav.tsx
│   └── shell-wrapper.tsx
├── hero/
│   ├── photo-hero.tsx          # Hjem-style hero
│   ├── detail-hero.tsx         # Drill/spiller-detail hero
│   └── page-hero.tsx           # Standard side-hero
├── data/
│   ├── stat-tile.tsx           # Hero + compact varianter
│   ├── pyramid-bar.tsx
│   ├── sg-bar.tsx
│   ├── hcp-trend.tsx
│   └── progress-ring.tsx
├── itinerary/
│   ├── itinerary-list.tsx
│   ├── itinerary-row.tsx
│   └── now-line.tsx
├── cards/
│   ├── insight-card.tsx
│   ├── partner-card.tsx
│   ├── tournament-card.tsx     # Dark moment
│   ├── wellness-card.tsx
│   ├── quick-action.tsx        # Feature + standard varianter
│   └── coach-message.tsx
├── editorial/
│   ├── photo-divider.tsx
│   ├── section-header.tsx
│   └── ghost-number.tsx
├── modals/
│   ├── stub-modal.tsx
│   ├── help-popup.tsx
│   └── toast.tsx
└── hooks/
    ├── use-count-up.ts
    ├── use-parallax.ts
    ├── use-now.ts
    └── use-tweaks.ts            # For testing-overstyrelse
```

**Acceptance-kriterium:** Alle 25 komponenter importerbare fra `@/components/v2`, TypeScript-strict, dokumentert med JSDoc.

#### Dag 2: Design-system-route + ESLint-regler
**Output:**
- `src/app/(internal)/design-system-v2/page.tsx` — viser alle 25 komponenter
- `eslint.config.js` utvidet med nye regler
- `stylelint.config.cjs` utvidet

**ESLint-regler som tilføres:**
```js
{
  rules: {
    "no-restricted-syntax": [
      "error",
      // Blokker hardkodede hex/rgb
      {
        selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.name='color'] > Literal[value=/^#[0-9a-f]/i]",
        message: "Ingen hardkodede farger. Bruk CSS-variabler eller Tailwind-tokens."
      },
      // Blokker off-grid padding (p-3, p-5, p-7, p-9)
      {
        selector: "Literal[value=/\\bp-[3579]\\b/]",
        message: "8pt-grid: bruk p-2, p-4, p-6, p-8 — ikke p-3, p-5, p-7, p-9."
      }
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [{
          group: ["@/components/ui/*"],
          importNames: ["*"],
          message: "Ikke importer fra ui/ direkte. Bruk @/components/v2."
        }]
      }
    ]
  }
}
```

**Acceptance-kriterium:**
- `/design-system-v2` rendrer alle 25 komponenter
- `npx eslint .` fanger overtredelser
- `npx stylelint "**/*.css"` fanger overtredelser

#### Dag 3: Spec-docs + fixtures
**Output:**
- `docs/migration/V2-PATTERNS.md` — eksakt CSS per pattern
- `docs/migration/PHOTO-ASSIGNMENT-MATRIX.md` — foto per skjerm
- `src/lib/v2-fixtures.ts` — canonical demo-data

**`V2-PATTERNS.md` innehold:**
- ItineraryRow: eksakt grid + padding + farger
- PyramidBar: eksakt høyde + stagger-tid + ease-funksjon
- DarkMoment: eksakt foreground-bg + accent-text + 220-280px countdown
- PhotoHero: eksakt gradient-stop + grain-opacity + parallax-skala
- Color-mix oklab: eksakt % per akse
- ... (25 mønstre i alt)

**`PHOTO-ASSIGNMENT-MATRIX.md` innehold:**
- 148 skjermer mapped til 1-2 foto hver
- Tema-grupperinger (swing, coach, bane, editorial)
- Hero-foto vs sub-foto

**`v2-fixtures.ts` innhold:**
```ts
export const ØYVIND_ROHJAN = {
  name: "Øyvind Rohjan",
  initials: "ØR",
  tier: "PRO",
  hcp: -2.1,
  hcpTrend: 0.3,
  nivaa: "A1",
  homeClub: "GFGK",
  ...
} as const;

export const TODAY_SESSIONS = [...] as const;
export const WEEK_PROGRESS = {...} as const;
export const AI_INSIGHTS = [...] as const;
// etc — alle 148 skjermer henter herfra
```

#### Dag 4: V1-TO-V2-MAPPING + 5 sample-skjermer
**Output:**
- `docs/migration/V1-TO-V2-MAPPING.md` — alle 148 mapping
- 5 referanseskjermer implementert med nye komponenter

**5 referanseskjermer (testing av infrastrukturen):**
1. `/portal` (workbench) — bevarer livet vi har
2. `/portal/kalender` — uke-agenda
3. `/portal/mal` — mål-hub
4. `/admin` (AgencyOS) — coach-hjem
5. `/admin/spillere` — stall-oversikt

**Acceptance-kriterium:**
- 5 skjermer pixel-perfekt mot V2-prototype (verifisert av Anders)
- Anders gir formell go-ahead → Pre-Fase 1 LUKKES
- Hvis avvik → fiks komponentene først, ikke skjermene

---

### Fase 1 — Bølge-implementering med kontroll-gates (12-15 dager)

Etter Pre-Fase 1 er ferdig, starter den faktiske 148-skjerm migrasjonen.

#### Bølge 1 — PlayerHQ Hovedflyt (3 dager)
**Skjermer:** ~30 stk
- `/portal` (allerede ferdig)
- `/portal/kalender` (allerede ferdig)
- `/portal/mal` (allerede ferdig)
- `/portal/tren/*` (treningsplaner, drill, øvelser, tester)
- `/portal/booking/*` (booking-flyt full)
- `/portal/meg/*` (profil, innstillinger, abonnement)
- `/portal/coach/*` (meldinger, planer)

**Agenter:** 2 parallelle
**Kontroll-gate 1:** Anders reviewer 30 skjermer mot V2-prototype.

#### Bølge 2 — PlayerHQ Resten + Auth (3 dager)
**Skjermer:** ~25 stk
- `/portal/analysere/*` (statistikk, SG-hub)
- `/portal/talent/*`
- `/portal/utfordringer/*`
- `/portal/varsler/*`
- `/auth/*` (login, registrer, glemt passord)
- `/onboard/*` (8-stegs onboarding)

**Agenter:** 2 parallelle
**Kontroll-gate 2:** Anders reviewer alle ~55 PlayerHQ-skjermer.

#### Bølge 3 — CoachHQ Hovedflyt (4 dager)
**Skjermer:** ~40 stk
- `/admin` (AgencyOS — allerede ferdig)
- `/admin/spillere/*` (alle spiller-relaterte)
- `/admin/stall/*`
- `/admin/talent/*`
- `/admin/plans/*`
- `/admin/drills/*`

**Agenter:** 3 parallelle
**Kontroll-gate 3:** Anders reviewer alle CoachHQ-hovedflyt.

#### Bølge 4 — CoachHQ Resten + Stubs + Felles (4 dager)
**Skjermer:** ~50 stk
- `/admin/kalender/*`, `/admin/bookinger/*`, `/admin/anlegg/*`
- `/admin/tester/*`, `/admin/godkjenninger/*`
- `/admin/innboks/*`, `/admin/agencyos/*`
- `/admin/settings/*`, `/admin/team/*`
- Alle 8 stub-skjermer → ekte (Q3-beslutning)
- `/felles/*` (innstillinger, hjelp, integrasjoner)
- `/flyter/*` (onboarding, oppgrader, foreldresamtykke)

**Agenter:** 3 parallelle
**Kontroll-gate 4:** Anders reviewer alle resterende.

#### Bølge 5 — Marketing + Foreldreportal (2 dager)
**Skjermer:** ~15 stk
- `/(marketing)/*` (forside, om-oss, kontakt, vilkår, personvern)
- `/forelder/*` (alle 6 sub-sider)

**Agenter:** 2 parallelle
**Final-gate:** Full 148-screen audit.

---

### Fase 2 — Visual regression + polish (2 dager)

#### Dag 17: Visual regression-tester
**Output:**
- Playwright-tester for alle 148 skjermer
- Baseline-screenshots fra Pre-Fase 1
- CI integrasjon — blokker merge ved drift

```ts
// tests/visual/v2-screens.spec.ts
import { test, expect } from "@playwright/test";

const SCREENS = [
  { path: "/portal", name: "playerhq-workbench" },
  { path: "/portal/kalender", name: "playerhq-kalender" },
  // ... alle 148
];

for (const screen of SCREENS) {
  test(`${screen.name} matches V2 baseline`, async ({ page }) => {
    await page.goto(screen.path);
    await expect(page).toHaveScreenshot(`${screen.name}.png`, {
      maxDiffPixelRatio: 0.02
    });
  });
}
```

#### Dag 18: Polish-pass
- Fiks de få avvikene Playwright fanger
- Final visuell inspeksjon
- Tag som `v2.0.0`
- Deploy til produksjon
- Beta-spillere får tilgang

---

## Per-screen sjekkliste (brukes på hver bølge-skjerm)

For HVER skjerm verifiserer agent + jeg + (på gates) Anders:

### LAYOUT (5)
- [ ] Bruker `<ShellWrapper>` (ikke custom layout)
- [ ] Page-wrapper bruker `max-w-7xl space-y-10 lg:space-y-12`
- [ ] Hver seksjon har `<SectionHeader>` med eyebrow + tittel + valgfri CTA
- [ ] Ingen `style={{}}` attributes på elementer (lint-blokert)
- [ ] Alle tokens fra `@/components/v2` (ikke fra `@/components/ui`)

### TYPOGRAFI (3)
- [ ] Display-tall bruker `font-display tabular-nums`
- [ ] Eyebrows er `font-mono uppercase tracking-[0.14em] text-[10px]`
- [ ] Body bruker Inter (default `font-sans`)

### FARGER (4)
- [ ] Ingen hardkodede hex (lint-blokert)
- [ ] Pyramide-pills bruker funksjonsbaserte tokens (primary/warning/info/accent/destructive)
- [ ] Tinted bgs bruker `color-mix(in oklab, ...)`
- [ ] Dark moments er `bg-foreground text-background`

### LIVING APP (5)
- [ ] Alle KPI-tall bruker `useCountUp`
- [ ] Progress-bars har stagger-fill animasjon
- [ ] Photo-heroer har parallax + grain
- [ ] Live-elementer har pulse-animasjon
- [ ] Itinerary-stil (ikke horizontal Gantt) der relevant

### FOTO (2)
- [ ] Skjermen har minst 1 AK Golf Academy-foto
- [ ] Foto matcher tema (per PHOTO-ASSIGNMENT-MATRIX.md)

### RESPONSIVE (1)
- [ ] Mobile (393px) + Desktop (1440px) verifisert visuelt

**Total: 20 punkter. Alle MÅ være ✓ før skjerm regnes som ferdig.**

---

## Drift-prevention-rules

### For agenter
1. Importer ALDRI fra `@/components/ui/*` — bare fra `@/components/v2`
2. Skriv ALDRI `style={{ color: "..." }}` — bruk Tailwind eller CSS-tokens
3. Bruk ALDRI `p-3`, `p-5`, `p-7`, `p-9` — bare 8pt-grid
4. Inventer ALDRI demo-data — bruk `v2-fixtures.ts`
5. Lag ALDRI ny komponent uten å legge den i `@/components/v2` først
6. Hvis tvil → spør Anders før commit

### For meg (hovedagent)
1. Review hver PR mot 20-punkts sjekkliste
2. Avvis PR ved ÉN sjekkpunkt-feil
3. Hold V2-bibliotek frosset under bølge (oppdater bare mellom bølger)
4. Kjør `npm run check` (tsc + lint + visual regression) før merge

### For CI
1. ESLint må passere → ellers blokker merge
2. Stylelint må passere → ellers blokker merge
3. `tsc --noEmit` må passere → ellers blokker merge
4. `npm run build` må fullføre → ellers blokker merge
5. Playwright visual regression (etter Fase 2) → blokker drift

---

## Tidsplan

| Fase | Dager | Cumulativ |
|---|---|---|
| Pre-Fase 0 | 0 (ferdig) | 0 |
| Pre-Fase 1 dag 1-4 | 4 | 4 |
| Sample-test + Anders go-ahead | 0.5 | 4.5 |
| Bølge 1 (PlayerHQ hoved) | 3 | 7.5 |
| Kontroll-gate 1 | 0.5 | 8 |
| Bølge 2 (PlayerHQ rest + Auth) | 3 | 11 |
| Kontroll-gate 2 | 0.5 | 11.5 |
| Bølge 3 (CoachHQ hoved) | 4 | 15.5 |
| Kontroll-gate 3 | 0.5 | 16 |
| Bølge 4 (CoachHQ rest + stubs + felles) | 4 | 20 |
| Kontroll-gate 4 | 0.5 | 20.5 |
| Bølge 5 (Marketing + Forelder) | 2 | 22.5 |
| Final-gate | 0.5 | 23 |
| Fase 2 (Polish + visual regression) | 2 | 25 |
| **TOTAL** | **25 arbeidsdager** | **5 uker** |

**Inkluderer:**
- 6 kontroll-gates der Anders reviewer
- Buffer for fiksing av avvik
- Stub→full-konvertering (Q3)
- Foto-assignment (Q5)

**Launch-dato:** ~uke 22-23 (avhengig av start-dato).

---

## Hvordan Anders' tid brukes

| Aktivitet | Tid | Når |
|---|---|---|
| Godkjenne Pre-Fase 1 sample-skjermer | 30 min | Etter dag 4 |
| Review Bølge 1 (30 skjermer) | 60 min | Etter dag 7 |
| Review Bølge 2 (25 skjermer) | 45 min | Etter dag 11 |
| Review Bølge 3 (40 skjermer) | 90 min | Etter dag 15 |
| Review Bølge 4 (50 skjermer) | 90 min | Etter dag 20 |
| Review Bølge 5 (15 skjermer) | 30 min | Etter dag 22 |
| Final 148-screen audit | 2 timer | Dag 23 |
| **Total Anders-tid** | **~6.5 timer over 5 uker** |

---

## Hva som kan gå galt + mitigasjon

| Risiko | Sannsynlighet | Impact | Mitigasjon |
|---|---|---|---|
| Komponent-drift mellom agenter | Lav (lint blokker) | Høy | Pre-Fase 1 låser bibliotek |
| Anders avviser en bølge | Medium | Medium | Bølge går tilbake til samme agent, samme komponenter |
| Foto-feil tilordnet skjerm | Lav | Lav | PHOTO-ASSIGNMENT-MATRIX gjennomgås før Bølge 1 |
| Stub→full krever Prisma | Medium | Medium | Identifiser i Pre-Fase 1, planlegg som mini-prosjekt |
| TypeScript-feil i ny komponent | Medium | Lav | Pre-Fase 1 strict typing |
| Performance-regresjon | Lav | Medium | Lighthouse-test før Bølge 5 |
| Bryter eksisterende funksjon | Medium | Høy | Q2-beslutning + funksjonstest etter hver bølge |

---

## Avhengigheter + forutsetninger

### Tekniske
- Next.js 16 App Router (eksisterer)
- React 19 (eksisterer)
- Tailwind v4 (eksisterer)
- Prisma 7 (eksisterer)
- Supabase auth (eksisterer)
- 41 AK Golf Academy-foto i `/public/images/akgolf/` (eksisterer)

### Personell
- Anders for 6 kontroll-gates (~6.5 timer total)
- Jeg for full koordinering + Pre-Fase 1
- 2-3 parallelle Claude Code-agenter per bølge

### Beslutninger som må stå
- SCOPE-DECISIONS.md (Q1-Q5) er låst
- V2-design er kanonisk — ingen større design-endringer under migrasjonen
- Plan A-workbench utenfor scope

---

## Acceptance-kriterier for v2.0.0-launch

Alle MÅ være sant:

1. ✓ Alle 148 skjermer implementert i `src/app/`
2. ✓ Hver skjerm har 20/20 på sjekklisten
3. ✓ `npx tsc --noEmit` passerer
4. ✓ `npx eslint .` passerer
5. ✓ `npx stylelint "**/*.css"` passerer
6. ✓ `npm run build` fullføres uten warnings
7. ✓ Playwright visual regression (148 baselines) passerer
8. ✓ Lighthouse-score >90 på 12 nøkkelsider
9. ✓ Anders har gjort final-gate-audit
10. ✓ Mobile + desktop visuelt verifisert på alle skjermer

---

## Hva som skjer etter v2.0.0

### Umiddelbart etter launch (uke 23)
- Beta-spillere får tilgang
- Plausible-tracking på alle skjermer
- Daglig issue-tracking + hotfix-rotasjon

### Sprint 1 etter launch (uke 24)
- **Plan A-workbench** — egen sprint (1-2 dager)
- Prisma-schema-utvidelse for plan-period-types
- 5 zoom-nivåer + pyramide-baner + inspector

### Sprint 2-3 (uke 25-28)
- Refactor av eksisterende forretningslogikk (utenom scope nå)
- Performance-optimalisering
- A11y-audit (full WCAG 2.1 AA)

---

## Klart til å starte?

Hvis denne planen ser bra ut:
1. Si "kjør" → jeg starter Pre-Fase 1 dag 1 (komponent-bibliotek)
2. Du vil se daglige status-oppdateringer i denne tråden
3. Etter dag 4: jeg ber om første go-ahead på sample-skjermer

Hvis noe må endres:
1. Spør konkret hvilken seksjon
2. Jeg justerer planen
3. Re-baseline tids-estimat

Hvis du vil endre scope (Q1-Q5):
1. Be om formell scope-change
2. Vi går tilbake til SCOPE-DECISIONS.md
3. Konsekvensanalyse → re-baseline

---

**Klar når du er.**
