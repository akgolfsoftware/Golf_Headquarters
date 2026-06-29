# PlayerHQ /portal/mal — skjermkort (kode-verifisert 2026-06-29)

24 ruter under `/portal/mal` («Mål»-hub + kjerne analyse-/data-flatene: Runder, TrackMan, SG-Hub, Statistikk, Leaderboard, Milepæler). Dominerende mønster: server-component med ekte Prisma-queries, editorial lys header (Inter Tight italic-aksent) + tette data-/SG-kort, ærlige tom-tilstander (`null → "—"`, aldri fabrikkerte tall). PlayerHQ = LYST tema, mobil-først. Største gjeld: stort sprik i porteringsmodenhet — `runder/` og `sg-hub/` hovedsider er v10-portede via egne komponenter, mens flere SG-Hub-verktøy (yardage/conditions/strategy/equipment/best-vs-now/[club]) og coach-proxy-rutene er lokalt strikkede flater uten design-fasit, samt to ruter (`shot-by-shot`, runde-`[id]`) med hardkodet hex i charts og inline farge-style (token-disiplin-brudd).

Nav: kun `/portal/mal` (Mål), `/portal/mal/sg-hub` (Strokes gained), `/portal/mal/runder` (Runder), `/portal/mal/trackman` (TrackMan) ligger i `src/components/portal/sidebar.tsx`. `statistikk`, `milepaeler`, `leaderboard`, `bygger`, alle SG-Hub-undertools og coach-proxy nås kun via in-page-lenker → delvis foreldreløse (se per kort).

---

### /portal/mal
- Fil: `src/app/portal/mal/page.tsx`
- Flate: PlayerHQ (lyst). Mobil-først, `max-w-[600px]`.
- Rolle/gating: `requirePortalUser()` — enhver innlogget portal-bruker (egne mål).
- Jobb (1 setning): Vis spillerens aktive mål med fremdrift + siste milepæl, og inngang til å sette nye mål.
- Data vist (felt → kilde): aktive mål (`prisma.goal.findMany` status=ACTIVE) → kort med type/tittel/pct/sub/status; siste milepæl (`prisma.achievement.findFirst`) → forest-banner; HCP (`user.hcp`) → driver HCP-mål-fremdrift (start 54 → mål).
- Komponenter: lokal `GoalCard`/`SisteMilepael`/`EmptyState`; `NyGoalModal` (`./ny-goal-modal`). Lucide `Plus`, `Shield`.
- Layout og hierarki: header (h1 «Mine *mål*» + antall) + `NyGoalModal`-CTA (topp-høyre) → forest siste-milepæl-banner → goal-card-liste (venstre-border farget per status) ELLER EmptyState (CTA «Sett første mål» → `/portal/mal/bygger`). Sub-nav i layout.
- Tilstander: empty (EmptyState) finnes; loading/error MANGLER (server-render, ingen Suspense/error.tsx observert her).
- Interaksjoner: goal-card → `/portal/mal/goal/{id}`; «Sett første mål» → `/portal/mal/bygger`; NyGoalModal → modal.
- AK-domene vist: mål-typer HCP_TARGET / ROUNDS_PER_MONTH / SG_AREA / FREE_TEXT; HCP-reise 54→mål; achievement-kinds (STREAK_n, FIRST_ROUND, SG_POSITIVE_30D, HCP_DOWN m.fl.).
- Designfil-referanse: kommentar peker til `public/design-handover/prosjektgjennomgang-2026-06-17/…/PlayerHQ Mål-hub (hybrid).dc.html`.
- Nåværende designkvalitet: halvferdig/inkonsistent — funksjonell hybrid, MEN omfattende inline `style={{ background: "var(--forest…)" }}` med hex-fallbacks og rå `var(--lime)`/`var(--forest)` i stedet for token-klasser (`bg-primary`/`bg-accent`). Bryter token-disiplin (hardkodet hex i fallbacks). Kun beregnbar fremdrift for HCP_TARGET; andre typer får pct=0.
- Redesign-prioritet: P1

---

### /portal/mal/bygger
- Fil: `src/app/portal/mal/bygger/page.tsx` (+ `bygger-client.tsx` 1357 linjer, `actions.ts`)
- Flate: PlayerHQ (lyst).
- Rolle/gating: via `hentByggerKontekst()` (server action) — antatt portal-bruker. `dynamic = "force-dynamic"`.
- Jobb (1 setning): Wizard for å bygge/sette et nytt mål med kontekst (HCP, runder osv.).
- Komponenter: `MalByggerWizard` (`./bygger-client`, stor klientkomponent — ikke fulllest).
- Tilstander: UVERIFISERT i detalj (wizard-intern).
- AK-domene vist: mål-typer (samme taksonomi som hub) — detaljer UVERIFISERT.
- Designfil-referanse: ingen prototype referert i page.tsx.
- Nåværende designkvalitet: UVERIFISERT (tung klientkomponent, 1357 linjer — egen dyp gjennomgang anbefalt).
- Redesign-prioritet: P2 (rik, men ikke i hovednav; sjekk separat)

---

