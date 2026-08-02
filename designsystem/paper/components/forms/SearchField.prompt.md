Søkefelt. `FormField` med skjult etikett og en `TextInput` av type search — ingen egen anatomi.

```jsx
<SearchField placeholder="Søk etter spiller, økt eller drill" dataOdId="felt-sok" />
```

- Etiketten er **visuelt skjult, ikke fjernet**. Uten den kan skjermleseren bare kalle feltet
  «tekstfelt». Standardnavnet er «Søk» — gi et mer presist navn når feltet søker i noe bestemt
  («Søk i drillbiblioteket»).
- Grensen mot `FilterBar`: den smalner en liste på fasetter som allerede finnes. Denne søker i
  innhold på fritekst. Grensen mot `CommandPalette` (køført): den utfører handlinger, ikke søk.
- Ikke pakk den i en `FormField` — den er allerede en.

## Bindende beslutninger

**`labelHidden` er mekanismen, ikke en andre anatomi.** Et søkefelt er ikke et unntak fra
feltanatomien; det er et felt der etiketten er skjult. Trenger en annen komponent samme oppførsel,
bruker den samme prop — den lager ikke sin egen variant.
