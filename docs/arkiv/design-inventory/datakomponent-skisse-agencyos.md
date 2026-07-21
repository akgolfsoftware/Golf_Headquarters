# Datakomponent-skisse — AgencyOS (13 huber)

> **Tegne-brief for Claude Design.** Hva som faktisk ligger PÅ hver tette skjerm: layout (desktop+mobil),
> faner/visnings-bytter, datakomponenter sone-for-sone (gjenbruk fra `komponenter.md` eller NY), nøkkelhandlinger,
> states. Bygger på `konsolideringskart-agencyos.md` + `funksjonskart-agencyos.md` + `ia-fasit.md`.
> **Tema: MØRKT** (tokens i `spesifikasjon-faser-agencyos.md` Del A). Generert 2026-06-30. READ-ONLY.

## 1. Cockpit

- **Jobb:** Start dagen — se på ett blikk hva som skjer i dag, hva som haster og hvilke spillere trenger meg (se, ikke gjøre).
- **Layout desktop:** 3-kolonne Bloomberg. Topp: KPI-strip over hele bredden. Venstre kolonne = «I dag» (tidslinje/økter). Midt = «Haster» (signal-feed + prioriterte spillere). Høyre = «Varsler» + «Live nå». Brief-sammendrag som bånd øverst under KPI-strip.
- **Layout mobil:** Vertikal kort-stack i fast rekkefølge: AI-brief-kort → KPI-strip (2×2 grid) → Haster-liste → I dag (dagens økter) → Varsler → Live (kollapset accordion). Faner blir horisontal segment-control eller scroll-til-seksjon.
- **Faner / visnings-bytter:**
  - Brief (AI-morgenbrief) — FANE/sone.
  - I dag — HUB-PRIMÆR-sone.
  - Uka (7-dagers) — FANE (tidshorisont-bytte).
  - Live (Mission Control) — FANE.
  - Varsler-sone — VISNINGS del av cockpit (delt datakilde med Innboks).
  - «Mer» — kun mobil-navigasjons-skall, ikke innholdsfane.
- **Datakomponenter (sone for sone):**
  - KPI-strip (økter i dag, haster-antall, uleste, belegg %): `[gjenbruk: athletic/kpi-grid + athletic/kpi]`.
  - AI-brief-bånd (sammendrag + handlingsknapper): `[gjenbruk: athletic/featured-card]` med `[gjenbruk: athletic/eyebrow]`.
  - I dag — dagens økter som tidslinje: `[gjenbruk: athletic/calendars/day-planner]` (desktop) / `[gjenbruk: athletic/itinerary (itinerary-row)]` (mobil-liste).
  - Uka — 7-dagers kanban: `[gjenbruk: athletic/calendars/week-grid]`.
  - Haster — prioriterte spillere/signaler: `[gjenbruk: athletic/action-list + athletic/queue-item]`.
  - Signal-feed (proaktive AI-signaler): `[NY: SignalFeed]` (kompakt tidslinje-feed med ikon + spiller + grunn + CTA-peker).
  - Varsler-liste: `[gjenbruk: athletic/action-list]` + `[gjenbruk: athletic/pulse-dot]` for uleste.
  - Live (Mission Control) — pågående økter nå: `[NY: LiveOpsPanel]` (live-rader med presence-dot + status).
  - Mini-trend i KPI-kort: `[gjenbruk: athletic/sparkline]`.
- **Nøkkelhandlinger:** Eksporter brief (CSV/PDF), Send brief til spiller, Marker varsel lest, «Åpne i Innboks» (peker videre — Cockpit gjør ikke selv), klikk spiller → Spiller 360.
- **States:**
  - Tom: «Ingen økter i dag» / «Innboksen er tom» med rolig empty-state-illustrasjon `[gjenbruk: ui/empty-state]`.
  - Laster: skjelett på KPI-strip + listerader `[gjenbruk: ui/skeleton]`.
  - Feil: bånd «Kunne ikke hente brief — prøv igjen» (brief feiler isolert, resten av cockpit står).
  - Fylt: full 3-kolonne med tall, feed og live-rader.

---

## 2. Stall

- **Jobb:** Oversikt over hele stallen — én liste med briller (roster/risiko/kø/engasjement/grupper) og bore inn i én spiller eller gruppe.
- **Layout desktop:** Master-detalj split. Venstre/hoved = data-tett roster-tabell (full bredde når 360-panel lukket). Høyre = 360-snabbpanel som glir inn ved valgt spiller. KPI-strip + filter/visnings-rad over tabellen.
- **Layout mobil:** Kort-stack — hver spiller blir et kompakt rad-kort (navn, HCP, SG-trend, status-pill). Visnings-bytte via segment-control øverst. 360-panel åpnes som bunn-ark/full side.
- **Faner / visnings-bytter:** Alt er VISNINGS-BYTTE på samme roster (regel 2):
  - Roster (tabell) — primær.
  - Tavle (kanban) — visnings-bytte.
  - Risiko (heatmap) — visnings-bytte.
  - Engasjement/reach — visnings-bytte.
  - Kø (oppfølging) — visnings-bytte.
  - Grupper — visnings-bytte (gruppe-grid).
  - Gruppe-detalj + Gruppe-timeplan — FANE inne i gruppe-context.
- **Datakomponenter (sone for sone):**
  - Visnings-bytte-rad (roster/tavle/risiko/reach/kø/grupper): `[gjenbruk: athletic/filter-pill-bar]` + `[gjenbruk: shared/view-mode-toggle]`.
  - KPI-strip (antall spillere, i risiko, i kø, snitt-HCP): `[gjenbruk: athletic/kpi-grid]`.
  - Roster — data-tett tabell (HCP, SG-trend, pakke, betaling, status, siste aktivitet): `[NY: RosterTable]` (sorterbar, kolonne-valg; bygger på `athletic/data` + `athletic/status-pill` + `athletic/sparkline` per rad).
  - Tavle — kanban: `[gjenbruk: athletic/queue-item]` i kolonner.
  - Risiko — heatmap (8-kol): `[gjenbruk: athletic/calendars/heatmap-calendar]` / `[gjenbruk: stats/stats-heatmap]`.
  - Engasjement — aggregat-liste: `[gjenbruk: athletic/action-list]` + `[gjenbruk: athletic/sparkline]`.
  - Kø — oppfølgings-kanban: `[gjenbruk: athletic/queue-item]` med prioritet-drag.
  - Grupper — gruppe-grid: `[gjenbruk: athletic/card + athletic/kpi]` per gruppe.
  - Gruppe-detalj: `[gjenbruk: athletic/hero]` + medlems-`[NY: RosterTable]` + `[gjenbruk: athletic/pyramid-progress]`.
  - Gruppe-timeplan: `[gjenbruk: athletic/calendars/week-grid]`.
  - 360-snabbpanel (detalj): `[gjenbruk: shared/detail-shell]` med spillerkort.
  - Avatar med tone (lime=økt i dag): `[gjenbruk: athletic/avatar + athletic/presence-dot]`.
