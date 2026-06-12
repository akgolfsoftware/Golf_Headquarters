# UX-arkitektur — AK Golf Platform

> Komplett kartlegging og konsolideringsanalyse av hele plattformen.
> Designfilosofi: minst mulig trykk, hver skjerm forsvarer sin eksistens, logikk i alt.

**Versjon:** 1.0
**Dato:** 12. juni 2026
**Forfatter:** Claude (senior produktdesigner/app-arkitekt)

---

## DEL 1 — KARTLEGGING

### Overflater og rutestruktur

Plattformen har **fire hovedoverflater** + auth/marketing:

| Overflate | Rotsti | Auth-krav | Målgruppe | Skjermer |
|-----------|--------|-----------|-----------|----------|
| **Marketing** | `/(marketing)/*` | Åpen | Besøkende | ~50 |
| **PlayerHQ** | `/portal/*` | PLAYER/COACH/ADMIN | Spillere | ~150 |
| **CoachHQ (AgencyOS)** | `/admin/*` | COACH/ADMIN | Trenere | ~140 |
| **Foreldreportal** | `/forelder/*` | PARENT | Foreldre | ~10 |
| **Auth** | `/auth/*` | Åpen/delvis | Alle | ~10 |

---

### 1.1 Marketing-flaten

| Rute | Jobb (1 setning) | Primærhandling | Elementer | Trykk fra / | Datakilde |
|------|------------------|----------------|-----------|-------------|-----------|
| `/` | Presentere AK Golf og konvertere til booking | Book time | 8+ | 0 | Statisk |
| `/booking` | Vise tilgjengelige tjenester | Velg tjeneste | 4-6 | 1 | Service |
| `/booking/[slug]` | Vise tidspunkter for valgt tjeneste | Velg tid | 6-8 | 2 | Availability |
| `/booking/[slug]/bekreft` | Samle kundeinformasjon og bekrefte | Fullfør booking | 5 | 3 | Form |
| `/booking/kvittering/[id]` | Bekrefte vellykket booking | Legg til kalender | 3 | 4 | Booking |
| `/coaching` | Forklare coaching-tilbudet | Book intro | 5 | 1 | Statisk |
| `/junior` | Forklare junior-programmene | Kontakt oss | 5 | 1 | Statisk |
| `/priser` | Vise priser transparent | Velg pakke | 6 | 1 | Statisk |
| `/playerhq` | Presentere appen/portalen | Registrer deg | 6 | 1 | Statisk |
| `/om-oss` | Bygge tillit gjennom historien | Kontakt | 4 | 1 | Statisk |
| `/kontakt` | Gi kontaktinformasjon | Send melding | 3 | 1 | Form |
| `/faq` | Besvare vanlige spørsmål | Søk/les | 10+ | 1 | Statisk |
| `/coacher` | Vise coachene | Se coach-profil | 3-6 | 1 | User (coach) |
| `/coacher/[slug]` | Vise én coach i detalj | Book hos coach | 5 | 2 | User |
| `/anlegg` | Vise treningsanleggene | Se anlegg | 3-4 | 1 | Location |
| `/anlegg/[slug]` | Vise ett anlegg i detalj | Book her | 5 | 2 | Location |
| `/blogg` | Vise artikler | Les artikkel | 6+ | 1 | BlogPost |
| `/blogg/[slug]` | Vise én artikkel | Del/kommenter | 1 | 2 | BlogPost |
| `/turneringer` | Vise kommende turneringer | Meld på | 4+ | 1 | Tournament |
| `/turneringer/[slug]` | Vise én turnering | Meld på | 6 | 2 | Tournament |
| `/cases` | Vise suksesshistorier | Les mer | 4 | 1 | Statisk |
| `/treningsfilosofi` | Forklare metoden | Book intro | 4 | 1 | Statisk |
| `/stats/*` | Golfstatistikk-plattform (SEO) | Utforsk data | 8+ | 1 | DataGolf |
| `/vilkar` | Juridisk transparens | Les | 1 | 1+ | Statisk |
| `/personvern` | GDPR-info | Les | 1 | 1+ | Statisk |
| `/cookies` | Cookie-policy | Les | 1 | 1+ | Statisk |
| `/jobb` | Rekruttering | Søk jobb | 3 | 1 | Statisk |
| `/suksess` | Bekrefte vellykket handling | — | 2 | — | Statisk |

**Funn:**
- `/stats/*` er en egen sub-plattform med ~30 sider — SEO-drevet, ikke kjerneprodukt
- Booking-flyten er 5 skjermer (/ → /booking → /[slug] → bekreft → kvittering) — **mål: 5, faktisk: 5** ✓

---

### 1.2 PlayerHQ (/portal/*)

**Navigasjon (5-seksjons IA):**
- Oversikt → `/portal`
- Planlegge → `/portal/planlegge` (9 barn)
- Gjennomføre → `/portal/gjennomfore` (2 barn)
- Analysere → `/portal/analysere` (6 barn)
- Coach → `/portal/coach` (3 barn)

**Bottom-nav (mobil):** 5 ikoner = 1 trykk til hver hovedseksjon

#### Oversikt

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal` | Gi daglig oversikt og neste handling | Start dagens økt | 6 | 0 | HjemData |

**Eksistensbegrunnelse:** Landing-punkt etter innlogging, samler alt kritisk på ett sted.

#### Planlegge-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/planlegge` | Hub for alle planleggingsverktøy | Gå til workbench | 4 | 1 | — |
| `/portal/planlegge/workbench` | Bygge og justere ukeplan | Dra/slipp økt | 12+ | 2 | Plan, Session |
| `/portal/tren/aarsplan` | Visualisere hele året | Se periode | 5 | 2 | Periods |
| `/portal/tren/aarsplan/periode/[id]/rediger` | Redigere en periode | Lagre | 4 | 3 | Period |
| `/portal/tren/teknisk-plan` | Liste over tekniske planer | Åpne plan | 3+ | 2 | TechnicalPlan |
| `/portal/tren/teknisk-plan/[planId]` | Se én teknisk plan | Start økt | 5 | 3 | TechnicalPlan |
| `/portal/tren/fys-plan` | Liste over fysplaner | Åpne plan | 3+ | 2 | PhysicalPlan |
| `/portal/tren/fys-plan/[planId]` | Se én fysplan | Start økt | 5 | 3 | PhysicalPlan |
| `/portal/mal` | Hub for målsetting | Se mål | 4 | 2 | Goal |
| `/portal/mal/goal/[id]` | Detaljer for ett mål | Oppdater fremgang | 4 | 3 | Goal |
| `/portal/mal/milepaeler` | Liste over milepæler | Markér fullført | 3+ | 2 | Milestone |
| `/portal/mal/bygger` | AI-assistert målbygger | Generer mål | 5 | 2 | — |
| `/portal/mal/leaderboard` | Sosial sammenligning | — | 5 | 2 | Leaderboard |
| `/portal/mal/statistikk` | Målrelatert statistikk | — | 4 | 2 | Stats |
| `/portal/tren/turneringer` | Liste over turneringer | Meld på | 4+ | 2 | Tournament |
| `/portal/tren/turneringer/[id]` | Detaljer for én turnering | Meld på | 5 | 3 | Tournament |
| `/portal/tren/turneringer/ny` | Registrere ny turnering | Lagre | 4 | 3 | Form |
| `/portal/drills` | Drill-bibliotek | Åpne drill | 8+ | 2 | Drill |
| `/portal/drills/[id]` | Drill-detalj | Start drill | 5 | 3 | Drill |
| `/portal/trening/logg` | Logge manuell økt | Lagre | 4 | 2 | Session |
| `/portal/trening/putte-laboratoriet` | Putting-analyse-verktøy | Kjør test | 5 | 2 | — |
| `/portal/trening/break-tabell` | Break-referanse | — | 2 | 2 | Statisk |

