# TM02 — kildeenheter i fotoavlesning

13.09.2026. Baseline `739bd23ad`, gren `codex/trackman-fotoenheter-2026-09-13`. Nattkoordinator tildelte kun foto-parser, tilhørende test og denne rapporten. Status: lokal retting og samlet kontroll bestått; integrasjon og merge gjenstår.

## Før og etter

Bildeavlesningen ba tidligere om mph og meter og satte disse enhetene på alle råtall. Et bilde med m/s eller yards kunne derfor gi feil verdi uten varsel.

Modellsvaret oppgir nå kildeenhet per målefelt og slag. Råverdiene beholdes. Den eksisterende konverteringen brukes både til forhåndsvisning og import, uten omregning i modellen. Manglende eller eksplisitt ukjent enhet blir `unknown`; målefeltet blir dermed `null` ved konvertering. Hastighet støtter som før mph og m/s, avstand m og yd. Km/t og andre enheter har ingen ny konvertering og skal ikke gjettes.

Rader uten et eneste brukbart målefelt fjernes. Hvis ingen rader gjenstår, får brukeren en forståelig feil om å vise måleenhetene. Null betyr ukjent; tallet 0 beholdes. Modellsvar valideres fortsatt med Zod. Instruksjoner inne i bildet behandles som data, og prompten ber ikke om personopplysninger.

## Leveranse

- `src/lib/trackman/parse-photo.ts`
- `src/lib/trackman/parse-photo.test.ts`
- Denne rapporten.

Ingen endringer i CSV/HTML, felles konvertering, import-handlinger, skjermlayout, databasen eller AI-leverandøren.

## Testbevis

```sh
node --import tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/trackman/parse-photo.test.ts src/lib/trackman/units.test.ts src/lib/trackman/canonical.test.ts
./node_modules/.bin/eslint src/lib/trackman/parse-photo.ts src/lib/trackman/parse-photo.test.ts
git diff --check
npm run prosjekt:sjekk
```

Testkjøringen bestod 29 tester: åtte fotoscenarioer og eksisterende konverteringsprøver, med én overordnet fototest medregnet. Dekker blandede enheter per felt/rad, tidligere terskelverdier, råverdibevaring, lik forhåndsvisning/import, manglende/ukjent enhet, km/t uten støtte, tomme rader, null og 0, ugyldige tall, ugyldig JSON og modellfeil. Syntetiske modellsvar; ingen ekte bilder, eksterne AI-kall eller databaseimport.

## Sikkerhet og personvern

1. Tilgang: ingen ny rute eller handling. Eksisterende `requireConsentingUser` foran fotoavlesning og import, samt eksisterende målbruker-kontroll, er uendret.
2. Data ut: ingen nye eksterne kall eller logger; testsvar er syntetiske. Den eksisterende bildeoverføringen til AI består og er ikke personvernsertifisert av denne rettingen. En prompt om å unngå personopplysninger anonymiserer ikke et bilde før overføring.
3. Barn/samtykke: ingen nye samtykke-, delings- eller lagringsregler. Importens eksisterende personvern- og opplastingskontroller må fortsatt vurderes i sin egen arbeidsstrøm.

## Begrensninger og neste steg

Enhetstolkning fra faktiske bilder er ikke målt her. Modellen kan fortsatt lese feil; dette beviser validering og videre behandling av svaret. Klientens importdata, opplastingsgrenser, anonymisering, rate-limit og hele den innloggede importreisen omfattes ikke av pakken. TM02 er derfor ikke erklært komplett.

Integrasjonseier mottar de tre filene og kjører kontrollene på nytt mot fersk `main`, samt CI før merge etter Anders' bestilling. Kildegrenen har bestått full `npm run verify` med lokale Node 24-avhengigheter, 29 målrettede TrackMan-tester og produksjonsbygg.
