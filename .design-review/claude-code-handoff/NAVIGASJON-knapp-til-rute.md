# KOMPLETT SKJERMKART — alle sider + hvilken knapp fører til hvilken skjerm

> **Formål:** Uttømmende navigasjonskart for hele AK Golf-plattformen. Hver skjerm i det
> konsoliderte settet (~150 skjermer etter at legacy/dubletter er kuttet), med rute, hva siden er,
> og **hver primærknapp → destinasjon**. Sammen med flyt-storyboardene (`Flyt - *.dc.html`) og
> referanseskjermene dekker dette samtlige sider. Ingen gjetting på plassering eller navigasjon.
>
> Notasjon: `rute — hva siden er. Knapper: «Etikett»→destinasjon · «Etikett»→destinasjon`.
> Kilde: kodeverifisert inventar (404 ruter) + dødknapp-fasit. Der koden er fasit, vinner koden.
>
> **➜ Hvilken tegning hører til hvilken rute?** Se `Rute-til-fil-register (navigasjonsfasit).dc.html`.
> Det lukker det siste leddet: dette kartet gir knapp→rute, registeret gir rute→tegnet .dc.html-fil.
> Hele plattformen er nå tegnet — hver rute har enten en egen fil eller et utpekt mønster.

---

## A · PlayerHQ — `/portal` (spiller, terminal-lys)

### Hjem & varsler
- `/portal` — **Dashboard** «hva gjør jeg i dag». Knapper: «Start dagens økt»→`/portal/(fullscreen)/live/[sessionId]/brief` · «Se hele planen»→`/portal/planlegge` · «Logg runde»→`/portal/statistikk/runder/ny` · coach-notat-kort→`/portal/coach/notes/[id]` · varsel-bjelle→`/portal/varsler` · profil-avatar→`/portal/meg`.
- `/portal/varsler` — **Varsel-hub**. Knapper: varsel-rad→kontekst (økt/booking/coach) · «Merk alle lest»→in-place.

### Analyse & statistikk (erstatter hele gamle `/mal`-treet)
- `/portal/analysere` — **Analyse-workbench** (diagnose-først: nivå+gap, så SG). Knapper: SG-kategori→`/portal/statistikk/[metric]` · «Per hull»→`/portal/analysere/hull`.
- `/portal/analysere/hull` — **Analyse per hull**. Knapper: hull-rad→inline detalj.
- `/portal/statistikk` — **Statistikk** (SG/runder/trend, faner SG·Runder·TrackMan·Tester·Trend). Knapper: metrikk-kort→`/portal/statistikk/[metric]` · «Sammenlign»→`/portal/statistikk/sammenlign` · runde-rad→`/portal/statistikk/runder/[id]`.
- `/portal/statistikk/[metric]` — **Metrikk-detalj**. Knapper: «Sammenlign»→`/sammenlign` · tilbake→`/portal/statistikk`.
- `/portal/statistikk/sammenlign` — **Sammenlign mot kohort/spiller** (radar/SG-delta). Knapper: velg motpart→in-place. *(Vurder merge m/ `/talent/sammenligning`.)*
- `/portal/statistikk/runder/ny` — **Logg runde** (steg 1: type/bane → steg 2 SG-import). Knapper: «Neste»→SG-import-steg · «Lagre»→`/portal/statistikk`.
- `/portal/statistikk/runder/[runId]/del` — **Del runde**. Knapper: «Del»→delings-modal.
- `/portal/trackman/[sessionId]` — **TrackMan-økt** (import + dispersjon + gapping). Knapper: «Importer CSV»/«Les skjermbilde»→parse→bekreft · slag-rad→inline.

### Stats-logging (V1, uten banekart)
- **Manuell SG-import** (i `/statistikk/runder/ny`) — 4 kategorier + snittscore + putts. Knapper: «Lagre runde»→`/portal/statistikk`.
- **On-course slag-logging** (rask/presis) — per slag: kølle/lie/avstand/resultat/retning/putt/penalty. Knapper: «Neste slag»→in-place · «Avslutt runde»→oppsummering→`/portal/statistikk`. *(V2: mikrofon-knapp = stemme-logging.)*

