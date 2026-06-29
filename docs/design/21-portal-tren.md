# PlayerHQ — Tren & Live · skjermkort (kode-verifisert 2026-06-29)

27 ruter: trenings-/plan-flatene under `/portal/tren/*` (lyst) + live-økt-flyten under `/portal/(fullscreen)/*` (egen mørk fullskjerm-chrome). Dominerende mønster: server components med Prisma-data → editorial header (eyebrow + display-italic) + terminal datakort. Største gjeld: (1) live-komponentene er fulle av hardkodet hex (`#005840`/`#D1F843`/`#0A1F17`/`#1A7D56`) i strid med designsystem-regelen; (2) `kalender`-siden og flere planflater bruker `var(--token, #HEXFALLBACK)`-mønster og rå rgba-er; (3) `tren`-hub + `ovelser`-ruter er rene redirects (drift mot `/portal/planlegge` og `/portal/drills`).

Verifisert mot `public/design-handover/` (fasit-referanser i fil-kommentarer), `globals.css`-tokens og `designsystem.md`. Flere `wireframe/`-referanser i kommentarer er FORBUDT per design-porting-gate (se gjeld-notater).

---

## Hub & redirects

### /portal/(fullscreen)/tren
- Fil: `src/app/portal/(fullscreen)/tren/page.tsx`
- Flate: PlayerHQ (fullscreen-gruppe, men ren redirect)
- Rolle/gating: `requirePortalUser()` (alle innloggede)
- Jobb: Redirect → `/portal/planlegge/workbench`.
- **stub/redirect.** All planlegging bor i Workbench (låst beslutning). `metadata.title = "Planlegge"`.
- Redesign-prioritet: P3

### /portal/tren/ovelser
- Fil: `src/app/portal/tren/ovelser/page.tsx`
- Jobb: `permanentRedirect("/portal/drills")`.
- **stub/redirect.** Øvelsesbank bor på `/portal/drills` (utenfor dette scopet).
- Redesign-prioritet: P3

### /portal/tren/ovelser/[id]
- Fil: `src/app/portal/tren/ovelser/[id]/page.tsx`
- Jobb: `permanentRedirect("/portal/drills/${id}")`.
- **stub/redirect.**
- Redesign-prioritet: P3

---

## Live-økt-flyt (fullscreen, egen mørk chrome)

> Fullscreen-layout: `src/app/portal/(fullscreen)/layout.tsx` — overstyrer PortalShell, ingen sidebar/header, `bg-foreground` (nær-svart mørk canvas). VERIFISERT: live-økt har egen mørk chrome selv om PlayerHQ ellers er lyst. Auth i hver page.

### /portal/(fullscreen)/live/[sessionId]
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/page.tsx`
- Flate: PlayerHQ live — status-router (ingen UI)
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`. `tier === "GRATIS"` (ikke-coach) → redirect `/portal/meg/abonnement`. Eierskaps-/deltaker-sjekk.
- Jobb: Ruter til riktig live-skjerm basert på sesjonstype + status.
- Data vist (felt → kilde): ingen UI. Leser `trainingSessionV2.status/studentId/coachId/hostId/participants` + fallback `trainingPlanSession.status` → Prisma.
- Layout og hierarki: ren `switch` på status. V2: COMPLETED→summary, IN_PROGRESS→active, CANCELLED/SKIPPED→workbench, else→brief. PlanSession: COMPLETED→`/portal/tren/[id]`, ACTIVE/PAUSED→tapper, else→brief.
- Tilstander: `notFound()` hvis ingen av modellene treffer. Ingen visuelle states.
- AK-domene vist: ingen (router).
- Designfil-referanse: ingen prototype (router).
- Nåværende designkvalitet: ferdig (logikk-fil).
- Redesign-prioritet: P3

