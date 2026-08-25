# Train-lock — designfasit (speil av zip)

**Dette er designfasiten for ALLE skjermer i PlayerHQ og AgencyOS** (Anders 25.08.2026 —
CLAUDE.md invariant 2, `.claude/rules/beslutninger.md` øverste beslutning). Paper
(`designsystem/paper/`) er historikk. Sync-detaljer: `SYNC-STATUS.md`.

## Nøkkelfiler (les først)

| Fil | Rolle |
|---|---|
| `HANDOFF.md` | **Kontrakten**: PIXEL = look-fasit, MAL = IA-fasit (vinner ved konflikt), scene #000000 / lys #FFFFFF, CTA-regel, kollisjonsnivåer (VEGG/VARSEL/KALENDER), serie-regler, Workbench-vs-Kalender-eierskap |
| `TRAIN LOCK.dc.html` | Selve lock-arket (scene, farger — tokens må fortsatt defineres i kode, LAUNCH-PLAN D2) |
| `TRAIN VIZ.dc.html` | Visualiserings-locken |
| `AG-00 LOCK.dc.html` / `AO-00 LOCK …` / `WB-00 Komponenter` / `TM-00 Komponenter` / `MAT-00` / `TE-00 Test-specimen` / `GAP-00 Kart` | Familie-locks/komponentark |
| `AX-01 Skall rail og tabbar.dc.html` | Skallet (rail + tabbar) |
| `B1 Tilstander laster feil.dc.html` | Tilstands-fasiten (laster/feil) |

## Familier (180 skjermfiler)

| Prefiks | Antall | Dekker |
|---|---|---|
| A-01…A-18 | 26 | Agency Workbench (uke/økt/drill/kilder/måned/år/stall/drag/lys/tom + publish confirm A-01d) |
| PH-01…PH-20 | 23 | Player HQ (I dag m/tilstander, økt-ark, live, plan, analyse, TrackMan, meg, onboarding) |
| AG-00…AG-18 | 21 | AgencyOS (cockpit, innboks, stall, huber, live-tavle, godkjenning/merge, kalender, oppsett) |
| TE-00…TE-13 | 16 | Tester (hub, gates, protokoll-skjermer, lys-varianter) |
| TM-00…TM-11 | 13 | TrackMan (liste, økt, ingest, hullkart, slag-ark TM-08f, økt-detalj TM-11) |
| WB-00…WB-10 | 11 | Workbench-komponentark + 3-skall-varianter (uke, publish, godkjenning, måned, år, serie, gruppe, ikke delta) |
| P-01…P-09 | 9 | Player Workbench (uke/økt/måned/år/agenda/dag-ark/ny økt/caddie-ghost/lys) |
| KA-01…KA-05 (+KA-01L) | 6 | Kalender (uke/måned/agenda/player-ark/kollisjon rom) |
| RU-01…RU-04 (+RU-01L) | 5 | Runde live (iPhone/Mac/ferdig/etterregistrering) |
| B2 (5) · B3 (2) · B4 · B5 · B1 | 10 | iPad/Mac-varianter + lys-pass-ark |
| AO-00…AO-12 | 5 | AgenticOS (LOCK, kø/godkjenning, runtimes, projects, policy A3/B1/C3) |
| ME-01…ME-04 | 4 | Meg (utstyr, helse, abonnement, coach-hub) |
| S3-01/02 (+L) | 3 | Spiller 360 |
| LO-01/02 (+L) | 3 | Gate + innlogging |
| JV-01…JV-03 | 3 | Jarvis-merge (kø, eval rød, proveniens) |
| BO-01…BO-03 | 3 | Booking |
| TU-01/02 · GP-01/02 · GAP-00/1 · MAT-00/01 | 8 | Turneringer, Gameplan, GAP, materialer |
| FY-01 · FO-01 · EC-01 · DG-01 · Analyse Gapping | 5 | Fys stall, Forelder, Økonomi, DataGolf, gapping-analyse |

## Regler

- Port til fasit — aldri kreativ redesign. MAL (IA) vinner over PIXEL ved konflikt (HANDOFF.md).
- Skjermbilde-gaten gjelder: Anders skal SE hver portet skjerm (390px + 1280px, mørk + lys der lys-variant finnes).
- `uploads/`-kildematerialet fra zipen er BEVISST holdt utenfor repoet (offentlig repo; NGF/Team Norway-materiale) — se SYNC-STATUS.md.
