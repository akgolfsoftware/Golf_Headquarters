Kølle-statkort; bruk for TrackMan-øktens per-kølle-oppsummering (Average + Consistency).

```jsx
<KolleStatKort
  navn="6-jern" antall={41} csNivaa="CS60"
  stats={[
    { label: "Club speed", snitt: "38,5", konsistens: "0,3", enhet: "m/s" },
    { label: "Ball speed", snitt: "55,2", konsistens: "1,0", enhet: "m/s" },
    { label: "Spinn",      snitt: "4 862", konsistens: "207", enhet: "rpm" },
    { label: "Carry",      snitt: "165,0", konsistens: "4,1", enhet: "m" },
    { label: "Side",       snitt: "0,3 V", konsistens: "5,2", enhet: "m" },
  ]}
/>
```

- Verdier er visningsstrenger (norsk komma) — formatering eies av kalleren.
- **Konsistens (±std) er nøytral** — muted mono, aldri delta-farget; tolkning eies av coach/AI.
- **csNivaa** er kanon-koblingen club speed → CS-nivå (CS50–CS100); utledes av kalleren.
- Grid-et bryter selv (auto-fit ≥96px) — fungerer i rail, stabel og full bredde.
