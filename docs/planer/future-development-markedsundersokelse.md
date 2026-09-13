# Future Development — marked, muligheter og AI-retning

## Sammendrag

AK Golf HQ bør ikke forsøke å vinne ved å kopiere flest mulig funksjoner fra etablerte golfapper. Markedet er allerede fullt av sterke enkeltsystemer: Arccos og Shot Scope samler slag på banen, TrackMan og Sportsbox måler slag og bevegelse, Clippd og Upgame analyserer prestasjon, mens Skillest og CoachNow håndterer video, kommunikasjon og coachvirksomhet. Det tydeligste udekkede rommet er å samle hele forbedringssløyfen i én coachstyrt tjeneste:

> **Måle → forstå → velge prioritet → trene → gjennomføre → evaluere → justere planen.**

Dette passer AK Golf HQ bedre enn en generell «AI-golfcoach». Plattformen har allerede strukturen markedet ofte mangler: samme spiller kan følges gjennom PlayerHQ, AgencyOS, booking, plan, Live, analyse, WANG, Team Norway og foreldreinnsyn. Den strategiske muligheten er å gjøre sammenhengen mellom disse delene målbar, forklarbar og enkel.

De fem viktigste framtidige satsingene er:

1. **Coachminne etter hver økt:** opptak eller notater blir til kontrollert sammendrag, én prioritet, øvelser og oppfølging. Coach godkjenner før spilleren får planen.
2. **Én evidenslinje per spiller:** runder, Strokes Gained, TrackMan, tester, video, gjennomførte økter og spillerens egen vurdering vises med kilde, tidspunkt og datakvalitet.
3. **Ukentlig prioriteringsmotor:** systemet foreslår hva som sannsynligvis gir mest verdi nå, forklarer hvorfor og lar coach redigere eller avvise.
4. **Enkel video først, avansert 3D gjennom partner:** automatisk opptak, trimming, sammenligning og coachkommentar gir høy verdi. Egen biomekanisk 3D-motor bør ikke bygges før behov, datagrunnlag og validering er bevist.
5. **Konkurransetrygg banemodus:** appen skiller tydelig mellom trening, forberedelse og konkurranse, og slår av råd som ikke er tillatt under en tellende runde.

AI bør være en assistent for Anders og øvrige coacher, ikke en usynlig beslutningstaker. Den skal redusere administrasjon, finne mønstre i tillatte data, vise usikkerhet og foreslå neste handling. Den skal ikke diagnostisere skade, rangere barn for uttak eller endre spillerens plan uten menneskelig kontroll.

## Mandat og avgrensning

Undersøkelsen svarer på tre spørsmål:

- Hvilke funksjoner har ledende golf- og coachingplattformer i 2026?
- Hvilke av disse løser et reelt problem som AK Golf HQ ikke allerede løser godt nok?
- Hvilken AI-retning kan gi varig verdi de neste utviklingshorisontene?

Analysen bygger på offentlige produkt- og hjelpesider, bransjekilder, gjeldende golfregler, EU-kilder og nyere forskning. Produktene er ikke testet med betalt konto. «Har funksjonen» betyr derfor at funksjonen er dokumentert offentlig, ikke at kvaliteten er bekreftet gjennom egen bruk. Priser og produkttilbud er et øyeblikksbilde og bør kontrolleres på nytt før innkjøp eller integrasjon.

AK Golf HQs eksisterende funksjonsregister er brukt som grunnlinje. Forslag som allerede finnes der, er merket som videreutvikling og ikke presentert som nye ideer.

## Markedet i 2026

Golfapper er blitt normalverktøy, ikke nisjeprodukter. National Golf Foundation oppgir at mer enn 75 prosent av amerikanske «Core golfers», spillere med minst åtte runder i året, har minst én golfapp. Fra 2020 har bruken økt særlig for statistikk/scoreføring, GPS-avstander og baneguider.[^1] Det betyr at markedet ikke først må overbevises om å bruke teknologi. Kampen står om tre ting: lav registreringskostnad, troverdige svar og om data faktisk fører til bedre handling.

Markedet konsolideres også. Golf Genius har samlet turneringsdrift med CoachNow, Operation 36 og Golfshot, mens TrackMan har samlet simulator-, slag- og prestasjonsanalyse gjennom blant annet Upgame.[^2][^3] Dette peker mot større økosystemer og færre isolerte verktøy.

Samtidig er datakvalitet fortsatt et grunnproblem. Arccos opplyser selv at chips, putter og enkelte slag kan mangle.[^4] Clippds Garmin-integrasjon krever at spilleren gjennomgår utkast, korrigerer manglende slag og håndterer at ulike banedatabaser ikke alltid matcher.[^5] Brukererfaringer peker i samme retning: automatikk er verdifullt, men etterarbeid, feil klubb og manglende slag reduserer tilliten.[^6] Den viktigste konkurransefordelen er derfor ikke bare mer data, men en ærlig og effektiv måte å kontrollere datagrunnlaget på.

