Knappen brukes til alt som kan trykkes i AK Golf-materiell — én primærknapp per flate, aldri to.

```jsx
<Knapp variant="primaer" storrelse="lg">Book kartleggingsøkt</Knapp>
<Knapp variant="sekundaer">Se pakkene</Knapp>
<Knapp variant="tekst">Les hvordan vi måler</Knapp>
```

- `variant`: `primaer` (signalfyll `#C4361B`, hvit tekst), `sekundaer` (kant `--ak-linje-hard`), `tekst`.
- `laster` viser snurre; `deaktivert` senker til 42 %.
- Minste høyde er 44 px på `md` og `lg` — trykkflatekravet fra `06-rom-og-geometri.md`.
- Knappeteksten er en handling i imperativ: «Book kartleggingsøkt», ikke «Send inn».
