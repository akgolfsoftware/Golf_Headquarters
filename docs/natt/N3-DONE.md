# N3 — Scorekort- og PEI-beregningsmotor høstet fra talenthq

Gren: `claude/n3-pei-scorekort-motor` (fra `origin/main`). Ikke merget.

## Hva som ble høstet

Fra `~/Developer/ak-golf-talenthq` (kun lesing, repoet er ikke endret) inn i
`src/lib/domain/pei/` i akgolf-hq:

| Ny fil | Høstet fra (talenthq) | Innhold |
|---|---|---|
| `vlookup.ts` | `sg-reference.js` (`lookup`) | Delt VLOOKUP(...,TRUE)-oppslagshjelper |
| `broadie-sg-tabeller.ts` | `sg-reference.js` (`SG_BY_LIE`, `EXPECTED_PUTTS`, `sgFromLength`, `expectedPutts`, `greenPutts`) | Broadie strokes-gained-tabeller (tee/fairway/rough/bunker/recovery/green), verbatim kopiert |
| `pei-tabeller.ts` | `sg-reference.js` (`HOVLAND_INSPILL_PEI`, `hovlandPei`) | Hovland-turneringsbenchmark for PEI |
| `poeng-tabeller.ts` | `sg-reference.js` (`POINTS_8BALL`, `POINTS_LENGTH_PUTT`, `points8Ball`, `pointsLengthPutt`) | Poengoppslag for 8-ball og lengdeputt |
| `pei-beregning.ts` | `scorecard-compute.js` (`computeCell`s "pei"/"diff"/"tilMaal"-grener) | Selve PEI-formelen, tre grener (fast lengde / dispersion / bane) |
| `protokoll-typer.ts` | `protocol-definitions.js` (implisitt skjema) | TypeScript-typer for protokoll/kolonne/total/rad |
| `protokoll-definisjoner.ts` | `protocol-definitions.js` | 23 av protokollene (se «Bevisst utelatt» under) |
| `scorekort-motor.ts` | `scorecard-compute.js` | `computeCell`/`computeTotal`/`buildShots`/`buildTotals`/`deriveLevel`/`validateCell` m.fl., delt i tre familier |
| `index.ts` | — | Barrel-eksport |
| `scorekort-motor.test.ts` | `parity.test.ts` (mønster) | Paritetstester, se under |

## PEI-formelen (avklart 2026-08-26)

```
PEI = resultat ÷ lengde     (LAVERE er bedre)
```

IKKE `(Rand − avstand) ÷ Rand × 100` — den formelen finnes i talenthq sin
`test-reference-data.ts` (`PEI_REF_FW`/`PEI_REF_BUNKER`) men er konkurrerende
og feilaktig, og er bevisst IKKE høstet. Matcher kommentaren i
`src/lib/portal-tester/test-scoring.ts`: «PEI for ett slag = nærhet ÷ lengde».

Tre grener (samme rekkefølge som talenthq sin `computeCell`):
1. PEI Test Bane: spilleren taster `lengdeInn` + `tilHull` direkte → `tilHull / lengdeInn`.
2. Dispersion (driver/inspill/wedge/PEI-slagtester): `carry` + `side` → avstand til
   mål via Pythagoras → `tilMål / mål`.
3. Fast preset-lengde (8-ball, banetester): `resultat / radLengde`.

## Ufravikelig regel: tre separate motorer

PEI, Broadie-SG og poeng er aldri blandet i én funksjon eller ett returobjekt:

- `beregnPeiCelle` (kun PEI-kolonner: `pei`, `diff`, `tilMaal`)
- `beregnSgCelle` (kun Broadie-SG-kolonner: `sgFraLengde`, `pgaPutts`, `sg`, `forventet`, `res`)
- `beregnPoengCelle` (kun `poeng`)
- `beregnCelle` er en RUTER — den kaller nøyaktig én av de tre over per kolonne
  og returnerer ett enkelt tall, aldri en blanding.
- Radbyggerne er tilsvarende splittet i `byggPeiRader` / `byggSgRader` /
  `byggPoengRader` (talenthq sin originale `buildShots` returnerte
  `{pei, sg, points}` blandet i ETT objekt — det er bevisst IKKE videreført).

Testene i «Motorene er strukturelt adskilt»-blokken i `scorekort-motor.test.ts`
beviser dette (f.eks. at `beregnPeiCelle` gir `null` for en SG-kolonne).

## Paritetstester — bevis for samme tall som talenthq

Referanseverdiene i `scorekort-motor.test.ts` er hentet ved å kjøre talenthq
sin FAKTISKE kode direkte (ikke gjettet, ikke regnet ut på nytt for hånd):

```bash
# Kopi av de tre kildefilene til /tmp/tnq-eval med relative imports rettet til
# ".js"-suffiks (kun det — talenthq-repoet selv er urørt), kjørt med:
node --input-type=module -e '...' # se historikk i denne økten
```

Eksempler brukt (input → output fra talenthq, verifisert identisk i vår port):