### Plan & Workbench (ett trykk inn)
- `/portal/planlegge` → `/portal/(fullscreen)/tren` — **Workbench**. Zoom: År(Gantt)/Uke/Økt. Knapper: zoom-veksler→in-place · dag-/økt-blokk→`/portal/tren/[sessionId]` · AI-forslag «Godkjenn»→laster økter inn.
- `/portal/tren/aarsplan` (+ `/periode/[id]/rediger`) — **Årsplan (Gantt)**. Knapper: periode-blokk→`/periode/[id]/rediger` · «Ny periode»→workbench-modal.
- `/portal/tren/kalender` — **Ukekalender (trening)** *(behold; slå sammen m/ `/portal/kalender`)*. Knapper: dag-celle→`/portal/tren/[sessionId]` · «Legg til økt»→`/portal/ny-okt`.
- `/portal/tren/[sessionId]` (+ `/planlagt`) — **Økt-detalj**. Knapper: «Start»→live-økt · «Rediger»→Workbench.
- `/portal/tren/fys-plan` (+ `/[planId]`) — **Fysisk plan** *(ligger som kort under «generelt» i Workbench)*. Knapper: plan→`/[planId]` · «Ny plan»→BYGG `/fys-plan/ny`.
- `/portal/tren/teknisk-plan` (+ `/[planId]`) — **Teknisk plan** (velg TrackMan-parametere). Knapper: plan→`/[planId]` · «Ny plan»→BYGG.
- `/portal/tren/feiring/[planId]` — **Feiring ved fullført plan**. Knapper: «Fortsett»→`/portal`.

### Gjennomføre & live
- `/portal/gjennomfore` (+ `/[id]`) — **Dagens program**. Knapper: «Start økt»→`/portal/(fullscreen)/live/[sessionId]/brief` · øvelse-kort→`/portal/drills/[id]`.
- `/portal/(fullscreen)/live/[sessionId]` (+ `/brief` `/active` `/logger` `/summary` `/tapper`) — **Live-økt fullskjerm**. Knapper: «Video/Foto/Notat»→KOBLE live-logger · «Neste steg»→`/active`→`/summary` · «Avslutt»→`/summary`.
- `/portal/ny-okt` — **Bygg egen økt (Pro)** (wizard). Knapper: «Bygg økt»→`/portal/gjennomfore`.
- `/portal/onskeligokt` (+ `/bekreftet`) — **Ønsk økt fra coach**. Knapper: «Send ønske»→`/bekreftet`.
- `/portal/drills` (+ `/[id]`) — **Øvelsesbibliotek**. Knapper: drill-kort→`/[id]`. *(`/tren/ovelser`→redirect hit.)*
- `/portal/trening/break-tabell` · `/logg` · `/putte-laboratoriet` — **Putting-verktøy + logg**. Knapper: «Logg»→in-place.

### Booking (flyt: `Flyt - Booking`)
- `/portal/booking` — **Bookingoversikt**. Knapper: «Ny booking»→`/portal/booking/ny` · booking-rad→`/portal/booking/[bookingId]` · «Oppgrader til Pro»→`/portal/meg/abonnement`.
- `/portal/booking/ny` (+ `/bekreft`) — **Wizard**. Knapper: «Velg anlegg»→`/ny/anlegg/[id]` · «Til bekreftelse»→`/ny/bekreft`.
- `/portal/booking/ny/anlegg/[id]` · `/coach/[id]` · `/bekreftet` — **Filtre + bekreftelse**. Knapper: anlegg/coach-kort→neste steg · «Bekreft & betal» (Stripe)→`/bekreftet`.
- `/portal/booking/[bookingId]` — **Booking-detalj**. Knapper: «Avbestill»/«Endre»→in-place.

