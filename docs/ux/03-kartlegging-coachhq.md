# Vedlegg 03 — Kartlegging: AgencyOS (CoachHQ, `/admin/*`)

> Detaljert Del 1-rutetabell for coach-/admin-overflaten. Hører til
> [docs/ux-arkitektur.md](../ux-arkitektur.md). ~139 `page.tsx`-filer.

**Auth:** `AdminShell` gater `requirePortalUser({allow:["ADMIN","COACH"]})` på hele `/admin`. Inngang =
`/admin` → redirect → `/admin/agencyos` (0 trykk).

**Tre nav-flater (kritisk):**
- **Desktop-sidebar** = `agencyos-sidebar.tsx` (lister kun et UTVALG ruter).
- **Mobil-skuff** = `mobile-drawer.tsx` (lister VESENTLIG flere — inkl. hubene).
- **⌘K-søk** = `global-search-modal.tsx`.
- **`admin/sidebar.tsx` er DØD** (importert ingensteds — verifisert).

Konsekvens: ruter i mobil-skuffen men ikke desktop-sidebaren er **«MOBIL-ONLY»** (usynlige på desktop).
Cockpiten (`agency-cockpit.tsx`) lenker kun ut til `/admin/foresporsler` og rendrer IKKE fanenavet
`_tab-nav.tsx` → agencyos-fanesettet er foreldreløst. Trykk: sidebar-leaf bak gruppe som må utvides = 2.

---

## A) Operasjonell halvdel (Dashboard, Stall, Planlegge, Gjennomføre)

