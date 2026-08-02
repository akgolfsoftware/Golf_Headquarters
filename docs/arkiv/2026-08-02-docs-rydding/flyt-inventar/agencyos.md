# Flyt-inventar — AgencyOS

Knapp-/flyt-inventar for det rene `/admin`-settet (AgencyOS). Kartlegger alle interaktive
elementer (knapper, `<Link>`, klikkbare rader/kort, `router.push`, `<form action>`, `onClick`)
per skjerm og hvor de fører. Mål: avdekke «døde knapper».

**DØD** = `href="#"` / ingen handler / tom eller `// TODO` onClick / fører til KUTT-LISTA
(`/admin` rot-redirect, `/admin/calendar*`, `/admin/messages`, `/admin/approvals*`, `/admin/board`,
`/admin/plans/templates*`, `/admin/anlegg*`, `/admin/agencyos/okonomi`, `/admin/agencyos/spillere`)
/ destinasjonsrute mangler.

Generert 2026-06-17.

---

## Delt chrome (gjelder alle skjermer)

### Sidebar — `src/components/admin/agencyos-sidebar.tsx` + `src/lib/admin-nav.ts`

| Element | Fører til | Status |
|---|---|---|
| Org-velger («AK Golf HQ · N spillere») | ingen handler / href | DØD — `<button>` uten onClick (kun visuell) |
| Alle nav-leaves (Oversikt, Spillere, Grupper, Workbench, m.fl.) | ruter fra `admin-nav.ts` | OK |
| Nav-leaf «Anlegg» (under Gjennomføre) | `/admin/anlegg` | DØD — KUTT-LISTA |
| Footer profil-rad | `/admin/settings` | OK |

### Topbar — `src/components/admin/agencyos-topbar.tsx`

| Element | Fører til | Status |
|---|---|---|
| Spiller/Gruppe-toggle | lokal state | OK |
| Scope-velger + popover (velg spiller/gruppe) | lokal state | OK |
| «Åpne {navn} i Workbench» | `/admin/spillere/{id}/workbench` el. `/admin/grupper/{id}` | OK |
| Hurtigsøk ⌘K | dispatch `global-search:open` | OK |
| «Vis som spiller» | POST `/api/view-mode` → `/portal` | OK |
| Varsler (bjelle) | `/admin/foresporsler` | OK |
| Coach-meny → Innstillinger | `/admin/settings` | OK |
| Coach-meny → Logg ut | `logout()` | OK |

---

## /admin/agencyos

Cockpit (`src/components/admin/cockpit/agency-cockpit.tsx` + `_cockpit-interactive.tsx`).

| Element | Fører til | Status |
|---|---|---|
| Innboks «Se alle» | `/admin/foresporsler` | OK |
| Innboks-aksjoner (Godkjenn/Book/Svar) | optimistisk state | OK |
| Oppgaver «+ Ny» / «Legg til» | lokal add-state (setAdding) | OK |
| Oppgave-toggle (fullfør) | toggle(id) | OK |
| Fokus-kort handlinger m/ href | `it.href` / `a.href` (dynamisk) | OK |
| Fokus-kort handling UTEN href og UTEN confirm | `onClick={undefined}` | ~ Betinget død — kun hvis data mangler både href og confirm (data-drevet, ikke statisk) |
| Pin/undo-knapper | setPin / undo (lokal state) | OK |
| KPI-kort lenker (`s.href`) | dynamiske admin-ruter | OK |

## /admin/agencyos/caddie

| Element | Fører til | Status |
|---|---|---|
| DraftActions (Godkjenn og send / Rediger / Avvis) | confirm-state | OK |
| FleetToggle | lokal toggle | OK |

## /admin/agencyos/uka

| Element | Fører til | Status |
|---|---|---|
| «Ny booking» (hero) | `/admin/kalender` | OK |
| «Åpne kalender →» | `/admin/kalender` | OK |

## /admin/spillere