### Coach-dialog (Pro) (flyt: `Flyt - Coach-dialog`)
- `/portal/coach` — **Coach-hub**. Knapper: «Meldinger»→`/coach/melding` · «Notater»→`/coach/notes` · «Spørsmål/Videoer/AI»→`/coach/sporsmal`·`/videoer`·`/ai`.
- `/portal/coach/melding` (+ `/[id]` `/[id]/vedlegg` `/ny`) — **Direktemelding**. Knapper: samtale-rad→`/[id]` · «Ny»→`/ny` · «Vedlegg»→`/[id]/vedlegg`.
- `/portal/coach/notes` (+ `/[noteId]`) — **Notater**. Knapper: notat→`/[noteId]`.
- `/portal/coach/sporsmal/[id]` — **Q&A med coach**. Knapper: «Svar»→in-place.
- `/portal/coach/plans` (+ `/[planId]` `/[planId]/ny-okt` `/perioder`) — **Coach-planer**. Knapper: plan→`/[planId]`→Workbench.
- `/portal/coach/ovelser` (+ `/ny` `/[id]/rediger`) · `/coach/videoer` · `/coach/ai` · `/coach/[coachId]` — **Øvelser/video/AI/profil**. Knapper: drill-kort→`/portal/drills/[id]` (fiks død rute) · video→spill av.
- `/portal/ai/foresla-drill` · `/foresla-turnering` · `/mal-bygger` — **AI-assistenter**. Knapper: «Bruk forslag»→laster inn.

### Mål (flyt: `Flyt - Mal`) — bor i Oversikt, redigeres i Workbench
- Mål-hub (i `/portal`) — Knapper: «Nytt mål»→mål-bygger (Workbench) · mål-kort→mål-detalj.
- Mål-bygger — Knapper: «Lagre mål»→mål-detalj.
- Mål-detalj — Knapper: «Redigér»→Workbench.
- Mål-leaderboard — Knapper: rad→`/portal/spiller/[spillerId]`.

### Talent & utfordringer (flyt: `Flyt - Talent`)
- `/portal/talent` (+ `/min-plan` `/mitt-niva` `/roadmap` `/sammenligning`) — **Talent-hub (junior)**. Knapper: «Roadmap»→`/roadmap` · «Mitt nivå»→`/mitt-niva` · «Sammenligning»→`/sammenligning`.
- `/portal/utfordringer` (+ `/[id]` `/ny`) — **Utfordringer**. Knapper: utfordring-kort→`/[id]` · «Ny»→`/ny` · «Logg forsøk»→in-place.
- `/portal/reach` — **Rekkevidde-analyse**. Knapper: kølle-rad→inline.

### Tester
- `/portal/tren/tester` (+ `/katalog` `/[testId]` `/ny` `/ny/egen`) — **Test-hub**. Knapper: test→`/[testId]` · «Gjennomfør»→`/(fullscreen-test)/tren/tester/[testId]/gjennomfor`.
- `/portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor` — **Test-gjennomføring** (scorekort). Knapper: «Neste slag»→in-place · «Fullfør»→sammendrag.
- `/portal/tren/turneringer` (+ `/[id]` `/ny`) — **Turneringer**. Knapper: turnering→`/[id]` · «Ny»→`/ny`.

### Meg (bruker-hub, ~30 undersider)
- `/portal/meg` — **Meg-hub**. Knapper: «Abonnement»→`/meg/abonnement` · «Bookinger/Dokumenter/Helse»→`/meg/bookinger`·`/dokumenter`·`/helse` · «Utstyrsbag/Innstillinger/Sikkerhet»→`/meg/utstyrsbag`·`/innstillinger`·`/sikkerhet` · «Hjelp»→`/meg/hjelp` · «Profil»→`/meg/profil`.
- `/portal/meg/abonnement` — **Abonnement** (GRATIS/PRO 299/årlig). Knapper: «Oppgrader» (Stripe)→checkout · «Administrer»→in-place · «Kvitteringer»→fakturaliste.
- `/portal/meg/innstillinger` (+ undersider: personvern, varsler, språk, eksport→personvern) · `/profil` · `/sikkerhet` · `/helse` · `/utstyrsbag` · `/dokumenter` · `/bookinger` · `/hjelp` — **Konto-undersider**. Hver: meny-rad→panel, «Lagre»→in-place. *(Alle følger settings-mønster: liste<md → meny+panel ≥md.)*

---

## B · AgencyOS — `/admin` (coach, mørk terminal)

### Cockpit
- `/admin` → redirect `/admin/agencyos`.
- `/admin/agencyos` — **Cockpit** (timeline, kø, KPI, AI-forslag). Knapper: «hvem trenger meg»-rad→`/admin/spillere/[id]`/`/godkjenninger/[id]` · timeline-blokk→`/admin/gjennomfore/okter/[id]` · scope-velger→topbar-filter.
- `/admin/agencyos/caddie` (+ `/aktivitet`) · `/uka` · `/live`(STUB→BYGG) — **AI-Caddie / 7-dagers kanban / Mission Control**. Knapper: kanban-kort→`/gjennomfore/okter/[id]`.

