# AgencyOS-autopilot og remote coaching

Opprettet 12.09.2026. Sist oppdatert 13.09.2026 etter Deep Grill DG-02.

Status: levende produkt- og utviklingsplan. Planen oppdateres etter hver intervjurunde. Den endelige prioriteringen låses først når grillingen er analysert og Anders har valgt grensene for autonomi, produkt, kapasitet og økonomi.

## 1. Produktbeslutning

AgencyOS og AgenticOS slås sammen.

- **AgencyOS** er den eneste arbeidsflaten Anders bruker for å drive coaching og agency.
- **AgenticOS** er automasjonsmotoren inne i AgencyOS: agenter, ruting, jobber, godkjenninger, kostnad, kvalitet og historikk.
- **PlayerHQ** er spillerens arbeidsflate for plan, gjennomføring, dokumentasjon og kontakt.
- Jarvis er en assistentfunksjon, ikke et tredje operativsystem.
- Ett behov skal ha én tydelig inngang. Eksisterende funksjoner kan gjenbrukes, men parallelle flater skal konsolideres.

## 2. Nordstjerne etter DG-01

AgencyOS skal starte dagen før Anders gjør det, holde dagen i bevegelse mens han coacher og lukke oppfølgingen etter siste økt.

Den perfekte arbeidsdagen har fem faser:

1. **Før dagen:** systemet lager én sann oversikt for kommende arbeidsdag.
2. **Morgen:** Anders ser kalender, spillere, prosjekter, søknader, frister, oppgaver og agentarbeid i prioritert rekkefølge.
3. **Mellom økter:** ferdige forslag gjennomgås raskt med godkjenn, rediger eller avvis.
4. **Under coaching:** spillerprofilen er et komplett øktrom på Mac, mens iPhone brukes til bilder, video og lyd.
5. **Etter økten:** opptak, analyse, oppsummering, hjemmeoppgaver, teknisk plan og neste oppfølging behandles automatisk.

Systemet skal ikke bare vise hva Anders kan gjøre. Det skal drive godkjent arbeid fremover og gjøre resultatet kontrollerbart.

### NVP-kjernen

Første komplette lansering skal bevise én sammenhengende forbedringssløyfe:

```text
Planlegge trening
  -> gjennomføre trening
  -> registrere trenings- og prestasjonsdata
  -> analysere trening og utvikling
  -> bruke læringen i neste treningsplan
```

Optimal treningsplanlegging er førsteprioritet. De øvrige eksisterende funksjonene skal bevares, men utviklingsrekkefølgen avgjøres av om de gjør kjernen tryggere, mer presis eller enklere å gjennomføre.

PlayerHQ skal gjøre sløyfen forståelig og motiverende for spilleren. AgencyOS skal gi coachen faglig kontroll, prioritering, godkjenning og automatisert oppfølging rundt den samme sløyfen. Det skal ikke finnes to parallelle sannheter om spillerens plan eller status.

## 3. Allerede avklart

- Mobil er den viktigste morgenflaten; Anders åpner ofte systemet mellom coachingøkter.
- Kø betyr alt som krever Anders i dag: kommunikasjon, forespørsler, feedback, oppfølging og godkjenninger.
- Oppgaver er prosjekt- og rutinearbeid, adskilt fra Kø.
- Spillerens individuelle plan er kanonisk. Gruppeplanlegging leverer innhold til hver spillerplan.
- Stall åpner med spillere og ukestatus.
- Jarvis og agentene forbereder; det som går ut av huset eller endrer noe for et menneske krever foreløpig godkjenning.
- Push til Anders brukes når noen venter nå, dagen endrer seg eller penger krever handling.
- AgenticOS er motoren inne i AgencyOS.
- Visuelt arbeid venter på valgt Claude Design-versjon. Funksjon, dataflyt og prioritering kan avklares nå.

## 4. Felles operativ motor

Alle fire utviklingsspor skal bruke samme kjede:

```text
Hendelse eller tidsplan
  -> kilde og signal
  -> fast AK-regel
  -> eventuell AI-tolkning
  -> varig jobb med status og nytt forsøk
  -> automatisk utførelse eller godkjenningskø
  -> plan, melding, kalender, booking, video eller prosjekt
  -> revisjonsspor, effekt og kostnad
```

