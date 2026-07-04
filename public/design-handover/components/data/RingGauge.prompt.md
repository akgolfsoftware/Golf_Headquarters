# RingGauge

Circular gauge for one bounded metric — plan-kvalitet (0–100), ACWR, adherence %.
The arc sweeps in and the center number counts up together on mount.

## Bruk
```jsx
<RingGauge value={86} label="Plan-kvalitet" size={120} />

<RingGauge value={1.22} min={0.5} max={1.8} decimals={2} unit="" label="ACWR"
  zones={[
    {from:0.5, to:1.3, color:"var(--signal)"},
    {from:1.3, to:1.5, color:"var(--warning)"},
    {from:1.5, to:1.8, color:"var(--error-solid)"},
  ]}
/>
```
- `zones` paints the track by threshold so the ring itself reads trygg/varsel/over —
  the active arc takes the color of the zone the current value falls in and glows
  softly once it's off the safe zone.
- Without `zones`, it's a plain single-color progress ring (defaults to `--signal`).
- Keep `unit` short (`%`, `t`, or `""`) — it renders small, baseline-aligned next to
  the number.
