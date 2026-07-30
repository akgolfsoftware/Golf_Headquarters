# Funksjonsinventar — AK Golf HQ (2026-07-29)

Tellings- og lesejobb. Ingen kode er endret. Hver rad i tabellene er verifisert av en agent som har lest filen(e) den viser til — filstier er beviset. Der noe er anslått uten direkte lesing er det merket `[antatt]`. Metodikk: 13 parallelle research-agenter, hver med eget avgrenset område, deretter samlet i dette dokumentet. Alle stier er relative til repo-roten `~/Developer/akgolf-hq` (GitHub: `akgolfsoftware/Golf_Headquarters`).

**Avgrensning:** Marketing (`src/app/(marketing)/`, 72 sider) er ikke talt her — brukerens oppdrag definerte "fire produkter" som PlayerHQ, AgencyOS, Foreldreportal og klubbflatene, og marketing hører ikke naturlig til noen av dem. Auth/onboarding og interne verktøy (kommando, meg-toppnivå, intern, (internal), onboard, inviter) er tatt med som et femte, mindre avsnitt siden de er reell, adressbar kode i repoet, men de er ikke ett av de fire hovedproduktene.

---

## Tallene (siter disse)

| Produkt | Sider (`page.tsx`) totalt | Reelle skjermer | Rene redirects | Reelt forlatt/foreldreløst (0 innlenker) | Blokkert av rute/proxy (finnes, men uoppnåelig) |
|---|---|---|---|---|---|
| **PlayerHQ** (`src/app/portal`, inkl. `(legacy)`) | 166 (132 + 34) | 120 | 46 | ~11 | 5 |
| **AgencyOS** (`src/app/admin`, inkl. `(legacy)`) | 150 (101 + 49) | 110 | 40 | 9 | 0 |
| **Foreldreportal** (`src/app/forelder`) | 11 | 11 | 0 | 3 | 0 |
| **Klubbflater** (gfgk-junior + team-gfgk + team-wang) | 10 | 10 | 0 | 2 | 0 |
| **Auth/onboarding** (`src/app/auth`) | 14 (12 unike ruter) | 13 | 1 | 0 | 0 |
| **Interne verktøy** (onboard/inviter/intern/kommando/meg-topp/(internal)) | 24 | 18 | 6 | ~16 (delvis bevisst) | 0 |
| **Sum dekket i dette inventaret** | **375** | **282** | **93** | **~41** | **5** |
| Marketing (utenfor scope) | 72 | — | — | — | — |
| **Totalt i `src/app`** | **449** (verifisert `find`) | | | | |

Øvrige nøkkeltall: **158** Prisma-modeller (`prisma/schema.prisma`), **54** API-ruter (`src/app/api/**/route.ts`), **54** filer i `src/lib/agents/` (49 reelle agenter + 5 tester), **47** cron-entries i `vercel.json`, **3** skills + **4** tools + **7** agent-wrapper-filer i `src/lib/ai/`, pluss en helt separat kunnskapsbase på **16** filer i `src/lib/ai-coach/kunnskap/`.

---

# Del 1 — Produktene

## 1.1 PlayerHQ (`src/app/portal`)

**132 sider utenfor `(legacy)`** — 117 reelle skjermer, 15 rene redirects (`stats`, `tren/kalender`, `trackman`, `trackman/[sessionId]`, `baneguide`, `baneguide/[baneId]`, `baneguide/[baneId]/hull/[nr]`, `meg/abonnement/oppgrader`, `meg/innstillinger/eksport`, `analyse`, `tren/ovelser`, `tren/ovelser/[id]`, `meg/sikkerhet`, `(fullscreen)/tren`, `(fullscreen)/live/[sessionId]/logger`).

**34 sider i `(legacy)`** — 31 rene redirect-stubs, 3 med ekte innhold.

**Kritisk funn (påvirker begge lag):** `src/proxy.ts` kaller `workbenchRedirectForTrenPath()` (`src/lib/portal/tren-workbench-redirect.ts`) på hver request og fanger tre v2-skjermer FØR de når frem — `tren/fys-plan` (+ understier), `tren/teknisk-plan` (+ understier) og `tren/turneringer/<id>` redirectes ubetinget til `/portal/planlegge/workbench?tab=<x>`, som aldri leser `?tab=`-parameteret (`grep -n "tab" src/app/portal/planlegge/workbench/page.tsx` → 0 treff). Konsekvens: tre fullt utbygde, Prisma-koblede skjermer (`tren/teknisk-plan/[planId]/page.tsx` er den mest utbygde enkeltskjermen i hele PlayerHQ, 395 linjer med P-posisjoner/TM-mål/reps-logging) er kodemessig ferdige, men **ingen bruker kan noensinne se dem**. Samme mønster blokkerer 2 av de 3 "ekte" `(legacy)`-sidene (`tren/aarsplan/periode/ny`, `.../periode/[id]/rediger`) — begge v2-portet 18. juli med ekte `PeriodBlock`-data, men uoppnåelige.

### Funksjonsområder (117 reelle sider, gruppert)

