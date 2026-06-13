# Skjerm-manifest: Workbench (frontend-port fra v10)

> **Status:** Utkast til godkjenning · 2026-06-02
> **Kilde-design (fasit):** `public/design-handover/v10/Workbench.html` + `workbench-chrome.jsx` + `workbench-views.jsx` + `workbench-dir-b.jsx` + `workbench-styles.css` + `workbench-dir-b.css`
> **Beslutning (Anders):** Hele Workbench.html som frontend for planleggings-området. Default = **Kalender · UKE**. Begge visninger (Kalender + Liste) via levende veksler. Motor-valg (live-økt A/V2) holdes utenfor dette sporet.

---

## 0. Kritisk funn: det finnes FIRE workbench-implementasjoner i dag

Gap-analysen avdekket at koden har fire parallelle workbench-er — ikke én. Dette er hovedkilden til forvirring:

| # | Implementasjon | Fil | Rute | Status | Data |
|---|---|---|---|---|---|
| 1 | `PlayerWorkbench` | `components/portal/workbench/player-workbench.tsx` (596 l) | `/portal/planlegge/workbench` | **LIVE**, mobil 430px, kun uke-stack | Ekte (`TrainingPlanSession`) |
| 2 | `CoachWorkbench` | `components/admin/coach-workbench/coach-workbench.tsx` (866 l) | `/admin/spillere/[id]/workbench` | **LIVE**, desktop 3-søyle, uke-timeraster | Ekte (`TrainingPlanSession`) |
| 3 | `/admin/coach-workbench` prototype | `components/coachhq/workbench/*` | `/admin/coach-workbench` | Prototype, faner + Caddie-chat | Delvis ekte / tom |
| 4 | `WorkbenchPlanA` | `components/portal-planlegge/workbench/*` (2 720 l) | (ingen) | **DØD KODE** — ikke montert | Mock |

**Konsekvens:** Ingen av de live-implementasjonene matcher v10-designet. De har bare uke-visning — ingen Kalender/Liste-veksler, ingen Kanban/Dashboard/Tidslinje-modus. v10-designet er rikere enn alt som finnes live i dag. `WorkbenchPlanA` (den «store» 2720-linjers koden) er den eneste med zoom-nivåer og drag-and-drop, men den er foreldreløs prototype og bør ikke brukes som fasit.

**Anbefaling:** Bygg den nye workbench fra v10-designet som ÉN delt komponent (`<Workbench role="player|coach" />`), erstatt #1 og #2, og slett #3 og #4 som død kode på slutten.

---

## 1. Arkitektur-beslutninger

