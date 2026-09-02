Spredning viser hvor slagene landet, sett ovenfra, med ellipse på ett standardavvik regnet fra de faktiske slagene. Bruk den i foreldrerapport, presentasjon og analyseflater UTENFOR produktet.

```jsx
<Spredning etikett="Dispersion, 7-jern"
  punkter={[{side:-2.1,lengde:131.4},{side:3.4,lengde:128.9} /* … */]}
  maal={{side:0,lengde:132}}
  forklaring="Fjorten av tjueto slag innenfor ellipsen. Spredningen er halvert siden april."
  kilde="Trackman" dato="18.08.2026" />
```

- Uten `kilde` og `dato` rendres ikke diagrammet. Det er med vilje.
- Antallet innenfor ellipsen telles — skriv aldri «68 %» eller «de fleste».
- Aksene har tall og enhet fordi dette ER data. Bruk `Instrumentflate` for tekstur, ikke denne.
- Ett signalrødt element: snittkrysset og ellipsen. Målet står i fagfargen.
