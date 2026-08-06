# AgendaRow

Én rad i en kronologisk liste. Tiden står i fast mono-kolonne.

```jsx
<AgendaRow time="09:00" endTime="10:30" area="TEK"
  title="Teknikk tee — P5 til P7" meta="Mulligan 3 · Øyvind Rohjan"
  trailing="90 min" onClick={aapneOkt} dataOdId="agenda-0900" />
<AgendaRow time="11:00" area="SLAG" title="Wedge 40–90 m" status="naa" onClick={aapneOkt} />
```

- Grensen mot `ListRow`: ListRow er plattformens generelle rad; AgendaRow er
  TIDSFORANKRET — fast tidskolonne, NÅ-tilstand, pyramidekant. Bruk ListRow
  når lista ikke er kronologisk.
- Grensen mot `SessionCard`: kortet lever på ukelerretet (2D, 1 px = 1 minutt);
  raden lever i en liste (1D). Samme økt, to projeksjoner — samme
  pyramidefarger, så øyet kjenner økta igjen på tvers.
- Raden er ETT treffmål. ✓, NÅ og varighet er informasjon — handlinger bor i
  økt-editoren raden åpner. Status annonseres også som skjult tekst
  («Pågår nå»), for ✓ leses ikke meningsfullt.
- NÅ-merket er blekk (`--fg`), aldri oransje og aldri pulserende — puls og
  oransje er OneThingNows monopol.
- Container-terskel 360 px: sluttid ryker og tidskolonnen går 76→44 px —
  starttiden og tittelen står alltid.
- Skillelinjer mellom rader eier `ListGroup`/panelet — raden tegner ingen.
