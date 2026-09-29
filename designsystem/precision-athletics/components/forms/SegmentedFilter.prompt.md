List filters with any number of options: Alle · Ukeplaner · Endringer · Fravær · Samtykke.

```jsx
<SegmentedFilter value={f} onChange={setF} options={[{ value: "alle", label: "Alle", count: 9 }, { value: "plan", label: "Ukeplaner", count: 4 }, { value: "fravar", label: "Fravær", count: 0 }]} />
```

- Wraps; never scrolls sideways. Selected = graphite fill (primary), not rust.
- Use Segmented for 2–4 view switches (Dag/Uke), SegmentedFilter for filtering data.
