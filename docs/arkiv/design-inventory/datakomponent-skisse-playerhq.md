# Datakomponent-skisse — PlayerHQ (5 faner + 4 sidespor)

> **Tegne-brief for Claude Design.** Hva som ligger PÅ hver tette skjerm: layout (mobil-først + desktop),
> faner/seksjoner, datakomponenter sone-for-sone (gjenbruk eller NY), nøkkelhandlinger, states.
> Bygger på `konsolideringskart-playerhq.md` + `funksjonskart-playerhq.md` + `ia-fasit.md`.
> **Tema: LYST, mobil-først** (tokens i `spesifikasjon-faser-playerhq.md` Del A). Generert 2026-06-30. READ-ONLY.

# Datakomponent-skisse — PlayerHQ (tegne-brief for Claude Design)

> **READ-ONLY skisse. Dato 2026-06-30.** Hva som ligger PÅ hver tette skjerm — 5 faner + 4 sidespor.
> Tema: **LYST, mobil-først (430px)**. Bg `#FAFAF7`, kort `#FFFFFF`, fg `#0A1F17`, muted `#5E5C57`,
> primær CTA = **forest `#005840` med lime tekst `#D1F843`**, accent lime `#D1F843`, sand `#F1EEE5`,
> border `#E5E3DD`. **ALDRI lime-på-lys flate.** Lucide-ikoner, 8pt-grid.
> `[gjenbruk: x]` = finnes i biblioteket. `[NY: x]` = må designes/bygges.
> Kilder: konsolideringskart, funksjonskart, komponenter, spesifikasjon-faser, ia-fasit.

---

## Hjem

- **Jobb:** «Hva skal JEG gjøre i dag» + motivasjon (streak/milepæler/feiring/utfordringer/leaderboard løftet hit).
- **Layout mobil (primær):** kort-kolonne i `max-w-[430px]`, global PortalShell-topbar (hamburger + PLAYERHQ + varsel-bjelle), 5-fane bunnbar nederst. Vertikal scroll: hero → fokus-kort → motivasjon → dagens økt → SG-mini → coach-notat → nytt.
- **Layout desktop:** to-kolonne over samme rekkefølge — venstre hovedkolonne (hero, fokus, dagens økt, SG-mini), høyre skinne (motivasjon/streak, coach-notat, varsel-stripe).
- **Seksjoner (ovenfra og ned):**
  - **Hero** — profilbilde + tier-pill «PlayerHQ · {tier}» (Anders-unntak: profilbilde+tier-pill øverst), greeting, samlet headline.
  - **«Jobb med dette i dag»** — største svakhet + 1–2 driller.
  - **Motivasjon** — streak, neste milepæl, framgang.
  - **Dagens økt** — planlagt økt med start-CTA.
  - **SG-mini** — kompakt SG-fordeling med lenke til Analysere.
  - **Coach-notat** — siste melding fra coach.
  - **Utfordringer/Leaderboard** — motivasjons-seksjoner (liste → modal).