| Funksjonsområde | Sider | Hva brukeren får gjort | Prisma lest | Prisma skrevet | Status |
|---|---|---|---|---|---|
| Hjem | 1 | Dagsoversikt, ukeplan-snutt, KPI | `TrainingSessionV2`, `TrainingPlanSession`, `Round`, `Goal`, `Notification`, `CoachingSession`, `TournamentEntry`, `DrillLogV2` | — | FERDIG |
| Live økt-gjennomføring | 5 | Brief→aktiv økt (loggfør reps, coach-chat)→oppsummering, tapper-telling | `TrainingSessionV2`, `TrainingDrillV2`, `DrillLogV2`, `CoachingSession`, `SessionBallLog` | Samme | FERDIG |
| Runde-føring | 2 | Fører runde hull-for-hull, SG server-side | `CourseDefinition`, `CourseHole` | `Round`, `HoleScore`, `Shot` | FERDIG |
| Testing | 5 | Testkatalog, historikk, scorekort, egen test | `TestDefinition`, `TestResult`, `TestAssignment` | Samme | FERDIG (unntatt proxy) |
| Turneringslogg — liste | 1 | Se påmeldte turneringer | `TournamentEntry` | — | FERDIG |
| Turneringslogg — detalj | 1 | Påmelding/avmelding, start turneringsrunde | `Tournament`, `TournamentEntry`, `Round` | `TournamentEntry`, `Round` | **DØD (proxy-blokkert)** |
| FYS-plan | 1 | Se FYS-planer | `FysiskPlan` | — | **DØD (proxy-blokkert)** |
| Teknisk plan (builder) | 1 | P-posisjoner, TM-mål, reps-logging (mest utbygde skjerm) | `TechnicalPlan`, `TechnicalPlanPosition`, `PositionTask`, `PositionTaskTmGoal` | Samme | **DØD (proxy-blokkert)** |
| Plan-feiring | 1 | Feire fullført plan, SG-delta | `TrainingPlan`, `PlanEffectiveness`, `Round`, `WagrSnapshot` | — | FERDIG |
| Gjennomfør (Gjør-hub) | 2 | Dagens økter, per-drill pyramide-toggle | `TrainingSessionV2`, `TrainingPlanSession` | `TrainingDrillV2` | FERDIG — kjernerute i bunn-nav |
| Trening-verktøy | 3 | Break-tabell, fri treningslogg, putte-lab | — | via API | **DØD** — 0 innlenker |
| Fysisk | 1 | Logg fysisk trening | `FysiskPlan`, `User` | — | FERDIG |
| Kalender | 1 | Dag/uke/måned/år: økter, turneringer, sesong | `TrainingSessionV2`, `SeasonPlan`, `TournamentEntry` | — | FERDIG |
| Planlegging/Workbench | 3 | Ukeplan, AI-planforslag, publisering | `TrainingPlan`, `TrainingPlanSession`, `Goal`, `OktMal`, `PlanTemplate`, `PeriodBlock` | Samme + `Notification` | FERDIG — hoved-nav-fane |
| Mål-hub | 3 | Mål/fremdrift, mål-detalj, AI-mål-wizard | `Goal`, `Achievement`, `Round` | `Goal` | FERDIG |
| Leaderboard | 1 | Rangering på snitt-SG (30d) | `User`, `Round` | — | HALVFERDIG/foreldreløs — kun lenket fra `(legacy)`-nav |
| Runde-logging | 5 | Rundeliste, ny runde, detalj m/SG, hull/slag | `Round`, `CourseDefinition`, `HoleScore`, `Shot` | Samme | FERDIG |
| TrackMan | 2 | Importerte økter+trend, sesjonsdetalj m/dispersion | `TrackManSession`, `TrackManShot`, `Signal` | Samme | FERDIG |
| SG-hub coach-modus | 3 | Coach ser spillerens køller/D-plane/utstyr | `User`, `CoachingSession`, `TrackManSession` | — | **DØD** — feilplassert under `/portal/`, ingen lenke |
| AI-verktøy | 3 | Drillforslag / turneringsforslag / SMART-mål-wizard | Diverse | `Goal` (kun mal-bygger) | BLANDET: 1 FERDIG, 2 DØD |
| Øvelsesbibliotek | 2 | Drill-galleri, detalj, legg i Workbench | `ExerciseDefinition`, `PlayerEnrollment` | — | FERDIG |
| Analyse (hovedflate) | 1 | 5 faner: SG/Trening/Tester/TrackMan/Statistikk | 8 modeller | — | FERDIG — kanonisk inngang |
| Hull-analyse | 1 | SG per sone, varmekart | `BrukerSgInput`, `TrainingPlanSession`, `Round`, `HoleScore` | — | FERDIG |
| Statistikk-drilldown | 1 | Dypdykk per disiplin | `SessionDrill`, `TrainingPlanSession`, `Round` | — | HALVFERDIG/foreldreløs — 0 lenker |
| Del runde | 1 | Se/dele én runde | `Round` | — | FERDIG (men "Lukk"-knapp → 404) |
| DataGolf | 1 | "Deg mot touren" | `BrukerSammenligning`, `PgaPlayerSeason` | — | FERDIG |
| Gameplan (banebibliotek) | 3 | Banekart→hull-detalj m/dispersion+sikte | `Bane`, `CourseHole`, `Shot`, `GameplanHull`, `GameplanSone` | `GameplanHull`, `GameplanSone` | FERDIG — komplett lese+skriv |
| Booking-flyt | 7 | Bla tjenester/coacher, bekreft credit-booking | `ServiceType`, `Location`, `Facility`, `Booking`, `Subscription` | `Booking`, `Subscription` | FERDIG |
| Mine bookinger | 2 | Se/bytte/avbestille | `Subscription`, `Booking`, `ServiceType` | Samme | FERDIG |
| Abonnement/betaling | 6+1 | Status/faktura, avbestill (Stripe-først), oppgrader | `Subscription`, `Payment` | `Subscription` | FERDIG |
| Profil/kontoinnstillinger | 15+2 | Profil/HCP, GDPR-eksport, ekte TOTP-2FA, anlegg/utstyr | `User`, `TrackManSession`, `GoogleCalendarConnection`, `EquipmentBag` | Samme | Stort sett FERDIG — 2 undersider (`ai-coach`, `okter`) er 0-lenket |
| Hjelp/support | 4 | FAQ, support-ticket | Statisk + `AppFeedback` | `AppFeedback` | FERDIG |
| Feedback | 1 | App-feedback | — | `AppFeedback` | FERDIG |
| Helse/skadelogg | 2 | Se søvn/puls/belastning, logg symptom | `HealthEntry`, `Leave` | `HealthEntry` | HALVFERDIG — `symptom/ny` sin `logSymptom` er en stub som **ikke lagrer noe** |
| Foresatte-oversikt | 1 | Se registrerte foresatte | `ParentRelation`, `User` | — | FERDIG |
| Dokumenter | 1 | Se dokumenter/kvitteringer | `Document` | — | FERDIG |
| Varsler | 1 | Se/marker lest | `Notification` | `Notification` | FERDIG |
| Utfordringer | 2 | Se/bli med/registrere score | `DrillChallenge`, `ExerciseDefinition`, `ChallengeParticipant` | Samme | FERDIG |
| Venner/sosial | 2 | Legg til venner, se AT de trent | `Friendship`, `User`, `Round`, `TrainingSessionV2` | `Friendship` | FERDIG |
| Talent/utviklingsplan | 5 | Nivå/radar, milepæler, roadmap, kohort | `TalentTracking`, `Goal`, `Round`, `TrainingPlanSessionLog`, `SeasonPlan`, `TechnicalPlan` | Ingen (rent lesende) | FERDIG |
| Spiller-detalj (generisk) | 1 | Se en spillers runder/stats/mål | `User`, `Round`, `TrainingPlan`, `CoachingSession`, `Goal` | — | FERDIG |
| Ønskelig økt | 2 | Be coach om ekstra økt | `ServiceType`, `User`, `SessionRequest` | `SessionRequest` | FERDIG |
| Meldinger til coach | 3 | Direkte meldingstråd | `CoachingSession`, `PlayerEnrollment`, `User` | `CoachingSession` | FERDIG |
| Spørsmål til coach | 3 | Stille/svare/tråd | `Question`, `User` | `Question` | FERDIG |
| Coach-hub + 5 underskjermer | 6 | Coachkort/planer/øvelser/SG-hub/videoer/AI-chat sett fra spilleren | Diverse | — | 1 FERDIG (hub), 5 HALVFERDIG/foreldreløs — nås kun via `(legacy)`-nav |

