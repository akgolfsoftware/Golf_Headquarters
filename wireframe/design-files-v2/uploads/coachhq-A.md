# Mini-batch coachhq-A - Plan-management

**5 skjermer i denne mini-batchen.** Felles moenster: deep-dive paa spiller +
plan-byggeren + plan-detalj + plan-edit + plan-templates. Markus Roinaas
Pedersen er referansespiller, Anders Kristiansen er hovedcoach.

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for CoachHQ-skjermer

- **Sidebar:** TO-LAGS. Smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7) til hoeyre for rail. Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI enkelt-lag lys sidebar (det er PlayerHQ-moenster).
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Anders" eller "Welcome back"). Eksempler: *"Onsdag morgen. 38 spillere venter."* / *"3 plan-aksjoner i koeen."*
- **Referanse-personer:**
  - Hovedcoach: Anders Kristiansen (NGF Trener IV)
  - Spillere: Markus Roinaas Pedersen (Kat A, Elite, +2,4), Henrik Nilsen (Kat B, Pro, 8,7), Anna Karlsen (Free, 16,8), Mads Roenning (Pro, 9,4), Lise Sandberg (Free, 19,5), Joachim Tangen (Pro, 14,2, skadet)
- **Pyramide-farger:** FYS groenn `#16A34A`, TEK darker primary `#005840`, SLAG lime accent `#D1F843`, SPILL gold `#F4C430`, TURN graa `#5E5C57`.
- **Lower-is-better metrics (HCP, score, puttar):** Nedgang vises som success-groenn, oppgang som danger-roed.
- **Higher-is-better metrics (SG, distanse, antall oekter, badges):** Motsatt.
- **Tabular nums** (JetBrains Mono) paa alle score-, HCP-, dato- og prosent-kolonner.
- **Komma som desimal** (12,4 ikke 12.4), **mellomrom som tusenseparator** (1 600 kr ikke 1.600).
- **Maks 3 lime-elementer** (#D1F843) synlig per skjerm.
- **Maks 1 italic Instrument Serif-element** per skjerm -- reservert for hero eller editorial quote.
- 8pt-grid (8/16/24/32/40/48/64), Lucide-ikoner med 1.75 stroke.

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: 360-spillerprofil

# AK Golf Platform — CoachHQ — 360-spillerprofil

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/elever/:id`
- **Arketype:** C — Detail + tabs (deep-dive, 7 tabs)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/360-profil.html`
- **Audit:** `wireframe/audit/coachhq-360-profil.md`
- **Tilhørende modaler:** `SendMessageModal`, `BookSessionModal`, `AIChatModal`, `PyramidTierDetailDrawer`, `StatDetailDrawer`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coachens dypeste view av én spiller. Fra `Elever`-listen klikker coach inn hit for å se hele bildet — pyramide-fokus over tid, SG-utvikling, TrackMan-data, test-resultater, plan-status, turneringer og notater. 40+ klikkbare elementer. Skjermen brukes før hver coaching-økt og når agent-anbefalinger trenger menneskelig kontekst.

## Header-blokk — UNIKT

- **Avatar:** 64px sirkel med profilbilde av Markus Roinås Pedersen
- **H1:** `Markus Roinås Pedersen` (Geist 32px)
- **Subtittel:** `Kategori A · Elite · WANG Toppidrett · 17 år` (muted)
- **Stat-pills (4):** `HCP +2,4` · `SG +0,8 (12u)` · `Sist trent: i dag` · `Plan: Sommer-toppform`
- **Primary CTA:** `Book ny økt` (åpner BookSessionModal)
- **Sekundær:** `Send melding` + `...`-meny (Eksporter rapport, AI-coach chat, Marker skadet)

## Tab-strip (7 tabs)

| Tab | Innhold |
|---|---|
| **Pyramide** (default) | Donut med 5-tier fordeling + heatmap (12 uker × 5 områder) |
| **SG** | Strokes Gained-stripe per kategori + sparklines siste 12 uker |
| **TrackMan** | Per-kølle KPI-grid + trajectory snapshot |
| **Tester** | Tabell over alle tester med personlig rekord (★) |
| **Plan** | Aktiv plan-card med fase-fremdrift + ukens 5 økter |
| **Tournaments** | Kommende + 6 siste resultater (score, sted, dato) |
| **Notater** | Coach-notat-feed (10 siste, italic Instrument Serif quote) |

## Layout — UNIKT for hver tab

### Pyramide-tab (default)

Asymmetrisk grid:
- **Stort donut-card (8-col):** Pyramide siste 4 uker, klikk-segment åpner PyramidTierDetailDrawer
- **Stat-rich 2x2 (4-col):** FYS 18 % / TEK 32 % / SLAG 24 % / SPILL 14 % / TURN 12 % med spark
- **Heatmap-stripe (12-col):** 12 uker × 5 områder, hver celle hover → tooltip `uke 18 · TEK 4t 20m`
- **Hvor henger han? (12-col):** 5 stat-cards stilt opp horisontalt, klikk → StatDetailDrawer

### SG-tab

- **SG-bento (12-col):** 5 kategorier som horisontal bar-stripe (OTT / APP / ARG / PUTT / TEE)
- **Trend-graf (8-col):** Spark-linjer for hver kategori, 12 uker
- **Best/verst (4-col):** Listet hva som har bedret/forverret seg

### TrackMan-tab

- **Per-kølle-grid (12-col):** Driver / 3W / 5i / 7-jern / Wedge / Putter — hver med carry, ball-speed, spin
- **Trajectory SVG:** Apex-markører klikkbare, popover

### Tester-tab

Tabell med kolonner: `Test | Beste | Sist | Mål | Status (PR ★)`. Klikk-rad → TestAttemptDetailModal.

### Plan-tab

- **Plan-card (8-col):** "Sommer-toppform" + fase-progresjon
- **Ukens økter (4-col):** 5 stk listet med "I dag / I morgen / Onsdag..."

### Tournaments-tab

Tidslinje vertikalt, kommende først, deretter 6 siste resultater.

### Notater-tab

10 siste coach-notater som feed-cards. Hvert kort: dato, italic Instrument Serif quote, "Les hele →".

## Klikkbare elementer (utenfor felles arketype-C)

| Element | States |
|---|---|
| Tab-chip | default, hover, active (2px stripe), disabled |
| Donut-segment | default, hover (utvid 2px), klikk → drawer |
| Heatmap-celle (60 stk) | default, hover (border + tooltip), klikk → drill |
| Stat-rich-card spark | hover → SparkTooltip med `dato + verdi` |
| Drawer "Akkurat nå"-rader | klikk neste → BookSessionModal, klikk sist → RoundDetailModal, klikk agent → PlanActionDetailModal |

## Empty / loading / error

- **Empty (ny spiller, ingen data):** Stort sentrert "Ingen aktivitet ennå. Book første økt →"
- **Empty per tab:** Dempet ikon (Lucide `BarChart3` for SG, `Target` for tester)
- **Loading:** Skeleton hele profilen (avatar-sirkel, header-pills, donut-placeholder)

## Eksempel-data

- **Spiller:** Markus Roinås Pedersen, A-kategori Elite
- **Pyramide siste 4u:** TEK 32 % · SLAG 24 % · FYS 18 % · SPILL 14 % · TURN 12 %
- **Aktiv plan:** "Sommer-toppform" — fase 3 av 5 (Spesifikk), 64 % gjennomført
- **Siste tournament:** Sørlandsåpent 2026, T12 (-3), 7. mai 2026
- **Coach:** Anders Kristiansen

## Ønsket output fra Claude Design

1. Lyst tema, default Pyramide-tab med Markus
2. Mørkt tema, samme
3. Tab-bytte til SG-tab (samme spiller)
4. Drawer åpen: PyramidTierDetailDrawer for "Slag (24 %)"
5. Header-collapse-state (sticky-bar etter scroll)
6. Loading-state hele profilen
7. Mobil ≤640px — header stables, tab-strip horisontal scroll, content 1-col

## Ikke-mål

- Ikke designe `BookSessionModal`, `SendMessageModal` (egne pakker)
- Ikke designe sub-drawers — kun Pyramide-drawer som referanse
- Ikke designe AI-chat-interface (egen Fase-pakke)

---

## Pakke 2/5: Plan-bygger (wizard)

# AK Golf Platform — CoachHQ — Plan-bygger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/builder` (også `/admin/plans/:id/edit` for redigering)
- **Arketype:** D — Wizard / Form (6-step plan-wizard)
- **Tier-gating:** Coach Pro+ for AI-generering. Manuell bygging i alle tiers.
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-builder.html`
- **Audit:** `wireframe/audit/coachhq-plan-builder.md`
- **Tilhørende skjermer:** Plans-list (batch 2 pakke 1), Plan-detalj (batch 3)
- **Tilhørende modaler:** TemplateSelectorModal (pakke 15), AIPlanGeneratorModal (pakke 14)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. **Full CoachHQ-sidebar synlig** (ikke auth-modus). Wizard sentrert i hoved-content. **Steg-indikator (numbers) sticky øverst i content-area, ikke i sidebar.** Maks 3 lime per skjerm.

## Spec — hva skjermen er for

Plan-byggeren er Anders' kjerneverktøy — her bygger han 4–12-ukers periodiserte treningsplaner for hver spiller. Alternativt brukes mal eller AI-generering. Output: en plan med periode, pyramide-fokus, ukentlige økt-skjema og milestones — som så sendes til spiller for godkjenning før den blir aktiv.

## Layout — UNIKT for denne skjermen

CoachHQ-sidebar venstre (to-lags). Hoved-content:

### Steg-indikator (sticky 56px topp)

`(1) Spiller — (2) Periode — (3) Pyramide — (4) Mal — (5) Økter — (6) Bekreft`

Numre. Aktiv: accent-bg + white text. Fullført: primary-bg + ✓.

### Steg 1 — Velg spiller

- Søkefelt: "Søk spiller eller velg fra liste"
- Spillerliste (samme komponent som /admin/elever men kompakt): avatar + navn + HCP + sist-trent
- Filter-chips: Kategori (A–K) / Status (Aktiv / Inaktiv)
- Klikk-rad → velger spiller + viser preview-card til høyre med spiller-info, siste plan, mål

### Steg 2 — Periode

- **Dato-fra** + **Dato-til** dato-pickere (default: i dag → 8 uker frem)
- Forslags-chips: "4 uker" / "8 uker" / "12 uker" / "Hele sesongen (april–oktober)"
- **Treningsdager-velger:** 7 sjekkbokser (Man–Søn) med default basert på spillerens historikk
- **Antall økter per uke:** stepper (1–14)
- Sammendrag inline: "8 uker · 32 økter totalt · Mai–Juni 2026"

### Steg 3 — Pyramide-fokus

- **5 slidere** (FYS / TEK / SLAG / SPILL / TURN) som summeres til 100%
- Hver slider har:
  - Etikett + nåværende %
  - Slider 0–60%
  - Spiller-historikk-indikator under (subtil bar som viser hva spilleren har trent siste 4 uker)
- **Sum-validering:** "Sum: 100% ✓" eller "Sum: 95% — juster slidere" (warning)
- **Forslag-knapp:** `AI-forslag basert på spiller →` (henter fra spillerens historikk)

### Steg 4 — Mal eller blank

3 store kort:
- **Bruk mal** → åpner TemplateSelectorModal (pakke 15)
- **AI-generer** (lime accent stripe) → åpner AIPlanGeneratorModal (pakke 14)
- **Start blank** → går videre med tom plan-skall

Etter valg: ekspanderer til preview av valgt mal/AI-output (12 økter foreslått) eller tom liste.

### Steg 5 — Økter (drag-redigerbar)

- **Uke-fanene** (8 stk): "Uke 19" / "Uke 20" / … — klikk for å bytte
- Per uke: liste over økter (default 4–6) med:
  - Drag-handle (Lucide `GripVertical`)
  - Dag + tid
  - Tittel (klikkbar for redigering)
  - Pyramide-stripe (samme som batch 2 pakke 5)
  - Varighet
  - Antall øvelser
  - "..."-meny (Rediger / Dupliser / Slett)
- **+ Legg til økt** under listen (link)
- **Milestone-marker** mellom uker (f.eks. "Uke 22: Sørlandsåpent" — gull-pill, draggable)

### Steg 6 — Bekreft og send

Sammendrag-card:
- Spiller (avatar + navn)
- Periode (dato-fra → dato-til)
- 32 økter / 8 uker
- Pyramide-fordeling (donut + tall-tabell)
- 1 milestone

Sjekkbokser:
- "Send til Markus for godkjenning" (default ✓)
- "Notifiser foresatt" (default av — kun synlig hvis spiller <18)
- "Synkroniser med Google Kalender" (default ✓)

Footer: `Avbryt` + `← Tilbake` + `Send forslag →` (CTA endres fra "Neste →" til konkret handling)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-nummer-indikator | static, klikkbar tilbake |
| Spiller-rad (steg 1) | default, hover, valgt (accent ring + ✓) |
| Dato-pickere | default, open kalender, valgt |
| Forslags-chip (4/8/12 uker) | default, hover, valgt |
| Treningsdag-checkbox | uvalgt, valgt, focus |
| Pyramide-slider | default, dragging, sum-warning, sum-OK |
| `AI-forslag →` (steg 3) | default, hover, loading, success-fill av slidere |
| Mal-kort (steg 4) | default, hover (lift), valgt — laster preview |
| Uke-fane (steg 5) | default, hover, aktiv (accent underline) |
| Økt-rad (steg 5) | default, hover (drag-handle synlig), drag-active (rotert 2°) |
| Milestone-pill (steg 5) | default, hover, klikk → mini-edit-popover |
| `+ Legg til økt`-link | default, hover, klikk → ny rad inline |
| Sjekkbokser (steg 6) | uvalgt, valgt, focus |
| `Send forslag →`-CTA | default, hover, disabled (validering feil), loading ("Sender til Markus …"), success (accent flash + redirect) |
| `Avbryt`-knapp | default, hover, klikk → confirm-popover (lagre som utkast?) |

## Empty / loading / error / success-states

- **Steg 1 ingen treff:** "Ingen spillere matcher. [Inviter ny →]"
- **Steg 3 validering:** Sum ≠ 100% → warning under slidere, "Neste →" disabled
- **Steg 4 AI-loading:** Modal-spinner ~15 sek "Genererer plan basert på Markus' historikk"
- **Steg 5 drag-error:** Toast "Kunne ikke flytte økt. Prøv igjen."
- **Submit loading:** Hele wizard låst, "Sender til Markus …"
- **Submit error:** Toast: "Kunne ikke sende. Prøv igjen."
- **Submit success:** Full-screen confirmation: "Planen er sendt til Markus" + "Han får varsel og kan godta/avvise i sin portal" + CTA `Tilbake til planer →`

## Mobile (≤640px)

Sidebar kollapser til hamburger. Wizard tar full bredde. Steg-indikator komprimerer til "Steg 3 av 6" + dots. Pyramide-slidere stables. Uke-fane (steg 5) blir scrollbar horisontalt. Drag-handle erstattes med opp/ned-piler.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Markus valgt, preview-card synlig)
2. Steg 2 lyst tema (8 uker valgt, 32 økter)
3. Steg 3 lyst tema (slidere, 100% ✓)
4. Steg 3 lyst tema, AI-forslag-loading
5. Steg 4 lyst tema (3 store kort, AI-generer hover)
6. Steg 5 lyst tema (uke 19, 5 økter, en under drag)
7. Steg 6 lyst tema (sammendrag + sjekkbokser)
8. Submit success ("Planen er sendt til Markus")
9. Mørkt tema (steg 5)
10. Mobil ≤640px (steg 3)

## Ikke-mål

- Ikke designe TemplateSelectorModal (pakke 15)
- Ikke designe AIPlanGeneratorModal (pakke 14)
- Ikke designe enkelt-økt-redigering (egen mini-modal, batch 5)
- Ikke designe Plan-detalj-skjerm (batch 3)

---

## Pakke 3/5: Plan-detalj

# AK Golf Platform — CoachHQ — Plan-detalj

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/:id`
- **Arketype:** C — Detail + tabs (5 tabs, tunge data)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-detalj.html`
- **Audit:** `wireframe/audit/coachhq-plan-detalj.md`
- **Tilhørende modaler:** `EditPlanGoalModal`, `ConfirmPhaseCompleteModal`, `AgentReasoningModal`, `NewSessionModal`, `ExportToPlayerModal`, `PhaseDetailDrawer`, `PlanVersionHistoryModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach sitt operasjonelle view av én treningsplan. Viser hvilken fase spilleren er i, hvor langt det er igjen, hvilke økter er gjennomført, hvordan pyramide-fordelingen utvikler seg, hvilke tester står på plan, og hva agentene har foreslått av justeringer. Brukes ved ukentlig plan-review og når noe må omlegges.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `ClipboardList` på lime accent-bg
- **H1:** `Sommer-toppform — Markus Roinås Pedersen` (Instrument Serif italic for "Sommer-toppform")
- **Subtittel:** `Plan #047 · 9. mai – 30. jun 2026 · Coach: Anders K · Sist endret 8. mai 14:22`
- **Stat-pills (4):** `Fase 3 av 5` · `64 % gjennomført` · `Adherence 91 %` · `Peak 12. juni`
- **Primary CTA:** `Marker fase ferdig` (åpner ConfirmPhaseCompleteModal)
- **Sekundær:** `Endre plan-mål` · `...`-meny (Versjonshistorikk, Eksporter til spiller, Del med foresatte)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Faser** (default) | 5 phase-cards horisontalt + agent-historikk |
| **Økter** | Tabell over alle 19 planlagte økter, 13/19 ferdig |
| **Pyramide** | Donut + 12u heatmap + "Endre allokasjon"-link |
| **Tester** | Tester koblet til planen |
| **Mål** | Plan-mål + delmål + progress |

## Layout — Faser-tab (default)

- **Stat-rich-bento (12-col):** 4 cards: Plan-fremdrift / SG / Adherence / Peak-readiness
- **Phase-cards (12-col):** 5 stk horisontalt — Base ✓ · Forberedelse ✓ · **Spesifikk (current)** · Taper · Peak. Klikk → PhaseDetailDrawer.
- **Agent-historikk (12-col):** Tidslinje, siste 6 forslag med "Godkjent" / "Endret" / "Avvist"-stempel

## Phase-card states

| State | Styling |
|---|---|
| Done | accent-prikk + checkmark, dempet bg |
| Current | accent-border 2px + lime accent på header |
| Future | muted, alle datoer vises |
| Peak (siste) | gold accent-border + Lucide `Zap` |

## Layout — Økter-tab

Tabell, kolonner: `Dato | Type | Pyramide | Status | ...`. Eksempel-rader (5 første):

| Dato | Type | Pyramide-mix | Status |
|---|---|---|---|
| 9. mai 08:00 | TEK 1:1 | TEK 60 % SLAG 40 % | Ferdig ✓ |
| 11. mai 16:00 | SLAG | SLAG 80 % FYS 20 % | Ferdig ✓ |
| 13. mai 08:00 | SPILL | SPILL 100 % | I dag |
| 15. mai 14:00 | FYS | FYS 100 % | Planlagt |
| 18. mai 08:00 | TEK 1:1 | TEK 70 % SLAG 30 % | Planlagt |

## Layout — Pyramide-tab

Donut + heatmap + "Endre allokasjon →" + "Se agent-begrunnelse →" (åpner AgentReasoningModal).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip (5 stk) | default, hover, active |
| Phase-card | default, hover (lift), current (accent-border), klikk → drawer |
| Stat-rich-card | default, hover, klikk → drill |
| Donut-segment | default, hover (utvid), klikk → drawer |
| Heatmap-celle | default, hover (border + tooltip) |
| `Marker fase ferdig` CTA | default, hover, loading, success (toast + auto-advance til neste fase) |
| Agent-historikk-rad | klikk → AgentReasoningModal |
| Tabell-rad økt | klikk → SessionDetailModal eller `/admin/sessions/:id` |

## Empty / loading / error

- **Empty (ny plan, ingen økter):** "Ingen økter planlagt. Generer fra fase →"
- **PYRAMID_ADJUST-pulse:** Hvis ny agent-anbefaling kom etter siste page-load — pulse på Pyramide-tab
- **Loading:** Skeleton phase-cards + tabell-rader

## Eksempel-data

- **Plan:** "Sommer-toppform" for Markus Roinås Pedersen
- **Periode:** 9. mai – 30. juni 2026
- **Fase:** 3 av 5 (Spesifikk), 64 % gjennomført
- **Peak:** 12. juni (Sørlandsåpent)
- **Coach:** Anders Kristiansen

## Ønsket output fra Claude Design

1. Lyst tema, Faser-tab default
2. Mørkt tema, samme
3. Tab-bytte til Pyramide-tab
4. PhaseDetailDrawer åpen for "Spesifikk (current)"
5. PYRAMID_ADJUST-pulse på agent-historikk-rad
6. Empty: ny plan uten økter
7. Mobil ≤640px — phase-cards horisontal scroll

## Ikke-mål

- Ikke designe `EditPlanGoalModal`, `AgentReasoningModal` (egne pakker / fase-pakker)
- Ikke designe plan-edit-skjerm (egen pakke 04)

---

## Pakke 4/5: Plan-redigering

# AK Golf Platform — CoachHQ — Plan-redigering

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/:id/edit`
- **Arketype:** C — Detail + tabs (5 tabs, edit-mode)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-edit.html`
- **Audit:** `wireframe/audit/coachhq-plan-edit.md`
- **Tilhørende modaler:** `PlanVersionHistoryModal`, `NewPhaseModal`, `ConfirmDeletePhaseModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Edit-modus av plan-detalj. Coach kan justere fase-datoer, pyramide-allokering, koble nye økter/tester og se agent-forslag inline. "Lagre alle endringer" må trykkes — ikke auto-save (planer er for kritiske til å auto-save). Versjonshistorikk lar coach rulle tilbake.

## Header-blokk — UNIKT

- **H1:** `Rediger Sommer-toppform` (Geist, ikke italic — vi er i edit-mode)
- **Subtittel:** `Markus Roinås Pedersen · 3 endringer ulagret` (`3 endringer ulagret` i destructive-tekst hvis dirty)
- **Stat-pills (3):** `Versjon 12` · `Sist publisert 7. mai` · `Sum pyramide: 100 %` (rød hvis ≠100)
- **Primary CTA:** `Lagre alle endringer` (disabled hvis ingen endringer, success-toast etter lagre)
- **Sekundær:** `Versjonshistorikk` (åpner PlanVersionHistoryModal)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Faser** (default) | 5 phase-cards i edit-mode + "+ Legg til ny fase" |
| **Økter** | Liste over økter koblet til planen, med drag-reorder |
| **Pyramide** | 5 sliders (FYS/TEK/SLAG/SPILL/TURN), sum-validation |
| **Tester** | Tester koblet til hver fase, drag-drop |
| **Mål** | Plan-mål editable + delmål |

## Layout — Faser-tab (default)

- **Phase-cards (12-col):** 5 stk, hver klikkbar. Klikk åpner inline drawer (drawer-mode = edit). Drawer på fase 3 (Spesifikk) er åpen som default.
- **Drawer-innhold (fase 3):**
  - Form-input: Fase-navn (tekst)
  - Datoer: Start (date-picker) + Slutt (date-picker)
  - Pyramide for fase: 5 sliders med tabular-nums-prosent
  - Toggle-pills: `Aktiver agent` (default på), `Auto-godkjenn forslag` (default av)
  - Tekstarea: Fase-beskrivelse / mål
  - Knapper: `Lagre endringer` · `Slett fase` (destructive, åpner ConfirmDelete)
- **+ Legg til ny fase** under cards (åpner NewPhaseModal)
- **Agent-forslag-strip (12-col):** "Periodisering-agent: Forleng Spesifikk-fase 4 dager" + `Avvis` / `Godkjenn`

## Layout — Pyramide-tab

5 sliders horisontalt:

| Slider | Default | Validation |
|---|---|---|
| FYS | 18 % | min 0, max 50 |
| TEK | 32 % | min 0, max 60 |
| SLAG | 24 % | min 0, max 60 |
| SPILL | 14 % | min 0, max 50 |
| TURN | 12 % | min 0, max 30 |

Sum-rad nederst: `Sum: 100 %` (grønn) eller `Sum: 96 % — må være 100` (rød).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Phase-card (editable) | default, hover, selected (currently i drawer = accent-border 2px) |
| `+ Legg til ny fase` | default, hover, klikk → NewPhaseModal |
| Form-input drawer | default, focus (ring), error (destructive border), disabled |
| Slider | default, drag (lift + tooltip), invalid (rød) |
| Toggle-pill | off, on (lime accent), disabled |
| `Lagre alle endringer` | disabled (no changes), default, hover, loading (spinner), success |
| `Slett fase` | default, hover, klikk → ConfirmDelete |
| Agent-forslag `Godkjenn` / `Avvis` | default, hover, loading, success-fade-out |

## Empty / loading / error

- **Validation-feil:** "Sum pyramide må være 100 %, du har 96 %" + rød border på slider-rad
- **Konflikt-error:** Toast "Endring kolliderer med booket økt 13.05 — løs eller avbryt"
- **Disabled lagre:** Tooltip "Ingen endringer å lagre"
- **Loading:** Skeleton phase-cards
- **Save-spinner i CTA:** "Lagrer..." med Lucide `Loader2`-spinner

## Eksempel-data

- **Plan:** "Sommer-toppform" v12, Markus Roinås Pedersen
- **Aktiv fase:** Spesifikk (9. mai – 12. juni)
- **Sum pyramide:** 100 % (FYS 18 + TEK 32 + SLAG 24 + SPILL 14 + TURN 12)
- **Agent-forslag:** "Forleng Spesifikk-fase 4 dager"

## Ønsket output fra Claude Design

1. Lyst tema, Faser-tab med drawer åpen på Spesifikk
2. Mørkt tema, samme
3. Pyramide-tab med sliders, sum=100 %
4. Validation-feil-state: sum=96 %, rød
5. Loading lagre-spinner
6. Tab-bytte til Tester
7. Mobil ≤640px — drawer blir bottom-sheet, sliders stables

## Ikke-mål

- Ikke designe `PlanVersionHistoryModal`, `NewPhaseModal` (egne fase-pakker)
- Ikke designe versjons-diff-view (egen sub-skjerm)

---

## Pakke 5/5: Plan-templates (mal-bibliotek)

# AK Golf Platform — CoachHQ — Plan-templates

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans/templates`
- **Arketype:** B — List + filter (mal-bibliotek som kort-grid)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plan-templates.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewTemplateModal`, `TemplatePreviewModal`, `DuplicateTemplateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Plan-templates er mal-biblioteket Anders bygger opp over tid. Hver mal er en gjenbrukbar skall for en treningsplan (4–12 ukers periode + pyramide-fordeling + foreslåtte økter). Forskjellig fra `/admin/plans` som er aktive planer per spiller — dette er **gjenbrukbare maler** som blir grunnlag for nye planer (via Plan-bygger steg 4). Anders bruker den når han starter en ny plan og vil ikke begynne fra blank.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec (hero, KPI-strip, filter-bar, count-stats).

### Mal-card-grid (3 × N)

- Card 320×260px med radius-lg
- **Thumbnail-stripe topp 80px:** Donut-mini med pyramide-fordeling (FYS/TEK/SLAG/SPILL/TURN) + fokus-stripe på venstre kant (4px bred, samme pyramide-farge som dominerende fokus)
- **Tittel** (Geist 16px semibold): f.eks. `Putte-mester 6 uker`
- **Fokus-pill** under tittel: «Slag-tung» (lime tint) / «Tek-tung» (primary tint) / «Balansert» (muted)
- **Meta-rad-1** (JetBrains Mono 12px muted): `6 uker · 24 økter · HCP 5–18`
- **Meta-rad-2** (muted 12px): `Sist brukt: 12. mar · 3 spillere bruker denne`
- **Aksjons-rad bunn:** Primary `Bruk →` (åpner Plan-bygger med mal pre-fylt) + ghost `Forhåndsvis` (TemplatePreviewModal) + ...-meny (Dupliser, Rediger, Arkiver, Eksporter)

### 9 maler synlig (eksempel-data)

| Mal | Varighet | Fokus | Vanskelighet | Antall økter |
|---|---|---|---|---|
| Putte-mester 6 uker | 6 uker | Slag-tung (SLAG 55 % / TEK 25 %) | Lett (HCP 18–36) | 24 |
| Sommer-toppform | 8 uker | Balansert (peak før turnering) | Avansert (HCP 0–5) | 32 |
| Driver-presisjon 4 uker | 4 uker | Tek-tung (TEK 60 % / SLAG 30 %) | Middels (HCP 5–15) | 16 |
| Junior-grunnpakke | 10 uker | Balansert m/ FYS-fokus | Lett (HCP 25+) | 40 |
| Vinter-innendørs | 12 uker | Tek + Slag (TrackMan) | Middels | 48 |
| Tournament-prep | 8 uker | Spill + Turn (peaking) | Avansert | 32 |
| Comeback fra skade | 6 uker | FYS-tung (60 %) | Alle | 18 |
| Shortgame 5 uker | 5 uker | Slag (80 %) | Middels | 20 |
| Hel-sesong 24 uker | 24 uker | Periodisert m/ peaks | Avansert | 96 |

## KPI-strip (4 kort)

1. Maler totalt: 14
2. Aktivt brukt: 8 (av aktive planer)
3. Mest populær: Sommer-toppform (12 ganger brukt)
4. Sist endret: 3. mai (Driver-presisjon)

## Filter-bar — UNIKT

- Søk: «Søk mal-navn, fokus eller varighet»
- Chip: **Kategori** — Slag-tung / Tek-tung / Balansert / FYS-tung / Spill-tung
- Chip: **Varighet** — ≤4 uker / 5–8 uker / 9–12 uker / 12+ uker
- Chip: **Vanskelighet** — Lett (HCP 18+) / Middels (HCP 5–18) / Avansert (HCP 0–5) / Alle
- Chip: **Status** — Aktiv / Arkivert / Mine (eier = Anders)
- Sort: Mest brukt (default) / Sist endret / A–Å / Varighet stigende
- Primary CTA: `+ Ny mal` → `NewTemplateModal` (eller start fra eksisterende plan)
- Sekundær: `Importer fra AK Golf delt-bibliotek →` (lime accent)

## Klikkbare elementer

| Element | States |
|---|---|
| Mal-card | default, hover (lift + accent-border), klikk → TemplatePreviewModal |
| Donut-mini i thumbnail | tooltip på hover (viser % per fokus) |
| `Bruk →` CTA | default, hover, klikk → Plan-bygger med mal pre-fylt på steg 4 |
| `Forhåndsvis` ghost | default, hover, klikk → TemplatePreviewModal |
| ...-meny | default, popover-open (Dupliser / Rediger / Arkiver / Eksporter) |
| Filter-chip (multi) | default, hover, selected (count-badge) |
| `+ Ny mal` CTA | default, hover, klikk → NewTemplateModal |

## Empty / loading / error

- **Empty totalt (ny coach):** «Ingen maler ennå. Lag din første eller importer fra AK Golf-biblioteket →» med 2 CTAs
- **Empty filter:** «Ingen maler matcher filteret. Tilbakestill →»
- **Loading:** 9 skeleton-cards med pulserende donut + 2 tekst-bars
- **Error:** Per-card-error med retry («Kunne ikke laste denne malen — prøv igjen»)

## Eksempel-data

- **Eier:** Anders Kristiansen (egne maler)
- **Mest brukt:** Sommer-toppform (siste 12 mnd: 12 ganger)
- **Foreslått neste:** Junior-grunnpakke for de 4 nye Free-spillerne i akademiet

## Ønsket output fra Claude Design

1. Lyst tema, full grid 9 maler synlige (ingen filter)
2. Mørkt tema, samme
3. Filter aktivt: Kategori=Slag-tung + Varighet=5–8 uker (viser «Viser 3 av 14»)
4. Hover-state på en card med `Bruk →` highlighted
5. Empty totalt (ny coach uten maler)
6. Mobil ≤640px — 1-kolonne grid, cards full bredde, filter-chips i bottom-sheet

## Ikke-mål

- Ikke designe `NewTemplateModal`, `TemplatePreviewModal`, `DuplicateTemplateModal` (egne pakker)
- Ikke designe mal-edit-skjerm (egen pakke — bruker samme Plan-edit-flate)
- Ikke designe AK Golf delt-bibliotek-importflyten (egen sub-flow)
