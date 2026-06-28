# Claude Design — prompt for gjenstående skjermer + Workbench-detaljer

**Opprettet:** 2026-06-28. To prompter under. **Kopier én om gangen** inn i Claude Design.
PROMPT 1 = de gjenstående skjermene. PROMPT 2 = alle Workbench-detaljer (AgencyOS + PlayerHQ).

> Begge er **IA-låst**: Claude Design skal bygge mot de EKTE rutene, datamodellen og komponentene i `akgolf-hq/` — ikke finne opp egen informasjonsarkitektur. Det er den dokumenterte smerten (IA-drift). Ved tvil om en rute/datakilde finnes: **STOPP og spør Anders**, ikke gjett.

---
---

# PROMPT 1 — Gjenstående AgencyOS-skjermer

Du designer for **AK Golf HQ**, et norsk, data-tett prestasjonsgolf-system (AK Golf Academy). Fire flater fra ett token-sett: **PlayerHQ** (spiller, lyst), **AgencyOS** (coach, mørkt), Booking, Marketing. Disse skjermene er **AgencyOS — mørkt tema**.

## Låste regler (bryt aldri)
- **Mørk canvas = varm nær-svart `#0A0B0A`** (tile `#171817`, raised `#1E1F1D`, hairline `#262725`, tekst `#F0F0F0` / sekundær `#A6A8A3`). **Aldri forest-grønn canvas.** Dybde fra **hårlinjer, ikke skygger**.
- **Lime `#D1F843` = eneste aksent**, brukt 5–10 % av skjermen (aktiv nav, primær-CTA, NÅ-markør, positiv delta, fokus). **Ett lime-glød per skjerm.** Aldri store flate lime-flater. Aldri lime brødtekst.
- **Data-/pyramide-farger (mørk):** opp `#4FD08A` · ned `#F0683E` · warn `#E8B43C` · info `#5AA9F0`. Pyramide: Fysisk `#3DBE78` · Teknisk `#E8B43C` · Golfslag `#5AA9F0` · Spill `#D1F843` · Turnering `#F0683E`. Aldri nye toner; fler-serie = lime + grå.
- **Fonter:** Inter (UI/brødtekst) · Inter Tight (display/hero, editorial *italic* = signaturen, aldri serif) · JetBrains Mono (alle tall, tabulære). **Tallet er helten.**
- **Tall = norsk format:** desimal-komma, tynt mellomrom for tusen («72,4», «2 200»), fortegn +/− med ▲▼.
- **Ikoner:** kun Lucide (1,5px stroke). **Ingen emoji.** **8pt-grid** (aldri p-3/5/7).
- **Språk:** norsk bokmål, «du/deg», sentence case. Eyebrows/mono-labels UPPERCASE med vid tracking. Forbudt i UI: «ELITE», «CoachHQ», «elev», «session». Demo-navn: spiller = **Øyvind Rohjan**, coach = **Anders Kristiansen** (fulle navn).
- **Fire tilstander på HVER skjerm:** innhold · tom (EmptyState) · laster (Skeleton) · feil. Ingen løse tall i markup — alt fra mock-data.
- **Tetthet:** AgencyOS er Bloomberg/Linear-tett (py-2.5 tillatt). 44px touch-mål på mobil. AA-kontrast. `prefers-reduced-motion` respektert.

## IA-lås (bygg mot disse ekte rutene)
Hver skjerm har en fast adresse i Next.js-appen. Bygg innholdet som hører til DEN ruten. Gjenbruk eksisterende komponenter fra `src/components/athletic/` og `src/components/admin/` — bygg ikke nye byggeklosser uten grunn. Komponenter som FINNES og skal brukes: `Sidebar`(dark), `KpiStrip`/`KpiCard`, `DataTablePro`, `QueueItem`, `Badge`, `StatusPill`, `RiskHeatmap`, `TestMatrix`, `SeasonGantt`/`PeriodTimeline`/`YearPlanGantt`, `DayScheduler`/`WeekGrid`, `SgBreakdown`, `TrendBand`, `PercentileGauge`, `Sparkline`, `LiveRepPulse`, `SkillRadarLive`, `TournamentCard`, `InboxList`, `MessageThread`, `InsightCard`, `Avatar`, `Chip`, `EmptyState`, `Skeleton`.

## Skjermene som skal designes

### 1. Coach-kalender — multi-ressurs `/admin/kalender`  ★ prioritet
Redesign til **lime tidslinje-scheduler-språket** (referanse 4378): pills på en tidsakse, lime tids-blokker, markør-ballonger, dato-stepper. Hele stallen på ett tidsbrett.
- **Layout:** venstre ikon-rail + stall-rail (spillere gruppert på nivå Elite/Utvikling/Bredde, HCP + tone-dot, klikk filtrerer grid) · midt: uke-grid (dager × 08–18) med tone-kodede øktblokker per spiller, **side-om-side ved overlapp**, **lime NÅ-linje**, konflikt = urgent-markering · høyre: valgt økt (spiller/tid/sted/mål, rediger/dupliser, konflikt-varsel) + «Trenger planlegging»-kø (uplanlagte spillere, dra-håndtak, «Planlegg økt») + per-spiller uke-belastning.
- **Tone-koder:** Fysisk forest · Teknisk lime · Spill info · Coach warn · Turnering urgent.
- **Tilstander:** full uke · tom dag · laster (Skeleton-grid) · konflikt.