**Reelt forlatt (0 innlenker, verifisert med grep):** `trening/break-tabell`, `trening/logg`, `trening/putte-laboratoriet`, `mal/sg-hub/coach/*` (3 sider — coach-vendt funksjon feilplassert under spillerens rute), `ai/foresla-turnering`, `ai/mal-bygger` (skriver ekte `Goal`-rader, men ingen kan navigere dit), `meg/innstillinger/ai-coach`, `meg/innstillinger/okter`.

**Foreldreløst via legacy-nav (ikke i v2-nav/Cmd+K):** `mal/leaderboard`, `statistikk/[metric]`, `coach/{ai,videoer,ovelser,plans,sg-hub}`.

**Andre konkrete rutefeil funnet:** duplisert plan-bygger (`mal/bygger` og `planlegge/bygger` er samme kjerne, `src/lib/plan-builder/index.ts`, men to v2-komponenter lenker fortsatt til den gamle); `coach/sg-hub → /portal/mal/sg-hub`-lenke går i ring (finnes bare i legacy, redirecter tilbake); `DelRundeV2`s "Lukk"-knapp → `/portal/statistikk` (404); `coach/ovelser/ny` lenket fra to v2-komponenter men filen finnes ikke (404).

**Legacy — 5 bevisste blindveier** (v2-lister lenker dit, siden bounser tilbake til listen etter et kutt 22. juli, commit `24e142bf`): meldingstråd (`coach/melding/[id]`), plandetalj (`coach/plans/[planId]`), coach-profil (`coach/[coachId]`), ny øvelse (`coach/ovelser/ny`), ny utfordring (`utfordringer/ny`). Pluss `coach/ovelser/[id]/rediger` som er helt uten innlenking — **å redigere en eksisterende øvelse er i dag ikke mulig via UI**. `docs/MASTER-SKJERMPLAN.md` (rad 206–210, datert 17. juli) reflekterer ikke dette kuttet — kjent staleness.

---

## 1.2 AgencyOS (`src/app/admin`)

**101 sider utenfor `(legacy)`** — 84 reelle skjermer, 17 rene redirects (kanoniske alias-ruter).

**49 sider i `(legacy)`** — 26 reelle, 23 rene redirects.

### Funksjonsområder (84 reelle sider i current, gruppert)

| Funksjonsområde | Sider | Hva den gjør | Status |
|---|---|---|---|
| Cockpit/hub | 6 | Daglig brief, ukeskanban, oppgavekø, oppfølgingskø | 5 FERDIG, 1 HALVFERDIG (`agencyos/live` = statisk seed) |
| Innboks/varsler | 3 | Feedback-triage, e-postflate, varselsenter | FERDIG (3/3) |
| Godkjenninger | 1 | Samlet kø: PlanAction-diff, CaddieDraft, SessionRequest | FERDIG |
| Booking-administrasjon | 3 | Ukesoversikt+kapasitet, detalj, ny-booking-wizard | FERDIG (3/3) |
| Workspace/Notion | 3 | Oppgaver/prosjekter fra Notion-sync | 1 FERDIG, 2 HALVFERDIG (hardkodet sync-historikk, `SAMPLE_PROJECTS`-fallback) |
| Spilleroversikt/stall | 3 | Stall-liste, opprett, full dashboard (20+ modeller) | FERDIG (3/3) |
| Workbench/planlegging per spiller | 11 | Uke-canvas, tekniske planer, mal-bibliotek | 10 FERDIG, 1 HALVFERDIG (Periodisering/Effekt-faner er placeholder-tekst) |
| Spiller-analyse/fremgang/tester | 3 | SG-analyse, trend/volumkorrelasjon, testresultater | FERDIG (3/3) |
| Grupper | 6 | Gruppeliste/detalj/workbench/timeplan/årsplan/skoledata | FERDIG (6/6) |
| Caddie (AI-chat) | 3 | Direkte chat, proaktive forslag, aktivitetslogg | 2 FERDIG, 1 HALVFERDIG (selvmotsigende "ikke live ennå"-varsel på en fullt koblet side) |
| Agenter/agent-team | 3 | Kommando-prosjekter, agent-oversikt, agent-detalj | FERDIG (3/3) — men viser kun 13 av 49+ agenter |
| Talent | 2 | Uten-sporing-finder, pentagon-radar | FERDIG (2/2) |
| Rapporter/analyse (stall) | 4 | Stall-KPI, plan-etterlevelse, månedsrapporter, runder | FERDIG (4/4) |
| Tester (administrasjon) | 2 | Pågående sesjoner, foreslåtte tester | 1 FERDIG, 1 HALVFERDIG-[antatt] |
| TrackMan | 2 | Alle økter, detalj m/carry per kølle | FERDIG (2/2) |
| Turneringer | 4 | Liste, opprett, detalj, dublett-sammenslåing | 3 FERDIG, **1 ORPHANED** (`dubletter`) |
| Kalender | 3 | Ukekalender, opprett/rediger hendelse | FERDIG (3/3) |
| Økonomi | 1 | Inntekt/abonnement-KPI | FERDIG |
| Klubbinnstillinger/organisasjon | 6+1 | Org/team/tilgang, API-nøkler, kalender-synk, periode-fordeling | 5 FERDIG, **2 ORPHANED** (`settings/security`, `settings/api`) |
| Team/tilgang | 4 | Team-liste, inviter, CBAC-matrise, audit-logg | FERDIG (4/4) |
| Marketing-admin | 1 | Planlagte poster | FERDIG |
| Øktgjennomføring/live | 3 | Drift-hub, økt-detalj, ukens økter | 1 FERDIG, 2 HALVFERDIG — drift-hub lenker til **to ikke-eksisterende ruter** (`/admin/kalender/uke`, `/admin/locations` → 404, ikke merket `tom:true` som resten av de tomme snarveiene) |
| Øvrig/verktøy | 6 | Video-bibliotek, e-postmaler, drill-editor, hjelp, profil | 5 FERDIG, **1 ORPHANED** (`videoer`) |

