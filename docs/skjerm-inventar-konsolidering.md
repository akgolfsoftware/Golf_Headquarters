# Skjerm-inventar + konsolidering — AK Golf HQ

> **Formål:** Kodeverifisert oversikt over alle 404 ruter (page.tsx) i appen, med duplikat-/legacy-analyse. Underlag for redesign-prosjektet: Claude Design skal designe det **konsoliderte** settet, ikke 404 ruter med duplikater.
> **Laget:** 17. juni 2026, fra 5 parallelle kartleggings-agenter mot faktisk kode. Status per rute: **EKTE** / **LEGACY-DUP** (eldre versjon av nyere skjerm) / **STUB** (tomt/placeholder) / **REDIRECT** / **DEMO-INTERN** (komponent-galleri, ikke produkt).

---

> ⚠️ **KORREKSJON (17. juni 2026) — les dette før du bruker tallene i «Sammendrag»:**
>
> **`/portal/mal/*` er LEVENDE — skal PORTES, ikke kuttes.**
> Grep-verifisert: 84 referanser til `/portal/mal` i kodebasen (komponenter, navigasjon, lenker). Treet er aktivt i bruk og inngår i det konsoliderte designscopet. Den opprinnelige påstanden «pensjoner HELE `/portal/mal/*`-treet (27 ruter)» i avsnitt «De viktigste konsoliderings-beslutningene» var feil — disse rutene skal **designes og portes** i redesignet, ikke fjernes.
> Konsekvens: antallet «Legacy/redirect/dublett (kuttes)» (~49) og «Ekte produkt-ruter igjen» (~340) i sammendragstabellen er feil. Korrekt scope inkluderer `/portal/mal/*`-rutene som ekte produkt-ruter.
>
> **`/admin/anlegg` er den levende ruten.**
> `/admin/locations` og `/admin/facilities` 301-redirecter til `/admin/anlegg` — ikke omvendt. Statuskolonnen for `/admin/anlegg` i tabellen under er derfor feil; den skal stå som **EKTE**, ikke LEGACY-DUP.
>
> Kilde: `docs/redesign-2026-06/audit/00-OPPSUMMERING.md`

---

## Sammendrag i tall

| | Antall | Kommentar |
|---|---|---|
| Ruter totalt (`page.tsx`) | **404** | Hele appen |
| Demo-/intern (ut av produkt-scope) | **~15** | Komponent-gallerier + wizard-demoer |
| Legacy/redirect/dublett (kuttes) | **~49** | Mest `/portal/mal/*`-treet + admin-redirects |
| **Ekte produkt-ruter igjen** | **~340** | Etter kutt |
| **Unike skjermer å designe** | **~150–180** | Når `[id]`/`[slug]`-detaljsider grupperes med malen sin |

**Konklusjon:** Vi designer **ett rent sett på ~150–180 skjermer**, ikke 404. Den største enkeltgevinsten er å pensjonere hele det gamle `/portal/mal/*`-treet i PlayerHQ (27 ruter), som er erstattet av `/portal/statistikk` + `/portal/analysere` + `/portal/trackman`.

---

## De viktigste konsoliderings-beslutningene

### PlayerHQ (`/portal`) — størst opprydding

1. **Pensjoner HELE `/portal/mal/*`-treet (27 ruter).** Dette er den gamle «Mål»-modulen (v10): mål-oversikt, baner, bygger, leaderboard, milepæler, runder + slag/shot-by-shot, sg-hub + 11 undersider, statistikk, trackman. **Erstattet av:** `/portal/statistikk` (SG/runder/trend), `/portal/analysere` (workbench-analyse), `/portal/trackman` (TrackMan).
2. **Fjern rene redirects:** `/portal/analyse` → `/portal/analysere`; `/portal/stats` → `/portal/statistikk`; `/portal/tren/ovelser*` → `/portal/drills`; `/portal/meg/innstillinger/eksport` → `.../personvern`.
3. **Slå sammen kalender:** `/portal/kalender` (årskalender) vs `/portal/tren/kalender` (ukekalender) → behold ÉN (anbef. ukefokusert, mobil-først).
4. **Vurder sammenslåing:** `/portal/statistikk/sammenlign` vs `/portal/talent/sammenligning` (samme radar/SG-delta-mønster).
5. **Avklar produkt:** `/portal/spiller/[spillerId]` ser ut som coach-funksjon liggende i spiller-treet — avklar om den hører hjemme i `/admin`.

