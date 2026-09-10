# Brukerreiser og wireframes

Wireframes er enkle skisser som avgjør innhold, rekkefølge og handlinger før visuell detaljering. Bruk ekte felttyper og syntetiske data. Ikke hopp rett fra en komponentliste til hundre detaljerte, men ukoordinerte skjermer.

## Reisebeskrivelse

For hver reise: aktør/rolle → utløsende behov → inngang → handlinger → synlige mellomtilstander → vellykket utfall → feil/avbrudd → tilbake/fortsett. Oppgi hvilke data som endres, hvilke beslutninger som er åpne og hvordan samme objekt går igjen på flere skjermer. En knapp som bare ser klikkbar ut er ikke en fungerende flyt.

## Reiser som skal dekkes på tvers av appen

| ID | Reise | Viktige sidegrener |
|---|---|---|
| J01 | Invitasjon/registrering → konto → onboarding → riktig hjem | Utløpt lenke, eksisterende konto, gjenoppretting, rolle, retur til ønsket mål |
| J02 | I dag/Plan → økt → start → registrer → avslutt → oppsummering → oppdatert plan | Pause ved behov, feiltrykk/Angre, avbrutt, offline/synkfeil, allerede fullført |
| J03 | Spiller oppretter/redigerer/flytter økt | Konflikt, egen/gruppetilknyttet, serie, ikke delta, avbrutt redigering |
| J04 | Coach vurderer spiller/gruppe → planlegger → kontrollerer → publiserer → følger opp | Flere spillere, delvis feil, endret plan, godkjenning, spillerens respons |
| J05 | Analyse → forstå funn → se datagrunnlag → velg relevant videre handling | Få/manglende data, annen periode/benchmark, ulike datakilder |
| J06 | Test/runde/TrackMan/import → registrering/bearbeiding → kvalitet → resultat | Enheter, feilformat, duplikat, avbrudd, feil geometri, retting |
| J07 | Coachkontakt → melding/spørsmål/video → tilbakemelding → oppfølging | Sending feiler, mottaker, tillatelser, varsler, ulest |
| J08 | Offentlig tilbud → coach/tjeneste → tid → gjennomgang → betaling → bekreftelse | Tid opptatt, betaling venter/avbrutt/feilet, ingen duplikatbooking, retur fra leverandør |
| J09 | Mine bookinger → endre/avbestille → konsekvens → bekreftelse | Frister, pris-/credit-konsekvens etter gjeldende regler, coachens kalender |
| J10 | Abonnement/credits → velg → betal → riktig tilgang → administrer | Prøve, oppsigelse, tilbakevendende betaling, uavklart bekreftelse |
| J11 | Forelder knytter barn → ser plan → samtykke/booking/økonomi | Flere barn, feil rolle, manglende samtykke, begrenset innsyn |
| J12 | Lag/skole → gruppe/plan → innlegg/dokument/hendelse → deltakelse | Organisasjonsbytte, publisering, tilgang, vedlegg, tomt rom |
| J13 | Talent/delt innsyn → inviter/del → se tillatt informasjon → utløp | Hvem inviterer, hvilke felt, revokering, ugyldig lenke; avklar før ferdig design |
| J14 | Varsel/lenke → korrekt objekt → relevant handling → tilbake | Gammel lenke, slettet objekt, auth-retur, feil rolle |
| J15 | Personlig drift/AI → forslag → vurder konsekvens → handling → resultat | Avvis/rediger, running/feilet, sporbarhet; vis aldri foreslått som utført |
| J16 | Marked/statistikk/verktøy → forstå/søk → fordyp → kontakt/booking | Lange tabeller, kilde/dato, null treff, skjema-/beregningsfeil |
| J17 | Innstillinger/hjelp/personvern → endring → lagring/bekreftelse | Avbrutt skjema, validering, dataeksport/sletting følger godkjent produktregel |

Reisene er en kontrolliste, ikke krav om nye funksjoner. Knytt dem til faktisk kode og produktbehov; begrunn når noe ikke finnes eller ikke er relevant. Alle funksjoner i det bestilte omfanget beholdes.

## Tre skisser som kalibrerer helheten

### I dag — mobil

```text
Dato / riktig spillerkontekst              Varsler
I dag
Dagens økt: Innspill 50–80 m
Mål: 8 av 12 i vinduet · planlagt 50 min
Kort begrunnelse / relevant trenerbeskjed
[Start økt]                 [Se oppskrift]
Neste relevante avtale eller handling
Kompakt fremgang med vei til fordypning
Stabil hovednavigasjon / kompakt Caddie-inngang
```

Planlagt, pågående og fullført gir ulike hovedhandlinger. Ingen nedtelling før start. Dersom oppskrift må vises før start, kalles første handling «Se økt». Sekundær informasjon får ikke større visuell vekt enn dagens oppgave.

### Live — mobil

```text
Tilbake / øktnavn                           Avslutt
5 av 12 registrert                 Mål: 8 treff
Nå: hoveddel, 50–80 m
Kort instruksjon / målområde
Sekundær tid og tilgjengelig lagringsstatus

[ Treff ]        [ Kant ]        [ Bom ]
[Angre siste]                         Hjelp
```

Dette er foreslått hierarki, ikke låste koordinater. Stabil tommelplassering, avbrudd og dobbeltrykk må prøves. En tidsstyrt fysisk oppgave kan legitimt prioritere klokken høyere.

### Coach — bred skjerm

```text
Navigasjon | Dagens prioriteringer / filtre       | Objekt ved behov
           | Hvem trenger oppfølging, og hvorfor | Spiller / økt
           | Dagens kalender / aktive aktiviteter | Relevant kontekst
           | Spiller-/gruppeoversikt eller plan   | Konsekvens og handling
```

Velg data-/arbeidsmengde etter coachens oppgave. På smal skjerm åpnes detaljen separat eller i ark, med tilbakevei til samme utvalg. Ikke press hele desktop-tabellen inn som mikrotekst.

## Fra wireframe til komplett UI

Registrer skisse-ID og rute/mønster. Kontroller reise og tekst først. Bruk så den valgte komponent-/designversjonen, og tegn alle relevante tilstander og formatendringer. Koble skissen til ferdig UI og prototypens samme ID. Ved endret navigasjon oppdateres alle berørte innganger og tilbakeveier, ikke bare det nye skjermbildet.

Full dekning krever både ruter og overganger. Det er ikke nødvendig å duplisere en innstillingsskjerm 30 ganger hvis ett gjennomarbeidet mønster og en felt-/handlingsmatrise dekker dem presist.