**Orphaned men nåbar (fullt fungerende, ingen lenke i nav/Cmd+K):** `videoer`, `tournaments/dubletter`, `settings/security`, `settings/api`.

**Legacy — 5 reelt forlatt** (ekte Prisma-kobling, men 0 innlenker noe sted): `reach` (engasjement/compliance), `recording` (Whisper-transkribering), `talent/wagr-import`, `stats/overview` + `stats/moderering` (GDPR-slettekø — **praktisk talt utilgjengelig for coach**), `drills/forslag` (AI-drillgodkjenning — samme `CaddieDraft`-data håndteres trolig alt via `/admin/godkjenninger`).

**Andre eksplisitte halvferdig-funn:** `queue`s "Løst"-kolonne er arvet TODO til en `CoachingTask`-modell finnes; `gjennomfore/okter/[id]` har hardkodet `SESSION_DRILLS`-placeholder (flagget i egen kildekommentar).

---

## 1.3 Foreldreportalen (`src/app/forelder`)

**11 sider, alle reelle, 0 redirects.** Auth-gate: `requirePortalUser({allow:["PARENT"]})` i alle 11 filer, som bevisst kaller `getCurrentUserRaw` (ikke `getCurrentUser`) og gjør sin egen samtykke-redirect.

| Funksjonsområde | Sider | Hva den gjør | Prisma | Status |
|---|---|---|---|---|
| Ukentlig oversikt | `page.tsx` | Narrativ ukerapport, SG-trend, streak, coach-notat | `TrainingSessionV2`, `Round`, `Notification`, `TestResult` | FERDIG |
| Ukerapport (duplikat) | `ukerapport` | Identisk datauttrekk som oversikt, egen komponent | Samme | HALVFERDIG — foreldreløs duplikat |
| Se barns utvikling | `barn`, `barn/[childId]` | Liste + detalj m/plan, mål, runder, økonomi | `ParentRelation`, `TrainingPlanSession`, `Payment` | FERDIG |
| Se bookinger | `bookinger` | Kommende/tidligere, gruppert per uke | `Booking` | FERDIG |
| Melding til coach | `coach` | Vis coach, siste melding, e-post-CTA (ingen toveis dialog) | `Booking`, `Notification` | HALVFERDIG — bevisst redusert ambisjon |
| Økonomi/fakturaer | `okonomi`, `fakturaer` | Aggregert status + full betalingsliste | `Subscription`, `Payment` | FERDIG (kun lesing, ingen betal-CTA) |
| Samtykke (GDPR) | `samtykke` (+actions+eksport) | Sett samtykker, be om eksport/sletting | `ParentRelation`, `User.preferences`, `DataExportRequest` | FERDIG |
| Varsler | `varsler` | 8 nyeste varsler på tvers av barn | `Notification` | HALVFERDIG — "App-varsler kommer snart"-tekst, se dødliste |
| Innstillinger | `innstillinger` | Navn/e-post/telefon + barneliste | `ParentRelation` | HALVFERDIG — se dødliste |

**Reelt forlatt (0 innlenker):** `innstillinger`, `ukerapport`, `varsler`. Alle tre nås KUN via `src/components/forelder/sidebar.tsx` — en eldre navigasjonskomponent som selv aldri importeres/rendres noe sted (`ForelderSidebar`/`ForelderMobileNav` har 0 bruk i kodebasen). De øvrige 8 sidene er bekreftet reelt lenket fra `src/components/portal/v2/Forelder*V2.tsx`-komponentene.

---

## 1.4 Klubbflater (WANG, GFGK, GFGK junior)

**10 sider, alle reelle, 0 redirects.**

**GFGK junior (`src/app/gfgk-junior`, 6 sider)** — offentlig microsite, egen header-nav, alle 6 lenket internt. Forside, gruppeside `[gruppe]`, kalender, treningsplaner, veileder-oversikt + artikkel. Data: `Group`/`GroupSchedule` via `hentGfgkGruppe()`/`hentAlleGfgkGrupper()`. Veileder-delen (2 sider) er ren statisk tekst (1048-linjers array), ikke database-koblet. Alle FERDIG.

**team-gfgk (1 side)** — delbar foreldremøte-presentasjon (deck), 10 navngitte spillere, sesongresultater 2025–26. All data hardkodet i `data.ts` (4756 linjer, "Auto-generert snapshot ... Ikke rediger manuelt"). 0 innlenker fra resten av appen — bevisst frittstående delingslenke, ikke en glemt side, men fryser med mindre den regenereres manuelt. FERDIG som engangs-deck.

**team-wang (3 sider)** — fellesside (4 faner: Oversikt/Plan/Skole/Foreldre) leser ekte `Group`/`GroupPeriodBlock`/`SchoolScheduleEntry`, men selve øktinnholdet er statisk demo (`wang-plan.ts`, 1983 linjer). Coach-årsplan (`coach/page.tsx`) er eksplisitt "Demo-data; ingen ekte auth/DB ennå" i kildekommentar. Innlogging (`logg-inn/page.tsx`) er kun et WANG-brandet forspill foran ekte `/auth/login` pluss en frittstående, ikke-koblet "administrer brukere"-demo.

**Reelt forlatt/ikke lenket internt:** `team-wang/coach`, `team-wang/logg-inn` — 0 innlenker, ingen av de 3 team-wang-sidene lenker til hverandre. Kildekommentarer bekrefter "innloggingskrav fjernet midlertidig for demo/deling" — bevisst midlertidig, ikke en feil.

---

## 1.5 Auth/onboarding og interne verktøy (utenfor de fire hovedproduktene)

**Auth (`src/app/auth`, 14 filer/12 ruter):** Innlogging (e-post+Google OAuth), signup, glemt/tilbakestill passord, e-post-verifisering-venteskjerm, post-login-routing, Stripe checkout-gjenopptak, foreldresamtykke-flyt (full GDPR-kjede med token-validering, CSRF-sjekk, audit-logg), spiller-onboarding (6-stegs wizard). Alt FERDIG bortsett fra `bankid/page.tsx` — en 100 % statisk UI-plassholder, ingen backend, eksplisitt merket "kommer post-beta". `logg-inn` er en ren `permanentRedirect` til `login` (62 treff for `login` vs. 1 for `logg-inn` i kodebasen) — teknisk fungerende, men internt ubrukt.

