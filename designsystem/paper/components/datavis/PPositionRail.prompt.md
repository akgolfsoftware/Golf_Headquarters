# PPositionRail

P1.0–P10.0. MORAD-posisjonssystemet som skinne. Ingen generisk erstatning.

```jsx
<PPositionRail value={6.5} window={{ from: 5, to: 7 }} onSelect={velgPosisjon}
  note="fokus: venstre arm gjennom P6" dataOdId="okt-pfokus" />
```

- P-posisjonene er en LUKKET skala: P1.0 (oppstilling) til P10.0 (finish),
  ti stopp, halvposisjoner plasseres proporsjonalt mellom dem. Skalaen
  utvides aldri og omdøpes aldri — den er Mac O'Gradys system, brukt presist.
- Fokusvinduet (øktas P-område) er analyse-blå tint — ALDRI oransje. Oransje
  tilhører OneThingNow og fokusringen; et P-vindu er faglig presisering,
  ikke skjermens ene handling.
- Markøren (gjeldende posisjon) er blekk med papir-ring — synlig på både lys
  og mørk flate uten egne modusregler.
- Med `onSelect` er stoppene knapper med 44 px usynlig treffsone (::after,
  gulvregel §2) — den synlige prikken er 8 px fordi skinnen er tett.
  Uten `onSelect` rendres rene spans — ingen døde knapper i lesevisning.
- Terskel 360 px: etikettene går 9→8 px — alle ti P-er skal alltid synes;
  å skjule annenhver ville brutt systemets lesemåte.
