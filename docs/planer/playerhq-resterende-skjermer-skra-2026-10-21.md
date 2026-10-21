# PlayerHQ i Skrå: resterende skjermer

Utkast 21.10.2026. Fortsetter etter pakke 2–11 (lagt inn, pakke 11 i #1588).
Oppskriften per pakke står i `skra-drakt-playerhq-agencyos-plan-2026-10-20.md` §2. Fasit er
`docs/design-system/utkast-skra/index.html`. Én PR per pakke, auto-merge når verify og CI er grønne.

**Merk om kartleggingen:** listen under er funnet ved å sjekke om sidens direkte importer bruker
`SkraTopp`. Det kan gi falske treff (sider som bruker toppen via en annen komponent). Hver pakke
starter derfor med å åpne siden i 390 og 1280 px og bekrefte at den faktisk mangler Skrå.

## Pakker

| # | Pakke | Ruter (kandidater) | Merknad |
|---|---|---|---|
| R1 | **Målsetninger og utviklingssjekk** | `/portal/mal` (+ `ny`, `goal/[id]`, `runder/ny`), `/portal/mal/evaluering` (Utviklingssjekk og sesongevaluering), Måltall «alle målsetninger» | Gjenstår fra pakke 10. Utviklingssjekk bare for WANG- og TN-spillere |
| R2 | **Runder og baneguide** | `/portal/gameplan/[baneId]` (+ `hull/[nr]`, bytt eksempeldata mot ekte), `/portal/mal/runder/[id]/hull` og `/slag` (Rediger slag/hull), `/portal/(fullscreen)/runde/live` | Fullskjerm-sider er alltid lyse, ingen topp |
| R3 | **Stats-dybde** | `/portal/statistikk/[metric]`, `/portal/analysere/hull`, `/portal/analysere/trackman/[id]`, `/portal/analysere/datagolf/stasjon`, `/portal/mal/sg-hub/coach/...` | Data Golf bare ADMIN. SG-hub for coach: sjekk om siden skal sende til Stats (§STATS-RESTEN) |
| R4 | **Tester** | `/portal/tren/tester/ny`, `/ny/egen`, `/team-norway`, `/portal/trening/putte-laboratoriet` | Etter testbatteri-beslutningen (19 tester i tre deler) |
| R5 | **Turneringer og økt** | `/portal/tren/turneringer/[id]`, `/portal/(fullscreen)/tren/wb/[sessionId]`, `/portal/planlegge/opptatt` | |
| R6 | **Booking** | `/portal/booking/[bookingId]`, `/bekreftet`, `/anlegg/[anleggId]`, `/coach/[coachId]`, `/portal/meg/bookinger` | Betaling bare kort og Apple Pay. Ingen ekte betaling i test |
| R7 | **Meg: undersider** | `meg/helse`, `meg/deling` (+ `innsyn`), `meg/sikkerhet/2fa`, `meg/innstillinger/*` (integrasjoner, anlegg, personvern, eksport, sikkerhet, språk, varsler), `meg/help/kontakt`, `meg/help/kategori/[slug]` | Hjelp: «Skriv til oss» er ett skjema. Deling: @wang.no og @golfforbundet.no |
| R8 | **Utfordringer, drills og coach** | `/portal/utfordringer` (+ `[id]`, `ny`), `/portal/drills/[id]`, `/portal/coach/ovelser`, `/portal/coach/ai`, `/portal/coach/sporsmal/[id]`, `/portal/varsler` | Utfordringer: bare gruppa, ingen delt lenke. Venner er skjult |
| R9 | **Innboks-varianter** | Bjella `/portal/varsler` og meldingstilstander | Kan slås sammen med R8 |

## Rekkefølge

1. **R1** først (avtalt neste steg i forrige økt). Svar fra Anders på om R1 tas nå.
2. **Bølge 1** (maks 3 samtidig): R2, R4, R7. Rører ikke de samme filene.
3. **Bølge 2:** R3, R5, R6.
4. **Bølge 3:** R8, R9.
5. **F3 til slutt:** globale tokens (kort 12 til 18 px, myk skygge) når alle sidene er portert.

## Ferdig når

- Hver rute er åpnet og målt i 390 og 1280 px uten sidelengs rulling og uten konsollfeil.
- Manglende data vises som «—», aldri demodata.
- `npm run verify` er grønn per PR.
- De sidene som ikke kunne ses uten data (Live aktiv, Slagteller, PEI-testgjennomføring, Økt,
  Flytt time, Del runde, Fireukerssjekk, Spillerprofil, Fysisk økt) ses av Anders på telefon under
  en ekte økt.

## Åpne spørsmål til Anders

1. Tas Utviklingssjekk og Måltall (R1) nå?
2. Overskriftsskrift og IBM Plex på store tall (åpent fra før).
3. `PH04LiveBrief.tsx` er ubrukt kode: slettes i R2, hvis du sier ja.
4. Egne toppbilder til sider uten passende bilde (de 11 AK Golf-bildene holder til første runde)?
