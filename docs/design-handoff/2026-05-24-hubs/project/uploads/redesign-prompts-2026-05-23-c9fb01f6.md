# Claude Design-prompts — 27 resterende skjermer i akgolf-hq

Generert 2026-05-23. Disse 27 skjermene trenger pixel-perfekt design fra Claude Design — 9 batches, én canvas per batch.

**Total estimat:** ~55-65 timer implementering etter at design er ferdig.

---

## SHARED HEADER (lim inn på toppen av hver prompt-batch)

**Kontekst:**
AK Golf HQ-plattformen er Anders Kristiansens golf-coaching-system. To portaler:
- **PlayerHQ** (`/portal/*`) — spillerens lyse, varme arbeidsflate
- **CoachHQ** (`/admin/*`) — coachens kontroll-senter med mørk forest-sidebar

Disse 27 skjermene må matche siste pixel-perfekte design fra tidligere bundles
(Sg2FEKvy + kgPURcJR) — så ny design må stå sammen med eksisterende skjermer.

**Design-tokens (eksakt match):**
- Forest primary: `#005840`, dark `#003A2A`
- Accent lime: `#D1F843`, deep `#BFE933`, soft `rgba(209,248,67,0.35)`
- Surface: `#FAFAF7`, card `#FFFFFF`, line `#E5E3DD`
- Ink: `#0A1F17`, muted `#5E5C57`, subtle `#9C9990`
- Success: `#2C7D52`, warn: `#B8852A`, danger: `#A32D2D`
- Pyramide-farger:
  - FYS `#005840` · TEK `#1A7D56` · SLAG `#D1F843`
  - SPILL `#B8852A` · TURN `#5E5C57`
- Fonts:
  - Body: Inter
  - Display: Inter Tight (overskrifter)
  - Italic-highlight: Instrument Serif (kun for ett-ord italic-ord i hero-tittel)
  - Mono/tabular-nums: JetBrains Mono
- Radius: 16px (cards), 999px (pills), 8-12px (knapper), 14px (small cards)
- 8pt-grid spacing

**Mønstre å gjenbruke fra eksisterende skjermer i prosjektet:**
- **Hero**: eyebrow (mono caps) + tittel "Lead-ord *italic-ord*" + sub (mono med dot-separator)
- **KPI-row**: 4 celler, første "featured" (forest gradient + lime tall)
- **Disciplin/section card**: `.te-disc`-mønsteret med pyramide-pill venstre + progress-bar høyre
- **Status-pill**: små mono-pills med dot-prefix (ontrack/atrisk/done)
- **CoachHQ-sidebar**: mørk forest #0F2A22 med lime aktive-strek venstre

**Referanse-filer i fillagring:**
- `~/Documents/Claude/akgolf-hq/teknisk-plan/design-bundle/_SEBg4QyodvbW2k06JWiGw/ak-golf-hq/project/`
- `~/Documents/Claude/akgolf-hq/teknisk-plan/design-bundle/kgPURcJRyibKHRG8s69wKg/ak-golf-hq/project/`

---

# BATCH PR1 · Hjem-sidene (2 skjermer)

**Kritikalitet:** HØYEST — entry-point for begge portaler.

## Skjerm 1.1 · `/portal` — PlayerHQ Workbench (spillerens hjem)

**Lever 3 desktop-varianter + mobile:**

### Variant A — Stack-layout (klassisk)
- Hero med spiller-avatar (XL, klikkbar → /portal/meg) + navn + HCP-pill + tier-pill
- Eyebrow: "PLAYERHQ · I DAG · {dato}"
- Wetter-chip topp-høyre med live puls hvis utendørs-økt planlagt
- 4-celle KPI-strip: Snittscore · Neste turnering · Tester-progresjon · HCP-trend (sparkline)
- **Dagens fokus-card** (priority): "Du har 2 ting i dag" med expandable rader (drill-økt 14:00, faktura-frist 17:00)
- **Pyramide-uke-strip** — 7 dager med drill-prikk per dag (FYS/TEK/SLAG fargekodet)
- **Coach-ping-banner** hvis Anders har sendt melding (lime accent + "Svar Anders →")
- **Aktivitet-feed** høyre kolonne: siste 5 økter/tester/mål-milepæler
- **CTA-bar nederst:** "Start dagens økt" (lime) + "Ny økt fra plan" (ghost)

### Variant B — 3-kol command-center
- Venstre: aktiv plan + neste milepæl
- Midt: dagens fokus + brenner-tasks
- Høyre: live-data (Garmin puls / TrackMan-status / vær)

