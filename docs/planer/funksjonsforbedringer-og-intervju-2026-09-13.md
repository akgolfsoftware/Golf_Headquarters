# AK Golf HQ — forbedret funksjonsbeskrivelse og produktintervju

13.09.2026. Status: **forslag til Anders**, basert på eksisterende produktkart og målrettet kodelesing. Ingen av forslagene er implementert i denne leveransen. Dette er et beslutningsvedlegg til eksisterende masterplan, ikke en ny konkurrerende arbeidsliste eller godkjent designretning.

## Nattbestilling fra Anders

13.09.2026: Anders har bestilt «Fiks alt dette i natt». Funksjonsforslagene inngår nå i nattarbeidet. Utfør avklarte forbedringer og feilrettinger, gjenbruk eksisterende produktregler og samordne filansvar med pågående oppgaver. De åpne spørsmålene er ikke besvart av nattbestillingen; konkrete produktvalg som ikke kan utledes fra eksisterende beslutninger dokumenteres til morgenrapporten, mens uavhengig arbeid fortsetter.

[Utførelsesregister for alle 192 kort](funksjonsforbedringer-nattstatus-2026-09-13.md) viser arbeidsstrøm og bevisstatus. Eksisterende nattoppfølging er ansvarlig for samlet gjennomføring og rapport etter kl. 08.00. Ingen kort merkes ferdig uten konkret implementasjon og relevant kontroll. Nattbestillingen endrer ikke i seg selv produksjonsoppsett, databasemodell eller valgt designversjon.

## Det du får

Alle **153 funksjonsrader** fra det detaljerte produktkartet er videreutviklet hver for seg. I tillegg er **39 supplerende funksjonskort** lagt til for Team Norway, WANG, forelder, klubb, baneguide, tale og fellesfunksjoner. Totalt **192 kort** med eksisterende grunnlag, konkret forbedring, ferdigkrav og ett åpent produktspørsmål per kort.

Kortene er produktforslag, ikke 192 uavhengige byggeoppgaver. Flere innganger deler samme funksjon; P51, A48 og R01–R10 skal for eksempel bruke samme remote-kjede. Et nytt kort betyr ikke at funksjonen mangler i appen.

## Grunnlag og avgrensning

