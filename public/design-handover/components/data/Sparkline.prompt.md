Tiny trend chart for KPI tiles and dense table rows; no axes or labels.

```jsx
<Sparkline data={[2,3,2.5,4,3.8,5,4.6]} color="var(--signal)" />
<Sparkline data={[12,9,11,7,8,6]} variant="bar" color="var(--down)" />
```

- **variant**: `line` (default) | `bar`. **fill** adds a soft area under a line.
- Pass `color` to highlight (lime for positive, coral for negative).
