The signature metric tile — the biggest number on screen; use it wherever a KPI leads (cockpit strips, player dashboards, finance).

```jsx
<KpiTile label="Stall-SG · 30 d" value="2,8" unit="snitt" delta="+0,4" deltaSuffix="vs forrige" />
<KpiTile label="MRR coaching" value="14 400" unit="kr" trend="up" delta="+8%" size="md" />
<KpiTile label="Plan-adherence" value="86" unit="%" delta="+5" sparkline={[70,74,72,80,83,86]} />
```

- Number is tabular JetBrains Mono; **unit** is a small muted suffix; **delta** auto-colors (↗ lime / ↘ coral) from its sign — or force with **trend**.
- **size**: `md` 36 · `lg` 48 (default) · `xl` 60. Pair several inside a `Card` or a KPI strip.
- All numbers stay mono + tabular. Don't restyle the number in another font.
- **Data-life**: the number counts up from 0 on mount (respects `prefers-reduced-motion`); the sparkline draws in and its endpoint glows subtly on an uptrend. Automatic — no extra props.
