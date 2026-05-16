# SG Coaching Hub V1 — Design Spec

**Dato:** 2026-05-16
**Eier:** Anders Kristiansen
**Status:** Godkjent for implementasjonsplanlegging
**Estimat:** 7,5 uker (6 faser)

---

## 1. Bakgrunn og målsetting

### Problemet

TrackMan-data i dag er rådata — store mengder tall uten kontekst. Spillere ser dispersion-plot og smash factor men forstår ikke hva som faktisk koster dem slag på banen. Coach og spiller mangler et felles språk for å koble teknisk data til SG-resultater og treningsbeslutninger.

### Løsningen

**SG Coaching Hub** er en ny seksjon i PlayerHQ-portalen som krysskobler tre datakilder:

1. **TrackMan-data** — per-kølle teknisk performance (eksisterer)
2. **Spillerens egne rundedata** — `Round.sgX` + `Shot`-historikk (eksisterer)
3. **Data Golf PGA Tour-benchmark** — `/preds/approach-skill` per yardage-bucket (ny integrasjon)

Resultatet er 12 spesifikke innsikter og verktøy som forteller spilleren **hva som koster SG, hvorfor, og hva som må trenes for å fikse det**.

### Suksesskriterier

- Spiller åpner Hub-en minst 1×/uke og handler på minst én innsikt
- Coach bruker Hub-en som samtalestruktur i ≥50% av timer
- Målbar SG-forbedring innen 90 dager hos PRO-tier-spillere

---

## 2. Forholdet til eksisterende infrastruktur

| Eksisterende | Status etter SG Hub |
|---|---|
| `/portal/mal/trackman/` | Beholdes uendret — rein launch monitor-data |
| `TrackManSession`-modell | Utvides med `environment`-felt |
| `Round` + `Shot`-modeller | Brukes uendret som SG-kilde |
| Data Golf-pipeline i `golf-talent-dashboard` | Pythonkode portes til TS eller eksponeres via API |
| `User.preferences` Json | Lagrer `sgHubMode: "simple" | "advanced"` |

**Ny seksjon:** `/portal/mal/sg-hub/` — fem ruter under denne.

---

## 3. Brukere og tilganger

### Primærbrukere

- **Spiller** (rolle PLAYER) — åpner Hub-en selv. Velger mellom enkel og avansert visning. Kan ikke skrive shot-annotasjoner.
- **Coach** (rolle COACH) — kan åpne Hub-en for enhver spiller de har coach-relasjon til. Skriver annotasjoner. Pinner "best ever"-økter.
- **Parent** (rolle PARENT) — leser-tilgang til egen barns Hub i enkel modus.

### Auth-mønster

Alle SG Hub-ruter beskyttes med `requirePortalUser()`. For coach som ser annen spillers data: ruter prefikses med `/portal/mal/sg-hub/[spillerId]/` og auth verifiserer relasjonen.

---

## 4. Sidestruktur

```
/portal/mal/sg-hub/                        Hovedside — oversikt + innsiktssidefelt
/portal/mal/sg-hub/[club]                  Per-kølle drill-down (?session=xxx)
/portal/mal/sg-hub/yardage                 Stock Yardage Chart (#3)
/portal/mal/sg-hub/best-vs-now             Beste økt sammenligning (#10)
/portal/mal/sg-hub/equipment               Equipment Fit Indicators (#11)
/portal/mal/sg-hub/[spillerId]/...         Coach-modus (proxy mot spillerens visning)
```

### Modus-toggle (simple/advanced)

- Global state lagret i `User.preferences.sgHubMode`
- Toggle vises som pill øverst til høyre på alle Hub-sider: `Enkel · Avansert`
- **Simple** = forhåndsskrevne innsikter + 1-2 visuelle kort per feature
- **Advanced** = rådata, scatter-plot, full statistikk, all kontroll synlig

---

## 5. Datalag

### 5.1 Prisma — nye modeller

