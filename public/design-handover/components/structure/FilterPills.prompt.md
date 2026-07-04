# FilterPills

Horisontal scrollbar pillefilter. multi=true tillater flere valg.

## Bruk
```jsx
<FilterPills
  multi
  filters={[
    { value: "all", label: "Alle", count: 24 },
    { value: "FYS", label: "FYS", axis: "FYS", count: 5 },
    { value: "TEK", label: "TEK", axis: "TEK", count: 8 },
  ]}
  value={active}
  onChange={setActive}
/>
```
