# Vedlegg 02 — Kartlegging: PlayerHQ (kjerne + Meg + Coach + Booking)

> Detaljert Del 1-rutetabell for spillerportalen. Hører til [docs/ux-arkitektur.md](../ux-arkitektur.md).
> Live Session ligger i [vedlegg 04](04-kartlegging-forelder-auth-live.md).

**Auth-modell:** `PortalShell` gater bredt (`allow:["PLAYER","COACH","ADMIN","GUEST"]`). Nesten hver
page re-kaller `requirePortalUser()` med default allow — per-page-gating er nesten fraværende; shell +
hub-redirects styrer. Inngang = `/portal` (0 trykk). Bottom-nav = 5 faner (Oversikt/Planlegg/Gjør/
Analyser/Coach), hver = 1 trykk. Sidebar-barn (desktop) = 1 trykk.

---

## A) Kjerne (Oversikt, Planlegge, Gjennomføre, Analysere, Mål, Statistikk, Tren, Trening, Talent, Drills)

| Rute | Ene jobb | Primærhandling | Elem. | Trykk | Datakilder | Nav inn | Nav ut |
|---|---|---|---|---|---|---|---|
| `/portal` | Dagens situasjon på ett blikk | Start dagens økt | 6+ | 0 | Round, Goal, TrainingPlanSession, SG | bottom-nav | økt, mal, runder |
| `/portal/planlegge` | All planlegging = Workbench | Åpne Workbench | 4 | 1 | getPlanleggeData + Workbench | bottom-nav | workbench |
| `/portal/planlegge/workbench` | Spillerens treningsplan-kjerne | Rediger plan | 5+ | 2 | TrainingPlan, Session, Goal | planlegge | sesjon-detalj |
| `/portal/gjennomfore` | Gjør dagens jobb | Start økt | 4 (faner) | 1 | getGjennomforeData | bottom-nav | live, booking |
| `/portal/analysere` | Les tallene (samlet) | Velg fane | 5 faner + 4 KPI | 1 | getAnalysereData | bottom-nav | turneringer |
| `/portal/analysere/hull` | SG+trening per sone | (lese) | 4 | 1 | BrukerSgInput | sidebar «Innsikt» | **— blindvei** |
| `/portal/mal` | Mål-oversikt + HCP-trend | Nytt mål | 6+ | 1 | Round, Goal, SG | sidebar, hjem | runder, trackman, goal |
| `/portal/mal/sg-hub` | SG-detaljanalyse + gap→drill | Velg kølle/innsikt | 5+ | 1 | TrackManSession, Round, drills | sidebar | drills, sub-flater |
| `/portal/mal/sg-hub/{conditions,equipment,strategy,yardage,benchmark,best-vs-now}` | Én SG-deldimensjon | varierer | 2–4 | 2 | TrackManSession | sg-hub | sg-hub |
| `/portal/mal/sg-hub/[club]` | Per-kølle dybde | Annoter | 3+ | 2 | TrackManSession+annot. | sg-hub | — |
| `/portal/mal/sg-hub/coach/[spillerId]/…` | Coach ser spillers SG | (lese) | 3 | (coach) | `requireCoachForPlayer` ✓ | coach-flate | — |
| `/portal/mal/runder`(+`/[id]`(+`/shot-by-shot`),`/ny`) | Runde-liste + detalj + logg | Ny runde | liste+3 KPI | 1 | Round, Shot | sidebar, mal | [id], ny |
| `/portal/mal/trackman`(+`/[id]`) | TM-økt-liste + trend (Mål-kontekst) | Importer | liste+trend | 1 | TrackManSession | sidebar, mal | [id] (404 hvis FEATURE av) |
| `/portal/mal/statistikk` | SG-statistikk per periode | Velg periode | tabell | 2+ | Round | mal? | — |
| `/portal/mal/baner`(+`/[id]`) | **Placeholder «kommer i V2»** | — | 0 reelle | 1 | ingen | mal:157 | **blindvei** |
| `/portal/mal/leaderboard` | Spiller-rangering | Filter | tabell (TODO) | 2 | User, Round | mal? | — |
| `/portal/mal/milepaeler` | Achievements + mål-status | (lese) | mange | 2 | Achievement, Goal | mal | — |
| `/portal/mal/bygger` | Mål-wizard | Lagre mål | wizard | 2 | byggerKontekst | mal | — |
| `/portal/mal/goal/[id]` | Mål-detalj | Marker oppnådd | mange | 2 | Goal, Round | mal | runder |
| `/portal/statistikk`(+`/[metric]`,`/sammenlign`,`/runder/[runId]/del`) | SG-statistikk v10 + drilldown | — | grid | 1–3 | Round, SG | sidebar(?), hjem | [metric], del |
| `/portal/stats` | **Redirect → /portal/statistikk** | — | 0 | — | — | (legacy) | — |
| `/portal/analyse` | **Redirect → /portal/analysere** | — | 0 | — | — | (legacy) | — |
| `/portal/trackman/[sessionId]` | TM-økt detalj (workbench-variant) | Eksport | KPI+shots | 2 | TrackManSession | workbench | — |
| `/portal/talent`(+`/min-plan`,`/mitt-niva`,`/roadmap`,`/sammenligning`) | Talent-hub + perspektiver | varierer | 4 kort | 1–2 | varierer (bak `FEATURES.TALENT`) | sidebar | hverandre |
| `/portal/tren/aarsplan`(+`/periode/[id]/rediger`) | Sesongplan-oversikt | Rediger periode | faser | 1 | seasonPlan | sidebar | rediger |
| `/portal/tren/teknisk-plan`(+`/[planId]`) | Teknisk-plan-liste | Ny plan | kort | 1 | TechnicalPlan | sidebar | [planId] |
| `/portal/tren/fys-plan`(+`/[planId]`) | FYS-plan-liste | Ny plan | kort | 1 | FysPlan | sidebar | [planId] |
| `/portal/tren/kalender` | Trenings-uke (skjult dublett) | Ny økt | kalender | 2 | TrainingPlanSession | — (`next.config` redirecter) | sesjon |
| `/portal/tren/ovelser`(+`/[id]`) | **Redirect → /portal/drills** (parent) | — | detalj | — | ExerciseDefinition | (legacy) | — |
| `/portal/tren/tester`(+`/katalog`,`/[testId]`(+`/gjennomfor`),`/ny`(+`/egen`)) | Tester-oversikt + katalog | Start test | siste+katalog | 1 | TestResult | sidebar, analysere | [testId], katalog |
| `/portal/tren/turneringer`(+`/[id]`,`/ny`) | Turnerings-liste (lese) | Planlegg i Workbench | liste | 1 | TournamentEntry | sidebar, analysere | planlegge |
| `/portal/tren/feiring/[planId]` | Plan-feiring | — | konfetti | 3 | TrainingPlan | plan-fullføring | — |
| `/portal/tren/[sessionId]`(+`/planlagt`) | Økt-detalj | Start | detalj | 2 | TrainingPlanSession | kalender/workbench | live |
| `/portal/trening/logg` | Hurtig-logg SG-økt | Lagre | skjema | 1 | SgCategory-input | sidebar | — |
| `/portal/trening/putte-laboratoriet` | Putte-verktøy | (verktøy) | verktøy | 1 | client | sidebar (eneste inn) | — |
| `/portal/trening/break-tabell` | Break-tabell-verktøy | (verktøy) | tabell | 1 | client | sidebar (eneste inn) | — |
| `/portal/drills`(+`/[id]`) | Drill-bibliotek | Åpne drill | grid | 1 | ExerciseDefinition(SYSTEM) | sidebar, sg-hub | [id] |
| `/portal/kalender` | Spiller-kalender | Ny økt | kalender | 1 | TrainingPlanSession | sidebar, gjennomfore | sesjon |
| `/portal/utfordringer`(+`/[id]`,`/ny`) | Drill-utfordringer | Ny utfordring | liste | 2+ | DrillChallenge | (ikke i sidebar) | [id], ny |
| `/portal/ny-okt` | Økt-wizard (4 steg) | Bekreft | wizard | 1 | drills | sidebar-knapp, FAB | — |
| `/portal/onskeligokt`(+`/bekreftet`) | Be coach om økt | Send | skjema | — | User (coacher) | (matchPrefix, ingen Link) | bekreftet |

