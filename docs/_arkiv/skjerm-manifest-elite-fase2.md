# Skjerm-manifest — Elite Fase 2 (tour-nivå differensiatorer)

> Generert 2026-06-01 · Design-intensjon for de tre verdensledende-funksjonene.
> Mål: plattform Hovland/Reitan-nivå velger. Rekkefølge: 1) Video-analyse · 2) Dispersjon-motor · 3) Mental.
> (Readiness/recovery = neste steg etter disse tre.)
>
> Hver funksjon = nye skjermer + **nye datamodeller** (ikke bare UI). Merket per seksjon.

---

## 1. VIDEO-ANALYSE — svingverktøyet

**Hvorfor:** Hver tour-coach bruker dette daglig. I dag har vi kun opplasting (`VideoUploadModal`) — ingen analyse.

**Rute-familie:** `/portal/analysere/video` (spiller) + `/admin/spillere/[id]/video` (coach)

### Nye datamodeller
```
VideoAnnotation { id, videoId, frameTime, type(LINE|ANGLE|CIRCLE|TEXT), coords[], color, note, createdById }
VideoComparison { id, videoAId, videoBId, label }   // mine vs pro, eller to datoer
// SessionVideo finnes allerede (videoId, sessionId, club, pPosition, url)
```

### `/portal/analysere/video` — Video-bibliotek
**Inngang:** Sidebar "Analysere" → Video. Snarvei fra Workbench.
**Synlig:** Grid med svingvideoer (thumbnail + kølle + dato + P-posisjon-tag). Filter: kølle / dato / P-posisjon / coach-kommentert. "Last opp"-knapp.
**Knapper:** Video-kort → analyse-visning · Sammenlign → velg to → side-ved-side.

### `/portal/analysere/video/[id]` — Video-analyse (én video)
**Synlig:**
- Stor videospiller + **frame-by-frame scrubber** (◄ ❚❚ ►, hastighet 0.1×–1×)
- **Annoterings-verktøy:** linje · vinkel · sirkel · tekst (tegn på frame)
- P-posisjon-markører på tidslinjen (P1–P10)
- Høyre panel: kølle, dato, coach-kommentarer, notater
**Knapper:** Annotér → tegn-overlay · Lagre annotering → VideoAnnotation · Del med coach.

### `/portal/analysere/video/sammenlign` — Side-ved-side
**Synlig:** To videoer side-ved-side, **synkronisert scrubbing** (begge spoler samtidig). Velg: min video vs pro-modell, eller to av mine datoer. Overlay-modus (legg oppå hverandre, semi-transparent).
**Knapper:** Velg video A/B · Synk-toggle · Overlay-toggle.

### `/admin/spillere/[id]/video` — Coach-versjon
**Synlig:** Samme analyse + coach annoterer og **sender til spiller** (vises i spillerens Workbench). Spilleliste over alle spillerens videoer.

```
┌──────────────────────────────────────────────────────────┐
│  VIDEO-ANALYSE · Driver · 28 mai · P4-topp                │
│  ┌────────────────────────────────┐ ┌─────────────────┐  │
│  │                                │ │ VERKTØY         │  │
│  │        [ svingvideo ]          │ │ ╲ Linje         │  │
│  │                                │ │ ∠ Vinkel        │  │
│  │     ◄  ❚❚  ►   0.25×           │ │ ○ Sirkel        │  │
│  └────────────────────────────────┘ │ T Tekst         │  │
│  P1──P2──P3──[P4]──P5──P6──P7──P8     │ ─────────────── │  │
│  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔     │ COACH-KOMMENTAR │  │
│                                      │ "Litt for flat  │  │
│  [Sammenlign med pro] [Del coach]    │  i overgangen"  │  │
│                                      └─────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 2. DISPERSJON-MOTOR (DECADE-stil) — den unike konkurransefordelen

**Hvorfor:** Dette er nøyaktig hvordan Hovland/Reitan scorer — hvor sikter jeg gitt min spredning. Største moat.

**Rute-familie:** `/portal/mal/sg-hub/strategi` + `/portal/analysere/dispersjon`

### Nye datamodeller
```
DispersionProfile { id, userId, club, lateralStdM, distanceStdM, carryMeanM, sampleSize, updatedAt }
  // derives fra TrackManShot/Shot — oppdateres av cron
