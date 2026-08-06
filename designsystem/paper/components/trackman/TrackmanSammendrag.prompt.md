# TrackmanSammendrag

Øktas dør: fire nøkkeltall + høydepunkter.

```jsx
<TrackmanSammendrag sessionLabel="3. august · Mulligan 3 · 62 min" dataOdId="okt-0803"
  fields={[
    { label: "Slag", value: "84" },
    { label: "Køller", value: "5" },
    { label: "Snitt smash", value: "1,44" },
    { label: "Beste carry", value: "236 m" },
  ]}
  highlights={["Wedge 60 m: 8 av 10 innenfor 5 m — beste serie i år.", "Driver-spinn fortsatt over vinduet (3 150 rpm)."]} />
```

- Sammendraget er DØRA: detaljene bor i `KolleStatKort` (per kølle),
  `LaunchWindowKort` (start) og `DispersionMap` (retning). Gjenta aldri
  detaljene her — fire tall og maks tre høydepunkter.
- Høydepunktene er KLARTEKST med tall og enhet — skrevet av coach/Caddie,
  aldri autogenerert floskel.
- Terskel 380 px: 4 kolonner → 2 × 2.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