- **Nøkkelhandlinger:** Søk/filtrer roster, bytt visning, oppdater prioritet (kø), legg til/fjern gruppemedlem, åpne Spiller 360, «Ny spiller»-wizard (fra Stall).
- **States:**
  - Tom: «Ingen spillere ennå» → CTA «Legg til spiller» `[gjenbruk: ui/empty-state]`.
  - Laster: tabell-skjelettrader `[gjenbruk: shared/loading-skeleton]`.
  - Feil: inline feilbånd over tabell, retry.
  - Fylt: full roster + valgfritt 360-panel.

---

## 3. Spiller 360

- **Jobb:** Stå i én spiller og se/endre alt — profil, fremgang, tester, plan, meldinger. Åpnes fra Stall.
- **Layout desktop:** Hero-topp (spiller-identitet + nøkkeltall) + fane-flate under. Innenfor hver fane: seksjons-stack / 2-kol der det passer. Sticky fane-rail under hero.
- **Layout mobil:** Hero komprimert (avatar + navn + HCP-pill + tier) → faner som horisontal scroll-segment → seksjons-stack vertikalt. Rediger/Tildel-test/Ny = bunn-ark/full-side.
- **Faner / visnings-bytter:**
  - Oversikt (360-landing) — primær.
  - Profil (DNA-radar + skadehistorikk) — FANE.
  - Fremgang (SG-sparkline + volum-korrelasjon) — FANE.
  - Tester — FANE.
  - Plan — FANE (åpner Workbench for spilleren, regel 3).
  - Workbench — FANE/zoom (plan-fra-spiller).
  - Tildel test — MODAL/WIZARD.
  - Rediger spiller — MODAL/panel.
  - Ny spiller — MODAL/WIZARD (fra Stall, samme komponent).
- **Datakomponenter (sone for sone):**
  - Hero (avatar, navn, HCP, tier, status, nøkkel-KPI): `[gjenbruk: athletic/hero (hero/)]` + `[gjenbruk: athletic/kpi]`.
  - Oversikt-seksjonsstack (pyramide, siste runder, neste økt, mål): `[gjenbruk: athletic/pyramid-progress]` + `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/featured-card]`.
  - Profil — DNA-radar: `[gjenbruk: stats/big-radar]` ; skadehistorikk/fasiliteter: `[gjenbruk: athletic/data-card]`.
  - Fremgang — SG-sparkline + trend: `[gjenbruk: athletic/sparkline]` + `[gjenbruk: stats/trend-graf]`; volum-korrelasjon: `[gjenbruk: stats/stats-histogram]`.
  - Tester — test-tabell + trend: `[gjenbruk: athletic/data]` (tabell) + `[gjenbruk: stats/trend-graf]`.
  - Plan — plan-indeks + 5-fane detalj: `[gjenbruk: athletic/tab-bar]` + plan-kort (deler Workbench-komponenter).
  - Coach-notat/direktiv-felt: `[gjenbruk: ui/textarea]` + `[gjenbruk: athletic/editorial]` for visning.
  - Milepæl-timeline: `[gjenbruk: athletic/calendars/period-timeline]` / `[NY: MilestoneTimeline]` om vertikal hendelses-stripe trengs.
  - Rediger-form (sticky save): `[gjenbruk: shared/page-header]` + `[gjenbruk: ui/input/select/switch]` + `[gjenbruk: shared/profil-rediger]`.
  - Tildel-test-modal: `[gjenbruk: shared/modal]` + TestDefinition-liste `[gjenbruk: athletic/action-list]`.
- **Nøkkelhandlinger:** Rediger spiller, endre status, tildel test, lagre coach-notat/direktiv, logg milepæl, inviter forelder, legg i talent-sporing, åpne Workbench/plan.
- **States:**
  - Tom: nye spillere uten data → «Ingen tester/runder ennå» per seksjon `[gjenbruk: ui/empty-state]`.
  - Laster: hero-skjelett + seksjons-skjelett.
  - Feil: per-seksjon feilkort (radar feiler isolert fra resten).
  - Fylt: full hero + alle faner med data.

---

## 4. Workbench

- **Jobb:** Bygg trening — stall-felles bibliotek (maler/driller/standardøkter) + plan-fra-spiller, fra årsplan ned til enkeltøkt. Ett trykkpunkt (låst).
- **Layout desktop:** Hub med fane-/zoom-rail øverst (HubTabRail). Hovedflate = mørkt planleggings-panel. Venstre = palette-sidebar (driller/standardøkter å dra inn). Over panel: hero (eyebrow + display-tittel + lead) + KPI-strip + innsiktsstripe på Gantt/Uke/Økt.
- **Layout mobil:** Hub-rail + zoom-rail (Årsplan/År/Måned/Uke/Dag) under. Palette → bunn-ark. Mobil action-topbar (publiser/AI/palette/ny økt) + sticky MobileStatusbar (volum-bar + kategori-chips FYS/TEK/SLAG/SPILL). Time-grid kollapser til dag-liste.
- **Faner / visnings-bytter (hub-rail, 7-8 zoom/faner):**
  - Plan (kanban Utkast/Aktiv/Fullført) — FANE.
  - Maler (plan-templates grid) — FANE.
  - Driller (bibliotek + AI-forslags-kø) — FANE.
  - Standardøkter (palette) — FANE.
  - Teknisk (L-fase-plan) — FANE.
  - Gantt (År/Årsplan) — zoom.
  - Uke (time-grid 07–22) — zoom.
  - Økt (inline OktDetailTab) — zoom/fane.
  - Plan-bygger / Ny mal / Ny drill / Mal-editor / Drill-editor — MODAL/WIZARD.
