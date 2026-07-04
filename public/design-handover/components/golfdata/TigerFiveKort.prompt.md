# TigerFiveKort

De fem kjernemetrikkene («Tiger Five») med status og trend — kompakt tilstandsavlesning i én liste.

## Bruk
```jsx
<TigerFiveKort metrikker={[
  { navn: "SG Total",        verdi: "+1,2", enhet: "slag", status: "god",    trend: "+0,4" },
  { navn: "Fairways truffet", verdi: 71,     enhet: "%",    status: "god",    trend: "+3" },
  { navn: "GIR",             verdi: 62,     enhet: "%",    status: "varsel", trend: "−2" },
  { navn: "Scrambling",      verdi: 48,     enhet: "%",    status: "varsel", trend: "+1" },
  { navn: "Putts/runde",     verdi: 30.1,   enhet: "",     status: "risiko", trend: "+0,6", invertert: true },
]} />
```

## Domenefasit
Status via prikk + farge (aldri eneste bærer). Trend via `DeltaIndikator` — `invertert` der lavere er bedre (putts/runde). Tomt = onboarding.
