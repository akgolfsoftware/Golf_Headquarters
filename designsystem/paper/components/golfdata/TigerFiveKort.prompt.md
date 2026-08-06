# TigerFiveKort

De fem dyre feilene. Mål: 0. Navnene er låst i komponenten.

```jsx
<TigerFiveKort counts={[1, 0, 2, 1, 0]} basis="siste 5 runder" dataOdId="oyvind-t5" />
```

- Metrikk-navnene bor i komponenten og endres aldri per skjerm — Tiger Five
  er et rammeverk fra strategibiblioteket, ikke en redigerbar sjekkliste.
  Konsumenten sender fem tall i fast rekkefølge.
- 0 = oliven prikk (målet), >0 = leire prikk. Tallet selv er alltid --fg —
  tonen bor i prikken, samme regel som Tidslinje.
- Summen står under hårlinjen med «mål 0» synlig — målet er del av
  innholdet, ikke noe brukeren skal huske.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
