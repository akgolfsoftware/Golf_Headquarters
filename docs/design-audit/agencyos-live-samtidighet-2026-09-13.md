# Live-lagring og ærlig videobekreftelse — 13.09.2026

Status: implementert i `codex/video-mottak-2026-09-13`, fra `739bd23ad`. Klar for samlet integrasjonskontroll; ikke publisert eller fullverifisert her.

## Endring

- R05: Videohjelperen bekrefter mottak og sier at automatisk analyse ennå ikke er tilgjengelig. Den påstår ikke lenger at den ser på opptaket. Dette bygger ikke videoanalyse eller verifiserer opplastingskjeden.
- P32/A32: Coachens melding, brief og vurdering oppdaterer bare sine egne felt i én databaseoperasjon. Meldinger legges til den gjeldende listen. En tidligere lest kopi av hele oppsummeringen brukes ikke lenger til å overskrive andre lagringer.
- Coachens eierskap kontrolleres i selve skriveoperasjonen. Eksisterende administratorrolle beholdes. Tomme meldinger/brief avvises, og blankt vurderingsnotat bevarer eksisterende notat.

## Filer til integrasjon

- `src/lib/agents/swing-video-analyst.ts`
- `src/lib/agencyos/live-okt-actions.ts`
- `src/lib/agencyos/live-summary-update.ts` (ny)
- `src/lib/agencyos/live-okt-actions.test.ts`
- `tests/integration/agencyos-live-summary.test.mjs` (ny)
- Denne rapporten.

## Verifisert

Kjørt i den isolerte arbeidskopien, med syntetiske data:

```sh
node --import tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agencyos/live-okt-actions.test.ts src/lib/portal-live/summary-save.test.ts
node --import tsx tests/integration/agencyos-live-summary.test.mjs
./node_modules/.bin/eslint src/lib/agencyos/live-okt-actions.ts src/lib/agencyos/live-summary-update.ts src/lib/agencyos/live-okt-actions.test.ts src/lib/agents/swing-video-analyst.ts
node scripts/check-action-auth.mjs
git diff --check
```

Alle bestått. 14 handlingstester (9 coach + 5 eksisterende spiller) dekker blant annet avvisning, eierskap, ugyldige verdier, bevaring av felt, rollback og feilsvar.

Den separate prøven kjører den faktiske parameteriserte SQL-en i lokal PGlite/PostgreSQL i minnet. Den bevarer 30 meldinger sammen med brief, vurdering, spillerfelt og eksisterende oppsummering; prøver coach/admin-grensen, tekst med sitater, rollback og seks eldre JSON-tilstander. Ingen ekstern database brukes. PGlite finnes i det lokale testmiljøet; ingen ny prosjektavhengighet er lagt til, og prøven er ikke automatisk del av `npm test`.

PGlite serialiserer spørringene. Prøven beviser SQL-oppførselen, men er ikke en prøve av låsing mellom flere databaseforbindelser eller en innlogget nettleserreise.

## Sikkerhet og personvern

1. Tilgang: serveren krever fortsatt COACH/ADMIN. UPDATE krever samme coach-ID med unntak for eksisterende ADMIN-tilgang. Avviste roller og uvedkommende coach er testet.
2. Data: samme eksisterende oppsummeringsfelt og notat brukes; ingen nye personfelt, eksterne AI-kall, migrasjoner eller produksjonsendringer. SQL-verdier sendes som parametere.
3. Barn og samtykke: ingen endring av målgruppe, samtykke eller deling. Testdata er syntetiske. Dette er ikke en ny full personvernrevisjon av Live eller video.

## Gjenstår

Integrasjonseier kjører samlet `npm run verify` og øvrige avtalte kontroller før commit. Denne arbeidskopien har delt lokal avhengighetsmappe og skal ikke kjøre et konkurrerende fullbygg.

Andre skrivere av hele `completedSummary`, blant annet eldre video-notatflyt, omfattes ikke av denne pakken og kan fortsatt trenge egen kontroll. P32/A32 er derfor ikke erklært fullført. Gjentatt innsending av samme melding kan fortsatt gi duplikat; automatisk analyse, varsling, levering og full brukerreise er heller ikke ferdigattestert her.