- **Datakomponenter (sone for sone):**
  - Hub-rail (7-8 faner): `[gjenbruk: athletic/tab-bar]` / `[NY: HubTabRail]` (hvis ikke allerede bygget — refereres i design-porting-gate).
  - Palette-sidebar (drill/standardøkt-drag): `[gjenbruk: shared/calendar (DrillMalLibrary, OktMalLibrary, PlanSidebar)]` / `[NY: PaletteSidebar]`.
  - Plan-kanban: `[gjenbruk: athletic/queue-item]` i status-kolonner (statisk, ingen drag — status-flyt i detalj).
  - Plan-detalj (5 faner: Oversikt/Øvelser/Notater/Rapport): `[gjenbruk: athletic/tab-bar]` + `[gjenbruk: athletic/data]`.
  - Maler-grid (L-fase, «Brukt N×», match-%): `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/badge]` + match-%-plassholder.
  - Mal-effekt (PlanEffectiveness, SG-deltas): `[gjenbruk: stats/trend-graf]` + `[gjenbruk: athletic/sparkline]`.
  - Drill-grid (kategori-filtrert): `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/filter-pill-bar]`.
  - AI drill-forslags-kø: `[gjenbruk: athletic/action-list]` med godkjenn/avvis.
  - Gantt (årsplan/faser): `[gjenbruk: athletic/calendars/year-plan-gantt]` + `[gjenbruk: athletic/calendars/period-timeline]`.
  - Uke time-grid (vertikal 07–22, overlapp-lanes, drag): `[gjenbruk: shared/calendar (UkeView/WeekView)]`.
  - Økt-detalj (inline, AK-FORMEL/pyramide/øvelser): `[gjenbruk: shared/calendar (SessionEditor)]` + `[gjenbruk: athletic/pyramid-progress]` / `[NY: OktDetailTab]`.
  - Zoom-switcher (Årsplan/År/Måned/Uke/Dag): `[gjenbruk: athletic/filter-pill-bar]`.
  - KPI-strip + InsightsStripe: `[gjenbruk: athletic/kpi-grid]` + `[NY: InsightsStripe]`.
  - Mobil action-topbar + MobileStatusbar: `[NY: WorkbenchMobileTopbar]` + `[NY: MobileStatusbar]`.
  - Tildel-plan multi-select: `[gjenbruk: ui/checkbox]` + `[gjenbruk: athletic/action-list]`.
- **Nøkkelhandlinger:** Opprett/publiser/paus/arkiver plan, tildel plan til spillere, AI-periodiser/generer plan, godkjenn/avvis AI-plan-action, CRUD mal/drill, rate effectiveness, legg økt i plan, flytt økt (drag), ny økt på tid.
- **States:**
  - Tom: ingen teknisk plan/sesongmål/Gantt-faser → ærlig empty state per fane `[gjenbruk: ui/empty-state]`; seedet scenario for gate-screenshot.
  - Laster: panel-skjelett + grid-skjelett.
  - Feil: per-fane feilbånd; palette-drag deaktivert ved lastefeil.
  - Fylt: full hub med palette + plan + KPI + innsiktsstripe.

---

## 5. Drift

- **Jobb:** Drifte dagene — kalender, booking, anlegg, tilgjengelighet, tjenester + live-økt-modus.
- **Layout desktop:** Fane-flate + KPI-strip. Hovedfane = kalender (hybrid ukegrid + dag-detalj split). Live-økt åpnes som fullskjerm-modus (egen 3-stegs flyt) over driften.
- **Layout mobil:** Fane-segment øverst → kompakt kalender (dag/uke-liste) → booking-liste som kort-stack. Live-økt = fullskjerm-takeover med stort fokus-display.
- **Faner / visnings-bytter:**
  - Kalender (uke/måned/dag) — FANE; måned + tilgjengelighet = VISNINGS-BYTTE/lag på kalender.
  - Bookinger & kapasitet — FANE.
  - Anlegg (+ anlegg-detalj) — FANE.
  - Tjenester — FANE.
  - TrackMan-sesjoner — FANE.
  - Opptak/transkripsjon — FANE.
  - Videoer — FANE.
  - Live-økt (brief → aktiv → summary) — MODAL/WIZARD (fullskjerm-modus).
  - Ny booking — MODAL/WIZARD (5-stegs).
- **Datakomponenter (sone for sone):**
  - Fane-rail: `[gjenbruk: athletic/tab-bar]`.
  - KPI-strip (økter i dag, belegg %, ledige slots, forespørsler): `[gjenbruk: athletic/kpi-grid]`.
  - Kalender hybrid (uke-grid + dag): `[gjenbruk: shared/calendar (KalenderRoot, WeekView, MonthView, DayView)]`.
  - Måned-zoom: `[gjenbruk: athletic/calendars/month-grid]`.
  - Tilgjengelighet (slots på måned): `[gjenbruk: shared/calendar (MiniCalendar)]` + slot-lag.
  - Bookinger — KPI + kapasitet-heatmap + liste: `[gjenbruk: athletic/calendars/heatmap-calendar]` + `[gjenbruk: shared/calendar (CapacityLoadBar)]` + `[gjenbruk: athletic/data]`.
  - Booking-rad (bekreft/avvis/kanseller): `[gjenbruk: athletic/queue-item]` / `[gjenbruk: athletic/itinerary (itinerary-row)]`.
  - Anlegg-tiles: `[gjenbruk: athletic/card]`; anlegg-detalj kart+kalender: `[gjenbruk: shared/calendar]` + `[NY: FacilityMap]` (banekart/celle-grid).
  - Tjenester-tabell (pris/varighet): `[gjenbruk: athletic/data]`.
  - TrackMan data-tett tabell: `[gjenbruk: athletic/data]`.
  - Opptak-liste: `[gjenbruk: athletic/action-list]` + `[gjenbruk: athletic/pulse-dot]` for pågående transkripsjon.
  - Videoer-grid: `[gjenbruk: athletic/card]`.
  - Live-økt fullskjerm: `[gjenbruk: shared/fullscreen-template]` — brief-steg (fokuspunkt) → aktiv (live-melding + følg sanntid) → summary (vurder + lagre); bruker `[gjenbruk: athletic/calendars/day-planner]` + `[NY: LiveSessionTerminal]`.
  - Ny-booking-wizard: `[gjenbruk: shared/modal]` + stegvis form.
