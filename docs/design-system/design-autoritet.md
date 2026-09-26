# Gjeldende designautoritet — 26.09.2026

Dette dokumentet er den styrende designbeslutningen for AK Golf HQ. Ved konflikt med eldre
designfiler, planer, minner, kommentarer eller kode vinner dette dokumentet. Beslutningen står i
[beslutninger.md](../../.claude/rules/beslutninger.md) §PRECISION ATHLETICS ER DESIGNSYSTEMET FOR AK GOLF HQ.

## Det som gjelder nå

- **Claude Design-prosjektet «AK Golf Precision Athletics»** er designsystemet og arbeidsflaten
  for AK Golf HQ: PlayerHQ (`/portal`), AgencyOS (`/admin`), forelder, `/auth`, booking og
  statistikk.
- Prosjekt-ID: `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`.
- Primærknappen er grafitt `#141413`. Rust `#9B2415` er bare signal: det som haster eller
  ødelegger, Live-pillen og tellere som krever coachens handling. Maks én per skjerm.
- Lyst tema er standard. Nattema (`data-theme="night"`) brukes i Live-økt og slagregistrering ute.
- Team Norway og WANG har egne systemer og er utenfor. Markedssidene venter.

Dette er et bindende valg av designsystem og visuell retning. Det skal ikke behandles som en
åpen kandidat eller en midlertidig smakstest.

## Det som er utgående

- **AK Golf Design System** (`87aa23fb`) og **«App design»** (`830e7bce`) var fasit 21.–26.09.2026.
  «App design» finnes ikke lenger i Claude Design. Begge er historikk.
- **Train-lock** og **Paper** er ikke visuell fasit, designretning eller kilde for nye skjermer.
- Eksisterende appkode med Train-lock-, `v2`- eller eldre Paper-navn kan beholdes midlertidig mens
  funksjoner flyttes kontrollert. Navnene gir ingen visuell autoritet.

## Arbeidsdeling

- **Claude Code og Claude Design** leser koden, bevarer funksjonene og lager/vedlikeholder designet
  i «AK Golf Precision Athletics».
- **Codex** bygger designet i appkoden, kontrollerer funksjon og sammenligner appen med den valgte
  designleveransen.
- Claude Code skal oppdatere designprosjektets egne autoritets-, overleverings- og minnefiler når
  retningen utvikles. Codex skal oppdatere prosjektets aktive dokumentasjon og minne ved bygging.

## Valg og spørsmål

Det skal ikke spørres på nytt om hvilket designsystem som gjelder. Beslutningen endres bare ved en
ny, uttrykkelig beskjed fra Anders.

Når flere skjermvarianter finnes i samme designsystem, kan Anders fortsatt velge hvilken konkret
variant Codex skal bygge. Dette er et skjermvalg, ikke en ny diskusjon om designsystemet.

Produktregler, tilgang, personvern, sikkerhet og datamodeller endres ikke av denne
designbeslutningen.
