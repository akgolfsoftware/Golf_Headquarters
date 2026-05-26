# CoachHQ — AI-Caddie aktivitet (side)

**Rute:** `/admin/agencyos/caddie`.

## Kontekst
Anders ser hele AI-Caddiens daglige aktivitet på tvers av alle spillere. Live-feed + statistikk.

## Formål
- Realtime feed av AI-aktivitet
- Identifisere mønstre (hvem trigger AI mest?)
- Audit-trail for AI-beslutninger

## Layout

**Header:**
- "AI-Caddie · Daglig aktivitet" Inter Tight 700 32px
- Live-pill "LIVE" lime pulserende
- "I dag: 47 forslag · 38 godkjent · 5 avvist · 4 venter" mono

**To-kolonne:**

### Venstre — Live-feed (60% bredde)
Tidslinje av AI-handlinger siste 24t. Hver entry:
- Tidsstempel mono
- Spiller-avatar + navn
- Handling-pille (lime "FORESLO ØKT", forest "ANALYSERTE RUNDE")
- Innholds-tekst "Foreslo putt-drill 5×6 for Markus"
- Status-ikon (CheckCircle lime / Clock / X)
- Klikk → drawer med full kontekst

Auto-refresh hver 10s med slide-down-animasjon.

### Høyre (40%) — Insights-panel
- KPI-strip vertikal:
  - Forslag i dag: 47
  - Godkjenningsrate: 82%
  - Snittkonfidens: 0.78
- "Mest aktive spillere" topp-5-liste
- "Mest brukte drill-typer" pie-chart
- "AI-feil siste 7d" → 2 destructive-pills med detalj

## Branding
Cream bg, hvit panel, lime LIVE-pulse, forest action-pills.
