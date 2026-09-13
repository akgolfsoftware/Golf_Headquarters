# R-I — helseskriving og eget samtykke, 13.09.2026

Gren: `grok/r-i-helse-skriv-2026-09-13`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Eksporterte handlinger kalles direkte.

- `lagreHelseEntry` uten manuelt helsesamtykke kaster og skriver ingen rad.
- Med gyldig samtykke lagres bare innlogget bruker-id.
- Forelder avvises før skriving.
- `settEgetHelseSamtykke` har ingen userId-parameter og lagrer bare sesjonsbrukeren.
- Forelder får ikke sette helsesamtykke via spillerhandlingen.
- Spiller under 16 kan ikke samtykke selv; ingen rad skrives.

`lagreHelseEntry` krever nå PLAYER/COACH/ADMIN, samme rollevakt som øvrige portal-skriv.

## Isolert testdatabase

Innlogget nettleserreise er ikke kjørt her.

## Ikke påstått

- At alle helsevisninger i AgencyOS er prøvd innlogget.
- Symptom-stubben `logSymptom` er uendret (ingen database-skriving ennå).
- Lanseringsklar app.