```prisma
enum TrackManEnvironment {
  SIMULATOR_INDOOR
  NET_INDOOR
  RANGE_OUTDOOR_MAT
  RANGE_OUTDOOR_GRASS
  COURSE_PRACTICE
  COURSE_COMPETITION
}

enum SgCategory { OTT APP ARG PUTT }

enum InsightCategory {
  DISTANCE_GAPPING
  CONSISTENCY_LEAK
  TRAINING_GAP
  D_PLANE_DRIFT
  STRIKE_QUALITY
  FATIGUE_PATTERN
  EQUIPMENT_FIT
  TEMPO_VARIANCE
  PROGRESSION_TREND
  SAME_DISTANCE_OPPORTUNITY
}

model ClubsPracticed {
  id          String              @id @default(cuid())
  sessionId   String
  session     TrainingPlanSession @relation(fields: [sessionId], references: [id])
  club        String              // "3W", "7i", "PW"
  shotCount   Int?
  environment TrackManEnvironment
  createdAt   DateTime            @default(now())
  @@index([sessionId])
  @@index([club, createdAt])
}

model SgBaseline {
  id              String   @id @default(cuid())
  category        SgCategory
  distanceBucket  String   // "175-200y"
  lie             ShotLie?
  expectedStrokes Float
  sampleSize      Int
  source          String   // "datagolf-approach-skill-2026Q1"
  fetchedAt       DateTime
  @@unique([category, distanceBucket, lie])
}

model SgInsight {
  id             String          @id @default(cuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id])
  category       InsightCategory
  severity       Int             // 1-5
  title          String
  body           String          @db.Text
  payload        Json
  createdAt      DateTime        @default(now())
  acknowledgedAt DateTime?
  resolvedAt     DateTime?
  @@index([userId, category, createdAt])
}

model BestSessionReference {
  userId            String   @id
  user              User     @relation(fields: [userId], references: [id])
  trackmanSessionId String
  pinnedAt          DateTime @default(now())
  pinnedBy          String   // userId — spiller eller coach
  notes             String?
  autoSuggested     Boolean  @default(false)
}

model ShotAnnotation {
  id                String   @id @default(cuid())
  trackmanSessionId String
  clubId            String   // "7i"
  shotNumber        Int      // 1, 2, 3...
  coachId           String
  body              String   @db.Text
  videoUrl          String?
  createdAt         DateTime @default(now())
  @@index([trackmanSessionId, clubId])
}

model ClubMetricTrend {
  id           String   @id @default(cuid())
  userId       String
  club         String
  weekStart    DateTime
  avgClubPath  Float
  avgFaceAngle Float
  avgSmash     Float
  avgTotal     Float
  sigmaBall    Float
  shotCount    Int
  @@unique([userId, club, weekStart])
}
```

### 5.2 Endring til eksisterende modell

```prisma
model TrackManSession {
  // ... eksisterende felter
  environment TrackManEnvironment?
}
```

`environment` er nullable for bakoverkompatibilitet med eksisterende rader.

### 5.3 Data Golf-integrasjon

Ukentlig cron-jobb henter PGA-benchmark via Data Golf-API.

- **Endepunkt:** `https://feeds.datagolf.com/preds/approach-skill`
- **Auth:** `key=DATAGOLF_API_KEY` env-var (Scratch Plus, AK Golf Group)
- **Rate limit:** 45 req/min, 5 min suspensjon ved brudd
- **Resultat:** Skriver til `SgBaseline`-tabell. Erstatter eksisterende benchmarks for samme `(category, distanceBucket, lie)`.
- **Implementasjon:** TypeScript Node-script via Vercel Cron eller eget API-endepunkt `/api/cron/datagolf-sync`
- **Eksisterende kode:** Python-versjon ligger i `golf-talent-dashboard/pipelines/datagolf/`. Vi porter logikken til TS.

### 5.4 SG Insight Engine

Daglig cron kl 04:00 + immediate refresh ved TrackMan-opplasting.

Per bruker, per kølle, per innsiktskategori:
1. Aggregér siste 90 dagers TrackMan-data
2. Beregn metrikker (σ, snitt, regresjon)
3. Sammenlign mot referansene (PGA + egen baseline + egen 30d)
4. Sjekk treningsfrekvens via `ClubsPracticed`
5. Generer eller oppdater `SgInsight`-rader

Implementeres som modulær engine i `src/lib/sg-hub/insight-engine/`. Hver innsiktskategori har sin egen evaluator-funksjon.

---

## 6. De 12 features

### `1` D-Plane / Curvature Forecasting

**Hva:** 2D-scatter Face Angle × Club Path med tetthetsskygge. Klassifiserer hvert slag som Pull-Hook, Pull-Fade, Push-Draw, Push-Fade eller Straight.

**Inputs:** TrackMan `faceAngle`, `clubPath`, `faceToPath` per slag fra `TrackManSession.rawJson`.

**Beregning:** Gaussian KDE for tetthet. Klassifisering med ±0,5° toleranse rundt 0. Konsistens = % i dominerende quadrant.

**Simple:** *"Ditt naturlige 7-jern: push-fade. Konsistens 78%."*
**Advanced:** Full scatter med uteligger-fremheving og PGA-benchmark-tetthet over.