### Obligatoriske egenskaper

- Hver jobb har eier, kilde, mål, frist, status og neste handling.
- Samme hendelse skal ikke utføres to ganger.
- Feil skal kunne prøves på nytt uten tap eller dobbeltutsending.
- All AI-bruk skal ha sporbar modell, instruks, datakilde, kostnad og resultat.
- Persondata skal behandles etter eksplisitte regler; spillerdata skal ikke sendes ukontrollert til eksterne modeller.
- Agentene må kunne jobbe kontinuerlig uten at AgencyOS-vinduet er åpent.
- Et menneskelig godkjenningspunkt skal være atomisk: Anders ser endringen og konsekvensen i samme kort som han godkjenner.

## 5. Prioritert utviklingsrekkefølge

### Fase 0 – avklar styring og mål

Mål: ferdigstille Deep Grill, produktgrenser og måltall før irreversible valg.

1. Lås perfekt arbeidsdag og daglig brief.
2. Lås hvilke oppgaver agentene kan utføre uten godkjenning.
3. Lås hvilke eksterne kanaler og datakilder som inngår.
4. Lås remote-coachingprodukt, målgruppe, prislogikk og kapasitet.
5. Definer dagens tidsbruk og økonomiske utgangspunkt som forbedringer måles mot.

### Fase 1 – AgencyOS Autopilot-grunnmur

Mål: én pålitelig motor før flere separate agenter kobles på.

1. **Tilgang og ansvarsgrenser:** hvem kan lese, foreslå, endre og sende for hver spiller, kunde, gruppe og virksomhet.
2. **Varig jobbmotor:** kø, status, nytt forsøk, timeout, avhengigheter og dødbrevskø for arbeid som ikke kan fullføres.
3. **Én godkjenningsmodell:** melding, planendring, prosjektendring, publisering, betaling og andre tiltak bruker samme kontrakt.
4. **Felles modellruter:** OpenAI, Claude, Gemini, Grok og lokale modeller velges etter oppgave, personvern, kvalitet, hastighet og pris.
5. **Lokal arbeidsnode:** Ollama og Hermes kan behandle lokalt materiale og utføre godkjente bakgrunnsjobber.
6. **Autonomiregler:** hva som kan rulle automatisk, hva som trenger stikkprøve, og hva som alltid stopper hos Anders.
7. **Hendelseskatalog:** kalender, booking, spilleraktivitet, melding, video, opptak, plan, prosjekt, frist, betaling og agentresultat får tydelige triggere.
8. **Operativ kontroll:** status, feil, kostnad, sist vellykket, neste kjøring og stoppknapp i AgencyOS.
9. **Kvalitetsmålinger:** fasitsett, akseptgrad, redigeringsgrad, feilrate og regresjonstester for agentene.
10. **Konsolidering av flater:** eksisterende AgenticOS-, Jarvis- og AgencyOS-innganger samles funksjonelt og senere visuelt.

Anbefalt rekkefølge: 1–3, deretter 4–6, så 7–9, og til slutt visuell konsolidering.

### Fase 2 – Coach Autopilot og coachens øktrom

Mål: spare tid hver dag og forbedre kvaliteten rundt hver spillerkontakt.

#### 2A. Morgenbrief for kommende arbeidsdag

Én side skal vise:

- coachingtimer og endringer i kalenderen;
- hva hver spiller har gjort siden forrige økt og siste uke;
- forrige fokus, hjemmeoppgave og neste avtalte kontrollpunkt;
- dagens prosjektarbeid, kodeprosjekter, søknader, frister og private huskepunkter innenfor avtalt omfang;
- hva AI-agentene har fullført, hva som kjører, hva som er blokkert og hva de gjør videre;
- hva som krever Anders nå;
- risiko for at noe eller noen ikke blir fulgt opp;
- en foreslått realistisk rekkefølge for dagen.

Briefen lages automatisk kvelden før og oppdateres ved endringer. Den skal ha én «nå»-handling og deretter neste viktige arbeid, ikke en vegg av varsler.

