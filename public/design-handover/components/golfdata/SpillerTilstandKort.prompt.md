# SpillerTilstandKort

Coach-cockpitens 5-sekunderssvar på «hvordan står det til med denne spilleren»: navn → form → SG-trend → siste aktivitet → ett flagg. Én rad, skannbar i en liste.

## Bruk
```jsx
<SpillerTilstandKort navn="Sofie Lindqvist" tilstand="risiko" sgTrend="+0,6"
  sisteAktivitet="3t siden" flagg="ACWR 1,46" onClick={aapneProfil} />
```

## Domenefasit
Form via `tilstand` (god/stabil/varsel/risiko) — farge er aldri eneste bærer (form-ord + prikk + trend-pil gir samme info). SG-trend via `DeltaIndikator` (--up/--down). Ett flagg, ikke fem — det viktigste. Coach-komponent (fagkoder tillatt). `onClick` → knapp m/ hover/focus (WCAG). `loading` = Skeleton.
