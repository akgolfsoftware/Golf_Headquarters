Pakker én kontroll med etikett, og med hjelpetekst eller feilmelding — og kobler dem sammen selv.

```jsx
<FormField label="Handicap" hint="Oppdateres automatisk etter hver tellende runde." dataOdId="felt-hcp">
  <input className="akhq-input" defaultValue="4,2" />
</FormField>

<FormField label="Spillernavn" required error="Navnet må stemme med turneringspåmeldingen." dataOdId="felt-navn">
  <input className="akhq-input" defaultValue="Øyvind Rohjan" />
</FormField>
```

- Grensen mot `Input`: `Input` er en kontroll **med** innebygd anatomi. `FormField` er anatomien **uten**
  kontroll. Skal feltet inneholde noe annet enn et tekstfelt — en `SegmentControl`, en gruppe
  radioknapper, en datovelger, en filopplaster — er `FormField` det riktige. Bruk ikke begge utenpå
  hverandre: da får du to etiketter og to hjelpetekster.
- Send **ett** barn. Komponenten kloner det for å sette `id` og aria-koblingen. Flere barn, eller en
  ren tekststreng, får ingen kobling — og et felt uten kobling er usynlig for skjermleser mens det
  ser riktig ut.
- `hint` og `error` vises aldri samtidig. `error` vinner. Det er ikke en tilfeldighet i koden:
  to meldinger under samme felt gjør det uklart hvilken som er handlingen.
- Feilfargen er `--dn`, aldri rød. Målt: `rgb(168, 85, 54)`.
- Ingen container-terskel og ingen wrapper. FormField legger ikke om på egen bredde — den arver den.
  Kontrollen inni kan ha terskler; det er kontrollens sak.
- Tomtekst hører ikke hjemme her. Et felt uten verdi er et tomt felt, ikke en tom tilstand —
  `EmptyState` dekker «ingen data ennå», og et skjema har alltid data å samle inn.

## Bindende beslutninger

**Treffmålet eies av kontrollen, ikke av feltet.** FormField deklarerer ingen `--floor` og ingen høyde.
Gulvet på 44 px bor i kontrollen (`Input`, `SegmentControl`, …). Ble det deklarert begge steder, ville
det bo to steder — og et gulv som bor to steder er et gulv ingen kan stole på.

**FormField eier feltanatomien eksklusivt.** Avgjort 29.07.2026. `Input` er **pensjonert** — den
migreres ikke til å konsumere FormField, den opphører og er splittet i `TextInput` (naken kontroll)
+ komposisjon. `.akhq-field` og `.akhq-label` dør med den.

Grunnen er koblingen: FormField kloner sitt ene barn for å sette `id` og aria. Rendret en kontroll
FormField *internt*, ville koblingen skjedd inne i en komponent konsumenten ikke når — og
`aria-describedby` mot en ekstern feiloppsummering blir umulig. Workbench-årsplanen trenger nettopp
det mønsteret.

**`labelHidden` er mekanismen for etikettløse felt.** `SearchField` er ikke et unntak fra anatomien;
den er et felt med skjult etikett. Visuelt borte, fortsatt annonsert. Trenger en ny komponent samme
oppførsel, bruker den denne proppen — den lager ikke sin egen variant.

**Meldingene eies av `FieldMessage`.** FormField rendrer den fra `hint`/`error`, så feilen under et
felt og en frittstående feiloppsummering ser identiske ut.