### AgencyOS (`/admin`) — middels opprydding

1. **Fjern rene redirects:** `/admin` → `/admin/agencyos`; `/admin/calendar*` → `/admin/kalender`; `/admin/messages` → `/admin/innboks`; `/admin/approvals*` → `/admin/godkjenninger`; `/admin/plans/templates*` (4 stk) → `/admin/plan-templates`.
2. **Anlegg-hierarki:** behold `/admin/locations` (forelder) + `/admin/facilities` (barn); redirect `/admin/anlegg*` dit (norsk dublett).
3. **Cockpit-faner, ikke ruter:** `/admin/agencyos/okonomi` og `/admin/agencyos/spillere` er delmengder av `/admin/okonomi` og `/admin/spillere` — gjør dem til innebygde widgets/faner, ikke egne ruter.
4. **Navne-rydding (ikke kutt):** `/admin/analyse` + `/admin/analysere` + `/admin/analytics` er funksjonelt distinkte (stall-analyse / innsikt-hub / bento-dashboard) men forvirrende navngitt — døp om i redesign.
5. **Innboks-IA:** `/admin/innboks` + `/admin/kommunikasjon` + `/admin/queue` + `/admin/foresporsler` + `/admin/godkjenninger` bør samles til én «handlingssenter»-flate med faner (IA-beslutning i redesign).
6. **Kalender-visninger:** `/admin/kalender/maned` + `/admin/kalender/uke` → query-param (`?view=`) i stedet for egne ruter.

### Marketing (`/(marketing)`)

1. **Fjern dubletter:** `/(marketing)/suksess` = identisk `/(marketing)/cases` → behold `cases`. `/(marketing)/stats/blogg*` = duplikat av `/(marketing)/blogg` → konsolider.
2. **Stats er et EGET produkt:** `/(marketing)/stats/*` (~50 ruter, DataGolf-drevet offentlig database) er en separat plattform fra coaching-salgssidene. Mange er STUB (fremtidig), ikke duplikater. Bør behandles som eget design-spor.

### Forelder / Auth / Diverse

- **Rene — ingen duplikater.** Forelderportalen (11 ruter) er et fullverdig eget produkt (lesemodus, mobil-først, ekte data). Auth/onboard (14) er komplett. `/meg` (rot) er Anders' interne admin-assistent — IKKE dublett av `/portal/meg`.

---

## Det rene design-scopet (det Claude Design skal tegne)

Fem produkt-spor, prioritert:

| Spor | Unike skjermer (est.) | Tema i dag | Merknad |
|---|---|---|---|
| **PlayerHQ** (`/portal`) | ~55–65 | lyst, mobil-først | Kjernen. Etter `/mal`-kutt |
| **AgencyOS** (`/admin`) | ~45–55 | mørkt, desktop-først | Etter redirect-kutt |
| **Forelderportal** (`/forelder`) | ~11 | lyst | Lesemodus |
| **Auth/onboarding** | ~14 | lyst | Sentrerte kort + wizards |
| **Marketing** (`/(marketing)` u/stats) | ~15 | lyst, editorial | Mange STUB å fullføre |
| **Stats-plattform** (`/(marketing)/stats`) | ~30 | eget uttrykk | Eget produkt-spor, behandle separat |

---

## Full skjermtabell (alle 404 ruter)

> Per flate. `[id]`/`[slug]` = dynamisk detaljside (deler design med malen sin).