### /portal/(fullscreen)/live/[sessionId]/brief
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/brief/page.tsx`
- Flate: PlayerHQ live — pre-økt brief (mørk)
- Rolle/gating: som over. Velger V2 (`LiveBrief`) eller PlanSession (`PlanSessionBrief`) basert på hvilken modell som finnes.
- Jobb: Vis øktmål, fokus, coach-kommentar, drills-liste; «START ØKT» → active.
- Data vist (felt → kilde): `data` fra `loadV2LiveSession`/`loadPlanLiveSession` (`@/lib/portal-live/data` + `(fullscreen)/live/[sessionId]/actions`). Felt i `LiveBrief`: tittel, studentName, focus, totalDurationMin, drills.length, totalPlannedReps, coachComment, per drill: index/name/pyramide/lFase/durationMinutes/plannedReps.
- Komponenter: `LiveBrief` / `PlanSessionBrief` + `LiveSessionShell` (alle `src/components/portal/live/`).
- Layout og hierarki: `LiveSessionShell variant="dark"` med sticky footer = START-knapp. Eyebrow «Brief · {dato·tid}» → display-headline → KPI-chips (Varighet/Drills/Reps) → coach-kort → Program-liste (nummererte drill-rader).
- Tilstander: empty (drills.length 0 → «Ingen drills lagt til»), gating: `blockReason` «completed» (CheckCircle2 + «Økten er fullført») / «tier» (Lock + «Live krever PRO»). loading/error MANGLER.
- Interaksjoner: START ØKT → `/portal/live/[id]/active`. Lukk → `/portal/planlegge`.
- AK-domene vist: pyramide-kategori (FYS/TEK/SLAG/SPILL/TURN via AXIS_LABEL), L-fase (GRUNN/SPESIAL/TURNERING → «Grunnfase» osv.), planlagte reps.
- Designfil-referanse: V2-design ph-screens (LiveBrief-familien); ingen eksplisitt .dc.html i fil.
- Nåværende designkvalitet: ferdig, men hardkodet hex i nabokomponentene (rgba lime-shadow inline). Mørk chrome bruker `text-background`/`bg-accent`-par korrekt.
- Redesign-prioritet: P2

### /portal/(fullscreen)/live/[sessionId]/active
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/active/page.tsx` → komponent `src/components/portal/live/LiveActive.tsx`
- Flate: PlayerHQ live — aktiv økt (mørk, client)
- Rolle/gating: som over. GRATIS (ikke-coach) → `/portal/meg/abonnement`. Coach → redirect til brief (read-only ikke bygget). COMPLETED→summary, CANCELLED/SKIPPED→planlegge.
- Jobb: Kjør live-økt: timer, rep-logging, drill-fremdrift, fullføring.
- Data vist (felt → kilde): `loadLiveSession` (V2-actions). Per drill: name, pyramide, repsTotal/plannedReps, status (done/active/queued). Logger: repsWithoutBall/repsLowSpeed/repsAutomatic/repsHit (via `DrillLogger`).
- Komponenter: `LiveActive` (lokal client), `DrillLogger`, `SessionTimer` (alle live/). Bruker server actions `startSession/completeDrill/completeSession`.
- Layout og hierarki: `fixed inset-0` fullskjerm. Topbar (tittel + «Avslutt») → GoalProgress-kort → SessionTimer → drill-kort (ChallengeCard) → sticky «Fullfør drill/økt». Confirm-overlay ved avslutt. DrillLogger som egen overlay-skjerm.
- Tilstander: paused, isCompleting, allDone (grønt banner «Alle drills fullført» + «Se oppsummering»). Empty/loading/error MANGLER (antar gyldig data fra router).
- Interaksjoner: «Logg rep» → DrillLogger-overlay; «Fullfør drill» → neste drill / completeSession; «Avslutt» → confirm → planlegge. Wake-lock + vibrate (haptikk).
- AK-domene vist: pyramide-kategori per drill, rep-typer (uten ball / lav fart / automatisk / treff), CS-implisitt via successRate.
- Designfil-referanse: V2 ph-screens live-active.
- Nåværende designkvalitet: ferdig funksjonelt, men STYGG token-disiplin — mange hardkodede hex inline (`#005840`, `#D1F843`, `#1A7D56`, `#0A1F17`, `#0d2218`) og rgba-er. Bryter `designsystem.md` (ingen hex i ny UI). Bør migreres til tokens.
- Redesign-prioritet: P1

### /portal/(fullscreen)/live/[sessionId]/logger
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/logger/page.tsx`
- Jobb: `redirect("/portal/live/${sessionId}/active")` — alias beholdt fordi adressen er registrert i portal-routes (`/admin/godkjenn-portal`).
- **stub/redirect.** Auth/tier/eierskap håndteres av active-siden.
- Redesign-prioritet: P3

### /portal/(fullscreen)/live/[sessionId]/tapper
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/tapper/page.tsx` → `./tapper-shell` (`TapperShell`)
- Flate: PlayerHQ live — tapper-modus (mørk, minimal range-logging)
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`. Eier ELLER coach/admin, ellers redirect `/portal/planlegge/workbench`.
- Jobb: Minimal fullskjerm for å tappe ball-treff på range (TrainingPlanSession).
- Data vist (felt → kilde): `trainingPlanSession` + `plan.name/userId` → Prisma. `DEFAULT_CLUBS` (Driver/7-jern/Wedge/Putter) hardkodet i page.
- Komponenter: `TapperShell` (lokal, ikke lest i detalj).
- Layout og hierarki: per kommentar — tap-target ≥56px, tap-knapp 120px, store mini-stats (mobil-first).
- Tilstander: `notFound()` hvis sesjon mangler. Øvrige states i TapperShell (UVERIFISERT).
- AK-domene vist: kølle-tagging (club), ball-logging.
- Designfil-referanse: fil-kommentar peker til `wireframe/design-package/.../02-live-tapper.html` — **FORBUDT kilde** per design-porting-gate (skal oppdateres til `public/design-handover/`).
- Nåværende designkvalitet: UVERIFISERT (shell ikke lest). Kjent gjeld: forbudt design-referanse i kommentar.
- Redesign-prioritet: P2

### /portal/(fullscreen)/live/[sessionId]/summary
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/summary/page.tsx` → `SessionSummary` + `LiveSessionShell`
- Flate: PlayerHQ live — økt-oppsummering (mørk)
- Rolle/gating: som over (coach kan se). Ikke-COMPLETED → redirect active.
- Jobb: Vis fullført økt: total reps, tid, drills fullført, pyramide-fordeling.
- Data vist (felt → kilde): `loadLiveSession` + beregnet: `totalReps` (sum logg.repsTotal), `drillsCompleted`, `durationSec` (lagret `completedSummary.liveSummary.durationSec` ellers regnet fra logg-tidsstempler), `pyramidSummary` per `PyramidArea` (FYS/TEK/SLAG/SPILL/TURN).
- Komponenter: `LiveSessionShell` (title + «Oppsummering» + closeHref) + `SessionSummary` (lokal).
- Layout og hierarki: shell med tittel/subtittel → SessionSummary-innhold (ikke lest i detalj).
- Tilstander: `notFound()`; redirect hvis ikke fullført. Race-vindu kommentert.
- AK-domene vist: pyramide-fordeling (reps per akse), total reps, varighet.
- Designfil-referanse: V2 ph-screens summary.
- Nåværende designkvalitet: ferdig (struktur). Hex-gjeld trolig i SessionSummary (samme familie).
- Redesign-prioritet: P2