**Interne verktøy:**
- `onboard/{coach,klubb}` (2 sider) — reelle flerstegs-wizarder som skriver ekte til `User.preferences`, men **ingen egen `Klubb`-modell finnes** (eksplisitt kommentert i koden: "TODO: opprett egen Klubb-modell senere"). Google Calendar-tilkobling, logo-opplasting, CSV-spillerimport og Stripe Connect er alle TODO/ren UI-mock. 0 innlenker — coach-invitasjonsflyten sender faktisk brukeren til `/auth/login`, ikke hit.
- `inviter/forelder/[token]` (1 side) — komplett, fungerende ende-til-ende-flyt (token-validering, Supabase Auth-opprettelse, `ParentRelation`-upsert). FERDIG, bekreftet lenket fra AgencyOS spillerprofil.
- `intern/komponenter` (6 sider) — internt, ADMIN-gatet komponent-demobibliotek, 100 % mock-data, bevisst uten navigasjonsinngang ("bør gates eller fjernes før produksjon" — gatingen er gjort, fjerning ikke).
- `kommando/*` (6 sider) — **alle er nå rene redirects** til `/admin/*`. Flaten beskrevet i prosjektets CLAUDE.md ("chat med alle agenter") eksisterer ikke lenger som egen URL — funksjonen lever videre på `/admin/agenter`, `/admin/agent-team` osv., men ingenting i appen lenker lenger til `/kommando/*` selv (kun nåbar via direkte URL).
- `meg/*` (toppnivå, 3 sider — merk: IKKE samme som `portal/meg`) — Anders' personlige Telegram-bot-dashbord. Leser Supabase (egen database, ikke Prisma) for dashbordet; `dispatch`/`morgenbrief` leser JSON-filer fra `~/ak-brain/` på Mac Mini — returnerer `null` med ærlig tom-tilstand på Vercel. Google Calendar/Notion-kobling finnes i `src/lib/meg/connectors/`, men ikke i selve sidefilene.
- `(internal)` (6 sider) — design-lab + 4 wizard-demoer (plan-bygger, newplan, ny-økt, TrackMan-import), alle ADMIN-gatet, alle mock-data, bevisst ikke i navigasjon.

---

## 1.6 Asymmetri: AgencyOS vs. PlayerHQ

| Finnes i AgencyOS, ikke i PlayerHQ | Finnes i PlayerHQ, ikke i AgencyOS |
|---|---|
| Godkjenningskø for AI-forslag (PlanAction/CaddieDraft) | Gamification: Utfordringer + Venner (sosialt lag) |
| Turneringsadministrasjon (opprett/merge/dubletter) | Egen bane-sikte-planlegging (Gameplan m/dispersion) |
| Klubbinnstillinger, team/tilgang (CBAC-matrise), audit-logg | Selvbetjent abonnement (avbestill/oppgrader via Stripe) |
| E-postmaler, drill-editor (opprett/rediger øvelser) | DataGolf "deg mot touren"-sammenligning |
| Opptak + Whisper-transkribering av coaching-økter | Helse/skadelogg som selvregistrering |
| Peer-/kohort-sammenligning på tvers av spillere (talent/radar) | Foresatte-oversikt |
| Økonomi-KPI, månedsrapporter | AI-coach-chat (spiller-vendt, separat fra Caddie) |
| Agent-administrasjon (kjør manuelt, se logg) | Putte-lab/break-tabell (egentrening-verktøy) |

Asymmetrien er forventet i det meste (coach styrer drift/økonomi/turneringer/godkjenninger, spiller styrer egen sosial/helse/økonomi-selvbetjening) — men to gap peker mot reelle hull: **ingen admin-side lar coach bygge en Gameplan/sikte-plan for en spiller** (spilleren gjør det selv, coach har ingen tilsvarende verktøy), og **ingen spiller-side viser AI-forslagene som venter på godkjenning hos coachen** (spilleren ser ikke at et forslag er "på vei").

---

# Del 2 — Agentlaget

## 2.1 Cron vs. `src/lib/agents/` — dekning

47 cron-entries i `vercel.json`. **27 treffer direkte** en funksjon i `src/lib/agents/` (via den dynamiske ruten `src/app/api/cron/[agent]/route.ts`). **20 er reelle, fungerende cron-jobber som bevisst ligger utenfor `src/lib/agents/`** — i `src/lib/sg-hub/`, `src/lib/turneringer/`, `src/lib/stats/`, `src/lib/admin/benchmark-sync.ts`, `src/lib/meg/briefs.ts`, eller egne route-filer (`check-stuck-bookings`, `cleanup-deleted-accounts`, `notion-sync`). Ingen "spøkelses-cron" ble funnet — alle 47 kaller reell, eksisterende kode.

**Motsatt retning:** `availability-24-7-monitor.ts` er registrert som kjørbar agent, men har **ingen** cron-entry — kun manuelt kjørbar fra `/admin/agents`. Navnet antyder kontinuerlig drift; det er den ikke. Bevisst manuell-kun ifølge kodens eget register, men verdt å nevne siden navnet er misvisende.

## 2.2 Agent-familier (49 reelle agenter, gruppert)

