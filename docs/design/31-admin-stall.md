# AgencyOS spiller-/analyse-flater — skjermkort (kode-verifisert 2026-06-29)

38 ruter under `/admin/{spillere,talent,grupper,tester,analyse,analysere,lag-snitt,risiko,board,oppfolging,stall}`. Dominerende mønster: server-component med ekte Prisma-data + «—»-plassholdere der kilde mangler (FYS-formel ikke låst), mørkt AgencyOS-tema (`#0A0B0A`), `font-mono` eyebrows/tall, lime (`#D1F843`) som eneste aksent. To stilfamilier brytes mot hverandre: «hybrid terminal»-flater via `@/components/admin/agencyos/ui` (Ag*-primitiver, tett `[18px]`/`[14px]`-spacing) vs. eldre `DetailShell`/`AdminHero`/`KPICard`/`AthleticBadge`-flater (rundere, lysere idiom). Største gjeld: (1) inkonsistent shell-valg (AgPage vs DetailShell vs HubFrame vs rå div) gir tre forskjellige hero/KPI-uttrykk for samme produkt; (2) flere hardkodede tailwind-paletter (`bg-purple-100`, `bg-emerald-100`, `#FBFAF5`) i strid med token-regelen; (3) talent-modulen blander to radar-implementasjoner og to akse-vokabular (FYS/TEK/SLAG/SPILL/TURN vs fysisk/teknikk/taktikk/mental/motivasjon).

---

### /admin/spillere
- Fil: `src/app/admin/spillere/page.tsx` (klient: `./spillere-tabell.tsx`)
- Flate: AgencyOS (mørk, desktop 1280)
- Rolle/gating: `requirePortalUser({ allow: ["COACH", "ADMIN"] })`
- Jobb (1 setning): Roster-tabell over alle spillere, sortert «de som trenger deg øverst».
- Data vist (felt → kilde): navn/initialer/HCP → `user`; gruppe-bucket (WANG/GFGK/Junior) → `groupMemberships`; SG-delta + sparkline → `sgInputs.sgTotal` (fallback `rounds.sgTotal`, 6 siste); siste aktivitet → maks av `lastLoginAt` og siste `booking`; neste økt → `booking.groupBy._min.startAt`; status «N økter bak» → `trainingPlans.sessions` PLANNED denne uka; «N dg inaktiv»/«På plan» → aktivitets-heuristikk.
- Komponenter: lokal `SpillereTabell` (`./spillere-tabell.tsx`).
- Layout og hierarki: tabell-flate; statusrang alert→warn→ok, deretter nærmeste økt. Ingen separat hero i server-fila (ligger i klient-tabellen).
- Tilstander: empty (`trengerDeg`-telling, «—» i celler) finnes; loading/error MANGLER (force-dynamic server).
- Interaksjoner: rad → spillerprofil (i klient-komponent, UVERIFISERT eksakt href).
- AK-domene vist: SG-delta + sparkline, HCP, pyramide-bucket via gruppe.
- Designfil-referanse: `AgencyOS Stall v2 (smart sortering).dc.html`.
- Nåværende designkvalitet: ferdig — kanonisk smart-sortert roster. Merk `?view=tavle` mottas her (board-redirect) men board/tavle-visning er UVERIFISERT i denne fila.
- Redesign-prioritet: P2

### /admin/spillere/[id]
- Fil: `src/app/admin/spillere/[id]/page.tsx`
- Flate: AgencyOS (mørk, desktop 1280)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Spillerprofil 360° — hero + coach-flagg + pyramide + siste runder/tester + aktiv plan + meldinger.
- Data vist (felt → kilde): hero eyebrow (bucket·ambisjon·HCP) → `user`; neste turnering → `tournamentEntry`; coach-flagg «N økter bak»/«N dg inaktiv» → ukens `trainingPlanSession` + `lastLoginAt`; pyramide (5 akser m/ pst) → `loadSpillerDetaljOversikt`; runder → `round` (score+par+sgTotal); tester → `testResult`; aktiv plan (progress) → `trainingPlan.isActive`; meldinger-kort → PENDING `planAction.suggestion` (zod `suggestionSchema`) fallback `oversikt.comms`.
- Komponenter: `@/components/admin/agencyos/ui` (AgAvatar/AgChip/AgPage/AgTable/AgTd/AgTh/agBtnClass); lokale `Eyebrow`/`Sechead`/`PyrRow`.
- Layout og hierarki: hero-kort (avatar 64 pri + Melding/Ny plan/Ny økt CTA, primær = Ny økt → Workbench); 2-kol grid: venstre coach-flagg + pyramide + runder/tester-tabell, høyre aktiv plan + hurtighandlinger + meldinger.
- Tilstander: empty per seksjon (pyramide/hendelser/plan/melding) finnes; flagg skjules uten data; loading/error MANGLER.
- Interaksjoner: alle CTA → Workbench/innboks/godkjenninger/bookinger/tournaments; aktiv plan → `/admin/plans`.
- AK-domene vist: treningspyramide (FYS/TEK/SLAG/SPILL/TURN m/ `var(--pyr-*)`), SG per runde, plan-etterlevelse %, coach-flagg.
- Designfil-referanse: `AgencyOS Spiller-detalj (terminal).dc.html`.
- Nåværende designkvalitet: ferdig — tett og rik, token-disiplinert. Lenker peker dels på engelske ruter (`/admin/plans`, `/admin/approvals`, `/admin/tournaments`) som kan være drop-off/inkonsistente mot norske `/admin/godkjenninger`.
- Redesign-prioritet: P2

### /admin/spillere/[id]/profil
- Fil: `src/app/admin/spillere/[id]/profil/page.tsx` (klient: `./invite-parent-button`, `./slett`-ev.)
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Full stamdata-profil — personalia, foresatte, spiller-DNA-radar, aktive mål, skade-historikk, coach-vurdering.
- Data vist (felt → kilde): personalia → `user`; foresatte → `childRelations.parent`; spiller-DNA (5-akset radar vs cohort) → `user.preferences.spillerDna` (JSON, fallback hardkodet sample); aktive mål → `goals` (ACTIVE); skader/permisjoner → `leaves`; coach-vurdering → `coachNotesAbout[0]`.
- Komponenter: lokale `Fact`/`DnaAxisRow`/`RadarChart`/`ProgressRing` (inline SVG); `@/lib/avatar-colors`.
- Layout og hierarki: vertikal stack, sub-hero m/ tilbake-pill + Rediger-CTA; 6 seksjons-kort; coach-vurdering som lime-stripe blockquote (Inter Tight italic).
- Tilstander: empty per seksjon (foresatte/mål/skader/vurdering) finnes; loading/error MANGLER.
- Interaksjoner: Rediger → `/rediger`; invite-parent-knapp (server action); mål-progress hardkodet `pct=50`.
- AK-domene vист: 5-akset spiller-DNA-radar (FYS/TEK/SLAG/SPILL/TURN), måltyper (Resultat/Prosess/Atferd fra Goal.type), cohort-snitt.
- Designfil-referanse: `AgencyOS Spiller-detalj-faner (terminal).dc.html` (delvis).
- Nåværende designkvalitet: halvferdig/inkonsistent — spiller-DNA og mål-progress bruker plassholder/sample-data (`dna` fallback, `pct=50` hardkodet). `Stripe-betaler`-badge antas uten kildesjekk. `var(--color-pyr-*)`-format avviker fra `var(--pyr-*)` brukt andre steder.
- Redesign-prioritet: P1

