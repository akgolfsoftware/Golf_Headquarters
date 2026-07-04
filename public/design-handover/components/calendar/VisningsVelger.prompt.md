Visnings-velger; bruk som hode over alle kalender-/tidslinjevisninger (Notion-mønsteret: én datakilde, flere visninger).

```jsx
const [visning, setVisning] = React.useState("uke");
<VisningsVelger
  visning={visning} onVisning={setVisning}
  visninger={["agenda", "uke", "maned", "tidslinje"]}
  periode="Uke 25 · juni 2026"
  onForrige={() => flytt(-1)} onNeste={() => flytt(1)} onIdag={gåTilIdag}
/>
```

- Flate tekst-tabs m/ aktiv understrek i signal — IKKE SegmentedTabs-boksen (kalenderhodet skal være rolig).
- Kontrollert: `visning` er lukket enum (`agenda|uke|maned|tidslinje`); tilby delmengde via `visninger`.
- Periode-etiketten er display-font; pilene og «I dag» skjules når handler utelates.
- Speil visning + dato i URL (deep-linking, WIG) — komponenten eier ingen data.
