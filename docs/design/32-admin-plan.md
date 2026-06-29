# AgencyOS planlegging/Workbench — skjermkort (kode-verifisert 2026-06-29)

30 ruter under planleggings-/Workbench-flatene i AgencyOS (mørkt tema). To rene AgencyOS-idiomer dominerer: nyere ruter bruker `AgPage`/`AgPageHead` (drills, plans-liste, plan-templates, workspace/oppgaver, tildelt-meg), eldre/detalj-ruter bruker `DetailShell`/`AdminHero`/`HubFrame` + manuelle hex-gradient-hero-er. Største gjeld: (1) **5 av 30 ruter er rene redirects** (`plans/templates/*`, `planlegge`, `coach-workbench`) — all planlegging er kanalisert til `/admin/spillere/[id]/workbench` (utenfor dette scopet), så denne mappa er for det meste *underlags-flater*, ikke selve Workbench; (2) **`workspace/*`-flatene bruker lyse cream-gradienter** (`from-[#FBFAF5]`, `from-secondary/40`) og hardkodede tailwind-farger (`amber-`, `emerald-`) — bryter AgencyOS-mørkt og token-disiplinen; (3) tung bruk av **sample/hardkodet demo-data** i `gjennomfore/okter/[id]`, `workspace/oppgaver/[id]` og dels `workspace/notion`.

---

### /admin/plans
- Fil: `src/app/admin/plans/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Kanban-oversikt over alle treningsplaner gruppert i Utkast/Aktiv/Fullført.
- Data vist (felt → kilde): plan-navn, spiller, %/uke-spenn/status-meta → `prisma.trainingPlan` (status, startDate, endDate, sessions, user); `template-placeholder`-bruker filtreres bort; tallord-tittel.
- Komponenter: `AgPage`, `AgPageHead`, `agBtnClass` (`@/components/admin/agencyos/ui`); ellers lokal markup. `ukenummer` (`@/lib/uke-helpers`).
- Layout og hierarki: PageHead (eyebrow «Planlegge · Treningsplaner» + tittel + lead) m/ to CTA-er: «Maler» (ghost → `/admin/plan-templates`) og primær «Ny plan». 3-kolonners kanban; topp-kort i Aktiv får lime venstre-kant.
- Tilstander: empty per kolonne («Ingen planer her») finnes. loading/error MANGLER (force-dynamic, ingen suspense).
- Interaksjoner: kort → `/admin/plans/{id}`; «Ny plan» → `/admin/spillere/{userId}/workbench` (dagens økt → første aktive spillerplan → fallback `/admin/spillere`). Drag-and-drop NOT portet (statisk, lead lover «dra»).
- AK-domene vist: %-gjennomføring, uke-spenn; ingen pyramide/L-fase/SG på kort-nivå.
- Designfil-referanse: fasit `agencyos-app/screens-ops.jsx` → TrainingPlansScreen (referert i fil-doc; ingen `.dc.html` funnet).
- Nåværende designkvalitet: ferdig — port av fasit. Mismatch: lead «Dra planer mellom faser» men ingen drag finnes (tekst lover ufiksert interaksjon).
- Redesign-prioritet: P2

### /admin/plans/new
- Fil: `src/app/admin/plans/new/page.tsx` (+ `plan-builder-client.tsx`)
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Plan-builder-wizard (klient) for å lage ny plan med disiplin-akse-fordeling.
- Data vist (felt → kilde): spillere (id/navn/hcp) + grupper (navn/medlemstall) → `prisma.user`/`prisma.group`. Klient definerer akser FYS/TEK/SLAG/SPILL/TURN med hardkodede hex (`#005840`, `#B8852A`, `#2563EB` …) i `plan-builder-client.tsx`.
- Komponenter: `PlanBuilderClient` (lokal).
- Layout og hierarki: hele skjermen er klient-wizard (ikke lest i detalj her).
- Tilstander: UVERIFISERT (klient-fil ikke fulllest).
- Interaksjoner: bygger plan; **denne ruta lenkes IKKE fra `/admin/plans`** (fasit-beslutning: «Ny plan» går til Workbench) → potensielt foreldreløs/utdatert inngang.
- AK-domene vist: pyramide-akser FYS/TEK/SLAG/SPILL/TURN (hardkodet hex — token-brudd).
- Designfil-referanse: ingen prototype referert.
- Nåværende designkvalitet: inkonsistent — hardkodede pyramide-hex i klient (skal være tokens), og ruta er drop-off siden Workbench overtok plan-opprettelse.
- Redesign-prioritet: P1 (avklar om ruta skal leve; fiks token-brudd)