### Dublett-/redirect-funn (PlayerHQ kjerne)

`next.config.ts` redirecter allerede (kanon i fet):
- `/portal/tren` → **`/portal/planlegge?tab=treningsplan`** (men `tren/*`-barn lever)
- `/portal/tren/kalender` → **`/portal/gjennomfore?tab=kalender`** (skyggefil: `tren/kalender/page.tsx`)
- `/portal/tren/ovelser` → **`/portal/drills`**
- `/portal/trackman` → **`/portal/analysere?tab=trackman`** (skyggefiler: `portal/trackman/*`)
- `/portal/analyse`, `/portal/innsikt` → **`/portal/analysere`**
- `/portal/stats` → **`/portal/statistikk`**
- `/portal/profil` → **`/portal/meg`**

**Dobbeltlagring som IKKE er ryddet:**
- **SG:** `/portal/analysere` (SG-fane) vs `/portal/mal/sg-hub` (full) — dobbel rendering, ikke lenking.
- **Statistikk:** `/portal/statistikk` (v10) vs `/portal/mal/statistikk` (periode) vs `/portal/stats`
  (redirect) — tre flater. Sidebar-barnet «Statistikk» peker faktisk på `/portal/analysere`.
- **TrackMan-detalj ×2:** `/portal/trackman/[sessionId]` og `/portal/mal/trackman/[id]` (fila innrømmer
  duplisering selv).
