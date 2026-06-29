# AgencyOS cockpit, tid og live — skjermkort (kode-verifisert 2026-06-29)

17 ruter for coachens kontrolltårn: cockpit + KPI-strip, kalender (dag/uke/måned), Uka-kanban, spillertabell, økonomi, AI-Caddie (chat + dashbord + aktivitet) og live-økt-flyten (brief→active→summary). Dominerende mønster: «hybrid terminal»-design (mørkt AgencyOS-tema, Bloomberg-tetthet, mono-eyebrows, lime-aksent, DS-tokens, ekte Prisma-data). 5 av rutene er rene redirects/stubber. Største gjeld: `/admin/agencyos/live` (Mission Control) er et stort statisk DEMO-skall (~1126 linjer, seed-data fra `./data`), og live-økt-flyten (brief/summary) bruker et eldre lyst `bg-background`-idiom som bryter med AgencyOS-mørk-DNA-en de andre rutene følger.

**Navne-funn (AgencyOS vs CoachHQ):** Brukervendt UI sier konsekvent **AgencyOS** (sidebar-wordmark `src/components/admin/agencyos-sidebar.tsx:81`, tab-nav aria-label `_tab-nav.tsx:20`, alle PageHeader-eyebrows «AgencyOS · …», topbar). Ingen «CoachHQ» rendres i UI. «CoachHQ» finnes KUN i kode-kommentarer og server-action-fil-headere (f.eks. `live/[sessionId]/brief/actions.ts:3`, `spillere/[id]/actions.ts:4`, `drills/actions.ts:3`, `analytics/actions.ts:4`) — teknisk gjeld i kommentarer, ikke et UI-navnekonflikt. Konklusjon: appen heter AgencyOS i UI; CoachHQ-restene er ufarlige kommentarer som bør ryddes ved første touch.

---

### /admin
- Fil: `src/app/admin/page.tsx`
- Flate: AgencyOS (redirect)
- Rolle/gating: arves (ingen egen guard) — redirecter før render
- Jobb: Send `/admin` videre til cockpit.
- Komponenter: `redirect("/admin/agencyos")` (next/navigation)
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stub (redirect) — OK
- Redesign-prioritet: P3

