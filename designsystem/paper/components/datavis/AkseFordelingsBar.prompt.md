# AkseFordelingsBar

Hel-del-fordeling som ett bånd. Maks fem segmenter, lukket tonerekke.

```jsx
<AkseFordelingsBar dataOdId="slagfordeling" segments={[
  { label: "Putt", pct: 41, display: "41 %" },
  { label: "Nærspill", pct: 22, display: "22 %" },
  { label: "Innspill", pct: 19, display: "19 %" },
  { label: "Utslag", pct: 18, display: "18 %" },
]} />
```

- Grensen mot `BarChart`: båndet viser ANDELER av en helhet (summen er 100 %);
  søyler viser absolutte verdier side om side.
- Grensen mot `PyramideFasett`: gjelder fordelingen pyramidens fem områder
  med klikk-filter, er det fasetten — den eier pyramidefargene.
- Tonerekka (blekk → analyse-blå → oliven → mid → soft) tildeles automatisk
  i segmentrekkefølge. `tone` per segment finnes, men brukes kun når
  semantikken krever det (f.eks. «arkivert» alltid soft) — aldri for pynt.
- Maks fem segmenter, håndhevet i koden (slice). Sjette+ kategori slås
  sammen til «Annet» av KONSUMENTEN før kallet — komponenten gjetter ikke.
- Bruk ordboka: «Nærspill», aldri «kort spill» (ARG = Nærspill).
