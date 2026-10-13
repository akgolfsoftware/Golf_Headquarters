# WANG Fredrikstad — roller og datagrunnlag

Dato: 13. oktober 2026  
Status: Beslutningsgrunnlag for neste utviklingsfase. Ingen tilgang er endret.

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
| Eier / sentral admin | Alle WANG-skoler og idretter | Samlet oversikt, skoler, idretter, årsplaner, status og administrasjon. Tilgang til navngitte elever må avklares før den bygges. |
| Rektor | Egen skole | Alle idretter, planer, elevlister og elevprofiler ved egen skole. Samme skjermbilder som toppidrettssjef. |
| Toppidrettssjef | Egen skole | Alle idretter, planer, elevlister og elevprofiler ved egen skole. Samme skjermbilder som rektor. |
| Sportssjef | Tildelt idrett ved egen skole | Komplett Workbench, planlegging, analyse, samlinger, meldinger og elevprofiler for egen idrett. |
| Trener | Tildelt idrett ved egen skole | Samme faglige skjermbilder som sportssjef for egen idrett. Administrasjon av roller kan begrenses til sportssjef. |
| Elev / utøver | Egen profil og kalender | Egen uke, skole, prøver, WANG-trening, konkurranser, samlinger og egen treningsplanlegging. |
| Foresatt | Invitert elev, lesetilgang | Relevante planer, samlinger, skoleinformasjon, kontaktinformasjon og meldinger. Skal ikke se søvn eller dagsform. |
| Klubbtrener | Invitert elev, lesetilgang | Avtalt treningsinformasjon, konkurranser, kontaktinformasjon og meldinger. Omfanget må kunne avgrenses av invitasjonen. |

Databasen har nå rollene `central_admin`, `school_leader`, `sports_director`, `coach`, `student`, `guardian` og `readonly`.

Før rolleinnlogging bygges ferdig må datamodellen justeres slik at:

- rektor og toppidrettssjef kan skilles i brukeradministrasjonen, selv om de får samme skjermtilgang
- klubbtrener er en egen invitasjonsbasert rolle, ikke en generell lesebruker
- sentral admin ikke automatisk får mer elevinnsyn enn det som blir besluttet

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
| Plannoder | Årsplan, periodeplan, månedsplan, ukeplan og øktplan |
| Kalenderhendelser | Skole, prøve, trening, konkurranse, samling og egentrening |
| Morgeninnsjekk | Søvntimer og dagsform for elev og godkjent idrettspersonell |

Mangler før full rolleflyt:

- egen invitasjonsrelasjon for klubbtrener og andre lesere
- meldingstråder, mottakere og e-postspeiling
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

## 9. Tre beslutninger før implementering

1. Skal eier / sentral admin se navngitte elever som standard, eller bare samlet status med særskilt åpning av enkeltelever?
2. Skal rektor og toppidrettssjef se morgeninnsjekk og søvnvarsler, eller skal dette begrenses til sportssjef og trener?
3. Skal klubbtrener ha en løpende invitasjon frem til eleven trekker den tilbake, eller skal eleven godkjenne hver ny deling?

## 10. Neste byggesteg etter beslutningene

Når de tre beslutningene er godkjent, er neste avgrensede steg å oppdatere databaserollene og bygge innlogging med rollebasert startside. Ingen av disse tilgangsendringene er gjort i denne dokumentbolken.
