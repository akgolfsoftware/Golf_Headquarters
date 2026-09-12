# R-I — utstyrsbag 13.09.2026

Gren: `grok/r-i-utstyrsbag-2026-09-13`. Ingen visuell portering.

## Hva som er prøvd

`lagreUtstyrsbag` kalles som eksportert handling:

- Forelder avvises uten skriving.
- Lagring bruker innlogget bruker-id. Det finnes ingen `userId`-parameter.
- Felt over 200 tegn avvises før databasekall.

## Tekniske rettinger

Inndata valideres med zod før upsert. Tomme strenger lagres fortsatt som null.

## Ikke påstått

- Innlogget isolert reise.
- At alle øvrige serverhandlinger har søskentest.
