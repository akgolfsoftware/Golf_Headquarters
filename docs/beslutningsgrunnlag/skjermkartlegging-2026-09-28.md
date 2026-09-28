# Skjermkartlegging PlayerHQ og AgencyOS — 28.09.2026

Grunnlag for grillingen runde 8 (`grillingen-runde8-skjermer-2026-09-28.md`). Alt her er
målt i kode eller i Claude Design 28.09.2026, med mindre det står «vurdering».
Kilder: `src/app/portal`, `src/app/admin`, `src/components/v2/shell.tsx`,
`src/lib/agencyos/skall-ia.ts`, Claude Design «AK Golf Precision Athletics» (`7d7c2994`) og
«AK Golf Training Motor» (`4917465a`).

Regel for tellingen: en `page.tsx` er **videresending** når den bare kaller `redirect()` eller
`permanentRedirect()` og ikke tegner noe. Alt annet er **skjerm**, også sider som sender
enkelte roller videre.

| | Totalt | Videresending | Skjerm |
|---|---|---|---|
| `/portal` (PlayerHQ) | 177 | 47 | 130 |
| `/admin` (AgencyOS) | 163 | 99 | 64 |

---

## A. Skjermer i appen

### Menyene slik koden viser dem

**PlayerHQ** (`PLAYERHQ_NAV`, `shell.tsx`): I dag `/portal` · Plan `/portal/planlegge` ·
Analyse `/portal/analysere` · Meg `/portal/meg`. Ingen «Mer».

**AgencyOS** har tre menyoppsett i koden:

1. Det som faktisk vises (`AGENCYOS_SKALL_TABS`, `skall-ia.ts`): Stall `/admin/spillere` ·
   Workbench `/admin/plan` · Kø `/admin/ko` · Jarvis `/admin/agenticos` (videresender til
   `/admin/jarvis`) · Meg `/admin/profile`. Under Meg: Konsoll `/admin/agencyos`, Økonomi,
   Kalender, Personlig innboks `/meg`.
2. `AGENCYOS_NAV` (bare markering og tellere): Cockpit, Innboks, Kalender, Stall, Workbench,
   Innsikt, Oppsett.
3. `AGENCYOS_ROM` («Mer»): AgenticOS, Plan, Stall+ (grupper), Økonomi, Drift.

Avvik mot beslutningene: «Coach-menyen følger prototypen fra 02.09 (Cockpit, Innboks, Stall,
Kalender, Workbench + Mer)». Menyen som vises, er en annen.

### PlayerHQ — 130 skjermer

**I dag (1):** `/portal`.

**Plan / Planlegging (23):** `/portal/planlegge`, `planlegge/bygger`, `planlegge/workbench`,
`kalender`, `kalender/opptatt`, `fysisk`, `tren/fys-plan`, `tren/teknisk-plan/[planId]`,
`tren/feiring/[planId]`, `tren/turneringer`, `tren/turneringer/[id]`, `utviklingsplan`,
`drills`, `drills/[id]`, `tren/wb`, `tren/wb/[sessionId]`, `onskeligokt`,
`onskeligokt/bekreftet`, `gameplan`, `gameplan/[baneId]`, `gameplan/[baneId]/hull/[nr]`,
`ai/foresla-drill`, `ai/foresla-turnering`.

**Analyse / Stats (22):** `/portal/analysere`, `analysere/datagolf`,
`analysere/datagolf/stasjon`, `analysere/historikk`, `analysere/hull`,
`analysere/skill-map`, `analysere/trackman`, `analysere/trackman/[id]`,
`analysere/turneringer`, `statistikk/[metric]`, `statistikk/runder/[runId]/del`,
`mal/trackman/gapping`, `tren/tester`, `tren/tester/[testId]`, `tren/tester/ny`,
`tren/tester/ny/egen`, `tren/tester/team-norway`, `tren/tester/[testId]/gjennomfor`,
`mal/sg-hub/coach/[spillerId]`, `…/[club]`, `…/equipment`, `mal/sg-hub/equipment`.

**Meg (38):** `/portal/meg` med profil, abonnement (avbestill, faktura, fortsett, nytt kort,
oppgrader), bookinger (liste, flytt), dokumenter, feedback, foreldre, hjelp (4 sider), helse
(2), innstillinger (9 sider: AI-coach, anlegg, integrasjoner, personvern, deling, sikkerhet,
språk, varsler), resultater, 2FA, utstyr. Booking: `/portal/booking`, `booking/ny`,
`booking/ny/bekreft`, `booking/bekreftet`, `booking/[bookingId]`, `booking/anlegg/[id]`,
`booking/coach/[id]`.

