# Audit-rapport 2026-05-26 — CoachHQ + PlayerHQ + delt komponentbibliotek

> Statisk kode-audit av `src/app/admin/`, `src/app/portal/` og `src/components/` mot `CLAUDE.md` + `.claude/skills/ak-golf-hq-design/`.
> Erstatter `audit-rapport-2026-05-24.md` (utdatert — skrevet før Bundle 3-batchen samme kveld).

## Sammendrag i tall

| Område | Treff | Klassifisering |
|---|---|---|
| Hardkoda hex utenfor tokens | 388 forekomster | 🟡 VIKTIG |
| 8pt-grid-brudd (`gap-3`, `p-3`, `gap-3.5` etc.) | 570 forekomster | 🟡 VIKTIG |
| Forbudt serif-font (Instrument Serif) | 51 forekomster | ✅ Lukket (commit f8b5fcf) |
| Unicode-symboler i UI (✓ ✗ ★ —) | ~10 filer | 🟡 VIKTIG |
| Duplikate komponent-impl (Sparkline/KpiStrip/Hero) | 16 lokale | 🟢 NICE-TO-HAVE |
| `error.tsx` på admin/portal-sider | 3 → 3 (begge oppgradert) | ✅ Lukket (commit e237a02) |
| `not-found.tsx` på admin/portal-sider | 0 → 2 | ✅ Lukket (commit e237a02) |
| `outline-none` uten focus-erstatning (V5: de 5 listede) | 5 → 0 | ✅ Lukket (commit 345a9f2) |
| `outline-none` uten focus-erstatning (V5b: resten) | 45 → 0 + 1 false positive | ✅ Lukket (commit 6d276a1) |
| Mock-data i hub-overview-sider | 19 hardkoda tall | 🟡 VIKTIG |
| `/admin/talent` 404 (audit gammel) | **IKKE 404** — fungerer | ✅ Lukket |
| Kapasitet-progressring (audit gammel) | Implementert med KpiRing | ✅ Lukket (commit 4f84ef4) |
| Touch-target-brudd (<44px) | 1 forekomst | 🟢 NICE-TO-HAVE |

---

## 🔴 KRITISK (blokkerer lansering)

### K1. Instrument Serif brukt som font
**Bryter:** CLAUDE.md eksplisitt: *"INGEN Instrument Serif eller andre fonter."*

**Fil:** [src/app/portal/tren/turneringer/[id]/turnering-client.tsx:1837](src/app/portal/tren/turneringer/[id]/turnering-client.tsx:1837)
```css
--tdc-font-serif: 'Instrument Serif', serif;
```
Brukt på `.tdc-italic-accent` (linje 1869) og `.tdc-italic-block` (linje 1874).

**Fiks:** Erstatt med `var(--font-display)` (Inter Tight). Editorial italic via `<em className="font-display italic">` per CLAUDE.md.

**Effort:** ~15 min. Søk/erstatt + spot-check rendering.

---

## 🟡 VIKTIG (visuell inkonsistens, fiks før lansering)

### V1. Hardkoda hex i stedet for design-tokens
388 forekomster. Topp-syndere:

- **120 × `#005840`** (primary forest) — burde være `hsl(var(--primary))` eller `text-primary`. Eksempler:
  - [src/app/admin/anlegg/[id]/page.tsx:148](src/app/admin/anlegg/[id]/page.tsx:148)
  - [src/app/admin/kommunikasjon/page.tsx:48](src/app/admin/kommunikasjon/page.tsx:48)
  - [src/app/admin/workspace/oppgaver/page.tsx:72](src/app/admin/workspace/oppgaver/page.tsx:72)

- **5 × `#FBFAF5`** (cream-variant ikke i tokens) — burde være `from-background` eller ny token. Brukes som gradient-start i workspace-hero:
  - [src/app/admin/workspace/prosjekter/page.tsx:56](src/app/admin/workspace/prosjekter/page.tsx:56)
  - [src/app/admin/workspace/oppgaver/page.tsx:61](src/app/admin/workspace/oppgaver/page.tsx:61)
  - [src/app/admin/workspace/notion/page.tsx:53](src/app/admin/workspace/notion/page.tsx:53)
  - [src/app/admin/spillere/[id]/plan/[planId]/page.tsx:76](src/app/admin/spillere/[id]/plan/[planId]/page.tsx:76)
  - [src/app/admin/workspace/oppgaver/[id]/page.tsx:90](src/app/admin/workspace/oppgaver/[id]/page.tsx:90)