## Konkurrentlandskap

### 1. Coachvirksomhet, kommunikasjon og video

| Produkt | Styrke | Dokumenterte funksjoner | Betydning for AK Golf HQ |
|---|---|---|---|
| **Skillest** | Hel coachvirksomhet | Videoanalyse, fjern- og fysiske timer, meldinger, kalender, betaling, kurs, CRM, AI-sammendrag og Arccos-integrasjon.[^7] | Viser verdien av at timen, betalingen, videoen, øvelsen og oppfølgingen tilhører samme spillerhistorikk. |
| **CoachNow** | Relasjon og skalering | Private spillerrom, grupper, lister, video/voice-over, 240 fps, skjelettsporing, planlagt innhold, booking, betaling og engasjementsmåling.[^8][^9] | Viser at coachens innboks må være handlingsrettet, og at kommunikasjon må være knyttet til spilleren og planen. |
| **Onform** | Avansert opptak | Automatisk swingfangst, opptil fire kameraer, sammenligning, 3D, kinematisk sekvens, meldinger og launch-monitor-integrasjoner.[^10] | Sterkt argument for enkel automatisk videoflyt og partnerintegrasjon for avansert biomekanikk. |
| **V1 Golf** | Etablert videoverktøy | Opptak, bilde-for-bilde, tegning, skjelett- og ballsporing, modellslag, øvelsesbibliotek og tilgang til coach.[^11] | Referanse for grunnleggende videoverktøy. Mindre tydelig som komplett utviklingssystem. |
| **Sportsbox 3D Golf** | Mobil 3D og biomekanikk | Markerfri 3D, mål, automatisk swingfangst, 2D/3D-sammenligning, umiddelbar tilbakemelding og AI-eksperten SAMI.[^12] | Viser hvor markedet beveger seg, men også hvorfor AK bør integrere før det eventuelt bygger egen 3D-motor. |

Felles læring: Spilleren forventer at videoen ikke forsvinner i kamerarullen, og at coachens tilbakemelding blir stående som del av treningsplanen. Skillest beskriver dette presist: den fysiske timen blir et varig materiale med video, sammendrag og øvelser.[^13] Dette er mer verdifullt enn en løs videofane.

### 2. Prestasjonsanalyse og treningsprioritering

| Produkt | Styrke | Dokumenterte funksjoner | Betydning for AK Golf HQ |
|---|---|---|---|
| **Clippd** | Samlet prestasjonsmodell | Kobler runder, simulator, trening og timer; rangerer hva spilleren bør arbeide med etter betydning, forbedringsmulighet og trend; foreslår øvelser og plan.[^14][^15] | Nærmeste referanse for en datadrevet prioriteringsmotor. AKs fordel kan være tydelig coachgodkjenning og kobling til faktisk ukeplan. |
| **Upgame by TrackMan** | Eliteanalyse | Kartbasert slagføring, spredning, Strokes Gained, innspill/putt og kobling mellom banerunder og TrackMan-simulator.[^3] | Relevant for Team Norway, WANG og elitespillere. AK bør unngå å bygge en parallell analysemodell hvis integrasjon kan dekke rådata. |
| **Arccos** | Automatisk banedata | Automatisk slagsporing, Strokes Gained, klubbavstander, trend, AI-strategi og personlige målområder.[^16] | Dokumenterer verdien av minst mulig registrering og av å forklare styrke/svakhet mot valgt referanse. |
| **Shot Scope** | Maskinvare uten løpende analyseabonnement | Klubbtagger/klokker, mer enn 100 statistikker, banekart, Course Analysis og MyStrategy basert på egen spredning.[^17] | Referanse for «Min bag», spredning og plan før runden. |
| **Garmin Golf** | Wearable-økosystem | Slagkart, klubb- og banestatistikk, Strokes Gained, greenkonturer og synk med klokker/launch monitor.[^18] | Viser potensialet i passive data og at golfutvikling kobles til generell trening og helse. |

Felles læring: De beste systemene går fra deskriptiv analyse, «slik spilte du», til prioritering, «dette bør du arbeide med». Clippd er tydeligst: algoritmen kombinerer betydning for score, mulighet til å hente tilbake tidligere nivå og trend.[^15] Men en slik score er bare nyttig når spilleren kan se datagrunnlag, periode og hvorfor anbefalingen kom.

### 3. Bane, GPS, caddie og lavfriksjonsfangst

