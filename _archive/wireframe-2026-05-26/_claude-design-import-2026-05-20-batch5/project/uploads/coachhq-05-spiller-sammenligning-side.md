# CoachHQ — Spiller-sammenligning (side)

**Rute:** `/admin/elever/[id]/sammenligning`.

## Kontekst
Anders vil sammenligne Markus med 2-3 andre spillere — eller med team-snitt — på tvers av KPIer.

## Formål
- Side-by-side sammenligning av 2-4 spillere
- Felles tidsperiode
- Eksport som rapport (PDF til foreldre)

## Layout

**Header:**
- "Sammenligning" Inter Tight 700 32px
- Spiller-velger-strip: "+ Legg til spiller" og opp til 4 spiller-pills med X for å fjerne
- Periode-dropdown: 30d | 90d | 1år | Sesong (default 90d)

**Hovedgrid (kolonner = spillere, rader = KPI):**
| Metrikk | Markus 4.2 | Sofie 8.1 | Snitt AK |
|---|---|---|---|
| Hcp-trend | ↓0.3 | ↑0.4 | ↓0.1 |
| SG-total | +1.2 | −0.6 | +0.3 |
| Treningsvolum | 14:30 | 11:15 | 12:40 |
| Runder/mnd | 8 | 5 | 6.2 |
| Konsistens | 82% | 67% | 74% |

Lime-celle = best i rad, destructive light = svakest. Mono i alle tall.

**Visualiseringer under tabellen:**
- Radial-chart med 4 spillere overlappet (Drive, Iron, Short, Putt)
- Linje-chart hcp-utvikling over valgt periode

**Coach-notat-felt:**
Tekstområde "Notat etter sammenligning" — Anders skriver insights direkte, lagres mot begge spillere.

**Bunn:**
"Eksporter som PDF" outline + "Send til foreldre" forest fill

## Branding
Cream bg, hvit tabell-card, lime "best", subtle red for svakest.
