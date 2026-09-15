# KODE-C utsatt — Caddie sitt AI-svar og TrackMan foto-kilde, 14.09.2026

Eier: Anders. Status: **utsatt, ikke startet.** Ingen kode er skrevet for denne pakken.

## Hva KODE-C skulle dekke

De to siste udekkede delene av R-A–R-E:

1. **Caddie sitt faktiske AI-svar** — modellrespons, verktøykall og godkjenningsflyt i
   `/api/caddie/chat`. Bare tilgangsgaten er prøvd innlogget (PR #887): ADMIN slipper
   forbi, COACH og uinnlogget avvises 401.
2. **TrackMan foto-kilde** (AI-vision-avlesning i `src/lib/trackman/parse-photo.ts`).
   CSV- og HTML-import er prøvd gjennom hele skjermflyten (PR #887); foto er ikke.

## Hvorfor den er utsatt

Begge krever `ANTHROPIC_API_KEY` i miljøet som kjører prøven. Nøkkelen skal ikke inn i
et sky-testmiljø eller i CI-logger. Det er ikke en teknisk hindring som kan omgås med
en bedre test — det er en bevisst grense for hvor hemmeligheter får ligge.

En mock av modellsvaret ville ikke bevist det som mangler. Verdien i disse to prøvene
ligger nettopp i at et ekte modellsvar tolkes riktig: at Caddie ikke gjetter, og at
foto-avlesningen returnerer `null` framfor et anslag når bildet ikke kan leses
(TruthLayer-kravet, beslutning 03.09.2026). Med mocket svar tester man sin egen mock.

## Hva som skal til for å gjenoppta

Anders avgjør hvordan nøkkelen kan brukes trygt. To veier, uten anbefaling herfra
fordi valget er hans:

- **Lokal kjøring på Anders' egen maskin** med nøkkelen kun i prosessmiljøet, aldri i
  en fil i repoet og aldri i en sky-runner. Da kan samme P0-rigg
  (`npm run test:p0-test`) kjøres med nøkkelen satt for den ene kjøringen.
- **Egen, begrenset testnøkkel** med lavt forbrukstak, som kun brukes til denne
  prøven og roteres etterpå.

Når én av dem er valgt, er selve testarbeidet lite: to spec-filer i `tests/p0/` etter
samme mønster som `caddie-trackman-innlogget.spec.ts`.

## Ikke påstått

- At Caddie sitt AI-svar eller TrackMan foto-kilde er prøvd.
- At en mock ville vært et gyldig substitutt.
- At noe i denne pakken er bygget, komponentprøvd eller innlogget prøvd.
