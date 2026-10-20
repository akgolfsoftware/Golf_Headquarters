# WANG Fredrikstad — roller og datagrunnlag

Dato: 13. oktober 2026  
Status: Rollegrunnlaget og sikre testprofiler er bygget. Ingen ekte brukere, kontoer eller elevdata er lagt inn.

## 1. Formål

Dette dokumentet beskriver hvem som skal se og gjøre hva i WANG-systemet. Det er kontrakten mellom skjermene, innloggingen og databasen før ekte brukere eller elevdata kobles til.

Felles prinsipper:

- Tilgang skal begrenses av skole, idrett og relasjon til eleven.
- Kontrollen skal skje i databasen og på serveren, ikke bare ved å skjule knapper.
- Elever ved ulike skoler eller idretter skal ikke kunne se hverandre.
- Elever skal ikke kunne sende meldinger til andre elever.
- Demoen bruker bare fiktive navn og tall.
- Roing er en fremtidig Workbench og er ikke aktiv idrett i skoleåret 2026/27.

## 2. Roller og omfang

| Rolle | Omfang | Skal kunne se og gjøre |
|---|---|---|
| Eier / sentral admin | Alle WANG-skoler og idretter | Samlet oversikt, skoler, idretter, årsplaner, status og administrasjon. Navngitte elever åpnes ikke automatisk. |
| Rektor | Egen skole | Alle idretter, planer, elevlister og elevprofiler ved egen skole. Samme skjermbilder som toppidrettssjef. |
| Toppidrettssjef | Egen skole | Alle idretter, planer, elevlister og elevprofiler ved egen skole. Samme skjermbilder som rektor. |
| Sportssjef | Tildelt idrett ved egen skole | Komplett Workbench, planlegging, analyse, samlinger, meldinger og elevprofiler for egen idrett. |
| Trener | Tildelt idrett ved egen skole | Samme faglige skjermbilder som sportssjef for egen idrett. Administrasjon av roller kan begrenses til sportssjef. |
| Elev / utøver | Egen profil og kalender | Egen uke, skole, prøver, WANG-trening, konkurranser, samlinger og egen treningsplanlegging. |
| Foresatt | Invitert elev, lesetilgang | Relevante planer, samlinger, skoleinformasjon, kontaktinformasjon og meldinger. Skal ikke se søvn eller dagsform. |
| Klubbtrener | Invitert elev, lesetilgang | Avtalt treningsinformasjon, konkurranser, kontaktinformasjon og meldinger. Omfanget må kunne avgrenses av invitasjonen. |

Databasen har nå rollene `central_admin`, `school_leader`, `principal`, `head_of_sports`, `sports_director`, `coach`, `student`, `guardian`, `club_coach` og `readonly`.

Datamodellen håndhever nå at:

- rektor og toppidrettssjef er egne roller med samme skjermomfang
- klubbtrener er en egen invitasjonsbasert rolle med sluttdato og tilbakekalling
- sentral admin ser samlet status uten automatisk tilgang til navngitte elever
- morgeninnsjekk kan leses av eleven selv og tildelt sportssjef eller trener, ikke skoleledelse eller eksterne lesere

## 3. Felles navigasjon

Golf-demoen har den godkjente grunnnavigasjonen:

1. Oversikt
2. Workbench
3. Utøvere
4. Analyse og tester
5. Samlinger
6. Meldinger

Rollebaserte tillegg:

- Eier / sentral admin: `Skoler og idretter`
- Rektor og toppidrettssjef: `Skoleoversikt`
- Elev: `Min uke`, `Skole` og `Min trening`
- Foresatt og klubbtrener: en forenklet lesevisning rundt invitert elev

Menypunkter uten tilgang skal ikke vises. Direkte lenker uten tilgang skal gi en tydelig lukket side, ikke en tom skjerm.

## 4. Datagrunnlag

Følgende grunnstruktur finnes i den separate WANG-databasen:

| Data | Bruk |
|---|---|
| Skoler | Hvilken WANG-skole dataene tilhører |
| Idretter | Felles idrettskatalog og status for Workbench |
| Skoleidretter | Hvilke idretter en skole tilbyr i et bestemt skoleår |
| Profiler | Innlogget person, rolle og skoletilhørighet |
| Ansattilknytninger | Hvilken idrett sportssjef eller trener er tildelt |
| Grupper | Klasse, kull eller treningsgruppe innen en skoleidrett |
| Elever | Elevens gruppe, trinn og demostatus |
| Foresattrelasjoner | Hvilken invitert foresatt som kan lese hvilken elev |
| Ekstern tilgang | Avgrenset deling til foresatt eller klubbtrener, med omfang, start, sluttdato og tilbakekalling |
| Plannoder | Årsplan, periodeplan, månedsplan, ukeplan og øktplan |
| Kalenderhendelser | Skole, prøve, trening, konkurranse, samling og egentrening |
| Morgeninnsjekk | Søvntimer og dagsform for elev og godkjent idrettspersonell |

