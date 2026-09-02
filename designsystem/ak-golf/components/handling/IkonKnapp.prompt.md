IkonKnapp er en kvadratisk trykkflate for ett Lucide-ikon — meny, lukk, forrige, neste.

```jsx
<IkonKnapp merkelapp="Lukk" onClick={lukk}>
  <svg width="20" height="20" ...>{/* lucide x */}</svg>
</IkonKnapp>
```

- `merkelapp` er påkrevd og blir `aria-label`.
- Standard 44 × 44 px. Gå aldri under det på mobil.
- Ikoner er Lucide. Aldri emoji, aldri unicode-piler som ikon.
