# Flyt-inventar — PlayerHQ del 1

Knapp-/flyt-inventar for PlayerHQ-kjernen, del 1. Kartlegger alle interaktive elementer (knapper, lenker, klikkbare kort, `router.push`, `<form action>`, `onClick`) per skjerm og flagger «døde knapper».

**DØD-kriterier:** `href="#"` / ingen handler / tom `onClick` / `// TODO` · fører til KUTT-LISTE-rute (`/portal/mal/*`, `/portal/analyse`, `/portal/stats`, `/portal/tren/ovelser*` — finnes som filer, men fjernes) · destinasjonsrute finnes ikke som `page.tsx`.

**Bevisst `disabled` med «Kommer»-title** regnes IKKE som død knapp (markert OK i tabellene), men er listet for synlighet.

Generert 2026-06-17.

---

## /portal
| Element | Fører til | Status |
|---|---|---|
| Profil-pill i hero (navn + HCP) | /portal/meg | OK |
| Neste turnering-kort (hero) | /portal/turneringer/[id] (fallback /portal/tren/turneringer) | DØD — `/portal/turneringer/[id]` finnes ikke (kun /portal/tren/turneringer er gyldig) |
| Dagens økt: «Start dagens økt» / «Fortsett økt» / «Fullført» | /portal/gjennomfore/[id] | OK |
| Dagens økt: «Se i planen» | /portal/planlegge | OK |
| Tom dagens-økt: «Planlegg økt» | /portal/planlegge | OK |
| Ukeoversikt: «Åpne Workbench →» | /portal/planlegge | OK |
| Ukeoversikt: dag-celle (×7) | /portal/planlegge | OK |
| Ukeoversikt: økt-rad | /portal/gjennomfore/[id] | OK |
| Snarvei «Ny økt» | /portal/ny-okt | OK |
| Snarvei «Logg runde» | /portal/mal/runder | DØD — KUTT-LISTE (/portal/mal/) |
| Snarvei «Analyser» | /portal/analysere | OK |
| Snarvei «Coach» | /portal/coach | OK |
| TournamentCountdown: «Se turnering» | /portal/turneringer/[id] (fallback /portal/tren/turneringer) | DØD — `/portal/turneringer/[id]` finnes ikke |
| Tom turnering: «Legg til turnering» | /portal/tren/turneringer | OK |
| Siste aktivitet: «Se alt →» | /portal/analysere | OK |
| Siste aktivitet: drill-rad | /portal/gjennomfore/[id] | OK |
| Varsler: «Se alle →» | /portal/varsler | OK |
| Varsel-rad | n.href (DB-link, fallback /portal/varsler) | OK |
| Aktive mål: «Alle mål →» | /portal/mal | DØD — KUTT-LISTE (/portal/mal/) |
| Tom mål: «Nytt mål» | /portal/mal/bygger | DØD — KUTT-LISTE (/portal/mal/) |
| Mål-kort | /portal/mal/goal/[id] | DØD — KUTT-LISTE (/portal/mal/) |
| Fra coach: «Meldinger →» | /portal/coach/melding | OK |
| Coach-melding-kort | /portal/coach/melding/[id] | OK |
| Tom coach: «Send melding» | /portal/coach/melding/ny | OK |

## /portal/analysere
| Element | Fører til | Status |
|---|---|---|
| Topbar: «Planlegg» | /portal/planlegge | OK |
| Topbar: «Søk» | disabled (title «Kommer») | OK (disabled, ingen handler) |
| Topbar: varsel-bjelle | disabled (title «Kommer») | OK (disabled, ingen handler) |
| Topbar: «Meg» | /portal/meg | OK |
| Topbar AI-chips «AI-innsikt» / «Sammenlign» / «Eksporter» | disabled (title «Kommer») | OK (disabled, ingen handler) |
| Topbar AI-søkefelt (⌘K) | readOnly input | OK (readOnly, ingen handler) |
| Sidebar: kategori-knapp (×12) | intern state (bytter kategori) | OK |
| Sidebar: «Analysekategorier»-header | ingen onClick | DØD — header rendret som knapp uten handler |
| Sidebar: «Rapporter»-header | ingen onClick | DØD — header rendret som knapp uten handler |
| Dashboard (runder): «Ny runde» | åpner RoundStatsForm (inline) | OK |
| RoundStatsForm: «Tilbake til oversikt» | lukker form (samme side) | OK |
| RoundStatsForm: lagre | server-action via onSaved | OK |
| Dashboard: runde-rad-knapp | intern state (velg runde) | OK |
| Høyrepanel: periode-knapp (×5) | intern state | OK |
| Høyrepanel: «Forrige periode» | disabled | OK (disabled, ingen handler) |
| Høyrepanel: «Snitt i akademiet» | disabled | OK (disabled, ingen handler) |