**Fiks:** Søk/erstatt-pass per farge. `#005840` → `hsl(var(--primary))` (inline-styler) eller `text-primary`/`bg-primary` (className). `#FBFAF5` → `from-background`.

**Effort:** 2-3 timer (mekanisk søk/erstatt + spot-test).

### V2. 8pt-grid-brudd
570 forekomster av `gap-3`, `p-3`, `p-3.5`, `gap-3.5`, `m-5`, `gap-5`, `p-7` osv. CLAUDE.md sier: *"8pt-grid strikt. Kun `p-2/4/6/8/10/12/16`. Aldri `p-3/p-5/p-7`."*

Eksempler:
- [src/app/admin/tilstander/page.tsx:245](src/app/admin/tilstander/page.tsx:245) — `gap-3.5`
- [src/app/admin/anlegg/[id]/page.tsx:175](src/app/admin/anlegg/[id]/page.tsx:175) — `gap-3`
- [src/app/admin/settings/calendar/subscriptions-form.tsx:233](src/app/admin/settings/calendar/subscriptions-form.tsx:233) — `gap-3`

**Fiks:** Mekanisk konvertering: `gap-3` → `gap-2` eller `gap-4` per kontekst. `p-3` → `p-2` eller `p-4`. `p-3.5`/`gap-3.5` → `p-4`/`gap-4`. Krever litt visuell vurdering per sted.

**Effort:** 4-6 timer (kan delegeres til en agent som gjør én konvertering om gangen).

### V3. Unicode-symboler i UI
~10 filer bruker `✓ ✗ ★ —` som status-indikatorer. CLAUDE.md: *"INGEN emoji i UI. Bruk Lucide."*

- [src/app/portal/booking/anlegg/[anleggId]/page.tsx:358](src/app/portal/booking/anlegg/[anleggId]/page.tsx:358) — `"✓"` i bookingvalg
- [src/app/portal/meg/utstyrsbag/utstyrsbag-form.tsx:193](src/app/portal/meg/utstyrsbag/utstyrsbag-form.tsx:193) — `"Lagret ✓"`
- [src/app/portal/mal/runder/[id]/shot-by-shot/page.tsx:524-525](src/app/portal/mal/runder/[id]/shot-by-shot/page.tsx:524) — `✓ ✗ —`
- [src/app/portal/(fullscreen)/test/[testId]/live/live-test-runner.tsx:483](src/app/portal/(fullscreen)/test/[testId]/live/live-test-runner.tsx:483) — `✓`
- [src/app/portal/(fullscreen)/tren/ai-modaler.tsx:312, 434](src/app/portal/(fullscreen)/tren/ai-modaler.tsx:312) — `✓` og `★ Topp-prioritet`
- [src/app/portal/tren/turneringer/[id]/turnering-client.tsx:246](src/app/portal/tren/turneringer/[id]/turnering-client.tsx:246) — `★ TURNERING`

**Fiks:** Bytt til Lucide-ikoner: `✓` → `<Check className="h-4 w-4" />`, `✗` → `<X />`, `★` → `<Star />`, `—` → `<Minus />` eller HTML `&mdash;`.

**Effort:** 1-2 timer.

### V4. HubFrame vs AdminHero — to/tre hero-patterns parallelt
Admin-sider bruker tre forskjellige hero-patterns:
- **HubFrame + HubHeader**: 8 sider (overview-hubs: `/admin/planlegge`, `/gjennomfore`, `/analysere` + settings/audit-log/tildelt-meg/wagr-import)
- **AdminHero (as PageHeader)**: 64 sider (de fleste detalj-sider)
- **AthleticHero**: 0 admin-sider (kun PlayerHQ)

Design-skill-en favoriserer ÉN pattern. Inkonsistensen er synlig: sidebar-bredde, eyebrow-stil, KPI-strip-layout varierer.

**Fiks:** Beslutning: skal admin-overview bruke `HubFrame` eller `AthleticHero + KpiStrip`? Standardiser på én. Den nye `KpiStrip` med `cols`/`gap-4` fra forrige commit er klar.

