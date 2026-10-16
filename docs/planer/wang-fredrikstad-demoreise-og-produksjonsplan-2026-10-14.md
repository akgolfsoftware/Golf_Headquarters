# WANG Toppidrett Fredrikstad — demoreise og produksjonsplan

Dato: 14. oktober 2026  
Omfang: Golf-demo, rolleflater og teknisk grunnlag i den faktiske appen  
Datagrunnlag: Bare fiktive demonstrasjonsdata

## 1. Hva som kan demonstreres trygt nå

- En sammenhengende Golf-demo fra skoleoversikt til Workbench, økt-preview, utøverprofil, samling og meldingsavgrensning.
- Ti fiktive rollevisninger for sentral ledelse, skoleledelse, sportsteam, elev og eksterne lesere.
- Rolleavgrensede app-ruter for kalender, Workbench, utøvere, helsevarsel og skrivebeskyttede meldinger.
- Tydelige tomtilstander der faggrunnlag eller data mangler. Appen finner ikke på idrettsfaglig innhold.
- Roing vises bare som fremtidig Workbench og er ikke aktiv idrett i skoleåret 2026/27.

Dette er demo- og teknisk kontrollnivå. Løsningen er ikke godkjent for ekte elevdata.

## 2. Demoreise — 12 minutter

### Steg 1 — Start og avgrensning

Åpne `https://akgolf-hq.vercel.app/team-wang/demo`.

Vis:

- «Demo – fiktive navn og tall»
- WANG Toppidrett Fredrikstad og skoleåret 2026/2027
- Golf som aktiv demo
- de øvrige aktive idrettskategoriene som struktur uten oppdiktet fagmodell
- roing som fremtidig Workbench
- tydelig beskjed om at B16 og WANG Golf-fagmodellen ikke er godkjent

### Steg 2 — Workbench fra år til økt

Åpne `Workbench`.

Vis:

- årsplan, periodeplan, månedsplan, ukeplan og øktplan i samme kjede
- gruppevalg for de fiktive Golf-gruppene
- en registrert ukehendelse og åpne forhåndsvisningen
- ærlig melding om at gjentakelser og faglig øktinnhold venter på godkjent grunnlag

Ikke presenter fagmodellen som ferdig.

### Steg 3 — Fiktiv utøverprofil

Åpne `Utøvere`, velg én fiktiv utøver og vis:

- navn, trinn, gruppe og idrett
- inneværende uke
- kalenderhendelser og konkurranser som faktisk finnes i demonstrasjonsgrunnlaget
- sperrene rundt helse, kontaktinformasjon og andre personopplysninger

### Steg 4 — Analyse med tydelig datamangel

Åpne `Analyse og tester`.

Vis at:

- testbiblioteket venter på godkjent WANG Golf-fagmodell
- utvikling over tid ikke vises uten godkjente testresultater
- systemet prioriterer korrekt tomtilstand fremfor oppdiktede tall

### Steg 5 — Treningssamling

Åpne `Samlinger` og velg en demo-samling.

Vis dato, gruppe, sted, status og at samlingen ligger i samme kalendergrunnlag som Workbench.

### Steg 6 — Meldingsgrensen

Åpne `Meldinger`.

Vis at demoen ikke kan sende melding. Forklar at skriveflyt, e-post, eksport, sletting,
lagringstid og revisjonsspor må være ferdig før sending åpnes.

### Steg 7 — Rollevisninger

Åpne følgende adresser i denne rekkefølgen:

1. `/team-wang/demo/roller?rolle=central_admin`
2. `/team-wang/demo/roller?rolle=principal`
3. `/team-wang/demo/roller?rolle=sports_director`
4. `/team-wang/demo/roller?rolle=coach`
5. `/team-wang/demo/roller?rolle=student`
6. `/team-wang/demo/roller?rolle=guardian`
7. `/team-wang/demo/roller?rolle=readonly`

Forklar at alle ti roller er kontrollert, mens disse sju viser rolleforskjellene mest effektivt.
Forhåndsvisningen gir ingen virkelig tilgang og bruker ingen personopplysninger.

### Steg 8 — Beskyttet inngang

Åpne `/team-wang/app` i en ren nettleserøkt.

Forventet resultat er videresending til separat WANG-innlogging med returadresse. Ikke logg inn med
en ekte person. Innlogget ende-til-ende-kontroll venter på eksplisitt godkjenning av syntetiske Auth-kontoer.