## /portal/analysere/hull
| Element | Fører til | Status |
|---|---|---|
| Sone-trykk i HoleAnalysis (tee/innspill/nærspill/putt) | intern (åpner sone-detalj i komponenten) | OK |

Ingen `<Link>`/`router.push`/server-action på siden utover den interaktive sone-velgeren.

## /portal/statistikk
| Element | Fører til | Status |
|---|---|---|
| Seksjons-tab «Oversikt» | /portal/statistikk | OK |
| Seksjons-tab «Strokes Gained» | /portal/analysere | OK |
| Seksjons-tab «TrackMan» | /portal/analysere | OK |
| Seksjons-tab «Tester» | /portal/analysere | OK |
| Seksjons-tab «Runder» | /portal/analysere | OK |
| Tom-tilstand: «Logg første runde →» | /portal/mal/runder/ny | DØD — KUTT-LISTE (loggRunde i statistikk-v10-data.ts) |
| Metrikk-celle (når data finnes) | /portal/statistikk/[id] | OK |

## /portal/statistikk/[metric]
| Element | Fører til | Status |
|---|---|---|
| Periode-pills «7 d / 30 d / 90 d / Sesong / Alle» | disabled | OK (disabled, ingen handler) |
| «Be om mer fokus» (coach-CTA) | /portal/coach/melding?type=fokus&omrade=… | OK |
| Tom-pyramid: «Til treningsplan» | /portal/tren | DØD — `/portal/tren` (rot) finnes ikke som page.tsx |
| Tom-sg: «Logg runde» | /portal/mal/runder | DØD — KUTT-LISTE (/portal/mal/) |

## /portal/statistikk/sammenlign
| Element | Fører til | Status |
|---|---|---|
| Komparator-tab (×4: Min HCP-gruppe / Min aldersgruppe / Topp 10 % U18 / Spesifikk spiller) | intern state | OK |
| Søkefelt (ved «Spesifikk spiller») | input uten onChange/handler | DØD — ingen handler (rent visuelt) |
| «Vis bare siste 30 dager» | `<button>` uten onClick | DØD — knapp uten handler |

## /portal/trackman/[sessionId]
| Element | Fører til | Status |
|---|---|---|
| «Tilbake til TrackMan-økter» | /portal/mal/trackman | DØD — KUTT-LISTE (/portal/mal/) |
| Filter-chips «Alle / Beste 10 / Verste 10» | intern state | OK |
| «Eksporter CSV» | disabled (title «Kommer post-BETA») | OK (disabled, ingen handler) |
| «Sammenlign med…» | /portal/mal/trackman | DØD — KUTT-LISTE (/portal/mal/) |
| «Slett økt» | disabled (title «Kommer post-BETA») | OK (disabled, ingen handler) |

## /portal/booking
| Element | Fører til | Status |
|---|---|---|
| Hero-CTA «Book med credit» / «Book ny økt» | /portal/booking/ny | OK |
| Credits (free): «Oppgrader til Pro» | /portal/abonnement | DØD — `/portal/abonnement` finnes ikke |
| Kommende: «Se alle» | /portal/meg/bookinger | OK |
| Kommende booking-rad | /portal/booking/[id] | OK |
| Coach-rad «Book direkte med coach» | /portal/booking/ny | OK |
| Historikk booking-rad | /portal/booking/[id] | OK |

## /portal/booking/ny
| Element | Fører til | Status |
|---|---|---|
| «Oppgrader til Pro» (free-gate) | /portal/meg/abonnement | OK |
| Tjeneste-kort (per serviceType) | /portal/booking/ny?service=…&dato=… (steg-bytte) | OK |
| «Endre» (context-kort, fra steg 2) | /portal/booking/ny | OK |
| Dato-knapp (DatoVelger, 14 dager) | /portal/booking/ny?service=…&dato=… (steg-bytte) | OK |
| Slot/klokkeslett (SlotGrid) | /portal/booking/ny/bekreft?service=…&start=…&coach=… | OK |
| «Book drop-in mot betaling» (brukt opp credits) | /booking (marketing) | OK |