Mangler før full rolleflyt:

- sikker sending, svar, varsling og e-postspeiling for meldingstråder
- kontaktopplysninger med tydelig formål og tilgang
- samlingsdetaljer som reise, bosted, transport, regler og dagsplan
- kompetansemål og koblingen mellom kompetansemål og treningsøkt
- samtykke, historikk, sletting og innsyn for persondata

## 5. Kalender og redigering

- Skolehendelser er låst for eleven.
- WANG-treninger og WANG-samlinger er låst for eleven.
- Egentrening opprettet av eleven kan flyttes og endres av eleven.
- Klubbtrening opprettet av eleven kan flyttes og endres av eleven.
- Alle hendelser skal ha en forhåndsvisning før full detaljvisning.
- Gjentakelser skal støtte blant annet bestemte ukedager, ukentlig, månedlig og hver n-te uke.
- En elev som er påmeldt en samling skal få samlingen i egen kalender.

## 6. Meldinger og varsling

- Rektor, toppidrettssjef, sportssjef og trener skal kunne sende melding innenfor sitt tilgangsomfang.
- Eleven skal kunne svare godkjente voksne, men ikke starte eller delta i elev-til-elev-samtaler.
- Meldinger til foresatt, klubbtrener eller andre inviterte lesere skal også sendes som e-postvarsel.
- E-postvarselet skal ikke inneholde sensitive opplysninger; det skal lede mottakeren til innlogget visning.
- Systemet skal vise hvem eleven har invitert, med navn, telefonnummer, e-post, rolle og aktiv status.

## 7. Søvn og dagsform

- Eleven må svare på søvn og dagsform ved første åpning den dagen før resten av appen låses opp.
- Eleven og godkjent idrettspersonell kan se opplysningene.
- Foresatte skal ikke se søvn eller dagsform.
- Klubbtrener skal ikke få dette automatisk; eventuell tilgang krever en egen senere beslutning.
- Et varsel ved for eksempel mindre enn seks timers søvn tre dager på rad skal bygges som en tydelig regel med dato og forklaring, ikke som en skjult vurdering.

## 8. Personvernport før ekte data

Ekte elevdata skal ikke legges inn før disse punktene er besluttet og kontrollert:

1. Hvilke navngitte elevopplysninger hver rolle trenger for å gjøre jobben sin.
2. Hvordan elev og foresatt får innsyn, inviterer andre og trekker tilgang tilbake.
3. Hvor lenge data lagres, hvordan de rettes, eksporteres og slettes.
4. Hvilke handlinger som skal logges, spesielt lesing og endring av sensitive opplysninger.
5. Hvilket behandlingsgrunnlag som gjelder for skoledata, helseopplysninger og kommunikasjon.

## 9. Godkjente rollevalg

1. Eier / sentral admin ser samlet status og får ikke automatisk tilgang til navngitte elever.
2. Morgeninnsjekk og søvnvarsler er begrenset til eleven selv, sportssjef og trener.
3. Klubbtrener får en tidsbegrenset invitasjon som eleven kan trekke tilbake.

## 10. Levert og neste byggesteg

Levert i dette steget:

- separat WANG-innlogging under `/team-wang/app/logg-inn`
- rollebasert startside under `/team-wang/app`
- egen sesjonskontroll mot WANG-databasen
- databasehåndheving av rolleomfang, elevinnsyn, morgeninnsjekk og tidsbegrenset ekstern deling
- null sikkerhetsvarsler i Supabase etter migrasjonene
- nettleserkontroll av desktop og 390 piksler mobil uten vannrett overflyt
- synlig tastaturfokus med 3 piksler fokusramme og uten konsollfeil på WANG-innloggingen
- komplett prosjektkontroll med 185 komponenttester og godkjent produksjonsbygg

Neste avgrensede steg er å koble de godkjente rollene til faktiske grunnskjermer og Workbench-struktur for de aktive idrettene, uten å finne på idrettsfaglige modeller.

## 11. Rolleforhåndsvisning kontrollert 13. oktober 2026