---

## Økt-detalj (lyst)

### /portal/tren/[sessionId]
- Fil: `src/app/portal/tren/[sessionId]/page.tsx`
- Flate: PlayerHQ (lyst)
- Rolle/gating: `requirePortalUser()`. Eier ELLER coach/admin, ellers redirect `/portal/tren`.
- Jobb: Full økt-detalj for en TrainingPlanSession — skjelett, KPI hvis fullført, coach-feedback/-analyse, øvelser, forrige/neste.
- Data vist (felt → kilde): `trainingPlanSession` + `plan`, `drills.exercise`, `log` → Prisma. Coach-analyse fra `sessionRecording.aiAnalysis` (Voice Memo V3, matchet på spiller + ±24t-vindu). KPI (kun fullført): faktiske reps (`log.csAchieved`), andel godkjent (`log.rating/5`), varighet, SG-effekt (`rating*0.04` — **estimat-formel, ikke låst**).
- Komponenter: `PlayerHero` (as PageHeader), `CoachAnalysisCard` (`@/components/portal/coach-analysis-card`), `ClubTaggingModal` (`@/components/sg-hub/ClubTaggingModal`), lokale `HeroFact/KpiCard/DrillBlock/DrillFact`.
- Layout og hierarki: tilbake-lenke → hero (eyebrow «PlayerHQ · Trening · {dato}» + «{pyramide}-økt» + tittel + Start-live-CTA) → ClubTaggingModal → hero-fakta-grid → KPI-rad (fullført) → coach-feedback-kort (primary bg) → CoachAnalysisCard → egen kommentar → øvelser («Økt-skjelett · N øvelser») → forrige/neste-nav.
- Tilstander: empty (0 øvelser → stiplet kort), `kanStarte`-gating (tier GRATIS / ikke eier / COMPLETED → ulike chips: «Gjennomført», «Coach-visning», «Live krever Pro»). loading/error MANGLER.
- Interaksjoner: «Start live» → `/portal/live/[id]/brief`; forrige/neste → `/portal/tren/[id]`; ClubTaggingModal → SG-tagging.
- AK-domene vist: pyramide-kategori (PYR_LABEL/PYR_PILL), L-fase (L_PHASE_LABEL GRUNN/SPESIAL/TURNERING), CS-mål (`drill.csTarget`), SG-effekt-estimat, coach-analyse (teknisk/taktisk/mental/fysisk/hjemmelekse).
- Designfil-referanse: ingen eksplisitt .dc.html.
- Nåværende designkvalitet: ferdig, men inkonsistent token-bruk — `PYR_PILL` bruker rå `rgba(...)` + `var(--color-pyr-*)` blandet med `bg-pyr-*`-utility ellers i appen. Bloomberg-tetthet OK.
- Redesign-prioritet: P1

### /portal/tren/[sessionId]/planlagt
- Fil: `src/app/portal/tren/[sessionId]/planlagt/page.tsx`
- Flate: PlayerHQ (lyst, mobil-first `max-w-xl`)
- Rolle/gating: `requirePortalUser()`. Tilgang: student/coach/host/deltaker/ADMIN/COACH, ellers `notFound()`.
- Jobb: Pre-økt-visning for TrainingSessionV2 (planlagt, ikke startet) — drills, coach-notat, «Trene sammen».
- Data vist (felt → kilde): `trainingSessionV2` + `drills` (sortOrder) + `participants.user` → Prisma. Timing (i dag/planlagt/ikke startet), `miljo`, `notes`, per drill: name/durationMinutes/repetitions/pyramide.
- Komponenter: `InviteFriendTrigger`, `ParticipantsList` (`@/components/portal/workbench/`).
- Layout og hierarki: tilbake → hero (timing-eyebrow + tittel + meta: varighet/drills/miljø) → coach InsightCard (lime venstrekant, «AK»-avatar) → drill-liste → «Trene sammen» (deltakere + inviter) → CTA «Start økt» + disabled «Utsett til i morgen».
- Tilstander: empty drills (stiplet), empty deltakere, timing-varianter (isToday/isFuture/isOverdue). loading/error MANGLER. «Utsett»-knapp er permanent disabled (ikke implementert).
- Interaksjoner: «Start økt» → `/portal/tren/[sessionId]`; inviter kompis → InviteFriendTrigger.
- AK-domene vist: pyramide-kategori (drill.pyramide som rå badge), miljø. INGEN L-fase/CS/AK-formel her.
- Designfil-referanse: ingen eksplisitt.
- Nåværende designkvalitet: ferdig. Bruker `bg-primary/8`, `bg-accent/15` token-opacity — konsistent. «AK»-coach-avatar hardkodet (demo-coach Anders Kristiansen, korrekt per kanon).
- Redesign-prioritet: P2

---

## Feiring

