Ikon tegner ett av de 24 ikonene i merkets sett. Bruk den i knapper, lister og kildelinjer — aldri som illustrasjon.

```jsx
<Knapp variant="sekundær"><Ikon navn="last-ned" storrelse={18} /> Last ned rapporten</Knapp>
<Ikon navn="advarsel" merkelapp="Advarsel" />
```

- Står ikonet uten tekst, sett `merkelapp`. Ellers leses det ikke av skjermleser, og det er riktig.
- Størrelse følger typeskalaen: 16, 18, 20 eller 22. 8 px luft til teksten.
- Ikonet arver farge fra teksten (`currentColor`). Signalrødt ikon = «se her», samme regel som for alt annet rødt.
- Mangler et ikon: hent fra Lucide, sett `stroke-linecap="square"` og `stroke-linejoin="miter"`, legg det til i `Ikon.jsx` OG `assets/ikon/`. Aldri tegn et eget.
