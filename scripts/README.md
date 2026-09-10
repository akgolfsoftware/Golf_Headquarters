# Prosjektverktøy

[Hele verktøykatalogen](katalog.md) viser alle aktive skript. Skript med data- eller integrasjonsoppgaver beholdes på stabile stier fordi npm, tester og lokale driftsjobber bruker dem. En datert fil er ikke automatisk trygg å slette eller kjøre på nytt.

| Oppgave | Inngang |
|---|---|
| Struktur, delte instrukser og dokumentlenker | `npm run prosjekt:sjekk` |
| Oppdater fil- og dokumentregister | `npm run prosjekt:register` |
| Kode, designregler og bygg | `npm run verify` |
| Enhets- og komponenttester | `npm test` |
| Miljøkontroll uten å vise nøkler eller endre oppsett | `node scripts/launch-preflight.mjs` |
| Train-lock-måling | [tests/visual/README.md](../tests/visual/README.md), `train-lock-pixel-diff.mjs` |
| AK Golf-designverdier | `ak-golf-tokens.mjs`; endring følger designpakkens synk |
| Database, import, oppretting av brukere, betaling og utsending | Finn konkret skript i katalogen; kontroller innhold, målmiljø og autorisasjon før kjøring |

## Arkiv

[Arkiverte verktøy](arkiv/README.md) er historikk. De åtte verktøyene i `arkiv/design-foer-train-lock/` er sperret for kjøring og erstattet av Train-lock-riggen. `speil:paper` er fjernet fra npm. Den gamle `verify.mjs` i prosjektroten var en databaseprobe, ikke en kodekontroll; den ligger nå sperret i arkivet.

[Gamle bruksoppskrifter](arkiv/bruk-foer-opprydding.md) er bevart, men kan beskrive utgåtte tilgangsnivåer eller datakilder. Ikke bruk dem som lanseringsstatus.

## Lokale driftsjobber

`meg-index.sh`, `meg-index-vaults.ts`, tilhørende `.plist` og `meg-tilbakeskriving/` beholdes på sine stier. Loggfiler er lokale, ignorerte og kan være i bruk. Opprydding skal ikke stoppe jobbene eller flytte aktive loggfiler.