- **Nøkkelhandlinger:** Bekreft/avvis/kanseller booking, opprett/flytt/kanseller fasilitet-booking, legg til/endre slot, CRUD tjeneste, start økt (live), send live-melding, lagre coach-vurdering, send feedback, GCal-synk.
- **States:**
  - Tom: «Ingen bookinger denne uka» / tom kalender med CTA «Åpne for booking».
  - Laster: kalender-skjelett + KPI-skjelett.
  - Feil: synk-feilbånd (GCal), booking-rad feilstatus.
  - Fylt: full kalender + booking-liste; live-modus aktiv = takeover.

---

## 6. Innsikt

- **Jobb:** Forstå hvordan stallen presterer og utvikler seg (analyse, SG, tester, runder, compliance, rapporter).
- **Layout desktop:** Fane-flate + KPI-strip. Hver fane = data-viz-tung flate (graf + tabell side om side). Bloomberg-tetthet.
- **Layout mobil:** Fane-segment → KPI-grid (2-kol) → graf full bredde → tabell som scroll/kort-stack.
- **Faner / visnings-bytter:**
  - Stall (KPI + pyramide-fordeling per gruppe) — FANE (lag-snitt slått sammen hit).
  - SG (hvor slag vinnes/tapes) — FANE.
  - Tester (oversikt + detalj + benchmarks) — FANE; foreslåtte tester = VISNINGS-BYTTE (forslags-kø).
  - Runder — FANE.
  - Compliance (plan vs. faktisk) — FANE.
  - Rapporter (CSV-eksport) — FANE.
  - Tildel test — MODAL/WIZARD (route-trigget).
- **Datakomponenter (sone for sone):**
  - Fane-rail: `[gjenbruk: athletic/tab-bar]`.
  - KPI-strip (snitt-HCP, snitt-SG, test-deltakelse, compliance %): `[gjenbruk: athletic/kpi-grid]`.
  - Stall — pyramide-fordeling per gruppe: `[gjenbruk: athletic/pyramid-progress]` + `[gjenbruk: shared/calendar (PyramideBar)]`.
  - Krysstabulering/kohort: `[gjenbruk: stats/kohort-linjegraf]`.
  - SG — hvor slag vinnes/tapes: `[NY: SGFlow]` (SG-elv/flow per kategori) + `[NY: BenchmarkScrubber]` (dra nivå → percentil) + `[NY: ApproachHeatLadder]` (avstandsbøtter).
  - SG-fordeling/violin: `[NY: DistributionRadar]` (fordelings-/violin-radar per SG-kategori).
  - Tester — KPI + trend + nivåstige: `[gjenbruk: stats/trend-graf]` + `[gjenbruk: athletic/data]`; benchmarks/nivåstige: `[gjenbruk: stats/big-radar]` / `[NY: BenchmarkLadder]`.
  - Foreslåtte tester (godkjenn/avvis): `[gjenbruk: athletic/action-list]`.
  - Runder — score/SG-tabell + sparkline: `[gjenbruk: athletic/data]` + `[gjenbruk: athletic/sparkline]`.
  - Compliance — plan vs. reps: `[NY: ComplianceBar]` (plan-vs-faktisk bånd) + `[gjenbruk: stats/stats-histogram]`.
  - Rapporter — eksport-tiles: `[gjenbruk: athletic/card]` + `[gjenbruk: shared/eksport]`.
- **Nøkkelhandlinger:** Bytt fane, filtrer per gruppe/periode, tildel test, godkjenn/avvis foreslått test, godkjenn/avvis benchmark-pending, kjør benchmark-synk, eksporter rapport (CSV).
- **States:**
  - Tom: «Ikke nok data for analyse ennå» per fane `[gjenbruk: ui/empty-state]`.
  - Laster: graf-skjelett + tabell-skjelett.
  - Feil: per-fane feilkort; benchmark-synk feilbånd.
  - Fylt: full graf+tabell; resultat-chips nøytrale (FYS-formel ikke låst — ingen referanseverdier hardkodes).

---

## 7. Innboks

- **Jobb:** Alt som venter på svar — én kø med typefiltre (Melding · Forespørsel · Godkjenning · Varsel). Innboks = gjøre (regel 1).
- **Layout desktop:** Master-detalj split. Venstre = kø-liste (filtrerbar på type). Høyre = detalj-/svar-panel (tråd + AI-utkast + handlinger). Filter-rad + søk øverst.
- **Layout mobil:** Kø-liste full skjerm → trykk åpner detalj som full-side/bunn-ark. Type-filter som segment-control eller chip-rad øverst. Swipe-handlinger (ferdig/arkiver).
- **Faner / visnings-bytter:**
  - Innboks (alle) — primær master-detalj.
  - Melding / Forespørsel / Godkjenning / Varsel — VISNINGS-BYTTE (typefiltre på samme kø).
  - Godkjenning-detalj (rationale + diff) — FANE/detalj-panel.
  - E-postmaler — FANE (utgående kommunikasjon).
  - Rediger e-postmal — MODAL/WIZARD (2-pane editor).
- **Datakomponenter (sone for sone):**
  - Type-filter-rad (Melding/Forespørsel/Godkjenning/Varsel + tellere): `[gjenbruk: athletic/filter-pill-bar]` + `[gjenbruk: athletic/badge]`.
  - Kø-liste (master): `[gjenbruk: athletic/queue-item]` + `[gjenbruk: athletic/pulse-dot]` (ulest) + `[gjenbruk: athletic/avatar]`.
  - Detalj/svar-panel: `[gjenbruk: shared/detail-shell]` + meldings-tråd + `[gjenbruk: ui/textarea]` (svar) + `[gjenbruk: shared/mic-button]` (tale-til-tekst).
  - AI-utkast-forslag: `[NY: AiDraftCard]` (foreslått svar med godta/rediger).
  - Forespørsel-rad (booking-ønske, godkjenn/avvis/be om mer info): `[gjenbruk: athletic/queue-item]` + `[gjenbruk: athletic/button]`.
  - Godkjenning-detalj (rationale + diff): `[NY: ApprovalDiff]` (før/etter plan-diff) + `[gjenbruk: athletic/badge]` (risiko-nivå).
  - Varsel-rad: `[gjenbruk: athletic/action-list]` (delt datakilde med Cockpit).
  - E-postmaler (slug-gruppert CRUD): `[gjenbruk: athletic/data]` + `[gjenbruk: athletic/card]`.
  - Mal-editor (2-pane): `[gjenbruk: shared/modal]` + `[gjenbruk: ui/textarea]` + forhåndsvisning.