| Element | Fører til | Status |
|---|---|---|
| «Eksport» | CSV klient-side | OK |
| «Ny spiller» | `/admin/spillere/ny` | OK |
| Søk + gruppe-/status-filter | klient-filter | OK |
| Bulk «Tildel plan» | `/admin/plans` | OK |
| Bulk «Legg i gruppe» | `/admin/grupper` | OK |
| Bulk «Send melding» | `/admin/innboks` | OK |
| Spiller-rader/kort | `/admin/spillere/{id}` | OK |

## /admin/spillere/[id]

| Element | Fører til | Status |
|---|---|---|
| «Alle spillere» (tilbake) | `/admin/spillere` | OK |
| «Melding» / «Send melding» | `/admin/innboks` | OK |
| «Ny plan» / «Ny økt» / «Lag plan i Workbench» | `/admin/spillere/{id}/workbench` | OK |
| Coach-flagg «Avvis» | `/admin/godkjenninger` | OK |
| Aktiv plan-kort | `/admin/plans` | OK |
| «Book Pro-time» | `/admin/bookinger` | OK |
| «Meld på turnering» | `/admin/tournaments` | OK |
| Melding-kort | `/admin/innboks` el. `/admin/approvals` | ~ Sjekk: hvis lenke til `/admin/approvals` → DØD (KUTT) |

## /admin/spillere/[id]/workbench

| Element | Fører til | Status |
|---|---|---|
| Workbench-komponent (full) | intern desktop/mobil-workbench | OK (egen flate, ikke kartlagt i detalj) |

## /admin/spillere/[id]/tester

| Element | Fører til | Status |
|---|---|---|
| CoachSpillerTesterTabScreen | rendret test-flate | OK |

## /admin/spillere/[id]/tildel-test

| Element | Fører til | Status |
|---|---|---|
| TildelTestModalScreen | rendret tildel-flate | OK |

## /admin/spillere/ny

| Element | Fører til | Status |
|---|---|---|
| «Stallen» (tilbake) | `/admin/spillere` | OK |
| SpillerOnboardingWizard | server-action | OK |

## /admin/stall

| Element | Fører til | Status |
|---|---|---|
| «Eksporter» (header) | ingen handler/href | DØD — foreldreløs knapp |
| «Ny spiller» (header) | ingen handler/href | DØD — foreldreløs (burde gå til `/admin/spillere/ny`) |
| HubCards (Alle spillere, Grupper, Talent-radar, Discovery, Lag-snitt, WAGR-import) | respektive ruter | OK |

## /admin/grupper

| Element | Fører til | Status |
|---|---|---|
| «Ny gruppe» | `/admin/grupper` (selv) | DØD — peker til seg selv, ingen opprett-flyt |
| Gruppe-kort | `/admin/grupper/{id}` | OK |

## /admin/grupper/[id]

| Element | Fører til | Status |
|---|---|---|
| «Planlegg samling» | `/admin/bookings/ny?groupId=` | DØD — feil rute (`bookings` finnes ikke; skal være `bookinger`) |
| «Legg til spiller» | `/admin/grupper/{id}/rediger` | DØD — rute mangler |
| «Start økt» | ingen handler | DØD — `<button>` uten onClick |
| «Se alle →» (timeplan) | `/admin/grupper/{id}/kalender` | DØD — rute mangler |
| «Detaljer» (neste samling) | `/admin/grupper/{id}/samling/{sid}` | DØD — rute mangler |
| «Åpne →» (kommende samlinger) | `/admin/grupper/{id}/samling/{sid}` | DØD — rute mangler |
| «gruppe-analyse» | `/admin/grupper/{id}/analyse` | DØD — rute mangler |

## /admin/coach-workbench

| Element | Fører til | Status |
|---|---|---|
| Rendret workbench | intern | OK |

## /admin/kalender

| Element | Fører til | Status |
|---|---|---|
| «Ny økt» | `/admin/coach-workbench` | OK |
| «Måned» (toggle) | `/admin/kalender/maned` | OK |
| «Uke» / dag-navigasjon | URL-params | OK |