- **To kalendere:** `/portal/kalender` (sidebar) vs `/portal/tren/kalender` (skygget).

### Blindveier
`/portal/analysere/hull` (ingen utlenke), `/portal/mal/baner` (placeholder, klikkbar fra `mal:157`),
`/portal/mal/trackman/[id]` (404 hvis FEATURE av).

### Manglende tom-/feiltilstand
`/portal/talent/*` (statisk demo uten ærlig tom-tilstand), `/portal/statistikk` (avhenger av child),
`/portal/utfordringer/ny`. (De fleste list-sider HAR EmptyState.)

---

## B) Meg-seksjonen (`/portal/meg/*`) — innstillings-imperium + Stripe

| Rute | Ene jobb | Primærhandling | Trykk | Datakilder | Nav inn |
|---|---|---|---|---|---|
| `/portal/meg` | Profil-hjem: hero + abonnement + 7 KONTO-rader | Åpne KONTO-side | 1 | hentProfilOversikt | sidebar |
| `/portal/meg/profil`(+`/rediger`) | Profil-detalj + redigering | Lagre | 2–3 | user, groupMember | KONTO |
| `/portal/meg/utstyrsbag` | Køller/ball/loft | Lagre bag | 2 | equipmentBag | KONTO |
| `/portal/meg/helse`(+`/symptom/ny`) | Hvilepuls/søvn/readiness + symptom | Logg symptom | 2–3 | healthEntry, leave | KONTO |
| `/portal/meg/dokumenter` | Avtaler/samtykker/fakturaer | Last ned | 2 | document | KONTO, abonnement |
| `/portal/meg/feedback` | Send appfeedback | Send | 2 | — | **kun help** |
| `/portal/meg/foreldre` | Foreldre-koblinger | Inviter | **FORELDRELØS** | parentRelation | (registry) |
| `/portal/meg/bookinger`(+`/reschedule/[id]`) | Mine bookinger (faner) | Ny booking | 2–3 | subscription, booking | booking-flyt |
| `/portal/meg/sikkerhet`(+`/2fa`) | Sikkerhet (accordion-variant) | — | **FORELDRELØS** | — | (kun 2fa-barn) |
| `/portal/meg/help`(+`/artikkel/[slug]`,`/kategori/[slug]`,`/kontakt`) | Hjelpesenter | Søk/kontakt | 2–4 | — | KONTO |
| `/portal/meg/innstillinger` | **Selvstendig** innstillingsside (inline toggles) | Toggle/koble | 2 | trackManSession.count | KONTO |
| `/portal/meg/innstillinger/integrasjoner` | TrackMan/Garmin/Golfbox | Koble til | 3 | — | innstillinger |
| `/portal/meg/innstillinger/{anlegg,eksport,okter,personvern,sikkerhet,sprak,varsler}` | Hver: ett innstillingstema | varierer | **FORELDRELØS** (7 stk) | — | (registry) |
| `/portal/meg/abonnement` | Abonnementsstatus | Se fakturaer | 2 | getAbonnementData | KONTO |
| `/portal/meg/abonnement/avbestill` | Avbestill flyt | Bekreft | **FORELDRELØS** | subscription | (registry) |
| `/portal/meg/abonnement/faktura/[id]` | Faktura-detalj | Last ned PDF | **FORELDRELØS** | payment | (registry) |
| `/portal/meg/abonnement/kort/ny` | Endre kort (Stripe Portal) | Åpne Portal | **FORELDRELØS** | subscription | (registry) |
| `/portal/meg/abonnement/oppgrader` | Oppgrader (BETA: mailto) | mailto | 4+ | — | help/artikkel |
| `/portal/meg/abonnement/oppgrader/flyt` | **Ekte Stripe-checkout-wizard** | Bekreft → Stripe | **FORELDRELØS** | — | (registry) |

**Meg-funn:**
- **Innstillinger i 3 IA-er:** (a) inline toggles i `innstillinger/page.tsx`, (b) 9 separate subpages,
  (c) `innstillinger-accordion.tsx` i `meg/sikkerhet`. Varsler ×2, Sikkerhet ×3.