#### 2B. Rask godkjenningsrunde

- Ett kort per beslutning.
- Vis kilde, forslag, konsekvens, mottaker og hvorfor agenten foreslår det.
- Handlinger: godkjenn, rask redigering, avvis, utsett og bruk som ny regel.
- Massegodkjenning er kun tillatt for like, lavrisiko handlinger.
- Systemet lærer av endringene uten å gjøre nye autonome rettigheter av seg selv.

#### 2C. Før økten

Spillerkortet skal automatisk sammenstille:

- årsplan og gjeldende periode;
- måneds- og ukeplan;
- dagens øktplan;
- teknisk plan med hovedfokus og aktive arbeidsoppgaver;
- trening og gjennomføring siden forrige økt;
- siste coachingoppsummering, hjemmeoppgave og hva som skulle kontrolleres;
- relevante videoer, bilder, TrackMan-resultater, tester og spillerkommentarer;
- et kort forslag til dagens mål, uten å overstyre coachen.

#### 2D. Under økten

Mac-flaten skal vise konteksten ovenfor og la Anders arbeide i samme økt:

- markere dagens tekniske fokus;
- hente og justere arbeidsoppgaver;
- se øvelser og planlagte progresjoner;
- logge en kort observasjon uten å forlate økten;
- starte eller kontrollere lydopptak;
- se at lyd faktisk tas opp og lagres;
- se bilder og video fra iPhone komme direkte inn i riktig spiller, økt og teknisk oppgave;
- markere hvilke medier som skal deles med spilleren.

iPhone-flaten skal åpnes direkte på aktiv økt og støtte kamera, video, hurtignotat og sikker opplasting ved ustabilt nett.

#### 2E. Etter økten

Når Anders avslutter økten, skal systemet automatisk:

1. ferdigstille og kontrollere opptaket;
2. transkribere;
3. filtrere støy og usikker tale;
4. strukturere teknisk, taktisk, mentalt, fysisk og viktige avtaler;
5. hente frem coachens avsluttende oppsummering med høyest vekt;
6. foreslå oppdatering av teknisk plan, hjemmeoppgaver og neste økt;
7. koble bilder og videoer til riktig observasjon eller oppgave;
8. lage en kort spillerversjon og en mer detaljert coachversjon;
9. sende alle menneskepåvirkende endringer til ett samlet godkjenningskort;
10. etter godkjenning oppdatere PlayerHQ, historikk og neste morgenbrief.

Mål: sammendraget skal være klart kort tid etter økten uten manuelt etterarbeid.

### Fase 3 – Remote og digital coaching

Mål: gjøre samme kvalitet tilgjengelig uavhengig av sted og skape skalerbar inntekt.

1. Definer remote-produkt, responstid, inkludert omfang og rettigheter.
2. Digital onboarding: mål, tilgjengelig tid, utstyr, fasiliteter, samtykker og baseline.
3. Ett coachingrom per spiller: dialog, plan, filer, video, oppgaver, status og neste avtale.
4. Strukturert videoinnsending koblet til økt, slag, kølle, kameravinkel og teknisk oppgave.
5. Sikker videobehandling med status, kø, nytt forsøk og kostnadsstyring.
6. AI lager observasjonsutkast og sammenligner mot tidligere innsendinger; coachen eier den faglige vurderingen.
7. Coach gir tidskodet video-, lyd- eller tekstfeedback.
8. Godkjent feedback oppdaterer PlayerHQ-planen og lager målbar oppgave.
9. Automatiske check-ins måler forståelse, gjennomføring og effekt.
10. Booking, betaling, kvoter, responstid og oppgraderinger håndteres i samme produkt.
11. Start med asynkron coaching. Bygg live-video først når bruk og betalingsvilje viser at det gir merverdi.

### Fase 4 – Helautomatisert agency

Mål: la Anders bruke tiden på coaching, relasjoner og de viktigste beslutningene.

