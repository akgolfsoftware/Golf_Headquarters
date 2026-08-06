# Tidslinje

Forløp bakover i tid. Prikk + strek + innhold. Ren visning.

```jsx
<Tidslinje dataOdId="okt-logg" items={[
  { time: "09:02", title: "Økta startet", body: "Teknikk tee med Øyvind Rohjan på Mulligan 3." },
  { time: "09:41", title: "Fangst: P6-posisjonen sitter", tone: "up", value: "12 av 15 treff innenfor vinduet" },
  { time: "10:28", title: "Økta avsluttet", tone: "naa" },
]} />
```

- Grensen mot `AgendaRow`: skal raden ÅPNE noe, er den en AgendaRow i en
  liste. Tidslinjen dokumenterer; den navigerer ikke — derfor har radene
  ingen hover, ingen cursor, ingen treffmålskrav.
- Grensen mot `Stepper`: Stepper peker FREMOVER i en flyt du står i;
  Tidslinje peker BAKOVER på det som skjedde.
- Tonen bor i prikken alene — tittel og brødtekst er alltid `--fg`/`--muted`.
  `dn` er leire, aldri rød; `naa` er blekk og gjør tittelen halvfet.
- Siste rad har aldri strek — sett lukkes ikke (bindende 28.07, samme
  konvensjon som ListGroup/KeyValueGrid).
- Container-terskel 360 px: tidskolonnen 44→36 px, radavstanden strammes.
  Kort tidformat («09:41») får plass i begge.
