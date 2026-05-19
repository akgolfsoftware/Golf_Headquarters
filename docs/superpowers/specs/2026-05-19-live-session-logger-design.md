# Live Session Logger — Design Spec

**Status:** Design draft (Anders, 2026-05-19)
**Skjerm-type:** Mobil-først fullscreen-modus (utenfor workbench-shell)
**Rute:** `/portal/live/[sessionId]/active`
**Relatert spec:** `2026-05-19-workbench-unified-design.md` (workbench navigerer hit)

---

## 1. Kontekst og hensikt

Når en spiller skal gjennomføre en planlagt økt — ikke planlegge, men FAKTISK trene — klikker hen "Start økt" fra workbench-kalenderen. Da åpnes **Live Session Logger** i fullscreen.

Inspirasjon: Gymshark "Log workout"-skjerm (referansebilde fra Anders). Adaptert til golf-drills med pyramide-disipliner.

**Hva spilleren skal kunne gjøre:**

1. Se økt-oversikt: alle drills i økten med detaljer (reps, series, pyramide, område, fase, belastning)
2. Logge reps med shortcut-knapper (+1, +5, +10, +25, "1-og-1")
3. Sjekke av sett etter hvert som de fullføres
4. Bruke rest-timer mellom sett/drills
5. Legge til notater per drill: kommentar til seg selv, spørsmål til trener, video til trener
6. Avslutte økten — auto-lagrer all data + sender oppsummering til coach

**Hva som IKKE er i scope:**

- Real-time video-coaching (post-MVP)
- Multi-spiller live-økt (gruppe-økt logger separat senere)
- Automatisk shot-detection (TrackMan-pipeline håndterer dette i egen spec)

---

## 2. Skjerm-struktur (mobil-først, 390×844)

```
┌──────────────────────────────────┐
│ ← Log økt    [timer]   Finish    │ ← Top bar (sticky)
├──────────────────────────────────┤
│ ⏱ 5min 3s   📊 247 reps   ✓ 1/6 │ ← Stats-strip
├──────────────────────────────────┤
│                                  │
│  🏌 Pitch 50-100m (Drill 1)     │ ← Drill card (active)
│  Lav trajectory, mål 70%         │
│  📐 SLAG · CS70 · Belastning M   │
│  ⏱ Rest Timer: 3 min 0s          │
│                                  │
│  SET  PREVIOUS    REPS    ✓     │
│  ▼ 1   10 reps    [10]    ✓     │ ← Aktiv sett (lime tint)
│    2   10 reps    [...]   ○     │
│    3   10 reps    [...]   ○     │
│    4   10 reps    [...]   ○     │
│    5   10 reps    [...]   ○     │
│  + Legg til sett                 │
│                                  │
│  [+1]  [+5]  [+10]  [+25]  [1+1]│ ← Shortcut-knapper
│                                  │
│  📝 Notat...                     │
│  📷 Send video til Anders        │
│  💬 Spørsmål til coach          │
│                                  │
├──────────────────────────────────┤
│  🏌 Iron-progresjon (Drill 2)   │ ← Drill 2 (collapsed)
│  CS70 → CS75 · TEK · 40 reps    │
│  ⏱ Rest Timer: 90 sec            │
├──────────────────────────────────┤
│  🏌 Putting 0-3m (Drill 3)      │ ← Drill 3 (collapsed)
│  SLAG · 30 reps · Blokk-praksis  │
├──────────────────────────────────┤
│         + Legg til drill         │
└──────────────────────────────────┘
```

(Ikoner over er placeholders — alle skal være inline Lucide SVG, ingen emojier.)

---

## 3. Branding (samme som workbench)

- BG: cream #FAFAF7
- FG: #0A1F17
- Primary: #005840 (forest green)
- Accent: #D1F843 (lime — aktiv sett, primary CTA)
- Success: #2C7D52 (fullført sett ✓)
- Card: #FFFFFF
- Border: #E5E3DD

**Fonter:** Inter Tight (drill-name) · Inter (UI) · JetBrains Mono (alle tall, rep-counts, timer, "10/10")

**Discipline-farger** brukes på pyramide-pills:
- FYS #1A4D2E · TEK #005840 · SLAG #2C7D52 · SPILL #88B45A · TURN #D1F843

---

