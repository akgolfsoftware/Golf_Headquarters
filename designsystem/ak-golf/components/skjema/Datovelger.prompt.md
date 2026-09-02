Datovelger viser én måned og lar brukeren velge en dag. Alltid inline — aldri i en popover.

```jsx
<Datovelger merkelapp="Velg dag for kartleggingsøkt" verdi={dato} onEndre={setDato}
  min="2026-09-03" markerte={['2026-09-08', '2026-09-10', '2026-09-15']} />
```

- Datoer går inn og ut som ISO-strenger (`YYYY-MM-DD`), aldri som Date-objekter — de sklir med tidssone.
- Prikken under en dag betyr «her er det noe» (ledig time, økt) og er signalrød fordi den er en handling.
- Dager utenfor `min`/`max` vises svake og kan ikke velges. Ikke skjul dem — leseren trenger å se at måneden er hel.