| Rute | Ene jobb | Primærhandling | Trykk | Datakilder | Nav inn |
|---|---|---|---|---|---|
| `/admin/agencyos` | Daglig cockpit: timeline + innboks + KPI | Åpne forespørsel | 0 | loadDailyBrief | inngang/sidebar |
| `/admin/agencyos/{live,uka,okonomi,spillere}` | Cockpit-faner (live/belegg/betaling/roster) | varierer | **∞ (foreldreløs)** | payment/booking/user | _tab-nav (urendret) |
| `/admin/agencyos/caddie`(+`/aktivitet`) | AI-caddie-chat + agent-logg | Send melding | **∞** | agentRun | caddie self |
| `/admin/workspace` | Workspace-landing (sample) | Til oppgaver | **∞** (ikke i sidebar) | getTasksForUser (Notion) | — |
| `/admin/workspace/oppgaver`(+`/[id]`) | Oppgave-liste/kanban/kalender | Ny oppgave | 2 | Notion | sidebar, workspace |
| `/admin/workspace/{prosjekter,tildelt-meg,notion}` | Prosjekter / mine aksjoner / Notion-synk | varierer | 2 / **∞** | Notion, planAction | sidebar (tildelt-meg) |
| `/admin/brief` | Morgenbrief (full) | (lese) | **∞** (kun ⌘K) | planAction | global-search |
| `/admin/queue` + `/admin/oppfolging` | Oppfølgingskø (identisk, re-eksport) | Følg opp | **∞** | user | — |
| `/admin/stall` | Stall-hub (kort) | Til spillere | **∞** (ikke i sidebar) | — | — |
| `/admin/spillere`(+`/ny`) | Alle spillere (tabell/tavle) + opprett | Åpne spiller | 2–3 | user, booking | sidebar, stall |
| `/admin/spillere/[id]`(+`/fremgang`,`/profil`,`/rediger`,`/tester`,`/tildel-test`,`/plan/[planId]`,`/workbench`) | Spiller-profil hub + faner + workbench | Åpne workbench | 3–5 (workbench=1 via sidebar) | user, round, testResult, trainingPlan | spillere |
| `/admin/grupper`(+`/[id]`) | Grupper + detalj + fellesmelding | Fellesmelding | 2–3 | group | sidebar, stall |
| `/admin/talent` | Talent-hub | Til radar | **∞** (ikke i sidebar) | talentTracking | — |
| `/admin/talent/radar`(+`/[playerId]`) | Talent-radar + detalj | Åpne spiller | 2–3 | talentTracking | sidebar, stall |
| `/admin/talent/{discovery,kohort,region,ressurser}` | Talent-undersider | varierer | **∞** (kun via hub) | talentTracking | talent-hub |
| `/admin/talent/sammenligning` | Multi-spiller sammenligning | (lese) | 2 | loadMultiCompare | sidebar |
| `/admin/talent/{wagr-benchmark,wagr-import,[playerId]}` | WAGR + spiller-detalj | Importer | 2 / **∞** | wagrSnapshot | sidebar (import) |
| `/admin/planlegge` | Planlegge-hub (8 kort) | Til plans | **∞** (ikke i sidebar) | — | — |
| `/admin/plans`(+`/new`,`/[planId]`) | Treningsplaner + wizard + detalj | Ny plan | 2–3 | trainingPlan, exerciseDefinition | sidebar, planlegge |
| `/admin/plans/templates*` | **Redirect → /admin/plan-templates** | — | — | — | (legacy) |
| `/admin/plan-templates`(+`/ny`,`/[id]`(+`/rediger`,`/effectiveness`)) | Plan-maler | Ny mal | 2–4 | planTemplate | sidebar, plans |
| `/admin/drills`(+`/ny`,`/[id]`(+`/rediger`)) | Drill-bibliotek | Ny drill | 2–4 | exerciseDefinition | sidebar, planlegge |
| `/admin/coach-workbench` | Generisk coach-workbench (fallback) | Coach-handling | 1 (sidebar) | user m.fl. | sidebar (fallback) |
| `/admin/teknisk-plan`(+`/[spillerId]`) | Teknisk-plan-oversikt + per spiller | Åpne spiller | **∞** (kun planlegge) | planTemplate, user | planlegge |
| `/admin/gjennomfore` | Gjennomføre-hub (8 kort) | Til kalender | **∞** (ikke i sidebar) | — | — |
| `/admin/gjennomfore/okter/[id]` | Økt-detalj | (lese) | (via?) | booking, facility | — |
| `/admin/kalender`(+`/maned`) | Uke-/måned-kalender | Ny økt | 2–3 | loadWeekCalendar | sidebar |
| `/admin/kalender/uke`, `/admin/calendar`(+`/maned`) | **Redirects → /admin/kalender** | — | — | — | (legacy) |
| `/admin/bookinger`(+`/ny`) | Booking-liste + ny | Ny booking | 2–3 | booking | sidebar, gjennomfore |
| `/admin/anlegg`(+`/[id]`) | Anlegg (location-grid) + detalj | Åpne anlegg | 2–3 | location | sidebar, gjennomfore |
| `/admin/facilities`(+`/[id]`), `/admin/locations` | **Redirects → /admin/anlegg** (skyggefiler) | — | — | location | (legacy) |
| `/admin/availability` | Coach-tilgjengelighet | Sett tider | 2 | coachAvailability | sidebar, gjennomfore |
| `/admin/services` | Tjenester | Ny tjeneste | 2 | serviceType | sidebar, gjennomfore |
| `/admin/okter` | Økt-bibliotek | Åpne økt | **∞** (kun planlegge) | trainingPlanSession | planlegge |
| `/admin/recording` | Opptak/sessionRecording | Last opp | **∞** | sessionRecording | — |
| `/admin/trackman` | TrackMan-økter (admin) | Åpne økt | **∞** (gjennomfore/⌘K) | trackManSession | gjennomfore |

---

## B) System + Analyse-halvdel (Analyse, Innboks, System/Admin)