| Agent(er) | Utløser | Skriver til | AI-modell | Hvor vises resultatet |
|---|---|---|---|---|
| `plan-watcher`, `training-gap`, `weekly-plan-proposals`, `plan-effectiveness-agent`, `churn-radar` | Cron (ukentlig) | `PlanAction`, `Signal` | Ingen (regelbasert) | `/admin/godkjenninger`, `/admin/queue` |
| `round-agent`, `test-agent`, `trackman-agent`, `sg-analyse-ekspert`, `treningsdata-ekspert`, `periodiserings-agent` | Hendelse (ny runde/test/TrackMan-import/plan, via `triggers.ts`) | `Signal`, `PlanAction` | Ingen | Godkjenningskø, `/portal/mal/trackman` |
| `achievement-agent` | Hendelse (etter runde/test) | `Achievement` | Ingen | **Ingen skjerm funnet som leser `Achievement`** — se 2.4 |
| `live-coach-agent`, `swing-video-analyst` | Hendelse (live økt) | `CoachingSession` | **Claude** (`claude-sonnet-4-6`) | `/portal/live/[sessionId]` |
| `peaking-agent` (→ `lib/ai/agents/performance-peaking.ts`), `plan-revisjon-agent` (→ `lib/ai/agents/plan-revision.ts`) | Manuell (coach velger spiller/plan på agent-detaljside) | Ingen egen tabell — resultat kun inline i respons | **Claude** | Inline på `/admin/agents/{peaking,plan-revisjon}` — forsvinner ved sideoppfrisking |
| `plan-revision-actions.ts` (`runPlanRevisionAgent`) | Hendelse (etter ny runde) | `PlanAction` | **Claude** (samme underliggende funksjon som over) | Godkjenningskø — **se 2.4, navnekollisjon** |
| `caddie-proactive`, `drill-forslag-agent` | Cron + manuell | `CaddieDraft` | **Claude** (kun drill-forslag) | `/admin/agencyos/caddie`, `/admin/godkjenninger`, legacy `/admin/(legacy)/drills/forslag` (orphaned) |
| `booking-optimizer`, `availability-24-7-monitor`, `availability-gap-filler`, `booking-conflict-monitor`, `demand-predictor`, `booking-alerts-proactive` | Cron + manuell | `PlanAction` | Ingen | Godkjenningskø |
| `ai-code-reviewer` | Cron man 03:00 + manuell | `PlanAction` | **Ingen — se 2.4, kritisk funn** | Godkjenningskø |
| `daily-brief-agent` (→ `lib/ai/agents/daily-brief.ts`) | Cron daglig 05:30 + manuell | Kun varsel ved hastefunn | **Claude** | **Kun hastefunn vises — se 2.4** |
| `betalings-purring`, `ukesoppsummering`, `maanedsrapport`, `lead-oppfolging`, `wagr-sync` | Cron | `PlanAction`/`Notification`/`MonthlyReport`/`WagrSnapshot` | Ingen | `/admin/email-templates`, `/portal/varsler`, `/admin/reports`, `/admin/(legacy)/talent/wagr-import` |
| `tripletex-lonn-agent`, `tripletex-maanedsavslutning-agent` | Cron (3./6./2. i mnd) | Ingen tabell — kun varsel | Ingen | Telegram/push til Anders (per design — agenten skal aldri bokføre) |
| `gfgk-ballplukking-agent`, `mulligan-vaskeliste-agent` | Cron (ons/man) | `AgentRun` (bekreftelse) | Ingen | Telegram |
| `calendar-sync`, `refresh-calendar-watches`, `cleanup-recordings`, `booking-reminders` | Cron | `Booking`, `GoogleCalendarSubscription`, `SessionRecording` | Ingen | Ingen egen skjerm — bakgrunnsvedlikehold andre skjermer er avhengige av |
| `accept-plan-action`, `plan-action-executor`, `notify-plan-action`, `agent-notify`, `agent-runner` | Infrastruktur (kalt av 6+ andre agenter/godkjennings-UI) | `PlanAction`, `Notification`, `AgentRun` | Ingen | `/admin/godkjenninger`, `/admin/varsler`, `/admin/agents/[agentId]` (kjøringslogg) |

## 2.3 AI-laget (`src/lib/ai/`)

- **3 skills** (`src/lib/ai/skills/`): pyramide-taksonomi, Bompa-perioder, SG-tolkning — injiseres **ubetinget og i sin helhet** i alle prompts som bruker `ALL_SKILLS` (ingen relevans-filtrering).
- **4 tools** (`src/lib/ai/tools/`): `get_spiller`, `get_runder`, `get_sg_data`, `get_treningsplan` — alle rene Prisma-lesninger, ingen skrive-tools.
- **`memory.ts`**: en ren in-memory `Map` (ikke persistert — forsvinner ved server-restart). Kommentaren i filen sier selv at en fremtidig Prisma-modell `AiMemory` skal erstatte dette; den finnes ikke i schema per i dag.
- **Parallell kunnskapsbase:** `src/lib/ai-coach/kunnskap/` (16 markdown-filer med CANON-invarianter, MORAD, SG-til-MORAD-mapping) er et **helt separat, mer modent system** — RAG-basert seleksjon (`rag-select.ts`, tag-drevet, maks 5 filer) brukt KUN av spillerens AI Coach (`src/lib/ai-plan/`), ikke av AgencyOS-agentene. Konsekvens: **Caddie, Daily Brief og de andre AgencyOS-agentene har ikke tilgang til CANON v3.5-apparatet** som PlayerHQs AI Coach har — de opererer på det tynnere pyramide/Bompa/SG-settet.

## 2.4 Kritiske funn i agentlaget

1. **`ai-code-reviewer.ts` produserer ikke ekte analyse.** Skriver tre hardkodede, identiske forslagstekster til `PlanAction` hver kjøring — ingen kodeanalyse, ingen AI-kall. Kommentaren i filen sier selv: "Enkel statisk analyse ... i virkeligheten ville dette trigge AI workspace."
2. **To "plan-revisjon"-agenter med nesten identisk navn** kaller samme underliggende AI-funksjon via separate kodeveier (`plan-revisjon-agent.ts`, manuell, vs. `plan-revision-actions.ts`, automatisk) — rot verdt å rydde i designfasen.
3. **`daily-brief-agent` er duplisert.** `/admin/agencyos` bygger sin egen morgenbrief live (`src/lib/agencyos/daily-brief-data.tsx`) — helt separat fra cron-agentens `genererDailyBrief()`. Cron-agentens fulle brief-tekst havner kun i `AgentRun.output`; kun de mest alvorlige funnene (severity ≥ 4) når frem som varsel. Resten av arbeidet cron-agenten gjør er reelt bortkastet.
4. **Hardkodet domenekunnskap avviker fra egne skill-filer.** `performance-peaking.ts` og `sg-interpretation.ts` (i `src/lib/ai/agents/`) hardkoder egne pyramide-vektingstall og SG-terskler i kode som **ikke stemmer overens** med tallene i `src/lib/ai/skills/bompa-perioder.ts` og `sg-interpretation.ts` (skill-varianten) — to kilder til samme kunnskap med ulike fasiter.
5. **`achievement-agent`** skriver ekte data ingen skjerm (funnet) leser.

---

# Del 3 — Tre horisonter

## A · Virker i dag