**Effort:** Beslutning først (30 min). Migrering: 2-4 timer per overview-side.

### V5. `outline-none` uten focus-erstatning (a11y) — ✅ LUKKET

5 inputs ble fikset i commit [`345a9f2`](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/345a9f2):
- src/app/admin/anlegg/page.tsx:230
- src/app/admin/messages/_components/messages-inbox.tsx:72
- src/app/admin/messages/_components/conversation.tsx:306
- src/app/admin/trackman/page.tsx:138
- src/app/admin/plans/page.tsx:209

Tilført `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` (offset-1 for konsistens med eksisterende shadcn-primitives).

### V5b. `outline-none` uten focus-erstatning — 30 gjenværende (a11y) — ✅ LUKKET

V5b ble fikset i commit [`6d276a1`](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/6d276a1). Faktisk antall var **46** (V5b telte også feil — bare admin/portal under `src/app/`, ikke marketing/auth/lokasjoner-demo/v2-preview/components). 45 av 46 er fikset.

#### Falsk positiv (1 callsite, bevisst skippet)

[src/components/admin/caddie/caddie-approval-modal.tsx:87](src/components/admin/caddie/caddie-approval-modal.tsx:87) — `<div>` med `tabIndex={-1}`, brukt som dialog-wrapper med programmatisk ref-fokus.

**Rationale:** `:focus-visible` aktiveres aldri på programmatisk fokus. Tilføyelse av `focus-visible:`-klasser ville være død markup. WCAG 2.4.7 krever fokus-indikator på keyboard-tabbable elementer; `tabIndex={-1}` fjerner elementet fra tab-rekkefølgen, så regelen gjelder ikke her.

**Status etter V5 + V5b:** 0 reelle WCAG 2.4.7-brudd igjen i `src/`.

---

### V5b (original liste — bevart for historikk)

Audit-rapport-2026-05-26 V5 telte feil — den oppga 5 callsites mens faktisk antall er **35**. De 5 spesifikke fra V5 er nå fikset, men 30 til gjenstår med samme WCAG 2.4.7-brudd.

**Bryter WCAG 2.4.7 Focus Visible.** Klassifisering: **🟡 VIKTIG** (a11y er ikke nice-to-have).

#### Admin (23 callsites)

- [src/app/admin/agencyos/caddie/aktivitet/aktivitet-client.tsx:165](src/app/admin/agencyos/caddie/aktivitet/aktivitet-client.tsx:165)
- [src/app/admin/agencyos/caddie/aktivitet/aktivitet-client.tsx:535](src/app/admin/agencyos/caddie/aktivitet/aktivitet-client.tsx:535)
- [src/app/admin/approvals/page.tsx:148](src/app/admin/approvals/page.tsx:148)
- [src/app/admin/drills/drill-filter-bar.tsx:134](src/app/admin/drills/drill-filter-bar.tsx:134)
- [src/app/admin/email-templates/page.tsx:66](src/app/admin/email-templates/page.tsx:66)
- [src/app/admin/facilities/page.tsx:187](src/app/admin/facilities/page.tsx:187)
- [src/app/admin/grupper/page.tsx:150](src/app/admin/grupper/page.tsx:150)
- [src/app/admin/locations/page.tsx:118](src/app/admin/locations/page.tsx:118)
- [src/app/admin/okter/page.tsx:251](src/app/admin/okter/page.tsx:251)
- [src/app/admin/runder/page.tsx:152](src/app/admin/runder/page.tsx:152)
- [src/app/admin/spillere/[id]/enrollment-panel.tsx:123](src/app/admin/spillere/[id]/enrollment-panel.tsx:123)
- [src/app/admin/spillere/[id]/enrollment-panel.tsx:141](src/app/admin/spillere/[id]/enrollment-panel.tsx:141)
- [src/app/admin/spillere/[id]/enrollment-panel.tsx:161](src/app/admin/spillere/[id]/enrollment-panel.tsx:161)
- [src/app/admin/spillere/ny/wizard.tsx:216](src/app/admin/spillere/ny/wizard.tsx:216)
- [src/app/admin/spillere/page.tsx:409](src/app/admin/spillere/page.tsx:409)
- [src/app/admin/spillere/page.tsx:417](src/app/admin/spillere/page.tsx:417)
- [src/app/admin/team/page.tsx:96](src/app/admin/team/page.tsx:96)
- [src/app/admin/tournaments/page.tsx:290](src/app/admin/tournaments/page.tsx:290)
- [src/app/admin/workspace/oppgaver/[id]/page.tsx:202](src/app/admin/workspace/oppgaver/[id]/page.tsx:202)
- [src/app/admin/workspace/oppgaver/[id]/page.tsx:253](src/app/admin/workspace/oppgaver/[id]/page.tsx:253)
- [src/app/admin/workspace/oppgaver/[id]/page.tsx:268](src/app/admin/workspace/oppgaver/[id]/page.tsx:268)
- [src/app/admin/workspace/oppgaver/page.tsx:150](src/app/admin/workspace/oppgaver/page.tsx:150)
- [src/app/admin/workspace/prosjekter/page.tsx:94](src/app/admin/workspace/prosjekter/page.tsx:94)

