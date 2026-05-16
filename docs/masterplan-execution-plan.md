# Masterplan-eksekverings-plan — S1 til S16

> Parallell-kjøring av treningsplanleggeren i 5 bølger.
> Total estimert agent-tid: 25-35 timer. Total gjennomløp med parallellisme: 6-10 timer aktiv tid.

## Avhengighetsgraf

```
                S1 (taksonomi + constraints)
                  │
        ┌─────────┼─────────┐
        │         │         │
        S2        S5        S3
   (generator)  (UI prim.) (datovelger)
        │         │         │
        └─────────┼─────────┘
                  │
                  S4 (server actions)
                  │
        ┌─────────┼─────────┐
        │         │         │
   S8-10        S11-12     S13-14
  (kalender)   (drill+mal)  (analyse)
        │         │         │
        └─────────┼─────────┘
                  │
                S15 (polish + designfiks)
                  │
                S16 (merge til main)
```

## Bølger

### Bølge 1 — Fundament (parallelt)
Estimert: 1.5-2 timer gjennomløp

| Sesjon | Hva | Branch | Avhengigheter |
|---|---|---|---|
| S1 | Taksonomi v4 + periode-constraints | `feat/masterplan-s1` | S0 (ferdig) |
| S3 | Smart datovelger + API-route | `feat/masterplan-s3` | S0 |

**Filer S1:**
- `src/lib/portal/training/ak-taxonomy.ts` (utvidet med FYS_TRENINGSTYPER, FYS_MUSKELGRUPPER, KONDISJON_SONER, BEVEGELIGHET_TYPER, KONDISJON_AKTIVITETER, DRILL_MAL_KATEGORIER)
- `src/lib/portal/training/periode-constraints.ts` (NY — getPeriodeConstraints + validateSessionConstraints)
- `src/lib/portal/training/__tests__/periode-constraints.test.ts` (vitest)

**Filer S3:**
- `src/lib/portal/training/date-parser.ts` (NY)
- `src/app/api/parse-date/route.ts` (NY)
- Natural-language: "neste mandag", "om 3 dager", "2 uker før Bossum Open"

---

### Bølge 2 — Kjernelogikk + UI-primitiver (parallelt)
Estimert: 2-3 timer gjennomløp

| Sesjon | Hva | Branch | Avhengigheter |
|---|---|---|---|
| S2 | Session-generator (fire-lags) | `feat/masterplan-s2` | S1 |
| S5 | UI-primitiver | `feat/masterplan-s5` | S1 |

**Filer S2:**
- `src/lib/portal/training/session-generator.ts` (NY)
- 4 lag: LockedAnchors → RecurringPatterns → PeriodVolumeRecipe → ConditionalRules
- Performance-test: 144 økter på <5s
- Vitest-suite

**Filer S5 (10 komponenter i `src/components/shared/calendar/`):**
- `PyramideBar.tsx` (5 segmenter)
- `PraksistypeBadge.tsx` (B/R/K/S chips)
- `TurneringMarker.tsx` (diamant)
- `CapacityLoadBar.tsx`
- `MyelinTracker.tsx`
- `QuickAddPopover.tsx`
- `CalendarNav.tsx`
- `MiniCalendar.tsx`
- `SmartDateInput.tsx` (importerer S3-logikk)
- `RecurrenceSelector.tsx`

---

### Bølge 3 — Server actions + shell (parallelt)
Estimert: 1.5-2 timer gjennomløp

| Sesjon | Hva | Branch | Avhengigheter |
|---|---|---|---|
| S4 | Server actions (alle CRUD + bulk) | `feat/masterplan-s4` | S1, S2, S3 |
| S6 | PlanSidebar + CalendarShell + SessionCard | `feat/masterplan-s6` | S5 |
| S7 | Yterligere UI-komponenter | `feat/masterplan-s7` | S5 |

**Filer S4 (splittet i 5 actions-filer):**
- `src/app/admin/kalender/actions/sessions.ts` (getSessionsForRange, createSession, updateSession, deleteSession)
- `src/app/admin/kalender/actions/perioder.ts` (CRUD)
- `src/app/admin/kalender/actions/ankere.ts` (LockedAnchor + RecurringPattern CRUD)
- `src/app/admin/kalender/actions/maler.ts` (DrillMal + OktMal CRUD)
- `src/app/admin/kalender/actions/analyse.ts` (de fleste analyse-aktivitetene)
- Player-versjon: `src/app/portal/kalender/actions.ts`

**Filer S6:**
- `src/components/shared/calendar/PlanSidebar.tsx`
- `src/components/shared/calendar/CalendarShell.tsx`
- `src/components/shared/calendar/SessionCard.tsx`

**Filer S7:**
- Eventuelle overskudd-komponenter (kan slås sammen med S5)

---

### Bølge 4 — Kalendervisninger + øktinnhold + analyse (3 parallelle agenter!)
Estimert: 3-4 timer gjennomløp

Største bølge. Tre uavhengige områder kan jobbes med samtidig.

| Sesjon | Hva | Branch | Avhengigheter |
|---|---|---|---|
| S8-10 | AarsplanView + MonthView + WeekView + DayView + PeriodeModal + VolumResept + Ankere | `feat/masterplan-s8-10` | S6, S7, S4 |
| S11-12 | SessionEditor + GolfDrillEditor + FysDrillEditor + DrillMalLibrary + OktMalLibrary | `feat/masterplan-s11-12` | S5, S4 |
| S13-14 | Analyse-aggregering + Analyse-dashboard (6 visninger) | `feat/masterplan-s13-14` | S4 |

