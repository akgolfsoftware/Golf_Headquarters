# Språk og treningskvalitet — pågående gjennomgang

10.09.2026. Hele appen er ikke ferdig kvalitetssikret. Designarbeidet fortsetter parallelt.

## Utført

- Workbench: rettet seks puttebånd fra meter til fot og visningsnavnene Utslag, Golfslag og Banespill etter `docs/FASIT-AK-GOLF-HQ.md`. Lagrede identifikatorer er uendret.
- Publisering: pågående, gjennomførte og overhoppede økter kan ikke overskrives til publisert. Gjentatt publisering av en allerede publisert økt beholder tidspunktet. En ugyldig økt i et publiseringsutvalg gir ingen skriving.
- Ordboken har fått tydelig kildeavklaring: eldre kategori-, avstands- og prosentregler skal ikke overstyre dagens fagfasit.
- Testbatteriet er sammenlignet med brukerens Excel-v3. Se [egen kontroll](team-norway-excel-v3-kontroll.md).

## Fortsatt åpent

| Område | Kontroll som gjenstår |
|---|---|
| Hele appens språk | Gjennomgå synlige tekster per brukerreise, feilmeldinger, knapper, tomtilstander, e-post og varsler. Avklar felles bruk av coach/trener og drill/øvelse; dagens ordbok bruker coach og drill. |
| Kildekonsistens | Flere kodefiler og ordbøker har forskjellige visningsnavn og historiske begreper. Ikke erstatt lagrede identifikatorer med globalt søk/erstatt. |
| Treningsstruktur | Kontroller sammenheng mellom mål, periode, treningsblokk, uke, økt, øvelse og faktisk resultat. Fagmerkene beskriver trening; kategori og periode skal ikke bli treningsforbud. |
| Gjennomføring | Statusoverganger, skjulte/ikke godkjente forslag og samtidige endringer er nå sikret i `settStatus` med egne tester. Serverreisen mot isolert Postgres er prøvd. Hele reisen i nettleser med testinnlogging gjenstår. |
| Flere øktmodeller | Samme økt må vises med samme innhold/status i I dag, Plan, gjennomføring og oppsummering. Gjennomgående nettlesertest gjenstår. |
| Resultater | Testenes råverdier, protokollversjon, enheter, fullstendighet og beregningsregel må følge resultatet. Ikke bland antall registreringer med prestasjon. |
| Lansering | Betalingsreise, bekreftelser, reell tilgangskontroll, nettfeil og drift må verifiseres i egnet miljø. Tidligere grønn bygging beviser ikke dette. |

Lokale rettinger er ikke publisert. Denne gjennomgangen er ikke en samlet godkjenning av faginnhold eller lansering.

Se også [teknisk lanseringskontroll](teknisk-lanseringskontroll-2026-09-10.md) for siste integrasjonsrettinger og bekreftede miljøblokkeringer.


Oppfølging 10.09: bookingens klokkeslett, betalingsbeskrivelse og fristberegning er samordnet med lagret Oslo-veggklokke. Uklar betaling får en melding som også gir mening for gjester uten konto. ZIP (3)-kontrollen har avdekket at førstegangsregistrering og korrigering ikke godtar samme felt/verdier; dette er spesifisert i tilbakemeldingen til Claude Design. Det er ikke en full språkgodkjenning av alle skjermene.


Samlet arbeidsrunde: [kontrollrapportens siste avsnitt](teknisk-lanseringskontroll-2026-09-10.md) dokumenterer språkrettingene i booking/gjennomføring, kontroll av forelder-/coachvarsler og nye funn i målfremdriften. Endringene ligger i den separate samlingskopien. Gjeldende coach-/drill-begreper er beholdt; full språkgodkjenning av alle skjermer og aktive e-postmaler gjenstår.
