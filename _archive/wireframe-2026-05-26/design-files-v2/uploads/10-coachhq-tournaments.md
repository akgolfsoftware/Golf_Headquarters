# AK Golf Platform — CoachHQ — Turneringer

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/tournaments`
- **Arketype:** B — List + filter (kalender-view + liste-toggle)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/tournaments.html`
- **Audit:** `wireframe/audit/coachhq-tournaments.md`
- **Tilhørende modaler:** `TournamentRegistrationModal`, `LogisticsEditModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Turneringer er kommende konkurranser AK Golf-spillere skal delta i — fra klubbturneringer til Sørlandsåpent og NM. Coach bruker skjermen for å holde oversikt over hvilke spillere er påmeldt hva, planlegge logistikk (transport, overnatting), og koble turneringen til peak-readiness i treningsplanen via Periodisering-agenten.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Toggle øverst-høyre: `Kalender-view / Liste`. Liste er default.

### Kalender-view

- Måned-grid (4–5 uker × 7 dager)
- Turneringer som **lanes** (horisontale farge-bånd som spenner over flere dager hvis flerdags-turnering)
- Lane-farge basert på viktighet: ★★★★★ (lime accent), ★★★★ (primary), ★★★ (secondary), ★★ og ★ (muted)
- Klikk lane → quick-popover
- Naviger: `← Forrige måned / I dag / Neste måned →`

### Liste-view

Tabell med kolonner:

| Kolonne | Innhold |
|---|---|
| Dato | f.eks. «23.–25. mai 2026» (JetBrains Mono) |
| Navn | Turnering-navn (Geist 14px) + arrangør (muted 12px) |
| Lokasjon | f.eks. «Bossum GK» |
| Påmeldte spillere | Avatar-stack (opptil 4 + «+N») |
| Viktighet | ★1–5 (lime accent for ★★★★★) |
| Status | Pill: Åpen / Lukket / Pågår / Fullført |
| Detaljer | `Detaljer →` link |

## KPI-strip (4 kort)

1. Kommende turneringer: 8 (neste 90 dager)
2. Påmeldte totalt: 24 (på tvers av turneringer)
3. Neste turnering: «Sørlandsåpent · om 12 dager»
4. Påmeldingsfrist forfaller: 2 (denne uka)

## Filter-bar — UNIKT

- Søk: «Søk turnering eller arrangør»
- Chip: Viktighet (★1 / ★2 / ★3 / ★4 / ★5, multi)
- Chip: Status (Åpen / Lukket / Pågår / Fullført)
- Chip: Region (Lokal / Norge / Internasjonal)
- Sort: Dato / Viktighet / Påmeldte
- Primary CTA: `+ Ny turnering` → `TournamentRegistrationModal`

## Eksempel-rader (4 første)

| Dato | Navn | Lokasjon | Påmeldte | ★ | Status |
|---|---|---|---|---|---|
| 22.–24. mai | Sørlandsåpent | Sørlandet GK | 6 (M.R.P, E.S, L.H, +3) | ★★★★★ | Åpen |
| 30. mai | GFGK Klubbmesterskap | GFGK | 4 | ★★★ | Åpen |
| 6.–7. jun | NM Mid-amatør | Bærum GK | 2 | ★★★★★ | Lukket |
| 14. jun | WANG Sommer-cup | Bossum | 6 | ★★★ | Åpen |

## Klikkbare elementer

Se `wireframe/audit/coachhq-tournaments.md`. UNIKT:

| Element | States |
|---|---|
| Kalender/Liste-toggle | default, hover, active per side |
| Turnering-lane (kalender) | default, hover (lift + tooltip), klikk → quick-popover |
| Quick-popover | åpen, `Detaljer →` link, `LogisticsEditModal`-knapp |
| Stjerne-rating | default per nivå, fyllte for aktivt nivå |
| Avatar-stack | hover på avatar → navn-popover |
| Detaljer-link | default, hover, klikk → `/admin/tournaments/:id` |
| Naviger-knapper | default, hover, disabled |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty:** «Ingen kommende turneringer. Legg til den første →»
- **Loading kalender:** Skeleton lanes (grå pulserende bånd)
- **Loading liste:** 5 skeleton-rader

## Ønsket output fra Claude Design

1. Liste-view lyst tema, 8 turneringer
2. Kalender-view lyst tema (mai 2026 med 3 turneringer som lanes)
3. Mørkt tema (kalender)
4. Quick-popover åpen på Sørlandsåpent
5. Empty
6. Mobil ≤640px — kalender blir uke-view, liste blir kort-layout

## Ikke-mål

- Ikke designe `TournamentRegistrationModal`, `LogisticsEditModal` (egen batch)
- Ikke designe `UploadInvitationModal`
- Ikke designe `/admin/tournaments/:id`-detalj-skjerm
- Ikke designe peak-readiness-kobling mot plan (egen flow i Fase 5)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
