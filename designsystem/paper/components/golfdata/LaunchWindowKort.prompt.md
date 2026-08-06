# LaunchWindowKort

Ballens start mot målvinduet. Innenfor = blekk, utenfor = leire.

```jsx
<LaunchWindowKort club="Driver" dataOdId="driver-launch" params={[
  { label: "Launch", value: 12.4, display: "12,4°", windowMin: 11, windowMax: 14,
    windowDisplay: "11–14°", scaleMin: 6, scaleMax: 20, inWindow: true },
  { label: "Spinn", value: 3150, display: "3 150 rpm", windowMin: 2200, windowMax: 2800,
    windowDisplay: "2 200–2 800", scaleMin: 1500, scaleMax: 4000 },
]} />
```

- Grensen mot `StrikeSmashKort`: kontakt (smash, treffbilde) bor der; dette
  kortet er hva ballen GJØR ut av kølla. De står ofte sammen i TrackMan-fanen.
- Vinduene kommer fra konsumenten (kategori- og køllespesifikke mål) —
  komponenten regner aldri egne vinduer.
- Utenfor vinduet = leire markør — informasjon, ikke dom; ingen tekst sier
  «feil». Skala (scaleMin/Max) må romme både vinduet og målingen.
- Terskel 380 px: tallkolonnen ryker (verdiene ligger i aria-sammendraget),
  parameternavnet smalner 88→64 px.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