## /admin/bookinger

| Element | Fører til | Status |
|---|---|---|
| «Ny booking» | `/admin/bookinger/ny` | OK |
| «Bekreft» / «Avvis» (rader) | server-actions | OK |
| «Se» (bekreftede) | `/admin/spillere/{userId}` | OK |

## /admin/bookinger/ny

| Element | Fører til | Status |
|---|---|---|
| Booking-wizard | server-action | OK |

## /admin/availability

| Element | Fører til | Status |
|---|---|---|
| «Synk» (RefreshCw) | ingen handler | DØD — no-op (dokumentert som demo-no-op) |
| Måned-navigasjon (piler) | `?m=YYYY-MM` | OK |

## /admin/kapasitet

| Element | Fører til | Status |
|---|---|---|
| «Eksporter» | disabled | ~ Bevisst deaktivert (ikke død, men ufunksjonell) |
| «Bulk-blokker» | disabled | ~ Bevisst deaktivert |
| «Til tjenester» | `/admin/services` | OK |

## /admin/locations

| Element | Fører til | Status |
|---|---|---|
| «Ny lokasjon» / «Endre» | dialog/form | OK |

## /admin/facilities

| Element | Fører til | Status |
|---|---|---|
| «Gå til lokasjoner» / lokasjons-lenke | `/admin/locations` | OK |
| Fasilitet-kort | `/admin/facilities/{id}` | OK (`[id]` finnes) |

## /admin/services

| Element | Fører til | Status |
|---|---|---|
| «Ny tjeneste» | dialog/form | OK |

## /admin/gjennomfore

| Element | Fører til | Status |
|---|---|---|
| «I dag» | ingen handler | DØD — `<button>` uten onClick |
| «Ny booking» (header) | ingen handler | DØD — `<button>` uten onClick |
| «Coach-kalender» kort | `/admin/kalender/uke` | OK |
| «Bookinger» kort | `/admin/bookinger` | OK |
| «Anlegg» kort | `/admin/anlegg` | DØD — KUTT-LISTA |
| «Tilgjengelighet» / «Kapasitet» / «Tjenester» / «TrackMan» kort | respektive ruter | OK |
| «Live-økter / Start ny økt →» kort | ingen href | DØD — HubCard uten href (rendres som div) |

## /admin/okter

| Element | Fører til | Status |
|---|---|---|
| «Åpne kalender» | `/admin/kalender` | OK |
| «Åpne plan» (rader) | `/admin/plans/{planId}` | OK |

## /admin/live/[sessionId]/active

| Element | Fører til | Status |
|---|---|---|
| «Brief» (tilbake) | `/admin/live/{sid}/brief` | OK |
| «Avslutt og se sammendrag» | `/admin/live/{sid}/summary` | OK (`summary` finnes) |

## /admin/live/[sessionId]/brief

| Element | Fører til | Status |
|---|---|---|
| Tilbake-lenke | `/admin/spillere/{id}` el. `/admin/agencyos` | OK |
| «Start live-monitoring →» | `/admin/live/{sid}/active` | OK |

## /admin/recording

| Element | Fører til | Status |
|---|---|---|
| RecordingControls | event-handlere | OK |
| RecordingAnalyzeButton | POST `/api/recording/analyze` | OK |

## /admin/trackman

| Element | Fører til | Status |
|---|---|---|
| FilterChip «Spiller» | ingen onClick | DØD — viser, men filtrerer ikke |
| FilterChip «Miljø» | ingen onClick | DØD |
| FilterChip «Kilde» | ingen onClick | DØD |
| Spiller-rad chevron | `/admin/spillere/{userId}` | OK |

## /admin/videoer

| Element | Fører til | Status |
|---|---|---|
| Spiller-navn (VideoCard) | `/admin/elever/{playerId}` | DØD — rute mangler (skal være `/admin/spillere`) |
| «Åpne» | getSignedVideoUrl | OK |
| «Slett» | deleteVideo | OK |

## /admin/innboks

