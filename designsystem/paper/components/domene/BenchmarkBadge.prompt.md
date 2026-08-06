# BenchmarkBadge

Verdi mot referanse. Basis står I badgen — aldri delta uten grunnlag.

```jsx
<BenchmarkBadge value="+0,4" basis="vs kat B · siste 5" tone="up" dataOdId="sg-benk" />
<BenchmarkBadge value="−4 m" basis="vs krav" tone="dn" />
```

- Basis er obligatorisk: «+0,4» alene er støy; «+0,4 vs kat B · siste 5»
  er informasjon. CONTENT FUNDAMENTALS-regelen om deltaer, håndhevet i
  komponentform.
- Toner: `up`/`dn` for retning (dn er leire, aldri rød), `info` for
  nøytrale målinger. Dette er DATA — derfor lov, i motsetning til
  vokabular-badgene.
- Grensen mot `StatusBadge`: status og tags bor der. Grensen mot
  `BenchmarkBadge` i golfviz finnes ikke — denne er den ene.
- Ekte minustegn (−), aldri bindestrek.
