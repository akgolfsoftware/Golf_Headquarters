Label/value facts: inspector details, player profile, invoice summary. Semantic `<dl>`.

```jsx
<KeyValue items={[["Klippekort", "3 av 10"], ["Gyldig til", "31.12.2026"], ["Forrige time", null]]} />
<KeyValue columns={2} items={[{ label: "HCP", value: "4,2" }, { label: "Kategori", value: "B", mono: false }]} />
```

- Values mono by default (numbers, dates). Set `mono:false` for words.
- Empty value is "—". Long values wrap; they never push the row sideways.
