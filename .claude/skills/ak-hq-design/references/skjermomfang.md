# Hele appens skjermomfang

Start med [inventaret](../assets/ruteinventar.json) eller [CSV](../assets/ruteinventar.csv). Tellingen ved opprettelse 10.09.2026 var 478 sidefiler, 693 komponentfiler og 225 filer for layout, lasting, feil og andre rammenivåer. Dette er kodeinventar, ikke ferdig design eller automatisk oppdeling i like mange tegninger.

## Flater som ikke må forsvinne

| Flate i inventaret | Sidefiler ved opprettelse | Familier som skal undersøkes |
|---|---:|---|
| playerhq | 170 | I dag, planer/maler, økter, Live, runder, tester, fysisk trening, analyser, TrackMan/DataGolf, gameplan/baneguide, coachkontakt/videoer, booking, utviklingsplan, venner, talent, varsler, Meg, abonnement/hjelp/sikkerhet |
| agencyos | 163 | Cockpit, innboks/kommunikasjon, spiller/grupper/stall, kalender/tilgjengelighet, Workbench/planlegging, øvelsesbank/tester, Live/runder/analyse, booking/tjenester, økonomi, innhold/marked, talent, organisasjon, oppsett, integrasjoner, AI/AgenticOS/Jarvis, historikk/godkjenning |
| marked-og-offentlig | 70 | Forside, tilbud/priser, coaching, coacher, anlegg, junior, blogg/cases, statistikk/verktøy, turneringer, kontakt/FAQ, personvern/vilkår/cookies og bekreftelser |
| offentlig-booking | 4 | Valg av tjeneste/coach/tid, gjennomgang, betaling og bekreftelse; overlegg og leverandørsteg kommer i tillegg til sidefiler |
| inngang-og-konto | 18 | Innlogging, registrering, invitasjon, verifisering, gjenoppretting, rolle-/kontooppsett og onboarding |
| forelder | 16 | Barn/oversikt, plan, coachkontakt, booking, faktura/økonomi, samtykker, ukerapport, varsler og innstillinger |
| lag-og-skole | 15 | WANG, Team Norway, GFGK og junior; plan, innlegg, dokumenter, kontakt og tilgang |
| delt-innsyn | 11 | Delte spiller-/talentvisninger, sammenligning, gyldig/utløpt/avvist lenke |
| personlig-arbeidsflate | 3 | Personlig oversikt, dispatch og morgenbrief |
| systemtilstand | 2 | Offline og vedlikehold; feil, tilgangsavslag og ikke funnet dekkes også av rammenivåer |
| interne-eksempler | 6 | Demo- og designvisninger; vurder separat om de er intern dokumentasjon eller brukerflate |

Antall oppdateres ved ny skanning. Gruppene er foreslått fra filstier; de er ikke verifisert rolle- eller lanseringsomfang. Ingen gruppe er automatisk utsatt til etter lansering.

## Fra kodeinventar til designregister

Én rad per kildefil må få en undersøkt forklaring:

- `egen-skjerm`: konkret skjerm-ID, versjon og reise.
- `felles-monster`: mønster-ID, hvilke felter/handlinger som varierer, og dokumenterte unntak.
- `videresending`: faktisk måladresse og hva brukeren ser ved ugyldig eller gammel lenke; undersøk koden før klassifisering.
- `intern-flate`: hvem som bruker den og om den trenger eget UI eller bare dokumentasjon.
- `avventer-avklaring`: konkret ubesvart spørsmål, konsekvens og berørte rader.

Automatisk `redirectCandidate` eller en `(legacy)`-mappe er bare et signal. Ingen rute slettes med henvisning til dette registeret. Dynamiske ruter dekker datavarianter; ikke generer én skjerm per faktisk spiller.

Bruk [skjermkontrakten](../assets/skjermkontrakt.yaml) som mal for manuelt vedlikeholdt status. Ikke skriv valg i `ruteinventar.*`, siden det regenereres. Et felles mønster kan dekke mange ruter, men må vise felter, handlinger og unntak for hver av dem.

## Alt som ikke er en sidefil

Legg til egne design-ID-er for ark/dialog, dropdown/meny, tooltip, toast, bekreftelse, konflikt, tomt søk, betalerens leverandørsteg, opplastingsprosess, varsling, tilgangsavslag og nettfeil. Koble dem til inngangen som åpner dem. Kartleggingen finner ikke automatisk alle slike tilstander.

For hver brukerreise registreres også API-/dataavhengigheter som forklarer synlig oppførsel. Inventaret skanner ikke API-er og beviser ikke at en integrasjon virker.

## Fullføringsregel

Alle inventarrader er koblet til design/mønster eller en undersøkt teknisk forklaring. Alle manuelle overlegg, relevante roller, formater og tilstander har status. «Ikke relevant» har begrunnelse. Åpne produktbeslutninger står synlig og teller som uavklart, ikke ferdig. Full app er ikke dokumentert før denne gjennomgangen er gjort.