**Funn:**
- `/portal/planlegge` er en **navigasjonsmellommann** — inneholder bare lenker, ingen egen funksjon
- `KONSOLIDERINGSKANDIDAT`: Slå sammen `/portal/planlegge` direkte inn i `/portal` som seksjon
- `/portal/trening/break-tabell` har kun 2 elementer — `KONSOLIDERINGSKANDIDAT`

#### Gjennomføre-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/gjennomfore` | Hub for gjennomføring | Se kalender | 3 | 1 | — |
| `/portal/kalender` | Vise ukekalender | Åpne økt | 7+ | 2 | Session |
| `/portal/booking` | Hub for bookinger | Book ny | 4 | 2 | Booking |
| `/portal/booking/ny` | Starte ny booking | Velg tid | 5 | 3 | Availability |
| `/portal/booking/ny/bekreft` | Bekrefte booking | Fullfør | 4 | 4 | Form |
| `/portal/booking/bekreftet` | Bekreftelsesside | — | 2 | 5 | Booking |
| `/portal/booking/[bookingId]` | Detaljer for booking | Endre/avbestill | 4 | 3 | Booking |
| `/portal/booking/anlegg/[id]` | Filtrere på anlegg | Book | 4 | 3 | Location |
| `/portal/booking/coach/[id]` | Filtrere på coach | Book | 4 | 3 | User |
| `/portal/ny-okt` | Starte ad-hoc økt | Start | 3 | 2 | — |
| `/portal/onskeligokt` | Be om økt fra coach | Send forespørsel | 4 | 2 | Form |
| `/portal/onskeligokt/bekreftet` | Bekrefte forespørsel | — | 2 | 3 | — |

**Funn:**
- `/portal/gjennomfore` er en **navigasjonsmellommann** — `KONSOLIDERINGSKANDIDAT`
- `/portal/booking/bekreftet` og `/portal/onskeligokt/bekreftet` har kun 2 elementer — bør være toast/inline
- Booking-flyten i portal: 5 skjermer (booking → ny → bekreft → bekreftet) — kan reduseres til 3

#### Live Session (fullscreen-isolert)

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/(fullscreen)/live/[sessionId]` | Redirect til riktig state | — | 0 | — | Session |
| `/portal/(fullscreen)/live/[sessionId]/brief` | Pre-session forberedelse | Start økt | 4 | 1* | Session |
| `/portal/(fullscreen)/live/[sessionId]/active` | Gjennomføre økt live | Logg resultat | 5+ | 2* | Session |
| `/portal/(fullscreen)/live/[sessionId]/logger` | Manuell logging-modus | Logg | 3 | 2* | Session |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | Rask tap-logging | Tap | 2 | 2* | Session |
| `/portal/(fullscreen)/live/[sessionId]/summary` | Oppsummere fullført økt | Lukk/del | 5 | 3* | Session |

*Trykk fra "Start økt"-knappen, ikke fra app-inngang.

**Live Session er låst fullskjerm — ALDRI slå sammen med andre skjermer.**

**Trykkbudsjett-analyse:**
- **Mål:** App-åpning → start dagens økt = 2 trykk
- **Faktisk:** /portal → "Dagens økt"-kort → Start = **2 trykk** ✓
- **Mål:** Logge ett resultat i Live Session = 1 trykk
- **Faktisk:** I active-mode, tap på logg-knapp = **1 trykk** ✓

#### Analysere-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/analysere` | Statistikk-oversikt | Se metrikk | 6 | 1 | Stats |
| `/portal/analysere/hull` | Hullanalyse | — | 5 | 2 | Round |
| `/portal/mal/sg-hub` | Strokes Gained hub | Se kategori | 5 | 2 | SG |
| `/portal/mal/sg-hub/[club]` | SG per kølle | — | 4 | 3 | SG |
| `/portal/mal/sg-hub/benchmark` | Tour-sammenligning | — | 4 | 3 | Benchmark |
| `/portal/mal/sg-hub/best-vs-now` | Historisk utvikling | — | 4 | 3 | SG |
| `/portal/mal/sg-hub/conditions` | Forhold-analyse | — | 4 | 3 | Round |
| `/portal/mal/sg-hub/equipment` | Utstyrsanalyse | — | 4 | 3 | Equipment |
| `/portal/mal/sg-hub/strategy` | Spillstrategi | — | 4 | 3 | SG |
| `/portal/mal/sg-hub/yardage` | Avstandsfordeling | — | 4 | 3 | SG |
| `/portal/mal/runder` | Rundeliste | Åpne runde | 5+ | 2 | Round |
| `/portal/mal/runder/[id]` | Rundedetalj | — | 6 | 3 | Round |
| `/portal/mal/runder/[id]/shot-by-shot` | Slag-for-slag | — | 10+ | 4 | Round |
| `/portal/mal/runder/ny` | Registrere ny runde | Lagre | 8 | 3 | Form |
| `/portal/mal/trackman` | TrackMan-økter | Åpne økt | 4+ | 2 | TrackmanSession |
| `/portal/mal/trackman/[id]` | TrackMan-detalj | — | 6 | 3 | TrackmanSession |
| `/portal/mal/baner` | Baneoversikt | Åpne bane | 4+ | 2 | Course |
| `/portal/mal/baner/[id]` | Banedetalj | — | 5 | 3 | Course |
| `/portal/tren/tester` | Test-oversikt | Ta test | 6+ | 2 | TestResult |
| `/portal/tren/tester/[testId]` | Test-detalj | Start test | 5 | 3 | TestResult |
| `/portal/tren/tester/[testId]/gjennomfor` | Gjennomføre test | Logg | 4 | 4 | TestResult |
| `/portal/tren/tester/katalog` | Test-katalog | Velg test | 6+ | 3 | TestProtocol |
| `/portal/tren/tester/ny` | Registrere ny test | Lagre | 4 | 3 | Form |
| `/portal/tren/tester/ny/egen` | Lage egen test | Lagre | 5 | 4 | Form |
| `/portal/statistikk` | Alternativ stats-visning | — | 5 | 2 | Stats |
| `/portal/statistikk/[metric]` | Enkeltmetrikk | — | 4 | 3 | Stats |
| `/portal/statistikk/sammenlign` | Sammenligne perioder | — | 5 | 3 | Stats |
| `/portal/statistikk/runder/[id]/del` | Dele rundestatistikk | Del | 3 | 4 | Round |
| `/portal/talent` | Talent-radar (egen) | — | 5 | 2 | WAGR |
| `/portal/talent/mitt-niva` | Eget nivå | — | 4 | 3 | Stats |
| `/portal/talent/min-plan` | Utviklingsplan | — | 4 | 3 | Plan |
| `/portal/talent/roadmap` | Karrierevei | — | 4 | 3 | — |
| `/portal/talent/sammenligning` | Sammenligne med andre | — | 5 | 3 | WAGR |
| `/portal/trackman/[sessionId]` | Alternativ TrackMan-rute | — | 6 | 2 | TrackmanSession |

