# CoachHQ — Bookinger admin (side)

**Rute:** `/admin/bookinger`.

## Kontekst
Anders har full oversikt over alle bookinger Markus + 37 andre har gjort: betalingsstatus, lokasjon, antall som ikke møtte opp, etc.

## Formål
- Full tabell med alle bookinger
- Filtere på status, type, betalingsstatus
- Refund / re-booke / no-show-markering

## Layout

**Header:**
- "Bookinger" Inter Tight 700 32px
- "84 denne uka · 12 venter betaling · 3 no-show siste 30d" mono
- Periode-dropdown: I dag | Uke | Måned | Tilpasset
- "Ny booking" forest fill

**Filter-strip:**
Status-pills: Alle (84) | Bekreftet (78) | Venter (4) | Avlyst (2) | No-show (0)
Lokasjon-dropdown: Alle | Performance Studio | GFGK | Bossum
Type: 1-til-1 | Gruppe | Range

**Tabell:**
| Tid | Spiller | Type | Lokasjon | Coach | Status | Betaling | Action |
|---|---|---|---|---|---|---|---|
| Ma 16:00 | Markus | 1:1 Putt | Perf Studio bay 2 | Anders | Bekreftet (lime) | Betalt 1200 | … |

Mono i tider og pris. Hover: detalj-popover med "Avlys", "Re-booke", "Marker no-show", "Refund".

**Bunn-stat:**
"Omsetning denne uka: 78 400 kr · 92% kapasitet brukt"

## Branding
Cream bg, hvit tabell, lime "bekreftet"-pille, destructive light no-show.