### Stall & spillere (flyt: `Flyt - AgencyOS Spiller og plan`)
- `/admin/spillere` (+ `/ny`) · `/admin/stall` · `/admin/grupper`(+`/[id]`) — **Stall-tabell** (tett rad ≥md → kort <md). Knapper: spiller-rad→`/admin/spillere/[id]` · «Ny spiller»→`/ny` · gruppe→`/grupper/[id]` (KOBLE ~7 døde gruppe-knapper).
- `/admin/spillere/[id]` (+ `/profil` `/rediger` `/fremgang` `/tester` `/tildel-test` `/workbench` `/plan/[planId]`) — **Spiller-detalj**. Knapper: faner→undersider · «Tildel test»→`/tildel-test` · «Åpne workbench»→`/workbench`→«Send plan»→laster inn hos spiller.

### Planlegging & maler
- `/admin/planlegge` · `/admin/coach-workbench` — **Planlegge-hub / Workbench**. Knapper: «Åpne coach-workbench»→`/coach-workbench` · «Tildel plan»→spiller.
- `/admin/plans` (+ `/[planId]` `/new`) · `/admin/plan-templates`(+`/[id]`(+`/rediger` `/effectiveness`) `/ny`) — **Planer + maler**. Knapper: plan-kort→`/plans/[planId]` · «Ny plan»→`/new` · «Plan-maler»→`/plan-templates` (fiks død `/plans/templates*`) · «Mal-effektivitet»→`/[id]/effectiveness`.
- `/admin/teknisk-plan`(+`/[spillerId]`) · `/admin/drills`(+`/[id]`(+`/rediger`) `/ny`) · `/admin/tester`(+`/[id]` `/benchmarks` `/foreslatte` `/tildel/[spillerId]`) — **Teknisk-plan / drills / tester**. Knapper: drill→`/[id]` · test-detalj «Tildel/Rediger/Dupliser»→KOBLE (3 døde) · «Tildel test»→`/tildel/[spillerId]`.
- **Test-bygger** (`AgencyOS Test-bygger`) — coach lager egne tester. Knapper: «Publiser test»→test-katalog · «Lagre utkast»→in-place.

### Kalender · booking · kapasitet (flyt: `Flyt - AgencyOS Kalender og gjennomfore`)
- `/admin/kalender`(+ `?view=maned|uke`) — **Kalender**. Knapper: visning Uke/Måned→`?view=` (slå sammen `/maned` `/uke`) · økt-blokk→`/gjennomfore/okter/[id]` · «Ny økt»→`/admin/bookinger/ny`. *(`/admin/calendar*`→redirect.)*
- `/admin/bookinger`(+`/ny`) · `/availability` · `/kapasitet` · `/foresporsler` — **Bookinger & kapasitet**. Knapper: «Ny booking»→`/ny` (fiks `bookings`-typo) · forespørsel→`/godkjenninger/[id]`.
- `/admin/locations` · `/facilities`(+`/[id]`) · `/services` — **Lokasjon/fasilitet/tjenester**. Knapper: «Anlegg» (norsk dublett)→`/facilities` · fasilitet→`/[id]`.

### Gjennomføre & live
- `/admin/gjennomfore`(+`/okter/[id]`) · `/admin/okter` — **Gjennomføre-hub**. Knapper: «Ny booking»/«I dag» (døde)→KOBLE→`/admin/bookinger/ny`·`?day=today` · live-kort (død)→`/admin/live/[sessionId]/brief` · økt-rad→`/gjennomfore/okter/[id]`.
- `/admin/live/[sessionId]/brief`(+`/active` `/summary`) — **Coach live-økt**. Knapper: «Start/Neste/Avslutt»→`/active`→`/summary` · «Logg på spiller»→inline.
- `/admin/recording` · `/trackman` · `/videoer` — **Opptak/TrackMan/videoer**. Knapper: video-kort (fiks `/elever`→`/spillere`) · TrackMan-sesjon→inline.