### /admin/agencyos (Cockpit / Kontrolltårnet)
- Fil: `src/app/admin/agencyos/page.tsx` → `src/components/admin/cockpit/agency-cockpit.tsx`
- Flate: AgencyOS (mørkt)
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`
- Jobb: Coachens morgen-cockpit — dagens timeline, hvem trenger meg nå, innboks og 5 KPIer i ett blikk.
- Data vist (felt → kilde): alt fra `loadDailyBrief({id,name})` (`src/lib/agencyos/daily-brief-data`, ekte Prisma) → `CockpitData`. KPI-strip 5 kol: Aktive spillere, Forespørsler (`requestsCount`, sessionRequest PENDING), Økter i dag, **Stall-SG** (snitt sgTotal runder siste 30 d, «—» hvis tomt), **Plan-adherence** (fullført/planlagt plan-økter 30 d). Timeline-økter (`startMin/durMin` → ferdig/pågår/kommer-state), focus-kort (signal-tone + reason rich-text), innboks (appr/req/msg/advice).
- Komponenter: lokal `AgencyCockpit` (`KpiStrip`, `TimelineCard`, `QueueCard`, `InboxCard`, `CockpitTopbar`); `CockpitAvatar` + `COCKPIT_ICONS` fra `./_cockpit-interactive`. Topbar erstatter generisk AgencyOS-topbar.
- Layout og hierarki: egen cockpit-topbar (greeting + mono-subtitle + søk-attrapp + «Tildel plan»-CTA → `/admin/spillere`) → KPI-strip (5 kol, hairline) → 2-kol grid (1.15fr timeline / 1fr [queue+innboks stablet]).
- Tilstander: empty finnes per kort («Ingen økter planlagt i dag», «Ingen ventende akkurat nå», «Ingenting nytt»). loading/error: MANGLER (force-dynamic, ingen Suspense/error-boundary i page).
- Interaksjoner: timeline-rad → `s.href`; innboks-rad → `it.href`; «Tildel plan» → `/admin/spillere`; søkefelt er **attrapp** (statisk `<span>`, ikke input). Pin/AI-forslag-interaktivitet ligger i `_cockpit-interactive`.
- AK-domene vist: pyramide-akse (fys/tek/slag/spill/turn farger left-border), SG (Stall-SG KPI), plan-etterlevelse, økt-states.
- Designfil-referanse: `public/design-handover/AgencyOS Cockpit (terminal-lys).dc.html` + `AgencyOS Cockpit v2 (en ting).dc.html` (kommentaren peker til «AgencyOS Cockpit (hybrid).dc.html»)
- Nåværende designkvalitet: ferdig — tett, fasit-portet «hybrid terminal». Mindre: søk er ikke-funksjonell attrapp; Stall-SG/Plan-adherence var nylig opplåst regel-klynge (verdier skal være ekte nå).
- Redesign-prioritet: P2

### /admin/agencyos/live (Mission Control)
- Fil: `src/app/admin/agencyos/live/page.tsx` → `./mission-control.tsx` (~1126 linjer)
- Flate: AgencyOS — eksplisitt `.dark`-wrappet (`<div className="dark …">`), forest/lime
- Rolle/gating: arver admin-layout (ADMIN/COACH). Single-tenant (Anders).
- Jobb: Personlig live-ops-dashboard på tvers av Gmail/Beeper/Notion/Kalender (Direction A «Mission Control»).
- Data vist (felt → kilde): **statisk seed** fra `./data` (`EMAILS`, `MESSAGES`, `EVENTS`, `TASKS`, `NOTION`, `MODULES`, `INCOMING`, `DAGENS_TRE`, `SCENE_DATE` …). Ingen Prisma. Eksplisitt DEMO-banner: «visuelt skall, ikke ekte sanntidsdata».
- Komponenter: alt lokalt i mission-control.tsx (command bar, bento-grid moduler, e-post/meldings-lister, kalender, oppgaver). Bruker `next/image`, `next/link`, mange lucide-ikoner.
- Layout og hierarki: `.dark` rounded-2xl container (negative margins for full-bredde) → DEMO-note → sticky command-bar-header → bento-grid moduler.
- Tilstander: success-skall finnes (statisk). loading/empty/error: ikke meningsfulle (data hardkodet).
- Interaksjoner: client-state (useState/useEffect, intervaller for «live»-følelse) — interne toggles; ingen ekte backend-handlinger.
- AK-domene vist: agenda/innboks/oppgaver-aggregering (ikke golf-domene-spesifikt).
- Designfil-referanse: `public/design-handover/meg-live-os/src/dir-a.jsx` (+ dir-a.css) — egen Direction-A-kilde, ikke en `.dc.html`.
- Nåværende designkvalitet: halvferdig — visuelt rikt men 100% statisk DEMO. Største enkeltrute-gjeld i denne gruppa: live-integrasjoner ukoblet.
- Redesign-prioritet: P1 (data-wiring + verifiser at mørk-skallet matcher retunet `#0A0B0A`)

