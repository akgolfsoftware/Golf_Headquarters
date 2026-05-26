# CoachHQ — Godkjenninger-kø (side)

**Rute:** `/admin/godkjenninger` (eller `/admin/approvals`).

## Kontekst
Anders har 5-12 ting per dag som venter godkjenning: AI-foreslåtte økter, plan-endringer fra spillere, ny-booking-forespørsler, foreldre-tilgang-forespørsler.

## Formål
- Én flate for alle godkjenninger
- Batch-godkjenne lavrisiko items
- Tastatur-snarveier (J/K nav, Y godkjenn, N avvis)

## Layout

**Header:**
- "Til godkjenning · 8" Inter Tight 700 32px
- "Snitt-respons: 3t 12m · Mål: < 24t" mono
- Filter chips: Alle | AI-økter | Plan-endringer | Bookinger | Foreldretilgang
- "Godkjenn alle (lavrisiko)" forest fill høyre

**Kø-liste:**
Hver godkjennings-rad:
- Tidstempel "for 2t" mono venstre
- Type-pille (AI ØKT · lime / PLAN-ENDRING · forest)
- Spiller-avatar + navn
- Hovedinnhold-tekst "Markus vil endre tirsdag-økt fra 16:00 til 18:00"
- Inline 3 knapper høyre: Avvis (outline) · Detaljer (outline) · Godkjenn (forest)
- Lime pulse-prikk hvis ny-ankommet

**Hover-rad:** cream bg + tastatur-hint "Y/N" muted

**Tomtilstand:**
"Du er à jour. 0 godkjenninger venter."
Forest CircleCheck stort med "Snitt-respons denne uken: 2t 45m"-mono under.

**Bunn-stat:**
"Godkjent denne uken: 47 · Avvist: 3"

## Branding
Cream bg, hvite rader, lime pulse, forest CTAs.
