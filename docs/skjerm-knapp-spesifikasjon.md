# Skjerm-, knapp- og funksjonsliste — PlayerHQ & AgencyOS

> Fasit etter beslutningene 4. juni 2026. Reflekterer ny struktur: Workbench = master for planlegging, Analysere samlet, ingen duplikater. Bruk denne som referanse for bygging og som mål for opprydding.

**Gjennomgående regler:** Tema — PlayerHQ lyst, AgencyOS mørkt (ingen toggle). Navn — spiller «Markus Berg», coach «Anders Kristiansen». Ikoner — Lucide, ingen emoji. Ingen duplikatsider; én adresse per funksjon.

---

# PLAYERHQ (spilleren · /portal · lyst · mobil-først)

Bunn-nav (5 faste faner): **Hjem · Planlegge · Gjennomføre · Analysere · Meg**

## Hjem — `/portal`
- **Viser:** hero (hilsen + profilbilde + tier-pill), KPI-strip (HCP · SG total · neste økt), dagens fokus-kort, dagens økter (tidslinje), treningspyramide, snarveier.
- **Knapper/funksjoner:** «Start økt» → Live-økt · «Planlegg / neste handling» → **Workbench** · økt-rad → økt-detalj · varsel-ikon → Varsler.

## Planlegge — `/portal/planlegge` → **WORKBENCH (master)**
- **Ett trykkpunkt** rett til Workbench. Ingen kort-meny, ingen wizard utenfor.
- **Workbench inneholder (som moduser, ikke egne sider):** Årsplan · Treningsplan · Fysplan · Mål · Økt-planlegging · Drills-i-plan.
- **Knapper/funksjoner i Workbench:** veksle modus/visning · legg til/rediger økt · sett/rediger mål · dra drill inn i plan · koble turnering til plan · se coach-tildelt innhold.
- **Valgfri oversikt (ren lese-visning):** mål-status, kommende turneringer, test-status — knappene leder INN i Workbench for å endre. Ingen planlegging skjer her.

## Gjennomføre — `/portal/gjennomfore`
- **I dag:** dagens økter + «Start [tid]-økten» → Live-økt.
- **Kalender** (`/portal/kalender`): uke/måned-veksler, økter på tidslinje, økt → Live/detalj.
- **Live-økt (fullskjerm):** Brief (mål + coach-notat → «Start») → Aktiv (timer, Treff/Bom-knapper, rep-teller → «Avslutt & logg») → Logg (resultat + notat → «Lagre») → Oppsummering (treff/tid/SG-effekt → «Ferdig»).
- **Booking** (`/portal/booking`): credits-måler, ny booking-wizard (type → ledig tid → bekreft).

## Analysere — `/portal/analysere` — ÉN flate med faner
- **Faner:** SG · Runder · TrackMan · Tester · Innsikt.
- **SG:** total + per kategori (driving/approach/short/putt), best vs nå, benchmark vs Tour. «Svakhet → drill» → Workbench.
- **Runder:** liste → runde-detalj (scorecard hull-for-hull + SG). «Loggfør runde» → ny runde.
- **TrackMan:** kølle-tabell (carry/total/ballfart/spinn/launch).
- **Tester:** baseline vs siste (plassholder-tall til FYS-formel er klar).
- **Innsikt:** AI-fortellinger (styrke/svakhet).

## Meg — `/portal/meg`
- **Profil:** avatar, HCP/klubb, KPI → «Rediger profil», «Logg ut».
- **Abonnement:** status (gratis eller 300 kr/mnd) + grunn, credits, betalingskort, «Sammenlign planer». (Ingen tier-nivåer; ELITE finnes ikke.)
- **Innstillinger:** varsler, integrasjoner (Google Calendar/TrackMan/Apple Health), sikkerhet, preferanser (toggles).
- **Helse:** hvilepuls/søvn/readiness, «Legg til symptom».
- **Øvrig:** Dokumenter, Utstyrsbag, Foreldre-kobling, Hjelp (FAQ), Feedback.

## Coach-kontakt (nås inni appen, ikke egen fane)
- **Coach-hub:** coach-kort + «Melding» → tråd.
- **Meldinger / Meldingstråd:** chat med coach (tekst + video-klipp), komposer.
- **Planer fra coach · Videoer · AI-Caddie** (chat med foreslåtte spørsmål).

## Auth / oppstart
- Logg inn · Registrer · Glemt passord · BankID · Onboarding (steg-wizard) · Foreldresamtykke (junior venter).

