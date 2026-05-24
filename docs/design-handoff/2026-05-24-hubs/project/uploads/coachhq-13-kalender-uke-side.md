# CoachHQ — Kalender uke-visning (side)

**Rute:** `/admin/calendar` eller `/admin/kalender`.

## Kontekst
Anders har full kalender med 38 spilleres økter + private avtaler + WANG-grupper. Trenger uke-view som hovedutgangspunkt.

## Formål
- Samlet uke for ALLE spillere
- Filtrere per spiller / team / type
- Dra-og-slipp for å flytte økter
- Klikk for detalj

## Layout

**Header:**
- "Uke 21 · 18.-24. mai" Inter Tight 700 32px
- Forrige/Neste/I dag-piler
- Filter chips: Alle | AK Academy | WANG | Privat | 1-til-1
- Spiller-dropdown søkbar
- "Ny økt" forest fill høyre

**Kalender-grid:**
7 kolonner (ma-sø), tidskolonne venstre (06:00-22:00, 30 min slots).
Hver økt = blokk:
- Lime = teknisk
- Forest = fysisk
- Beige = mental/restitusjon
- Lilla = WANG-gruppe
- Cream stripe = privat
- Tittel + spiller-navn i blokken
- Tabular nums for tid

Drag handle på hjørne. Hover viser quick-actions (rediger/avlys).

**Sidebar høyre (240px):**
- "I dag" liste (dagens økter komprimert)
- KPI: "32 økter denne uken · 28 godkjent · 4 venter"
- Hurtigknapper: "Eksporter uke", "Send påminnelser"

## Tomtilstand
"Ingen økter denne uka. Be om økt eller importer plan."

## Branding
Cream bg, hvit kalender-grid, fargekodede blokker. Mono i alle tider.
