# Scorekort

18 hull, brutto slag, golfens merker. Ren visning.

```jsx
<Scorekort courseLabel="GFGK · 3. august" dataOdId="runde-0803"
  holes={[{ par: 4, score: 4 }, { par: 5, score: 4 }, { par: 3, score: 5 }, /* …18 */]} />
```

- BRUTTO alltid — golfdataregelen: aldri netto, og klasser som ender på «N»
  finnes ikke i denne appen. Totalen merkes «brutto» i kortet.
- Merkene er golfens konvensjon: sirkel = birdie, dobbel sirkel = eagle,
  firkant = bogey, dobbel firkant = dobbelt+ — i --up/--dn TONER på rammen;
  tallet er alltid --fg. Aldri rød, aldri fylt flate.
- Ren visning: hull-for-hull-føring bor i FangstSheet (UNDER-fasen);
  scorekortet er ETTER-fasens dokument.
- Grensen mot `HoleStrip` (golfviz): SG per hull bor der; dette er slagene.
- Terskel 560 px: cellene krymper (22→18 px merkebokser) — alle 18 hull skal
  alltid være synlige uten horisontal scroll i PlayerHQ-kolonnen.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