- **Stripe-flyten helt utilgjengelig:** `avbestill`/`faktura`/`kort/ny`/`oppgrader/flyt` lenkes ikke
  fra abonnement-hubben. Hubben fanger verken `?ok=1` (suksess) eller `past_due` (feil). `cancel_url`
  → `/coaching` (marketing). To oppgraderingsveier (mailto vs ekte).
- **Reschedule-feil svelges:** redirecter `?error=…` men hub leser ikke `searchParams`.

---

## C) Coach-i-portal (`/portal/coach/*`) + Booking + AI + diverse

| Rute | Ene jobb | Primærhandling | Trykk | Auth | Nav inn |
|---|---|---|---|---|---|
| `/portal/coach` | Coach-hub: 8 kort | Åpne kort | 1 | default | bottom-nav |
| `/portal/coach/[coachId]` | Coach-profil | Send melding | 2 | default | coach-hub |
| `/portal/coach/ai` | AI-Caddie chat | Start samtale | 2 | +PARENT | coach-hub |
| `/portal/coach/melding`(+`/[id]`(+`/vedlegg`),`/ny`) | Meldingstråder | Ny melding / svar | 2–4 | +PARENT | coach-hub |
| `/portal/coach/notes`(+`/[noteId]`) | Coach-notater | (lese) | 2–3 | default | hub, melding |
| `/portal/coach/ovelser`(+`/ny`,`/[id]/rediger`) | **Øvelsesbibliotek (CRUD)** | Ny øvelse | 2–3 | **COACH/ADMIN** | hub-kort (blindvei for spiller) |
| `/portal/coach/plans`(+`/[planId]`(+`/ny-okt`),`/perioder`) | Planer + redigering | Åpne / legg til økt | 2–4 | default / COACH | hub, sidebar |
| `/portal/coach/sporsmal/[id]` | Spørsmål-detalj | Svar | **FORELDRELØS** | +PARENT | (registry) |
| `/portal/coach/videoer` | Video-bibliotek | (lese) | 2 | PLAYER/COACH/ADMIN | hub-kort |
| `/portal/booking` | Booking-hub | Book → ny | 2 | PLAYER/COACH/ADMIN | sidebar (Gjennomføre) |
| `/portal/booking/ny`(+`/bekreft`) | Booking-wizard | Velg → bekreft | 3–4 | (redir /coaching hvis ingen sub) | hub, FAB |
| `/portal/booking/[bookingId]` | Booking-detalj | Endre/avbestill | 3 | PLAYER/COACH/ADMIN | hub, kvittering |
| `/portal/booking/anlegg/[anleggId]` | Anlegg-detalj | Book her | **FORELDRELØS** | PLAYER/COACH/ADMIN | (registry) |
| `/portal/booking/coach/[coachId]` | Book med coach | Velg tid | 3 | PLAYER/COACH/ADMIN | hub, anlegg |
| `/portal/booking/bekreftet` | Kvittering | Til oversikt | 4 | PLAYER/COACH/ADMIN | flyt |
| `/portal/ai/{foresla-drill,foresla-turnering,mal-bygger}` | AI-forslag (kontekst-innganger) | Bruk forslag | — | PLAYER/COACH/ADMIN | plan-/turnerings-/mål-screens |
| `/portal/varsler` | Varsler | Åpne varsel | 1 | default | bell-ikon |
| `/portal/reach` | Reach/eksponering (P2) | — | **FORELDRELØS** | default | (registry) |
| `/portal/spiller/[spillerId]` | Spiller-profil (coach ser spiller) | — | **FORELDRELØS** | default | (registry) |
| `/portal/agent-pipeline` | AI-agent-pipeline (debug) | — | **FORELDRELØS** | default | (registry) |

**Coach/booking-funn:**
- **Coach-forfatterverktøy feilplassert i spillerportalen** (COACH/ADMIN-gated): `coach/ovelser*`,
  `coach/plans/.../ny-okt`, `coach/videoer` — dublett mot `/admin/drills|plans|videoer`. Spilleren ser
  «Øvelser»-kortet i hubben men treffer auth-vegg → blindvei.
- **Foreldreløse ferdigbygde flater:** `reach` (397 l), `spiller/[spillerId]` (147 l),
  `agent-pipeline` (241 l), `booking/anlegg/[anleggId]` (488 l).
- **Booking to steder:** `/portal/booking` (credit-aware) + `/booking` (marketing) — `meg/bookinger`
  velger basert på `monthlyCredits`.
