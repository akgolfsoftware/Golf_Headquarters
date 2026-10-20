# Produkt, roller og foreslått retning

## Produktet som skal dekkes

AK Golf HQ samler spillerutvikling, coachingarbeid, booking, betaling og offentlig nettsted. PlayerHQ er spillerens daglige verktøy, AgencyOS er coachens arbeidsflate. Forelder, skole/lag, delt innsyn og personlige arbeidsflater har egne behov. Målet er komplett app før åpen lansering med booking og betaling. Oppdeling i designetapper reduserer ikke omfanget.

Funksjoner beskrives av prosjektets produkt- og fagkilder. Filinventaret beskriver hvor kode finnes. Denne pakken bestemmer ikke nye priser, tilgangsrettigheter eller faglige beregninger. Dersom full kontekst mangler i Claude Design, tegn et merket utkast og registrer det konkrete spørsmålet før avhengig endelig detaljering.

## Gjeldende retning

**Precision Athletics** er valgt designsystem; siste konkrete skjermversjon velges innen systemet. Les [designautoriteten](../../../../docs/design-system/design-autoritet.md). Training Motor bidrar funksjoner og arbeidsflyter, ikke en konkurrerende visuell profil. Ord og planregler følger [treningsplanlegging](../../../../docs/treningsplanlegging.md).

PlayerHQ viser I dag, Plan, Stats og Meg. AgencyOS viser Cockpit, Innboks, Stall, Kalender, Workbench og Mer i den undersøkte Precision-versjonen. Nye skjermvalg dokumenteres mot faktisk prosjektversjon. Team Norway og WANG følger egne systemer; markedssidene er ikke valgt inn i Precision.

| Brukerflate | Viktigste utfall | Designhensyn |
|---|---|---|
| Spiller | Forstå planen, trene, registrere og se fremgang | Én hånd, dagslys, sportslig energi, enkel handling, gradvis fordypning |
| Coach | Prioritere spillere, planlegge, gi tilbakemelding og følge opp | Operativ ro, god oversikt, effektiv tastaturbruk, sikre gruppehandlinger |
| Forelder | Forstå barnets plan, samtykker, bookinger og økonomi | Klarspråk, tydelig barn/kontekst, hensiktsmessig innsyn |
| Offentlig besøkende | Forstå tilbudet, velge coach/tjeneste, bestille | Troverdig innhold, tydelig pris og avtale, enkel kontakt |
| Lag/skole/klubb | Samordne plan, gruppeaktivitet og kommunikasjon | Organisasjon og rolle synlig, lokale profilbehov |
| Delt innsyn | Se akkurat informasjonen som er delt | Mottaker, varighet og tillatt omfang må være avklart |
| Personlig drift / AI | Forstå forslag, godkjenne relevant handling, se resultat | Status og konsekvens før handling; sporbarhet uten intern sjargong i spiller-UI |

Disse er behovsprofiler, ikke en ferdig tilgangsmatrise. Lesing/skriving og datafelter må verifiseres separat.

## Designvalg som skal dokumenteres samlet

- Identitet: hvilken rolle egne data, mål, referanse og status har i fargebruken.
- Typografi: familie, vekter, brødtekst, metadata, overskrifter og tabellariske tall. Prøv 16 px brødtekst og 13–14 px metadata i daglige spillerflater; tett kalender har andre behov. Små versaler brukes sparsomt.
- Flater: bakgrunn, panel, aktivt valg, felt og overlegg. Kort skal gruppere en oppgave, ikke ramme inn alt.
- Geometri: felles avstandsskala, radrytme, hjørner og hovedhandlinger. Ingen kvote på antall moduler i skjermbildet.
- Navigasjon: stabile destinasjoner, tilbakevei, rollebytte og aktive valg. Viderefør gjeldende navigasjon og dokumenter plasseringen av coachkontakt og booking.
- Bevegelse: forklar endring, behold brukerens posisjon og respekter redusert bevegelse. Ingen treg inngangsanimasjon hver gang en hyppig brukt skjerm åpnes.
- Modi: dokumenter hva som utløser sportslige oppgaver, operativ ro og avtalt nattema, og hvordan de deler samme typografi-, geometri- og komponentgrammatikk.
- Foto: bruk det som meningsbærende innhold i utvalgte spillerøyeblikk. Beskytt alltid tekst, data og handlinger mot urolig bakgrunn.

Skriv hvert valg med hensikt, berørte flater, versjon og status. Skill `forslag`, `valgt for utprøving` og `valgt for bygging`. Brukerens siste beskjed kan endre alle visuelle valg.

## Faglige og praktiske rammer

- Bruk brutto score. Skill målt, beregnet og selvrapportert informasjon.
- Skill egne data, mål og sammenligningsgrunnlag. Ikke slå sammen forskjellige beregningsmetoder til ett umerket tall.
- Bruk etablerte enheter og begreper fra fagkildene; ikke endre beregninger for å få en pen graf.
- Booking er en avtale: hvem, tjeneste, varighet, sted, totalpris og neste steg må være forståelig. Ikke anta at et båsvalg er hele kundens behov.
- Barn, helse og delt innsyn trenger en eksplisitt rolle-/feltmatrise. Designutkast kan vise syntetiske data; de avgjør ikke hvem som har tilgang.
- Skille mellom `fullført` og `lagret`, og mellom `feilet` og `venter på nett`. Et optimistisk skjermbilde er ikke bekreftelse fra serveren.

## Lærdom fra ZIP-gjennomgangen

I en tidligere undersøkt designpakke var +0,18 tegnet høyere enn −0,31 på grunn av ulik skala. Viktige negative tall var dempet. Prototypen sa «3 av 3 steg fullført» etter to registreringer og tidlig avslutning. Nyere brett, eldre prototype og komponentverdier var ikke helt samordnet. Dette er eksempler på feil som kontrollene skal fange, ikke bevis på at alle slike feil finnes i produksjonsappen.