### /admin/spillere/[id]/rediger
- Fil: `src/app/admin/spillere/[id]/rediger/page.tsx` (`./actions` lagreSpiller, `./slett-spiller-knapp`)
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Rediger spiller-stamdata med sticky lagre-bar topp+bunn og endrings-historikk.
- Data vist (felt → kilde): form-felter → `user`; endrings-historikk → `auditLog` (target `user:<id>`) m/ `actor`; foresatte-liste → `parentRelation`.
- Komponenter: lokale `Field`/`FieldArea`; server action `lagreSpiller`.
- Layout og hierarki: 2-kol form (3fr/2fr); sticky save-bar (Avbryt/Lagre, accent-knapp topp, primary bunn); høyre sticky endrings-historikk.
- Tilstander: empty (historikk/foresatte) finnes; form-validering kun `required`; loading/error/success MANGLER (server action redirect antatt).
- Interaksjoner: Lagre → `lagreSpiller`; Slett → `SlettSpillerKnapp`; foresatt «Rediger» → `/profil`; «Interne notater» defaultValue tom (lagring UVERIFISERT).
- AK-domene vist: HCP-input (komma-format +0,5), ambisjon (vises i hero).
- Designfil-referanse: ingen prototype direkte (skjerm 5 v2 nevnt i fil-header, ikke i handover).
- Nåværende designkvalitet: ferdig funksjonelt; «Interne notater»-feltet har tom defaultValue uten tydelig persist-kobling (mulig dead field).
- Redesign-prioritet: P2

### /admin/spillere/[id]/workbench
- Fil: `src/app/admin/spillere/[id]/workbench/page.tsx`
- Flate: AgencyOS (mørk) — delt Workbench, mobil+desktop paritet
- Rolle/gating: `getCurrentUser` → ADMIN/COACH ellers redirect `/auth/login`
- Jobb (1 setning): Coach-Workbench (lanserings-hub) for én spiller — planlegging, teknisk plan, gantt/uke/økt.
- Data vist (felt → kilde): `loadWorkbenchContext(id, weekOffset)` (data/insights/tekniskPlan/planId/planStatus); spiller-navn → `user`; roster (400) → `user` PLAYER; coachName → me.
- Komponenter: `@/components/workbench-hybrid` (WorkbenchHybrid, role="coach"); `parseWeekOffset`.
- Layout og hierarki: hele skjermen delegert til WorkbenchHybrid (7 hub-faner, KPI-strip, palette-sidebar coach-only). Se design-porting-gate «Workbench lanserings-hub» for de mange bevisste avvikene.
- Tilstander: `notFound()` når context null; empty states inne i WorkbenchHybrid; Suspense fallback=null.
- Interaksjoner: `?uke=`-offset (kun inneværende uke i v1); plan-publisering/AI/ny økt inne i hybrid.
- AK-domene vist: AK-FORMEL, pyramide, teknisk plan (P-posisjoner/drills), sesongmål, gantt-faser, L-fase, SG-kobling.
- Designfil-referanse: `Flyt - AgencyOS Spiller og plan (terminal).dc.html` + WB-PNG-serie.
- Nåværende designkvalitet: ferdig (egen låst porting-gate). Tynt server-skall — all design ligger i `workbench-hybrid`.
- Redesign-prioritet: P3 (egen gate styrer dette)

### /admin/spillere/[id]/fremgang
- Fil: `src/app/admin/spillere/[id]/fremgang/page.tsx`
- Flate: AgencyOS — men LYST/generisk idiom (avvik)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): SG-fremgang siste 8 uker per område + treningsvolum + korrelasjon trening↔SG.
- Data vist (felt → kilde): SG per OTT/APP/ARG/PUTT per uke → `round` (sgOtt/sgApp/sgArg/sgPutt) aggregert per ISO-uke; treningsvolum → `hentTreningsVolum`; Pearson-korrelasjon → `beregnKorrelasjon`.
- Komponenter: `@/components/fremgang/SgSparkline`, `TreningsvolumBar`; `SG_AREA_LABEL`.
- Layout og hierarki: `container mx-auto py-8`; tittel + 2-kol grid (SG-sparklines / volum-bar) + korrelasjonstabell (r, datapunkter, tolkning).
- Tilstander: empty («Ingen runder registrert») finnes; loading/error MANGLER.
- Interaksjoner: ingen (ren visning, ingen tilbake-lenke).
- AK-domene vist: SG-kategorier (OTT/APP/ARG/PUTT), korrelasjon-tolkning (Trening hjelper / Sjekk metode / For lite data).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: stygg/inkonsistent — bruker generisk `border rounded-lg`, ingen AgencyOS-shell, ingen hero/tilbake, lys default-tabellstil. Klart out-of-system mot resten av flaten.
- Redesign-prioritet: P1