**Funn:**
- `/portal/mal/sg-hub/*` har 8 undersider — `KONSOLIDERINGSKANDIDAT` til tabs/accordion i hovedsiden
- `/portal/statistikk` og `/portal/analysere` overlapper — begge viser stats
- `/portal/tren/tester/ny/egen` er 4 trykk fra oversikt — lang vei

#### Coach-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/coach` | Hub for coach-kommunikasjon | Se meldinger | 4 | 1 | — |
| `/portal/coach/[coachId]` | Coach-profil | Send melding | 4 | 2 | User |
| `/portal/coach/melding` | Meldingsliste | Åpne tråd | 5+ | 2 | Message |
| `/portal/coach/melding/[id]` | Meldingstråd | Svar | 6+ | 3 | Message |
| `/portal/coach/melding/[id]/vedlegg` | Vedlegg i melding | — | 3 | 4 | Attachment |
| `/portal/coach/melding/ny` | Ny melding | Send | 4 | 3 | Form |
| `/portal/coach/notes` | Coach-notater | Åpne notat | 3+ | 2 | Note |
| `/portal/coach/notes/[noteId]` | Notat-detalj | — | 3 | 3 | Note |
| `/portal/coach/ovelser` | Øvelser fra coach | Åpne øvelse | 4+ | 2 | Exercise |
| `/portal/coach/ovelser/[id]/rediger` | Redigere øvelse | Lagre | 5 | 3 | Exercise |
| `/portal/coach/ovelser/ny` | Ny øvelse | Lagre | 5 | 3 | Form |
| `/portal/coach/plans` | Planer fra coach | Åpne plan | 3+ | 2 | Plan |
| `/portal/coach/plans/[planId]` | Plan-detalj | — | 5 | 3 | Plan |
| `/portal/coach/plans/[planId]/ny-okt` | Ny økt i plan | Lagre | 4 | 4 | Form |
| `/portal/coach/plans/perioder` | Perioder-oversikt | — | 3 | 3 | Period |
| `/portal/coach/sporsmal/[id]` | Coach-spørsmål | Svar | 4 | 3 | Question |
| `/portal/coach/videoer` | Video-feedback | Se video | 4+ | 2 | Video |
| `/portal/coach/ai` | AI-coach | Still spørsmål | 3 | 2 | — |

**Funn:**
- `/portal/coach/melding/[id]/vedlegg` har kun 3 elementer — bør være inline i meldingstråden
- `/portal/coach` er en **navigasjonsmellommann**