1. **Leads:** fangst, samtykke, kvalifisering, prioritering og neste kontakt.
2. **Salg:** møteforberedelse, tilbudsutkast, oppfølging og tydelig overlevering.
3. **Booking og betaling:** ledig kapasitet, påminnelser, ombooking, kvoter og avvik.
4. **Onboarding:** sjekklister, datainnhenting, forventninger, planstart og mangler.
5. **Leveranse:** spillerstatus, coach-SLA, manglende oppfølging og neste verdiøyeblikk.
6. **Bevaring:** tidlige frafallssignaler, reaktivering, fornyelse og relevante oppgraderinger.
7. **Marked:** innholdsbank, gjenbruk, kampanjeutkast, publiseringskø og effektmåling.
8. **Kapasitet:** ukebelastning, inntekt per time, ledige produktplasser og flaskehalser.
9. **Økonomi:** faktiske tall fra autorisert Tripletex-eksport; aldri estimater presentert som regnskap.
10. **CEO-brief:** hva som endret seg, hva som krever beslutning og hvilke tiltak som gir størst effekt.

## 6. Verifisert kodegrunnlag 12.09.2026

### Finnes allerede

- AgencyOS-cockpiten henter dagens bookinger, ventende PlanAction-forslag, spillerforespørsler, varsler, oppgaver fra Notion-cache, inaktive spillere og KPI-er.
- `TechnicalPlan` har planstatus, periodekobling, P1–P10-posisjoner, prioriterte arbeidsoppgaver, bilde/video, repetisjonsmål, TrackMan-mål, fremdrift og revisjonslogg.
- PlayerHQ har en faktisk teknisk-planrute og serverhandlinger for oppretting, redigering, prioritering og repetisjonslogging.
- Det finnes en coach-liveflate for en konkret `TrainingSessionV2` med mål, øvelser, opptaksstatus, transkripsjon og analyse.
- Nettleseropptak sender lydbiter fortløpende, har lokal kø ved nettutfall, samtykkekontroll, transkripsjon og AI-analyse.
- Analyse kan opprette et ventende sjekkpunkt i AgencyOS-godkjenningskøen.
- Det finnes modeller for coachvideo og spillersvingvideo.

### Mangler eller er frakoblet

- Morgenbriefen dekker ikke samlet prosjektfremdrift, kodeagentenes arbeid, søknader og alle frister.
- Briefen er primært «i dag» og gir ikke automatisk full spillerforberedelse fra siste uke og forrige økt.
- AgencyOS-oversikten for «Teknisk plan» summerer i dag TEK-økter fra `TrainingPlan`, ikke innholdet i den faktiske `TechnicalPlan`-modellen.
- Spillerprofilpanelet viser bare navn, status og startdato for teknisk plan. Selve planen er ikke coachens operative øktflate der.
- Workbench har uke, måned og år, mens en egen `loadTekniskPlanContext` finnes uten å være koblet inn i den nåværende Workbench-ruten.
- Liveflaten viser øvelser og opptaksresultat, men ikke hele kjeden årsplan → periode → måned → uke → økt → teknisk oppgave.
- Lydopptak startes via en separat opptaksside og krever et aktivt trykk; det er ikke en automatisk sesjonslivssyklus.
- Bilde- og videoopplasting fra coachens iPhone er ikke integrert i aktiv coachøkt.
- Spillersvingvideo-endepunktet er merket som et stillas: det mottar en URL og setter status `PROCESSING`, men den komplette behandlingskjeden er ikke bygget.
- Etterbehandlingen bruker flere direkte steg. Den trenger varige jobber, tydelig retry og operativ overvåking før den kan loves som helautomatisk.
- Kodebasen krever egne leverandørnøkler for dagens transkripsjon og analyse. Abonnementer og API-tilgang må behandles som separate kapabiliteter i den endelige modellplanen.

### Konsekvens for prioriteringen

Vi skal ikke starte på nytt. Vi skal samle og fullføre eksisterende grunnmur i denne rekkefølgen:

1. korrekt datakilde for teknisk plan;
2. komplett før-økt-kontekst;
3. ett coach-øktrom;
4. iPhone-fangst til aktiv økt;
5. robust automatisk etterbehandling;
6. ett godkjenningskort som oppdaterer spillerens kanoniske plan;
7. gjenbruk samme kjede til remote coaching.

## 7. Effekt og lønnsomhet

Følgende måles før og etter hver pilot:

- administrasjonstid per spiller per uke;
- tid fra økt slutt til ferdig oppfølging;
- andel spillere med tydelig neste handling;
- responstid til spiller og lead;
- planlagt mot gjennomført trening;
- aksepterte, redigerte og avviste AI-forslag;
- faglige AI-feil og feil person-/øktkobling;
- behandlingstid og kostnad per lyd- og videoøkt;
- inntekt per coachtime;
- inntekt og dekningsbidrag per spiller;
- antall spillere per coach uten kvalitetsfall;
- gjentakende remote-inntekt;
- konvertering, fornyelse og frafall.

### Foreløpige neste-nivå-hypoteser

- Én gang registrert kontekst skal gjenbrukes i brief, økt, oppsummering, plan og neste kontakt.
- AI-ruting skal velge billigste modell som dokumentert klarer oppgaven, ikke favorittmodell til alt.
- Lokale modeller skal brukes når personvern, mengde eller kostnad gjør det riktig.
- Anders' redigeringer skal bli evalueringsdata og forbedringsforslag, ikke ukontrollert selvlæring.
- Remote coaching bør prises rundt resultat, responstid og tilgang, ikke antall AI-kall.
- Automatisering skal øke coachkapasitet uten å gjøre oppfølgingen generisk.

## 8. Leveranseporter

| Port | Bevis før neste nivå |
|---|---|
| G0 Produktklarhet | Deep Grill ferdig, beslutningsregister signert |
| G1 Tillit | tilgang, samtykke, datagrense, revisjon og stoppmekanisme testet |
| G2 Motor | jobber tåler feil, nytt forsøk og dobbeltkjøring |
| G3 Coachpilot | reelle økter før/under/etter gjennomført uten tapt informasjon |
| G4 Remote-pilot | betalende pilot får avtalt levering innen SLA |
| G5 Agency-pilot | én komplett lead→kunde→leveranse→fornyelse-reise målt |
| G6 Skalering | kvalitet og margin holder når volumet økes |

## 9. Deep Grill Me

Intervjuet kjøres ett hovedspørsmål om gangen. Etter hvert svar registreres fakta, behov, beslutninger, usikkerhet og økonomisk konsekvens.

Planlagte runder:

1. perfekt arbeidsdag;
2. autonomi og godkjenningsgrenser;
3. mennesker, roller og virksomheter;
4. nåværende tidsbruk og tidstyver;
5. kø, frister og informasjonskilder;
6. spillerkommunikasjon og forventet responstid;
7. planer, faglig kontroll og trenerens metode;
8. remote-produkt og kundeopplevelse;
9. video, lyd, bilder, data og samtykke;
10. AI-flåte og lokale kontra eksterne modeller;
11. salg og markedsføring;
12. pris, margin og kapasitet;
13. bevaring, oppgraderinger og frafall;
14. ledelse, drift og økonomi;
15. verstefall, feil og tillit;
16. endelig tvungen prioritering.

## 10. Beslutningsregister

### DG-00 – systemstruktur

Status: låst.

AgencyOS og AgenticOS slås sammen. PlayerHQ forblir spillerflaten.

### DG-01 – perfekt arbeidsdag

Status: besvart 12.09.2026.

Registrert behov:

- samlet oversikt for den kommende arbeidsdagen;
- coachingtimer, prosjektfremdrift, kodearbeid, søknader, huskepunkter og frister;
- AI-agenter som arbeider kontinuerlig etter hovedplanen;
- rask godkjenningsrunde med enkel redigering;
- komplett spillerkontekst før timen;
- Mac som coachens arbeidsflate under timen;
- iPhone for bilder og video direkte til aktiv økt;
- automatisk lydopptak, transkripsjon og strukturert oppsummering;
- tekniske, mentale og øvrige avtalte forhold dokumenteres;
- spillerens tekniske plan og neste handling oppdateres etter godkjenning;
- etterarbeidet skal være ferdig straks eller kort tid etter at timen avsluttes.

Tolkning som må valideres videre: «generell oversikt over dagen i dag, altså den neste dagen» betyr en brief som forbereder kommende arbeidsdag kvelden før, men som blir levende «i dag»-oversikt når dagen starter.

