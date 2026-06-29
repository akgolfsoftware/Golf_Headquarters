# AgencyOS (/admin) — skjermkort (kode-verifisert 2026-06-29)

146 ruter. Mørkt tema (nær-svart #0A0B0A), Bloomberg-tett. Delt: cockpit/tid/live · stall/analyse · plan/Workbench · drift.


---

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

---

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

---

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

---

# AgencyOS «rest» (drift/admin /admin/*) — skjermkort (kode-verifisert 2026-06-29)

~60 ruter utenfor cockpit/spillere/plan/analyse-klyngene. Alle er AgencyOS = MØRKT tema. Dominerende mønster: server component + `requirePortalUser({ allow: ["COACH","ADMIN"] })` (eller `requireCapability` for finans/anlegg/bruker) + ekte Prisma + AgencyOS-UI-primitiver (`AgPage`/`AgPageHead`/`AgTable` fra `src/components/admin/agencyos/ui.tsx`). Største gjeld: **tre konkurrerende header-idiomer side om side** — fersk `AgPageHead`-port (turneringer/bookinger/anlegg/services/økonomi/godkjenninger/forespørsler/rapporter/mer), eldre `AdminHero` (api/security/team/hjelp/video/integrasjoner/profil m.fl.), og `hub-frame`/`HubFrame` CSS-øyer (audit-log, organisasjon). To skjermer bryter navne-kanon med hardkodet demo-data (`tilstander`, delvis `organisasjon`). Mange redirect-stubs og «kommando»-arvede AI-flater (lys-ish chrome, ikke portet).

---

### /admin/tournaments
- Fil: `src/app/admin/tournaments/page.tsx`
- Flate: AgencyOS (mørk), desktop 1280 + mobil-kortliste
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Liste turneringer stallen er påmeldt i + send fellesmelding til påmeldte.
- Data vist: navn/dato/anlegg/påmeldte/status → `prisma.tournamentEntry` gruppert per turnering (katalog-koblet eller manuell); status-chip avledet av entry-statuser.
- Komponenter: `AgPage/AgPageHead/AgTable/AgTd/AgTh/AgChip` (`@/components/admin/agencyos/ui`), `FellesmeldingKnapp` (`./_fellesmelding-knapp`).
- Layout og hierarki: PageHead (eyebrow «Planlegge · Turneringer» + «Ny turnering» CTA) → mobil divide-y kortliste / desktop tabell, fellesmelding-knapp per rad.
- Tilstander: empty finnes («Ingen kommende turneringer…»); loading/error MANGLER (server component).
- Interaksjoner: rad → `/admin/tournaments/{id}`; «Ny turnering» → `/admin/tournaments/ny`; fellesmelding-knapp → panel.
- AK-domene vist: turneringsstatus (Bekreftet/Påmelding åpen/Trukket/Gjennomført); ingen SG/CS/M/PR.
- Designfil-referanse: port av `agencyos-app/screens-ops.jsx` → TournamentsScreen (per fil-doc).
- Nåværende designkvalitet: ferdig — konsistent AgencyOS-port, mobil+desktop.
- Redesign-prioritet: P3

### /admin/tournaments/ny
- Fil: `src/app/admin/tournaments/ny/page.tsx`
- Flate: AgencyOS (mørk), sentrert maks-880 wizard
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): 5-stegs wizard for å opprette ny Tournament.
- Data vist: kursliste → `prisma.courseDefinition`; resten i klient-wizard.
- Komponenter: `AdminHero` (PageHeader), `NyTurneringWizard` (`./wizard`).
- Layout og hierarki: AdminHero (eyebrow med rå rute-streng `/admin/tournaments/ny`) → wizard. **Inkonsekvent header-idiom** vs. listesiden (AdminHero, ikke AgPageHead).
- Tilstander: wizard-interne; loading/error MANGLER på shell.
- Interaksjoner: wizard-steg → opprett turnering.
- AK-domene vist: turneringsoppsett (startliste/regler) — ingen SG/PR.
- Designfil-referanse: ingen prototype (wizard).
- Nåværende designkvalitet: halvferdig — eyebrow viser rå filsti, AdminHero-avvik fra ny port.
- Redesign-prioritet: P2

### /admin/tournaments/[id]
- Fil: `src/app/admin/tournaments/[id]/page.tsx`
- Flate: AgencyOS (mørk), DetailShell
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Turneringsdetalj — påmeldte, resultater, redigering, merge-håndtering.
- Data vist: tournament + course + results(+user) + alle PLAYER-spillere + entries(+user) → `prisma.tournament/tournamentEntry`; `mergedInto` hentes ved dublett.
- Komponenter: `DetailShell` (`@/components/shared/detail-shell`), `KPICard` (`@/components/ui`), `AthleticBadge`, `TournamentForm`, `ResultForm`, `UnmergeBanner`, `TournamentEnrollModal`+`PriorityPill` (`@/components/coachhq/...`).
- Layout og hierarki: DetailShell-mønster; unmerge-banner øverst ved dublett; påmeldings-modal + resultatskjema.
- Tilstander: `notFound()` ved manglende turnering; empty via EmptyState; loading/error MANGLER.
- Interaksjoner: påmelding (enroll-modal), resultatregistrering, unmerge.
- AK-domene vist: tier på spillerrad, prioritet-pill; turneringsresultat/posisjon.
- Designfil-referanse: ingen ren prototype (DetailShell).
- Nåværende designkvalitet: ferdig — blander DetailShell + coachhq-komponenter, konsistent nok.
- Redesign-prioritet: P3

### /admin/tournaments/dubletter
- Fil: `src/app/admin/tournaments/dubletter/page.tsx`
- Flate: AgencyOS (mørk), maks-1200
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Foreslå og merge MANUAL-turneringer mot synkroniserte (DATAGOLF/NGF) via dato- og navne-overlapp.
- Data vist: umergede MANUAL-turneringer + kandidat-pool → `prisma.tournament`; match-score per forslag (token-overlap + datodiff).
- Komponenter: `AdminHero` (PageHeader), `EmptyState`, `MergeDubletterListe` (`./merge-liste`).
- Layout og hierarki: tilbake-lenke → AdminHero → info-boks «slik fungerer merge» → merge-liste.
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: «Merge» → setter `mergedIntoId`, flytter relasjoner.
- AK-domene vist: turneringskilde (MANUAL/DATAGOLF/NGF/GJGT), tour.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — AdminHero-idiom, men funksjonelt fullt.
- Redesign-prioritet: P2

### /admin/bookinger
- Fil: `src/app/admin/bookinger/page.tsx`
- Flate: AgencyOS (mørk), desktop 1280
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Kombinert «Bookinger & kapasitet»-dashbord for inneværende uke (sammenslått med tidligere /admin/kapasitet).
- Data vist: ukens bookinger (+user/serviceType/facility/location), aktive fasiliteter, PENDING-forespørsler → `prisma.booking/facility/sessionRequest`; heatmap (timer×dag) + 4 KPI beregnet fra belegg.
- Komponenter: `AgChip/AgPage/AgPageHead/AgPlayerCell` (agencyos/ui), `BekreftAvvis` (`./bekreft-avvis`), `EksporterKnapp` (`./eksporter-knapp`).
- Layout og hierarki: PageHead (eyebrow «Uke N · {lokasjon}» + Eksporter + Ny booking) → 4 KPI-kort → 2-kol: heatmap venstre / booking-liste høyre (bekreft/avvis i raden).
- Tilstander: empty per panel («Ingen bookinger denne uka.» / «Ingen aktive fasiliteter»); loading/error MANGLER.
- Interaksjoner: bekreft/avvis PENDING-booking; CSV-eksport; «Ny booking» → `/admin/bookinger/ny`.
- AK-domene vist: kapasitet-% (lime = fullt), booking-status; ingen SG.
- Designfil-referanse: `AgencyOS Bookinger og kapasitet (terminal).dc.html` (per fil-doc).
- Nåværende designkvalitet: ferdig — tett terminal-port, ekte data.
- Redesign-prioritet: P3

