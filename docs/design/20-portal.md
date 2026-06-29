# PlayerHQ (/portal) — skjermkort (kode-verifisert 2026-06-29)

153 ruter. Lyst tema, mobil-først. Delt opp i fire seksjoner under: mal (Mål-hub) · tren+live · meg · resten.


---

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

---

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

---

# PlayerHQ /portal/meg — skjermkort (kode-verifisert 2026-06-29)

33 ruter under `/portal/meg/*` (profil, abonnement, innstillinger, helse, hjelp, bookinger, dokumenter, utstyrsbag, sikkerhet, foresatte). Dominerende mønster: server component + `requirePortalUser`, port mot fersk Claude Design via det delte `MeSub/SetGroup/SetRow`-skallet (`src/components/portal/meg/meg-sub.tsx`). Største gjeld: **to konkurrerende chrome-idiomer** lever side om side — det moderne MeSub-skallet (eyebrow + display-tittel + lead, ingen tilbake-pil) vs. en eldre «ChevronLeft Tilbake + PlayerHero»-stil på mange innstillinger-undersider; og **duplisert sikkerhet** (`/meg/sikkerhet` vs `/meg/innstillinger/sikkerhet`, ulik score-logikk). Abonnement/ELITE-gating er ren og korrekt (se eget funn nederst).

---

### /portal/meg
- Fil: `src/app/portal/meg/page.tsx`
- Flate: PlayerHQ (lyst)
- Rolle/gating: `requirePortalUser` (implisitt via `getCurrentUser` + `hentProfil`)
- Jobb: «Meg»-hjem — profilhode + snarveier til alle undersider.
- Data vist: navn/initialer/avatar/hcp/hjemmeklubb → `hentProfil()`+User; `tier` → `user.tier ?? "GRATIS"`; streak → `trainingPlanSessionLog` siste 30 d via `computeStreak`/`aktivStreak`; antallRunder → `prisma.round.count`; preferences → `hentProfil`.
- Komponenter: `./meg-hybrid` (MegHybrid, lokal client); actions `./actions` (`hentProfil`/`oppdaterPreferences`/`logout`).
- Layout og hierarki: profilkort øverst, deretter navigasjons-/preferanse-seksjoner; primær handling = naviger videre; logout via action.
- Tilstander: loading/empty/error — `.catch(() => …)`-fallbacks for streak/runder (degraderer til 0); ingen eksplisitt loading/empty UI sett i page.
- Interaksjoner: undersider-lenker; toggle preferences (server action); logg ut.
- AK-domene vist: tier (GRATIS), streak, runde-antall.
- Designfil-referanse: «hybrid» nevnt i page-kommentar; konkret .dc.html UVERIFISERT.
- Nåværende designkvalitet: ferdig (hybrid, ekte data).
- Redesign-prioritet: P2

