# LoadChart

ACWR-style belastningskart: a glowing lime area + line over labelled risk bands
(trygg/følg/over) instead of a legend. The system's signature data-viz moment —
match this to the reference benchmark screenshots.

## Bruk
```jsx
<LoadChart
  series={[{label:"U18",value:0.9},{label:"U19",value:1.05},{label:"U20",value:1.22}]}
  zones={[
    {from:0, to:1.3, color:"var(--signal)"},
    {from:1.3, to:1.5, color:"var(--warning)", label:"1,3–1,5 følg"},
    {from:1.5, to:1.8, color:"var(--error-solid)", label:"> 1,5 risiko"},
  ]}
  min={0.6} max={1.8}
  fmt={(v) => v.toFixed(2).replace(".", ",")}
/>
```
- Bands are drawn as tinted rows with an inline label at the right edge — never a
  separate legend row.
- Hover/drag scrubs a tooltip along the line; the last point pulses gently to draw
  the eye to "now".
- Only ACWR uses this exact band set canonically — for other bounded metrics reuse
  the component but pass your own `zones`.
