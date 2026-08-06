# CompareChart

Parvise søyler. A = spilleren (blekk). B = sammenligningen.

```jsx
<CompareChart seriesA="Øyvind nå" seriesB="Kategori B-krav" dataOdId="kat-krav"
  pairs={[
    { label: "Driver", a: 231, b: 240, aDisplay: "231 m", bDisplay: "240 m" },
    { label: "J7", a: 168, b: 165, aDisplay: "168 m", bDisplay: "165 m" },
    { label: "Wedge 60", a: 58, b: 60, aDisplay: "58 m", bDisplay: "60 m" },
  ]} />
```

- Grensen mot `BarChart`: én serie = BarChart. Grensen mot `DataTable`: tre
  eller flere serier leses ikke som søylepar — da er det tabell.
- Serie A er ALLTID spilleren/nå-situasjonen og alltid blekk. Bytt aldri om —
  øyet lærer at mørkest = meg, på tvers av alle skjermer.
- `info`-modifikatoren gjør B analyse-blå — kun når B er en MÅLING (forrige
   sesong). En referanse/krav forblir --mid.
- Verdiparene står over kolonnene («231 m · 240 m») og ryker under 380 px —
  sammendraget ligger i aria-label.
- Ingen «vinner»-farging: at A > B er synlig i høyden; komponenten dømmer
  ikke hva som er bra (kortere kan være målet i dispersion).