#### Portal (7 callsites)

- [src/app/portal/coach/melding/form.tsx:164](src/app/portal/coach/melding/form.tsx:164)
- [src/app/portal/drills/drills-client.tsx:371](src/app/portal/drills/drills-client.tsx:371)
- [src/app/portal/mal/leaderboard/page.tsx:356](src/app/portal/mal/leaderboard/page.tsx:356)
- [src/app/portal/mal/runder/ny/form.tsx:364](src/app/portal/mal/runder/ny/form.tsx:364)
- [src/app/portal/mal/runder/ny/form.tsx:678](src/app/portal/mal/runder/ny/form.tsx:678)
- [src/app/portal/meg/dokumenter/page.tsx:80](src/app/portal/meg/dokumenter/page.tsx:80)
- [src/app/portal/tren/tester/ny/wizard.tsx:735](src/app/portal/tren/tester/ny/wizard.tsx:735)

**Fiks:** Samme pattern som V5 — tilføy `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` til hver className. Kan kjøres mekanisk per fil.

**Effort:** ~1 time (30 callsites × 1-2 min per edit + verifisering).

### V6. Mock-data i hub-overview-sider
19 hardkoda tall i `data="..."`-props på de tre overview-sidene. F.eks:
- `/admin/planlegge`: `14 aktive planer`, `28 maler`, `247 drills`, `9 spillere`, `23 i bibliotek`, `47 totalt`
- `/admin/analysere`: `7 overdue · 12 snart`, `8 venter`, `0 ubehandlete`

Sider markert `dynamic = "force-dynamic"` men leverer ikke ekte tall.

**Fiks:** Bytt mock med Prisma-queries. Mønster fra `/admin/agencyos/uka` viser hvordan.

**Effort:** 2-3 timer per side × 3 sider = 6-9 timer.

### V7. Manglende error.tsx + not-found.tsx — ✅ LUKKET

Fikset i commit [`e237a02`](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/e237a02).

**Audit-korreksjon:** Faktisk antall eksisterende `error.tsx` var **3** (`src/app/error.tsx`, `src/app/admin/error.tsx`, `src/app/portal/error.tsx`), ikke 2 som audit-tabellen oppga. Audit-tellingen var feil her også.

**Endring:**
- `src/app/admin/error.tsx` — erstattet custom layout med `AthleticHero`-mønster
- `src/app/portal/error.tsx` — erstattet custom layout med `AthleticHero`-mønster
- `src/app/admin/not-found.tsx` — NY (Compass-ikon, lime "Tilbake til CoachHQ"-CTA)
- `src/app/portal/not-found.tsx` — NY (Compass-ikon, lime "Tilbake til hjem"-CTA)

Alle fire bruker `AthleticHero` med eyebrow + ikon + display-tittel med italic-aksent + sub-tekst + Lime/ghost-light CTAs. HubFrame eksplisitt unngått (V4-teknisk gjeld).

**Routing-merknad:** Next.js App Router fanger segment-nivå `not-found.tsx` kun på eksplisitte `notFound()`-calls (f.eks. fra `talent/[playerId]/page.tsx:84`). Unmatched URLs faller fortsatt til `src/app/not-found.tsx` (root) — den er ikke endret i denne commiten.

### V8. Kapasitet-KPI mangler progress-ring — ✅ LUKKET

