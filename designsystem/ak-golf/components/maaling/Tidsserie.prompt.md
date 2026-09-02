Tidsserie viser én måling økt for økt. Bruk den der spilleren skal se seg selv over tid — aldri mot andre.

```jsx
<Tidsserie etikett="Dispersion, 7-jern" enhet="m" kilde="Trackman" maal={6}
  punkter={[{dato:'12.05',verdi:14.2},{dato:'02.06',verdi:11.8},{dato:'23.06',verdi:9.4},{dato:'14.07',verdi:8.1},{dato:'04.08',verdi:7.3},{dato:'18.08',verdi:6.8}]}
  forklaring="Seks økter. Ingenting av dette er magi." />
```

- Punktene er det som ble målt. Ingen glatting, ingen trendlinje, ingen prognose.
- Siste verdi er det ene signalrøde elementet. Målet står i fagfargen.
- Uten `kilde` rendres ikke diagrammet.
