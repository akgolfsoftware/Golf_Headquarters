# Gjeldende designautoritet

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

## Valgt videreføring — 11.10.2026

Anders har valgt **retning A**, lys premium med radius 8 for AK. Nattflatene videreføres
der de allerede gjelder. Heltebilde er valgfritt og krever en fullverdig variant uten
bilde; tekst plasseres ikke på bildet. IBM Plex Sans brukes til titler, knapper og
løpende tekst. Mono brukes til tall, tid og dato, ikke automatisk til all metadata.
Dette presiserer den eldre typografibeslutningen nedenfor. WANG og Team Norway beholder
sine egne visuelle profiler; AKs radius, nattflater og fonter skal ikke spres til dem
gjennom globale overstyringer.

Precision-prosjektet er fortsatt systemkilden. Skjermene finnes i Claude Design-prosjektet
**AK Golf HQ**, `3b49e40a-3f69-466e-8b51-c6fd4b2e9408`. Sist kontrollerte leveranse i
disse to prosjektene er **3.1.0-l**. Det er ikke appens versjonsnummer eller bevis på
at hele leveransen er portert til `src/`.

| Fil i Claude Design | Byte | SHA-256 |
|---|---:|---|
| `_ds_bundle.js` | 2 057 977 | `84bd1b1909de3da6ff05893ef283b67fed97eca34aa5197b373c53f9a19f18dd` |
| `_ds_manifest.json` | 154 517 | `155f4762506579fa56e384ee06de7d1810e2294d5177ef3a386fd147c80cfbea` |

Dette er identiteten fra den kontrollerte designoverleveringen. Filene er ikke importert
som en komplett ny kildepakke i dette repoet. Speilet fra 28.09 er historisk byggeunderlag.
Nye porter må navngi hvilke komponenter og tilstander de faktisk overfører, og bevare
appens ekte datakoblinger. [Integrasjonskontrollen](../design-audit/precision-appintegrasjon-2026-10-11.md)
skiller designprosjektene, appkode, tester og gjenstående visuell kontroll.

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
   - ~~Standardiseres til 8 px for kort~~ Overstyrt 20.10: kort 18 px og statkort 14 px med myke skygger (beslutninger.md §PLAYERHQ OG AGENCYOS FÅR SKRÅ-DRAKTEN). Knapper, innboksrader og kontroller 8 px, piller 999 px. Klossete 0–2 px-verdier utgår.
3. **Visuelt hierarki:**
   - Oppgaven og øvelsesnavnet er det primære blikkfanget. Kategorier og akser (FYS, TEK, SLAG, SPILL, TURN) tones ned til diskrete, elegante merkelapper (badges) med dempet fargetone.
