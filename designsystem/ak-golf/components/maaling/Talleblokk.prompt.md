Talleblokk er merkets signatur: ett målt tall som står alene, med dato og kilde. Bruk den på plakat, i presentasjon, i foreldrerapport og i sosiale innlegg.

```jsx
<Talleblokk
  etikett="Carry, driver"
  tall="+12,4" enhet="m" storrelse="xl" fremhevet
  forklaring="Vi endret ikke svingen først. Vi målte i seks økter og fant at Attack Angle var problemet."
  kilde="Trackman" dato="12.05–18.08.2026" antall={38} />
```

- Har du ikke kilde og dato, har du ikke et tall du kan vise. Sett `estimat` hvis det ikke er målt.
- `fremhevet` gir signalrødt tall — ett per flate, aldri fem.
- Målestokken under tallet er det som bærer kilden. Slå den av (`maalestokk={false}`) bare når flaten allerede har et annet instrumentelement.
