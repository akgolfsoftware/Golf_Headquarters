Kanban-kolonne; bruk for plan-oversikt (Utkast/Aktiv/Fullført), oppgavetavler og køer.

```jsx
<div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
  <KanbanKolonne tittel="Utkast" tone="noytral">
    <PlanKort … />
    <PlanKort … />
  </KanbanKolonne>
  <KanbanKolonne tittel="Aktiv" tone="aktiv">
    <PlanKort … />
  </KanbanKolonne>
  <KanbanKolonne tittel="Fullført" tone="ferdig">
    <KanbanKolonne.Tom>Ingen planer</KanbanKolonne.Tom>
  </KanbanKolonne>
</div>
```

- **tone**: `noytral` (muted prikk) · `aktiv` (signal) · `ferdig` (SPILL-grønn) — lukket sett.
- Telleren telles automatisk fra children (`Tom` telles ikke); overstyr med **antall** ved paginering.
- Kortene er children — kolonnen eier ikke kort-utformingen. `Tom` = eksplisitt tom-tilstand (stiplet).
- Kolonner legges side om side av omgivelsen (flex + gap); kolonnen scroller selv ved overflow.