| Rute | Ene jobb | Primærhandling | Trykk | Datakilder | Nav inn |
|---|---|---|---|---|---|
| `/admin/analysere`(+`/compliance`) | Innsikt-hub + compliance | Velg underflate | 1 (mobil) / 2 | actions, loadComplianceData | **MOBIL-ONLY** |
| `/admin/analyse` | Stall-analyse «Stallen i tall» | Klikk gruppe → lag-snitt | 2 (mobil) | TrainingPlanSession, Round, User | sidebar + mobil |
| `/admin/analytics` | **Redirect → /admin/analysere** (fila har levende kode = dødvekt) | — | — | — | (skygget) |
| `/admin/lag-snitt` | Pyramide per gruppe | (visning) | 1 | Group→members→Session | sidebar, mobil |
| `/admin/tester`(+`/[id]`,`/benchmarks`,`/foreslatte`,`/tildel/[spillerId]`) | Test-resultatliste + benchmark-synk + forslag | Ny test / synk / tildel | 1–2 | testSession, testResult, benchmark-sync | sidebar, mobil, ⌘K |
| `/admin/reports` | 6 rapport-tiles + CSV-eksport | Generer / ny rapport | 1 | counts + CSV-API | sidebar System, mobil, ⌘K |
| `/admin/runder` | Alle runder på tvers av stall | Søk/filtrer | 2 (mobil) | Round | **MOBIL-ONLY** analysere-hub |
| `/admin/stats/{overview,moderering}` | Stats-app admin + modereringskø | (admin) | **FORELDRELØS** | User, Tournament / **stub** | **INGEN** |
| `/admin/tilstander` | Økt-livssyklus referansekart | (statisk) | 2 (mobil) | **hardkodet** | **MOBIL-ONLY** |
| `/admin/foresporsler` | Booking-ønsker fra spillere | Godta/avvis | 1 | sessionRequest | sidebar Innboks, topbar |
| `/admin/innboks` | Meldings-master-detalj + svar | Send melding | 1 (⌘K)/mobil | meldingstråder | mobil, ⌘K |
| `/admin/messages` | **Redirect → /admin/innboks** | — | — | — | (legacy) |
| `/admin/godkjenninger`(+`/[id]`) | PlanAction-godkjenningskø + detalj | Godkjenn/avvis | 1–2 | planAction (PENDING) | sidebar Innboks, ⌘K |
| `/admin/approvals`(+`/[id]`) | **Redirect → /admin/godkjenninger** | — | — | — | (legacy) |
| `/admin/godkjenn-portal`(+`/review`,`/koblinger`(+`/[id]`)) | Intern QA: 142 PlayerHQ-ruter vs design | Åpne review | **FORELDRELØS** | approval (PORTAL_ROUTES) | **INGEN** |
| `/admin/kommunikasjon` | Komm-hub (innboks/maler/notion) | Velg fane | 1 (mobil) | (navigasjon) | **MOBIL-ONLY** |
| `/admin/reach` | Spiller-engasjement-scoring | (visning) | **FORELDRELØS** | User-aggregat | **INGEN** |
| `/admin/organisasjon` | Admin-hub (org/team/tilgang/agents) | Velg underflate | 1 (mobil) | (navigasjon) | **MOBIL-ONLY** |
| `/admin/email-templates`(+`/[id]/rediger`) | E-postmal-CRUD + editor | Ny mal / rediger | 2–3 (mobil) | emailTemplate | **MOBIL-ONLY** |
| `/admin/agents`(+`/[agentId]`) | AI-agent-oversikt + config | Manuell trigger | 2–3 (mobil) | AuditLog (agent.*) | **MOBIL-ONLY** |
| `/admin/finance` | **Redirect → /admin/okonomi** | — | — | — | (legacy) |
| `/admin/okonomi` | Økonomi-dashboard | (visning) | **FORELDRELØS*** | subscriptions/payments | kun via finance-redirect |
| `/admin/integrasjoner` | Tredjepart-status (Stripe/Notion++) | (visning) | 2 (mobil) | counts/config | **MOBIL-ONLY** |
| `/admin/audit-log`(+`/[id]`) | Hendelseslogg + detalj | Eksporter JSON | 2–3 (mobil) | auditLog | **MOBIL-ONLY** |
| `/admin/settings`(+`/api`,`/calendar`,`/security`,`/tilgang`) | Admin: org & tilgang (faner) | Velg fane | 1–2 | location, user, apiKey, cbac | sidebar System, topbar |
| `/admin/team`(+`/inviter`) | Team & roller + inviter | Inviter coach | 2–3 (mobil) | user (coachedGroups) | **MOBIL-ONLY** |
| `/admin/profile` | Coach egen profil | Rediger | **FORELDRELØS** | user | mobil-hub + `/admin/meg`-redirect |
| `/admin/hjelp` | Hjelpesenter (statisk) | Søk/kontakt | **FORELDRELØS** | statisk | **INGEN** |
| `/admin/klubb/innstillinger` | Multi-klubb setup | Rediger klubb | 2 (mobil) | location (+stub) | **MOBIL-ONLY** |
| `/admin/kapasitet` | Utnyttelse-heatmap | Eksporter | **FORELDRELØS** | bookinger/availability | kun fra gjennomfore (selv mobil-only) |
| `/admin/videoer` | Økt-video-bibliotek | Last opp | **FORELDRELØS** | sessionVideo | kun fra planlegge (selv mobil-only) |
| `/admin/tournaments`(+`/ny`,`/[id]`,`/dubletter`) | Turneringer stallen spiller + wizard + merge | Ny turnering | 1–2 (mobil) | tournamentEntry, tournament | mobil-drawer |