- [Notion: komplett produkt- og grillkart](https://app.notion.com/p/akgolfacademy/AK-Golf-HQ-komplett-produkt-og-grillkart-3d935a45535a8021a2fec022763f0660) ble lest direkte i denne samtalen.
- [Detaljert produktkart](komplett-produkt-og-grillkart-2026-09-13.md) er grunnlaget for de 153 ID-ene. Det er mer detaljert enn Notion-sidens sammenfatning.
- Kodegrunnlag: lokal commit `739bd23ad`, kontrollert 13.09.2026. Arbeidstreet var rent før dette dokumentet. Ingen kontroll av fersk GitHub- eller produksjonsversjon inngår.
- [Funksjonsregisteret fra 11.09](funksjonsregister-2026-09-11.md) er krysskoblet nedenfor. Dets ID-er betyr andre ting enn produktkartets ID-er; de er derfor alltid merket «register 11.09» i krysskoblingen.
- Kilder merket **K** beskriver konkret lest kode og identifiserte tilhørende filer. Kilder merket **D** beskriver dokumentert intensjon/status, eventuelt kodeinventar. Begge har presise begrensninger i kildeoversikten.
- Dette er ikke en linje-for-linje-revisjon av alle sider, integrasjoner eller tester. Innlogging, reelle betalinger, persondata, AI-kall, eksterne importer og produksjon er ikke prøvd. Kildehenvisning under et kort er grunnlaget det skal videreutvikle, ikke bevis på at det foreslåtte innholdet allerede finnes.

## Anbefalt produktforbedring

La samme spiller, mål, plan, økt og tiltak følge hele forbedringssløyfen:

**Mål → plan → trening/coaching → registrering → analyse → godkjent tiltak → neste økt → ny vurdering.**

Samle eksisterende innganger rundt denne reisen. Bevar funksjonene og de to øktsporene. Utvid det som er nyttig og mangler sammenheng, fremfor å bygge parallelle planer, analyser, kontakttråder eller betalingsregler.

Første anbefalte utviklingsrekkefølge etter dine avklaringer:

1. Datatillit, tilgang, lagring og riktig godkjenningsresultat for berørte funksjoner.
2. Spillerens komplette plan- og øktreise og coachens oppfølging.
3. TrackMan/test/runde → konkret tiltak → plan → ny kontroll.
4. Booking fra faktisk tilbud til bekreftet avtale, betaling og etterarbeid.
5. Gruppe → individ, med særskilte reiser for Team Norway, WANG og forelder. Disse er obligatoriske deler av helheten, ikke valgfritt restarbeid.
6. Komplett remote-leveranse og varige agentjobber som gjenbruker de kontrollerte kjedene.

Dette er en foreslått rekkefølge for utvikling, ikke redusert lanseringsomfang. Gjeldende [masterplan](../MASTERPLAN-GJENSTAAENDE.md) endres først når forslagene er vurdert.

## Konkrete observasjoner som påvirker forslagene

| Observasjon | Betydning og anbefalt endring | Berørte kort |
|---|---|---|
| TrackMan-handlingen har allerede CSV, HTML, foto, teknisk oppgavematching og måloppdatering. | Oppdater funksjonsstatusen og videreutvikle kontroll, kilder og oppfølging. Ikke bestill disse delene som om de var helt fraværende. | TM01–TM15, P16, P43 |
| Fotoavlesningens prompt antar mph og meter, mens andre kildeformater har eksplisitt enhetsbehandling. | Kontroller bildeformatets enheter eksplisitt før nye analysefunksjoner. Kodelest risiko; ingen bildeimport er kjørt her. | TM02, TM03, TM15 |
| Publiseringsforskjellen sammenligner tittel, tidspunkt, varighet og treningsområde. Øvelsesinnhold og tekniske mål inngår ikke i dette viste snapshotet. | Vis også faglige innholdsendringer der publiseringskontrollen skal dekke dem. Ellers kan en viktig endring bli lite synlig. | P16, P23, A21 |
| Coachens Live-handlinger leser og skriver hele `completedSummary`-objektet. | Ved samtidige lagringer kan en eldre kopi overskrive andre felt. Foreslå feltsikker eller versjonskontrollert lagring og en målrettet samtidighetsprøve. Risiko utledet fra kode, ikke reprodusert i denne økten. | P32, A32 |
| Godkjennerfunksjonen utfører lagret forslag før et eventuelt redigert forslag lagres. Den leste kalleren legger i dag til coachkommentar. | Før reell redigering av handlingsinnhold innføres må utført handling samsvare med godkjent versjon. Dette er ikke bevis på at dagens kommentar endrer en økt feil. | A10, A11, T03 |
| Den leste videoagenten bekrefter mottak, men utfører ikke bildeanalyse. Meldingen sier likevel at opptaket blir sett på. | Bruk ærlig mottaksstatus, og bygg faktisk faglig vurdering før analyse loves. | P51, A48, R05 |
| Oversiktsfilen beregner MRR som antall abonnementer ganget med 299. | Avstem med faktisk abonnementsgrunnlag og skill dokumenterte inntekter fra aktivitetsindikatorer. Ikke vis dette som regnskap. Ingen økonomitall er hentet eller estimert her. | A49 |
| Team Norway-tilgangsmodellen beskriver én felles gruppe; WANG har allerede samlet IUP-lagring for evaluering og neste fokus. | Avklar TN-undergrupper og videreutvikle WANG-sammenhengen fremfor å lage en ny IUP-modell. | TN02, W03 |

## Felles regler for alle kort

**Eksisterende produktbeslutninger beholdes.** FULL/TALENT, abonnement og coachingpakker følger [produktreglene](../platform/BUSINESS-RULES.md). En konto oppretter ikke automatisk en prøveperiode. Vi stiller ikke gamle pris- eller tilgangsspørsmål på nytt. Brutto score brukes; putting vises i fot etter prosjektets regel. «Auto» i treningssammenheng betyr Automatikk, ikke en programvareautomasjon. Pensjonerte treningssperrer gjeninnføres ikke.

**Alle forslag har et felles ferdigkrav i tillegg til kortets særkrav:** riktig bruker og objekt; avvist uvedkommende; tydelig lastende/tom/feil/lagret tilstand; håndtert avbrudd og dobbelttrykk; forståelig neste handling; sporbar kilde og eier. Synk, tilbakekalling og angre prøves der de er relevante. En grønn kodekontroll er ikke bevis på hel brukerreise.

**Faglige forslag og faktisk utført handling skilles.** Kilder, antakelser og usikkerhet vises. Betaling og meldingslevering bekreftes separat fra at et skjema er sendt. Ekstern kommunikasjon følger godkjente regler. Personopplysninger sendes ikke til sky-prompts uten anonymisering; identifiserende bilder, lyd og vedlegg må også omfattes.

**Visuell utforming er fortsatt åpen.** Eksisterende navigasjon og komponentnavn er funksjonsgrunnlag. Skjermbygging knyttes til den komplette designversjonen Anders velger. Denne teksten velger ikke fonter, farger, meny eller ny databasemodell.

## Slik bruker vi spørsmålene

Vi tar én funksjon om gangen. For hvert svar noterer vi: ønsket oppførsel, hva du endrer i forslaget, ansvarlig rolle, automatikk/godkjenning, avvik og prioritet. Relaterte kort oppdateres samlet, slik at du ikke må svare på samme beslutning flere ganger.

Første foreslåtte tema er **P14 Ukesplan**: det avgjør hvordan plan, Live, analyse og gruppeinnhold skal henge sammen. Vi kjenner allerede hovedretningen med coaching og spillerutvikling; første spørsmål bør derfor være konkret om arbeidsflyten.

Svarregisteret er foreløpig tomt. Ingen spørsmål nedenfor er tolket som besvart eller låst.

## Marked og oppstart

### M01 — Forside

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis reisen fra første kartlegging til mål, trening og oppfølging, med én tydelig inngang til coaching og en sekundær PlayerHQ-inngang.
- **Ferdig når:** Besøkende kan velge et faktisk tilbud og beholde valget inn i booking.
- **Spørsmål til Anders:** Hvilket første coachingtilbud skal være hovedhandlingen?

### M02 — Coaching

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Sammenlign enkelttime og utviklingsforløp med før-, under- og etterarbeid og konkret oppfølging mellom timene.
- **Ferdig når:** Innhold, inkluderte leveranser og bestillbar tjeneste stemmer overens.
- **Spørsmål til Anders:** Hva skal alltid følge med etter en enkelttime?

### M03 — PlayerHQ

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis en realistisk spilleruke fra plan til ny læring, og forklar gratisprofil, betalt tilgang og coachingtilgang hver for seg.
- **Ferdig når:** Besøkende kan forstå sin tilgangsvei uten å forveksle coachingpakke og appnivå.
- **Spørsmål til Anders:** Hvilken forbedring i treningshverdagen skal demonstrasjonen vise først?

### M04 — Junior Academy

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Beskriv utviklingsløp for junior og forelder, med gruppetilhørighet, oppstart, kalender og tydelig kontaktperson.
- **Ferdig når:** Interessenten havner hos rett program uten å oppgi unødvendige barneopplysninger.
- **Spørsmål til Anders:** Hvordan skal en ny junior plasseres i riktig gruppe?

### M05 — For klubb, skole og lag

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi klubb, skole og lag hver sin behovsinngang til et felles samarbeidstilbud, med ansvar, oppstart og rapporteksempel.
- **Ferdig når:** En forespørsel inneholder organisasjonstype og behov og får en ansvarlig mottaker.
- **Spørsmål til Anders:** Hva skal være standardleveransen til en ny organisasjon?

### M06 — Coacher

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Koble coachens kompetanse, målgruppe, steder og tjenester til faktisk tilgjengelighet.
- **Ferdig når:** Valgt coach følger hele bestillingen og utilgjengelighet gir et forståelig alternativ.
- **Spørsmål til Anders:** Når skal kunden anbefales en annen coach?

### M07 — Steder/anlegg

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis hvilke tjenester som kan leveres på stedet, nødvendig utstyr og praktisk ankomstinformasjon.
- **Ferdig når:** Valgt sted filtrerer bort tjenester og tider som ikke kan leveres der.
- **Spørsmål til Anders:** Hvilke praktiske opplysninger trenger kunden før første oppmøte?

### M08 — Priser

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle priser, inkludert coaching, tilgangsgrunn og neste belastning i en tydelig sammenligning.
- **Ferdig når:** Samme tilbud gir samme vilkår og beløp på pris-, bestillings- og kontosiden.
- **Spørsmål til Anders:** Hvilke eksisterende coachingtilbud skal vises ved lansering?

### M09 — Booking

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** La bestillingsinngangen bevare tjeneste, coach og sted og tydelig vise hvor bestillingen fullføres.
- **Ferdig når:** Alle innganger følger samme åpne eller lukkede bookingregel og mister ikke kundens valg.
- **Spørsmål til Anders:** Hva skal kunden møte hvis ingen passende time er ledig?

### M10 — Om AK Golf/metoden

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Forklar AK-metoden med ett komplett, syntetisk eksempel fra utgangspunkt til evaluering.
- **Ferdig når:** Hvert løfte kan knyttes til en faktisk leveranse og ansvarlig coach.
- **Spørsmål til Anders:** Hvilke tre prinsipper må kunden forstå om arbeidsmetoden?

### M11 — Kunnskap og statistikk

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Organiser kunnskap etter spillerens problem og lenk videre til relevant øvelse, analyse eller coaching.
- **Ferdig når:** Hver artikkel eller statistikkside har kilde, dato og et relevant neste steg.
- **Spørsmål til Anders:** Hvilke problemer skal gratisinnholdet hjelpe spilleren å løse?

### M12 — Kontakt og hjelp

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** La brukeren velge kontaktgrunn, se forventet svartid og følge opp samme sak.
- **Ferdig når:** Forespørselen får bekreftet mottak og en ansvarlig mottaker uten dobbel innsending.
- **Spørsmål til Anders:** Hvilken svartid vil du love for de ulike henvendelsene?

### M13 — Juridisk

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Koble forståelig informasjon om kjøp, opptak og data til handlingene der brukeren trenger den.
- **Ferdig når:** Brukeren kan finne gjeldende valg og endre dem fra kontoen.
- **Spørsmål til Anders:** Hvilke forklaringer får du oftest spørsmål om i dag?

### M14 — Innlogging og oppstart

Eksisterende grunnlag: [D-M](#d-m) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Tilpass oppstart til spiller, forelder, coach og organisasjonsmedlem, og led til første nyttige handling.
- **Ferdig når:** Gratisprofil blir ikke feilaktig presentert som aktiv prøve; invitasjoner lander i riktig rolle.
- **Spørsmål til Anders:** Hva bør en ny spiller få gjort i løpet av første besøk?

## Booking

### B01 — Inngang

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bevar inngangens kontekst og vis et samlet bestillingssammendrag som kan endres uten omstart.
- **Ferdig når:** Bytte av sted eller coach oppdaterer pris og ledighet uten gamle valg.
- **Spørsmål til Anders:** Hvilke valg skal være forhåndsutfylt fra hver inngang?

### B02 — Velg tjeneste

Eksisterende grunnlag: [D-B](#d-b) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi hver tjeneste et leveransekort med hensikt, varighet, forberedelse, inkludert oppfølging og kapasitet.
- **Ferdig når:** Bare tjenester med komplett leveranse og tilgjengelig ansvarlig kan bestilles.
- **Spørsmål til Anders:** Hvilke tjenestetyper er klare til å selges nå?

### B03 — Velg coach

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** La kunden velge fast coach eller første passende ledige, med begrunnet alternativ.
- **Ferdig når:** Systemet foreslår bare coacher som faktisk leverer tjenesten på valgt sted.
- **Spørsmål til Anders:** Når veier kontinuitet med samme coach tyngre enn første ledige tid?

### B04 — Velg sted

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Filtrer lokasjon og fasilitet etter tjeneste, kapasitet og coachens tilgjengelighet.
- **Ferdig når:** Ingen booking kan bekreftes på en uegnet eller opptatt fasilitet.
- **Spørsmål til Anders:** Hvilke tjenester krever en bestemt fasilitet?

### B05 — Velg tid

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis reell ledighet med midlertidig reservasjon og forståelige alternativer ved kollisjon.
- **Ferdig når:** To samtidige kunder kan ikke bekrefte samme kapasitet; utløpt reservasjon gir ny kontroll.
- **Spørsmål til Anders:** Hvor mye buffer og reisetid trenger du mellom timer?

### B06 — Hvem booker

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis tydelig hvem som trener, hvem som bestiller og hvem som betaler, også ved foreldrebooking.
- **Ferdig når:** Barnbytte oppdaterer identitet, rettigheter og betaling samlet.
- **Spørsmål til Anders:** Skal gjester kunne fullføre første bestilling før konto er opprettet?

### B07 — Betaling

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Forklar betalingsvalget før bekreftelse og vis gjenværende coachingtimer og eventuelt mellomlegg.
- **Ferdig når:** Avbrudd eller gjentatte betalingshendelser gir ikke dobbelt trekk eller feil tilgang.
- **Spørsmål til Anders:** Når skal organisasjonen kunne betale på spillerens vegne?

### B08 — Bekreftelse

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis endelig pris, ansvarlig coach, deltaker, sted, tidspunkt og vilkår i én kontroll.
- **Ferdig når:** Bekreftelsen bygger på kontrollert ledighet og betaling, ikke bare et vellykket knappetrykk.
- **Spørsmål til Anders:** Hvilke opplysninger skal kunden kunne rette helt til siste steg?

### B09 — Etter kjøp

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble bekreftet booking til forberedelse i PlayerHQ, kalender og leveringsstatus for kvittering.
- **Ferdig når:** Bookingen består hvis en melding feiler; meldingen kan sendes på nytt uten nytt kjøp.
- **Spørsmål til Anders:** Hva skal spilleren forberede før hver tjenestetype?

### B10 — Endring

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis konsekvensen av endring før kunden bekrefter, basert på eksisterende 24-timersregel.
- **Ferdig når:** Avbestilling, faktisk refusjon og tilbakeført coachingtime har hver sin kontrollerte status.
- **Spørsmål til Anders:** Hvilke unntak skal coach kunne gi ved sykdom eller andre særtilfeller?

### B11 — Påminnelse

Eksisterende grunnlag: [D-B](#d-b) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle påminnelser rundt neste avtale, med forberedelser og riktig mottaker.
- **Ferdig når:** Endret eller avbestilt booking stopper foreldede påminnelser.
- **Spørsmål til Anders:** Når og i hvilken kanal er en påminnelse nyttig?

### B12 — Avvik

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hvert avvik en ansvarlig, en forståelig tilstand og et trygt neste steg.
- **Ferdig når:** Betaling som lykkes etter et avbrudd avstemmes før kunden bes betale igjen.
- **Spørsmål til Anders:** Hvilke avvik vil du håndtere personlig?

### B13 — Coachadministrasjon

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle tjenestekatalog, arbeidstid, fravær og kapasitet med forhåndsvisning av berørte avtaler.
- **Ferdig når:** En endring i arbeidstid flytter ikke bekreftede timer uten en uttrykkelig håndtering.
- **Spørsmål til Anders:** Hva kan coacher styre selv, og hva skal bare administrator endre?

### B14 — Måling

Eksisterende grunnlag: [D-B](#d-b) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Mål fra interesse til gjennomført time og vis ledig kapasitet og avbestillinger med datakilde.
- **Ferdig når:** Booket, betalt, refundert og gjennomført holdes adskilt i rapporten.
- **Spørsmål til Anders:** Hvilke tre tall vil du bruke til å styre bookingkapasiteten?

## PlayerHQ — I dag, plan, øvelser og Live

### P01 — Dagens viktigste handling

Eksisterende grunnlag: [K-I](#k-i) — kodelest delgrunnlag.

- **Forbedret funksjon:** Velg dagens hovedhandling ut fra aktiv økt, avtalt plan og ventende coachavklaring, med kort begrunnelse.
- **Ferdig når:** Spilleren kan starte eller fortsette riktig økt uten å lete i flere oversikter.
- **Spørsmål til Anders:** Hva skal ha forrang når spilleren både har en økt og et coachforslag?

### P02 — Neste økt

Eksisterende grunnlag: [K-I](#k-i) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis neste relevante økt med mål, utstyr og forberedelse og skill dagens agenda fra senere avtaler.
- **Ferdig når:** Tidspunkt og øktidentitet er de samme i I dag, Plan og Live.
- **Spørsmål til Anders:** Hva må spilleren se før det er trygt å trykke Start?

### P03 — Coachforslag

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis hva coachforslaget endrer, hvorfor det foreslås og hva spilleren kan svare.
- **Ferdig når:** Godta, avvise eller spørre oppdaterer samme forslag og kan ikke behandles dobbelt.
- **Spørsmål til Anders:** Hvilke forslag skal spilleren godta selv før de blir del av planen?

### P04 — Fremdrift

Eksisterende grunnlag: [K-I](#k-i) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis faktisk gjennomføring mot plan og valgt utviklingsmål, med datamangler synlig.
- **Ferdig når:** Samme økt telles én gang på tvers av eksisterende øktmodeller.
- **Spørsmål til Anders:** Hva vil du at spilleren først skal oppfatte som fremgang?

### P05 — Mangler og avvik

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle manglende registreringer og avklaringer i en kort, prioritert liste.
- **Ferdig når:** Løste forhold forsvinner, og en utsatt økt skaper ikke flere varsler om samme sak.
- **Spørsmål til Anders:** Hvilke mangler er viktige nok til å forstyrre spilleren?

### P10 — Mål og utgangspunkt

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi hvert mål startverdi, målekilde, frist, kontrollpunkt og sammenheng med treningsvalgene.
- **Ferdig når:** Endret mål bevarer historikken og skiller ny periode fra tidligere resultater.
- **Spørsmål til Anders:** Hvilke mål skal være resultatmål, og hvilke skal være treningsvaner?

### P11 — Årsplan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk årsplanen som oversikt over sesongmål, perioder, konkurranser og tilgjengelig kapasitet.
- **Ferdig når:** Årsendringer viser hvilke uker og økter de påvirker før publisering.
- **Spørsmål til Anders:** Hvordan begynner du en årsplan når du får en ny spiller?

### P12 — Periodisering

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hver periode en hensikt, prioriteringer og kontrollpunkt, med coachstyrte anbefalinger.
- **Ferdig når:** Perioden påvirker forslagene uten å gjeninnføre pensjonerte treningssperrer.
- **Spørsmål til Anders:** Hva avgjør at en spiller bør gå videre til neste periode?

### P13 — Månedsplan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Oversett periodens hensikt til månedens fokus, øktmengde og evaluering.
- **Ferdig når:** Måneden stemmer med årsplan og ukene, og avvik forklares.
- **Spørsmål til Anders:** Hva må være avklart på månedsnivå før du planlegger uken?

### P14 — Ukesplan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lag en realistisk uke ut fra tid, sted, gruppeøkter, konkurranse og spillerens tilgjengelighet.
- **Ferdig når:** Flytting viser konflikter og bevarer individuelle tilpasninger.
- **Spørsmål til Anders:** Hva kan spilleren flytte selv uten å spørre deg?

### P15 — Øktplan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle mål, øvelser, mengde, registrering og alternativ ved tids- eller utstyrsmangel.
- **Ferdig når:** En planlagt økt åpner med samme innhold i riktig Live-spor.
- **Spørsmål til Anders:** Hva må enhver god øktplan inneholde?

### P16 — Teknisk plan

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle aktiv teknisk oppgave, forklaring, arbeidsfølelse, medier og målepunkter i en løpende plan.
- **Ferdig når:** Økt, video og TrackMan kan knyttes til samme oppgave og senere evalueres samlet.
- **Spørsmål til Anders:** Hvordan beskriver du en teknisk oppgave slik at spilleren trener riktig alene?

### P17 — Turnering og gameplan

Eksisterende grunnlag: [K-G](#k-g) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble turneringens forberedelse, banestrategi og etterarbeid til spillerens ukeplan.
- **Ferdig når:** En turneringsendring viser berørte forberedelser og kontrollpunkter.
- **Spørsmål til Anders:** Hva skal alltid skje før og etter en viktig turnering?

### P18 — Gruppe til individ

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Publiser gruppeinnhold som et sporbar forslag til den individuelle planen med egne tilpasninger.
- **Ferdig når:** Ny gruppeversjon lager ikke dubletter eller overskriver spillerens endringer i det skjulte.
- **Spørsmål til Anders:** Når skal individuell tilpasning vinne over endret gruppeplan?

### P19 — AI-planforslag

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** La AI foreslå et begrenset planutkast med kilder, antakelser og synlige endringer.
- **Ferdig når:** Forslaget endrer ikke faglig plan før riktig person godkjenner det.
- **Spørsmål til Anders:** Hvilke planbeslutninger vil du at AI først skal hjelpe deg med?

### P20 — Øvelseskatalog

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Søk etter treningsbehov, tid, sted og utstyr, og vis hva øvelsen trener og hvordan den måles.
- **Ferdig når:** En valgt øvelse kan legges i planen uten å fylle ut samme informasjon på nytt.
- **Spørsmål til Anders:** Hvordan leter du etter riktig øvelse i dag?

### P21 — Coachøvelse

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi coachøvelser eier, faglig beskrivelse og versjon, med tydelig privat eller delt status.
- **Ferdig når:** Redigering endrer ikke dokumentasjonen av allerede gjennomførte økter.
- **Spørsmål til Anders:** Hvem skal kvalitetssikre en øvelse før den deles bredt?

### P22 — Spillerens favoritter

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** La spilleren lagre favoritter med egen merknad og finne dem igjen fra øktplanlegging.
- **Ferdig når:** Favoritter peker til gyldig øvelse og viser når innholdet er endret.
- **Spørsmål til Anders:** Vil spillerne helst lagre enkeltøvelser eller små øktpakker?

### P23 — Øvelse i plan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Tilpass mengde, mål og registrering til øvelsens hensikt og spillerens aktive oppgave.
- **Ferdig når:** Øktresultatet kan sammenlignes med akkurat den dosen og målsettingen som ble planlagt.
- **Spørsmål til Anders:** Hvilke registreringer er nødvendige for hver øvelsestype?

### P24 — Treningsprogram

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk programmer som maler som tilpasses og legges inn i samme spillerplan.
- **Ferdig når:** Endring av malen påvirker ikke publiserte eller fullførte økter uten nytt valg.
- **Spørsmål til Anders:** Hvilke deler av et program må alltid tilpasses individuelt?

### P25 — Effekt

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis gjennomføring, utvikling og coachens vurdering for en øvelse uten å påstå sikker årsak.
- **Ferdig når:** Visningen oppgir tidsperiode og datamengde og skiller observasjon fra forklaring.
- **Spørsmål til Anders:** Hva vil overbevise deg om at en øvelse bør videreføres eller byttes?

### P30 — Start økt

Eksisterende grunnlag: [K-I](#k-i) — kodelest delgrunnlag.

- **Forbedret funksjon:** Start riktig planlagte økt eller gjenoppta den aktive, med tydelig øktmål.
- **Ferdig når:** Gjentatt trykk starter ikke to økter; avbrudd beholder riktig identitet.
- **Spørsmål til Anders:** Hva skal skje når spilleren vil starte noe annet enn dagens plan?

### P31 — Egenøkt

Eksisterende grunnlag: [D-L](#d-l) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gjør egenøkten enkel å følge med øvelse, arbeidsmål, registrering og plan B.
- **Ferdig når:** Spilleren kan avvike med en kort grunn og beholde planlagt og faktisk innhold separat.
- **Spørsmål til Anders:** Hvor fritt skal spilleren kunne endre en egenøkt underveis?

### P32 — Coachledet økt

Eksisterende grunnlag: [K-L](#k-l) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi coach og spiller en delt øktkontekst med ulike handlinger og tydelig ansvar.
- **Ferdig når:** Begge ser samme øktstatus uten at den enes notat overskriver den andres vurdering.
- **Spørsmål til Anders:** Hva skal spilleren kunne gjøre mens coachen leder økten?

### P33 — Hurtigregistrering

Eksisterende grunnlag: [D-L](#d-l) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Tilpass hurtigregistrering til øvelsen, med sist brukte valg og enkel retting.
- **Ferdig når:** Feiltrykk kan korrigeres uten at hele økten må registreres på nytt.
- **Spørsmål til Anders:** Hva er minimum du trenger registrert under selve treningen?

### P34 — Bilder og video

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Knytt media direkte til valgt økt, øvelse eller teknisk oppgave med synlig opplastingsstatus.
- **Ferdig når:** Avbrudd kan gjenopptas, og media havner ikke på feil spiller eller økt.
- **Spørsmål til Anders:** Når skal opptak knyttes til en øvelse versus en teknisk oppgave?

### P35 — Tale

Eksisterende grunnlag: [D-T](#d-t) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** La kort diktering foreslå et notat i aktuell sammenheng, med enkel retting før lagring.
- **Ferdig når:** Brukeren ser målstedet og kan korrigere feil spiller, tall eller fagord.
- **Spørsmål til Anders:** Hvilke opplysninger vil du helst diktere fremfor å skrive?

### P36 — Uten nett

Eksisterende grunnlag: [K-O](#k-o) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis hva som er lagret lokalt, venter på synk og er bekreftet lagret sentralt.
- **Ferdig når:** Avbrudd, omstart og brukerbytte gir verken tap, dubletter eller innsyn i andres utkast.
- **Spørsmål til Anders:** Hvilke handlinger må absolutt virke uten nett på treningsfeltet?

### P37 — Avslutning

Eksisterende grunnlag: [K-L](#k-l) — kodelest delgrunnlag.

- **Forbedret funksjon:** Avslutt med faktisk gjennomføring, egenvurdering, læring og neste oppgave.
- **Ferdig når:** Fullført økt og bekreftet lagring vises separat, med mulighet til å rette mangler.
- **Spørsmål til Anders:** Hvilke spørsmål skal spilleren svare på etter en økt?

## PlayerHQ — analyse og øvrige funksjoner

### P40 — Oversikt

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle trening, runder, tester og TrackMan med ett viktig funn og en tydelig vei til detaljene.
- **Ferdig når:** Ulike målekilder blandes ikke til en udokumentert totalscore.
- **Spørsmål til Anders:** Hva vil du først vite når du åpner spillerens analyse?

### P41 — Trening

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis planlagt mot gjennomført mengde, kvalitet, kontinuitet og avvik per treningsområde.
- **Ferdig når:** Tidsperiode og beregningsgrunnlag er likt for spiller og coach.
- **Spørsmål til Anders:** Hva betyr treningskvalitet i dine vurderinger?

### P42 — Runder og SG

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Forklar slag vunnet eller tapt mot valgt referanse og tilpass analysen til registreringsdetaljen.
- **Ferdig når:** Totalrunde, hullføring og slagføring gir bare analyser datagrunnlaget støtter; brutto score brukes.
- **Spørsmål til Anders:** Hvilken referanse vil du at ulike spillere først skal sammenligne seg med?

### P43 — TrackMan

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk TrackMan som én sammenhengende reise fra import til forståelig tiltak og ny kontroll.
- **Ferdig når:** Analyse lenker tilbake til kilden og frem til relevant teknisk oppgave.
- **Spørsmål til Anders:** Hva bør spilleren forstå etter å ha åpnet en TrackMan-økt?

### P44 — Tester

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis testens protokollversjon, gjennomføring, resultat og eventuell trenerattestering.
- **Ferdig når:** Bare sammenlignbare forsøk legges på samme utviklingskurve.
- **Spørsmål til Anders:** Hvilke tester trenger trenerattestering, og hvilke kan gjøres alene?

### P45 — Historikk

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle hendelser i en tidslinje med planversjon, målinger, økter og coachbeslutninger.
- **Ferdig når:** Brukeren kan forklare hvilken plan og beslutning et gammelt resultat tilhørte.
- **Spørsmål til Anders:** Hvilke historiske hendelser er mest nyttige før en coachingtime?

### P46 — Neste handling

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hvert tiltak kilde, begrunnelse, ansvarlig og tidspunkt for ny vurdering.
- **Ferdig når:** Godkjent tiltak blir en konkret oppgave i planen som kan følges opp.
- **Spørsmål til Anders:** Når er datagrunnlaget godt nok til at du vil foreslå en endring?

### P50 — Coachkontakt

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Knytt spørsmål og svar til økten, planen eller resultatet de gjelder og vis forventet svartid.
- **Ferdig når:** Coach og spiller følger samme samtale og samme faglige kontekst.
- **Spørsmål til Anders:** Hva skal spilleren kunne kontakte coach om mellom timene?

### P51 — Remote coaching

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bygg remote coaching som en full leveranse rundt eksisterende video og spillerplan, med status og kvote.
- **Ferdig når:** Mottatt, under vurdering og faktisk ferdig vurdert er tydelig forskjellige tilstander.
- **Spørsmål til Anders:** Hva skal en fullført remote-leveranse inneholde?

### P52 — Booking og kjøp

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle neste time, gjenværende coachingtimer, betaling og tilgangsperiode i spillerens oversikt.
- **Ferdig når:** Endring og oppsigelse bruker samme regler som bookingkjernen.
- **Spørsmål til Anders:** Hva skal spilleren kunne ordne helt selv rundt sitt kjøp?

### P53 — Kalender

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle trening, coaching, konkurranse og tilgjengelighet med tydelig skille mellom forslag og avtale.
- **Ferdig når:** Samme hendelse vises én gang og endres fra riktig kilde.
- **Spørsmål til Anders:** Hvilken kalender skal være styrende når to kilder er uenige?

### P54 — Helse og fysisk

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Bruk egenrapportert dagsform og fysisk trening som støtte til samtale og planjustering, med avgrenset deling.
- **Ferdig når:** Systemet viser observerte data og coachforslag uten å stille diagnose.
- **Spørsmål til Anders:** Hvilke opplysninger trenger du faktisk for å tilpasse treningen?

### P55 — Mål og utviklingsplan

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle mål og utviklingsløp med P10, og vis neste milepæl og hvordan treningen bidrar.
- **Ferdig når:** Endring av mål oppdaterer alle visninger fra samme grunnlag.
- **Spørsmål til Anders:** Hvordan skal spilleren se sammenhengen mellom langtidsmål og denne uken?

### P56 — Talent

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gjør gratisprofilens eksisterende tester, runderegistrering og analyse nyttige med tydelig oppgraderingsvei.
- **Ferdig når:** TALENT- og FULL-reglene bevares og sensitive opplysninger deles bare med tillatt mottaker.
- **Spørsmål til Anders:** Hva skal være den viktigste verdien av å beholde gratisprofilen?

### P57 — Gameplan og baneguide

Eksisterende grunnlag: [K-G](#k-g) — kodelest delgrunnlag.

- **Forbedret funksjon:** Utvid eksisterende sikte og soner med hullnotat, køllegrunnlag og alternativ strategi; skill senere GPS-funksjon tydelig.
- **Ferdig når:** En lagret gameplan kan åpnes igjen og brukes uten at plan og faktisk slag forveksles.
- **Spørsmål til Anders:** Hva trenger spilleren hjelp til før runden versus under runden?

### P58 — Utstyr og bag

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle utstyr og dokumenterte køllelengder med dato og forskjell på målt og anslått.
- **Ferdig når:** Gameplan bruker det lengdegrunnlaget spilleren faktisk har valgt.
- **Spørsmål til Anders:** Hvilke utstyrsopplysninger påvirker dine trenings- eller strategivalg?

### P59 — Sosialt

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Prioriter avtalte treningsutfordringer og støttende deling med kontrollerte mottakere.
- **Ferdig når:** Resultater kan sammenlignes rettferdig og brukeren kan trekke seg uten å miste egne data.
- **Spørsmål til Anders:** Hvilken sosial funksjon vil få spillerne til å trene bedre sammen?

### P60 — Forelder

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi forelder en egen støtterolle rundt barnets uke, avtaler og nødvendige samtykker.
- **Ferdig når:** Barnbytte, bestilling og deling følger godkjent relasjon uten sammenblanding.
- **Spørsmål til Anders:** Hva skal forelder kunne endre, og hva skal bare spilleren eller coachen bestemme?

### P61 — Dokumenter og hjelp

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle relevante dokumenter og hjelp i konteksten der de trengs, med versjon og eier.
- **Ferdig når:** Brukeren finner riktig dokument og kan be om hjelp uten å forklare hele saken på nytt.
- **Spørsmål til Anders:** Hvilke dokumenter må en spiller lett finne igjen?

### P62 — Konto og personvern

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle profil, varsler, tilgang, integrasjoner og datarettigheter med tydelig status for bestilte endringer.
- **Ferdig når:** Eksport eller sletting kan følges til ferdig behandling, også for eksterne kopier som omfattes.
- **Spørsmål til Anders:** Hvilke kontohandlinger skal brukeren kunne utføre selv?

## TrackMan

### TM01 — Inndata

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle eksisterende CSV-, HTML- og bildeimport i én kildevelger med forklaring av støttet innhold.
- **Ferdig når:** Forhåndsvisning og lagring bruker samme valgte slag; filtypen bestemmer ikke ulike sannheter.
- **Spørsmål til Anders:** Hvilket av dagens kildeformater bruker du og spillerne mest?

### TM02 — Tolking

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis gjenkjente kolonner, enheter, køller og målekontekst og be om avklaring ved tvetydighet.
- **Ferdig når:** Manglende enhet blir ikke stilletiende gjettet, og originalverdien kan spores.
- **Spørsmål til Anders:** Hvilke uvanlige eksportformater må vi prioritere?

### TM03 — Kontroll

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi importen en kontrollside for utvalg, mistenkelige verdier og lignende eksisterende økter.
- **Ferdig når:** Utelatte slag beholdes sporbare; ny import av samme materiale lager ikke skjulte dubletter.
- **Spørsmål til Anders:** Når skal systemet advare om et slag, og når skal det kreve retting?

### TM04 — Økt

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi måleøkten hensikt, miljø, køller, notat og kobling til coaching eller egenøkt.
- **Ferdig når:** Det går å finne igjen og forstå hva som faktisk ble forsøkt i økten.
- **Spørsmål til Anders:** Hvilken kontekst må alltid følge TrackMan-dataene?

### TM05 — Parametere

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Forklar relevante parametere og skill manglende verdi fra null, beregnet verdi og direkte måling.
- **Ferdig når:** Hvert vist tall har enhet og opprinnelse.
- **Spørsmål til Anders:** Hvilke parametere vil du prioritere for de vanligste tekniske oppgavene?

### TM06 — Visning

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis spredning, enkeltutslag og oppsummeringer med valgt utvalg og antall slag tydelig.
- **Ferdig når:** Endret filter oppdaterer alle tall og grafer konsistent.
- **Spørsmål til Anders:** Hvilke visninger bruker du til å forklare økten for spilleren?

### TM07 — Sammenligning

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Sammenlign like køller og måleforhold og gjør ulikheter synlige før to økter sammenlignes.
- **Ferdig når:** Uforenlige målinger presenteres ikke som sikker fremgang eller tilbakegang.
- **Spørsmål til Anders:** Hvilke forhold må være like før du stoler på sammenligningen?

### TM08 — Gapping og bag

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Oppdater bagens lengdegrunnlag gjennom et kontrollert valg av representative slag.
- **Ferdig når:** Carry, total og spredning viser kilde, antall slag og dato uten å overskrive manuelle valg ubemerket.
- **Spørsmål til Anders:** Når vil du godta nye lengder som spillerens gjeldende bag?

### TM09 — Teknisk kobling

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Viderefør eksisterende oppgavematching og la coach bekrefte eller korrigere koblingen til video og arbeidsfølelse.
- **Ferdig når:** Teknisk oppgave viser både opprinnelig kobling og senere rettinger.
- **Spørsmål til Anders:** Skal systemet foreslå oppgavekobling eller velge automatisk i entydige tilfeller?

### TM10 — Signal

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Skill mulig signal fra stabil endring og forklar hvilke målinger som støtter vurderingen.
- **Ferdig når:** Lite eller sprikende materiale gir tydelig usikkerhet og forslag til bedre måling.
- **Spørsmål til Anders:** Hva må være oppfylt før du omtaler en endring som stabil?

### TM11 — Tiltak

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lag tiltak som konkret test, øvelse eller planjustering med faglig begrunnelse.
- **Ferdig når:** Tiltaket viser nøyaktig hva som blir endret før riktig coach godkjenner.
- **Spørsmål til Anders:** Hvilke typer tiltak vil du at TrackMan skal kunne foreslå først?

### TM12 — Oppfølging

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Knytt godkjent tiltak til en økt og et avtalt kontrollpunkt for ny måling.
- **Ferdig når:** Ny kontroll kan sammenlignes med utgangspunktet og avslutte eller videreføre tiltaket.
- **Spørsmål til Anders:** Hvor raskt bør forskjellige tekniske endringer måles på nytt?

### TM13 — Deling

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Del et avgrenset utvalg med relevant forklaring og synlig mottaker.
- **Ferdig når:** Tilbakekalling stopper videre innsyn, og rapporten skjuler data utenfor delingen.
- **Spørsmål til Anders:** Hva skal en ekstern fagperson få se når du deler en TrackMan-vurdering?

### TM14 — Feil og drift

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bevar brukerens valg gjennom filfeil, avbrutt opplasting og nytt forsøk.
- **Ferdig når:** Nytt forsøk lager ikke en ny analyse eller ny økt uten behov.
- **Spørsmål til Anders:** Hvilke importfeil skal spilleren kunne rette selv?

### TM15 — Sporbarhet

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis kildeformat, importtid, utvalg, rettinger og eventuell AI-avlesning i en enkel kildelogg.
- **Ferdig når:** Et tall i analysen kan følges tilbake til importen og relevante endringer.
- **Spørsmål til Anders:** Hvor lenge trenger du originalmaterialet for etterkontroll?

## AgencyOS — coach og drift

### A01 — Kvelds-/morgenbrief

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lag en kort brief med dagens avtaler, nødvendige forberedelser, ventende beslutninger og ferskhet per kilde.
- **Ferdig når:** Briefen skiller bekreftede opplysninger fra manglende eller gamle data.
- **Spørsmål til Anders:** Hva må morgenbriefen vise for at du kan starte dagen uten andre systemer?

### A02 — NÅ

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Prioriter én neste handling etter frist, avtale og betydning, med kort forklaring og mulighet til å utsette.
- **Ferdig når:** Utsettelse og fullføring endrer køen uten at samme sak dukker opp igjen umiddelbart.
- **Spørsmål til Anders:** Hva skal alltid gå foran andre oppgaver i din arbeidsdag?

### A03 — Kalender

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle coaching, forberedelse, reise og administrasjon uten å blande forslag og bekreftede avtaler.
- **Ferdig når:** Kollisjon vises før en endring lagres eller publiseres.
- **Spørsmål til Anders:** Hvor mye av arbeidsdagen vil du planlegge som faste tidsblokker?

### A04 — Spillerforberedelse

Eksisterende grunnlag: [K-L](#k-l) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis siden sist, aktiv teknisk oppgave, relevante målinger og uavklarte spørsmål før timen.
- **Ferdig når:** Coach kan åpne kilden til hvert punkt og starte riktig økt.
- **Spørsmål til Anders:** Hva leser eller ser du på rett før en coachingtime?

### A05 — Risiko

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lag forklarte oppfølgingssignaler med ansvarlig, grunn og frist uten skjult risikoscore.
- **Ferdig når:** Et signal kan avvises eller løses med grunn og blir ikke en automatisk vurdering av personen.
- **Spørsmål til Anders:** Hvilke hendelser betyr at en spiller trenger din oppfølging?

### A06 — Agentstatus

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis hva agenten faktisk har utført, hva som bare er foreslått, og hva som er blokkert.
- **Ferdig når:** Ferdigstatus krever bekreftet resultat, og feil har et konkret neste steg.
- **Spørsmål til Anders:** Hvilke agenthendelser ønsker du aktiv beskjed om?

### A10 — Ett beslutningskort

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle forslag i beslutningskort med før/etter, kilde, mottaker og konsekvens.
- **Ferdig når:** Godkjenning utfører det viste forslaget, og endret grunnlag utløser ny kontroll.
- **Spørsmål til Anders:** Hva må du alltid se før du kan godkjenne et forslag?

### A11 — Handlinger

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** La coach redigere et forslag før godkjenning og bevare både original og godkjent innhold.
- **Ferdig når:** Den utførte handlingen er lik redigert versjon, og kommentar alene er ikke en faglig endring.
- **Spørsmål til Anders:** Hvilke deler av et forslag vil du oftest redigere?

### A12 — Massehandling

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Tillat samlet behandling bare av sammenlignbare forslag med tydelig mottakerliste og konsekvens.
- **Ferdig når:** Delvis feil vises per sak, og allerede behandlede saker kjøres ikke igjen.
- **Spørsmål til Anders:** Hvilke konkrete oppgaver egner seg for massegodkjenning?

### A13 — Historikk

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hver beslutning en historikk over forslag, endring, godkjenner og faktisk resultat.
- **Ferdig når:** En feil kan spores til riktig versjon og reverseres der det er mulig.
- **Spørsmål til Anders:** Hvilke handlinger trenger en egen angrefunksjon?

### A14 — Frist og SLA

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Sett forventet svartid, ansvarlig og eskaleringsvei per sakstype.
- **Ferdig når:** Fravær og utsatt sak gir oppdatert frist og korrekt mottaker.
- **Spørsmål til Anders:** Hvilke frister skal utløse varsel til deg eller en stedfortreder?

### A20 — Oversikt

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle spillerens viktigste mål, avtaler, planstatus og åpne oppfølginger i én oversikt.
- **Ferdig når:** Oversikten er avgrenset til coachens tillatte spillere og viser kildenes ferskhet.
- **Spørsmål til Anders:** Hva er de fem viktigste opplysningene på spillerkortet?

### A21 — Hele planen

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi coach tilgang til samme plan som spilleren med ekstra verktøy for tilpasning og publisering.
- **Ferdig når:** Coachendring og spillerens synlige versjon kan sammenlignes uten parallelle planer.
- **Spørsmål til Anders:** Hvordan skal du arbeide mellom årsplan og detaljert økt uten å miste sammenheng?

### A22 — Historikk

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle coachhistorikk og spillerens hendelser med egne filtre for tema, periode og kilde.
- **Ferdig når:** Private coachnotater skilles fra innhold som er levert til spilleren.
- **Spørsmål til Anders:** Hvilke notater skal forbli private for coachteamet?

### A23 — Analyse

Eksisterende grunnlag: [K-TM](#k-tm) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis samme målegrunnlag som PlayerHQ med mer faglig detalj og mulighet til å opprette tiltak.
- **Ferdig når:** Coachens og spillerens tall stemmer, selv om forklaring og detaljnivå er ulikt.
- **Spørsmål til Anders:** Hvilke analyser trenger coachen som spilleren ikke trenger å se først?

### A24 — Kontakt

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle kontakt, spørsmål og oppgaver rundt spilleren med tydelig ansvar og svartid.
- **Ferdig når:** Et besvart spørsmål kan knyttes til planen eller økten som ble endret.
- **Spørsmål til Anders:** Hvordan vil du håndtere korte spørsmål versus faglige vurderinger?

### A25 — Administrasjon

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle administrasjon av booking, tilgang, forelder og deling med synlig konsekvens før endring.
- **Ferdig når:** Endret organisasjon eller coachtilknytning gir kontrollerte rettigheter og historikk.
- **Spørsmål til Anders:** Hvilke administrative handlinger skal hver coach få gjøre?

### A26 — Handling

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Tilby neste naturlige handling ut fra spillerens faktiske situasjon: forberede, starte, svare eller evaluere.
- **Ferdig når:** Handlingen åpner riktig kontekst og unngår at samme oppgave opprettes på nytt.
- **Spørsmål til Anders:** Hvordan velger du neste steg for en spiller når du åpner profilen?

### A30 — Før

Eksisterende grunnlag: [K-L](#k-l) — kodelest delgrunnlag.

- **Forbedret funksjon:** Sammenstill øktbrief fra plan, forrige oppsummering, media og nye resultater.
- **Ferdig når:** Manglende eller gamle kilder merkes og påvirker ikke forslaget i det skjulte.
- **Spørsmål til Anders:** Hva skal briefen ha klart før spilleren kommer?

### A31 — Start

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Start økten med valgt spiller, mål og separat aktiv opptakshandling.
- **Ferdig når:** Samtykke og opptaksstatus kontrolleres og vises også etter gjenopptakelse.
- **Spørsmål til Anders:** Når i timen vil du normalt starte opptaket?

### A32 — Under

Eksisterende grunnlag: [K-L](#k-l) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hurtigtilgang til plan, teknisk oppgave, øvelser og tidsmerkede observasjoner.
- **Ferdig når:** Flere samtidige notater og vurderinger bevares uten overskriving.
- **Spørsmål til Anders:** Hva trenger du å registrere mens du står ved siden av spilleren?

### A33 — iPhone-fangst

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble iPhone til den aktive økten med tydelig spillerbekreftelse og synlig opplastingskø.
- **Ferdig når:** Feil eller utløpt øktkobling krever nytt valg før media lagres.
- **Spørsmål til Anders:** Skal telefonen oftest brukes av coachen, spilleren eller begge?

### A34 — Lyd

Eksisterende grunnlag: [K-O](#k-o) — kodelest delgrunnlag.

- **Forbedret funksjon:** Viderefør lyd i deler med pause, lokal kø og oversikt over manglende opplastinger.
- **Ferdig når:** Opptaket kan gjenopprettes etter brudd, og ufullstendig lyd merkes før behandling.
- **Spørsmål til Anders:** Hva skal skje hvis opptaket svikter midt i timen?

### A35 — Etter

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lag et kontrollbart utkast med oppsummering, tekniske oppgaver og hjemmeoppgave fra tillatt materiale.
- **Ferdig når:** Utsagn kan spores til opptak eller notat; uklare utsagn blir spørsmål.
- **Spørsmål til Anders:** Hvordan skal en god oppsummering etter timen se ut for deg og spilleren?

### A36 — Godkjenning

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle oppsummering, planendringer og meldingsutkast i én kontroll med separat valg av leveranser.
- **Ferdig når:** Godkjenning viser nøyaktig hvilke data og mottakere som berøres.
- **Spørsmål til Anders:** Vil du godkjenne hele leveransen samlet eller enkelte deler hver for seg?

### A37 — Levering

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Lever godkjente deler til riktig spiller og oppdater neste oppfølging med leveringsstatus.
- **Ferdig når:** En mislykket varsling lager ikke dobbel oppgave eller ny planendring.
- **Spørsmål til Anders:** Hva skal spilleren alltid ha mottatt når timen er ferdig behandlet?

### A40 — Booking og kapasitet

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi samlet oversikt over kapasitet, arbeidstid, avvik og ventende bestillinger.
- **Ferdig når:** Forslag om bedre utnyttelse respekterer buffer, kompetanse og bekreftede avtaler.
- **Spørsmål til Anders:** Hva betyr god kapasitetsutnyttelse uten at dagen blir for tett?

### A41 — Kommunikasjon

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle meldinger og e-postutkast i én saksflyt med mottakerkontroll og kontekst.
- **Ferdig når:** Samme henvendelse har én ansvarlig og utgående kommunikasjon følger avtalt godkjenning.
- **Spørsmål til Anders:** Hvilke kanaler må være med i den første samlede innboksen?

### A42 — Oppgaver og prosjekter

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle oppgaver, frister og prosjektreferanser med tydelig fasitkilde og eier.
- **Ferdig når:** Fullføring i riktig kilde gjenspeiles uten å opprette en konkurrerende oppgaveliste.
- **Spørsmål til Anders:** Hva skal være fasit for oppgaver og prosjekter i din hverdag?

### A43 — Leads og salg

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Følg henvendelse til avklaring, tilbud og kunde med neste handling og ansvar.
- **Ferdig når:** Ingen interessent faller ut av oppfølgingen uten avslutningsgrunn.
- **Spørsmål til Anders:** Hvilke steg går en ny kunde gjennom før vedkommende kjøper?

### A44 — Marked

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Koble innholdsutkast til et reelt tilbud, målgruppe, godkjenning og målt respons.
- **Ferdig når:** Et godkjent utkast omtales ikke som publisert før publisering er bekreftet.
- **Spørsmål til Anders:** Hvilke markedsoppgaver vil du at systemet skal forberede hver uke?

### A45 — Organisasjoner

Eksisterende grunnlag: [K-N](#k-n) — kodelest delgrunnlag.

- **Forbedret funksjon:** Behold egne WANG-, Team Norway- og klubbflater med delte plan- og testfunksjoner under.
- **Ferdig når:** Organisasjonsbytte endrer rettigheter, innhold og ansvar uten sammenblanding.
- **Spørsmål til Anders:** Hvilke oppgaver er like på tvers av organisasjonene, og hvilke er særskilte?

### A46 — Tester og øvelser

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle øvelser, testprotokoller, tildeling og attestering med versjon og fagansvarlig.
- **Ferdig når:** En testdag viser hvem som mangler resultat og hvem som trenger ny måling.
- **Spørsmål til Anders:** Hvordan vil du gjennomføre en testdag fra tildeling til ferdig rapport?

### A47 — Talent

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis dokumentert spillerutvikling med datadekning, sammenligningsgrunnlag og menneskelig vurdering.
- **Ferdig når:** Manglende data tolkes ikke som svakt talent, og uttak gjøres av ansvarlige mennesker.
- **Spørsmål til Anders:** Hvilke observasjoner trenger du før en spiller tas med i en talentvurdering?

### A48 — Video og remote

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi video og remote en egen leveransekø koblet til den eksisterende spillerplanen.
- **Ferdig når:** Mottatt fil er ikke ferdig analyse; køen viser faktisk faglig leveranse.
- **Spørsmål til Anders:** Hvordan skal remote-arbeid prioriteres mellom fysiske coachingtimer?

### A49 — Økonomi

Eksisterende grunnlag: [K-D](#k-d) — kodelest delgrunnlag.

- **Forbedret funksjon:** Skill dokumenterte regnskapstall fra booking- og aktivitetsdata og vis kilde og periode.
- **Ferdig når:** Et antall abonnementer ganget med listepris presenteres ikke som faktisk regnskapsinntekt.
- **Spørsmål til Anders:** Hvilke beslutninger skal økonomioversikten hjelpe deg å ta?

### A50 — Rapporter

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Generer spiller- og grupperapporter fra de samme målingene og planene som arbeidsflatene.
- **Ferdig når:** Rapporten oppgir periode, datamangler og tilgang og kan gjenfinnes i levert versjon.
- **Spørsmål til Anders:** Hvilke rapporter trenger hvem, og hvor ofte?

### A51 — Brukere og tilgang

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis roller, aktive relasjoner, invitasjoner og delinger i en forståelig tilgangsoversikt.
- **Ferdig når:** Tilbakekalling kontrolleres også ved direkte lenke og videre skriving.
- **Spørsmål til Anders:** Hvem skal kunne invitere, gi tilgang og tilbakekalle den?

### A52 — Integrasjoner

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi hver integrasjon synlig ansvar, datakilde, siste vellykkede oppdatering og feiltilstand.
- **Ferdig når:** Stanset integrasjon blir ikke tolket som tom spillerhistorikk eller null aktivitet.
- **Spørsmål til Anders:** Hvilke integrasjoner må fungere hver dag for at du kan drive virksomheten?

## AgenticOS

### AG01 — Hendelser

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Knytt hendelsestyper til avgrensede arbeidsflyter med eier og entydig hendelsesidentitet.
- **Ferdig når:** Gjentatt mottak av samme hendelse gir ikke dobbelt arbeid.
- **Spørsmål til Anders:** Hvilke hendelser skal automatisk opprette en oppgave eller et forslag?

### AG02 — Jobber

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle varige jobber med avhengigheter, nytt forsøk, stopp og kontrollert gjenopptakelse.
- **Ferdig når:** En jobb kan overleve omstart og skiller utført del fra gjenstående del.
- **Spørsmål til Anders:** Hvilke arbeidsflyter må fullføres selv om du lukker appen?

### AG03 — Ferdigheter

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi hver agent tydelig oppgave, tillatte kilder, verktøy og forventet resultat.
- **Ferdig når:** Agenten kan ikke ta i bruk nye datakilder eller handlinger uten riktig policy.
- **Spørsmål til Anders:** Hvilke faste roller vil du at agentene skal fylle først?

### AG04 — Modellruting

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Velg modell etter avklart oppgavetype, kvalitet, tillatt databehandling og kostnad.
- **Ferdig når:** Bytte av modell endrer ikke datagrensen eller godkjenningskravet.
- **Spørsmål til Anders:** Hva er viktigst for hver oppgavetype: kvalitet, svartid eller kostnad?

### AG05 — Godkjenning

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Definer godkjenningsnivå for hver handling fremfor én generell autonomibryter.
- **Ferdig når:** Handlinger som påvirker mennesker følger eksplisitt regel og viser konsekvensen.
- **Spørsmål til Anders:** Hvilke konkrete handlinger kan utføres uten at du godkjenner hver gang?

### AG06 — Kvalitet

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Mål faglige feil, nytte og faktisk redigeringsbehov per oppgavetype med godkjente eksempler.
- **Ferdig når:** Ny agentversjon vurderes mot samme eksempler før mer ansvar gis.
- **Spørsmål til Anders:** Hva er en uakseptabel feil i hver av de viktigste agentoppgavene?

### AG07 — Personvern

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Definer tillatt informasjon per arbeidsflyt og anonymiser eller behandle lokalt før eventuell skybruk.
- **Ferdig når:** Ukjent fritekst, lyd, bilder og vedlegg sendes ikke automatisk ut av den tillatte grensen.
- **Spørsmål til Anders:** Hvilke arbeidsflyter skal bruke bare lokale eller anonymiserte opplysninger?

### AG08 — Kostnad

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis faktisk modellforbruk og eventuelle manglende kostnadsdata per jobb, med stoppgrense.
- **Ferdig når:** Jobber stopper eller ber om ny beslutning når godkjent grense nås.
- **Spørsmål til Anders:** Hvilket kostnadstak vil du sette for en øktbehandling og en vanlig dag?

### AG09 — Drift

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle siste resultat, feil, ventende jobb og stoppfunksjon på samme arbeidsflate.
- **Ferdig når:** Stopp hindrer nye handlinger og viser hva som allerede er utført.
- **Spørsmål til Anders:** Hvilke feil krever straksvarsel fremfor en oppføring i morgenbriefen?

### AG10 — Læring

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk rettinger som forslag til forbedret regel med forklaring og versjon.
- **Ferdig når:** En enkelt redigering endrer ikke agentens fremtidige oppførsel uten vurdering.
- **Spørsmål til Anders:** Når ønsker du at en tilbakevendende retting skal foreslås som fast regel?

### AG11 — Kodearbeid

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Knytt kodearbeid til bestilt oppgave, egen gren, kontroller og konkret gjennomgang.
- **Ferdig når:** Godkjenningskort viser hva som er endret og kontrollert før separat publiseringsbeslutning.
- **Spørsmål til Anders:** Hvilket ferdig bevis trenger du før kode kan godkjennes for publisering?

### AG12 — Kontinuerlig arbeid

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** La godkjente oppgaver fortsette med avklart omfang, budsjett og stoppvilkår.
- **Ferdig når:** Arbeidet stopper ved uavklart produktvalg og gjenopptas fra dokumentert status.
- **Spørsmål til Anders:** Hvilke oppgaver vil du først overlate til kontinuerlig arbeid?

## Remote coaching

### R01 — Produkt

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Beskriv et avgrenset remote-produkt som gjenbruker spillerplan, video og coachoppfølging.
- **Ferdig når:** Omfang, responstid og inkluderte leveranser er tydelige før kjøp.
- **Spørsmål til Anders:** Hva skal kunden konkret få i én remote-periode?

### R02 — Oppstart

Eksisterende grunnlag: [D-P](#d-p) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gjenbruk spillerprofil og tidligere målinger og spør bare om opplysninger som mangler.
- **Ferdig når:** Første plan kan forklares med mål, tilgjengelighet og faktisk utgangspunkt.
- **Spørsmål til Anders:** Hva må du vite før du kan gi første digitale coachingråd?

### R03 — Innsending

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Veiled filming etter oppgaven og la spilleren kontrollere video og kontekst før innsending.
- **Ferdig når:** Opplasting kan gjenopptas og feil vinkel eller manglende kontekst kan avklares.
- **Spørsmål til Anders:** Hvilke kameravinkler og opplysninger trenger du ved de vanligste vurderingene?

### R04 — Kø og responstid

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis køplassens status, ansvarlig coach og forventet svar, med fraværs- og kapasitetsregler.
- **Ferdig når:** Forsinkelse gir tydelig beskjed og nytt tidspunkt uten falsk ferdigmelding.
- **Spørsmål til Anders:** Hvilken svartid kan du faktisk levere på en vanlig uke?

### R05 — Analyse

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi coach tilgang til video, tidligere oppgave og relevante målinger; AI blir et kontrollert utkast der det er tillatt.
- **Ferdig når:** Mottaksbekreftelse omtales ikke som bildeanalyse, og alle faglige råd vurderes av coach.
- **Spørsmål til Anders:** Hvilke deler av videovurderingen ønsker du et AI-utkast til?

### R06 — Feedback

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi tidskodet tilbakemelding med ett prioritert arbeidsmål og en kort øvingsoppgave.
- **Ferdig når:** Spilleren kan åpne riktig øyeblikk og forstå hva som skal øves på.
- **Spørsmål til Anders:** Vil du hovedsakelig gi tilbakemelding med video, lyd eller tekst?

### R07 — Planpåvirkning

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** La godkjent tilbakemelding oppdatere samme tekniske oppgave og plan som fysisk coaching bruker.
- **Ferdig når:** Endringen har eier, begrunnelse og nytt kontrollpunkt.
- **Spørsmål til Anders:** Når skal en remote-vurdering endre planen fremfor bare å gi en kommentar?

### R08 — Oppfølging

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Følg opp om spilleren forstod og gjennomførte oppgaven, og knytt ny innsending til samme tema.
- **Ferdig når:** Manglende svar gir relevant oppfølging uten gjentatt varselstøy.
- **Spørsmål til Anders:** Når og hvordan skal spilleren melde tilbake etter et råd?

### R09 — Booking og betaling

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk samme betalings- og tilgangsgrunnlag med synlige leveransekvoter og separat ekstra kjøp.
- **Ferdig når:** Mislykket opplasting bruker ikke opp kvoten, og dobbelt innsending belastes ikke dobbelt.
- **Spørsmål til Anders:** Hva skal telle som én leveranse eller innsending?

### R10 — Kvalitet og lønnsomhet

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis faktisk behandlingstid, svartid, kapasitetsbruk og dokumentert oppfølging per leveranse.
- **Ferdig når:** Rapporten skiller coacharbeid, modellforbruk og regnskapstall og viser manglende data.
- **Spørsmål til Anders:** Hva må remote coaching oppnå for å være verdt å videreutvikle?

## Team Norway

### TN01 — Organisasjon og tilhørighet

Eksisterende grunnlag: [K-N](#k-n) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi Team Norway en egen oversikt med medlemskap, ansvar og relevante handlinger.
- **Ferdig når:** Bare aktive og tillatte relasjoner gir innsyn; organisasjonen beholder sin egen arbeidsflate.
- **Spørsmål til Anders:** Hvilke brukerroller og ansvarsområder skal Team Norway ha?

### TN02 — Lag og undergrupper

Eksisterende grunnlag: [K-N](#k-n) — kodelest delgrunnlag.

- **Forbedret funksjon:** Avklar behov for Junior, Elite og andre undergrupper før eventuell utvidelse av dagens ene gruppe.
- **Ferdig når:** Tilgang og rapporter kan forklares per undergruppe uten automatisk innsyn i alle spillere.
- **Spørsmål til Anders:** Trenger dere separate lag, og hvem skal kunne se på tvers?

### TN03 — Spilleroversikt og utvikling

Eksisterende grunnlag: [K-N](#k-n) — kodelest delgrunnlag.

- **Forbedret funksjon:** Samle mål, plan, relevante resultater og oppfølgingsbehov for spillerne man har ansvar for.
- **Ferdig når:** Spillerkort og organisasjonsoversikt bruker samme tillatte datagrunnlag.
- **Spørsmål til Anders:** Hva skal en landslagstrener først kunne avgjøre fra oversikten?

### TN04 — Samling og felles plan

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Planlegg samling med felles mål og individuelle oppgaver i eksisterende spillerplan.
- **Ferdig når:** Publisering viser hvem som får hvilke endringer og beholder individuelle avvik.
- **Spørsmål til Anders:** Hvordan fordeler dere felles og individuelt arbeid på en samling?

### TN05 — Testføring for mange

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gjør testdagen effektiv med deltakerliste, protokoll, mangler og ansvarlig attestering.
- **Ferdig når:** Feilføring kan rettes med historikk, og spilleren får bare sitt eget resultat.
- **Spørsmål til Anders:** Hvordan fordeles registrering og godkjenning mellom trenerne?

### TN06 — Uttaksgrunnlag

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle dokumenterte kriterier, relevante resultater og trenerobservasjoner som beslutningsstøtte.
- **Ferdig når:** Manglende kilder synliggjøres; systemet fatter ikke uttaksbeslutningen.
- **Spørsmål til Anders:** Hvilke kriterier skal være synlige i et uttaksgrunnlag?

### TN07 — Poster og dokumenter

Eksisterende grunnlag: [K-N](#k-n) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble beskjeder og dokumenter til riktig gruppe, eier, versjon og eventuell lesekvittering.
- **Ferdig når:** En endret dokumentversjon skilles fra den mottakeren allerede har lest.
- **Spørsmål til Anders:** Hvilke dokumenter må ha lesebekreftelse?

### TN08 — Rapport og deling

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Lag avgrensede rapporter for spiller, trenerteam og organisasjon med synlig datadekning.
- **Ferdig når:** Hver mottaker ser bare sitt avtalte innhold og perioden fremgår.
- **Spørsmål til Anders:** Hvilke rapporter skal deles med hvem etter en samling?

## WANG

### W01 — Årsplan og skoleår

Eksisterende grunnlag: [K-W](#k-w) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble skoleårets perioder, trening, konkurranse og vurderinger uten å vise private elevdata offentlig.
- **Ferdig når:** Felles årsplan og innlogget elevplan stemmer med samme periodegrunnlag.
- **Spørsmål til Anders:** Hvordan skal skolebelastning påvirke treningsplanleggingen?

### W02 — Treneruke og økt

Eksisterende grunnlag: [K-W](#k-w) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi treneren oversikt over økter, elever, ansvar og forberedelse med vei til individuell oppfølging.
- **Ferdig når:** Uke, elevliste og individuell utviklingsplan tilhører samme WANG-gruppe.
- **Spørsmål til Anders:** Hva må treneren se før en vanlig WANG-økt starter?

### W03 — Individuell utviklingsplan

Eksisterende grunnlag: [K-W](#k-w) — kodelest delgrunnlag.

- **Forbedret funksjon:** Videreutvikle eksisterende IUP-samtale med forrige vurdering, elevens perspektiv og neste periodes fokus.
- **Ferdig når:** Avsluttet periode og neste fokus lagres samlet; samtidige endringer håndteres synlig.
- **Spørsmål til Anders:** Hvordan skal elev og trener bli enige om neste periodes mål?

### W04 — Elevens uke

Eksisterende grunnlag: [K-P](#k-p) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis skole- og gruppeinnhold sammen med elevens egne treningsoppgaver i PlayerHQ.
- **Ferdig når:** Publisert fellestrening vises én gang og lar eleven forstå personlig hensikt.
- **Spørsmål til Anders:** Hva skal eleven kunne tilpasse selv i en skoleuke?

### W05 — Oppmøte og avvik

Eksisterende grunnlag: [D-W](#d-w) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Knytt oppmøte og manglende gjennomføring til relevant økt med ansvarlig oppfølging.
- **Ferdig når:** Fravær, fritak og manglende registrering skilles og gir ikke uriktig treningsmengde.
- **Spørsmål til Anders:** Hvilke fraværstyper trenger dere, og hvem følger dem opp?

### W06 — Fysisk trening

Eksisterende grunnlag: [D-W](#d-w) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Bruk eksisterende fysisk grunnlag til individuelt tilpassede programoppgaver med dosering og evaluering.
- **Ferdig når:** Planlagt og faktisk trening kan sammenlignes uten å utlede medisinske konklusjoner.
- **Spørsmål til Anders:** Hva skal være felles styrkeinnhold, og hva tilpasses hver elev?

### W07 — Test og vurderingssamtale

Eksisterende grunnlag: [K-W](#k-w) — kodelest delgrunnlag.

- **Forbedret funksjon:** Koble tester og egenvurdering til IUP og neste periode med konkrete kontrollpunkter.
- **Ferdig når:** Vurderingen skiller testresultat, elevens refleksjon og trenerens vurdering.
- **Spørsmål til Anders:** Hvilke bevis vil du bruke i en god vurderingssamtale?

### W08 — Foresatte og rapporter

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi foresatte avtalt praktisk informasjon og relevante rapporter gjennom foreldrerollen.
- **Ferdig når:** Skoleopplysninger og private vurderinger deles bare med riktig mottaker.
- **Spørsmål til Anders:** Hva skal foresatte få vite løpende, og hva tas i samtale?

## Forelder

### F01 — Barn og relasjoner

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis godkjente barn og relasjonens rettigheter med tydelig aktivt barn på alle handlinger.
- **Ferdig når:** Bytte av barn bytter alle data og handlinger og tilbakekalling stopper innsyn.
- **Spørsmål til Anders:** Hvordan skal nye forelderrelasjoner inviteres og godkjennes?

### F02 — Barnets uke

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi forelder praktisk oversikt over trening, forberedelser og avtaler.
- **Ferdig når:** Opplysninger fra flere barn blandes ikke, og kalenderendring oppdateres.
- **Spørsmål til Anders:** Hva trenger forelder å kunne planlegge fra denne oversikten?

### F03 — Booking og betaling for barn

Eksisterende grunnlag: [K-B](#k-b) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis deltaker og betaler separat med felles bookingregler og betalingstilstand.
- **Ferdig når:** Riktig barn beholder avtalen mens korrekt betaler får kvittering og eventuell refusjon.
- **Spørsmål til Anders:** Hvordan skal to foresatte kunne fordele betaling og administrasjon?

### F04 — Samtykke og delt innsyn

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Vis formål, omfang og varighet for hvert valg og en tydelig vei til tilbakekalling.
- **Ferdig når:** Tilbakekalling slår gjennom i direkte lenker og nye handlinger.
- **Spørsmål til Anders:** Hvilke typer innsyn vil du kunne gi en ekstern trener?

### F05 — Ukesrapport og kontakt

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi en kort rapport med avtaler, fremdrift og praktiske oppfølgingspunkter.
- **Ferdig når:** Rapporten inneholder bare informasjon forelderen har rett til å se.
- **Spørsmål til Anders:** Hva skal forelder få vite uten å måtte kontakte coach?

## Klubb og juniorgrupper

### C01 — GFGK og juniorgrupper

Eksisterende grunnlag: [D-W](#d-w) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle gruppeuke, ansvarlig trener og individuell oppfølging rundt eksisterende gruppemodell.
- **Ferdig når:** Gruppebytte bevarer relevant historikk og kontrollerer ny tilgang.
- **Spørsmål til Anders:** Hvordan skal en juniors overgang mellom grupper foregå?

### C02 — Klubbdrift rundt trening

Eksisterende grunnlag: [D-W](#d-w) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Koble praktiske gruppeoppgaver til ansvarlig og frist uten å blande dem med spillerens faglige vurdering.
- **Ferdig når:** Oppgaven havner hos riktig person og kan markeres ferdig med historikk.
- **Spørsmål til Anders:** Hvilke praktiske oppgaver rundt gruppetreningen bør systemet håndtere?

## Runde og baneguide

### G01 — Runderegistrering

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** La spilleren velge total, hullvis eller slagvis føring og utvide detaljene senere på samme runde.
- **Ferdig når:** Brutto score bevares, og retting oppdaterer bare analyser som har tilstrekkelige data.
- **Spørsmål til Anders:** Hvor mye vil du at spilleren skal registrere under runden?

### G02 — Kart og banedata

Eksisterende grunnlag: [K-G](#k-g) — kodelest delgrunnlag.

- **Forbedret funksjon:** Viderefør sikte og soner med ansvar for banekvalitet og tydelig skille mellom banegrunnlag og egne notater.
- **Ferdig når:** Riktig bane, tee og hull kan identifiseres, og manglende kart har en manuell reserveflyt.
- **Spørsmål til Anders:** Hvem skal kunne rette feil i banedata?

### G03 — Live GPS

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Beskriv en egen utvidelse med avstander, nøyaktighet og manuelt valg når posisjon mangler.
- **Ferdig når:** Avslått eller upresis posisjon stopper ikke manuell rundeføring; GPS-status er ærlig.
- **Spørsmål til Anders:** Vil du prioritere avstander, slagregistrering eller strategihjelp under runden?

### G04 — Runde uten nett

Eksisterende grunnlag: [K-O](#k-o) — kodelest delgrunnlag.

- **Forbedret funksjon:** Definer hvilke runde- og banedata som skal være tilgjengelige lokalt før start.
- **Ferdig når:** Runden kan gjenåpnes og synkroniseres uten dobbel registrering; karttilgjengelighet er avklart.
- **Spørsmål til Anders:** Hva må spilleren kunne gjøre på en bane helt uten dekning?

### G05 — Vind og spilleforhold

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Skill manuell treningssimulering, værdata og måling fra fysisk enhet; merk beregningsusikkerhet.
- **Ferdig når:** Brukeren ser hvilken type kilde som brukes og får ikke en beregning presentert som målt vind.
- **Spørsmål til Anders:** Mener du et læringsverktøy, lokale værdata eller en tilkoblet vindmåler?

### G06 — DataGolf og GolfBox

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Koble importerte resultater og sammenligninger til kilde, dato og identitetskontroll.
- **Ferdig når:** Manglende turneringer og usikre spillerkoblinger vises før analysen brukes.
- **Spørsmål til Anders:** Hvilke eksterne sammenligninger vil du bruke aktivt i coaching?

### G07 — Turneringshistorikk og datakvalitet

Eksisterende grunnlag: [D-G](#d-g) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi hver spiller en kontrollerbar kobling til eksterne resultater med retting og kildeoversikt.
- **Ferdig når:** Feil identitet kan frakobles uten å slette spillerens egne registreringer.
- **Spørsmål til Anders:** Hvem skal kontrollere at eksterne resultater gjelder riktig spiller?

## Tale

### T01 — Kort diktering

Eksisterende grunnlag: [D-T](#d-t) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Bruk én sammenhengende taleinngang med kontekst og redigerbar tekst før strukturering.
- **Ferdig når:** Uklart navn, tall eller målsted blir avklart fremfor gjettet.
- **Spørsmål til Anders:** Hvilken handling skal være den første vi gjør helt med tale?

### T02 — Opptak av hel coachingtime

Eksisterende grunnlag: [K-V](#k-v) — kodelest delgrunnlag.

- **Forbedret funksjon:** Bruk eksisterende opptakskjede med tydelig start, pause, avslutning og etterbehandling.
- **Ferdig når:** Kort diktering og helt øktopptak har forskjellige, forståelige roller.
- **Spørsmål til Anders:** Vil du normalt ta opp hele timen eller utvalgte sekvenser?

### T03 — Fra tale til endring

Eksisterende grunnlag: [K-A](#k-a) — kodelest delgrunnlag.

- **Forbedret funksjon:** Vis strukturert før/etter-forslag for plan, oppgave eller melding før bekreftelse.
- **Ferdig når:** Det som blir lagret er likt det brukeren godkjente og kan spores tilbake.
- **Spørsmål til Anders:** Hvilke talehandlinger skal alltid kreve at du leser gjennom først?

## Felles og personlige funksjoner

### S01 — Varsler og påminnelser

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Samle innstillinger per hendelsestype og skill viktig handling fra ren informasjon.
- **Ferdig når:** Samme hendelse varsles ikke gjentatte ganger gjennom flere kanaler uten grunn.
- **Spørsmål til Anders:** Hva skal varsles straks, og hva kan vente til en samlet oversikt?

### S02 — Feil, lagring og gjenopptakelse

Eksisterende grunnlag: [K-O](#k-o) — kodelest delgrunnlag.

- **Forbedret funksjon:** Gi felles forståelige tilstander for lagret, lokalt utkast, venter og feilet.
- **Ferdig når:** Brukeren kan gjenoppta etter brudd uten å starte hele oppgaven på nytt.
- **Spørsmål til Anders:** Hvilke avbrudd opplever du oftest i faktisk bruk?

### S03 — Brukervennlighet og tilgjengelighet

Eksisterende grunnlag: [D-S](#d-s) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Knytt hver funksjon til samme oppgave på mobil, nettbrett og desktop med tastatur og stor tekst.
- **Ferdig når:** Valgt design prøves med riktige tilstander, 390 px mobil og relevant desktop uten funksjonstap.
- **Spørsmål til Anders:** Hvilke oppgaver må kunne gjøres med én hånd på telefonen?

### S04 — Drift og gjenoppretting

Eksisterende grunnlag: [D-S](#d-s) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi driftsansvarlig oversikt over feil, datakilder, siste sikkerhetskopi og dokumentert gjenoppretting.
- **Ferdig når:** Varsel og gjenoppretting prøves i isolert miljø og resultatet knyttes til faktisk versjon.
- **Spørsmål til Anders:** Hvem skal ha ansvar når en kritisk funksjon svikter?

### S05 — Eksport og sletting

Eksisterende grunnlag: [D-F](#d-f) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Gi brukeren en sporbar forespørsel med status for data, filer og relevante eksterne kopier.
- **Ferdig når:** Ferdigmelding gis først når alle deler er håndtert eller begrunnet som unntak.
- **Spørsmål til Anders:** Hvilke eksportformater vil faktisk være nyttige for spilleren?

### S06 — Personlig arbeidsflate og sideprosjekter

Eksisterende grunnlag: [D-A](#d-a) — dokumentert grunnlag; se begrensning i kilden.

- **Forbedret funksjon:** Bevar eksisterende personlige oppgaver med tydelig skille fra golfvirksomhetens og spillernes data.
- **Ferdig når:** Private oppgaver inngår ikke i rapporter eller agentkontekst for kunder og organisasjoner.
- **Spørsmål til Anders:** Skal familie- og private oppgaver ha plass her eller i en separat arbeidsflate?

## Krysskobling til funksjonsregisteret fra 11.09

Register-ID i denne tabellen viser til det eldre 35-familiekartet. Kort-ID i høyre kolonne viser til dette dokumentet. Krysskobling er dekning av produktområder, ikke bevis for alle enkeltruter.

| Register 11.09 | Familie | Kort i dette dokumentet |
|---|---|---|
| P01 | Oppstart og profil | M14, P62 |
| P02 | I dag | P01–P05 |
| P03 | Planlegging | P10–P19, A21 |
| P04 | Gjennomføring | P30–P37, A30–A37 |
| P05 | Mål | P10, P55 |
| P06 | Øvelser og program | P20–P25 |
| P07 | Testbatteri | P44, A46, TN05, W07 |
| P08 | Fysisk og helse | P54, W06 |
| P09 | Coachkontakt | P50, A24 |
| P10 | Kalender | P17, P53, A03 |
| P11 | Sosialt | P59 |
| G01 | Runderegistrering | G01, P42 |
| G02 | Gameplan | P57, G02 |
| G03 | Live baneguide | G03 |
| G04 | Baneguide uten nett | G04 |
| G05 | Vind og forhold | G05 |
| G06 | Bag | P58, TM08 |
| G07 | Analyse og SG | P40–P46 |
| G08 | TrackMan | TM01–TM15 |
| G09 | DataGolf/GolfBox | G06 |
| G10 | Turneringsdata og talent | G07, P56, A47, TN06 |
| G11 | Banedata og trenerbruk | G02, P17, P57, TM08 |
| O01 | AgencyOS | A01–A06, A10–A14, A20–A26 |
| O02 | Coachplan | P18, A21, TN04 |
| O03 | WANG/GFGK | W01–W08, C01–C02 |
| O04 | Team Norway | TN01–TN08 |
| O05 | Forelder og innsyn | F01–F05, P60 |
| O06 | Booking og betaling | B01–B14, P52 |
| O07 | Konto og tilgang | M14, P56, P62, A51, S05 |
| O08 | Caddie/AI Coach | P19, P46, A10, AG03–AG07 |
| O09 | AgenticOS og drift | AG01–AG12, A41–A42, T01–T03 |
| O10 | Marked og salg | M01–M14, A43–A44 |
| O11 | Økonomi og personlig arbeid | A42, A49, S06 |
| O12 | Familie og sideprosjekter | S06 |
| O13 | Felles kvalitet | S01–S05, AG07–AG09 |

## Kildeoversikt

K betyr konkret lest kode, med presisert observasjon. D betyr dokumentert grunnlag eller inventar, og angir eksplisitt når noe kodegrunnlag også er lest. Ingen kilde er en generell ferdigattest for kortene som peker hit.

### K-I

Lest kode: I dag sammenstiller Workbench- og V2-økter med synlighetsregler og sortering. Dette er grunnlag for videre sammenheng, ikke bevis på komplett innlogget reise.

- [src/lib/portal/idag-data.ts](../../src/lib/portal/idag-data.ts)

### K-P

Lest kode: planpublisering har før/etter-visning av fremtidige økters tittel, tid, varighet og treningsområde. Kodekartet viser egne plan-, gruppe- og synkfunksjoner; full funksjon er ikke prøvd her.

- [src/lib/workbench/publish-actions.ts](../../src/lib/workbench/publish-actions.ts)
- [src/lib/workbench/wb-actions.ts](../../src/lib/workbench/wb-actions.ts)
- [src/lib/workbench/gruppe-periode-actions.ts](../../src/lib/workbench/gruppe-periode-actions.ts)
- [src/lib/workbench/v2-sync.ts](../../src/lib/workbench/v2-sync.ts)

### K-L

Lest kode: coach kan sende Live-melding og brief og lagre øktvurdering. Funksjonene bruker eksisterende V2-økt; separat egenøktspor bevares.

- [src/lib/agencyos/live-okt-actions.ts](../../src/lib/agencyos/live-okt-actions.ts)

### K-TM

Lest kode: TrackMan-import støtter CSV, HTML og foto, med forhåndsvalgte slag, teknisk oppgavematching og oppdatering av mål. Beregnings- og visningsfiler er identifisert. Ingen ekte filer eller AI-kall er kjørt.

- [src/app/portal/mal/trackman/actions.ts](../../src/app/portal/mal/trackman/actions.ts)
- [src/lib/trackman/parse-photo.ts](../../src/lib/trackman/parse-photo.ts)
- [src/lib/trackman/canonical.ts](../../src/lib/trackman/canonical.ts)
- [src/lib/teknisk-plan/match-shot.ts](../../src/lib/teknisk-plan/match-shot.ts)

### K-B

Lest kode: offentlig booking har egen åpningsterskel og Acuity-reservevei; felles policy beregner avbestilling, refusjon og ombooking. Kodeinventar viser reservasjon, kapasitet og credits. Faktiske miljøflagg og betaling er ikke prøvd.

- [src/lib/booking/offentlig-booking.ts](../../src/lib/booking/offentlig-booking.ts)
- [src/lib/booking/policy.ts](../../src/lib/booking/policy.ts)
- [src/lib/booking/slot-hold.ts](../../src/lib/booking/slot-hold.ts)
- [src/lib/booking/credit-booking.ts](../../src/lib/booking/credit-booking.ts)

### K-A

Lest kode: forslag lagres som PlanAction, godkjennes, utføres og får resultatspor. Opptaksanalyse kan opprette ventende sjekkpunkt. Dette er eksisterende delkjeder, ikke bevis på en komplett vedvarende AgenticOS-motor.

- [src/lib/agents/accept-plan-action.ts](../../src/lib/agents/accept-plan-action.ts)
- [src/lib/agents/plan-action-executor.ts](../../src/lib/agents/plan-action-executor.ts)
- [src/lib/recording/fangst-plan-action.ts](../../src/lib/recording/fangst-plan-action.ts)

### K-D

Lest kode: AgencyOS henter oversiktsdata fra blant annet booking og forslag. Den gjennomgåtte filen beregner MRR ved å multiplisere et antall abonnementer med 299.

- [src/lib/agencyos/daily-brief-data.tsx](../../src/lib/agencyos/daily-brief-data.tsx)

### K-V

Lest kode og ruteinventar: opptaks- og opplastingsinnganger finnes, og opptaksanalyse er koblet til forslag. Videoagenten som ble lest bekrefter bare mottak; full videofaglig analyse og remote-leveranse er ikke bekreftet.

- [src/lib/agents/swing-video-analyst.ts](../../src/lib/agents/swing-video-analyst.ts)
- [src/lib/recording/fangst-plan-action.ts](../../src/lib/recording/fangst-plan-action.ts)
- [src/app/api/recording/start/route.ts](../../src/app/api/recording/start/route.ts)
- [src/app/api/portal/swing-video/upload/route.ts](../../src/app/api/portal/swing-video/upload/route.ts)

### K-O

Lest kode: lydkøens metadata er avgrenset per eier, opptak og del, med kontrollert antall forsøk. Dette beviser ikke ferdig offline-støtte for runder, kart eller alle treningshandlinger.

- [src/lib/offline-queue/recording-chunk-kladd.ts](../../src/lib/offline-queue/recording-chunk-kladd.ts)
- [src/lib/offline-queue/recording-chunk-queue.ts](../../src/lib/offline-queue/recording-chunk-queue.ts)

### K-G

Lest kode: Gameplan lagrer og henter spillerens sikte og soner per hull. Sanntids-GPS og komplett baneguide er ikke bekreftet i denne gjennomgangen.

- [src/lib/gameplan/actions.ts](../../src/lib/gameplan/actions.ts)

### K-N

Lest kode: Team Norway har medlemsstyrt tilgang i én kanonisk gruppe. Underliggende lag er ikke representert i denne tilgangsmodellen. Ruter for oversikt, spiller, dokumenter og tilgang er identifisert.

- [src/lib/domain/tn-tilgang.ts](../../src/lib/domain/tn-tilgang.ts)
- [src/app/team-norway/page.tsx](../../src/app/team-norway/page.tsx)

### K-W

Lest kode: WANG-reisen knytter treneruke og elevens IUP til samme Toppidrett-gruppe. IUP lagrer evaluering av forrige periode og fokus for neste samlet, med revisjonslogg.

- [src/app/team-wang/_data/wang-reise.ts](../../src/app/team-wang/_data/wang-reise.ts)
- [src/app/team-wang/coach/iup/[elevId]/actions.ts](../../src/app/team-wang/coach/iup/[elevId]/actions.ts)

### D-M

Dokumentert grunnlag: produktkartet beskriver eksisterende markeds- og oppstartsflater. Innhold, reell tjenestekatalog og konvertering er ikke verifisert side for side i denne gjennomgangen.

- [docs/planer/komplett-produkt-og-grillkart-2026-09-13.md](../../docs/planer/komplett-produkt-og-grillkart-2026-09-13.md)
- [docs/platform/BUSINESS-RULES.md](../../docs/platform/BUSINESS-RULES.md)

### D-B

Dokumentert grunnlag og kodeinventar: bookingkartet og booking-/agentfilene beskriver tjenester, varsler og måling. Den konkrete funksjonskjeden er ikke nytestet.

- [docs/planer/komplett-produkt-og-grillkart-2026-09-13.md](../../docs/planer/komplett-produkt-og-grillkart-2026-09-13.md)
- [src/lib/booking/metrics.ts](../../src/lib/booking/metrics.ts)
- [src/lib/agents/booking-reminders.ts](../../src/lib/agents/booking-reminders.ts)

### D-P

Dokumentert grunnlag: funksjonsregister og nyere nåstatus beskriver plan, øvelser, tester, mål, kontakt og øvrige spillerflater. Ikke hver underfunksjon er kodegjennomgått eller prøvd her.

- [docs/planer/funksjonsregister-2026-09-11.md](../../docs/planer/funksjonsregister-2026-09-11.md)
- [docs/STATUS-NÅ.md](../../docs/STATUS-NÅ.md)

### D-L

Dokumentert grunnlag: nyere kontroll beskriver egne øktspor, registrering og lagring. Det brukes som underlag og ikke som en ny gjennomført test.

- [docs/design-audit/plan-live-p02-p05-2026-09-12.md](../../docs/design-audit/plan-live-p02-p05-2026-09-12.md)
- [docs/STATUS-NÅ.md](../../docs/STATUS-NÅ.md)

### D-G

Dokumentert grunnlag: registeret dekker runder, SG, DataGolf, talent og baneguide. Vindberegningen er også lest og er en forenklet modell, ikke en måler eller faglig validert værintegrasjon.

- [docs/planer/funksjonsregister-2026-09-11.md](../../docs/planer/funksjonsregister-2026-09-11.md)
- [docs/design-audit/runde-sg-trackman-g01-g10-2026-09-12.md](../../docs/design-audit/runde-sg-trackman-g01-g10-2026-09-12.md)
- [src/lib/sg-hub/conditions-adjust.ts](../../src/lib/sg-hub/conditions-adjust.ts)

### D-A

Dokumentert grunnlag og kodeinventar: AgencyOS-/AgenticOS-kartet beskriver drift, agentfiler og forslag til videre arbeid. Filer og agentnavn beviser ikke aktiv, komplett arbeidsflyt.

- [docs/planer/komplett-produkt-og-grillkart-2026-09-13.md](../../docs/planer/komplett-produkt-og-grillkart-2026-09-13.md)
- [docs/planer/agencyos-autopilot-og-remote-coaching-plan-2026-09-12.md](../../docs/planer/agencyos-autopilot-og-remote-coaching-plan-2026-09-12.md)

### D-F

Lest foreldergrunnlag og dokumentert status: godkjent forelderrelasjon styrer valg av barn. Nåstatus og registeret beskriver øvrig tilgang, samtykke, eksport og sletting; komplette kjeder er ikke nyprøvd.

- [src/lib/forelder.ts](../../src/lib/forelder.ts)
- [docs/design-audit/forelder-o05-delt-innsyn-2026-09-12.md](../../docs/design-audit/forelder-o05-delt-innsyn-2026-09-12.md)
- [docs/STATUS-NÅ.md](../../docs/STATUS-NÅ.md)

### D-W

Dokumentert grunnlag: eksisterende register dekker WANG/GFGK-grupper, tester og fysisk trening. Styrkeprogrammet er et eget utkast; innhold og driftsbruk er ikke verifisert her.

- [docs/planer/funksjonsregister-2026-09-11.md](../../docs/planer/funksjonsregister-2026-09-11.md)
- [docs/plan-styrkeprogram-fys.md](../../docs/plan-styrkeprogram-fys.md)

### D-T

Dokumentert grunnlag: produktkartet skiller kort diktering fra komplett coachingopptak. Generell taleinngang er ikke kodeverifisert i denne gjennomgangen.

- [docs/planer/komplett-produkt-og-grillkart-2026-09-13.md](../../docs/planer/komplett-produkt-og-grillkart-2026-09-13.md)

### D-S

Dokumentert grunnlag: prosjektets designoppskrift, nåstatus og eksisterende kontroller. Tidligere testresultater omtales som historikk; ingen ny visuell godkjenning eller driftsprøve er gjennomført.

- [.claude/skills/ak-hq-design/SKILL.md](../../.claude/skills/ak-hq-design/SKILL.md)
- [docs/STATUS-NÅ.md](../../docs/STATUS-NÅ.md)

## Kontroll av denne leveransen

- Maskinell dekningskontroll: alle 153 opprinnelige funksjons-ID-er forekommer nøyaktig én gang som kort. Supplerende kort har unike ID-er. Hvert kort har kilde, forbedring, ferdigkrav og spørsmål.
- Alle 35 familier i registeret fra 11.09 er krysskoblet. Dette erstatter ikke ruteinventaret eller en full skjermrevisjon.
- Bestått: `npm run prosjekt:sjekk`, `git diff --check` og egen kontroll av 55 lokale filhenvisninger, kildeankre og alle kortfelter. Den vanlige dokumentkontrollen utelater daterte underlag; dette dokumentets lenker er derfor kontrollert separat.
- Appkode, database, betalingsoppsett og valgt design er ikke endret. Ingen nye tester av appens funksjon eller produksjon er kjørt i dette arbeidet.
- Neste steg er produktintervjuet. Etter svarene kan avklarte forslag omsettes til konkrete, prioriterte oppgaver i gjeldende masterplan og Notion.