| Element | Fører til | Status |
|---|---|---|
| «Til spillerlisten» (tom-tilstand) | `/admin/spillere` | OK |
| MessagesInbox tråd-valg / samtale | interaktiv | OK |

## /admin/kommunikasjon

| Element | Fører til | Status |
|---|---|---|
| «Åpne» (Innboks) | `/admin/innboks` | OK |
| «Åpne» (E-postmaler) | `/admin/email-templates` | OK |
| «Åpne» (Notion-prosjekter/oppgaver) | `/admin/workspace/notion` | OK |

## /admin/queue

| Element | Fører til | Status |
|---|---|---|
| «Justere regler» | `/admin/settings` | OK |
| «Generer AI-aksjoner» | disabled (v2) | ~ Bevisst deaktivert |
| Spiller-kort | `/admin/spillere/{playerId}` | OK |
| «Send melding» | `/admin/innboks` | OK |
| «Ring / kontakt» | `/admin/spillere/{playerId}` | OK |
| «Book økt» | `/admin/bookinger/ny` | OK |

## /admin/foresporsler

| Element | Fører til | Status |
|---|---|---|
| «Godta» / «Avvis» | server-actions | OK |

## /admin/godkjenninger

| Element | Fører til | Status |
|---|---|---|
| «Godta» / «Avvis» (ApprovalActions) | server-actions | OK |

## /admin/godkjenn-portal

| Element | Fører til | Status |
|---|---|---|
| Design-fil-lenker | `{designPath}` (DB-drevet) | OK |
| «Live» | `{route}` ([param]→demo) | OK |
| «Vurder» | `/admin/godkjenn-portal/review` | OK |

## /admin/plans

| Element | Fører til | Status |
|---|---|---|
| «Maler» | `/admin/plan-templates` | OK |
| «Ny plan» | `/admin/spillere/{id}/workbench` (fallback `/admin/spillere`) | OK |
| Plan-kort | `/admin/plans/{planId}` | OK |

## /admin/plans/[planId]

| Element | Fører til | Status |
|---|---|---|
| «Planer» (breadcrumb) | `/admin/plans` | OK |
| Faner (Oversikt/Øvelser/Notater/Rapport) | `?tab=` | OK |
| «Legg til økt» | modal | OK |
| PlanActions | interne actions | OK |

## /admin/plan-templates

| Element | Fører til | Status |
|---|---|---|
| «Ny mal» | `/admin/plan-templates/ny` | OK |
| Mal-kort | `/admin/plan-templates/{id}` | OK |

## /admin/planlegge

| Element | Fører til | Status |
|---|---|---|
| «Ny plan» (header) | ingen handler | DØD — `<button>` uten onClick |
| «Treningsplaner» kort | `/admin/plans` | OK |
| «Plan-maler» kort | `/admin/plans/templates` | DØD — KUTT-LISTA (`/admin/plans/templates*`) |
| «Teknisk plan» kort | `/admin/teknisk-plan` | OK |
| «Drill-bibliotek» / «Turneringer» / «Økter» / «Videoer» kort | respektive ruter | OK |

## /admin/teknisk-plan

| Element | Fører til | Status |
|---|---|---|
| «Ny teknisk plan-mal» | `/admin/plans/templates/ny` | DØD — KUTT-LISTA (`/admin/plans/templates*`) |
| Aktivplan-lenke | `/admin/plans/{planId}` | OK |
| «Teknisk plan» (action) | `/admin/teknisk-plan/{spillerId}` | OK |
| «Se alle plan-maler» / «Bruk mal» | `/admin/plans/templates` | DØD — KUTT-LISTA |

## /admin/drills

| Element | Fører til | Status |
|---|---|---|
| «Ny drill» | `/admin/drills/ny` | OK |
| Kategori-filter | `/admin/drills?kat=` | OK |
| Drill-kort | `/admin/drills/{id}` | OK |

## /admin/tester

