# TrajectoryPlot

Ballbanen fra siden. Slagene dempet, snittet i blekk.

```jsx
<TrajectoryPlot dataOdId="j7-baner"
  shots={[{ carry: 165, apex: 29 }, { carry: 171, apex: 33 }, { carry: 168, apex: 31 }]}
  mean={{ carry: 168, apex: 31 }} carryLabel="168 m" apexLabel="31 m" />
```

- Kurven er en symmetrisk tilnærming fra carry + apex — BEREGNET skisse av
  høydevinduet, ikke aerodynamikk. Skal banen være fysisk korrekt (vind,
  spin-decay), er det TrackMans egen visning — ikke denne.
- Grensen mot `DispersionMap` (golfviz): retning/spredning ovenfra bor der.
  Sammen gir de hele bildet: side + topp.
- Hvert slag er `--mid` på 45 % opacity; snittet er blekk 2 px. Aldri
  fargekoding per slag — plottet viser VINDUET, ikke enkeltslag-dommer.
- `preserveAspectRatio="none"` + non-scaling-stroke: plottet strekker seg
  med containeren. Terskel 380 px: høyden 120→88.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