AimStrategy { id, userId, courseId?, holeNumber?, club, aimOffsetM, expectedStrokes, hazardPenalty }
```

### `/portal/analysere/dispersjon` — Dispersjon-oversikt
**Inngang:** Sidebar "Analysere" → Dispersjon.
**Synlig:**
- Per kølle: **scatter-plot + dispersjons-oval** (68%/95% ellipse), carry-distribusjon
- Tabell: kølle, snitt-carry, lateral σ, distanse σ, "miss-tendens"
- Velg kølle → zoom inn på spredningsmønster
**Knapper:** Kølle-velger · Oval-konfidens (68/95%) · → Sikte-planlegger.

### `/portal/mal/sg-hub/strategi` — Sikte-planlegger (kjernen)
**Synlig:**
- Et "hull" eller target med fairway/green + hazards (vann, bunker, OB)
- Legg din **dispersjons-oval** over targetet
- **Expected-value-beregning:** flytt sikte-punktet → se forventet score for hver posisjon (varmekart over aim-punkter)
- Anbefalt sikte: "Sikt 4m venstre for flagg — unngår bunker, lavest forventet score"
**Knapper:** Velg kølle · Dra sikte-punkt · Vis EV-varmekart · Lagre strategi.

### `/portal/booking/anlegg/[id]/strategi` — Hull-for-hull game plan (yardage book)
**Synlig:** Digital yardage-book per hull. Optimal kølle + sikte gitt din dispersjon + hull-hazards. Pin-posisjon. "Plays-like"-distanse (vind/høyde fra ConditionsSlider).

```
┌──────────────────────────────────────────────────────────┐
│  SIKTE-PLANLEGGER · Hull 7 · 165m · 7-jern                │
│  ┌────────────────────────────────────────────────────┐  │
│  │            ░░░░ vann ░░░░                           │  │
│  │         ┌──────────────┐                           │  │
│  │         │   GREEN  ⚑   │   ← anbefalt sikte: 4m V  │  │
│  │         │  ╱──────╲    │      av flagg              │  │
│  │         │ ( DIN    )   │   forventet: 2,9 slag     │  │
│  │         │ ( OVAL95%)   │                           │  │
│  │         │  ╲──────╱ ◉  │   ◉ = flagg               │  │
│  │         └──────────────┘                           │  │
│  │      ▓ bunker ▓                                    │  │
│  └────────────────────────────────────────────────────┘  │
│  EV-VARMEKART: [●lavest 2,9] ........ [●høyest 3,4]       │
│  [Velg kølle ▾] [68%/95%] [Lagre game plan]              │
└──────────────────────────────────────────────────────────┘
```

---

## 3. MENTAL PRESTASJONSPSYKOLOGI — undervurdert overalt

**Hvorfor:** Elite investerer enormt her, men ingen plattform gjør det bra. Helt fraværende hos oss i dag.

**Rute-familie:** `/portal/mental` + coach-innsyn `/admin/spillere/[id]/mental`

### Nye datamodeller
```
MentalLog { id, userId, date, mood(1-5), focus(1-5), arousal(1-5), confidence(1-5), notes, roundId? }
RoutineLog { id, userId, roundId, preShotFollowedPct, notes }
MentalAssessment { id, userId, date, focus, confidence, resilience, composure, motivation }  // periodisk
```

### `/portal/mental` — Mental-hub
**Inngang:** Sidebar (egen "Mental"-seksjon, eller under Meg).
**Synlig:** Dagens stemning (rask 4-skala mood/focus/arousal/confidence) · pre-shot-rutine-status · siste dagbok-notat · mental-ferdigheter-radar · trend over tid.
**Knapper:** Logg dagens → MentalLog · Skriv dagbok · Ny vurdering.

### `/portal/mental/rutine` — Pre-shot rutine-tracker
**Synlig:** Definer egen pre-shot-rutine (steg). Etter runde: hvor konsistent fulgte du den (%)? Korrelasjon rutine% ↔ score.

### `/portal/mental/dagbok` — Konkurranse-dagbok
**Synlig:** Pre-runde (mål, fokus-ord, arousal) + post-runde (hva gikk bra/dårlig, følelse, læring). Tidslinje av notater.

### `/portal/mental/vurdering` — Mental-ferdigheter
**Synlig:** Periodisk selvvurdering (fokus, selvtillit, resiliens, ro, motivasjon) → radar. Sammenlign mot forrige.

### Pressure-performance (på Workbench/Analysere)
**Synlig:** Kobling mellom mental-state og scoring — "din score er 2,1 slag bedre når arousal er 3/5 vs 5/5".

```
┌──────────────────────────────────────────────────────────┐
│  MENTAL · I dag                                           │
│  ┌──────────────┐ ┌───────────────────────────────────┐  │
│  │ DAGENS LOGG  │ │  MENTAL-FERDIGHETER (radar)        │  │
│  │ Humør  ●●●○○ │ │         Fokus                      │  │
│  │ Fokus  ●●●●○ │ │        ╱─────╲                     │  │
│  │ Arousal●●○○○ │ │  Motiv ╱  ●   ╲ Selvtillit          │  │
│  │ Selvt. ●●●●○ │ │       │  ╱─╲  │                     │  │
│  │ [Logg →]     │ │  Ro    ╲─────╱  Resiliens          │  │
│  └──────────────┘ └───────────────────────────────────┘  │
│  PRE-SHOT RUTINE: 87% konsistens siste 5 runder          │
│  PRESSURE: score 2,1 slag bedre når arousal = 3/5        │
│  [Skriv dagbok] [Ny vurdering]                           │
└──────────────────────────────────────────────────────────┘
```

---

## Oppsummering — Elite Fase 2

| Funksjon | Nye skjermer | Nye datamodeller | Differensiering |
|---|---|---|---|
| **Video-analyse** | 4 (bibliotek, analyse, sammenlign, coach) | VideoAnnotation, VideoComparison | Table stakes for elite |
| **Dispersjon-motor** | 3 (oversikt, sikte-planlegger, game-plan) | DispersionProfile, AimStrategy | STØRSTE moat |
| **Mental** | 5 (hub, rutine, dagbok, vurdering, pressure) | MentalLog, RoutineLog, MentalAssessment | Undervurdert overalt |

**Readiness/recovery (neste steg):** HRV, søvn, ACWR, wearable-integrasjon. Egen fase etter disse tre.

---

## Anbefalt byggerekkefølge

Hver funksjon = datamodell først (Prisma-migrasjon) → komponenter → skjermer → koble data.

1. **Video-analyse** — start her (du valgte den først). Frame-scrubber + annotering er kjernen.
2. **Dispersjon-motor** — størst konkurransefordel. Krever DispersionProfile-cron fra TrackMan-data.
3. **Mental** — raskest å bygge (mest skjema-basert), men høy verdi.

**Sammenheng med kjerne-redesignet:** Disse er Fase 2. Anbefaling: ferdigstill kjerne-redesignet (PlayerHQ + AgencyOS mot Claude Design-handover) FØRST, så bygg disse tre på det rene fundamentet. Men de er nå i manifestet — synlige i totalbildet og klare til å designes i Claude Design parallelt.
