# O05/O07 — forelder og delt innsyn, teknisk kontroll 12.09.2026

Gren: `grok/o05-forelder-delt-innsyn-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling, e-postutsending eller utrulling.

## Hva som er prøvd

Testene kaller de eksporterte handlingene, ikke bare hjelpefunksjonene. Uvedkommende avvises, og skriving skjer ikke.

- Barnbytte: `velgGodkjentBarn` og `hentForelderOversikt` bytter mellom to godkjente barn. Feil eller ugodkjent id gir tomt innhold, ikke et annet barns tall.
- Eierskap: `hentBarnForForelder`, `hentBarnHvisTilhoerer` og `assertBarnTilhorerForelder` krever `approved: true`.
- Avvist skriving: `lagreSamtykker`, `settDelingsSamtykkeForBarn`, `settHelseSamtykkeForBarn`, `beOmDataeksport` og `beOmDataSletting` avviser ugodkjent relasjon, andres barn og spiller-rolle.
- Ugyldig/utløpt lenke: `aksepterInvitasjon` og `confirmGuardianConsent` avviser manglende, utløpt og allerede brukt token uten å opprette relasjon. Samtykkelenken avviser også feil opphav.
- Tilbakekalling: `settDelingsSamtykkeForBarn` og `trekkDelingsSamtykke` skriver `gitt=false`. `trekkEksternLeser` er ADMIN-only, setter `revokedAt` og fjerner alle tre innsyn-capabilities. Trukket leser har tomt scope.

## Tekniske rettinger

- Forelderhjelpere filtrerte tidligere kun `parentId`. En ugodkjent `ParentRelation` kunne lese barnets oversikt, booke og åpne barn-siden. Godkjent relasjon er nå påkrevd.
- Oversikt/ukerapport kan velge barn-id uten å falle tilbake til første barn.
- `trekkEksternLeser` fjernet test- og stats-capability, men lot komplett-profil stå. Alle tre trekkes nå.

## Isolert testdatabase — blokkering

Samme blokkering som [P0-TEST](p0-test-blokkering-2026-09-12.md): Docker og lokal tom testdatabase mangler. Innlogget nettleserreise og visuell barnvelger er ikke bevis i denne leveransen.

## Ikke påstått

- Innlogget Next-/database-reise.
- Betaling for barn (O06).
- Visuell godkjenning, D0 eller lanseringsklar app.
- At alle 168 serverhandlinger har egen avvisningstest.
