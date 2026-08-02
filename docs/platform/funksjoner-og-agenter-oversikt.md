# AK Golf HQ — Komplett funksjons- og agent-oversikt

**Verifisert mot koden 2026-07-30** · Kilder: `src/app/portal/**` (~170 ruter), `src/app/admin/**`, `src/lib/agents/` (~55 filer), `vercel.json`, `src/lib/{ai,caddie,kommando,masterbrain,plan-engine,sg-hub,intelligence}/`

Alt under er lest ut av faktisk kode — ikke filnavn eller antakelser. Der noe er en stub eller plassholder står det eksplisitt.

---

# DEL 1 — PLAYERHQ (spiller-flaten, `/portal`)

Hovednavigasjonen er fem trykk: **Hjem · Plan · Gjør · Analyse · Meg** (`src/components/v2/shell.tsx:66`).

## 1.1 Hjem / dashboard
| Funksjon | Adresse | Hva spilleren gjør |
|---|---|---|
| Hjem | `/portal` | Ser dagens økter, ukesfremdrift, mål-widget og «neste beste handling» (anbefalt neste steg) |
| Varsler | `/portal/varsler` | Leser varsler gruppert i dag/tidligere |
| Kalender | `/portal/kalender` | Ser økter og hendelser i dag/uke/måned/år-visning |

## 1.2 Planlegging (Plan)
| Funksjon | Adresse | Hva spilleren gjør |
|---|---|---|
| Ukeplan | `/portal/planlegge` | Oversikt over planlagt uke og fremdrift |
| Workbench | `/portal/planlegge/workbench` | Oppretter/flytter/sletter egne økter, publiserer uke, mottar Caddie-forslag |
| Plan-bygger | `/portal/planlegge/bygger` | 5-stegs wizard: Mål → Mal → Generer → Juster → Lagre |
| Utviklingsplan | `/portal/utviklingsplan` | Read-only: talent-radar + teknisk plan (P1–P10-posisjoner, krav, TrackMan-mål, AI-forslag) |
| Årsplan-perioder | `/portal/(legacy)/tren/aarsplan/periode/*` | Redigerer perioder i sesongplanen (to gjenværende ekte legacy-sider) |

## 1.3 Trening — gjennomføring (Gjør)
| Funksjon | Adresse | Hva spilleren gjør |
|---|---|---|
| Gjør-hub | `/portal/gjennomfore` | Begge økt-spor (V2 + plan-økter) samlet |
| Live-økt | `/portal/live/[sessionId]` | Full flyt: brief (mål/fokus/drills) → active (timer, rep-logging) → summary (reps, tid, pyramide-fordeling) |
| Tapper | `/portal/live/[sessionId]/tapper` | Fullskjerm range-logging: én tap per ball, valg av kølle (skriver `SessionBallLog`) |
| Logg etterpå | `/portal/trening/logg` | Logger gjennomført økt i etterkant |
| Tester | `/portal/tren/tester` | Test-hub: scorekort, tildelte tester, historikk/trend; kan bygge egne tester og gjennomføre i Brief → Scorekort → Oppsummering-flyt |
| Teknisk plan | `/portal/tren/teknisk-plan/[planId]` | P-posisjoner, oppgavekort, reps-logging, TrackMan-mål per kølle |
| Fysisk | `/portal/tren/fys-plan`, `/portal/fysisk` | Fysiske planer med ukefremdrift + fys-logging |
| Putte-lab | `/portal/trening/putte-laboratoriet`, `/portal/trening/break-tabell` | Putte-fysikk/sannsynlighet og break-matte |
| Drill-bank | `/portal/drills` | Øvelsesbank med detaljsider |
| Turneringer | `/portal/tren/turneringer` | Turneringsliste med på-/avmelding |
| Utfordringer | `/portal/utfordringer` | Drill-utfordringer: bli med, registrer score, se plassering |
| Feiring | `/portal/tren/feiring/[planId]` | Feiringsskjerm ved fullført plan (effektivitet + rekordsammenligning) |

