# MaanedKalender

Månedsrutenettet. Dagen er ett treffmål; øktene er prikker, aldri knapper.

```jsx
<MaanedKalender value="08-03" onSelectDay={aapneDag} dataOdId="kalender-aug"
  weeks={[{ week: 32, days: [{ key: "08-03", date: 3, inMonth: true, today: true,
    events: [{ area: "TEK" }, { area: "FYS" }] }, /* … */ ] }]} />
```

- Grensen mot `DatePicker`: DatePicker er en SKJEMAKONTROLL (velg dato i et
  felt, mandag først, roving tabindex — underlaget deles). MaanedKalender er
  en VISNING: øktprikker, åpne dagen, aldri del av et skjema.
- Prikkfargene er SessionCards pyramidemapping (FYS `--info`, TEK `--fg`,
  SLAG `--mid`, SPILL `--muted`, TURN `--up`) — samme område, samme farge,
  overalt. Maks 3 prikker + «+N»; en dagcelle er en oversikt, ikke en liste.
- Container-terskel 560 px: cellene går 76→44 px og +N-telleren ryker —
  prikkene står, for de er beviset på at dagen har innhold. Målt mot
  wrap-containeren; PlayerHQ-kolonnen (430) ligger under, hovedspalten (860) over.
- Komponenten regner ALDRI ut kalenderen — `weeks` kommer ferdig fra
  konsumenten (Oslo-korrekt ukelogikk bor i appens `uke-helpers`, ikke her).

## Bindende

Navigasjon (forrige/neste måned) hører til rammen/flaten — legges det
navigasjonsknapper inne i rutenettet, er det feil komponent.
