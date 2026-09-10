# Revisjonsfunn 10.09.2026

Gjennomgang før oppryddingen, mot lokal kode ved `a619ec5df`. Ingen faktisk kundekonto, betalingskonto eller produksjonsdata ble brukt. Funnene er fortsatt åpne; oppryddingen endrer ikke funksjonene.

| ID | Funn og kodekilde | Bevis og avgrensning |
|---|---|---|
| R1 | `src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions.ts`: generell COACH/ADMIN-godkjenning uten kontroll av tilknytning til spilleren | Uendret funksjon kjørt isolert med falsk database: uvedkommende coach fikk `ok: true` og ett skrivekall. Produksjon/RLS ikke prøvd. Beslektet lesetilgang må gjennomgås samtidig. |
| R2 | Samme mappes `tapper-shell.tsx`: avslutning lagrer tellinger og navigerer videre, uten å fullføre status. `src/lib/portal-live/live-route.ts` sender aktiv økt tilbake | Kodegjennomgang. Workbench-sammendragets faktiske datakilder må også kobles til lagrede resultater. Ingen full kundereise testet. |
| R3 | `src/app/portal/page.tsx` bruker Workbench; `getWeekOverview` i `src/app/portal/actions.ts` leser TrainingSessionV2 | Mulig brudd mellom Plan og I dag, utledet av koden. Eventuelle produksjonstriggere er ikke undersøkt. |
| R4 | `src/components/marketing/v2/MarkedBookingV2.tsx` bruker blant annet `bkp`, `herofakta` og `toppin` uten tilsvarende stildefinisjoner i prosjektets kilde | Uendret komponent rendret isolert med appens CSS viste manglende bookingutforming. Ikke et skjermbilde av produksjonens komplette sideskall. |
| R5 | `src/app/(marketing)/booking/[slug]/bekreft/actions.ts` løser valgt coach, men bruker tjenestens faste coach eller null ved senere lagring og kollisjonskontroll | Betinget feil for tjenester uten fast coach. Faktisk tjenestekatalog er ikke lest. |
| R6 | Portalens TALENT-vakt etterfølges av en FULL-vakt i `loadPlayerDay` | Isolert kjøring med falsk bruker passerte første vakt, men ble deretter sendt til oppgradering. Ikke en produksjonstest. |
| R7 | `next.config.ts` sender `/portal/ny-okt` til `/portal/gjennomfore/ny-okt` og tilbake igjen | Begge regler finnes i konfigureringen. Ingen konfigurering endret under opprydding. |
| R8 | `publishSessions` i `src/lib/workbench/wb-actions.ts` validerer og oppdaterer fortløpende | Isolert kjøring: første økt ble publisert før andre økt ga feil. Resultatet var feilrespons med delvis lagring. |
| R9 | Full betalingstest er hoppet over i `tests/e2e/booking-drop-in.spec.ts`; tidligere driftsdokumentasjon mangler bekreftet gjenoppretting | Åpen lansering mangler samlet bevis for betaling og drift. Det betyr ikke at alle delene mangler kode. |

## Gjennomførte kontroller i revisjonen

- Typekontroll bestod.
- 104 utvalgte tester i ni filer bestod, ingen hoppet over.
- Statisk kontroll av innloggingskrav på server actions bestod. R1 viser hvorfor den ikke beviser korrekt tilgang til hver enkelt spiller.
- Isolerte skjermbilder for I dag, Plan og booking på mobil og desktop. Ikke en full tilgjengelighets- eller nettlesertest av hele appen.

Full visuell dokumentasjon ligger lokalt i Codex-artefakten `ak-hq-revisjon/les-meg.md` fra samme oppgave. Den ble ikke kopiert inn i offentlig Git. Nye fullstendige flyttinger og kontroller dokumenteres i `docs/vedlikehold/prosjektkart.md`.
