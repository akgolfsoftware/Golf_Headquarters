# CoverageCard — dekningsgrad

Obligatorisk øverst på TN-oversikten (`/team-norway`) per bølge N7: «4 av 11 med profil». Tallet
forteller om satsingen faktisk har data å jobbe med, og skal være det første øyet finner.

- Første segment i `segments` er det som telles som dekket — tallet i stort mono.
- Segmentrampen er navy-900 → navy-400 → ravgul → ink-200. Ink-200-segmentet («Ikke samtykket»)
  tegnes bare i tegnforklaringen, ikke i stolpen: det er restfeltet.
- Rødt brukes ikke her. Manglende dekning er ikke en feil, og et rødt element skal aldri kunne
  feiltolkes som advarsel (N-D2).
- `state="error"` betyr «tallet er gammelt, ikke borte»: stolpen gråes, ravgul «IKKE OPPDATERT»
  settes ved siden av eyebrowen, og `staleNote` erstatter kildelinjen. Tallet vises fortsatt.
- `source` er TruthLayer-linjen. Et dekningstall uten kilde og dato er ikke ferdig.
- `layout="compact"` på mobil 390, `wide` på Mac 1440.