### /portal/mal/goal/[id]
- Fil: `src/app/portal/mal/goal/[id]/page.tsx` (+ `goal-client.tsx`)
- Flate: PlayerHQ (lyst). Full-bleed `min-h-screen bg-background`, editorial header-bånd.
- Rolle/gating: `requirePortalUser()`; eier ELLER ADMIN/COACH ser. Ikke-eier/ikke-funnet → ærlig «Mål ikke funnet».
- Jobb (1 setning): Måldetalj med fremdrift, nivå-stige (A–G) og redigering for egne mål.
- Data vist (felt → kilde): `prisma.goal.findUnique`; runder siste 90 d (`prisma.round.findMany`, take 30) → history; `user.hcp` → currentValue ved HCP-mål; progressPct fra start→nå→target; ETA-uker fra `targetDate`; abandonReason fra `goal.payload`.
- Komponenter: lokal progress-/ladder-kort; `GoalDetailClient` (`./goal-client`, kun egne mål — rediger/avbryt). Lucide `ArrowLeft`, `Target`.
- Layout og hierarki: tilbakelenke «Mine mål» → eyebrow (typeLabel) → h1 (tittel m. italic etter «til») → frist/ETA → progress-kort (stort tabular-tall + bar + status-pill) → nivå-stige (kun HCP_TARGET) → abandon-årsak → `GoalDetailClient`-handlinger.
- Tilstander: not-found/no-access finnes; empty history håndtert; loading/error MANGLER.
- Interaksjoner: tilbake → `/portal/mal`; rediger/avbryt via GoalDetailClient (server actions).
- AK-domene vist: A–G nivå-bånd mappet fra HCP (A Scratch ≤0 … G 15–20 Aktiv) med «Du er her»/«Neste»; HCP-mål-fremdrift; SG_AREA/ROUNDS_PER_MONTH typeetiketter. NB: A–G-stigen er en HCP-approksimasjon, IKKE den låste FYS/A–K-formelen.
- Designfil-referanse: kommentar «prosjektgjennomgang hybrid design» (2026-06-17) — ingen direkte .dc.html-sti.
- Nåværende designkvalitet: halvferdig/inkonsistent — token-disiplin-brudd: inline `style` med `var(--accent)`, `var(--forest)`, `var(--lime)`, `color-mix(...var(--forest)...)` i stedet for klasser; progress-gradient hardkodet i style. Tittel-splitt på « til » er skjør tekstheuristikk.
- Redesign-prioritet: P1

---

### /portal/mal/runder
- Fil: `src/app/portal/mal/runder/page.tsx`
- Flate: PlayerHQ (lyst). `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()` — egne runder.
- Jobb (1 setning): Liste alle registrerte runder (nyeste først) med score, til-par, SG-total og beste-merke.
- Data vist (felt → kilde): `getRunderListModel(user.id)` (`@/lib/portal-runder/runder-list-data`) → rows {bane, dato, par, score, vsPar, sgTotal, isBest}; KPI-total; `user.name`/`user.hcp`.
- Komponenter: `RundeListeSide` + type `RunderData` (`@/components/portal/runder/runde-liste`) — v10-fasit. Page er kun data-mapper.
- Layout og hierarki: all chrome i `RundeListeSide`; eyebrow «PLAYERHQ · RUNDER», hero m. fornavn/HCP, runde-rader. CTA-href: ny → `/portal/mal/runder/ny`, importGolfBox → samme, detalj → `/portal/mal/runder/{id}`.
- Tilstander: empty bevart (runder=[] → komponentens tomtekst «Logg din første runde»); loading/error MANGLER på sidenivå.
- Interaksjoner: rad → runde-detalj; ny/import → `/portal/mal/runder/ny`.
- AK-domene vist: SG total per runde, vs-par, beste-runde-flagg.
- Designfil-referanse: v10-fasit «pl-runder» (via komponentkommentar) — `public/design-handover` antatt kilde.
- Nåværende designkvalitet: ferdig (v10-portert komponent, ren data-mapper). Tynt og rent.
- Redesign-prioritet: P3

---

### /portal/mal/runder/ny
- Fil: `src/app/portal/mal/runder/ny/page.tsx`
- Flate: PlayerHQ (lyst). Mobil `max-w-[460px]`, desktop `md:max-w-[860px]`.
- Rolle/gating: `requirePortalUser()`.
- Jobb (1 setning): Manuelt loggføre en runde (bane/dato/hull-grid med live til-par).
- Data vist (felt → kilde): `prisma.courseDefinition.findMany` {id, name, par} → bane-velger i formen.
- Komponenter: `AthleticEyebrow` (athletic); `RundeNyForm` (`@/components/portal/runde-ny/runde-ny-form`) — bærer all logikk (logRoundManual). Lucide `ArrowLeft`.
- Layout og hierarki: tilbakelenke → eyebrow «Analysere · Runder · Ny» → h1 «Loggfør *runde.*» → form (bane/dato, live accent-til-par-kort, hull-grid UT/INN, lagre).
- Tilstander: form-intern (validering/lagre) i `RundeNyForm` — UVERIFISERT her; loading/error på sidenivå MANGLER.
- Interaksjoner: tilbake → `/portal/mal/runder`; lagre → server action.
- AK-domene vist: par/score per hull, til-par.
- Designfil-referanse: kommentar «ph-screens.jsx · LogRoundScreen» (fersk Claude Design-fasit).
- Nåværende designkvalitet: ferdig (portert fra fasit, ren). Eyebrow sier «Analysere» selv om ruten ligger under «Mål» — liten IA-/tekst-inkonsistens.
- Redesign-prioritet: P3

---