## 1.4 Runder & score
| Funksjon | Adresse | Hva spilleren gjør |
|---|---|---|
| Live runde | `/portal/runde/live` | Slag-for-slag-føring på banen (kladd i localStorage, SG server-side) |
| Etterregistrering | `/portal/runde/logg`, `/portal/mal/runder/ny` | Logger runde slag for slag i etterkant, valgfri dato |
| Rundeliste/detalj | `/portal/mal/runder`, `[id]`, `[id]/hull` | Ser runder, redigerer hull for hull |
| Slag-wizard | `/portal/mal/runder/[id]/slag` | Slag-registrering + **UpGame-import** |
| Del runde | `/portal/statistikk/runder/[runId]/del` | Deler scorebilde |

Motor bak: `lib/runde-logg` (shots→SG-pipeline, UpGame-parse) + `lib/sg.ts`.

## 1.5 Statistikk & analyse (Analyse)
| Funksjon | Adresse | Hva spilleren gjør |
|---|---|---|
| Analyse-hub | `/portal/analysere` | Min Golf-tall + analytics workbench |
| Hull-analyse | `/portal/analysere/hull` | Sone-kart + hull-for-hull (SG per sone) |
| Drill-down | `/portal/statistikk/[metric]` | Trend per disiplin (5 pyramide- + 4 SG-disipliner) med topp-drills |
| TrackMan-hub | `/portal/mal/trackman` + `[id]` | Importerer TrackMan CSV/HTML, ser trender og dispersion-plot per kølle |
| SG-hub | `/portal/coach/sg-hub` | SG mot coach-referanseverdier, størst-gap-analyse |
| DataGolf | `/portal/datagolf` | Sammenligning mot PGA-feltet |

## 1.6 Gameplan (bane-strategi)
`/portal/gameplan` — banebibliotek med satellitt-kart per hull: egen spredning (dispersion) tegnet inn, dra-sikte-funksjon, bra/aldri-soner og carry beregnet fra GPS (`lib/gameplan`).

## 1.7 Mål & milepæler
`/portal/mal` (aktive mål + siste achievement) · `/portal/mal/goal/[id]` (ETA, A–K-stige) · `/portal/mal/bygger` (AI SMART-mål-wizard) · `/portal/mal/leaderboard` (SG-ledertavle, feature-gate).

## 1.8 Talent-programmet
`/portal/talent` (nivå, radar, streak, SG-percentil) · `mitt-niva` (radarprofil mot kohort-snitt) · `min-plan` (milepæler) · `roadmap` (sesong + L-faser) · `sammenligning` (anonymisert spiller-sammenligning). Feature-gate `FEATURES.TALENT`.

## 1.9 Booking
`/portal/booking` (tjenester, coacher, credit-saldo, ekte ledige slots) · `booking/ny` (wizard: tjeneste → dato → tid → bekreft) · `meg/bookinger` + reschedule · `/portal/onskeligokt` («Be om økt»-forespørsel til coach med status-tidslinje).

## 1.10 Coach & kommunikasjon
`/portal/coach` (coach-hub: profil, fokus-notat, meldinger — selvbetjente uten coach får oppsalg, aldri blindgate) · direktemeldinger · Q&A-tråder · egne økt-videoer · øvelsesbibliotek · delte planer (Pro-gated) · AI-coach-chat (Pro-gated) · `/portal/venner` (venners aktivitetsfeed).

## 1.11 AI-funksjoner
AI drill-forslag (`/portal/ai/foresla-drill`) · AI turneringsforslag · Caddie-drevne Workbench-forslag og plan-justeringer.

## 1.12 Meg / profil / konto
Profil (navn, HCP, klubb, foreldresamtykke-status) · abonnement (Stripe, PRO 299 kr/mnd, faktura-PDF) · helse/symptom-logging · utstyrsbag · dokumenter · foreldre-kobling · hjelpesenter · innstillinger (anlegg, TrackMan/Google Calendar-integrasjoner, personvern med dataeksport og sletting, sikkerhet + 2FA, varsler).

## 1.13 Motorer bak spiller-flaten
`lib/portal-live` (live-økt) · `lib/runde-logg` + `lib/sg.ts` (SG-pipeline) · `lib/min-golf` (analysepakke) · `lib/sg-hub` + `lib/trackman` (TrackMan-analyse) · `lib/plan-engine`/`lib/plan-builder` (plangenerering) · `lib/gameplan` (dispersion) · `lib/turneringer` (GolfBox-sync) + `lib/wagr` · `lib/putt-core` (putte-fysikk) · `lib/caddie`/`lib/ai-coach` (AI-flater).