Produksjonskontrollen av alle ti roller fant at `school_leader` og `readonly` ga 404 fordi den offentlige forhåndsvisningen hadde en egen, ufullstendig rolleliste. Rollenavnene er nå samlet i én felles fasit som brukes av typekontroll, innlogging og forhåndsvisning.

Lokal kontroll etter rettingen:

- `school_leader` viser `Skoleoversikt` med fiktive data og uten gitt tilgang
- `readonly` viser `Delt oversikt` med fiktive data og uten gitt tilgang
- begge rutene returnerer 200 ved 1280 piksler, uten vannrett overflyt eller konsollfeil
- målrettet rolletest, typekontroll, lint og `git diff --check` er grønne

Rettelsen ble lagt inn i hovedversjonen i PR #1218 og er kontrollert i produksjon.

## 12. Sikre testprofiler bygget 13. oktober 2026

Det finnes nå én fast, tydelig fiktiv testprofil for hver av de ti støttede rollene. Profilene har eksplisitt omfang for skole, idrett, søvn og dagsform samt eventuell sluttdato for lesetilgang.

Sikkerhetsgrenser:

- testprofilene oppretter ingen kontoer og kan ikke brukes til innlogging
- ingen e-post, telefonnummer eller ekte navn ligger i testprofilene
- sentral admin er eneste rolle som kan åpne administrasjonssiden `/team-wang/app/testprofiler`
- alle andre roller avvises før profillisten rendres
- offentlig rolleforhåndsvisning viser bare de samme fiktive profilene og gir ingen tilgang

Kontrollert i denne arbeidsbolken:

- nøyaktig én testprofil per rolle og unike profil-ID-er
- sentral admin uten automatisk tilgang til navngitte elever
- rektor, toppidrettssjef og skoleleder uten søvn og dagsform
- sportssjef, trener og elev med riktig avgrenset tilgang
- foresatt, klubbtrener og leser med skjult søvn og dagsform
- klubbtrener og øvrige eksterne lesere med sluttdato i testomfanget
- alle ti rollevisninger i Chromium på 1280 og 390 piksler uten vannrett overflyt
- tydelig tastaturfokus med minst 3 piksler fokusramme
- ingen konsollfeil i den kontrollerte desktopreisen

## 13. Trygg kontokobling klargjort 14. oktober 2026

Koblingsverktøyet `npm run wang:testprofiler:koble -- --input <privat-json>` lager som standard bare en kontrollrapport. Det skriver ingenting før `--apply` er lagt til.

Sikkerhetsgrenser:

- verktøyet godtar bare den godkjente WANG-databasen `uwuhkgkaqnuerlkqvrpw`
- inputfilen inneholder bare bruker-ID-er og ID-en til én eksisterende demo-elev, aldri navn, e-post eller passord
- alle ti Auth-brukere må allerede finnes med fast `example.invalid`-adresse og riktig syntetisk profilmarkør
- valgt elev må være en eksisterende demo-elev i Golf ved WANG Fredrikstad 2026/2027
- koblingen er additiv og kan ikke opprette Auth-brukere, sende e-post, slette data eller koble over en elev som allerede tilhører en annen profil
- foresatt og klubbtrener får tidsbegrenset lesetilgang uten søvn og dagsform

Ingen kontoer eller databasekoblinger er opprettet i denne arbeidsbolken. Opprettingen ble eksplisitt
godkjent 20. oktober 2026, men den faktiske kjøringen er sperret fordi tilgjengelig Supabase-konto
ikke har tilgang til WANG-prosjektet `uwuhkgkaqnuerlkqvrpw`.

## 14. Rolleavgrenset utøveroversikt bygget 14. oktober 2026

Den beskyttede siden `/team-wang/app/utovere` er koblet til WANG-databasen.

- skoleleder, rektor og toppidrettssjef ser bare aktive idretter, grupper og utøvere ved egen skole
- sportssjef og trener ser bare aktive idretter og grupper de er tildelt
- sentral admin, elev, foresatt, klubbtrener og invitert leser avvises før elevlisten lastes
- siden henter bare navn, trinn, gruppe, idrett og skoleår
- søvn, dagsform, innsjekkstatus, telefonnummer og e-post hentes ikke
- fiktive elever er tydelig merket som fiktive data
- utøverprofil er ikke gjort klikkbar før en egen tilgangskontrollert profilside finnes

## 15. Rolleavgrenset utøverprofil bygget 14. oktober 2026