### /admin/bookinger/ny
- Fil: `src/app/admin/bookinger/ny/page.tsx`
- Flate: AgencyOS (mørk), wizard
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): 5-stegs manuell booking-oppretting for coach/admin.
- Data vist: spillere (≤300), aktive tjenester, lokasjoner+fasiliteter → `prisma.user/serviceType/location`.
- Komponenter: `NyBookingWizard` (`@/components/admin/bookinger/ny-booking-wizard`) — wirer mot `createSessionFromCalendar`.
- Layout og hierarki: ren wizard-shell (ingen PageHead).
- Tilstander: wizard-interne; shell loading/error MANGLER.
- Interaksjoner: wizard → opprett booking.
- AK-domene vist: tjeneste/pris/varighet; ingen SG.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (klient-wizard) — shell tynn.
- Redesign-prioritet: P3 (stub-shell)

### /admin/kapasitet
- Fil: `src/app/admin/kapasitet/page.tsx`
- Flate: redirect
- Rolle/gating: ingen (redirect før guard)
- Jobb (1 setning): `redirect("/admin/bookinger")` — kapasitet er slått sammen dit.
- Stub. Redesign-prioritet: P3

### /admin/anlegg
- Fil: `src/app/admin/anlegg/page.tsx`
- Flate: AgencyOS (mørk), desktop 1280
- Rolle/gating: `requireCapability(Capability.MANAGE_FACILITIES)` (capability-gated, ikke rolle-liste)
- Jobb (1 setning): Fasilitets-grid med booking-trykk denne uka per anlegg.
- Data vist: aktive locations→facilities + booking-telling denne uka → `prisma.location`; beskrivelse fra `Facility.description` ellers «—».
- Komponenter: `AgPage/AgPageHead`, `LocationForm` (`./location-form`, ekte CRUD).
- Layout og hierarki: PageHead (tallord-tittel «{N} fasiliteter.» + «Nytt anlegg») → 2-kol tile-grid; tile → `/admin/availability`.
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: tile → availability; «Nytt anlegg» → LocationForm-modal.
- AK-domene vist: ingen (drift); fasilitetstype-ikon.
- Designfil-referanse: `agencyos-app/screens-ops.jsx` → FacilitiesScreen (per fil-doc).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/anlegg/[id]
- Fil: `src/app/admin/anlegg/[id]/page.tsx`
- Flate: AgencyOS (mørk), DetailShell
- Rolle/gating: `requireCapability(Capability.MANAGE_FACILITIES)`
- Jobb (1 setning): Anlegg-detalj per lokasjon med KART- og KALENDER-modus.
- Data vist: location + fasiliteter + dagens bookinger → `prisma` (les via `?dag=`/`?tab=`).
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`, `AnleggDetailView` (`./anlegg-detail-view`).
- Layout og hierarki: DetailShell; SVG-kart med klikkbare hotspots / fasilitet×tidsblokk-kalender.
- Tilstander: `notFound()`; loading/error MANGLER.
- Interaksjoner: kart-hotspot, dag-/tab-bytte via searchParams.
- AK-domene vist: ingen (drift).
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/availability
- Fil: `src/app/admin/availability/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Måned-kalender som viser coachens åpne booking-vinduer per ukedag.
- Data vist: egne aktive uke-vinduer → `prisma.coachAvailability` projisert på månedens datoer; `?m=YYYY-MM`.
- Komponenter: `AgPage/AgPageHead`, `SynkButton` (`./availability-actions`, no-op).
- Layout og hierarki: PageHead → måned-grid (grønne åpne dager m/tidsrom) + tegnforklaring; måned-nav via lenker.
- Tilstander: visning statisk; klikk-og-rediger-panel IKKE koblet (CRUD finnes i `./slot-form.tsx`); loading/error MANGLER.
- Interaksjoner: forrige/neste måned; Synk = no-op (som fasit-demo).
- AK-domene vist: ingen.
- Designfil-referanse: `agencyos-app/screens-ops.jsx` → AvailabilityScreen (per fil-doc).
- Nåværende designkvalitet: halvferdig — vakker port, men rediger-panel ikke koblet (kun les).
- Redesign-prioritet: P2

### /admin/services
- Fil: `src/app/admin/services/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Tabell over bookbare tjenester (pris/varighet/status).
- Data vist: tjeneste/varighet/pris/aktiv → `prisma.serviceType`.
- Komponenter: `AgPage/AgPageHead/AgTable/AgChip`, `ServiceForm` (`./service-form`, ekte CRUD).
- Layout og hierarki: PageHead (tallord-tittel + «Ny tjeneste») → tabell; aktiv=ok-chip, inaktiv=«Skjult».
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: «Ny tjeneste» → ServiceForm.
- AK-domene vist: ingen (pris i kr, fakturering-relevant).
- Designfil-referanse: `agencyos-app/screens-ops.jsx` → ServicesScreen (per fil-doc).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/godkjenninger  (kanonisk; /admin/approvals → hit)
- Fil: `src/app/admin/godkjenninger/page.tsx`
- Flate: AgencyOS (mørk), maks-820 kortliste
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Innboks for agent-genererte plan-endringer — godkjenn/avvis, med diff-preview.
- Data vist: PENDING `planAction`(+user/plan); diff bygges via `computeDelta` mot aktiv plan-økter; lav-risiko via `LOW_RISK_ACTION_TYPES`; suggestion zod-validert (`safeParse`).
- Komponenter: `AgAvatar/AgChip/AgPage/AgPageHead`, `ApprovalActions`+`BatchApproveButton` (gjenbrukt fra `app/admin/approvals/...`).
- Layout og hierarki: PageHead («{N} venter på deg.») → batch-godkjenn (lav-risiko) → kortliste med haster-venstrekant, signal + diff-boks per kort.
- Tilstander: empty finnes («alt er behandlet»); loading/error MANGLER.
- Interaksjoner: godkjenn/avvis per kort + batch; kort → `/admin/godkjenninger/{id}`.
- AK-domene vist: action-type (PYRAMID_ADJUST/TAPER_ENGAGE…), signal-kind/value, plan-diff, pyramide.
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig — god zod-disiplin, ekte diff.
- Redesign-prioritet: P3

### /admin/godkjenninger/[id]
- Fil: `src/app/admin/godkjenninger/[id]/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Detalj for én plan-action med before/after-diff og godkjenn-handlinger.
- Data vist: planAction → `ApprovalDetail`-type; diff via `computeDelta`.
- Komponenter: `ApprovalDetailClient`/`ApprovalNotFound` (gjenbrukt fra `approvals/[id]`).
- Layout og hierarki: client-detalj (lead/trail-tittel + rationale + diff + before-summary).
- Tilstander: ApprovalNotFound; loading/error MANGLER.
- Interaksjoner: godkjenn/avvis.
- AK-domene vist: action-type, signal-snapshot, plan-diff.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/approvals  +  /admin/approvals/[id]
- Fil: `src/app/admin/approvals/page.tsx`, `…/[id]/page.tsx`
- Flate: redirect-stubs
- Rolle/gating: ingen (permanentRedirect før guard)
- Jobb (1 setning): `permanentRedirect` → `/admin/godkjenninger` (+ `/{id}`). NB: selve UI-komponentene (ApprovalActions m.fl.) bor her og gjenbrukes av godkjenninger.
- Stub. Redesign-prioritet: P3