**282 reelle skjermer** på tvers av de fire produktene fungerer teknisk sett (Prisma-koblet, ekte server actions). Av disse er et betydelig mindretall **reelt uoppdagbare** for brukeren de er bygget for — enten proxy-blokkert (5, alle PlayerHQ), reelt forlatt uten innlenking (~20 på tvers av PlayerHQ+AgencyOS+Foreldreportal+klubbflater), eller bevisst skjult (interne verktøy). Dette er ikke et "A eller B"-spørsmål i streng forstand — koden er A (virker), men *oppdagbarheten* er ikke det. Siden Anders' eget produktprinsipp er "vanskelig å forstå = feil design," bør disse ~25 sidene telles som en egen kategori i designfasen: **A-kode, B-oppdagelse** — de billigste rettelsene i hele inventaret (se Del 5).

## B · Ligger til rette (datamodell finnes, mangler kobling)

| Funksjon | Hva finnes | Hva mangler (i arbeid, ikke tid) |
|---|---|---|
| Formtopping med baneprofil som input | `peaking-agent.ts`/`performance-peaking.ts` fungerer, tar kun HCP+dato | Utvid funksjonssignaturen til å ta banedata; la fase-fordelingen variere med lengde/greenhastighet — én ny funksjon |
| Turneringsoppslag fra fritekst i Caddie | `Tournament`/`TournamentEntry` finnes, synk kjører (GolfBox/NGF/GJGT) | Én ny Caddie-tool `findTournament({query})`, samme mønster som eksisterende `searchPlayers` |
| Levere en hel ukesplan i godkjenningskø | `PlanAction`-kø fungerer og er i bruk | Caddie i dag legger kun strukturerte plan-*endringer* i kø (`CaddieDraft`→`Notification`, ikke `TrainingPlan`) — én ny strukturert Caddie-tool som skriver til `PlanAction` i stedet |
| Coach-onboarding (kalender/sertifisering) | Skriver ekte til `User`, 4-stegs wizard fungerer | Kun Google Calendar-tilkoblingen er TODO/mock — resten er reelt |
| Achievement-visning | `achievement-agent.ts` skriver ekte data | Én ny skjerm (eller -seksjon) som leser `Achievement` |
| Coach bygger Gameplan for en spiller | `Bane`/`CourseHole`/`GameplanHull`/`GameplanSone`-modellene og skrive-actions finnes (spiller-siden) | Ingen admin-UI gjenbruker samme skrive-actions fra coach-siden — sannsynligvis kun en ny rute, samme domenelag |
| Oppmøteregistrering gruppetrening (WANG/GFGK) | `SessionParticipant` dekker nesten samme form (deltakerstatus INVITED/ACCEPTED/ATTENDED/NO_SHOW) | Feil relasjon i dag (koblet til `TrainingSessionV2`, ikke `Group`/`GroupSchedule`) — trolig en ny FK-relasjon, ikke en helt ny modell (grensetilfelle mot C, se under) |
| Reell WANG-øktinnhold (i dag statisk demo) | Roster/perioder/skolerute er ekte DB-data | Selve drill-/timeplan-innholdet (1983 linjer statisk `wang-plan.ts`) må kobles til `TrainingPeriod`/`CompetenceGoal` på samme måte som resten av flaten |

## C · Krever ny datamodell

Verifisert direkte mot `prisma/schema.prisma` (158 modeller):

| Kandidat | Status | Detalj |
|---|---|---|
| Faktura/invoice-modell | **Mangler** | Kun `Payment.stripeInvoiceId` — ingen egen fakturaentitet med linjer/mottaker |
| Budsjett/resultat per virksomhet (Mulligan, Academy, Software, WANG, GFGK) | **Mangler** | `weeklySessionBudget` finnes kun som treningsøktbudsjett, ikke økonomisk |
| Tripletex-kobling/synk-tabell | **Mangler** | Agent-kode (`tripletex-lonn-agent.ts` m.fl.) finnes og kjører, men uten datalag bak seg |
| Varelager/ordre (Skarpnord Golf Products) | **Mangler** | 0 treff |
| Ansatt/timeliste/lønn | **Mangler** | 0 treff |
| Politiattest med utløpsdato | **Mangler** | 0 treff |
| Forsikring/HMS | **Mangler** | 0 treff |
| Kontraktsentitet utover filpeker | **Mangler** | `Document`-modellen er en ren filpeker (tittel/url/kind) — ingen parter/utløp/signeringsstatus |
| Vedlikeholdslogg anlegg/simulator | **Mangler** | `Facility` har ingen tilknyttet loggtabell |
| Ekte multi-tenant `Organization` | **Bekreftet enkelt-tenant** | `ClubSettings` er en singleton (ingen tenantId, ingen FK fra andre modeller), kode-kommentar bekrefter det |
| LIFE-koder som egen modell | **Bekreftet kun tekstfelt** | `lifeKode String?` på `TrainingDrillV2` — fri streng, ingen enum/taksonomi-tabell |

---

# Del 4 — Testcase: "Opprett treningsplan for Fredrik Hovland mot Losby-turneringen neste helg"

*(Dekomponert av dedikert research-agent, samme bevisstandard som resten av dokumentet.)*

