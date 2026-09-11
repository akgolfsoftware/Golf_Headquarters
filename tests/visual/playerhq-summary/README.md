# PH-06 — komponent- og lagringskontroll

Riggen bruker faktisk `SessionSummary`, `SpillerVurderingForm`, `LiveLoopNav` og `LiveSessionShell` i React med klientinteraksjon. Next-ruting og serverhandlinger simuleres med syntetiske data. Dette er ikke en innlogget app-/databaseprøve.

Felles Trainlock/Geist/v3 lastes fra appens stilark og lokale Next-fontfiler. Manglende fonter stopper prøven; reservefont godtas ikke. CSS bygges med prosjektets Tailwind-motor. `render.tsx` er nå klientinngangen, ikke en statisk SSR-test.

```bash
node --import tsx tests/visual/playerhq-summary/screenshot.ts
```

Kommandoen starter/avslutter sin egen server på 127.0.0.1. Den prøver 320/390/834/1440 px, lys/mørk og åtte tilstander: tom, delvis, fullført, lagret, vurdert, langt innhold, eldre og tapper. I tillegg prøves begge notater fra økta, lagringsfeil/nettfeil, bevaring, venting, dobbelttrykk, nytt forsøk, fokus, 200 prosent tekst, gjenåpning med simulert lagring og faktisk lenkenavigasjon til et simulert `/portal`-mål.

Skriftene hentes fra `.next` eller den isolerte kontrollkopien. Alternativt kan `PH06_NEXT_DIR` peke på et eksisterende Next-bygg. Det kjøres ingen automatisk bygging med produksjonsmiljø. Mellomfiler ligger ignorert i `tests/visual/ut/playerhq-summary/`; bilder og `resultat.json` ligger i `_archive/visuell-kontroll-ph06-2026-09-11/`.

## Lagringsgrenser

`src/lib/portal-live/summary-save.test.ts` prøver de faktiske serverhandlingene med simulert database: eierskap, ugyldige verdier, separate JSON-felt og tilbakeføring ved feil i planspeil. `live-summary.test.ts` dekker de seks opprinnelige reglene for ferdigmarkering.

En separat PostgreSQL-prøve kan kjøres når `@electric-sql/pglite` finnes lokalt:

```bash
node --import tsx tests/visual/playerhq-summary/postgres.mjs
```

Den bruker en tom database i minnet med en minimal tabell og den faktiske parameteriserte SQL-en. Separate felt, transaksjonstilbakeføring, status/ID, sitater og eldre/null JSON prøves. Den kobler ikke til Supabase eller appdatabasen, og den er ikke automatisk del av `npm test`/CI. Ingen ny avhengighet er installert av denne pakken.

## Hva som gjenstår

Innlogget ende-til-ende-reise, faktiske roller mot appdatabasen, lagring/gjenåpning via Next og Anders' visuelle vurdering. Nettleserprøvens lagringssimulering og den isolerte SQL-prøven er separate bevis, ikke samlet produksjonsbevis.
