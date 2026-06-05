# PlayerHQ — KOMPLETT BRIEF (last opp denne ene fila)

> ÉN selvstendig fil til Claude Design. Last opp DETTE + mappen `playerhq-skjermbilder/`.
> Velg **High fidelity**. Koble `akgolf-hq`-repoet (GitHub) for å gjenbruke koden. Alt står her.

**FIDELITY: High fidelity.** Designsystem og struktur er låst — bygg ferdig utseende, ikke wireframe.

---

## DESIGNSYSTEM — AK Golf HQ — Design System

> Last inn som «Design system» i Claude Design. Alt som bygges skal følge dette.

## Farger — lyst tema (PlayerHQ, Marketing, Forelder)

| Token | HEX | Bruk |
|---|---|---|
| background | #FAFAF7 | Side-bakgrunn |
| foreground | #0A1F17 | Primær tekst |
| card | #FFFFFF | Kort-bakgrunn |
| primary (forest) | #005840 | CTA, hovedhandling |
| primary-foreground | #D1F843 | Tekst på primary (lime) |
| accent (lime) | #D1F843 | Highlights, badges |
| accent-foreground | #005840 | Tekst på accent |
| secondary (sand) | #F1EEE5 | Chips, sekundærflater |
| muted-foreground | #5E5C57 | Sekundærtekst |
| success | #1A7D56 | OK |
| warning | #B8852A | Advarsel |
| destructive | #A32D2D | Feil / slett |
| info | #2563EB | Info |
| border | #E5E3DD | Borders |

## Farger — mørkt tema (AgencyOS, alltid `.dark`)

Speil samme paletten mørkt: dyp forest-bakgrunn, lyse kort-flater, lime som aksent, semantiske farger lysnet
for kontrast. AgencyOS er **alltid mørkt** — ingen tema-toggle.

## Typografi

| Font | Bruk |
|---|---|
| Inter | UI og brødtekst (standard) |
| Inter Tight | Display og hero (editorial italic tillatt på del av headline) |
| JetBrains Mono | KPI-tall, tabulære tall, eyebrows |

Ingen andre fonter. Ingen Instrument Serif.

## Ikoner

Kun **Lucide**. 24px, 1.5px strek, currentColor. **INGEN emoji** noe sted.

## Spacing

8pt-grid (8/16/24/32…). Unntak: data-tette flater i AgencyOS (dashboards, tabeller, timelines, innboks-rader)
kan bruke 12/14px tetthet — følg skjermbildene.

## Komponenter (gjenbruk, ikke gjenoppfinn)

Hero · FeaturedCard · KPI-strip · PyramidProgress (treningspyramide) · Eyebrow · Badge (ok/warn/urgent/lime/
primary/neutral) · Button · ActionList / QueueItem · Avatar · PulseDot · Greeting · DayCal · kalendere
(month-grid, session-scheduler, streak, day-planner, heatmap, year-plan-gantt).

## Stemning

Editorial sport-analytics. Rolig, presis. **PlayerHQ:** mer luft og fokus, mobil-først.
**AgencyOS:** høy datatetthet, desktop-først, mørkt — «Bloomberg for golf-coaching».

## Språk

All UI-tekst på norsk bokmål med æ, ø, å.

---

## OPPDRAG

Bygg **PlayerHQ** — spillerens app i AK Golf HQ — som én sammenhengende, klikkbar prototype.
Slank nybygging, ikke kopi: færrest mulig skjermer, **all planlegging samlet i Workbench**.
Følg designsystemet som er lastet inn, og bruk de opplastede skjermbildene som fasit for utseendet.

## HVA PLAYERHQ ER

Spillerens spørsmål er «hva skal JEG gjøre i dag?». **LYST tema, mobil-først (430px) + desktop.**
Navne-kanon: spiller = **Markus Berg**, coach = **Anders Kristiansen** (alltid fulle navn).
All UI-tekst på norsk bokmål med æ, ø, å. Kun Lucide-ikoner. Ingen emoji.

## STRUKTUR — 5 faste faner (mobil bunn-nav / desktop sidebar)

**Hjem · Planlegge · Gjennomføre · Analysere · Meg.**

**Coach er IKKE en femte fane** — det er en **skuff fra høyre** (utløst av coach-ikon i toppen), med faner:
Meldinger · Planer (→ Workbench) · Videoer · AI-Caddie. Femte fane er **Meg**.