### PlayerHQ — `/portal` (EKTE-kjerne)
| Rute | Hva den er | Status |
|---|---|---|
| `/portal` | Spiller-dashboard «hva gjør jeg i dag» (KPI, kalender, coach-notater) | EKTE |
| `/portal/analysere` | Analyse-workbench (runder/trening/SG) | EKTE |
| `/portal/analysere/hull` | Analyse per hull | EKTE |
| `/portal/analyse` | → redirect til `/portal/analysere` | REDIRECT |
| `/portal/statistikk` | SG-data, snittscore, runder m/ trend | EKTE |
| `/portal/statistikk/[metric]` | Detalj per SG-metrikk | EKTE |
| `/portal/statistikk/sammenlign` | Sammenlign mot kohort/spiller | EKTE |
| `/portal/statistikk/runder/[runId]/del` | Del runde | EKTE |
| `/portal/stats` | → redirect til `/portal/statistikk` | REDIRECT |
| `/portal/trackman/[sessionId]` | TrackMan-sesjonsdetalj (ny) | EKTE |
| `/portal/booking` | Bookingoversikt | EKTE |
| `/portal/booking/ny` + `/ny/bekreft` | Book ny økt (wizard + bekreft) | EKTE |
| `/portal/booking/[bookingId]` | Booking-detalj | EKTE |
| `/portal/booking/anlegg/[anleggId]` · `/coach/[coachId]` · `/bekreftet` | Filtre + bekreftelse | EKTE |
| `/portal/gjennomfore` + `/[id]` | «Gjør jobben» dagens program + gjennomføring | EKTE |
| `/portal/ny-okt` | Bygg egen økt (Pro) | EKTE |
| `/portal/onskeligokt` + `/bekreftet` | Be om økt fra coach | EKTE |
| `/portal/planlegge` + `/workbench` | Planlegge → Workbench (responsiv) | EKTE |
| `/portal/kalender` | Årskalender (spiller) | EKTE (dubl. m/ tren/kalender) |
| `/portal/drills` + `/[id]` | Øvelsesbibliotek + detalj | EKTE |
| `/portal/tren/[sessionId]` + `/planlagt` | Økt-detalj / planlagt | EKTE |
| `/portal/tren/aarsplan` + `/periode/[id]/rediger` | Årsplan (Gantt) + rediger | EKTE |
| `/portal/tren/fys-plan` + `/[planId]` | Fysisk plan | EKTE |
| `/portal/tren/teknisk-plan` + `/[planId]` | Teknisk plan | EKTE |
| `/portal/tren/kalender` | Ukekalender (trening) | EKTE (dubl. m/ kalender) |
| `/portal/tren/tester` + `/katalog` + `/[testId]` + `/ny` + `/ny/egen` | Test-hub | EKTE |
| `/portal/tren/turneringer` + `/[id]` + `/ny` | Turneringer | EKTE |
| `/portal/tren/feiring/[planId]` | Feiring ved fullført plan | EKTE |
| `/portal/tren/ovelser` + `/[id]` | → redirect til `/portal/drills` | REDIRECT |
| `/portal/trening/break-tabell` · `/logg` · `/putte-laboratoriet` | Putting-verktøy + logg | EKTE |
| `/portal/coach` | Coach-hub (meldinger/notater/spørsmål/øvelser/videoer) | EKTE |
| `/portal/coach/melding` + `/[id]` + `/[id]/vedlegg` + `/ny` | Direktemelding coach (Pro) | EKTE |
| `/portal/coach/notes` + `/[noteId]` | Notater fra coach | EKTE |
| `/portal/coach/sporsmal/[id]` | Q&A med coach | EKTE |
| `/portal/coach/plans` + `/[planId]` + `/[planId]/ny-okt` + `/perioder` | Coach-planer | EKTE |
| `/portal/coach/ovelser` + `/ny` + `/[id]/rediger` | Coach-øvelser | EKTE |
| `/portal/coach/videoer` · `/coach/ai` · `/coach/[coachId]` | Videoer / AI / coach-profil | EKTE |
| `/portal/ai/foresla-drill` · `/foresla-turnering` · `/mal-bygger` | AI-assistenter | EKTE |
| `/portal/talent` + `/min-plan` + `/mitt-niva` + `/roadmap` + `/sammenligning` | Talent-hub (junior) | EKTE |
| `/portal/meg` (+ ~30 undersider) | Bruker-hub: abonnement, bookinger, dokumenter, helse, innstillinger, profil, sikkerhet, utstyrsbag, hjelp | EKTE |
| `/portal/utfordringer` + `/[id]` + `/ny` | Challenges | EKTE |
| `/portal/varsler` | Varsel-hub | EKTE |
| `/portal/reach` | Rekkevidde-analyse | EKTE |
| `/portal/spiller/[spillerId]` | Spiller-profil (avklar: coach-funksjon?) | EKTE |
| `/portal/agent-pipeline` | AI-pipeline (bakgrunn) | EKTE |
| **`/portal/(fullscreen)/live/[sessionId]`** + `/active` `/brief` `/logger` `/summary` `/tapper` | Live-økt fullskjerm | EKTE |
| `/portal/(fullscreen)/tren` | Fullskjerm-workbench | EKTE |
| `/portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor` | Test-gjennomføring fullskjerm | EKTE |