### /admin/agencyos/uka (Uka — 7-dagers kanban)
- Fil: `src/app/admin/agencyos/uka/page.tsx`
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`
- Jobb: Ukas bookinger gruppert per dag som kanban + kapasitets-KPI.
- Data vist (felt → kilde): `prisma.booking.findMany` (man–søn, status CONFIRMED/PENDING, include user/serviceType/location). KPI: timer totalt (av 28 mål), antall bookinger, unike spillere, kapasitet-% via `KpiRing`. Per kort: starttid, varighet, spillernavn (`user.name ?? guestName`), `serviceType.name`.
- Komponenter: `AdminHero as PageHeader` (`@/components/admin/admin-hero`), `KpiRing` (`@/components/athletic`); lucide Calendar/Plus/GripVertical.
- Layout og hierarki: PageHeader (eyebrow «AgencyOS · Uke N» + «Ny booking»→`/admin/kalender`) → 4 KPI → responsivt 7-kol grid (1/2/4/7) med I dag-ring og helg-«låst dag»-stil → footer-kort «Åpne kalender».
- Tilstander: empty per dag («— ledig —» / «— beskyttet —» helg). Side-empty/loading/error: MANGLER.
- Interaksjoner: «Ny booking»/«Åpne kalender» → `/admin/kalender`. GripVertical-ikon antyder drag, men **ingen faktisk drag-and-drop** (statisk).
- AK-domene vist: ingen pyramide/SG — kun booking-tetthet/kapasitet.
- Designfil-referanse: «WeekScreen fra Claude artifact AK Golf AgencyOS» (kommentar) — ingen matchende `.dc.html` verifisert.
- Nåværende designkvalitet: ferdig/data-tett. Grip-håndtak uten DnD er villedende affordance.
- Redesign-prioritet: P2

### /admin/agencyos/spillere (Spillertabell)
- Fil: `src/app/admin/agencyos/spillere/page.tsx`
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`
- Jobb: Søkbar, data-tett stall-oversikt med HCP, SG-trend, pakke og betaling.
- Data vist (felt → kilde): `prisma.user.findMany({role:"PLAYER"})` + subscription, siste booking, siste 8 `sgInputs` (→ sparkline + nyeste SG), `_count` bookings + FAILED payments (→ «Skylder»). Kolonner: Spiller (avatar/initialer fra navn), HCP, SG total (fortegnsfarget), Trend 6 mnd (`Sparkline`), Pakke (tier ?? «Drop-in»), Sist møtt, Totalt økter, Betaling (OK/Skylder).
- Komponenter: `AdminHero as PageHeader`, `EmptyState` (`@/components/shared/empty-state`), `Sparkline` (`@/components/athletic/sparkline`); lokale `Th`/`Td`. Mobil = `<ul>` divide-liste.
- Layout og hierarki: PageHeader → ett panel-kort med toolbar (filter-chips alle/aktiv/abonnent/skylder med count + søk) → desktop-tabell / mobil-liste.
- Tilstander: empty (`EmptyState` «Ingen spillere i stallen ennå») + tom-filter («Ingen spillere matcher filteret») finnes. loading/error: MANGLER.
- Interaksjoner: filter-chips → query-param-Link; søk = form GET; rad/chevron → `/admin/spillere/{id}` (merk: ut av agencyos-namespace).
- AK-domene vist: HCP, SG total + 6-mnd-trend, coaching-pakke (PRO/Drop-in), betalingsstatus.
- Designfil-referanse: `public/design-handover/AgencyOS Spiller-detalj (terminal).dc.html` (detalj, ikke liste); stallen-table-vokabular (kommentar).
- Nåværende designkvalitet: ferdig — sterkt Bloomberg-idiom.
- Redesign-prioritet: P2

