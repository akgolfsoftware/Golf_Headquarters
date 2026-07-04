# BarChart

Horisontal strek-chart. Aktiv serie vises i lime.

## Bruk
```jsx
<BarChart
  showRank
  items={[
    { label: "Øyvind R.", value: 2.8, active: true },
    { label: "Peer G.",   value: 2.1 },
    { label: "Jonas H.",  value: 1.9 },
  ]}
  formatValue={(v) => v.toFixed(1).replace(".", ",")}
/>
```