**S8-10 hovedfiler:**
- `src/app/admin/kalender/page.tsx` (kalender-rot, ÅR-default)
- `src/components/shared/calendar/AarsplanView.tsx` (Gantt 52 uker)
- `src/components/shared/calendar/MonthView.tsx`
- `src/components/shared/calendar/WeekView.tsx` (drag-and-drop)
- `src/components/shared/calendar/DayView.tsx`
- `src/components/shared/calendar/PeriodeModal.tsx`
- `src/components/shared/calendar/PeriodVolumeRecipeEditor.tsx`
- `src/components/shared/calendar/LockedAnchorEditor.tsx`
- `src/components/shared/calendar/RecurringPatternEditor.tsx`
- `src/components/shared/calendar/ConditionalRulesPanel.tsx`

**S11-12 hovedfiler:**
- `src/components/shared/calendar/SessionEditor.tsx`
- `src/components/shared/calendar/GolfDrillEditor.tsx`
- `src/components/shared/calendar/FysDrillEditor.tsx`
- `src/components/shared/calendar/DrillMalLibrary.tsx`
- `src/components/shared/calendar/OktMalLibrary.tsx`

**S13-14 hovedfiler:**
- `src/app/admin/analyse/page.tsx`
- `src/app/admin/analyse/actions.ts` (eller utvidelse av S4-actions)
- `src/components/analyse/AnalyseOversikt.tsx`
- `src/components/analyse/AnalyseKrysstabell.tsx` (VIKTIGST — Anders' nøkkelinnsikt)
- `src/components/analyse/AnalyseTrender.tsx`
- `src/components/analyse/AnalyseSG.tsx`
- `src/components/analyse/AnalyseFys.tsx`
- `src/components/analyse/AnalysePlanFaktisk.tsx`

---

### Bølge 5 — PlayerHQ + polish + merge
Estimert: 1-2 timer gjennomløp

| Sesjon | Hva | Branch | Avhengigheter |
|---|---|---|---|
| S15 | PlayerHQ-integrasjon (Standard/Avansert) + designfiks | `feat/masterplan-s15` | S8-14 |
| S16 | Verifisering + merge til main | (merge) | S15 |

**Filer S15:**
- `src/app/portal/kalender/page.tsx` (PlayerHQ-variant)
- `src/app/portal/analyse/page.tsx` (PlayerHQ-variant)
- `src/components/shared/calendar/ViewModeContext.tsx` (Standard/Avansert toggle)
- Designfiks-sweep:
  - Token-konsolidering (hardkodede hex → var())
  - TURN-tekst kontrast (alltid #0A1F18)
  - LIVE-økt visuell signatur
  - Today-markør
  - Tapp-knapp full-bredde
  - PeriodeModal accordion-advarsler
  - Encoding sweep (Paagar/naa → Pågår/nå)

**S16:**
- `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Verifisering checklist
- Merge alle bølge-brancher til main
- Push

---

## Eksekverings-strategi per bølge

### For hver bølge:

1. **Lansere agenter parallelt** med `Agent` tool, `isolation: "worktree"`, `run_in_background: true`
2. **Vente på fullføring** (alle agenter må fullføre før neste bølge)
3. **Merge brancher** sekvensielt med `git merge --no-ff` til main
4. **Type-sjekk + push**
5. **Rydde worktrees**
6. **Starte neste bølge**

### Konflikthåndtering
- Hver agent jobber på unike filer (S5 og S6 deler ikke filer)
- Hvis kollisjon oppstår: én agent fullføres først, andre rebaser
- Vitest-tester må passere før merge

### Verifisering per bølge
- `npx tsc --noEmit` — 0 feil
- `npx prisma validate` — schema OK
- Vitest hvis tester er skrevet
- Manuell smoke-test (kun på Bølge 4 og 5 — det er da UI er synlig)

---

## Akseptansetester før Bølge 4 startes

Etter Bølge 3 må disse fungere før vi går videre:

1. ✓ Taksonomi v4 importerbar fra `@/lib/portal/training/ak-taxonomy`
2. ✓ `getPeriodeConstraints(periodeType)` returnerer riktig objekt
3. ✓ `validateSessionConstraints(session, periode)` returnerer regelbrudd
4. ✓ Session-generator: 144 økter på <5s med dummy-data
5. ✓ Smart datovelger: "neste mandag" → 19. mai 2026
6. ✓ Alle 10 UI-primitiver rendrer (visuell test i Storybook eller dev-side)
7. ✓ PlanSidebar rendrer med dummy-data
8. ✓ CalendarShell layout passer 1440px viewport
9. ✓ Server actions returnerer riktig data-shape
10. ✓ TypeScript 0 feil

---

## Akseptansetester for Bølge 5 (final)

Funksjonelt:
- ✓ Coach kan opprette årsplan med 5 periodetyper
- ✓ Coach kan tegne ukesresept → 144 økter på <5s
- ✓ LockedAnchor for WANG Toppidrett påvirker hele perioden
- ✓ ConditionalRule "TEK etter konkurranse" autotrekker
- ✓ DrillEditor veksler golf/FYS basert på pyramide
- ✓ Mal-bibliotek lagrer favoritter
- ✓ Smart datovelger parser naturlig språk
- ✓ Spiller ser planen i PlayerHQ med Standard/Avansert toggle
- ✓ Krysstabell aggregerer Område × Pyramide korrekt

Visuelt:
- ✓ Lyst tema gjennomgående med mørk sidebar
- ✓ Token-bruk konsekvent
- ✓ Norsk bokmål overalt med æøå
- ✓ LIVE-økt har egen visuell signatur
- ✓ Tapp-knappen aldri kuttet

Ytelse:
- ✓ Måned: 30 dager × 6 spillere på <300ms
- ✓ Krysstabell-aggregering for 1000 økter på <1s
- ✓ Bulk-generering 12 mnd på <5s