**Live-økt og registrering (14):** `live/[sessionId]/brief`, `…/active`, `…/tapper`,
`…/summary`, `runde/live`, `runde/logg`, `gjennomfore`, `gjennomfore/[id]`, `mal/runder`,
`mal/runder/ny`, `mal/runder/[id]`, `…/hull`, `…/slag`, `trening/logg`.

**Annet (32):** coach-kontakt (`/portal/coach` + ai, melding, melding/ny, øvelser, planer,
sg-hub, spørsmål ×3, tilbakemelding ×2, videoer), mål (`/portal/mal`, `mal/goal/[id]`,
`mal/leaderboard`, `ai/mal-bygger`), talent (`talent/mitt-niva`, `min-plan`, `roadmap`,
`sammenligning`), utfordringer (3), venner (2), `spiller/[spillerId]`, `varsler`,
`ukesdigest`, `utenfor-banen`, `trening/break-tabell`, `trening/putte-laboratoriet`.

### AgencyOS — 64 skjermer

**Cockpit (8):** `/admin/agencyos`, `agencyos/ak-stigen`, `agencyos/live`,
`agencyos/live/[sessionId]`, `jarvis`, `agents/[agentId]`, `oppgaver`, `workspace/notion`.

**Innboks / Kø (3):** `/admin/ko`, `kommunikasjon`, `email-templates/[id]/rediger`.

**Stall og spillerprofil (12):** `/admin/spillere`, `spillere/ny`, `spillere/[id]`,
`…/analyse`, `…/plan`, `…/plan/[planId]`, `…/tester`, `…/turnering-kobling`, `…/rediger`,
`queue` (oppfølgingskø), `analyse` (innsikt), `runder`.

**Kalender (5):** `/admin/kalender`, `kalender/hendelse/ny`, `kalender/hendelse/[id]`,
`availability`, `gjennomfore/okter/[id]`.

**Workbench / Plan (7):** `/admin/plan`, `plan/maler`, `plan/teknisk`, `plan-templates/ny`,
`plan-templates/[id]`, `…/rediger`, `workbench/[playerId]`.

**Mer (29):** booking (`bookinger/ny`, `bookinger/[id]`, `services`), økonomi
(`agencyos/okonomi`), tester (`tester`, `tester/benchmarks`, `tester/tildel/[id]`,
`trackman`, `trackman/[sessionId]`), grupper (`grupper`, `grupper/[id]` + årsplan,
skoledata, timeplan, workbench), oppsett (`oppsett`, `profile`, `team/ekstern`,
`team/inviter`, `gdpr`, `audit-log`, `feillogg`), øvrig (`turnering`, `tournaments/ny`,
`tournaments/[id]`, `marketing`, `recording`, `videoer`, `hjelp`).

Videresendingene (47 + 99) er ikke listet enkeltvis. Menyen peker på tre av dem
(Jarvis → `/admin/jarvis`, Innboks → `/admin/kommunikasjon`, Workbench `/admin/planlegge` →
`/admin/plan`), og flere kjeder har to eller tre hopp.

---

## B. Skjermer i designprosjektet (`7d7c2994`)

**Påstanden «PlayerHQ-skjermene ligger under Kildemateriale – Toppidrett-moduler» er feil.**
`oversikt.html` har 14 grupper og ingen «Kildemateriale»-seksjon. «Kildemateriale ·
Toppidrett-moduler» er et kort i designsystemets kortgalleri (`ui_kits/toppidrett/index.html`,
`@dsCard group="Kildemateriale"`). Det har egen spillermeny (I dag · Planlegging · Analyse &
Banekart · Tester · Profil) og samme demospiller som PlayerHQ, og undertittelen sier at
modulene «blir PlayerHQ Analyse og AgencyOS spillerskjermer i neste runde». Det er ikke gjort.
`readme.md`: «Kildemateriale — ikke egen app, ikke i revisjonen».

**Tegnet for PlayerHQ** (`ui_kits/playerhq/screens/`):
- PH-01 I dag · 02 Gjør nå · 03 Øktark · 04 Live brief (natt) · 05 Live aktiv (natt) ·
  06 Slagteller (natt) · 07 Øktoppsummering (natt) · 08 Runde live (natt) · 09 Registrer runde
- PH-10 Plan: uke · 11 Workbench · 12 Planbygger · 13 Øvelsesbank · 14 Tester ·
  15 Test gjennomfør (natt)
- PH-16 Analyse-hub · 17 TrackMan · 18 Runder og statistikk · 19 Mål og talent ·
  20 Gameplan og banekart