- **Nøkkelhandlinger:** Send melding/svar, marker lest/ferdig, godkjenn/avvis forespørsel, be om mer info, godta/avvis plan-action, batch-godkjenn lav-risiko, marker varsel lest, CRUD e-postmal, send testmail.
- **States:**
  - Tom: «Innboksen er tom — alt er besvart» (rolig empty-state) `[gjenbruk: ui/empty-state]`.
  - Laster: kø-skjelett + detalj-skjelett.
  - Feil: send-feil inline i svar-panel (utkast bevares), retry.
  - Fylt: full kø + detalj; ulest-tellere per type-filter.

# Datakomponent-skisse — AgencyOS hub 8–13

> **Hva dette er:** Tegne-brief for Claude Design. Hva som ligger PÅ hver tette skjerm i AgencyOS-hubene 8–13.
> Grunnlag: `konsolideringskart-agencyos.md` (hvilke ruter → hub), `funksjonskart-agencyos.md` (funksjoner),
> `komponenter.md` (eksisterende bibliotek — gjenbruk), `spesifikasjon-faser-agencyos.md` Del A (mørke tokens + nye komponenter),
> `ia-fasit.md` (regler). READ-ONLY — ingen kildekode rørt. Generert 2026-06-30.
>
> **Tema (alle skjermer her):** AgencyOS = MØRKT. Bg `#0A0B0A`, kort `#171817`, hevet `#1E1F1D`, panel `#141513`,
> fg `#F0F0F0`, muted `#A6A8A3`, border `#262725`, lime `#D1F843` (tekst på lime `#0A140C`). Lime KUN aktiv/haster/primær.
> Lucide-ikoner 24px/1.5px. 8pt-grid, data-tette flater kan bruke 12/14px (Bloomberg-tetthet er ønsket).
>
> **Komponent-merking:** `[gjenbruk: <navn>]` = finnes i biblioteket. `[NY: <navn>]` = må designes/bygges.

---

## 8. Turneringer

- **Jobb:** Melde spillere på turneringer, holde resultater og status, rydde dubletter fra synk.
- **Layout desktop:** Topp page-header (eyebrow «TURNERINGER» + tittel + KPI-strip: kommende · pågående · resultater inn · påmeldte totalt). Under: én bred turneringsliste (data-tett tabell/kortliste med status-chip). Klikk en rad → glir inn detalj-flate (master-detalj eller full subside) med tre soner: påmeldte-roster, resultat-tabell, turnerings-KPI.
- **Layout mobil:** KPI-strip kollapser til horisontalt scrollende mini-kort. Tabellen blir vertikal kortliste (én turnering = ett kort: navn, dato, sted, status-chip, antall påmeldte). Detalj åpnes fullskjerm med faner (Påmeldte · Resultater · Info).
- **Faner / visnings-bytter:**
  - Hovedflate = turneringsliste (HUB-PRIMÆR, fra `tournaments`).
  - Status-filter på lista: Kommende · Pågående · Fullført (visnings-bytte).
  - Detalj-faner (fra `tournaments/[id]`): Påmeldte · Resultater · Info/KPI.
- **Datakomponenter (sone for sone):**
  - Page-header + eyebrow: `[gjenbruk: page-header]`, `[gjenbruk: eyebrow]`.
  - KPI-strip øverst: `[gjenbruk: kpi-grid]` / `[gjenbruk: kpi]`.
  - Turneringsliste m/ status-chip: data-tett tabell `[gjenbruk: data-card]` rader + `[gjenbruk: status-pill]` for status. Filter-rad: `[gjenbruk: filter-pill-bar]`.
  - Tidsakse-visning (valgfri): turneringer plottet på tidslinje `[gjenbruk: TurneringMarker]` + `[gjenbruk: year-plan-gantt]`.
  - Detalj — påmeldte: roster-liste m/ avatar `[gjenbruk: avatar]` + `[gjenbruk: queue-item]`-rad, multi-select for på/avmelding.
  - Detalj — resultater: resultat-tabell (plassering/score/SG) `[gjenbruk: data-card]`, evt. `[gjenbruk: sparkline]` for trend.
  - Detalj — KPI: `[gjenbruk: kpi-grid]` (antall påmeldte, snitt-plassering, beste).
  - Fellesmelding-knapp → `[gjenbruk: button]` (sendTournamentFellesmelding).
- **Nøkkelhandlinger:** «Ny turnering» (primær, lime) → 5-stegs wizard `[gjenbruk: fullscreen-template]` (MODAL/WIZARD). «Meld på spillere» / «Fjern påmelding» (multi-select). «Legg til resultat». «Send fellesmelding til påmeldte». «Håndter dubletter» → dublett-merge-modal `[gjenbruk: modal]` (manuell vs synk side-ved-side).
- **States:**
  - **Tom:** ingen turneringer → `[gjenbruk: empty-state]` «Ingen turneringer ennå» + CTA «Ny turnering».
  - **Laster:** `[gjenbruk: skeleton]` tabell-skjelett.
  - **Feil:** `[gjenbruk: empty-state]`-variant m/ feilikon + «Prøv igjen».
  - **Fylt:** liste m/ status-chips; pågående-rad får lime pulse-prikk `[gjenbruk: pulse-dot]`.

---

## 9. Talent

- **Jobb:** Følge talentene mot toppen — radar-vurdering, kohort, region, sammenligning, eksterne WAGR-referanser, ressurser.
- **Layout desktop:** Page-header (eyebrow «TALENT» + tittel + KPI-strip: sporede spillere · snitt-WAGR-trend · nye i pipeline). Under header: fane-rad (Radar · Kohort · Region · Sammenlign · WAGR · Ressurser) rendret som sub-tabs. Hovedinnhold bytter per fane. Radar-fanen er landing: pentagon-radar (venstre) + percentile/pyramide-panel (høyre), under: sporet-spiller-liste.
- **Layout mobil:** Fane-rad blir horisontalt scrollende pill-rad `[gjenbruk: tab-bar]`. Radar/pentagon sentreres fullbredde, paneler stables under. Lister blir vertikale kort. Region-kart blir tappbart kompakt Norge-kart med liste under.
- **Faner / visnings-bytter (fra konsolideringskartet):**
  - **Radar** (HUB-PRIMÆR-landing, fra `talent` + `talent/radar`): pentagon-radar + WAGR-trend.
  - **Kohort** (fra `talent/kohort`): U10–Senior snitt-radar.
  - **Region** (fra `talent/region`): Norge-pin-kart, regional pipeline.
  - **Sammenlign** (fra `talent/sammenligning`): inntil 4 spillere H2H.
  - **WAGR** (fra `talent/wagr-benchmark`): referansespillere/kalibrering.
  - **Ressurser** (fra `talent/ressurser`): filter-grid bibliotek.
  - **Scout/oppdag** (visnings-bytte, fra `talent/discovery`): ikke-sporede PLAYER-brukere.
  - Talent-360-profil (fra `talent/[playerId]` + `talent/radar/[playerId]`): spiller-context radar-vurdering 1–10.