## /portal/booking/ny/bekreft
| Element | Fører til | Status |
|---|---|---|
| «← Velg annen tid» | /portal/booking/ny?service=…&dato=… | OK |
| «Notater til coachen» (textarea) | skjema-input | OK |
| «Bekreft booking (bruk 1 credit)» | server-action `createCreditBooking` → /portal/booking/bekreftet | OK |

## /portal/booking/[bookingId]
| Element | Fører til | Status |
|---|---|---|
| «Mine bookinger» (topnav back) | /portal/meg/bookinger | OK |
| «Alt er klart» | /portal/booking/bekreftet | OK |
| «Tilbake» | /portal/meg/bookinger | OK |

## /portal/gjennomfore
| Element | Fører til | Status |
|---|---|---|
| Fane «I dag» / «Kalender» / «Booking» | intern state (fane-bytte) | OK |
| «Start nå» (accent-kort, I dag) | /portal/gjennomfore/[id] | OK |
| Økt-rad (OktRad, I dag + Kalender) | /portal/gjennomfore/[id] | OK |
| «Planlegg i Workbench» (tom-tilstand) | /portal/planlegge | OK |
| «Workbench →» | /portal/planlegge | OK |
| Booking-type-kort ×4 (Pro-time / TrackMan-bay / Tee-time / Gruppe-clinic) | /portal/booking | OK |

## /portal/gjennomfore/[id]
| Element | Fører til | Status |
|---|---|---|
| «Gjennomføre» (back) | /portal/gjennomfore | OK |
| «Kontakt coach» | /portal/coach/melding | OK |
| «Se i planen» | /portal/planlegge | OK |

## /portal/ny-okt
| Element | Fører til | Status |
|---|---|---|
| «Se Pro-fordeler» (free-gate) | /portal/meg/abonnement | OK |
| «Kontakt coach» (info-kort) | /portal/coach | OK |
| «Logg runde» (info-kort) | /portal/mal/runder/ny | DØD — KUTT-LISTE (/portal/mal/) |
| Wizard-steg «Neste»/«Tilbake» | internt steg-bytte | OK |

## /portal/onskeligokt
| Element | Fører til | Status |
|---|---|---|
| Coach-velger (select, ved >1 coach) | skjema-input | OK |
| Økt-type radio-kort ×4 (1:1 / Mini / Range / Runde — Runde locked) | on-page state | OK |
| Tema-chips (TEK/SLAG/SPILL/FYS/TURN + PUTT/Mental/Turneringsforb./Annet) | on-page state-toggle | OK |
| «Mer detalj» (textarea) | skjema-input | OK |
| Tid-rader (dato + klokkeslett) | skjema-input | OK |
| «Legg til alternativ» | on-page state | OK |
| «Helt fleksibel» (checkbox) | on-page state | OK |
| Fasilitet radio-kort ×5 (Mulligan/GFGK/Bossum/Du velger/Online) | on-page state | OK |
| «Melding» (textarea) | skjema-input | OK |
| «Avbryt» | /portal | OK |
| «Send forespørsel» | server-action `sendOnskeligOkt` → /portal/onskeligokt?sent=1 | OK |

## /portal/planlegge
Mobil (PlanleggeWorkbench) + desktop (WorkbenchShell, `xl:`).
| Element | Fører til | Status |
|---|---|---|
| **Mobil:** Mode-rail ×6 (Årsplan/Treningsplan/Fysplan/Mål/Drills/Ny økt) | on-page state-bytte | OK |
| **Mobil:** Plan-rad (PlanRad, Treningsplan) | /portal/gjennomfore/[id] | OK |
| **Mobil:** «Åpne Workbench» (tom-tilstand) | /portal/planlegge/workbench | OK |
| **Mobil:** «Åpne i Workbench» (ModusIntro) | /portal/planlegge/workbench | OK |
| **Desktop topbar:** «Plan A» / «Plan B» | server-action `setActivePlan` | OK |
| **Desktop topbar:** View-toggle ×5 (Uke/Dag/Liste/Kanban/Dashboard) | on-page state | OK |
| **Desktop topbar:** «Ny økt» | modal (NewSessionDialog) | OK |
| **Desktop topbar:** «Forrige uke» (ChevronLeft) | ingen handler | DØD — knapp uten handler |
| **Desktop topbar:** «Neste uke» (ChevronRight) | ingen handler | DØD — knapp uten handler |
| **Desktop topbar:** «Søk» | ingen handler | DØD — knapp uten handler |
| **Desktop topbar:** «Varsler» (Bell) | ingen handler | DØD — knapp uten handler |
| **Desktop topbar:** «Ny plan» | ingen handler | DØD — knapp uten handler |
| **Desktop topbar:** «Del» | ingen handler | DØD — knapp uten handler |
| **Desktop kalender:** klikk økt | on-page select → Inspector | OK |
| **Desktop kalender:** drag-drop økt / standard-økt | server-action `updateSessionTime` / `addStandardSessionToCalendar` | OK |
| **Desktop inspector:** «Notat» | ingen handler | DØD — knapp uten handler |
| **Desktop inspector:** «Video» | ingen handler | DØD — knapp uten handler |
| **Desktop inspector:** «Link» | ingen handler | DØD — knapp uten handler |
| **Desktop inspector:** «Melding» | ingen handler | DØD — knapp uten handler |
| **Desktop inspector:** «Godkjenn endring» | ingen handler | DØD — knapp uten handler |
| **Desktop modal:** «Avbryt» | lukker modal | OK |
| **Desktop modal:** «Opprett økt» | server-action `createSession` | OK |