### /portal/mal/runder/[id]
- Fil: `src/app/portal/mal/runder/[id]/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[460px]` mobil → `md:max-w-[860px]`.
- Rolle/gating: `requirePortalUser()`; eier ELLER ADMIN/COACH; ellers `notFound()`.
- Jobb (1 setning): Ren visning av én runde — score-headline, scorecard UT/INN og SG-nedbrytning.
- Data vist (felt → kilde): `prisma.round.findUnique` m. `course` + `shots` (sortert hull/slag); til-par fra score−par; SG total + `sgOtt/sgApp/sgArg/sgPutt` → 4 diverging SG-barer; scorecard fra Shot-aggregat (score per hull = antall slag).
- Komponenter: `AthleticEyebrow`; lokal `NiHull`/`SgRad`. Lucide `ArrowLeft`, `Pencil`.
- Layout og hierarki: tilbake «Alle runder» → eyebrow «{bane} · {dato}» → h1 «{score} {til-par}.» (em primary italic) → accent-kort (stor til-par + slag/par/18 hull + SG total) → scorecard UT 1–9/INN 10–18 (kun ekte Shot-data, ellers ærlig tomtekst + «Registrer slag-for-slag» for eier) → SG-seksjon (OTT/APP/ARG/PUTT, null→«—») → knapperad «Se SG-trend» (`/portal/analysere`) + «Del med coach» (`/portal/coach/melding`).
- Tilstander: not-found/no-access finnes; empty scorecard (ingen shots) finnes; SG null→«—» finnes; loading/error MANGLER.
- Interaksjoner: «Rediger slag»/«Registrer slag-for-slag» → `./slag` (kun eier); knapperad → analysere/coach-melding.
- AK-domene vist: SG OTT/APP/ARG/PUTT + total (diverging senter-null-bar, scale 0.7), birdie/par/bogey/dobbel-farger i scorecard.
- Designfil-referanse: kommentar «ph-screens.jsx · RoundDetailScreen» (fersk fasit).
- Nåværende designkvalitet: ferdig/solid — bevisst ren visning, ærlige tomtilstander, token-bruk via DS-klasser (god). SG-bar bruker `bg-muted`/`bg-primary`/`bg-destructive` — ok.
- Redesign-prioritet: P3

---

### /portal/mal/runder/[id]/slag
- Fil: `src/app/portal/mal/runder/[id]/slag/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[460px]`/`md:max-w-[860px]`. `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()`; KUN eier (`runde.userId !== user.id → notFound()`).
- Jobb (1 setning): Registrere slag-for-slag manuelt eller importere fra UpGame.
- Data vist (felt → kilde): `prisma.round.findUnique` m. course-navn + shots → serialiserte slag {hole, par, shotNumber, club, lie, distanceToPin, distanceHit, windDir, shotType, isPenalty, notes}.
- Komponenter: `AthleticEyebrow`; `SlagWizard` (`../slag-wizard`); `UpGameImportModal` (`../upgame-import-modal`). Lucide `ArrowLeft`.
- Layout og hierarki: tilbake til runden → eyebrow «{bane} · {dato}» → h1 «Slag-for-slag» + lead → `UpGameImportModal` (topp-høyre) → `SlagWizard`.
- Tilstander: not-found/eier-guard finnes; wizard-interne tilstander UVERIFISERT; loading/error sidenivå MANGLER.
- Interaksjoner: SlagWizard (server actions, assertRoundOwner); UpGame-import-modal.
- AK-domene vist: per-slag-felter (club, lie, distanse, vind, shotType, straff) — råmaterialet til SG/scorecard.
- Designfil-referanse: ingen .dc.html — re-etablert flate (review-funn B3, 2026-06-12) som verktøy-hjem for SlagWizard.
- Nåværende designkvalitet: halvferdig — funksjonell verktøyside, men design avhenger helt av wizard-komponenten (ikke fasit-portert). Ren header.
- Redesign-prioritet: P2

---

### /portal/mal/runder/[id]/shot-by-shot
- Fil: `src/app/portal/mal/runder/[id]/shot-by-shot/page.tsx`
- Flate: PlayerHQ (lyst), men DESKTOP-bred (`max-w-[1240px]`) — bryter mobil-først-mønsteret.
- Rolle/gating: `requirePortalUser()`; eier ELLER ADMIN/COACH; ellers `notFound()`.
- Jobb (1 setning): Full hull-for-hull-analyse av en runde med KPI, tabell, trend-charts og notat.
- Data vist (felt → kilde): `prisma.round.findUnique` m. course+shots; per-hull aggregert (par/score/FIR/GIR/putts) fra shots (FIR fra slag 2 lie=FAIRWAY; GIR fra slag-til-green ≤ par−2); KPI fairways/greens/putts; hull-fordeling birdie/par/bogey/doble; `prisma.round.count` (runder på samme bane); bane-meta (par/slope/rating).
- Komponenter: lokal `KpiCard`/`RowScore`/`RowYN`/`LineChart`/`BarChart`/`NoteCard`; `ShareRoundButton` (`./share-button`). Lucide (mange).
- Layout og hierarki: header (eyebrow «PlayerHQ · Runde · R_xxxx» + h1 bane-navn + dato/score) + ikon-knapperad (Rediger/Eksporter/Del/Mer) → KPI-strip (Score featured + Fairways/Greens/Putts) → bane-meta-kort → hull-tabell (front 9 / back 9 / total) → trend-charts (score per hull / akkumulert / putts) → notat → sammenlign-lenke.
- Tilstander: not-found/no-access finnes; tabell/charts skjules ved <2 hull / 0 spilte; notat betinget; loading/error MANGLER. «Rediger»/«Eksporter»/«Mer»-IconBtn er DØDE (ingen onClick/href).
- Interaksjoner: ShareRoundButton (delefunksjon); sammenlign → `/portal/mal/runder?bane={courseId}`; 3 av 4 ikon-knapper inert.
- AK-domene vist: FIR/GIR/putts, hull-fordeling, score vs par per hull.
- Designfil-referanse: ingen prototype — lokalt bygget desktop-analyseflate.
- Nåværende designkvalitet: inkonsistent/token-brudd — hardkodet `stroke="#005840"` i `LineChart`, og `hsl(var(--border))`/`hsl(var(--primary))`/`hsl(var(--destructive))`-wrapping i SVG (HSL-wrapper-konvensjon avviker fra DS shadcn-trippel-bruk; verifiser at det rendrer riktig). Desktop-bredde i ellers mobil-først produkt. Tre inerte ikon-knapper. Foreldreløs (kun nås via direkte URL — runde-`[id]` lenker ikke hit).
- Redesign-prioritet: P1

---

