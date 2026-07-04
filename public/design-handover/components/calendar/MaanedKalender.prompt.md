# MaanedKalender

Månedsgrid med to moduser: `varme` (lime-heatmap, dashbord) og `piller` (Notion-månedsceller, planlegging).

## Varme (default) — dagvelger m/ mengde-heat
```jsx
<MaanedKalender
  year={2026} month={5}
  value={selectedDate} onChange={setSelectedDate}
  days={[
    { date: 3, sessions: 2 },
    { date: 17, sessions: 3, today: true },
  ]}
/>
```

## Piller — planlegging m/ økt-piller og DnD
```jsx
<MaanedKalender
  modus="piller" year={2026} month={5}
  days={[
    { date: 17, today: true, okter: [
      { id: "o1", tittel: "Teknikk — Øyvind", akse: "TEK", tid: "09:00" },
      { id: "o2", tittel: "Styrke", akse: "FYS" },
    ]},
  ]}
  onOktKlikk={(okt) => åpnePeek(okt)}
  onNyOkt={(date) => nyOkt(date)}
  onVisAlle={(date) => åpneDag(date)}
  onFlytt={({ id, fraDato, tilDato }) => flyttOkt(id, tilDato)}
/>
```

- Piller: akse-prikk + trunkert tittel + evt. tid; maks `maksPiller` (3) før «+N flere»; flate — ingen skygger (quieter).
- Hover/fokus-«+ Ny» oppe til høyre i cellen (Notion-mønsteret).
- **DnD:** med `onFlytt` dras piller (med `id`) mellom dager — spøkelses-pille følger pekeren, målcelle markeres, Escape avbryter; klikk uten bevegelse er fortsatt `onOktKlikk`. Kalleren eier re-validering.
- I dag = signal-fylt dato-tall (piller) / signal-kant (varme).
