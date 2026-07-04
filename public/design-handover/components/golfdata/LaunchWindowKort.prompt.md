# LaunchWindowKort

Launch/spinn-scatter per kølle mot det skraverte optimale vinduet for spillerens CS-nivå. Dommen er hero-tallet: **meter som ligger igjen i vinduet — alltid i meter.**

## Bruk
```jsx
<LaunchWindowKort
  kolle="Driver"
  csNivaa="CS90"
  skudd={[{ launch: 12.8, spinn: 2350 }, { launch: 10.4, spinn: 3120 }]}
  vindu={{ launchMin: 11, launchMax: 15, spinnMin: 1900, spinnMax: 2600 }}
  meterIgjen={9}
  grunnlag="26 slag · TrackMan"
  dom="Spinnen ligger ~400 rpm for høyt — vinduet åpner med lavere dynamisk loft."
/>
```

## Domenefasit
- Vinduet er per **CS-nivå (CS50–CS100)** — navngis i sonen («Vindu · CS90»). Sone = `--success-bg`/`--success-border` (stiplet).
- Treff i vinduet = fylt `--up`-punkt; utenfor = åpen ring i nøytral — **form + farge**, fargeblind-sikkert (DispersionPlot-presedens).
- Hero: `meterIgjen` i **meter** m/ fortegn («+9 m» / «ligger i vinduet»). Mono, tabulære tall.
- Datagrunnlag alltid synlig i sub-linjen; mangler det, sies det ærlig. Stats-linje: «N av M slag i vinduet (x %)».
- Akser: launch ° (x), spinn rpm (y) — mono mikro-ticks, desimal med komma.

## Progressiv dybde (én kodevei)
`nivaa` gater lag via `NIVA[nivaa]` (NesteFokusKort-mønsteret): **nybegynner** = graf + hero + grunnlag · **ovet** = + klarspråk-dom · **elite** = + vindu-fagtall i stats-linjen (launch-/spinn-grenser).

## Tilstander
`loading` (skeleton-flate) · `tomt`/ingen skudd/mangler vindu (onboarding: «Ingen TrackMan-data ennå») · normal.

## Komponerer
Hører til TrackMan-fortellingen sammen med `GappingChart`/`DispersionPlot` — dette kortet dømmer utbyttet (meter), ikke spredningen. `dom`-linjen kan peke videre til drill via DiagnoseKort-mønsteret.
