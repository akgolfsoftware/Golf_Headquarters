# Audit: System — Loading-states (katalog)

**HTML:** `screen-deck/system/loading-states.html`
**URL:** (system, ingen route — designsystem-katalog)
**Antall klikkbare elementer:** 11 (sidebar-nav + 2 demo-knapper)

## Klikkbare elementer

### Sidebar (CoachHQ-shell, gjenbruk)

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar "Hub" | Skjerm | `/admin/hub` | OK |
| Sidebar "Elever" | Skjerm | `/admin/elever` | OK |
| Sidebar "Treningsplaner" | Skjerm | `/admin/plans` | OK |
| Sidebar "Bookinger" | Skjerm | `/admin/bookings` | OK |
| Sidebar "Godkjenninger" | Skjerm | `/admin/approvals` | OK |
| Sidebar "Analytics" | Skjerm | `/admin/analytics` | OK |
| Sidebar "Økonomi" | Skjerm | `/admin/finance` | OK |
| Sidebar "Fasiliteter" | Skjerm | `/admin/facilities` | OK |
| Sidebar "Innstillinger" (active) | Skjerm | `/admin/settings` | OK |

### Demo-knapper i katalogen

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| "Lagrer…" demo-knapp (disabled) | Demo | Ingen handling | (demo) |
| "Sender e-post…" demo-knapp (disabled) | Demo | Ingen handling | (demo) |

> Dette er en katalog-side, ikke en interaksjons-side. Klikkbarheten ligger i sidebar-nav som gjenbrukes på alle CoachHQ-skjermer.

## Loading-mønstre dokumentert (må designes som tokens/komponenter)

1. **Skeleton-page** — full sidelast (dashboard, plan-detalj, spillerprofil)
2. **Spinner CSS-only** — generisk venting (modal-actions, knapp-states, < 2s)
3. **Progress-bar med steg** — flersteg (plan-wizard, onboarding, agent-runs)
4. **Skeleton-table** — tabellrader (elev-liste, godkjenninger, bookinger)
5. **Skeleton-card-grid** — kort-grid (elev-grid, øvelse-bibliotek)
6. **Tekst med animerte dots** — agent-arbeid pågår
7. **Inline-load med spinner + linear bar** — ekstern data (TrackMan, GolfBox, Stripe)
8. **Inline knapp-state** — submit-knapp med spinner (alle async submits)
9. **Lazy-load / pagination-loader** — feed-paging (aktivitets-feed, varsler)

## States som må designes

- Hver loading-variant: idle → loading → success → error-overgang
- Animasjons-tokens: `shimmer` (1.4s), `spin` (0.8s), `dots-bounce` (1.2s), `lin-grow` (2s)
- Skeleton-fargetokens (lyst + mørkt tema)
- Disabled-knapp med spinner-state for alle btn-varianter (primary, ghost, link)
- Min-display-tid (anbefalt 200ms) for å unngå "flash of loading"