---

# AGENCYOS (coachen · /admin · mørkt · desktop-først)

Sidebar: **Oversikt (Cockpit) · Min uke · Stall · Planlegge · Gjennomføre · Innsikt · Admin**
Topp (fast): **spiller↔gruppe-veksler · hurtigsøk ⌘K**

## Cockpit — `/admin/agencyos`
- **Viser:** dagens timeline (økter), innboks-teller, **Fokus-spiller-panel** (manuelt pinnet + 3 AI-forslag), KPI (aktive spillere · økter i dag · ventende godkjenninger · MRR).
- **Knapper/funksjoner:** fokus-kort → profil/«Legg til økt»/melding · pin/«løsne fra topp» · AI-forslag-knapper (Book 30 min / Se video / Ring) · innboks-rad → Forespørsler · tellere regnes fra faktisk liste.

## Min uke — `/admin/workspace`
- Tildelt meg (de viktigste handlingene) · Oppgaver (kanban: Å gjøre/Pågår/Ferdig) · «Ny oppgave».

## Stall — `/admin/spillere`
- **Spillerliste:** gruppefilter, HCP, SG-trend (sparkline), status-prikk, neste økt. Rad → spiller-detalj. «Ny spiller».
- **Spiller-detalj:** hero, coach-flagg, SG-trend, treningspyramide, aktiv plan, hurtighandlinger. **«Workbench»** → coachens spiller-Workbench.
- **Grupper · Talent-radar · Sammenligning (anonymiser) · WAGR-import (wizard).**

## Spiller-Workbench — `/admin/spillere/[id]/workbench` — **MASTER for planlegging**
- **Moduser:** Årsplan · Treningsplan · Fysplan · Mål · Økt-planlegging · Tildel drill · Tildel test.
- **Knapper/funksjoner:** veksle modus · lag/rediger plan · tildel → **spilleren får det i PlayerHQ + varsel** (ringvirkning) · coach-notat. All per-spiller-planlegging skjer her — ingen parallell planleggings-side.

## Planlegge — `/admin/planlegge` (ressurser, ikke per-spiller-planlegging)
- **Plan-maler** (+detalj med pyramide-fordeling + uke-struktur): «Bruk mal» → inn i spiller-Workbench. «Ny mal».
- **Drill-bibliotek** (+rediger — endring gjelder alle som har drillen).

## Gjennomføre — `/admin/gjennomfore`
- **Kalender** (uke/måned, «pågår nå») · **Bookinger** (+ ny-booking-wizard) · **Anlegg** (belegg) · **Tilgjengelighet** · **Tjenester** (prisliste) · **Live-økt (coach-side).**

## Innsikt — `/admin/analysere`
- **Stall-analyse** (aggregert SG + pyramide) · **Lag-snitt** · **Tester på tvers** · **Rapporter** (CSV/PDF) · **Økonomi** (MRR, innbetalt/utestående, faktura-tabell) · **Compliance.**

## Innboks & godkjenninger
- **Innboks** (`/admin/innboks`): forespørsler med Godta/Avvis/Svar.
- **Godkjenninger** (+detalj): plan-/økt-endringer med før/etter + «påvirker ikke andre»-vurdering → Godkjenn/Avvis/Kommenter.

## Admin — `/admin/organisasjon`
- Organisasjon · Team & roller · Tilgang (toggles) · Innstillinger · Audit-logg · Foreldreportal (begrenset innsyn for foreldre).

## Tre koblede flyter
- **Fellesmelding** — fra Turneringer: velg turnering → deltakere → skriv (blokker + AI) → kanaler → send → bekreftelse.
- **Fokus-spiller** — på Cockpit (pin + AI-forslag).
- **Spiller↔gruppe-veksler** — fast i topbar (søk + nylig sett + hurtigtaster).

---

## Hva som er FJERNET / slått sammen (mot gammel struktur)
- PlayerHQ 6-kort Planlegge-hub → ett trykkpunkt til Workbench.
- «Ny plan»-wizard + separate årsplan/treningsplan/fysplan/mål-innganger → moduser inni Workbench.
- Analysere + TrackMan (var to moduler) → én Analysere-flate med faner.
- Mål-bygger som egen side → mål redigeres i Workbench, vises i oversikt.
- AgencyOS dobbeltadresser (finance/okonomi, kalender/calendar, innboks/messages, godkjenninger/approvals, plans-templates/plan-templates) → én av hver.
- Flere cockpit-/dashboard-varianter → én kanonisk.
