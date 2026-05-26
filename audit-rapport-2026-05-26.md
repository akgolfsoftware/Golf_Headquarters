# Audit-rapport 2026-05-26 — CoachHQ + PlayerHQ + delt komponentbibliotek

> Statisk kode-audit av `src/app/admin/`, `src/app/portal/` og `src/components/` mot `CLAUDE.md` + `.claude/skills/ak-golf-hq-design/`.
> Erstatter `audit-rapport-2026-05-24.md` (utdatert — skrevet før Bundle 3-batchen samme kveld).

## Sammendrag i tall

| Område | Treff | Klassifisering |
|---|---|---|
| Hardkoda hex utenfor tokens | 388 forekomster | 🟡 VIKTIG |
| 8pt-grid-brudd (`gap-3`, `p-3`, `gap-3.5` etc.) | 570 forekomster | 🟡 VIKTIG |
| Forbudt serif-font (Instrument Serif) | 1 fil, ~8 referanser | 🔴 KRITISK |
| Unicode-symboler i UI (✓ ✗ ★ —) | ~10 filer | 🟡 VIKTIG |
| Duplikate komponent-impl (Sparkline/KpiStrip/Hero) | 16 lokale | 🟢 NICE-TO-HAVE |
| `error.tsx` på admin/portal-sider | 2 av ~250 ruter | 🟡 VIKTIG |
| `not-found.tsx` på admin/portal-sider | 0 | 🟢 NICE-TO-HAVE |
| `outline-none` uten focus-erstatning | 5 callsites | 🟡 VIKTIG (a11y) |
| Mock-data i hub-overview-sider | 19 hardkoda tall | 🟡 VIKTIG |
| `/admin/talent` 404 (audit gammel) | **IKKE 404** — fungerer | ✅ Lukket |
| Kapasitet-progressring (audit gammel) | Fortsatt åpent | 🟡 VIKTIG |
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

### V5. `outline-none` uten focus-erstatning (a11y)
5 inputs bruker `outline-none` uten å erstatte med `focus-visible:`:
- [src/app/admin/anlegg/page.tsx:230](src/app/admin/anlegg/page.tsx:230)
- [src/app/admin/messages/_components/messages-inbox.tsx:72](src/app/admin/messages/_components/messages-inbox.tsx:72)
- [src/app/admin/messages/_components/conversation.tsx:306](src/app/admin/messages/_components/conversation.tsx:306)
- [src/app/admin/trackman/page.tsx:138](src/app/admin/trackman/page.tsx:138)
- [src/app/admin/plans/page.tsx:209](src/app/admin/plans/page.tsx:209)

Tastatur-brukere kan ikke se hvor de er. **Bryter WCAG 2.4.7.**

**Fiks:** Tilføy `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` på hver.

**Effort:** 30 min.

### V6. Mock-data i hub-overview-sider
19 hardkoda tall i `data="..."`-props på de tre overview-sidene. F.eks:
- `/admin/planlegge`: `14 aktive planer`, `28 maler`, `247 drills`, `9 spillere`, `23 i bibliotek`, `47 totalt`
- `/admin/analysere`: `7 overdue · 12 snart`, `8 venter`, `0 ubehandlete`

Sider markert `dynamic = "force-dynamic"` men leverer ikke ekte tall.

**Fiks:** Bytt mock med Prisma-queries. Mønster fra `/admin/agencyos/uka` viser hvordan.

**Effort:** 2-3 timer per side × 3 sider = 6-9 timer.

### V7. Manglende error.tsx + not-found.tsx
Kun **2 error.tsx** og **0 not-found.tsx** på ~250 ruter. Next.js 16 best practice er minst én på rot av hver seksjon.

**Fiks:** Tilføy:
- `src/app/admin/error.tsx` + `src/app/admin/not-found.tsx`
- `src/app/portal/error.tsx` + `src/app/portal/not-found.tsx`

**Effort:** 1 time totalt.

### V8. Kapasitet-KPI mangler progress-ring
[src/app/admin/agencyos/uka/page.tsx:94](src/app/admin/agencyos/uka/page.tsx:94) viser `${kapasitetPct}%` som ren tekst med sub-conditional. Designet ber om progress-ring + rødt under 30%.

**Fiks:** Bruk `PyramidProgress`-pattern eller en ny `KpiRing`-primitiv. Eventuelt en SVG-ring direkte i `UkeKpi`.

**Effort:** 1 time.

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

| # | Tittel | Klassifisering | Effort | Avhengighet |
|---|---|---|---|---|
| 1 | K1: Fjern Instrument Serif | 🔴 KRITISK | 15 min | — |
| 2 | V5: Fix `outline-none` (5 inputs) | 🟡 VIKTIG | 30 min | — |
| 3 | V7: Tilføy error.tsx + not-found.tsx | 🟡 VIKTIG | 1 t | — |
| 4 | V8: Kapasitet progress-ring | 🟡 VIKTIG | 1 t | — |
| 5 | V3: Erstatt Unicode-symboler med Lucide | 🟡 VIKTIG | 1-2 t | — |
| 6 | V1: Hardkoda hex → tokens (388 → 0) | 🟡 VIKTIG | 2-3 t | — |
| 7 | V4: Beslutning HubFrame vs AthleticHero | 🟡 VIKTIG | 30 min besl. + 6-12 t migrering | — |
| 8 | V6: Mock-data → Prisma-queries i overview | 🟡 VIKTIG | 6-9 t | — |
| 9 | V2: 8pt-grid (570 → 0) | 🟡 VIKTIG | 4-6 t | — |
| 10 | N1: Konsolider Sparkline | 🟢 NICE-TO-HAVE | 1-2 t | — |
| 11 | N2: Konsolider KpiStrip | 🟢 NICE-TO-HAVE | 1-2 t | — |
| 12 | N3: Konsolider Hero-komponenter | 🟢 NICE-TO-HAVE | 4-6 t | V4 først |
| 13 | N4: AthleticBadge urgent-bruk | 🟢 NICE-TO-HAVE | 30 min | — |
| 14 | N5: Touch-target share-button | 🟢 NICE-TO-HAVE | 2 min | — |

**Total estimat:** ~30 timer for å komme i full compliance med CLAUDE.md + design-skill-en.

**Anbefalt minimal sett før lansering:** #1, #2, #3, #4, #5 (totalt ~5 timer).

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
