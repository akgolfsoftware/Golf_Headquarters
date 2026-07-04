TrackMan økt-sammendrag; bruk i /admin/trackman-listen, økt-detalj og PlayerHQ.

```jsx
<TrackmanSammendrag
  dato="6. mars 2025" spiller="Øyvind Rojahn" kilde="TrackMan Range"
  totalSlag={100}
  koller={[
    { navn: "6-jern", antall: 41 },
    { navn: "52° wedge", antall: 30 },
    { navn: "60° wedge", antall: 24 },
    { navn: "56° wedge", antall: 5 },
  ]}
  hoydepunkt="Jevnest med 6-jern: carry ±4,1 m over 41 slag."
  onClick={() => openRapport(okt)}
/>
```

- `spiller` utelates på spillerens egen flate (PlayerHQ) — meta-linjen bygges av det som finnes.
- **hoydepunkt** er én setning coach/AI løfter frem (sparkles i signal) — valgfri, ikke pliktfelt.
- Med `onClick` blir hele kortet en knapp (hover + fokusring) → full rapport.
- Kølle-chips med slag-antall; totalen i stor mono/tabular.
