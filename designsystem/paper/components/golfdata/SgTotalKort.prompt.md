# SgTotalKort

SG-totalen. Fortegn, komma-desimal, alltid med grunnlag.

```jsx
<SgTotalKort value={2.92} delta={0.4} deltaBasis="vs forrige 5 runder"
  basis="siste 5 runder · mot kategori B" dataOdId="oyvind-sg" />
```

- Grensen mot `SgBreakdown` (golfviz): totalen her, kategoriene der — de to
  står ofte i samme panel, og da er dette kortet øverst.
- Grensen mot `KpiCard`: KpiCard er generisk; SgTotalKort eier SG-reglene
  (fortegn ALLTID, komma-desimal, tone på selve tallet: + oliven, − leire).
- `basis` er ikke valgfri i praksis: et SG-tall uten vindu og referanse er
  udefinert — CONTENT FUNDAMENTALS krever tidsvindu synlig.
- Chromeless: kortet tegner ingen ramme. Flaten eies av `Panel` — K2
  (kort-chrome: komponent eller konsument) er en åpen eierbeslutning, og
  inntil den tas er alle golfdata-kort innholdslag.