| Produkt | Styrke | Dokumenterte funksjoner | Betydning for AK Golf HQ |
|---|---|---|---|
| **Golfshot** | Telefon/klokke på banen | GPS på mer enn 45 000 baner, automatisk slagsporing, Strokes Gained, greenkart, AR-visning og Swing ID fra klokke.[^19] | Viser at klokke kan redusere telefonbruk og samtidig gi en ny sensorstrøm. |
| **18Birdies** | Bred forbrukerapp | GPS, scoring, slagsporing, sosialt spill, lagspill, turneringer, Strokes Gained, 3D-green og AI-swinganalyse.[^20] | Viser styrken og faren ved «alt-i-ett»: høy funksjonsbredde, men ikke nødvendigvis dyp coachsammenheng. |
| **Arccos / Shot Scope** | Automatisk fangst | Passive tagger eller klokker, personlige lengder og spredning, strategi og analyse.[^16][^17] | AK bør prioritere import og god korrigeringsflyt framfor egen maskinvare. |

Felles læring: «Minst mulig trykk» er like viktig på banen som i booking. Den beste AK-løsningen er ikke nødvendigvis full automatikk fra dag én, men en flyt hvor spilleren kan registrere eller rette et slag raskt, uten å miste runden og uten at systemet later som usikre data er sikre.

### 4. Junior, akademi og progresjon

Operation 36 kombinerer en tydelig seksnivå-reise, korte læringsmoduler, poeng/merker, coachgodkjenning og progresjon fra korte hull til fullt utslagssted.[^21] Produktets verdi ligger mindre i selve gamifiseringen enn i at spiller, forelder og coach forstår neste milepæl.

AK Golf HQ har allerede programmer, testbatteri, WANG, GFGK, mål og foreldreinnsyn. Muligheten er derfor ikke å kopiere nivåstigen, men å gi hvert program en lett forståelig progresjonsfortelling:

- hva spilleren lærer nå;
- hva som er dokumentert;
- hva coachen har godkjent;
- hva neste praktiske milepæl er;
- hva forelder kan se uten å få tilgang til unødvendige opplysninger.

## Funksjonsmønstre som har høy verdi

### 1. Timen blir til varig trening

Markedssignal: Skillest og CoachNow knytter video, kommentar, øvelse og videre dialog til spilleren.[^7][^8]

AK-anbefaling:

- Ett trykk starter et privat timenotat eller opptak.
- AI lager et utkast med tema, observasjon, én prioritert endring, øvelser og kontrollpunkt.
- Coach redigerer og godkjenner.
- Godkjente punkter går til spillerens plan og «I dag».
- Neste video eller måling kobles tilbake til samme prioritet.

Dette bør bygges av AK fordi det uttrykker egen coachingmetodikk og binder sammen eksisterende flater.

### 2. Én spillerlinje på tvers av datakilder

Markedssignal: Clippd samler runder, trening, simulator og timer, mens Upgame kobler bane og TrackMan.[^14][^3]

AK-anbefaling:

En tidslinje viser hendelser og evidens, ikke bare innhold:

| Hendelse | Det spilleren ser | Det coachen ser |
|---|---|---|
| Runde | brutto score, Strokes Gained, høydepunkter | datakvalitet, avvik og treningsrelevans |
| TrackMan | valgte nøkkeltall med enhet | råkilde, utvalg, variasjon og trend |
| Test | resultat mot egen startverdi | protokoll, variant, gyldighet og attestering |
| Video | valgt klipp og coachpunkt | original, vinkel, sammenligning og notat |
| Økt | plan, gjennomført arbeid og egen vurdering | samsvar med prioritet, spørsmål og neste oppfølging |

Dette er en videreutvikling av eksisterende analyse, plan og spillerkort, ikke en ny parallell datamodell.

### 3. Fra innsikt til én anbefalt handling

Markedssignal: Arccos løfter fram toppstyrker og svakheter, mens Clippd prioriterer etter betydning, mulighet og trend.[^16][^15]

AK-anbefaling:

AI lager ikke en hel plan på egen hånd. Den foreslår én endring av gangen:

- «Prioriter innspill 100–140 meter denne uken.»
- «Bevis: 18 tellende slag, −1,4 SG mot valgt referanse, svakere tre runder på rad.»
- «Usikkerhet: lavt datagrunnlag fra vått underlag.»
- «Forslag: to økter fra øvelsesbanken.»
- «Coach: godkjenn, rediger, utsett eller avvis.»

AK har allerede modellen for forslag og coachbeslutning. Framtidig utvikling bør gjøre evidensen og beslutningshistorikken synlig og forståelig.

### 4. Video som kontrollpunkt, ikke underholdning

