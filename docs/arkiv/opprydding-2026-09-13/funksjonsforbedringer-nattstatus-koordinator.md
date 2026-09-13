# Funksjonsforbedringer — nattstatus 13.09.2026

Bestilling: Anders ba «Fiks alt dette i natt» etter gjennomgangen av [192 funksjonskort](funksjonsforbedringer-og-intervju-2026-09-13.md). Registeret er et utførelsesvedlegg til [masterplanen](../MASTERPLAN-GJENSTAAENDE.md), ikke en ny prioriteringsfasit.

## Arbeidsregel

Alle kort avstemmes mot gjeldende kode og pågående leveranser før arbeid. Delte funksjoner gjennomføres én gang og kobles til alle berørte kort. Avklar filansvar med nattkoordinatoren før kodeendring. Ingen parallelle fullbygg eller konkurrerende endringer på samme filer.

Status ved opprettelse er **til avstemming**, ikke «mangler i kode». Flere kort bygger på funksjoner som allerede finnes. Bruk videre statusene **pågår**, **implementert / kontroll gjenstår**, **kontrollert**, **venter på produktvalg**, **venter på design** eller **ekstern blokkering**. Før opp faktisk fil/commit, kontroll og begrensning. Dokumentasjon alene gir ikke status kontrollert for appfunksjonen.

Arbeidsstrømmer:

- **Plan og spillerreise:** I dag, mål, plan, Live, øvelser og oppsummering.
- **Analyse og data:** TrackMan, tester, runder, bag og tiltak.
- **Coach og agent:** AgencyOS, opptak, remote og AgenticOS.
- **Marked og booking:** eksisterende tilbud, booking og betaling.
- **Organisasjon og forelder:** Team Norway, WANG, klubb, relasjoner og deling.
- **Felles kvalitet:** varsler, offline, konto, datarettigheter, drift og personlige flater.

Spørsmål som krever en ny beslutning samles til morgenrapporten. Fortsett andre avklarte kort uten å vente. Prioriter korrekte datakilder, lagring, godkjenningsresultat og komplette brukerreiser før flere utvidelser. Valg av konkret design, endringer i produksjon eller databaseskjema følger prosjektets eksisterende autorisasjonsgrenser.

## Kontrollpunkter fra kodelesingen

Avstem spesielt disse med oppgaven «Kryssjekk Claude-analysen», som allerede arbeider med rettinger: bildeimportens enheter (TM02), innholdet i publiseringsforskjellen (P23/A21), samtidige Live-lagringer (P32/A32), godkjent versus utført forslag (A11), videoagentens uferdige analyse (R05), faktisk økonomigrunnlag (A49). Dette er ikke en ordre om å duplisere pågående rettinger.

## Funksjonsregister

