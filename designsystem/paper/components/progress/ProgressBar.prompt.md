ProgressBar er andelen av noe: økter gjort av planlagte, serier fullført, budsjett brukt.

```jsx
<ProgressBar label="Økter denne uken" value={4} max={5} valueText="4 av 5" />
<ProgressBar label="Volum uke 34" value={6} max={5} tone="warn" valueText="6 av 5 · over maks" />
```

- `valueText` fremfor rå prosent når tallene betyr noe for brukeren. «4 av 5» er mer nyttig enn «80 %».
- `tone="warn"` bare når verdien faktisk er et problem (over maks, under krav) — ikke som dekor. Fyllet er blekk som standard, fordi fremdrift ikke er en verdivurdering.
- Sporet har `role="progressbar"` med `aria-valuenow/min/max`; `valueText` speiles til `aria-valuetext` så skjermleseren leser «4 av 5», ikke «80».
- Overfylling klippes visuelt (maks 100 %), men `aria-valuenow` beholder den ekte verdien — 6 av 5 skal leses som 6.
- Ingen animert stripe, ingen glød. Overgangen er `--dur`/`--ease` på bredden.
