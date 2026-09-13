# R-I — admin opprett/rediger spiller, 13.09.2026

Gren: `grok/r-i-admin-spiller-skriv-2026-09-13`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Eksporterte handlinger kalles direkte.

- `createSpiller` avviser spiller, forelder og uinnlogget uten å opprette bruker.
- `lagreSpiller` avviser spiller-rolle før skriving.
- Coach uten stalltilgang kan ikke lagre eller bytte valgt coach.
- Tillatt coach oppdaterer kun spilleren i stallen.

Testdata er fiktive (Øyvind Rohjan, example.test).

## Isolert testdatabase

Innlogget nettleserreise er ikke kjørt her.

## Ikke påstått

- Alle admin-mutasjoner har søskentest.
- Invitasjonsutsending eller ekte brukeropprettelse i Auth.
- Lanseringsklar app.