Fikset i commit [`4f84ef4`](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/4f84ef4).

**Endring:**
- Ny komponent: `src/components/athletic/kpi-ring.tsx` — gjenbrukbar SVG-ring med 2px stroke (default), auto-variant fra pct (≥50 primary, 30–49 warning, <30 destructive), 250ms ease-out animasjon fra 0 ved mount. Eksportert via `athletic/index.ts`.
- `/admin/agencyos/uka` Kapasitet-KPI bruker nå `<KpiRing value={kapasitetPct} size={64} />` i stedet for ren tekst.

`hsl(var(--primary))` er tema-bevisst — forest grønn i light, lime i dark (matcher spec).

Eksisterende `src/components/ui/progress-ring.tsx` er urørt (annet API, brukt av design-system).

---

## 🟢 NICE-TO-HAVE (post-launch hygiene)

### N1. Duplikate Sparkline-impl
5 lokale Sparkline-implementasjoner, nå som vi har kanonisk `src/components/athletic/sparkline.tsx`:
- [src/components/admin/services-liste.tsx:302](src/components/admin/services-liste.tsx:302) — `function Sparkline()`
- [src/components/innsikt/trackman-tab.tsx:67](src/components/innsikt/trackman-tab.tsx:67) — `function Sparkline({ values })`
- [src/components/hubs/hub-visuals.tsx:68](src/components/hubs/hub-visuals.tsx:68) — `HubSparkline({ variant })`
- [src/components/portal-planlegge/mal/mal-tab.tsx](src/components/portal-planlegge/mal/mal-tab.tsx) — lokal
- [src/components/portal-workbench/workbench-shell.tsx](src/components/portal-workbench/workbench-shell.tsx) — lokal

**Fiks:** Migrer hver til `import { Sparkline } from "@/components/athletic"`.

**Effort:** 1-2 timer.

### N2. Duplikate KpiStrip-impl
3 lokale utenfor athletic/:
- [src/components/portal/kpi-strip.tsx](src/components/portal/kpi-strip.tsx)
- [src/components/admin/hub-kpi-strip.tsx](src/components/admin/hub-kpi-strip.tsx)
- [src/components/admin/plan-templates/template-detail.tsx](src/components/admin/plan-templates/template-detail.tsx) — lokal funksjon

**Fiks:** Konsolider til `athletic/KpiStrip`.

**Effort:** 1-2 timer.

### N3. Duplikate Hero-impl
8 lokale Hero-komponenter (dash-hero, player-hero, talent-hero, admin-hero, spiller-hero, forelder-hero, workspace-hero, loading-skeleton). Mange er rolle-spesifikke wrappers.

**Fiks:** Vurder om en `AthleticHero` med rolle-prop kan erstatte 4-5 av disse. Krever design-beslutning.

**Effort:** 4-6 timer.

### N4. AthleticBadge — `urgent`-variant aldri brukt
Fordeling:
- lime: 21, primary: 14, ok: 2, warn: 1, urgent: **0**, neutral: 2

`urgent` finnes som variant men brukes ikke. Indikerer enten manglende rødt-status-bruk eller død API.

**Fiks:** Verifiser om audit-rapport-gamle saker (negative deltas, advarsler) faktisk burde brukt `urgent` i stedet for `warn`/`destructive` direkte.

**Effort:** 30 min audit.

### N5. Touch-target h-9 på share-button
1 forekomst:
- [src/app/portal/mal/runder/[id]/shot-by-shot/share-button.tsx:42](src/app/portal/mal/runder/[id]/shot-by-shot/share-button.tsx:42) — `h-9 w-9` = 36px (under 44px WCAG-anbefaling)

**Fiks:** `h-11 w-11` (44px).

**Effort:** 2 min.

---

## ✅ Lukket fra forrige audit (2026-05-24)