### PlayerHQ — `/portal/mal/*` (⚠️ KORREKSJON: LEVENDE — skal PORTES, ikke kuttes. Se korreksjons-notat øverst. 84 referanser i kodebasen.)
| Rute | Erstattet av | Status |
|---|---|---|
| `/portal/mal` | `/portal/statistikk` + `/portal/analysere` | LEGACY |
| `/portal/mal/baner` + `/[id]` | (nytt bane-konsept ved behov) | LEGACY |
| `/portal/mal/bygger` · `/goal/[id]` · `/leaderboard` · `/milepaeler` | Workbench/mål bor i Oversikt | LEGACY |
| `/portal/mal/runder` + `/[id]` + `/[id]/shot-by-shot` + `/[id]/slag` + `/ny` | `/portal/statistikk` | LEGACY |
| `/portal/mal/sg-hub` (+ `[club]`, benchmark, best-vs-now, coach/[spillerId](+[club]/equipment), conditions, equipment, strategy, yardage) | `/portal/analysere` + `/portal/statistikk` | LEGACY |
| `/portal/mal/statistikk` | `/portal/statistikk` | LEGACY |
| `/portal/mal/trackman` + `/[id]` | `/portal/trackman/[sessionId]` | LEGACY |

### AgencyOS — `/admin`
| Rute | Hva den er | Status |
|---|---|---|
| `/admin` | → redirect til `/admin/agencyos` | REDIRECT |
| `/admin/agencyos` | Cockpit (timeline, innboks, KPI, AI-forslag) | EKTE |
| `/admin/agencyos/caddie` + `/aktivitet` | AI-Caddie aktivitetslogg | EKTE |
| `/admin/agencyos/uka` | 7-dagers kanban | EKTE |
| `/admin/agencyos/live` | Mission Control (skall) | STUB |
| `/admin/agencyos/okonomi` | Økonomi-fane (delmengde av `/admin/okonomi`) | LEGACY-DUP |
| `/admin/agencyos/spillere` | Spiller-fane (delmengde av `/admin/spillere`) | LEGACY-DUP |
| `/admin/spillere` + `/[id]`(+`/profil` `/rediger` `/fremgang` `/tester` `/tildel-test` `/workbench` `/plan/[planId]`) + `/ny` | Stall-tabell + spiller-detalj/undersider | EKTE |
| `/admin/stall` | Stall-hub (navigasjon) | EKTE |
| `/admin/grupper` + `/[id]` | Grupper | EKTE |
| `/admin/coach-workbench` | Coach-workbench (faner) | EKTE |
| `/admin/kalender` + `/maned` + `/uke` | Kalender (uke/måned) | EKTE (slå maned/uke → param) |
| `/admin/calendar` + `/maned` | → engelsk dublett | REDIRECT/LEGACY |
| `/admin/bookinger` + `/ny` | Bookingtabell + manuell booking | EKTE |
| `/admin/availability` · `/kapasitet` | Tilgjengelighet + kapasitet-heatmap | EKTE |
| `/admin/locations` · `/facilities` + `/[id]` | Lokasjon (forelder) + fasilitet (barn) | EKTE |
| `/admin/anlegg` + `/[id]` | Levende rute for anlegg (⚠️ KORREKSJON: locations/facilities redirecter hit — ikke omvendt. Se korreksjons-notat øverst.) | EKTE |
| `/admin/services` | Tjenester | EKTE |
| `/admin/gjennomfore` + `/okter/[id]` | Gjennomføre-hub | EKTE |
| `/admin/okter` | Uke-oversikt økter | EKTE |
| `/admin/live/[sessionId]/brief` + `/active` + `/summary` | Coach live-økt | EKTE |
| `/admin/recording` · `/trackman` · `/videoer` | Opptak / TrackMan / videoer | EKTE |
| `/admin/innboks` | Meldingsflate (master-detalj) | EKTE |
| `/admin/messages` | → redirect til `/admin/innboks` | REDIRECT |
| `/admin/kommunikasjon` | Kommunikasjon-hub (faner) | EKTE |
| `/admin/queue` · `/oppfolging` | Oppfølgingskø (kanban) | EKTE |
| `/admin/foresporsler` | Forespørsler (booking-ønsker) | EKTE |
| `/admin/godkjenninger` + `/[id]` | Godkjenninger (plan/økt) | EKTE |
| `/admin/approvals` + `/[id]` | → redirect til godkjenninger | REDIRECT |
| `/admin/godkjenn-portal` (+ `/koblinger`(+`/[id]`), `/review`) | Design/rute-godkjennings-portal (QA) | EKTE |
| `/admin/board` | → redirect til spillere?view=tavle | REDIRECT |
| `/admin/plans` + `/[planId]` + `/new` | Treningsplaner (kanban) + detalj | EKTE |
| `/admin/plan-templates` + `/[id]`(+`/rediger` `/effectiveness`) + `/ny` | Plan-maler | EKTE |
| `/admin/plans/templates*` (4 stk) | → redirect til plan-templates | REDIRECT |
| `/admin/planlegge` | Planlegge-hub | EKTE |
| `/admin/teknisk-plan` + `/[spillerId]` | Tekniske planer | EKTE |
| `/admin/drills` + `/[id]`(+`/rediger`) + `/ny` | Drill-bibliotek | EKTE |
| `/admin/tester` + `/[id]` + `/benchmarks` + `/foreslatte` + `/tildel/[spillerId]` | Tester | EKTE |
| `/admin/analyse` | Stall-analyse (KPI/pyramide) | EKTE (navn-rydd) |
| `/admin/analysere` + `/compliance` | Innsikt-hub | EKTE (navn-rydd) |
| `/admin/analytics` | Bento-dashboard | EKTE (navn-rydd) |
| `/admin/lag-snitt` · `/runder` · `/tilstander` · `/reports` | Lag-snitt / runder / tilstander / rapporter | EKTE |
| `/admin/talent` (+ `/[playerId]`, `/radar`(+`/[playerId]`), `/sammenligning`, `/discovery`, `/kohort`, `/region`, `/ressurser`, `/wagr-benchmark`, `/wagr-import`) | Talent-modul | EKTE |
| `/admin/stats/overview` · `/moderering` | Stats-admin | EKTE |
| `/admin/caddie` | Co-agent-rammeverk | EKTE |
| `/admin/agents` + `/[agentId]` | AI-agenter | EKTE |
| `/admin/workspace` (+ `/notion`, `/oppgaver`(+`/[id]`), `/prosjekter`, `/tildelt-meg`) | Workspace (Notion-synk) | EKTE |
| `/admin/okonomi` | Økonomi-dashboard | EKTE |
| `/admin/organisasjon` | Admin-hub (8 kort) | EKTE |
| `/admin/settings` (+ `/api` `/calendar` `/security` `/tilgang`) | Innstillinger | EKTE (settings→organisasjon?) |
| `/admin/klubb/innstillinger` | Multi-klubb-oppsett | EKTE |
| `/admin/team` + `/inviter` | Coach-team | EKTE |
| `/admin/integrasjoner` · `/email-templates`(+`/[id]/rediger`) · `/audit-log`(+`/[id]`) | Integrasjoner / e-postmaler / audit | EKTE |
| `/admin/profile` · `/mer` · `/hjelp` · `/brief` · `/reach` | Profil / mer / hjelp / brief / reach | EKTE |

