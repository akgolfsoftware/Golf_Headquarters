Small labelled number tile used in `auto-fit, minmax(240px,1fr)` stat grids on Coach Cockpit and profile screens.

Three surfaces: `outline` (default, white card), `tint` (soft signal/brand wash — use for KPI rows so the grid isn't all white), `filled` (solid brand — at most ONE per grid, for the lead number). `delta` adds a small mono change-line under the label.

```jsx
<div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16}}>
  <StatBox value="69,1" label="Snitt (klubb)" variant="filled" delta="−0,4 mot 2025" />
  <StatBox value="+0,6" label="SG total snitt" tone="pos" variant="tint" delta="+0,2 siste kvartal" />
  <StatBox value="21" label="Tester denne mnd" tone="info" variant="tint" delta="18 bevitnet" deltaTone="neutral" />
  <StatBox value="68,4" label="Snitt" />
</div>
```
