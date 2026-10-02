# Samlet Workbench — kode, kilde og kontroll

Arbeidsgren: `codex/workbench-samlet-2026-10-02`. Bestilling: [arbeidslisten med 82 oppgaver](../planer/workbench-fullforing-2026-10-02.json). Dette dokumentet beskriver faktisk deldekning; det er ikke en erklæring om at Excel eller alle trenerflater kan avvikles.

## Kilde og omfang

Gjeldende system er [Precision Athletics](../design-system/design-autoritet.md); språk, tall og treningsregler kommer fra [treningsplanlegging](../treningsplanlegging.md). Valgt eksport er `AK Golf Precision Athletics (77).zip`, SHA-256 `9ded841b0f8696697534eb13dae882b3783d351014dae3a92e6e2bba4f042f07`. Den inneholder `ui_kits/workbench-samlet/` med Sesongkart, Ukeverksted, Trenerbord og den historisk navngitte analyseflaten. Synlig navn i appen er **Stats** etter språk-masteren; `flate=analyse` er teknisk URL-verdi.

Kildepakken ligger privat under `Documents/Claude/akgolf-hq/workbench-code-2026-10-02/`. Første lokale referansekopi manglet de importerte `tokens/`- og `components/`-stilfilene; de første private `design-*.png` viser derfor ikke en gyldig stilgjengivelse. Åtte originale stilfiler er hentet uendret fra samme kontrollerte ZIP. Nye `design-77-styled-{uke,sesong,bord,analyse}-{390,1440}.png` er tatt med CUA ved 390 × 844 og 1440 × 900. Ingen ny designversjon er valgt gjennom denne rettingen.

Grunnlaget fra PR1082 er allerede merget og produksjonsdeploy `6799533729` har bekreftet success 02.10 kl. 02:02 UTC. Ukeplanens nullable JSONB-kolonne ble lagt til i riktig produksjonsbase; RLS var aktiv og ingen spillerdata ble omskrevet. Denne grenen har dessuten tatt inn spillerens IUP-reise fra PR1084, tallfontrettingen fra PR1085 og testbatteriberegningene fra PR1086, samt navngitt trenerdeling fra PR1087 og SG-grunnlaget fra PR1079, ved main `3df5af7a6`.

## Faktiske kjeder

| Del | Implementert kjede | Avgrensning |
|---|---|---|
| Fire visninger | Begge beskyttede Workbench-ruter → `loadWorkbenchSamletData` → felles DTO → fire egne komponenter | Samme spiller, dato, uke, planår, måned, periode og økt følger navigasjonen. Spillerbytte rydder bort den andre spillerens periode-/økt-ID |
| Trenerbord | Eksisterende coach-scope → avgrenset spillerliste → samme `loadWeek` per spiller, høyst fire samtidige lesere | Spillerflaten har bare egen rad; en skjult knapp er ikke tilgangskontrollen |
| Plan og perioder | Valgt årsplan-ID → eierkontroll → faktisk datointervall → eksisterende periodehandling | Sesonggrenser har samtidighetsvakt og avvises når eksisterende perioder havner utenfor |
| Uke og øvelse | Én eksisterende `useUkeMotor` → AG11-ark → faktiske serverhandlinger | Redigering beholder øvelse-ID-er og andre øvelser; rå mal-/tidligere-øktkopi får nye ID-er uten å flytte logger |
| Treningsvolum | Workbench + eldre modeller → felles deduplisert summering → alle fire flater | Planlagt, registrert 0, ukjent, framtid og anslått eldre klokketid holdes atskilt. Klientens ukemotor erstatter ikke dette grunnlaget |
| Stats | Eier og valgt datovindu → brutto runder, tester, TrackMan og samlet volum | SG per runde beholder kilde og hullantall. Aggregert SG blir ikke beregnet uten dokumentert felles referanse; 9 hull blir ikke stille 18 |
| Live | Eksplisitt økt-ID → faktisk tilgang → synlig godkjent gjennomføringsøkt | Fremmed, skjult, utkast, ubesvart og mal avvises. Start/fullføring oppdaterer valgt ID; uendret URL henter bekreftet status på nytt |
| Min kalender | Spillerens egen ID → egen uke og bookinger → portallenker | Coachkalenderens lenker åpner riktig spiller; annen spillers periode-ID følger ikke med. Kalender-/planår følger valgt kontekst også over ISO-årsskifte |
| Innsyn og vask | Kontoens eksisterende vakt → egne Workbench-rader og avgrensede barn → eksport/anonymisering | Ingen andre medlemmers kopier eller gruppeoriginal via samme trener/gruppe. Tall og validerte fagkoder/dose beholdes; fritekst og ugjennomsiktig JSON vaskes |