### /admin/foresporsler
- Fil: `src/app/admin/foresporsler/page.tsx`
- Flate: AgencyOS (mørk), maks-820
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Booking-ønsker fra spillere (SessionRequest) — godta/avvis.
- Data vist: alle SessionRequest(+user) + dagens bookinger (for lime-avatar) → `prisma.sessionRequest/booking`.
- Komponenter: `AgAvatar/AgChip/AgPage/AgPageHead/AgTypeChip`, `ForespørselActions` (`./forespørsel-actions`).
- Layout og hierarki: PageHead («{N} forespørsler å svare på») → liste; alle rader «Booking»-chip (bevisst avvik fra fasit — meldinger/råd bor i innboks).
- Tilstander: empty finnes; behandlede vises opasitet 50; loading/error MANGLER.
- Interaksjoner: godta/avvis (server-actions).
- AK-domene vist: hcp/homeClub i kontekst; lime-avatar = økt i dag.
- Designfil-referanse: `agencyos-app/flows.jsx` → RequestsScreen (per fil-doc).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/innboks  (kanonisk; /admin/messages → hit)
- Fil: `src/app/admin/innboks/page.tsx`
- Flate: AgencyOS (mørk), 3-kol split (liste/samtale/kontekst)
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`
- Jobb (1 setning): Master-detalj meldingsflate coach↔spiller/foresatt med svar + AI-utkast.
- Data vist: DIRECT-tråder fra `coachingSession`(+user/coach) (≤100); aktiv tråd via `?thread=`; aktiv spiller hcp/homeClub via egen `prisma.user`-query.
- Komponenter: `AdminHero`, `EmptyState`, `SplitInboxShell` (`@/components/admin/split-inbox-shell`), `MessagesInbox/Conversation/ContextPanel` (gjenbrukt fra `messages/_components`).
- Layout og hierarki: AdminHero → 3-pane shell (filter alle/ulest, samtale, kontekst). **AdminHero-idiom**, ikke AgPageHead.
- Tilstander: empty finnes (m/CTA til spillerliste); loading/error MANGLER.
- Interaksjoner: velg tråd (`?thread=`), send melding, AI-utkast.
- AK-domene vist: tier/hcp/homeClub i kontekstpanel.
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig — funksjonelt rikt; header-idiom avviker fra ny port.
- Redesign-prioritet: P2

### /admin/messages
- Fil: `src/app/admin/messages/page.tsx`
- Flate: redirect
- Jobb (1 setning): `permanentRedirect("/admin/innboks")`. NB: `messages/_components/*` er den kanoniske komponentkilden for innboks.
- Stub. Redesign-prioritet: P3

### /admin/kommunikasjon
- Fil: `src/app/admin/kommunikasjon/page.tsx`
- Flate: AgencyOS — men bruker athletic-komponenter (`AthleticEyebrow`/`AthleticButton`/`TabBar`), inline `style` med hsl-token
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Hub med 4 faner (Innboks/E-postmaler/Notion-prosjekter/Notion-oppgaver) som hver er ett «åpne»-kort.
- Data vist: ingen — kun statiske SummaryCard-lenker; `?tab=`.
- Komponenter: `AthleticButton/AthleticEyebrow`, `TabBar` (`@/components/athletic/tab-bar`).
- Layout og hierarki: ikon-hero → TabBar → ett SummaryCard per fane (lenker til innboks/email-templates/workspace-notion).
- Tilstander: ingen reelle (statisk); loading/error N/A.
- Interaksjoner: faner + «Åpne»-knapp per kort.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig/inkonsistent — bare en lenke-hub over flater som finnes; egen-hsl inline-style, athletic-idiom midt i AgencyOS. Trolig foreldreløs/overlappende med innboks.
- Redesign-prioritet: P1

### /admin/handlingssenter
- Fil: `src/app/admin/handlingssenter/page.tsx`
- Flate: AgencyOS (mørk), klient-drevet (Kanban/Tabell/Liste-toggle)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Oppgave-board synket fra Notion (OppgaveCache).
- Data vist: ≤200 OppgaveCache-rader → `prisma.oppgaveCache` (mappet til kolonne/prioritet/tag); `.catch(()=>[])`.
- Komponenter: `HandlingssenterClient` (`./handlingssenter-client`).
- Layout og hierarki: all chrome i klient-komponent; view-toggle + detail-panel.
- Tilstander: ærlig empty når Notion ikke koblet/cache tom; loading/error delvis (catch→tom).
- Interaksjoner: view-toggle, kort-detalj (klient).
- AK-domene vist: ingen (drift/Notion).
- Designfil-referanse: ingen prototype (hybrid terminal).
- Nåværende designkvalitet: ferdig (klient-shell).
- Redesign-prioritet: P3

### /admin/queue  (alias /admin/oppfolging)
- Fil: `src/app/admin/queue/page.tsx`
- Flate: AgencyOS (mørk), maks-1280
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Oppfølgingskø — «hvem trenger en samtale denne uka» (Risiko/Watch/Sjekk inn/Løst).
- Data vist: PLAYER-spillere + aktive planer + siste SG_TOTAL-signal → `prisma.user`; klassifisering av plan-mangel/inaktivitet/SG-fall.
- Komponenter: `AthleticEyebrow` + lokale KPI/Column/CardItem (`cn`); ingen AgPageHead.
- Layout og hierarki: athletic-hero (italic display) → 4 KPI → 24t-aktivitetsstripe → 4-kol kanban med spiller-kort (signal/stats/tags/hurtigaksjoner).
- Tilstander: tom-state per kolonne; «Løst» er hardkodet tom (TODO: CoachingTask-modell mangler); loading/error MANGLER. «Generer AI-aksjoner» disabled (v2).
- Interaksjoner: kort → spillerprofil; hurtigaksjoner → innboks/profil/ny-booking.
- AK-domene vist: SG · siste, dager siden innlogg, risiko-tags.
- Designfil-referanse: «matcher daily-brief.tsx» (per fil-doc) — ingen ren .dc.html.
- Nåværende designkvalitet: halvferdig — athletic-idiom (ikke AgPageHead), «Løst»-kolonne uimplementert, disabled CTA.
- Redesign-prioritet: P2

### /admin/varsler
- Fil: `src/app/admin/varsler/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Coach-varselsenter — agent-forslag/signaler/uleste meldinger samlet.
- Data vist: `loadVarsler(user.id)` (`@/lib/admin/load-varsler`) → counts.actions + counts.notifications.
- Komponenter: `AthleticEyebrow`, `VarslerClient` (`./varsler-client`).
- Layout og hierarki: ikon-hero → VarslerClient. Athletic-idiom, ikke AgPageHead.
- Tilstander: total-tekst «Alt er ajour» som empty-signal; rest i klient.
- Interaksjoner: i klient.
- AK-domene vist: agent-forslag/signaler.
- Designfil-referanse: `docs/agencyos-fase1-byggebestilling-2026-06-28.md` (per fil-doc).
- Nåværende designkvalitet: halvferdig — header-idiom avviker; nyere Fase-1-flate.
- Redesign-prioritet: P2

### /admin/brief
- Fil: `src/app/admin/brief/page.tsx`
- Flate: AgencyOS (mørk), maks-1200
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Daglig AI-morgenbrief — Anthropic-oppsummering + dagens KPI + agent-anbefalinger.
- Data vist: `getBriefData(coach)` (`@/lib/admin-brief`) + ferske PENDING-planActions(+user) → `prisma.planAction`; AI-tekst via `anthropicKlient()` (`COACH_MODEL`).
- Komponenter: `FokusSpillerPanel`, `PrintButton`, `EksportTrigger`, `AgentStrip` (`@/components/coachhq/agent-strip`), `AthleticEyebrow` + lokale Kpi/Rec/SectionNum.
- Layout og hierarki: athletic-hero (LIVE-puls) → AgentStrip → 4 KPI → 01 AI-brief, 02 nyligste runder, 03 anbefalinger, 04 krever oppmerksomhet.
- Tilstander: AI-feil-fallback («Kunne ikke generere…»); empty-rader; «Send som e-post» disabled (v2); loading minimal.
- Interaksjoner: skriv ut, eksport, → approvals/innboks/spillere.
- AK-domene vist: SG-tot per runde, pyramide-justeringer, agent-output.
- Designfil-referanse: «matcher daily-brief.tsx» (per fil-doc).
- Nåværende designkvalitet: ferdig (rik) — men athletic-idiom, ikke AgPageHead; lenker til `/admin/approvals`+`/admin/messages` (redirect-aliaser).
- Redesign-prioritet: P2 (idiom-justering)

### /admin/agents
- Fil: `src/app/admin/agents/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`; manuell trigger kun ADMIN
- Jobb (1 setning): Agent-pipeline-oversikt — registrerte agenter + siste 30 kjøringer.
- Data vist: signal/planAction-counts, siste 30 AgentRun, pending/forslag-idag → `prisma`; agent-katalog statisk i `AGENT_INFO`.
- Komponenter: `AdminHero` (PageHeader), `EmptyState`, `ManualTrigger`; lokale StatKort/Th/Td.
- Layout og hierarki: AdminHero → 3 stat-kort → agent-tabell (status fra kjøringer) → manuell trigger (ADMIN) → siste 30 kjøringer.
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: rad → `/admin/agents/{slug}`; ManualTrigger; → godkjenninger.
- AK-domene vist: agent-typer (round/test/trackman/plan-watcher…), signal/planAction-volum.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — men AdminHero-idiom.
- Redesign-prioritet: P2

### /admin/agents/[agentId]
- Fil: `src/app/admin/agents/[agentId]/page.tsx`
- Flate: AgencyOS (mørk), DetailShell
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Agent-detalj — konfig, siste AgentRun-kjøringer, tommel-feedback per kjøring.
- Data vist: agent-konfig (statisk `AGENT_KONFIG`) + AgentRun → `prisma`.
- Komponenter: `DetailShell`, `KPICard`, `AthleticBadge`, `EmptyState`, `FeedbackForm`, `ApprovalActions`, `AgentRunPanel`.
- Layout og hierarki: DetailShell; KPI + kjøringspanel + feedback.
- Tilstander: `notFound()`; empty; loading/error MANGLER.
- Interaksjoner: tommel opp/ned per kjøring; godkjenn-handlinger.
- AK-domene vist: agent-konfig/status.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/agenter
- Fil: `src/app/admin/agenter/page.tsx`
- Flate: «Kommando»-arvet AI-chat (maks-3xl, ikke AgencyOS-port)
- Rolle/gating: `canAccessMissionControl()` (ADMIN-only effektivt) → ellers redirect `/admin`
- Jobb (1 setning): Flermodell AI-chat (Claude/Gemini/Grok/Ollama), merget inn fra kommandosenteret.
- Data vist: ingen (server genererer `conversationId`).
- Komponenter: `AgentChat` (`@/components/kommando/agent-chat`).
- Layout og hierarki: rå h1 + p + chat-komponent — ingen PageHead, ingen KPI.
- Tilstander: i chat-komponent.
- Interaksjoner: chat.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype (kommando-arv).
- Nåværende designkvalitet: stygg/inkonsistent — bar h1, ikke AgencyOS-DNA.
- Redesign-prioritet: P1

### /admin/agent-team
- Fil: `src/app/admin/agent-team/page.tsx`
- Flate: «Kommando»-arvet (maks-3xl)
- Rolle/gating: `canAccessMissionControl()` → ellers redirect `/admin`
- Jobb (1 setning): Flere AI-er sekvensielt på én oppgave (output → neste steg).
- Data vist: aktive `kommandoProject`, siste 10 `kommandoAgentRun`(+steps) → `prisma.kommando*`.
- Komponenter: `AgentTeam` (`@/components/kommando/agent-team`).
- Layout og hierarki: rå h1 + p + AgentTeam — ingen AgencyOS-chrome.
- Tilstander: i klient.
- Interaksjoner: kjør team, velg prosjekt.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: stygg/inkonsistent (samme som /agenter).
- Redesign-prioritet: P1

### /admin/prosjekter
- Fil: `src/app/admin/prosjekter/page.tsx`
- Flate: «Kommando»-arvet (maks-2xl)
- Rolle/gating: `canAccessMissionControl()` → ellers redirect `/admin`
- Jobb (1 setning): Kommando-prosjekter med oppgavetelling.
- Data vist: `kommandoProject` + task-count (groupBy) → `prisma.kommando*`.
- Komponenter: `ProjectList` (`@/components/kommando/project-list`).
- Layout og hierarki: bar h1 + ProjectList.
- Tilstander: i klient.
- Interaksjoner: liste/CRUD prosjekt (klient).
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: stygg/inkonsistent (kommando-arv).
- Redesign-prioritet: P1

### /admin/caddie
- Fil: `src/app/admin/caddie/page.tsx`
- Flate: redirect
- Jobb (1 setning): `permanentRedirect("/admin/agencyos/caddie/dashbord")` (konsolidert i caddie-skjerm).
- Stub. Redesign-prioritet: P3

### /admin/recording
- Fil: `src/app/admin/recording/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Coaching-opptak — Deepgram-transkripsjon + pipeline-status + historikk.
- Data vist: siste 30 SessionRecording + recovery-opptak (RECORDING >5 min) + `DEEPGRAM_API_KEY`-sjekk → `prisma.sessionRecording`.
- Komponenter: `EmptyState`, `RecordingControls` (`./recording-controls`), `RecordingAnalyzeButton`; lokale PipelineNode/MetaStat (`cn`).
- Layout og hierarki: rå mono-eyebrow + italic-hero (lokal, ikke AdminHero/AgPageHead) → Deepgram-advarsel → live recording-frame (pipeline+waveform+transcript) → 4 meta-stats → historikk-liste.
- Tilstander: empty + Deepgram-ikke-konfigurert-banner; loading/error delvis; analyze-knapp på PROCESSING.
- Interaksjoner: ta opp / analyser / vis transkripsjon.
- AK-domene vist: ingen (opptak/transkripsjon).
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig (rik) — egen lokal header-stil (4. idiom-variant).
- Redesign-prioritet: P2

### /admin/runder
- Fil: `src/app/admin/runder/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Coach-view over alle registrerte runder (score/vs par/SG).
- Data vist: siste 50 Round(+user/course) + total-count → `prisma.round`; snitt-score/vs-par/beste/SG-trend beregnet.
- Komponenter: `Sparkline` (`@/components/athletic`), `EmptyState`, `avatarBg`, `RunderFilterChip`; lokale KpiDark/KpiCard (`cn`).
- Layout og hierarki: lokal mono-eyebrow + italic-hero → 4 KPI (1 mørk-lime) m/sparkline → filter-rad → data-tett tabell; rad → spillerprofil.
- Tilstander: empty finnes; filter-input ikke koblet (readonly-aktig); loading/error MANGLER.
- Interaksjoner: rad → `/admin/spillere/{id}`; filter-chips (placeholder).
- AK-domene vist: score/vs par/SG-total, hcp.
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig — lokal header-idiom (samme familie som trackman).
- Redesign-prioritet: P2

### /admin/trackman
- Fil: `src/app/admin/trackman/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Coach-view over alle TrackMan-sesjoner (slag-volum/kilde/miljø).
- Data vist: siste 50 TrackManSession(+user) + total-count → `prisma.trackManSession`; 30d-aggregat.
- Komponenter: `EmptyState`, `avatarBg`, `TrackmanFilterChip`; lokale KpiDark/KpiCard.
- Layout og hierarki: lokal mono-eyebrow + italic-hero → 4 KPI → søk/filter-rad → data-tett tabell; rad → spillerprofil.
- Tilstander: empty finnes; søk/filter ikke koblet; loading/error MANGLER.
- Interaksjoner: rad → spillerprofil; filter-chips (placeholder).
- AK-domene vist: shot-count, TrackMan-miljø/kilde, hcp.
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig — lokal header-idiom (samme som runder).
- Redesign-prioritet: P2

### /admin/videoer
- Fil: `src/app/admin/videoer/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Last opp og del coaching-videoer med spillere.
- Data vist: PLAYER-spillere + ≤100 SessionVideo(+player/coach) → `prisma.user/sessionVideo`; ADMIN ser alle, coach kun egne.
- Komponenter: `AdminHero`, `EmptyState`, `VideoUploadForm`, `VideoCard`; lokal Kpi.
- Layout og hierarki: AdminHero → 4 KPI → opplastingsskjema → video-grid.
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: last opp, slett (eier/admin).
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — AdminHero-idiom.
- Redesign-prioritet: P3

### /admin/integrasjoner
- Fil: `src/app/admin/integrasjoner/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Status-dashboard for tredjepartstjenester (Google/Stripe/Notion/Anthropic/Resend/Supabase).
- Data vist: GoogleCalendarConnection for bruker, Stripe-sum siste 30d, env-flagg (STRIPE/ANTHROPIC/RESEND) → `prisma.googleCalendarConnection/booking` + `process.env`.
- Komponenter: `AdminHero`; lokale StatusPill/IntegrationCard.
- Layout og hierarki: AdminHero → 3-kol kort-grid (status-pill + CTA per tjeneste).
- Tilstander: status fra ekte koblinger/env; loading/error MANGLER.
- Interaksjoner: CTA-er → finance/email-templates/agents + eksterne (Notion/Supabase status).
- AK-domene vist: ingen (gating-relevant: betalingsintegrasjon).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — AdminHero-idiom; lenker til redirect-alias `/admin/finance`.
- Redesign-prioritet: P3

### /admin/email-templates
- Fil: `src/app/admin/email-templates/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): CRUD over slug-baserte e-postmaler brukt av agent-pipeline.
- Data vist: alle EmailTemplate → `prisma.emailTemplate`; gruppert på slug-prefiks.
- Komponenter: `AdminHero`, `TemplateForm` (`./template-form`).
- Layout og hierarki: AdminHero → sidebar (mal-liste + søk-input) + detalj-paneler (emne + foldbart innhold); «Send test» disabled.
- Tilstander: empty finnes; søk-input ikke koblet; loading/error MANGLER.
- Interaksjoner: ny/rediger/slug-slett; rediger → `/admin/email-templates/{id}/rediger`.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — AdminHero-idiom; «Send test» placeholder.
- Redesign-prioritet: P3

### /admin/email-templates/[id]/rediger
- Fil: `src/app/admin/email-templates/[id]/rediger/page.tsx`
- Flate: AgencyOS (mørk), 2-pane editor
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Rediger e-postmal med live preview.
- Data vist: EmailTemplate → `prisma.emailTemplate`; `testRecipient = user.email`.
- Komponenter: `EditorClient` (`./editor-client`).
- Layout og hierarki: ren editor-shell.
- Tilstander: `notFound()`; rest i klient.
- Interaksjoner: rediger + preview + send test.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/audit-log
- Fil: `src/app/admin/audit-log/page.tsx`
- Flate: AgencyOS (mørk) — men via `hub-frame`/`hubs.css` (importerer `@/components/hubs/hubs.css`), tunge inline `style`-objekter
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })` (kommentar sier ADMIN; faktisk COACH+ADMIN)
- Jobb (1 setning): Sikkerhets-hendelseslogg (siste 50) med kategori/status fra action-prefiks.
- Data vist: siste 50 AuditLog(+actor) → `prisma.auditLog` (`.catch(()=>[])`); kind/status utledet.
- Komponenter: ingen athletic — rå `hub-frame`/`hub-head`-klasser + inline-styles + lucide-ikoner.
- Layout og hierarki: hub-head (eyebrow «AGENCYOS · SIKKERHET» + stats) → liste (ikon/handling/aktør/status).
- Tilstander: empty finnes; loading/error via catch.
- Interaksjoner: ingen (les-only liste); detalj på egen rute (men ingen lenke herfra synlig).
- AK-domene vist: ingen.
- Designfil-referanse: `hubs.css` (intern hub-stil, ikke ren .dc.html).
- Nåværende designkvalitet: inkonsistent — bruker `hub-frame` + store inline-style-blokker (avviker fra Tailwind-token-mønster ellers). Brudd-risiko mot designsystem-regel (rå CSS-vars i style).
- Redesign-prioritet: P1

### /admin/audit-log/[id]
- Fil: `src/app/admin/audit-log/[id]/page.tsx`
- Flate: AgencyOS (mørk), DetailShell
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Detalj for én audit-event (før/etter-diff, relaterte events, eksport JSON).
- Data vist: AuditLog-event + relaterte (samme aktør ±15 min) → `prisma.auditLog`.
- Komponenter: `DetailShell`, `AthleticBadge`, `EmptyState`, `CopyButton`.
- Layout og hierarki: DetailShell; diff + relaterte + actions («Rull tilbake» placeholder).
- Tilstander: `notFound()`; empty; loading/error MANGLER.
- Interaksjoner: eksport JSON; rull-tilbake (placeholder).
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (DetailShell) — bedre enn liste-siden.
- Redesign-prioritet: P3

### /admin/reports
- Fil: `src/app/admin/reports/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Rapport-tiles (CSV/PDF + interne analyse-flater).
- Data vist: spiller-/økt-count + sesongår → `prisma.user/trainingPlanSession`; tile-liste statisk men meta-tall ekte.
- Komponenter: `AgPage/AgPageHead`, `NyRapportButton` (`./reports-actions`).
- Layout og hierarki: PageHead («Seks rapporter.» + «Ny rapport») → 3-kol tile-grid; CSV-tiles = `<a>` til `/api/admin/reports/*.csv`, øvrige `<Link>` til analyse-flater.
- Tilstander: ingen reelle (statisk grid); loading/error N/A.
- Interaksjoner: «Generer →» (CSV-eksport) / «Åpne →» (intern flate).
- AK-domene vist: ingen (rapport-meta).
- Designfil-referanse: `agencyos-app/screens-analyze.jsx` → ReportsScreen (per fil-doc).
- Nåværende designkvalitet: ferdig.
- Redesign-prioritet: P3

### /admin/reach
- Fil: `src/app/admin/reach/page.tsx`
- Flate: AgencyOS (mørk), klient-drevet
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Engasjement-/rekkevidde-dashbord per spiller (compliance, lesefrekvens, feature-bruk, daglig aktivitet 30d).
- Data vist: PLAYER + notifications/trainingPlanSession/AI-sessions/rounds/goals siste 30d → `prisma.*`; per-spiller aggregat + engagementScore.
- Komponenter: `ReachClient` (`./reach-client`).
- Layout og hierarki: all chrome i klient; server bygger `ReachData`.
- Tilstander: ærlige tomme tilstander (0-tall) når DB tom; loading/error i klient.
- Interaksjoner: i klient.
- AK-domene vist: SG-hub/runder/AI-caddie-bruk, compliance-%, status grønn/amber/rød.
- Designfil-referanse: ingen ren prototype.
- Nåværende designkvalitet: ferdig (klient-shell, rik aggregering).
- Redesign-prioritet: P3

### /admin/finance
- Fil: `src/app/admin/finance/page.tsx`
- Flate: redirect
- Jobb (1 setning): `permanentRedirect("/admin/okonomi")`.
- Stub. Redesign-prioritet: P3

### /admin/okonomi
- Fil: `src/app/admin/okonomi/page.tsx`
- Flate: AgencyOS (mørk), «hybrid terminal»
- Rolle/gating: `requireCapability(Capability.VIEW_FINANCE)` (capability-gated)
- Jobb (1 setning): Fakturaer/betalinger + abonnement med periode-filter.
- Data vist: Payment-aggregater (inntekt/utestående/betalte + forrige periode for delta), aktive PRO-subs, ≤50 betalinger(+user) → `prisma.payment/subscription`; `?p=mai|jun|q2`.
- Komponenter: `AgTable/AgChip/AgPage/AgPageHead/AgPlayerCell`; lokale KpiCard/PaymentChip (`cn`).
- Layout og hierarki: PageHead (periode-tabs server-side + «Ny faktura» disabled) → 4 KPI-strip → betalingstabell.
- Tilstander: empty finnes; «Ny faktura» disabled (faktura-generering kommer); loading/error MANGLER.
- Interaksjoner: periode-tabs (`?p=`); ny-faktura placeholder.
- AK-domene vist: abonnement (PRO/300 kr), beløp i kr, refund — fakturerings-gating-relevant.
- Designfil-referanse: «hybrid terminal design 2026-06-17» (per fil-doc).
- Nåværende designkvalitet: ferdig — disabled ny-faktura er eneste hull.
- Redesign-prioritet: P3

### /admin/settings
- Fil: `src/app/admin/settings/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Admin-hub med 3 faner (Organisasjon / Team & roller / Tilgang).
- Data vist: aktive locations(+facility-count), ADMIN/COACH-brukere(+grupper) → `prisma.location/user`; `?tab=`.
- Komponenter: `AgAvatar/AgChip/AgPage/AgPageHead/AgPlayerCell/AgTable` (`cn`).
- Layout og hierarki: PageHead → seg-faner (?tab) → org-grid / team-tabell / tilgang-liste (verdier «—» da org-innstillinger ikke modellert) → lenke til `/admin/settings/tilgang`.
- Tilstander: empty per fane; tilgang-rader viser «—» (ingen påfunn); loading/error MANGLER.
- Interaksjoner: faner; lenke til full tilgangsmatrise.
- AK-domene vist: eier/coach-rolle; ingen SG.
- Designfil-referanse: `agencyos-app/screens-analyze.jsx` → AdminScreen (per fil-doc).
- Nåværende designkvalitet: ferdig — bevisste «—» der modell mangler.
- Redesign-prioritet: P3

### /admin/settings/api
- Fil: `src/app/admin/settings/api/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })` (ADMIN ser alle nøkler, coach kun egne)
- Jobb (1 setning): API-nøkkel-administrasjon (opprett/revoker, scopes).
- Data vist: ApiKey(+user) → `prisma.apiKey`.
- Komponenter: `AdminHero`, `CreateApiKeyModal`, `RevokeButton`, `CopyPrefixButton`.
- Layout og hierarki: tilbake-lenke → AdminHero → nøkkel-liste (prefix/scopes/sist brukt) → dashed «Integrasjoner»-TODO-boks.
- Tilstander: empty finnes; loading/error MANGLER.
- Interaksjoner: opprett/revoker nøkkel, kopier prefix.
- AK-domene vist: ingen (sikkerhet).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — AdminHero-idiom; integrasjoner-seksjon er placeholder.
- Redesign-prioritet: P3

### /admin/settings/security
- Fil: `src/app/admin/settings/security/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Konto-sikkerhet — 2FA, passord-flyt, (planlagt) aktive økter.
- Data vist: `user.role/email/updatedAt` (sist oppdatert). Aktive økter/innloggingshistorikk MANGLER (TODO: ingen auth-audit).
- Komponenter: `AdminHero`, `Setup2FA` (gjenbrukt fra `portal/meg/sikkerhet`); lokale Section/MiniStat.
- Layout og hierarki: tilbake-lenke → AdminHero → Oversikt + To-faktor + Passord + «Aktive økter» (tom placeholder).
- Tilstander: «Aktive økter»-tom-state med ærlig «kommer»-tekst; loading/error MANGLER.
- Interaksjoner: 2FA-oppsett; passord via glemt-flyt.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — sentral funksjon (aktive økter) ikke implementert; AdminHero-idiom.
- Redesign-prioritet: P2

### /admin/settings/tilgang
- Fil: `src/app/admin/settings/tilgang/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb (1 setning): Read-only CBAC capability×rolle-matrise.
- Data vist: `Capability`-enum × `ROLLER` via `can(rolle,cap)` (`@/lib/auth/cbac`) — kode-utledet, ingen DB.
- Komponenter: `AdminHero`; rå tabell + lucide-ikoner.
- Layout og hierarki: AdminHero → info-boks (read-only) → matrise-tabell → forklaringskort.
- Tilstander: statisk; ingen empty/loading nødvendig.
- Interaksjoner: ingen (read-only; redigering krever kode-refaktor).
- AK-domene vist: capability-modell (VIEW_FINANCE/MANAGE_USERS m.fl.).
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (read-only) — AdminHero-idiom.
- Redesign-prioritet: P3

### /admin/klubb/innstillinger
- Fil: `src/app/admin/klubb/innstillinger/page.tsx`
- Flate: AgencyOS (mørk), klient-drevet
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb (1 setning): Multi-club setup — klubber, fasiliteter, åpningstider, daglig leder.
- Data vist: locations(+facilities) + ClubSettings-singleton → `prisma.location/clubSettings`; spiller-/coach-count per klubb via `homeClub`-fritekstmatch (User.locationId mangler i schema); tomme felt = «—».
- Komponenter: `AdminHero`, `KlubbInnstillingerClient` (`./klubb-innstillinger-client`); lokal Kpi.
- Layout og hierarki: AdminHero → 4 KPI → klient-komponent (klubb-kort + redigering).
- Tilstander: «—» ved manglende felt; loading/error MANGLER.
- Interaksjoner: rediger klubb/innstillinger (klient).
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig — men spiller/coach-kobling er fritekst-heuristikk (datasvakhet); AdminHero-idiom.
- Redesign-prioritet: P2

### /admin/team
- Fil: `src/app/admin/team/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requireCapability(Capability.MANAGE_USERS)`
- Jobb (1 setning): Coach/admin-team som kort-grid med roller og stats.
- Data vist: COACH/ADMIN(+_count grupper/availability) + total PLAYER-count → `prisma.user`.
- Komponenter: `AdminHero`, `EmptyState`; lokale CoachCard/Stat/Kpi/avatarBg.
- Layout og hierarki: AdminHero (rå rute-eyebrow) → 4 KPI → readonly søk-input → 2-kol coach-kort-grid.
- Tilstander: empty finnes (m/CTA inviter); søk readonly (ikke koblet); loading/error MANGLER.
- Interaksjoner: «Inviter coach» → `/admin/team/inviter`; mailto per kort.
- AK-domene vist: rolle (admin/coach), gruppe-/tidsvindu-count.
- Designfil-referanse: migrert fra `wireframe/design-files-v2/final/08-team.html` (per fil-doc — peker på ARKIVERT design-kilde, brudd på design-kilde-regel).
- Nåværende designkvalitet: halvferdig/inkonsistent — AdminHero, readonly-søk, fil-doc refererer forbudt wireframe-kilde.
- Redesign-prioritet: P2

### /admin/team/inviter
- Fil: `src/app/admin/team/inviter/page.tsx`
- Flate: AgencyOS (mørk), maks-xl skjema
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb (1 setning): Inviter ny coach via e-post-link.
- Data vist: ingen (skjema).
- Komponenter: `AdminHero`, `InviterCoachForm` (`./inviter-coach-form`, bruker `inviterCoach`-action).
- Layout og hierarki: AdminHero (rå rute-eyebrow) → skjema-kort.
- Tilstander: i skjema; shell loading/error MANGLER.
- Interaksjoner: send invitasjon.
- AK-domene vist: ingen.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (tynt skjema) — AdminHero-idiom.
- Redesign-prioritet: P3

### /admin/organisasjon
- Fil: `src/app/admin/organisasjon/page.tsx`
- Flate: AgencyOS (mørk) — via `HubFrame`/`HubCard` (`@/components/hubs`)
- Rolle/gating: `requireCapability(Capability.MANAGE_USERS)`
- Jobb (1 setning): Admin-hub (klubb/team/integrasjoner/innstillinger/agenter/maler/audit/profil).
- Data vist: coach/admin-count ekte → `prisma.user`. **Mange HubCard har HARDKODET demo-data**: «3 aktive»/«3 LIVE» agenter, «12 maler», «Sist endret 22. mai», «Siste hendelse 04:12», «Anders K. · Head Coach», «pro@akgolf.no», «—» integrasjoner.
- Komponenter: `HubFrame/HubHeader/HubStatSep/HubCard/HubPill` (`@/components/hubs`), `InnstillingerButton`.
- Layout og hierarki: HubHeader (eyebrow «AGENCYOS · HEAD COACH») → hub-grid med 8 navigasjons-kort.
- Tilstander: ingen reelle (mest statiske kort); loading/error N/A.
- Interaksjoner: kort → klubb/team/integrasjoner/settings/agents/email-templates/audit-log/profile.
- AK-domene vist: ingen.
- Designfil-referanse: `hubs-coach.jsx` (CoachAdmin) — intern hub, ikke design-handover.
- Nåværende designkvalitet: inkonsistent — hub-CSS-øy + hardkodede tall (bryter «aldri fabrikerte verdier»-prinsippet). Overlapper med /admin/settings (begge er admin-hub).
- Redesign-prioritet: P1

### /admin/profile
- Fil: `src/app/admin/profile/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Coachens offentlige profil (personalia, bio, sertifiseringer, galleri).
- Data vist: `user`-felt + `preferences`-JSON (certifications/languages/clubs, defensivt parset) + `ambition` som bio → ekte.
- Komponenter: `EditProfileForm` (`./edit-form`), `SkjulProfilButton`; lokale Section/FieldRow/ChipRow/DangerZone.
- Layout og hierarki: lokal eyebrow+italic-hero (ikke AdminHero/AgPageHead) → sticky avatar-aside + seksjoner (Personalia/Profesjonelt/Galleri/Farlig sone).
- Tilstander: tomtekst-placeholdere per felt; galleri = tomme upload-ruter (ikke koblet); loading/error MANGLER.
- Interaksjoner: rediger profil; skjul offentlig profil; «Se offentlig profil» → `/`.
- AK-domene vist: tier (Pro 300 kr/Gratis), hcp/homeClub.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: halvferdig — galleri-upload ikke implementert; egen lokal header-stil.
- Redesign-prioritet: P2

### /admin/stats/overview
- Fil: `src/app/admin/stats/overview/page.tsx`
- Flate: AgencyOS (mørk), `revalidate 300`
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN"] })`
- Jobb (1 setning): Admin-stats-dashbord (brukere/SG-data/turneringsdatabase/sync-status/git-commits).
- Data vist: brede counts (User/BrukerSgInput/Tournament/PgaPlayerSeason/PublicPlayer…) + sync-alder + siste 5 git-commits (`execSync git log`, hardkodet repo-path) → `prisma.*` + git.
- Komponenter: `Reveal`, `CountUp` (`@/components/stats/*`), `RaskeHandlinger` (`cn`); lokale Eyebrow/SectionHead/MiniStat/PlausibleCard.
- Layout og hierarki: lokal hero → KPI-strip → Plausible-placeholder (2 kort) → DB-status → sync-status → modereringskø → git-commits → raske handlinger.
- Tilstander: Plausible-kort «Krever integrasjon»; git-fallback tom; loading via Reveal-animasjon.
- Interaksjoner: → `/admin/stats/moderering`; cron-snarveier.
- AK-domene vist: SG-input/sammenligning-volum, turneringsdatabase, norske spillere.
- Designfil-referanse: ingen prototype.
- Nåværende designkvalitet: ferdig (rik) — men `execSync` med hardkodet maskinsti `/Users/anderskristiansen/...` (brekker på andre miljøer); Plausible ikke koblet.
- Redesign-prioritet: P2 (hardkodet sti er teknisk gjeld)

### /admin/stats/moderering
- Fil: `src/app/admin/stats/moderering/page.tsx`
- Flate: AgencyOS (mørk), klient-drevet
- Rolle/gating: `requirePortalUser({ allow: ["ADMIN","COACH"] })`
- Jobb (1 setning): Moderering-/GDPR-kø (turneringer/resultater/profil-endringer/slett-forespørsler).
- Data vist: INGEN — modell finnes ikke ennå, sender tomme arrays + 0-stats til klient (bevisst, GDPR-skjerm skal ikke vise falske slett-saker).
- Komponenter: `ModeringClient` (`./client`).
- Layout og hierarki: i klient (hero + KPI + tab-bar + stub-tabeller + GDPR-slett-flow + batch-bar).
- Tilstander: ærlig tom (alt 0/«—»); loading/error i klient.
- Interaksjoner: i klient (tabs, batch) — men ingen reelle data.
- AK-domene vist: GDPR/samtykke-flow (slett-forespørsler) — gating-relevant.
- Designfil-referanse: «design 20» (per fil-doc, intern).
- Nåværende designkvalitet: halvferdig — UI-skall uten datamodell (modererings-/GDPR-kø ikke bygget).
- Redesign-prioritet: P2

### /admin/hjelp
- Fil: `src/app/admin/hjelp/page.tsx`
- Flate: AgencyOS (mørk)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Hjelpesenter — søk, kategorier, populære artikler, kontakt-CTA.
- Data vist: INGEN DB — `CATEGORIES`/`ARTICLES` hardkodet statisk (artikkel-count, «Sett 1 247 ganger» er fabrikerte tall).
- Komponenter: `AdminHero`, `HjelpSearch` (`./hjelp-search`); lokale CategoryCard/ContactCard.
- Layout og hierarki: AdminHero → søk → kategori-grid → populære artikler → mørk kontakt-CTA-blokk.
- Tilstander: statisk; ingen empty/loading.
- Interaksjoner: søk (klient); kontakt → innboks/mailto/messages.
- AK-domene vist: ingen.
- Designfil-referanse: fil-doc sier migrert fra `wireframe/design-files-v2/final/11-hjelp.html` (FORBUDT arkiv-kilde — brudd på design-kilde-regel).
- Nåværende designkvalitet: halvferdig/inkonsistent — fabrikerte stats, forbudt design-kilde-referanse, AdminHero; artikler er døde ankere (`#id`).
- Redesign-prioritet: P2

### /admin/mer
- Fil: `src/app/admin/mer/page.tsx`
- Flate: AgencyOS (mørk), maks-640 (mobil «Mer»-fane)
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Mobil-lenkeliste som speiler desktop-sidebarens grupper.
- Data vist: ingen (statisk navigasjon, speiler `agencyos-sidebar.tsx`).
- Komponenter: `AgMobileRow/AgPage/AgPageHead/AgSectionHead` (agencyos/ui).
- Layout og hierarki: PageHead → seksjoner (Min uke/Stall & talent/Operasjon/Analysere/System) med 44px-rader.
- Tilstander: N/A (statisk).
- Interaksjoner: rad → respektiv flate; Workbench → `/admin/coach-workbench` (stub-href til M2).
- AK-domene vist: ingen.
- Designfil-referanse: net-new mobil-flate (Fase 4).
- Nåværende designkvalitet: ferdig — ren AgencyOS-port; Workbench-rad er bevisst stub.
- Redesign-prioritet: P3

### /admin/tilstander
- Fil: `src/app/admin/tilstander/page.tsx`
- Flate: AgencyOS (mørk), design-system showcase
- Rolle/gating: `requirePortalUser({ allow: ["COACH","ADMIN"] })`
- Jobb (1 setning): Katalog over 9 økt-kort-tilstander (planlagt→ferdig + unntak + flyt) — internt design-system-galleri.
- Data vist: INGEN DB — alt hardkodet demo. **Bryter navne-kanon**: «Markus»-arv-fri men bruker gamle/uautoriserte navn (Eline Krogh, Joachim Trønnes, Henrik Næss, Anna Karlsen, Lise Solum) + «Performance Pro» som økt-meta (skal være coaching-pakke, ikke vises slik).
- Komponenter: `AdminHero`; lokale SectionHeader/StateFrame/SessionCard/Spec. Bruker rå `var(--card)`/`var(--secondary)` i repeating-gradient inline (token-bruk uten hsl-wrapper).
- Layout og hierarki: AdminHero → 3 seksjoner (Livssyklus/Unntak/Flyt) med 9 tilstand-kort; «Eksporter»/«Bruk i Figma» disabled.
- Tilstander: statisk; ingen empty/loading.
- Interaksjoner: ingen (galleri); disabled-knapper.
- AK-domene vist: økt-livssyklus (planlagt/forbered/pågår/ferdig/avlyst/mangler/overlapp/forespurt/blokkert).
- Designfil-referanse: «design-system v2» (intern).
- Nåværende designkvalitet: inkonsistent — design-system-galleri i produksjons-rute; bryter navne-kanon + «Performance Pro»-regel; AdminHero. Trolig foreldreløs (utvikler-referanse, ikke ekte coach-flate).
- Redesign-prioritet: P1 (fjern eller flytt; navne-kanon-brudd)

### /admin/godkjenn-portal
- Fil: `src/app/admin/godkjenn-portal/page.tsx`
- Flate: AgencyOS (mørk) — men LYS-aktig editorial header (`em` italic primary), egen layout (ikke AgPage)
- Rolle/gating: `getCurrentUser()` + manuell rolle-sjekk ADMIN/COACH → redirect login
- Jobb (1 setning): Kvalitetssikring — liste alle PlayerHQ-ruter med godkjenningsstatus vs design-handoff.
- Data vist: PageApproval-statuser → `prisma.pageApproval`; rute-katalog fra `@/lib/portal-routes` (`PORTAL_ROUTES`/`CATEGORIES`).
- Komponenter: lokal Stat + rå tabeller per kategori; lucide-ikoner.
- Layout og hierarki: editorial header → 6-KPI-strip → tabell per kategori (side/designfil/status/sist vurdert + Live/Vurder-knapper).
- Tilstander: status-chips dekker pending/godkjent/avvik/skip; ingen empty nødvendig; loading/error MANGLER.
- Interaksjoner: «Live» → ruten; «Vurder» → `/admin/godkjenn-portal/review?route=`.
- AK-domene vist: ingen (intern QA-verktøy).
- Designfil-referanse: ingen prototype (meta-verktøy).
- Nåværende designkvalitet: inkonsistent — internt QA-verktøy, egen header-stil (ikke AgPageHead), rå tabeller. Foreldreløs ift. coach-bruk.
- Redesign-prioritet: P2 (internt verktøy — lav UI-prioritet)

### /admin/godkjenn-portal/review
- Fil: `src/app/admin/godkjenn-portal/review/page.tsx`
- Flate: AgencyOS — side-ved-side iframe-sammenligning
- Rolle/gating: `getCurrentUser()` + manuell ADMIN/COACH-sjekk → redirect login
- Jobb (1 setning): Side-ved-side godkjenning (live iframe vs designfil) m/forrige/neste-navigasjon.
- Data vist: PageApproval for ruten + `PORTAL_ROUTES`-naboer → `prisma.pageApproval`.
- Komponenter: lokal (iframes + status-knapper); `setApprovalStatus`-action.
- Layout og hierarki: tilbake → 2-iframe split → godkjenn/avvik/hopp-knapper + prev/next.
- Tilstander: redirect ved manglende/ukjent rute; loading/error MANGLER.
- Interaksjoner: sett status; naviger ruter.
- AK-domene vist: ingen.
- Designfil-referanse: meta-verktøy.
- Nåværende designkvalitet: ferdig (verktøy) — ikke coach-facing.
- Redesign-prioritet: P3 (internt verktøy)

### /admin/godkjenn-portal/koblinger  (+ /koblinger/[id])
- Fil: `src/app/admin/godkjenn-portal/koblinger/page.tsx`, `…/[id]/page.tsx`
- Flate: AgencyOS — internt verktøy
- Rolle/gating: `getCurrentUser()` + manuell ADMIN/COACH-sjekk → redirect login
- Jobb (1 setning): Oversikt over design-koblinger (DesignKobling) med status + foreslått rute (+ detalj per kobling).
- Data vist: DesignKobling(+groupBy status) → `prisma.designKobling`; `?status=`-filter.
- Komponenter: lokal liste + status-ikoner (lucide).
- Layout og hierarki: filter + liste; detalj på `[id]`.
- Tilstander: filter-gated; loading/error MANGLER.
- Interaksjoner: filtrer; kobling → detalj.
- AK-domene vist: ingen.
- Designfil-referanse: meta-verktøy.
- Nåværende designkvalitet: halvferdig (internt verktøy) — rå liste.
- Redesign-prioritet: P3 (internt verktøy)