### Variant C — Magazine-stil
- Stort cover-bilde (banen) med eyebrow + tittel "God morgen, *Markus*"
- Stats-row som overlay nederst
- Cards under i 2-kol grid

## Skjerm 1.2 · `/admin/agencyos` — CoachHQ Hjem (Anders' kommando-senter)

**Lever 3 desktop-varianter + mobile:**

### Variant A — Operations cockpit
- Hero med "God morgen, *Anders*" + ukens fokus-tekst
- 4-cell KPI: Aktive økter i dag · Påmeldte denne uka · Brennende oppgaver · Stall-helse-score
- **I dag-tidslinje** — vertikal med klokkeslett venstre + økt-cards høyre
- **Brennende oppgaver-card** (rød accent): 3-5 tasks som krever handling
- **Stall-overview** — 6 mini-spiller-avatar med status-prikk (aktiv/skadet/permisjon)
- **Workspace-quick-strip** — sticky kort: 3 oppgaver fra Notion-workspace
- **Aktivitet-strøm** — siste meldinger/godkjenninger/påmeldinger

### Variant B — KPI-tunge dashboards
- Stort heatmap topp (uka time-for-time med drill-tetthet)
- Side-by-side: økter-i-dag + tomorrow-prep

### Variant C — Magazine-stil
- Hero med fokus-citat (Mac O'Grady-quote)
- 2x2 grid cards med varierte størrelser

**Lever:** 6 desktop-artboards + 2 mobile-mockups per primær variant.

---

# BATCH PR2 · Spiller-detalj-flyt (3 skjermer)

**Kritikalitet:** HØYEST for Anders — 80% av hans tid.

## Skjerm 2.1 · `/admin/spillere/[id]` — Spiller-detalj hovedside

- Hero: avatar XL + navn (Instrument Serif italic) + cohort-pill (A1/A2/B1) + HCP + WAGR
- 5 tabs: Profil · Plan · Tester · Analyse · Notater
- 4-celle KPI under tabs: HCP-trend (sparkline) · SG-total · Tester gjort · Neste økt
- **Tabs som default visning (Profil):**
  - Personalia + foreldre + Stripe-status + kommunikasjon-info
  - Aktivitet-tidslinje siste 30 dager
  - Coach-notater (italic Instrument Serif)
  - Knapper: "Send melding" + "Tildel test" + "Ny økt" + "..."-meny

## Skjerm 2.2 · `/admin/spillere/[id]/profil` — Spiller-profil detaljside

- Sub-hero: tilbake-pill + spiller-strip
- Sections:
  - **Personalia** (2-kol fact-grid: navn, fdato, klubb, telefon, e-post, postadresse)
  - **Forelder/verge** (1-3 cards med Stripe-betaler-flagg)
  - **Spiller-DNA** (5-akset radar: FYS/TEK/SLAG/SPILL/TURN — fra cohort-snitt)
  - **Mål** (3 aktive mål-cards)
  - **Skader/permisjoner** (Leave-historikk)
  - **Coachens vurdering** (italic blokk-quote)

## Skjerm 2.3 · `/admin/spillere/[id]/rediger` — Rediger spiller

- Form-layout 2-kol
- Sticky save-bar nederst med Lagre/Avbryt
- Validering inline (rød border + tekst under)
- Endrings-historikk side ved side

**Lever:** 3 desktop-skjermer + 1 mobile (Variant A av detalj-hovedside).

---

# BATCH PR3 · Booking-flyt (3 skjermer)

**Kritikalitet:** REVENUE-kritisk.

## Skjerm 3.1 · `/portal/booking` — PlayerHQ booking-landingsside

- Hero med "Book *neste økt*"
- Filter-strip: type (Privat/Gruppe/Test/Trackman) + tilgjengelig-dato + coach
- Coach-cards-grid (3 cards): Anders, Markus, Junior coaches
- Bane-cards-grid (4 cards): GFGK, Mulligan, Miklagard, range
- **Anbefalt for deg** strip — AI-basert basert på aktiv plan

## Skjerm 3.2 · `/portal/booking/coach/[id]` — Book direkte med coach

- Coach-hero: bilde + navn + spesialitet + neste ledig-tid
- Service-pris-liste (privattime 60min/90min, gruppetime, test, TrackMan)
- Date-picker med ledig-prikker
- Booking-form med credit-check (PRO-abonnement) eller Stripe-checkout

## Skjerm 3.3 · `/portal/booking/anlegg/[id]` — Bane-detalj side

- Hero med stor cover-bilde (banen)
- Specs: hull, par, lengde, slope
- Sub-fasiliteter (range, putting-green, TrackMan-bay)
- Booking-tilgjengelighet-grid
- Tournament-historikk

**Lever:** 3 desktop + 3 mobile.

---

# BATCH PR4 · Innsikt + Analyse (6 skjermer)

**Kritikalitet:** Data-visualisering — heavy use.

## Skjerm 4.1-4 · `/portal/innsikt` — 4 tabs

### Tab 1: Mål
- 3 aktive mål-cards (på plan/trenger fokus/fullført) — pixel-perfekt fra planlegge-mal-mønsteret
- Mål-historikk (collapsed)

### Tab 2: Statistikk
- SG-fordeling-card (5-akset radar) — sammenligne mot cohort-snitt
- Distance-statistikk per kølle (bar-chart)
- Tee-Total/App/Around/Putt-tabs underordnet

### Tab 3: TrackMan
- Siste 5 økter (TM-tilkoblet) som timeline
- Per økt: smash factor, ball speed, spin rate, launch angle
- Sparkline per metrikk

### Tab 4: Resultater
- Runder (kort + grid)
- Turneringer (gantt med slutt-resultat)
- Eksporter-rapport-knapp

## Skjerm 4.5 · `/admin/analyse` — Stall-analyse (CoachHQ)

- Stort heatmap: spillere × pyramide-områder (fargekodet hit-rate)
- Filtre: cohort, periode, miljø
- Drill-down per celle → spiller-snitt + topp 3 i kategori

## Skjerm 4.6 · `/admin/lag-snitt` — Lag-snitt benchmark

- Cohort-velger (A1/A2/B1/B2)
- 5-aksed radar vs PGA Top 40-benchmark
- Tabell-row per nøkkel-test
- Distribusjons-bar per metrikk

**Lever:** 6 desktop-skjermer + 2 mobile (Mål + TrackMan).

---

# BATCH PR5 · CoachHQ Operasjoner (5 skjermer)

**Kritikalitet:** Anders' daglige booking + kapasitet-arbeid.

## Skjerm 5.1 · `/admin/kalender/uke` — Kalender uke

- 7-dagers grid (man-søn) med tidsslot-akse
- Økter som blokker (farger per pyramide)
- Drag-and-drop for å flytte økter
- Sticky topbar med uke-velger + filter (alle/mine/ledig)
- "+"-knapp i tom celle → quick-add-økt-modal

## Skjerm 5.2 · `/admin/kalender/maned` — Kalender måned

- 6-rad måneds-grid
- Per dag: max 3 økt-pills + "+N til"-overflow
- Hover → quick-preview-popup
- Side-panel: utvidet dag-detalj

## Skjerm 5.3 · `/admin/bookinger` — Booking-oversikt

- Filter-strip: status (PENDING/CONFIRMED/AVLYST) + coach + type + dato-range
- Liste-view med sortable kolonner (dato/spiller/type/coach/betaling)
- Stat-strip topp: i dag · denne uka · brennende avbestillinger

## Skjerm 5.4 · `/admin/anlegg` — Anlegg-oversikt

- 3-kol grid av anlegg (GFGK/Mulligan/Miklagard/etc.)
- Per card: cover-bilde, navn, type, fasiliteter, dagens utnyttelse
- Klikk → anlegg-detalj-side
- "+ Nytt anlegg"-CTA

## Skjerm 5.5 · `/admin/availability` — Tilgjengelighet

- Coach-velger topp
- 7-dagers ukeplan med drag-resize for ledig-blokker
- Excepton-rader: "Ferie 12-19. jul", "Bortre uke september"
- Sticky save-bar

**Lever:** 5 desktop + 2 mobile (Uke-kalender + Bookinger-liste).

---

# BATCH PR6 · Kommunikasjon (5 skjermer)

## Skjerm 6.1 · `/portal/coach` — Coach-portal (spillerens kommunikasjons-hub)

- Hero med coach-foto + "Anders Kvam" + "PGA Class A · Mac O'Grady-disipper"
- 4 kort:
  - **Send melding** (CTA)
  - **Be om plan-justering** (CTA)
  - **Spør AI-caddie** (lime CTA)
  - **Book privattime** (CTA)
- Siste 5 meldinger fra coach (kollapsiblet)

## Skjerm 6.2 · `/portal/coach/notater/[id]` — Meldingstråd-detalj

- Tråd-tittel + status (åpen/besvart/lukket)
- Meldinger som chat-bobler (coach venstre, spiller høyre)
- Vedlegg-strip (video-thumbnails klikkbare)
- Bottom-input med vedlegg-knapp + send

## Skjerm 6.3 · `/portal/varsler` — Varselsenter (PlayerHQ)

- Filter-tabs: Alle · Coach · Plan · System · Booking
- Liste med varsel-cards
- Per row: ikon + tittel + sub + dato + action-knapp ("Marker som lest", "Se detaljer")
- "Marker alle som lest"-knapp topp-høyre

## Skjerm 6.4 · `/admin/innboks` — Coach innboks

- Tråd-liste venstre (300px sidebar)
- Aktiv tråd høyre med full meldingshistorikk
- Filter-pills: Uleste · Spørsmål · Plan-justeringer · Foreldre
- Send-modal nederst

## Skjerm 6.5 · `/admin/godkjenninger` — Godkjenninger-kø

- Liste med approval-rader: spiller/forelder + type + tidspunkt + dager-ventet
- Per row: "Godkjenn" (lime) / "Avvis" (ghost) / "Be om mer info"
- Tom-state: "Alle godkjenninger er behandlet ✓"

**Lever:** 5 desktop + 2 mobile (Varsler + Innboks).

---

# BATCH PR7 · Live-økt (3 skjermer)

**Kritikalitet:** Spillerens kritiske flow.

## Skjerm 7.1 · `/portal/(fullscreen)/live/[sessionId]/brief` — Pre-økt brief

- Hero med coach-quote (Mac O'Grady-stil)
- Drill-liste (read-only) — Anders har bygd dette på forhånd
- KPI-strip: total tid + total reps + pyramide-fokus
- "Start"-CTA stor og lime

## Skjerm 7.2 · `/portal/(fullscreen)/live/[sessionId]/active` — Aktiv økt (logger v2)

- **Lys tema** (matcher PlayerHQ)
- Aktiv drill: tittel + reps-tellere (Dry-swing / Lav / Full) — koble til SessionSet
- Stort "+5 / +10 / +25"-touchtarget (96px høyde)
- Drill-progresjon side-by-side (5 drills med ✓/●/○ status)
- Notat-pill + Video-pill + Spørsmål-pill bunn
- "Ferdig med drill"-CTA

## Skjerm 7.3 · `/portal/(fullscreen)/live/[sessionId]/summary` — Etter-økt summary

- Totaler: tid + reps per kategori + hit-rate
- Per drill (accordion): faktisk vs mål + TM-data + notater + video-thumbnails
- Selvevaluering 1-5 stjerner
- "Send til Anders"-CTA + "Lagre uten å sende"

**Lever:** 3 desktop + 3 mobile (Variant A er primær for live-flow).

---

# BATCH PR8 · Meg + detaljer (8 skjermer)

**Kritikalitet:** Medium — brukes ukentlig.

## Skjerm 8.1 · `/portal/meg` — Profil hovedside (spiller)

- Hero med avatar XL + navn (Instrument Serif italic) + HCP + tier-pill
- Sub-nav: Profil · Abonnement · Innstillinger · Helse · Foreldre · Hjelp
- Card-grid: Personalia / Mål / Tester / Sertifikater / Klubb-tilhørighet

## Skjerm 8.2 · `/portal/meg/abonnement` — Abonnement-status

- Tier-card (GRATIS / PRO) med "Oppgrader"-CTA hvis GRATIS
- Stripe-status + neste faktura-dato + pris
- Faktura-historikk-liste (siste 12)
- "Bytt kort" + "Avbestill"-knapper

## Skjerm 8.3 · `/portal/meg/abonnement/faktura/[id]` — Faktura-detalj

- Faktura-header (nummer + dato + status-pill)
- Linjeposter-tabell
- Total med MVA-breakdown
- "Last ned PDF"-CTA

## Skjerm 8.4 · `/portal/meg/abonnement/oppgrader` — Oppgrader til PRO

- Hero med "Bli PRO · *299/mnd*"
- Feature-sammenligning GRATIS vs PRO (3-kol grid)
- Testimonials-row (italic quotes fra andre PRO-spillere)
- "Oppgrader nå"-CTA med Stripe-checkout

## Skjerm 8.5 · `/portal/meg/feedback` — App-feedback

- Rating 1-5 stjerner
- Tekst-input "Hva fungerer bra?" + "Hva kan bli bedre?"
- Send-knapp + "Anonym-toggle"

## Skjerm 8.6 · `/portal/tren/turneringer/[id]` — Tournament detalj

- Hero med tournament-cover + tour-badge (Olyo/Srixon/etc.)
- Stats-strip: HCP-krav · purse · spillere · format
- Påmelding-status + countdown til start
- Spiller-liste hvis påmeldt
- Forberedelse-plan (4 uker auto-gen)

## Skjerm 8.7 · `/portal/mal/runder/[id]` — Runde-detalj shot-by-shot

- Hero med banen + score + dato
- Hull-by-hull-tabell (par/score/putts/penalties/notes)
- SG per hull (bar-chart)
- Shot-by-shot-modal når hull klikkes

## Skjerm 8.8 · `/portal/mal/runder/ny` — Legg til runde manuelt

- 18-hull-form med tab-mellom-felter
- Auto-beregn total
- Bane-velger + dato + spilte-med-velger
- Validering inline

**Lever:** 8 desktop-skjermer (kun primær variant for hver).

---

# BATCH PR9 · Plan-builder + Plan-listen (5 skjermer)

## Skjerm 9.1 · `/admin/plans/[planId]` — Plan-builder (Coach)

- Hero med plan-navn (Instrument Serif italic) + spiller + status
- 6 tabs: Oversikt · Periodisering · Drills · Hit-rate · Effekt · Innstillinger
- Gantt-view for periodisering (matcher periodiserings-popup)
- Drag-and-drop drill-bibliotek høyre kolonne (collapse/expand)

## Skjerm 9.2 · `/admin/grupper/[id]` — Gruppe-detalj

- Hero med gruppe-navn + spillere-count + coach
- Spiller-grid (mini-cards)
- Gruppeplan + neste samling
- Statistikk per spiller (sammenlign)

## Skjerm 9.3 · `/admin/teknisk-plan` — Teknisk plan-oversikt

- KPI-strip topp
- Aktive planer-grid (3-kol cards)
- Per card: navn, spiller, periode, posisjoner-count, status
- Filter: cohort, periode

## Skjerm 9.4 · `/admin/talent` — Talent-radar

- 5-akset radar med alle talent-spillere (overlay)
- Filter: cohort, alder, kjønn
- Sammenlign-modus (3 spillere side-by-side)

## Skjerm 9.5 · `/admin/oppfolging` — Oppfølging-kø

- Liste med spillere som trenger oppfølging (overdue tester, manglende økter, skader)
- Per row: spiller + årsak + dager-siden + action-CTA
- Filter på årsak

**Lever:** 5 desktop + 1 mobile (Plan-builder oversikt-tab).

---

# Slik bruker du promptene

For hver batch:
1. Åpne Claude Design: `claude.ai/design`
2. Velg ny canvas
3. Lim inn SHARED HEADER + batch-spesifikk del
4. Vent på render — får 2-3 desktop-varianter per skjerm + mobile
5. Velg variant + eksporter bundle
6. Kjør `Fetch this design file ...` med bundle-hash
7. Jeg implementerer

## Implementerings-rekkefølge (anbefalt)

| Trinn | Batch | Estimat | Hvorfor først? |
|---|---|---|---|
| 1 | PR1 Hjem-sider | 6 t | Mest besøkte sider |
| 2 | PR2 Spiller-detalj | 8 t | Anders' primary tool |
| 3 | PR7 Live-økt | 6 t | Spillerens kritiske flow |
| 4 | PR3 Booking | 6 t | Revenue |
| 5 | PR4 Innsikt-Analyse | 10 t | Data viz |
| 6 | PR5 CoachHQ Ops | 8 t | Daglig coach-arbeid |
| 7 | PR6 Kommunikasjon | 8 t | Cross-cutting |
| 8 | PR9 Plan-builder | 7 t | Strategisk |
| 9 | PR8 Meg + detaljer | 6 t | Lower-frequency |

**Total: ~65 timer over 4-6 sesjoner.**

## Sluttkommentar

Når disse 9 batchene er ferdig, er HELE plattformen pixel-perfekt fra siste design-handover. Da kan vi gå over til:
- Performance-tuning
- Toveis Notion-sync (Workspace v1.1)
- TrackMan Live-integrasjon (Live-økt v1.1)
- React Native mobile-app (eget repo)