## Målrettet kontroll før samlet gate

- Samlet dataleser, datoavgrensning og sesonggrenser: 55 målrettede prøver grønne i UTC og Oslo. Valgt årsplan ved periodeoppretting har egne positive/negative prøver.
- Øvelsesredigering og kopibevaring: fem prøver mot ekte separat lokal Postgres/Auth samt faktiske komponentprøver grønne.
- Live-valg og egen kalender: fem prøver med ekte lokal innlogging/database grønne, inkludert avvist fremmed/skjult/utkast/ubekreftet/mal. Direkte start/neste-handlinger avviser også mal uten å endre lagret status. Pågående økt kan ikke merkes som mal; CAS avviser samtidig start. Historisk feilmerket syntetisk mal kan få flagget fjernet og faktisk fullføres. Fem målrettede handlingstester og ti relevante komponentprøver består.
- Live-handlingenes navigasjon: åtte faktiske komponentprøver grønne for spiller- og trenersti, valgt ID, uendret URL, kalenderkontekst og feilrespons. Live/Min-kontekst: ti prøver grønne i UTC og Oslo.
- Personvern: 44 målrettede handling-/enhetstester og tre ekte lokale databaseprøver grønne. Eier, barn, gruppe-master/kopi, null/0/dose, tørrkjøring, feil/gjenforsøk og idempotens er kontrollert. Ekte ekstern sletting er erstattet av testdobler.
- Etter siste kildekopiering er fire av fire faktiske nettleserreiser grønne: trener/spiller ved 390 og 1440. Alle fire flater klikkes, kalenderkontekst og treffbarhet kontrolleres, ukeplan lagres med syntetisk sted og SLAG timer0/økter2, og samme verdier leses etter reload. Nettleserfeil og horisontal sideoverflyt avvises.
- Passordinnlogging fikk én full dokumentnavigasjon til eksisterende dispatcher. Tre komponentprøver og sju ekte lokale UI/Auth-prøver består: seks ferske spillerinnlogginger uten omvei/gjenforsøk, én ugyldig passordprøve. Alle seks åpner beskyttet Workbench og reloader. Eksakt årsak til tidligere avbrutt RSC-respons er ikke bevist; vaktene er uendret.
- Siste QA-kopi er avstemt med3619 ikke-genererte kildefiler, kontrollert SHA-256 per fil; generert Prisma-klient og skjema er kopiert fra samme arbeidsgren. Privat manifest ligger i det ignorerte lokale miljøet.

Lokal prosjektidentitet er `ak-hq-workbench-20261002`; DB `127.0.0.1:55722`, Auth `55729`, API `55721`, app `3072`. Runneren kontrollerer prosjektidentitet, Docker-bindinger og loopbackmål, renser arvet miljø og skjermer lokale hemmeligheter. Bare syntetiske data er brukt. Den opprinnelige arbeidskopien og produksjonsmiljøfilene er bevart.

## Pågående og åpne avvik