### /portal/meg/profil
- Fil: `src/app/portal/meg/profil/page.tsx`
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: rediger egen profil (det coachen + topplister ser).
- Data vist: name/email/phone/hcp/homeClub/avatarUrl → User; gruppe → `groupMember.group.name` (read-only); dominant hånd finnes IKKE i Prisma → tomt placeholder-felt (lagres ikke, per kommentar).
- Komponenter: `MeSub` (delt); `./profil-rediger-form` (client, avatar-opplasting via lib/storage/avatar); action `../actions` (`oppdaterProfil`).
- Layout og hierarki: MeSub-header (MEG · PROFIL / «Rediger profil.») → avatar 72px + «Bytt bilde» → skjema-grid (1 kol mobil / 2 kol md) → «Lagre endringer» + «Avbryt».
- Tilstander: success via action; loading/empty/error MANGLER eksplisitt i page (i form).
- Interaksjoner: lagre/avbryt; bytt bilde.
- AK-domene vist: hcp, gruppe.
- Designfil-referanse: ph-screens.jsx (ProfilScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/profil/rediger
- Fil: `src/app/portal/meg/profil/rediger/page.tsx`
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: alternativ/eldre profil-rediger-inngang (henter `tier` m.m. fra DB).
- Data vist: User-felter inkl. `tier: dbUser?.tier ?? "GRATIS"`.
- Merknad: **mulig duplikat** av `/profil` — to redigerings-ruter for samme datasett. Verifiser om begge er lenket fra nav (kandidat for konsolidering). 69 linjer.
- Tilstander: UVERIFISERT i detalj.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (sannsynlig overlapp med /profil).
- Redesign-prioritet: P2 (rydd duplikat)

---

## Abonnement (gating-fokus)

### /portal/meg/abonnement
- Fil: `src/app/portal/meg/abonnement/page.tsx` (398 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`; tilstands-gating på tier/credits/status (se nederst).
- Jobb: abonnement-hub — viser app-tilgangsstatus (gratis via pakke vs PRO 300 kr/mnd) + handlinger + fakturaer.
- Data vist: `getAbonnementData(user.id)` (`src/lib/portal-abonnement/abonnement-data.ts`) → `erPro` (fra `user.tier`), `status`, `nesteTrekk` (`subscription.currentPeriodEnd`), `monthlyCredits`/`creditsRemaining`, `fakturaer` (`payment` SUCCEEDED, take 12). Banners fra `searchParams` (ok/cancelled/avbestilt) + `PAST_DUE` fra DB.
- Komponenter: `MeSub/SetGroup/SetLinkRow/SetRow` (delt); `AthleticBadge`; lokale `ProUpgradeCard`/`ProStatusCard`/`GratisCard`/`PlanerListe`.
- Layout og hierarki: status-banners → ÉN hybrid-kort (velges av tilstand) → «Planer»-liste (Gratis 0 kr / Kun PlayerHQ 300 kr, «Nå»-pill) → HVA SOM INNGÅR → HANDLINGER (betinget) → FAKTURAER (≤5) → «Administrer pakke».
- Tilstander: success/cancelled/avbestilt-banners; `PAST_DUE` alert m/ «Endre kort»; empty (ingen fakturaer → seksjon skjules). Loading MANGLER eksplisitt.
- Interaksjoner: «Start PRO · 300 kr/mnd» → `/oppgrader/flyt`; «Endre kort» → `/kort/ny`; «Avbestill» → `/avbestill`; faktura-rad → `/faktura/[id]`.
- AK-domene vist: tier (GRATIS/PRO), credits/coaching-pakke (Performance/Performance Pro avledet av credits), abonnement-status.
- Designfil-referanse: «PlayerHQ Meg Abonnement (hybrid).dc.html» (nevnt i header-kommentar).
- Nåværende designkvalitet: ferdig — sterkt portet, korrekt gating, ærlige data.
- Redesign-prioritet: P3

### /portal/meg/abonnement/oppgrader
- Fil: `src/app/portal/meg/abonnement/oppgrader/page.tsx` (8 linjer)
- Stub: ren `redirect("/portal/meg/abonnement/oppgrader/flyt")` (historisk mailto-BETA-rute beholdt for eksterne lenker).
- Redesign-prioritet: P3 (ikke en skjerm)

### /portal/meg/abonnement/oppgrader/flyt
- Fil: `src/app/portal/meg/abonnement/oppgrader/flyt/page.tsx`
- Flate: PlayerHQ (mobil-først 430px)
- Rolle/gating: `requirePortalUser`; redirect til `/abonnement` hvis `erPro` ELLER `status === "PAST_DUE"` (unngår dobbel-abonnement i Stripe).
- Jobb: PRO-checkout-flyt (verdi → betaling → Stripe Checkout).
- Data vist: `getAbonnementData` (kun `erPro`/`status` for gating).
- Komponenter: `./oppgrader-flyt-wizard` (OppgraderFlytWizard, client).
- Layout og hierarki: wizard; CTA åpner Stripe Checkout.
- Tilstander: gating-redirect; resten i wizard.
- AK-domene vist: PRO 300 kr/mnd (ELITE eksplisitt utelukket i kommentar).
- Designfil-referanse: UVERIFISERT (kode-port, ikke .dc.html-navngitt).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/abonnement/avbestill
- Fil: `src/app/portal/meg/abonnement/avbestill/page.tsx` (174 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: «siste bekreftelse»-skjerm før avbestilling av PRO.
- Data vist: `subscription.currentPeriodEnd` → `proAktivTil`/`dagerIgjen`; konsekvenser er **statisk hardkodet liste** (`KONSEKVENSER`).
- Komponenter: `./avbestill-buttons` (client); lucide; ingen MeSub (egen sentrert hero-layout).
- Layout og hierarki: danger-ring-hero → «Pro aktiv til»-dato → «Dette mister du» (5 rader) → lime «pause i 1 mnd»-banner → avbestill-knapper → esc/tilbake-fotnote.
- Tilstander: ingen empty/error; antar aktivt abonnement (fallback +31 dager hvis ingen subscription).
- Interaksjoner: avbestill (action i buttons); «Pause →»-knapp er **ikke-funksjonell** (button uten handler); tilbake.
- AK-domene vist: AI-coach/credits/videoanalyse/historikk/familiekonto-konsekvenser (illustrativt).
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig visuelt, men inneholder **inline hex/rgba** (`rgba(163,45,45,…)`, `rgba(209,248,67,…)`) i style-props — bryter «ingen hardkodet hex»-regelen; «Pause» er død knapp.
- Redesign-prioritet: P1 (token-rydding + død knapp)

### /portal/meg/abonnement/kort/ny
- Fil: `src/app/portal/meg/abonnement/kort/ny/page.tsx` (137 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser` + redirect hvis ingen subscription eller status ∉ {ACTIVE, PAST_DUE, TRIALING}.
- Jobb: åpne Stripe Customer Billing Portal for kort-administrasjon (lagrer aldri kortdata).
- Data vist: `subscription.currentPeriodEnd`/`status`; «Neste belastning 300 kr» (pris hardkodet tekst), neste dato fra DB.
- Komponenter: `./aapne-stripe-portal` (client, POST `/api/stripe/portal`); lucide.
- Layout og hierarki: tilbake → header «Administrer kort» → Stripe-portal-knapp + «vi lagrer aldri kort» → neste belastning → sikkerhet (PCI-DSS/3DS).
- Tilstander: gating-redirect; loading/error i client-knapp.
- AK-domene vist: 300 kr/mnd PRO.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/abonnement/faktura/[id]
- Fil: `src/app/portal/meg/abonnement/faktura/[id]/page.tsx` (285 linjer)
- Flate: PlayerHQ (max-w-820px, utskriftsvennlig)
- Rolle/gating: `requirePortalUser`; henter kun brukerens egen `payment` (`findFirst userId`).
- Jobb: full faktura-detalj med MVA-splitt, status, last ned/send.
- Data vist: `payment` (amountOre/status/paidAt/createdAt/type/description/stripeChargeId/stripeInvoiceId); netto/mva utledet (80/20-split → 25 % MVA); forfall = +14 d.
- Komponenter: `PrintButton` (shared); `./faktura-actions` (`LastNedPdfKnapp`/`SendEpostKnapp`); lokale `MetaBlock`/`MetaMini`/`TotalRow`.
- Layout og hierarki: tilbake → faktura-hero + status-pill + handlinger → meta-grid → fakturalinje-tabell → totaler → betalingsinfo (kun hvis betalt) → footer m/ support-lenke.
- Tilstander: **empty/not-found** håndtert (FileX-kort); betalt/refundert/feilet/venter status-labels.
- AK-domene vist: ingen (rent finans).
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig — solid, ærlig not-found.
- Redesign-prioritet: P3

---

## Innstillinger

### /portal/meg/innstillinger
- Fil: `src/app/portal/meg/innstillinger/page.tsx` (179 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: innstillings-hub (varsler, integrasjoner, app, sikkerhet, AI, personvern).
- Data vist: `lesPreferences(user)`; integrasjons-chips fra ekte tellinger (`trackManSession.count`, `round.count`); språk fra prefs.
- Komponenter: `MeSub/SetGroup/SetLinkRow/SetRow/SetVal` (delt); `./varsler-toggles` (client); `Toggle`; `AthleticBadge`; `buttonClasses`.
- Layout og hierarki: VARSLER (toggles) → INTEGRASJONER (TrackMan/Garmin/Golfbox) → APP (Enheter/Språk/Mørk modus-låst-AV) → SIKKERHET (passord/BankID/enheter) → AI (→ ai-coach) → PERSONVERN (GDPR-inngang).
- Tilstander: chips «På/Av» fra ekte data; «Mørk modus» bevisst låst AV («Kommer senere») — PlayerHQ alltid lyst (låst beslutning); «Aktive enheter» = «—» (ærlig, ingen liksom-tall).
- Interaksjoner: toggles lagrer; rader lenker til undersider.
- AK-domene vist: integrasjonsstatus (TrackMan/Golfbox).
- Designfil-referanse: ph-screens.jsx (InnstillingerScreen 678–707) per kommentar. PERSONVERN-seksjon er bevisst tilføyelse (review-funn B1, GDPR).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/innstillinger/varsler
- Fil: `src/app/portal/meg/innstillinger/varsler/page.tsx` (51 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: detaljert varsel-styring + push-tillatelse.
- Data vist: `lesPreferences` av `user.preferences`.
- Komponenter: `../notif-toggles` (NotifToggles); `PushToggle` (shared client).
- Layout: **eldre chrome** — ChevronLeft «Tilbake til innstillinger» + PlayerHero-aktig header (mono eyebrow «PlayerHQ · Meg · Innstillinger · Varsler» + italic display-tittel), IKKE MeSub. Kort med rounded-lg (ikke 2xl).
- Tilstander: auto-lagring; ingen empty/error.
- AK-domene vist: ingen.
- Designfil-referanse: UVERIFISERT (eget idiom, ikke MeSub-port).
- Nåværende designkvalitet: inkonsistent — annet header-/kort-idiom enn MeSub-skjermene.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/sprak
- Fil: `src/app/portal/meg/innstillinger/sprak/page.tsx` (57 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: velg språk (no/en); region/format = «kommer Q3 2026».
- Data vist: `lesPreferences(...).spraak`.
- Komponenter: `./sprak-toggle` (SpraakToggle, client).
- Layout: samme eldre idiom (ChevronLeft + pill-eyebrow + italic display) som /varsler; stiplet «kommer senere»-kort.
- Tilstander: empty/«kommer» via stiplet kort.
- AK-domene vist: ingen.
- Nåværende designkvalitet: inkonsistent (samme avvik som /varsler).
- Redesign-prioritet: P2

### /portal/meg/innstillinger/sikkerhet
- Fil: `src/app/portal/meg/innstillinger/sikkerhet/page.tsx` (218 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: sikkerhetsoversikt — score, passord, 2FA, økter.
- Data vist: `user.email` → ærlig heuristisk score (80 m/ e-post, ellers 55); `lastLoginAt` (nevnt i kommentar).
- Komponenter: lokale; lucide. Ikke MeSub.
- Layout: ChevronLeft + display-header; score-stat; passord-/2FA-/enhets-rader (enhetsliste markert V2/«under utvikling»).
- Merknad: **dupliserer `/portal/meg/sikkerhet`** (egen score-logikk: her 80/55, der 65/40). To sikkerhetsskjermer for samme bruker — bør konsolideres.
- Tilstander: ærlig «under utvikling» i stedet for falske rader.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig men duplisert + avvikende score-tall.
- Redesign-prioritet: P1 (konsolider med /meg/sikkerhet)

### /portal/meg/innstillinger/integrasjoner
- Fil: `src/app/portal/meg/innstillinger/integrasjoner/page.tsx` (523 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: koble til/administrere eksterne datakilder (TrackMan, Garmin/Apple, Golfbox m.fl.).
- Data vist: ekte tilkoblings-status (tilkoblet vs tilgjengelig-seksjoner med tellinger).
- Komponenter: lokale `IntegrationCard`/`SectionHead`; svg-logoer inline.
- Layout: «Tilkoblet (N aktive / ingen enda)» → «Tilgjengelig». `IntegrationCard` har valgfri **PRO-badge** (accent-pill) — markerer PRO-eksklusive integrasjoner (app-nivå PRO, konsistent med 300 kr-modellen, ikke ELITE).
- Tilstander: tilkoblet/ledig; teller-drevet.
- AK-domene vist: PRO-gating på enkelte integrasjoner; TrackMan/Golfbox.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: ferdig (rikeste innstillings-skjerm).
- Redesign-prioritet: P3

### /portal/meg/innstillinger/ai-coach
- Fil: `src/app/portal/meg/innstillinger/ai-coach/page.tsx` (144 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: «kommer snart»-teaser for AI-coach V2.
- Data vist: ingen (statisk).
- Layout: ChevronLeft + info-badge «Kommer snart · V2» + display-header «AI…».
- Tilstander: ren «kommer»-tilstand.
- Merknad: bruker `var(--color-primary)` i inline style — sjekk om token-navnet finnes (de fleste skjermer bruker `hsl(var(--primary))`/`text-primary`). Mulig feil token-referanse.
- Nåværende designkvalitet: ferdig (teaser) men mulig token-navn-avvik.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/anlegg
- Fil: `src/app/portal/meg/innstillinger/anlegg/page.tsx` (62 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","PARENT","COACH","ADMIN"] })`
- Jobb: registrer tilgjengelig utstyr/anlegg → filtrerer drill-bibliotek + AI-plan.
- Data vist: `user.tilgjengeligeFasiliteter` (`DrillFasilitet[]`).
- Komponenter: `./fasilitet-profil-form` (client).
- Layout: breadcrumb (ChevronLeft Innstillinger / Mitt treningsanlegg) + mono-eyebrow + display-tittel + form. Eget idiom (ikke MeSub).
- Tilstander: tom liste = ingen valgte.
- AK-domene vist: drill-fasiliteter (kobling til drill/AI-plan).
- Nåværende designkvalitet: ferdig men inkonsistent chrome.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/okter
- Fil: `src/app/portal/meg/innstillinger/okter/page.tsx` (54 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: aktive sesjoner / apparater — **ren tom-tilstand**, «Apparat-oversikt kommer Q3 2026».
- Komponenter: `EmptyState` (shared); lucide. Eget idiom (ChevronLeft + display + mono-eyebrow).
- Tilstander: kun empty/«kommer».
- AK-domene vist: ingen.
- Nåværende designkvalitet: stub/«kommer» — ærlig.
- Redesign-prioritet: P2

### /portal/meg/innstillinger/personvern
- Fil: `src/app/portal/meg/innstillinger/personvern/page.tsx` (120 linjer)
- Flate: PlayerHQ (max-w-1240px — bredt admin-aktig)
- Rolle/gating: `requirePortalUser`
- Jobb: GDPR — dataeksport (art. 15) + kontosletting (art. 17).
- Data vist: ingen (handlings-skjerm).
- Komponenter: `PageHeader` (eldre shared header); `PersonvernActions` (client, kind="export"/delete); lucide.
- Layout: PageHeader → eksport-kort → destruktivt slett-kort.
- Tilstander: action-drevet.
- Merknad: `/innstillinger/eksport` redirecter hit. `PageHeader`-bruk + 1240px = enda et tredje header-idiom.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig men chrome-avvik (bred + PageHeader).
- Redesign-prioritet: P2

### /portal/meg/innstillinger/eksport
- Fil: `src/app/portal/meg/innstillinger/eksport/page.tsx` (8 linjer)
- Stub: `redirect("/portal/meg/innstillinger/personvern")`.
- Redesign-prioritet: P3 (ikke en skjerm)

---

## Sikkerhet (toppnivå — duplikat-kandidat)

### /portal/meg/sikkerhet
- Fil: `src/app/portal/meg/sikkerhet/page.tsx` (163 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: sikkerhetsoversikt — score, 2FA-lenke, økter/innloggings-historikk («kommer snart»).
- Data vist: `user.email` → score (her **65/40**, jf. innstillinger/sikkerhet sin 80/55 — avvik).
- Komponenter: lokale; lucide. Egen topbar (ChevronLeft «Profil»).
- Layout: topbar → score-stat → 2FA → økter/historikk.
- Merknad: **direkte duplikat** av `/portal/meg/innstillinger/sikkerhet`. To inngangsdører, ulik score-formel — én bør vinne.
- Tilstander: ærlig «kommer snart».
- Nåværende designkvalitet: ferdig men duplisert.
- Redesign-prioritet: P1 (konsolider)

### /portal/meg/sikkerhet/2fa
- Fil: `src/app/portal/meg/sikkerhet/2fa/page.tsx` (31 linjer)
- Flate: PlayerHQ (max-w-1240px)
- Rolle/gating: `requirePortalUser`
- Jobb: aktiver tofaktor (TOTP) — 3-stegs flyt.
- Komponenter: `PageHeader` (PlayerHero alias); `./twofa-client` (TwoFaClient).
- Layout: tilbake → PageHeader → wizard.
- Tilstander: i client.
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig (ekte TOTP); 1240px-bredde avviker fra 480px-sikkerhetsskjermene den lenkes fra.
- Redesign-prioritet: P2

---

## Helse

### /portal/meg/helse
- Fil: `src/app/portal/meg/helse/page.tsx` (174 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: helse & readiness — KPI-er + uke-status + skade + logg-inngang.
- Data vist: `healthEntry` siste 14 d (hvilepuls/søvn/vekt); `leave` (aktiv/tidligere skade, isInjury); `hentFysScore(user.id)` (`lib/fys-data`); søvn-snitt siste 7 d utledet.
- Komponenter: `MeSub/SetGroup/SetRow/SetVal` (delt); `KpiCard` (athletic); `AthleticBadge`; `./helse-form` (client).
- Layout: MeSub-header → 3-KPI-grid (FYS-score / Hvilepuls / Søvn) → DENNE UKA (Søvn/Belastning/HRV) → SKADE & STATUS → accent-disclaimer → logg-form.
- Tilstander: «—» når data/formel mangler (FYS, Belastning, HRV — ærlige plassholdere, aldri liksom-tall); «Ingen aktive skader/Frisk»-empty.
- AK-domene vist: **FYS-score** (stall-relativ testbatteri-form 0–100, Anders' formel 2026-06-22), antall FYS-tester.
- Designfil-referanse: ph-screens.jsx (HelseScreen 710–734) per kommentar.
- Nåværende designkvalitet: ferdig — eksemplarisk ærlig plassholder-disiplin.
- Redesign-prioritet: P3

### /portal/meg/helse/symptom/ny
- Fil: `src/app/portal/meg/helse/symptom/ny/page.tsx` (36 linjer)
- Flate: PlayerHQ (max-w-480px)
- Rolle/gating: `requirePortalUser`
- Jobb: 3-stegs symptom-wizard (kroppskart → intensitet/varighet → triggere/notat).
- Komponenter: `./wizard` (SymptomWizard, client, `logSymptom`); topbar ChevronLeft «Helse».
- Layout: topbar → wizard.
- Tilstander: i wizard.
- AK-domene vist: symptom/skade-logg.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

---

## Hjelp

### /portal/meg/help
- Fil: `src/app/portal/meg/help/page.tsx` (100 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: hjelp & support-hub — FAQ + kontaktkanaler + feedback-CTA.
- Data vist: statisk `FAQ` (4 par, inkl. korrekt «300 kr/mnd, ingen nivåer»-svar).
- Komponenter: `MeSub/SetGroup/SetRow` (delt); `./faq-accordion` (client).
- Layout: MeSub → OFTE STILTE SPØRSMÅL (accordion) → TA KONTAKT (chat/e-post/veiledninger) → full-bredde «Send forslag eller meld feil».
- Interaksjoner: → `/help/kontakt`, mailto, → `/help/kategori/komme-i-gang`, → `/feedback`.
- AK-domene vist: prismodell-svar i FAQ.
- Designfil-referanse: ph-screens.jsx (HjelpScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/help/kontakt
- Fil: `src/app/portal/meg/help/kontakt/page.tsx` (48 linjer)
- Flate: PlayerHQ (max-w-720px)
- Rolle/gating: `requirePortalUser`
- Jobb: kontakt support-skjema med svartid-indikator.
- Data vist: `user.name`/`user.email` forhåndsutfylt; `searchParams.ticket` → kvitterings-banner.
- Komponenter: `PageHeader` (PlayerHero alias); `./kontakt-support-form` (client).
- Layout: PageHeader → live svartid-pill (~4t) → ticket-banner → skjema.
- Tilstander: success (ticket-id).
- Merknad: bruker PageHeader, ikke MeSub (chrome-avvik fra /help-hubben det lenkes fra).
- Nåværende designkvalitet: ferdig men inkonsistent chrome.
- Redesign-prioritet: P2

### /portal/meg/help/artikkel/[slug]
- Fil: `src/app/portal/meg/help/artikkel/[slug]/page.tsx` (287 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: enkelt hjelpe-artikkel (slug-basert).
- Data vist: artikkel-innhold (UVERIFISERT om DB eller statisk innholds-map — 287 linjer tyder på statisk content).
- Tilstander: not-found UVERIFISERT.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (ikke fullt lest).
- Redesign-prioritet: P2

### /portal/meg/help/kategori/[slug]
- Fil: `src/app/portal/meg/help/kategori/[slug]/page.tsx` (448 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: hjelp-kategori-oversikt (slug-basert, lister artikler).
- Data vist: kategori + artikkel-liste (UVERIFISERT kilde; 448 linjer → trolig stort statisk innholds-map).
- Tilstander: not-found UVERIFISERT.
- Designfil-referanse: UVERIFISERT.
- Nåværende designkvalitet: UVERIFISERT (ikke fullt lest).
- Redesign-prioritet: P2

### /portal/meg/feedback
- Fil: `src/app/portal/meg/feedback/page.tsx` (35 linjer)
- Flate: PlayerHQ (max-w-640px)
- Rolle/gating: `requirePortalUser`
- Jobb: app-feedback (bug/forslag/ros) + historikk.
- Data vist: `searchParams.takk` → takke-banner; historikk fra `FeedbackHistorikk` (client).
- Komponenter: `PageHeader` (PlayerHero alias); `./app-feedback-form`; `./feedback-historikk`.
- Layout: PageHeader → takke-banner → skjema → historikk.
- Tilstander: success-banner.
- Nåværende designkvalitet: ferdig men PageHeader-chrome (avvik fra MeSub-hubben).
- Redesign-prioritet: P2

---

## Øvrige

### /portal/meg/bookinger
- Fil: `src/app/portal/meg/bookinger/page.tsx` (64 linjer)
- Flate: PlayerHQ (max-w-1240px)
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`
- Jobb: egne bookinger (kommende/historikk) + ny-booking-inngang.
- Data vist: `booking` m/ serviceType+location; `subscription.monthlyCredits>0` → academy-kunde → `nyBookingHref` (`/portal/booking/ny` vs `/booking`).
- Komponenter: `PageHeader` (PlayerHero alias); `./bookinger-tabs` (client).
- Layout: PageHeader + «Ny booking»-CTA → tabs (kommende/historikk).
- Tilstander: filtrert kommende/historikk; empty UVERIFISERT (i tabs).
- AK-domene vist: credits → academy-kunde-gating av booking-rute.
- Nåværende designkvalitet: ferdig men PageHeader/1240px-chrome.
- Redesign-prioritet: P2

### /portal/meg/bookinger/reschedule/[bookingId]
- Fil: `src/app/portal/meg/bookinger/reschedule/[bookingId]/page.tsx` (155 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`; redirect ved <24t-regel (`?error=24t`) eller avbestilt (`?error=cancelled`).
- Jobb: bytt tid på en eksisterende booking.
- Data vist: booking-detaljer; tilgjengelige tider (UVERIFISERT kilde).
- Layout: PageHeader «PlayerHQ · Bytt tid».
- Tilstander: error-redirect (24t/cancelled).
- AK-domene vist: 24-timers reschedule-regel.
- Nåværende designkvalitet: ferdig (forretningsregel håndhevet).
- Redesign-prioritet: P3

### /portal/meg/dokumenter
- Fil: `src/app/portal/meg/dokumenter/page.tsx` (130 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser`
- Jobb: samlede avtaler/samtykker/fakturaer som dokument-liste.
- Data vist: `document` (delte `userId:null` + egne); kind → ikon/chip/label via maps.
- Komponenter: `MeSub` (delt); `AthleticBadge`; lucide.
- Layout: MeSub → ÉN liste med dokument-rader (ikon-chip + tittel + dato/type + chip + chevron, åpner `d.url` i ny fane).
- Tilstander: **empty** håndtert («Ingen dokumenter ennå.»).
- AK-domene vist: ingen.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/utstyrsbag
- Fil: `src/app/portal/meg/utstyrsbag/page.tsx` (49 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER","COACH","ADMIN"] })`
- Jobb: registrer køllesett/ball/spesifikasjoner (TrackMan-kalibrering).
- Data vist: `equipmentBag` (driver/woods/hybrids/irons/wedges/putter/ball/bag/notes).
- Komponenter: `MeSub` (delt); `./utstyrsbag-view` (client, gjenbruker UtstyrsbagForm + `lagreUtstyrsbag`).
- Layout: MeSub → kølle-rader → BALL & ØVRIG → knapper («Legg til kølle» + «Se TrackMan-tall»).
- Tilstander: tomt bag → undefined-felter (form håndterer).
- AK-domene vist: utstyr ↔ TrackMan-kobling.
- Designfil-referanse: ph-screens.jsx (UtstyrScreen) per kommentar.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /portal/meg/foreldre
- Fil: `src/app/portal/meg/foreldre/page.tsx` (64 linjer)
- Flate: PlayerHQ
- Rolle/gating: `requirePortalUser({ allow: ["PLAYER"] })` (kun spiller ser egne foresatte)
- Jobb: vis koblede foresatte/verger.
- Data vist: `parentRelation` (childId=user) → parent name/email/relationship; `relasjonLabel` normaliserer far/mor/verge.
- Komponenter: `ForeldreInfo` (`components/portal/meg/foreldre-info`, eier all layout); page rendrer kun mappet data.
- Layout: helt i ForeldreInfo-komponenten (ikke MeSub i page).
- Tilstander: tom-tilstand (stiplet kort) når ingen foresatte — aldri dummy.
- AK-domene vist: forelder-relasjon.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

---

# PlayerHQ (resten av /portal) — skjermkort (kode-verifisert 2026-06-29)

67 ruter dekket (hjem, analyse, baneguide, booking, coach/*, drills, gjennomføre, kalender, planlegge, statistikk, talent, trackman, trening, utfordringer, varsler, ai/*, agent-pipeline, onskeligokt, reach, spiller, ny-okt). Dominerende mønster: server-component som henter Prisma-data og rendrer enten en hybrid-klientkomponent (`@/components/portal/...`) eller inline JSX i «editorial lys hero + terminal-data»-stilen — PlayerHQ er gjennomgående LYST og mobil-først (max-w 430–480px). Største gjeld: (1) hardkodet hex/rgba i inline `style` på mange skjermer (kalender, talent, coach/sg-hub, ovelser, gjennomfore-kort) i strid med token-regelen, (2) navne-kanon-brudd — `coach/melding/ny` faller tilbake på «Hans Brennum/Linn Knutsen/Espen Søvik» og flere skjermer hardkoder «Anders», (3) flere coach-detalj-skjermer har statiske/proxy-tall (sertifiseringer, rating 4,9, COACH_SG-referanser, smash-proxy SG) og «PRE-BETA»-talent som ikke er ekte data.

---

### /portal
- Fil: src/app/portal/page.tsx
- Flate: PlayerHQ hjem
- Rolle/gating: requirePortalUser; PARENT→/forelder, GUEST→/admin/kalender
- Jobb: Spillerens dashboard-landingsside.
- Data vist: alt via `getDashboardData(user.id)` → `HybridHomePage` (`@/components/portal/dashboard/HybridHomePage`)
- Komponenter: `HybridHomePage` (delt, lokal til portal)
- Layout og hierarki: tynn server-wrapper; all layout i klientkomponenten. Skall (topbar/sidebar/bottom-nav) eies av PortalShell.
- Tilstander: redirects for PARENT/GUEST; resten i HybridHomePage (ikke verifisert her)
- Interaksjoner: delegert til HybridHomePage
- AK-domene vist: avhenger av HybridHomePage (UVERIFISERT i denne filen)
- Designfil-referanse: hybrid-design 2026-06-17 (nevnt i fil-doc)
- Nåværende designkvalitet: ferdig (wrapper) — innhold ligger i komponent utenfor scope
- Redesign-prioritet: P2 (selve siden er stub; HybridHomePage avgjør)

### /portal/analyse
- Fil: src/app/portal/analyse/page.tsx
- Flate: redirect
- Rolle/gating: ingen — `permanentRedirect("/portal/analysere")`
- Jobb: Legacy-URL → analysere. **Stub.**
- Redesign-prioritet: P3

### /portal/analysere
- Fil: src/app/portal/analysere/page.tsx
- Flate: PlayerHQ Analyse (samlet — faner SG · Runder · TrackMan · Tester)
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect
- Jobb: Samlet analyse-flate (låst IA: analyse er én flate med faner).
- Data vist: `loadAnalyticsWorkbenchData(user.id)` → `HybridAnalysePage`
- Komponenter: `HybridAnalysePage` (`@/components/portal/analytics/HybridAnalysePage`)
- Layout og hierarki: tynn wrapper; alt i klientkomponent
- Tilstander: i komponent (UVERIFISERT her)
- AK-domene vist: SG/TrackMan/Runder/Tester (via komponent)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/analysere/hull
- Fil: src/app/portal/analysere/hull/page.tsx
- Flate: Hull-analyse (top-down sone-kart)
- Rolle/gating: requirePortalUser
- Jobb: Vise hvor spilleren taper slag per sone (Tee→Innspill→Nærspill→Putt) med ekte SG + trening.
- Data vist: SG per sone → `BrukerSgInput` (siste 8); trening per skillArea → `TrainingPlanSession` (siste 30 d); siste runde hull-for-hull → `Round.holeScores`
- Komponenter: `HullTabs` (lokal), `HoleZone`-type fra `@/components/hole-analysis/hole-analysis`
- Layout og hierarki: tilbake-lenke → mono eyebrow + display-tittel «Hvor taper du *slag*?» → HullTabs (sone-kart + siste-runde-tabell). max-w 440px.
- Tilstander: empty når ingen SG/runde (håndtert i HullTabs); ingen eksplisitt loading/error
- Interaksjoner: faner i HullTabs
- AK-domene vist: SG (sgOtt/sgApp/sgArg/sgPutt), trening per pyramide-skillArea, hull-score-diff
- Designfil-referanse: ingen prototype (nevnt ikke)
- Nåværende designkvalitet: ferdig — token-rent, editorial
- Redesign-prioritet: P2

### /portal/baneguide
- Fil: src/app/portal/baneguide/page.tsx
- Flate: Baneguide-bibliotek (fase 5)
- Rolle/gating: requirePortalUser
- Jobb: Liste baner spilleren har spilt + geometri-status.
- Data vist: `getBaneLibrary(user.id)` → navn, klubb, hasGeometry, holesMapped, playerRounds
- Komponenter: `AthleticEyebrow`, `AthleticBadge` (athletic)
- Layout og hierarki: eyebrow + «Banene dine» + sub → liste med MapPin-avatar + badge (lime «N hull» / neutral «Kommer») + runde-teller + ChevronRight. max-w 2xl.
- Tilstander: empty («Ingen baner ennå»); ingen loading/error
- Interaksjoner: rad → /portal/baneguide/[id]
- AK-domene vist: dispersion/geometri-tilgjengelighet (hull kartlagt)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/baneguide/[baneId]
- Fil: src/app/portal/baneguide/[baneId]/page.tsx
- Flate: Banekart-oversikt (satellitt + hull-liste)
- Rolle/gating: requirePortalUser; notFound hvis ikke funnet
- Jobb: Hele banen på satellitt + hull-liste med slag-antall per hull.
- Data vist: `getBaneOverview(baneId, user.id)` → bane (geojson, lat/lng), holes (par, lengthMeter, shotCount), parSum
- Komponenter: `CourseMap` (`@/components/baneguide/course-map`), `AthleticEyebrow`
- Layout og hierarki: eyebrow (banenavn) + «Banekart» + meta → CourseMap (340px) → hull-liste med nummer-chip + par/lengde + slag-antall.
- Tilstander: notFound; tom hull-liste mulig; `geojson as unknown as` cast (ikke zod-validert)
- Interaksjoner: hull-rad → /baneguide/[id]/hull/[nr]
- AK-domene vist: slag-antall per hull (dispersion-grunnlag)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig
- Redesign-prioritet: P2

### /portal/baneguide/[baneId]/hull/[nr]
- Fil: src/app/portal/baneguide/[baneId]/hull/[nr]/page.tsx
- Flate: Hull-detalj (signaturskjerm — spredning + dispersion-KPI)
- Rolle/gating: requirePortalUser; notFound
- Jobb: Satellitt + spillerens spredning + KPI fra dispersion-motoren + innsikt.
- Data vist: `getHoleDetail(baneId, holeNumber, user.id, ShotType)` → tee/green, landings, stats (std.lateral/distance, bias). Segment via `?type=utslag|innspill|putt`.
- Komponenter: `CourseMap` (shotPoints/aimLine), `KpiCard` (athletic), `AthleticEyebrow`
- Layout og hierarki: tilbake → eyebrow lime + «Hull N» + par/lengde → CourseMap m/spredning → segment-pills → KPI-grid (σ side, σ lengde, bias, N) → innsikt-kort (forest bg, lime accent) med miss-retning.
- Tilstander: notFound; empty («Ingen … plottet på dette hullet ennå»); ingen loading
- Interaksjoner: segment-pills → `?type=`
- AK-domene vist: dispersion (σ lateral/distance, bias H/V), SG-segment via ShotType
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — signatur-kvalitet, token-rent
- Redesign-prioritet: P3 (allerede sterk)

### /portal/booking
- Fil: src/app/portal/booking/page.tsx
- Flate: Booking-hub (hybrid)
- Rolle/gating: requirePortalUser allow PLAYER/COACH/ADMIN
- Jobb: Bookings-landing — credits, kommende/forrige, coacher, mini-kalender.
- Data vist: `getBookingHubData(user.id)` → credits, upcoming, past, coaches → `BookingHubHybrid`
- Komponenter: `BookingHubHybrid` (`@/components/portal/booking/booking-hub-hybrid`)
- Layout og hierarki: tynn wrapper; layout i klientkomponent (editorial hero + mini-kalender + mine bookinger)
- Tilstander: i komponent (UVERIFISERT her)
- Interaksjoner: dag-klikk → /portal/booking/ny?dato=
- AK-domene vist: credits-saldo
- Designfil-referanse: `PlayerHQ Booking (hybrid).dc.html` (prosjektgjennomgang-2026-06-17)
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/booking/ny
- Fil: src/app/portal/booking/ny/page.tsx
- Flate: Booking-wizard (mobil 480px) — 3 steg + bekreft
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; redirect /coaching hvis ingen/0-credit-abonnement
- Jobb: Velg tjeneste → dato/tid → bekreft via credits.
- Data vist: `Subscription` (credits), `ServiceType` (active, varighet, pris, slug), `Location`+`Facility`, `getAvailableSlots`. Query-drevet steg (`?service`, `?dato`).
- Komponenter: `CreditMeter` (`@/components/portal/abonnement`), `DatoVelger`, `SlotGrid` (lokale `_components`), lokale `Eyebrow`/`StegIndikator`/`SummaryRow`
- Layout og hierarki: hero → steg-prikker → free-gate-kort → credit-saldo (40px mono-tall) → steg 1 tjeneste-kort → context-kort → steg 2 dato+slots → steg 3 bekreft-oppsummering + saldo-før/etter.
- Tilstander: free-gate (warning-kort + «Oppgrader til Pro»); «brukt opp credits»-view (`BruktOppView`); empty slots; ingen tjenester-melding; redirect for inaktiv abonnement
- Interaksjoner: tjeneste/dato-valg via query; slot-trykk → /booking/ny/bekreft
- AK-domene vist: credits-økonomi, GRATIS-tier-gate, tjeneste-lokasjons-mapping (trackman→Mulligan)
- Designfil-referanse: `_prompts/SKJERMER-RUNDE-7-BOOKING.md`
- Nåværende designkvalitet: ferdig — token-rent, rik wizard
- Redesign-prioritet: P2

### /portal/booking/ny/bekreft
- Fil: src/app/portal/booking/ny/bekreft/page.tsx
- Flate: Credit-booking bekreftelse
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; redirects på manglende abonnement/credits
- Jobb: Endelig bekreftelse + notat før credit-trekk.
- Data vist: query `service`/`start`/`coach`; `Subscription`, `ServiceType`, coach (User), `isSlotStillAvailable`
- Komponenter: `BekreftForm` (lokal client)
- Layout og hierarki: tilbake → «Bekreft *booking*» → ledig-feilbanner (hvis tatt) → oppsummering (dl) → betaling/credit-saldo → BekreftForm → trygghets-fot.
- Tilstander: notFound (manglende params/service/coach); slot-tatt-feilmelding; redirects
- AK-domene vist: credits-saldo før/etter
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig
- Redesign-prioritet: P2

### /portal/booking/bekreftet
- Fil: src/app/portal/booking/bekreftet/page.tsx
- Flate: Booking-kvittering (forespørsel sendt)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound uten bookingId/eierskap
- Jobb: Bekreftelse + «legg i Google-kalender».
- Data vist: `Booking` (serviceType, location, coach via coachUserId)
- Komponenter: inline (sentrert sjekk-sirkel, coach-kort)
- Layout og hierarki: sjekk-sirkel → «Forespørsel *sendt!*» → coach-kort (initialer fra navn) → «Legg i kalender» (Google-template-URL) + «Se alle bookinger».
- Tilstander: notFound
- Interaksjoner: Google-kalender-lenke (ekstern), → /portal/meg/bookinger
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P3

### /portal/booking/[bookingId]
- Fil: src/app/portal/booking/[bookingId]/page.tsx
- Flate: Økt-detalj (planlagt booking)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound uten eierskap
- Jobb: Detaljer om planlagt økt — tidslinje, mål, utstyr.
- Data vist: `Booking` (serviceType, location, coach, status, notes). **MÅL/UTSTYR/TIMELINE er hardkodet** (MAL, UTSTYR, TIMELINE-arrays) — ikke ekte data.
- Komponenter: inline; importerer `@/components/booking/booking.css` (egen CSS-fil, `bk-`-klasser — utenfor token-systemet)
- Layout og hierarki: bk-topnav → status-badge → tittel «Tjeneste — *Sted*» → meta-rad → Mål → Tidslinje → Ta med → notat → actions.
- Tilstander: notFound; status-badge fra ekte status; notat conditional
- Interaksjoner: «Alt er klart» → /booking/bekreftet; tilbake
- AK-domene vist: ingen (mål/struktur er placeholder)
- Designfil-referanse: «Økt-detalj planlagt.html (Bundle 3)»
- Nåværende designkvalitet: inkonsistent — bruker egen `booking.css` (`bk-`-klasser, hardkodet `#4A5418`), og fabrikerte MÅL/UTSTYR/TIMELINE
- Redesign-prioritet: P1 (token-drift + fake-data)

### /portal/booking/anlegg/[anleggId]
- Fil: src/app/portal/booking/anlegg/[anleggId]/page.tsx
- Flate: Anlegg/lokasjon-detalj (desktop-bred 1240px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Vise én Location + fasiliteter, lenke til booking-flyt.
- Data vist: `Location` (name, address, `Facility`-rader med type/isIndoor/description). Bevisst ingen specs/rating (finnes ikke i modell).
- Komponenter: inline; `FacilityType`-enum-labels
- Layout og hierarki: tilbake → HERO (forest-gradient inline-style m/`var(--forest-deep)` + radial lime) → fasilitet-grid (Inne/Ute-badge) → sticky CTA «Velg tid i booking».
- Tilstander: notFound; empty fasiliteter
- Interaksjoner: → /portal/booking/ny
- AK-domene vist: fasilitet-typer (STUDIO/RANGE/COURSE)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: halvferdig — hero bruker inline gradient med rå rgba/hex (`rgba(209,248,67,0.18)`) + `var(--forest-deep)`; token-drift
- Redesign-prioritet: P1

### /portal/booking/coach/[coachId]
- Fil: src/app/portal/booking/coach/[coachId]/page.tsx
- Flate: Book direkte med coach (desktop 1240px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Coach-inngangspunkt til booking — tjenester + felles-økt-teller.
- Data vist: coach via `resolveCoach` (cuid ELLER fornavn-slug fra anlegg-lenker), `coachingSession.count`, `serviceType` (coachUserId). `user.tier` for Pro-gate.
- Komponenter: inline
- Layout og hierarki: tilbake → HERO (avatar + navn + ambition + felles-økter-stat) → tjeneste-liste → sticky bekreft-kort + «Send melding» + GRATIS-Pro-banner + kontakt.
- Tilstander: notFound; empty tjenester; GRATIS-tier-banner
- Interaksjoner: tjeneste → /booking/ny?coachId&service; melding → /coach/melding
- AK-domene vist: GRATIS-tier-gate, felles-øktteller
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (token-rent). NB-kommentar: anlegg-lenker bruker fornavn-slug → teknisk gjeld (resolveCoach er workaround)
- Redesign-prioritet: P2

### /portal/coach
- Fil: src/app/portal/coach/page.tsx
- Flate: Coach Hub (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/GUEST
- Jobb: Spillerens coach-landing — insight, kommende økter, meldinger-preview.
- Data vist: `getCoachProfile`, `getMessages`, `getUpcomingSessions`, `getCoachNotes` (alle fra lokal `./actions`)
- Komponenter: `MessageThread` (`@/components/portal/coach`); inline timeline/bubbles
- Layout og hierarki: eyebrow «Coach · {navn}» + «Din *coach*» → insight-kort (lime left-border, ukes-fokus fra siste notat) → event-timeline (3-state dots m/inline `var(--accent)`) → meldinger-preview (bobler m/inline-style farger) → desktop full MessageThread. max-w 430/860px.
- Tilstander: ingen-coach-tilstand; tom timeline; tom meldinger
- Interaksjoner: send melding/booking-CTA; bobler; «Se alle N sesjoner»
- AK-domene vist: coach-fokus-notat
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: halvferdig — flere inline `style={{ background: "var(--...)" }}` for bobler/dots (kunne vært klasser); ellers token-tro
- Redesign-prioritet: P2

### /portal/coach/[coachId]
- Fil: src/app/portal/coach/[coachId]/page.tsx
- Flate: Coach-profil (desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound hvis role≠COACH
- Jobb: Full coach-profil — quote, stats, sertifiseringer.
- Data vist: `User` (name/email/avatar/ambition), `coachingSession.count`. **Stats «Snittsvar 4 t», «Rating 4,9», CERTIFICATIONS-array er hardkodet/statisk.**
- Komponenter: `PlayerHero` (`@/components/portal/player-hero`), inline Stat
- Layout og hierarki: tilbake → PlayerHero (eyebrow + «Din coach *Navn*» + actions send melding/be om økt) → profilkort + stats → sertifiseringer → booking-info (dashed, «UI for ledige tider bygges i senere fase»).
- Tilstander: GRATIS-gate; notFound
- AK-domene vist: MORAD-sertifisering (statisk liste); felles-økter
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — statiske stats/rating/sertifiseringer presentert som ekte; «booking bygges senere»-tekst er stale (booking finnes)
- Redesign-prioritet: P1

### /portal/coach/ai
- Fil: src/app/portal/coach/ai/page.tsx
- Flate: AI-coach (chat)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; GRATIS→Pro-gate
- Jobb: Personlig AI-coach-chat med kontekst.
- Data vist: siste/ny `coachingSession` (kind AI), initialMessages parses fra JSON (`ChatMelding` fra `@/lib/anthropic`)
- Komponenter: `PlayerHero`, `AiChat` (lokal), `ChatToolbar` (lokal)
- Layout og hierarki: grid `auto/auto/1fr` → PlayerHero-header → avatar-header med Sparkles-badge → AiChat (fyller resten).
- Tilstander: GRATIS-gate; `?ny=1` for ny sesjon; TODO-kommentar: «hent reell kontekst-info»
- Interaksjoner: chat-input, toolbar
- AK-domene vist: AI-kontekst (profil/aktivitet — delvis TODO)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (skall); kontekst-strip er TODO
- Redesign-prioritet: P2

### /portal/coach/melding
- Fil: src/app/portal/coach/melding/page.tsx
- Flate: Coach Meldinger (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; GRATIS→Pro-gate
- Jobb: Skriv til coach + historikk + Q&A-inngang.
- Data vist: `User` (COACH), `coachingSession` (kind DIRECT, siste 20) → historikk-snippets
- Komponenter: `MeldingForm` (lokal)
- Layout og hierarki: tilbake → «Ny *melding*» → mottaker-kort (hovedcoach) → MeldingForm → historikk-liste → Q&A-kort med CTA til /coach/sporsmal/ny. max-w 430/860px.
- Tilstander: GRATIS-gate; conditional historikk
- Interaksjoner: send; historikk-rader; «Still spørsmål»
- AK-domene vist: ingen
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/melding/[id]
- Fil: src/app/portal/coach/melding/[id]/page.tsx
- Flate: Meldingstråd
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; «tråd ikke funnet» uten eierskap
- Jobb: Full chat-tråd mot coach.
- Data vist: `coachingSession` (messages JSON → items), coach-navn/initialer
- Komponenter: `TradUi` (lokal client), `MeldingHeaderKnapper` (lokal)
- Layout og hierarki: nav (crumb) → sticky thread-header (avatar + «Pålogget · hovedcoach · GFGK») → TradUi. Egen min-h-screen-flate (ikke standard portal-padding).
- Tilstander: tråd-ikke-funnet-fallback; tom tråd = ærlig tom
- Interaksjoner: send i TradUi; vedlegg-lenke; header-knapper
- AK-domene vist: «GFGK»-tekst hardkodet i status-linje
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig; «Pålogget · GFGK» er statisk presence-tekst
- Redesign-prioritet: P2

### /portal/coach/melding/[id]/vedlegg
- Fil: src/app/portal/coach/melding/[id]/vedlegg/page.tsx
- Flate: Vedlegg-galleri
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; notFound hvis ikke part/ADMIN
- Jobb: Alle vedlegg i en meldingstråd (signerte URL-er).
- Data vist: `messageAttachment` (fileName/type/size), signed URL via `getSignedUrl(MESSAGE_ATTACHMENTS)`
- Komponenter: `VedleggUi` (lokal)
- Layout og hierarki: nav (crumb) → VedleggUi. min-h-screen-flate.
- Tilstander: notFound (access-sjekk er eneste vern — storage omgår RLS)
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn server-wrapper)
- Redesign-prioritet: P3

### /portal/coach/melding/ny
- Fil: src/app/portal/coach/melding/ny/page.tsx
- Flate: Ny melding (compose, desktop 880px)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT
- Jobb: Utgående melding til coach/fysio/mentor.
- Data vist: `User` (COACH, take 4). **FALLBACK-MOTTAKERE HARDKODET: «Hans Brennum/Linn Knutsen/Espen Søvik/Anders K.»** når ingen coacher — navne-kanon-brudd. Roller «Fysio/Mentor/Sub-coach» tildeles per indeks (fabrikert).
- Komponenter: `NyMeldingClient` (lokal)
- Layout og hierarki: nav (crumb) → «Ny *melding*» + lead → NyMeldingClient.
- Tilstander: fallback-mottakere; ingen empty
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stygg/inkonsistent — hardkodede demo-navn (Hans Brennum osv.) i strid med Øyvind/Anders-kanon; fabrikerte roller per indeks
- Redesign-prioritet: P1

### /portal/coach/notes
- Fil: src/app/portal/coach/notes/page.tsx
- Flate: Coach-notater (desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Notater (coach-meldinger) fra DIRECT-sesjoner.
- Data vist: `coachingSession` (DIRECT) → coach-meldinger som notater; nye-i-uka-teller
- Komponenter: `PlayerHero`, `EmptyState`, inline StatPill
- Layout og hierarki: hero (ringed avatar + stat-pills + «Svar coach»/«Be om vurdering») → insight-banner → notat-feed (8/12-kol) + quote-sidebar.
- Tilstander: GRATIS-gate; egen empty-hero + EmptyState når 0 notater
- Interaksjoner: → /coach/melding (svar/vurdering); → /coach/notes/[id]
- AK-domene vist: ingen
- Designfil-referanse: «coaching-detail-demo» (nevnt i fil-doc)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/notes/[noteId]
- Fil: src/app/portal/coach/notes/[noteId]/page.tsx
- Flate: Notat-detalj
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound uten eierskap (med COACH/ADMIN-unntak)
- Jobb: Én coaching-sesjon som notat med fokus-fragmenter.
- Data vist: `coachingSession` (messages → coach-fragmenter som tittel/fokus). **TAGS = `["TEK","SLAG","pitch-konsistens"]` hardkodet.**
- Komponenter: `PlayerHero`, `EmptyState`
- Layout og hierarki: tilbake → PlayerHero → hovedinnhold (fragmenter som blockquotes) + sidebar (knyttet samtale, coach-info, tags, relaterte).
- Tilstander: notFound; empty-innhold
- AK-domene vist: TAGS hardkodet (TEK/SLAG = pyramide-akser, men statiske)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — statiske TAGS presentert som ekte
- Redesign-prioritet: P2

### /portal/coach/ovelser
- Fil: src/app/portal/coach/ovelser/page.tsx
- Flate: Coach Øvelsesbibliotek (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Drill-bibliotek-grid m/pyramide-filter.
- Data vist: `exerciseDefinition` (filtrert på `pyramidArea` via `?area`)
- Komponenter: `ExerciseCardActions` (lokal), `EmptyState`, inline `OvelseCard`
- Layout og hierarki: «Øvelser fra *Anders*» (**hardkodet «Anders»**) + teller + «Ny øvelse» → filter-chips (Alle/FYS/TEK/SLAG/SPILL/TURN) → 2/3/4-kol grid med forest-gradient-thumbnail (inline `linear-gradient(150deg,#2f5a2c,#0a2417)` + lime-grid-overlay rgba).
- Tilstander: empty (EmptyState + CTA)
- Interaksjoner: chips → `?area`; kort → /portal/drills/[id]; «Ny øvelse»
- AK-domene vist: pyramide-områder (FYS/TEK/SLAG/SPILL/TURN)
- Designfil-referanse: fasit B5 · Innhold
- Nåværende designkvalitet: halvferdig — hardkodet «Anders»; forest-gradient + lime-grid som inline hex/rgba (token-drift)
- Redesign-prioritet: P1

### /portal/coach/ovelser/ny
- Fil: src/app/portal/coach/ovelser/ny/page.tsx
- Flate: Ny øvelse (editor)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Opprett ExerciseDefinition. **Coach-only.**
- Data vist: ingen (tom editor)
- Komponenter: `PlayerHero`, `DrillEditor` (`@/components/portal/drill-editor`, mode=create)
- Layout og hierarki: tilbake → PlayerHero (eyebrow «AgencyOS · Ny øvelse» — NB AgencyOS-eyebrow på portal-rute) → DrillEditor.
- Tilstander: i editor
- AK-domene vist: avhenger av DrillEditor (pyramide/CS)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); eyebrow sier «AgencyOS» på /portal — inkonsistent merking
- Redesign-prioritet: P2

### /portal/coach/ovelser/[id]/rediger
- Fil: src/app/portal/coach/ovelser/[id]/rediger/page.tsx
- Flate: Rediger øvelse
- Rolle/gating: requirePortalUser COACH/ADMIN; notFound
- Jobb: Rediger ExerciseDefinition. **Coach-only.**
- Data vist: `exerciseDefinition` (initial)
- Komponenter: `PlayerHero` (eyebrow «AgencyOS · Rediger øvelse»), `DrillEditor` (mode=edit)
- Layout og hierarki: tilbake → PlayerHero → DrillEditor
- Tilstander: notFound
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); samme AgencyOS-eyebrow-inkonsistens
- Redesign-prioritet: P2

### /portal/coach/videoer
- Fil: src/app/portal/coach/videoer/page.tsx
- Flate: Coach Videoer (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Videoer (swing-analyse/drill-demo) fra coach.
- Data vist: `sessionVideo` (playerId, status READY, coach-navn)
- Komponenter: `PlayerVideoCard` (lokal)
- Layout og hierarki: tilbake → «Videoer fra *Anders*» (**hardkodet «Anders»**) → liste med PlayerVideoCard. Empty: forest-gradient placeholder + play-ikon.
- Tilstander: empty (inline forest-gradient `linear-gradient(150deg,#2f5a2c,#0a2417)` + hardkodet lime `#D1F843` i SVG)
- AK-domene vist: video-tags (via kort)
- Designfil-referanse: fasit B5 · Innhold (Videoer-fane)
- Nåværende designkvalitet: halvferdig — hardkodet «Anders» + hardkodet hex i empty
- Redesign-prioritet: P1

### /portal/coach/sg-hub
- Fil: src/app/portal/coach/sg-hub/page.tsx
- Flate: Coach SG-sammenligning (hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Spiller-SG H2H mot coach-referanse + gap-innsikt.
- Data vist: siste `brukerSgInput` (spiller). **`COACH_SG = {ott:0.8,app:0.9,arg:0.2,putt:0.6}` HARDKODET** referanse. Coach-navn fra DB (fallback «Anders Kristiansen»).
- Komponenter: inline (bilateral progress-bar)
- Layout og hierarki: tilbake → «Sammenlign med coach» + coach-navn → H2H-bar per kategori (OTT/APP/ARG/PUTT, inline `#7BA428`/`#1A7D56`/`#A32D2D` farger) → gap-innsikt (lime left-border) → Utstyr/Per-kølle-lenker (til /portal/mal/sg-hub).
- Tilstander: ingen-data-melding (ingen SG)
- Interaksjoner: → /portal/mal/sg-hub*
- AK-domene vist: SG per kategori, største-gap-beregning
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: inkonsistent — COACH_SG hardkodet (referanse-tall), flere hardkodede hex i bar-farger; lenker til /portal/mal/* (utenfor scope)
- Redesign-prioritet: P1

### /portal/coach/plans
- Fil: src/app/portal/coach/plans/page.tsx
- Flate: Coach Planer hub (kanban)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Planene coach har laget (Aktiv/Fullført/Pause-kolonner).
- Data vist: `trainingPlan` (userId, createdById≠null) + sessions-status → progress-%
- Komponenter: `EmptyState`, inline KanbanCol/PlanKCard
- Layout og hierarki: «Mine *planer*» + «Fra Anders Kristiansen» (**hardkodet**) + «Be om plan» → kanban (3 kol, horisontal scroll mobil) med progress-bar (inline forest→lime gradient `var(--forest),#b5d629`).
- Tilstander: GRATIS-gate; EmptyState
- Interaksjoner: kort → /coach/plans/[id]; «Be om plan» → /onskeligokt
- AK-domene vist: plan-status, gjennomføringsgrad
- Designfil-referanse: fasit B5 · Planer (Hub)
- Nåværende designkvalitet: halvferdig — hardkodet «Anders Kristiansen»; inline gradient-hex
- Redesign-prioritet: P1

### /portal/coach/plans/[planId]
- Fil: src/app/portal/coach/plans/[planId]/page.tsx
- Flate: Coach Plan-detalj (rik)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate; notFound uten eier/stab
- Jobb: Full plan — coach-notat, fremgang, 5-fase-progresjon, drills, kommende, pyramide, mål.
- Data vist: `trainingPlan` (sessions+drills+exercise), coach (createdById), siste DIRECT-`coachingSession` (coach-notat), `goal` (ACTIVE), pyramide-fordeling via `@/lib/pyramide`. `planSessionStartHref`.
- Komponenter: `AthleticBadge`, `EmptyState`, `PlayerPlanActions` (lokal), inline TypeTag/FASER
- Layout og hierarki: tilbake → tittel + meta + AKTIV-badge → accept/reject-actions (PENDING/REJECTED) → coach-notat (lime border) → planfremgang (forest→lime bar) → 5-fase-strip → drills m/«Utfør» → kommende økter → pyramide-fordeling (5 områder) → plan-mål → insight-banner → «Start ny økt fra plan» → accept-actions (desktop).
- Tilstander: GRATIS-gate; notFound; empty kommende; conditional mål/drills/insight; plan-status-flyt
- Interaksjoner: accept/reject; «Utfør» → session-href; «Start ny økt»
- AK-domene vist: pyramide-fordeling (FYS/TEK/SLAG/SPILL/TURN), 5-fase-periodisering, SG_AREA/HCP_TARGET-mål, plan-status (PENDING_PLAYER osv.)
- Designfil-referanse: fasit B5 · Planer (Detalj)
- Nåværende designkvalitet: halvferdig — rik og token-tro, men `FASER` (Generell/Spesifikk/Taper/Toppform/Restitusjon) + inline gradient-hex `#b5d629`
- Redesign-prioritet: P1 (mest dataverdi; gradient-drift)

### /portal/coach/plans/[planId]/ny-okt
- Fil: src/app/portal/coach/plans/[planId]/ny-okt/page.tsx
- Flate: Legg til økt i plan
- Rolle/gating: requirePortalUser COACH/ADMIN; notFound
- Jobb: Coach legger økt i en plan. **Coach-only.**
- Data vist: `trainingPlan` (navn), `exerciseDefinition` (alle)
- Komponenter: `PlayerHero` (eyebrow «AgencyOS · Ny økt»), `AddSessionWizard` (`@/components/admin/add-session-wizard` — admin-komponent på portal)
- Layout og hierarki: tilbake → PlayerHero → AddSessionWizard
- Tilstander: notFound
- AK-domene vist: i wizard
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (tynn); bruker admin-wizard + AgencyOS-eyebrow på portal-rute
- Redesign-prioritet: P2

### /portal/coach/plans/perioder
- Fil: src/app/portal/coach/plans/perioder/page.tsx
- Flate: Periode-oversikt (årsplan per spiller)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Sesongperioder per spiller (L-fase-blokker). **Coach-only.**
- Data vist: `User` (PLAYER med seasonPlans) → seneste `seasonPlan` + `periodBlocks` (lPhase, datoer, focus, weeklyVol)
- Komponenter: `PeriodeEditor` (lokal), `Image`
- Layout og hierarki: «Periode*-oversikt*» → per spiller: header (avatar + sesong/N-perioder) + PeriodeEditor.
- Tilstander: empty (ingen sesongplaner); per-spiller fallback
- AK-domene vist: L-fase-perioder (GRUNN/SPESIAL/TURNERING via PeriodeEditor), ukentlig volum
- Designfil-referanse: fasit B5 · Planer (Perioder)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/sporsmal
- Fil: src/app/portal/coach/sporsmal/page.tsx
- Flate: Spørsmål-innboks (coach)
- Rolle/gating: requirePortalUser COACH/ADMIN
- Jobb: Q&A rettet til coach + åpen kø. **Coach-only.**
- Data vist: `question` (coachUserId=user ELLER null, take 50) + asker-navn
- Komponenter: inline
- Layout og hierarki: nav (crumb) → «Spørsmål fra *spillere*» → liste med asker-avatar + Besvart/Åpent-pill + tittel. max-w 760px, min-h-screen.
- Tilstander: empty («Ingen spørsmål ennå»)
- Interaksjoner: rad → /coach/sporsmal/[id]
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/coach/sporsmal/[id]
- Fil: src/app/portal/coach/sporsmal/[id]/page.tsx
- Flate: Spørsmål-detalj
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN/PARENT; notFound
- Jobb: Vise spørsmål + svar, eller svar-skjema.
- Data vist: `question` (title/body/answer/answeredAt/status), asker
- Komponenter: `SporsmalReaksjoner`, `RelaterteSporsmal`, `SvarSkjema` (lokal `sporsmal-interaktiv`)
- Layout og hierarki: nav → header (besvart/venter) → spørsmål-kort → svar-kort ELLER svar-skjema → reaksjoner → relaterte («3 relaterte» — RelaterteSporsmal kan være statisk).
- Tilstander: notFound; besvart vs ubesvart
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig; «3 relaterte» og RelaterteSporsmal sannsynlig statisk (UVERIFISERT — i klientkomp)
- Redesign-prioritet: P2

### /portal/coach/sporsmal/ny
- Fil: src/app/portal/coach/sporsmal/ny/page.tsx
- Flate: Still spørsmål (spiller)
- Rolle/gating: requirePortalUser PLAYER/PARENT
- Jobb: Spiller stiller spørsmål + ser egne.
- Data vist: egne `question` (take 20). `?sendt` for kvittering.
- Komponenter: `StillSporsmalForm` (lokal)
- Layout og hierarki: nav → «Still spørsmål til *coach*» + lead → sendt-banner → form → «Mine spørsmål»-liste (Besvart/Venter).
- Tilstander: empty; sendt-banner
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/drills
- Fil: src/app/portal/drills/page.tsx
- Flate: Drill-galleri (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Drill-bibliotek med filter.
- Data vist: `getDrillLibrary(user.id)` → `DrillGallery`
- Komponenter: `DrillGallery` (`@/components/portal/drills/drill-gallery`)
- Layout og hierarki: tynn wrapper; grid + filter-pills i klientkomp.
- Tilstander: tom DB → tom liste (i komp)
- AK-domene vist: pyramide-akse, CS-link (i kort)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/drills/[id]
- Fil: src/app/portal/drills/[id]/page.tsx
- Flate: Drill-detalj (v10-fasit)
- Rolle/gating: requirePortalUser PLAYER/PARENT
- Jobb: Drill-detalj — meta, trinn, media, parametre.
- Data vist: `loadDrillDetalj(id, {id,hcp})` → mappes til v10 `DrillDetaljData`. coachInitials hardkodet «AK».
- Komponenter: `DrillDetalj` (`@/components/portal/drills/drill-detalj`)
- Layout og hierarki: not-found-fallback ELLER `<DrillDetalj>` (meta-chips, checkable trinn, media, coach-avatar, «Legg til i plan» → /planlegge/workbench). max-w 2xl.
- Tilstander: not-found-kort; tom-tilstander bevart (meta=[]/media=[]/params=[])
- AK-domene vist: CS, pyramide-akse, trinn (via mappet data)
- Designfil-referanse: v10 «pl-drill» (i fil-doc)
- Nåværende designkvalitet: ferdig — token-rent; coachInitials hardkodet «AK»
- Redesign-prioritet: P2

### /portal/gjennomfore
- Fil: src/app/portal/gjennomfore/page.tsx
- Flate: Gjennomføre (dagens program, hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Dagens treningsprogram (faner Neste/Resten/Fullført).
- Data vist: `getGjennomforeData(user.id)` → `GjennomforeFaner`
- Komponenter: `AthleticEyebrow`, `GjennomforeFaner` (`@/components/portal/gjennomfore`)
- Layout og hierarki: eyebrow + «Dagens *program*» → GjennomforeFaner. max-w 460/860px.
- Tilstander: i komp
- AK-domene vist: økt-program (i komp)
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/gjennomfore/[id]
- Fil: src/app/portal/gjennomfore/[id]/page.tsx
- Flate: Økt-detalj (TrainingSessionV2 / Spor B)
- Rolle/gating: requirePortalUser; notFound uten eierskap (studentId)
- Jobb: Lese-flate for coach-styrt V2-økt.
- Data vist: `trainingSessionV2` (title/tid/status/notes/completedSummary/drills). Coach-brief trygt parset fra `completedSummary.coachBrief.melding`.
- Komponenter: `AthleticEyebrow`, `AthleticBadge`
- Layout og hierarki: tilbake → eyebrow (dato) + tittel + tid → status-badge → coach-brief (forest left-border) → notes (lime) → drill-liste (Target-ikoner) → actions (Start/Fortsett, Kontakt coach, Se i planen).
- Tilstander: notFound; empty drills; status-styrt CTA
- Interaksjoner: `v2SessionStartHref`; → /coach/melding; → /planlegge
- AK-domene vist: pyramide-label per drill, V2-status (PLANNED/IN_PROGRESS/COMPLETED), coach-brief
- Designfil-referanse: ingen prototype (NY 2026-06-11, fikset 404)
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/kalender
- Fil: src/app/portal/kalender/page.tsx
- Flate: Årskalender (Gantt, hybrid)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Årsplan-Gantt (pyramide-rader + turnering-markører).
- Data vist: `seasonPlan` + `periodBlocks` (via `lesPeriodeType`), `tournamentEntry` (m/manualDate). Mapper til 12-mnd Gantt + markører + kommende hendelser.
- Komponenter: inline (GanttRadKomponent); periode-helper fra `@/app/admin/kalender/lib`
- Layout og hierarki: «Årsplan *{år}*» + spiller/HCP → Gantt-kart (FYS/TEK/SES/PEAK/REST/TURN-rader, måneds-header, legend) → kommende hendelser. max-w 460px.
- Tilstander: tom-tilstand (ingen perioder/turneringer) m/CTA «Send melding til coach»; conditional hendelser
- AK-domene vist: periodisering (GRUNN→FYS, SPESIAL→TEK osv.), turnering-tier (Major/Turnering), HCP
- Designfil-referanse: `PlayerHQ Årskalender (hybrid).dc.html`
- Nåværende designkvalitet: inkonsistent — bruker mange `var(--token)` men også rå fallback-hex i inline-style (`#fff`, `#005840`, `#A32D2D`, `rgba(37,99,235,.1)`); fil-doc sier «ingen hardkodet hex» men gjør det
- Redesign-prioritet: P1

### /portal/planlegge
- Fil: src/app/portal/planlegge/page.tsx
- Flate: redirect → Workbench
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect; ellers `redirect("/portal/planlegge/workbench")`
- Jobb: Ett trykkpunkt inn til Workbench (låst IA). **Stub.**
- Redesign-prioritet: P3

### /portal/planlegge/workbench
- Fil: src/app/portal/planlegge/workbench/page.tsx
- Flate: PlayerHQ Workbench (delt planleggings-kjerne)
- Rolle/gating: requirePortalUser; GUEST/PARENT redirect
- Jobb: Spillerens Workbench (AK-formel/periodisering/økt-planlegging).
- Data vist: `loadWorkbenchContext(user.id, weekOffset)` → data, insights.line, tekniskPlan, planId, planStatus. `?uke`-offset.
- Komponenter: `WorkbenchHybrid` (`@/components/workbench-hybrid`, role="player")
- Layout og hierarki: Suspense → WorkbenchHybrid (hub-faner: Teknisk plan/Sesongmål/Maler/Standardøkter/Gantt/Uke/Økt — se design-porting-gate Workbench-seksjon).
- Tilstander: i komponent; tom teknisk plan/sesongmål håndtert (ærlig empty)
- AK-domene vist: AK-formel, teknisk plan, sesongmål, pyramide, L-fase-Gantt (alt i WorkbenchHybrid)
- Designfil-referanse: Workbench v10 (design-porting-gate §Workbench 2026-06-25)
- Nåværende designkvalitet: ferdig (wrapper); kjerne-komponent er mest komplekse PlayerHQ-flate
- Redesign-prioritet: P2 (komponent eier kvaliteten)

### /portal/statistikk
- Fil: src/app/portal/statistikk/page.tsx
- Flate: Statistikk-hub (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: KPI-strip + A–K nivå-diagnose + trend + hub-shortcuts.
- Data vist: `Round` (score/SG/holeScores) → KPI (Snittscore/SG Total/Putts/GIR), `buildNivaaDiagnose` via `@/lib/domain/ak-kategori` (kategori/niva/snittscore/SG-gaps), trend (siste 10)
- Komponenter: `StatistikkHub` (`@/components/portal/statistikk/statistikk-hybrid`)
- Layout og hierarki: i komponent — identitetslinje, nivå-diagnose, KPI, trend, 6 hub-tiles.
- Tilstander: null → «–» i KPI; ingen runder i år → ingen nivå-diagnose (ærlig tom)
- Interaksjoner: hub-tiles → /analysere, /tren/tester, /tren/turneringer
- AK-domene vist: A–K-kategori/nivå, SG-gaps, GIR/putts
- Designfil-referanse: `PlayerHQ Statistikk-hub (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-rent (data-bygging i page, render i komp)
- Redesign-prioritet: P2

### /portal/statistikk/[metric]
- Fil: src/app/portal/statistikk/[metric]/page.tsx
- Flate: Statistikk drill-down per disiplin (desktop 1240px)
- Rolle/gating: requirePortalUser; notFound på ukjent metric
- Jobb: Detalj for 5 pyramide + 4 SG-disipliner (+ legacy-aliaser).
- Data vist: `sessionDrill`/`trainingPlanSession` (pyramid) ELLER `Round` SG-felt; 90d-trend, 30d-snitt+delta, topp-5 drills, SG-uke-tabell. **`benchmark`/«Snitt A1» og «Team Norway»-linje er hardkodede proxy-verdier.**
- Komponenter: inline (TrendChart SVG, Tile, EmptyForDiscipline)
- Layout og hierarki: header (tilbake + tittel + disabled periode-pills) → hero-stat (forest-gradient inline `var(--forest),var(--ink)`) + vs-benchmark + total/beste → trend-band → topp-5-drills (pyramid) / SG-uke-tabell (sg) → økt-sammendrag → coach-CTA «Be om mer fokus».
- Tilstander: notFound; EmptyForDiscipline når ingen data; periode-pills disabled (kun 90d virker)
- Interaksjoner: coach-CTA → /coach/melding?type=fokus
- AK-domene vist: pyramide-disipliner, SG-disipliner, A1-benchmark (proxy), treningstid
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: inkonsistent — periode-pills er dekorative (disabled), benchmark «A1»/«Team Norway» er hardkodede proxy-tall, forest-gradient inline; ellers rik
- Redesign-prioritet: P1

### /portal/statistikk/runder/[runId]/del
- Fil: src/app/portal/statistikk/runder/[runId]/del/page.tsx
- Flate: Del runde (shareable kort)
- Rolle/gating: requirePortalUser; notFound uten eierskap
- Jobb: Delbart runde-kort (score + SG + del-knapper).
- Data vist: `Round` (score/SG/notes/course), spiller (navn/initial/hcp/homeClub)
- Komponenter: `DelRundeClient` (lokal)
- Layout og hierarki: tynn wrapper; kort + del-UI i klientkomp.
- Tilstander: notFound
- AK-domene vist: SG-fordeling, score-relativ-par, HCP
- Designfil-referanse: «PlayerHQ 03 Del runde.html»
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P3

### /portal/stats
- Fil: src/app/portal/stats/page.tsx
- Flate: redirect → /portal/statistikk
- Rolle/gating: ingen — `permanentRedirect`. **Stub.**
- Redesign-prioritet: P3

### /portal/talent
- Fil: src/app/portal/talent/page.tsx
- Flate: Talent-hub (hybrid, mobil 512px)
- Rolle/gating: requirePortalUser
- Jobb: Talent-utviklingsvei — JourneyMap, MasteryRings, mål, streak, percentile, LevelLadder.
- Data vist: `talentTracking` (niva + 5 akser), `goal`, `round` (sgTotal), `trainingPlanSessionLog` (streak via `@/lib/streak`). **JOURNEY_STAGES + LEVEL_LADDER + nivaLabel-mapping er statiske demo-strukturer; «PRE-BETA»-banner sier eksplisitt demo-data.**
- Komponenter: inline (MasteryRing/JourneyIcon SVG)
- Layout og hierarki: hero (NIVÅ-badge) → JourneyMap → MasteryRings (3) → GoalProgress → Streak + PercentileGauge → LevelLadder → PRE-BETA-banner → 4 undersider-tiles.
- Tilstander: empty mål; PRE-BETA-stripe (ærlig demo-merking)
- Interaksjoner: tiles → mitt-niva/min-plan/roadmap/sammenligning
- AK-domene vist: A–K-nivå (NIVÅ-badge), talent-akser (1–10), SG-percentile (proxy), level-stige (B/C/D/E score-bånd — statisk)
- Designfil-referanse: `PlayerHQ Talent (hybrid).dc.html`
- Nåværende designkvalitet: inkonsistent — mye statisk demo (LEVEL_LADDER, journey-mapping), percentile-proxy; men ærlig PRE-BETA-merket. Bruker `var(--color-*)` (annet token-prefiks) + amber-utility-farger
- Redesign-prioritet: P1 (mye fabrikert struktur — vent på datamodell)

### /portal/talent/mitt-niva
- Fil: src/app/portal/talent/mitt-niva/page.tsx
- Flate: Talent · Mitt nivå (desktop 6xl)
- Rolle/gating: requirePortalUser PLAYER; returnerer null uten tracking
- Jobb: Spiller mot kohort-snitt (radar + bar per akse).
- Data vist: `talentTracking` (egen + kohort samme niva, ekskl. egen) → radar-serier + akse-forklaringer (statisk tekst)
- Komponenter: `TalentHero`, `RadarChart` (`@/components/portal/talent`)
- Layout og hierarki: TalentHero → radar + legend (deg vs kohort) → akse-detalj-grid (bar m/kohort-referanselinje).
- Tilstander: null hvis ingen tracking; kohort kan være 0
- AK-domene vist: 5 talent-akser, kohort-benchmark (ekte snitt fra DB)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte kohort-data
- Redesign-prioritet: P2

### /portal/talent/min-plan
- Fil: src/app/portal/talent/min-plan/page.tsx
- Flate: Talent · Min plan (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Spillerens utviklingsplan — akser, neste mål, milepæler.
- Data vist: `talentTracking` (akser, niva, klubb, region, inkludertFra, milepaeler-JSON parset trygt)
- Komponenter: inline (AxisCard); `AXIS_BAR` mapper akser → pyramide-tokens (`bg-pyr-*`)
- Layout og hierarki: tilbake → header (pulse-eyebrow + «Min *utviklingsplan*») → status-strip 2x2 → 5 akse-kort → neste-mål (lime-glød) → milepæler-tidslinje.
- Tilstander: null; empty milepæler; ingen-aktive-mål-tekst
- AK-domene vist: talent-akser farget per pyramide-token, milepæler, A–K-nivå
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent (bruker pyr-tokens)
- Redesign-prioritet: P2

### /portal/talent/roadmap
- Fil: src/app/portal/talent/roadmap/page.tsx
- Flate: Talent · Roadmap (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Utviklings-roadmap fra ekte sesongplan + milepæler.
- Data vist: `talentTracking` (milepaeler), `seasonPlan` (periodBlocks L-fase/focus, tournamentEntries). KPI-strip = ekte tellinger.
- Komponenter: inline; `LPHASE_NAVN`-mapping
- Layout og hierarki: PRE-BETA-stripe → tilbake → header → KPI-strip (Faser/Turneringer/Milepæler) → faser-liste (L-fase + periode + fokus) → turneringer → milepæler. Ærlige tom-tilstander.
- Tilstander: PRE-BETA; empty faser (CTA til planlegging); conditional turneringer/milepæler; full-tom-tekst
- AK-domene vist: L-faser (GRUNN/SPESIAL/TURNERING), turneringer, milepæler
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte data, ærlige empties (sterkere enn talent-hub)
- Redesign-prioritet: P2

### /portal/talent/sammenligning
- Fil: src/app/portal/talent/sammenligning/page.tsx
- Flate: Talent · Sammenligning (mobil 480px)
- Rolle/gating: requirePortalUser PLAYER; null uten tracking
- Jobb: Side-by-side mot annen spiller samme nivå + SG-delta over tid.
- Data vist: `talentTracking` (egen + kandidater + valgt motspiller), `round` SG (ny vs gammel periode via `?periode=30d|90d|1ar`). Anonymiser-pref fra `user.preferences`.
- Komponenter: `RadarChart`, `AnonymiserToggle` (lokal), inline (CompareAxis/SgDeltaKort/PeriodePicker)
- Layout og hierarki: tilbake → header + AnonymiserToggle → søk/velg-form → overlapping radar + legende → akser side-om-side → SG-delta-kort (periode-picker).
- Tilstander: null; ingen-treff; ingen-valgt-prompt; delta «—» uten data
- Interaksjoner: form (q/spiller); periode-pills (URL); Anonymiser-toggle
- AK-domene vist: talent-akser, SG-delta (Totalt/APP/ARG/PUTT), kohort
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent, ekte data + personvern
- Redesign-prioritet: P2

### /portal/trackman/[sessionId]
- Fil: src/app/portal/trackman/[sessionId]/page.tsx
- Flate: TrackMan-økt detalj (hybrid)
- Rolle/gating: requirePortalUser; eierskap/ADMIN/COACH-sjekk
- Jobb: Alle shots fra én TrackMan-økt + KPI + SG-proxy.
- Data vist: `trackManSession.rawJson` → mappet shots (club/CS/ballfart/smash/carry/avvik/spinn/launch). **`sgEstimate = (smash-1.44)*8` proxy; environment temp/wind = null (ingen kilde).**
- Komponenter: `PlayerHero`, `TrackManSessionClient` (.Filter/.Actions)
- Layout og hierarki: tilbake → empty-tilstand ELLER PlayerHero → environment-strip (conditional) → snitt-KPI (carry/ballfart/smash) → utvidet KPI-strip → SG-estimat-kort → shot-tabell (terminal data-table) → actions.
- Tilstander: empty («Fant ingen slag») når ukjent/0-shots; DB-nede-fallback (try/catch)
- Interaksjoner: filter, eksport CSV/slett/sammenlign (i client); lenker → /portal/mal/trackman (utenfor scope)
- AK-domene vist: TrackMan-metrikker, smash-baseline 1.44, SG-proxy
- Designfil-referanse: `PlayerHQ TrackMan Detalj (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-rent; SG-estimat ærlig merket «proxy»; tilbake-lenker peker til /portal/mal/trackman (utenfor denne scope)
- Redesign-prioritet: P2

### /portal/trening/logg
- Fil: src/app/portal/trening/logg/page.tsx
- Flate: Logg treningsøkt (skjema)
- Rolle/gating: **`"use client"` — INGEN auth-guard i page** (API-ruten `/api/portal/trening/logg` antas å gate)
- Jobb: Manuell logging av SG-område + varighet + drill + kvalitet + notat.
- Data vist: ingen henting; POST til `/api/portal/trening/logg`. SgCategory-områder (OTT/APP/ARG/PUTT).
- Komponenter: ingen delte — rå `<input>/<button>` med basis-Tailwind (`border rounded`, ikke DS-komponenter)
- Layout og hierarki: «Logg treningsøkt» → dato → område-knapper → varighet-slider → drill → kvalitet 1–5 → notat → lagre. max-w md.
- Tilstander: lagrer/feil; ingen empty
- Interaksjoner: submit → /portal/gjennomfore
- AK-domene vist: SG-kategori (OTT/APP/ARG/PUTT)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stygg — generisk skjema, rå border/rounded uten DS-komponenter eller athletic-stil; ingen eyebrow/hero; bryter med resten av PlayerHQ
- Redesign-prioritet: P1

### /portal/trening/break-tabell
- Fil: src/app/portal/trening/break-tabell/page.tsx
- Flate: Break-tabell (putting)
- Rolle/gating: ingen i page (`BreakTabellClient` antas gate/eller offentlig verktøy)
- Jobb: Putting break-tabell-verktøy. **Stub-wrapper.**
- Data vist: ingen i page; alt i `BreakTabellClient` (lokal)
- Komponenter: `BreakTabellClient`
- Tilstander: i client
- AK-domene vist: putting-break (i client)
- Nåværende designkvalitet: UVERIFISERT (alt i client)
- Redesign-prioritet: P2

### /portal/trening/putte-laboratoriet
- Fil: src/app/portal/trening/putte-laboratoriet/page.tsx
- Flate: Putte-laboratoriet
- Rolle/gating: ingen i page
- Jobb: Putting-lab-verktøy. **Stub-wrapper.**
- Data vist: ingen i page; `PutteLaboratorietClient` (lokal)
- Komponenter: `PutteLaboratorietClient`
- AK-domene vist: putting (i client)
- Nåværende designkvalitet: UVERIFISERT (alt i client)
- Redesign-prioritet: P2

### /portal/utfordringer
- Fil: src/app/portal/utfordringer/page.tsx
- Flate: Utfordringer-liste
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Drill-challenges (Aktive/Tidligere) man eier eller deltar i.
- Data vist: `drillChallenge` (owner/participants, status ACTIVE/ENDED, min rank/score)
- Komponenter: `EmptyState`, inline UtfordringKort
- Layout og hierarki: editorial header (eyebrow + «Mine *utfordringer*» + «+ Ny») → Aktive-grid → Tidligere-grid. Kort: status-dot + Eier-badge + deltaker/plassering-KPI + deadline.
- Tilstander: empty (EmptyState + CTA); conditional Tidligere
- Interaksjoner: kort → /utfordringer/[id]; «+ Ny»
- AK-domene vist: drill-challenge-leaderboard
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent. NB: bruker `style={{ fontFamily: "'Inter Tight'...", fontStyle:"italic" }}` inline (heller enn `font-display italic`-klasse) — mønster gjentas på flere editorial-titler
- Redesign-prioritet: P2

### /portal/utfordringer/[id]
- Fil: src/app/portal/utfordringer/[id]/page.tsx
- Flate: Utfordring-detalj + resultatliste
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN; notFound
- Jobb: Detalj, score-innsending, leaderboard, bli-med/avslutt.
- Data vist: `drillChallenge` (owner/participants sortert rank/score, drill via drillId). Server-actions `bliMed`/`avsluttUtfordring`.
- Komponenter: `PlayerHero`, `EmptyState`, `ScoreForm` (lokal), inline Kpi
- Layout og hierarki: tilbake → PlayerHero (m/Bli med / Avslutt-actions) → beskrivelse → KPI (deltakere/startet/slutter) → ScoreForm (hvis deltaker+aktiv) → resultatliste (rank-chip + avatar + score).
- Tilstander: notFound; empty deltakere; eier vs deltaker; aktiv vs avsluttet
- Interaksjoner: bli med / avslutt (server-actions); score-skjema
- AK-domene vist: leaderboard/score
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/utfordringer/ny
- Fil: src/app/portal/utfordringer/ny/page.tsx
- Flate: Ny utfordring (6-stegs wizard)
- Rolle/gating: requirePortalUser PLAYER/COACH/ADMIN
- Jobb: Lag DrillChallenge — tittel/type/mål/frist/inviter/opprett.
- Data vist: venner via `friendship` (ACCEPTED), `exerciseDefinition` (take 200)
- Komponenter: `PlayerHero`, `NyUtfordringWizard` (lokal)
- Layout og hierarki: tilbake → PlayerHero → NyUtfordringWizard.
- Tilstander: i wizard
- AK-domene vist: drill-kobling, pyramide-area (i wizard)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/varsler
- Fil: src/app/portal/varsler/page.tsx
- Flate: Varsler (hybrid)
- Rolle/gating: requirePortalUser
- Jobb: Notification-feed gruppert I dag/Tidligere.
- Data vist: `notification` (type/title/link/readAt, take 100). Ikon-mapping per type (plan/drill/melding/turnering/booking/credit/ai osv.).
- Komponenter: inline (VarselRad/Seksjonskort), `VarslerMarkerKnapp` (lokal)
- Layout og hierarki: «Varsler *nå*» + «N nye»-pill + «Marker alle lest» → I dag-kort → Tidligere-kort → «Ingen eldre»-kort → full tom-tilstand. max-w 460/600px.
- Tilstander: full tom-tilstand; conditional seksjoner; ulest-styling (inline `rgba(209,248,67,.05)`)
- Interaksjoner: rad-lenker; marker alle lest (server-action via klient)
- AK-domene vist: varseltyper (TrackMan/SG/booking/credit/AI Caddie)
- Designfil-referanse: `PlayerHQ Varsler (hybrid).dc.html`
- Nåværende designkvalitet: ferdig — token-tro (én inline lime-rgba for ulest-bg)
- Redesign-prioritet: P2

### /portal/agent-pipeline
- Fil: src/app/portal/agent-pipeline/page.tsx
- Flate: Agent-pipeline (innsikt i AI-tolkning)
- Rolle/gating: requirePortalUser; ADMIN ser ekstra agent-runs
- Jobb: Vise signaler + plan-actions (+ admin agent-kjøringer).
- Data vist: `signal` (kind/value/computedAt), `planAction` (actionType/status/agentName/suggestion), `agentRun` (admin)
- Komponenter: `PlayerHero`, `EmptyState`, inline Th/Td (tabell + mobil-kort)
- Layout og hierarki: tilbake → PlayerHero «Hvordan *systemet* leser deg» → Signaler (desktop tabell / mobil kort) → Plan-actions (status-pills) → admin agent-runs.
- Tilstander: empty signaler/actions; admin-conditional
- Interaksjoner: ingen (lese-flate)
- AK-domene vist: signal-aggregater (SG/pyramide/streak), plan-actions (agent-forslag), cron-kjøringer
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-rent (litt teknisk/«rå» flate, men bevisst)
- Redesign-prioritet: P2

### /portal/reach
- Fil: src/app/portal/reach/page.tsx
- Flate: Reach & Engagement (P2)
- Rolle/gating: requirePortalUser
- Jobb: Synlighet/connections/personvern — **ingen datamodell ennå → ærlig tom-tilstand.**
- Data vist: ingen (modell finnes ikke; tidligere hardkodede tall fjernet)
- Komponenter: `PlayerHero`, inline empty
- Layout og hierarki: PlayerHero «Hvem ser *reisen* din?» + Personvern-action → tom-tilstand-kort.
- Tilstander: kun tom-tilstand
- Interaksjoner: → /portal/meg/innstillinger
- AK-domene vist: ingen
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — ærlig tom (foreldreløs? — sjekk nav-lenking)
- Redesign-prioritet: P3 (vent på modell)

### /portal/spiller/[spillerId]
- Fil: src/app/portal/spiller/[spillerId]/page.tsx
- Flate: Spiller-detalj (public profil, faner)
- Rolle/gating: requirePortalUser (kun innlogging); notFound
- Jobb: Public spillerprofil (Oversikt/Plan/Statistikk/Runder/Coaching).
- Data vist: `User` (navn/avatar/hcp/homeClub/playingYears/ambition), `Round` (10), aktiv `trainingPlan`, `coachingSession` (5), `goal` (5). Snittscore/SG-snitt beregnet.
- Komponenter: `SpillerDetaljClient` (lokal)
- Layout og hierarki: tynn server-wrapper; faner i klientkomp.
- Tilstander: notFound; null-felter håndtert
- AK-domene vist: SG-snitt, score, HCP, mål (HCP_TARGET/SG osv.), coaching-historikk
- Designfil-referanse: «01 Spiller-detalj.html»
- Nåværende designkvalitet: ferdig (wrapper)
- Redesign-prioritet: P2

### /portal/ny-okt
- Fil: src/app/portal/ny-okt/page.tsx
- Flate: Ny økt (4-stegs wizard, desktop 1240px)
- Rolle/gating: requirePortalUser; GRATIS→Pro-gate
- Jobb: Spiller bygger egen økt utenfor coach-plan.
- Data vist: ingen henting; `NyOktWizard` (lokal)
- Komponenter: `PlayerHero`, `EmptyState`, `NyOktWizard`
- Layout og hierarki: GRATIS: hero + EmptyState (Lock, «Krever Pro 300 kr/mnd») → ellers hero + NyOktWizard.
- Tilstander: GRATIS-gate
- AK-domene vist: drills/pyramide (i wizard)
- Designfil-referanse: `public/design/batch3/ny-okt-wizard.html` (NB: `public/design/`, ikke design-handover — kan være eldre referanse)
- Nåværende designkvalitet: ferdig (wrapper); fil-doc refererer `public/design/batch3/` (utenfor godkjent design-handover-kilde)
- Redesign-prioritet: P2

### /portal/onskeligokt
- Fil: src/app/portal/onskeligokt/page.tsx
- Flate: Be om økt (hybrid, 820px)
- Rolle/gating: requirePortalUser
- Jobb: Send ønske om økt til coach.
- Data vist: `User` (COACH); `?sent` for kvittering
- Komponenter: `OnskeligOktForm` (lokal)
- Layout og hierarki: tilbake → «Be om *økt*» + «{coach} svarer innen 24 timer» → sendt-banner → OnskeligOktForm. min-h-screen.
- Tilstander: sendt-banner
- Interaksjoner: form-submit → SessionRequest
- AK-domene vist: ingen
- Designfil-referanse: hybrid-design 2026-06-17
- Nåværende designkvalitet: ferdig — token-rent
- Redesign-prioritet: P2

### /portal/onskeligokt/bekreftet
- Fil: src/app/portal/onskeligokt/bekreftet/page.tsx
- Flate: Ønske bekreftet (status-tidslinje)
- Rolle/gating: requirePortalUser
- Jobb: Kvittering + status-tidslinje for siste SessionRequest.
- Data vist: siste `sessionRequest` (status/reason/preferredArea/preferredDate, coach). Status styrer tidslinje-steg.
- Komponenter: inline (buildSteps tidslinje, SumRow)
- Layout og hierarki: tom-tilstand (ingen request) ELLER hero (Send-ikon + «*Sendt til coach*») → ditt-ønske-sammendrag (kun ekte felter) → tidslinje (Du sendte/Coach foreslår/Du bekrefter/Booket — status-styrt) → handlinger → ref-nr.
- Tilstander: ekte tom-tilstand (ingen request); status-flyt (APPROVED/DECLINED/CANCELLED)
- AK-domene vist: preferredArea (FYS/TEK/SLAG/SPILL/TURN), SessionRequest-status
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: ferdig — token-tro, ekte data + ærlige steg. NB: `bg-[var(--color-pyr-spill-track)]` arbitrary-value + én italic via inline-style
- Redesign-prioritet: P2

---

## Tverrgående funn (for orkestrator)

1. **Token-drift (hardkodet hex/rgba i inline `style`)** — gjentas i: kalender (Gantt-farger), talent-hub (color-mix/amber), coach/sg-hub (`#7BA428`/`#1A7D56`/`#A32D2D`), coach/ovelser + videoer (forest-gradient `#2f5a2c,#0a2417` + lime-grid `rgba(209,248,67,...)`), coach/plans[detalj] (`#b5d629`), booking/anlegg (hero-gradient), statistikk/[metric] (forest-gradient), booking/[bookingId] (egen `booking.css` `bk-`-klasser + `#4A5418`). Bryter designsystem.md-regelen «ingen hardkodet hex».
2. **Navne-kanon-brudd** — `coach/melding/ny` hardkoder «Hans Brennum/Linn Knutsen/Espen Søvik/Anders K.» (mot Øyvind/Anders-kanon). `coach/ovelser`, `coach/videoer`, `coach/plans` hardkoder «Anders» i tittel (skal avledes fra DB-coach).
3. **Statiske/fabrikerte tall presentert som ekte** — coach/[coachId] (rating 4,9 / snittsvar 4 t / MORAD-sertifiseringer), coach/sg-hub (COACH_SG-referanse), statistikk/[metric] («Snitt A1»/«Team Norway»-benchmark), talent-hub (LEVEL_LADDER/journey/percentile-proxy), booking/[bookingId] (MÅL/UTSTYR/TIMELINE), coach/notes/[id] (TAGS).
4. **«AgencyOS»-eyebrow på /portal-ruter** — coach/ovelser/ny, .../rediger, coach/plans/[id]/ny-okt bruker `eyebrow="AgencyOS · ..."` på spiller-portalen (disse er coach-only, men ligger under /portal).
5. **`/portal/mal/*`-lenker** fra coach/sg-hub, drills/[id] og trackman peker inn i /portal/mal (utenfor denne scope — annen agent eier de skjermene).
6. **Avvikende skjemastil** — `trening/logg` bruker rå `border rounded`-skjema uten DS/athletic-komponenter; eneste PlayerHQ-skjerm som ikke følger editorial-hybrid-stilen.
7. **Mulige foreldreløse/legacy** — `analyse`/`stats` er rene redirects; `reach` er tom (modell mangler); flere coach-only-skjermer ligger under /portal men gates på COACH/ADMIN.