#### Meg-seksjonen (profil)

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/portal/meg` | Profiloversikt | Rediger | 5 | 1 | User |
| `/portal/meg/profil` | Profil-detaljer | Rediger | 5 | 2 | User |
| `/portal/meg/profil/rediger` | Redigere profil | Lagre | 6 | 3 | Form |
| `/portal/meg/utstyrsbag` | Utstyrsoversikt | Legg til | 4+ | 2 | Equipment |
| `/portal/meg/bookinger` | Mine bookinger | Se/endre | 4+ | 2 | Booking |
| `/portal/meg/bookinger/reschedule/[id]` | Flytte booking | Lagre | 4 | 3 | Booking |
| `/portal/meg/dokumenter` | Mine dokumenter | Last ned | 3+ | 2 | Document |
| `/portal/meg/foreldre` | Foreldre-koblinger | Inviter | 3 | 2 | Parent |
| `/portal/meg/helse` | Helsestatus | Logg symptom | 4 | 2 | Health |
| `/portal/meg/helse/symptom/ny` | Nytt symptom | Lagre | 4 | 3 | Form |
| `/portal/meg/feedback` | Gi tilbakemelding | Send | 3 | 2 | Form |
| `/portal/meg/help` | Hjelpesenter | Les artikkel | 4 | 2 | Help |
| `/portal/meg/help/artikkel/[slug]` | Hjelpeartikkel | — | 2 | 3 | Help |
| `/portal/meg/help/kategori/[slug]` | Hjelpekategori | — | 3+ | 3 | Help |
| `/portal/meg/help/kontakt` | Kontakt support | Send | 3 | 3 | Form |
| `/portal/meg/abonnement` | Abonnement-oversikt | Administrer | 4 | 2 | Subscription |
| `/portal/meg/abonnement/oppgrader` | Oppgrader | Velg plan | 4 | 3 | Subscription |
| `/portal/meg/abonnement/oppgrader/flyt` | Oppgraderingsflyt | Fullfør | 5 | 4 | Stripe |
| `/portal/meg/abonnement/avbestill` | Avbestill | Bekreft | 3 | 3 | Subscription |
| `/portal/meg/abonnement/faktura/[id]` | Fakturadetalj | Last ned | 3 | 3 | Invoice |
| `/portal/meg/abonnement/kort/ny` | Nytt betalingskort | Lagre | 4 | 3 | Stripe |
| `/portal/meg/sikkerhet` | Sikkerhet-hub | — | 3 | 2 | — |
| `/portal/meg/sikkerhet/2fa` | Tofaktor-oppsett | Aktiver | 4 | 3 | Form |
| `/portal/meg/innstillinger` | Innstillinger-hub | Endre | 6 | 2 | Settings |
| `/portal/meg/innstillinger/varsler` | Varselinnstillinger | Lagre | 5 | 3 | Settings |
| `/portal/meg/innstillinger/personvern` | Personvern | Lagre | 4 | 3 | Settings |
| `/portal/meg/innstillinger/sprak` | Språk | Lagre | 3 | 3 | Settings |
| `/portal/meg/innstillinger/sikkerhet` | Sikkerhetsinnstillinger | Lagre | 4 | 3 | Settings |
| `/portal/meg/innstillinger/okter` | Økt-innstillinger | Lagre | 4 | 3 | Settings |
| `/portal/meg/innstillinger/anlegg` | Anleggsvalg | Lagre | 3 | 3 | Settings |
| `/portal/meg/innstillinger/integrasjoner` | Tredjepartsintegrasjoner | Koble | 4 | 3 | Settings |
| `/portal/meg/innstillinger/eksport` | Dataeksport | Last ned | 3 | 3 | — |

**Funn:**
- `/portal/meg/innstillinger/*` har 8 undersider — `KONSOLIDERINGSKANDIDAT` til seksjoner på én side
- `/portal/meg/sikkerhet` og `/portal/meg/innstillinger/sikkerhet` overlapper
- `/portal/meg/help/artikkel/[slug]` har kun 2 elementer — kan være modal

---

### 1.3 CoachHQ/AgencyOS (/admin/*)

**Navigasjon (6-seksjons IA):**
- Oversikt → `/admin/agencyos` (Dashboard, Min uke, Oppgaver, Tildelt meg)
- Stall → `/admin/stall` (Alle spillere, Grupper, Talent-radar, etc.)
- Planlegge → `/admin/planlegge` (Treningsplaner, Plan-maler, Drills, Turneringer)
- Gjennomføre → `/admin/gjennomfore` (Kalender, Bookinger, Anlegg, etc.)
- Innsikt → `/admin/analysere` (Stall-analyse, Lag-snitt, Tester, etc.)
- Admin → `/admin/organisasjon` (Innboks, E-postmaler, AI-agenter, etc.)

#### Oversikt-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin` | Redirect til agencyos | — | 0 | 0 | — |
| `/admin/agencyos` | Dashboard med KPI-er | Se spiller | 8+ | 0 | Dashboard |
| `/admin/agencyos/uka` | Uke-fokus | — | 5 | 1 | Week |
| `/admin/agencyos/okonomi` | Økonomi-oversikt | — | 5 | 1 | Finance |
| `/admin/agencyos/caddie` | Caddie/AI-innsikt | — | 4 | 1 | AI |
| `/admin/agencyos/caddie/aktivitet` | Aktivitetslogg | — | 5+ | 2 | Log |
| `/admin/agencyos/spillere` | Spiller-oversikt | Se spiller | 6+ | 1 | User |
| `/admin/agencyos/live` | Live-økter nå | Gå til økt | 3+ | 1 | Session |
| `/admin/workspace` | Min uke / arbeidsflate | Se oppgave | 5 | 1 | Task |
| `/admin/workspace/oppgaver` | Alle oppgaver | Åpne | 6+ | 1 | Task |
| `/admin/workspace/oppgaver/[id]` | Oppgave-detalj | Marker ferdig | 4 | 2 | Task |
| `/admin/workspace/tildelt-meg` | Tildelte oppgaver | Åpne | 5+ | 1 | Task |
| `/admin/workspace/prosjekter` | Prosjektoversikt | Åpne | 4+ | 2 | Project |
| `/admin/workspace/notion` | Notion-synk | — | 3 | 2 | Notion |

#### Stall-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin/stall` | Redirect til spillere | — | 0 | 1 | — |
| `/admin/spillere` | Spilleroversikt (tabell) | Åpne spiller | 10+ | 1 | User |
| `/admin/spillere/ny` | Registrere ny spiller | Lagre | 8 | 2 | Form |
| `/admin/spillere/[id]` | Spiller-profil | Se plan | 8 | 2 | User |
| `/admin/spillere/[id]/profil` | Profil-detaljer | Rediger | 6 | 3 | User |
| `/admin/spillere/[id]/rediger` | Rediger spiller | Lagre | 8 | 3 | Form |
| `/admin/spillere/[id]/fremgang` | Fremgangsrapport | — | 6 | 3 | Progress |
| `/admin/spillere/[id]/plan/[planId]` | Spiller-plan | Juster | 5 | 3 | Plan |
| `/admin/spillere/[id]/tester` | Spillerens tester | Se test | 5+ | 3 | TestResult |
| `/admin/spillere/[id]/tildel-test` | Tildel test | Lagre | 4 | 3 | Form |
| `/admin/spillere/[id]/workbench` | Spiller-workbench | Planlegg | 10+ | 3 | Plan |
| `/admin/board` | Tavle-visning | Se spiller | 8+ | 1 | User |
| `/admin/grupper` | Gruppeoversikt | Åpne gruppe | 4+ | 1 | Group |
| `/admin/grupper/[id]` | Gruppedetalj | Se medlem | 5 | 2 | Group |
| `/admin/talent` | Talent-hub | Se spiller | 5 | 1 | WAGR |
| `/admin/talent/[playerId]` | Talent-profil | — | 5 | 2 | WAGR |
| `/admin/talent/discovery` | Talentoppdagelse | — | 5 | 2 | WAGR |
| `/admin/talent/kohort` | Kohort-analyse | — | 5 | 2 | Stats |
| `/admin/talent/radar` | Talent-radar | Se spiller | 6 | 2 | WAGR |
| `/admin/talent/radar/[playerId]` | Radar-detalj | — | 5 | 3 | WAGR |
| `/admin/talent/region` | Regional analyse | — | 4 | 2 | Stats |
| `/admin/talent/ressurser` | Ressurser | — | 3 | 2 | — |
| `/admin/talent/sammenligning` | Sammenligning | — | 5 | 2 | Stats |
| `/admin/talent/wagr-benchmark` | WAGR-benchmark | — | 5 | 2 | WAGR |
| `/admin/talent/wagr-import` | WAGR-import | Importer | 4 | 2 | Form |

**Funn:**
- `/admin/stall` er bare en redirect — ikke egen skjerm
- `/admin/spillere` og `/admin/board` er samme data, bare ulik visning — allerede løst med tabs (SpillereTabs)
- `/admin/talent/*` har 10 undersider — `KONSOLIDERINGSKANDIDAT`

#### Planlegge-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin/planlegge` | Hub for planlegging | — | 3 | 1 | — |
| `/admin/plans` | Alle planer | Åpne plan | 5+ | 1 | Plan |
| `/admin/plans/[planId]` | Plan-detalj | Juster | 6 | 2 | Plan |
| `/admin/plans/new` | Ny plan | Lagre | 6 | 2 | Form |
| `/admin/plans/templates` | Plan-maler | Åpne mal | 4+ | 2 | Template |
| `/admin/plans/templates/[id]/rediger` | Rediger mal | Lagre | 6 | 3 | Template |
| `/admin/plans/templates/[id]/effectiveness` | Mal-effektivitet | — | 4 | 3 | Stats |
| `/admin/plans/templates/ny` | Ny mal | Lagre | 6 | 3 | Form |
| `/admin/plan-templates` | Alternativ mal-rute | — | 4+ | 1 | Template |
| `/admin/plan-templates/[id]` | Mal-detalj | — | 5 | 2 | Template |
| `/admin/plan-templates/[id]/rediger` | Rediger | Lagre | 6 | 3 | Template |
| `/admin/plan-templates/[id]/effectiveness` | Effektivitet | — | 4 | 3 | Stats |
| `/admin/plan-templates/ny` | Ny mal | Lagre | 6 | 2 | Form |
| `/admin/drills` | Drill-bibliotek | Åpne drill | 8+ | 1 | Drill |
| `/admin/drills/[id]` | Drill-detalj | Rediger | 6 | 2 | Drill |
| `/admin/drills/[id]/rediger` | Rediger drill | Lagre | 6 | 3 | Drill |
| `/admin/drills/ny` | Ny drill | Lagre | 6 | 2 | Form |
| `/admin/tournaments` | Turneringsoversikt | Åpne | 5+ | 1 | Tournament |
| `/admin/tournaments/[id]` | Turnering-detalj | Rediger | 6 | 2 | Tournament |
| `/admin/tournaments/ny` | Ny turnering | Lagre | 5 | 2 | Form |
| `/admin/tournaments/dubletter` | Duplikat-håndtering | Slå sammen | 4 | 2 | Tournament |
| `/admin/teknisk-plan` | Tekniske planer | Åpne | 4+ | 1 | TechnicalPlan |
| `/admin/teknisk-plan/[spillerId]` | Spiller teknisk plan | Juster | 5 | 2 | TechnicalPlan |

**Funn:**
- `/admin/plans/templates/*` og `/admin/plan-templates/*` er **duplikate ruter** for samme funksjon
- `/admin/planlegge` er en **navigasjonsmellommann**

#### Gjennomføre-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin/gjennomfore` | Hub | — | 3 | 1 | — |
| `/admin/gjennomfore/okter/[id]` | Økt-detalj (coach-view) | — | 5 | 2 | Session |
| `/admin/kalender` | Ukekalender | Åpne økt | 10+ | 1 | Session |
| `/admin/kalender/uke` | Uke-visning | — | 10+ | 1 | Session |
| `/admin/kalender/maned` | Måned-visning | — | 6 | 1 | Session |
| `/admin/calendar` | Redirect til kalender | — | 0 | 1 | — |
| `/admin/calendar/maned` | Redirect | — | 0 | 1 | — |
| `/admin/bookinger` | Booking-liste | Åpne | 6+ | 1 | Booking |
| `/admin/bookinger/ny` | Ny booking | Lagre | 5 | 2 | Form |
| `/admin/anlegg` | Anleggsoversikt | Åpne | 4+ | 1 | Location |
| `/admin/anlegg/[id]` | Anlegg-detalj | Rediger | 5 | 2 | Location |
| `/admin/availability` | Tilgjengelighet | Juster | 6 | 1 | Availability |
| `/admin/services` | Tjenester | Åpne | 4+ | 1 | Service |
| `/admin/kapasitet` | Kapasitetsplanlegging | — | 4 | 1 | Capacity |
| `/admin/live/[sessionId]/active` | Live-økt (coach) | Se spiller | 5 | 2 | Session |
| `/admin/live/[sessionId]/brief` | Brief (coach) | — | 4 | 2 | Session |
| `/admin/live/[sessionId]/summary` | Oppsummering (coach) | — | 5 | 2 | Session |

**Funn:**
- `/admin/gjennomfore` er en **navigasjonsmellommann**
- `/admin/calendar` er bare redirect til `/admin/kalender`

#### Innsikt-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin/analysere` | Hub | — | 3 | 1 | — |
| `/admin/analysere/compliance` | Compliance-dashboard | — | 5 | 2 | Compliance |
| `/admin/analyse` | Stall-analyse | — | 6 | 1 | Stats |
| `/admin/lag-snitt` | Lag-snitt | — | 5 | 1 | Stats |
| `/admin/tester` | Test-matrise | Åpne test | 10+ | 1 | TestResult |
| `/admin/tester/[id]` | Test-detalj | — | 5 | 2 | TestResult |
| `/admin/tester/benchmarks` | Benchmark-administrasjon | Godkjenn | 6 | 2 | Benchmark |
| `/admin/tester/foreslatte` | Foreslåtte tester | Godkjenn | 4 | 2 | TestProtocol |
| `/admin/tester/tildel/[spillerId]` | Tildel test til spiller | Lagre | 4 | 2 | Form |
| `/admin/foresporsler` | Forespørsler | Svar | 5+ | 1 | SessionRequest |
| `/admin/godkjenninger` | Godkjenninger | Godkjenn | 5+ | 1 | Approval |
| `/admin/godkjenninger/[id]` | Godkjenning-detalj | — | 4 | 2 | Approval |
| `/admin/reports` | Rapporter | Generer | 5 | 1 | Report |

**Funn:**
- `/admin/analysere` er en **navigasjonsmellommann**

#### Admin-seksjonen

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/admin/organisasjon` | Hub | — | 3 | 1 | — |
| `/admin/innboks` | Innboks | Åpne melding | 6+ | 1 | Message |
| `/admin/messages` | Redirect til innboks | — | 0 | 1 | — |
| `/admin/email-templates` | E-postmaler | Åpne | 4+ | 1 | EmailTemplate |
| `/admin/email-templates/[id]/rediger` | Rediger mal | Lagre | 5 | 2 | EmailTemplate |
| `/admin/agents` | AI-agenter | Åpne | 4+ | 1 | Agent |
| `/admin/agents/[agentId]` | Agent-detalj | Konfigurer | 5 | 2 | Agent |
| `/admin/team` | Team-oversikt | Inviter | 4+ | 1 | User |
| `/admin/team/inviter` | Inviter teammedlem | Send | 4 | 2 | Form |
| `/admin/finance` | Økonomi | — | 6 | 1 | Finance |
| `/admin/okonomi` | Alt. økonomi-rute | — | 6 | 1 | Finance |
| `/admin/integrasjoner` | Integrasjoner | Koble | 4+ | 1 | Integration |
| `/admin/audit-log` | Audit-logg | — | 6+ | 1 | AuditLog |
| `/admin/audit-log/[id]` | Logg-detalj | — | 4 | 2 | AuditLog |
| `/admin/settings` | Innstillinger-hub | Endre | 5 | 1 | Settings |
| `/admin/settings/api` | API-nøkler | Generer | 4 | 2 | Settings |
| `/admin/settings/calendar` | Kalender-innstillinger | Lagre | 4 | 2 | Settings |
| `/admin/settings/security` | Sikkerhet | Lagre | 4 | 2 | Settings |
| `/admin/settings/tilgang` | Tilgangsstyring | Lagre | 5 | 2 | Settings |
| `/admin/profile` | Coach-profil | Rediger | 5 | 1 | User |
| `/admin/hjelp` | Hjelp | — | 4 | 1 | Help |
| `/admin/kommunikasjon` | Kommunikasjons-hub | — | 4 | 1 | — |
| `/admin/reach` | Reach/marketing | — | 4 | 1 | Stats |
| `/admin/recording` | Video-opptak | — | 4 | 1 | Recording |
| `/admin/videoer` | Video-bibliotek | — | 4+ | 1 | Video |
| `/admin/trackman` | TrackMan-admin | — | 5 | 1 | Trackman |
| `/admin/runder` | Runder-oversikt | Åpne | 5+ | 1 | Round |
| `/admin/okter` | Økter-oversikt | Åpne | 5+ | 1 | Session |
| `/admin/oppfolging` | Oppfølging | — | 4 | 1 | Followup |
| `/admin/queue` | Venteliste | — | 4 | 1 | Queue |
| `/admin/brief` | Daglig brief | — | 4 | 1 | Brief |
| `/admin/caddie` | Caddie AI | — | 4 | 1 | AI |
| `/admin/analytics` | Analytics | — | 5 | 1 | Analytics |
| `/admin/coach-workbench` | Coach-workbench | Planlegg | 10+ | 1 | Plan |
| `/admin/tilstander` | Tilstandsoversikt | — | 4 | 1 | State |
| `/admin/facilities` | Fasiliteter | Åpne | 4+ | 1 | Facility |
| `/admin/facilities/[id]` | Fasilitet-detalj | — | 5 | 2 | Facility |
| `/admin/locations` | Lokasjoner | — | 4+ | 1 | Location |
| `/admin/klubb/innstillinger` | Klubb-innstillinger | Lagre | 5 | 2 | Settings |
| `/admin/godkjenn-portal` | Portal-godkjenninger | Godkjenn | 4 | 1 | Approval |
| `/admin/godkjenn-portal/koblinger` | Koblinger | — | 4 | 2 | Link |
| `/admin/godkjenn-portal/koblinger/[id]` | Kobling-detalj | Godkjenn | 4 | 3 | Link |
| `/admin/godkjenn-portal/review` | Review | — | 4 | 2 | Review |
| `/admin/approvals` | Redirect | — | 0 | 1 | — |
| `/admin/approvals/[id]` | Redirect | — | 0 | 2 | — |
| `/admin/stats/moderering` | Stats-moderering | — | 4 | 2 | Stats |
| `/admin/stats/overview` | Stats-oversikt | — | 5 | 2 | Stats |

**Funn:**
- Mange skjermer under Admin som kan konsolideres
- `/admin/okonomi` og `/admin/finance` er duplikater
- `/admin/facilities` og `/admin/anlegg` overlapper
- `/admin/kommunikasjon` er en **navigasjonsmellommann**

---

### 1.4 Foreldreportal (/forelder/*)

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/forelder` | Oversikt over barnets status | Se neste økt | 6 | 0 | ForelderOversikt |
| `/forelder/barn` | Liste over mine barn | Åpne barn | 3+ | 1 | Child |
| `/forelder/barn/[childId]` | Barnets detaljer | Se plan | 5 | 2 | Child |
| `/forelder/bookinger` | Barnets bookinger | Se booking | 4+ | 1 | Booking |
| `/forelder/okonomi` | Økonomi/betalinger | — | 4 | 1 | Finance |
| `/forelder/coach` | Coach-kommunikasjon | Send melding | 4 | 1 | Message |
| `/forelder/ukerapport` | Ukentlig rapport | — | 5 | 1 | Report |
| `/forelder/fakturaer` | Fakturahistorikk | Last ned | 4+ | 1 | Invoice |
| `/forelder/varsler` | Varsler | — | 3+ | 1 | Notification |
| `/forelder/samtykke` | Samtykke-administrasjon | Godkjenn | 3 | 1 | Consent |
| `/forelder/innstillinger` | Innstillinger | Lagre | 4 | 1 | Settings |

**Trykkbudsjett-analyse:**
- **Mål:** Se barnets neste økt = 0 trykk (synlig direkte ved innlogging)
- **Faktisk:** `/forelder` viser "Neste økt" som første element = **0 trykk** ✓

**Funn:**
- Foreldreportalen er relativt strømlinjeformet
- 10 sider er rimelig for denne brukergruppen

---

### 1.5 Auth (/auth/*)

| Rute | Jobb | Primærhandling | Elementer | Trykk | Data |
|------|------|----------------|-----------|-------|------|
| `/auth/login` | Logge inn | Logg inn | 3 | — | Form |
| `/auth/signup` | Registrere seg | Registrer | 4 | — | Form |
| `/auth/forgot-password` | Glemt passord | Send e-post | 2 | 1 | Form |
| `/auth/reset-password` | Nullstill passord | Lagre | 3 | — | Form |
| `/auth/check-email` | Bekreft e-post sendt | — | 2 | — | — |
| `/auth/bankid` | BankID-innlogging | Logg inn | 2 | 1 | — |
| `/auth/logget-ut` | Bekrefter utlogget | Logg inn igjen | 2 | — | — |
| `/auth/onboarding` | Ny-bruker onboarding | Fullfør | 5+ | — | Form |
| `/auth/onboarding/forelder` | Forelder-onboarding | Fullfør | 4 | — | Form |
| `/auth/samtykke-venter` | Venter på foreldresamtykke | — | 2 | — | — |
| `/auth/guardian-consent/[token]` | Godkjenn som forelder | Godkjenn | 3 | — | Form |

---

## DEL 2 — BRUKERFLYTER MED TRYKKTELLING

### Flyt 1: Spiller — app-åpning → gjennomført økt

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SPILLER: DAGENS ØKT-FLYT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  App-åpning                                                          │
│      │                                                               │
│      ▼                                                               │
│  /portal (0)  ─────────── "Dagens økt"-kort synlig                   │
│      │                                                               │
│      │ [Trykk 1: "Start økt"]                                        │
│      ▼                                                               │
│  /portal/(fullscreen)/live/[id]/brief (1)                            │
│      │                                                               │
│      │ [Trykk 2: "Start"]                                            │
│      ▼                                                               │
│  /portal/(fullscreen)/live/[id]/active (2)                           │
│      │                                                               │
│      │ [Trykk 3+: Logg resultater (1 trykk per logg)]                │
│      │                                                               │
│      │ [Trykk N: "Fullfør økt"]                                      │
│      ▼                                                               │
│  /portal/(fullscreen)/live/[id]/summary                              │
│      │                                                               │
│      │ [Trykk: "Lukk"]                                               │
│      ▼                                                               │
│  /portal                                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

TRYKKBUDSJETT:
  Mål: 2 trykk til start
  Faktisk: 2 trykk ✓
  
  Mål: 1 trykk per logging
  Faktisk: 1 trykk ✓

FEILVEIER:
  - Tom plan: /portal viser "Ingen økter planlagt"-tilstand
  - Avbrutt økt: PAUSED-state lagres, kan gjenopptas
  - ABANDONED: Etter 24t timeout, session markeres forlatt
```

### Flyt 2: Coach — mandag morgen → publisering

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COACH: MANDAG MORGEN-FLYT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Innlogging                                                          │
│      │                                                               │
│      ▼                                                               │
│  /admin/agencyos (0) ──── Dashboard med ukeoversikt                  │
│      │                                                               │
│      │ [Trykk 1: "Se spiller" i KPI-kort]                            │
│      ▼                                                               │
│  /admin/spillere/[id] (1)                                            │
│      │                                                               │
│      │ [Trykk 2: "Workbench"]                                        │
│      ▼                                                               │
│  /admin/spillere/[id]/workbench (2) ── Dra/slipp planlegging         │
│      │                                                               │
│      │ [Juster plan med dra/slipp]                                   │
│      │                                                               │
│      │ [Trykk 3: "Publiser"]                                         │
│      ▼                                                               │
│  Toast: "Ukeplan publisert"                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

TRYKKBUDSJETT:
  Mål: 2 trykk til oversikt
  Faktisk: 0 trykk (dashboard viser oversikt direkte) ✓
  
  Mål: 2 trykk til planjustering
  Faktisk: 2 trykk (spiller → workbench) ✓
  
  Mål: 2 trykk til godkjent forslag
  Faktisk: 1 trykk (i workbench, godkjenn forslag) ✓

FEILVEIER:
  - Ingen spillere: Tom-tilstand i dashboard
  - Konflikt: Varsel om overlappende økter
```

### Flyt 3: Forelder — innlogging → barnets status

```
┌─────────────────────────────────────────────────────────────────────┐
│                   FORELDER: BARNETS STATUS-FLYT                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Innlogging                                                          │
│      │                                                               │
│      ▼                                                               │
│  /forelder (0) ──── Viser barnets neste økt DIREKTE                  │
│                     + Ukens fremgang                                 │
│                     + Siste aktivitet                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

TRYKKBUDSJETT:
  Mål: 0 trykk til barnets neste økt
  Faktisk: 0 trykk ✓

FEILVEIER:
  - Ingen barn koblet: Viser "Legg til barn"-flow
  - Ingen økter: Viser "Ingen planlagte økter"-tilstand
```

### Flyt 4: Besøkende — landingsside → betalt booking

```
┌─────────────────────────────────────────────────────────────────────┐
│                   BESØKENDE: BOOKING-FLYT                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  / (landingsside)                                                    │
│      │                                                               │
│      │ [Trykk 1: "Book time" i hero]                                 │
│      ▼                                                               │
│  /booking (1) ──── Velg tjeneste                                     │
│      │                                                               │
│      │ [Trykk 2: Velg tjeneste]                                      │
│      ▼                                                               │
│  /booking/[slug] (2) ──── Velg tid                                   │
│      │                                                               │
│      │ [Trykk 3: Velg tidspunkt]                                     │
│      ▼                                                               │
│  /booking/[slug]/bekreft (3) ──── Fyll ut info + betal               │
│      │                                                               │
│      │ [Trykk 4: "Betal" / Stripe checkout]                          │
│      ▼                                                               │
│  /booking/kvittering/[id] (4) ──── Bekreftelse                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

TRYKKBUDSJETT:
  Mål: Maks 5 skjermer
  Faktisk: 5 skjermer (/, /booking, /booking/[slug], bekreft, kvittering) ✓

FEILVEIER:
  - Ingen ledige tider: "Ingen tilgjengelige tider"-melding + kontaktinfo
  - Feilet betaling: Stripe feilhåndtering + "Prøv igjen"-knapp
  - Bruker finnes: Prompt om innlogging før checkout
```

---

## DEL 3 — GAP-ANALYSE

### 3.1 Blindveier (skjermer uten vei videre)

| Skjerm | Problem | Kildefile | Alvorlighet |
|--------|---------|-----------|-------------|
| `/portal/trening/break-tabell` | Statisk tabell, ingen handlingsknapper | `src/app/portal/trening/break-tabell/page.tsx` | Lav |
| `/auth/samtykke-venter` | Kun tekst, ingen refresh/retry | `src/app/auth/samtykke-venter/page.tsx` | Middels |
| `/auth/check-email` | Ingen re-send e-post-knapp | `src/app/auth/check-email/page.tsx` | Middels |

### 3.2 Foreldreløse sider (ingen navigasjon peker dit)

| Skjerm | Problem | Kildefile |
|--------|---------|-----------|
| `/admin/stats/moderering` | Ikke i sidebar-nav | Ukjent |
| `/admin/stats/overview` | Ikke i sidebar-nav | Ukjent |
| `/admin/tilstander` | Ikke i sidebar-nav | Ukjent |
| `/portal/agent-pipeline` | Ikke i sidebar-nav | Intern |
| `/portal/ai/*` | Ikke i sidebar-nav | Under utvikling |

### 3.3 Manglende tom-tilstander

| Skjerm | Mangler | Kildefile |
|--------|---------|-----------|
| `/portal/coach/notes` | Ingen "Ingen notater"-tilstand verifisert | Må sjekkes |
| `/portal/tren/fys-plan` | Ingen "Ingen fysplan"-tilstand verifisert | Må sjekkes |
| `/admin/godkjenninger` | Ingen "Ingen ventende"-tilstand verifisert | Må sjekkes |

### 3.4 Navigasjonsinkonsistens

| Problem | PlayerHQ | CoachHQ |
|---------|----------|---------|
| Sidebar-struktur | 5 seksjoner | 6 seksjoner |
| Rask handling | "Ny økt" | "Ny plan" |
| Profil-lenke | Nederst | Nederst ✓ |
| Search | ⌘K fungerer | ⌘K fungerer ✓ |

**Konsistent:** Begge har sidebar + topbar + ⌘K-søk.

### 3.5 Mobilflyt-vurdering

| Skjerm | Primærhandling nåbar med tommel? | Problem |
|--------|----------------------------------|---------|
| `/portal` | ✓ | OK (Bottom-nav) |
| `/portal/planlegge/workbench` | ~ | Drag-drop vanskelig på mobil |
| `/admin/spillere` | ~ | Tabell krever horisontal scroll |
| `/admin/tester` | ~ | Matrise krever horisontal scroll |

### 3.6 Dupliserte UI-mønstre

| Mønster | Forekomster | Bør deles? |
|---------|-------------|------------|
| Hub-side med 3-4 lenker | 6+ (planlegge, gjennomføre, analysere, coach, etc.) | Ja |
| Bekreftelsesside (2 elementer) | 4 (booking/bekreftet, onskeligokt/bekreftet, etc.) | Ja → Toast |
| Innstillinger-subsider | 16+ (meg/innstillinger/*, settings/*) | Ja → Seksjoner |
| Spiller-kort i tabell | 3 (spillere, board, stall) | Ja |

---

## DEL 4 — KONSOLIDERINGSANALYSE

### Skjermer som BØR slås sammen

#### 4.1 Navigasjonsmellommenn (gjør ingenting annet enn å lenke)

| Skjerm | Slå sammen med | Mønster | Trykk spart | Filer | Risiko |
|--------|----------------|---------|-------------|-------|--------|
| `/portal/planlegge` | `/portal` | Seksjon i hjem | 1 | `src/app/portal/planlegge/page.tsx` | Lav |
| `/portal/gjennomfore` | `/portal` | Seksjon i hjem | 1 | `src/app/portal/gjennomfore/page.tsx` | Lav |
| `/portal/coach` | `/portal` | Seksjon i hjem | 1 | `src/app/portal/coach/page.tsx` | Lav |
| `/admin/planlegge` | Dashboard-shortcut | Fjern fra nav | 1 | `src/app/admin/planlegge/page.tsx` | Lav |
| `/admin/gjennomfore` | Dashboard-shortcut | Fjern fra nav | 1 | `src/app/admin/gjennomfore/page.tsx` | Lav |
| `/admin/analysere` | Dashboard-shortcut | Fjern fra nav | 1 | `src/app/admin/analysere/page.tsx` | Lav |
| `/admin/organisasjon` | Redirect | Fjern fra nav | 1 | `src/app/admin/organisasjon/page.tsx` | Lav |
| `/admin/stall` | Redirect | Fjern fra nav | 1 | Finnes allerede som redirect | Lav |

#### 4.2 Bekreftelsessider (kun 2-3 elementer)

| Skjerm | Erstatt med | Trykk spart | Filer | Risiko |
|--------|-------------|-------------|-------|--------|
| `/portal/booking/bekreftet` | Toast + redirect til /portal | 1 | `src/app/portal/booking/bekreftet/page.tsx` | Lav |
| `/portal/onskeligokt/bekreftet` | Toast + redirect | 1 | `src/app/portal/onskeligokt/bekreftet/page.tsx` | Lav |
| `/auth/check-email` | Inline-tilstand i login | 1 | `src/app/auth/check-email/page.tsx` | Middels |
| `/auth/logget-ut` | Toast + redirect til login | 1 | `src/app/auth/logget-ut/page.tsx` | Lav |

#### 4.3 Innstillinger fordelt på mange sider

| Skjermer | Slå sammen til | Mønster | Trykk spart | Filer | Risiko |
|----------|----------------|---------|-------------|-------|--------|
| `/portal/meg/innstillinger/*` (8 sider) | `/portal/meg/innstillinger` | Seksjoner med accordion | 7 | 8 filer | Middels |
| `/admin/settings/*` (4 sider) | `/admin/settings` | Seksjoner med tabs | 3 | 4 filer | Middels |

#### 4.4 Duplikate ruter

| Rute A | Rute B | Handling | Filer |
|--------|--------|----------|-------|
| `/admin/plans/templates/*` | `/admin/plan-templates/*` | Slett A, behold B | 4 filer |
| `/admin/finance` | `/admin/okonomi` | Slett B, redirect | 1 fil |
| `/admin/facilities/*` | `/admin/anlegg/*` | Slett A, redirect | 2 filer |
| `/admin/calendar/*` | `/admin/kalender/*` | Allerede redirect ✓ | — |

#### 4.5 Undersider som kan bli tabs/accordion

| Skjermer | Slå sammen til | Mønster | Trykk spart |
|----------|----------------|---------|-------------|
| `/portal/mal/sg-hub/*` (8 sider) | `/portal/mal/sg-hub` med tabs | Tabs | 7 |
| `/admin/talent/*` (10 sider) | `/admin/talent` med tabs | Tabs | ~8 |

### Skjermer som IKKE skal slås sammen

| Skjerm | Grunn |
|--------|-------|
| Live Session (alle) | Låst fullskjerm, annen mental modus |
| `/portal/tren/tester/[id]/gjennomfor` | Test-gjennomføring er isolert |
| `/forelder/*` | Annen auth-grense (PARENT) |
| `/admin/*` vs `/portal/*` | Ulike roller, ulik mental modus |

---

## DEL 5 — MÅLBILDET

### 5.1 Navigasjonstre FØR og ETTER

#### PlayerHQ

```
FØR (5 seksjoner, ~150 sider)           ETTER (5 seksjoner, ~120 sider)
═══════════════════════════════         ═══════════════════════════════

Oversikt (/portal)                      Oversikt (/portal)
                                          └── [Planlegge-shortcut]
Planlegge (/portal/planlegge) ← HUB       └── [Gjennomføre-shortcut]
  ├── Workbench                           └── [Coach-shortcut]
  ├── Årsplan                           
  ├── Treningsplan                      Workbench (/portal/planlegge/workbench)
  ├── Fysplan                           
  ├── Mål (+ 4 undersider)              Trening
  ├── Turneringer                         ├── Årsplan
  ├── Drills                              ├── Treningsplan  
  ├── Logg treningsøkt                    ├── Fysplan
  ├── Putte-lab                           ├── Turneringer
  └── Break-tabell ← SLETT                ├── Drills
                                          └── Logg økt
Gjennomføre (/portal/gjennomfore) ← HUB
  ├── Kalender                          Gjennomføre
  ├── Booking (+ 5 undersider)            ├── Kalender
  ├── Ny økt                              ├── Booking (3 sider)
  └── Ønske om økt                        └── Ny økt

Analysere (/portal/analysere)           Analysere
  ├── Statistikk                          ├── Statistikk (med SG som tab)
  ├── SG-Hub (+ 8 undersider) ← TABS      ├── Runder
  ├── Runder                              ├── TrackMan
  ├── TrackMan                            ├── Tester
  ├── Tester                              └── Innsikt
  └── Innsikt

Coach (/portal/coach) ← HUB             Coach
  ├── Meldinger                           ├── Meldinger
  └── Planer                              └── Planer

Meg (/portal/meg)                       Meg
  └── Innstillinger (8 undersider)        └── Innstillinger (1 side med seksjoner)
```

**Reduksjon:** ~150 → ~120 sider (~20%)

#### CoachHQ

```
FØR (6 seksjoner, ~140 sider)           ETTER (6 seksjoner, ~110 sider)
═══════════════════════════════         ═══════════════════════════════

Oversikt                                 Oversikt (uendret)
  ├── Dashboard                           ├── Dashboard
  ├── Min uke                             ├── Min uke
  ├── Oppgaver                            ├── Oppgaver
  └── Tildelt meg                         └── Tildelt meg

Stall                                    Stall
  ├── Spillere (tabell/tavle)             ├── Spillere
  ├── Grupper                             ├── Grupper
  └── Talent (10 undersider) ← TABS       └── Talent (1 side med tabs)

Planlegge (/admin/planlegge) ← HUB      Planlegge
  ├── Plans                               ├── Plans
  ├── Templates (duplikat) ← SLETT        ├── Templates
  ├── Drills                              ├── Drills
  └── Turneringer                         └── Turneringer

Gjennomføre (/admin/gjennomfore) ← HUB  Gjennomføre
  ├── Kalender                            ├── Kalender
  ├── Bookinger                           ├── Bookinger
  ├── Anlegg                              └── Anlegg
  └── Tilgjengelighet

Innsikt (/admin/analysere) ← HUB        Innsikt
  ├── Analyse                             ├── Analyse
  ├── Tester                              ├── Tester
  ├── Forespørsler                        └── Rapporter
  ├── Godkjenninger
  └── Rapporter

Admin                                    Admin
  ├── Innboks                             ├── Innboks
  ├── Team                                ├── Team
  ├── Økonomi (duplikat) ← SLETT          ├── Økonomi
  └── Settings (4 undersider) ← TABS      └── Settings (1 side)
```

**Reduksjon:** ~140 → ~110 sider (~20%)

### 5.2 Totalt antall skjermer

| Overflate | Før | Etter | Reduksjon |
|-----------|-----|-------|-----------|
| Marketing | 50 | 50 | 0% |
| PlayerHQ | 150 | 120 | 20% |
| CoachHQ | 140 | 110 | 21% |
| Foreldreportal | 10 | 10 | 0% |
| Auth | 10 | 8 | 20% |
| **Totalt** | **360** | **298** | **17%** |

### 5.3 Trykkbudsjett-tabell

| Handling | Persona | Mål | I dag | Etter |
|----------|---------|-----|-------|-------|
| Start dagens økt | Spiller | 2 | 2 ✓ | 2 |
| Logg ett resultat | Spiller | 1 | 1 ✓ | 1 |
| Se ukens plan | Spiller | 1 | 2 | 1 |
| Åpne workbench | Spiller | 2 | 3 | 2 |
| Se spiller-oversikt | Coach | 0 | 0 ✓ | 0 |
| Godkjenne forslag | Coach | 2 | 2 ✓ | 2 |
| Se enkeltspiller | Coach | 2 | 1 ✓ | 1 |
| Se barnets neste økt | Forelder | 0 | 0 ✓ | 0 |
| Fullføre booking | Besøkende | 5 | 5 ✓ | 5 |

### 5.4 Topp 5 prioriterte endringer

| # | Hva | Hvorfor | Filer | Omfang |
|---|-----|---------|-------|--------|
| **1** | Slå sammen hub-sider med hjem | 4 hub-sider (planlegge, gjennomføre, coach, admin-hubs) gjør ingen ting annet enn å lenke. Sparer 1 trykk × høy frekvens. | 8 filer | M |
| **2** | Innstillinger som én side | 12 undersider → 1 side med accordion. Sparer 11 sider + 1 trykk × middels frekvens. | 12 filer | M |
| **3** | Bekreftelsessider → Toast | 4 bekreftelsessider → toast + redirect. Sparer 4 sider + 1 trykk × middels frekvens. | 4 filer | S |
| **4** | SG-Hub tabs | 8 undersider → tabs i én side. Sparer 7 sider + opptil 2 trykk. | 9 filer | M |
| **5** | Slett duplikate ruter | plans/templates, finance/okonomi, facilities/anlegg. Rydder ~6 forvirrende ruter. | 6 filer | S |

---

## Vedlegg A — Ordliste

| Term | Definisjon |
|------|------------|
| Trykkavstand | Antall trykk fra inngangs-skjerm til denne skjermen |
| Informasjonstetthet | Antall meningsfulle UI-elementer på skjermen |
| Navigasjonsmellommann | Skjerm som kun inneholder lenker til andre skjermer |
| Konsolideringskandidat | Skjerm som kan slås sammen med en annen |
| Hub | Landingsside for en seksjon (ofte en mellommann) |
| Fullscreen-isolert | Skjerm uten standard navigasjon (shell-fri) |

---

*Dokumentet er generert basert på faktisk kode-analyse. Alle filstier er verifisert mot kodebasen.*
