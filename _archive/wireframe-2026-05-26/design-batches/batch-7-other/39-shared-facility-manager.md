# AK Golf Platform — Shared — Facility manager

## Identitet

- **Produkt:** Shared / cross-cutting (admin)
- **URL:** `/admin/facility-manager`
- **Arketype:** G — Other (operations dashboard for fysiske fasiliteter)
- **Tier-gating:** Admin + facility-staff
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/facility-manager.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MaintenanceModal`, `IncidentModal`, `EquipmentSwapModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Facility manager er drifts-dashboardet for fysiske fasiliteter — for staff på Mulligan eller GFGK som må følge opp utstyr-feil, vedlikehold, hendelser (incident-rapporter), og daglig drift-sjekk. Forskjellig fra `/admin/facilities` (config) — dette er **ops**.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvordan fasilitetene har det."*
- Subtitle: `7 fasiliteter · 2 åpne incidents · 1 vedlikehold planlagt`

### Top-rad: Status-grid

Horizontal grid med 7 fasilitet-cards:
- Hver med: navn + status-prikk + "I drift"/"Vedlikehold"/"Stengt" + sparkline (siste 24t-belegg)
- Klikk → drill-down

### Hovedseksjon: 3 paneler

#### Panel 1: Åpne incidents (venstre)

Liste:
- Severity-pill (Lav / Middels / Høy / Kritisk)
- Tittel ("Trackman 3 — kalibrering ute av sync")
- Fasilitet (Studio 3)
- Rapportert (relativ tid + av hvem)
- Status (Ny / I gang / Venter på del / Løst)
- "Detalj →" → `IncidentModal`

#### Panel 2: Daglig sjekk (midten)

Sjekkliste-format:
- "Kontrollér alle Trackman-kalibreringer" — checkbox med tid (08:00 i dag)
- "Sjekk bag-rom-temperatur" — done (Joachim, kl 08:14)
- "Tøm avfall i Studio 1-4" — done
- "Test PA-system" — pending
- ... (6-8 items)

#### Panel 3: Planlagt vedlikehold (høyre)

Liste:
- Dato + fasilitet + type ("12. mai — Trackman 3 — re-kalibrering")
- Ansvarlig (avatar)
- "Detalj →" → `MaintenanceModal`

### Bottom-rad: KPI-strip

1. Snitt-uptime siste 30d: 99,4%
2. Åpne incidents: 2 (1 medium, 1 lav)
3. Vedlikehold neste 7d: 3
4. Daglig sjekk-completion: 75% (6 av 8)

## Filter-bar — UNIKT

- Chip: Fasilitet (multi: alle / Mulligan / GFGK / etc)
- Chip: Status (I drift / Vedlikehold / Stengt)
- Primary CTA: `+ Rapporter incident →` → `IncidentModal` (ny)

## Klikkbare elementer

| Element | States |
|---|---|
| Fasilitet-card | hover (lift), klikk → drill-down |
| Incident-rad | hover, klikk → `IncidentModal` |
| Sjekkliste-checkbox | uvalgt, valgt (med tid + person), uncheck-confirm |
| Vedlikehold-rad | hover, klikk → `MaintenanceModal` |
| Rapporter incident | default, hover, klikk → `IncidentModal` (form) |

## Empty / loading / error

- **Empty incidents:** "Ingen åpne incidents. Bra jobba!" (accent CheckCircle)
- **Empty sjekkliste:** "Ingen oppgaver i dag" (sjelden)
- **Empty vedlikehold:** "Ingen planlagt — alt OK"
- **Loading:** Skeleton-paneler

## Ønsket output fra Claude Design

1. Lyst tema, full dashboard
2. Mørkt tema, samme
3. En fasilitet i "Vedlikehold"-state (gold-prikk)
4. Empty incidents-state
5. Mobil ≤640px — paneler stables vertikalt 1-kolonne

## Ikke-mål

- Ikke designe `MaintenanceModal`, `IncidentModal`, `EquipmentSwapModal` (egen batch)
- Ikke designe utstyrs-katalog (egen flate)
- Ikke designe vedlikeholds-historikk

## Når du er ferdig

Lim design-link tilbake til Claude Code.