Markedssignal: Onform, V1, CoachNow, Sportsbox, GolfFix og 18Birdies tilbyr ulike grader av automatisk fangst, skjelett, sammenligning og øvelsesforslag.[^10][^11][^12][^22][^23]

AK-anbefaling i riktig rekkefølge:

1. automatisk start/stopp og trimming;
2. Face On / Down The Line-veiledning;
3. før/etter-sammenligning og coachkommentar;
4. kobling til arbeidsoppgave og øvelse;
5. partnerimport av verifiserte 3D-målinger;
6. først senere eventuell egen måling av avgrensede variabler.

Et «swing score» uten forklarbar sammenheng til ballflukt, spillerens intensjon og coachens metode bør unngås.

### 5. Smart oppfølging uten mas

Markedssignal: CoachNow bruker aktivitetsoversikt, lesestatus, smarte lister og automatiske oppfølgingsløp.[^8]

AK-anbefaling:

- Coachens kø viser bare spillere som sannsynligvis trenger handling.
- Signaler kan være uteblitt økt, ubesvart spørsmål, usynkronisert resultat, fall i målt utvikling eller manglende oppfølging etter time.
- Hvert signal viser hvorfor spilleren er i køen og kan lukkes eller utsettes.
- AI foreslår svar, men sender aldri til spilleren uten gjeldende godkjenning.

Dette bør bygges inn i AgencyOS, ikke som et separat meldingssystem.

### 6. Konkurransetrygg modus

Golfreglene tillater normalt avstandsinformasjon, men forbyr blant annet at en enhet tolker avstand eller retning til anbefalt spillelinje eller køllevalg under runden. Turneringskomiteen kan dessuten forby elektronisk avstandsmåling gjennom lokal regel.[^24]

AK-anbefaling:

- Spilleren velger **trening**, **sosial runde** eller **konkurranse** før start.
- Konkurransemodus kan begrense appen til tillatt informasjon og føre en synlig regelprofil.
- Plan og råd kan studeres før runden, men ulovlige funksjoner låses under runden.
- Lokal regel og arrangørens bestemmelser må alltid kunne overstyre standarden.

Dette er ikke bare etterlevelse. Det bygger tillit hos Team Norway, WANG og turneringsspillere.

## Forholdet til dagens funksjonsregister

Markedsundersøkelsen erstatter ikke det eksisterende funksjonsregisteret. Den gir retning til områder som allerede finnes eller er planlagt:

| Dagens område | Det som allerede er bevart | Framtidig tillegg fra undersøkelsen |
|---|---|---|
| P02–P06 · I dag, Plan, Live, mål og øvelser | Daglig spillerreise, planlagte og gjennomførte økter, mål og øvelsesbank | Én coachgodkjent prioritet som forklarer hvorfor den ligger i denne uken |
| P07–P08 · tester, fysikk og belastning | Testresultater, protokoller, fysisk trening og helsedeling | Datakvalitet, egen startverdi og avgrenset wearable-støtte uten medisinsk diagnose |
| P09 · coachkontakt | Meldinger og oppfølging | Samtalen knyttes til time, prioritet, øvelse eller resultat og kan bli en konkret planhandling |
| G01–G11 · runde, Gameplan og analyse | Brutto score, slag, Strokes Gained, TrackMan, bag, banedata og planlagt GPS/offline | Konkurransetrygg modus, korrigeringskø og senere scenario-simulator |
| O01–O02 · AgencyOS og Workbench | Spillerstall, arbeidskø og planlegging | Coachminne, forklarbare oppfølgingssignaler og AI-utkast med godkjenning |
| O03–O05 · WANG, Team Norway og forelder | Organisasjon, tester, planer, rapporter og delt innsyn | Programtilpasset progresjonsfortelling og strengere vern mot automatisk rangering |
| O06 · booking og betaling | Kundereise, credits og abonnement | Timen kobles videre til spillerhistorikk og neste planlagte handling |
| O08 · Caddie/AI Coach | Forslag, forklaringer og coachstøtte | Evidenslinje, usikkerhet, én prioritet og tydelig beslutningshistorikk |

Konsekvensen er at Future Development i hovedsak bør forbedre koblingene mellom funksjonsfamiliene. Nye toppnivåmenyer eller parallelle analysemodeller bør bare opprettes når en hel brukerreise ikke kan løses i dagens struktur.

## Framtiden for AI i golf

### Horisont 1 — assisterende intelligens

Dette er modent nok til å planlegges etter at kjerneproduktet er stabilt:

- transkribere og strukturere coachøkter;
- oppsummere spillerens uke;
- finne avvik, manglende data og mulige oppfølgingsbehov;
- foreslå én prioritet med kilde og usikkerhet;
- hente relevant øvelse fra godkjent AK-bibliotek;
- lage utkast til coachmelding;
- svare på spørsmål om spillerens egne data innenfor tillatt tilgang.