- **Datakomponenter (sone for sone):**
  - Header + KPI: `[gjenbruk: page-header]`, `[gjenbruk: kpi-grid]`.
  - Fane-rad: `[gjenbruk: tab-bar]`.
  - Radar/pentagon (5-akset vurdering): `[gjenbruk: stats/big-radar]` (fra `src/components/stats/`).
  - WAGR-trend: linjegraf `[gjenbruk: stats/trend-graf]` + `[gjenbruk: sparkline]`.
  - Percentile/pyramide-panel: `[gjenbruk: pyramid-progress]`.
  - Sporet-spiller-liste: `[gjenbruk: queue-item]` rader m/ `[gjenbruk: avatar]` + `[gjenbruk: badge]` (nivå).
  - Kohort-fanen: snitt-radar `[gjenbruk: stats/big-radar]` + kohort-linjegraf `[gjenbruk: stats/kohort-linjegraf]`.
  - Region-fanen: Norge-pin-kart `[gjenbruk: stats/norgeskart]`.
  - Sammenlign-fanen: H2H-radar (overlay 2–4) `[gjenbruk: stats/big-radar]` + sammenligningstabell `[gjenbruk: data-card]`.
  - WAGR-fanen: referanse-liste `[gjenbruk: data-card]` + import-handling.
  - Ressurser-fanen: filter-grid `[gjenbruk: filter-pill-bar]` + kort-grid `[gjenbruk: card]`.
  - Scout/discovery: søk-input `[gjenbruk: ui/input]` + treff-liste `[gjenbruk: queue-item]`.
  - Milepæl-timeline (i spiller-profil): `[gjenbruk: editorial/]`-timeline / `[gjenbruk: itinerary]`-rad.
  - **NB:** ingen NY komponent — `stats/`-settet (big-radar, norgeskart, kohort-linjegraf, trend-graf) dekker talent fullt.
- **Nøkkelhandlinger:** «Oppdater radar» (oppdaterRadar, 1–10 pentagon). «Legg til i talent-sporing» (leggTilITalent, fra scout). «Importer WAGR-spiller» → import-modal (MODAL/WIZARD). «Logg milepæl». «Legg til ressurs». «Sammenlign valgte» (multi-select → Sammenlign-fane).
- **States:**
  - **Tom:** ingen sporede talenter → `[gjenbruk: empty-state]` + CTA «Gå til Scout».
  - **Laster:** `[gjenbruk: skeleton]` radar-/kort-skjelett.
  - **Feil:** feil-empty-state + retry.
  - **Fylt:** radar tegnet, spiller-punkt i lime, kohort-median i muted overlay.

---

## 10. Økonomi

- **Jobb:** Se MRR/innbetalt/utestående og håndtere fakturaer + betalinger. ADMIN/finans-rolle (CBAC `VIEW_FINANCE`).
- **Layout desktop:** Page-header (eyebrow «ØKONOMI» + tittel). Øverst: bred KPI-strip (MRR · Innbetalt denne mnd · Utestående · Aktive abonnement). Under: inntektsgraf (full bredde, månedlig) — det rikere bildet fra `agencyos/okonomi` smeltes inn. Nederst: faktura/betalings-tabell (data-tett, status-chip betalt/forfalt/ventende).
- **Layout mobil:** KPI-strip → horisontalt scrollende mini-kort. Inntektsgraf komprimeres (siste 6 mnd). Tabell → vertikal kortliste (kunde · beløp · status-chip · forfallsdato).
- **Faner / visnings-bytter:** Én flate (HUB-PRIMÆR fra `okonomi`; `agencyos/okonomi` SLÅTT SAMMEN hit). Ingen tunge faner. Mulig visnings-bytte på tabellen: Alle · Betalt · Utestående · Forfalt (filter-pill).
- **Datakomponenter (sone for sone):**
  - Header: `[gjenbruk: page-header]`, `[gjenbruk: eyebrow]`.
  - KPI-strip (MRR/innbetalt/utestående/abonnement): `[gjenbruk: kpi-grid]` + `[gjenbruk: kpi]` (mono-tall) + delta-pil.
  - Inntektsgraf (månedlig MRR/inntekt): `[gjenbruk: stats/trend-graf]` eller `[gjenbruk: sparkline]` forstørret; bar/linje per måned.
  - Faktura/betalings-tabell: `[gjenbruk: data-card]` rader + `[gjenbruk: status-pill]` (betalt=success-tone, forfalt=destructive-tone, ventende=warning-tone).
  - Filter-rad: `[gjenbruk: filter-pill-bar]`.
  - Tjeneste-pris-kobling (delt m/ Drift): pris vises read-only her, redigeres i Drift/Tjenester.
  - **Ingen NY komponent** — KPI + trend-graf + tabell dekker. (Fase 4 fyller med ekte Stripe-data; ingen kortdetaljer i UI.)
- **Nøkkelhandlinger:** «Send faktura» (Fase 4, Resend) → bekreft-modal. «Marker som betalt». «Eksporter» (CSV) `[gjenbruk: print-button]` / eksport-modal. Filter-bytter på tabellen.
- **States:**
  - **Tom:** ingen betalinger → `[gjenbruk: empty-state]` «Ingen transaksjoner ennå».
  - **Laster:** `[gjenbruk: skeleton]` KPI + tabell.
  - **Feil:** feil-empty-state (f.eks. Stripe ikke koblet) + «Koble Stripe» → Oppsett/Integrasjoner.
  - **Fylt:** KPI m/ delta, graf, tabell m/ status-chips. Forfalt-rader får destructive-kant.

---

## 11. AI-senter

