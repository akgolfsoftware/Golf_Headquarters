StickyActionBar er den faste bunnraden: papirflate, 1px topplinje, og en kort gradient over kanten så innhold som ruller under ikke ser avkuttet ut.

```jsx
<StickyActionBar note="Utkast lagret 08:42">
  <Button variant="ghost" dataOdId="cta-forhandsvis">Forhåndsvis</Button>
  <Button dataOdId="cta-publiser">Publiser plan</Button>
</StickyActionBar>
```

- **`position: sticky`, ikke `fixed`.** Sticky følger innholdsstrømmen, så raden ikke legger seg over PlayerHQs TabBar eller et modalt lag. `fixed` krever at hver skjerm husker å legge inn bunnpolstring; sticky gjør ikke det.
- **Maks to knapper, én primær.** Komponenten advarer i konsollen ved tre. En fast bunnrad er for det brukeren skal gjøre *nå* — flere handlinger hører i PageHeader eller en DropdownMenu.
- `note` er statusen som gjør knappen forståelig: hva som blokkerer, hva som er lagret. Ikke en forklaring på hva knappen gjør.
- Bunnpolstringen inkluderer `env(safe-area-inset-bottom)` for iPhone med hjemmeindikator.
- Er handlingen destruktiv, bekreftes den i en ConfirmDialog. Raden bekrefter ingenting selv.
- Blokkerer noe publisering, hører forklaringen i en `Banner` med `announce="alert"` over innholdet — ikke i `note`, som er for kort til å bære en begrunnelse.
