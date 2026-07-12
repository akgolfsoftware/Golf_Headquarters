# AgencyOS — komplett skjerm- og funksjonsinventar

Generert 2026-07-12 mot faktisk kode på main (141 page.tsx under `src/app/admin/`).
Formål: (1) hva hver skjerm ER og GJØR, (2) duplikater, (3) veien til komplett
funksjon med FÆRRE sider. Status: **v2** = ny chrome + v2-komponert innhold ·
**legacy** = v2-chrome (siden 2026-07-12) men eldre innhold · **redirect** ·
**stub** = statisk/tynn.

> Søsterdokumenter: `docs/MASTER-SKJERMPLAN.md` (haker per skjerm),
> `plans/legacy-portering-prioritet.md` (porterings-rekkefølge).

## A · Alle skjermer, per seksjon

### Oversikt (cockpit og daglig)

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin` | Inngangsport | Sender deg til cockpit | redirect → agencyos |
| `/admin/agencyos` | **Cockpit** — dagens kontrolltårn | Ser «trenger deg nå», dagens timer, innboks-sammendrag, stall-KPI; hopper videre | v2 ★ |
| `/admin/agencyos/uka` | Uke-kanban over bookinger per dag | Ser ukas belegg, oppretter booking | v2 |
| `/admin/agencyos/live` | Live «mission control» | Ser skallet — **statisk demo-data, ingen ekte integrasjon** | v2/stub |
| `/admin/brief` | Daglig AI-brief | Leser morgenbrief, følger agent-anbefalinger, booker/melder direkte | v2 |
| `/admin/handlingssenter` | Oppgave-kanban (Notion-synk `OppgaveCache`) | Ser/åpner oppgaver i kanban/tabell/liste + detaljpanel | v2 · **duplikat, se B3** |
| `/admin/queue` | **Oppfølgingskø** — hvem trenger samtale | Kanban risiko/følg med/sjekk inn/løst med hurtighandlinger | v2 ★ |
| `/admin/oppfolging` | Alias for queue (re-eksport av samme side) | Samme som queue | alias → gjør til redirect |
| `/admin/varsler` | Varselsenter — agent-forslag, signaler, uleste | Leser og kvitterer varsler | v2 |
| `/admin/mer` | Mobil «Mer»-lenkeliste (gammel chrome-rest) | Navigerer | legacy → slett (Mer-menyen i railen erstatter) |
| `/admin/hjelp` | Hjelpesenter | Leser statisk hjelpeinnhold | legacy/stub |
| `/admin/profile` | Egen coach-profil | Redigerer profil | legacy |

### Kommunikasjon

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/innboks` | **Meldinger** — master/detalj med samtale + kontekst | Leser, svarer (m/ AI-utkast) | v2 ★ |
| `/admin/innboks-epost` | E-post-innboks (post@akgolf.no) | Leser innkommende, godkjenner AI-utkast, sender | v2 |
| `/admin/godkjenninger` | Godkjenningskø (`PlanAction` fra agenter) | Godkjenner/avviser plan-endringer | v2 |
| `/admin/godkjenninger/[id]` | Én godkjenning i dybde | Godkjenn/avvis | legacy-innhold |
| `/admin/foresporsler` | Økt-forespørsler fra spillere (`SessionRequest`) | Godtar/avviser | legacy |
| `/admin/reach` | Engasjement per spiller (aktivitet, compliance, lest-status) | Ser hvem som glipper | legacy |
| `/admin/email-templates` (+`[id]/rediger`) | E-postmaler for agent-utsendelser | CRUD på maler | v2-liste, legacy-redigering |
| `/admin/kommunikasjon`, `/admin/messages`, `/admin/approvals` (+`[id]`) | Gamle adresser | — | redirects (behold) |