### /admin/spillere/[id]/tester
- Fil: `src/app/admin/spillere/[id]/tester/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Coach-view av en spillers testbatteri (faner).
- Data vist (felt → kilde): `loadSpillerTesterData(id)` → `CoachSpillerTesterTabScreen`.
- Komponenter: `@/components/test-modul-v2/coach-spiller-tester-tab-screen`.
- Layout og hierarki: delegert til komponent (UVERIFISERT i denne fila).
- Tilstander: `notFound()` ved manglende data; resten i komponent.
- Interaksjoner: i komponent.
- AK-domene vist: tester/PEI, pyramide-område (i komponent).
- Designfil-referanse: `AgencyOS Tester (hybrid).dc.html` / `PlayerHQ Tester-flyt`.
- Nåværende designkvalitet: tynt skall — kvalitet avhenger av `coach-spiller-tester-tab-screen` (utenfor scope).
- Redesign-prioritet: P3 (verifiser komponent separat)

### /admin/spillere/[id]/tildel-test
- Fil: `src/app/admin/spillere/[id]/tildel-test/page.tsx`
- Flate: AgencyOS modal
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Modal for å tildele test til en spiller.
- Data vist (felt → kilde): spiller → `user`; tester (navn/desc/pyramidArea) → `testDefinition`; pyrCounts aggregert.
- Komponenter: `@/components/test-modul-v2/tildel-test-modal-screen`.
- Layout og hierarki: delegert til modal-komponent.
- Tilstander: `notFound()` ved manglende spiller.
- Interaksjoner: i komponent.
- AK-domene vist: pyramide-område-counts per testbatteri.
- Designfil-referanse: `AgencyOS Tester (hybrid).dc.html` (tildel-modal).
- Nåværende designkvalitet: tynt skall. Duplikat av `/admin/tester/tildel/[spillerId]` (samme modal-mønster, annen komponent — `TildelTestModalScreen` vs `TildelModal`).
- Redesign-prioritet: P3

### /admin/spillere/[id]/plan
- Fil: `src/app/admin/spillere/[id]/plan/page.tsx`
- Flate: AgencyOS — LYST hero-idiom (`from-[#FBFAF5]`)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Plan-indeks: 0 planer = tom-tilstand, 1 = redirect til detalj, 2+ = liste.
- Data vist (felt → kilde): planer (navn/status/start/slutt/updatedAt) → `technicalPlan`; navn → `user`.
- Komponenter: `@/components/athletic` (AthleticEyebrow/AthleticButton).
- Layout og hierarki: hero (eyebrow + display italic «planer» + tilbake-lenke); enten tom-state-kort eller plan-liste (status-rang ACTIVE→DRAFT→ARCHIVED).
- Tilstander: empty (m/ «Lag plan i Workbench») finnes; redirect ved 1 plan; loading/error MANGLER.
- Interaksjoner: rad → `/plan/[planId]`; «Lag plan» → Workbench; tilbake → spillerprofil.
- AK-domene vist: TechnicalPlan-status, teknisk-plan-konsept.
- Designfil-referanse: ingen prototype (kommentar: «løser opp død lenke»).
- Nåværende designkvalitet: halvferdig/inkonsistent — bruker `#FBFAF5`-gradient (hardkodet hex, lyst) og `hsl(var(--primary))` inline-style, ikke AgencyOS mørk shell. Out-of-system mot `/admin/spillere/[id]`.
- Redesign-prioritet: P1

### /admin/spillere/[id]/plan/[planId]
- Fil: `src/app/admin/spillere/[id]/plan/[planId]/page.tsx` (`./plan-toolbar`, `./drills-panel`)
- Flate: AgencyOS — LYST hero-idiom + hardkodede tailwind-paletter
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Spiller-plan-detalj med 5 faner (Oversikt/Periodisering/Drills(default)/Hit-rate/Effekt).
- Data vist (felt → kilde): plan + posisjoner + tasks + tmGoals → `technicalPlan.positions.tasks` (EKTE); drills → mappet `DrillRow` m/ reps (dry/lav/full), hit-rate fra `PositionTaskTmGoal` HIT_RATE.
- Komponenter: `@/components/athletic` (AthleticEyebrow), `TabBar`, `teknisk-plan/constants` (SG_BUCKETS), `DrillsPanel`, `PlanToolbar`; lokal `KpiBox`.
- Layout og hierarki: hero (eyebrow + display + tilbake + toolbar publiser); KPI-strip (STATUS/P-POSISJONER/DRILLS/MED TM-MÅL); TabBar; fane-innhold.
- Tilstander: `notFound()` (feil eier); ærlige tom-tilstander per fane (hit-rate/effekt «kommer»); loading/error MANGLER.
- Interaksjoner: faner via `?tab=`; publiser/rediger via PlanToolbar; drills-CRUD i DrillsPanel.
- AK-domene vist: P-posisjoner (P7.0 Impact), drills per pyramide (FYS/TEK/SLAG/SPILL/TURN), hit-rate/TM-mål, omraade↔SG-bucket, L-fase/CS/M/PR (i OppgaveDraft).
- Designfil-referanse: Claude Design bundle `Sg2FEKvykU45c4naIgQx6w` (`s3-plan-detalj.jsx`) — IKKE i `public/design-handover/`. **Brudd på design-kilde-regelen** (refererer ikke-handover-kilde i kommentar).
- Nåværende designkvalitet: inkonsistent — `bg-purple-100/text-purple-800`, `bg-emerald-100`, `bg-sky-100` osv. hardkodet (CATEGORY_COLOR) i strid med token-regelen; lyst `#FBFAF5`-hero; `text-emerald-700` for hit-rate. Funksjonelt rik men palett-gjeld.
- Redesign-prioritet: P0 (token-brudd + ikke-handover-referanse)

### /admin/spillere/[id]/fremgang
(se over)

### /admin/spillere/ny
- Fil: `src/app/admin/spillere/ny/page.tsx` (klient: `./wizard`, `./actions` createSpiller)
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Multi-steg onboarding-wizard for ny spiller.
- Data vist (felt → kilde): ingen i server-skall; wizard er klient.
- Komponenter: `SpillerOnboardingWizard` (`./wizard`).
- Layout og hierarki: tilbake-lenke «Stallen» + wizard-mount.
- Tilstander: i wizard (UVERIFISERT her).
- Interaksjoner: createSpiller server action (i wizard).
- AK-domene vist: i wizard.
- Designfil-referanse: ingen prototype (net-new flyt).
- Nåværende designkvalitet: tynt skall — kvalitet i `./wizard` (utenfor scope).
- Redesign-prioritet: P3 (verifiser wizard separat)

---

### /admin/stall
- Fil: `src/app/admin/stall/page.tsx` (klient: `./stall-client`)
- Flate: AgencyOS (mørk, hybrid terminal)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Stall — roster-tabell (venstre) + 360°-panel (høyre).
- Data vist (felt → kilde): navn/HCP/gruppe → `user`+`groupMemberships`; SG-verdi+retning → `sgInputs.sgTotal` (fallback rounds); pyramide-balanse → normalisert fra `sgInputs` SG-komponenter (FYS = hardkodet 60 plassholder); siste aktivitet → `lastLoginAt`/booking; tone (up/warn/down) → behind+inaktivitet; `adh: "88 %"` HARDKODET (adherence ikke i schema).
- Komponenter: lokal `StallClient`.
- Layout og hierarki: i klient (roster + detalj-panel).
- Tilstander: «—» i celler; loading/error MANGLER.
- Interaksjoner: i StallClient (UVERIFISERT eksakt).
- AK-domene vist: SG-total + komponenter, pyramide-balanse (5 akser), HCP.
- Designfil-referanse: `AgencyOS Stall (hybrid).dc.html`.
- Nåværende designkvalitet: halvferdig — `adh: "88 %"` og `FYS pct: 60` er liksom-tall (bryter «aldri fabrikkér»-regelen); pyramide normaliseres fra SG på en proxy-måte. Overlapper sterkt med `/admin/spillere` (smart-sortering) — to roster-flater for samme jobb.
- Redesign-prioritet: P1 (fabrikerte tall + duplikat-flate vs /admin/spillere)

### /admin/risiko
- Fil: `src/app/admin/risiko/page.tsx`
- Flate: AgencyOS (mørk, hybrid terminal)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Risiko-/belastningskart — heatmap-grid over stallen + liste «trenger oppfølging nå».
- Data vist (felt → kilde): spiller/status → `user.userStatus`; aktiv leave/skade → `leaves`; aktiv plan → `trainingPlans` (ACTIVE/ACCEPTED); siste fullførte økt → `trainingPlanSessionLog.completedAt` via plan.userId; risikonivå 0–4 → heuristikk (skade/permisjon/dager-siden-økt).
- Komponenter: `@/components/admin/agencyos/ui` (AgChip/AgPage/AgPageHead/AgAvatar).
- Layout og hierarki: PageHead m/ «N kritiske» puls-indikator; 1fr/340px grid: heatmap (8-kol, frosted grid-bg) + risiko-liste (border-left fargekodet).
- Tilstander: empty (ingen spillere / ingen forhøyet risiko) finnes; loading/error MANGLER.
- Interaksjoner: heatmap-celle + liste-rad → `/admin/spillere/[id]`.
- AK-domene vist: belastnings-/risikonivå (5 trinn), skade/permisjon-flagg, treningsfrekvens.
- Designfil-referanse: `AgencyOS Risiko (hybrid).dc.html`.
- Nåværende designkvalitet: ferdig — token-disiplinert heatmap. Eneste merknad: risikoformel er heuristikk (ikke AK-formel) — dokumentert i header.
- Redesign-prioritet: P2

### /admin/oppfolging
- Fil: `src/app/admin/oppfolging/page.tsx`
- Flate: alias (re-eksporterer `/admin/queue`)
- Rolle/gating: arver fra QueuePage
- Jobb (1 setning): Stub — re-eksport av `@/app/admin/queue/page` (oppfølgingskø).
- Data vist: arvet fra queue (utenfor scope).
- Designfil-referanse: `05-oppfolgingsko.html` (nevnt i header, ikke i handover-mappa).
- Nåværende designkvalitet: stub (ren re-eksport). Orphan: ikke i `admin-nav.ts`.
- Redesign-prioritet: P3 (verifiser `/admin/queue` separat)

### /admin/board
- Fil: `src/app/admin/board/page.tsx`
- Flate: redirect
- Rolle/gating: ingen (redirect)
- Jobb (1 setning): Stub — `redirect("/admin/spillere?view=tavle")`.
- Designfil-referanse: ingen.
- Nåværende designkvalitet: stub/redirect. NB: `?view=tavle` tavle-visning er ikke verifisert implementert i `/admin/spillere/page.tsx` (server-fila rendrer kun tabell) — mulig dead redirect-mål.
- Redesign-prioritet: P3 (verifiser at tavle-view finnes)

---

### /admin/analyse
- Fil: `src/app/admin/analyse/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Stall-analyse — 4 KPI-kort + pyramide-fordeling (stall) + per-gruppe-tabell.
- Data vist (felt → kilde): treningstimer 30 d (+delta) → `trainingPlanSession.durationMin` COMPLETED; snitt SG-utvikling → `round.sgTotal` 30d vs forrige 30d; økt-oppmøte → COMPLETED/ikke-CANCELLED; inaktive 7+ dg → `user.lastLoginAt`; pyramide-fordeling → `trainingPlanSession.groupBy(pyramidArea)` COMPLETED; per gruppe (timer/uke, snitt SG) → `group.members` + `round`/`session`-aggregat.
- Komponenter: `@/components/admin/agencyos/ui` (AgPage/AgPageHead/AgSectionHead/AgTable...); lokale `KpiCard`/`PyramidBars`.
- Layout og hierarki: PageHead «Stallen i tall.»; 4-kol KPI-strip; 2-kol (pyramide-barer + accent-innsikt / per-gruppe-tabell).
- Tilstander: «—» + ærlig innsikt-tekst når ingen økter; loading/error MANGLER.
- Interaksjoner: gruppe-rad → `/admin/lag-snitt`.
- AK-domene vist: pyramide-fordeling (5 akser), SG-utvikling, stall-aggregat.
- Designfil-referanse: `agencyos-app/screens-analyze.jsx` (StableAnalysisScreen) + `AgencyOS Analyse-rester (terminal).dc.html`.
- Nåværende designkvalitet: ferdig — token-disiplinert, alt fra ekte data m/ ærlige tomstater.
- Redesign-prioritet: P2

### /admin/analysere
- Fil: `src/app/admin/analysere/page.tsx` (`./_hub-actions`)
- Flate: AgencyOS — Hub-idiom (HubFrame, egen stilfamilie)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Innsikt-hub — 8 nav-kort til stall-statistikk/tester/godkjenninger/rapporter/økonomi/helse.
- Data vist (felt → kilde): spillere → `user`; overdue tester → `testAssignment`; godkjenninger → `planAction` PENDING; forespørsler → `sessionRequest` PENDING; runder → `round`; finance netto → `payment` (amountOre − refundert); skader → `leave` isInjury.
- Komponenter: `@/components/hubs` (HubFrame/HubHeader/HubCard/HubPill/HubSparkline/HubStatSep); `HubActions`.
- Layout og hierarki: HubHeader (eyebrow + italic «stallen» + stats-rad m/ warn-dots) + `hub-grid` av 8 nummererte HubCard m/ statusPill.
- Tilstander: pill-varianter (danger/warn/ok) per kort; «—» når finance mangler grunnlag; loading/error MANGLER.
- Interaksjoner: hvert kort → respektiv rute (lag-snitt/tester/godkjenninger/foresporsler/reports/runder/okonomi/tilstander).
- AK-domene vist: indirekte (pyramide-snitt-kort, tester, runder).
- Designfil-referanse: `hubs-coach.jsx` (CoachInnsikt); `AgencyOS Analyse-rester (terminal).dc.html`.
- Nåværende designkvalitet: ferdig men egen stilfamilie (HubFrame) som ikke matcher AgPage-flatene — bidrar til shell-fragmenteringen. Lenker til engelske ruter (`/admin/reports`).
- Redesign-prioritet: P2

### /admin/analysere/compliance
- Fil: `src/app/admin/analysere/compliance/page.tsx`
- Flate: AgencyOS (mørk, v10-fasit)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Compliance-sporing — plan-økter vs. faktiske reps per spiller/stall.
- Data vist (felt → kilde): `loadComplianceData({windowDays, selectedPlayerId})` → mappet til v10 `ComplianceData` (panel/players/stall/cohort/drillSession). Tom-tilstand bevart (panel/drillSession null).
- Komponenter: `@/components/admin/compliance/compliance` (Compliance); loader `@/lib/admin-compliance/compliance-data`.
- Layout og hierarki: delegert til `<Compliance>` (UVERIFISERT internt).
- Tilstander: empty bevart i mapping; loading/error MANGLER.
- Interaksjoner: `?periode=` (7d/30d/90d/365d), `?studentId=`.
- AK-domene vist: plan-etterlevelse %, pyramide-akser per spiller, drill-session-detalj, kohort-snitt/median.
- Designfil-referanse: v10 `ag-compliance`-fasit (komponent).
- Nåværende designkvalitet: tynt skall (loader+mapping). Kvalitet i `Compliance`-komponenten. Nav: lenket fra `admin-nav.ts`.
- Redesign-prioritet: P3 (verifiser komponent separat)

### /admin/lag-snitt
- Fil: `src/app/admin/lag-snitt/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Pyramide-fordeling per gruppe — 3-kol grid av gruppekort.
- Data vist (felt → kilde): grupper + medlemmer → `group.members`; pyramide-pst → `trainingPlanSession.groupBy(pyramidArea)` COMPLETED per gruppe-medlemmer.
- Komponenter: `@/components/admin/agencyos/ui` (AgChip/AgPage/AgPageHead); lokal `PyramidBars`.
- Layout og hierarki: PageHead «Pyramide per gruppe.»; 3-kol kort (navn + medlemstall-chip + pyramide-barer).
- Tilstander: «—» per akse uten økter; empty (ingen grupper) finnes; loading/error MANGLER.
- Interaksjoner: ingen (ren visning).
- AK-domene vist: pyramide-fordeling per gruppe (5 akser, fasit-rekkefølge).
- Designfil-referanse: `agencyos-app/screens-analyze.jsx` (TeamAverageScreen).
- Nåværende designkvalitet: ferdig — konsistent med `/admin/analyse`.
- Redesign-prioritet: P2

---

### /admin/talent
- Fil: `src/app/admin/talent/page.tsx`
- Flate: AgencyOS (mørk, hybrid terminal)
- Rolle/gating: ADMIN, COACH
- Jobb (1 setning): Talent Coach — SkillRadar + PercentileGauge + Pyramide-balanse + H2H for valgt spiller.
- Data vist (felt → kilde): `talentTracking` (fysisk/teknikk/taktikk/mental/motivasjon, 0–10→0–100) + `user`; percentil = radar-snitt vs stall; H2H = spiller vs stall-snitt per akse; valgt spiller via `?spiller=`.
- Komponenter: `@/components/admin/agencyos/ui` (AgPage/AgPageHead/agBtnClass), `EmptyState`; lokal SVG radar/gauge.
- Layout og hierarki: PageHead «Talent Coach» + Discovery-CTA; spiller-selector-chips; 3-kol grid (radar/gauge/pyramide+H2H); spiller-info-rad.
- Tilstander: EmptyState (ingen i program) finnes; «—» uten data; loading/error MANGLER.
- Interaksjoner: selector → `?spiller=`; «Åpne full radar» → `/talent/radar/[id]`; Discovery/Alle radar-CTA.
- AK-domene vist: 5-akset talent-radar (NB: akser merket FYS/TEK/SLAG/SPILL/TURN men mappet til fysisk/teknikk/taktikk/mental/motivasjon — vokabular-mismatch), percentil vs stall.
- Designfil-referanse: `AgencyOS Talent Coach (hybrid).dc.html`.
- Nåværende designkvalitet: inkonsistent — bruker `hsl(var(--color-pyr-*, #hex))` med hardkodede hex-fallbacks; PYR_AKSER-labels (FYS/TEK/SLAG/SPILL/TURN) stemmer ikke med underliggende TalentTracking-akser (taktikk/mental/motivasjon) → forvirrende domenemapping. Funksjonelt rik.
- Redesign-prioritet: P1 (akse-vokabular-mismatch + hardkodet hex)

### /admin/talent/[playerId]
- Fil: `src/app/admin/talent/[playerId]/page.tsx` (`./actions`)
- Flate: AgencyOS — DetailShell-idiom (lysere)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Talent 360-profil — hero + 5 KPI + stor radar + milepæler + notater + hurtigvalg.
- Data vist (felt → kilde): `talentTracking` (5 akser + total-snitt) + `user`; milepæler → `t.milepaeler` (JSON-array); notater → `t.notater`.
- Komponenter: `@/components/shared/detail-shell` (DetailShell), `AthleticBadge`; lokal `RadarChart` (480px SVG); server actions `lagreNotater`/`loggMilepael`.
- Layout og hierarki: DetailShell (breadcrumb + statusPill nivå); hero-kort (avatar 120px); 5 KPI + total-kort (lime); 1.4fr/1fr (radar / milepæler-timeline m/ form); notater-form; 3-kort hurtigvalg.
- Tilstander: `notFound()`; empty (ingen milepæler) finnes; loading/error MANGLER.
- Interaksjoner: logg milepæl/lagre notater (server actions); hurtigvalg → sammenligning/kohort/ressurser.
- AK-domene vist: 5-akset radar (fysisk/teknikk/taktikk/mental/motivasjon, 1–10), nivå (U10–Senior), total-score.
- Designfil-referanse: `src/app/talent-spiller-360-demo/page.tsx` (demo, IKKE handover) + `AgencyOS Talent-modul (terminal).dc.html`.
- Nåværende designkvalitet: inkonsistent — DetailShell-idiom (lysere, `bg-primary text-primary-foreground` hero) avviker fra `/admin/talent` hybrid-terminal; `var(--color-*)` + `var(--font-geist-mono)`/`var(--font-geist)` (Geist, ikke prosjektets JetBrains/Inter) referert i SVG. Akse-vokabular avviker fra `/admin/talent`.
- Redesign-prioritet: P1 (feil font-token + shell-mismatch)

### /admin/talent/discovery
- Fil: `src/app/admin/talent/discovery/page.tsx` (`./legg-til-form`)
- Flate: AgencyOS — AdminHero-idiom
- Rolle/gating: ADMIN, COACH
- Jobb (1 setning): Scout-feed — PLAYER-brukere ikke i TalentTracking, m/ søk + HCP/klubb-filter + legg-til.
- Data vist (felt → kilde): kandidater → `user` (role PLAYER, `talentTracking: null`); filtre HCP-range/klubb/søk klientside.
- Komponenter: `@/components/admin/admin-hero` (AdminHero), `EmptyState`; `LeggTilForm` (server action).
- Layout og hierarki: PageHeader + tilbake-CTA; søkeform; HCP-chips; klubb-chips; resultat-tabell (Spiller/Klubb/HCP/Spilt år/Handling).
- Tilstander: EmptyState (ingen treff) finnes; loading/error MANGLER.
- Interaksjoner: filter via `?q=&hcp=&klubb=`; legg-til-form per rad.
- AK-domene vist: HCP-ranges, spilte år.
- Designfil-referanse: `Flyt - Talent og utfordringer (terminal-lys).dc.html` (delvis).
- Nåværende designkvalitet: ferdig funksjonelt; AdminHero-idiom (egen hero-familie) — bidrar til hero-fragmentering i talent-modulen.
- Redesign-prioritet: P2

### /admin/talent/kohort
- Fil: `src/app/admin/talent/kohort/page.tsx`
- Flate: AgencyOS — AdminHero-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Kohort-analyse — TalentTracking gruppert per nivå (U10–Senior), snitt-radar + 90d-progresjon.
- Data vist (felt → kilde): `talentTracking` (5 akser + inkludertFra) gruppert på `niva`; progresjon = registrert siste 90 dager.
- Komponenter: `AdminHero`, `EmptyState`.
- Layout og hierarki: PageHeader; 6-kol kohort-kort (antall + snitt + 90d-chip); tabell nivå × 5 dimensjoner + total + 90d.
- Tilstander: EmptyState (ingen talent) finnes; tomme kohorter dempet; loading/error MANGLER.
- Interaksjoner: tilbake → `/admin/talent`; (kohort-kort uten lenke).
- AK-domene vist: 5-akset radar-snitt per nivå (1–10), kohort-progresjon.
- Designfil-referanse: `src/app/talent-kohort-demo/page.tsx` (demo, IKKE handover).
- Nåværende designkvalitet: ferdig funksjonelt; refererer demo-kilde (ikke handover) i header.
- Redesign-prioritet: P2

### /admin/talent/radar
- Fil: `src/app/admin/talent/radar/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Talent-radar-liste — talenter sortert på WAGR-rank m/ mini-pyramide (økter per akse).
- Data vist (felt → kilde): `talentTracking` + `user.wagrSnapshot` (rank/moveDelta) + `trainingPlans.sessions.pyramidArea`-counts; signal (Stigende/Watch/Stabil/Uten WAGR) av WAGR-trend.
- Komponenter: `@/components/admin/agencyos/ui` (AgAvatar/AgChip/AgPage/AgPageHead/agBtnClass).
- Layout og hierarki: PageHead «N emner på WAGR-kurs»; liste av rader (avatar tone=lime for beste rank + navn + signal-chip + WAGR/alder/uke-trend + mini-pyramide-barer).
- Tilstander: empty (ingen talenter) finnes; «—» uten WAGR; loading/error MANGLER.
- Interaksjoner: rad → `/admin/spillere/[id]`; Sammenlign/WAGR-import-CTA.
- AK-domene vist: WAGR-rank + ukestrend, mini-pyramide (5 akser, økt-antall), signal-derivat.
- Designfil-referanse: `agencyos-app/screens-stable.jsx` (TalentRadarScreen).
- Nåværende designkvalitet: ferdig — token-disiplinert (`bg-pyr-*`-klasser), ærlige bevisste avvik dokumentert i header.
- Redesign-prioritet: P2

### /admin/talent/radar/[playerId]
- Fil: `src/app/admin/talent/radar/[playerId]/page.tsx` (`./radar-form`)
- Flate: AgencyOS — DetailShell-idiom
- Rolle/gating: ADMIN, COACH
- Jobb (1 setning): Radar-vurdering per spiller — pentagon-radar (1–10) vs nivå-snitt + redigerings-form.
- Data vist (felt → kilde): `talentTracking` (5 akser) + `user`; peer-snitt → andre på samme `niva`; KPI sum/snitt/peer-snitt/HCP.
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`, `@/components/portal/talent/radar-chart` (RadarChart, AXIS_KEYS/LABELS); `RadarForm`.
- Layout og hierarki: DetailShell (breadcrumb + KPI-rad); 2-kol (radar-chart m/ overlay + per-akse-sammenligning / form).
- Tilstander: `notFound()`; «—» uten verdier; loading/error MANGLER.
- Interaksjoner: oppdaterRadar (i RadarForm); tilbake → `/admin/talent`.
- AK-domene vист: 5-akset radar (peer-overlay), nivå-snitt.
- Designfil-referanse: ingen handover-prototype (M13 K2).
- Nåværende designkvalitet: ferdig funksjonelt; DetailShell + delt `portal/talent/radar-chart` (deler komponent med PlayerHQ) — tredje radar-implementasjon i talent-modulen (jf. `/admin/talent` inline + `/talent/[playerId]` inline). Konsoliderings-kandidat.
- Redesign-prioritet: P1 (radar-fragmentering)

### /admin/talent/region
- Fil: `src/app/admin/talent/region/page.tsx`
- Flate: AgencyOS — AdminHero-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Regional pipeline — TalentTracking per region m/ forenklet Norge-pin-kart + tabell.
- Data vist (felt → kilde): `talentTracking` (region/klubb/5 akser) gruppert til 7 regioner via nøkkelord-match; snitt-radar + topp-klubber per region; `?niva=`-filter.
- Komponenter: `AdminHero`, `EmptyState`; inline SVG Norge-kart.
- Layout og hierarki: PageHeader; nivå-chips; 420px/1fr (pin-kart / region-tabell: Region/Antall/Snitt-radar/Topp-klubber).
- Tilstander: EmptyState (ingen talent) finnes; loading/error MANGLER.
- Interaksjoner: `?niva=`-filter (chips).
- AK-domene vist: region-snitt-radar, klubb-fordeling.
- Designfil-referanse: `src/app/talent-region-pipeline-demo/page.tsx` (demo, IKKE handover).
- Nåværende designkvalitet: halvferdig — pin-kart er bevisst grov stub (header sier «ikke kart»), `var(--font-geist-mono)` feil-font referert i SVG-tekster. Orphan: ikke i `admin-nav.ts`.
- Redesign-prioritet: P2

### /admin/talent/ressurser
- Fil: `src/app/admin/talent/ressurser/page.tsx` (`./actions`)
- Flate: AgencyOS — AdminHero-idiom
- Rolle/gating: COACH, ADMIN (kun ADMIN legger til)
- Jobb (1 setning): Ressurs-bibliotek — filter på kategori/nivå/fokus, kort-grid, admin legg-til-form.
- Data vist (felt → kilde): `talentRessurs` (tittel/url/kategori/niva/fokus/beskrivelse); CBAC: `user.role === ADMIN` → legg-til-form.
- Komponenter: `AdminHero`, `EmptyState`; lokale `FilterRow`/`ChipLink`; server action `leggTilRessurs`.
- Layout og hierarki: PageHeader; filter-chips (3 rader); admin-form (betinget); 3-kol kort-grid (kategori-pill + nivå/fokus + tittel + ekstern «Åpne»).
- Tilstander: EmptyState (ingen treff) finnes; loading/error MANGLER.
- Interaksjoner: filter via `?kategori=&niva=&fokus=`; ekstern url (target=_blank).
- AK-domene vist: nivå (U10–Senior), fokus (teknikk/mental/taktikk/fysisk/motivasjon).
- Designfil-referanse: ingen handover-prototype (K4).
- Nåværende designkvalitet: ferdig funksjonelt; AdminHero-idiom. Orphan: ikke i `admin-nav.ts` (nås via talent/[playerId]-hurtigvalg).
- Redesign-prioritet: P3

### /admin/talent/sammenligning
- Fil: `src/app/admin/talent/sammenligning/page.tsx` (`./map-compare-data`)
- Flate: AgencyOS (mørk, v10)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Side-by-side sammenligning av inntil 4 talenter (radar/SG).
- Data vist (felt → kilde): `loadMultiCompare(ids)` (Prisma) → `mapCompareData` → `TalentSammenligning`; `?ids=`, fallback = topp-3 fra kohort-SG.
- Komponenter: `@/components/admin/agencyos/ui` (AgPage); `@/components/admin/talent/sammenligning` (TalentSammenligning v10).
- Layout og hierarki: AgPage-wrapper + delegert komponent.
- Tilstander: fallback-utvalg når ingen ids; resten i komponent; loading/error MANGLER.
- Interaksjoner: `?ids=` styrer utvalg.
- AK-domene vист: multi-radar, SG-sammenligning (i komponent).
- Designfil-referanse: v10 `TalentSammenligning` (komponent).
- Nåværende designkvalitet: tynt skall — kvalitet i `TalentSammenligning`. Lenket fra `admin-nav.ts`.
- Redesign-prioritet: P3 (verifiser komponent separat)

### /admin/talent/wagr-benchmark
- Fil: `src/app/admin/talent/wagr-benchmark/page.tsx` (`./wagr-delete-button`)
- Flate: AgencyOS — AdminHero-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): WAGR-referansespillere (topp 5 globalt + topp 5 norske) som NGF-kategori-kalibrering.
- Data vist (felt → kilde): `wagrSnapshot` (rank/move/ptsAvg/ngfCategory/country); NGF-kategori-skala A–I hardkodet (KATEGORI_INFO).
- Komponenter: `AdminHero`, `EmptyState`; lokale `Section`/`PlayerTable`/`Th`/`Td`; `WagrDeleteButton`.
- Layout og hierarki: PageHeader + importer-CTA; NGF-kategori-grid (5-kol); 2 seksjoner (global/norsk) m/ tabeller; footnote.
- Tilstander: EmptyState per seksjon (kjør seed-script) finnes; loading/error MANGLER.
- Interaksjoner: ekstern wagr.com-lenke; slett-knapp; importer → `/wagr-import`.
- AK-domene vist: NGF-kategori (A–I, knyttet til Pts Avg / Øyvind Rojahn-skala), WAGR-rank.
- Designfil-referanse: ingen handover-prototype.
- Nåværende designkvalitet: ferdig funksjonelt; hardkodet snapshot-dato (12. mai 2026) i footnote. Orphan: ikke i `admin-nav.ts` (nås via wagr-import/radar).
- Redesign-prioritet: P2