Verdien kommer fra språkmodellen som grensesnitt til AKs strukturerte data og metode, ikke fra at modellen får fri tilgang til alle notater.

### Horisont 2 — multimodal spillerforståelse

Neste trinn er å kombinere flere datatyper:

- ball- og kølledata fra TrackMan eller annen launch monitor;
- slag og posisjon fra runder;
- video eller 3D-bevegelse;
- treningsgjennomføring og testresultater;
- spillerens opplevde kvalitet, intensjon og trygghet;
- eventuelt belastning og restitusjon fra godkjente wearables.

Ny forskning viser at én klokkesensor kan rekonstruere flere helkroppsvinkler i golfsving med lovende resultater, men feilen varierer med spillerferdighet, kølle og svinglengde.[^25] Dette er et signal om hvor markedet går, ikke et bevis på at slike data er klare for trenings- eller helsebeslutninger i AK Golf HQ.

Den praktiske muligheten er en «spillerrepresentasjon» som lærer spillerens normale mønstre. Den sammenligner primært spilleren med seg selv og valgt mål, ikke med én universell idealsving.

### Horisont 3 — adaptiv trening i sanntid

Når datakvalitet og faglig validering er god nok, kan en treningsøkt tilpasse seg mens den pågår:

- endre oppgaven når målet er stabilt oppnådd;
- foreslå mer variasjon når resultatet bare virker i blokk;
- oppdage at ballflukt og bevegelse ikke forteller samme historie;
- bruke lyd eller klokkehaptikk slik at spilleren ikke må se på skjermen;
- stoppe AI-tilbakemelding når den skaper for mye intern oppmerksomhet eller datagrunnlaget er svakt.

Dette er krevende motorisk læring, ikke bare programvarelogikk. Funksjonen må utvikles med faglige forsøk og sammenligning mot vanlig coaching.

### Horisont 4 — digital gameplan og scenario-simulator

Med pålitelige køllelengder, spredning, banedata, vær og slagmønstre kan AK lage en personlig strategisimulator:

- forventet resultat ved driver mot ulike siktepunkter;
- plan A og plan B per hull;
- risiko ved spillerens faktiske miss, ikke standardspredning;
- hva som bør trenes før en bestemt konkurranse;
- etter runden: om spilleren fulgte planen og om planen var god.

Shot Scope og Arccos tilbyr allerede deler av dette gjennom spredning og AI-strategi.[^17][^16] AKs mulige forskjell er koblingen tilbake til coachens plan, turneringskalender og neste treningsuke.

### Horisont 5 — nettverkseffekt uten å ofre personvern

På sikt kan anonymiserte og tilstrekkelig store datasett gi bedre referanser:

- utviklingskurver per alder, nivå og treningsbakgrunn;
- hvilke øvelser som typisk endrer en bestemt prestasjonsvariabel;
- forventet tid før en endring overføres fra trening til bane;
- datakvalitetsgrenser for når et råd er rimelig;
- bedre talentutviklingsinnsikt uten automatisk uttaksbeslutning.

Dette krever en egen juridisk og etisk vurdering, tydelig formål, samtykke der det er relevant, reell anonymisering og beskyttelse mot at små grupper kan identifiseres.

## Hva AK Golf HQ bør bygge, integrere og vente med

### Bygg selv

Disse delene utgjør AKs varige produktfordel:

- spillerens sammenhengende evidenslinje;
- coachminne og overgang fra time til plan;
- coachgodkjente AI-forslag;
- ukentlig prioriteringsmotor bygget på AKs metode;
- samme mål og status gjennom I dag, Plan, Live og Analyse;
- AgencyOS-kø basert på reelle oppfølgingsbehov;
- progresjonsfortelling for WANG, GFGK, Team Norway og Academy;
- datakvalitet, kilde, usikkerhet og beslutningshistorikk;
- konkurransetrygg modus;
- spiller- og foreldrekommunikasjon innenfor riktige tilgangsgrenser.

### Integrer

Disse områdene er dyre å bygge, krever eksterne rettigheter eller er allerede løst av spesialister:

- TrackMan og andre launch-monitor-kilder;
- Sportsbox/Onform eller tilsvarende 3D- og videomåling;
- wearable-data fra Garmin, Apple Health eller tilsvarende når formål og samtykke er avklart;
- banekart, greenkontur, vær og turneringsdata gjennom lisensierte kilder;
- betaling, kalender og meldingslevering gjennom etablerte leverandører;
- offisiell handicap- og resultatflyt der avtale er mulig.

Integrasjon betyr ikke ukritisk innlasting. Hver kilde trenger versjon, enhet, tidspunkt, eier, datakvalitet og mulighet for korrigering.