### /admin/plans/[planId]
- Fil: `src/app/admin/plans/[planId]/page.tsx`
- Flate: AgencyOS (mørkt, `DetailShell`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Full plan-detalj med faner Oversikt/Øvelser/Notater/Rapport, fase-timeline og pyramide-fordeling.
- Data vist (felt → kilde): plan + user (navn/hcp/tier), sessions m/ drills+exercise+log → `prisma.trainingPlan.findUnique`. KPI: total tid/økter/gjennomføring/SG («—», «Krever round-data»). Faser bygges per kalenderuke (`buildFaser`). Pyramide via `aggregateByArea`/`prosentPerArea` (`@/lib/pyramide`).
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`, `EmptyState`, `AgentStrip` (`@/components/coachhq/agent-strip`); lokale `_faser`/`_timeline`/`_phase-card`/`_kpi-card`/`_pyramide-fordeling`/`_completed-sessions`/`PlanActions`/`DraggableSessions`/`RejectedBanner`; `AddSessionModal` (`@/components/admin/add-session-wizard`).
- Layout og hierarki: DetailShell (breadcrumb Planer → plan, back, statusPill = `PlanStatus`, KPI-rad, fane-nav). Oversikt: 1.3fr/1fr — venstre fase-kort, høyre KPI + pyramide + fullførte + draggable «Kommende økter». Øvelser/Notater/Rapport-faner.
- Tilstander: empty (ingen økter/øvelser/notater) finnes; REJECTED-banner; loading/error MANGLER.
- Interaksjoner: faner via `?tab=`; «Legg til økt» (modal); drag for å flytte økter; PlanActions (aktiver/kopier/tildel med konflikt-detektor). Coach-feedback på fullførte økter.
- AK-domene vist: pyramide-fordeling, L-fase (i `DraggableSession`), CS (`csAchieved`), fase-periodisering per uke, SG-placeholder («—»).
- Designfil-referanse: ingen prototype referert (rik egen-flate).
- Nåværende designkvalitet: ferdig/rik — mest komplette planleggings-detaljen. Notater-fane viser spiller-notater-overskrift men rendrer tom rad (kun tittel/dato, ingen `notes`-tekst) — halvferdig seksjon.
- Redesign-prioritet: P2

### /admin/plans/templates  →  /admin/plan-templates
- Fil: `src/app/admin/plans/templates/page.tsx`
- Stub: `permanentRedirect("/admin/plan-templates")`. Ingen UI.
- Redesign-prioritet: P3

### /admin/plans/templates/ny  →  /admin/plan-templates/ny
- Fil: `src/app/admin/plans/templates/ny/page.tsx`
- Stub: `permanentRedirect("/admin/plan-templates/ny")`.
- Redesign-prioritet: P3

### /admin/plans/templates/[id]/rediger  →  /admin/plan-templates/[id]/rediger
- Fil: `src/app/admin/plans/templates/[id]/rediger/page.tsx`
- Stub: redirect med id-passthrough.
- Redesign-prioritet: P3

### /admin/plans/templates/[id]/effectiveness  →  /admin/plan-templates/[id]/effectiveness
- Fil: `src/app/admin/plans/templates/[id]/effectiveness/page.tsx`
- Stub: redirect med id-passthrough.
- Redesign-prioritet: P3

---

### /admin/plan-templates
- Fil: `src/app/admin/plan-templates/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Bibliotek av gjenbrukbare plan-maler som tiles.
- Data vist (felt → kilde): mal-navn, `usageCount` («Brukt N×»), `kategori`, `varighetUker`, L-fase-label, `_count.sessions` → `prisma.planTemplate`. Tallord-tittel.
- Komponenter: `AgPage`, `AgPageHead`, `agBtnClass`; ikon per L-fase (`Sprout`/`Target`/`Trophy`).
- Layout og hierarki: PageHead (eyebrow «Planlegge · Plan-maler» + «Ny mal»-CTA) + 3-kol tile-grid (L-fase-ikon i secondary-boks + navn + meta).
- Tilstander: empty («Ingen maler ennå») finnes. loading/error MANGLER.
- Interaksjoner: tile → `/admin/plan-templates/{id}`; «Ny mal» → `/admin/plan-templates/ny`.
- AK-domene vist: L-fase (GRUNN/SPESIAL/TURNERING via ikon+label), NGF-kategori, varighet i uker.
- Designfil-referanse: fasit `agencyos-app/screens-ops.jsx` → PlanTemplatesScreen.
- Nåværende designkvalitet: ferdig — ren port.
- Redesign-prioritet: P3

### /admin/plan-templates/[id]
- Fil: `src/app/admin/plan-templates/[id]/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Mal-detalj med metadata, disiplin-fordeling og øktliste.
- Data vist (felt → kilde): mal + sessions (ukeNr/dagNr/title/varighetMin/pyramidArea/skillArea/environment/focus/drills) → `prisma.planTemplate.findUnique`; drill-navn resolves via `exerciseDefinition`; `disciplinFordeling` + `ANBEFALT_FORDELING_PER_KATEGORI`.
- Komponenter: `AdminHero` (alias PageHeader), `TemplateDetail` (`@/components/admin/plan-templates/template-detail`), shared-helpere (`readDrills`/`readFordeling`/`FASE_LABEL`).
- Layout og hierarki: tilbake-lenke → bibliotek; PageHeader (eyebrow «NGF-KATEGORI {kat} · {FASE} · {N} UKER», navn med siste-ord-italic); `TemplateDetail`-kropp.
- Tilstander: `notFound()` ved manglende mal; øvrige tilstander i `TemplateDetail` (UVERIFISERT).
- Interaksjoner: i `TemplateDetail` (UVERIFISERT, sannsynlig rediger/effekt-lenker).
- AK-domene vist: NGF-kategori, L-fase, pyramide-disiplin-fordeling vs. anbefalt, ukentlig øktantall, alders-range.
- Designfil-referanse: ingen prototype referert.
- Nåværende designkvalitet: ferdig (avhengig av `TemplateDetail`-kvalitet).
- Redesign-prioritet: P2

### /admin/plan-templates/ny
- Fil: `src/app/admin/plan-templates/ny/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Opprett ny mal fra blankt skjema (metadata først, økter etterpå).
- Data vist (felt → kilde): ingen loader; `NewTemplateForm` (klient) holder feltene.
- Komponenter: `AdminHero`, `NewTemplateForm` (`@/components/admin/plan-templates/new-template-form`).
- Layout og hierarki: tilbake-lenke + PageHeader («Opprett mal») + skjema.
- Tilstander: i skjemaet (UVERIFISERT).
- Interaksjoner: opprett mal → trolig redirect til detalj/rediger (UVERIFISERT).
- AK-domene vist: forventet kategori/L-fase/fordeling-felt (i `NewTemplateForm`, UVERIFISERT).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: tynn shell (skjema bærer alt).
- Redesign-prioritet: P3

### /admin/plan-templates/[id]/rediger
- Fil: `src/app/admin/plan-templates/[id]/rediger/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Editor for mal + enkeltøkter med drill-valg.
- Data vist (felt → kilde): mal + sessions + alle `exerciseDefinition` (drillOptions m/ pyramidArea/skillArea) → Prisma; `readDrills`/`readFordeling`.
- Komponenter: `AdminHero`, `TemplateEditor` (`@/components/admin/plan-templates/template-editor`).
- Layout og hierarki: tilbake-lenke → mal-detalj; PageHeader («Rediger: {navn}»); `TemplateEditor`.
- Tilstander: `notFound()`; øvrige i editor (UVERIFISERT).
- Interaksjoner: lagre innstillinger separat fra øktendringer (per sub-tekst).
- AK-domene vist: pyramide-/skill-tagget drill-valg, L-fase, fordeling.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (editor-tung).
- Redesign-prioritet: P2

### /admin/plan-templates/[id]/effectiveness
- Fil: `src/app/admin/plan-templates/[id]/effectiveness/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Effekt-analyse av mal: pre/post SG-deltas, completion, ratings + trendgraf.
- Data vist (felt → kilde): `prisma.planEffectiveness` (sgTotal/Ott/App/Arg/Putt-delta, completionRate, self/coachRating, notes, plan, user) + mal-metadata. KPI: brukt totalt, snitt completion, snitt SG-Total, snitt SG-Putt. Trend: snitt SG-Total-delta per måned (lokal SVG-løs bar-graf).
- Komponenter: `AdminHero`, lokal `KpiCard` + lokal bar-graf + tabell.
- Layout og hierarki: tilbake → rediger; PageHeader; KPI-strip (4); trendgraf; tabell «Detaljer per plan» (SG-T/OTT/APP/ARG/PUTT-kolonner, delta-farget).
- Tilstander: `notFound()`; tom-tabell («Ingen fullførte planer …»); trend skjules ved 0 rader. loading/error MANGLER.
- Interaksjoner: spiller-lenke → `/admin/spillere/{id}?tab=treningsplan`; plan-lenke → `/admin/plans/{id}`.
- AK-domene vist: SG-deltas per kategori (OTT/APP/ARG/PUTT/Total), completion-rate, NGF-kategori, L-fase, self/coach-rating.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — eneste flaten i scopet med ekte SG-delta-visning.
- Redesign-prioritet: P2

---

### /admin/planlegge
- Fil: `src/app/admin/planlegge/page.tsx`
- Stub/redirect: COACH/ADMIN-gate → `redirect("/admin/spillere/{førsteSpiller}/workbench")` (fallback `/admin/spillere`). Ingen UI. Håndhever låst regel «planlegging bor i Workbench».
- Redesign-prioritet: P3

### /admin/coach-workbench
- Fil: `src/app/admin/coach-workbench/page.tsx`
- Stub/redirect: legacy prototype → `redirect` til `/admin/spillere/{?spiller||førsteSpiller}/workbench`. Ingen UI.
- Redesign-prioritet: P3

---

### /admin/workspace
- Fil: `src/app/admin/workspace/page.tsx`
- Flate: AgencyOS (men **lys cream-hero**, se gjeld)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): «Min uke» — oppgaver fordelt på I dag / Denne uka / Senere med brenner-strip.
- Data vist (felt → kilde): tasks → `getTasksForUser` (`@/lib/notion/queries`; OppgaveCache/Notion-sync, faller til SAMPLE_TASKS i dev). Avledede teller (åpne/i dag/blokkert/delt). «Denne uka»-kolonne bruker hardkodede dag-labels (`Onsdag 29`, `Torsdag 30`…) + pseudo-fordeling.
- Komponenter: `WorkspaceHero`, `WorkspaceTabs`, `TaskRow` (`@/components/workspace/primitives`); lokale `ColumnHeader`/`DenneUkaList`/`EmptyStatePreview`; `WorkspaceHeaderActions`/`LeggTilOppgaveButton`/`BrennerStrip`.
- Layout og hierarki: WorkspaceHero (eyebrow + KPI-strip) → WorkspaceTabs → brenner-strip → 3-kol grid.
- Tilstander: EmptyStatePreview alltid synlig (demo); empty per kolonne implisitt. loading/error MANGLER.
- Interaksjoner: «Vis alle N» → `/admin/workspace/oppgaver`; task-rader; legg-til-oppgave.
- AK-domene vist: ingen golf-domene (intern oppgavestyring på tvers av selskaper).
- Designfil-referanse: Claude Design-bundle `_SEBg4QyodvbW2k06JWiGw` (`workspace/s1-workspace-min-uke.jsx`).
- Nåværende designkvalitet: inkonsistent — hardkodede dag-labels («Onsdag 29») + alltid-synlig demo-empty-state; ikke AgencyOS-mørkt (deler workspace-flatens lyse idiom).
- Redesign-prioritet: P1

