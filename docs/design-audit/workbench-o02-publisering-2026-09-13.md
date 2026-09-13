# O02 — Workbench-publisering uten dublett og uten andres plan, 13.09.2026

Gren: `grok/o02-workbench-publisering-2026-09-13`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Eksporterte handlinger i `src/lib/workbench/publish-actions.ts` kalles direkte.

- Coach uten stalltilgang får avslag og skriver ikke plan, økt eller varsel.
- Spiller som sender `playerId` stoppes av rollevakten før lesing.
- Egen plan går til «venter på spiller» uten at det opprettes nye økter.
- Snapshot tar bare økter fra norsk mandag og fremover; økt fra forrige uke er ute.
- Tillatt coach publiserer spillerens plan én gang.
- Godta og avvis treffer bare innlogget brukers egen ventende plan.

Ukesvinduet bruker `mondayOf` (Oslo-kalender), samme som øvrig Workbench-datomatte.

## Isolert testdatabase

Innlogget nettleserreise er ikke kjørt her. P0-TEST eies av en annen økt.

## Ikke påstått

- At gruppeplan til spillerplan er ferdig uten dublett i alle modeller.
- Innlogget Next-/database-reise.
- Visuell godkjenning, D0 eller lanseringsklar app.