### /admin/talent/wagr-import
- Fil: `src/app/admin/talent/wagr-import/page.tsx` (`./wagr-actions`)
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): WAGR-import — synk-status + matchede spillere-tabell.
- Data vist (felt → kilde): `wagrSnapshot` (rank/snapshotAt/user-kobling); antall PLAYER → `user.count`; «sist synket» = nyeste snapshotAt.
- Komponenter: `@/components/admin/agencyos/ui` (AgChip/AgPage/AgPageHead/AgPlayerCell/AgTable/AgTd/AgTh); `SynkNaaButton`.
- Layout og hierarki: PageHead «Synk mot verdensrankingen»; status-kort (N av M m/ WAGR + sist synket + Synk-nå); matchede-tabell (Spiller/WAGR/Match).
- Tilstander: empty (ingen koblet) finnes; «Synk nå» uten backend-handler (dokumentert avvik); loading/error MANGLER.
- Interaksjoner: rad → `/admin/spillere/[id]`; SynkNaaButton (no-op i v1).
- AK-domene vist: WAGR-rank, match-konfidens («Sikker match» hardkodet — felt mangler).
- Designfil-referanse: `agencyos-app/screens-stable.jsx` (WagrScreen).
- Nåværende designkvalitet: ferdig — token-disiplinert; «Synk nå» og «Sikker match» er bevisste plassholdere (dokumentert). Lenket fra `admin-nav.ts`.
- Redesign-prioritet: P2