- **Jobb:** Caddie (proaktiv + chat), agenter, agent-team, aktivitet/audit. Mest ADMIN.
- **Layout desktop:** Page-header (eyebrow «AI-SENTER» + tittel + status-strip: aktive agenter · utkast i kø · siste kjøring · AI-feil). Fane-rad: Caddie · Agenter · Team · Aktivitet. Landing = Caddie-dashbord (rikeste bildet, fra `caddie/dashbord`): proaktiv forslags-panel (venstre, action-list med utkast/fleet/audit) + Caddie-chat (høyre) eller fleet-oversikt.
- **Layout mobil:** Fane-rad → scrollende pill-rad `[gjenbruk: tab-bar]`. Caddie-chat fullbredde m/ sticky input nederst. Forslags-panel blir egen tab/sone. Agent-tabell → vertikale kort.
- **Faner / visnings-bytter (fra konsolideringskartet):**
  - **Caddie** (HUB-PRIMÆR-landing fra `caddie/dashbord`; chat fra `agencyos/caddie`): proaktiv forslags-panel + co-agent + personlig chat.
  - **Agenter** (fra `agents` + `agents/[agentId]`): agent-pipeline, kjøringer, stats, trigger; detalj = konfig/kjøring/forslag.
  - **Team** (fra `agent-team`): sekvensielt fler-agent-kjør.
  - **Aktivitet** (fra `caddie/aktivitet`): tidslinje + AI-feil/audit.
  - **Chat** (visnings-bytte/fane fra `agenter`): fler-modell AI-chat (Claude/Gemini/Grok/Ollama).