### Følg med før bygging

- helautomatisk AI-coach uten menneskelig kontroll;
- egen markerfri 3D-motor;
- sanntids biomekanisk «feilretting» fra én telefonvinkel;
- skaderisiko eller medisinske anbefalinger;
- automatisk talentrangering eller uttak;
- egen sensor, klokke eller launch monitor;
- sosial feed og åpne konkurranser uten bekreftet utviklingsnytte;
- generisk markedsplass for eksterne coacher.

## Prioritert mulighetskart

Skala: 5 er høyest. «Gjennomførbarhet» vurderer hvor realistisk funksjonen er med AKs eksisterende produktgrunnlag. «Risiko» er omvendt: 5 betyr høy risiko.

| Mulighet | Spillernytte | Coachnytte | Strategisk forskjell | Gjennomførbarhet | Risiko | Anbefaling |
|---|---:|---:|---:|---:|---:|---|
| Coachminne → godkjent plan | 5 | 5 | 5 | 4 | 2 | Første AI-pilot |
| Evidenslinje med datakvalitet | 5 | 5 | 5 | 4 | 2 | Grunnmur |
| Ukentlig prioriteringsforslag | 5 | 5 | 5 | 3 | 3 | Bygg etter grunnmuren |
| Smart oppfølgingskø | 4 | 5 | 4 | 4 | 2 | AgencyOS-pilot |
| Automatisk video og trimming | 4 | 4 | 3 | 3 | 2 | Enkel versjon først |
| Partnerintegrert 3D | 4 | 4 | 3 | 3 | 3 | Partnerprøve |
| Konkurransetrygg banemodus | 4 | 4 | 4 | 4 | 2 | Del av baneguide |
| Adaptiv økt i sanntid | 5 | 4 | 5 | 2 | 4 | Forskningspilot |
| Wearable-basert sving og belastning | 4 | 3 | 4 | 2 | 4 | Følg med / avgrenset prøve |
| Digital gameplan-simulator | 5 | 4 | 5 | 2 | 3 | Etter pålitelig bag/bane-data |
| Automatisk uttaksrangering | 2 | 2 | 1 | 3 | 5 | Ikke bygg |
| Generell AI-chat uten evidens | 2 | 2 | 1 | 5 | 4 | Ikke prioriter |

## Foreslått utviklingsrekkefølge

### Trinn A — datatillit

Før ny «smart» funksjon:

- gi alle målinger kilde, enhet, tidspunkt og status;
- skill rådata, korrigert data, beregnet verdi og AI-tolkning;
- vis datamengde og usikkerhet;
- la brukeren rette feil uten å slette historikken;
- sikre tilgang og samtykke per formål;
- opprett ett felles hendelsesgrunnlag for runde, økt, test, video og coachbeslutning.

Ferdigkriterium: To coacher skal kunne se samme spiller og forstå hvilke data et råd bygger på, uten muntlig forklaring.

### Trinn B — første AI-pilot: coachminne

Velg én avgrenset reise, for eksempel en vanlig teknisk time:

1. Coach starter notat/opptak.
2. Systemet lager utkast lokalt eller i godkjent behandlingsløp.
3. Utkastet viser observasjon, én prioritet, øvelser og kontrollpunkt.
4. Coach redigerer og godkjenner.
5. Spilleren får sammendrag og neste økt.
6. Neste møte viser hva som ble gjort og om kontrollpunktet endret seg.

Mål pilotens effekt på faktisk coach-tid, andel godkjente/endrede forslag, spillerens forståelse og gjennomføring. Ikke bruk «antall AI-svar» som suksessmål.

### Trinn C — ukentlig spillerprioritet

Koble runde, trening, tester og plan til ett coachforslag. Begynn regelbasert og transparent; bruk språkmodell til forklaring og redigering, ikke til å finne opp tall. Sammenlign forslaget med coachens egen prioritet før spilleren ser det.

### Trinn D — video og integrasjoner

Lever automatisk opptak/trimming og før/etter-sammenligning. Kjør deretter en partnerprøve for 3D. Integrasjonen må bevise at målingen er repeterbar nok for den konkrete variabelen og at coachen faktisk endrer en beslutning på grunn av den.

### Trinn E — adaptiv trening og gameplan

Når AK har nok kvalitetssikrede forløpsdata, kan systemet undersøke hvilke oppgaver som gir overføring til banen. Først da er adaptiv trening og digital gameplan et forsvarlig satsingsområde.

## AI- og dataprinsipper

