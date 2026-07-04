# PPositionRail

Horizontal chain of P-positions (P0…P10) or any ordered position sequence —
ferdig (filled lime + check) · aktiv (lime ring, gentle pulse) · planlagt
(neutral outline). The connecting line fills to the last completed stop.

## Bruk
```jsx
<PPositionRail
  positions={[
    {id:"P1", label:"Setup", status:"ferdig"},
    {id:"P4", label:"Topp", status:"ferdig"},
    {id:"P7", label:"Impact", status:"aktiv"},
    {id:"P10", label:"Slutt", status:"planlagt"},
  ]}
  selectedId="P7"
  onSelect={(id) => setSelected(id)}
/>
```
- Only one stop should be `"aktiv"` at a time — it's the pulsing "in progress" cue.
- Labels stay short (one word) — this is a rail, not a stepper form.
