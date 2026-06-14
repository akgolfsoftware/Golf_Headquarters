# Skjerm-inventar — komplett (fra BETA v2-kode)

> Hver skjerm i hele plattformen, lest direkte fra BETA-koden (`agencyos-app/*.jsx`, `playerhq-app/*.jsx`, `phv2-*.jsx`). Dette er fasiten for HVA som skal designes/bygges. Statusmerker viser hva BETA faktisk har: **✓ full** · **◑ delvis** · **stub** (registrert, ikke bygget).

---

## PLAYERHQ (spiller, mobil-først, lyst) — 5-seksjons IA
Bunn-nav/rail: **Oversikt · Planlegg(Workbench) · Gjør(Execute) · Analyser · Coach** · + Meg via avatar. Fullbleed: workbench, analyze.

| Skjerm (nøkkel) | Status | Formål · nøkkeldata |
|---|---|---|
| `home` (Oversikt) | ✓ | Daglig hub: hero + tier-pill, KPI-strip (HCP/SG/neste økt), dagens fokus, pyramide, neste tee, turnering-teaser. Data: PHDATA.player/pyramid/tournaments + hardkodet økter |
| `workbench` (Planlegg) | ✓ | Spillerens planlegger. 4 visninger (Uke/Liste/Kanban/Dashboard) + År/periode-builder + inspector (økt-rediger, 6 knapper) + Ny økt/Nytt mål-modaler + dra-og-slipp. Plan A/B. Data: WB_WEEK/FYS/DRILLS, PHDATA.season/goals |
| `execute` (Gjør) | ✓ | 3 faner: I dag · Kalender (uke/måned) · Booking (4 tjenestetyper → oppsummering). Data: hardkodet økter/slots |
| `analyze` (Analyser) | ✓ | Sesong-header (HCP-trend + 4 KPI) + faner SG/Runder/TrackMan/Tester/Innsikt. Data: hardkodet SG/runder/tester (v2: 11 kategorier) |
| `round-detail` | ✓ | Én runde: 18-hull score-grid, SG-detalj, del-knapper. Data: hardkodet scores/SG |
| `log-round` | ✓ | Loggfør 18-hull hull-for-hull (±-steppere). Data: PAR-array |
| `me` (Meg) | ✓ | Profil-hub: header, abonnement-kort (GRATIS/PRO), stat-strip, konto-liste (7), coach-kort. Data: PHDATA.player/subscription/coach/package |
| `me-profil` | ✓ | Rediger navn/e-post/klubb/HCP/gruppe/hånd |
| `me-abonnement` | ✓ | Abonnement-status, hva inngår, fakturaer |
| `me-innstillinger` | ✓ | Varsler/integrasjoner/app/sikkerhet (toggles) |
| `me-helse` | ◑ | Søvn/puls/belastning — plassholder-verdier (FYS-formel ikke låst) |
| `me-utstyr` | ✓ | Køller/ball/spec |
| `me-dokumenter` | ✓ | Avtaler/samtykke/GDPR/faktura/lisens |
| `me-hjelp` | ✓ | FAQ-accordion + kontakt |
| `tournaments` | ✓ | Påmeldte turneringer (les). Data: PHDATA.tournaments |
| `tournament-detail` | ✓ | Én turnering: hero, key-strip, din status, i ballen, bane+vær, coach-melding |
| `varsler` | ✓ | Uleste/tidligere varsler |
| **Live-økt** (overlay) | ✓ | Fullskjerm: brief→aktiv (rep-logging +1/+5/+10/+25, timer, drill-progress)→summary (KPI + del). Data: session props |
| **Auth-flyt** (6) | ✓ | login · glemt-passord · signup · BankID · junior-samtykke · onboarding (5 steg) |

---

## AGENCYOS (coach, desktop-først + mobil, mørkt) — 6-gruppers sidebar IA
Cockpit + scope-switcher (hele stallen/gruppe/spiller) + ⌘K. Sidebar: **Daglig** (Oversikt·Min uke[Oppgaver·Tildelt meg]) · **Stall & talent** (Stall[Spillere·Grupper]·Talent[radar·sammenligning·WAGR]) · **Operasjon** (Workbench·Planlegge[planer·maler·drills·turneringer]·Gjennomføre[kalender·bookinger·anlegg·tilgjengelighet·tjenester]·Analysere[stall·lag-snitt·tester]) · **Innboks** (Forespørsler·Godkjenninger) · **System** (Rapporter·Admin).

