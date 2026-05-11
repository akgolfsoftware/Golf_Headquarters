# AK Golf Platform — CoachHQ — Bookinger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/bookings`
- **Arketype:** B — List + filter (kalender + liste-toggle)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/bookings.html`
- **Audit:** `wireframe/audit/coachhq-bookings.md`
- **Tilhørende modaler:** `BookSessionModal`, `RescheduleBookingModal`, `NewBookingModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Bookinger er alle planlagte tider hvor en spiller har booket en fasilitet eller coach. Skjermen lar coach se belegget i sanntid, omplanlegge når noe må flyttes, og opprette ad-hoc bookinger for spillere som ringer inn. Default visning er uke-kalender (visuell oversikt); liste brukes når man trenger å filtrere på spesifikke kriterier.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Toggle øverst-høyre: `Uke-kalender / Liste`. Kalender er default.

### Uke-kalender-view

- 7 kolonner (Mandag–Søndag), datoer i header
- Tidsblokker fra 06:00 til 22:00, 30-min slots
- Bookinger som fargekodede pills:
  - **Coaching** (lime accent): «1:1 Markus R · Anders K»
  - **Fasilitet-leie** (primary): «Studio 1 · Emma S»
  - **Greenfee** (gold): «18 hull · GFGK»
  - **Gruppe** (secondary): «WANG team · 6 spillere»
- Klikk på pill → quick-popover med detaljer + `Rediger` / `Avlys`-knapper
- «Nå»-linje (rød horisontal) på dagens dato
- Naviger: `← Forrige uke / I dag / Neste uke →` + datepicker

### Liste-view

Tabell med kolonner:

| Kolonne | Innhold |
|---|---|
| Dato | f.eks. «11. mai 2026» (JetBrains Mono) |
| Tid | «14:00–15:00» |
| Spiller | Avatar + navn |
| Fasilitet | f.eks. «Mulligan Studio 1» |
| Type | Pill (samme farger som kalender) |
| Status | Bekreftet / Venter / Avlyst |
| ... | RowActionsMenu |

## KPI-strip (4 kort)

1. Bookinger denne uka: 47
2. Belegg studio 1–4: 73%
3. Ledig kapasitet i kveld: 6 timer
4. Avlysninger siste 7d: 3

## Filter-bar — UNIKT

- Søk: «Søk spiller eller fasilitet»
- Chip: Type (Coaching / Fasilitet / Greenfee / Gruppe)
- Chip: Fasilitet (Mulligan Studio 1–4 / GFGK Range / Bossum)
- Chip: Coach (Anders K / Sara / Tom)
- Sort: Nyeste / Etter dato / Etter fasilitet
- Primary CTA: `+ Ny booking` → `NewBookingModal`

## Klikkbare elementer

Se `wireframe/audit/coachhq-bookings.md`. UNIKT:

| Element | States |
|---|---|
| Kalender/Liste-toggle | default, hover, active per side |
| Booking-pill (kalender) | default, hover (lift + tooltip), klikk → quick-popover |
| Tom slot (kalender) | default, hover (dotted accent border + «+»-ikon), klikk → `BookSessionModal` med pre-fyllt tid/dato |
| «Nå»-linje | static, alltid synlig på dagens dato |
| Naviger-knapper | default, hover, disabled (hvis lengst tilbake) |
| Quick-popover | open, klikk «Omplanlegg» → `RescheduleBookingModal` |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty (kalender, ingen bookinger):** Tomt rutenett med subtil tekst «Ingen bookinger denne uka. Klikk en slot for å booke →»
- **Loading kalender:** Skeleton tidsblokker (grå pills med varierende bredder)
- **Reschedule-error:** Toast «Tiden er ikke lenger ledig. Velg ny tid.»

## Ønsket output fra Claude Design

1. Uke-kalender lyst tema (uke 19, 11.–17. mai 2026, ~20 bookinger)
2. Liste-view lyst tema (samme data)
3. Mørkt tema (kalender)
4. Quick-popover åpen på en booking
5. Empty (kalender uten bookinger)
6. Mobil ≤640px — kalender blir 1-dag-view (dagens dato), pile for å bla; liste blir kort-layout

## Ikke-mål

- Ikke designe `BookSessionModal`, `RescheduleBookingModal`, `NewBookingModal` (egen batch)
- Ikke designe ressurs-konfig (åpningstider per fasilitet)
- Ikke designe booking-detalj-skjerm

## Når du er ferdig

Lim design-link tilbake til Claude Code.
