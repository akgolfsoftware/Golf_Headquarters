# Audit: PlayerHQ — Baner (kart + bibliotek)

**HTML:** `screen-deck/playerhq/baner.html`
**URL:** `/portal/mal/baner`
**Tier:** Pro
**Antall klikkbare elementer:** 25

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Action-strip-items (4) | Inline | Tooltips | OK |
| "Importer fra GolfBox" knapp | Modal | GolfBoxImportModal | NEI - ny modal |
| Filter-chips (8: Mine/Alle/Sørlandet/Østlandet/Vestlandet/Trøndelag/18h/9h) | State-change | Inline filter | OK |
| Søke-input på kart | Inline | Filter kart + liste | OK |
| Filter-knapp på kart | Modal | MapFilterModal | NEI - ny modal |
| Zoom +/− (2) | State-change | Kart-zoom | OK |
| SVG-bane-pins (10+) | Modal | CourseDetailModal | NEI - ny modal |
| Bane-cards i sidebar (10) | Modal | CourseDetailModal | NEI - ny modal |

## States som må designes (utenom default)
- Empty-state (ingen baner i loggen)
- Loading skeleton (kart + cards)
- Hover-state på pin (tooltip)
- Selected pin (større + ring)
- "Aldri spilt" vs "Spilt" pin-styling
- Hjem-base-pin (gul ring)
- Tier-locked-state (Free ser kun mine baner, ikke kart)
- CourseDetailModal (par/slope/runder/SG-historikk per bane)
- GolfBoxImportModal (login + velg baner)
- MapFilterModal (avansert filter — slope/par/region)