### /admin/agencyos/okonomi (Økonomi)
- Fil: `src/app/admin/agencyos/okonomi/page.tsx`
- Flate: AgencyOS
- Rolle/gating: `requireCapability(Capability.VIEW_FINANCE)` (CBAC — strengere enn rolle-liste; ADMIN-only i praksis)
- Jobb: Coachens penge-kontrolltårn — MRR, innbetalinger, utestående, faktura-historikk.
- Data vist (felt → kilde): 6 parallelle `prisma.payment`/`subscription`-queries. KPI: MRR coaching (`proAktive × 300 kr`, kanonisk PRO-pris), Innbetalt denne mnd (+ %-endring), Utestående (PENDING), Aktive abonnement. Inntektsgraf 6 mnd (søyler, denne mnd lime). Faktura-tabell siste 12 (kunde/type/beløp/status/dato). Sidekolonne MRR-sammensetning + utestående-flagg.
- Komponenter: `AdminHero as PageHeader`, lokale `FinKpi`/`StatusPill`/`Th`/`Td`; lucide. `cn`.
- Layout og hierarki: PageHeader («Åpne Stripe»-CTA → dashboard.stripe.com) → 4-KPI-strip → 2/3-grid (graf + tabell | sidekolonne).
- Tilstander: empty (tom faktura-tabell, «Ingen aktive PRO-abonnement ennå»). utestående-seksjon kun når > 0. loading/error: MANGLER.
- Interaksjoner: «Alle →»/«Følg opp» → `/admin/finance`; «Åpne Stripe» ekstern.
- AK-domene vist: MRR fra coaching-abonnement (PRO 300 kr, ELITE bevisst utelatt).
- Designfil-referanse: ingen direkte `.dc.html` (kommentar: «godkjent AgencyOS-DNA»)
- Nåværende designkvalitet: ferdig — ærlige tall, token-disiplin (én hardkodet `--color-pyr-fys-track` i spillere-tabellen, ikke her).
- Redesign-prioritet: P2