- **Én komponent, to varianter:** `<Workbench role="player" />` og `<Workbench role="coach" playerId={id} />`. Coach-variant legger til spillersøk + varsler + coach-handlinger.
- **To formspråk, levende veksler:** Kalender (A) og Liste (B). Default = **Kalender · UKE**. Brukerens valg huskes i `localStorage` (`akgolf.wb.view.{variant}`).
- **Delte moduser:** Kanban og Dashboard finnes i begge formspråk og bæres over ved veksling. Kalender·UKE ↔ Liste·TIDSLINJE mappes til hverandre.
- **Motor:** Bygg mot `TrainingPlanSession` (Spor A) som live-data nå — det er det live-workbenchene allerede bruker. Live-økt-motor-valget (A vs V2) er et separat spor.
- **Designsystem:** Følg v10-reglene (Inter / Inter Tight / JetBrains Mono, 8pt, #005840 sparsomt, #D1F843 kun aktiv/NÅ, pyramide-regnbue som eneste tillatte fargeskala). Tokens fra `globals.css` — ingen hardkodet hex.

### Pyramide-akse-farger (mode-invariant rå hex — eneste tillatte regnbue)
| Akse | Token | HEX |
|---|---|---|
| FYS | `--pyr-fys` | #005840 |
| TEK | `--pyr-tek` | #B8852A |
| SLAG | `--pyr-slag` | #2563EB |
| SPILL | `--pyr-spill` | #D1F843 |
| TURN | `--pyr-turn` | #A32D2D |

---

## 2. Skjermoversikt (9 skjermer + delt skall)

| Skjerm-id (v10 artboard) | Formspråk · modus | Variant | Bygges som |
|---|---|---|---|
| `a-uke` | Kalender · Uke | player | **Default-landing** |
| `a-dag` | Kalender · Dag (+ Live Session-inngang) | player | |
| `a-kanban` | Kalender · Kanban (5 akser) | player | |
| `a-dash` | Kalender · Dashboard | player | |
| `a-coach` | Kalender · Uke | coach | |
| `b-tidslinje` | Liste · Tidslinje (+ slide-over) | player | |
| `b-kanban` | Liste · Kanban | player | |
| `b-dashboard` | Liste · Dashboard | player | |
| `b-coach` | Liste · Tidslinje | coach | |
| `b-drill` | Liste + drill-overlay (bro til Dag-detalj) | player | |

Alle artboards: 1440×900 desktop, bakgrunn `--cream-50`.

---

## 3. Delt skall (gjelder alle skjermer)

### 3.1 Topbar
**Kalender (A) — `WBTopbar`:** logo · breadcrumb `WORKBENCH · PLANLEGGING · PRO` · Plan A/B-segment · **Liste/Kalender-veksler** · AI-kommandobar (senter, ⌘K) med chips (Generér uke / Balansér / Foreslå taper / Fyll standardøkter) · [coach: spillersøk + varsel-bjelle med badge] · zoom-segment (ÅR/MND/UKE/DAG) · modus-segment (Tidslinje/Kanban/Dashboard) · nav-piler ‹ › · «Del plan».
**Liste (B) — `DirBTopbar`:** logo · breadcrumb `WORKBENCH · PLANLEGGING` · spiller-chip (avatar + navn) · omni-bar (senter, /-kommando, ⌘K) · Liste/Kalender-veksler · Plan A/B · modus-knapper · «Del» · [coach: varsel-bjelle].

### 3.2 Venstre kolonne
**Kalender (A) — `WBSidebar` (full sidebar):** 7 kollapsbare grupper — Sesong (periode-tre), Planer (A/B), Standardøkter (drag-bare maler + «Opprett standardøkt»), Turneringer, Treningsplaner, Mål (progress-barer), Stats·pyramide (diverging SG-barer + ubalanse-alarm).
**Liste (B) — `DirBRail` (smal ikon-rail):** samme 7 seksjoner som ikon-knapper + Innstillinger + avatar.

### 3.3 Inspector / slide-over (valgt økt)
**Kalender (A) — `WBInspector` (fast høyre 320px):** valgt økt-header · 3 KPI-blokker (sted/drills/CS) · periode-pyramide (5 fyllbarer faktisk/mål) · test-snarveier (med overdue-merking) · [coach: 6 coach-handlinger].
**Liste (B) — `DirBSlideOver` (slide-over, kun TIDSLINJE):** samme + primær-knapp «Åpne drill-modus» (⌘D) + Start Live / Rediger.

### 3.4 Statusbar
Uke-nr · antall økter · timer planlagt · akse-timer-piller · balanse-varsel · pending-godkjenning (coach). Liste-variant har i tillegg modus-tabs + zoom-segment + tastatur-hint.

---

## 4. Skjerm-manifest — Kalender (A)

### `a-uke` — KALENDER · Uke (DEFAULT-LANDING)
- **Hensikt:** Ukens økter i 5-dagers tidsrutenett (MAN–FRE) — se alle planlagte økter.
- **Canvas (`WeekView`):** dag-header (MAN 26 … FRE 30, i dag uthevet) · periode-band over rutenettet · tidsgutter 06–21 · økt-kort fargekodet per akse, posisjonert på klokkeslett · NÅ-linje · gruppe-chips (WANG/GFGK) · turnering som heldags-blokk.
- **Innhold:** ekte økter for valgt uke fra `TrainingPlanSession`, gruppert på ukedag + klokkeslett.
- **Interaktivt → destinasjon:**
  - Økt-kort → **velg økt → fyll Inspector** (inline, ikke navigasjon).
  - Liste/Kalender-veksler → bytt formspråk (`localStorage`).
  - Zoom UKE/DAG → bytt WeekView/DayView. Modus-segment → Kanban/Dashboard.
  - Nav-piler ‹ › → forrige/neste uke.
  - «Del plan» → del/eksporter (bekreft rute).

### `a-dag` — KALENDER · Dag (+ Live Session-inngang)
- **Hensikt:** Én dag i detalj med drill-for-drill-nedbrytning. **Broen til live-trening.**
- **Canvas (`DayView`):** dag-header · tidsgutter 04–22 · NÅ-linje · dag-økt-kort med full drill-liste (reps + tid per drill) · vær/sted-meta.
- **Interaktivt → destinasjon:**
  - **«Start Live Session»** (play-ikon) → **`/portal/live/{sessionId}`** (live-økt-flyten, Spor A). KRITISK kobling.
  - Drill-rader → drill-detalj (intensjon).

### `a-kanban` — KALENDER · Kanban (5 pyramide-akser)
- **Hensikt:** Ukens økter som kanban med de 5 aksene som kolonner — se/justér balanse.
- **Canvas (`KanbanView`):** 5 kolonner (FYS/TEK/SLAG/SPILL/TURN) med akse-farget topp, økt-kort, drop-zone «+ Slipp her» per kolonne.
- **Interaktivt:** kort = drag mellom kolonner (flytt økt til annen akse/dag) · klikk = velg→Inspector · drop-zone = legg ny økt i aksen.

### `a-dash` — KALENDER · Dashboard
- **Hensikt:** Aggregert datavisning — KPI, pyramide-fordeling, trender, balanse.
- **Canvas (`DashboardView`):** 4 KPI-kort (timer/økter/compliance/SG) · pyramide-pie (timer per akse) · 8-ukers trender (sparkline per akse) · balanse-barer (plan vs periode-mål).
- **Interaktivt:** Ingen — rent presentasjonelt.

### `a-coach` — KALENDER · Uke (coach-variant)
- **Hensikt:** Som `a-uke`, men coach-perspektiv. Eneste forskjell = `variant="coach"`.
- **Coach-tillegg i Topbar:** spillersøk · varsel-bjelle (badge 3).
- **Coach-tillegg i Inspector — 6 handlinger → destinasjon:**
  - Legg til notat på økt → notat-modal
  - Legg til video/link → vedlegg-modal
  - Opprett oppgave → **`/admin/spillere/{id}/tildel-test`** (bekreft)
  - Send melding → meldingsflyt (bekreft rute)
  - Godkjenn plan-endring → **`/admin/spillere/{id}/plan`**
  - Løft til hovedcoach → eskalering (bekreft rute)
  - «Åpne profil» → **`/admin/spillere/{id}`**

---

## 5. Skjerm-manifest — Liste (B)

### `b-tidslinje` — LISTE · Tidslinje (landing for Liste-formspråk)
- **Hensikt:** Vertikal dag-for-dag agenda for planlegging. Velg rad → slide-over.
- **Canvas (`DirBTidslinjeBody`):** pyramide-strip øverst (5 segmenter + SG-rad + Balansér-knapp) · turnering-strip · dag-seksjoner med økt-rader (drag-håndtak · tid · akse · tittel · meta-pills · varighet · chevron).
- **Slide-over (`DirBSlideOver`):** valgt økt + drill-innhold + periode-fordeling + actions.
- **Interaktivt → destinasjon:**
  - Økt-rad → velg → åpne slide-over.
  - **«Åpne drill-modus» (⌘D)** → drill-overlay (`b-drill`).
  - «Start Live» → `/portal/live/{sessionId}`. «Rediger» → rediger-flyt.
  - Modus-knapper → Kanban/Dashboard. Veksler → Kalender.

### `b-kanban` — LISTE · Kanban
- Som `a-kanban`, liste-formspråk. Pyramide-strip øverst + 5 kolonner med «Ny økt»-knapp. Ingen slide-over.

### `b-dashboard` — LISTE · Dashboard
- Som `a-dash`: KPI-strip + pyramide-pie + 8-ukers trender + balanse-barer. Ingen pyramide-strip, ingen slide-over. Rent presentasjonelt.

### `b-coach` — LISTE · Tidslinje (coach)
- Som `b-tidslinje` + varsel-bjelle (badge 3). **NB:** v10 B-coach er underforsynt vs. A-coach (mangler spillersøk + 6 coach-handlinger). **Åpent valg:** port coach-handlingene inn i B-slide-over for paritet? (anbefalt ja).

### `b-drill` — LISTE + drill-overlay (bro Liste → Dag-detalj)
- **Hensikt:** Modal over Liste som viser Dag-detalj (`DayView`) uten å forlate liste-konteksten.
- **Trigger:** «Åpne drill-modus»/⌘D i slide-over.
- **Innhold:** backdrop + modal med header (tilbake til LISTE · breadcrumb · ⌘D/Esc) + `DayView` (samme drill-liste + «Start Live Session»).
- **Interaktivt:** Tilbake/Esc/backdrop → lukk. «Start Live Session» → `/portal/live/{sessionId}`.

---

## 6. Navigasjonskart (alle utganger fra workbench)

| Kontroll | Hvor | Destinasjon / handling |
|---|---|---|
| Økt-kort/rad | A·uke, B·tidslinje | Velg økt → Inspector/slide-over (inline) |
| Start Live Session | A·dag, B·drill, slide-over | `/portal/live/{sessionId}` |
| Liste ↔ Kalender | Topbar (alle) | Bytt formspråk + `localStorage` |
| Zoom/modus-segment | Topbar/statusbar | Bytt visning (intern state) |
| Nav-piler ‹ › | Topbar | Forrige/neste uke |
| Åpne profil (coach) | Inspector | `/admin/spillere/{id}` |
| Godkjenn/Returnér plan (coach) | Inspector | `/admin/spillere/{id}/plan` |
| Opprett oppgave/test (coach) | Inspector | `/admin/spillere/{id}/tildel-test` |
| Del plan | Topbar | Del/eksport (bekreft rute) |
| Send melding (coach) | Inspector | Meldingsflyt (bekreft rute) |
| Tester-snarvei | Inspector | Testoversikt (bekreft rute) |

**Falske kontroller å wire opp (per v10 refinement-sjekkliste #1):** Plan A/B-toggle, AI-chips, Del-knapp, sidebar-collapse, rail-knapper, kanban «Ny økt», statusbar-tabs/zoom — alle har visuell state men mangler logikk i mockup. Må kobles ved porting.

---

## 7. Datakilde

| Skjerm | Kilde |
|---|---|
| Alle uke/dag/agenda-visninger | `TrainingPlanSession` for valgt uke + plan (player: innlogget bruker; coach: `playerId`) |
| Pyramide/balanse/trender | Aggregat av `TrainingPlanSession` siste 30 d + periode-mål |
| Mål-seksjon | `Goal` |
| Coach: avvik/godkjenning/veiledning | `PlanAction` (PENDING), `SessionRequest` (PENDING), forrige-30d-delta |
| Tom data | Empty-state — aldri falske tall (per v10-regel) |

Gjenbruk eksisterende data-loadere som utgangspunkt: `loadPlayerWorkbench()` og `loadCoachWorkbench(id)`.

---

## 8. Anbefalt bygge-rekkefølge (bolker à 3 skjermer — porting-gatens kvalitetsgrense)

1. **Bolk 1 — fundament + default:** delt skall (Topbar/Sidebar/Inspector/Statusbar) + `a-uke` (default) + `a-dag`. Verifiser veksler-stillas + Live Session-bro.
2. **Bolk 2 — Kalender komplett:** `a-kanban` + `a-dash` + `a-coach`.
3. **Bolk 3 — Liste:** `b-tidslinje` + `b-kanban` + `b-dashboard`.
4. **Bolk 4 — Liste coach + bro:** `b-coach` + `b-drill` + coach-paritet i B.
5. **Opprydning:** koble nye ruter, fjern død kode (`portal-planlegge/workbench`, `portal-workbench/workbench-shell`, prototype).

Hver skjerm gjennom **design-porting-gaten:** bygg FRA v10 → screenshot (Playwright) → adversarial diff-agent → fiks til 0 avvik → vis Anders.

---

## 9. Åpne spørsmål (krever Anders' avgjørelse)

1. **Coach-paritet i Liste (B):** Skal coach-handlingene (notat/video/oppgave/melding/godkjenn/løft) + spillersøk portes inn i B, eller holder Kalender (A) for coach? (Anbefalt: port inn for paritet.)
2. **ÅR/MND-zoom:** Ikke implementert i v10 (kun UKE/DAG/KANBAN/DASHBOARD aktive). Bygges senere, eller skjules nå? (Anbefalt: skjul til senere.)
3. **Eksakte ruter** merket «bekreft» i navigasjonskartet (Del plan, Send melding, Tester-snarvei).
4. **Mobil:** v10 er desktop 1440px. PlayerWorkbench i dag er mobil 430px. Trenger workbench en mobil-variant nå, eller er desktop nok til lansering?