### /portal/tren/feiring/[planId]
- Fil: `src/app/portal/tren/feiring/[planId]/page.tsx`
- Flate: PlayerHQ (lyst, men mørk forest hero-seksjon)
- Rolle/gating: `requirePortalUser()`. Eier/coach, ellers redirect `/portal/tren`. Redirect hvis plan ikke fullført.
- Jobb: Feiringsside når en treningsplan er fullført — viser fremgang + SG-delta, inviterer til ny plan.
- Data vist (felt → kilde): `trainingPlan` + sessions → Prisma. `planEffectiveness` (eksisterende eller `computeEffectiveness(planId)` best-effort): sgTotalDelta + OTT/APP/ARG/PUTT-deltaer. Personlig rekord fra `planEffectiveness.findMany` (tidligere planer).
- Komponenter: lokal `SgCell`, inline SVG completion-ring.
- Layout og hierarki: mørk forest hero (completion-ring %, «Periode fullført» + headline) → PersonalBest-kort (kun rekord) → Planfremgang-kort → SG-utvikling-kort (5 celler) → «Mot tidligere planer» → CTA «Be om ny plan» / «Tilbake til hjem».
- Tilstander: empty (ingen SG-data → stiplet kort «Ikke nok runde-data ennå»), erRekord-betinget kort. loading/error MANGLER (try/catch på effectiveness).
- Interaksjoner: «Be om ny plan» → `/portal/tren`; «Tilbake til hjem» → `/portal`.
- AK-domene vist: SG-deltaer (Total/OTT/APP/ARG/PUTT), PlanEffectiveness, personlig rekord.
- Designfil-referanse: ingen eksplisitt (mønster fra fasit-feiring).
- Nåværende designkvalitet: ferdig, men hardkodet hex i SVG (`stroke="#D1F843"`, `fill="#D1F843"`) — i SVG-kontekst, men bryter token-regelen.
- Redesign-prioritet: P2

---

## Tester

### /portal/tren/tester
- Fil: `src/app/portal/tren/tester/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: Test-katalog/dashboard — tildelte tester, siste resultater, filtrerbart kortgrid.
- Data vist (felt → kilde): `loadTesterScreen` (`@/lib/portal-tester/tester-data`) → grupper/rader. `testResult` (5 siste), `testAssignment` (OPEN, m/coach + dueDate) → Prisma. Enhet via `parseForScoring(protocol)`.
- Komponenter: `MeSub`/`SetGroup`/`SetRow`/`SetVal` (`@/components/portal/meg/meg-sub`), `TesterKatalogGrid` (lokal), `TestUkeKommende` (`@/components/portal/tester/...`).
- Layout og hierarki: MeSub editorial header («Test katalog») → TestUkeKommende (countdown=null, tester=[] — **placeholder til TestWeek-modell finnes**) → «Tildelt deg» → «Siste resultater» → kortgrid med filter-chips.
- Tilstander: empty (ingen resultater → «Ingen testresultater ennå»), tildelinger betinget. loading/error MANGLER.
- Interaksjoner: tildelt/resultat → `/portal/tren/tester/[testId]`.
- AK-domene vist: pyramide-område (OMRADE_IKON FYS/TEK/SLAG/SPILL/TURN), testresultater, NGF/Team Norway-protokoller.
- Designfil-referanse: hybrid-design (2026-06-17), fil-kommentar.
- Nåværende designkvalitet: ferdig. Konsistent token-bruk via MeSub-primitiver.
- Redesign-prioritet: P2

### /portal/tren/tester/[testId]
- Fil: `src/app/portal/tren/tester/[testId]/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()` + `testTilgangWhere(user.id)` (andres private tester → `notFound()`).
- Jobb: Test-detalj — hvordan gjennomføre, hvordan score, egen historikk, start.
- Data vist (felt → kilde): `testDefinition` + `testResult` (egne) → Prisma. Protokoll-steg via `parseProtocol`, enhet/retning via `parseForScoring`/`lavereErBedre`. Trend ↑/↓ mot forrige resultat.
- Komponenter: `AthleticEyebrow`, `SetGroup/SetRow/SetVal`.
- Layout og hierarki: (valgfri grønn «lagret»-kvittering m/ «Del med coach») → pyramide-chip + tittel + meta + description → «Slik gjennomføres testen» (steg ELLER scoringRule + NGF-lenke) → «Slik scores den» (accent-kort) → «Din historikk» (resultat + endring) → referanse-rad («formel ikke låst») → «Start test» + NGF-lenke.
- Tilstander: empty historikk («Ingen resultater ennå»), `?lagret=1` success-kvittering. loading/error MANGLER.
- Interaksjoner: «Start test» → `/portal/tren/tester/[id]/gjennomfor`; «Del med coach» → `/portal/coach/melding`; NGF-lenker (ekstern).
- AK-domene vist: pyramide-område, scoringregel, enhet, FYS-referanse-disclaimer (formel ikke låst — ingen fasit-tall).
- Designfil-referanse: hybrid, fil-kommentar.
- Nåværende designkvalitet: ferdig. Bruker `bg-pyr-*` token-utility korrekt (i motsetning til [sessionId]).
- Redesign-prioritet: P2

### /portal/tren/tester/katalog
- Fil: `src/app/portal/tren/tester/katalog/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: Filtrerbar test-katalog (Alle/Standard/Mine/Coach-godkjent/Akademi) — finn test eller se egne.
- Data vist (felt → kilde): `testDefinition.findMany` med filter-avhengig `where` → Prisma. Per test: name/description/pyramidArea/isCustom/isCoachApproved/visibility/createdBy.
- Komponenter: `PlayerHero` (as PageHeader), `TestKatalogFilter` (lokal `./filter`).
- Layout og hierarki: tilbake → header (eyebrow viser RÅ rute `PlayerHQ · /portal/tren/tester/katalog` — **eyebrow lekker URL**, bør være lesbar tekst) + «Egen test»-CTA → filter-pills → 3-kolonne kortgrid (navn + pyramide-badge + kategori-badge + forfatter).
- Tilstander: empty (filter-avhengig melding + Sparkles-ikon). loading/error MANGLER.
- Interaksjoner: kort → `/portal/tren/tester/[id]`; «Egen test» → `/portal/tren/tester/ny/egen`; filter → query.
- AK-domene vist: pyramide-område (rå badge), test-kategorier (Standard/Coach-godkjent/Akademi/Egen).
- Designfil-referanse: fil-kommentar nevner «pixel-perfekte HTML-porten» (dashboardet), ikke denne.
- Nåværende designkvalitet: halvferdig/inkonsistent — eyebrow viser intern URL (uprofesjonelt), generell shadcn-aktig kortgrid uten editorial polish. Badge-klasser bruker `bg-accent/20 text-accent-foreground` o.l. konsistent.
- Redesign-prioritet: P2

