# R-J — samtykkegrunnlag 13.09.2026

Gren: `grok/r-j-samtykke-2026-09-13`. Ingen visuell portering. Ingen migrasjon, aldri 16 → 13.

## Hva som er rettet

Deling til Team Norway/WANG sjekket bare flagget «trenger foresatt». En 15-åring uten det flagget kunne gi deling selv, og en ekstern leser kunne se testdataene. Samme 16-årsregel som helse gjelder nå: flagg eller fødselsdato, det strengeste vinner. Tilbaketrekking er fortsatt alltid tillatt.

## Hva som er prøvd

- Maskinlesbart register over formål, opplysningstype, alder, rolle, deling, lagringssted og historikk. [`src/lib/gdpr/samtykke-register.ts`](../../src/lib/gdpr/samtykke-register.ts)
- Spillerens helsesamtykke: ukjent type, feil rolle og regel-feil skriver ingenting.
- Manuell helselogg skrives ikke uten gyldig samtykke.
- Deling: SELV-gi under 16 uten flagg avvises; trekk skriver ny rad.
- Ekstern leser får ikke innsyn på SELV-rad fra under 16 uten flagg.

## Bevisst uendret

- Aldersgrensen er 16.
- Samtykketekster i UI er ikke omskrevet. De venter på avklart grunnlag per formål.
- Lydsamtykke er fortsatt én rad som oppdateres, ikke append-only historikk.
- Eksport/sletting har de kjente hullene i [rettighetsstatus](../gdpr/rettigheter-status.md).

## Ikke påstått

- Innlogget isolert reise.
- At alle 164 serverhandlinger har søskentest.
- Lanseringsklar personverntekst.
