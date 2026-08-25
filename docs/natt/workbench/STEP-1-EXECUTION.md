# Steg 1 — Workbench domain + create/move/publish

**Status:** Klar til kjøring i Claude Code  
**Dato:** 24.08.2026  
**Mål:** Coach kan opprette, flytte og publisere økter. Spilleren ser kun publiserte.

---

## 0. Før du starter

1. Åpne **ny** Claude Code-session mot det ekte AK Golf HQ-repoet.
2. Ikke lim inn hele `src/` — pek kun på relevante mapper + denne mappen.
3. ~~Lim inn prompten fra `arkiv/CLAUDE-CODE-PROMPT.md`~~ — FERDIG BRUKT 25.08, ikke kjør på nytt.

---

## 1. Gap-analyse Claude må gjøre først

Claude skal svare på dette før den skriver kode:

| Spørsmål | Hvor den leter |
|----------|----------------|
| Finnes allerede Session / Plan / Workbench-modeller i Prisma? | `prisma/schema.prisma` |
| Finnes TimeGrid / SessionCard / UkeKalender? | `components/calendar/` eller lignende |
| Hvor lever «I dag»-kortet i Player HQ? | `app/(player)/` eller `components/` |
| Finnes server-action-mønster allerede? | `app/actions/` |
| Auth: hvordan hentes coachId / playerId? | eksisterende session helpers |

---

## 2. Implementasjonsrekkefølge (tracer bullets)

### 2.1 Domain (30 min)
- [ ] Kopier `domain/types.ts` → `src/domain/workbench/types.ts`
- [ ] Kopier `domain/operations.ts` → `src/domain/workbench/operations.ts`
- [ ] Kopier `ui/labels.ts` → `src/domain/workbench/labels.ts` (eller `src/lib/workbench/labels.ts`)
- [ ] Kjør `operations.test.ts` (node:test) — alle tester grønne

### 2.2 Persistens (45–90 min)
- [ ] Gap-analyse: gjenbruk eksisterende tabell **eller** minimal migration for `WorkbenchSession` + `WorkbenchDrill` (skisse i `store/actions.ts`)
- [ ] Server actions:
  - `loadWeek`
  - `createSession`
  - `moveSession`
  - `publishSessions`
  - `loadSources` (kan returnere tom liste / mock først)
  - `loadPlayerDay` (filter: kun PUBLISHED | IN_PROGRESS | COMPLETED)

### 2.3 Agency UI — uke (1–2 t)
- [ ] WeekGrid (read-only først) med eksisterende SessionCard hvis mulig
- [ ] CreateSessionModal → createSession action
- [ ] Flytt: enten enkel tid/dato-edit i inspector **eller** drag hvis TimeGrid allerede støtter det
- [ ] PublishConfirmDialog → publishSessions
- [ ] DRAFT-badge synlig kun for coach

### 2.4 Smoke-test (må passere før Steg 2)

```
1. Coach åpner Workbench for en spiller
2. Oppretter økt i dag 10:00, 60 min, TEK
3. Ser DRAFT-badge
4. Flytter til 14:00
5. Publiserer
6. Status = PUBLISHED
7. loadPlayerDay for samme spiller + dato returnerer økten
8. En annen DRAFT-økt returneres IKKE
```

---

## 3. Akseptansekriterier (hard)

| # | Kriterium | Pass/Fail |
|---|-----------|-----------|
| 1 | createSession skriver rad med status DRAFT | |
| 2 | moveSession oppdaterer date + startMinute | |
| 3 | publishSession setter PUBLISHED + publishedAt | |
| 4 | loadPlayerDay returnerer 0 DRAFT-økter | |
| 5 | Tom uke viser norsk empty state | |
| 6 | Overlap gir warn, men blokkerer ikke | |
| 7 | Typecheck passerer | |

---

## 4. Hva som **ikke** skal bygges i Steg 1

- Måned / årsvisning
- Stall multi-spiller kolonner
- Agent-ghost / PlanAction-diff
- Google-synk
- Full drag-resize-library hvis den ikke finnes
- Nye design-tokens
- Player-side UI utover data-binding (det er Steg 2)

---

## 5. Når Steg 1 er ferdig

1. Kryss av A4-boksene i UTVIKLINGSPLAN for create/move/publish.
2. Gå til **Steg 2**: Player «I dag» binder mot `loadPlayerDay`.
3. Deretter **Steg 3**: DispersionMap inn i TrackMan-detalj.

---

## 6. Filkart (forventet etter Steg 1)

```
src/domain/workbench/
  types.ts
  operations.ts
  labels.ts
  operations.test.ts

src/app/actions/workbench.ts   (eller tilsvarende)

src/components/workbench/
  WeekGrid.tsx
  CreateSessionModal.tsx
  SessionInspector.tsx
  PublishConfirmDialog.tsx
  SourcesPanel.tsx             (kan være stub)
```