### /portal/mal/trackman
- Fil: `src/app/portal/mal/trackman/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[460px]` mobil → `md:max-w-[720px]`. I sidebar.
- Rolle/gating: `requirePortalUser()` — egne økter.
- Jobb (1 setning): Liste alle importerte TrackMan-økter (nyeste først) + trend per kølle + import-inngang.
- Data vist (felt → kilde): `prisma.trackManSession.findMany` {recordedAt, source, shotCount, environment, rawJson}; `prisma.signal.findMany` kind=CLUB_AVG → trend; ENV_LABEL/SOURCE_LABEL-mapping.
- Komponenter: `EmptyState`, `TrackmanImportModal` (shared); `CsvImportModal`/`HtmlImportModal` (lokale); `TrackManTrendSeksjon` + `byggTrendData` (`./trend-seksjon`). Lucide `Activity`, `ArrowRight`, `ChevronRight`.
- Layout og hierarki: eyebrow «TrackMan · sesjonsanalyse» → h1 «*Range-analyse* per kølle» → import-knapper (3) → trend-seksjon (kun ≥2 økter) → økt-liste (dato-badge + slag/kilde/miljø) → «Be om coach-vurdering» (`/portal/coach/melding?type=trackman-vurdering`).
- Tilstander: empty (egen full empty-blokk med eksport-instruks for CSV/HTML) finnes; trend skjult <2 økter; loading/error MANGLER.
- Interaksjoner: rad → `/portal/mal/trackman/{id}`; import-modaler; coach-vurdering-lenke.
- AK-domene vist: TrackMan-miljø (SIMULATOR_INDOOR/RANGE_OUTDOOR_GRASS osv.), shotCount, per-kølle-trend (CLUB_AVG).
- Designfil-referanse: ingen .dc.html referert — lokalt bygget liste.
- Nåværende designkvalitet: ferdig/solid — token-bruk via DS-klasser, ærlig empty med eksport-veiledning. Konsistent.
- Redesign-prioritet: P2

---

### /portal/mal/trackman/[id]
- Fil: `src/app/portal/mal/trackman/[id]/page.tsx`
- Flate: PlayerHQ (lyst), DESKTOP-bred (`max-w-[1240px]`).
- Rolle/gating: `requirePortalUser()`; eier ELLER ADMIN/COACH; gated bak `FEATURES.TRACKMAN_DETAIL` (env-flag) → `notFound()` hvis av.
- Jobb (1 setning): TrackMan-økt-detalj — dispersjon, per-kølle snittdistanse, stabilitet.
- Data vist (felt → kilde): `prisma.trackManSession.findUnique`; `prisma.signal.findMany` CLUB_AVG filtrert på `payload.sessionId` → per-kølle snittdistanse (m) + antall slag; `rawJson` → dispersjons-plot + stabilitet (`beregnStabilitet`).
- Komponenter: `PlayerHero as PageHeader`; `EmptyState`; `DispersionPlot` (`./dispersion-plot`); `StabilitetSeksjon`+`beregnStabilitet` (`./stability-seksjon`). Lucide `ArrowLeft`, `Wrench`.
- Layout og hierarki: tilbake «Alle TrackMan-økter» → PageHeader (eyebrow «PlayerHQ · TrackMan · {source}», «Økt *{dato}*», sub slag-antall) → dispersjon-kort → per-kølle-kort (liste m. snittdistanse, ELLER EmptyState «Beregner per kølle») → stabilitet-seksjon (kun hvis shots-data).
- Tilstander: not-found/feature-gate finnes; per-kølle empty (agent ikke kjørt) finnes; stabilitet betinget; loading/error MANGLER.
- Interaksjoner: tilbake til TrackMan-liste.
- AK-domene vist: per-kølle snittdistanse, dispersjon, stabilitet, TrackMan-source.
- Designfil-referanse: ingen prototype — «migrert til produksjonsdesign med PageHeader».
- Nåværende designkvalitet: ferdig (DS-tokens, EmptyState-mønster). Desktop-bredde igjen avvik fra mobil-først. Bak feature-flag → kan være usynlig i prod.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub
- Fil: `src/app/portal/mal/sg-hub/page.tsx`
- Flate: PlayerHQ (lyst). I sidebar («Strokes gained»). Mobil-først via komponent.
- Rolle/gating: `requirePortalUser()` — egne data.
- Jobb (1 setning): Sentral SG-flate — total + per disiplin (OTT/APP/ARG/PUTT) vs PGA Tour, innsikter, per-kølle-inngang og verktøy-katalog.
- Data vist (felt → kilde): `aggregateSg(runder siste 90 d)` → total + per disiplin + snittScore; `prisma.trackManSession` (antall + siste + `extractClubs` → kølle-sett); `prisma.sgInsight` (aktive uløste; topp-3 narrative); scatter via `computeScatterData(trainingLogs, runder)`; svakeste neg. SG-kategori → matchende driller (`getDrillLibrary`).
- Komponenter: `SgHub` (`@/components/portal/sg-hub/sg-hub`); `SgTrainingScatter` (`@/components/sg-hub/SgTrainingScatter`); `InsightNarrativeCard` (`@/components/portal/insight/…`). Lucide-ikoner i verktøy-katalogen.
- Layout og hierarki: alt rendres av `SgHub` (eyebrow «PLAYERHQ · /PORTAL/MAL/SG-HUB» → SG total-kort + KPI-rad (økter/innsikter/snitt-score/benchmark) → CTA «Hvordan bygges SG-pipelinen?» → disiplin-rad (4 SG-områder, hver lenker til `/portal/statistikk/sg-*`) → topp-3-prioriteringer → siste TrackMan-økt → per-kølle-tom → verktøy-grid (6 kort med fase-badge) → gap-til-drill) + scatter + narrative innsikter under.
- Tilstander: rik tom-tilstandshåndtering (0 runder / <3 runder / 0 økter / 0 køller → veiledende tekst, aldri liksom-tall); innsikter-seksjon skjult ved 0; loading/error sidenivå MANGLER.
- Interaksjoner: disiplin-kort → `/portal/statistikk/sg-{tee|approach|around-green|putting}`; verktøy → benchmark/yardage/conditions/strategy/best-vs-now/equipment; gap-drills → drill-detalj; CTA «Logg runde» → `/portal/mal/runder`.
- AK-domene vist: SG OTT/APP/ARG/PUTT + total (Tour-relativt), per-kølle-sett, narrative insight-kategorier (DISTANCE_GAPPING, CONSISTENCY_LEAK, D_PLANE_DRIFT, STRIKE_QUALITY, FATIGUE_PATTERN, EQUIPMENT_FIT, TEMPO_VARIANCE, PROGRESSION_TREND m.fl.), benchmark «PGA Tour kategori A1», drill-akser (slag/spill/tek).
- Designfil-referanse: v10-fasit «pl-sghub» (komponentkommentar).
- Nåværende designkvalitet: ferdig/rik — v10-portert hovedkomponent, grundig data-mapping og ærlige tomtilstander. Mest modne SG-flaten. Merk: 6 verktøy bærer «FASE 3/4/5»-badge — flere undertools er fortsatt arbeidsflater (se under).
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/[club]
- Fil: `src/app/portal/mal/sg-hub/[club]/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`; `lesPreferences(user)` → sgHubMode (basic/advanced); coach/admin → `canEdit` på annotasjoner. Egne data.
- Jobb (1 setning): Per-kølle TrackMan-analyse — D-Plane, strike-heatmap, smash-kurve, tempo, fatigue, og (advanced) slag-tabell med coach-annotasjoner.
- Data vist (felt → kilde): alle `trackManSession` → `extractShots(rawJson, club)`; `computeDPlane`/`computeStrikePattern`/`computeSmashCurve`/`computeFatigueCurve`; siste økts shots; (advanced) `prisma.shotAnnotation` + coach-navn fra `prisma.user`.
- Komponenter: `DPlanePlot`/`StrikeHeatmap`/`SmashCurvePlot`/`FatigueChart`/`TempoRibbon`/`ShotAnnotationPopover` (alle `@/components/sg-hub/…`); lokal `SummaryCard`. Lucide `Target`/`Crosshair`/`Zap`/`Activity`/`ArrowLeft`.
- Layout og hierarki: tilbake «SG-hub» → eyebrow «Per-kølle analyse» + h1 (kølle italic) + slag/økt-antall → 3 summary-kort (D-Plane / Sweet Spot / Optimum Speed) → seksjoner D-Plane / Strike Heatmap / Smash Curve / Tempo / Fatigue → (advanced) slag-tabell m. Face/Path/Smash/Speed/Ball/Dist + annotasjons-popover + utvidbar «alle slag».
- Tilstander: empty (0 slag for kølle → CTA «Importer TrackMan-data») finnes; advanced-only seksjoner betinget; loading/error MANGLER.
- Interaksjoner: tilbake til hub; shot-annotasjon (coach kan redigere); details-toggle for alle slag.
- AK-domene vist: D-Plane-klasser, smash factor / sweet spot %, club/ball speed, face/path-vinkler, fatigue-drop, tempo — dyp TrackMan-domene.
- Designfil-referanse: ingen prototype — lokalt bygget per-kølle-analyse.
- Nåværende designkvalitet: halvferdig/inkonsistent — funksjonsrik, men `rounded-2xl`/`rounded-xl` blandet, basic vs advanced gir to ulike informasjonstettheter. DS-klasser brukt (bra). Foreldreløs fra nav (nås via hub per-kølle-lenker).
- Redesign-prioritet: P1

