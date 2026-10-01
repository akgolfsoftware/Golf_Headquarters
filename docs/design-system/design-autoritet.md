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

- **Claude Design** eier designet og lager/vedlikeholder det i «AK Golf Precision Athletics».
  Designleveransen skal bevare funksjonene og ha konkrete skjermer, tilstander og handlingsbeskrivelser.
- **Codex** eier appkoden, bygger designet, kontrollerer funksjon og sammenligner appen med den valgte
  designleveransen. Arbeidsdelingen er bekreftet av Anders 30.09.2026.
- Claude Design vedlikeholder designprosjektets egne autoritets- og overleveringsfiler.
  Codex oppdaterer prosjektets aktive dokumentasjon og minne ved bygging.
- Gjennomføringen følger [fullføringsplanen](../planer/codex-fullforing-claude-design-2026-09-30.md).

## Valg og spørsmål

Det skal ikke spørres på nytt om hvilket designsystem som gjelder. Beslutningen endres bare ved en
ny, uttrykkelig beskjed fra Anders.

Når flere skjermvarianter finnes i samme designsystem, kan Anders fortsatt velge hvilken konkret
variant Codex skal bygge. Dette er et skjermvalg, ikke en ny diskusjon om designsystemet.

Produktregler, tilgang, personvern, sikkerhet og datamodeller endres ikke av denne
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