| # | Steg | A/B/C | Bevis | Begrunnelse |
|---|---|---|---|---|
| 1 | Tolke intensjon fra fritekst | **B** | `src/lib/caddie/tools/read.ts` (`searchPlayers`), `src/app/api/caddie/chat/route.ts` | Generisk Claude tool-use-infrastruktur finnes (Caddie-chat). `getTournaments` har kun filter `upcoming/past/all`, ingen navn/bane-søk. **Mangler:** én ny tool `findTournament({query})`, samme mønster som `searchPlayers`. |
| 2 | Slå opp spiller + kategori/periode/last/teknisk plan | **A** | `src/lib/ai-plan/context.ts` (`byggSpillerKontekst`) | Solid og fullt koblet — men kalles kun fra spiller-initierte ruter og `/api/admin/ai-plan`, ikke fra Caddie-chat. |
| 3 | Slå opp turneringen | **A/B** | `Tournament`/`TournamentEntry`, `src/lib/scrapers/{golfbox,ngf,gjgt}.ts` | Synk-pipeline kjører og fungerer. Ingen Caddie-tool kobler navnesøk mot den ennå (samme mangel som steg 1). "Losby" ble ikke funnet i noen ekte `Tournament`-rad, kun i statisk testdata. |
| 4 | Skaffe baneprofilen (lang/kort, smal/bred, greenhastighet) | **C** | `Bane`/`CourseHole`, `scripts/import-bane-osm.ts` | Kun 9 baner er importert — alle i Østfold. Losby (Akershus) er ikke blant dem. **Ingen felt** for greenhastighet eller fairway-bredde finnes noe sted i schema. |
| 5 | Utlede treningskonsekvens (baneprofil → pyramide/kategori/AK-formel) | **C** | Verifisert fravær i `src/lib/ai-plan/`, `src/lib/canon/`, `session-generator.ts` | 100 % ubygget — verken kode eller kablet prompt-sti finnes. Dette er den tyngste enkeltblokken i hele flyten — reell metodikk-utvikling, ikke bare wiring. |
| 6 | Generere uka (session-generator + plan-builder + invarianter koblet) | **B/C** | `src/lib/portal/training/session-generator.ts`, `src/lib/plan-builder/`, `src/lib/canon/*` | `ConditionalRule`-motoren implementerer kun to regler i dag; en nevnt `FORE_TURNERING`-regel er kun et navn i en kommentar, ikke bygget. De to plan-produserende kodeveiene (`session-generator` og `genererPlan`/ai-plan) er ikke koblet til hverandre, og ingen av dem tar course-profil som input. |
| 7 | Formtopping mot dato | **B** | `src/lib/agents/peaking-agent.ts`, `src/lib/ai/agents/performance-peaking.ts` | Fase-planen er en ren deterministisk Bompa-tabell basert kun på antall uker til turnering — samme output uansett baneprofil. Konkret: utvid funksjonssignaturen med banedata. |
| 8 | Levere som utkast i godkjenningskø | **A/B** | `PlanAction`-kø (`/admin/godkjenninger`) fungerer; Caddie sin `CaddieDraft`→`Notification`-vei skriver kun fritekst, ingen strukturert plan | To separate godkjenningsløp finnes; en hel ukesplan har i dag ingen strukturert vei inn i noen av dem. |

**Hvilket steg er lengst unna:** Steg 5 (baneprofil → treningskonsekvens) — reelt **C uten noe å bygge videre på**, ikke B. Steg 4 (selve baneprofilen) er teknisk sett en eksisterende modell, men mangler både Losby-data og feltene som trengs. Til sammen gjør dette hele flyten til **minst en måneds arbeid, ikke en ukes** — steg 1-3 og 8 (infrastrukturen) er derimot de billige, nære delene.

**Hva ville en bane-agent trenge:**
- **(a) Modell:** `Bane`+`CourseHole` er riktig utgangspunkt, men trenger utvidelse med greenhastighet/fairway-bredde/klassifisering — disse feltene finnes ikke i dag. `GameplanHull`/`GameplanSone` er FEIL modell å gjenbruke — de er spillerens egne historiske sikte-/spredningsdata, ikke en objektiv baneprofil.
- **(b) Kilder:** OSM/Overpass API er den eneste eksterne kilden koblet opp i dag (`scripts/import-bane-osm.ts`) — ingen kommersiell banedata-leverandør eller GolfBox-banekort er integrert.
- **(c) Hentes ekstern banedata i dag:** Ja, bekreftet — men kun for de 9 Østfold-banene som allerede er importert. En bane-agent for Losby ville i praksis kjøre samme script med en ny bbox-konfigurasjon, ikke bygge en ny integrasjon.

---

# Del 5 — Hva plattformen ligger til rette for (billigste retninger først)

1. **Koble opp igjen ~25 reelt fungerende, men uoppdagbare skjermer.** Ren navigasjons-/lenkejobb, null ny kode: fjern proxy-blokkeringen av de 3 utbygde PlayerHQ-skjermene (fys-plan, teknisk-plan, turneringsdetalj) + de 2 legacy periode-sidene; legg til lenker for AgencyOS' 4 orphaned sider (`videoer`, `tournaments/dubletter`, `settings/security`, `settings/api`) og de 5 reelt forlatte legacy-sidene (særlig `stats/moderering` — en fungerende GDPR-slettekø ingen kan nå); erstatt Foreldreportalens døde `sidebar.tsx` med reelle lenker til `innstillinger`/`ukerapport`/`varsler`; fjern de 2 broken-404-lenkene i AgencyOS' drift-hub (`gjennomfore/page.tsx`).
2. **Fiks 5 bevisste blindveier i PlayerHQ (legacy)-detaljsider** fra 22. juli-kuttet — enten gjenopprett detaljvisningen eller fjern CTA-en i v2-listen. Samme billige kategori som punkt 1.
3. **Koble `achievement-agent`s output til en skjerm.** Data skrives allerede — mangler kun visning.
4. **Rydd opp i to duplikate agent-implementasjoner** (`plan-revisjon-agent` vs. `plan-revision-actions`, `daily-brief-agent` vs. `agencyos/daily-brief-data.tsx`) — konsolider til én kodevei per funksjon. Ingen ny kapasitet, men fjerner en kilde til motstridende output.
5. **Gjør `ai-code-reviewer` ekte eller fjern den** — den produserer i dag identisk, hardkodet output hver uke og villeder om at reell kodeanalyse skjer.
6. **Utvid banedatabasen til flere baner med eksisterende script.** `scripts/import-bane-osm.ts` er allerede bygget for akkurat dette — én ny bbox-konfig per bane, ingen ny integrasjon. Åpner både Del 4-scenarioet og generell banedekning.
7. **Løft AgencyOS-agentene (Caddie, Daily Brief m.fl.) til samme kunnskapsdybde som PlayerHQs AI Coach** ved å koble dem til `src/lib/ai-coach/kunnskap/` sitt RAG-utvalg i stedet for det tynnere `src/lib/ai/skills/`-settet. Infrastrukturen (RAG-seleksjon, tagging) finnes allerede og trenger bare en ny konsument.
8. **La coach bygge Gameplan for en spiller** — samme skrive-actions (`lagreSikte`, `leggTilSone`) som spillersiden bruker i dag, kun en ny admin-rute som kaller dem for en valgt spiller. Rett vei inn i Del 4s steg 4/5 uten å vente på full baneprofil-metodikk.
9. **Rett opp navnekollisjonen og hardkodede skill-avvik** i `src/lib/ai/agents/{performance-peaking,sg-interpretation}.ts` mot deres egne skill-filer — begge kilder finnes allerede, det er kun spørsmål om å velge én fasit.