**Filer:**
- `src/lib/sg-hub/d-plane.ts`
- `src/components/sg-hub/DPlanePlot.tsx`

### `2` Spin Loft / Strike Heatmap

**Hva:** Virtuelt køllehode med fargekartlegging av estimert kontaktpunkt.

**Inputs:** `smashFactor` + `lowPoint` + `faceAngle` per slag.

**Beregning:** Klassifisering:
- Smash <1.35 → tynt/fett (rød)
- Smash 1.35-1.42 → sweet (grønn)
- Smash >1.42 → potensielt rolled face (gul)
Estimert posisjon på blad via face-bias og smash-magnitude.

**Visualisering:** 10×8 grid på SVG-køllehode. Tetthet basert på shot-distribusjon.

**Filer:**
- `src/lib/sg-hub/strike-pattern.ts`
- `src/components/sg-hub/StrikeHeatmap.tsx`

### `3` Stock Yardage Chart

**Hva:** Auto-generert komplett yardage-kort med stock + 3/4 + soft + carry/total + apex + ±1σ + værjustering per kølle.

**Inputs:** Aggregert per-kølle data fra `TrackManSession` (siste N=30 økter, filterbar).

**Beregninger:**
- Carry = total × 0.92 (jern), × 0.95 (driver), × 0.98 (wedge) — kalibrert via player-historikk hvis tilstrekkelig data
- 3/4 = full × 0.85
- Soft = full × 0.78
- Temp-korr: distance × (1 + 0.0008 × (temp − 15))
- Elevation: +1m carry per 100m

**Eksport:** PDF i A4 landskap via `@react-pdf/renderer`. Mobil-versjon: identisk innhold som responsiv nettside.

**Filer:**
- `src/app/portal/mal/sg-hub/yardage/page.tsx`
- `src/lib/sg-hub/yardage-calc.ts`
- `src/lib/sg-hub/pdf-export.ts`

### `4` Fatigue Curve

**Hva:** Innenfor én økt — viser om Club Speed eller Smash Factor faller etter slag 25-30.

**Inputs:** Kronologisk ordnete slag fra én økt.

**Beregning:** 5-slag rolling average + lineær regresjon. Fatigue-signal = Club Speed drop > 1 mph per 10 slag.

**Visualisering:** Linje med markert fatigue inflection point + horisontal target-linje.

**Innsikt-eksempel:** *"Du taper 2 mph i Club Speed etter slag 35. Vurder kortere økter eller bedre fysisk forberedelse."*

**Filer:**
- `src/lib/sg-hub/fatigue.ts`
- `src/components/sg-hub/FatigueChart.tsx`

### `5` Wind/Conditions-Adjusted Performance

**Hva:** Interaktiv slider — drar temp, vind og høyde, ser stock-distanse oppdateres live.

**Inputs:** Aggregert per-kølle data + brukerinput (temp °C, vind m/s og retning, høyde m).

**Beregning:**
- Temp: × (1 + 0.0008 × (temp - 15))
- Vind: estimat via apex × tid_i_lufta × vindhastighet (forenklet aerodynamikkmodell)
- Høyde: +1m carry per 100m elevation

**Visualisering:** Tre slidere + live-oppdatert distanseliste per kølle.

**Filer:**
- `src/lib/sg-hub/conditions-adjust.ts`
- `src/components/sg-hub/ConditionsSlider.tsx`

### `6` Tempo / Rhythm Analysis

**Hva:** Vannrett ribbon der hvert slag fargelegges etter tempo-konsistens (grønn/gul/rød), korrelert mot Smash Factor under.

**Inputs:** Tempo-data fra TrackMan. **MERK:** HTML-rapporter inneholder ikke tempo. CSV-eksport fra TrackMan-app må inneholde `Tempo` eller `BackswingTime`/`DownswingTime` for å aktivere featuren.

**Fallback:** Hvis tempo mangler i opplastet økt → vis melding "Aktiver tempo i TrackMan-eksport for å se denne analysen". Parser oppdateres til å lese tempo-kolonner når tilgjengelig.

**Beregning:** Tempo-ratio = backswing / downswing. Optimal 3:1. Variasjon > 5% mellom slag flagges.

**Filer:**
- `src/lib/sg-hub/tempo.ts`
- `src/components/sg-hub/TempoRibbon.tsx`
- Oppdaterer `src/lib/trackman/parse-html-report.ts` og `src/app/portal/mal/trackman/actions.ts` (CSV)

### `7` Cross-Session Drift Detection

**Hva:** Oppdager sakte tekniske bias som snik seg inn over uker — f.eks. Club Path som drifter +0,2°/uke.