### 2. Periodisering pr. spiller & gruppe `/admin/periodisering`  (ny rute)
- **Formål:** Gantt med flere spor; tildel fase til gruppe; turneringer som faste blokker.
- **Layout:** spiller/gruppe-velger · `SeasonGantt`/`PeriodTimeline` med faser (Grunn/Spesial/Turnering/Eval/Off) · milepæler + turneringsmarkører · lime NÅ-linje.
- **Tilstander:** plan satt · ingen plan (EmptyState + «bygg plan») · konflikt (turnering i hvileperiode).

### 3. Live-oversikt på tvers av stallen `/admin/live`  (utvid)
- **Formål:** alle pågående økter i sanntid; klikk inn til én spillers live-view.
- **Layout:** topp `KpiStrip` (X live, Y planlagt i dag) · grid av live-kort (spiller, øvelse, fremdrift, siste rep) · detalj-panel: `LiveRepPulse` + `SkillRadarLive` + hurtignotat. **Ett glød = live-elementet.**
- **Tilstander:** ≥1 live · ingen live (EmptyState) · tilkobling tapt (feil-banner).

### 4. Anlegg & booking — scheduler `/admin/bookinger` (booking-grid)  (ny visning)
- **Formål:** bays/greener som ressurser; visuell dra-for-å-booke; dobbeltbooking-varsel.
- **Layout:** ressurs-rader (Mulligan bay 1–8, GFGK putting-lab, Range, Bane) × tidsakse · book-blokker · konflikt = urgent overlegg · filter-chips på anlegg.
- **Tilstander:** ledig/booket · fullt · dobbeltbooking (urgent).

### 5. Stall-analyse + benchmark mot Tour `/admin/analyse`  (utvid)
- **Formål:** stallens SG-utvikling samlet + gap mot Tour-nivå per kategori.
- **Layout:** filterrad (nivå/periode) · `SgBreakdown` (stall-snitt) · `TrendBand` (SG over tid) · `PercentileGauge`-rad (OTT/APP/ARG/PUTT vs Tour) · sorterbar `DataTablePro` per spiller. Fler-serie = monokrom lime+grå.
- **Tilstander:** data · for lite data (EmptyState) · laster.

### 6. Turneringer (coach) `/admin/turneringer`  (ny rute)
- **Formål:** sesongens turneringer; påmelding per spiller; reise; resultat-innsamling.
- **Layout:** turneringsliste/kalender (`TournamentCard`) · detalj: påmeldte spillere, reiselogistikk, resultat-input · status kommende/pågår/ferdig.
- **Tilstander:** kommende · pågår (live resultat) · ferdig (låst) · ingen påmeldte (EmptyState).

## Fire mangler i designspråket (bygg disse mønstrene)
Handoverens egen analyse (`DESIGN-ANALYSE.md`) sier disse fire mønstrene ikke finnes — lever dem som gjenbrukbare:
1. **Lime tidslinje-scheduler** (4378) — fasit for kalender-dagsvisning (brukes i skjerm 1 + 4).
2. **Tile-grid dashboard** med lite juster-/slider-ikon i tile-hjørnet (gigant-tall, blandet 1-/2-kolonne).
3. **Program/dag-liste** (28-Day-stil): dag-kort med varighet/✓, låste dager (hengelås), CTA-i-kort — for flerukers utviklingsløp.
4. **Gigant-singel-tall** (Weight-stil): ett tall som fyller halve skjermen — for enkelt-stat-logging (HCP/score/carry).

## Leveranse pr. skjerm
Klikkbar HTML-mock mot tokenene, alle fire tilstander, mono norsk tallformat, lime kun signal (ett glød), Lucide, 8pt-grid. Ingen løse tall — les felles mock-data. **Ved manglende rute/datakilde: STOPP og spør Anders.**

---
---

# PROMPT 2 — Workbench, alle detaljer (AgencyOS + PlayerHQ)

Du designer **Workbench** — planleggings-hubben i AK Golf HQ. **Låst beslutning:** ALL planlegging bor i Workbench; «Planlegge» er ETT trykkpunkt dit, ikke en meny av kort. Samme i coachens spiller-Workbench. To varianter deler samme hub-grammatikk: **AgencyOS coach-Workbench** (`/admin/coach-workbench`, mørkt, multi-spiller) og **PlayerHQ spiller-Workbench** (`/portal/planlegge/workbench`, lyst, én spiller).

Bygg mot de ekte komponentene i `src/components/workbench-hybrid/` (`HubTabRail`, `Topbar`, `PaletteSidebar`, `UkeView`, `OktDetailTab`) og `src/components/portal/workbench/`. Følg de låste reglene fra PROMPT 1 (mørk = nær-svart for AgencyOS, lyst for PlayerHQ; lime-disiplin; fonter; tall-format; fire tilstander).

