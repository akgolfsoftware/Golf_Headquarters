Delta-indikator; bruk ved siden av tall — HeroTall, KpiTile, tabellceller, SG-splitt.

```jsx
<DeltaIndikator verdi="+0,4" srLabel="siste 4 runder" />
<DeltaIndikator verdi="−1,2" size="md" />
<DeltaIndikator verdi="−0,08" invertert />  {/* ACWR: ned er bra → lime */}
<DeltaIndikator verdi="0" retning="flat" />
```

- Retning utledes av fortegn (− → ned); overstyr med **retning**; `0` → flat.
- **invertert** snur fargelogikken for metrikker der lavere er bedre (ACWR, spredning).
- Redundant koding: pil + fortegn + farge — aldri farge alene (WIG).
- **srLabel** gir skjermleser kontekst uten visuell støy.
