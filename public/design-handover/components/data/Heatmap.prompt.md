# Heatmap

Generic intensity grid — booking-load by hour×day, risk by player×week. Cells
ramp from `--track` (empty) to one categorical `color` (full) by value 0–1.

## Bruk
```jsx
<Heatmap
  rows={["Man","Tir","Ons","Tor","Fre"]}
  cols={["08","10","12","14","16","18"]}
  values={[[.2,.4,.8,.6,.3,0], /* … one row per day */]}
  color="var(--signal)"
  fmt={(v) => `${Math.round(v*6)} økter`}
/>
```
- One `color` per grid — never mix categorical colors in the same heatmap; pick
  `--signal` for load/activity, `--error-solid` for risk.
- No legend row: cells fade+scale in with a row-major stagger, and hovering shows
  the exact value via `fmt`.
- Keep grids small (≤ ~10×8) — this is a glance tool, not a data table.
