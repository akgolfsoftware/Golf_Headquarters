# LiveStatus

Live-økt-indikator + økt-timer. LIVE = pulserende rød prikk + løpende tid; pause/ferdig med eget ord + farge. Pulsen respekterer `prefers-reduced-motion`.

## Bruk
```jsx
<LiveStatus status="live" tid="42:18" deltakere={4} />
```

## Domenefasit
Timeren telles av kalleren (persistér i localStorage ved behov). Status via ord + farge (aldri bare farge). Tid i mono, tabulær.