### /admin/agencyos/caddie (AI-Caddie chat)
- Fil: `src/app/admin/agencyos/caddie/page.tsx` → `CaddieChat`
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })` (Anders' «bare deg»)
- Jobb: Anders' personlige AI-assistent (direkte chat, Claude Sonnet, les/skriv-verktøy + godkjenning).
- Data vist (felt → kilde): `getOrCreateActiveConversation(user.id)` → `conversationId`; `?seed` query → forhåndsutfylt prompt.
- Komponenter: `CaddieChat` (`@/components/admin/caddie/caddie-chat`, ~176 linjer client/chat-transport).
- Layout og hierarki: full chat-flate (komponent-styrt).
- Tilstander: håndteres i komponenten (chat-states). Page selv = kun auth + lasting.
- Interaksjoner: chat send/motta; verktøy-godkjenning (i komponent).
- AK-domene vist: avhengig av verktøy (spiller-data via tools).
- Designfil-referanse: `public/design-handover/AgencyOS AI-Caddie og Agenter (terminal).dc.html`
- Nåværende designkvalitet: ferdig (chat). Co-agent-dashbord splittet til egen rute (Fase 2).
- Redesign-prioritet: P3

### /admin/agencyos/caddie/dashbord (Caddie co-agent-dashbord)
- Fil: `src/app/admin/agencyos/caddie/dashbord/page.tsx`
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb: Proaktive Caddie-forslag (reaktiver inaktive spillere) + co-agent-rammeverk (utkast/fleet/audit).
- Data vist (felt → kilde): `loadCoAgent({id,name})` (`@/lib/admin-caddie/co-agent-data`) + `prisma.caddieDraft.findMany` (PENDING, toolName `reengageInactivePlayer`, take 20) → `ProaktivtForslag[]` (previewText, spillerName, dagerInaktiv).
- Komponenter: `CaddieProactive` (`./caddie-proactive`, 125 linjer), `CoAgent` (`@/components/admin/caddie/co-agent`, 759 linjer — utkast/fleet/audit fra PlanAction/AgentRun/AuditLog).
- Layout og hierarki: proaktive forslag øverst → co-agent-rammeverk under.
- Tilstander: empty/loading/error håndteres i komponentene (page kun auth + Promise.all).
- Interaksjoner: godkjenn/avvis forslag (i CaddieProactive); fleet/audit-handlinger (i CoAgent).
- AK-domene vist: inaktivitets-signaler, AI-utkast/agent-kjøringer.
- Designfil-referanse: `public/design-handover/AgencyOS AI-Caddie og Agenter (terminal).dc.html`
- Nåværende designkvalitet: ferdig (rik komponent). Foreldreløs fra tab-nav (kun nådd via Caddie-flaten).
- Redesign-prioritet: P3

### /admin/agencyos/caddie/aktivitet (Caddie-aktivitet)
- Fil: `src/app/admin/agencyos/caddie/aktivitet/page.tsx` → `CaddieAktivitetClient` (818 linjer)
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb: Tidslinje over AI-Caddie sin aktivitet (forslag/analyser/eskaleringer/flagg) + KPIer + AI-feil.
- Data vist (felt → kilde): `prisma.notification` (type startsWith «caddie», take 60, include user.name) → `CaddieEvent[]` (type mappes til suggest/escalate/flagged/analyzed/import; statusKind via readAt; initialer; confidence er **syntetisk** `0.7 + (i*7%28)/100`). AI-feil: `prisma.agentRun` (status ERROR, 7 d, take 10).
- Komponenter: `CaddieAktivitetClient` (`./aktivitet-client`); lokale mappere (`mapNotificationToCaddieType`, `prettifyType`, `initialsOf`).
- Layout og hierarki: client-styrt (KPI-strip, tidslinje, mest aktive spillere, drill-typefordeling, AI-feil-panel).
- Tilstander: ærlig empty (tom DB → tom tilstand), eksplisitt `loadError`-flagg (query-feil flagges, ikke skjules bak demo). loading: MANGLER.
- Interaksjoner: i client-komponenten.
- AK-domene vist: Caddie-hendelsestyper, confidence (syntetisk), drill-typer.
- Designfil-referanse: migrert fra `public/design/batch4/coachhq-caddie-aktivitet.html` (kommentar — eldre `public/design/`-kilde, IKKE gjeldende `public/design-handover/`; bør oppdateres per design-kilde-regel)
- Nåværende designkvalitet: ferdig men confidence-tall er oppdiktet (kosmetisk). Stale design-referanse i kommentar.
- Redesign-prioritet: P3

### /admin/kalender (Kalender — dag-visning)
- Fil: `src/app/admin/kalender/page.tsx`
- Flate: AgencyOS (hybrid terminal)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb: Ukekalender med venstre mini-grid + kommende-liste, høyre dag-visning (07–17 tidsslots).
- Data vist (felt → kilde): `loadWeekCalendar(uke)` (`@/lib/admin-kalender/week-data`, Prisma booking). `?uke=YYYY-MM-DD`. Felt: weekNumber, rangeLabel, days (isToday/weekend), events (dayIndex/startMin/endMin/serviceLabel/title/location/kind live|planned/href/isCompleted), prev/nextWeekParam.
- Komponenter: `AgChip`, `agBtnClass`, `AgPage`-familie (`@/components/admin/agencyos/ui`); `cn`. Lokale akse-utledere (`akseFra`→pyramide-bar, `kindFra`→forest/lime/bg3).
- Layout og hierarki: topbar (tittel + Dag/Uke/Måned-toggle + prev/next + «Ny økt»→`/admin/coach-workbench`) → body: venstre 300px panel (mini week-grid + legend + kommende) / høyre dag-view (tidsslots med farget akse-bar). Mobil = uke-liste.
- Tilstander: empty («Ingen kommende økter», «Ingen økter planlagt i dag», per-dag «Ingen økter»). loading/error: MANGLER.
- Interaksjoner: prev/next-uke; view-toggle (Dag aktiv; Uke peker til samme `/admin/kalender`; Måned → `/admin/kalender/maned`); event → `e.href`; «Ny økt» → coach-workbench.
- AK-domene vist: pyramide-akse-farger per økt (fys/tek/slag/spill/turn), live vs planlagt.
- Designfil-referanse: `public/design-handover/AgencyOS Kalender (terminal).dc.html` + `Flyt - AgencyOS Kalender og gjennomfore (terminal).dc.html`
- Nåværende designkvalitet: ferdig — tett terminal-kalender. Merk: «Uke»-toggle peker til samme dag-view (ingen ekte uke-grid-visning her).
- Redesign-prioritet: P2

### /admin/kalender/uke
- Fil: `src/app/admin/kalender/uke/page.tsx`
- Flate: AgencyOS (redirect)
- Rolle/gating: ingen egen guard (redirecter)
- Jobb: Videresend til `/admin/kalender` (bevarer `?uke`).
- Komponenter: `redirect(...)`
- Designfil-referanse: ingen prototype
- Nåværende designkvalitet: stub (redirect) — OK
- Redesign-prioritet: P3

### /admin/kalender/maned (Kalender — måned)
- Fil: `src/app/admin/kalender/maned/page.tsx` → `MonthCalendar`
- Flate: AgencyOS
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb: Måned-grid over alle bookinger på tvers av spillere.
- Data vist (felt → kilde): `loadKalenderManed(mnd)` (`@/lib/admin/kalender-maned-data`, Prisma). `?mnd=YYYY-MM`. 6-rad grid, maks 3 event-piller/dag + «+N til»-overflow.
- Komponenter: `MonthCalendar` (`@/components/admin/kalender/month-calendar`).
- Layout og hierarki: komponent-styrt (samme DNA som WeekCalendar).
- Tilstander: tomstate i komponenten. loading/error: MANGLER (page-nivå).
- Interaksjoner: måned-navigasjon via `?mnd`; event-piller (i komponent).
- AK-domene vist: booking-tetthet per dag.
- Designfil-referanse: `public/design-handover/AgencyOS Kalender (terminal).dc.html` (samme familie)
- Nåværende designkvalitet: ferdig (delegert til komponent — ikke detalj-lest her).
- Redesign-prioritet: P2

### /admin/calendar
- Fil: `src/app/admin/calendar/page.tsx`
- Flate: redirect
- Jobb: `permanentRedirect("/admin/kalender")` (engelsk→norsk alias).
- Designfil-referanse: ingen
- Nåværende designkvalitet: stub — OK
- Redesign-prioritet: P3

### /admin/calendar/maned
- Fil: `src/app/admin/calendar/maned/page.tsx`
- Flate: redirect
- Jobb: `permanentRedirect("/admin/kalender/maned")`.
- Designfil-referanse: ingen
- Nåværende designkvalitet: stub — OK
- Redesign-prioritet: P3

### /admin/live/[sessionId]/brief (Live-økt brief — coach)
- Fil: `src/app/admin/live/[sessionId]/brief/page.tsx`
- Flate: AgencyOS — men bruker **lyst `bg-background` fullside-idiom** (`min-h-screen`, `max-w-3xl`), avviker fra tab-rutenes mørke tetthet.
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`; `notFound()` hvis økt mangler.
- Jobb: Coach ser øktdetaljer og kan sende et fokuspunkt til spilleren før start.
- Data vist (felt → kilde): `prisma.trainingSessionV2.findUnique` (+ student-`user`). Felt: title, miljo (M0–M4-label), practiceType (BLOKK/RANDOM/…-label), start–slutt, notes, eksisterende brief fra `completedSummary.coachBrief.melding`.
- Komponenter: `BriefSend` (`./_brief-send`, client-form); lucide ArrowLeft/Target/Clock.
- Layout og hierarki: tilbake-lenke (→ spillerprofil) → eyebrow «Coach · Live-brief» + tittel + miljø/økttype/tid → notater-kort → `BriefSend`-form → primær CTA «Start live-monitoring →» (→ active).
- Tilstander: notater-kort kun hvis notes finnes. notFound. loading/empty/error: MANGLER ellers.
- Interaksjoner: send brief (form); «Start live-monitoring» → `/admin/live/{id}/active`.
- AK-domene vist: miljø (M0–M4), practice-type, økt-ID.
- Designfil-referanse: ingen direkte (active-siden peker til `AgencyOS Live-økt coach (terminal).dc.html`; brief/summary mangler egen)
- Nåværende designkvalitet: inkonsistent — lyst `bg-background`/serif-aktig editorial-layout bryter med AgencyOS-mørk-DNA (i motsetning til /active som bruker `AgPage`). Kandidat for omtegning til terminal-idiom.
- Redesign-prioritet: P1

