Pill-active segmented control; use for short tab rows (3 choices) and period selectors (Uke / Måned / 3 mnd / År).

```jsx
const [p, setP] = React.useState("maned");
<SegmentedTabs
  options={[{value:"uke",label:"Uke"},{value:"maned",label:"Måned"},{value:"3mnd",label:"3 mnd"},{value:"ar",label:"År"}]}
  value={p} onChange={setP}
/>
<SegmentedTabs options={["Plan","Gjør","Analyse"]} value={p} onChange={setP} block />
```

- Active item becomes a white pill with dark text on the dark rail. Mono labels.
- **block** stretches items to fill the row. **size**: `sm` | `md`.
