# AK Golf Platform — CoachHQ — Teknisk plan (intern roadmap)

## Identitet

- **Produkt:** CoachHQ (intern utvikler/admin-flate)
- **URL:** `/admin/teknisk-plan`
- **Arketype:** F — Settings + profile (read-only roadmap-viewer)
- **Tier-gating:** Admin + utvikler
- **HTML-referanse:** `wireframe/screen-deck/coachhq/teknisk-plan.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MilestoneDetailModal`, `EditMilestoneModal` (admin)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Teknisk plan er Anders sin egen oversikt over hva som er bygd, hva som bygges nå, og hva som kommer. Skjermen er **bevisst intern** — ikke for spillere — men hjelper Anders huske scope og status når han bytter mellom prosjekter (akgolf-hq, akgolf-portal, akgolf-website, akgolf-booking, akgolf-playerhq, akgolf-coachhq). Hun reflekterer "AK Golf HQ-paraplyen" og fasene fra `MASTERPLAN.md`.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Tre hovedseksjoner: timeline øverst, kort-grid for prosjekter, burndown nederst.

### Hero-strip

Stor banner: *"Fase 1 av 8 — Foundation pågår."*
Italic Instrument Serif. Under: progress-bar 12% + "Estimert ferdig: 2026-08-15"

### Seksjon: Faser-timeline (horisontal)

8 milestones rendret som horisontal stepper:

| # | Navn | Status | ETA |
|---|---|---|---|
| 0 | Baseline-sync | ✓ Ferdig | 2026-05-08 |
| 1 | Foundation (auth + schema) | Pågår 60% | 2026-05-31 |
| 2 | Booking + betaling | Planlagt | 2026-06-30 |
| 3 | PlayerHQ Hjem + Hub | Planlagt | 2026-07-31 |
| 4 | CoachHQ Plans + Approvals | Planlagt | 2026-08-31 |
| 5 | Live Session + TrackMan | Planlagt | 2026-09-30 |
| 6 | Settings + CBAC | Planlagt | 2026-10-15 |
| 7 | Marketing-website | Planlagt | 2026-11-01 |
| 8 | Beta-launch | Planlagt | 2026-12-01 |

Aktiv fase har pulserende accent-prikk. Ferdig har grønn checkmark. Planlagt er muted.

### Seksjon: Prosjekt-grid (6 kort, ett per repo)

Hvert kort:
- Repo-navn (Geist Mono): `akgolf-hq`
- Tagline: "Foundation — schema, auth, designsystem"
- Status-pill: Aktiv / Planlagt / Maintenance
- Last commit: "856258a — for 2 dager siden"
- Brancher: 1 (main)
- Open PRs: 0
- Build-status: ✓ Grønn / ✗ Rød (deploy.akgolf.no)
- Lenke: "Åpne i GitHub →"

Repos:
1. `akgolf-hq` — Foundation (Aktiv)
2. `akgolf-portal` — Coach + spillerportal (Maintenance — vil migreres)
3. `akgolf-website` — akgolf.no marketing (Planlagt fase 7)
4. `akgolf-booking` — booking.akgolf.no (Planlagt fase 2)
5. `akgolf-playerhq` — Spillerportal v2 (Planlagt fase 3)
6. `akgolf-coachhq` — Coach v2 (Planlagt fase 4)

### Seksjon: Beslutninger + risiko

Tre kolonner:

**Tekniske beslutninger** (siste 5):
- "Gikk fra Prisma 6 til 7" (2026-05-08)
- "Bytte fra middleware.ts til proxy.ts (Next 16)" (2026-05-09)
- "CSS-first Tailwind v4 i stedet for tailwind.config.ts" (2026-05-08)

**Aktive risikoer:**
- "Prisma 7 stabilitet — bare 2 uker gammel" (medium)
- "Supabase pooler-IPv4 må overvåkes" (low)
- "Anders alene bygger — bus-faktor 1" (high)

**Skjulte avhengigheter:**
- akgolf-portal må kjøre til portal v2 er live (3+ måneder)
- GolfBox-API-rate-limit kan begrense onboarding-hastighet

### Seksjon: Burndown (mini)

Linje-graf siste 30 dager: "Estimerte timer igjen til Fase 1-ferdig"
- Y-akse: timer
- X-akse: dager
- Trend-linje (stipplet) viser projisert ferdig-dato

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Milestone-step | default, hover, klikk → `MilestoneDetailModal` |
| Repo-kort | default, hover (lift), klikk → ekspander med commit-liste |
| Build-status | default, klikk → åpner Vercel/CI i ny fane |
| "Åpne i GitHub" | default, hover, klikk → ny fane |
| Beslutnings-rad | default, hover, klikk → fullt ADR-dokument |
| Risiko-rad | default, fargekoder per nivå (low/medium/high) |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Build-feil:** Repo-kort får destructive border + "Build feilet — siste rød 2 dager siden"
- **Stale (no commits >14d):** Repo-kort får warning-tint + "Ingen aktivitet på 18 dager"
- **Ingen ETA satt:** Milestone vises som "ETA: TBD"

## Ønsket output fra Claude Design

1. Lyst tema, full skjerm med Fase 1 aktiv (60% progress)
2. Mørkt tema
3. Repo-kort hover med expand (vis siste 3 commits)
4. Milestone-modal åpen med detaljer for Fase 2 (Booking)
5. Build-failure state på ett repo-kort
6. Mobil ≤640px — timeline blir vertikal stepper, repo-grid 1 kolonne

## Ikke-mål

- Ikke designe `MilestoneDetailModal`, `EditMilestoneModal` (egen batch)
- Ikke implementere live commit-feed (egen sub-prosjekt med GitHub-API)
- Ikke designe public roadmap (egen marketing-side, batch-8)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
