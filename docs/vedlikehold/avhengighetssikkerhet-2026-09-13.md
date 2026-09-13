# Avhengighetssikkerhet 13.09.2026

## Resultat

To avgrensede leveranser er merget til `main`:

- PR #879 oppdaterte Next.js fra 16.3.1 til eksakt 16.3.3. Dette er den rettede versjonen for de to kritiske Next.js-sårbarhetene [GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4) og [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).
- PR #880 oppdaterte kompatible låste versjoner av AI SDK, `sharp`, `fast-uri`, `fflate`, `js-yaml`, `qs` og `baseline-browser-mapping`. Serwist sin låste `browserslist` ble avgrenset overstyrt til rettet patch 4.28.9.

`npm audit` gikk fra 20 funn, inkludert 1 kritisk, til 5 funn: 0 kritiske, 0 moderate, 4 høye og 1 lavt.

## Verifisering

Begge leveransene bestod lokalt og på GitHub/Vercel:

- ren `npm ci`
- `npm run verify`
- 2 701 tester og 4 komponenttester
- produksjonsbygg av 340 sider
- Serwist service worker med 527 forhåndslagrede URL-er

De 25 historiske Train-lock-kontrastfunnene var uendret og er ikke skjult av denne leveransen.

## Fem gjenværende funn

Fire høye funn kommer fra Prisma CLI 7.9.1 sine interne avhengigheter `@prisma/config`, `deepmerge-ts` og `mysql2`. Applikasjonen bruker PostgreSQL, men Prisma CLI pakker også med MySQL-verktøy. Siste kompatible Prisma 7.10.0 bruker fortsatt de samme sårbare interne versjonene. `npm audit` foreslår nedgradering til Prisma 6.19.3; den er ikke brukt fordi den er en inkompatibel hovedversjonsendring og ikke en trygg retting.

Det siste lave funnet gjelder `esbuild` 0.27.7 sin lokale utviklingsserver på Windows. Prosjektet utvikles på macOS og bygges på Linux. Rettet 0.28.2 ligger utenfor dagens 0.27-grense og Serwist bruker samme verktøy. Tvungen oppgradering er derfor utsatt til Serwist støtter versjonen eller en egen kompatibilitetsleveranse er bestilt.

## Neste kontroll

- Følg Prisma og Serwist/esbuild for kompatible rettede utgivelser.
- Kjør `npm audit` på nytt ved neste avhengighetsoppdatering.
- Ikke bruk `npm audit fix --force`, Prisma-nedgradering eller interne hovedversjonsoverstyringer som automatisk opprydding.

Ingen databaseskjema, tilgangsregel, persondata, produksjonsmiljø eller utrulling ble endret.