- **Datakomponenter (sone for sone):**
  - Hero: `[gjenbruk: athletic/hero]` + `[gjenbruk: athletic/avatar]` + `[gjenbruk: athletic/status-pill]` (tier-pill) + `[gjenbruk: athletic/greeting]`.
  - Fokus: `[NY: «Jobb med dette»-kort]` (svakhet → 1–2 driller, «Start»/«Legg i plan»; deles m/ AgencyOS #1).
  - Motivasjon: `[NY: streak/motivasjon-blokk]` (streak + neste milepæl + framgang) — bygger på `[gjenbruk: athletic/calendars/streak-calendar]` + `[gjenbruk: athletic/pyramid-progress]`.
  - Dagens økt: `[gjenbruk: athletic/featured-card]` eller `[gjenbruk: athletic/cards/]` + `[gjenbruk: athletic/day-cal]`.
  - SG-mini: `[gjenbruk: athletic/kpi-ring]` / `[gjenbruk: athletic/sparkline]` (kompakt SG-fordeling).
  - Coach-notat: `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/avatar]`.
  - Utfordringer: `[gjenbruk: athletic/action-list]` + `[gjenbruk: athletic/card]`; leaderboard `[gjenbruk: stats/stats-leaderboard-card]`.
  - Feiring (overlay): `[NY: framgangsfeiring]` (modal/overlay, mestrings-/milepæl-feiring).
  - Varsel-stripe: `[gjenbruk: shared/notification-bell]` + stripe på `[gjenbruk: athletic/card]`.
- **Modaler:** Ny utfordring (wizard), Utfordring-detalj, Feiring (overlay etter plan ferdig).
- **Nøkkelhandlinger:** «Start dagens økt» (forest+lime CTA), «Legg i plan» (fokus-kort), «Bli med» (utfordring), åpne coach-notat.
- **States:** tom (ingen økt i dag → empty-state «Ingen planlagt — book/lag økt»; ingen streak → nøytral motivasjon) / laster (`[gjenbruk: shared/loading-skeleton]`) / feil (`[gjenbruk: ui/empty-state]` m/ retry) / fylt (alle kort med data).

---

## Planlegge

- **Jobb:** All planlegging i Workbench (zoom årsplan→dag). Planlegge = ett trykkpunkt inn til Workbench.
- **Layout mobil (primær):** fane-rot er ett trykkpunkt → Workbench lanserings-hub. Workbench: hub-fane-rail øverst (horisontal scroll-chips), under den mobil zoom-rail (Årsplan/År/Måned/Uke/Dag), så aktiv hub-fane-innhold i kort-kolonne. Mobil action-topbar (WORKBENCH-ordmerke + ikon-handlinger). Bunnbar synlig.
- **Layout desktop:** mørkt planleggings-panel (Workbench-chrome) med above-panel hero (eyebrow + display-tittel + lead), venstre PaletteSidebar (drills/maler), hub-fane-rail + zoom-switcher i topbar, hovedflate = valgt zoom (Gantt/Uke time-grid/Økt).
- **Hub-faner (7):** Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt (År) · Uke · Økt.
- **Zoom-nivåer:** Årsplan · År · Måned · Uke · Dag.
- **Datakomponenter (sone for sone):**
  - Hub-fane-rail: `[gjenbruk: athletic/tab-bar]` (HubTabRail-idiom).
  - Zoom-rail: `[gjenbruk: athletic/filter-pill-bar]` (Årsplan/År/Måned/Uke/Dag).
  - Gantt (År): `[gjenbruk: athletic/calendars/year-plan-gantt]` + `[gjenbruk: athletic/calendars/period-timeline]` (periodisering, GRUNN/SPES/TURN-faser).
  - Måned: `[gjenbruk: athletic/calendars/month-grid]`.
  - Uke: `[gjenbruk: athletic/calendars/week-grid]` (UkeView time-grid 07–22, overlapp-lanes, grip-håndtak).
  - Dag: `[gjenbruk: athletic/calendars/day-planner]`.
  - Teknisk plan: L-fase-tidslinje på `[gjenbruk: athletic/calendars/period-timeline]` + `[gjenbruk: athletic/card]`.
  - Sesongmål: `[gjenbruk: athletic/card]` mål-kort + `[gjenbruk: athletic/pyramid-progress]`.
  - Maler/Standardøkter: filterchips `[gjenbruk: athletic/filter-pill-bar]` + kortgrid `[gjenbruk: athletic/data-card]` (L-fase-ikon, «Brukt N×», «—»-plassholder for match-%).
  - Palette (desktop): `[gjenbruk: shared/calendar/PlanSidebar]` + `[gjenbruk: shared/calendar/DrillMalLibrary]` / `[gjenbruk: shared/calendar/OktMalLibrary]`.
  - KPI-strip + innsiktsstripe (Gantt/Uke/Økt): `[gjenbruk: athletic/kpi-grid]` + `[gjenbruk: athletic/kpi]`.
  - Plan-status-pill: `[gjenbruk: athletic/status-pill]` (ekte PlanStatus).
  - Plan-justering (Fase 3): `[NY: plan-endring-godta-kort]` («Planen er endret fordi [signal] → [Godta/Spør coach]»).
- **Modaler/wizard:** Rediger periode, Mål-bygger (`[gjenbruk: shared/calendar/PeriodeModal]`), AI mål-bygger, AI foreslå drill, AI foreslå turnering, Drill-detalj, Legg-til-økt (coach-affordance).
- **Nøkkelhandlinger:** «Legg i plan» (mal/std-økt), dra økt på time-grid, «AI-periodiser», «Ny økt», FORRIGE/NESTE uke, «Godta» (plan-justering).
- **States:** tom (ingen teknisk plan/sesongmål/Gantt-faser → ærlig empty-state per hub-fane) / laster (skeleton i panel) / feil (retry) / fylt (seedet plan med økter på time-grid).

---

## Gjennomføre

- **Jobb:** Dagens økt, kalender, booking-fane, live-økt (fullskjerm), logg + verktøy.
- **Layout mobil (primær):** fane-rad øverst (I dag · Kalender · Booking), kort-kolonne under aktiv fane, bunnbar synlig. Live-økt og test-gjennomføring åpner som **fullskjerm-flyt utenfor bunnbar**.
- **Layout desktop:** samme faner som horisontal rad; «I dag» som hovedkolonne + ukeoversikt på siden; kalender utvider til full uke/måned-grid.
- **Faner:** I dag · Kalender · Booking.
- **Datakomponenter (sone for sone):**
  - Fane-rad: `[gjenbruk: athletic/tab-bar]`.
  - I dag: `[gjenbruk: athletic/itinerary/]` (dagens økter) + `[gjenbruk: athletic/featured-card]` (neste økt) + `[gjenbruk: athletic/day-cal]`.
  - Kalender: `[gjenbruk: shared/calendar/PortalKalenderWrapper]` + `[gjenbruk: shared/calendar/MiniCalendar]` + `[gjenbruk: shared/calendar/WeekView]`/`MonthView`.
  - Booking-fane: `[gjenbruk: athletic/queue-item]` / `[gjenbruk: athletic/action-list]` (kommende bookinger) — peker til Booking-sidespor.
  - Verktøy inne i økt: Putte-lab + break-tabell `[gjenbruk: athletic/card]` + `[gjenbruk: shared/number-spinner]`.
  - **Live-økt (FULLSKJERM, 5 steg):** brief → aktiv → logger → tapper → summary, på `[gjenbruk: shared/fullscreen-template]`:
    - Brief: `[gjenbruk: athletic/hero]` + øvelsesliste-preview.
    - Aktiv: timer/steg `[gjenbruk: athletic/kpi-ring]` + `[gjenbruk: ui/progress-ring]` + steg-liste.
    - Logger: drill-logger `[gjenbruk: shared/number-spinner]` + `[gjenbruk: athletic/action-list]`.
    - Tapper: score-tapper `[NY: score-tapper-pad]` (rask tap-input for slag/score — finnes ikke i biblioteket).
    - Summary: `[gjenbruk: athletic/kpi-grid]` + `[gjenbruk: athletic/pyramid-progress]` (oppsummering, frosset).
- **Modaler/wizard:** Ny økt (handlingsvalg), Ønsket økt (be coach), Logg treningsøkt (volum per SG, `[gjenbruk: shared/calendar/]` volum-input).
- **Nøkkelhandlinger:** «Start økt» (→ live fullskjerm), «Ny økt», «Be om økt», «Logg økt», book-CTA.
- **States:** tom (ingen økt i dag → empty-state) / laster (skeleton) / feil (retry) / fylt (økter i listen + kalender fylt). Live-flyt egne states: brief/aktiv/pauset/fullført.

---

## Analysere

- **Jobb:** Les tallene — én flate med faner, ingen spredte adresser.
- **Layout mobil (primær):** fane-rad øverst (scroll-chips: SG · Runder · TrackMan · Tester · Statistikk), data-tett kort-kolonne under (her får flaten tettne mot Bloomberg-tetthet), bunnbar synlig. Drill-down (kølle-detalj, runde-detalj, metrikk-detalj) = visnings-bytte/overlay på samme flate.
- **Layout desktop:** faner som horisontal rad; data-viz får full bredde (radar + percentil-meter side-om-side), tabeller (runder/TrackMan) utvider til full kolonne-tabell.
- **Underfaner (5):** SG · Runder · TrackMan · Tester · Statistikk.
- **Datakomponenter (sone for sone):**
  - Fane-rad: `[gjenbruk: athletic/tab-bar]`.
  - **SG-fane:** percentil per akse + slag-gap + nivå-badge:
    - `[NY: percentil-meter]` (din percentil, spiller-vennlig; deles m/ AgencyOS).
    - `[NY: nivå-score-badge]` (5-trinns benchmark-nivå A–K; deles m/ AgencyOS).
    - `[NY: fordelings-radar (consumer)]` (deg mot kohort, 5 SG-akser; deles m/ AgencyOS) — bygger på `[gjenbruk: stats/big-radar]`.
    - Paneler (drill-down): kølle/benchmark/best-vs-nå/forhold/utstyr/strategi/yardage på `[gjenbruk: athletic/data-card]` + `[gjenbruk: athletic/sparkline]`.
    - `[NY: benchmark-scrubber]` (dra nivå → percentil; bygger på `[gjenbruk: stats/stats-range-slider]`).
    - `[NY: approach-varmestige]` (avstandsbøtter, innspill-benchmark).
  - **Runder-fane:** runde-liste `[gjenbruk: athletic/data/]` tabell + `[gjenbruk: athletic/pagination]`; runde-detalj `[gjenbruk: athletic/card]`; slag-for-slag `[gjenbruk: stats/stats-heatmap]` (hull-visning).
  - **TrackMan-fane:** data-tabell `[gjenbruk: athletic/data/]` + `[gjenbruk: stats/stats-histogram]` (spredning per parameter).
  - **Tester-fane:** test-tabell `[gjenbruk: athletic/data/]` + `[gjenbruk: athletic/kpi]`; resultat-chips nøytrale (FYS-formel ikke låst — ingen referanseverdier). Katalog-velger `[gjenbruk: athletic/filter-pill-bar]`.
  - **Statistikk-fane:** metrikk-kort `[gjenbruk: athletic/kpi-grid]` + `[gjenbruk: stats/trend-graf]`; sammenlign `[gjenbruk: stats/kohort-linjegraf]`.
  - Delbart kort (Fase 4): `[NY: delbart spillerkort]` (trading card, eksporterbart bilde: nivå/percentil/framgang).
- **Fullskjerm:** Test-gjennomføring (scorekort) på `[gjenbruk: shared/fullscreen-template]`, parallell til live-økt.
- **Modaler/wizard:** Logg ny runde, Slag-registrering (UpGame), Del runde, Import (GolfBox/UpGame `[gjenbruk: shared/golfbox-import]` + `[gjenbruk: shared/trackman-import]`).
- **Nøkkelhandlinger:** «Logg runde», «Importer» (GolfBox/UpGame), «Del kort», bytt fane, drill-down i kølle/metrikk.
- **States:** tom (for få runder → empty-state «Logg din første runde» på SG-fane; delbart kort låst til nok data) / laster (skeleton-tabell) / feil (import feilet → retry) / fylt (data-viz + tabeller fylt).

---

## Meg

- **Jobb:** Profil + abonnement + helse + innstillinger + GDPR — én flate med seksjoner + få modaler.
- **Layout mobil (primær):** profil-hero øverst, deretter seksjoner som sammenleggbare/lenke-rader (innstillings-rad-stil), bunnbar synlig. Tunge undersider (integrasjoner) kan beholde egen underflate.
- **Layout desktop:** profil-kort + venstre seksjons-meny, høyre innholds-panel for valgt seksjon.
- **Seksjoner:** Profil · Abonnement · Helse · Innstillinger · Utstyrsbag · Dokumenter · Foreldre/samtykke · Sikkerhet · Hjelp.
- **Datakomponenter (sone for sone):**
  - Profil-hero: `[gjenbruk: athletic/hero]` + `[gjenbruk: athletic/avatar]` + `[gjenbruk: shared/avatar-upload]`.
  - Abonnement: `[gjenbruk: shared/tier-paywall-sheet]` + `[gjenbruk: athletic/card]` (gratis/300 kr, faktura-liste). Ingen tier-nivåer; «ELITE finnes ikke».
  - Helse: `[NY: wellness self-log]` (daglig søvn/sårhet/stress; deles m/ AgencyOS #9) + helse-logg `[gjenbruk: athletic/card]` + ACWR-graf `[gjenbruk: stats/trend-graf]`.
  - Innstillinger: `[gjenbruk: athletic/action-list]` rad-liste (anlegg, integrasjoner, økter, personvern, sikkerhet, språk, varsler, AI-coach).
  - Utstyrsbag: `[gjenbruk: athletic/action-list]` + `[gjenbruk: athletic/card]`.
  - Dokumenter/Hjelp: `[gjenbruk: athletic/action-list]` liste + artikkel-visning `[gjenbruk: athletic/editorial/]`.
  - Foreldre/samtykke: `[gjenbruk: athletic/card]` + samtykke-status `[gjenbruk: athletic/status-pill]`.
- **Modaler/wizard:** Rediger profil (`[gjenbruk: shared/profil-rediger]`), Oppgrader-flyt, Avbestill, Nytt kort, Faktura-detalj, Nytt symptom, 2FA-oppsett, Feedback, Kontakt, GDPR-handlinger (eksport `[gjenbruk: shared/eksport]`, slett konto).
- **Nøkkelhandlinger:** «Rediger profil», «Oppgrader» (forest+lime CTA), «Logg symptom», «Eksporter data», «Inviter forelder».
- **States:** tom (ingen helse-logg → empty-state; ingen dokumenter) / laster (skeleton) / feil (retry) / fylt (profil + abonnement + seksjoner fylt).

---

## Coach (sidespor)

- **Jobb:** Meldinger + spørsmål slått sammen til én coach-dialog + Coach-AI.
- **Layout mobil (primær):** nås fra topbar/meny (ikke bunnbar). Fane-rad (Dialog · Coach-AI · Coach-profil), innboks-liste → tråd-visning (fullbredde chat), bunn-input.
- **Layout desktop:** to-panel — innboks-liste til venstre, åpen tråd til høyre.
- **Faner/seksjoner:** Dialog (samlet innboks: meldinger + spørsmål) · Coach-AI · Coach-profil · Notater · Videoer.
- **Datakomponenter (sone for sone):**
  - Innboks: `[gjenbruk: athletic/queue-item]` rad-liste + `[gjenbruk: athletic/avatar]` + `[gjenbruk: athletic/badge]` (ulest).
  - Tråd: `[gjenbruk: athletic/card]` meldingsbobler + `[gjenbruk: shared/mic-button]` + bunn-input `[gjenbruk: ui/textarea]`.
  - Coach-AI: chat-flate `[gjenbruk: athletic/card]` (utvid m/ kilde-sitat, Fase 5 P7) + `[gjenbruk: shared/mic-button]`.
  - Coach-profil: `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/avatar]` + `[gjenbruk: athletic/presence-dot]`.
  - Notater/Videoer: `[gjenbruk: athletic/action-list]` liste + `[gjenbruk: athletic/card]`.
- **Modaler/wizard:** Ny melding, Vedlegg (`[gjenbruk: shared/]` opplasting).
- **Nøkkelhandlinger:** «Send» (forest+lime), «Nytt vedlegg», bytt Dialog/AI, ring/be om svar.
- **States:** tom (ingen meldinger → empty-state «Start en samtale») / laster (skeleton-rader) / feil (send feilet → retry) / fylt (tråder + uleste-badge).

---

## Booking (sidespor)

- **Jobb:** Book coach/anlegg + mine bookinger.
- **Layout mobil (primær):** nås fra meny/Gjennomføre-fane. Fane-rad (Book · Mine bookinger), book-flyt som fullbredde wizard, kort-kolonne for mine bookinger.
- **Layout desktop:** book-flyt som steg-panel (velg coach/anlegg → tid → bekreft), mine bookinger som liste/kalender ved siden.
- **Faner/seksjoner:** Book (hub→ny→bekreft) · Mine bookinger.
- **Datakomponenter (sone for sone):**
  - Book-hub: `[gjenbruk: athletic/card]` (coach/anlegg-valg) + `[gjenbruk: athletic/avatar]`.
  - Velg coach/anlegg: `[gjenbruk: athletic/featured-card]` + `[gjenbruk: athletic/presence-dot]`.
  - Velg tid: `[gjenbruk: shared/calendar/MiniCalendar]` + `[gjenbruk: athletic/day-cal]` (ledige tider).
  - Bekreft/kvittering: `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/status-pill]`.
  - Mine bookinger: `[gjenbruk: athletic/queue-item]` rad-liste + `[gjenbruk: athletic/badge]` (kommende/fullført).
- **Modaler/wizard:** Ny booking (wizard), Bekreft, Endre tid (reschedule).
- **Nøkkelhandlinger:** «Book» (forest+lime), «Endre tid», «Avbestill».
- **States:** tom (ingen bookinger → empty-state «Book din første time») / laster (skeleton) / feil (ingen ledige tider) / fylt (bookinger i listen).

---

## Talent (sidespor — UTSATT, Elite Fase 2)

- **Jobb:** Min plan/nivå/roadmap/sammenligning for elite-spor. **Utsatt** — design tom-/placeholder-hub.
- **Layout mobil (primær):** hub med seksjoner i kort-kolonne, nås fra meny.
- **Layout desktop:** hub med seksjons-meny + innholdspanel.
- **Seksjoner:** Min plan · Mitt nivå · Roadmap · Sammenligning.
- **Datakomponenter (sone for sone):**
  - Min plan/nivå: `[gjenbruk: athletic/card]` + `[gjenbruk: athletic/pyramid-progress]` + `[NY: nivå-score-badge]` (gjenbruk fra Analysere).
  - Roadmap: `[gjenbruk: athletic/calendars/year-plan-gantt]`.
  - Sammenligning: `[gjenbruk: stats/kohort-linjegraf]` + `[gjenbruk: stats/norgeskart]` (WAGR/kohort).
- **Nøkkelhandlinger:** (utsatt) — placeholder «Kommer i Elite Fase 2».
- **States:** primært **tom/placeholder** (utsatt) — ærlig «Kommer senere»-empty-state. Fylt-design venter.

---

## Varsler (global bjelle)

- **Jobb:** Varslingsliste + marker-som-lest. Egen flate nås fra topbar-bjelle overalt.
- **Layout mobil (primær):** fullbredde varsel-liste, topp «Marker alle som lest», bunnbar synlig (eller fullskjerm-overlay fra bjelle).
- **Layout desktop:** popover fra bjelle ELLER egen liste-flate; gruppert etter dato.
- **Seksjoner:** Uleste · Tidligere (gruppert per dato).
- **Datakomponenter (sone for sone):**
  - Bjelle (global topbar): `[gjenbruk: shared/notification-bell]` (med ulest-teller).
  - Liste: `[gjenbruk: athletic/queue-item]` rad-liste + `[gjenbruk: athletic/badge]` (ulest-prikk) + `[gjenbruk: athletic/pulse-dot]` (ny).
  - Dato-gruppe-header: `[gjenbruk: athletic/eyebrow]`.
- **Nøkkelhandlinger:** «Marker alle som lest», tapp varsel → deep-link til kilde-flate, slett.
- **States:** tom (ingen varsler → empty-state «Alt er lest») / laster (skeleton-rader) / feil (retry) / fylt (uleste øverst + tidligere gruppert).

---

## Oppsummering — NYE komponenter

| # | Komponent | Brukes på | Deles m/ AgencyOS |
|---|---|---|---|
| 1 | «Jobb med dette»-kort | Hjem | Ja (#1) |
| 2 | streak/motivasjon-blokk | Hjem | Nei |
| 3 | framgangsfeiring (overlay) | Hjem | Nei |
| 4 | plan-endring-godta-kort | Planlegge/Hjem | Delvis (#4) |
| 5 | score-tapper-pad | Gjennomføre (live) | Nei |
| 6 | percentil-meter | Analysere (SG) | Ja |
| 7 | nivå-score-badge (A–K) | Analysere, Talent | Ja |
| 8 | fordelings-radar (consumer) | Analysere (SG) | Ja |
| 9 | benchmark-scrubber | Analysere (SG) | Ja |
| 10 | approach-varmestige | Analysere (SG) | (data-viz) |
| 11 | delbart spillerkort | Analysere/Hjem/Meg | Nei |
| 12 | wellness self-log | Meg/Hjem | Ja (#9) |

**12 nye komponenter.** Alt annet er komposisjon av eksisterende `athletic/`, `ui/`, `shared/`, `stats/`
og kalender-delsystemet. Fase 5-deler (live-puls, dispersion-banekart) er delte AgencyOS-komponenter og
dukker opp på Hjem/Analysere når de bygges — ikke listet som PlayerHQ-egne her.