---

### /portal/mal/sg-hub/benchmark
- Fil: `src/app/portal/mal/sg-hub/benchmark/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`. `dynamic = "force-dynamic"`.
- Rolle/gating: `requirePortalUser()`. Lenket fra hub-verktøy «Benchmark vs Tour» (badge LIVE).
- Jobb (1 setning): Vis spillerens snitt-SG per område mot PGA Tour-baseline (midtlinje = 0/Tour-snitt).
- Data vist (felt → kilde): `aggregateSg(prisma.round siste 20)` → OTT/APP/ARG/PUTT; dual progress-bar (spiller vs 50%-benchmark-referanse).
- Komponenter: kun lokalt (ingen importerte chart-komponenter). Lucide `ArrowLeft`.
- Layout og hierarki: tilbake «SG-Hub» → h1 «Benchmark *sammenligning*» + eyebrow «Team Norway · PGA TOUR benchmark» → kort med 4 SG-barer (label + delta + dual bar) ELLER tom-tilstand.
- Tilstander: empty (0 SG-runder) finnes; loading/error MANGLER.
- Interaksjoner: tilbake til hub.
- AK-domene vist: SG OTT/APP/ARG/PUTT vs PGA Tour; «Team Norway»-referanse (i tekst).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig/inkonsistent — token-brudd: inline `style={{ backgroundColor: "var(--primary)" }}`/`var(--accent)`/`color: var(--primary)`. «Team Norway» nevnt i header/kort-tittel men dataene er kun spillerens egne vs Tour — potensielt misvisende label. Enkel bar-visualisering.
- Redesign-prioritet: P1

---