---

### /admin/tester
- Fil: `src/app/admin/tester/page.tsx`
- Flate: AgencyOS (mørk, hybrid terminal)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Tester-oversikt — 4 KPI + testresultat-tabell (delta/status) m/ mobil kortliste.
- Data vist (felt → kilde): pågående → `testSession` IN_PROGRESS; resultater → `testResult` (score/takenAt); KPI (utført 30d / snitt-score / sist uke / pågår) → `testResult.count`; delta vs forrige resultat samme spiller+test (heuristikk).
- Komponenter: `@/components/admin/agencyos/ui` (AgChip/AgPlayerCell/AgTable/AgSeg...); `TestUkeTrigger`; lokal `StatusChip`.
- Layout og hierarki: PageHead «Tester · FYS & teknikk» + Registrer-test-CTA; KPI-strip; tabell m/ segment-filter (Alle/FYS/Teknikk/TrackMan — visuell, ikke-funksjonell?); mobil kortliste.
- Tilstander: empty (ingen tester) finnes; «—» resultat for pågående; loading/error MANGLER.
- Interaksjoner: rad → `/admin/spillere/[id]`; Registrer → `/admin/tester/tildel`; AgSeg-filter (UVERIFISERT funksjonell).
- AK-domene vist: testresultater + delta + status (Bedre/Stabilt/Svakere/Pågår). **FYS-PLASSHOLDER-REGEL**: ingen normverdi-fargekoding (alle nøytrale) til formel låst.
- Designfil-referanse: `AgencyOS Tester (hybrid).dc.html`.
- Nåværende designkvalitet: ferdig — respekterer FYS-plassholder-regelen. AgSeg-filter ser statisk ut (active="Alle" hardkodet, ingen href/onClick i fil) — mulig pseudo-kontroll.
- Redesign-prioritet: P2

