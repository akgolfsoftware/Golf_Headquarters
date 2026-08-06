# NivaStige

Hvor i nivårekka spilleren står. Fargeløs. Nå = blekk, mål = stiplet.

```jsx
<NivaStige levels={["Mini", "Knøtt", "Basis", "Utvikling", "Elite"]}
  current="Basis" target="Utvikling" dataOdId="ak-stigen" />
```

- FARGELØS er bindende: AK-stigen og A–K er vokabular og fargekodes aldri.
  Nå-nivået er blekkfylt (samme som valgt dag i DayStrip), forbi får
  markert ramme, målet stiplet blekkramme med «mål»-etikett.
- Rekka kommer fra konsumenten — stigen hardkoder ingen nivåer, så samme
  komponent bærer AK-stigen, A–K-utsnitt og voksenmodellen.
- Grensen mot `ProgramLadder` (progress): progresjon INNI et program bor
  der; stigen er PLASSERINGEN i rekka. Grensen mot `Stepper`: skjemaflyt.
- Ren visning (role=img med sammendrag) — uttak/opprykk er coachens
  beslutning og skjer aldri ved å klikke på en stige.