- **Datakomponenter (sone for sone):**
  - Header + status-strip: `[gjenbruk: page-header]`, `[gjenbruk: kpi-grid]`.
  - Fane-rad: `[gjenbruk: tab-bar]`.
  - Caddie proaktiv forslags-panel: `[gjenbruk: action-list]` + forslags-kort `[gjenbruk: card]` (utkast m/ godta/avvis). Hardt signal + foreslått handling → `[NY: signal-feed / trigger-kort]` (Fase 3, gjenbrukes her for Caddie-proaktiv-stripe).
  - Caddie-chat: chat-bobler (Caddie + bruker); for MORAD-svar utvides bobler m/ kilde-sitat (`[NY: chat-boble m/ kilde-sitat]` — Fase 5 #8, utvidelse av eksisterende chat).
  - Agent-pipeline-tabell: `[gjenbruk: data-card]` rader (agent · siste kjøring · status · trigger-knapp) + `[gjenbruk: status-pill]`.
  - Agent-detalj: konfig-panel `[gjenbruk: card]` + kjøre-logg `[gjenbruk: ticker]` / `[gjenbruk: itinerary]`-rad.
  - Aktivitet-tidslinje: `[gjenbruk: editorial/]`-timeline + AI-feil m/ destructive-tone-`[gjenbruk: badge]`.
  - Team-runner: sekvens-visning `[gjenbruk: action-list]` (steg-status).
  - Fler-modell chat: modell-velger `[gjenbruk: ui/select]` + chat.
  - **NY her:** kun chat-boble-utvidelse (kilde-sitat, Fase 5) + gjenbruk av `[NY: signal-feed]` (eies av Fase 3).
- **Nøkkelhandlinger:** «Kjør Caddie proaktiv» (kjorCaddieProaktiv). «Godta/avvis utkast». «Trigger agent manuelt» (triggerAgentManually). «Kjør team». «Send chat». Filter på aktivitet (alt · feil · audit).
- **States:**
  - **Tom:** ingen forslag → «Alt ajour» rolig empty-state (ikke lime). Ingen agent-kjøringer → empty-state.
  - **Laster:** `[gjenbruk: skeleton]` + Caddie-tenker-indikator (`[gjenbruk: pulse-dot]`).
  - **Feil:** AI-feil vises i Aktivitet m/ destructive-tone; chat-feil → inline retry.
  - **Fylt:** forslag i kø, agent-tabell m/ siste kjøring, aktivitet-tidslinje.

---

## 12. Arbeidsflyt

- **Jobb:** Egne oppgaver, prosjekter og Notion-synk. Mest ADMIN. «Min uke» som landing.
- **Layout desktop:** Page-header (eyebrow «ARBEIDSFLYT» + tittel). Fane-rad: Min uke · Oppgaver · Prosjekter · Notion. Landing = «Min uke» (HUB-PRIMÆR fra `workspace`): 3-kolonne (I dag · Denne uka · Senere) m/ oppgavekort. «Tildelt meg»-aggregat (ventende godkj./foresp./oppgaver) som sone øverst eller egen visnings-bytte.
- **Layout mobil:** Fane-rad → scrollende pill-rad. «Min uke» 3-kol → vertikal seksjonsstabel (I dag-seksjon, så Denne uka, så Senere). Oppgaver-fanen: view-toggle (Liste/Kanban/Kalender) — kanban scroller horisontalt, kalender komprimeres.
- **Faner / visnings-bytter (fra konsolideringskartet):**
  - **Min uke** (HUB-PRIMÆR fra `workspace`): I dag/Denne uka/Senere.
  - **Oppgaver** (fra `workspace/oppgaver`; `handlingssenter` SLÅTT SAMMEN): view-toggle Liste/Kanban/Kalender; detalj fra `workspace/oppgaver/[id]`.
  - **Prosjekter** (fra `workspace/prosjekter`; `prosjekter` SLÅTT SAMMEN): grid m/ filter + stats.
  - **Notion** (fra `workspace/notion`): databaser, mapping, sync.
  - **Tildelt meg** (visnings-bytte fra `workspace/tildelt-meg`): aggregat på Min uke.
- **Datakomponenter (sone for sone):**
  - Header + fane-rad: `[gjenbruk: page-header]`, `[gjenbruk: tab-bar]`.
  - Min uke 3-kol: kolonne-seksjoner m/ oppgavekort `[gjenbruk: queue-item]` / `[gjenbruk: action-list]`.
  - «Tildelt meg»-aggregat: blandet liste (godkjenning/forespørsel/oppgave) `[gjenbruk: queue-item]` m/ type-`[gjenbruk: badge]`.
  - Oppgaver view-toggle: `[gjenbruk: view-mode-toggle]` (Liste/Kanban/Kalender).
  - Oppgave-liste/tabell: `[gjenbruk: data-card]` kolonner.
  - Oppgave-kanban: kolonne-board `[gjenbruk: queue-item]`-kort (status-kolonner).
  - Oppgave-kalender: `[gjenbruk: month-grid]` / `[gjenbruk: week-grid]`.
  - Oppgave-detalj (sub-tasks/aktivitet/metadata): `[gjenbruk: detail-shell]` + `[gjenbruk: card]` seksjoner.
  - Prosjekt-grid: `[gjenbruk: card]` / `[gjenbruk: featured-card]` + filter `[gjenbruk: filter-pill-bar]` + stats `[gjenbruk: kpi]`.
  - Notion-synk-oppsett: status-kort `[gjenbruk: card]` + mapping-tabell `[gjenbruk: data-card]` + synk-knapp `[gjenbruk: button]`.
  - **Ingen NY komponent.**
- **Nøkkelhandlinger:** «Ny oppgave». «Sett notat» (setNotes). «Marker ferdig» (markInboxItemDone). View-toggle. «Synk Notion nå». Filter på prosjekter.
- **States:**
  - **Tom:** ingen oppgaver → `[gjenbruk: empty-state]` «Ingenting på agendaen». Notion ikke koblet → CTA «Koble Notion».
  - **Laster:** `[gjenbruk: skeleton]` kolonner/grid.
  - **Feil:** synk-feil → inline banner + retry.
  - **Fylt:** oppgaver fordelt på I dag/uke/senere; haster-oppgave m/ destructive-kant, dagens m/ subtil lime-markør (kun aktiv).

---

## 13. Oppsett

- **Jobb:** Organisasjon, team, integrasjoner, API, sikkerhet, logg, min profil. ADMIN.
- **Layout desktop:** Page-header (eyebrow «OPPSETT» + tittel). Venstre vertikal under-nav ELLER topp-fane-rad: Organisasjon · Team · Integrasjoner · API · Sikkerhet · Logg · Min profil · Hjelp. Hovedinnhold bytter per fane (settings-mønster: seksjons-kort m/ form-felter + sticky save).
- **Layout mobil:** Fane-rad → scrollende pill-rad eller sammenleggbar nav-liste. Hver fane = vertikal seksjonsstabel m/ form-kort. Sticky save-bar nederst.
- **Faner / visnings-bytter (fra konsolideringskartet):**
  - **Organisasjon** (HUB-PRIMÆR fra `organisasjon`; `settings` + `klubb/innstillinger` SLÅTT SAMMEN/FANE): klubb/multi-club-innstillinger.
  - **Team** (fra `team`): coacher/admin card-grid; «Inviter coach» (MODAL/WIZARD fra `team/inviter`).
  - **Min profil** (fra `profile`): egen konto/personalia + rediger.
  - **Integrasjoner** (fra `integrasjoner`; kalender-synk fra `settings/calendar`): GCal/Stripe/Notion/Anthropic/Resend/Supabase statuskort.
  - **API** (fra `settings/api`): nøkkel-liste, opprett/revoke/kopier.
  - **Sikkerhet** (fra `settings/security`): rolle-oversikt + 2FA.
  - **Tilgang** (fra `settings/tilgang`): CBAC-matrise (read-only).
  - **Logg** (fra `audit-log` + `audit-log/[id]`): hendelse-liste + diff/rull tilbake.
  - **Hjelp** (fra `hjelp`): statisk støtteinnhold, søk/kategorier/kontakt.
- **Datakomponenter (sone for sone):**
  - Header + under-nav/fane-rad: `[gjenbruk: page-header]`, `[gjenbruk: tab-bar]`.
  - Organisasjon: seksjons-kort `[gjenbruk: card]` + form-felter `[gjenbruk: ui/input]`, `[gjenbruk: ui/select]`, `[gjenbruk: ui/switch]`; multi-club-liste `[gjenbruk: data-card]`; sticky save `[gjenbruk: button]`.
  - Team: coach/admin card-grid `[gjenbruk: card]` + `[gjenbruk: avatar]` + rolle-`[gjenbruk: badge]`; inviter-modal `[gjenbruk: modal]`.
  - Min profil: profil-form `[gjenbruk: card]` + `[gjenbruk: avatar-upload]` + sticky save.
  - Integrasjoner: statuskort-grid `[gjenbruk: card]` m/ koblet/ikke-koblet-`[gjenbruk: status-pill]` + `[gjenbruk: pulse-dot]` (live-helse); test-knapp.
  - API: nøkkel-liste `[gjenbruk: data-card]` + `[gjenbruk: copy-button]` + revoke `[gjenbruk: button]` (destructive).
  - Sikkerhet: 2FA-oppsett-kort `[gjenbruk: card]` + rolle-oversikt `[gjenbruk: data-card]`.
  - Tilgang: CBAC-matrise (read-only grid) `[gjenbruk: data-card]` tabell.
  - Logg: hendelse-liste `[gjenbruk: data-card]` / `[gjenbruk: queue-item]`; detalj = diff-visning `[gjenbruk: detail-shell]` + rull-tilbake-knapp.
  - Hjelp: søk-input `[gjenbruk: ui/input]` + kategori-kort `[gjenbruk: card]` + kontakt-CTA.
  - **Ingen NY komponent.**
- **Nøkkelhandlinger:** «Lagre» (sticky, per fane). «Inviter coach». «Koble/koble fra integrasjon» (f.eks. disconnectGoogleCalendar). «Test e-post» (sendTestEmail). «Opprett/revoke API-nøkkel». «Aktiver 2FA». «Rull tilbake» (fra Logg-detalj). «Sjekk DB-helse» (sjekkDbHelse).
- **States:**
  - **Tom:** ingen team-medlemmer → empty-state + «Inviter». Ingen API-nøkler → empty-state + «Opprett nøkkel».
  - **Laster:** `[gjenbruk: skeleton]` form/kort.
  - **Feil:** integrasjon-feil → statuskort i destructive-tone + «Koble på nytt»; lagre-feil → inline.
  - **Fylt:** seksjoner m/ verdier, integrasjoner m/ grønn/rød status, logg m/ hendelser.

> **NB — dev-verktøy hører IKKE hjemme i Oppsett.** `godkjenn-portal` (+`/koblinger`, `/koblinger/[id]`, `/review`),
> `tilstander` (design-system-katalog) og `stats/overview` + `stats/moderering` er interne dev-/design-verktøy.
> De flyttes ut av hoved-IA til en skjult `/admin/dev`-krok (IA-fasit-regel) — de skal IKKE tegnes inn i Oppsett-navet.
> Oppsett er ren trener-/admin-konfigurasjon, ikke dev-katalog.