### /admin/live/[sessionId]/active (Live-økt — coach-monitoring)
- Fil: `src/app/admin/live/[sessionId]/active/page.tsx`
- Flate: AgencyOS — bruker `AgPage` (riktig mørk terminal-shell)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`; `notFound()`.
- Jobb: Coach følger spillerens pågående økt i sanntid.
- Data vist (felt → kilde): `prisma.trainingSessionV2.findUnique` (+ drills take 10, + student user hcp). Status-label/tone, varighet, aktiv drill (navn/notes), antall drills, plan-fremdrift (proxy: drills/5·100%, ring-SVG), KPI-grid (Drills/Økttype/Tid igjen/Status).
- Komponenter: `AgPage` (`@/components/admin/agencyos/ui`), `LiveMelding` (`./_live-melding`); lucide ArrowLeft/CheckCircle2. Inline SVG-ring + CSS rep-bar-animasjon.
- Layout og hierarki: topbar (←Brief + live-ping + tittel + spiller-chip + status-pill + «Avslutt»→summary) → 3-kol grid (aktiv drill span-2 m/ animert lyd-bølge + KPI / [plan-fremdrift-ring + status-panel] / send-melding full bredde / avslutt-knapp).
- Tilstander: empty («Ingen drills registrert …»). Live-ping kun ved IN_PROGRESS. loading/error: MANGLER.
- Interaksjoner: ←Brief; «Avslutt»/«Avslutt og se sammendrag» → summary; send melding (`LiveMelding`).
- AK-domene vist: drills, practice-type, miljø, plan-fremdrift, økt-status.
- Designfil-referanse: `public/design-handover/.../AgencyOS Live-økt Coach (hybrid).dc.html` (kommentar) + `AgencyOS Live-okt coach (terminal).dc.html`
- Nåværende designkvalitet: ferdig — korrekt mørk terminal-DNA. Merk: plan-fremdrift er proxy (drills/5), ikke ekte per-rep-logging.
- Redesign-prioritet: P2

### /admin/live/[sessionId]/summary (Live-økt sammendrag — coach)
- Fil: `src/app/admin/live/[sessionId]/summary/page.tsx`
- Flate: AgencyOS — igjen **lyst `bg-background` fullside-idiom** (som brief, ikke active)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`; `notFound()`.
- Jobb: Post-økt: coach vurderer kvalitet, skriver observasjoner, lagrer til spillerprofil.
- Data vist (felt → kilde): `prisma.trainingSessionV2.findUnique` (+ student user). Miljø/økttype/status-kort, eksisterende `coachRating` (fra `completedSummary`), `notes`.
- Komponenter: `CoachSummaryForm` (`./_coach-summary-form`, client); lucide ArrowLeft/CheckCircle2.
- Layout og hierarki: tilbake-lenke → «Coach · Økt fullført»-eyebrow + tittel + dato → 3 stat-kort (miljø/økttype/status) → `CoachSummaryForm` (rating + notat) → 2 CTA (Til spillerprofil / Tilbake til AgencyOS).
- Tilstander: notFound. loading/empty/error: MANGLER ellers.
- Interaksjoner: lagre vurdering (form); CTA → spillerprofil eller `/admin/agencyos`.
- AK-domene vist: miljø, økttype, coach-rating, økt-ID.
- Designfil-referanse: ingen direkte (deler flyt-kilde `Flyt - AgencyOS Kalender og gjennomfore (terminal).dc.html`)
- Nåværende designkvalitet: inkonsistent — samme lyse-idiom-avvik som brief. Bør harmoniseres med /active sin `AgPage`-terminal.
- Redesign-prioritet: P1
