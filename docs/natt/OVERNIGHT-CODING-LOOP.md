# Overnight coding loop — lanseringskjerne A1–A4

**Dato:** 24.08.2026 23:33 CEST  
**Repo:** `akgolfsoftware/Golf_Headquarters` (ikke AKGolf2.0)  
**Look:** Train-lock. Scene `#000000`.  
**Gren:** `claude/natt-a1-a4-2026-08-24`  
**Spec:** `docs/natt/workbench/`

Dra **ikke** alle 160 skjermer i natt. Én Claude-session per loop. Lim-inn Loop 1: [LOOP-1-PROMPT.md](./LOOP-1-PROMPT.md). Bølge 2: [OVERNIGHT-CODING-LOOP-BOLGE2.md](./OVERNIGHT-CODING-LOOP-BOLGE2.md).

**Hard regel:** utkast finnes ikke på spillersiden. `loadPlayerDay` filtrerer DRAFT.

## Smoke som stenger bølge 1

```
Coach: ny økt → UTKAST → flytt → Publiser
Spiller: ser den i «I dag», ser ikke annen DRAFT
Spiller: Start økt → IN_PROGRESS → Ferdig (warm hake)
TrackMan-detalj: 1σ-ellipse + én caddie-setning + prikk → slag-ark
```

Ikke start bølge 2 før smoke er grønn.

## Økt er atomet (bølge 1)

`WorkbenchSession` / `blockType: OEKT`. Skjermer: A-02/02b/02c/03/03b/03c/04/04b/07/09/11/14, PH-04/05/06, P-02/06/07, WB-04/07/10, MAT-01.

Funksjoner: create/move/publish/unpublish/addDrill/reorder/remove/delete/start/complete/skip/series/approval/`hiddenByPlayer`.

Status:

```
DRAFT ──publish──► PUBLISHED ──start──► IN_PROGRESS ──complete──► COMPLETED
```

Fullført = warm `#B85C3D`. `#30D158` kun Godta / PUBLISERT-merke.

## Loops bølge 1

| Loop | Jobb | Fasit |
|------|------|--------|
| 1 | Domain + actions (ingen UI) | workbench/domain + store/actions |
| 2 | Agency uke + create/move/publish UI | WB-01/02/03, A-01d, A-18, A-03 |
| 2S | Inspector + drill komplett/MANGLER | A-02, A-03b/c, MAT-01 |
| 2T | Kilder, drag, serie | A-04, A-07, A-11, A-02c, WB-07 |
| 3 | Player I dag ← loadPlayerDay | PH-01e, PH-02, PH-03 |
| 3S | Økt-ark + live start/complete | PH-04/05/06, A-14 |
| 3T | Godta/Avvis + ikke delta | A-09, WB-04, WB-10 |
| 4 | DispersionMap | TM-07/08/08f/10/11 |

### Loop 1 — ferdig når

```
npx tsx --test src/domain/workbench/operations.test.ts
npx tsc --noEmit
```

create → DRAFT; move; publish + publishedAt; loadPlayerDay 0 DRAFT. Commit. Skriv `docs/natt/LOOP-1-DONE.md`. Ikke start Loop 2.

### Loop 2

WeekGrid + CreateSessionModal + SessionInspector + PublishConfirm. Copy: caps `UTKAST`, «Kun synlig for deg», «Publiser uke · N». Move = inspector med mindre TimeGrid allerede har drag.

### Loop 2S / 2T

2S: drill tom = MANGLER, lagre disabled. Formel på drill.  
2T: dropp øvelse på tom dag = avvis. Serie A-02c + caps ↻. TURN/TEST default Hopp over.

### Loop 3 / 3S / 3T

I dag fire tilstander. Start → PH-05 artefakt. Ferdig → PH-06. Godta grønn kun her. Skjul ≠ slett.

### Loop 4

CaddieLeak → KPI → kart → findings → tabell. Testdata HANDOFF (Øyvind 7i). n < 5: ellipse venter.

## Stopp-regler (alle loops)

- Ingen Prisma-reset. Minimal migration dokumentert.
- Ingen nye tokens. Ingen Google, måned/år/stall i bølge 1.
- Ikke port HTML 1:1. Gjenbruk Button/Modal/TimeGrid/SessionCard.
- Ikke merge. Anders ser skjermene.
- Logg IDs, ikke navn. Ingen ekte junior-rader i smoke.