### /portal/tren/tester/ny
- Fil: `src/app/portal/tren/tester/ny/page.tsx`
- Flate: PlayerHQ (lyst)
- Rolle/gating: `requirePortalUser()`.
- Jobb: Logg nytt testresultat — 4-stegs wizard (Type→Detaljer→Resultat→Bekreft).
- Data vist (felt → kilde): alle `testDefinition` + siste resultat per test (for delta) → Prisma.
- Komponenter: `NyTestWizard` (lokal `./wizard`).
- Layout og hierarki: tilbake → editorial header («Logg ny test, {fornavn}.») → wizard.
- Tilstander: i wizard (UVERIFISERT). loading/error MANGLER på page-nivå.
- AK-domene vist: testresultat-logging (delta).
- Designfil-referanse: hybrid header, fil-kommentar.
- Nåværende designkvalitet: ferdig (header). Wizard-detalj UVERIFISERT.
- Redesign-prioritet: P2

### /portal/tren/tester/ny/egen
- Fil: `src/app/portal/tren/tester/ny/egen/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: 5-stegs wizard for å opprette egen TestDefinition (navn/protokoll/enhet/mål/synlighet).
- Data vist (felt → kilde): ingen DB-henting på page; `user.role` → wizard.
- Komponenter: `PlayerHero`, `EgenTestWizard` (lokal `./wizard`).
- Layout og hierarki: tilbake → PlayerHero («Lag en egen test, {fornavn}.») → wizard. Eyebrow viser RÅ rute (samme URL-lekkasje som katalog).
- Tilstander: i wizard (UVERIFISERT).
- AK-domene vist: test-synlighet (ACADEMY/coach-godkjent), pyramide-tilordning (i wizard).
- Designfil-referanse: ingen eksplisitt.
- Nåværende designkvalitet: ferdig (header), eyebrow URL-lekkasje. Wizard UVERIFISERT.
- Redesign-prioritet: P2

---

## Årsplan & kalender

### /portal/tren/aarsplan
- Fil: `src/app/portal/tren/aarsplan/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()`.
- Jobb: Årsplan (v10-design) — periodisering over året med ekte sesongplan-data.
- Data vist (felt → kilde): `seasonPlan` + `periodBlocks` (år = inneværende) → Prisma. `LPhase` → pyramide-akse (GRUNN→FYS, SPESIAL→TEK, TURNERING→TURN), måned-spenn.
- Komponenter: `Aarsplan` (`@/components/portal/aarsplan/aarsplan`).
- Layout og hierarki: hele flaten rendret av `<Aarsplan>` (Gantt-aktig faseband). Tom-tilstand (`faser: []`) bevares når ingen sesongplan.
- Tilstander: empty (tom faser-array → komponentens tom-tilstand). loading/error MANGLER.
- Interaksjoner: opprett → `/portal/planlegge/workbench`; fase → `/portal/tren/aarsplan/periode/[id]`.
- AK-domene vist: L-faser (Grunnperiode/Spesialisering/Turneringsperiode), pyramide-akse-farging.
- Designfil-referanse: `public/design-handover/_screens/pl-aarsplan.png` (v10) — **gyldig kilde**.
- Nåværende designkvalitet: ferdig (port av v10-fasit). Detaljer i `Aarsplan`-komponent (ikke lest).
- Redesign-prioritet: P2

### /portal/tren/aarsplan/periode/[id]/rediger
- Fil: `src/app/portal/tren/aarsplan/periode/[id]/rediger/page.tsx`
- Flate: PlayerHQ (lyst)
- Rolle/gating: `requirePortalUser()` (ingen eksplisitt eierskap-sjekk på page — `findUnique` på periodeId; eierskap UVERIFISERT i form).
- Jobb: Rediger én periodeblokk (meta/fokus/intensitet/vedlegg) i årsplan.
- Data vist (felt → kilde): `periodBlock` + `seasonPlan.userId/name` → Prisma. Form: focus/notes/startDate/endDate/lPhase.
- Komponenter: `PlayerHero`, `EmptyState`, `PeriodeRedigerForm` (lokal `./form`).
- Layout og hierarki: header («Rediger periode» + periode-ID-pill) → form.
- Tilstander: not-found (EmptyState «Periode ble ikke funnet»). loading/error MANGLER på page.
- AK-domene vist: L-fase (lPhase), periodefokus.
- Designfil-referanse: fil-kommentar peker til `public/design/batch3/arsplan-periode-rediger.html` — verifiser om dette er gyldig handover-sti (under `public/design/`, ikke `public/design-handover/`; mulig gråsone vs. design-porting-gate).
- Nåværende designkvalitet: ferdig (header + form). Form-detalj UVERIFISERT.
- Redesign-prioritet: P3

### /portal/tren/kalender
- Fil: `src/app/portal/tren/kalender/page.tsx`
- Flate: PlayerHQ (lyst, mobil-first `max-w-[460px]`). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()`.
- Jobb: Ukekalender — uke-mini-grid, streak-tracker, «denne uken»-liste. `?uke=YYYY-WNN`.
- Data vist (felt → kilde): aktive `trainingPlan` → sessions (uke), `round`, `testResult`, fullført-historikk (streak) → Prisma. `computeStreak`/`aktivStreak` (`@/lib/streak`), uke-helpers.
- Komponenter: lokale `UkeCelle`/`StreakCelle` (ingen delte).
- Layout og hierarki: header («Uke {N} · {måned}» + prev/next) → 7-dagers mini-grid → streak-kort (dager på rad + 14 celler + rekord) → «Denne uken»-liste (dato-ikon + tittel + meta + pyramide-badge).
- Tilstander: empty («Ingen økt planlagt — ny bruker»). loading/error MANGLER.
- Interaksjoner: prev/next uke → query; økt-rad → `/portal/tren/[id]` (runder/tester ikke lenket).
- AK-domene vist: pyramide-kategori (PYR_BADGE), streak, økter/runder/tester.
- Designfil-referanse: `public/design-handover/prosjektgjennomgang-2026-06-17/.../PlayerHQ Ukekalender (hybrid).dc.html` — **gyldig kilde**.
- Nåværende designkvalitet: ferdig, men STYGG token-disiplin — gjennomgående `var(--token, #HEXFALLBACK)` (`var(--lime, #D1F843)`, `var(--forest, #005840)`, `var(--secondary, #F1EEE5)`) + rå rgba i PYR_BADGE. Tokens finnes i globals.css, så fallbackene er unødvendig hex-duplisering.
- Redesign-prioritet: P1

