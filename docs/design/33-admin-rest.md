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
