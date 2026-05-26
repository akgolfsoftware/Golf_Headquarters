# Audit: CoachHQ — Hub Dashboard

**HTML:** `screen-deck/coachhq/hub.html`
**URL:** `/admin/hub`
**Antall klikkbare elementer:** 24

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker: Hub, Daglig Brief, Treningsplaner, Elever, Coaching Board, Godkjenninger, Bookinger, Tester, Analytics, Økonomi, Fasiliteter, Innstillinger) | Navigasjon | Ny skjerm per lenke | OK (separate skjermer) |
| Bento-card "Godkjenninger · 3 plan-aksjoner" | Ny skjerm | `/admin/approvals` | OK |
| Bento-card "Uleste meldinger · 5 fra spillere" | Ny skjerm | `/admin/messages` | NEI - skjerm mangler wireframe |
| Bento-card "Spillere uten plan · 4 av 38" | Ny skjerm | `/admin/elever` | OK |
| Bento-card "Tester forfaller · 7 denne uka" | Ny skjerm | `/admin/sessions` | OK |
| Bento-card "Utestående faktura · 3 200 kr" | Ny skjerm | `/admin/finance` | OK |
| Bento-card "Tournament-watch · Sørlandsåpent" | Ny skjerm | `/admin/tournaments` | OK |
| "Se alle →" (Siste aktivitet) | Ny skjerm | `/admin/activity-log` | NEI - skjerm mangler |
| Aktivitets-rad-pill (Ny/Godkjenn/Bekreftet/SLA) | State/popover | RowDetailPopover | NEI |
| Avatar/profilbilde (hero AK) | Popover | UserMenuPopover | NEI |

## States som må designes (utenom default)
- Hover-states for alle bento-cards (lift, accent border)
- Empty-state: ingen aktivitet, ingen forfallne tester
- Loading skeleton for KPI-strip og siste-aktivitet-tabell
- Error-state: feilet KPI-fetch
- Real-time update for "neste booking om X tid" (live-counter)
- Notifikasjons-pulse på pill (rød prikk for nye)
