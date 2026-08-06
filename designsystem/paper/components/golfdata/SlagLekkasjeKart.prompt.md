# SlagLekkasjeKart

Hvor slagene renner ut. Rangert, størst først, øverste i full leire.

```jsx
<SlagLekkasjeKart basis="siste 5 runder" dataOdId="oyvind-lekkasje"
  rows={[
    { label: "Nærspill 20–50 m", sg: -1.84, display: "−1,84" },
    { label: "Utslag under press", sg: -1.1, display: "−1,10" },
    { label: "Putt 9–15 ft", sg: -0.6, display: "−0,60" },
  ]}
  note="Resten av spillet er på eller over kategori B-nivå." />
```

- Konsumenten SORTERER (størst tap først) — komponenten stoler på rekkefølgen
  og fremhever kun rad én. Send aldri usortert.
- Grensen mot `SgBreakdown` (golfviz): nedbrytningen viser hele bildet begge
  veier; lekkasjekartet er DIAGNOSEVERKTØYET — bare tapene, rangert.
- Leire-toner (55 % / full), aldri rød. Verdien er alltid signert SG med
  komma-desimal og ekte minustegn (−, ikke bindestrek).
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