---

## Turneringer

### /portal/tren/turneringer
- Fil: `src/app/portal/tren/turneringer/page.tsx`
- Flate: PlayerHQ (lyst, mobil-first). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()`.
- Jobb: Ren lese-oversikt over påmeldte turneringer (planlegging skjer i Workbench).
- Data vist (felt → kilde): `tournamentEntry` (PLANNED/CONFIRMED) + `tournament.name/startDate/location` → Prisma. Navn/dato/kategori/status.
- Komponenter: `AthleticEyebrow`, `AthleticBadge` (athletic/).
- Layout og hierarki: eyebrow «OVERSIKT · {år}» → «{N tallord} påmeldt.» → lead → accent-kort (lime venstrekant, peker til Workbench) → turneringsliste (trophy + navn + dato·kategori + badge + chevron) → «Planlegg i Workbench».
- Tilstander: empty («Ingen kommende turneringer»). loading/error MANGLER.
- Interaksjoner: rad → `/portal/tren/turneringer/[id]`; CTA → `/portal/planlegge`.
- AK-domene vist: turnering-entry-status (Bekreftet/Påmeldt), ingen pyramide/AK-formel.
- Designfil-referanse: ph-screens TournamentsScreen (fasit), fil-kommentar.
- Nåværende designkvalitet: ferdig. Konsistent athletic-komponenter + tokens.
- Redesign-prioritet: P2

### /portal/tren/turneringer/[id]
- Fil: `src/app/portal/tren/turneringer/[id]/page.tsx`
- Flate: PlayerHQ (lyst, men forest-gradient hero). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: Turnering-detalj — hero, coach-notat, mål/entry, historikk, meld på/av.
- Data vist (felt → kilde): `loadTurneringDetalj(user.id, id)` (`@/lib/portal-turnering/...`). Status/tour/name/dateLong/venue/format, entry (state/category/notes/registered), history (year/position/score), officialUrl.
- Komponenter: `EmptyState` (shared), lokale `CoachNoteCard/EntryCard/HistoryCard`. Server actions `meldDegPa/meldDegAv`.
- Layout og hierarki: tilbake → forest-gradient hero (status-badge + tour + navn + dato/venue/format) → coach-notat-kort (lime venstrekant, «AK») → entry/mål-kort (state-badge + fremgang-plassholder 0%) → historikk → CTA «Meld på/av» + offisiell side.
- Tilstander: not-found (EmptyState). empty entry («Du er ikke påmeldt»), empty notat. loading/error MANGLER.
- Interaksjoner: meld på/av (server actions); offisiell side (ekstern).
- AK-domene vist: turnering-mål/entry-state, historikk (plass/slag). Fremgang-bar er PLASSHOLDER (0%, «—»).
- Designfil-referanse: «PlayerHQ Turneringsdetalj (hybrid).dc.html», fil-kommentar.
- Nåværende designkvalitet: ferdig, men BUG: CoachNoteCard bruker `borderLeftColor: "hsl(var(--accent))"` — `--accent` er HSL-trippel uten `hsl()`-wrapper, så `hsl(var(--accent))` er dobbel-wrap og rendrer trolig feil (sml. designsystem.md shadcn-konvensjon). Bør være `var(--accent)` el. token-utility. Verifiser visuelt.
- Redesign-prioritet: P1

### /portal/tren/turneringer/ny
- Fil: `src/app/portal/tren/turneringer/ny/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: Legg til manuell turnering (ikke i synket katalog). Anti-spam: maks 10/måned.
- Data vist (felt → kilde): `tournament.count` (MANUAL, denne måneden) → gjenstående kvote (10−N).
- Komponenter: `PlayerHero`, `NyManuellTurneringForm` (lokal `./form`).
- Layout og hierarki: header → tilbake → kvote-rad ELLER «månedsgrense nådd»-blokk → form.
- Tilstander: kvote-oppbrukt (destructive-blokk «Månedsgrense nådd»). loading/error MANGLER på page.
- AK-domene vist: ingen (manuell turnering-metadata).
- Designfil-referanse: ingen eksplisitt.
- Nåværende designkvalitet: ferdig. Konsistent tokens (destructive/secondary). Form UVERIFISERT.
- Redesign-prioritet: P3