- PH-21 Coach-kontakt · 22 Caddie-chat · 23 Booking · 24 Meg · 25 Abonnement og
  innstillinger · 26 Utenfor banen
- PH-A01–A08 Treningsanalyse (oversikt, belastning, øktkvalitet, slagdata, nærspill og
  putting, rundeanalyse, tester, datagrunnlag)
- PH-RD-01–09 Runderegistrering for SG · PH-TP-01 Teknisk plan · PH-WB-FYS / PH-WB-TURN

**Tegnet for AgencyOS** (`ui_kits/agencyos/screens/`):
- AG-01 Hjem · 02 Kø · 03 Oppfølgingskø · 04 Innboks · 05 Kalender · 06 Booking ·
  07 Stall · 08 Spiller 360 · 09 Spilleranalyse · 10 Teknisk plan · 11 Workbench ·
  12 Øktark · 13 Live-tavle · 14 Plan-hub · 15 Tester · 16 Grupper · 17 Turneringer ·
  18 TrackMan og video · 19 Caddie/Jarvis · 20 Økonomi · 21 Oppgaver · 22 Innsikt og
  talent · 23 Oppsett · 24 Drift
- AG-A01–A08 Innsikt · AG-RD-01/02 · AG-TP-01/02 · AG-WB-FYS / AG-WB-TURN

Øvrige: BK-01–03, EP-01–06, AU-01–06, FO-01–06, ST-01–06, GJ-01–02, SY-01.

**Kildemateriale · Toppidrett (`ui_kits/toppidrett/`, 14 menysider + StallDag):**

| Modul | Hva den viser |
|---|---|
| Mål og dagens økt | Mål i trinn på loddrett tidslinje med fremdrift |
| Ytelsesbilde | Radar med 5 akser mot baseline, egenvurdering 1–5, smerte/stress/mat, SG |
| Workbench · Øvelse | Øvelse i rader: slagform, P1.0–P10.0 med tips, varighet, AK-formel |
| Kalender | 52 ukers årshjul med perioder, samlinger, turneringer og ukevolum |
| Gameplan | Hull-for-hull: kølle, sikte, risiko, fareområder ut fra spredning |
| Stall-matrise | Kategori, etterlevelse, SG-trend 30 d, ACWR, oppfølgingsgrunn, siste økt |
| StallDag (ikke i meny) | Dagsplan per ressurs (sim-bås, range, green, coach) |
| Banekart | Interaktivt hull med SG per sone, nærspillring, putteringer i fot |
| Treningsanalyse | SG-kurve over treningsvolum og runder, uke for uke |
| Strokes Gained | OTT/APP/ARG/PUTT mot PGA Tour med markør, utslag, nærhet per avstand |
| TrackMan | Spredningskart med ellipse, treffprosent, bag med 14 køller og carry |
| Ferdighetstest | 10 slag på 100 m, PEI-skala, «hold for å bekrefte», vitner |
| Onboarding | 7 steg: rolle, klubb, tid, nivå, SG, sesongmål, første plan |
| Baseline | A–K fra brutto snitt, SG-kategorier knyttet til SLAG-områder |
| Kategori A–K | Skala 64–106, fordeling i stallen |

**Komponenter:** designsystemet har tabell som blir kortrader, ark, tidslinje, grafer
(`TrendChart`, `DistributionPlot`, `AxisVolumeBars`, `ChartTable`), felt med feil og
tom/laster/feil. **Mangler som felles komponent:** radar, spredningskart, SG-stolpe mot
benchmark med markør, hull-/banekart, årshjul, PEI-skala og «hold for å bekrefte». De er
tegnet for hånd i hver skjerm.

**PlayerHQ mangler trolig fra Toppidrett (vurdering, ikke kontrollert mot alle filer):**
banekart med SG per sone, SG mot PGA Tour med markør og nærhet per avstand, årshjul med
samlinger og turneringer, ytelsesbilde med egenvurdering/søvn/stress, interaktiv A–K-skala,
PEI-scorekort med vitner. Kontrolleres mot PH-11, PH-16, PH-18 og PH-A1/A2 i område 3.

**Avvik i designprosjektet:** demospiller «Emma Solberg» (beslutning: Magnus Aasheim);
skjermantall 74 (oversikt) mot 108 (`skjermliste.md`) mot 105 (status); kortet sier
«15 moduler», menyen har 14.

**Training Motor (`4917465a`, idékilde):** visninger Årsplan · Periodisering · Uke · Økt ·
Analyse (+ test). Analysen har fem faner: Datagrunnlag (7 kilder, hva som mangler),
Spillerstatistikk/SG (pålitelighet ved 8/12/24 runder), TrackMan og teknisk plan
(observasjon / hypotese / diagnose), Masterbrain (sporbarhet), Belastning (sRPE, ACWR).