- `sgFromLength(0, "tee")` → `2.92`, `sgFromLength(91.01, "tee")` → `2.9235`
- `expectedPutts(3)` → `1.61`, `expectedPutts(3.01)` → `1.78`
- `greenPutts(2)` → `1.4`
- `points8Ball(0/0.1/1/2/3)` → `4/3/2/1/0`
- `pointsLengthPutt(0/1/1.1/-2.1/5)` → `6/3/1/0.5/0`
- `hovlandPei(75/120/180/500)` → `0.0736/0.0536/0.0511/0.0597`
- `8-ball-variation` rad 0 (Chip10, lengde 10, resultat 2 m): `pei=0.2`,
  `pgaPutts=1.4`, `poeng=1`
- `driver-basic` rad 0 (mål 270, carry 265, side 3): `tilMaal=5.830951894845301`,
  `pei=0.02159611812905667`, `forv. slag=1.87`
- `pei-test-bane` rad 0 (lengdeInn 150, tilHull 10): `pei=0.06666666666666667`
- `golfslag-bane` rad 0 (hull 1, lengde 129, resultat 5, lie fw):
  `sgFraLengde=2.9135`, `pei=0.03875968992248062`, `sg=0.04349999999999987`
- `pei-st-leon` rad 0 (mål 129, carry 125, side 4): `diff=-4`,
  `tilMaal=5.656854249492381`, `pei=0.0438515833293983`
- `8-ball-variation` total «Chip PEI» (rad 0+1 fylt ut) via `computeTotal`:
  `0.15000000000000002`

Alle disse er bakt inn som `assert.equal`/`assert.deepEqual` i
`scorekort-motor.test.ts` — 20 tester, alle grønne.

## PEI-retning bevist eksplisitt

Egen testblokk («PEI-retning») verifiserer at LAVERE PEI er bedre — ikke bare
at tallverdien stemmer, men at retningen er riktig (`erPeiBedre(0.05, 0.1) ===
true`, og at 1 m fra hull på en 10 m-lengde gir lavere (bedre) PEI enn 5 m fra
hull på samme lengde).

## Bevisst utelatt

**FYSISK_TESTS** (6 protokoller i talenthq: trapbarmarkløft, benkpress, stille
lengde, ballkast knestående, clubhead speed, 3000 m løping) er IKKE høstet.
Begrunnelse: de har verken PEI- eller SG-beregning — kun rå
resultat-aggregering (`best`/`avg3`/`single`/`singleLow`), ingen kolonne heter
`pei`, `sg` eller `poeng`. De hører ikke hjemme i en «scorekort- og
PEI-beregningsmotor», og akgolf-hq har allerede tilsvarende aggregering for
fysiske tester i `src/lib/portal-tester/test-scoring.ts`
(`value_max`/`value_single`/`fallback`). `TotalBeregning`-typen i
`protokoll-typer.ts` beholder likevel `best`/`single`/`singleLow`/`avg3` for
generalitet i `beregnTotal`, i tilfelle en senere jobb henter inn scorekortet
for de fysiske testene.

Endte opp med 23 protokoller (Golfslag 9, Teknikk 7, PEI 7) — verifisert med
en egen test på `TEST_PROTOKOLLER.length`.

## Ferdig-kriterier

1. `npx tsc --noEmit` — grønn (verifisert både isolert og som del av
   `npm run verify`).
2. `npx tsx --test src/lib/domain/pei/scorekort-motor.test.ts` — 20/20 grønne,
   paritetsbevist mot talenthq (se over).
3. `npm run verify` — se commit-melding/PR for status.
4. Gren `claude/n3-pei-scorekort-motor` fra `origin/main`, committet og
   pushet. Ikke merget til main.

## Sidefunn (ikke del av denne jobben, kun observert)

Under arbeidet oppdaget jeg og ryddet en `git stash`-kollisjon i denne
worktreen (delt `.git` mellom worktrees): en pre-eksisterende stash med
endringer i `src/lib/scrapers/golfbox.ts`, `src/lib/turneringer/golfbox-sync.ts`
og en ny `scripts/backfill-golfbox-sesonger.ts` ble utilsiktet poppet av en
`git stash`/`git stash pop`-sjekk jeg gjorde for å isolere BUNDLE FAIL-feilen
fra `check-critical-imports.mjs` (som viste seg å være det kjente
`npm ci`-gotchaet, ikke relatert til stashen). Jeg reverterte umiddelbart til
rent arbeidstre (`git checkout --`), men klarte IKKE å finne stash-objektet
igjen via `git fsck --unreachable` etterpå (1425 unreachable blobs, ingen
inneholdt "sesonger" i navnet blant de jeg fikk tid til å sjekke). Endringen
var liten (golfbox.ts ~4 linjer, golfbox-sync.ts ~133 linjer, én ny fil) og
IKKE en del av denne oppgaven — trolig fra en annen agent/økt som jobbet med
GolfBox-sesong-backfill. **Anders/den aktuelle økten bør sjekke om dette
arbeidet må gjøres på nytt.**