---

# DEL 2 — AGENCYOS / COACHHQ (coach-flaten, `/admin`)

Hovednavigasjon: **Hjem · Stall · Kalender · Kø · Innsikt** + «Mer» (`src/components/v2/shell.tsx:78`). `/admin` redirecter til `/admin/agencyos`.

## 2.1 Cockpit / daglig drift
| Funksjon | Adresse | Hva coachen gjør |
|---|---|---|
| Cockpit | `/admin/agencyos` | Morgenbrief, KPI-er (aktive spillere, økter i dag, ventende godkjenninger, MRR), fokusspillere, AI-dispatch |
| Daglig brief | `/admin/brief` | Claude-generert dagsoppsummering + nøkkeltall, med print/eksport |
| Uka | `/admin/agencyos/uka` | 7-dagers kanban med bookinger per dag + ukes-KPI-er |
| Gjennomføre | `/admin/gjennomfore` | Dagens øktliste på tvers av spillere; økt-detalj med start/avlys |
| Handlingssenter | `/admin/handlingssenter` | Oppgave-kanban fra Notion-synk |
| Workspace | `/admin/workspace*` | Notion-baserte prosjekter/oppgaver |

## 2.2 Spilleradministrasjon (Stall)
| Funksjon | Adresse | Hva coachen gjør |
|---|---|---|
| Stall-liste | `/admin/spillere` | Status per spiller (aktiv/inaktiv), pakke/betaling, filtre |
| Spillerprofil 360° | `/admin/spillere/[id]` | Oversikt, pyramide, aktiv plan, meldinger |
| Spilleranalyse | `/admin/spillere/[id]/analyse` | Full elite-analyse (Min Golf + workbench) |
| Fremgang | `/admin/spillere/[id]/fremgang` | Runder, treningsvolum, SG-korrelasjon |
| Tester | `/admin/spillere/[id]/tester` | Coach-visning av spillerens tester |
| Teknisk plan | `/admin/spillere/[id]/plan/[planId]` | Plan-detalj med drills-panel (drag/rediger/slett), dupliser/publiser |
| Turneringskobling | `/admin/spillere/[id]/turnering-kobling` | Manuell kobling User ↔ PublicPlayer når navnematch bommer |

## 2.3 Workbench / planlegging / periodisering
| Funksjon | Adresse | Hva coachen gjør |
|---|---|---|
| Workbench | `/admin/spillere/[id]/workbench` | **Kjernen i verktøyet:** uke-canvas — legge til/flytte/endre/duplisere økter og uker, notater, mal-påføring, publisering med diff |
| Planlegge-hub | `/admin/planlegge` | Spillervalg inn i Workbench + tellinger |
| Teknisk plan | `/admin/teknisk-plan` | Oversikt: aktive planer, TEK-økter, TM-status |
| Treningsplaner | `/admin/plans`, `/admin/plans/[planId]` | Planer per fase, draggable sessions, pyramide-fordeling |
| Plan-maler | `/admin/plan-templates` | Mal-bibliotek med bruksantall og akse-fordeling |
| Periode-fordeling | `/admin/settings/periode-fordeling` | Global pyramide-fordeling (min/maks-%) per periode — metodikkoverstyring |
| Gruppe-workbench | `/admin/grupper/[id]/workbench` | Gruppens årsplan på samme canvas |

## 2.4 Booking / kalender
`/admin/kalender` (ukovsvisning Booking + faste gruppetimer) · kalenderhendelser (opprett/se/slett) · `/admin/bookinger` (kapasitets-heatmap per time/dag + PENDING forespørsler) · `/admin/bookinger/ny` (5-stegs manuell booking, støtter gruppe) · Google Calendar-synk per coach (`/admin/settings/calendar`).

## 2.5 Økonomi
`/admin/agencyos/okonomi` — betalingsaggregater, siste transaksjoner, aktive PRO-abonnement, MRR (basert på historiske WooCommerce/Acuity-importer + Stripe). Støttet av agentene betalings-purring, tripletex-lønn, tripletex-månedsavslutning og månedsrapport (se Del 3).