| Element | Fører til | Status |
|---|---|---|
| «Ny test» | `/admin/tester` (selv) | DØD — peker til seg selv |
| Rader | `/admin/spillere/{spillerId}` | OK |

## /admin/tester/[id]

| Element | Fører til | Status |
|---|---|---|
| «Tester» (breadcrumb) | `/admin/tester` | OK |
| «Del med spiller» | ingen handler | DØD — `<button>` uten onClick |
| «Eksporter PDF» | ingen handler | DØD — `<button>` uten onClick |
| «Logg ny test» | ingen handler | DØD — `<button>` uten onClick |

## /admin/analyse

| Element | Fører til | Status |
|---|---|---|
| «Lag-snitt» gruppe-lenke | `/admin/lag-snitt` | OK |

## /admin/analysere

| Element | Fører til | Status |
|---|---|---|
| Kort: Lag-snitt / Tester / Godkjenninger / Forespørsler / Rapporter / Runder | respektive ruter | OK |
| «Finance» kort | `/admin/finance` | ~ OK (dir finnes) — men engelsk duplikat av `/admin/okonomi`; vurder å samle |
| «Tilstander» kort | `/admin/tilstander` | OK (dir finnes) |

## /admin/analytics

| Element | Fører til | Status |
|---|---|---|
| AnalyticsViewToggle / EksportTrigger | lokal state / modal | OK |
| FilterChip (Spiller/Bane/Periode) | ingen onClick | DØD — 3 chips uten handler |

## /admin/lag-snitt

| Element | Fører til | Status |
|---|---|---|
| Statisk pyramide-visning | — | OK (ingen interaktive elementer) |

## /admin/runder

| Element | Fører til | Status |
|---|---|---|
| Søk | klient-side | OK |
| FilterChip (Spiller/Bane/Periode) | ingen onClick | DØD — 3 chips uten handler |
| «Profil»-lenker | `/admin/spillere/{userId}` | OK |

## /admin/reports

| Element | Fører til | Status |
|---|---|---|
| «Ny rapport» | `/admin/reports` (selv) | DØD — peker til seg selv |
| Rapport-tiles | `/admin/lag-snitt`, `/admin/analyse`, `/admin/tournaments`, `/api/admin/reports/*` | OK |

## /admin/talent (+ /radar /sammenligning /wagr-import)

| Element | Fører til | Status |
|---|---|---|
| «Discovery» / «Kohort» / «Radar» | respektive talent-ruter | OK |
| «Åpne radar» (tabell) | `/admin/talent/radar/{userId}` | OK (`[playerId]` fanger URL-en) |
| radar: «Sammenlign» / «WAGR-import» | respektive ruter | OK |
| radar: kort-klikk | `/admin/spillere/{userId}` | OK |
| wagr-import: «Synk nå» | ingen handler + `// TODO` | DØD — no-op |
| wagr-import: spiller-rader | `/admin/spillere/{userId}` | OK |
| sammenligning: ingen interaktive elementer | — | OK |

## /admin/workspace

| Element | Fører til | Status |
|---|---|---|
| «Filter» | ingen handler | DØD |
| «Åpne Notion» | ingen handler | DØD |
| «Ny oppgave» | ingen handler | DØD |
| «Legg til oppgave for i dag» | ingen handler | DØD |
| Brenner «Fullfør» / «Snooze» | ingen handler | DØD |
| «VIS ALLE 38» | `/admin/workspace/oppgaver` | OK |

## /admin/workspace/oppgaver

| Element | Fører til | Status |
|---|---|---|
| Liste/Kanban/Kalender-toggle | `?view=` | OK |
| «Ny oppgave» | ingen handler | DØD |
| Søk | ingen handler | DØD — dødt input |
| Filter-piller | ingen handler | DØD |
| Kanban «+» (per kolonne) | ingen handler | DØD |
| «Rydd filter» | `?` (nullstiller) | OK |

## /admin/caddie

| Element | Fører til | Status |
|---|---|---|
| CoAgent-komponent | rendret | OK |

## /admin/agents

