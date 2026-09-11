# Manuell SG — komplett skjermleveranse

**Versjon 11.09.2026.** Funksjonskode `c6352c2d2`, basert på main `2807d4d08`. Anders har bestilt innlegging i main og et komplett designunderlag. Retning: valgt Train-lock ZIP (4), Geist/Geist Mono, prosjektets lyse og mørke tema.

Skjermene er implementert. Dette dokumentet beskriver den faktiske leveransen og den lokale designpakken. Se [funksjonskortet](../planer/funksjon-manuell-sg.md) for regler, lagring, tilgang og alle 21 felt.

## Skjermkart

| ID | Skjerm | Appadresse | Hovedhandling og videre vei |
|---|---|---|---|
| SG-01 | Rundeliste | `/portal/mal/runder` | Score og manuell SG → ny registrering; velg eksisterende runde → SG-04 |
| SG-02 | Ny runde, enkel SG | `/portal/mal/runder/ny` | Bane, dato, brutto score og fem SG-felt → lagre → SG-04 med kvittering |
| SG-03 | Ny runde, avansert SG | Samme adresse som SG-02 | Enkel/Avansert skifter detaljnivå i samme skjema; alle 21 felt kan fylles ut |
| SG-04 | Rundedetalj | `/portal/mal/runder/[id]` | Se score og faktiske SG-tall; Rediger SG-tall åpner SG-05 |
| SG-05 | Rediger SG | Inne i SG-04 | Enkel eller avansert redigering; lagre eller avbryt uten sideskifte |

Det er fem skjermtilstander fordelt på tre eksisterende adresser. Redigering er et innebygd skjema, ikke en egen app eller et ekstra menypunkt. Analyse og hovedmenyen beholdes. Kartbasert føring som UpGame er en senere bestilling.

## Struktur og komponenter

Rundelisten og rundedetaljen bruker dagens V2Shell og PlayerHQ-meny. Mobil har den valgte flytende bunnmenyen; desktop har smal sidemeny. Nyregistreringen bruker faktisk sidetittel, hjelpekort, bane/dato, score, SG, valgfritt notat og lagreknapp i denne rekkefølgen.

| Del | Faktisk komponent | Oppførsel |
|---|---|---|
| Rundeliste | `RunderV2` | Brutto score, dato, bane og kjent SG; egen tomtilstand |
| Ny registrering | `RundeNyForm` | Starter med tom totalscore; hull-for-hull kan velges |
| Felles SG-felt | `ManuellSgFelt` | To kolonner; én under 360 px. Fem hovedfelt og 16 avanserte detaljer |
| SG-redigering | `ManuellSgRedigering` | Forhåndsutfylte tall, fokus på første felt, lagringsstatus, feil og avbryt |
| Rundedetalj | `RundeDetaljV2` | Kvittering, kilde, SG per kategori, detaljer og eksisterende scorekortfunksjoner |

SG-feltene bruker 16 px talltekst, 14 px etiketter, minst 48 px felthøyde og 44 px fortegnsknapp. Skjemaruten har 16 px radavstand og 12 px kolonneavstand. Input har 10 px hjørner; redigeringsområdet har 14 px hjørner og 18 px innvendig luft (14 px på smal telefon). Verdiene kommer fra eksisterende [SG-stilark](../../src/components/portal/runde-ny/manuell-sg.module.css). Farger og fonter kommer fra `--tl-*`, ikke en ny parallell profil.

Positiv og negativ SG bruker samme tallformat og samme grafskala fra null. Ukjent verdi markeres med strek eller «Ikke registrert». Små tall bruker nøytral tekst. Hver registrering forklarer referanse, komma/punktum og at ukjente felt kan stå tomme. Fortegnsknappen støtter mobilens desimaltastatur.

## Dekning i designpakken

Det lokale galleriet viser 18 tilstander ved 390 × 844 og 1440 × 1000, i lyst og mørkt tema: **72 komplette skjermbilder**. Hele sidehøyden er tatt med. Bunnmenyen er festet til nettleservinduet og kan derfor ligge midt i et langt helsidebilde.

- Rundeliste med data og tom rundeliste.
- Nyregistrering tom, enkel og avansert.
- Total som ikke stemmer, lagring pågår og lagringsfeil med bevart kladd.
- Rundedetalj med alle kategorier, kvittering, delvis registrering og coachens lesevisning.
- Enkel/avansert redigering, lagringsfeil, konflikt fra annen fane, bekreftet lagring og erstatning av estimert SG.

Dette supplerer de 20 tidligere nettleserkontrollene, inkludert 320/834/1280 px og 200 % zoom. Alle de 72 nye variantene er kontrollert for sideveis scrolling og JavaScript-feil. Designpakken bruker de faktiske sidekomponentene og det faktiske navigasjonsskallet. Innlogging, data, rutetransport, Caddie og eksternt søk er isolert i prøven; ingen kontodata eller meldinger sendes.

## Leveransefiler

Privat, ignorert mappe i SG-arbeidsmappen: `_archive/manuell-sg-2026-09-11/design/`.

- `index.html`: selvstendig skjermgalleri med valg av skjerm, format og tema.
- `app.html`: klikkbar prototype av faktisk rundeliste, registrering og rundedetalj.
- `bilder/`: alle 72 skjermbilder med skjerm-ID, bredde og tema i filnavnet.
- `skjermregister.json`: kobling mellom kodeversjon, skjerm, tilstand og bilde.
- `tokens.css`, `geist.css`, `app.css`, `global.css`: de faktiske designverdiene, lokale fonter og rendret stilgrunnlag.
- `les-meg.md`: kort inngang til pakken, kildefiler og begrensninger.

En ZIP av pakken er egnet for overlevering til Claude Design. Den inneholder ingen hemmeligheter eller ekte spillerdata. Skjermbildene er ikke lagt i `public/` eller i Git. Den vedlikeholdte beskrivelsen og funksjonskoden ligger i repoet.

## Status og videre designarbeid

Skjermene er implementert og komponentprøvd, men ikke vurdert visuelt av Anders. Den bestilte innleggingen i main er autorisert; dette er ikke en påstand om at ekte innlogging/databaselagring er prøvd i nettleser eller at hele appen er lanseringsklar. Den prøven og prosjektets kjente felles kontrastavvik står fortsatt på listen før åpen lansering.

Hvis pakken tas til Claude Design, behold de fem skjermene, alle feltene, enkel/avansert-bryteren, ukjente verdier, fortegn, kvittering, eier/lesetilgang, feil/nytt forsøk og avbryt. En eventuell revidert tegning skal vise samme syntetiske tall og de samme tilstandene, og leveres med en navngitt versjon før den bygges. Kartfunksjoner og ny SG-beregning holdes utenfor denne designleveransen.