### Handlingssenter (flyt: `Flyt - AgencyOS Handlingssenter`) — samles til faner
- `/admin/innboks` — **Meldingsflate** (master-detalj). Knapper: samtale-rad→tråd-panel · «Svar/Tildel»→inline. *(`/messages`→redirect.)*
- `/admin/queue` · `/oppfolging` · `/foresporsler` · `/godkjenninger`(+`/[id]`) — **Kø/forespørsler/godkjenninger**. Knapper: kø-kort→detalj · «Se alle» (fiks død `/approvals`)→`/godkjenninger` · «Godkjenn/Avslå»→`/godkjenninger/[id]`.
- `/admin/kommunikasjon` · `/godkjenn-portal`(+`/koblinger`(`/[id]`) `/review`) — **Kommunikasjon / QA-portal**. Knapper: kanal-fane→in-place · rute-kobling→`/koblinger/[id]`·`/review`.

### Analyse & talent (navn-rydd)
- `/admin/analyse` (stall) · `/admin/analysere`(+`/compliance`) (innsikt) · `/admin/analytics` (bento) — **3 analyse-flater, døp om**. Knapper: KPI/pyramide→drill spiller/gruppe · innsikt-kort→`/analysere/compliance`.
- `/admin/lag-snitt` · `/runder` · `/tilstander` · `/reports` — **Lag-snitt/runder/tilstander/rapporter**. Knapper: rad→detalj · «Eksporter»→in-place.
- `/admin/talent` (+ `/[playerId]` `/radar`(`/[playerId]`) `/sammenligning` `/discovery` `/kohort` `/region` `/ressurser` `/wagr-benchmark` `/wagr-import`) — **Talent-modul**. Knapper: «Radar/Sammenligning»→`/radar`·`/sammenligning` · «Discovery/Kohort/Region»→respektive · «WAGR import/benchmark»→`/wagr-import`·`/wagr-benchmark`.

### Økonomi, workspace & admin
- `/admin/okonomi` — **Økonomi** *(gjør `/agencyos/okonomi` til fane)*. Knapper: KPI/faktura-rad→detalj.
- `/admin/workspace`(+`/notion` `/oppgaver`(`/[id]`) `/prosjekter` `/tildelt-meg`) — **Workspace (Notion-synk)**. Knapper: oppgave-flate (KOBLE alle døde) · «Prosjekt/Tildelt meg»→respektive.
- `/admin/caddie` · `/agents`(+`/[agentId]`) — **Co-agent / AI-agenter**. Knapper: agent-rad→`/[agentId]`.
- `/admin/organisasjon` · `/settings`(+`/api` `/calendar` `/security` `/tilgang`) · `/klubb/innstillinger` · `/team`(+`/inviter`) · `/integrasjoner` · `/email-templates`(+`/[id]/rediger`) · `/audit-log`(+`/[id]`) — **Admin-hub + innstillinger**. Knapper: 8 admin-kort→respektive innstillingssider · «Inviter coach»→`/team/inviter`.
- `/admin/profile` · `/mer` · `/hjelp` · `/brief` · `/reach` · `/stats/overview`(+`/moderering`) — **Profil/mer/hjelp/brief/reach/stats-admin**. Knapper: inngang-rad→respektiv side.
- **Mobil:** bunn-nav (Oversikt·Stall·Kalender·Innboks·Mer) <md; 54px ikon-rail ≥md. «Mer»→`/admin/mer`.

---

## C · Forelderportal — `/forelder` (flyt: `Flyt - Forelder og Marketing`)
- `/forelder` — **Hjem** (barnets fokus, økter, fakturaer). Knapper: barn-kort→`/forelder/barn/[childId]` · «Ukerapport»→`/ukerapport`.
- `/forelder/barn`(+`/[childId]`) · `/bookinger` · `/fakturaer` · `/okonomi` · `/ukerapport` · `/varsler` · `/innstillinger` — **Undersider (lesemodus)**. Knapper: rad→detalj.
- `/forelder/samtykke` — **GDPR-samtykke per barn**. Knapper: «Godkjenn samtykke»→`/forelder` · «Trekk tilbake»→bekreft.
- `/forelder/coach` — **Dialog med coach** (STUB, Q3).

---

