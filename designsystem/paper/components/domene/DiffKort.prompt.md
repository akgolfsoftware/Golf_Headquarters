# DiffKort

Hva forslaget faktisk endrer. Ingen godkjenner blindt.

```jsx
<DiffKort title="Plan-vaktens forslag" dataOdId="forslag-diff" rows={[
  { field: "Tirsdag 09:00", from: "TEK · 60 min", to: "SLAG · 60 min" },
  { field: "Ukevolum", from: "6,5 t", to: "6,0 t" },
  { field: "Lørdag 10:00", to: "SPILL · 9 hull på GFGK" },
]} />
```

- Underlaget for godkjenninger: et PlanAction-forslag uten diff er ikke
  ferdig designet — samme regel som proveniens (queue-familien).
- Fra-verdi gjennomstreket `--mid`, til-verdi halvfet blekk. NYE felter
  merkes «NY» i analyse-blå — aldri grønn: nytt er ikke «bra», det er nytt.
- Ren visning: godkjenn/avvis-knappene bor i konsumenten (QueueCard,
  godkjenningsflaten). Fra agent? ProvenanceDisclosure ved siden av.
- Terskel 360 px: feltnavnet legger seg over verdiene (kolonne-stabling).
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
