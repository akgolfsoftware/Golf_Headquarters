# CoachHQ — Stall-oversikt (full spillerliste)

**Rute:** `/admin/spillere` (også speilet på `/admin/elever`).

## Kontekst
Coach Anders Kristiansen har 38 aktive spillere fordelt over AK Golf Academy + WANG Toppidrett Fredrikstad. Trenger hovedside som lister ALLE med filter, søk, masseaksjon.

## Formål
- Vise full stall med viktigste KPIer per spiller
- Filtrere etter team, status, hcp-segment, sist aktiv
- Klikk spiller → coach-view av spillerens workbench

## Layout

**Header:**
- "Stall · 38 spillere" Inter Tight 700 32px
- "31 aktive · 5 pauset · 2 utestående faktura" mono muted
- Høyre: "Ny spiller" forest fill + "Eksporter" outline

**Filter-strip (sticky):**
Pills: Alle (38), AK Academy (24), WANG (12), Junior (8), Senior (30), Inaktiv (5)
Søkefelt høyre. "Sorter etter" dropdown: Sist aktiv | Navn | Hcp | Plan-status

**Tabell (full bredde):**
Kolonner:
- Avatar + Navn (fixed venstre)
- Hcp (mono, tabular)
- Team-pill (lime "AK" / forest "WANG")
- Plan-status (badge: "AKTIV" lime / "PAUSE" muted / "INGEN" destructive light)
- Siste økt (relativ "for 2 dager siden")
- SG-trend (mini sparkline 60×20)
- Neste handling ("Godkjenn plan" linje hvis venter)
- Lucide MoreHorizontal høyre

Hover-rad: cream bg, "Åpne workbench"-link fade-in.

**Tomtilstand**
"Ingen spillere matcher filteret."

**Masseaksjon (når ≥1 valgt):**
Sticky bar bunn med "3 valgt · Send melding · Eksporter · Marker inaktiv"

## Branding
Cream bg, hvite rader, forest tekst, lime/forest team-pills, mono i tall. Tabular numerics i hele tabellen.