## KJERNEPRINSIPP — Workbench er master

**Planlegge er ETT trykkpunkt → Workbench.** Ingen kort-meny, ingen wizard utenfor.
Workbench er master for ALT som planlegges: årsplan/periodisering, treningsplan, fysplan, mål, drills, ny økt
— som moduser i samme flate. «Planlegg i Workbench», «Se i planen», «svakhet → drill», «Planlegg mot turnering»
fører alle hit.

## SKJERMENE (og hva som slås sammen)

**Hjem** — foto-hero (hilsen + avatar + Performance Pro-pill), KPI-strip, dagens fokus-kort med «Start økt»,
dagens økter, treningspyramide, neste tee/turnering.

**Planlegge** — ett trykk → **Workbench** (master, moduser).

**Gjennomføre** — ÉN flate med faner: **I dag · Kalender · Booking**. «Start nå» → Live-økt.

**Analysere** — ÉN flate: sesong-header (HCP-trend + KPI) + faner **SG · Runder · TrackMan · Tester · Innsikt**.
«Loggfør runde» → Loggfør runde. (Statistikk = sesong-header, ikke egen side.)

**Meg** — profil, abonnement-kort (gratis via Performance Pro / 300 kr — INGEN tier-nivåer, ELITE finnes ikke),
KPI, konto-liste → undersider: Profil · Innstillinger · Helse · Utstyrsbag · Dokumenter · Hjelp · Abonnement.

**Nås inni (egne flater):** Live-økt (fullskjerm: brief → aktiv → logg → oppsummering) · Runde-detalj ·
**Turnering-detalj (NY — se under)** · Drill-detalj · Varsler · Coach-skuff.

**Auth + oppstart:** Logg inn · Registrer · Glemt passord · BankID · Foreldresamtykke (under 18) · Onboarding (5 steg).

## SLÅ SAMMEN (ikke lag duplikater)

- Planlegge-hub (6 kort) + separate Årsplan/Treningsplan/Fysplan/Mål/Ny-økt-wizard → **moduser i Workbench**.
- Statistikk + SG + TrackMan + Runder + Tester + Innsikt (6 sider) → **Analysere (faner)**.
- Kalender + Booking → **faner i Gjennomføre**.
- Dobbeltadresser (/analyse+/analysere, /stats+/statistikk) → **én av hver**.

## TO BESLUTNINGER (lean, godkjent retning)

1. **Økt-rad** (trykk på en økt) → åpne **selve økten** (Live for nå/kommende, oppsummering for ferdig) — IKKE en dagsliste.
2. **Turnering-kort** → bygg **Turnering-detalj** (NY): spillerens visning av én turnering — tee-tid, format,
   feltstørrelse, par/lengde, din status, medspillere i ballen, baneinfo, evt. fellesmelding fra coach,
   CTA «Planlegg mot» (→ Workbench) + «Legg til i kalender».

## LEVERANSE

Én klikkbar prototype der navigasjonen faktisk fungerer (hver knapp peker riktig). Lyst tema gjennomgående,
mobil bunn-nav + desktop sidebar. Mangler du noe, list det under «Åpne spørsmål» — ikke dikt.

---

## MOTOREN SOM ALLEREDE FINNES — PlayerHQ — motoren som ALLEREDE finnes i kode

> Spillerportalen er fullt bygd: 144 ruter, ~150 server-actions, 18 portal-motorer + delte motorer.
> Den slanke redesignen plugges på dette — ikke bygges blank. Per område: hva som finnes å koble til.

## Hjem
- **Motor:** `lib/portal-hjem/`, `lib/pyramide.ts` (treningspyramide), `lib/streak.ts`, `lib/sg.ts`.
- **Modeller:** User, TrainingPlanSession (dagens økter), Goal, Tournament/TournamentEntry, Round.

## Planlegge → Workbench (master)
- **Motor:** `lib/portal-workbench/`, `lib/workbench/`, `lib/ai-plan/`, `lib/fys/` (FYS: 25 tester/20 øvelser/12 maler), periodisering.
- **Modeller:** TrainingPlan(+Session/Log), SeasonPlan, PeriodBlock, TechnicalPlan(+Position/Task), FysiskPlan/FysUke/FysOkt, Goal, ExerciseDefinition, SessionDrill, LockedAnchor, RecurringPattern.
- **Actions:** opprettPlan, lagrePlan, leggTilOkt, leggTilUke, opprettPeriodBlock, createGoal, genererPlanForslag, aiSuggestWeek, generateWeekWithCaddie, koblTilArsplan … (hele planmotoren).

