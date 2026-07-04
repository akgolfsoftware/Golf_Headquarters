# CompareChart

Dual-line comparison — lime primary against a muted dashed secondary (previous
period, squad average, benchmark). Scrubber shows both values plus the delta.

## Bruk
```jsx
<CompareChart
  labels={["Uke 20","Uke 21","Uke 22","Uke 23","Uke 24","Uke 25"]}
  primary={[68,71,74,76,80,86]}
  secondary={[60,63,65,67,70,72]}
  primaryLabel="Denne sesongen" secondaryLabel="Forrige sesong"
  fmt={(v) => `${Math.round(v)}%`}
/>
```
- Secondary is always dashed + muted — never a second saturated color; the primary
  lime line is the one story being told.
- Omit `secondary` to use it as a single-line chart with the same scrubber/tooltip
  behavior as LoadChart, when you don't need band zones.