## 2.6 Grupper / talent
`/admin/grupper` (grupper med neste økt, GFGK-bootstrap) · gruppe-detalj (start økt, spillere, rull ut mal) · timeplan (faste treningstider) · gruppe-årsplan med skoledata · `/admin/talent/radar` (TalentTracking-radar mot peer-snitt) · `/admin/talent/discovery` (talentkandidater uten tracking).

## 2.7 AI / agenter / Caddie (AgenticOS)
| Funksjon | Adresse | Hva coachen gjør |
|---|---|---|
| Agent-oversikt | `/admin/agents` | Ser alle agenter, Signal/PlanAction-tellinger, siste 30 AgentRun |
| Agent-detalj | `/admin/agents/[agentId]` | Kjører agent manuelt, gir tommel opp/ned, godkjenner forslag |
| Godkjenningskø | `/admin/godkjenninger` | Behandler PENDING PlanAction fra agentene med diff-preview (lav-risiko-typer markert) |
| Caddie-chat | `/admin/agencyos/caddie` | Direkte chat med AI-Caddie (ADMIN-only) |
| Caddie-dashbord | `/admin/agencyos/caddie/dashbord` | Proaktive forslag + co-agent-rammeverk (utkast/fleet/audit) |
| Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | Aktivitetslogg + agent-feil siste 7 dager |
| Agent-team | `/admin/agent-team` | Kommando: multi-modell panel (Claude/Gemini/Grok/Ollama) med prosjekt/oppgaver |
| Opptak | `/admin/recording` | Tar opp coaching-økt: Whisper-transkripsjon + Claude-analyse |
| Mission Control | `/admin/agencyos/live` | **Plassholder** — visuelt skall med seed-data foreløpig |

## 2.8 Innboks / kommunikasjon
`/admin/innboks` (triage-kø) · `/admin/innboks-epost` (full e-post for post@akgolf.no med godkjenn-og-send) · `/admin/varsler` (varslingsenter) · `/admin/email-templates` (e-postmaler med test-utsendelse) · `/admin/marketing` (innholdskalender + post-kø).

## 2.9 Innsikt / analyse
`/admin/analyse` (stall-SG) · `/admin/analysere/compliance` (plan-compliance) · `/admin/queue` (oppfølgingskanban: Risiko/Watch/Sjekk inn/Løst — «Løst» er plassholder) · `/admin/reports` · `/admin/runder` · `/admin/okter` (pyramide-aggregat) · `/admin/trackman` (økter på tvers) · `/admin/tester` (+ godkjenning av spiller-lagde tester) · `/admin/videoer` (coaching-videoer).

## 2.10 Turneringer
`/admin/tournaments` (stallens påmeldinger) · wizard for ny turnering · detalj (resultater, påmelding med prioritering, fellesmelding) · dublett-fletting mot DATAGOLF/NGF/GJGT-treff.

## 2.11 Innstillinger / organisasjon
`/admin/settings` (klubber/anlegg, team, tilgang) · CBAC-matrise (rolle → capability) · API-nøkler · klubb-innstillinger (multi-club) · `/admin/integrasjoner` (status: Google, Stripe, Notion, Anthropic, Resend, Supabase) · `/admin/team` + coach-invitasjon · egen profil · `/admin/audit-log`.

## 2.12 Motorer bak coach-flaten
`src/lib/workbench/` (~35 filer — workbench-kjerne, publisering m/ diff, periodisering, V2-synk til spiller-flaten) · `src/lib/agencyos/` (cockpit-data) · `src/lib/teknisk-plan/` · `src/lib/agents/` (agent-rammeverk) · `src/lib/caddie/` · `src/lib/kommando/` · `src/lib/masterbrain/` (CANON/MORAD/LTAD-fasit) · `src/lib/auth/coached.ts` (coach-scoping brukt overalt).

---

# DEL 3 — ALLE AGENTER

## 3.1 Slik fungerer agent-rammeverket

Mønsteret er **signal → forslag → godkjenning → utførelse**. Ingen agent endrer spillerens plan direkte — alt går gjennom en menneskelig godkjenning:

1. En **trigger** fyrer agenten: enten cron (Vercel, `vercel.json`, kaller `/api/cron/[agent]` med `CRON_SECRET`), eller en hendelse (`triggers.ts` kalles fire-and-forget fra server actions når f.eks. en runde logges).
2. Agenten kjører via **`runAgent()`** (`agent-runner.ts`) som logger hver kjøring til `AgentRun` (status OK/ERROR, varighet, output) — synlig på `/admin/agents`.
3. Agenten skriver **`Signal`** (observasjon) og/eller **`PlanAction`** (PENDING forslag) — alltid med **provenance** (`provenance.ts`): strukturert «hvorfor» — kilde, antall rader, regel, terskel, målt verdi — som vises som norsk én-linje i godkjenningsskjermen.
4. **Varsling** (`agent-notify.ts` / `notify-plan-action.ts`): in-app `Notification` + web-push + Telegram-speil til Anders. Eskalerer til Telegram ved SG < −1,0.
5. **Godkjenning** (`actions.ts`): spiller eier egne forslag, coach kun for egne spillere (tilgangssjekk), ADMIN alltid.
6. **Utførelse** (`accept-plan-action.ts` → `plan-action-executor.ts`, 878 linjer): oversetter ~12 action-typer til konkrete plan-endringer. Tre guards før noe skrives: periodiserings-skill (blokkerer tekniske endringer i feil periode), junior-guard (alder/øktantall) og invariant-validering. Alt i én Prisma-transaksjon.

**Viktig presisering:** Noen få agenter bruker ikke `runAgent` og logges derfor ikke til `AgentRun`: `betalings-purring`, `booking-reminders`, `caddie-proactive`, `churn-radar`, `lead-oppfolging`, `maanedsrapport`, `weekly-plan-proposals`, `ukesoppsummering`.

## 3.2 Event-drevne agenter (fyrer når spilleren gjør noe)

| Agent | Hva den faktisk gjør | Trigger |
|---|---|---|
| **round-agent** | Når en runde logges: beregner SG-snitt siste 30 dager (totalt + OTT/APP/ARG/PUTT), skriver `Signal` per kategori. Er svakeste område under −0,5, legges et FOCUS_CHANGE-forslag med ferdig drill-pakke i coachens godkjenningskø. Leser `Round`/plan, skriver `Signal`+`PlanAction`. | Runde logget (via `triggers.ts`) |
| **sg-analyse-ekspert** | Kjører rett etter round-agent: ser på de 5 siste rundene, og hvis svakeste SG-kategori er under −0,35 oversettes den til et MORAD-svingfunn (`mapSgBandToFault`) og sendes som forklart FOCUS_CHANGE-forslag til coachen. Duplikatsperre mot ventende forslag. | Kjedet etter round-agent |
| **plan-revisjon** (automatisk variant) | Etter ny runde ber Claude foreslå konkrete plan-justeringer (`foreslaPlanRevisjon` i `src/lib/ai/agents/`); hvert forslag oversettes til riktig PlanAction-type, dedupes og legges i kø (`plan-revision-actions.ts`). | Kjedet etter runde |
| **test-agent** | Når et testresultat lagres: beregner trend per test (siste score vs. snitt av de 3 foregående). Ved ≥15 % forbedring eller ≥10 % tilbakegang lages forslag med drill-pakke. Skriver TEST_TREND-`Signal`. | Test registrert |
| **achievement-agent** | Sjekker milepæler etter runde/test: første runde, første test, positiv SG-snitt (min. 3 runder), trenings-streak 7/14 dager. Oppretter nye `Achievement`-rader (dedup). Den eneste rent event-drevne agenten uten PlanAction. | Runde/test logget |
| **treningsdata-ekspert** | Etter runde/test: korrelerer treningsvolum mot SG-utvikling over 12 uker. Finner den et område med negativ korrelasjon (mer trening → dårligere SG), ber den coachen vurdere volum/fokus. | Kjedet etter runde/test |
| **trackman-agent** | Når en TrackMan-økt lagres: skriver CLUB_AVG-signal per kølle og face-to-path-signal med MORAD-mapping. Er smash factor-snitt under 1,38, foreslås intensitetsjustering (csTarget 60). Leser `TrackManSession`/`TrackManShot` med rawJson-fallback. | TrackMan-import |
| **live-coach-agent** | Når en live-økt startes: oppretter en CoachingSession-tråd og legger inn en varm, personlig velkomstmelding fra «AI Golf Coach» (Claude, fallback statisk tekst) basert på økt, driller, plan og SG-form. Varsler spiller + coach in-app — bevisst aldri Telegram. | Live-økt startet |
| **swing-video-analyst** | **Stub.** Ved video-opplasting i live-økt legges kun meldingen «Video mottatt, jeg ser på opptaket…» inn i tråden. Ingen faktisk videoanalyse ennå. | Video lastet opp |
| **periodiseringsagent** | Når en treningsplan opprettes uten økter: foreslår standard uke-fordeling (35 % SLAG / 20 % TEK / 20 % SPILL / 15 % FYS / 10 % TURN) som PYRAMID_ADJUST-forslag. Ren regel, ingen AI. | Plan opprettet |

