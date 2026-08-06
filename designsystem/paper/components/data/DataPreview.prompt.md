# DataPreview

Kjenn igjen dataene før du tar dem inn. Fem rader, aldri mer.

```jsx
<DataPreview dataOdId="golfbox-import"
  columns={["Dato", "Turnering", "Bane", "Brutto"]}
  rows={[
    ["12.07.2026", "Srixon Tour #3", "Losby", "74"],
    ["05.07.2026", "Klubbmesterskap", "GFGK", "71"],
  ]}
  moreCount={38} />
```

- Fem rader er taket, håndhevet i koden: forhåndsvisningen skal svare på
  «er dette riktig fil/kilde?» — ikke være tabellen. Grensen mot
  `DataTable`: hele settet, sortering og tilstander bor der, ETTER import.
- Rullingen bor i komponentens egen container (DataTable-regelen) — aldri
  horisontal scroll på siden.
- Verdiene sendes ferdig formatert (komma-desimal, enheter) — previewen
  formaterer ikke.
- Ren visning: importer/avbryt-knappene eier konsumenten.