## D · Auth / Onboarding (flyt: onboarding + auth-skjerm levert)
- `/auth/login` · `/signup` · `/forgot-password` · `/reset-password` · `/check-email` · `/logget-ut` — **Standard auth** (ekte AK-logo, 4 states). Knapper: «Logg inn»→`/portal`/`/admin` · «Glemt passord»→`/forgot-password` · «Lag konto»→`/signup`.
- `/auth/guardian-consent/[token]` · `/samtykke-venter` — **Foreldresamtykke-flyt**. Knapper: «Godkjenn»→aktiver konto.
- `/auth/onboarding`(+`/forelder`) · `/onboard/coach` · `/onboard/klubb` · `/inviter/forelder/[token]` — **Onboarding-wizards** (profil→mål→nivå-test→SG→kohort→plan). Knapper: «Neste»→steg · «Gå til PlayerHQ»→`/portal`.
- `/auth/bankid` — STUB (post-beta).

---

## E · Marketing — `/(marketing)` (flyt: `Flyt - Forelder og Marketing`)
- `/(marketing)` — **Hjem** (moderne, SG-konsoll/bento). Knapper: «Start gratis»→`/auth/signup` · «Se demo»→demo · nav→seksjoner.
- `/coacher`(+`/[slug]`) · `/coaching` · `/cases` · `/anlegg`(+`/[slug]`) · `/blogg`(+`/[slug]`) · `/turneringer`(+`/[slug]`) · `/booking`(+`/[slug]`(`/bekreft`) `/kvittering/[bookingId]`) — **Innholdssider**. Knapper: kort→`/[slug]` · «Book»→booking-landing.
- `/priser` · `/junior` · `/playerhq` · `/treningsfilosofi` · `/om-oss` · `/kontakt` · `/faq` · `/jobb` · `/cookies` · `/personvern` · `/vilkar` — **Sekundærsider** (mange STUB — fullfør). Knapper: CTA→`/auth/signup` · «Kontakt»→skjema.
- Kuttes: `/suksess` (=`/cases`).

---

## F · Stats-plattform — `/(marketing)/stats` (EGET produkt-spor, ~30 ekte ruter)
Behandles separat (eget uttrykk). Hovedsider: `/stats` (hub) · `/stats/pga/*` · `/stats/spillere`(+`/[slug]`) · `/stats/baner`(+`/[slug]`) · `/stats/turneringer`(+`/[slug]`) · `/stats/sammenlign-spillere` · `/stats/sg-sammenlign`(+`/start` `/resultat/[id]`) · `/stats/verktoy/*` (kalkulatorer). Resten (`/2026` `/aargang` `/klubber` `/leaderboards` `/quiz` `/regions` …) er STUB.

---

## G · Kuttes / pensjoneres (IKKE bygg)
- **Hele `/portal/mal/*`-treet (27 ruter)** — gammel Mål-modul. Erstattet av `/statistikk` + `/analysere` + `/trackman`.
- **Redirects:** `/portal/analyse`→`/analysere` · `/portal/stats`→`/statistikk` · `/tren/ovelser`→`/drills` · `/admin`→`/agencyos` · `/admin/calendar*`→`/kalender` · `/messages`→`/innboks` · `/approvals*`→`/godkjenninger` · `/plans/templates*`→`/plan-templates` · `/anlegg*`→`/facilities` · `/suksess`→`/cases`.
- **Dubletter:** `/admin/agencyos/okonomi`+`/spillere`→faner i `/admin/okonomi`+`/spillere` · `/stats/blogg`→`/(marketing)/blogg`.
- **Demo/intern (~15):** `/(internal)/design-system*` · `/(internal)/demos/*` · `/intern/komponenter/*` — ut av produkt-scope.
- **Banekart/baneguide:** fjern (V1 har ikke banekart).
- **Dublett-kalendere:** slå sammen `/portal/kalender` + `/portal/tren/kalender` til én.

---

## Slik bruker Claude Code dette
1. Dette kartet = **fasit for plassering + navigasjon** (hvilken knapp → hvilken skjerm).
2. Flyt-storyboardene (`Flyt - *.dc.html`) = **visuell sekvens** for kjerneflytene.
3. Referanseskjermene = **visuell fasit per skjermtype**.
4. Long-tail-undersider (Meg-, admin-, talent-undersider) som ikke har egen tegning følger
   mønsteret fra nærmeste referanseskjerm + denne ruten/knapp-listen — ingen gjetting på plassering.
5. Kryssjekk mot `uploads/50-FLYT-DODE-KNAPPER.md` for alle knapper som må kobles.
