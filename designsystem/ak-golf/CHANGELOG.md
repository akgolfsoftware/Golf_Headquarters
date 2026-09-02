# Endringslogg — AK Golf designsystem

Versjonen står i `tokens.json` (`$version`) og øverst i `readme.md`. Reglene:
**major** når en låst verdi (farge, font, romskala) endres eller en komponent
fjernes · **minor** når noe legges til · **patch** når noe rettes uten at
verdier eller API endres. Hver rad sier hva, hvorfor og hvem som bestemte.

## 1.0.0 — 02.09.2026

Første versjon med én sannhet. Før dette fantes systemet, men dokumentene
motsa hverandre og ingenting var maskinlesbart. Revisjonen 02.09 (5,9 av 10)
ligger til grunn.

**Rettet**
- 03-logo, 09-varianter, 02-arkitektur, 05-typografi, 10-forbudt og readme
  beskrev forrige merke (clay/blekk/krem, Archivo Narrow + Poppins). Alle sier
  nå verkstedpaletten og IBM Plex.
- `samspill.css` krympet knapper på trykk (`scale(0.98)`) i strid med
  12-bevegelse. Fjernet.
- `Felt.jsx` slo av fokusringen (`outline: none`). Ringen kommer nå fra
  `.ak-felt:focus-visible`.
- Varsel-gul `#8A6410` var 4,2:1 på grunnen — under kravet. Rettet til
  `#755608` (5,4:1).
- Mørk modus manglet status-farger; lysverdiene lakk gjennom. Ok, varsel og
  feil har nå målte mørke verdier.
- «Hvit på signalfyll 6,0:1» var 5,4:1. Tallet i fila er nå det målte.
- Sosialt-innlegget «Åtte av ti amatører…» påsto en måling som ikke finnes.
  Byttet mot en instruksjon uten tall.
- Fotokatalogen: rad 8, 12, 32 og 42 sier nå hva bildet viser.
- `uploads/` (100 dupliserte kildefiler) slettet fra masteren.

**Lagt til**
- `tokens.json` (W3C-format) som eneste kilde. `scripts/ak-golf-tokens.mjs`
  genererer CSS, Tailwind v4 `@theme`, TS-speil og `tokens/kontrast.md`, og
  feiler i `npm run verify` på sklidde filer eller kontrastbrudd.
- Flytende typeskala (`--ak-t-hero`, `--ak-t-seksjon`) og brekkpunkt 768.
- Måle-komponenter: `Spredning` (1σ-ellipse, telt), `Tidsserie`, `Fordeling`,
  `Akse`. Alle nekter å rendre uten kilde og dato.
- Ikonsett: 24 Lucide-ikoner i square/miter, `Ikon`-komponent, kapittel 13.
- Primitiver: `Dialog`, `Melding` + `Meldingsstakk`, `Hint`, `Skjelett`,
  `Datovelger`, `Initialer`, og sortering i `Tabell`.
- Kits: junior-siden, booking i fire steg, feilsider 404/500.
- Kapittel 14: beskjæring per flate, brief for neste fotosesjon, samtykketekst.
- `scripts/speil-ak-golf.mjs` speiler masteren til repoet fra manifestet.
- Denne loggen, versjonsnummer og endringsprosess (readme §10).
