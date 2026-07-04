Mono-caps status / category pill (and the small CountBadge); use for state (AKTIV, FERDIG), player level (A–K), live indicators and counters.

```jsx
<Tag variant="live">Live</Tag>
<Tag variant="signal">Aktiv</Tag>
<Tag variant="up" dot>+2,8 SG</Tag>
<Tag variant="neutral">Kategori A</Tag>
<Tag variant="outline">Drop-in</Tag>
<CountBadge count={3} tone="signal" />
```

- **Tag variant**: `neutral` · `outline` · `signal` (lime) · `up` (lime tint) · `down` (coral tint) · `live` (pulsing dot).
- **dot** adds a leading status dot; `live` always pulses.
- **CountBadge** tone: `neutral` | `signal`. Keep all tag text UPPERCASE and short.