| Kort | Funksjon | Arbeidsstrøm | Status | Bevis / neste avklaring |
|---|---|---|---|---|
| M01 | Forside | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| M02 | Coaching | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| M03 | PlayerHQ | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M04 | Junior Academy | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M05 | For klubb, skole og lag | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M06 | Coacher | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M07 | Steder/anlegg | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M08 | Priser | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M09 | Booking | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M10 | Om AK Golf/metoden | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| M11 | Kunnskap og statistikk | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M12 | Kontakt og hjelp | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M13 | Juridisk | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| M14 | Innlogging og oppstart | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| B01 | Inngang | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B02 | Velg tjeneste | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B03 | Velg coach | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B04 | Velg sted | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B05 | Velg tid | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B06 | Hvem booker | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B07 | Betaling | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B08 | Bekreftelse | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| B09 | Etter kjøp | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B10 | Endring | Marked og booking | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| B11 | Påminnelse | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B12 | Avvik | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B13 | Coachadministrasjon | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| B14 | Måling | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P01 | Dagens viktigste handling | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P02 | Neste økt | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P03 | Coachforslag | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P04 | Fremdrift | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P05 | Mangler og avvik | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P10 | Mål og utgangspunkt | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P11 | Årsplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P12 | Periodisering | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P13 | Månedsplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P14 | Ukesplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P15 | Øktplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P16 | Teknisk plan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P17 | Turnering og gameplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P18 | Gruppe til individ | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P19 | AI-planforslag | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P20 | Øvelseskatalog | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P21 | Coachøvelse | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P22 | Spillerens favoritter | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P23 | Øvelse i plan | Plan og spillerreise | Til avstemming | Konkret kodelesingsfunn sendt til Kryssjekk Claude-analysen 13.09 ca.02.04 for filansvar og faktisk rettingsbevis. Ingen fullføring hevdet. |
| P24 | Treningsprogram | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P25 | Effekt | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P30 | Start økt | Plan og spillerreise | Pågår | Delbevis: streng lokal P0 4/4 bestått på 3,1 min; tre modeller starter via Plan og samme økt-ID. Dobbelttrykk, gjenopptak og samlet kandidat gjenstår. Se nattplanens P0-logg. |
| P31 | Egenøkt | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P32 | Coachledet økt | Plan og spillerreise | Implementert / kontroll gjenstår | Delretting implementert: coachmelding/brief/vurdering oppdaterer egne felt med eierskap i UPDATE. Eier rapporterer 14/14 handlingstester og faktisk SQL i PGlite bestått. Samlet gate, flere databaseforbindelser, øvrige hele oppsummeringsskrivere, retry-duplikater og innlogget reise gjenstår. Se agencyos-live-samtidighet-2026-09-13.md i leveransearbeidskopien. |
| P33 | Hurtigregistrering | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P34 | Bilder og video | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P35 | Tale | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P36 | Uten nett | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P37 | Avslutning | Plan og spillerreise | Pågår | Delbevis: eksakte resultater og gjenåpning bestod i tre modeller. Hele lagrings-/feil-/rettingskravet gjenstår. P0-patch hos integrasjonseier. |
| P40 | Oversikt | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P41 | Trening | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P42 | Runder og SG | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P43 | TrackMan | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P44 | Tester | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P45 | Historikk | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P46 | Neste handling | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P50 | Coachkontakt | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P51 | Remote coaching | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P52 | Booking og kjøp | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P53 | Kalender | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P54 | Helse og fysisk | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P55 | Mål og utviklingsplan | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P56 | Talent | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P57 | Gameplan og baneguide | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P58 | Utstyr og bag | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P59 | Sosialt | Plan og spillerreise | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P60 | Forelder | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P61 | Dokumenter og hjelp | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| P62 | Konto og personvern | Felles kvalitet | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| TM01 | Inndata | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM02 | Tolking | Analyse og data | Implementert / kontroll gjenstår | Delretting i trackman-fotoenheter-2026-09-13 fra 739bd23ad: eksplisitt kildeenhet per felt/rad, råtall beholdes, unknown blir null ved eksisterende konvertering. Tre filer/rapport kontrollert. Eier rapporterer 29/29 foto-/units-/canonical-prøver grønne. Faktiske bilder, innlogget import og samlet gate ikke prøvd; km/t støttes ikke og gjettes ikke. |
| TM03 | Kontroll | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM04 | Økt | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM05 | Parametere | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM06 | Visning | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM07 | Sammenligning | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM08 | Gapping og bag | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM09 | Teknisk kobling | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM10 | Signal | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM11 | Tiltak | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM12 | Oppfølging | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM13 | Deling | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM14 | Feil og drift | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TM15 | Sporbarhet | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A01 | Kvelds-/morgenbrief | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A02 | NÅ | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A03 | Kalender | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A04 | Spillerforberedelse | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A05 | Risiko | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A06 | Agentstatus | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A10 | Ett beslutningskort | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A11 | Handlinger | Coach og agent | Pågår | Kandidat e51fed688 + 706acf85d + db86cad02 hindrer blind gjentakelse ved statusfeil og delvis utføring. Diff kontrollert; eier rapporterer 8/8 målrettede prøver og full verify 2658 tester/bygg. Samlet review/CI/merge gjenstår. PROCESSING krever manuell avstemming/gjenoppretting; redigert/utført innhold og full brukerreise er fortsatt åpne. |
| A12 | Massehandling | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A13 | Historikk | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A14 | Frist og SLA | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A20 | Oversikt | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A21 | Hele planen | Coach og agent | Til avstemming | Konkret kodelesingsfunn sendt til Kryssjekk Claude-analysen 13.09 ca.02.04 for filansvar og faktisk rettingsbevis. Ingen fullføring hevdet. |
| A22 | Historikk | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A23 | Analyse | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A24 | Kontakt | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A25 | Administrasjon | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A26 | Handling | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A30 | Før | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A31 | Start | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A32 | Under | Coach og agent | Implementert / kontroll gjenstår | Samme delretting som P32 i video-mottak-2026-09-13. Feltvis lagring og eierskap er implementert; 14/14 handlingstester og SQL-prøve rapportert grønne. PGlite serialiserer spørringer og beviser ikke låsing mellom forbindelser. Samlet gate og komplett kortkontroll gjenstår. |
| A33 | iPhone-fangst | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A34 | Lyd | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A35 | Etter | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A36 | Godkjenning | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A37 | Levering | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A40 | Booking og kapasitet | Marked og booking | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A41 | Kommunikasjon | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A42 | Oppgaver og prosjekter | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A43 | Leads og salg | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A44 | Marked | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A45 | Organisasjoner | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A46 | Tester og øvelser | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A47 | Talent | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A48 | Video og remote | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A49 | Økonomi | Coach og agent | Til avstemming | Konkret kodelesingsfunn sendt til Kryssjekk Claude-analysen 13.09 ca.02.04 for filansvar og faktisk rettingsbevis. Ingen fullføring hevdet. |
| A50 | Rapporter | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| A51 | Brukere og tilgang | Organisasjon og forelder | Pågår | Delgrunnlag e51fed688: følsomme ruter og TN-siste-trener-grense rettet. Eier rapporterer full verify på Node 24 med 2655 tester og produksjonsbygg. Samlet integrasjon og full rollematrise gjenstår. |
| A52 | Integrasjoner | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG01 | Hendelser | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG02 | Jobber | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG03 | Ferdigheter | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG04 | Modellruting | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG05 | Godkjenning | Coach og agent | Pågår | Kandidat e51fed688 + 706acf85d + db86cad02 hindrer blind gjentakelse ved statusfeil og delvis utføring. Diff kontrollert; eier rapporterer 8/8 målrettede prøver og full verify 2658 tester/bygg. Samlet review/CI/merge gjenstår. PROCESSING krever manuell avstemming/gjenoppretting; redigert/utført innhold og full brukerreise er fortsatt åpne. |
| AG06 | Kvalitet | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG07 | Personvern | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG08 | Kostnad | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG09 | Drift | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG10 | Læring | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG11 | Kodearbeid | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| AG12 | Kontinuerlig arbeid | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R01 | Produkt | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R02 | Oppstart | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R03 | Innsending | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R04 | Kø og responstid | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R05 | Analyse | Coach og agent | Implementert / kontroll gjenstår | Delretting implementert i video-mottak-2026-09-13 fra 739bd23ad: ærlig mottakstekst. Rapport og seks faktiske endrede filer kontrollert av koordinator. Samlet gate/commit gjenstår; bildeanalyse og hel opplastingsreise er ikke ferdige. |
| R06 | Feedback | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R07 | Planpåvirkning | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R08 | Oppfølging | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R09 | Booking og betaling | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| R10 | Kvalitet og lønnsomhet | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TN01 | Organisasjon og tilhørighet | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| TN02 | Lag og undergrupper | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TN03 | Spilleroversikt og utvikling | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| TN04 | Samling og felles plan | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| TN05 | Testføring for mange | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| TN06 | Uttaksgrunnlag | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| TN07 | Poster og dokumenter | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| TN08 | Rapport og deling | Organisasjon og forelder | Pågår | TN-flater: 6af19e315 + 591a2a797; spillerens meny/lenker korrigert. Eier rapporterer verify, 2635 + 4 tester og 32 innloggede rute/rolle/bredde-prøver (390/1440; 30 tillatt, 2 avvist; ingen overflow/konsollfeil). Bevisdokument kontrollert. Samlet integrasjon, kortets fulle funksjonskrav og Anders-visning gjenstår. |
| W01 | Årsplan og skoleår | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W02 | Treneruke og økt | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W03 | Individuell utviklingsplan | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W04 | Elevens uke | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W05 | Oppmøte og avvik | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W06 | Fysisk trening | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W07 | Test og vurderingssamtale | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| W08 | Foresatte og rapporter | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| F01 | Barn og relasjoner | Organisasjon og forelder | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| F02 | Barnets uke | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| F03 | Booking og betaling for barn | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| F04 | Samtykke og delt innsyn | Organisasjon og forelder | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| F05 | Ukesrapport og kontakt | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| C01 | GFGK og juniorgrupper | Organisasjon og forelder | Pågår | Delgrunnlag e51fed688: GFGK-rute/data og personvernretting. Commitoversikt kontrollert; eier rapporterer full verify grønn. Dette fullfører ikke juniorgruppenes komplette brukerreise. |
| C02 | Klubbdrift rundt trening | Organisasjon og forelder | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G01 | Runderegistrering | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G02 | Kart og banedata | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G03 | Live GPS | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G04 | Runde uten nett | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G05 | Vind og spilleforhold | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G06 | DataGolf og GolfBox | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| G07 | Turneringshistorikk og datakvalitet | Analyse og data | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| T01 | Kort diktering | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| T02 | Opptak av hel coachingtime | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| T03 | Fra tale til endring | Coach og agent | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| S01 | Varsler og påminnelser | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| S02 | Feil, lagring og gjenopptakelse | Felles kvalitet | Pågår | Delbevis: produktnavigasjon og resultatgjenåpning bestod uten testomvei. Nettbrudd/konflikt/gjenopptak er ikke kontrollert av denne pakken. |
| S03 | Brukervennlighet og tilgjengelighet | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| S04 | Drift og gjenoppretting | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |
| S05 | Eksport og sletting | Felles kvalitet | Pågår | Designarbeid i eksisterende Claude-økt; konkret neste pakke bestilt. Prototype er ikke valgt, implementert eller app-testet. Kodeansvar avstemmes separat. |
| S06 | Personlig arbeidsflate og sideprosjekter | Felles kvalitet | Til avstemming | Se kilde, ferdigkrav og spørsmål i funksjonskortet. |

## Morgenrapport

Rapporter antall kort avstemt, implementert og faktisk kontrollert hver for seg. Oppgi resterende produktvalg og konkrete lanseringshindre. Oppgi separat hva som ligger lokalt, i GitHub og i publisert app. Ikke bruk antall kort som mål på ferdig produkt.

## Nattkoordinering 13.09 ca. 02.04

Dette er nattkoordinatorens arbeidsversjon i egen arbeidskopi. De opprinnelige lokale dokumentene i hovedarbeidskopien er bevart. Alle 192 ID-er er kontrollert mot funksjonskortene; 30 marked/booking, 32 plan/spillerreise, 35 analyse/data, 60 coach/agent, 26 organisasjon/forelder og 9 felles kvalitet. Filansvar og kodeleveranser samordnes med eksisterende integrasjons- og analyseoppgaver. Kort med delbevis forblir åpne til hele ferdigkravet er prøvd.
