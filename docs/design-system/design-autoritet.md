# Gjeldende designautoritet — 21.09.2026

Dette dokumentet er den styrende designbeslutningen for AK Golf HQ. Ved konflikt med eldre
designfiler, planer, minner, kommentarer eller kode vinner dette dokumentet.

## Det som gjelder nå

- **AK Golf Design System** er designsystemet for AK Golf-paraplyen.
- **Claude Design-prosjektet «App design»** er den aktive arbeidsflaten for AK Golf HQ.
- Arbeid som Anders bestiller og viderefører i dette prosjektet fra 21.09.2026, skal bruke dette
  designsystemet og bygge videre på siste faktiske versjon i prosjektet.
- Designsystem-ID: `87aa23fb-8eac-4ca4-aaa0-7a636f4318ff`.
- App design-prosjekt-ID: `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70` (Precision Athletics, opprettet 25.09.2026; tidligere prosjekt `830e7bce` beholdt som arkiv).

Dette er et bindende valg av designsystem og visuell retning. Det skal ikke behandles som en
åpen kandidat eller en midlertidig smakstest.

## Det som er utgående

- **Train-lock** er ikke lenger visuell fasit, designretning eller kilde for nye skjermer.
- **Paper** er ikke lenger visuell fasit, designretning eller kilde for nye skjermer.
- Eksisterende appkode med Train-lock-, `v2`- eller eldre Paper-navn kan beholdes midlertidig mens
  funksjoner flyttes kontrollert. Navnene gir ingen visuell autoritet.
- Eldre dokumenter og minner som kaller Train-lock, Paper eller en tidligere pakke «låst»,
  «valgt» eller «fasit», er historikk. De kan brukes til funksjonsinventar og sporbarhet, aldri til
  å styre ny utforming.

## Arbeidsdeling

- **Claude Code og Claude Design** leser koden, bevarer funksjonene og lager/vedlikeholder designet
  i «App design» med AK Golf Design System.
- **Codex** bygger designet i appkoden, kontrollerer funksjon og sammenligner appen med den valgte
  designleveransen.
- Claude Code skal oppdatere designprosjektets egne autoritets-, overleverings- og minnefiler når
  retningen utvikles. Codex skal oppdatere prosjektets aktive dokumentasjon og minne ved bygging.

## Valg og spørsmål

Det skal aldri spørres på nytt om AK Golf Design System, Train-lock eller Paper skal gjelde.
Beslutningen endres bare ved en ny, uttrykkelig beskjed fra Anders.

Når flere nye skjermvarianter finnes i samme gjeldende designsystem, kan Anders fortsatt velge
hvilken konkret variant Codex skal bygge. Dette er et skjermvalg, ikke en ny diskusjon om
designsystemet.

Produktregler, tilgang, personvern, sikkerhet og datamodeller endres ikke automatisk av denne
designbeslutningen.

## Typografi- og presisjonsbeslutning — 24.09.2026

Anders har 24.09.2026 bestilt oppgradering til det komplette AK Golf Design Systemet:

1. **Typografi:**
   - **IBM Plex Sans** (400, 500, 600, 700) er enhetlig skrifttype for overskrifter (display), knapper, menyer og brødtekst i hele appen. Oswald og Archivo er formelt utgått.
   - **IBM Plex Mono** (400, 500, 600) er skrifttype for alle tall, klokkeslett, TrackMan-vinkler, yardages, prosenter og metadata.
2. **Geometri og taktil radius:**
   - Standardiseres til 8 px for kort, knapper, innboksrader og kontroller (12 px for ark/modaler, 999 px for piller/badges). Klossete 0–2 px-verdier utgår.
3. **Visuelt hierarki:**
   - Oppgaven og øvelsesnavnet er det primære blikkfanget. Kategorier og akser (FYS, TEK, SLAG, SPILL, TURN) tones ned til diskrete, elegante merkelapper (badges) med dempet fargetone.

