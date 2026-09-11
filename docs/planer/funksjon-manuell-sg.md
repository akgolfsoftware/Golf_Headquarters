# Manuell registrering av Strokes Gained

Bestilt av Anders 11.09.2026: implementer enkel og avansert inntasting av SG med alle kategorier. Utbedring av planen for komplette kartfunksjoner som UpGame kommer senere.

**Status:** implementert på `codex/manuell-sg-2026-09-11`, oppdatert mot main `2807d4d08` (PR #835). Full kvalitetskontroll, 2 349 tester og 20 nettleserkontroller har bestått. Ikke lagt i main eller publisert. Anders har ikke vurdert den ferdige visningen ennå.

## Behov og brukerreise

Spilleren skal kunne legge inn SG-tall fra en spilt runde uten å registrere alle slagposisjonene. SG betyr slag vunnet eller tapt mot en referanse.

1. Åpne Runder → Score og manuell SG.
2. Velg bane og dato, og oppgi brutto totalscore. Hull-for-hull er også tilgjengelig.
3. Bruk Enkel for SG totalt og de fire hovedkategoriene. Åpne Avansert for alle detaljkategorier.
4. Lagre runden og se tallene på rundedetaljen. Ukjente verdier forblir ukjente.
5. Bruk Rediger SG-tall på en eksisterende runde for å korrigere eller supplere tallene.

Lagringsfeil beholder innholdet i skjemaet, og nytt forsøk bruker samme registrerings-ID. Endringer i en annen fane avvises ved SG-redigering hvis tallene siden er endret. Avbryt forkaster bare den åpne redigeringskladden.

## Felter og faglige regler

Enkel visning har fem felt. Avansert har de samme fem og 16 detaljer, totalt 21. Felt og intervaller følger dagens Round-modell og [beregningen fra slag](../../src/lib/runde-logg/granulaer-sg.ts). Felles definisjon ligger i [manuell-sg.ts](../../src/lib/portal-runder/manuell-sg.ts).

| Gruppe | Felt |
|---|---|
| Hovedkategorier | SG totalt, utslag (OTT), innspill (APP), nærspill (ARG), putting |
| Tee | Alle tee-slag, også utslag på par 3 |
| Innspill | Til og med 75 m; over 75–125 m; over 125–175 m; over 175 m |
| Nærspill | Chip til og med 12 m; pitch; lob; bunker |
| Putting | Til og med 3 fot; over 3–5; over 5–10; over 10–15; over 15–25; over 25–40; over 40 fot |

- Komma, punktum, plusstegn og minustegn støttes. Fortegn kan også byttes med egen knapp på mobil. Gyldig område er −100 til +100 per felt.
- Tomt betyr ikke registrert; nulltallet 0 betyr faktisk registrert null. En delvis registrering fylles aldri ut med gjetninger.
- Total beregnes fra de fire hovedkategoriene bare når alle fire er oppgitt og totalen er tom. Oppgitt total tillater inntil 0,03 forskjell fra summen for avrunding.
- Detaljer summeres ikke til hovedkategori eller total. Tee/OTT og pitch/lob kan overlappe. Analysevisningen viser derfor detaljfeltene uten en misvisende totalsum.
- Samme referanse skal brukes i alle felt for runden. Manuell registrering omregner ikke mellom referanser. Rundedetaljen merker tallene som manuelle og bruker «din referanse».
- Tall i avansert visning beholdes ved bytte til enkel visning. Dette opplyses i skjemaet.
- Minst ett SG-tall kreves ved egen SG-redigering. En ny runde kan fortsatt lagres uten manuell SG, med appens eksisterende estimering der den gjelder.

## Kode, lagring og tilgang

- Ny registrering bruker den eksisterende [rundehandlingen](../../src/app/portal/mal/runder/ny/actions.ts). Runde og eventuelt scorekort lagres samlet. En stabil ID hindrer dobbel runde ved gjentatt innsending.
- [SG-redigeringen](../../src/app/portal/mal/runder/%5Bid%5D/sg-actions.ts) oppdaterer bare de 21 SG-feltene og setter `sgSource = manual`. Score, scorekort og slag beholdes. Den eksisterende SG-broen oppdateres etter lagring.
- Manuelle tall overskrives ikke av appens automatiske SG-beregning. Et manuelt felt er nok til å stoppe estimert utfylling av de øvrige feltene ved nyregistrering.
- Innlogging, samtykke og gjeldende TALENT-tilgang kontrolleres på serveren. Bare rundens eier kan endre SG. Coachinnsyn på rundedetaljen bruker prosjektets eksisterende kontroll for spillerrelasjon; andre spillere avvises.
- Ingen databaseskjemaer, migrasjoner, produksjonsoppsett eller eksterne integrasjoner er endret.

## Design og kontroll

Dette er en funksjonsutvidelse av eksisterende runderegistrering og PH-12. Felles komponenter og `--tl-*`-verdier videreføres. SG-grenen er avstemt mot den nye main-versjonen med valgt Train-lock ZIP (4), inkludert Geist og felles tema. Ingen egen ny tegning for SG er valgt; videre visuell vurdering følger [designstatus](../../designsystem/README.md).

| Kontroll | Resultat 11.09.2026 |
|---|---|
| Nye tester av tall, reelle serverhandlinger og rundelesing | 22 bestått; database og innlogging er erstattet med isolerte testimplementasjoner |
| Hele testsuiten | 2 349 bestått: 2 345 funksjonstester og 4 komponenttester, etter oppdatering mot main |
| Nettleserprøve | 20 bestått; ekte React-komponenter og stilark, simulert lagring/navigasjon, ingen JavaScript-feil |
| Mobil og desktop | 320, 390, 834 og 1280 px i lyst/mørkt tema; 200 % desktopzoom; ingen sideveis scrolling i avansert redigering |
| Visuell egenkontroll | Registrering på 390 px og avansert redigering på desktop inspisert |
| `npm run verify` | Bestått, inkludert Next-bygg og service worker |
| `npm run prosjekt:sjekk` | Bestått; i tillegg er alle sju lokale lenker i dette kortet kontrollert |
| Ekte innlogging og databaselagring i nettleser | Ikke prøvd; nødvendig før publisering |
| Anders' vurdering mot valgt design | Gjenstår |

Nettleserprøven dekker delvis manuell SG med riktig kvittering, valgt banes par fra start, enkel/avansert, 21 felt, pluss/minus, feil total, ugyldig tekst, tom score, bevart kladd ved feil, nytt forsøk, ventetilstand, redigering, tømming av enkeltfelt, avbryt og eier/lesevisning. Den fulle kvalitetskontrollen rapporterer fortsatt prosjektets kjente kontrastavvik i felles temaverdier; den har ingen ny blokkering fra SG-endringen. SG-feltene bruker nøytral tekst fremfor signalfarger for små tall.

Private prøvefiler og skjermbilder ligger under ignorert `_archive/manuell-sg-2026-09-11/`, aldri i `public/` eller Git.

## Avgrensninger og neste steg

- Ni hull kan registreres med scorekort. Kun totalscore støttes her for 18 hull: dagens Round-modell mangler et eget felt for antall hull uten scorekort. Skjemaet forklarer dette og avviser ni hull uten scorekort fremfor å lagre feil antall. En framtidig utvidelse må også avstemme lesere og aggregater.
- Rundevisningen viser alle registrerte detaljer, også uten hovedkategorier eller total. Eksisterende samlede SG-trender og SG-broen bruker fortsatt sitt eget krav til registrert total/hovedkategorier. Ingen ny analysemodell eller automatisk treningsresept innføres her.
- Referansekilde per runde, sammenblanding av ulike referanser og omregning mellom dem trenger et eget faglig avklart arbeid. Denne leveransen lagrer tallene som oppgitt i eksisterende felt.
- Før main: kontroller eventuelle nyere endringer siden `2807d4d08`, prøv ekte innlogging/lagring i et isolert testmiljø, og vis resultatet til Anders. Merge, push og publisering utføres først når det er bestilt. Tilbakeføring er å reversere funksjonens kodeendring; ingen databasemigrasjon må reverseres.
- Deretter utbedres planen for komplett kartbasert rundeføring, baneguide og vind. Se [baneguideunderlaget](../baneguide-produktdokument-2026-08-02.md) og AP0–AP6 i [tidligere arbeidsliste](../arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md). Historiske avkryssinger må kontrolleres mot faktisk kode før ny implementering.
