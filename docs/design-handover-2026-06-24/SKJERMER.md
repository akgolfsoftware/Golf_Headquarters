# SKJERMER — billedkatalog (rute → skjermbilde → kildefil → formål)

> **Dette er fasiten for hvordan hver skjerm skal SE UT.** Hver rad har et skjermbilde i `screens/`,
> den eksakte `.dc.html`-kildefila (åpne den for pikselnær markup, tekst og tallverdier), ruten, og
> formålet. Mange skjermbilder har en **merknadsstripe øverst** som forklarer faner og navigasjon.
>
> **Versjoner:** der en skjerm finnes i flere varianter (`(hybrid)`, `(terminal-lys)`, `v2`) er den
> **kanoniske** valgt etter gjeldende retning **terminal-lys** (se `../CLAUDE.md` §3). Eldre varianter
> ligger igjen i roten som referanse, men bygg etter den kanoniske kildefila under.
>
> **Knapp → rute** for hver skjerm: se `NAVIGASJON-knapp-til-rute.md`.

---

## A · PlayerHQ — `/portal` (spiller · lys terminal-lys · mobil-først)

A1 · Dashboard — `/portal` · Kildefil: `PlayerHQ Dashboard (terminal-lys).dc.html` · «hva gjør jeg i dag»: hero-hilsen, SG-ticker, «Start dagens økt», KPI-stripe (SG totalt / runder / snittscore), «hva er nytt».
A2 · Onboarding — `/portal/onboarding` · `PlayerHQ Onboarding (terminal-lys).dc.html` · 6-stegs wizard: profil → mål → nivå-test → SG → kohort → plan.
A3 · Analyse — `/portal/analysere` · `PlayerHQ Analyse (terminal-lys).dc.html` · diagnose-først: nivå + største gap øverst, så SG-nedbrytning. Faner: Analyse · TrackMan · Runder · SG · Tester.
A4 · Statistikk / SG — `/portal/statistikk` · `PlayerHQ Statistikk-SG (terminal-lys).dc.html` · SG per kategori (OTT/APP/ARG/PUTT), trend, mot baseline. Mørke datamoduler.
A5 · Plan / Workbench-inngang — `/portal/planlegge` · `PlayerHQ Plan-Workbench (terminal-lys).dc.html` · ett trykk inn i Workbench. Zoom År (Gantt) → Uke → Økt.
A6 · Teknisk plan — `/portal/teknisk` · `PlayerHQ Teknisk plan (terminal-lys).dc.html` · fokusområder, drills, mål per ferdighet.
A7 · SG-import — `/portal/statistikk/runder/ny` · `PlayerHQ SG-import (terminal-lys).dc.html` · manuell SG-import (4 kategorier + total + snittscore + putts). Stats-logging metode (a).
A8 · On-course logging — `/portal/(fullscreen)/runde` · `PlayerHQ On-course logging (terminal-lys).dc.html` · slag-for-slag uten banekart. Rask + Presis modus. **INGEN banekart i V1.**
A9 · TrackMan-økt — `/portal/trackman/[id]` · `PlayerHQ TrackMan-okt (terminal-lys).dc.html` · CSV-import + skjermbilde-parse, dispersjon, gapping, SG-kobling.
A10 · Mot proffene — `/portal/mot-proffene` · `PlayerHQ Mot proffene (terminal-lys).dc.html` · elite-gamification: persentil mot tour, utfordringer, nivå-stige.
A11 · Live-økt (range) — `/portal/(fullscreen)/live/[id]` · `PlayerHQ Live-okt v2 (range-modus).dc.html` · aktiv økt på range: reps, live-puls, logging.
A12 · Gjennomføre — `/portal/(fullscreen)/tren` · `PlayerHQ Gjennomføre (terminal-lys).dc.html` · gjennomfør planlagt økt steg for steg.
A13 · Tester-flyt — `/portal/tester` · `PlayerHQ Tester-flyt (terminal-lys).dc.html` · testkatalog → live test → sammendrag. Se `TESTBATTERI.md`.
A14 · Booking-wizard — `/portal/booking` · `PlayerHQ Booking-wizard (terminal-lys).dc.html` · bestill økt/coach: type → tid → bekreft.
A15 · Meg (undersider) — `/portal/meg` · `PlayerHQ Meg-undersider (terminal-lys).dc.html` · profil-hub + undersider (helse, utstyr, dokumenter, innstillinger).
A16 · Mål-hub — `/portal/mal` · `PlayerHQ Mål-hub (hybrid).dc.html` · aktive mål med fremdrift/ETA. Alle 3 tilstander (Data/Tom/Laster).
A17 · Turneringsdetalj — `/portal/turneringer/[id]` · `PlayerHQ Turneringsdetalj (terminal-lys).dc.html` · resultat, runder, SG for én turnering.
A18 · Coach-dialog — `/portal/coach` · `PlayerHQ Coach-dialog-undersider (terminal-lys).dc.html` · meldinger, coach-notater, delt innhold.
A19 · Varsler — `/portal/varsler` · `PlayerHQ Varsler (hybrid).dc.html` · varsel-hub: økt klar, coach-melding, bak planen, nivå-opprykk.
A20 · Start-økt (L-faser) — `/portal/(fullscreen)/live/[id]/brief` · `PlayerHQ Start-okt L-faser (terminal-lys).dc.html` · brief: oppvarming → hovedfase → avslutning.
A21 · Meg / Abonnement — `/portal/meg/abonnement` · `PlayerHQ Meg-abonnement (terminal-lys).dc.html` · GRATIS vs PRO (299 kr/mnd · 2 690 kr/år). Stripe. **«ELITE» vises aldri.**
A22 · Talent — `/portal/talent` · `PlayerHQ Talent-undersider (terminal-lys).dc.html` · talent-spor: sammenligning, utfordringer.
A23 · Putting / reach-drills — `/portal/drills` · `PlayerHQ Putting-reach-drills (terminal-lys).dc.html` · drill-bibliotek med reach/nærhet-måling.

