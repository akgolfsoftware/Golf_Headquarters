# CoachHQ — Rediger tilgjengelighet (side)

**Rute:** `/admin/availability`.

## Kontekst
Anders setter når han er tilgjengelig for booking. Faste tider per ukedag + unntak (ferier, kurs). Bestemmer hva spillere ser i booking-flyt.

## Formål
- Sette ukentlig tilgjengelighet (tider per dag)
- Legge inn unntak (blokkere datoer)
- Buffer mellom økter
- Sync med Google Calendar

## Layout

**Header:**
- "Tilgjengelighet" Inter Tight 700 32px
- "Coach: Anders Kristiansen · Synket med Google Calendar 14:23" mono
- "Lagre endringer" forest fill høyre

**Tab-strip:**
Ukentlig (default) | Unntak | Buffer & regler | Integrasjoner

### Ukentlig-tab
7 kort (en per dag). Hvert dag-kort:
- Dag-tittel "Mandag" + toggle "Tilgjengelig"
- Liste over tids-intervaller (07:00-12:00, 14:00-19:00)
- "+ Legg til intervall"-knapp
- Hvis ikke tilgjengelig: muted med strike-through "Ikke tilgjengelig"

### Unntak-tab
Liste over dato-unntak (ferier, kurs).
- Datovelger + grunn + "Hele dagen"-toggle
- Eksisterende unntak: kort med dato + grunn + slett

### Buffer & regler
- Buffer mellom økter: 15 min default (input)
- Maks økter per dag: 8
- Min varsling før booking: 24 timer
- Tillat helger: toggle

### Integrasjoner
- Google Calendar: koblet 🟢 (status pill)
- "Vis alle private hendelser som opptatt" toggle
- Two-way sync toggle

## Branding
Cream bg, hvite dag-kort, lime "tilgjengelig"-toggle, forest CTA.
