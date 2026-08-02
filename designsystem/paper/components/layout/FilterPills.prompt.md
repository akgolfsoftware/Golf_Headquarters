FilterPills snevrer inn et sett som allerede vises — flervalg, med antall og en nullstiller.

```jsx
const [område, setOmråde] = React.useState(["tek", "slag"]);
<FilterPills label="Pyramideområde" value={område} onChange={setOmråde} dataOdId="cta-filter-omraade"
  options={[
    { value: "fys", label: "FYS", count: 4 },
    { value: "tek", label: "TEK", count: 11 },
    { value: "slag", label: "SLAG", count: 7 }
  ]} />
```

- **Grensen mot `Tabs`:** faner bytter *hva* du ser, filtre bestemmer *hvor mye av det samme* du ser. Bytter klikket innholdstype, er det faner.
- **Grensen mot `SegmentControl`:** segmentet er eksklusivt valg av én verdi og har `--soft`-spor. Piller er flervalg og har ingen spor. `multiple={false}` finnes for de få tilfellene der pilleformen allerede er etablert på skjermen — er du i tvil, er `SegmentControl` riktig.
- **Grensen mot `Chip`:** en Chip beskriver et objekt («kat. C», «utsatt»). En pille styrer et sett. Samme form, ulik jobb.
- **Antallet er en del av valget**, ikke pynt: uten det må brukeren klikke for å finne ut at filteret gir null treff.

## Bindende: nullstill finnes bare når det er noe å nullstille

En alltid synlig, alltid inaktiv nullstiller er støy i rekken og gjør det vanskeligere å se at ingenting er valgt. Den dukker opp med antallet i parentes så snart første pille slås på, og forsvinner igjen når settet er tomt. Den er også bevisst en understreket tekstknapp, ikke en femte pille: den velger ikke noe, den opphever.

## Farge

Valgt pille er **blekkfylt** (`--cta`/`--on-cta`) — systemstandarden for fylte flater. Aldri oransje: oransjen har monopol på «En ting nå» og fokusringen. Hover på valgt pille bruker `color-mix(in srgb, var(--cta) 88%, var(--bg))`, samme formel som resten av biblioteket.

## Container-terskel

`@container (max-width: 420px)` strammer mellomrommet fra 8 til 6 px. Tallet er regnet mot containeren, ikke vinduet. Er settet så langt at det bryter over tre linjer i PlayerHQ-kolonnen, bruk `scroll` — en rullende rekke leses som «det finnes flere», tre brutte linjer leses som rot.
