# AK Golf Platform — CoachHQ — Spiller-detalj (light variant)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/elever/:id` (light view)
- **Arketype:** G — Other (sammendrags-card med navigasjon til full-detail)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/spiller-detalj.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `QuickActionModal`, `MessageQuickModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Light-varianten av spiller-detalj — hurtig-popover/sidebar som åpnes fra alle steder hvor et spiller-navn vises (kalender-event, godkjenning, transaksjon). Forskjellig fra full spiller-detalj-side (`/admin/elever/:id` arketype-C) — denne er kompakt, lasterask, og har 4–5 hurtig-aksjoner. Anders bruker den 50+ ganger om dagen.

## Layout — UNIKT for denne skjermen

To former:

### Form A: Sidebar-panel (desktop, 480px bredde)

Slide-in fra høyre, eller åpnes som drawer.

#### Header
- Stort avatar (96px) + navn (italic Instrument Serif 28px)
- Subtitle: `Kategori A · Elite · HCP +2,4`
- Status-prikk (Aktiv accent)
- Lukk-X øverst-høyre

#### Hurtig-stats (3 kort, kompakt)
- HCP-trend: `+2,4` med sparkline 30d (success)
- Volum siste 7d: `4t 12m` med trend
- Streak: `23 dager`

#### Hurtig-aksjoner (4 knapper, vertikalt stablet)
- `Send melding →` → `MessageQuickModal`
- `Logg notat →` → quick-textarea inline
- `Endre kategori →` → modal
- `Marker som inaktiv →` → confirm

#### Siste aktivitet (5 events)
- Timeline-mini (klokkeslett + 1-linje):
  - "I dag 14:32 — Coaching-økt med Anders K"
  - "I går 09:15 — Logget runde Bossum +3"
  - "12. mai — Fikk plan-aksjon godkjent"
  - "11. mai — Selvtrening 1t 30m (Trackman)"
  - "10. mai — Periodiserings-agent oppdaterte plan"

#### Footer
- "Åpne full profil →" link til `/admin/elever/:id` (full arketype-C)

### Form B: Inline-popover (i tabell, mindre)

Mindre versjon (320px bred) — kun avatar + navn + 2-stats + 2-aksjoner. Vises på hover av spillernavn i tabeller.

## KPI-strip — IKKE for denne (kompakt detail)

## Klikkbare elementer

| Element | States |
|---|---|
| Lukk-X | default, hover, klikk → slide-out + close |
| Hurtig-aksjons-knapp | default, hover, loading, success |
| Logg notat | default, klikk → expand textarea, save → toast |
| Aktivitet-rad | default, hover, klikk → relevant view |
| Åpne full profil | default, hover, klikk → navigate |

## Empty / loading / error

- **Empty (ny spiller, ingen data):** "Ny spiller. Aktivitet vises etter første økt."
- **Loading:** Skeleton-header + skeleton-stats
- **Error (kan ikke laste):** "Kunne ikke laste profil. Prøv igjen →"

## Ønsket output fra Claude Design

1. Lyst tema, sidebar-panel åpent (desktop) med Markus R
2. Mørkt tema, samme
3. Inline-popover-form (smaller, 320px)
4. Hurtig-aksjons-state: "Logg notat" expanded med textarea
5. Empty (ny spiller)
6. Mobil ≤640px — sidebar blir bottom-sheet (full bredde, slides opp)

## Ikke-mål

- Ikke designe `QuickActionModal`, `MessageQuickModal` (egen batch)
- Ikke designe full spiller-detalj-side (det er arketype-C, separat batch)
- Ikke designe spiller-redigerings-form

## Når du er ferdig

Lim design-link tilbake til Claude Code.