### /admin/workspace/oppgaver
- Fil: `src/app/admin/workspace/oppgaver/page.tsx`
- Flate: AgencyOS (`AgPage`, mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Oppgaveliste med Liste/Kanban/Kalender-visninger og filter.
- Data vist (felt → kilde): tasks → `getTasksForUser`; teller (alle/todo/doing/done/blokkert) avledet. Avatar-navn fra `SAMPLE_PEOPLE`.
- Komponenter: `AgPage`/`AgPageHead`; workspace-primitives (`WorkspaceTabs`, `StatusPill`, `PrioDot`, `DueDate`, `AvatarStack`, `ProjectPill`, `VisibilityPill`, `SourceBadge`, `TaskCheck`); lokale `oppgaver-actions`.
- Layout og hierarki: PageHead (åpne-teller) + ViewToggle + WorkspaceTabs + sticky filterbar (søk readOnly) + valgt visning.
- Tilstander: `EmptyTasks` finnes; søk er readOnly (ikke-funksjonell). loading/error MANGLER.
- Interaksjoner: `?view=liste|kanban|kalender`; filter-piller (delvis dekorativ); ny oppgave.
- AK-domene vist: ingen golf-domene; selskaps-fargede prosjekt-piller (AK/Mulligan/WANG/Skarpnord).
- Designfil-referanse: del av samme workspace-bundle.
- Nåværende designkvalitet: ferdig men søk/flere filtre er ikke-funksjonelle; kalender-fordeling er pseudo (`idx % 7`).
- Redesign-prioritet: P2

### /admin/workspace/oppgaver/[id]
- Fil: `src/app/admin/workspace/oppgaver/[id]/page.tsx`
- Flate: AgencyOS (**lys cream-hero**)
- Rolle/gating: COACH/ADMIN + synlighet-sjekk (PRIVAT → NoAccessFallback hvis ikke ADMIN/tildelt AK).
- Jobb (1 setning): Task-detalj med beskrivelse, sub-tasks, aktivitet og metadata-sidebar.
- Data vist (felt → kilde): task → `getTasksForUser` (finn på id, fallback første). **Mye er hardkodet demo:** `ACTIVITY_FEED`, `SUB_TASKS`, beskrivelse, «OPPRETTET 22.05», tagger, «4 t igjen», estimat.
- Komponenter: workspace-primitives + `AthleticButton`; lokal `MetaCell`/`NoAccessFallback`.
- Layout og hierarki: mini-hero (tilbake + Åpne i Notion) → 1.6fr/1fr: venstre beskrivelse/sub-tasks/aktivitet, høyre metadata-sidebar (status/prioritet/prosjekt/forfaller/tildelt/estimat/tagger).
- Tilstander: `notFound()`; NoAccessFallback (privat) finnes. loading/error MANGLER.
- Interaksjoner: status/prioritet/synlighet-velgere (uten persistens her); kommentar-felt; «Åpne i Notion».
- AK-domene vist: ingen golf-domene.
- Designfil-referanse: bundle `_SEBg4QyodvbW2k06JWiGw` (`workspace/s3-task-detalj.jsx`).
- Nåværende designkvalitet: stygg/inkonsistent ift. AgencyOS-mørkt: lys gradient-hero (`from-[#FBFAF5]`), hardkodede `amber-600`/`emerald-700`-farger, og nesten alt innhold er statisk demo (ikke koblet til ekte task).
- Redesign-prioritet: P1

### /admin/workspace/prosjekter
- Fil: `src/app/admin/workspace/prosjekter/page.tsx`
- Flate: AgencyOS (**lys secondary-gradient-hero**)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Prosjekt-grid per selskap med fremdrift og filter.
- Data vist (felt → kilde): projects → `getProjectsForUser` (ProsjektCache/Notion, SAMPLE_PROJECTS i dev); status-teller; avatar fra `SAMPLE_PEOPLE`.
- Komponenter: `AthleticButton`/`AthleticEyebrow`; workspace-primitives (`AvatarStack`, `VisibilityIcon`, `WorkspaceTabs`, `getCompanyBar`); lokale `FilterChip`/`StatusBadge`/`ProjectCard`/`NewProjectCard`/`EmptyProjects`.
- Layout og hierarki: hero (eyebrow + tittel + teller + Notion/Nytt prosjekt) → WorkspaceTabs → filter-strip (søk ikke-funksjonell) → 3-kol grid m/ cover-strip i selskapsfarge.
- Tilstander: `EmptyProjects` finnes; søk readOnly. loading/error MANGLER.
- Interaksjoner: `?filter=alle|aktive|pause|arkiv`; kort hover (ingen detalj-rute koblet — kortene er ikke lenker); «Nytt prosjekt».
- AK-domene vist: ingen golf-domene.
- Designfil-referanse: workspace-bundle.
- Nåværende designkvalitet: inkonsistent — lys gradient-hero + hardkodet `success`/`warning`-token-blanding ok, men `bg-gradient from-secondary/40` bryter mørk canvas; kort uten klikk-destinasjon.
- Redesign-prioritet: P2

### /admin/workspace/tildelt-meg
- Fil: `src/app/admin/workspace/tildelt-meg/page.tsx`
- Flate: AgencyOS (`AgPage`, mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Samlet liste over alt som venter på handling fra coachen.
- Data vist (felt → kilde): `prisma.planAction` (PENDING-godkjenninger), `prisma.sessionRequest` (PENDING), `prisma.trainingPlan` (DRAFT), `getTasksForUser` (dagens). Maks 7 elementer; tallord-tittel.
- Komponenter: `AgPage`/`AgPageHead`; ren lokal liste.
- Layout og hierarki: PageHead («N ting til deg») + smal liste (760px) med ikon/tittel/meta/chevron.
- Tilstander: empty («Ingenting venter …») finnes. loading/error MANGLER.
- Interaksjoner: rader → `/admin/godkjenninger`, `/admin/foresporsler`, `/admin/plans/{id}`, `/admin/workspace/oppgaver`.
- AK-domene vist: plan-godkjenninger/utkast (TrainingPlan), booking-forespørsler — golf-adjacent men ikke pyramide/SG.
- Designfil-referanse: fasit `agencyos-app/screens-analyze.jsx` → AssignedScreen.
- Nåværende designkvalitet: ferdig — ekte aggregering, mørkt, ren.
- Redesign-prioritet: P3

### /admin/workspace/notion
- Fil: `src/app/admin/workspace/notion/page.tsx`
- Flate: AgencyOS (**lys cream-hero**)
- Rolle/gating: COACH/ADMIN; konfig kun ADMIN.
- Jobb (1 setning): Notion-tilkobling: empty (oppsett-veiviser) vs. connected (databaser/feltkartlegging/synlighet/historikk).
- Data vist (felt → kilde): `getNotionConnectionForUser` (workspace, databaser, lastSync); `ensureNotionConnection` (auto-bootstrap); `NOTION_INTERNAL_TOKEN`-sjekk. **Feltkartlegging + sync-historikk er hardkodet demo** (statiske rader).
- Komponenter: `AthleticButton`/`AthleticEyebrow`; workspace-primitives (`SourceBadge`, `WorkspaceTabs`, `VisibilityPill`); lokal `NotionLogo`/`EmptyState`/`ConnectedState`.
- Layout og hierarki: hero (m/ dev-state-toggle empty/connected) → WorkspaceTabs → empty (3-stegs oppsett) eller connected (status-card + databaser + feltkartlegging + default-synlighet + sync-historikk + AI-hint).
- Tilstander: empty/connected/ikke-ADMIN/error-banner/race-condition («konfigurerer…») — rikt dekket.
- Interaksjoner: «Synk nå» (POST `/api/notion/sync`); «Åpne Notion-integrasjoner»; dev-toggle.
- AK-domene vist: ingen golf-domene.
- Designfil-referanse: bundle `_SEBg4QyodvbW2k06JWiGw` (`workspace/s5-notion-config.jsx`).
- Nåværende designkvalitet: inkonsistent — lys gradient + hardkodede `amber-`/`emerald-`-Tailwind-farger; sync-historikk/feltkartlegging er statisk demo (ser ekte ut, er det ikke).
- Redesign-prioritet: P1

---

### /admin/teknisk-plan
- Fil: `src/app/admin/teknisk-plan/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Oversikt over teknisk plan-status (TEK-økter) per spiller + tilgjengelige maler.
- Data vist (felt → kilde): spillere m/ aktiv plan og TEK-økter (`pyramidArea: "TEK"`) → `prisma.user`; godkjente maler → `prisma.planTemplate`. Per rad: HCP, aktiv-plan, TEK-økter/tid, TEK-fullført-%.
- Komponenter: `AdminHero`, `EmptyState`, lokale `*-actions` (NyTekniskPlanMal/SeAllePlanMaler/BrukMal).
- Layout og hierarki: PageHeader («Teknisk Plan») → tabell (spiller/plan/TEK-økter/fullført/handling) → maler-grid.
- Tilstander: empty (ingen spillere / ingen maler) finnes. loading/error MANGLER.
- Interaksjoner: rad-handling → `/admin/teknisk-plan/{id}`; plan-lenke → `/admin/plans/{planId}`; «Bruk mal».
- AK-domene vist: pyramide-disiplin TEK (filtrering), HCP, fullførings-%, L-fase via maler.
- Designfil-referanse: ingen prototype (eyebrow «Verktøy»).
- Nåværende designkvalitet: ferdig/funksjonell tabell; eyebrow «Verktøy» avviker fra «Planlegge»-vokabularet ellers.
- Redesign-prioritet: P2

### /admin/teknisk-plan/[spillerId]
- Fil: `src/app/admin/teknisk-plan/[spillerId]/page.tsx`
- Flate: AgencyOS (mørkt, `DetailShell`)
- Rolle/gating: COACH/ADMIN; `notFound()` hvis ikke PLAYER.
- Jobb (1 setning): Spillerens tekniske plan periodisert per L-fase med CS-fremgang per øvelse.
- Data vist (felt → kilde): spiller + aktive planer + TEK-sessions m/ drills+exercise(lPhase)+log(csAchieved/rating) → `prisma.user.findUnique`. Aggregat per øvelse (antall, snitt CS) og per L-fase.
- Komponenter: `DetailShell`, `KPICard`, `EmptyState`.
- Layout og hierarki: DetailShell (breadcrumb, KPI: TEK-økter/Fullført/Øvelser) → «Fremgang per teknisk element» (CS-snitt) → fase-grupperte øktlister → 360-profil-lenke.
- Tilstander: empty («Ingen teknisk plan») m/ CTA → `/admin/plans/new?player={id}` (peker til drop-off-ruta plans/new). loading/error MANGLER.
- Interaksjoner: plan-lenke; «Åpne 360-profil» → `/admin/spillere/{id}?tab=plan`.
- AK-domene vist: L-fase-periodisering (GRUNN/SPESIAL/TURNERING), CS (`csAchieved` %), pyramide TEK, HCP.
- Designfil-referanse: ingen prototype. NB: kommentar-typo «Fremdgling»/«Fremdgang» i koden.
- Nåværende designkvalitet: ferdig/rik — god L-fase + CS-visning. CTA lenker til plans/new (ruta som ikke lenger er primær inngang).
- Redesign-prioritet: P2

---

### /admin/gjennomfore
- Fil: `src/app/admin/gjennomfore/page.tsx`
- Flate: AgencyOS (mørkt, `HubFrame`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Hub for daglig drift (kalender, bookinger, anlegg, kapasitet, TrackMan, live).
- Data vist (felt → kilde): økter i dag/denne uka (`prisma.booking.count`, status CONFIRMED/PENDING), aktive anlegg (`prisma.location.count`). Flere kort har data `"—"` (availability/kapasitet/services/trackman/live).
- Komponenter: `HubFrame`/`HubHeader`/`HubStatSep`/`HubCard` (`@/components/hubs`); `IDagButton`/`NyBookingButton`.
- Layout og hierarki: HubHeader (eyebrow «AGENCYOS · COACH», stats) + 8 HubCards (nummerert 01–08).
- Tilstander: tom-tone på live-kort (`tone="empty"`); flere «—» placeholders. loading/error MANGLER.
- Interaksjoner: kort → `/admin/kalender/uke`, `/admin/bookinger`, `/admin/locations`, `/admin/availability`, `/admin/kapasitet`, `/admin/services`, `/admin/trackman`, `/admin/kalender`.
- AK-domene vist: økt/booking-teller; ikke pyramide/SG.
- Designfil-referanse: doc-kommentar peker til **`docs/design-handoff/2026-05-24-hubs/...`** — forbudt/arkivert kilde per design-porting-gate (skal peke til `public/design-handover/`).
- Nåværende designkvalitet: ferdig hub, men halvfylt (5/8 kort = «—») og design-referansen bryter låst kilde-regel.
- Redesign-prioritet: P2 (fiks design-ref + fyll placeholders)

### /admin/gjennomfore/okter/[id]
- Fil: `src/app/admin/gjennomfore/okter/[id]/page.tsx`
- Flate: AgencyOS (mørkt-ish, men **lys/amber demo-innslag**)
- Rolle/gating: COACH/ADMIN; `notFound()` hvis ikke booking/user.
- Jobb (1 setning): Økt-detalj i coach-kontekst med live-status, planlagt innhold, notater og etter-økt.
- Data vist (felt → kilde): booking + user (hcp/dateOfBirth/wagrSnapshot) + facility → `prisma.booking.findUnique`/`facility.findUnique`. Status avledet av tid. **`SESSION_DRILLS`, notater, «siste 5 økter», live-strip-tall er HARDKODET demo.** Hero-tittel hardkoder «{Fornavn} {X}.P.» (gammelt navne-mønster).
- Komponenter: `DetailShell`, `AthleticButton`/`AthleticBadge`, `buttonClasses`; lokale `AvlysOktKnapp`/`StartOktKnapp`/`LiveProgressStrip`.
- Layout og hierarki: DetailShell (breadcrumb Gjennomføre→Økter→spiller, statusPill tidsbasert) → 1.4fr/1fr: venstre live-strip+planlagt innhold(drills)+notater+etter-økt, høyre spiller-info. Sticky mobil-CTA.
- Tilstander: status-varianter (OM 2 TIMER/AKTIV NÅ/GJENNOMFØRT); disabled-knapper når ingen `trainingSessionV2Id`. loading/error MANGLER.
- Interaksjoner: Reschedule → `/admin/bookinger`; Avlys; Start/Åpne live-konsoll (kobler Booking→TrainingSessionV2 → `/admin/live/...`); Skriv oppfølging → live-summary.
- AK-domene vist: drill-kategori-tagger (PUTT), CS-aktig hit-rate, WAGR/HCP — men alle drill-/progress-tall er demo, ikke ekte.
- Designfil-referanse: Claude Design-bundle `Sg2FEKvykU45c4naIgQx6w` (`s4-okt-detalj.jsx`).
- Nåværende designkvalitet: inkonsistent/halvferdig — ekte booking-skall men demo-innhold; hardkodet «{X}.P.»-navn (gammel Markel-rest), `amber-`/`emerald-` + lys gradient-LiveStrip bryter mørk-disiplin.
- Redesign-prioritet: P1

---

### /admin/okter
- Fil: `src/app/admin/okter/page.tsx`
- Flate: AgencyOS (mørkt, `AdminHero`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Uke-oversikt over treningsøkter med pyramide-stripes per dag.
- Data vist (felt → kilde): `prisma.trainingPlanSession` for inneværende uke m/ plan+user+log. KPI: økter denne uka, gjennomført, planlagt (+forfalt), kansellert. Pyramide-aggregat (`aggregateByArea`/`prosentPerArea`).
- Komponenter: `AdminHero`, `EmptyState`; pyramide-helpere (`PYR_LABEL`/`PYR_REKKEFOLGE`); lokale `KpiAccent`/`Kpi`/`FilterChip`.
- Layout og hierarki: PageHeader (eyebrow «AgencyOS · /admin/okter · uke N») → KPI-strip (4) → pyramide-fordeling-bar → filter-row (dekorativ) → dag-grupperte øktlister m/ pyramide-stripe.
- Tilstander: empty («Ingen planlagte økter») m/ CTA → kalender. loading/error MANGLER.
- Interaksjoner: «Åpne plan» → `/admin/plans/{planId}`; «Åpne kalender»; filter-chips er ikke-funksjonelle (kommentar «full client-state i v2.1»).
- AK-domene vist: pyramide-områder FYS/TEK/SLAG/SPILL/TURN (token-fargede stripes via `--color-pyr-*`), uke-periodisering, status-vokabular.
- Designfil-referanse: doc-kommentar peker til **`wireframe/design-files-v2/final/05-okter.html`** — forbudt/arkivert kilde per design-porting-gate.
- Nåværende designkvalitet: ferdig/funksjonell + ryddig token-bruk for pyramide; men design-referanse bryter låst kilde-regel og filtre er ikke-funksjonelle.
- Redesign-prioritet: P2 (fiks design-ref + aktiver filtre)

---

### /admin/drills
- Fil: `src/app/admin/drills/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Drill-bibliotek med kategori-segmentkontroll og tile-grid.
- Data vist (felt → kilde): total + kategori-teller + drills (navn/skillArea/pyramidArea/varighet/sets/reps) → `prisma.exerciseDefinition`; viser maks 30 per kategori m/ ærlig «viser 30 av N».
- Komponenter: `AgPage`/`AgPageHead`/`agBtnClass`; ball-ikon (`Volleyball`) i kategorifarge.
- Layout og hierarki: PageHead («{N} drills, tagget.» + «Ny drill») → seg-kontroll (Alle/Approach/Putting/Driving/Nærspill/Fys via `?kat=`) → 3-kol tile-grid.
- Tilstander: empty per kategori finnes; teller under grid. loading/error MANGLER.
- Interaksjoner: seg → `?kat=`; tile → `/admin/drills/{id}`; «Ny drill» → `/admin/drills/ny`.
- AK-domene vist: pyramide/skill-kategori (FYS + skillArea-mapping), kategorifarger via `text-pyr-*` tokens, sets×reps/varighet.
- Designfil-referanse: fasit `agencyos-app/screens-ops.jsx` → DrillsScreen.
- Nåværende designkvalitet: ferdig — ren port, token-disiplin ok.
- Redesign-prioritet: P3

### /admin/drills/[id]
- Fil: `src/app/admin/drills/[id]/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN; `notFound()`.
- Jobb (1 setning): Full drill-detalj med nivå-range, csTarget per NGF-kategori og metadata.
- Data vist (felt → kilde): `prisma.exerciseDefinition.findUnique` (+ `_count.sessionDrills`, prerequisites-navn). csTarget per NGF-kategori (A–L), min/max-kategori, HCP-range, MORAD-flagg, L-faser, environment, utstyr, tags, video (`safeUrl`).
- Komponenter: lokal `Card`/`Stat`/`Row`/`NgfRangePlot`; `DrillDetailActions`.
- Layout og hierarki: tilbake-lenke → header (disiplin·skill eyebrow, navn, MORAD/kilde/brukt-i-økter-badges, actions) → 2/3+1/3: venstre beskrivelse/coach-notater/nivå-range/csTarget, høyre default-oppsett/environment/utstyr/L-faser/prerequisites/tags/video.
- Tilstander: `notFound()`; per-card tom-fallbacks. loading/error MANGLER.
- Interaksjoner: rediger/slett (`DrillDetailActions`); prerequisite-lenker → andre drills; video-lenke.
- AK-domene vist: NGF-kategori A–L + csTarget, MORAD, L-fase, pyramide-disiplin, CS-min/max, intensitet.
- Designfil-referanse: ingen prototype (egen rik flate).
- Nåværende designkvalitet: ferdig/rik — sterkeste AK-taksonomi-visningen i scopet (NGF + csTarget + MORAD).
- Redesign-prioritet: P2

### /admin/drills/[id]/rediger
- Fil: `src/app/admin/drills/[id]/rediger/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN; `notFound()`.
- Jobb (1 setning): Rediger-skjema for en drill (+ andre drills til prerequisites-multiselect).
- Data vist (felt → kilde): drill + alle andre drills (id/navn) → `prisma.exerciseDefinition`.
- Komponenter: `DrillEditForm` (lokal klient).
- Layout og hierarki: tilbake → drill; header («Rediger {navn}»); skjema.
- Tilstander: `notFound()`; resten i skjema (UVERIFISERT).
- Interaksjoner: lagre (i `DrillEditForm`).
- AK-domene vist: hele drill-taksonomien (i skjema).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: tynn shell + skjema.
- Redesign-prioritet: P3

### /admin/drills/ny
- Fil: `src/app/admin/drills/ny/page.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Opprett ny drill (blankt skjema, samme felt-sett som rediger).
- Data vist (felt → kilde): ingen loader; `DrillCreateForm` (klient) bærer felt.
- Komponenter: `DrillCreateForm` (lokal).
- Layout og hierarki: tilbake → bibliotek; header («Ny drill») + skjema.
- Tilstander: i skjema (UVERIFISERT).
- Interaksjoner: opprett (createDrill-action).
- AK-domene vist: drill-taksonomi (i skjema).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: tynn shell + skjema.
- Redesign-prioritet: P3

### /admin/drills/forslag
- Fil: `src/app/admin/drills/forslag/page.tsx`
- Flate: AgencyOS (mørkt, `AgPage`)
- Rolle/gating: COACH/ADMIN
- Jobb (1 setning): Kø av AI-genererte drill-forslag (PENDING) coachen kan godkjenne/avvise.
- Data vist (felt → kilde): `prisma.caddieDraft` (toolName `DRILL_DRAFT_TOOL`, status PENDING) → navn/beskrivelse/område(OTT/APP/ARG/PUTT)/varighet/videoUrl.
- Komponenter: `AgPage`/`AgPageHead`; `ForslagListe` (lokal klient).
- Layout og hierarki: PageHead («AI drill-forslag», eyebrow «Planlegge · Drill-bibliotek», «Til biblioteket»-lenke) + `ForslagListe`.
- Tilstander: teller i lead; tom-tilstand i `ForslagListe` (UVERIFISERT). loading/error MANGLER.
- Interaksjoner: godkjenn (→ `ExerciseDefinition`) / avvis (i `ForslagListe`); tilbake → `/admin/drills`.
- AK-domene vist: SG-område-mapping (OTT/APP/ARG/PUTT → norske labels), svakeste-kategori-drevet forslag.
- Designfil-referanse: ingen prototype (AI-funksjon utenfor fasit).
- Nåværende designkvalitet: ferdig shell; avhenger av `ForslagListe`.
- Redesign-prioritet: P3