## Felles hub-arkitektur (begge varianter)
- **7 hub-faner i `HubTabRail`** (erstatter enkel zoom-topbar): **Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt (År) · Uke · Økt**. Faner matcher datamodellen — ikke finn på nye.
- **Above-panel hero (desktop):** eyebrow + display-tittel (Inter Tight) + lead over det mørke/lyse panelet (f.eks. «Uke 32 — dra økter inn»).
- **Zoom-switcher i topbar (desktop) + mobil zoom-rail:** Årsplan / År / Måned / Uke / Dag — samme IA begge steder.
- **Ukestatistikk-rad** under hub-railen: `{ukelabel} · N økter · X t` (ekte summary).
- **KPI-strip + InsightsStripe** på Gantt/Uke/Økt-zoom (bevisst data-tetthet) — gruppe-/plan-innsikt.
- **Plan-status-pill:** ekte `PlanStatus` (Utkast / Venter svar / …).
- **Fire tilstander:** ærlig tom tilstand når valgfri data mangler (ingen teknisk plan / sesongmål / Gantt-faser) — IKKE fabrikkér tall.

## Uke-fanen (kjernen) — time-grid, ikke kolonne-stack
- **Vertikal time-akse 07–22** med posisjonerte øktkort (ikke enkle dagkolonner).
- **Overlapp-lanes:** økter som overlapper i tid får side-om-side-baner med eget grip-håndtak (for drag på time-grid).
- **FORRIGE / NESTE uke**-knapper i header (app-bredt rounded-full pill + mono uppercase-idiom).
- **Turneringsbanner** i uke fra ekte `TournamentEntry` når seedet.
- **Dag-header:** typografisk hierarki (dag vs. dato) langs time-aksen.
- **NÅ-linje:** lime.

## Økt-fanen — inline `OktDetailTab` (ikke fullskjerm-overlay)
- **Coach:** redigeringspanel med **AK-FORMEL / pyramide / øvelser** (volum-bar + kategori-chips FYS/TEK/SLAG/SPILL).
- **Spiller:** øvelsesliste uten egen COACH-NOTAT/SG-KOBLING-kolonne (kobles når notat/SG er seedet).

## Maler-fanen
- Filterchips (L-fase GRUNN/SPES/TURN — ikke drill-kategori-farger) + kortgrid.
- Kort-anatomi: L-fase-ikon + «Brukt N×»/metadata fra DB (ikke kategori-pill + demo-copy). Match-%-plassholder «—» øvre høyre (→ `PlanEffectiveness` senere).
- **Coach:** «+ Ny mal» + «Rediger» (→ `/admin/plan-templates`). **Spiller:** skjules — kun «Legg i plan».

## Standardøkter-fanen
- Filterchips + kortgrid. DRILL-PROGRAM-kort: 2-linjers preview fra `paletteItems`.
- **Coach:** «+ Ny standardøkt» + «Rediger». **Spiller:** kun «Legg i plan».

## Coach-spesifikt (AgencyOS, mørkt)
- **`PaletteSidebar`** (venstre): dra øvelser/maler inn i uka. (Spiller har IKKE denne — ren ukeflate.)
- **Stall-rail** (treningsbenk-mønster): spillere gruppert på nivå (Elite/Utvikling/Bredde) med HCP + tone-dot; klikk filtrerer grid til spilleren.
- **Multi-spiller uke-grid:** hver spillers økt som tone-kodet blokk med spillerens avatar; overlapp → side-om-side; konflikt-flagg urgent; «Trenger planlegging»-kø (uplanlagte + dra-håndtak + «Planlegg økt») + per-spiller uke-belastning.
- **Mobil action-topbar (`MobileTopbar`):** WORKBENCH-ordmerke + ikon-handlinger (publiser, AI-periodiser, palette, ny økt).
- Spiller-handlinger i topbar: «AI-periodiser» + «Ny økt».

## Spiller-spesifikt (PlayerHQ, lyst)
- Ren ukeflate uten palette-sidebar. Mobil zoom-rail under hub-railen.
- **MobileStatusbar:** sticky volum-bar + kategori-chips (FYS/TEK/SLAG/SPILL).
- Knappe-idiom: rounded-full pill + mono 12px bold uppercase (app-bredt).

## Bevisste avvik fra eldre fasit-PNG (ikke flagg som feil)
- Hub-rail med 7 faner erstatter enkel zoom-only topbar.
- Uke som time-grid (ikke kolonne-stack) + overlapp-lanes.
- Inline Økt-fane (ikke fullskjerm-overlay).
- Above-panel hero + zoom-switcher i topbar (utenfor enkelte fasit-PNG — bevisst v10-chrome).
- KPI-strip/InsightsStripe på enkelte faner der fasit-PNG mangler dem.

## Leveranse
To Workbench-varianter (coach mørk + spiller lys) som deler hub-grammatikk, alle 7 faner, alle fire tilstander, ekte data-bindinger (ingen løse tall), lime-disiplin (ett glød), norsk mono-tall. Ved manglende datakilde: STOPP og spør Anders.
