# OektKort

Økta som dokument. SessionCard er økta som TID.

```jsx
<OektKort title="Teknikk tee — P5 til P7" timeLabel="tir 9. aug · 09:00–10:30"
  focus="Du holder P6-vinduet når tempoet er rolig — økta handler om å beholde det med ball."
  drills={["Speilsjekk P5–P7 uten ball · 10 min", "Halv fart med ball · 20 min", "Full fart med konsekvens · 15 min"]}
  status="planlagt" statusLabel="Planlagt"
  footer={<AKFormelChip parts={["TEK", "TEE", "60 min"]} />}
  onClick={aapne} dataOdId="okt-tir" />
```

- Grensen mot `SessionCard` (calendar): samme økt, to projeksjoner —
  SessionCard på lerretet (når), OektKort i tråden/planen (hva). Bygg aldri
  tidsgrid av OektKort eller innholdslister av SessionCard.
- Fokus er Lora i du-form; øvelsene er mono med varighet.
- `footer` tar bibliotekets chips (AKFormelChip, FleksMerke, StatusBadge) —
  kortet tegner aldri egne merker.
- Ett treffmål: hele kortet åpner editoren/gjennomføringen.
- Terskel 340 px: øvelseslisten ryker — tittel, fokus og status står.
