# Workbench UI components — launch minimum (A4)

All components consume Train-lock tokens when inside Player HQ,  
Claude Paper tokens when inside AgencyOS desktop.  
Switch via existing theme context.

## 1. WeekGrid (Agency desktop)

**File:** `components/workbench/WeekGrid.tsx`

Props:
```ts
{
  week: WeekViewModel
  onSelectSession: (id: string | null) => void
  onMoveSession: (cmd: MoveSessionCommand) => void
  onCreateAt: (date: string, startMinute: number) => void
  selectedSessionId: string | null
  isDragging: boolean
}
```

- 7 columns (Mon–Sun), time axis 05:00–23:00, 30 min snap
- SessionCard per session (reuse existing calendar/SessionCard if present)
- Locked blocks (school etc.) rendered dimmed, non-interactive
- Drag handle on SessionCard → START_DRAG / END_DRAG
- Empty cell click → OPEN_CREATE with pre-filled date + startMinute
- BudgetBar above grid (read-only, no invariants)

## 2. SessionInspector (right column, 360–400 px)

**File:** `components/workbench/SessionInspector.tsx`

- Title, time range, pyramid chip, status badge
- Drill list with AKFormelChip
- «Legg til drill» → opens source picker or inline form
- Publish / Unpublish button (coach only)
- Notes textarea
- Close → SELECT_SESSION null

## 3. CreateSessionModal

**File:** `components/workbench/CreateSessionModal.tsx`

Fields (minimal):
- Title
- Date (pre-filled)
- Start time (pre-filled from click)
- Duration (default 60)
- Pyramid (required)
- Optional: first drill from sources

Primary: «Opprett» → CREATE_SESSION  
Secondary: «Avbryt»

## 4. SourcesPanel (left, collapsible)

**File:** `components/workbench/SourcesPanel.tsx`

Tabs / sections:
- Øvelsesbank (drills)
- Maler
- Tidligere uker (optional for launch)

Each SourceItem is draggable → on drop on a session or empty cell:
- If empty cell → create session + add drill
- If on session → ADD_DRILL_FROM_SOURCE

## 5. PublishConfirmDialog

**File:** `components/workbench/PublishConfirmDialog.tsx`

- Title from UI.publishConfirmTitle
- Body from UI.publishConfirmBody
- List of sessions about to be published (title + time)
- Primary: «Publiser»
- Ghost: «Avbryt»

## 6. PlayerAgenda (mobile / Player HQ)

**File:** `components/workbench/PlayerAgenda.tsx`

- Chronological list of published sessions for the day/week
- Session row: time · title · pyramid · duration
- CTA «Start økt» on next one
- Empty state

## Implementation order (tracer bullets)

1. Domain types + operations (done in this folder)
2. Server actions skeleton + Prisma migration if needed
3. WeekGrid + SessionCard binding (read-only first)
4. CreateSessionModal + create action
5. Drag-to-move (or simple edit time in inspector)
6. SourcesPanel + add drill
7. Publish flow
8. Player «I dag» data binding

Do **not** build: month view, year view, stall multi-player columns, agent ghost proposals, peaking, Google sync — those are post-launch.
