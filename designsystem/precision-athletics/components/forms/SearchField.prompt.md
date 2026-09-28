Filter a list in place (stall, øvelseskatalog, fakturaer).

```jsx
<SearchField value={q} onChange={setQ} placeholder="Søk spiller eller gruppe" count={hits.length} />
```

- Filters as you type; no submit button. Clear button appears when there is text.
- Placeholder names what can be searched. Never "Søk …" alone when the scope is known.