## 3.3 Cron-agenter — trening & plan

| Agent | Schedule | Hva den faktisk gjør |
|---|---|---|
| **plan-watcher** | Man 06:00 | Ukentlig pyramide-sjekk: var forrige ukes faktiske trening >8 prosentpoeng under planens mål på et område, lages PYRAMID_ADJUST-forslag (duplikatsperre). |
| **training-gap** | Man 06:30 | Finner spillerens svakeste SG-område (8 uker) og sjekker om det fikk <20 % av treningstiden siste 4 uker. Isåfall: TRAINING_GAP-forslag. Utdaterte forslag settes SUPERSEDED. |
| **plan-effectiveness-agent** | Søn 20:00 | Flagger aktive planer med completionRate <55 % eller SG-delta <−0,25. Skriver forslag + `Signal` + varsling til coach. |
| **weekly-plan-proposals** | Søn 18:00 | Genererer neste ukes øktforslag per spiller med aktiv plan, velger varianten nærmest periodens øktbudsjett, legger det som WEEKLY_PROPOSAL i godkjenningskøen — aldri auto-lagring. |
| **ukesoppsummering** | Søn 17:00 | Sender «Ukas oppsummering» til hver spiller: gjennomførte økter/minutter denne uka + planlagt neste uke. In-app + push. Samtykke-gate for mindreårige. |
| **turnering-agent** | Daglig 07:00 | Finner turneringer som starter innen 7 dager og foreslår PERIOD_SWITCH til turneringsforberedelse med pyramide-override. |
| **peaking** | Manuell | Coach velger spiller + turnering; Claude foreslår uke-for-uke Bompa-periodisering frem mot turneringen (volum, intensitet, pyramide-fokus). Vises inline, skriver ingen PlanAction. |
| **plan-revisjon** (manuell variant) | Manuell | Fra agent-siden: Claude foreslår plan-justeringer gitt trigger («siste-runde»/«skade»/«turnering-prep»). Returneres til UI. |
| **sg-insights** (insight-engine) | Daglig 04:00 | **Ikke i `lib/agents/`** — regelmotor i `src/lib/sg-hub/insight-engine/`: 90 dagers TrackMan-data gjennom deterministiske evaluators (strike-pattern, tempo, drift, fatigue, equipment-fit, yardage) som skriver `Insight`-rader med severity. Ingen LLM. |

## 3.4 Drill-pipeline (radar → fabrikk → godkjenning)

| Agent | Schedule | Hva den faktisk gjør |
|---|---|---|
| **radar** | Man 07:45 | Søker YouTube (5 faste spørringer) + RSS fra golf.com/golfwrx.com, deduper og lagrer nye funn (tittel+lenke+sammendrag) som ubehandlede `RadarFunn`. |
| **fabrikk** | Man 07:50 | Leser ubehandlede radar-funn; Claude vurderer treningsverdi og genererer en helt ny norsk øvelse grundet i masterbrain-fasiten (CANON). Går til samme godkjenningskø som drill-forslag. |
| **drill-forslag** | Man 08:00 | Regner stallens SG-snitt per kategori (60 dager), finner svakeste område, ber Claude foreslå 5 driller — med ekte YouTube-videoer hvis `YOUTUBE_API_KEY` er satt. Godkjennes på `/admin/drills/forslag`. |
| **media-lofte** | Man 08:15 | Finner øvelser i banken uten video/bilde og foreslår én YouTube-video per øvelse. Ved godkjenning settes `videoUrl` på øvelsen. |
| **ukesrapport-ovelser** | Man 08:30 | Oppsummerer uka: radar-funn, genererte/godkjente/avviste forslag, ventende i kø — sendes til ADMIN med lenke til godkjenningssiden. |

## 3.5 Booking, kapasitet & kundeflyt