## 4. Komponentspesifikasjon

### 4.1 `<LiveSessionTopBar>` (sticky, 56px)

- Venstre: tilbake-pil (ArrowLeft SVG, går til workbench med "Skal du forlate uten å lagre?"-dialog hvis aktive endringer)
- Senter: "Log økt" Inter Tight 16px
- Stor session-timer (klokke-ikon + JetBrains Mono "12:34" — counts up fra start)
- Høyre: **"Avslutt"** lime-button (åpner finalisering-dialog)

### 4.2 `<LiveSessionStatsStrip>` (under top bar, 48px)

JetBrains Mono 13px, 3 stats horisontalt:
- ⏱ **Varighet** — auto-running: `12 MIN 34 S`
- 📊 **Reps totalt** — sum across all drills: `247 REPS`
- ✓ **Drills fullført** — `1 / 6`

### 4.3 `<DrillCard>` (per drill, expandable)

**Header (alltid synlig, 80px):**
- Drill-nummer mono small: `DRILL 1 AV 6`
- Drill-navn Inter Tight 18px: `Pitch 50-100m, lav trajectory`
- Discipline-pill (SLAG/TEK/etc.) + fase-pill (CS70) + område-pill (Range)
- Mini progress-bar: `2 / 5 sett` med lime fyll
- Expand-toggle (chevron) high-right

**Når aktiv/expanded:**

#### Detalj-strip (80px)
Mono pills i én rad:
- `📐 SLAG` · `Område: Range matte 4` · `Fase: CS70` · `Belastning: Medium` · `Praksistype: Blokk`

#### Rest-timer card (60px, forest dark bg):
- Stor timer: `⏱ Rest Timer 3:00` (JetBrains Mono 24px)
- 2 buttons: "Start" (lime) + "Skip" (outline)
- Countdown auto-starter etter sett er checket av

#### Sets-tabell (Gymshark-stil):

| Kolonne | Innhold | Bredde |
|---|---|---|
| **SET** | Sett-nummer (1, 2, 3...) | 48px |
| **FORRIGE** | "10 reps" — fra forrige økt med samme drill | flex |
| **REPS** | Editable input (mono 18px) | 80px |
| **✓** | Checkmark når sett fullført (Toggle) | 40px |

- Aktiv sett-rad har lime bg-tint + 2px lime venstre-border
- Fullført sett-rad har grønn checkmark + svakt forest tint
- Tomme sett-rader er muted

#### Shortcut-rad (60px, sticky pinned til drill-card mens drill er aktiv)

5 rep-shortcut-knapper i en horisontal scroll-rad:

| Knapp | Action |
|---|---|
| `+1` | Legg til 1 rep til aktiv sett |
| `+5` | Legg til 5 reps |
| `+10` | Legg til 10 reps |
| `+25` | Legg til 25 reps |
| `1+1` | "En og en"-modus — auto-add 1 rep per tap, large-tap-area |

Når man trykker "1+1" åpnes en stor full-screen tap-modus med en gigantisk pulserende sirkel som økes med 1 per tap. Eksempel: spiller setter ballen, slår, tapper sirkelen, gjentar.

#### Notat-felt (per drill, kollapsbart)

3 mini-inputs som åpnes på klikk:

1. **Notat til meg selv** (Pencil SVG + tekstboks): "Hva la jeg merke til?"
2. **Spørsmål til coach** (MessageCircle SVG + tekstboks): "Spørsmål Anders bør svare på"
3. **Video til coach** (Video SVG + opplastning): "Ta opp eller velg fra galleri"

Alle 3 lagres som `SessionDrillNote` med relasjon til `TrainingSessionV2` + `Drill`.

### 4.4 `<AddSetButton>` 

`+ Legg til sett` — lime outline-knapp under sett-tabellen. Klikk legger til ny rad med standardverdier fra siste sett.

### 4.5 `<AddDrillButton>` 

`+ Legg til drill` — outline-knapp helt nederst i økt. Åpner drill-velger-modal med søk i drill-bibliotek. La spilleren legge til en drill mid-økt (f.eks. hvis hen ønsker å trene noe ekstra).

### 4.6 `<FinishSessionDialog>` 

Klikk "Avslutt" topp-høyre → modal:

- Tittel: "Avslutt økten?"
- Sub: Inter Tight 14px statistikk:
  - "Du har trent 47 min, fullført 5 av 6 drills, logget 247 reps"
- 3 valg-knapper:
  - **"Avslutt og lagre"** (lime, primary) — lagrer alt, redirect til økt-oversikt
  - **"Avslutt uten å lagre"** (outline) — sletter session, advarsel
  - **"Fortsett trening"** (outline) — lukker dialog
- Hvis spilleren fullfører økt: sender push-notif til coach + auto-genererer oppsummerings-melding

### 4.7 `<DrillCardCollapsed>` 

Når drill IKKE er aktiv, vises bare:
- Drill-nummer + navn
- Discipline-pill + reps total + status
- Klikk expander til full drill-card
- Klikk-target hele card-overflaten

---

## 5. Datalag

### 5.1 Modeller som trengs

**Eksisterende (gjenbrukes):**
- `TrainingSessionV2` — sesjons-master (allerede i schema)
- `Drill` — drill-definisjon (allerede)
- `User` — spiller (allerede)

**Nye (krever Prisma migration):**

```prisma
model SessionDrillInstance {
  id              String   @id @default(cuid())
  sessionId       String
  drillId         String
  orderIndex      Int      // posisjon i økten (drill 1, 2, 3...)
  plannedReps     Int      // målet
  plannedSets     Int      // målet
  pyramideArea    PyramidArea  // FYS/TEK/SLAG/SPILL/TURN
  fase            String?  // "CS70", "CS75" etc.
  belastning      String?  // "Low", "Medium", "High"
  praksisType     String?  // "Blokk", "Random", "Differensiell"
  omrade          String?  // "Range matte 4", "Putting green 2"
  
  session         TrainingSessionV2 @relation(...)
  drill           Drill             @relation(...)
  sets            SessionSet[]
  notes           SessionDrillNote[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SessionSet {
  id                    String   @id @default(cuid())
  drillInstanceId       String
  setNumber             Int
  reps                  Int
  completedAt           DateTime?
  duration              Int?     // sekunder (auto-tracked)
  
  drillInstance         SessionDrillInstance @relation(...)
  createdAt             DateTime @default(now())
}

model SessionDrillNote {
  id                    String   @id @default(cuid())
  drillInstanceId       String
  type                  NoteType  // SELF | COACH_QUESTION | VIDEO
  content               String?   // tekst for SELF + COACH_QUESTION
  videoUrl              String?   // for VIDEO type
  videoThumbnailUrl     String?
  isAnswered            Boolean   @default(false)  // for COACH_QUESTION
  answerContent         String?   // coach' svar
  answeredAt            DateTime?
  
  drillInstance         SessionDrillInstance @relation(...)
  createdAt             DateTime @default(now())
}

enum NoteType {
  SELF
  COACH_QUESTION
  VIDEO
}
```

### 5.2 API/Server actions

**Server actions** (server-only, Next.js App Router pattern):

- `logRep(setId, reps)` — adder reps til aktiv set, oppdaterer i DB
- `completeSet(setId)` — markerer set som complete, auto-starter rest-timer state
- `addSet(drillInstanceId)` — oppretter ny set-rad
- `addDrill(sessionId, drillId)` — oppretter ny drill-instance mid-økt
- `saveNote(drillInstanceId, type, content)` — lagrer note
- `uploadVideo(drillInstanceId, file)` — Vercel Blob upload, lagrer URL
- `finishSession(sessionId)` — markerer komplett, beregner totaler, sender coach-notif
- `cancelSession(sessionId)` — sletter session

### 5.3 Live state

Klient-side state (Zustand eller useReducer):

```ts
type LiveSessionState = {
  session: TrainingSessionV2;
  drills: SessionDrillInstance[];
  activeDrillId: string;
  activeSetId: string;
  restTimer: {
    isRunning: boolean;
    secondsLeft: number;
  };
  sessionTimer: {
    startedAt: Date;
    elapsedSec: number;
  };
  totalReps: number;
  completedDrills: number;
};
```

Auto-save: hver `logRep` og `completeSet` lagres optimistically i UI + server action i bakgrunn. Hvis offline: queue i localStorage, retry når online.

---

## 6. Interaksjons-flyt

