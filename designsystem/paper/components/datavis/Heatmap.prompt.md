# Heatmap

Mønster i en matrise. Fem diskrete trinn, aldri kontinuerlig skala.

```jsx
<Heatmap dataOdId="volum-host" colLabels={["u27", "u28", "u29", "u30", "u31", "u32"]}
  rows={[
    { label: "FYS", cells: [{ v: 2, label: "2 økter" }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 1 }, { v: 2 }] },
    { label: "TEK", cells: [{ v: 3, label: "4,5 t" }, { v: 4 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 3 }] },
  ]} />
```

- Grensen mot `DataTable`: skal verdiene LESES, er det tabell. Varmekartet
  viser hvor det er tett og tomt — mønsteret, ikke tallene.
- Fem trinn (0–4) er en beslutning, ikke en begrensning: fem kan benevnes
  («tomt/lite/noe/mye/mest»); en gradient kan ikke. Konsumenten kvantiserer
  til 0–4 før rendering — komponenten normaliserer ikke.
- Trinnene er --info-raw blandet mot --surface (18/40/65/100 %) — analyse er
  blå, aldri grønn/rød moral, aldri oransje.
- Cellene bærer ingen tekst; radens aria-label og `title` per celle bærer
  verdiene. Container-terskel 420 px: celler 22→16 px, radetiketter 64→44 px.