### Stall og talent

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/spillere` | **Stall-lista** — alle spillere m/ HCP, SG, status-heuristikk | Søker, filtrerer, åpner spiller; `?view=tavle` | v2 ★ |
| `/admin/agencyos/spillere` | Cockpit-variant av stall-lista | Unikt: **pakke/betaling-kolonner + «skylder»-filter** | v2 · **duplikat, se B2** |
| `/admin/spillere/ny` | Ny spiller-wizard | Oppretter spiller | legacy-innhold |
| `/admin/spillere/[id]` | **Spiller 360°** | Ser alt om spilleren, hurtighandlinger (melding/plan/økt) | v2 ★ |
| `/admin/spillere/[id]/analyse` | Dyp analyse (SG-lekkasje, diagnose) | Utforsker årsaksfunn | v2 ★ |
| `/admin/spillere/[id]/workbench` | **Coach-Workbench** — planlegging for spilleren | Bygger uke/måned/år-plan, drag-and-drop, publiserer | v2 ★ |
| `/admin/spillere/[id]/plan` (+`/[planId]`) | Planoversikt/detalj for spilleren | Ser plan m/ periodisering, drills, effekt | v2 |
| `/admin/spillere/[id]/fremgang` | Trening-vs-SG-korrelasjon | Ser trend | legacy |
| `/admin/spillere/[id]/tester` | Spillerens testhistorikk | Ser resultater/delta | v2 |
| `/admin/spillere/[id]/profil`, `/rediger`, `/tildel-test` | Personalia / rediger / test-tildeling | Skjemaer | legacy |
| `/admin/grupper` (+`[id]`, `[id]/timeplan`) | Grupper m/ medlemmer, plan, timeplan | Oppretter gruppe, redigerer timeplan, dupliserer uker | v2 |
| `/admin/talent` | Talent-terminal (radar + persentil + H2H) | Sammenligner talenter | legacy · **overlapp, se B5** |
| `/admin/talent/radar` | **Talent-radar** — rank, trend, pyramide per talent | Følger utviklingen | v2 ★ |
| `/admin/talent/discovery` | Scout-feed (spillere utenfor talent-sporet) | Legger til i talent-tracking | legacy |
| `/admin/talent/sammenligning` | Inntil 4 spillere side om side | Sammenligner | legacy |
| `/admin/talent/kohort`, `/region`, `/ressurser`, `/wagr-benchmark`, `/wagr-import` | Kohort/region/ressursbibliotek/WAGR | Nisjeverktøy for talent-sporet | legacy (wagr-import «Synk nå» er **død knapp**) |
| `/admin/stall`, `/admin/board` | Gamle adresser | — | redirects (behold) |

### Planlegge

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/planlegge` | **Planlegge-inngangen** — spillervelger → Workbench | Velger spiller å planlegge for | v2 ★ |
| `/admin/plans` (+`[planId]`) | Alle treningsplaner (kanban utkast/aktiv/fullført) | Ser planer, åpner detalj | v2 |
| `/admin/plans/new` | Gammel plan-bygger | — | legacy · vurder sletting (Workbench er kanon) |
| `/admin/plan-templates` | **Plan-maler** (36 godkjente maler m/ bruk/effekt) | Åpner/lager maler | v2 |
| `/admin/plan-templates/ny`, `[id]`, `[id]/rediger`, `[id]/effectiveness` | Mal-CRUD + effektmåling (volum-linje, masseredigering) | Bygger/justerer maler | legacy-innhold |
| `/admin/drills` (+`ny`, `[id]`, `[id]/rediger`, `/forslag`) | **Drill-bibliotek** (930 drills) + AI-forslag-kø | Filtrerer, lager, godkjenner AI-drills | legacy-innhold |
| `/admin/teknisk-plan` (+`[spillerId]`) | Tekniske planer per L-fase (P1–P10) | Ser/lager tekniske mål | legacy |
| `/admin/okter` | Ukas planlagte økter på tvers av stallen | Ser belastning | legacy · **overlapp, se B6** |
| `/admin/tournaments` (+`ny`, `[id]`, `dubletter`) | Turneringer stallen er påmeldt | Fellesmelding per turnering, rydder dubletter | hub v2-aktig, resten legacy |
| `/admin/coach-workbench` | Prototype | — | **slett** (planlegge/workbench er kanon) |
| `/admin/plans/templates/*` | Gamle mal-adresser | — | redirects (behold) |