### /admin/tester/[id]
- Fil: `src/app/admin/tester/[id]/page.tsx` (`./test-detail-client`, `./tester-detail-actions`)
- Flate: AgencyOS — DetailShell-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Test-resultat-detalj — trend-graf + benchmark/nivå for ett TestResult.
- Data vist (felt → kilde): `testResult` + test + user; historikk samme test+spiller (24); KPI siste/snitt/PR/referanse; benchmark → `parseBenchmarks(test.protocol)` + `achievedLevel`/`ladderText`.
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`; `TestDetailClient` (graf), `TesterDetailActions`; `@/lib/admin/test-benchmarks`.
- Layout og hierarki: DetailShell (breadcrumb + kategori-pill + KPI-rad); klient trend-graf + benchmark.
- Tilstander: `notFound()`; tester uten benchmark (FYS) → ingen nivå-verdikt (KPI «Målinger» istedenfor); loading/error MANGLER.
- Interaksjoner: i TestDetailClient (punkt-valg); actions-knapp.
- AK-domene vist: PEI/benchmark-nivåstige (PGA-topp-40-kalibrert), PR, kategori (FYS/TEK/SLAG/SPILL/TURN). FYS uten formel = ingen verdikt.
- Designfil-referanse: `public/design/batch4/test-detalj-cmj.html` (batch4, IKKE handover-mappa — mulig kilde-regel-brudd).
- Nåværende designkvalitet: ferdig funksjonelt; DetailShell-idiom (lysere enn hybrid-Tester-oversikten det lenkes fra → shell-skifte ved navigasjon).
- Redesign-prioritet: P1 (shell-mismatch oversikt→detalj)

### /admin/tester/benchmarks
- Fil: `src/app/admin/tester/benchmarks/page.tsx` (`./actions`)
- Flate: AgencyOS (mørk, smal `max-w-[960px]`)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): DataGolf-fasiter — nivåstiger + synk-modus + ventende justeringer (drift > 3 %) for godkjenning.
- Data vist (felt → kilde): `testDefinition.protocol` → `readSyncState` (benchmarks/sync/pending); synk-modus → `syncModeFor` (AUTO/FØLGER/REFERANSE); pending → drift-forslag.
- Komponenter: ingen delt UI-bibliotek (rå tailwind); server actions `runBenchmarkSyncNow`/`approve`/`reject`.
- Layout og hierarki: tilbake + eyebrow + display-tittel + «Kjør synk nå»; forklaringstekst; ventende-godkjenning-kort (warning); fasit-tabell (Test/Synk/Kilde/levels) + footer.
- Tilstander: pending-kort betinget; tabell alltid; loading/error MANGLER.
- Interaksjoner: kjør synk / godkjenn / avvis (server actions); tilbake → `/admin/tester`.
- AK-domene vist: NGF-testbatteri-nivåstiger, DataGolf-kalibrering (PGA topp 40 → Scratch), drift-godkjenning.
- Designfil-referanse: ingen handover-prototype.
- Nåværende designkvalitet: ferdig funksjonelt; bruker rå tailwind uten Ag*-primitiver (egen ad-hoc styling) — konsistent token-bruk men ikke delt komponentbibliotek.
- Redesign-prioritet: P2

### /admin/tester/foreslatte
- Fil: `src/app/admin/tester/foreslatte/page.tsx` (`./test-kort`)
- Flate: AgencyOS — men `PlayerHero`-idiom (feil hero-familie)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Spiller-foreslåtte custom-tester som venter coach-godkjenning.
- Data vist (felt → kilde): `testDefinition` (isCustom, visibility COACH, isCoachApproved false) + `createdBy`.
- Komponenter: `@/components/portal/player-hero` (PlayerHero — PlayerHQ-komponent!); `ForeslattTestKort`.
- Layout og hierarki: tilbake-lenke; PageHeader (PlayerHero); enten tom-state-kort eller 2-kol kort-grid.
- Tilstander: empty («Ingen forslag i køen») finnes; loading/error MANGLER.
- Interaksjoner: godkjenn/avvis (i ForeslattTestKort); tilbake → `/admin/tester`.
- AK-domene vist: pyramide-område, scoringRule, protocol per foreslått test.
- Designfil-referanse: ingen handover-prototype.
- Nåværende designkvalitet: inkonsistent — bruker `PlayerHero` (PlayerHQ lyst-flate-komponent) i en AgencyOS-rute. Pb20-mobil-padding antyder mobil, men resten av AgencyOS-tester er desktop-først.
- Redesign-prioritet: P1 (lånt PlayerHQ-hero i AgencyOS)

### /admin/tester/tildel/[spillerId]
- Fil: `src/app/admin/tester/tildel/[spillerId]/page.tsx` (`./tildel-modal`)
- Flate: AgencyOS modal
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Route-basert tildel-test-modal for valgt spiller.
- Data vist (felt → kilde): spiller → `user`; tester → `testDefinition`; pyrCounts aggregert.
- Komponenter: lokal `TildelModal`.
- Layout og hierarki: delegert til modal.
- Tilstander: `notFound()` ved manglende spiller.
- Interaksjoner: i TildelModal.
- AK-domene vist: pyramide-counts per testbatteri.
- Designfil-referanse: Claude Design bundle `_SEBg4QyodvbW2k06JWiGw` (`test-modul/tildel-test-modal.html`, IKKE handover — kilde-regel-brudd i header).
- Nåværende designkvalitet: tynt skall. Duplikat-mønster med `/admin/spillere/[id]/tildel-test` (to tildel-modaler — `TildelModal` vs `TildelTestModalScreen`). Konsoliderings-kandidat.
- Redesign-prioritet: P2 (dupliserer tildel-test-flate)

---

### /admin/grupper
- Fil: `src/app/admin/grupper/page.tsx` (`./grupper-actions`)
- Flate: AgencyOS (mørk)
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Gruppe-oversikt — 2-kol grid av gruppe-tiles m/ medlemstall, HCP-snitt, aktivitetsbar.
- Data vist (felt → kilde): grupper → `group` (name/level/_count); HCP-snitt → `members.user.hcp`; aktivitetsbar = andel m/ innlogging siste 14d → `lastLoginAt`; nivå-label → `level` (S*→Skole, A*→Selektert).
- Komponenter: `@/components/admin/agencyos/ui` (AgChip/AgPage/AgPageHead/agBtnClass); `NyGruppeButton`.
- Layout og hierarki: PageHead «N grupper» + Ny gruppe; 2-kol tiles (ikon + nivå-chip + navn + medlem/HCP + aktivitetsbar).
- Tilstander: empty (ingen grupper) finnes; HCP-snitt skjules uten data; loading/error MANGLER.
- Interaksjoner: tile → `/admin/grupper/[id]`; Ny gruppe (modal).
- AK-domene vist: gruppe-nivå (A1–A5 selektert / S* skole), HCP-snitt.
- Designfil-referanse: `agencyos-app/screens-stable.jsx` (GroupsScreen).
- Nåværende designkvalitet: ferdig — token-disiplinert, ekte data m/ ærlige plassholdere.
- Redesign-prioritet: P2

### /admin/grupper/[id]
- Fil: `src/app/admin/grupper/[id]/page.tsx` (`./gruppe-actions`)
- Flate: AgencyOS — DetailShell-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Gruppe-detalj — hero + KPI + neste samling + medlems-grid m/ statistikk + quick-stats.
- Data vist (felt → kilde): gruppe + coach + members(user) + schedules → `group`; runder/plan per medlem → `round.groupBy` + `trainingPlan.isActive` (90d); kandidater → `user` ikke-medlem; PRO-andel → `user.tier`.
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`, `EmptyState`, `avatar-colors`; lokale action-knapper (StartOkt/LeggTilSpiller/FjernMedlem/SeAlleTimePlan/Detaljer/Aapne).
- Layout og hierarki: DetailShell (breadcrumb + nivå-pill + 4 KPI); neste-samling-kort; medlems-grid (mini-stats HCP/Runder/Plan%); 3-kort quick-stats.
- Tilstander: `notFound()`; empty (ingen samlinger/medlemmer) finnes; «—» for oppmøte (ikke i schema); loading/error MANGLER.
- Interaksjoner: planlegg samling → `/admin/bookinger/ny?groupId=`; medlem → spillerprofil; fjern/legg-til (actions); analyse-lenke → `/admin/analyse`.
- AK-domene vist: HCP-snitt, plan-etterlevelse % per medlem, PRO-andel.
- Designfil-referanse: ingen handover-prototype (PR9 9.2).
- Nåværende designkvalitet: ferdig funksjonelt; DetailShell-idiom (lysere) — shell-skifte fra mørke grupper-oversikten. «Oppmøte siste 30 d» hardkodet «—» (ærlig plassholder).
- Redesign-prioritet: P2

