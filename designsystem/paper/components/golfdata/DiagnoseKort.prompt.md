# DiagnoseKort

Lesningen av et mønster. Prosa i du-form, evidens i mono.

```jsx
<DiagnoseKort dataOdId="driver-diagnose"
  title="Utslagene lekker når presset øker"
  body="Driveren har vært stabil i tre uker på range, men i turnering faller fairway-treffene fra 61 til 44 prosent. Mønsteret peker på tempo, ikke teknikk."
  evidence={["Fairway-% trening 61 · turnering 44", "SG tee −1,84 · siste 3 turneringsrunder"]}
  nextStep="Turneringslik trening: utslagsserier med konsekvens, opp press-stigen (ALENE → TURNERING)." />
```

- Grensen mot `NesteFokusKort`: diagnosen FORKLARER (hva skjer og hvorfor);
  fokus-kortet ANBEFALER (hva trenes de neste ukene). De står ofte sammen —
  diagnose først.
- Prosaen er Lora i du-form til spilleren — coach-tonen fra CONTENT
  FUNDAMENTALS. Evidensen er mono med tall og vindu.
- Fra en agent? Konsumenten SKAL sette `ProvenanceDisclosure` ved kortet —
  et forslag uten proveniens er ikke ferdig designet (queue-regelen).
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
