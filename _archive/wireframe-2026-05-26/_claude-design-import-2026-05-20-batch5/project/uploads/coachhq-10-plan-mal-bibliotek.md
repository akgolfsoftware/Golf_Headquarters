# CoachHQ — Plan-mal-bibliotek (side)

**Rute:** `/admin/plans/templates`.

## Kontekst
Anders bygger maler én gang, gjenbruker dem på 38 spillere. Maler = "4-uker SG-putt", "Off-season jern", "Junior-base", etc.

## Formål
- Liste alle maler
- Lage ny mal
- Duplisere/tilpasse
- Dele med andre coacher i team

## Layout

**Header:**
- "Plan-maler" Inter Tight 700 32px
- "14 egne · 8 delt fra team" mono
- "Ny mal" forest fill høyre

**Filter-strip:**
Mine | Delt fra team | AK Golf-bibliotek | Arkivert
Søkefelt + sortering.

**Mal-grid (4 kolonner):**
Hver mal-kort:
- Cover-stripe topp (gradient med navn-overlay)
- Varighet mono "4 uker · 16 økter"
- Bruk-teller mono "Brukt 12 ganger"
- Tags-pills: "Putt", "Hcp 0-10"
- Hover: "Bruk på spiller" og "Rediger"-knapper

**Detail-drawer (klikk mal):**
Glider inn fra høyre, viser:
- Tittel + beskrivelse
- Full plan i mini-kalender
- "Bruk på spiller" dropdown + "Rediger mal"
- Bunn: arkiver / slett

## Branding
Cream bg, hvite kort med forest gradient-strips, lime tags.
