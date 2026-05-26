# Konsolidering & Workbench-utvidelse — plan for 2026-05-27

## TL;DR (les denne først)

- **Kodebasen har lite duplikat-gjeld** — bare 3 komponenter (sidebar, global-search, search-trigger) som kan slås sammen. Resten er rolle-basert splitting som er meningsfull.
- **Workbench Plan A er allerede implementert** og dekker design-spec 1:1. Det som mangler er at den ikke ER inngangspunktet for planlegging — andre planleggings-sider finnes parallelt og konkurrerer om oppmerksomheten.
- **Hovedforslag:** gjør `/portal/planlegge/workbench` til ÉN inngang for all planlegging. Eksisterende /portal/tren/aarsplan, /tren/teknisk-plan, /tren/fys-plan blir lett-vektige "fokus-modi" som åpner Workbench med riktig akse aktiv.
- **Nye Claude Design-skjermer som trengs:** 4 stk (mobile-mode, fokus-modi, builder-modal, ferdig-modal).

---

## 1. Duplikat-audit — kort versjon

| Område | Funn |
|---|---|
| Portal-vs-admin overlap | Ingen reelle duplikater. Splitting er rolle-basert (player self-view vs coach cohort/discovery). |
| Portal intern overlap | Ingen døde ruter. /portal/planlegge og /portal/tren har distinkte roller per dato. |
| Komponent-duplikater | 3 stk: `sidebar.tsx`, `global-search-modal.tsx`, `search-trigger-button.tsx` finnes i begge `components/portal/` og `components/admin/`. Identisk UI, kun data scope er ulik. |
| Server actions | Ingen identiske. Hver action er rolle-scopet. |

**Konsolideringsgevinst hvis vi rydder de 3 komponentene:** ~150 linjer fjernes. Lav ROI, IKKE prioritert nå.

---

## 2. Det virkelige problemet: spredte planleggings-sider

Disse sidene konkurrerer om "Hvor planlegger jeg?":

| Rute | Funksjon | Status etter konsolidering |
|---|---|---|
| `/portal/planlegge` | Generell hub (PlanleggeV3) | **Beholde som landingsside** med hovedlenke til Workbench |
| `/portal/planlegge/workbench` | **Workbench Plan A** — det egentlige verktøyet | **PRIMÆR — alt skal hit** |
| `/portal/tren/aarsplan` | Årsplan med faser | **Redirect til Workbench (zoom=år)** |
| `/portal/tren/teknisk-plan` | Liste over tekniske planer | **Behold som plan-liste, åpner Workbench når plan klikkes** |
| `/portal/tren/fys-plan` | Liste over fysiske planer | **Behold som plan-liste, åpner Workbench med FYS-akse fokusert** |
| `/portal/tren/turneringer` | Turneringsplanlegger | **Behold som detalj-side, men turnering vises i Workbench-canvas som tournament-pillar** |
| `/portal/tren/kalender` | Tren-kalender | **Behold (kort visning), Workbench er "design-modus"** |
| `/portal/mal` | Mål | **Behold separat — annet konsept, ikke planlegging** |

### Mental modell

```
Workbench (sentral)
   ├── zoom: år / periode / måned / uke / dag
   ├── akse-fokus: FYS / TEK / SLAG / SPILL / TURN / ALL
   └── plan-context: A / B / utkast
        │
        ├── /portal/tren/teknisk-plan       ← liste, klikk = Workbench
        ├── /portal/tren/fys-plan           ← liste, klikk = Workbench
        ├── /portal/tren/aarsplan           ← redirect til Workbench (zoom=år)
        └── /portal/tren/turneringer        ← liste, klikk = detalj-side
                                              (Workbench viser dem som pillars)
```

---

## 3. Nye Claude Design-skjermer som trengs

Disse er IKKE i nåværende design-handover og må designes:

| # | Skjerm | Hvorfor | Estimert størrelse |
|---|---|---|---|
| **A** | **Workbench — Mobile mode** | Eksisterende design er desktop-first (1680px). Mobile har bare en fallback-melding. Trenger en stack-layout med swipe-zoom og bottom-sheet-inspector. | 1 skjerm |
| **B** | **Workbench — Akse-fokus modus** | Når bruker åpner via /tren/fys-plan, skal Workbench fremheve FYS-akse og dimme resten. Trenger mock-up av hvordan dette ser ut. | 1 skjerm × 5 akser, eller 1 generisk |
| **C** | **Workbench — Ny økt-modal full versjon** | Nåværende implementasjon har modaler for Period/Camp/Freq/Test, men ikke en fullverdig "Ny økt" som matcher /portal/tren/ny-okt-wizard. | 1 skjerm |
| **D** | **Workbench — Tournament-modus** | Når bruker klikker en tournament-pillar i canvas, skal det åpne et detalj-panel (ikke navigere bort). Trenger overlay-design. | 1 skjerm |
| **E** | **Workbench — Plan B/Variant-diff** | Plan A/B-knapper finnes i sidebar (Sprint 6), men det er ingen visualisering av HVA som er ulikt mellom A og B. Diff-modus mangler. | 1 skjerm |
| **F** | **Coach-versjon av Workbench** | /admin/spillere/[id]/workbench finnes (Sprint 4), men har samme spillerkontekst som PlayerHQ. Coach trenger ekstra features: godkjenne endringer, skrive kommentarer, se historikk. | 1 skjerm |

**Anbefaling:** prioriter A (mobile) + C (Ny økt) + D (tournament-modus). De andre kan vente til etter beta.

---

## 4. Hva Workbench faktisk mangler (gap-analyse mot design)

Sprint 1-6 er fullført, men noen koblinger mangler:

### Inspector-panel (høyre)
- ✅ Pyramide-vekting pie
- ✅ Test-snarveier
- ✅ Periode-info
- ❌ "Auto-balansér"-knapp gjør ingenting (krever AI-call eller heuristikk)
- ❌ "Be coach godkjenne"-knapp gjør ingenting (krever notifikasjons-system)

### AI Command Bar
- ✅ Chips for "Generér uke", "Balansér", "Foreslå taper"
- ❌ Alle åpner riktig modal/toast, men selve AI-funksjonen er stub. Trenger ANTHROPIC_API_KEY + prompt-system.

### Sidebar
- ✅ Sesong-tre med klikkbare uker → zoom inn
- ✅ Plan A/B-bytting (Sprint 6)
- ❌ "+ Ny samling" — modal finnes, men persistering til TrainingCamp-modell mangler full integrasjon med canvas (camps vises ikke som pillars ennå)
- ❌ Turneringer-listen er statisk mock, kobles ikke mot ekte Tournament-data fra DB

### Zoom-views
- ✅ År, Måned, Uke, Dag — alle bygd
- ❌ Drag-drop fungerer kun på Periode-zoom. Uke + Dag mangler drag-handler.

### Konkrete gap-tasks (estimat 6-10 t totalt)
1. Koble Turneringer-listen i sidebar mot Tournament-tabell i DB (1 t)
2. Vis TrainingCamps som pillars i canvas (1.5 t)
3. Implementer drag-drop på Uke-canvas + Dag-canvas (2 t)
4. Implementer enkel heuristisk "Auto-balansér" (uten AI, bare matte-funksjon) (1 t)
5. Implementer "Be coach godkjenne" som lager PlanSuggestion-rad (1 t)
6. Implementer "Ny økt"-modal som matcher ny-okt-wizard-designet (2 t)

---

## 5. Konkret natt-plan (denne sesjonen)

Brukeren har bedt om "lag en plan" — så jeg LAGER kun planen i natt, IKKE implementerer. Implementering venter til Anders har godkjent.

Det jeg skal gjøre nå:
1. Skrive denne rapporten ✅
2. Lage Linear-issues / TODO-liste for de 4 nye design-skjermene (A, C, D — anbefalt prioritet)
3. Lage TODO-liste for de 6 gap-taskene
4. Commit + push

Det Anders bør gjøre i morgen tidlig:
1. Lese denne rapporten (10 min)
2. Bestemme: skal vi konsolidere planleggings-sidene mot Workbench? (5 min)
3. Bestemme: hvilke nye Claude Design-skjermer skal designes først? (5 min)
4. Gi grønt lys — så implementerer jeg det som ble godkjent

---

## 6. Anbefalt rekkefølge for i morgen

1. **30 min:** Anders godkjenner planen + bestemmer prioritet
2. **30 min:** Anders designer skjerm A (Workbench mobile) i Claude Design
3. **2-3 t:** Jeg implementerer 3 av de 6 gap-taskene (Turneringer-kobling + Drag-drop Uke + Auto-balansér heuristikk)
4. **30 min:** Anders kobler nye knapper i /admin/godkjenn-portal/koblinger
5. **2 t:** Jeg implementerer mobile-mode + Ny økt-modal

Estimert total tid 2026-05-27: **6-7 t aktiv jobbing** → Workbench blir 100% pikselperfekt + dekker mobile + alle koblinger fungerer.