## /portal/planlegge/workbench
| Element | Fører til | Status |
|---|---|---|
| Plan-toggle «PLAN A» / «PLAN B» | server-action `setActivePlanVariant` (B disabled uten plan B) | OK |
| Visning «Liste» / «Kalender» | on-page formspråk-bytte | OK |
| AI-chip «Generér uke» / «Balansér» / «Foreslå taper» / «Fyll standardøkter» | disabled (title «Kommer») | OK (disabled) |
| Zoom «ÅR» / «MND» | disabled (title «Kommer») | OK (disabled) |
| Zoom «UKE» / «DAG» | on-page mode-bytte | OK |
| Modus «Tidslinje» / «Kanban» / «Dashboard» | on-page mode-bytte | OK |
| Uke-nav «Forrige uke» / «Neste uke» | disabled (title «Kommer») | OK (disabled) |
| «Ny økt» | sheet (CreateSessionSheet) | OK |
| «Ny plan» | sheet (CreatePlanSheet) | OK |
| «Del plan» | disabled (title «Kommer») | OK (disabled) |

Merknad: Underkomponentene (WBSidebar, WeekView/DayView/KanbanView/DashboardView, WBInspector, sheets) har egne interaksjoner — ikke åpnet i dybden her. Topbar er hovedchromet.

## /portal/drills
| Element | Fører til | Status |
|---|---|---|
| Søkefelt «Søk drill…» | lokal filtrering | OK |
| Akse-pills (Alle/FYS/TEK/SLAG/SPILL/TURN) | lokalt filter | OK |
| Nivå-pills (Alle/Lett/Middels/Hard) | lokalt filter | OK |
| Anlegg-pills (Alle + fasiliteter) | lokalt filter | OK |
| Drill-kort (rad) | /portal/drills/[id] | OK |

## /portal/drills/[id]
| Element | Fører til | Status |
|---|---|---|
| «Bibliotek» (topbar back) | /portal/drills | OK |
| Media-faner (Video/Foto, ved ≥2 medier) | lokalt medie-bytte | OK |
| Trinn-avkryssing (per trinn) | lokal toggle | OK |
| «Bokmerke drill» (ikon) | ingen onClick | DØD — knapp uten handler |
| «Legg til i plan» | /portal/planlegge/workbench | OK |
| «Tilbake til drill-bibliotek» (not-found) | /portal/drills | OK |
| «Se alle drills» (not-found) | /portal/drills | OK |

## /portal/tren/aarsplan
| Element | Fører til | Status |
|---|---|---|
| «Opprett sesongplan for {år}» (tom-tilstand) | /portal/planlegge/workbench | OK |
| Gantt-fase-bar (per fase) | /portal/tren/aarsplan/periode/[id]/rediger | OK |

## /portal/tren/fys-plan
| Element | Fører til | Status |
|---|---|---|
| «Ny plan» (header) | /portal/tren/fys-plan/ny | DØD — ruten finnes ikke (ingen page.tsx) |
| «Lag din første plan» (tom-tilstand) | /portal/tren/fys-plan/ny | DØD — ruten finnes ikke |
| FysPlanCard (aktive + arkiverte) | /portal/tren/fys-plan/[id] | OK |

## /portal/tren/teknisk-plan
| Element | Fører til | Status |
|---|---|---|
| «Periodisering» (knapp) | ingen onClick (server-komponent `<button>`) | DØD — knapp uten handler |
| «Ny plan» (knapp) | ingen onClick (server-komponent `<button>`) | DØD — knapp uten handler |
| PlanCard «Åpne plan» (per kort) | /portal/tren/teknisk-plan/[id] | OK |

