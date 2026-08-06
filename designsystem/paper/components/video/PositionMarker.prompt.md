# PositionMarker

Ett P-punkt på en tidslinje eller et bilde.

```jsx
<div style={{ position: "relative" }}>
  <PositionMarker label="P6" pct={52} active onSelect={() => hoppTil(250)} />
</div>
```

- Forelderen MÅ ha `position: relative` — markøren plasseres med
  prosentvis left og sentrerer seg selv.
- Grensen mot `PPositionRail` (datavis): skinnen viser HELE skalaen med
  vindu og målt posisjon; markøren er ett punkt der konsumenten sier.
- Fargeløs (P-vokabular): aktiv skilles på blekkfyll, aldri farge.
- Med `onSelect`: knapp med 44 px usynlig ::after-sone (gulvregel §2) —
  den synlige pillen forblir 16 px fordi markørfeltet er tett. Uten:
  ren span.
