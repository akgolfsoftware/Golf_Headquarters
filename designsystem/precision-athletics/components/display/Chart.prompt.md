Chart primitives. Data marks are **0-radius**, numbers **mono**, goal is a **2 px graphite line**. Axis colour classifies which axis the data belongs to — it never means good/bad. Status belongs in StatusPill.

```jsx
<Chart kicker="Uke 39" title="Timer per akse" axis={{ min: 0, max: 8, ticks: 5, unit: "t" }} footer="PLAN MOT GJENNOMFØRT · 28 DAGER">
  <BarRow label="FYS" axis="fys" value={3.5} max={8} goal={4} display="3,5" unit="t" />
  <BarRow label="SLAG" axis="slag" value={5.2} max={8} goal={5} display="5,2" unit="t" />
  <BarRow label="SPILL" axis="spill" value={null} max={8} />
</Chart>
<Sparkline values={[48, 52, 51, 57, 61, 64]} goal={65} axis="slag" />
```

- No gradients, no rounded bars, no rust in charts.
- Empty value "—", never a zero-width bar pretending to be 0.
