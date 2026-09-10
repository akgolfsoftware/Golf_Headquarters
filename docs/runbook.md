# Drift og gjenoppretting

**Status 10.09.2026: driftsoppsettet er ikke verifisert i denne oppryddingen.** Dette dokumentet beskriver hva som må kontrolleres og dokumenteres. Det hevder ikke at sikkerhetskopier, varsler, et testmiljø eller gjenoppretting allerede fungerer.

## Kilder i prosjektet

- `src/instrumentation.ts` og relevante feilhåndterere: appens logging og rapportering.
- `src/lib/rate-limit.ts`: faktisk oppførsel ved trafikkbegrensning.
- `vercel.json` og `.github/workflows/`: drift og byggrutiner slik de er konfigurert i Git.
- `prisma/` og `supabase-meg/`: separate skjemakilder. En SQL-fil beviser ikke at den er kjørt.
- [Sikkerhetsrutiner](../SECURITY.md) og [personverndokumentasjon](gdpr/behandlingsregister.md).

## Ved en hendelse

1. Dokumenter hvilken versjon, adresse og brukerrolle som er berørt, uten persondata eller hemmeligheter.
2. Sjekk konkrete feil og integrasjonsstatus. Begrens videre skade innenfor autorisert tilgang.
3. Velg en dokumentert retting eller en tidligere fungerende versjon. En tilbakeføring av appkode tilbakefører ikke automatisk databasen.
4. Test den berørte kundereisen, inkludert avviste handlinger og allerede betalte bestillinger.
5. Før årsak, retting og gjenstående arbeid i feilloggen. Kundemeldinger og produksjonsendringer følger egen autorisasjon.

## Bevis som må foreligge før åpen lansering

| Område | Dokumenter etter faktisk kontroll |
|---|---|
| Databasebackup | Miljø, tidspunkt for siste backup, faktisk oppbevaring og hvem som har tilgang |
| Gjenoppretting | Dato for test i separat miljø, valgt backup, forventede og faktiske data, målt tid |
| Filer og video | Hvor filene lagres og hvordan de sikres og gjenopprettes sammen med databasen |
| Feilvarsling | En syntetisk feil som faktisk utløser og leverer varselet |
| Betaling | Betalt/avvist/avbrutt kjøp, gjentatt webhook, kvittering, avbestilling og eventuell refusjon |
| Tilganger | Tillatte og avviste roller, coachens egne/andres spillere, forelder/barn |

Lagre daterte, anonymiserte kontrollnotater i `docs/beslutningsgrunnlag/`. Ikke fyll inn antatt backupplan, prisnivå eller tidsløfte fra hukommelsen.

[Runbook før oppryddingen](arkiv/opprydding-2026-09-10/runbook.md) er bevart som historikk. Den inneholder uverifiserte påstander og er ikke en gjeldende kjøreoppskrift.
