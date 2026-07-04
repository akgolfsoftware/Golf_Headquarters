# DataTable

Sorterbar tett tabell. Mono + delta-farging innebygd.

## Bruk
```jsx
<DataTable
  columns={[
    { key: "name",  label: "Spiller", width: 180 },
    { key: "hcp",   label: "HCP",   mono: true, sortable: true },
    { key: "sg",    label: "SG",    mono: true, sortable: true, delta: true },
    { key: "runder",label: "Runder",mono: true, sortable: true },
  ]}
  rows={[
    { name: "Øyvind Rohjan", hcp: "+2,4", sg: 2.8, runder: 24 },
  ]}
  sortKey="sg" sortDir="desc"
/>
```
