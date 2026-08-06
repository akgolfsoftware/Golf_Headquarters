# VisningsVelger

Bytter kalendervisning. Lukket union, fast rekkefølge, faste etiketter.

```jsx
<VisningsVelger value="uke" onChange={settVisning} dataOdId="kalender-visning" />
<VisningsVelger value="dag" views={["dag", "uke", "agenda"]} block onChange={settVisning} />
```

- Grensen mot `SegmentControl`: SegmentControl er en generisk verdibryter;
  VisningsVelger eier KALENDER-vokabularet. Uten den skiller ville hver flate
  valgt egne etiketter («Månedsvisning», «Mnd», «30 dager») etter smak.
- Unionen er lukket med hensikt: fem visninger, definert i `VISNINGER` i
  komponentfilen. `views` kan snevre inn (PlayerHQ viser dag/uke/agenda), men
  aldri legge til — en sjette visning er en bibliotekbeslutning.
- Container-terskel 360 px: bare polstringen strammes (12→8 px). Etikettene
  forkortes ALDRI — «Måned» → «M» er uleselig, og overflow-x bærer resten.
- Valgt knapp er papirflate med border-innramming — aldri oransje; å stå i en
  visning er en tilstand, ikke skjermens ene handling.
