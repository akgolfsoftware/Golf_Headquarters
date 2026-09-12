# R-I — handlingstilgang og ressursavgrensning, teknisk kontroll 12.09.2026

Gren: `grok/r-i-handlingstilgang-2026-09-12`. Ingen visuell portering. Ingen migrasjon, produksjonsdata, betaling eller utrulling.

## Hva som er prøvd

Testene kaller de eksporterte handlingene, ikke bare hjelpefunksjonene. Uvedkommende avvises, og skriving skjer ikke.

- PlayerHQ: video-notat på fremmed plan-økt; fys-logg uten tilgang.
- AgencyOS: coach-notat og pin på spiller utenfor stallen; live-melding på økt en annen coach eier.
- Team Norway: gruppepost fra spiller og fra coach uten gruppemedlemskap.
- WANG: IUP-lagring fra eleven selv, selv når ressursgrensen ellers ville sluppet inn.
- Forelder: skoletid for andres barn.

`scripts/check-action-auth.mjs` feiler nå også når en kjent tilgangsvakt importeres uten å kalles.

## Tekniske rettinger

- Coach-notater krevde bare COACH/ADMIN. En coach kunne knytte notat til en hvilken som helst spiller-id; notatet kunne vises på spillerkortet. Skriving, lesing, oppdatering og sletting krever nå stalltilgang.
- Fys-logg sjekket bare direkte enrollment, ikke gruppetilgang. Den bruker samme `canAccessPlayer` som øvrige spillerhandlinger.
- IUP-samtalen under coach-flaten lot eleven lagre trenerens vurdering. Lagring krever COACH eller ADMIN i tillegg til WANG-ressursgrensen.

## Isolert testdatabase — blokkering

Samme blokkering som [R-E-kontrollen](playerhq-r-e-spillerreise-2026-09-12.md): Docker og lokal tom testdatabase mangler. Innlogget nettleserreise er ikke bevis i denne leveransen.

## Ikke påstått

- Alle 168 serverhandlinger har egen avvisningstest.
- Innlogget Next-/database-reise.
- Visuell godkjenning, D0 eller lanseringsklar app.