| Agent | Schedule | Hva den faktisk gjør |
|---|---|---|
| **booking-reminders** | Hver time | Sender 24-timers påminnelse (e-post) for bekreftede bookinger. Idempotent via `AuditLog`-sjekk. |
| **booking-conflict-monitor** | Hvert 30. min | Sjekker overlappende bookinger på samme fasilitet; varsler ADMIN ved konflikt. |
| **24-7-booking-alerts** | Hvert 20. min | Er det >10 ledige slots og <3 ventende bookinger, foreslås proaktiv utsendelse til spillere. |
| **availability-gap-filler** | Daglig 07:00 | Finner svake ukedager (<2 bookinger siste 14 dager) og foreslår drop-in/markedsføring. |
| **demand-predictor** | Daglig 05:00 | Grov heuristikk: bookinger siste 30 dager ÷ 4 = «forventet per uke», med råd om å justere tilgjengelighet. |
| **booking-optimizer** | Kun manuell | Topp-3 travleste ukedager siste 30 dager som forslag til ADMIN. **Mangler oppføring i `vercel.json`.** |
| **availability-24-7-monitor** | Kun manuell | Flagger coacher med <5 aktive tilgjengelighets-slots. **Mangler oppføring i `vercel.json`.** |
| **lead-oppfolging** | Daglig 06:00 | Finner gjennomførte prøvetimer (gjester uten konto) og oppretter `Lead` + varsel til ADMIN med ferdig tilbudstekst — et menneske sender alltid selve tilbudet. |
| **churn-radar** | Man 06:00 | Fanger coachede spillere som ikke har logget inn på ≥14 dager. Skriver CHURN_ALERT-signal + ferdig meldingsutkast — sendes aldri automatisk. Vern: mindreårige uten foreldresamtykke hoppes over. |
| **caddie-proactive** | Man 07:00 | Finner inaktive spillere og lager CaddieDraft-forslag (`reengageInactivePlayer`) per spiller i Caddie-dashbordet. |

## 3.6 Økonomi & regnskap

| Agent | Schedule | Hva den faktisk gjør |
|---|---|---|
| **betalings-purring** | Daglig 05:00 | Purre-trapp for ubetalte: purring 1 etter 3 dager, purring 2 etter 10 dager (e-post via Resend), eskalering til menneske etter 17 dager. Mindreårig → e-post til foresatt, aldri barnet. |
| **maanedsrapport** | 1. i mnd 04:00 | Arkiverer forrige måneds nøkkeltall i `MonthlyReport`: bookinger, innbetalt per lokasjon, nye spillere, gjennomførte økter. Kronetall bak VIEW_FINANCE-gate. |
| **tripletex-lonn** | 3. + 6. i mnd | Den 3.: lønns-sjekkliste til ADMIN med ansattliste fra Tripletex. Den 6.: purring hvis lønn ikke er bekreftet kjørt (bekreftelsen gis via Meg-tool `lonn_bekreft`). Kjører aldri lønn selv. |
| **tripletex-maanedsavslutning** | 2. i mnd 06:00 | Henter forrige måneds resultattall fra Tripletex og sender til ADMIN — eller en tydelig «tall mangler»-melding. Aldri estimater. |

## 3.7 Anlegg & drift (GFGK/Mulligan + synk)

| Agent | Schedule | Hva den faktisk gjør |
|---|---|---|
| **gfgk-ballplukking** | Ons 09:00 | Sjekker om noen har bekreftet ansvar for torsdagens ballplukking; varsler Anders hvis ikke. Gjetter aldri hvem sin tur det er. Bekreftelse skjer via Meg-tool. |
| **mulligan-vaskeliste** | Man 08:00 | Samme mønster: er vask av simulatorene bekreftet denne uka? Varsler én gang hvis ikke. |
| **calendar-sync** | Hvert 15. min | Toveis Google Calendar-sync: speiler eksterne endringer tilbake til bookinger, pusher bekreftede bookinger som mangler `googleEventId`. |
| **refresh-calendar-watches** | Daglig 02:00 | Fornyer Google push-watches som utløper innen 24 t (Google gir maks 7 dager). |
| **cleanup-recordings** | Daglig 03:00 | Sletter lyd fra Supabase Storage der `retentionUntil` er passert. Transkript og AI-analyse beholdes — kun lydfiler slettes. Logger til `AuditLog`. |
| **wagr-sync** | Ons 06:15 | Henter WAGR-ranking fra wagr.com (skånsomt, én profil om gangen), oppdaterer snapshots idempotent, markerer spillere som har forlatt rankingen som proffe, kobler snapshots til brukere på navnetreff. |
| **ai-code-reviewer** | Man 03:00 | **Ikke ekte AI:** lager én PlanAction med tre hardkodede kodeforbedrings-forslag til ADMIN. Bør sees på som plassholder. |
| **youtube-search** | — | **Ikke en agent** — delt hjelpemodul mot YouTube Data API, brukt av radar og drill-forslag. |