| Skjerm (nøkkel) | Status | Formål · nøkkeldata |
|---|---|---|
| `dashboard` (Oversikt) | ✓ | Cockpit: dagens timeline, innboks+oppgaver (inline-handling), fokus-spillere (pin+AI), KPI-strip. Data: PLAYERS, hardkodet timeline/innboks |
| `workbench` | ✓ | Planleggings-kjernen. 4 zoom (Tidslinje/Agenda/Akse-spor/Kompakt) + inspector (valgt økt, periode-pyramide, 4 coach-handlinger) + tildel-modal + toolbar (Generér uke/Balansér) + statusbar. Scope-drevet (spiller/gruppe). Data: PLAYER_WEEK/GROUP_WEEK |
| `players` (Alle spillere) | ✓ | Stall-tabell m/ søk/filter/**bulk** (tildel plan/gruppe/melding), SG-sparkline. Data: PLAYERS (38) |
| `player-profile` | ✓ | 360°: header+handlinger, coach-flagg, pyramide, runder/tester, aktiv plan, hurtighandlinger |
| `groups` | ✓ | 4 grupper (navn/størrelse/nivå/progress) |
| `talent-radar` | ✓ | WAGR-talenter m/ mini-pyramide |
| `comparison` | ✓ | 3 talenter side om side (pyramide-akser) |
| `wagr` | ✓ | WAGR-synk/import |
| `training-plans` | ✓ | Kanban (Utkast/Aktiv/Fullført), dra-og-slipp |
| `plan-templates` | ✓ | 6 maler |
| `plan-builder` | ✓ | Makrosyklus (Gantt) + ukeplaner + bygg-uka (palett→dag dra-og-slipp) + tildel-modal (gruppe/spiller) |
| `drills` | ✓ | 48 drills, kategori-filter |
| `tournaments` | ✓ | Sesong + **Fellesmelding-modal** (3-steg: mottakere→melding→bekreft) |
| `calendar` | ✓ | Uke/måned-view av økter |
| `bookings` | ✓ | 12 bookinger, inline bekreft/avvis |
| `facilities` | ✓ | 4 anlegg |
| `availability` | ✓ | Måned-kalender, redigerbar tilgjengelighet per dag |
| `services` | ✓ | 5 bookbare tjenester |
| `stable-analysis` | ✓ | Aggregert pyramide + KPI + gruppe-tabell |
| `team-average` | ✓ | Pyramide per gruppe |
| `tests` | ◑ | Test-uke oversikt (resultat-chips, plassholder pga FYS-formel) |
| `tasks` | ✓ | Oppgaveliste |
| `assigned` | ✓ | Tildelt meg |
| `reports` | ✓ | 6 rapporter (generer) |
| `admin` | ✓ | Org/team/tilgang |
| `requests` (Forespørsler) | stub→✓ | Stub i core, men full skjerm i flows.jsx (inline godta/avvis/svar) |
| `approvals` (Godkjenninger) | stub→✓ | Stub i core, full i flows.jsx (godkjenn/avvis, haster-border) |
| **Mobil** (5 faner) | ✓ | Dagens · Stall(→spiller) · Innboks(→chat) · Planlegg(workbench-lite) · Mer. + økt-sheet, forespørsler |

---

## Observerte hull/avvik allerede i BETA (input til readiness)
- **Demo-navn:** koden bruker fortsatt «Markus Berg»/«MB» flere steder (skal være Øyvind Rohjan/ØR per låst beslutning).
- **`requests`/`approvals`** er stubs i core.jsx, men har full skjerm i flows.jsx — må samles.
- **`me-helse`, `tests`** = plassholder pga. ikke-låst FYS-formel.
- **All data er hardkodet/demo** (PHDATA, PLAYERS, AKDATA) — ingen skjerm er datakoblet i BETA. Dette er designfasit, ikke kjørende app.
- **AgencyOS-navn:** BETA-skallet bruker «AgencyOS» ✓ (men `agencyos-app/AgencyOS Prototype.html` v1 har gammelt).

---

*Neste: `07-READINESS-MATRISE.md` — for hver skjerm: finnes datamodell (Prisma) + kode (server actions/ruter) i repoet, eller er det gap?*