## Gjennomføre + Live-økt
- **Motor:** `lib/portal-live/`, `lib/portal-booking/`, `lib/booking/`, `lib/google-calendar.ts`.
- **Modeller:** TrainingSessionV2, SessionParticipant, SessionDrillInstance, SessionSet, DrillLogV2, Booking, ServiceType, Facility, CoachAvailability.
- **Actions:** startSession, pauseLiveSession, resumeLiveSession, completeSession, logRep(s), completeSet, freezeSessionSummary, createAdHocSession, cancelBooking, rescheduleBooking …

## Analysere (SG · Runder · TrackMan · Tester · Innsikt)
- **Motor:** `lib/portal-analyse/`, `lib/portal-sghub/`, `lib/portal-stats/`, `lib/portal-runder/`, `lib/portal-trackman/`, `lib/portal-tester/`, `lib/sg.ts`/`lib/sg-hub/`, `lib/trackman/`, `lib/datagolf/` (PGA-benchmark).
- **Modeller:** Round/Shot/ShotAnnotation, TestDefinition/TestResult/TestSession, TrackManSession/TrackManShot, SgBaseline/SgInsight, ClubMetricTrend, PgaPlayerSeason.
- **Actions:** createRound, logRoundManual, registrerScore, importFromGolfBox, importTrackMan(Csv/Html), logTest, saveShot, addAnnotation, exportRounds … (SG-beregning + import finnes).

## Turneringer + Turnering-detalj (NY skjerm)
- **Motor:** `lib/portal-turnering/`, `lib/turneringer/`, `lib/datagolf/`, `lib/scrapers/` (GolfBox live).
- **Modeller:** Tournament, TournamentEntry, TournamentResult, Bane, TournamentPreparation, LeaderboardSnapshot.
- **Actions:** meldDegPa, meldDegAv, leggTilTurnering, prepareForTournament, logTournamentResult, requestTournamentFocus, withdrawFromTournament.
- → Turnering-detalj trenger bare en skjerm — dataene (tee-tid, felt, resultater, prep) finnes.

## Coach-skuff + AI-Caddie
- **Motor:** `lib/portal-ai/`, `lib/caddie/`, `lib/anthropic.ts`.
- **Modeller:** CaddieMessage, CoachNote, SessionVideo, SessionRequest, Notification.
- **Actions:** askCoach, askCoachQuestion, sendCoachMelding, sendReply, requestSession, shareRound, shareDrillWithCoach, uploadMessageAttachment.

## Meg + undersider
- **Motor:** `lib/portal-meg/`, `lib/portal-abonnement/`, `lib/preferences.ts`, `lib/payments/` + `lib/stripe.ts`.
- **Modeller:** Subscription, PlayerEnrollment, Payment, HealthEntry, EquipmentBag, Document, ParentRelation/Invitation, EquipmentBag.
- **Actions:** oppdaterProfil, oppdaterPreferences, lagreHelseEntry, lagreUtstyrsbag, requestProUpgrade, cancelPro, inviterForelder, requestDataExport, deleteUserAccount, submitFeedback, submitSupportTicket.

## På tvers
- **Auth:** Supabase via `requirePortalUser()`. **AI:** `@anthropic-ai/sdk`. **Betaling:** Stripe. **Push:** web push (`lib/push/`).
- **Tier/abonnement:** `lib/feature-flags.ts` (gratis / 300 kr — ingen ELITE).

---

## Konsekvens for redesignen

PlayerHQ er **ikke ny funksjonalitet** — det er en **slankere overflate på en motor som finnes**. Derfor:

1. **Koble repoet** (`akgolf-hq`) i Claude Design — gjenbruk eksisterende komponenter, modeller og actions.
2. Hver ny/sammenslått skjerm peker til **eksisterende** action/motor over — datalaget bygges ikke på nytt.
3. Det vi faktisk lager nytt er KUN: **Turnering-detalj-skjermen** + å la **økt-rad åpne selve økten**. Resten er re-kobling.