### /admin/grupper/[id]/timeplan
- Fil: `src/app/admin/grupper/[id]/timeplan/page.tsx`
- Flate: AgencyOS — DetailShell-idiom
- Rolle/gating: COACH, ADMIN
- Jobb (1 setning): Gruppe-timeplan — alle GroupSchedule-rader (faste/kommende/tidligere) m/ `?focus=`-highlight.
- Data vist (felt → kilde): `group.schedules` (title/start/end/location/recurring); varighet avledet.
- Komponenter: `DetailShell`, `AthleticBadge`, `EmptyState`; lokal `TimeplanSeksjon`.
- Layout og hierarki: DetailShell (breadcrumb); 3 seksjoner (faste ukentlig / kommende / tidligere dempet) m/ rad-kort.
- Tilstander: `notFound()`; EmptyState (ingen tider) finnes; loading/error MANGLER.
- Interaksjoner: `?focus=<scheduleId>` highlight (mål for Detaljer/Åpne fra detalj); planlegg → `/admin/bookinger/ny`.
- AK-domene vist: ingen golf-spesifikk (ren timeplan).
- Designfil-referanse: ingen handover-prototype (PR9 9.2b).
- Nåværende designkvalitet: ferdig funksjonelt; DetailShell-konsistent med gruppe-detalj.
- Redesign-prioritet: P3