## /portal/tren/tester
| Element | Fører til | Status |
|---|---|---|
| Tildelt-rad «Start» (per tildeling) | /portal/tren/tester/[testId] | OK |
| Katalog-søkefelt «Søk etter test …» | lokal filtrering | OK |
| Katalog-rad (per test, chevron) | /portal/tren/tester/[testId] | OK |

Merknad: TestUkeKommende rendres tom (countdown=null, tester=[]) — ingen aktive elementer der nå.

## /portal/tren/tester/katalog
| Element | Fører til | Status |
|---|---|---|
| «Tilbake til tester» | /portal/tren/tester | OK |
| «Egen test» (header-action) | /portal/tren/tester/ny/egen | OK |
| Filter-pills (Alle/Standard/Mine/Coach-godkjent/Akademi) | /portal/tren/tester/katalog?filter=… | OK |
| Test-kort (per test) | /portal/tren/tester/[testId] | OK |

## /portal/tren/tester/[testId]
| Element | Fører til | Status |
|---|---|---|
| «Del med coach» (ved ?lagret=1) | /portal/coach/melding | OK |
| «Protokoller hos NGF» (inline + sekundær) | golfforbundet.no (ekstern) | OK |
| «Start test» | /portal/tren/tester/[id]/gjennomfor | OK |

## /portal/tren/turneringer
| Element | Fører til | Status |
|---|---|---|
| Turnering-rad (trophy + navn + status-chip) | /portal/tren/turneringer/[id] | OK |
| «Planlegg i Workbench» | /portal/planlegge | OK |

## /portal/tren/kalender
| Element | Fører til | Status |
|---|---|---|
| KPI-kort «Spill og turnering» | /portal/mal/runder | DØD — KUTT-LISTE (/portal/mal/) |
| KPI-kort «Tester» | /portal/tren/tester | OK |
| «Forrige uke» / «I dag» / «Neste uke» | /portal/tren/kalender?uke=… | OK |
| «Ny økt» (mobil + desktop) | /portal/ny-okt | OK |
| Filter «Alle» / «Coaching» / «Runde» / «Test» | /portal/tren/kalender?filter=… | OK |
| Filter «Selvtrening» / «Gruppe» | disabled `<span>` (opacity-40) | OK (disabled) |
| Event-kort «Åpne økt» / mobil event-kort | /portal/tren/[sessionId] | OK |
| Tom celle / «+ Legg til økt» (mobil) | åpner SlotModal | OK |
| SlotModal: «Rask-start» (favoritt) | server-action `opprettRaskOkt` | OK |
| SlotModal: «Oppgrader» (free-tier) | /portal/meg/abonnement | OK |
| SlotModal: «Opprett tilpasset økt» | /portal/ny-okt?dato=…&tid=… | OK |
| SlotModal: «Lukk» (X) | lukker modal | OK |

## /portal/trening/break-tabell
| Element | Fører til | Status |
|---|---|---|
| Seg-kontroller (Lengde/Fall/Stimp/Helning) i kalkulator | on-page state (interaktivt verktøy) | OK |
| Seg-kontroll «Lengde» i sammenligning | on-page state | OK |

## /portal/trening/logg
| Element | Fører til | Status |
|---|---|---|
| Område-knapper (Off the tee / Approach / Around green / Putting) | on-page state | OK |
| Kvalitet-knapper (1–5) | on-page state | OK |
| «Lagre økt» (submit) | POST /api/portal/trening/logg → router.push("/portal/tren") | DØD — redirect-mål `/portal/tren` (rot) finnes ikke som page.tsx (selve lagringen virker) |

## /portal/trening/putte-laboratoriet
| Element | Fører til | Status |
|---|---|---|
| Retning-faner (Greenen / Kjeden / Kontroll) | on-page fane | OK |
| Seg-kontroller (Lengde/Fall/Stimp) i alle tre verktøy | on-page state | OK |
| «Slå putten» / «Slå igjen» / «Slå ti putter» | on-page simulering | OK |
| Hurtigvalg-presets (Skarp/Snitt-runde/…) i Kjeden | on-page state | OK |
| Drag siktepunkt / fallpil (SVG) i Greenen | on-page state | OK |