---

## Tekniske planer

### /portal/tren/teknisk-plan
- Fil: `src/app/portal/tren/teknisk-plan/page.tsx`
- Flate: PlayerHQ (lyst, mobil-first `max-w-[430px]`). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: Liste over tekniske planer gruppert per periodefase, med reps-progresjon + P-posisjoner.
- Data vist (felt → kilde): `technicalPlan` + `opprettetAv` + `positions.tasks` (reps mål/gjort dry/lav/full) → Prisma. Beregnet: target/current reps, periodLabel, forfatter-initialer, est. ferdig.
- Komponenter: `PlayerHero`, `PlanHandlinger` (lokal), lokale `PlanCard/Stat/GroupPill/EmptyRow`.
- Layout og hierarki: hero → PlanHandlinger → 3 fase-grupper (Spesialisering=aktiv / Turnering=«Kommer 1. juli» / Grunntrening=avsluttet) hver m/ eyebrow + pill + span + plan-kort (tittel + status + oppgaver/P-posisjoner + forfatter + reps-bar + est. ferdig).
- Tilstander: empty per gruppe (stiplet rad), global empty. loading/error MANGLER. **NB: Turnering-gruppens span («1. juli → 31. aug · uke 27–35») og Grunntrening-span er HARDKODET demo-tekst, ikke data.**
- Interaksjoner: kort → `/portal/tren/teknisk-plan/[id]`.
- AK-domene vist: P-posisjoner (N/10), reps-progresjon (dry/lav/full), L-fase implisitt via periode-gruppe, periodefaser.
- Designfil-referanse: ingen eksplisitt (re-styling av tidligere tp-CSS).
- Nåværende designkvalitet: ferdig, men inkonsistent token-bruk: `bg-[var(--color-pyr-spill-track)]`, `bg-[rgba(0,88,64,0.1)]`, inline `fontFamily: "'Inter Tight'"`-style i stedet for `font-display`. Hardkodet periode-span er innholds-gjeld.
- Redesign-prioritet: P1