**Inputs:** `ClubMetricTrend` (materialisert view, oppdateres via cron).

**Beregning:** Lineær regresjon mot tid per metrikk over siste 12 uker. Stigningstall over terskel → generer `SgInsight` med category `D_PLANE_DRIFT`.

**Terskler:**
- Club Path: 0,2°/uke
- Face Angle: 0,15°/uke
- Total Distance: 0,5 m/uke

**Visualisering:** Drift Alert Card i innsikts-sidefelt + dedikert trend-graf per kølle.

**Filer:**
- `src/lib/sg-hub/drift-detection.ts`
- Kjører som del av Insight Engine

### `8` Same-Distance Strategy

**Hva:** For en gitt mål-distanse (slider, eksempel 150m) — vis alle køller som kan dekke distansen, rangert etter expected SG.

**Inputs:** Alle køllers snittdistanse, σ, apex + `SgBaseline`-data for distansen.

**Beregning:**
- Filtrer køller med snittdistanse i ±10m av målet
- For hver kandidat: σ (presisjon), apex (stop-on-green), expected SG fra `SgBaseline`
- Rangér etter expected SG

**Visualisering:** Tre-fire kort side om side. Anbefalt kølle markert med accent.

**Filer:**
- `src/lib/sg-hub/same-distance-strategy.ts`
- `src/components/sg-hub/StrategyCards.tsx`

### `9` Smash Curve

**Hva:** Plot av Smash Factor mot Club Speed per slag — viser effektivitets-optimum.

**Inputs:** Alle slag for valgt kølle.

**Beregning:** 2.-grads polynomisk regresjon. Finn maks-Y (optimum Club Speed). Beregn tap hvis spiller svinger over optimum.

**Visualisering:** Scatter + smoothed regresjonskurve. Vertikal linje på optimum-punkt.

**Innsikt-eksempel:** *"Du svinger 7-jern optimalt på 89 mph. Over 92 mph mister du smash. Ikke sving hardere — sving smartere."*

**Filer:**
- `src/lib/sg-hub/smash-curve.ts`
- `src/components/sg-hub/SmashCurvePlot.tsx`

### `10` Best vs Today Comparison

**Hva:** Speilet to-kolonne layout — beste økt på venstre, dagens på høyre, med farget delta per metrikk.

**Inputs:** `BestSessionReference.trackmanSessionId` + dagens valgte økt.

**Pinning:**
- **Auto-suggest:** Når en ny økt har bedre verdier på ≥3 metrikker enn nåværende best → vis banner *"Denne økten kvalifiserer som ny 'best ever' — vil du pinne den?"*
- **Manuelt:** Spiller eller coach kan pinne en hvilken som helst økt manuelt.

**Filer:**
- `src/app/portal/mal/sg-hub/best-vs-now/page.tsx`
- `src/lib/sg-hub/session-diff.ts`

### `11` Equipment Fit Indicators

**Hva:** Per-kølle helsesjekk — er launch, spin og smash i target for klubbens type?

**Inputs:** TrackMan-data + `EquipmentBag`-modellen (eksisterer).

**Targets:**
- **Driver:** launch 11-14°, spin 2200-2800 rpm, smash 1.45-1.50
- **Jern:** launch per nummer (4i: 12-14°, 7i: 17-19°, 9i: 22-25°), smash 1.38-1.42
- **Wedges:** smash 1.20-1.28 per loft

**Output:** Per kølle: ✓ I target / ⚠ Utenfor target / ✗ Kritisk avvik.

**Filer:**
- `src/app/portal/mal/sg-hub/equipment/page.tsx`
- `src/lib/sg-hub/equipment-fit.ts`

### `12` Coach Annotations på Enkeltslag

**Hva:** Coach kan klikke ett spesifikt slag og legge inn notat + valgfri videolink.

**Inputs:** `ShotAnnotation` joinet mot `TrackManSession.rawJson`.

**Auth:** Kun coach (role COACH) med relasjon til spiller kan skrive. Spiller leser kun.

**UI:**
- I slag-tabellen vises chat-ikon ved siden av slag med annotasjon
- Klikk → side-panel popover med kommentar + videolink
- Coach: "Legg til notat"-knapp ved hvert slag

**Filer:**
- `src/components/sg-hub/ShotAnnotationPopover.tsx`
- `src/app/portal/mal/sg-hub/[club]/annotations/actions.ts`

---

## 7. Live-økt — kølletagging (ny UX)

Eksisterende live-økt-registrering må utvides med kølle-tagging-modul.

