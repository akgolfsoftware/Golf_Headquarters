# G01/G06–G10 — runde, SG, TrackMan og DataGolf, teknisk kontroll 12.09.2026

Gren: `grok/g01-g10-runde-sg-trackman-2026-09-12`. Ingen visuell portering. Ingen produksjonsimport.

## Hva som er prøvd

- Korrigering: `lagreManuellRundeSg` oppdaterer total, tillater null og avviser gammel fane. Fremmed spiller skriver ingenting.
- Kilde: manuell SG overskrives aldri av beregnet SG (`avgjorSgSkriving`).
- Enhet: TrackMan-normalisering bruker oppgitt mph/yards/meter. Ukjent enhet gir null.
- Manglende data: tomme TrackMan-felt forblir null. DataGolf uten referanse skrives ikke.
- Gjenåpning: gjentatt lagring med samme snapshot er trygg; endret resultat på samme forsøk avvises.

Nye tester: `src/lib/trackman/manglende-data.test.ts`. Øvrig bevis: `manuell-sg-lagring.test.ts`, `sg-skriving.test.ts`, `units.test.ts`, `challenge-data.test.ts`.

## Isolert testdatabase / produksjonsimport — blokkering

Docker/testbase mangler. Produksjonsimport av DataGolf/GolfBox er ikke kjørt.

## Ikke påstått

- Innlogget importreise.
- Visuell godkjenning, D0 eller lanseringsklar app.
