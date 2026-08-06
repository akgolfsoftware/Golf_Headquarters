# PyramideFasett

Fem fasetter, pyramidens rekkefølge. Fordeling på tvers + valgfritt filter.

```jsx
<PyramideFasett selected="TEK" onSelect={filtrer} dataOdId="uke-fordeling"
  items={[
    { area: "FYS", value: 1.5, display: "1,5 t" },
    { area: "TEK", value: 2.5, display: "2,5 t" },
    { area: "SLAG", value: 1.5, display: "1,5 t" },
    { area: "SPILL", value: 1, display: "1,0 t" },
  ]} />
```

- Rekkefølgen er PYRAMIDEN og kan ikke overstyres: FYS først (fundamentet),
  TURN sist (toppen). Mangler et område i items, rendres det med 0 — hull i
  raden ville brutt lesemønsteret.
- Grensen mot `PyramidProgress` (golfviz): den viser NIVÅ oppover i én
  pyramide; fasetten viser FORDELING på tvers. Grensen mot `BudgetBar`:
  budsjettlinjen eier invariantene (TEK-andel, aldersregel); fasetten viser
  og filtrerer, uten regler.
- Fargene er SessionCards pyramidemapping — samme område, samme farge,
  i kort, kalender og fasett.
- Med `onSelect` er fasettene knapper med `aria-pressed` (filter-semantikk);
  uten rendres div-er og hele raden får `role="img"` med sammendrag.
- Terskel 420 px: verditallet ryker, området og fyllbaren står.
