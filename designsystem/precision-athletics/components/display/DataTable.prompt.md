Tabular data for AgencyOS (stall, fakturaer, testresultater). Real `<table>` on wide surfaces; **below 760 px of its own width it becomes card rows** — first column is the card title, the rest are label/value lines. Never `overflow-x:auto`.

```jsx
<DataTable
  rowKey="id" selected={sel} onSelect={setSel} defaultSort={{ key: "hcp", dir: "asc" }}
  columns={[
    { key: "name", label: "Spiller", sortable: true },
    { key: "hcp", label: "HCP", mono: true, align: "right", sortable: true },
    { key: "sg", label: "SG total", mono: true, align: "right", sortable: true },
    { key: "last", label: "Siste økt", mono: true },
  ]}
  rows={[{ id: 1, name: "Ida Berg", hcp: "4,2", sg: "+1,2", last: "26.09 · 08:12" }, { id: 2, name: "Jonas Lie", hcp: "2,8", sg: null, last: "" }]}
/>
```

- Empty cell renders "—", never 0. Numbers `mono` + `align:"right"`.
- Selected row: 2 px graphite inset on the left (never a fill colour).
- Sorting: header buttons on wide; a wrapping "Sorter" chip row on card layout.
- No rust, no axis colour for status. Put AxisBadge/StatusPill in `render` if needed.