### Flow

1. Spiller/coach starter live-økt fra portal
2. Mid-økt eller post-økt: åpner "Tagg køllen"-modal
3. Modal viser bag-grid (14 køller), hver med:
   - Avkryssingsboks
   - Slag-teller (valgfritt)
4. Velg environment fra dropdown (samme enum som TrackMan)
5. Lagre → opprette `ClubsPracticed`-rader

### Filer
- `src/components/sg-hub/ClubTaggingModal.tsx`
- `src/app/portal/(fullscreen)/[sessionId]/club-tagging-actions.ts`

---

## 8. Build-sekvens (6 faser, 7,5 uker)

| Fase | Innhold | Estimat |
|---|---|---|
| **1 — Foundation** | Prisma-migrasjoner, Data Golf-sync, env-tagging på TrackMan-import, `ClubTaggingModal` i live-økt, Insight Engine cron-skjelett, `/portal/mal/sg-hub/` page scaffold + modus-toggle | 1 uke |
| **2 — Per-Club Analysis** | #1 D-Plane, #2 Strike Heatmap, #9 Smash Curve, per-kølle drill-down side | 1,5 uker |
| **3 — Distance & Strategy** | #3 Stock Yardage Chart + PDF + mobil-versjon, #5 Conditions Slider, #8 Same-Distance Strategy | 1,5 uker |
| **4 — Trend & Progression** | #4 Fatigue Curve, #7 Drift Detection, #10 Best vs Today, `ClubMetricTrend` view | 1,5 uker |
| **5 — Coach & Equipment** | #11 Equipment Fit, #12 Shot Annotations, coach proxy-ruter for å se spillers Hub | 1 uke |
| **6 — Tempo + ferdigstilling** | #6 Tempo Ribbon (med CSV-parser-utvidelse), aktiver alle Insight Engine-regler, simple/advanced finpuss, QA | 1 uke |

---

## 9. Risikoer og avbøtende tiltak

| Risiko | Avbøtende tiltak |
|---|---|
| Data Golf API endrer endepunkter | Cache benchmark-data ukentlig i `SgBaseline`. Hub fortsetter å fungere på cache hvis API er nede. |
| TrackMan HTML-rapport mangler tempo | Tempo-feature viser tom-state med klar instruksjon. CSV-eksport støttes som fallback. |
| Spillere har ingen runder registrert (ingen egen SG-baseline) | Hub fungerer med kun PGA-benchmark + TrackMan-trend. Vis "Registrer runder for personlig benchmark"-prompt. |
| Insight Engine genererer for mye støy | Severity-terskel og `acknowledgedAt`-mekanikk lar spiller skjule innsikter. Max 5 aktive innsikter vises samtidig. |
| For stort scope for V1 | Fasene 1-3 alene gir verdi. Hvis tidsplan slipper kan fase 4-6 utsettes til V1.1 — men intensjonen er full V1. |

---

## 10. Verifikasjon

### Per fase
- `npx tsc --noEmit` — 0 type-feil
- `npx prisma validate` + `npx prisma migrate dev` — schema OK
- `npm run build` — produksjons-build fullfører
- Manuell test av nye sider mot designsystem

### V1-ferdig-kriterier
- Alle 12 features tilgjengelige i Hub
- Spiller kan toggle simple/advanced og persisterer
- Coach kan åpne spillers Hub med relasjons-sjekk
- Data Golf-sync kjører ukentlig og oppdaterer `SgBaseline`
- Insight Engine genererer minst én innsikt per kategori for testbruker
- Stock Yardage PDF eksporterer riktig
- Live-økt-tagging skriver til `ClubsPracticed`

---

## 11. Out of scope for V1

Disse er identifisert som verdifulle men utsatt:

- Real-time multi-bruker visning (coach og spiller redigerer samtidig)
- Sammenligning mot andre AK-Golf-spillere (peer benchmarking)
- Mobil-app native-versjon (V1 = responsiv nettside)
- Automatisk swing-video-synk til shot-data
- ML-basert anomaly detection utover lineær regresjon
- 3D ball flight-visualisering

---

## 12. Åpne avhengigheter

- **Data Golf API-nøkkel** må eksporteres til `akgolf-hq`-prosjekt som `DATAGOLF_API_KEY` (eier: AK Golf Group, Scratch Plus-medlemskap eksisterer)
- **Vercel Cron** må aktiveres for daglig Insight Engine + ukentlig Data Golf-sync
- **TrackMan HTML-import** må ferdigstilles i hovedgrenen (allerede implementert 2026-05-16)

---

**Slutten av spec.**