---

## B · AgencyOS — `/admin` (coach/admin · mørk terminal · desktop-først)

B1 · Cockpit — `/admin` · `AgencyOS Cockpit (terminal-lys).dc.html` · 54px ikon-rail, live-ticker, KPI-rad, «dagens timeline» + «hvem trenger meg nå»-kø.
B2 · Stall (responsiv) — `/admin/spillere` · `AgencyOS Stall responsiv (terminal).dc.html` · spillerliste/leaderboard. StatTable → kort under md.
B3 · Spiller-detalj — `/admin/spillere/[id]` · `AgencyOS Spiller-detalj (terminal).dc.html` · fem faner: Oversikt · Fremgang · Tester · Plan (Workbench) · Profil.
B4 · Plans og Maler — `/admin/plans` + `/admin/plan-templates` · `AgencyOS Plans og Maler (terminal).dc.html` · aktive planer + mal-bibliotek m/ effektivitetsscore. «Send plan» → spiller-detalj.
B5 · Kalender — `/admin/kalender` · `AgencyOS Kalender (terminal).dc.html` · coach-kalender, kapasitet, økter.
B6 · Gjennomføre-hub — `/admin/gjennomfore` · `AgencyOS Gjennomfore-hub (terminal).dc.html` · dagens økter å kjøre, inngang til live-økt.
B7 · Live-økt (coach) — `/admin/(fullscreen)/live/[id]` · `AgencyOS Live-okt coach (terminal).dc.html` · coach kjører økt: reps, notater, video, vurdering.
B8 · Test-bygger — `/admin/tester/ny` · `AgencyOS Test-bygger (terminal).dc.html` · no-code protokoll-bygger: inputfelter, scoring-type, benchmarks, leaderboard, live scorekort.
B9 · DataGolf-verktøy — `/admin/datagolf` · `AgencyOS DataGolf-verktoy (terminal).dc.html` · pro-benchmark, persentiler, sammenligning mot tour.
B10 · Handlingssenter — `/admin/handlingssenter` · `AgencyOS Handlingssenter-faner (terminal).dc.html` · godkjenninger, innboks, oppgaver i faner.
B11 · Bookinger og kapasitet — `/admin/bookinger` · `AgencyOS Bookinger og kapasitet (terminal).dc.html` · booking-oversikt, kapasitetsstyring.
B12 · Opptak og video — `/admin/opptak` · `AgencyOS Opptak og video (terminal).dc.html` · video-bibliotek, svinganalyse, annotering.
B13 · Evaluering — `/admin/evaluering` · `AgencyOS Evaluering (terminal).dc.html` · ukentlig + per test: fremgang mot benchmark, nytt gap.
B14 · AI-Caddie og Agenter — `/admin/ai` · `AgencyOS AI-Caddie og Agenter (terminal).dc.html` · synlig assistent (chat) + usynlige anbefalinger/agenter.
B15 · Admin (undersider) — `/admin/settings` · `AgencyOS Admin-undersider (terminal).dc.html` · **Kanonisk rute = `/admin/settings`** (ikke `/admin/innstillinger` — nav-bug A1). Cmd+K «Innstillinger» → `/admin/settings`, Cmd+K «Meldinger» → `/admin/innboks` (A2).
B16 · Økonomi — `/admin/okonomi` · `AgencyOS Økonomi (hybrid).dc.html` · omsetning, abonnement, fakturaer. (Tegnet lyst — skin til mørk terminal.)
B17 · Talent-modul — `/admin/talent` · `AgencyOS Talent-modul (terminal).dc.html` · talent-pipeline, identifikasjon, oppfølging.
B18 · Coach-skill — `/admin/coach-skill` · `AgencyOS Coach-skill (terminal).dc.html` · coachens egne ferdigheter/sertifiseringer.