### DG-02 – autonomi og godkjenningsgrenser

Status: låst som anbefalt standard 13.09.2026.

Kontekst:

- Anders er nykommer på webutvikling og skal ikke bære ansvaret for Git, branches, worktrees, tester eller tekniske sammenslåinger.
- AK Golf HQ har tapt betydelig tid på skyfiler, feil arbeidsgren, arbeid som ikke ble slått sammen, konkurrerende planer og design som ble kodet før retningen var stabil.
- Den samme trygge prosessen skal brukes når Anders starter nye store programvareprosjekter, uansett om Codex, Claude, Grok eller ChatGPT utfører arbeidet.

Låst autonomimodell:

1. Agentene kan selv undersøke, planlegge innenfor godkjent hovedplan, opprette isolert arbeidsgren/worktree, endre kode, teste, rette feil, dokumentere, kontrollere og opprette pull request.
2. Agentene skal automatisk kontrollere riktig prosjekt, riktig arbeidsgren, ren avgrensning, testresultat, designreferanse og tap av eksisterende funksjon før saken når Anders.
3. Anders får ett godkjenningskort på vanlig norsk for sammenslåing til `main`. Kortet må vise resultat, testbevis, risiko og eventuell produktbeslutning.
4. Produksjonspublisering er en egen beslutning etter verifisert preview eller lokal kontroll.
5. Produksjonsdatabase, sletting, betaling, rettigheter, hemmeligheter, eksterne meldinger og endring av låste produktregler krever alltid særskilt godkjenning.
6. Etter minst 20 målte, vellykkede lavrisikoendringer kan dokumentasjon, tester og helt interne oppryddinger vurderes for automatisk sammenslåing. Produksjonspublisering forblir kontrollert.
7. En oppgave er ikke ferdig ved commit eller push. Den er ferdig når sammenslåing, avtalt publisering, verifisering og sluttsynkronisering av hovedplan, status og Notion er utført.

Ny generell prosjektguide er opprettet i Notion: [Start nytt kodeprosjekt – trygg oppskrift fra idé til lansering](https://app.notion.com/p/akgolfacademy/Start-nytt-kodeprosjekt-trygg-oppskrift-fra-id-til-lansering-3d935a45535a8031821cd8bcef3ff40f).

### Ny produktbeslutning – NVP

Status: låst 13.09.2026.

Første komplette lansering prioriterer:

1. planlegge trening optimalt;
2. gjennomføre trening;
3. analysere trening;
4. registrere statistikk og annen relevant informasjon som forbedrer neste plan;
5. bevare øvrige funksjoner som allerede ligger i produktet.

### DG-03 – komplett produkt- og funksjonsgrill

Status: startet 13.09.2026.

Det generelle intervjuet er nå utvidet til et hierarkisk produktkart for markedssidene, booking, PlayerHQ og AgencyOS med AgenticOS innebygd. Kartet dekker også optimal treningsplanlegging, TrackMan, tale, coachens øktrom og remote coaching. Se [komplett produkt- og grillkart](komplett-produkt-og-grillkart-2026-09-13.md).

Intervjuet begynner med markedets hovedløfte og kjøpsinngang, fortsetter gjennom booking og den komplette treningssløyfen, og avsluttes med automasjon, drift og tvungen prioritering. Masterplan og Notion-oppgaver endres først etter at svarene er strukturert og analysert.

## 11. Sluttsyntese etter intervjuet

Når alle rundene er besvart, leveres:

1. presis produktdefinisjon av AgencyOS;
2. strukturert behovskart med dagens arbeid og ønsket fremtid;
3. endelig prioritert utviklingsrekkefølge med avhengigheter;
4. funksjonskart for AgencyOS, PlayerHQ og remote coaching;
5. autonomimatrise per handling;
6. modell- og verktøystrategi for OpenAI, Claude, Gemini, Grok, Ollama og Hermes;
7. lønnsomhetsmodell og kapasitetsmål;
8. 30-, 60- og 90-dagers leveranseplan;
9. risiko-, sikkerhets- og personvernplan;
10. liste over hva som skal bygges, samles, beholdes eller avvikles.
