For long lists (fakturaer, slaghistorikk). Prefer filtering first; paginate at 20–50 rows.

```jsx
<Pagination page={p} pageCount={16} onChange={setP} total={312} perPage={20} />
```

- Buttons wrap to a second line on narrow widths. Current page is graphite fill.
- Numbers mono. Gaps are "…".