1. Spiller i workbench-kalender klikker økt → `/portal/live/[sessionId]/active`
2. Loader rendres mens session + drills + previous sets hentes parallelt
3. Live Session Logger åpner med drill 1 expanded, drill 2-6 collapsed
4. Spiller starter trening:
   - Tap "+10" → set 1 oppdateres til 10 reps
   - Tap ✓ → set 1 markeres complete, rest-timer starter (3 min)
   - Etter 3 min: bell + lime-pulse-animation, "Set 2 klar"
5. Spiller jobber gjennom 5 sett, ✓-er hver
6. Klikk drill 1 collapse → drill 2 ekspanderer automatisk
7. Spiller tar opp video → tapper "Send video til Anders" → opptaks-modal
8. Spiller tapper "Spørsmål til coach" → tekst: "Føler jeg traff godt, men ballbane var lavere enn forventet"
9. Når alle 6 drills fullført → "Avslutt og lagre" → coach får push-notif med oppsummering

---

## 7. Spesielle moduser

### 7.1 "1-og-1"-modus

Klikk "1+1" på shortcut-rad → fullscreen-modus:
- Stor pulserende sirkel midt på skjermen (forest grønn med lime ring)
- Mono 64px center-tall: starter på 0
- Tap hvor som helst → +1, sirkel pulser, små "+1"-pop-up
- Bunn: `STOPP` rød-knapp + `← Tilbake til drill`
- Telleren persister til spilleren går tilbake — da legger den til som ny set

### 7.2 Rest-timer

Når et sett er checket av:
- Auto-start rest-timer basert på drill-config (default 3 min for tunge drills, 90 sek for letterte)
- Visuelt: stor SVG-ring-progress (forest) i drill-card
- Når 30 sek igjen: gul tint
- Når 0: lime puls + lyd-tegn (valgfritt)
- Kan skippes med "Skip"-knapp

### 7.3 Notater + video — coach-flyt

Når spiller sender "Spørsmål til coach" eller video:
- Note merkes `isAnswered: false`
- Coach får push-notif: "Markus har spørsmål om Pitch-økten"
- Coach åpner spørsmålet i CoachHQ inbox eller på spiller-detalj-side
- Coach svarer → spiller får svar i økt-oversikt etterpå

---

## 8. Verifikasjon

Når Live Session Logger er implementert:

- Spiller kan klikke "Start økt" i workbench-kalender → åpner `/portal/live/[sessionId]/active` på 1 sek
- Drill-card viser drill-detaljer: reps, series, pyramide, fase, belastning, område
- Shortcut-knapper +1/+5/+10/+25/1+1 fungerer
- Sets ✓-es av og rest-timer starter automatisk
- Notater, spørsmål til coach, og video kan legges til per drill
- Auto-save fungerer offline (queue + retry)
- Coach får push-notif når økt avsluttes
- Mobile-først: testes på iPhone Safari + Android Chrome
- Norsk bokmål, ingen emojier (alle ikoner er Lucide SVG)
- AK Golf-branding strengt
- Verifiseres på Vercel preview-deploy med ekte spiller-bruker

---

## 9. Implementeringsrekkefølge

1. **Prisma migration:** `SessionDrillInstance` + `SessionSet` + `SessionDrillNote` + `NoteType` enum
2. **Eksisterende rute:** `/portal/(fullscreen)/live/[sessionId]/active/page.tsx` (delvis bygd i Bølge H — sjekk hva som er der)
3. **State management:** Zustand store for live-session
4. **Komponenter:**
   - `<LiveSessionTopBar>`
   - `<LiveSessionStatsStrip>`
   - `<DrillCard>` (expanded + collapsed)
   - `<SetsTable>`
   - `<RestTimerCard>`
   - `<RepShortcutRow>`
   - `<OneByOneMode>` (fullscreen tap-modus)
   - `<NoteInput>` × 3 (self / coach-question / video)
   - `<FinishSessionDialog>`
5. **Server actions:** `logRep`, `completeSet`, `addSet`, `addDrill`, `saveNote`, `uploadVideo`, `finishSession`
6. **Offline-queue:** localStorage + retry-logic for åpoptimistic-updates
7. **Coach-notification flow:** push-notif via `Notification`-modell når session avsluttes
8. **Verifikasjon på iPhone + Vercel preview**