## /portal/kalender
| Element | Fører til | Status |
|---|---|---|
| ViewModeToggle (Standard/Avansert) | view-mode via context (samme side) | OK |
| Kalender-shell (måned/uke/dag-toggle, periodemodal, økt-klikk) | internt view-state + modaler | OK |

Ingen route-leading lenker i kalender-shellen — all navigasjon er intern view-state og modaler.

---

## Oppsummering del 1: 32 skjermer, 25 døde knapper.

### Døde knapper (gruppert)

**A. Peker til KUTT-LISTE `/portal/mal/*` (8):**
1. /portal — Snarvei «Logg runde» → /portal/mal/runder
2. /portal — «Alle mål →» → /portal/mal
3. /portal — «Nytt mål» → /portal/mal/bygger
4. /portal — mål-kort → /portal/mal/goal/[id]
5. /portal/statistikk — «Logg første runde →» → /portal/mal/runder/ny (loggRunde i statistikk-v10-data.ts)
6. /portal/statistikk/[metric] — tom-sg «Logg runde» → /portal/mal/runder
7. /portal/trackman/[sessionId] — «Tilbake til TrackMan-økter» → /portal/mal/trackman
8. /portal/trackman/[sessionId] — «Sammenlign med…» → /portal/mal/trackman
9. /portal/ny-okt — «Logg runde» → /portal/mal/runder/ny
10. /portal/tren/kalender — KPI-kort «Spill og turnering» → /portal/mal/runder

**B. Destinasjonsrute finnes ikke (page.tsx mangler) (7):**
11. /portal — hero «Neste turnering»-kort → /portal/turneringer/[id] (ruten finnes ikke)
12. /portal — TournamentCountdown «Se turnering» → /portal/turneringer/[id] (ruten finnes ikke)
13. /portal/statistikk/[metric] — tom-pyramid «Til treningsplan» → /portal/tren (rot mangler page.tsx)
14. /portal/booking — «Oppgrader til Pro» → /portal/abonnement (ruten finnes ikke)
15. /portal/tren/fys-plan — «Ny plan» (header) → /portal/tren/fys-plan/ny (ruten finnes ikke)
16. /portal/tren/fys-plan — «Lag din første plan» → /portal/tren/fys-plan/ny (ruten finnes ikke)
17. /portal/trening/logg — «Lagre økt» redirecter til /portal/tren (rot mangler page.tsx) etter vellykket lagring

**C. Knapp/felt uten handler (ingen onClick) (8):**
18. /portal/analysere — sidebar «Analysekategorier»-header (knapp uten handler)
19. /portal/analysere — sidebar «Rapporter»-header (knapp uten handler)
20. /portal/statistikk/sammenlign — søkefelt (input uten onChange)
21. /portal/statistikk/sammenlign — «Vis bare siste 30 dager» (button uten onClick)
22. /portal/planlegge (desktop topbar) — «Forrige uke», «Neste uke», «Søk», «Varsler», «Ny plan», «Del» (6 knapper uten handler)
23. /portal/planlegge (desktop inspector) — «Notat», «Video», «Link», «Melding», «Godkjenn endring» (5 knapper uten handler)
24. /portal/drills/[id] — «Bokmerke drill» (ikon-knapp uten handler)
25. /portal/tren/teknisk-plan — «Periodisering» + «Ny plan» (2 server-komponent-knapper uten handler)

(Punktene 18–25 dekker flere fysiske knapper; total telling under.)

### Total dødt-knapp-telling

| Gruppe | Antall knapper |
|---|---|
| A. KUTT-LISTE `/portal/mal/*` | 10 |
| B. Manglende destinasjonsrute | 7 |
| C. Knapp/felt uten handler | 19 (analysere ×2, sammenlign ×2, planlegge topbar ×6 + inspector ×5, drills/[id] ×1, teknisk-plan ×2, + 1 redundans korrigert) |

Knapper uten handler i detalj: analysere (2: kategori/rapporter-headere), sammenlign (2: søkefelt + 30-dager-knapp), planlegge desktop topbar (6), planlegge desktop inspector (5), drills/[id] bokmerke (1), teknisk-plan (2) = **18 knapper**.

**Sum unike døde elementer: 35** (10 KUTT-LISTE + 7 manglende rute + 18 uten handler).

> Merk: De `disabled`-knappene med «Kommer»-title (analysere AI-chips, statistikk/[metric] periode-pills, trackman CSV/slett, workbench AI-chips/zoom/uke-nav/del, tren/kalender Selvtrening/Gruppe) er IKKE talt som døde — de er bevisst deaktiverte placeholders.