### /portal/mal/sg-hub/best-vs-now
- Fil: `src/app/portal/mal/sg-hub/best-vs-now/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`. Hub-verktøy «Best vs Today» (badge FASE 4).
- Jobb (1 setning): Sammenligne en valgt TrackMan-økt mot pinnet «best ever»-økt, metrikk for metrikk.
- Data vist (felt → kilde): `prisma.bestSessionReference` (pinnet økt); `prisma.trackManSession` (siste 30, valgbar via `?session=`); `summarizeSession`/`diffSessions` (`@/lib/sg-hub/session-diff`) → metrikker + delta + forbedret-teller.
- Komponenter: `SessionPinControl` (`@/components/sg-hub/SessionPinControl`); lokal `SessionColumn`/`MetricRow`/`DeltaPill`/`SessionPicker`. Lucide `Star`/`Pin`/`ArrowRight`/`ArrowDown`/`Minus`/`ArrowLeft`.
- Layout og hierarki: tilbake «SG Hub» → h1 «Beste form *vs nå*» → PersonalBest-banner (når pinnet) → (empty / no-pin / Comparison 2-kolonne best vs nå med delta-piller) → session-picker (pills).
- Tilstander: empty (0 økter), no-pinned (CTA pin), comparison alle dekket; loading/error MANGLER.
- Interaksjoner: `SessionPinControl` (pin/unpin best); picker → `?session={id}`.
- AK-domene vist: TrackMan-sesjons-metrikker (via session-diff) + delta vs best.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig/solid — DS-tokens (`bg-accent`, `text-accent-foreground`, `border-primary/30`), tre ærlige tilstander, ren delta-pill-logikk. En av de bedre undertools.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/conditions
- Fil: `src/app/portal/mal/sg-hub/conditions/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`. Hub-verktøy «Værjustert distanse» (badge FASE 3).
- Jobb (1 setning): Slider-justering av temperatur/vind/høyde for å se hvordan stock-distanser endrer seg.
- Data vist (felt → kilde): `buildYardageRows(prisma.trackManSession siste 30)` (`@/lib/sg-hub/yardage-calc`) → rader til `ConditionsSlider`.
- Komponenter: `ConditionsSlider` (`@/components/sg-hub/ConditionsSlider`, klient). Lucide `ArrowLeft`.
- Layout og hierarki: tilbake «SG-hub» → eyebrow «Fase 3 · distanse og strategi» → h1 «Værjustert *distanse*» + lead → `ConditionsSlider` ELLER tom-tilstand.
- Tilstander: empty (0 TrackMan-data) finnes; loading/error MANGLER.
- Interaksjoner: tilbake; slidere (i klientkomponent).
- AK-domene vist: stock-distanse per kølle, vind/temp/høyde-justering (apex × tid-i-lufta-estimat).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — ren header + DS-tokens; faktisk visning ligger i `ConditionsSlider` (ikke vurdert her). «Fase 3»-eyebrow eksponerer intern roadmap i UI.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/strategy
- Fil: `src/app/portal/mal/sg-hub/strategy/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`. Hub-verktøy «Same-Distance strategi» (badge FASE 3).
- Jobb (1 setning): For en mål-distanse: rangere hvilken kølle som gir best Strokes Gained.
- Data vist (felt → kilde): `buildYardageRows(trackManSession siste 30)`; `prisma.sgBaseline` (category=APP) {distanceBucket, expectedStrokes} → `StrategyCards`.
- Komponenter: `StrategyCards` (`@/components/sg-hub/StrategyCards`). Lucide `ArrowLeft`.
- Layout og hierarki: tilbake → eyebrow «Fase 3 · distanse og strategi» → h1 «Same-Distance *strategi*» + lead → `StrategyCards` ELLER tom-tilstand.
- Tilstander: empty (0 TrackMan-data) finnes; loading/error MANGLER.
- Interaksjoner: tilbake; kort-interaksjon i `StrategyCards`.
- AK-domene vist: SG per kølle ved gitt distanse, apex/presisjon, PGA Tour-benchmark (SG APP-baseline-buckets).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — som conditions: ren wrapper, logikk i `StrategyCards`. «Fase 3»-eyebrow i UI.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/yardage
- Fil: `src/app/portal/mal/sg-hub/yardage/page.tsx`
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`. Hub-verktøy «Stock Yardage Chart» (badge FASE 3).
- Jobb (1 setning): Auto-generert yardage-kort (carry, 3/4, soft, apex, ±1σ per kølle) med PDF-eksport.
- Data vist (felt → kilde): `buildYardageRows(trackManSession siste 30)`; `user.name` → `StockYardageTable`.
- Komponenter: `StockYardageTable` (`@/components/sg-hub/StockYardageTable`). Lucide `ArrowLeft`.
- Layout og hierarki: tilbake → eyebrow «Fase 3 · distanse og strategi» → h1 «Stock *yardage*» + lead → `StockYardageTable` ELLER tom-tilstand.
- Tilstander: empty (0 TrackMan-data) finnes; loading/error MANGLER.
- Interaksjoner: tilbake; tabell + slider + PDF-nedlasting i komponenten.
- AK-domene vist: carry/3-4-swing/soft/apex/±1σ per kølle.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — ren wrapper; «Fase 3»-eyebrow i UI.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/equipment
- Fil: `src/app/portal/mal/sg-hub/equipment/page.tsx` (eksporterer `EquipmentView` — gjenbrukt av coach-proxy)
- Flate: PlayerHQ (lyst). `max-w-[760px]`.
- Rolle/gating: `requirePortalUser()`. Hub-verktøy «Equipment Fit» (badge FASE 5).
- Jobb (1 setning): Per-kølle helsesjekk av launch/spin/smash mot optimale target-vinduer.
- Data vist (felt → kilde): alle `trackManSession` → `extractClubs`/`extractShots`; `computeClubFit(clubId, shots, rawJson)` (`@/lib/sg-hub/equipment-fit`) → status ok/warn/critical/missing per metrikk; filtrerer bort putter.
- Komponenter: lokal `ClubFitCard`/`StatusBadge`/`LegendItem`. Lucide `AlertCircle`/`CheckCircle2`/`HelpCircle`/`XCircle`/`ArrowLeft`.
- Layout og hierarki: tilbake → eyebrow «Fase 5 · equipment fit» → h1 «Utstyr*-helsesjekk*» (+ spillernavn ved coach-proxy) + lead → legend-rad (4 statuser) → grid av kølle-fit-kort (status-badge + metrikker m. target-vindu + slag-antall) ELLER tom-tilstand.
- Tilstander: empty (0 TrackMan-data) finnes; «Data mangler»-status per metrikk; loading/error MANGLER.
- Interaksjoner: tilbake (backHref varierer for coach-proxy).
- AK-domene vist: launch/spin/smash-target-vinduer per kølletype (driver/jern/wedge/wood); fit-status.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig/solid — DS-tokens (`text-primary`/`text-warning`/`text-destructive`/`text-muted-foreground`), god status-semantikk, gjenbrukbar `EquipmentView`. «Fase 5»-eyebrow i UI.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/coach/[spillerId]
- Fil: `src/app/portal/mal/sg-hub/coach/[spillerId]/page.tsx`
- Flate: PlayerHQ-shell men COACH-modus (tydelig merket). Ikke mobil-først-tilpasset (grid uten max-w-wrapper).
- Rolle/gating: `requirePortalUser()` + `requireCoachForPlayer(user, spillerId)` — kun coach for den spilleren.
- Jobb (1 setning): Coach ser en spillers SG-Hub-oversikt (økter, køller, tier) med inngang til per-kølle/equipment.
- Data vist (felt → kilde): `prisma.trackManSession` (spillerens) → `extractClubs`; `player.name`/`player.tier`.
- Komponenter: lokal `StatCard`. Lucide `ArrowLeft`/`ArrowRight`/`Circle`/`Package`.
- Layout og hierarki: tilbake «til SG Hub» (`/portal/mal/sg-hub`) → coach-modus-banner («Du ser *{spiller}* sin SG Hub») → 3 stat-kort (økter/køller/tier) → per-kølle-grid (lenker til `coach/{id}/{club}`) → verktøy (Equipment Fit-kort → `coach/{id}/equipment`).
- Tilstander: empty (spiller uten TrackMan-data) finnes; loading/error MANGLER.
- Interaksjoner: kølle → coach per-kølle; equipment → coach-equipment.
- AK-domene vist: `player.tier` (PRO etc. — NB: ELITE er dødt enum per CLAUDE.md), kølle-sett, økt-antall.
- Designfil-referanse: ingen prototype — coach-speil.
- Nåværende designkvalitet: halvferdig/inkonsistent — `rounded-xl` (avviker fra spiller-sidens `rounded-2xl`), ingen mobil-bredde-styring, viser rå `player.tier`-streng. Funksjonell men ikke fasit-portert.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/coach/[spillerId]/[club]
- Fil: `src/app/portal/mal/sg-hub/coach/[spillerId]/[club]/page.tsx`
- Flate: PlayerHQ coach-modus. Ikke mobil-først-wrappet.
- Rolle/gating: `requirePortalUser()` + `requireCoachForPlayer`; `lesPreferences` → advanced.
- Jobb (1 setning): Coach-speil av per-kølle-analysen for en spiller (D-Plane/strike/smash + advanced slag-tabell).
- Data vist (felt → kilde): spillerens `trackManSession` → `extractShots(club)`; `computeDPlane`/`computeStrikePattern`/`computeSmashCurve`.
- Komponenter: `DPlanePlot`/`StrikeHeatmap`/`SmashCurvePlot` (sg-hub); lokal `SummaryCard`. (NB: mangler `FatigueChart`/`TempoRibbon`/`ShotAnnotationPopover` som spiller-versjonen har — speilet er ufullstendig.)
- Layout og hierarki: tilbake «til {spiller}» → coach-modus-pill → eyebrow «Per-kølle analyse» + h1 (kølle) + slag/økt → 3 summary-kort → D-Plane/Strike/Smash-seksjoner → (advanced) slag-tabell (annotasjoner «aktiveres når komponenten kobles inn» — ikke-funksjonelt ennå).
- Tilstander: empty (0 slag) finnes; loading/error MANGLER; advanced-annotasjoner er placeholder-tekst (ikke koblet).
- Interaksjoner: tilbake til coach-hub.
- AK-domene vist: D-Plane/smash/strike (delmengde av spiller-versjonen).
- Designfil-referanse: ingen prototype — coach-speil av `[club]`.
- Nåværende designkvalitet: halvferdig/inkonsistent — driftet fra spiller-versjonen (mangler fatigue/tempo/annotasjon), `rounded-xl` vs `rounded-2xl`, ingen mobil-bredde. Annotasjons-«kommer»-tekst i prod-UI.
- Redesign-prioritet: P2

---

### /portal/mal/sg-hub/coach/[spillerId]/equipment
- Fil: `src/app/portal/mal/sg-hub/coach/[spillerId]/equipment/page.tsx`
- Flate: PlayerHQ coach-modus (gjenbruker spiller-`EquipmentView`).
- Rolle/gating: `requirePortalUser()` + `requireCoachForPlayer`.
- Jobb (1 setning): Coach ser spillerens equipment-helsesjekk (samme visning som spiller, med spillernavn + coach-backHref).
- Data vist (felt → kilde): `EquipmentView({ userId: player.id, backHref, spillerNavn })` — all data fra equipment-siden.
- Komponenter: `EquipmentView` (importert fra `../../../equipment/page`).
- Layout og hierarki: identisk med equipment-siden, men h1 får «· {spiller}» og tilbake-lenke peker til coach-hub. (Stub/proxy — 22 linjer.)
- Tilstander: arver equipment-sidens (empty/missing); loading/error MANGLER.
- Interaksjoner: tilbake → coach-hub.
- AK-domene vist: samme som equipment (launch/spin/smash fit).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (ren gjenbruk — god DRY). Stub-proxy.
- Redesign-prioritet: P3

---

### /portal/mal/statistikk
- Fil: `src/app/portal/mal/statistikk/page.tsx`
- Flate: PlayerHQ (lyst), DESKTOP-bred (`max-w-[1240px]`). IKKE i hovednav (foreldreløs fra sidebar; nås via in-page-lenker fra milepæler m.fl.). NB: sidebar refererer `/portal/statistikk` (annen rute) — ikke denne.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb (1 setning): SG-utvikling over valgt periode — SG-kort med trend, score-trend-graf og runde-tabell.
- Data vist (felt → kilde): runder i periode + forrige periode (`prisma.round.findMany`, 30d/90d/år via `?periode=`); `aggregateSg` for begge → SG total/OTT/APP/ARG/PUTT + delta vs forrige; score-trend (SVG polyline); runde-tabell (desktop) / kort (mobil), `formatSg`.
- Komponenter: `PlayerHero as PageHeader`; `EmptyState`; lokal `SgKort`/`ScoreTrend`/`Th`/`Td`. Lucide `TrendingUp`/`TrendingDown`/`Minus`.
- Layout og hierarki: PageHeader («Slik utvikler *du deg*») → periode-velger (3 pills) → (EmptyState ELLER: SG-kort-rad (5) → runde-historikk-graf → alle-runder-tabell/kort + «se alle N runder»-lenke).
- Tilstander: empty (0 runder i periode) m. CTA finnes; loading/error MANGLER.
- Interaksjoner: periode-pills → `?periode=`; rad-lenker → `/portal/mal/runder`.
- AK-domene vist: SG total/OTT/APP/ARG/PUTT med periode-til-periode-delta; score-trend.
- Designfil-referanse: ingen prototype — PageHeader-migrert.
- Nåværende designkvalitet: ferdig/solid — DS-tokens, responsiv tabell→kort, ærlig empty. Desktop-bred. Mulig IA-forvirring: to «statistikk»-ruter (`/portal/statistikk` i nav vs denne `/portal/mal/statistikk`).
- Redesign-prioritet: P2

---

### /portal/mal/leaderboard
- Fil: `src/app/portal/mal/leaderboard/page.tsx`
- Flate: PlayerHQ (lyst), DESKTOP-bred (`max-w-[1240px]`). Bak `FEATURES.LEADERBOARD` (env-flag) → `notFound()` hvis av. Ikke i hovednav.
- Rolle/gating: `requirePortalUser()` + feature-gate.
- Jobb (1 setning): Rangere Pro-spillere etter snitt-SG (siste 30 d) med din-rang-banner og kategori-faner.
- Data vist (felt → kilde): `prisma.user` tier=PRO,role=PLAYER + runder siste 30 d med valgt SG-felt (`?sg=` → sgTotal/sgApp/sgArg/sgPutt); snitt-SG → rangering (topp 25); `avatarBg`-helper; HCP; medal (gull/sølv/bronse).
- Komponenter: lokal `Head`/`YourRank`/`Filters`/`Table`/`RowEl`/`MobileRow`/`Badge`/`Pagination`. Lucide (mange).
- Layout og hierarki: Head (eyebrow + h1 «#N av M i klubben» + tab-rad venner/klubb/globalt[lås]) → YourRank-banner (gradient, stor #rang + avatar + delta) → Filters (SG-kategori-pills + periode/søk) → tabell (desktop) / kort (mobil) → Pagination.
- Tilstander: empty (ingen rangering) finnes; loading/error MANGLER. MANGE placeholder-elementer: badges (streak/test/momentum) hardkodet TODO, ukentlig delta TODO, sesong/søk/pagination inerte (disabled), «Neste oppdatering søndag» statisk.
- Interaksjoner: tab/sg-pills → query-params; rad → `/portal/spiller/{id}`; søk/pagination/sesong INERTE.
- AK-domene vist: snitt-SG (total/APP/ARG/PUTT), HCP, tier PRO, medaljer. Kun brutto SG (ingen netto) — i tråd med golf-dataregel.
- Designfil-referanse: kommentar peker til `wireframe/design-files-v2/playerhq-A/03-mal-leaderboard.html` — FORBUDT kilde per design-porting-gate (`wireframe/`/`design-files-v2/` er arkiv). MÅ oppdateres til `public/design-handover/`.
- Nåværende designkvalitet: inkonsistent/halvferdig — visuelt rikt men full av inerte placeholder-kontroller og TODO-data (badges, delta, søk, pagination). Token-brudd: `YourRank`-gradient bruker `hsl(var(--foreground))`/`hsl(var(--card))` + rå `rgba(209,248,67,…)` (hardkodet lime). Forbudt design-kilde-referanse i toppkommentar.
- Redesign-prioritet: P1

---

### /portal/mal/milepaeler
- Fil: `src/app/portal/mal/milepaeler/page.tsx`
- Flate: PlayerHQ (lyst), DESKTOP-bred (`max-w-[1240px]`). Ikke i hovednav.
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`.
- Jobb (1 setning): Samle achievements, aktive/oppnådde mål og HCP/score-trend på én flate.
- Data vist (felt → kilde): `prisma.achievement.findMany`; `prisma.goal.findMany`; siste 50 runder → score-delta første→siste; `user.hcp`.
- Komponenter: `PlayerHero as PageHeader`; `EmptyState`; lokal `KpiKort`. Lucide `Trophy`/`Target`/`Calendar`/`CheckCircle2`.
- Layout og hierarki: PageHeader («Det du har *oppnådd*») → KPI-rad (HCP / registrerte runder + delta / achievements) → aktive mål-liste → oppnådde mål-liste (betinget) → achievements-grid (eller EmptyState) → «Se SG-statistikk»-lenke (`/portal/mal/statistikk`).
- Tilstander: empty for aktive mål + achievements finnes; loading/error MANGLER.
- Interaksjoner: bunn-lenke → statistikk.
- AK-domene vist: achievement-kinds (STREAK_n/FIRST_ROUND/FIRST_TEST/SG_POSITIVE_30D/HCP_DOWN/ROUND_BEST), mål-typer, HCP, score-delta.
- Designfil-referanse: ingen prototype — PageHeader-migrert.
- Nåværende designkvalitet: ferdig/solid — DS-tokens, konsistent kort/liste-mønster, ærlige tomtilstander. Desktop-bred. Overlapper delvis med `/portal/mal` (mål) og goal/[id] (milepæl-fane) — IA-redundans verdt å vurdere.
- Redesign-prioritet: P2