## 3. Kontrollbevis for demoen

- Golf-demoen er kontrollert på 1280 piksler desktop og 390 piksler mobil.
- Alle ti rollevisninger er kontrollert på 1280 × 720 og 390 × 844 piksler.
- Rollevisningene har ingen vannrett overflyt og ingen konsollfeil.
- Synlige trykkflater er minst 44 × 44 piksler.
- Tastaturfokus er synlig og minst tre piksler bredt.
- Automatisk tilgjengelighetskontroll har ingen alvorlige eller kritiske funn.
- Produksjonskontroll er automatisert i `tests/e2e/wang-role-preview-accessibility.spec.ts`.

## 4. Produksjonsstatus

### Ferdig

- separat WANG-database og rollemodell
- fiktiv Golf-demo og rolleforhåndsvisning
- separat WANG-innlogging og serverkontroll
- lesevisninger for kalender, Workbench, utøvere, helsevarsler og meldinger
- databasevern for skole-, idretts- og delingsomfang
- desktop-, mobil-, tastatur- og tilgjengelighetskontroll av de offentlige rollevisningene

### Ikke ferdig

- innlogget ende-til-ende-kontroll for alle ti roller
- godkjent idrettsfaglig innhold for de aktive idrettskategoriene uten dokumentert faggrunnlag
- melding, svar og e-postvarsling
- elevens eksport og sletting fra den separate WANG-databasen
- besluttet og håndhevet lagringstid og revisjonsspor
- godkjent behandling av ekte elevdata
- komplett visuell kobling mellom alle app-ruter og de 59 skjermene i Claude Design

## 5. Produksjonsporter

### Port 1 — Syntetisk innlogging

Krav:

- eksplisitt godkjenning til å opprette ti syntetiske Auth-kontoer
- fast `example.invalid`-adresse og tydelig syntetisk markør
- én eksisterende fiktiv Golf-elev kobles til elev-, foresatt- og klubbtrenerrollene
- ingen e-post sendes
- alle roller kontrolleres på desktop, mobil og tastatur mot faktisk databaseomfang

Ferdigbevis: alle ti kontoer består riktig tilgang og avvisning uten personopplysninger på avveie.

### Port 2 — Personvernfunksjoner

Krav:

- eksport fra WANG-databasen
- sletting og anonymisering
- lagringstid per datatype
- revisjonsspor for lesing og endring
- avklart behandlingsgrunnlag og ansvar mellom skole og leverandør

Ferdigbevis: syntetisk elev kan eksporteres og slettes fullstendig, og sperret data forblir sperret.

### Port 3 — Kontrollerte skrivefunksjoner

Krav:

- meldingsoppretting og svar med validerte mottakere
- elever kan ikke starte elev-til-elev-samtaler
- e-post inneholder minst mulig informasjon og ingen helseopplysninger
- kalenderendring følger eierskap: skole og WANG er låst for elev, egen- og klubbtrening kan redigeres av elev
- alle endringer logges og kan angres eller korrigeres

Ferdigbevis: syntetiske roller består positive og negative tester for skriving, varsling og låsing.

### Port 4 — Avgrenset pilot

Krav:

- port 1–3 er grønne
- skoleledelse har godkjent rolle- og datamatrisen
- kun WANG Fredrikstad og Golf aktiveres først
- ingen andre idretter får faginnhold før godkjent underlag finnes
- sikkerhetskopi, feilvarsling og driftsansvar er dokumentert

Ferdigbevis: en tidsavgrenset pilot er gjennomført uten tilgangsavvik og med dokumentert støtteflyt.

### Port 5 — Utvidelse

Krav:

- hver idrett får separat godkjent faggrunnlag
- Kampidrett, Apparatturn og Andre idretter beholder datamangelmerking til grunnlaget er godkjent
- roing aktiveres ikke for 2026/27 og behandles sist
- mobil og desktop kontrolleres på nytt for hver nye Workbench

Ferdigbevis: én idrett åpnes om gangen etter samme kontroll som Golf.

## 6. Neste handling

Neste avhengige steg er Port 1. Det krever eksplisitt godkjenning i handlingen som oppretter de ti
syntetiske Auth-kontoene. Inntil da kan dokumentasjon og visuell kobling forbedres, men innlogget
rolle- og databasetilgang skal ikke omtales som sluttkontrollert.
