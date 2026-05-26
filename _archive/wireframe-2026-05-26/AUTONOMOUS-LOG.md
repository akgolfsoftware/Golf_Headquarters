# Autonomous Implementation Log

## 2026-05-18 — Design package mottatt og foundation oppdatert

### Status
- **Design-pakke kopiert:** `wireframe/design-package/` (60+ HTML-skjermer fra claude.ai/design)
- **README + 6 chats** dokumentert i pakken
- **Foundation:** `globals.css` oppdatert med cockpit-stadium-tokens

### Design package — viktige funn

Design-systemet bekrefter EKSISTERENDE tokens i `globals.css` v2:
- Inter + Inter Tight + JetBrains Mono (IKKE Bebas Neue + Geist som tidligere foreslått)
- Forest `#005840` primary + Lime `#D1F843` accent + cream `#FAFAF7` surface
- 20px card radius, 12px button radius
- 56px dark rail (`#0F2A22`) + 198px light nav + main content
- Italic Inter Tight 34px for editorial-greetings ("Onsdag, Markus. To dager siden sist.")

### Nye tokens lagt til i globals.css

```css
--color-brand-primary-hover, --color-brand-primary-soft, --color-brand-primary-deep
--color-brand-accent-hover, --color-brand-accent-on
--color-accent-bg, --color-accent-fill, --color-accent-soft
--color-surface-alt, --color-surface-deck
--color-ink, --color-ink-muted, --color-ink-subtle, --color-ink-disabled
--color-line, --color-line-soft
--color-success/-bg, --color-warning/-bg, --color-danger/-bg
--color-rail-bg, --color-rail-bg-cockpit, --color-nav-bg, --color-nav-active
--shadow-card, --shadow-card-hover, --shadow-deck
--ease-out, --duration-micro/-short/-long
```

### Design-pakke filer (mapping til ruter)

| Design-fil | Eksisterende rute | Status |
|---|---|---|
| `final/01-treningsplaner.html` | `/admin/plans` | ✓ migrert (visual cross-check anbefales) |
| `final/02-elever.html` | `/admin/spillere` | trenger cross-check |
| `final/03-godkjenninger.html` | `/admin/foresporsler` | trenger cross-check |
| `final/04-bookinger.html` | `/admin/calendar` | trenger cross-check |
| `final/05-okter.html` | `/admin/okter` | trenger cross-check |
| `final/06-tjenester.html` | `/admin/services` | trenger cross-check |
| `final/07-lokasjoner.html` | `/admin/anlegg` | trenger cross-check |
| `final/08-team.html` | `/admin/team` | trenger cross-check |
| `final/09-grupper.html` | `/admin/grupper` | trenger cross-check |
| `final/10-turneringer.html` | `/admin/tournaments` | trenger cross-check |
| `final/11-hjelp.html` | `/admin/help` | trenger cross-check |
| `final/12-tester.html` | `/admin/tester` | trenger cross-check |
| `final/13-runder.html` | `/admin/runder` | trenger cross-check |
| `final/14-trackman.html` | `/admin/trackman` | trenger cross-check |
| `coachhq-A/02-plan-bygger-*.html` | `/admin/plans/builder` | wizard 6-stegs |
| `coachhq-A/03-plan-detalj.html` | `/admin/plans/[planId]` | trenger cross-check |
| `coachhq-A/04-plan-edit.html` | edit-modus | trenger cross-check |
| `coachhq-A/05-plan-templates.html` | `/admin/plans/templates` | trenger cross-check |
| `playerhq-C/01-06-ny-okt-steg-*.html` | `/portal/ny-okt` | wizard 6-stegs |
| `playerhq-C/07-onskeligokt.html` | PlayerHQ ønske-økt | trenger cross-check |
| `playerhq-C/08-coach-melding.html` | PlayerHQ coach-melding | trenger cross-check |
| `playerhq-C/09-tren-kalender.html` | `/portal/kalender` | trenger cross-check |
| `playerhq-C/10-treningsdetalj.html` | `/portal/trening/[id]` | trenger cross-check |

### Neste sesjon

1. **Bølge A (CoachHQ Treningsplanlegger — gjenstår av Fase 2):**
   - Visual cross-check `/admin/plans` mot `final/01-treningsplaner.html`
   - Migrer plan-bygger wizard (6 steg) → `/admin/plans/builder` fra `coachhq-A/02-*`
   - Oppdater `/admin/plans/[planId]` fra `coachhq-A/03-plan-detalj.html`

2. **Bølge B (CoachHQ kjernedrift — Fase 5A):**
   - `/admin/spillere` ← `final/02-elever.html`
   - `/admin/foresporsler` ← `final/03-godkjenninger.html`
   - `/admin/calendar` ← `final/04-bookinger.html` + ukekalendere

3. **Bølge C (Treningsanalyse — Fase 3):**
   - `/admin/runder` ← `final/13-runder.html`
   - `/admin/trackman` ← `final/14-trackman.html`
   - `/admin/tester` ← `final/12-tester.html`

4. **Bølge D (Turneringer — Fase 4):**
   - `/admin/tournaments` ← `final/10-turneringer.html`

### Anbefaling

Design-pakken er stor (~60 skjermer). Implementeringen er en **fler-sesjon affære** — ikke alt kan gjøres i én lang autonom sesjon. Foreslår å kjøre bølge per sesjon (3-5 timer hver), med commit + push mellom bølgene så Anders kan teste på iPad via Vercel preview-URL.

### Vercel deploy

For iPad-tilgang: `npx vercel link && npx vercel --prod` kjøres etter Bølge A. Da får Anders stabil URL.