---

## C · Workbench — delt planleggingskjerne (begge apper)

> **Workbench skinnes kun visuelt — funksjon avklares med Anders.** Zoom: År (Gantt) → Uke → Økt.
> **KANONISK REFERANSE:** `Workbench Komplett Hub.dc.html` — én DC med alle 6 faner i mørk terminal.

### Workbench-kobling: hvilken knapp → hvilken fane
| Fra skjerm | Knapp/element | → Workbench-fane | URL-param |
|---|---|---|---|
| PlayerHQ Dashboard | «Workbench →» i Plan-kortet | Uke-visning | `?zoom=uke` |
| PlayerHQ Statistikk/SG | «Teknisk plan →» over gap-lista | Teknisk plan | `?tab=tek` |
| PlayerHQ Mål-hub | «Sesongmål»-knapp i header | Sesongmål | `?tab=seson` |
| PlayerHQ Plan-Workbench | «Åpne Workbench» | Gantt (År) | `?zoom=gantt` |
| AgencyOS Plans og Maler | «Åpne Workbench» / maler-rad | Maler | `?tab=maler` |
| AgencyOS Spiller-detalj | Plan-fane → Workbench-knapp | Teknisk plan | `?tab=tek&spiller=id` |
| AgencyOS Cockpit | «Planlegg»-knapp | Uke (for valgt spiller) | `?zoom=uke&spiller=id` |
| Workbench Teknisk plan | «Gå til økt med dette fokus» | Økt-detalj | `?tab=okt` |
| Workbench Uke | Klikk økt-kort | Økt-detalj | `?tab=okt&okt=id` |

**7 faner (KANONISK fil `Workbench Komplett Hub.dc.html`):** Teknisk plan · Sesongmål · Maler · Gantt (År) · Uke · Økt · Standardøkter.

> Alle tidligere Workbench-filer (v2, gap-til-okt, trackman, evaluering osv.) er arkivert i `_arkiv/workbench-arkiv/`. **Bruk kun `Workbench Komplett Hub.dc.html`.**

---

## D · Forelderportal — `/forelder` (lys · mobil + desktop)
D1 · Hjem — `/forelder` · `Forelderportal Hjem (hybrid).dc.html`
D2 · Ukerapport — `/forelder/rapport` · `Forelderportal Ukerapport (hybrid).dc.html`
D3 · Samtykke — `/forelder/samtykke` · `Forelderportal Samtykke (hybrid).dc.html` · **GDPR-samtykke, PÅKREVD for mindreårige.**
D4 · Bookinger — `/forelder/bookinger` · `Forelderportal Bookinger (hybrid).dc.html`
D5 · Fakturaer — `/forelder/fakturaer` · `Forelderportal Fakturaer (hybrid).dc.html` · Stripe.

## E · Marketing — `/` (lys editorial · desktop + mobil)
E1 · Hjem — `/` · `Marketing Hjem (moderne).dc.html` · landing/lead. Editorial + terminal-energi.
E2 · Coacher — `/coacher` · `Marketing Coacher (hybrid).dc.html` · Markus Røinås Pedersen beholdes.
E3 · Cases — `/cases` · `Marketing Cases (hybrid).dc.html`
E4 · Kontakt — `/kontakt` · `Marketing Kontakt (hybrid).dc.html`

## F · Auth · Stats · System
F1 · Innlogging — `/login` · `Auth Innlogging (terminal-lys).dc.html`
F2 · Registrering og passord — `/registrering` · `/reset` · `Auth Registrering og passord (terminal-lys).dc.html`
F3 · Stats-plattform — `/stats` · `Stats-plattform (moderne).dc.html` · offentlig golf-statistikkdatabase (eget spor).
F4 · Kommandopalett — global (⌘K) · `Command Palette (terminal-lys).dc.html`

## Data-viz-komponenter
`Data-viz komponentark.dc.html` (SG-bar, dispersjon, pyramide, radar, persentil-ring, gapping) +
`Data-viz komponentark 2 (nye).dc.html` (SG-vannfall, SG per hull, tetthetskart, progresjons-tidslinje, belastnings-heatmap, m.fl.).
Stilflis: `Stilflis - Terminal-energi (PlayerHQ + Landing).dc.html`.
