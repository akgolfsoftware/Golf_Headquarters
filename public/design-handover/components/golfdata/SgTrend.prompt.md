# SgTrend

SG over tid mot nullbaseline, med hendelsesmarkører (tester, periodeskifter) som forklarer hopp i kurven. Siste punkt uthevet i --up/--down.

## Bruk
```jsx
<SgTrend baseline="Broadie scratch"
  punkter={[{sg:-0.4},{sg:-0.1},{sg:0.2},{sg:0.1},{sg:0.6},{sg:0.9}]}
  hendelser={[{idx:2, type:"test", navn:"PEI-test"},{idx:4, type:"periode", navn:"Spesialisering"}]} />
```

## Domenefasit
SG i slag mot navngitt baseline; nullbaseline stiplet. Egen tidsserie-viz (ikke BarChart). Farge på siste punkt = fortegn (--up/--down), aldri lime. Tomt (<2 punkter) = onboarding.