\* okonomi nås kun via `/admin/finance`-redirect, ingen direkte nav-lenke.

---

## Funn — AgencyOS

### Redirects (next.config.ts + in-page)
`/admin`→`agencyos`; `/admin/board`→`spillere?view=tavle`; `calendar`(+maned)→`kalender`;
`facilities`(+id)+`locations`→`anlegg`; `plans/templates*`→`plan-templates`; `analytics`→`analysere`;
`messages`→`innboks`; `approvals`(+id)→`godkjenninger`; `finance`→`okonomi`; `audit`→`audit-log`;
`meg`→`profile`; `capacity`→`kapasitet`; `elever`→`spillere`; `groups`→`grupper`; `bookings`→`bookinger`.

### Skyggekode (page.tsx finnes, men redirect serverer aldri)
`admin/facilities/`, `admin/locations/`, `admin/analytics/page.tsx` — verifisert. Slett (M1, M4).
`admin/sidebar.tsx` — død komponent, slett (M6).

### Foreldreløse (hovedfunn)
- **Helt isolerte:** `stats/overview`, `stats/moderering` (stub-data), `reach`, `hjelp`,
  `godkjenn-portal/*`, `queue`, `oppfolging`, `brief`, `recording`, `locations`.
- **Via foreldreløs forelder:** `kapasitet`, `videoer`, `okonomi`, `profile`.
- **Desktop-foreldreløse (MOBIL-ONLY, 13):** `analysere`, `organisasjon`, `kommunikasjon`, `runder`,
  `tilstander`, `email-templates`, `agents`, `integrasjoner`, `audit-log`, `team`, `klubb/innstillinger`,
  `tournaments`, + cockpit-fanesett (5).
- **Hub-foreldreløse (~10):** `okter`, `teknisk-plan`, `trackman`, `recording`,
  `talent/{discovery,kohort,region,ressurser}`, `workspace/prosjekter`.

> **Rotårsak:** Desktop-sidebar (`agencyos-sidebar.tsx`) og mobil-skuff (`mobile-drawer.tsx`) er to
> ulike håndvedlikeholdte lister. Hubene refereres kun av mobil-skuffen + den døde `sidebar.tsx`.

### Dublett-par (uavklart, ingen redirect)
- **Innboks-familien:** `foresporsler` (SessionRequest) vs `innboks` (meldinger) vs `kommunikasjon`
  (tom hub-wrapper) vs `messages` (redirect). `kommunikasjon` overflødig.
- **Godkjenning:** `godkjenninger` (PlanAction, kanon) vs `approvals` (redirect) vs `godkjenn-portal`
  (helt annet — intern design-QA, feilplassert under /admin).
- **Analyse:** `analyse` (Stall-analyse) vs `analysere` (hub) vs `analytics` (redirect).
- **Settings:** `settings` (kanon) vs `organisasjon` (mobil-hub) vs `klubb/innstillinger`.
- **Workbench:** `coach-workbench` (generisk fallback) vs `spillere/[id]/workbench` (per spiller).
- **Queue:** `queue` = `oppfolging` (re-eksport) — bør være redirect.

### Manglende tom-/feiltilstand
`agencyos/live` (statisk seed-skall), `workspace`/`prosjekter` (sample-data i prod-flate),
`stats/moderering` (hardkodet STUB), `tilstander` (hardkodede demonavn — bryter navne-kanon),
`godkjenninger/[id]` (fallback til fiktiv data), `klubb/innstillinger` (KLUBB_META-stub).