### Forelderportal — `/forelder` (11, alle EKTE)
| Rute | Hva den er |
|---|---|
| `/forelder` | Hjem: barnets fokus, økter, fakturaer |
| `/forelder/barn` + `/[childId]` | Barn-liste + barn-profil |
| `/forelder/bookinger` · `/fakturaer` · `/okonomi` | Bookinger / fakturaer / økonomi (lesemodus) |
| `/forelder/ukerapport` · `/varsler` · `/innstillinger` | Ukerapport / varsler / innstillinger |
| `/forelder/samtykke` | GDPR-samtykker per barn |
| `/forelder/coach` | Dialog med coach (kommer Q3) — STUB |

### Auth / Onboarding (14, EKTE unntatt BankID-stub)
| Rute | Hva den er |
|---|---|
| `/auth/login` · `/signup` · `/forgot-password` · `/reset-password` · `/check-email` · `/logget-ut` | Standard auth |
| `/auth/bankid` | BankID (post-beta) — STUB |
| `/auth/guardian-consent/[token]` · `/samtykke-venter` | Foreldresamtykke-flyt |
| `/auth/onboarding` + `/forelder` | Onboarding-wizards |
| `/onboard/coach` · `/onboard/klubb` | Coach-/klubb-onboarding |
| `/inviter/forelder/[token]` | Forelder-invitasjon |

