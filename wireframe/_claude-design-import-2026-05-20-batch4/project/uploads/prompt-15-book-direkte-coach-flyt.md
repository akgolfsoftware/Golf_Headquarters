# Prompt 15 — Book direkte med coach (flyt)

## Hensikt
La spilleren velge ledig time direkte i coachens kalender og bekrefte uten å sende en "Be om økt"-forespørsel først. Skiller seg fra batch 1 prompt-22 ("Ønskelig økt bekreftet") som er etter-bekreftelse av en forespørsel.

## Trigger
CTA `Book direkte med Hans` på `/portal/coach`. URL: `/portal/coach/booking/ny-okt`.

## Layout
Full-page route. Tre kolonner på desktop: (1) Coach-kort + filtre, (2) Kalender uke-view med ledige slots, (3) Booking-summary høyre. På mobil: full-bredde steg-flyt.

## Komponenter
- Kolonne 1 — Coach-kort: avatar 80px, navn, spesialitet-chips (Teknikk · Mental · Junior), kort bio (3 linjer)
- Filter-row: Type-økt (Privat 60min / Privat 90min / Gruppe 60min), Lokasjon (GFGK Performance / Range / Putting Studio)
- Kolonne 2 — Kalender: 7-dagers uke-view, hver dag har slots 30min granularitet. Ledig = lime outline, fullt = muted, valgt = forest fill. Hover viser tooltip "16:00–17:00 · 60min privat"
- Uke-navigasjon: "← Forrige uke" / "Neste uke →" + "Hopp til denne uka"
- Kolonne 3 — Summary: Dato, tid, type, lokasjon, pris, kreditter brukt, total. Final CTA `Bekreft booking`.
- Mobile: kalender på toppen, summary nederst som sticky.

## Eksempel-data
- Coach: Hans Brennum, hovedcoach GFGK
- Tilgjengelig uke: 19.–25. mai 2026
- Filtre valgt: Privat 60min, GFGK Performance
- 14 ledige slots i uken
- Valgt: torsdag 22.05 kl 16:00–17:00
- Pris: 1 200 kr (eller 2 credits hvis Pro)
- Bruker har 4 credits — 2 brukes
- Total: 0 kr (kreditter dekker)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (priser/tid/credits), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (calendar, clock, map-pin, credit-card, check)
- Norsk bokmål, ingen emojier

## Form-felter
- `coach_id` UUID required (forhåndsvalgt)
- `type` enum required
- `lokasjon` enum required
- `start` datetime required (fra kalender)
- `betalingsmetode` enum credits/kort (auto hvis credits dekker)

## Submit / actions
- Bekreft: POST `/api/portal/bookings/direct` → redirect `/portal/booking/[id]` med suksess-banner
- Hvis credits ikke dekker: åpner betalings-modal med Stripe

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- Kalender-slots er klikkbare buttons med aria-pressed
- Norsk dato `tor. 22. mai`, tid `16:00`
- A11y: tastatur-navigasjon mellom slots (piltaster)