### Gjennomføre

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/kalender` (+`/maned`) | **Kalenderen** — uke/dag + måned | Navigerer, oppretter booking/økt | v2 ★ |
| `/admin/bookinger` (+`[id]`, `ny`) | **Bookinger & kapasitet** — KPI, heatmap, liste + 5-stegs ny-booking | Bekrefter/avviser, oppretter, eksporterer | v2 ★ |
| `/admin/gjennomfore` (+`okter/[id]`) | Daglig drift-hub + økt-detalj | Registrerer/ferdigstiller økter | v2 |
| `/admin/live/[sessionId]/brief`, `/active`, `/summary` | **Live-økt coach-flyt** (før/under/etter) | Kjører økta live med spilleren | legacy — **P1-port** |
| `/admin/availability` | Tilgjengelighet (åpne booking-dager) | Setter tilgjengelighet («Synk» er **død knapp**) | legacy |
| `/admin/anlegg` | Anlegg og fasiliteter | Administrerer lokasjoner | legacy |
| `/admin/services` | Tjenester og priser | CRUD tjenester | legacy |
| `/admin/recording` | Økt-opptak (Deepgram-pipeline) | Tar opp, ser analyser | legacy |
| `/admin/trackman` | TrackMan-økter på tvers | Ser importer | legacy |
| `/admin/kapasitet`, `/admin/calendar/*`, `/admin/kalender/uke` | Gamle adresser | — | redirects (behold) |

### Innsikt

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/analyse` | **Stall-analyse** — KPI + pyramidefordeling + per gruppe | Ser stallen samlet, klikker til lag-snitt | v2 ★ |
| `/admin/analysere` | Innsikt-hub (lenke-kort) | Navigerer | legacy · vurder sletting (nav-en dekker) |
| `/admin/analysere/compliance` | Plan-etterlevelse på tvers | Ser hvem som følger plan | v2 |
| `/admin/lag-snitt` | Pyramide-fordeling per gruppe (full flate) | Sammenligner grupper | legacy |
| `/admin/tester` (+`benchmarks`, `foreslatte`, `tildel/*`) | Test-senteret + NGF-fasiter + forslag + tildeling | Registrerer, godkjenner, tildeler | blandet |
| `/admin/reports` | Rapporter (6 typer, CSV) | Genererer/laster ned | v2 |
| `/admin/runder` | Alle runder på tvers | Søker, åpner | v2 |
| `/admin/risiko` | Belastnings-/risikokart for stallen | Ser hvem som er i faresonen | legacy |
| `/admin/tilstander` | Design-katalog av økt-tilstander | **Ingenting — statisk demo** | stub · slett eller flytt til docs |
| `/admin/stats/overview`, `/stats/moderering` | Offentlig-stats-admin (eget domene) | Modererer public stats | legacy/stub |

### Drift og system

| Rute | Hva den er | Hva du gjør der | Status |
|---|---|---|---|
| `/admin/agencyos/okonomi` | **Økonomi** — MRR, inntektsgraf, utestående, abonnement | Følger pengene (ADMIN) | v2 ★ (kanonisk; okonomi+finance redirecter hit) |
| `/admin/workspace` (+`tildelt-meg`, `oppgaver`, `prosjekter`, `notion`) | Min uke / oppgaver / prosjekter / Notion-synk | Styrer eget arbeid | blandet · **duplikat, se B3/B4** |
| `/admin/agencyos/caddie` (+`dashbord`, `aktivitet`) | **Caddie AI** — chat, proaktive utkast, aktivitetslogg | Chatter, godkjenner utkast | v2 (ADMIN) |
| `/admin/agents` (+`[agentId]`) | AI-agentene — status, kjøringer, manuell trigger | Overvåker/trigger agenter | v2-detalj, legacy-liste |
| `/admin/agenter`, `/admin/ai`, `/admin/agent-team`, `/admin/prosjekter` | Kommando-senterets AI-verktøy (flermodell-chat, kode-økter, team-runs, KommandoProject) | Kjører AI-arbeid (ADMIN) | legacy · **duplikat, se B4** |
| `/admin/settings` (+`api`, `calendar`, `security`, `tilgang`) | Innstillinger (org/team/tilgang/API/kalender/2FA) | Konfigurerer | legacy |
| `/admin/team` (+`inviter`) | Coach-teamet | Inviterer coacher | legacy |
| `/admin/organisasjon` | Org-hub (lenke-kort) | Navigerer | legacy · vurder sletting |
| `/admin/klubb/innstillinger` | Klubb-oppsett per lokasjon | Redigerer klubber | legacy |
| `/admin/integrasjoner` | Integrasjonsstatus (Google/Stripe/Notion/…) | Kobler til | legacy |
| `/admin/audit-log` | Siste 50 hendelser | Ser logg | legacy |
| `/admin/caddie`, `/admin/finance`, `/admin/okonomi` | Gamle adresser | — | redirects (behold) |

## B · Duplikater og veien til FÆRRE sider

**Allerede konsolidert (ferdig):** Økonomi (okonomi+finance → agencyos/okonomi) ·
Bookinger+kapasitet · Caddie-adressene · Plan-mal-adressene (plans/templates→plan-templates) ·
Workbench-adressene (coach-workbench+planlegge→spillere/[id]/workbench) ·
kalender-aliasene · innboks-aliasene (messages/kommunikasjon) · stall/board→spillere.

**Gjenstående konsolideringer (komplett funksjon, færre sider):**

1. **B1 · queue vs oppfolging** — samme side på to URL-er (re-eksport).
   → Gjør `/admin/oppfolging` til ren redirect. Null funksjonstap. *(triviell)*
2. **B2 · spillere vs agencyos/spillere** — to stall-lister.
   → Flytt pakke/betaling-kolonnene og «skylder/abonnent»-filteret inn i
   `/admin/spillere`, gjør cockpit-varianten til redirect. *(liten)*
3. **B3 · handlingssenter vs workspace/oppgaver** — to flater over samme
   OppgaveCache (Notion). → Velg `/admin/handlingssenter` som kanonisk (har
   detaljpanel + 3 visninger), la workspace/oppgaver redirecte; flytt
   «ny oppgave» og kalender-visningen over først. *(middels)*
4. **B4 · prosjekter vs workspace/prosjekter** — KommandoProject (AI) vs
   ProsjektCache (Notion) — to «Prosjekter» i samme app. → Samle under
   workspace/prosjekter med kilde-fane; verifiser agent-team-avhengigheten
   først. *(middels)*
5. **B5 · talent vs talent/radar** — begge viser radar per talent.
   → talent/radar er kanonisk; flytt H2H-panelet fra talent inn dit, redirect.
   *(liten)*
6. **B6 · okter vs kalender/uka** — økt-belastning vs bookinger er ulike data,
   men tre uke-flater er én for mye. → Gjør «Økter» til en visnings-fane i
   kalenderen på sikt. *(større, ta ved v2-port av okter)*
7. **Hubber som nav-en har overflødiggjort:** `/admin/analysere` (hub),
   `/admin/organisasjon` (hub), `/admin/mer` (mobil-rest), `/admin/plans/new`
   (Workbench er kanon), `/admin/tilstander` (statisk katalog),
   `/admin/coach-workbench` (prototype). → Redirect/slett alle seks. *(triviell)*

**Netto effekt når B1–B7 er gjort:** ~14 færre reelle flater, null tapt funksjon,
og hver funksjon har ÉN adresse. Døde knapper som må kobles eller fjernes:
wagr-import «Synk nå», availability «Synk».

## Vedlikehold

Ved skjerm-endring: oppdater raden her + i MASTER-SKJERMPLAN.md i samme commit.