### Marketing — `/(marketing)` u/stats
| Rute | Hva den er | Status |
|---|---|---|
| `/(marketing)` | Hjemmeside | EKTE |
| `/(marketing)/anlegg` + `/[slug]` | Anlegg-liste + detalj | EKTE |
| `/(marketing)/blogg` + `/[slug]` | Blogg | EKTE |
| `/(marketing)/booking` + `/[slug]`(+`/bekreft`) + `/kvittering/[bookingId]` | Booking-landing | EKTE/STUB |
| `/(marketing)/cases` | Suksesshistorier | EKTE |
| `/(marketing)/suksess` | → identisk `/cases` | LEGACY-DUP |
| `/(marketing)/coacher` + `/[slug]` | Coach-presentasjon | EKTE |
| `/(marketing)/coaching` | Coaching-pakker | EKTE |
| `/(marketing)/turneringer` + `/[slug]` | Turnering-liste | EKTE |
| `/(marketing)/cookies` `/faq` `/jobb` `/junior` `/kontakt` `/om-oss` `/personvern` `/playerhq` `/priser` `/treningsfilosofi` `/vilkar` | Sekundærsider | STUB (de fleste) |

### Stats-plattform — `/(marketing)/stats` (eget produkt, ~50 ruter)
| Rute | Hva den er | Status |
|---|---|---|
| `/stats` | Stats-hub (hero, KPI, bento) | EKTE |
| `/stats/pga` (+ drive-distance, fairway-pct, gir-pct, putt-explorer, putts-per-round, scoring-avg, sg-total, spillere(+`/[dg_id]`)) | PGA Tour-tall | EKTE |
| `/stats/spillere` + `/[slug]` | Norsk spillerdatabase | EKTE |
| `/stats/baner` + `/[slug]` | Banedatabase | EKTE |
| `/stats/turneringer` + `/[slug]`(+`/statistikk`) | Turneringer | EKTE |
| `/stats/sammenlign-spillere` · `/sg-sammenlign`(+`/start` `/resultat/[id]`) | Sammenligningsverktøy | EKTE |
| `/stats/verktoy` (+ avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator) | Kalkulatorer | EKTE |
| `/stats/blogg` + `/[slug]` | → duplikat av `/(marketing)/blogg` | LEGACY-DUP |
| `/stats/2026` `/aargang`(+`/[aar]`) `/klubber`(+`/[slug]`) `/leaderboards` `/min-progresjon` `/norske` `/quiz` `/regions`(+`/[slug]`) `/sok` `/tour/[slug]` `/uka` `/wrapped/[slug]` | Fremtidige sider | STUB |

### Demo/intern (UT av produkt-scope, ~15)
| Rute | Status |
|---|---|
| `/(internal)/design-system` · `/design-system-v2` | DEMO-INTERN |
| `/(internal)/demos/plan-bygger`(+`/[steg]`) · `/ny-okt/[steg]` · `/newplan/[steg]` · `/trackman-import/[steg]` | DEMO-INTERN |
| `/intern/komponenter` (+ agency-kit, daglig-brief, forelder, hull-analyse, inbox-tester, spiller-panel, team-bookinger) | DEMO-INTERN |

### Diverse
| Rute | Hva den er | Status |
|---|---|---|
| `/meg` | Anders' interne assistent-dashboard (ADMIN) | EKTE (ikke dublett av `/portal/meg`) |
| `/team-gfgk` | GFGK-lagpresentasjon (lokal data) | EKTE (enkel) |
| `/offline` | Offline-skjerm | EKTE |
