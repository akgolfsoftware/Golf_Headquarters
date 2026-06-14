# AgencyOS — produkt-brief (coachens kontrolltårn)

> **Rute:** `/admin` · **Enhet:** desktop-først + mobil · **Tema:** alltid mørkt (`.dark`, forest #0F2A22 — aldri svart).
> **Bruker:** Anders som coach OG eier. Mental modus: «hvem trenger MEG i dag, på tvers av ALLE grupper?» Tåler Bloomberg/Linear-tetthet. Bygg fra `01-DESIGNSYSTEM.md`.

## IA — navigasjon (én delt kilde)
- **Cockpit** (landing `/admin`) + **fanenav:** Live · Uka · Økonomi · Spillere · Caddie.
- **Sidebar** (= mobil-skuff), gruppert:
  - **Daglig:** Oversikt · Min uke · Oppgaver · Tildelt meg
  - **Stall:** Spillere · Grupper · Talent (radar, discovery, kohort, sammenligning, WAGR)
  - **Operasjon:** Workbench · Planlegge · Gjennomføre (kalender, bookinger, anlegg, tilgjengelighet, tjenester, TrackMan, opptak, kapasitet)
  - **Analyse:** Stall-analyse · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter
  - **Innboks:** Forespørsler · Godkjenninger
  - **System:** Økonomi · Team · Integrasjoner · Agenter · E-postmaler · Audit-log · Innstillinger
- ≤2-trykk-løftene: *planlegg & tildel til en hel gruppe* (bulk) ≤2 trykk · *handle på forespørsel/godkjenning inline* (ingen bortnavigering) · alt eier-stoff (økonomi/drift) nåbart uten å lete.

## Skjermer

### Cockpit / Oversikt — `/admin`
«Hvem trenger meg i dag» på én flate, på tvers av alle grupper. Seksjoner: **handlingskø** (forespørsler/godkjenninger som haster, inline-handling), **dagens økter** (på tvers av grupper), **spillere som henger etter** (avledet fra data — lime = aktiv i dag, pri = haster), **KPI-strip** (aktive spillere, økter i dag, ubesvart). Fokus-spiller: hybrid (manuell pin + AI-forslag). Komponenter: QueueList, KpiStrip, ItineraryList, AthleticAvatar, StatusPill, PulseDot. Sanntid (Supabase Realtime) der mulig.

### Forespørsler / Godkjenninger — `/admin/foresporsler` · `/admin/godkjenninger`
Innboks for booking-/plan-/melding-forespørsler. **Handle inline** (godkjenn/avslå/flytt/svar) uten å navigere bort. Batch-godkjenning der det gir mening. Komponenter: QueueList, QueueItem, AthleticButton, StatusPill.

### Spillere + 360-profil — `/admin/spillere` · `/admin/spillere/[id]`
Liste over ALLE spillere i alle grupper (filter per gruppe/scope), data-tett tabell (`DataTable`). Profil = 360: oversikt, tester, runder, SG, plan, Workbench-snarvei, notater, helse. Komponenter: DataTable, DetailHero, KpiStrip, PyramidRadar, SgBar, HcpTrend, TestMatrix.

### Workbench — `/admin/spillere/[id]/workbench` (planleggings-kjernen)
ÉN planleggingsflate, tre zoom: **År** (`YearPlanGantt` — grunn/spes/turnering, dra periodegrenser) → **Uke** (`WeekGrid`, dra-og-slipp ekte tilstand, «Generer uke» + «Balansér») → **Økt** (inspector: tid, område, antall spillere; knapper «Legg til økt · Be om video · Send oppgave · Tildel til gruppe · Del»). Bibliotek (maler/drills/turneringer) hentes inn FRA Workbench (panel/velger), ikke egne faner. Coach-endring propagerer til spillerens Workbench. Plan-bygger (gammel egen fane) er **smeltet inn her**. Se Workbench-utviklingsplanen for full ambisjon.

### Planlegge — `/admin/planlegge` (ETT trykkpunkt → Workbench)
Åpner Workbench. Ikke en meny av kort. Bulk: «sett inn fra mal → tildel til hel gruppe» med automatisk varsel/propagering til spillerne.

### Analyse (Stall-analyse · Lag-snitt · Tester · Runder · Compliance · Rapporter)
Samlet analyse-flate med faner. Stall-heatmap, lag-snitt, test-matrise på tvers av spillere (fargelagt mot benchmark), runder, compliance. Komponenter: TestMatrix, DataTable, SgBar, SgTrendLine, PyramidRadar. (FYS-resultater = plassholder til formel er låst.)

### Gjennomføre — kalender/bookinger/anlegg/tilgjengelighet/tjenester/TrackMan/opptak/kapasitet
Drifts-operasjon. Kalender (MonthGrid/WeekGrid), booking-admin, TrackMan-import + annotasjon, opptak. Komponenter: MonthGrid, SessionScheduler, DataTable, ClubMetricGrid, ShotMap.

### System / eier (Økonomi · Team · Integrasjoner · Agenter · E-postmaler · Audit-log · Innstillinger)
Eier-flater. Økonomi (inntekt, abonnement, Stripe), agent-styring, integrasjoner. Komponenter: KpiCard, DataTable, ActionList. (Flere er delvis mock i dag — design ferdige flater, marker hvor ekte data kommer.)

### Mobil (net-new)
Bunnbar + «Mer»-skuff (= sidebar-gruppene). Mobil-Workbench, mobil-cockpit, innboks. Touch ≥44px. Streng lime-disiplin på mobil-nye flater (kun aktiv/«nå»).

## Design-direksjon (AgencyOS)
Mørkt, tett, presist — et kontrolltårn, ikke et dashbord-leketøy. Lime kun på aktiv tilstand / haster-puls (mørk tekst på lime). Tall i mono, tabulært. Alt eier-/drift-stoff nåbart fra sidebar (ingen usynlige ruter). Inline-handling overalt — coachens tid er dyr.
