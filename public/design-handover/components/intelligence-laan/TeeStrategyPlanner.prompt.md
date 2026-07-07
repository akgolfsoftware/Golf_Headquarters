Tee-strategiplanlegger fra «SG Tee App Predict»-arket. Per hull: banelengde + planlagt slaglengde fra tee for to strategier → rest, predikert score (SG fairway(rest) + 1; slaglengde 0 = par 3 uten tee-slag), baseline (SG tee(banelengde)) og SG +/-. Totaler sammenligner strategiene.

```jsx
<TeeStrategyPlanner values={{ 0: { lengde: '300', alt1: '250', alt2: '210' } }} onChange={setVals} />
<TeeStrategyPlanner holes={9} strategyLabels={['Driver', '3-tre']} />
```

Ukontrollert som default. Bruker de ekte SG-tabellene fra `scorecards/sg-reference.js`. Grønn/rød SG-badge per hull viser om strategien slår baseline.