Utøverlisten åpner nå en beskyttet grunnprofil under `/team-wang/app/utovere/[elevId]`.

- profilen kan bare åpnes når eleven allerede finnes i den innloggede rollens skole- eller idrettsomfang
- ukjent elev-ID og elev utenfor omfanget gir samme nøytrale svar og røper ikke om eleven finnes
- siden viser bare navn, trinn, skole, idrett, gruppe og skoleår
- søvn, dagsform, morgeninnsjekk, telefonnummer, e-post og andre kontaktopplysninger hentes ikke
- fiktive elever er tydelig merket som demonstrasjonsdata
- kalender, konkurranser og skoledata er synlige som ærlige ikke-koblede tilstander uten oppdiktet innhold
- lenker og profilside har minimum 44 piksler trykkflate og tydelig tastaturfokus

## 16. Kalender- og konkurransegrunnlag i utøverprofil bygget 14. oktober 2026

Den beskyttede utøverprofilen viser nå registrerte kalenderhendelser innenfor samme rolleomfang.

- `Denne uken` viser kalenderhendelser som overlapper inneværende Oslo-uke
- `Konkurranser` viser inntil tre kommende konkurranser fra godkjent kalendergrunnlag
- `Skole` viser registrerte skoletimer, prøver og innleveringer for inneværende uke
- tomme tilstander sier at ingenting er registrert; systemet finner ikke på hendelser
- data hentes bare for elevens gruppe, idrett eller egen elev-ID og kontrolleres av eksisterende databasevern
- arkiverte hendelser skjules, mens godkjent ledelse og sportsteam kan se utkast i eget omfang
- søvn, dagsform, morgeninnsjekk, kontaktdata og annen helseinformasjon hentes fortsatt ikke

## 17. Skoleledelsens kalender bygget 14. oktober 2026

Skoleleder, rektor og toppidrettssjef kan nå åpne den beskyttede kalenderen fra egen WANG-navigasjon.

- visningen inneholder alle aktive idretter og grupper ved rollen sin egen skole
- hver idrett uten registrert gruppe får en ærlig tom kalender i stedet for oppdiktede hendelser
- skole- og WANG-hendelser på idretts- eller gruppenivå vises, inkludert utkast og publiseringsstatus
- elevspesifikk egentrening, klubbtrening og andre personlige hendelser er utelatt fra skoleoversikten
- søvn, dagsform, morgeninnsjekk, telefonnummer, e-post og kontaktdata hentes ikke
- sentral admin og invitert leser får fortsatt ikke skolekalender gjennom denne rollen
- eksisterende databasevern avgrenser lesingen til rollen sin skole

## 18. Helsevarsel for sportsteam bygget 14. oktober 2026

Utøveroversikten viser nå et aktivt varsel til tildelt sportssjef og trener når en elev har registrert under seks timers søvn tre kalenderdager på rad.

- nøyaktig seks timer utløser ikke varsel
- en manglende dag eller en dag med seks timer eller mer bryter rekken
- varselet må slutte i dag eller i går for å være aktivt; eldre rekker vises ikke som nåværende varsel
- oversikten viser elev, idrett, gruppe, trinn, datoperiode og antall dager, men ikke eksakte søvntall eller dagsform
- skoleleder, rektor, toppidrettssjef, foresatt, klubbtrener og invitert leser får aldri varselet
- databasevernet begrenser lesing til elever i idretter der sportssjef eller trener har aktiv tildeling
- demoelever er tydelig merket, og ingen ekte elevdata er lagt til

## 19. Skrivebeskyttet meldingsgrunnlag bygget 14. oktober 2026

Den beskyttede siden `/team-wang/app/meldinger` viser en rolleavgrenset innboks uten å åpne sending eller e-post.

- bare aktive deltakere med fortsatt gyldig tilgang til den navngitte eleven kan se en samtale
- sentral admin og generell lesetilgang får ikke automatisk innsyn i navngitte elevsamtaler
- skoleleder, rektor, toppidrettssjef, sportssjef og trener er de eneste rollene som senere kan starte en samtale
- elev, foresatt og klubbtrener kan senere bare svare i en eksisterende samtale; elever kan ikke starte elev-til-elev-samtaler
- foresatt og klubbtrener må ha aktiv, tidsbegrenset deling med eksplisitt `messages`-omfang
- oversikten henter samtaleemne, elevnavn, status og oppdateringstid, men aldri meldingsinnhold, e-post, telefon, søvn eller dagsform
- de tre nye meldingstabellene gir bare leserett til innloggede klienter; ingen oppretting, svar, endring eller sletting er åpnet
- ingen meldingsrader, Auth-kontoer, e-postvarsler eller ekte elevdata er opprettet i denne arbeidsbolken