### /portal/tren/teknisk-plan/[planId]
- Fil: `src/app/portal/tren/teknisk-plan/[planId]/page.tsx`
- Flate: PlayerHQ (lyst, desktop builder-layout). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`. `findFirst` på `id + userId` → eierskap. `notFound()` ellers.
- Jobb: Plan-builder — P-posisjoner med oppgave-kort (venstre) + sammendrag/TM-mål/pyramide/aktivitet (høyre sidebar).
- Data vist (felt → kilde): `technicalPlan` + positions.tasks.tmGoals, clubTargets, audits.actor → Prisma. Reps-totaler, progressPct, pyramide-fordeling per område, club-targets (TrackMan-metrikk), aktivitetslogg.
- Komponenter: `PageHead`, `PRow`, `TaskCard`, sidebar (`PlanSummaryCard`/`TrackmanGoalsCard`/`PyramideCard`/`CoachActivityCard`) — alle `@/components/teknisk-plan/`. `OppgaveLauncher` (lokal). Importerer egen `teknisk-plan.css` + `tp-scope`.
- Layout og hierarki: PageHead (crumb + tittel + sub + «Tilbake»/«Ny oppgave») → `.tp-builder` 2-kol: P-rader (kollapsible, hovedfokus først) m/ TaskCard-er + sidebar.
- Tilstander: not-found; empty P-posisjoner (tp-empty-state + launcher); empty tasks per P (ghost-dashed launcher). loading/error MANGLER. **Drag-and-drop ikke aktiv (grip-handles vises) — server actions for reorder kommer.**
- Interaksjoner: «Ny oppgave» → OppgaveLauncher (modal); P-rader kollaps.
- AK-domene vist: P-posisjoner (P1.0–P10.0), AK-formel-felter per oppgave (CS/M/PR via `t.cs/t.miljo/t.prPress`), L-fase (`t.lFase`), pyramide (`t.pyramide`), køller, TrackMan-mål, reps dry/lav/full. **Rikeste AK-domene-skjerm i scope.**
- Designfil-referanse: «AK Golf Plan-builder.html» fra design-bundle (fil-kommentar — verifiser at dette ikke er forbudt `design-package`-kilde).
- Nåværende designkvalitet: ferdig funksjonelt, men bruker EGEN scoped CSS (`teknisk-plan.css` + `tp-scope`/`tp-btn`-klasser) i stedet for DS-utilities + inline `style={{ color: "hsl(var(--muted-foreground))" }}` (samme dobbel-wrap-mistanke som turnering-detalj). Inkonsistent med resten av appen — kandidat for DS-migrering. D&D mangler.
- Redesign-prioritet: P1

---

## Fysiske planer

### /portal/tren/fys-plan
- Fil: `src/app/portal/tren/fys-plan/page.tsx`
- Flate: PlayerHQ (lyst, mobil-first `max-w-[430px]`). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb: FYS-plan-hub — mastery-ringer (plassholder), aktive + arkiverte planer.
- Data vist (felt → kilde): `fysiskPlan` + uker.okter → Prisma. Uker/økter-antall, fremgang % (current week / total), status.
- Komponenter: `AthleticEyebrow`, `NyPlanKnapp` (lokal), lokale `MasteryRing/PlanCard`.
- Layout og hierarki: editorial hero («FYS-plan» + «Plassholderverdier · formelen ikke låst») → mastery-ringer-kort (Styrke/Mobilitet/Uthold./Spenst — **alle plassholder, viser «—»**) → aktive planer → arkiverte → tom-tilstand.
- Tilstander: empty («Ingen aktiv plan» + Dumbbell). loading/error MANGLER.
- Interaksjoner: kort → `/portal/tren/fys-plan/[id]`; ny plan → NyPlanKnapp.
- AK-domene vist: FYS-områder (Styrke/Mobilitet/Utholdenhet/Spenst — plassholder; FYS-formel IKKE låst, korrekt respektert), uker/økter.
- Designfil-referanse: hybrid, fil-kommentar.
- Nåværende designkvalitet: ferdig, men hardkodet hex i MasteryRing-farger (`color="#B8852A"`, `"#2563EB"`) + `var(--forest)`/`var(--lime)` blanding + inline Inter-Tight-style + `bg-[rgba(0,88,64,0.1)]`. Mastery-ringer er rene plassholdere (alle «—») — vurder om de skal vises før formel er låst.
- Redesign-prioritet: P1

### /portal/tren/fys-plan/[planId]
- Fil: `src/app/portal/tren/fys-plan/[planId]/page.tsx`
- Flate: PlayerHQ (lyst, desktop `lg:grid-cols-[1fr_320px]`). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`. `findFirst` på `id + userId` (eierskap). `notFound()` ellers.
- Jobb: FYS-plan-detalj/builder — uker m/ økter (venstre) + sammendrag/quick-actions (sidebar). KPI-rad.
- Data vist (felt → kilde): `fysiskPlan` + uker.okter.rader (loggSett) → Prisma. KPI: uker, økter, fullført %, status. Fullført = økt der alle rader har loggSett>0.
- Komponenter: `DetailShell` (shared), `KPICard` (ui), `UkeRad`/`FysPlanSidebar` (`@/components/fys-plan`).
- Layout og hierarki: DetailShell (breadcrumb + backHref + tittel + KPI-rad) → 2-kol: UkeRad-er (kollapsible) + FysPlanSidebar.
- Tilstander: not-found; empty uker («Ingen uker lagt til enda»). loading/error MANGLER.
- Interaksjoner: «Legg til uke» (i sidebar, UVERIFISERT); UkeRad-kollaps.
- AK-domene vist: FYS-økter/uker/sett-logging. Ingen pyramide/L-fase her.
- Designfil-referanse: «per plan Del 31 (FYS-plan modul, 2026-05-24)» — ingen .dc.html.
- Nåværende designkvalitet: ferdig. Bruker delte shell-/KPI-komponenter konsistent — den reneste av plan-detalj-flatene. Breadcrumb «Tren» peker til `/portal/planlegge` (drift mot tren-redirect).
- Redesign-prioritet: P2

---

## Tverrgående funn (gjeld for orkestrator)

1. **Hex-disiplin brytes mest i live-flyten + plan-hubene.** Live-komponentene (`LiveActive`, `LiveBrief`, feiring-SVG) og `kalender`/`teknisk-plan`/`fys-plan` bruker hardkodet hex + `var(--token, #HEXFALLBACK)` + rå rgba der tokens finnes i `globals.css`. Bryter `.claude/rules/designsystem.md` (ingen hex i ny UI).
2. **Mulig HSL-dobbel-wrap-bug:** `turneringer/[id]` (CoachNoteCard `hsl(var(--accent))`) og `teknisk-plan/[planId]` (`hsl(var(--muted-foreground))` inline). Tokens er HSL-trippel UTEN `hsl()`-wrapper → `hsl(var(--x))` kan rendre feil. Verifiser visuelt.
3. **Forbudte design-kilder i kommentarer:** `tapper` peker til `wireframe/design-package/...`; `teknisk-plan/[planId]` til «design-bundle»; `periode/rediger` til `public/design/batch3/...`. Design-porting-gate krever `public/design-handover/`-referanser.
4. **Hardkodet demo-innhold:** `teknisk-plan` periode-span («1. juli → 31. aug · uke 27–35») er fast tekst, ikke data.
5. **Eyebrow-URL-lekkasje:** `tester/katalog` + `tester/ny/egen` viser intern rute som eyebrow-tekst.
6. **Universelt manglende states:** loading/error finnes nesten ingen steder (server components stoler på router/notFound). empty-states er gode.
7. **Plassholder-respekt OK:** FYS-formel og referanseverdier er konsekvent merket «ikke låst» (fys-plan, tester-detalj, [sessionId] SG-effekt) — i tråd med låst beslutning.