## 3.8 «Agenter» utenfor `src/lib/agents/` — andre AI-systemer

Disse er ikke autonome bakgrunnsagenter, men like viktige i bildet:

| System | Hva det er |
|---|---|
| **`src/lib/ai/agents/`** | LLM-agentbibliotek (Anthropic tool-use): caddie, daily-brief, plan-revision, performance-peaking, sg-interpretation, vinn-tilbake. Ekte LLM-agenter — brukes av flere av cron-agentene ovenfor. Eksisterende `ai-plan`/`caddie` migreres gradvis hit. |
| **Caddie** (`src/lib/caddie/`) | Anders' personlige AI-assistent: chat med read/write-verktøy mot databasen. Skrive-handlinger blir alltid utkast (`CaddieDraft`) som godkjennes manuelt — samme mønster som PlanAction-køen, men interaktivt. |
| **Meg** (`src/lib/meg/`) | Telegram/chat-grensesnittet: bekrefter ballplukking, vaskeliste og lønn via tools (`ballplukking_bekreft`, `vaskeliste_bekreft`, `lonn_bekreft`). |
| **Kommando** (`src/lib/kommando/`) | Multi-modell panel på `/admin/agent-team`: ruter chat til Claude (kode), Gemini (research), Grok (marked) og Ollama (lokal/privat) + prosjekt/oppgave-rammeverk. Mission Control, ikke autonome agenter. |
| **AI-plangenerator** (`src/lib/ai-plan/`) | Claude Sonnet-generering av komplette treningsplaner på forespørsel: mal-baseline + RAG-valgte kunnskapsfiler + few-shot, logget til `AiPlanGeneration` med token-kostnad. |
| **AI-coach-kunnskap** (`src/lib/ai-coach/`) | Kunnskapsbase + RAG + truth-layer: MORAD/CANON-filer, filvalg per SG-område, prioritert datahierarki for anbefalinger (l-phase > junior-guard > periodisering > SG > TrackMan). |
| **Masterbrain** (`src/lib/masterbrain/`) | Versjonert lokal kopi av CANON/MORAD/LTAD-fasiten (JSON), synket fra eget repo. Agenter som genererer øvelser sjekker forslag mot denne fasiten. |
| **Plan-engine** (`src/lib/plan-engine/`) | Deterministisk motor (ingen AI/DB): gjør standardmal-uke om til personlig uke med norsk begrunnelse per justering. Anbefaler, sperrer aldri. |
| **Intelligence** (`src/lib/intelligence/`) | SG-benchmark-motor: plasserer spillerens SG på HCP-stige (Broadie-forventninger) og regner slag-gap til neste nivå. |

## 3.9 Status-avvik verdt å vite om

- **Stub:** `swing-video-analyst` (ingen videoanalyse), `ai-code-reviewer` (hardkodede forslag).
- **Plassholdere i UI:** `/admin/agencyos/live` (seed-data), økt-detalj drills/prep, `/admin/queue` «Løst»-kolonnen.
- **Ikke på cron:** `booking-optimizer` og `availability-24-7-monitor` finnes i cron-routen men mangler `vercel.json`-oppføring — kjører kun manuelt.
- **Ikke logget til AgentRun:** 8 agenter (se 3.1) er usynlige i agent-oversikten på `/admin/agents` ved feilsøking.
- **Agent-kjede:** `triggerRoundAgent` kjører round-agent → sg-analyse-ekspert → plan-revisjon → achievement → treningsdata-ekspert sekvensielt fire-and-forget — kommentaren i `triggers.ts` nevner Inngest/Trigger.dev hvis dette blir for tregt.