---

## C. Funksjoner i koden som ingen skjerm viser eller ingen meny fører til

«0 kallere» = ingen referanse i `src/` utenom definisjonen og tester. Målt med søk på navn;
dynamiske kall ville ikke blitt sett.

**Spillerflyt som ikke henger sammen**
1. Ny runderegistrering (`logRoundManual`, `portal/mal/runder/ny/actions.ts`) starter ikke
   runde-agenten. SG-analyse, prestasjoner, treningsdata og planjustering starter bare fra den
   gamle `lagreLoggetRunde`.
2. Plan-endringsforespørsel (`createPlanChangeRequest`, `PlanChangeRequest`) — 0 kallere.
   Spilleren kan ikke be coach endre planen.
3. Spillerens turneringshandlinger (`koblTilArsplan`, `bulkKoblTurneringerTilArsplan`,
   `opprettManuellTurnering`, `oppdaterTournamentEntry`) — 0 kallere.
4. Treningssamlinger og planvarianter (`createTrainingCamp`, `setActivePlanVariant`,
   `saveFacilities`) — 0 kallere.
5. TrackMan-baseline til teknisk plan (`applyTmBaselineProposal`) — 0 kallere.
6. Opplasting av svingvideo — uferdig; `SwingAnalysis` brukes ikke.
7. Stripe-kundeportal (`/api/stripe/portal`) — 0 kallere.
8. Slett konto (`deleteUserAccount`) — 0 kallere, mens oppryddingsjobben venter på det.
   Personvernhull.
9. Enkel/dyp modus (`/api/player-depth`), dato i fritekst (`/api/parse-date`),
   `getTodaysSession`, `createGoal`, `saveOnboardingProfile` — 0 kallere.

**Coach- og Workbench-funksjoner uten knapp**
10. AI-planforslag for opptil 20 spillere samtidig (`/api/admin/ai-plan/batch`) — 0 kallere.
11. Workbench: dupliser uke, dupliser økt, fjern økt, lagre/slett periode, coachnotater,
    bruk mal på spiller, søk i tekniske oppgaver — 0 kallere (`lib/workbench/*`).
12. Coach bekrefter spillerens turneringspåmelding (`coachBekreftTurneringEntry`) — 0 kallere.
13. Oppfølgingskøen (`/admin/queue`, `FollowUpCase`) finnes, men ingen meny fører dit.
14. Lead-oppfølging kjører daglig og lager `Lead`-rader, men ingen skjerm viser dem.
15. Caddie-samtaler (`getOrCreateActiveConversation`, `/api/caddie/conversations`) — 0
    kallere; gammel admin-Caddie-chat er død kode.

**Agenter uten automatisk start eller uten skjerm**
16. `booking-optimizer`, `availability-24-7-monitor`, `social-media-agent`: ikke i
    `vercel.json`, starter bare manuelt.
17. `peaking-agent`, `plan-revisjon-agent`: bare manuelt.
18. `radar-agent` / `fabrikk-agent` skriver funn (`RadarFunn`) som ingen side viser.
19. Tripletex-agentene varsler på Telegram og i dagsnotat, ingen skjerm.

**Beregninger som er skrevet og testet, men ikke brukt**
20. `cs-progression.ts` — køllehastighet siste fire uker, med skadevarsel.
21. `pyramid-weighting.ts` — faktisk mot ønsket fordeling FYS/TEK/SLAG/SPILL/TURN.
22. `plan-effectiveness.ts` — hvor godt en planmal virker.
23. `teknisk-maalmatrise.ts` — rep-mål per læringssteg og belastning.
24. `gruppesynk.ts` — når en gruppeøkt i spillerens plan løsner fra originalen.
25. `forelder-neste-okt.ts` — «neste økt» for forelder.
26. `deling/dekningsgrad.ts` — samtykkedekning («4 av 11»).

**Datamodeller uten bruk i `src/`**
- Turnering: `WorkbenchTournamentPreparation`, `…Goal`, `…Evaluation`,
  `TournamentPreparation`.
- Plan: `PlanAdjustment`, `PlanSuggestion`, `CoachDrillDirectiv`, `SessionSet`,
  `PositionTaskMaal`, `TechnicalPlanClubTarget`, `FysUke`, `KondisjonSegment`.
- AI: `KnowledgeChunk`, `AiSpillerminne`, `AiPrompt`, `InvariantOverride`.
- Drift og annet: `DriftRutine`, `PageApproval`, `MessageAttachment`, `PeriodeFordeling`,
  `PgaApproachDistance` m.fl.
