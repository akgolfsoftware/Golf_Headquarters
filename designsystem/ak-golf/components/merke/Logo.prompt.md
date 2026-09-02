Logo rendrer merket fra SVG-fil. Bruk den overalt der merket skal stå — den finnes for at ingen skal bygge logoen i markup.

```jsx
<Logo hoyde={40} />                             {/* grunn og ark */}
<Logo variant="hvit-mork" hoyde={32} />         {/* foto og mørk flate */}
<Logo variant="kvadrat" hoyde={96} />           {/* profilbilde */}
```

- Minstemål 24 px på skjerm, 12 mm i trykk. `hoyde` klemmes til 24.
- `klaring` legger inn klaringssonen (halve logohøyden) som padding.
- `ak-golf-logo-white-on-green.svg` er historisk og ligger ikke i denne pakken.
