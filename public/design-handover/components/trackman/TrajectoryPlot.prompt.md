Trajectory-plot; bruk for TrackMan-øktens ballbaner (høyde × avstand).

```jsx
<TrajectoryPlot
  baner={[
    { kolle: "6i",  carry: 163.2, apex: 24.1 },
    { kolle: "6i",  carry: 167.5, apex: 26.0 },
    { kolle: "52w", carry: 98.4,  apex: 21.2 },
    // …én bane per slag
  ]}
  koller={[{ id: "6i", navn: "6-jern" }, { id: "52w", navn: "52° wedge" }]}
/>
```

- Kurvene syntetiseres ballistisk fra `carry` + `apex` (toppunkt ~55 % av carry, brattere fall).
- Deler serie-språk (akse-farger + former) og klikkbar legend-filter med `DispersionPlot`.
- Overlagte baner på 45 % opasitet — tettheten ER lesningen (spredning i høyde/lengde).
- Skjermleser-sammendrag per kølle (antall, snitt carry, snitt topphøyde).
- `hoyde` (px, default 220).