| Element | Fører til | Status |
|---|---|---|
| «Detaljer» (per agent) | `/admin/agents/{slug}` | OK |
| «Se alle» (stat-kort) | `/admin/approvals` | DØD — KUTT-LISTA |

## /admin/okonomi

| Element | Fører til | Status |
|---|---|---|
| Ingen klikkbare elementer | — | OK (kun visning) |

## /admin/organisasjon

| Element | Fører til | Status |
|---|---|---|
| «Innstillinger» (header) | ingen handler | DØD — `<button>` uten onClick |
| HubCards (Klubb-info, Team, Integrasjoner, Innstillinger, AI-agenter, E-postmaler, Audit-log, Min profil) | respektive ruter | OK |

## /admin/settings

| Element | Fører til | Status |
|---|---|---|
| Faner (org/team/tilgang) | `?tab=` | OK |
| «Full tilgangsmatrise» | `/admin/settings/tilgang` | OK |

## /admin/klubb/innstillinger

| Element | Fører til | Status |
|---|---|---|
| KlubbInnstillingerClient | rendret | OK |

## /admin/team

| Element | Fører til | Status |
|---|---|---|
| «Inviter coach» | `/admin/team/inviter` | OK |
| Søk | ingen handler | DØD — dødt input |
| «Send e-post» (per kort) | `mailto:` | OK |

## /admin/integrasjoner

| Element | Fører til | Status |
|---|---|---|
| «Administrer» / «Koble til» | `/admin/settings/calendar` el. eksterne URLer | OK |
| «Se økonomi» | `/admin/finance` | ~ OK (dir finnes) — engelsk duplikat; vurder `/admin/okonomi` |

## /admin/email-templates

| Element | Fører til | Status |
|---|---|---|
| «Rediger» | `/admin/email-templates/{id}/rediger` | OK |
| TemplateForm-triggere | klient-komponent | OK |
| «Send test (kommer)» | disabled | ~ Bevisst deaktivert |

## /admin/audit-log

| Element | Fører til | Status |
|---|---|---|
| Ingen klikkbare elementer | — | OK (kun visning) |

## /admin/profile

| Element | Fører til | Status |
|---|---|---|
| «Se offentlig profil» | `/` | OK |
| EditProfileForm | klient-komponent | OK |
| «Skjul» (Danger Zone) | ingen handler | DØD — `<button>` uten onClick |

## /admin/mer (mobil «mer»-meny)

| Element | Fører til | Status |
|---|---|---|
| Oppgaver / Tildelt meg / Grupper / Talent-radar / Sammenligning / WAGR-import | respektive ruter | OK |
| Workbench | `/admin/coach-workbench` | OK |
| Treningsplaner / Plan-maler / Drill-bibliotek / Turneringer / Bookinger / Tilgjengelighet / Tjenester | respektive ruter | OK |
| «Anlegg» | `/admin/anlegg` | DØD — KUTT-LISTA |
| Stall-analyse / Lag-snitt / Tester / Rapporter / Admin | respektive ruter | OK |

---

## Oppsummering: 64 skjermer, 38 døde knapper

Døde knapper (statiske — gjelder uansett data):

