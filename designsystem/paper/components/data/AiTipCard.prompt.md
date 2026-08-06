# AiTipCard

Lavterskel-AI: observasjon, ikke forpliktelse.

```jsx
<AiTipCard source="Caddie-tips" dataOdId="idag-tips"
  tip="Wedge-serien din har truffet vinduet tre økter på rad — vurder å øke presset til konkurranseform på torsdag."
  evidence="8 av 10 innenfor 5 m · siste 3 økter"
  onDismiss={skjul} />
```

- Grensen i AI-laget er BINDENDE: et tips OBSERVERER. Skal AI-en FORESLÅ
  en planendring, går det som PlanAction gjennom køen — QueueCard med
  ProvenanceDisclosure og DiffKort. Aldri handlingsknapper i et tips.
- Kickeren er analyse-blå (--info) — AI er analyse. Aldri oransje: et tips
  er aldri skjermens ene handling.
- `evidence` er tipsets mini-proveniens og bør alltid sendes — et tips uten
  grunnlag leses som synsing.
- Lukking er sesjonsbasert (Banner-regelen) — tipset kan komme tilbake i
  morgen; aldri localStorage.