| Gammelt issue | Status |
|---|---|
| Grep 1: CoachhqStubsShell på 6 sider | Migrert + komponent slettet |
| Grep 2: Overview-sider stubs | Implementert i `0c7ebe0` (24. mai 22:08) — 7-8 HubCards per side |
| `/admin/talent` 404 | Fungerer — page.tsx + sub-mapper finnes |
| `/admin/agencyos/okonomi` negative deltas svart | Fikset med `tone={endring < 0 ? "warn" : "good"}` |
| `/admin/agencyos/okonomi` "1 FAKTURA UTE" svart | Fikset med `tone={utestaendeOre > 0 ? "warn" : "good"}` |
| `/admin/spillere` "INAKTIV" grønn | Ikke funnet som badge — kun ren tekst |
| `/admin/agencyos/spillere` "DROP-IN" grå | Teksten finnes ikke i src lenger |
| `/admin/teknisk-plan` "Ingen aktiv plan" svart | Teksten finnes ikke i src |

---

## Prioritert oppgaveliste

| # | Tittel | Klassifisering | Effort | Status |
|---|---|---|---|---|
| 1 | K1: Fjern Instrument Serif | 🔴 KRITISK | 15 min | ✅ Lukket ([f8b5fcf](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/f8b5fcf)) |
| 2 | V5: Fix `outline-none` (de 5 listede) | 🟡 VIKTIG | 30 min | ✅ Lukket ([345a9f2](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/345a9f2)) |
| 3 | V5b: Fix resten av `outline-none` (45 callsites + 1 FP skipped) | 🟡 VIKTIG (a11y) | ~1 t | ✅ Lukket ([6d276a1](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/6d276a1)) |
| 4 | V7: Tilføy error.tsx + not-found.tsx | 🟡 VIKTIG | 1 t | ✅ Lukket ([e237a02](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/e237a02)) |
| 5 | V8: Kapasitet progress-ring | 🟡 VIKTIG | 1 t | ✅ Lukket ([4f84ef4](https://github.com/akgolfgroup-netizen/akgolf-hq/commit/4f84ef4)) |
| 6 | V3: Erstatt Unicode-symboler med Lucide | 🟡 VIKTIG | 1-2 t | Åpent |
| 7 | V1: Hardkoda hex → tokens (388 → 0) | 🟡 VIKTIG | 2-3 t | Åpent |
| 8 | V4: Beslutning HubFrame vs AthleticHero | 🟡 VIKTIG | 30 min besl. + 6-12 t migrering | Åpent |
| 9 | V6: Mock-data → Prisma-queries i overview | 🟡 VIKTIG | 6-9 t | Åpent |
| 10 | V2: 8pt-grid (570 → 0) | 🟡 VIKTIG | 4-6 t | Åpent |
| 11 | N1: Konsolider Sparkline | 🟢 NICE-TO-HAVE | 1-2 t | Åpent |
| 12 | N2: Konsolider KpiStrip | 🟢 NICE-TO-HAVE | 1-2 t | Åpent |
| 13 | N3: Konsolider Hero-komponenter | 🟢 NICE-TO-HAVE | 4-6 t | Åpent (V4 først) |
| 14 | N4: AthleticBadge urgent-bruk | 🟢 NICE-TO-HAVE | 30 min | Åpent |
| 15 | N5: Touch-target share-button | 🟢 NICE-TO-HAVE | 2 min | Åpent |

**Total estimat gjenstående:** ~30 timer for full compliance.

**Anbefalt minimal sett før lansering:** V5b, V7, V8, V3 (totalt ~4-5 timer).

---

## Kontekst: hva som er endret siden 24. mai

- **24. mai 22:08** (`0c7ebe0`): Bundle 3 — 12 hubs + Drill Library + cleanup
- **26. mai 09:05** (`045e084`): Archive 19 yellow demo-routes
- **26. mai dagens commits**:
  - `fef4dcf` — slettet 9 stale worktrees (-11.3 GB)
  - `595d066` — `feat: add sparkline + kpistrip-responsive + type helpers` (inkluderte også cleanup av CoachhqStubsShell-dødkode)

Foundation-komponentene fra dagens commits (`Sparkline`, `KpiStrip cols`-prop, `.h-display`, `.eyebrow` etc.) er klare til å brukes i oppgavene over.

---

## Hva audit-en IKKE inkluderer

- Visuell verifisering i nettleser — gjøres som egen pass etter at #1–#5 er ute
- Audit av marketing-sider (`/akgolf-*`) — kan tas i egen runde
- Performance-audit (bundle size, hydration) — egen oppgave
- Tester (Vitest/Playwright) — egen oppgave
- Innholds-/copy-audit — krever produkt-eier-input
