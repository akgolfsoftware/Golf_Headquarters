# BarChart

Kategorisøyler. Analyse-blå uten benchmark; opp/ned-toner med.

```jsx
<BarChart dataOdId="uketimer" benchmark={6} benchmarkLabel="mål 6 t"
  items={[
    { label: "u29", value: 5.5, display: "5,5 t" },
    { label: "u30", value: 7, display: "7,0 t" },
    { label: "u31", value: 4, display: "4,0 t" },
    { label: "u32", value: 6.5, display: "6,5 t" },
  ]} />
```

- Grensen mot `SgBreakdown`/`SgBar` (golfviz): SG er signert rundt null og har
  egne regler — bruk aldri BarChart til SG. Grensen mot `LoadChart`: har
  verdiene et anbefalt VINDU (min–maks), er det LoadChart.
- `display` skal alltid ha enhet og komma-desimal («6,5 t») — CONTENT
  FUNDAMENTALS-regelen om tall gjelder også i diagrammer.
- Benchmark-linjen er stiplet `--mid`; søylene over den er `--up-raw`, under
  er `--dn` blandet 35 % mot flaten — aldri rød, og aldri oransje.
- Container-terskel 380 px: verditallene ryker, søylene og etikettene står —
  formen bærer budskapet i smal spalte; sammendraget ligger i aria-label.
- Ren visning: ingen klikk i søylene. Drilldown er konsumentens jobb (rad
  under diagrammet, ikke usynlige treffmål i plottet).