Neste meldingssteg er en egen kontrollert skriveflyt med validerte mottakere, logging, lagringstid, eksport og sletting før e-postvarsling vurderes.

## 20. Skrivebeskyttet samtaledetalj bygget 14. oktober 2026

Den beskyttede ruten `/team-wang/app/meldinger/[threadId]` viser lagret meldingsinnhold uten å åpne sending.

- ukjent samtale og samtale uten gyldig deltakertilgang gir samme nøytrale svar
- databasen kontrollerer aktivt deltakermedlemskap og fortsatt elevtilgang ved hvert oppslag
- meldinger vises kronologisk med tidspunkt og navn når rollen allerede kan lese profilen; ellers brukes bare deltakerrollen
- siden henter ikke e-post, telefonnummer, søvn eller dagsform
- tom samtale har en tydelig tomtilstand, og avsluttet samtale er tydelig merket
- det finnes ingen svarfelt, opprettingsknapp, sletting eller e-postvarsling
- ingen nye tabeller, rettigheter, Auth-kontoer, meldingsrader eller ekte elevdata er lagt til

Neste meldingssteg er fortsatt en kontrollert skriveflyt. Den kan ikke åpnes før eksport, sletting,
lagringstid og revisjonsspor er besluttet og testet.

## 21. Rolleforhåndsvisning kontrollert 14. oktober 2026

Alle ti fiktive rollevisninger under `/team-wang/demo/roller` er kontrollert på desktop og mobil.

- kontrollen dekker sentral admin, skoleleder, rektor, toppidrettssjef, sportssjef, trener, elev, foresatt, klubbtrener og invitert lesetilgang
- desktop er kontrollert ved 1280 × 720 piksler og mobil ved 390 × 844 piksler
- ingen av rollevisningene har vannrett overflyt
- alle synlige lenker og knapper har minst 44 × 44 piksler trykkflate
- første tastaturstopp er synlig og bruker en tre piksler bred fokusmarkering
- automatisk tilgjengelighetskontroll finner ingen alvorlige eller kritiske brudd
- nettleserkonsollen er uten feil i rollevisningene
- en reell kontrastfeil i sekundærtekst ble rettet ved å bruke den godkjente WANG-fargen `#475569`
- kontrollen bruker bare fiktive rolledata og oppretter ingen bruker, elev, tilgang eller databaserad

Dette bekrefter de offentlige rolleforhåndsvisningene, ikke de innloggede rolleskjermene. Full rolle- og
databasetest krever fortsatt at de godkjente syntetiske Auth-kontoene faktisk opprettes og kobles.

## 22. Sikker innlogget sluttkontroll klargjort 20. oktober 2026

Punkt 8 er godkjent og den tekniske kontrolløypen er ferdig klargjort uten å opprette kontoer.

- `wang:testprofiler:opprett` oppretter eller roterer ti tydelig syntetiske kontoer med
  `example.invalid`-adresser, tilfeldig passord og serverstyrt syntetisk markør
- standardkjøringen er bare en kontrollrapport; oppretting krever det eksplisitte valget `--apply`
- verktøyet er hardlåst til den godkjente WANG-databasen og nekter å lagre passord i kodebasen
- verktøyet velger bare en ukoblet demo-elev i Golf ved WANG Fredrikstad 2026/2027
- `wang:testprofiler:koble` beholder egen kontroll før profiler, sportsteam og ekstern lesetilgang kobles
- `wang:testprofiler:kontroller` kontrollerer alle ti roller på desktop og mobil, synlige appskjermer,
  tilgang og avvisning, vannrett overflyt, trykkflater, tastaturfokus, alvorlige
  tilgjengelighetsbrudd og feil i nettleserkonsollen
- passord, e-postadresser og tjenestenøkkel skrives aldri til loggen
- enhetstestene for konto- og koblingsreglene er grønne

Produksjonskjøringen er ikke utført. Supabase-kontoen som er tilgjengelig i denne arbeidsøkten har
ikke tilgang til prosjektet `uwuhkgkaqnuerlkqvrpw`, og nødvendig servernøkkel er ikke tilgjengelig.
Ingen Auth-konto, profilkobling eller annen databaserad er opprettet. Punkt 8 er derfor godkjent og
klargjort, men ikke sluttkontrollert.