1. **Sidebar — org-velger** — `<button>` uten handler.
2. **Sidebar nav — «Anlegg»** — `/admin/anlegg` (KUTT-LISTA).
3. **/admin/stall — «Eksporter»** — ingen handler.
4. **/admin/stall — «Ny spiller»** — ingen handler (burde gå til `/admin/spillere/ny`).
5. **/admin/grupper — «Ny gruppe»** — peker til seg selv (`/admin/grupper`).
6. **/admin/grupper/[id] — «Planlegg samling»** — `/admin/bookings/ny` (typo; rute finnes ikke, skal være `bookinger`).
7. **/admin/grupper/[id] — «Legg til spiller»** — `/admin/grupper/{id}/rediger` (rute mangler).
8. **/admin/grupper/[id] — «Start økt»** — ingen handler.
9. **/admin/grupper/[id] — «Se alle» (timeplan)** — `/admin/grupper/{id}/kalender` (rute mangler).
10. **/admin/grupper/[id] — «Detaljer» (neste samling)** — `/admin/grupper/{id}/samling/{sid}` (rute mangler).
11. **/admin/grupper/[id] — «Åpne» (kommende samlinger)** — samme manglende rute.
12. **/admin/grupper/[id] — «gruppe-analyse»** — `/admin/grupper/{id}/analyse` (rute mangler).
13. **/admin/availability — «Synk»** — no-op (dokumentert demo).
14. **/admin/gjennomfore — «I dag»** — ingen handler.
15. **/admin/gjennomfore — «Ny booking»** — ingen handler.
16. **/admin/gjennomfore — «Anlegg» kort** — `/admin/anlegg` (KUTT-LISTA).
17. **/admin/gjennomfore — «Live-økter / Start ny økt»** — HubCard uten href.
18. **/admin/trackman — FilterChip «Spiller»** — ingen onClick.
19. **/admin/trackman — FilterChip «Miljø»** — ingen onClick.
20. **/admin/trackman — FilterChip «Kilde»** — ingen onClick.
21. **/admin/videoer — spiller-navn** — `/admin/elever/{id}` (rute mangler; skal være `/admin/spillere`).
22. **/admin/planlegge — «Ny plan»** — ingen handler.
23. **/admin/planlegge — «Plan-maler» kort** — `/admin/plans/templates` (KUTT-LISTA).
24. **/admin/teknisk-plan — «Ny teknisk plan-mal»** — `/admin/plans/templates/ny` (KUTT-LISTA).
25. **/admin/teknisk-plan — «Se alle plan-maler» / «Bruk mal»** — `/admin/plans/templates` (KUTT-LISTA).
26. **/admin/tester — «Ny test»** — peker til seg selv (`/admin/tester`).
27. **/admin/tester/[id] — «Del med spiller»** — ingen handler.
28. **/admin/tester/[id] — «Eksporter PDF»** — ingen handler.
29. **/admin/tester/[id] — «Logg ny test»** — ingen handler.
30. **/admin/analytics — FilterChip (Spiller/Bane/Periode)** — ingen handler (3 chips).
31. **/admin/runder — FilterChip (Spiller/Bane/Periode)** — ingen handler (3 chips).
32. **/admin/reports — «Ny rapport»** — peker til seg selv (`/admin/reports`).
33. **/admin/talent/wagr-import — «Synk nå»** — no-op (`// TODO`).
34. **/admin/workspace — «Filter» / «Åpne Notion» / «Ny oppgave» / «Legg til oppgave» / Brenner «Fullfør» / «Snooze»** — alle uten handler.
35. **/admin/workspace/oppgaver — «Ny oppgave» / søk / filter-piller / kanban «+»** — alle uten handler.
36. **/admin/agents — «Se alle» (stat-kort)** — `/admin/approvals` (KUTT-LISTA).
37. **/admin/organisasjon — «Innstillinger» (header)** — ingen handler.
38. **/admin/team — søk** — dødt input. **/admin/profile — «Skjul» (Danger Zone)** — ingen handler.

### Merknader (ikke talt som døde, men verdt et blikk)

- **Bevisst deaktiverte knapper** (`disabled`, ikke død kode): /admin/kapasitet «Eksporter» + «Bulk-blokker», /admin/queue «Generer AI-aksjoner» (v2), /admin/email-templates «Send test (kommer)».
- **Engelsk duplikat-rute**: `/admin/finance` finnes og lenkes fra /admin/analysere og /admin/integrasjoner, men er et duplikat av `/admin/okonomi` — ikke død, men IA-rydd-kandidat.
- **Betinget**: cockpit-fokuskort-handling uten både `href` og `confirm` får `onClick={undefined}` — kun død hvis seedet data mangler begge feltene.
- **Melding-kort på /admin/spillere/[id]** kan lenke til `/admin/approvals` (KUTT) avhengig av meldingstype — verifiser i datalaget.