Mobilkalenderen viser kalender/dagvalg først, kompakt kontekst og bibliotek/detaljer i ark. Faktisk kontroll fant og rettet to feil: samtidige desktopøkter utvidet timeraden, og PlayerHQ-menyen dekket Workbench-menyen. Desktop har nå fast tidsakse og separate overlappspor; spillerens Workbench-meny plasseres over den eksisterende hovedmenyen. 11 komponentprøver i UTC/Oslo er grønne. Ferske trener- og spillerreiser på390/1440 er grønne etter den avgrensede innloggingsrettingen. Kalenderen har syntetiske samtidighetstilfeller og derfor annet innhold enn skissen. Begge eksisterende mobilmenyer er beholdt og kontrollerte linker er treffbare.

Sluttkontrollen fant også at Trenerbordets gruppeoppretting utelot de tre bankreferansene. Det faktiske komponentkallet sender nå `sourceId`, `exerciseId` og `positionTaskId` til eksisterende servervakt. Tolv samlede komponentprøver kontrollerer valgt bank, teknisk referanse og synlig serveravslag uten å gi ny tilgang. En separat full gruppe-UI→publisering→medlemsreise er ikke påstått kontrollert av dette tillegget.

Øvelsesfeltene er implementert og målrettet kontrollert: utstyr med valgfritt antall, banespillets oppgaver, kondisjonssegmenter og ny RIR-grense0–4. Historisk RIR5–10 bevares ved urelatert redigering. Konkrete bank-/oppgavekoblinger følger øvelsen gjennom oppretting, serie, gruppeoriginal og medlemskopi med eierkontroll. Uendrede rå listeposter bevarer ukjente historiske nøkler; en bevisst listeendring eller tømming erstatter listen. Feltpakken har34 domenetester,5 komponentprøver og4 ekte DB/Auth-prøver grønne. Bankpakken har23 enhetstester og5 ekte DB/Auth-prøver grønne. Ingen ny DBkolonne er nødvendig.

Redigerbar treukerssyklus, full hendelseskalender, enkelte øktfelt (oppvarming/varianter/progresjon), sammenligning og komplette WANG/TN-leser-/forslags-/samling-/testdagreiser har separate restoppgaver. Testprotokollenes kildeavklaringer er navngitt i eget register. DataGolf aktiveres bare ved dokumentert rett. Den historiske P-posisjonen i `techniqueFocus` er ikke automatisk omtolket som ny måltekst.

Full `npm run verify` etter siste kodefrys bestod02.10 kl04:03 UTC:4183 kodetester,84 komponentprøver, statiske kontroller og Next/Serwist-bygg. `npm run prosjekt:sjekk` bestod178 vedlikeholdte dokumenter. Fire ferske lokale nettleserreiser bestod igjen etter mal-/bankrettingene. Avgrenset sluttgjennomgang fant de to dokumenterte feilene; begge er rettet og kontrollert. GitHub-CI og denne pakkens PR/merge/deploy registreres separat etter publisering. Valgt kildepakkes kontrastkontroll har kjente rapporterte avvik; dette er ikke en full kontrast-/tastaturgodkjenning. Anders sin vurdering ved siden av valgt skisse er ikke registrert; teknisk grønt eller disse bildene er ikke visuell godkjenning. Komplett fil-/ballogg-/foresatteksport og ekte ekstern sletting er heller ikke sluttverifisert.

## Sikkerhets- og personvernspørsmål før lagring

1. **Fremmed data:** serverens innlogging/samtykke skjer før personlesing; eier-/coach-scope, konkrete kildegrenser og status/CAS brukes. Negative lokale DB/Auth- og handlingstester avviser fremmed spiller/kilde, skjult/mal/pending og samtidig endring. Ingen ny WANG/TN-delingsrett er gitt av Workbench-pakken.
2. **Data ut:** ingen nye logger eller AI-overføring; nye prøver bruker syntetiske data og ignorerte lokale innstillinger. Lokal hemmelighetsmønsterkontroll av endrede/nye filer fant ingen treff; private bilder/manifest ligger utenfor Git.
3. **Barn/livssyklus:** eksisterende mindreårig-/foreldresamtykkevakter er bevart. Innsyn/vask av nye navngitte Workbench-områder er eieravgrenset og testet, mens fil-/ballogg-/foresatteksport og ekte ekstern sletting fortsatt har egne restkrav.
