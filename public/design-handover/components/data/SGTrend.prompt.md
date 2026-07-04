# SGTrend

Fler-akse SG-linjegraf med benchmark-bånd og runde-velger.

## Bruk
```jsx
<SGTrend
  benchmark={0}
  rounds={[
    { label: "R1", ott: 0.4, app: -0.2, arg: 0.1, putt: 0.3 },
    { label: "R2", ott: 0.6, app: 0.1,  arg: -0.1, putt: 0.5 },
    { label: "R3", ott: 0.8, app: 0.3,  arg: 0.2,  putt: 0.7 },
  ]}
  height={200}
/>
```

Klikk legend-knapper for å skjule/vise akser. Klikk runde-knapper for å fremheve én runde.
