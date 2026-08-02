Knapp: primær er blekk/papir, ghost er sekundær med border. Ingen fylt aksentvariant — oransje-monopolet ligger i OneThingNow-seksjonen, ikke i knapper.

```jsx
<Button dataOdId="cta-save">Lagre økt</Button>
<Button variant="ghost" size="sm">Avbryt</Button>
```

- Systemstandard hover/active på fylte flater: `color-mix(in srgb, var(--cta) 88%, var(--bg))` / 76 %.
- Radius `--r-sm` (målt mot referanse-dashboardet); `--r-pill` er for chips/tags/dag-velgere.
- `data-state="hover|active|focus|disabled"` KUN for spesimenkort.
