# LengdeAvvik

Avvik rundt null. Venstre = kort, høyre = langt. Retning, ikke moral.

```jsx
<LengdeAvvik dataOdId="carry-avvik" rows={[
  { label: "Driver", value: 6, display: "+6 m langt" },
  { label: "J7", value: -4, display: "−4 m kort" },
  { label: "Wedge 56", value: -11, display: "−11 m kort", flagged: true },
]} />
```

- Grensen mot `GappingChart` (golfviz): gapping viser ABSOLUTTE lengder og
  hull mellom køller; LengdeAvvik viser avstand fra et MÅL. Grensen mot
  `DispersionMap`: 2D-spredning hører dit; dette er én akse.
- Begge retninger er --mid: å slå langt er ikke bedre enn kort. `flagged`
  (satt av KONSUMENTEN mot en toleranse) toner raden --dn leire —
  komponenten regner aldri toleransen selv.
- `display` er obligatorisk og skal ha enhet OG retning («+6 m langt») —
  fortegn alene leses feil i golf, der − kan bety både kort og venstre.
- Container-terskel 380 px: etikett- og verdikolonnene smalner (76→56,
  88→72) — sporet beholder resten.