1. **Mennesket eier avgjørelsen.** Coach godkjenner planendring, teknisk prioritet og uttaksgrunnlag.
2. **Evidens før språk.** Tall og hendelser beregnes i kontrollerbar kode; AI forklarer og foreslår.
3. **Usikkerhet er synlig.** Lite eller motstridende datagrunnlag skal redusere sikkerheten, ikke øke ordmengden.
4. **Spilleren sammenlignes først med seg selv.** Referansegrupper er støtte, ikke en universell fasit.
5. **Én anbefaling av gangen.** Flere samtidige tekniske råd skaper støy og vanskeliggjør læring.
6. **Ingen skjult læring på persondata.** Data brukes bare til avklart formål og innenfor avtalt behandlingsgrunnlag.
7. **Barn krever særskilt vern.** Progresjon skal støtte utvikling, ikke skape en ugjennomsiktig permanent rangering.
8. **Helse er et eget område.** Belastnings- og velværedata må ikke bli medisinsk diagnose.
9. **AI kan alltid overstyres og spores.** Forslag, redigering, beslutning og ansvarlig person loggføres.
10. **Konkurransemodus følger reglene.** Råd og funksjoner skilles fra tillatt avstandsinformasjon.

EU-kommisjonen opplyser at AI Act i hovedsak ble gjeldende 2. august 2026, med senere frister for enkelte høyrisikoområder.[^26] GDPR-prinsippene gjelder uansett når AI behandler personopplysninger: formål, dataminimering, korrekthet, innsyn og vern mot rent automatiserte avgjørelser med vesentlig effekt.[^27] Det må gjøres en konkret juridisk vurdering før funksjoner for barn, biometriske data, helse eller talentuttak bygges.

## Teknisk realisme: hva forskningen faktisk sier

Markerfri bevegelsesanalyse er lovende, men må avgrenses til variabler og situasjoner som er validert. En systematisk gjennomgang fra 2025 fant at pålitelighet og gyldighet varierte betydelig mellom oppgaver, ledd og bevegelsesplan, og at markerfrie systemer ikke generelt kan behandles som utskiftbare med laboratoriebasert motion capture.[^28]

Dette gir fire praktiske krav:

- Ikke vis flere desimaler enn målenøyaktigheten forsvarer.
- Ikke tolk en endring som framgang før den er større enn kjent målefeil.
- Lag opptaksveiledning og kvalitetskontroll for lys, vinkel, klær, okklusjon og bildefrekvens.
- Valider hver variabel mot en troverdig referanse og AKs faktiske spillergrupper.

Onform opplyser selv at skjelettsporing påvirkes av blant annet dårlig lys, tildekking og kompliserte bakgrunner.[^29] Dette er et godt mønster: systemet bør si når det ikke vet.

## Beslutninger før bygging

Denne rapporten er et strategisk grunnlag, ikke en byggeordre. Før første funksjon flyttes til aktiv masterplan, må disse beslutningene tas:

1. Hva er det viktigste målbare resultatet: bedre spillerutvikling, spart coach-tid, sterkere kundelojalitet eller alle tre med én prioritert først?
2. Hvilken første brukergruppe skal AI-piloten gjelde: Performance/Pro, WANG, Team Norway eller Academy?
3. Kan en coachingtime tas opp, og hvilket behandlingsgrunnlag, samtykke, lagringssted og slettetid gjelder?
4. Hvilke datakilder er autoritative når TrackMan, runde, video og spillerens egen opplevelse peker ulikt?
5. Hvilke beslutninger kan AI foreslå, hvilke krever coachgodkjenning og hvilke skal AI aldri gjøre?
6. Hvilken partnerstrategi ønskes for video/3D, wearables, kart og banedata?

## Konklusjon

Den beste framtidsretningen er en **coachstyrt intelligensplattform for golfutvikling**. Markedet viser at spillere vil ha automatisk datainnsamling, tydelig prioritering, video, rask feedback og mindre administrasjon. Samtidig viser både produktdokumentasjon og forskning at data ofte er mangelfulle og at AI-målinger kan være situasjonsavhengige.

AK Golf HQ kan skille seg ut ved å gjøre noe mer krevende enn å produsere råd: bevise hvorfor rådet finnes, føre det inn i en faktisk plan, følge gjennomføringen og la coachen avgjøre hva som skjer videre. Det er denne lukkede forbedringssløyfen som bør styre Future Development.

## Kilder

[^1]: National Golf Foundation. [«Golf Apps and Tech’s Growing Footprint»](https://www.ngf.org/short-game/golf-apps-and-techs-growing-footprint/), 16. oktober 2025.
[^2]: Golf Genius. [«Golf Genius Coaching Platforms Empower Thousands of Coaches and Millions of Golfers Worldwide»](https://golfgenius.com/resources/news/coaching-platforms-worldwide), 16. januar 2026.
[^3]: TrackMan. [«Upgame by TrackMan»](https://www.trackman.com/golf/solutions/upgame), lest 12. september 2026.
[^4]: Arccos Golf Support. [«Will Arccos detect all my shots?»](https://support.arccosgolf.com/hc/en-us/articles/35106058736660-Will-Arccos-detect-all-my-shots), lest 12. september 2026.
[^5]: Clippd Help Center. [«Garmin x Clippd FAQs»](https://help.app.clippd.com/en/articles/11018871-garmin-x-clippd-faqs), 2. april 2025.
[^6]: Apple App Store. [«Arccos Golf — Ratings & Reviews»](https://apps.apple.com/us/app/arccos-golf/id841396631?platform=watch&see-all=reviews), lest 12. september 2026.
[^7]: Skillest. [«Coaching Software Features for Golf Coaches»](https://skillest.com/features), lest 12. september 2026.
[^8]: CoachNow. [«CoachNow for Coach Features»](https://coachnow.com/coach-features), lest 12. september 2026.
[^9]: CoachNow Help Center. [«What is a Space?»](https://help.coachnow.io/en/articles/361978-what-is-a-space), 30. april 2026.
[^10]: Onform. [«Golf Video Analysis App and Coaching Solution»](https://onform.com/sports/golf/), lest 12. september 2026.
[^11]: V1 Sports. [«V1 Golf»](https://v1sports.com/athletes/v1-golf-app/), lest 12. september 2026.
[^12]: Sportsbox AI. [«Sportsbox AI: 3D Motion Analysis for Golf»](https://www.sportsbox.ai/), lest 12. september 2026.
[^13]: Skillest. [«In-Person Golf Lesson Software for Coaches»](https://skillest.com/features/in-person-lessons), lest 12. september 2026.
[^14]: Clippd. [«Clippd»](https://www.clippd.com/), lest 12. september 2026.
[^15]: Clippd Help Center. [«What To Work On»](https://help.app.clippd.com/en/articles/10006259-what-to-work-on), 3. september 2025.
[^16]: Arccos Golf Support. [«What insights do you get with Arccos Air?»](https://support.arccosgolf.com/hc/en-us/articles/46185466444820-What-insights-do-you-get-with-Arccos-Air), 16. mars 2026.
[^17]: Shot Scope. [«Golf Shot Tracker Products»](https://shotscope.com/row/products/shot-tracking/), lest 12. september 2026.
[^18]: Garmin. [«Garmin Golf App»](https://www.garmin.com/en-US/garmin-technology/golf-science/garmingolfapp/), lest 12. september 2026.
[^19]: Golfshot. [«Golfshot»](https://golfshot.com/), lest 12. september 2026.
[^20]: Apple App Store. [«18Birdies: Golf GPS Tracker»](https://apps.apple.com/us/app/18birdies-golf-gps-tracker/id892700751), lest 12. september 2026.
[^21]: Operation 36. [«The Operation 36 Curriculum»](https://operation36.golf/the-curriculum/), lest 12. september 2026.
[^22]: GolfFix. [«GolfFix App»](https://www.golffix.io/en/golffix), lest 12. september 2026.
[^23]: 18Birdies Knowledge Base. [«What is AI Swing Analyzer?»](https://help.18birdies.com/article/593-ai-swing-analyzer), 2026.
[^24]: USGA. [«Rule 4 — The Player’s Equipment», Rule 4.3](https://www.usga.org/content/usga/home-page/custom-search-pages/rules/2019-golf-rules-and-interpretations/fr-rule-4.html), lest 12. september 2026.
[^25]: Tan, Y. mfl. [«Full-Body Golf Swing Kinematic Reconstruction From a Smartwatch IMU»](https://arxiv.org/abs/2606.22876), 22. juni 2026. Forhåndspublisert forskning, ikke fagfellevurdert i den siterte versjonen.
[^26]: Europakommisjonen. [«AI Act»](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), lest 12. september 2026.
[^27]: Europakommisjonen. [«Impact Assessment Report accompanying the proposal for an Artificial Intelligence Act», avsnitt om GDPR og automatiserte avgjørelser](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?from=EN&uri=CELEX%3A52022SC0319), 2022.
[^28]: Yoma, M., Llurda-Almuzara, L., Herrington, L. og Jones, R. [«Reliability and validity of lower extremity and trunk kinematics measured with markerless motion capture during sports-related and functional tasks: A systematic review»](https://pubmed.ncbi.nlm.nih.gov/40526450/), *Journal of Sports Sciences*, 2025.
[^29]: Onform Knowledge Base. [«iOS Key Concepts and User Guide for Coaches»](https://support.onform.com/article/153-user-guide-onform-video-analysis-app), lest 12. september 2026.
